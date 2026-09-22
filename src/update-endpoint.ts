/**
 * Host-side self-update endpoint for @dsh-external/dsh-ui-whale.
 *
 * GET  /dsh-ui-whale/latest  -> { latest: "vX.Y.Z" | null }  (git ls-remote)
 * POST /dsh-ui-whale/update  { "tag": "vX.Y.Z" }             (pinned install)
 * Only this plugin's own fixed tag is ever installed; a local link install is
 * detected and skipped (auto-update would sever the developer link).
 */
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import type {} from '@deepseek-ai/dsh-host-webserver'

const UPDATE_PATH = '/dsh-ui-whale/update'
const LATEST_PATH = '/dsh-ui-whale/latest'
const PACKAGE_SPEC = '@dsh-external/dsh-ui-whale'
const MIRROR = 'lhh010/dsh-ui-whale'
const REPO_GIT = `https://github.com/${MIRROR}.git`

function semverCompare(a: string, b: string): number {
  const parse = (v: string): number[] => { const p = v.replace(/^v/, '').split('.').map(x => Number(x) || 0); while (p.length < 3) p.push(0); return p }
  const pa = parse(a); const pb = parse(b)
  return (pa[0]! - pb[0]!) || (pa[1]! - pb[1]!) || (pa[2]! - pb[2]!)
}

/** TTL cache for the ls-remote result; failures are cached too, so an offline
 * machine answers instantly instead of blocking every page load on DNS/TCP. */
const CACHE_TTL_MS = 60_000
const GIT_TIMEOUT_MS = 8_000
let latestCache: { at: number; latest: string | undefined } | undefined
let latestInflight: Promise<string | undefined> | undefined

function latestFromGit(): Promise<string | undefined> {
  if (latestCache !== undefined && Date.now() - latestCache.at < CACHE_TTL_MS) return Promise.resolve(latestCache.latest)
  if (latestInflight !== undefined) return latestInflight
  latestInflight = new Promise((resolve) => {
    execFile('git', ['ls-remote', '--tags', REPO_GIT], { encoding: 'utf8', maxBuffer: 1024 * 1024, timeout: GIT_TIMEOUT_MS, killSignal: 'SIGKILL' }, (error, stdout) => {
      latestInflight = undefined
      let latest: string | undefined
      if (error === null && typeof stdout === 'string') {
        for (const line of stdout.split('\n')) {
          const trimmed = line.trim()
          if (trimmed.length === 0) continue
          const match = trimmed.match(/refs\/tags\/(v\d+\.\d+\.\d+)$/)
          if (match !== null && (latest === undefined || semverCompare(match[1]!, latest) > 0)) latest = match[1]!
        }
      }
      latestCache = { at: Date.now(), latest }
      resolve(latest)
    })
  })
  return latestInflight
}

const COMPAT_URL = `https://raw.githubusercontent.com/${MIRROR}/main/compatibility.json`
const COMPAT_TTL_MS = 300_000
const COMPAT_TIMEOUT_MS = 8_000

/**
 * The running DSH version, read once from the manifest next to the launcher
 * script (process.argv[1] is .../dsh/lib/bin.js for a built install and
 * .../dsh/src/bin.ts for a source launch; both sit one directory below the
 * package root). undefined when the layout does not match.
 */
let dshVersionValue: string | undefined
let dshVersionTried = false
function detectDshVersion(): string | undefined {
  if (dshVersionTried) return dshVersionValue
  dshVersionTried = true
  try {
    const argv1 = process.argv[1]
    if (typeof argv1 === 'string' && argv1 !== '') {
      const manifest: unknown = JSON.parse(readFileSync(resolve(dirname(argv1), '..', 'package.json'), 'utf8'))
      const name = (manifest as { name?: unknown }).name
      const version = (manifest as { version?: unknown }).version
      if (name === '@deepseek-ai/dsh' && typeof version === 'string' && version !== '') dshVersionValue = version
    }
  } catch { /* launched outside the dsh package layout */ }
  return dshVersionValue
}

/**
 * Plugin tag -> supported DSH versions, from the repository's
 * compatibility.json (raw CDN; minutes of lag are fine for an update check).
 * Failures are cached too, so an offline machine answers instantly.
 */
let compatCache: { at: number; map: Map<string, string[]> | undefined } | undefined
let compatInflight: Promise<Map<string, string[]> | undefined> | undefined

function parseCompat(value: unknown): Map<string, string[]> | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const schema = (value as { schema?: unknown }).schema
  const versions = (value as { versions?: unknown }).versions
  if (schema !== 1 || typeof versions !== 'object' || versions === null) return undefined
  const map = new Map<string, string[]>()
  for (const [tag, entry] of Object.entries(versions as Record<string, unknown>)) {
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) continue
    const dsh = (entry as { dsh?: unknown }).dsh
    if (!Array.isArray(dsh) || !dsh.every((v): v is string => typeof v === 'string' && v !== '')) continue
    map.set(tag, dsh)
  }
  return map.size > 0 ? map : undefined
}

function compatFromRaw(): Promise<Map<string, string[]> | undefined> {
  if (compatCache !== undefined && Date.now() - compatCache.at < COMPAT_TTL_MS) return Promise.resolve(compatCache.map)
  if (compatInflight !== undefined) return compatInflight
  compatInflight = fetch(COMPAT_URL, { signal: AbortSignal.timeout(COMPAT_TIMEOUT_MS) })
    .then(async (res): Promise<Map<string, string[]> | undefined> => (res.ok ? parseCompat(await res.json()) : undefined))
    .catch(() => undefined)
    .then((map) => { compatCache = { at: Date.now(), map }; compatInflight = undefined; return map })
  return compatInflight
}

