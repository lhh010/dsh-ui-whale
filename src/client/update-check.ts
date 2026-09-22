/**
 * Client-side version check + click-to-update for the whale update chip.
 * Version query prefers the host same-origin endpoint (no GitHub CORS), then
 * the GitHub tags API / raw package.json as fallback.
 */
import pkg from '../../package.json'

export const PLUGIN_VERSION: string = pkg.version
export const MIRROR = 'lhh010/dsh-ui-whale'
export const UPDATE_ID = 'dsh-ui-whale'
export const PACKAGE_SPEC = '@dsh-external/dsh-ui-whale'

interface GithubTag { readonly name: string }

export function compareSemver(a: string, b: string): number {
  const parse = (v: string): number[] => { const p = v.replace(/^v/, '').split('.').map(x => Number(x) || 0); while (p.length < 3) p.push(0); return p }
  const pa = parse(a); const pb = parse(b)
  return (pa[0]! - pb[0]!) || (pa[1]! - pb[1]!) || (pa[2]! - pb[2]!)
}

interface HostLatest { readonly latest?: string | undefined; readonly dshVersion?: string | undefined; readonly latestSupported?: string | undefined; readonly compat?: boolean | undefined }

async function latestFromHost(): Promise<HostLatest | undefined> {
  try {
    const res = await fetch(`/${UPDATE_ID}/latest`, { method: 'GET', signal: AbortSignal.timeout(9000) })
    if (!res.ok) return undefined
    const b: unknown = await res.json()
    const raw = b as { latest?: unknown; dshVersion?: unknown; latestSupported?: unknown; compat?: unknown }
    const latest = typeof raw.latest === 'string' && /^v\d+\.\d+\.\d+$/.test(raw.latest) ? raw.latest : undefined
    if (latest === undefined) return undefined
    return {
      latest,
      dshVersion: typeof raw.dshVersion === 'string' && raw.dshVersion !== '' ? raw.dshVersion : undefined,
      latestSupported: typeof raw.latestSupported === 'string' && /^v\d+\.\d+\.\d+$/.test(raw.latestSupported) ? raw.latestSupported : undefined,
      compat: raw.compat === true,
    }
  } catch { return undefined }
}
async function latestFromTags(): Promise<string | undefined> {
  try { const res = await fetch(`https://api.github.com/repos/${MIRROR}/tags?per_page=10`, { headers: { accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(8000) }); if (!res.ok) return undefined; const tags: unknown = await res.json(); if (!Array.isArray(tags)) return undefined; const stable = tags.map((e) => (e as GithubTag).name).filter((n): n is string => typeof n === 'string' && /^v\d+\.\d+\.\d+$/.test(n)); if (stable.length === 0) return undefined; return stable.reduce((newest, t) => (compareSemver(t, newest) > 0 ? t : newest)) } catch { return undefined }
}
async function latestFromRaw(): Promise<string | undefined> {
  try { const res = await fetch(`https://raw.githubusercontent.com/${MIRROR}/main/package.json`, { signal: AbortSignal.timeout(8000) }); if (!res.ok) return undefined; const pkg: unknown = await res.json(); const version = (pkg as { version?: unknown }).version; return typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version) ? `v${version}` : undefined } catch { return undefined }
}
export interface UpdateInfo {
  readonly latest: string
  /** Running DSH version; undefined when the host endpoint did not report it. */
  readonly dshVersion?: string | undefined
  /** Newest tag whose compatibility data covers dshVersion; undefined when unknown. */
  readonly latestSupported?: string | undefined
  /** True when the compatibility map was reachable and parsed. */
  readonly compat?: boolean | undefined
}