function isLinkInstall(): boolean {
  try {
    const p = resolve(dshHomePath('profiles', 'web', 'node_modules', '@dsh-external'), 'dsh-ui-whale')
    return realpathSync(p) !== resolve(p)
  } catch { return false }
}

function runInstall(tag: string): Promise<{ ok: boolean; output: string; link: boolean }> {
  return new Promise((resolve) => {
    if (isLinkInstall()) { resolve({ ok: false, output: '', link: true }); return }
    const child = spawn('pnpm', ['add', `${PACKAGE_SPEC}@github:${MIRROR}#${tag}`], { cwd: dshHomePath('profiles', 'web'), shell: true })
    let output = ''
    let settled = false
    const settle = (value: { ok: boolean; output: string; link: boolean }): void => { if (settled) return; settled = true; resolve(value) }
    const timer = setTimeout(() => { try { child.kill() } catch { /* gone */ }; settle({ ok: false, output: `${output}安装超时（120s）`, link: false }) }, 120_000)
    child.stdout?.on('data', (c: Buffer) => { output += c.toString() })
    child.stderr?.on('data', (c: Buffer) => { output += c.toString() })
    child.on('error', (e) => { clearTimeout(timer); settle({ ok: false, output: `${output}${String(e)}`, link: false }) })
    child.on('close', (code) => { clearTimeout(timer); settle({ ok: code === 0, output, link: false }) })
  })
}

function readBody(req: { on: (e: string, l: (c: Buffer) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => { let body = ''; req.on('data', (c: Buffer) => { body += c.toString(); if (body.length > 4096) reject(new Error('body too large')) }); req.on('end', () => { resolve(body) }) })
}

/** SHA-256 of the installed host bundle; undefined when absent. Compared before/after
 * an install so the client only asks for a dsh restart when the host half changed. */
function hostBundleHash(): string | undefined {
  try {
    const scopeDir = PACKAGE_SPEC.slice(0, PACKAGE_SPEC.indexOf('/'))
    const pkgDir = PACKAGE_SPEC.slice(PACKAGE_SPEC.indexOf('/') + 1)
    const p = resolve(dshHomePath('profiles', 'web', 'node_modules'), scopeDir, pkgDir, 'lib', 'index.js')
    return createHash('sha256').update(readFileSync(p)).digest('hex')
  } catch { return undefined }
}

export function registerUpdateEndpoint(ctx: Context): void {
  ctx.effect(() => {
    const latestDispose = ctx.webServer.register({
      kind: 'exact', path: LATEST_PATH,
      handler: (_req, res) => {
void Promise.all([latestFromGit(), compatFromRaw()]).then(([latest, compat]) => {
            const dshVersion = detectDshVersion()
            // Newest tag whose supported-DSH list contains the running DSH version;
            // clamped to the newest tag the git remote actually knows (the raw CDN
            // can lag behind a fresh push, and installing an unseen tag would fail).
            let latestSupported: string | undefined
            if (compat !== undefined && dshVersion !== undefined) {
              for (const [tag, dsh] of compat) {
                if (!dsh.includes(dshVersion)) continue
                if (latestSupported === undefined || semverCompare(tag, latestSupported) > 0) latestSupported = tag
              }
              if (latestSupported !== undefined && latest !== undefined && semverCompare(latestSupported, latest) > 0) latestSupported = latest
            }
            const body = `${JSON.stringify({ latest: latest ?? null, dshVersion: dshVersion ?? null, latestSupported: latestSupported ?? null, compat: compat !== undefined })}\n`
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(body)
          })
      },
    })
    const dispose = ctx.webServer.register({
      kind: 'exact', path: UPDATE_PATH,
      handler: async (req, res) => {
        const send = (status: number, value: unknown): void => { const body = `${JSON.stringify(value)}\n`; res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(body) }
        if (req.method !== 'POST') { send(405, { ok: false, error: 'method not allowed' }); return }
        // R-12 边界：宿主路由无鉴权，安装动作要求客户端专用头 + 同源 Origin 双保险。
        const clickToken = req.headers['x-dsh-plugin-update']
        const originHeader = req.headers.origin
        const sameOrigin = originHeader === undefined || (typeof originHeader === 'string' && originHeader === `http://${ctx.webServer.host}:${String(ctx.webServer.port)}`)
        if (clickToken !== 'click' || !sameOrigin) { send(403, { ok: false, error: 'forbidden: update requires the same-origin click header' }); return }
        try {
          const parsed: unknown = JSON.parse(await readBody(req))
          const tag = (parsed as { tag?: unknown }).tag
          if (typeof tag !== 'string' || !/^v\d+\.\d+\.\d+$/.test(tag)) { send(400, { ok: false, error: 'invalid tag' }); return }
          const hashBefore = hostBundleHash()
          const result = await runInstall(tag)
          send(result.link ? 200 : (result.ok ? 200 : 500), { ok: result.ok, link: result.link, output: result.output.slice(-4000), tag, hostChanged: result.ok && hashBefore !== hostBundleHash(), ...(result.ok ? {} : { recovery: `dsh plugin --profile web add '${PACKAGE_SPEC}@github:${MIRROR}#${tag}'` }) })
        } catch (e) { send(400, { ok: false, error: String((e as Error)?.message ?? e) }) }
      },
    })
    return () => { dispose(); latestDispose() }
  }, 'ui-whale: update endpoint')
}