export async function fetchUpdateInfo(): Promise<UpdateInfo | undefined> {
  // All sources race in parallel: total latency is the slowest one instead of
  // their sum, so an offline machine shows the failure chip within seconds.
  // Only the host endpoint carries the DSH-version gating fields; the tag/raw
  // fallbacks degrade to the legacy plain-update behavior.
  const [host, tags, raw] = await Promise.all([latestFromHost(), latestFromTags(), latestFromRaw()])
  const latest = host?.latest ?? tags ?? raw
  if (latest === undefined) return undefined
  return { latest, dshVersion: host?.dshVersion, latestSupported: host?.latestSupported, compat: host?.compat }
}

export type UpdateNotice =
  | { readonly kind: 'current'; readonly tag: string }
  | { readonly kind: 'available'; readonly tag: string }
  | { readonly kind: 'partial'; readonly tag: string; readonly blocked: string; readonly dshVersion: string }
  | { readonly kind: 'blocked'; readonly tag: string; readonly dshVersion: string }

/** Decide the update-chip message from the local version and the gated remote info. */
export function decideUpdate(local: string, info: UpdateInfo): UpdateNotice {
  const { latest } = info
  if (compareSemver(latest, local) <= 0) return { kind: 'current', tag: latest }
  const dshVersion = info.dshVersion
  if (dshVersion === undefined || info.compat !== true) return { kind: 'available', tag: latest }
  // Newest release this DSH version can run; undefined means the map knows no
  // tag (newer than nothing) that supports the running DSH version.
  const supported = info.latestSupported !== undefined && compareSemver(info.latestSupported, local) > 0 ? info.latestSupported : undefined
  if (supported === undefined) return { kind: 'blocked', tag: latest, dshVersion }
  if (compareSemver(supported, latest) >= 0) return { kind: 'available', tag: latest }
  return { kind: 'partial', tag: supported, blocked: latest, dshVersion }
}

export async function fetchLatestTag(): Promise<string | undefined> {
  return (await fetchUpdateInfo())?.latest
}
export function updatePrompt(tag: string): string {
  return [
    `帮我更新 ${UPDATE_ID} 插件到 ${tag}，步骤：`,
    `0. 先执行 dsh --version 确认本地 DSH 版本，并对照 https://github.com/${MIRROR} 的 README「版本兼容」表——不同 DSH 版本需安装不同插件 tag，装错版本会启动崩溃；若本提示词给的 tag 与你的 DSH 版本不匹配，请改装表中对应 tag`,
    `1. 执行 dsh plugin --profile web add '${PACKAGE_SPEC}@github:${MIRROR}#${tag}'（首次可能被 pnpm 11 拦截构建脚本，则先在 ~/.dsh/profiles/web 执行 pnpm approve-builds --all）`,
    '2. 完成后提醒我硬刷新浏览器（Ctrl/Cmd+Shift+R）',
    `3. 遇到安装失败 / 版本不匹配 / 启动报错：先查 https://github.com/${MIRROR} README 的「版本兼容」与「已知限制」章节再排查`,
  ].join('\n')
}
export interface UpdateResult { readonly ok: boolean; readonly detail: string; readonly link?: boolean; readonly recovery?: string; readonly hostChanged?: boolean }
export async function runUpdate(tag: string): Promise<UpdateResult> {
  try {
    const res = await fetch(`/${UPDATE_ID}/update`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-dsh-plugin-update': 'click' }, body: JSON.stringify({ tag }), signal: AbortSignal.timeout(130000) })
    const body: unknown = await res.json().catch(() => ({}))
    const parsed = body as { ok?: boolean; output?: string; error?: string; link?: boolean; recovery?: string; hostChanged?: boolean }
    return { ok: res.ok && parsed.ok === true, detail: typeof parsed.output === 'string' ? parsed.output : (parsed.error ?? String(res.status)), link: parsed.link === true, ...(typeof parsed.recovery === 'string' ? { recovery: parsed.recovery } : {}), ...(parsed.hostChanged === true ? { hostChanged: true } : {}) }
  } catch (e) { return { ok: false, detail: String((e as Error)?.message ?? e) } }
}
