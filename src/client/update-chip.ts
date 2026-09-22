/**
 * Floating update chip: appears once when a newer version exists; click updates
 * via the host endpoint (falling back to copying the prompt). Self-contained
 * fixed DOM with a close (×) button; all `[data-update-chip]` elements across
 * plugins are stacked into one non-overlapping column by a shared relayout, so
 * update prompts never overlap each other. When the version check fails
 * (network unreachable), a neutral gray chip with a retry button shows instead.
 */
import { PLUGIN_VERSION, fetchUpdateInfo, decideUpdate, runUpdate, updatePrompt, UPDATE_ID, MIRROR, PACKAGE_SPEC, type UpdateNotice } from './update-check.ts'

let started = false

export function startUpdateChip(): void {
  if (started) return
  started = true
  void checkOnce()
}

async function checkOnce(): Promise<UpdateNotice | undefined> {
  const info = await fetchUpdateInfo()
  if (info === undefined) { renderOfflineChip(); return undefined }
  const notice = decideUpdate(PLUGIN_VERSION, info)
  if (notice.kind === 'current') { renderCurrentChip(notice.tag); return notice }
  if (notice.kind === 'available') { renderChip(notice.tag); return notice }
  if (notice.kind === 'partial') { renderChip(notice.tag, notice); return notice }
  renderBlockedChip(notice.tag, notice.dshVersion)
  return notice
}

/** Reflow every visible update chip into a non-overlapping vertical column. */
function relayout(): void {
  const chips = Array.from(document.querySelectorAll<HTMLElement>('[data-update-chip]'))
  let next = 12
  for (const chip of chips) {
    chip.style.bottom = `${next}px`
    next += chip.getBoundingClientRect().height + 8
  }
}

const LABEL = '鲸鱼'

function renderChip(tag: string, partial?: { readonly blocked: string; readonly dshVersion: string }): void {
  if (document.querySelector(`[data-update-chip="${UPDATE_ID}"]`) !== null) return
  const el = document.createElement('div')
  el.setAttribute('data-update-chip', UPDATE_ID)
  el.setAttribute('role', 'button')
  el.setAttribute('title', partial === undefined ? `更新到 ${tag}` : `更新到 ${tag}（另有 ${partial.blocked} 需要更高 DSH 版本，当前 DSH ${partial.dshVersion} 不支持）`)
  el.style.cssText = 'position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #4a7dff;border-radius:10px;background:#1e2430;color:#cfe0ff;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);'
  const label = document.createElement('span')
  label.style.cssText = 'pointer-events:none;'
  label.textContent = partial === undefined ? `⟳ ${LABEL} 新版本 ${tag} 可用，点击更新` : `⟳ ${LABEL} 新版本 ${tag} 可用（${partial.blocked} 需更高 DSH）`
  const close = document.createElement('button')
  close.textContent = '×'
  close.setAttribute('aria-label', '关闭')
  close.title = '关闭'
  close.style.cssText = 'pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;'
  close.addEventListener('click', (event) => { event.stopPropagation(); el.remove(); relayout() })
  el.appendChild(label)
  el.appendChild(close)
  el.addEventListener('pointerdown', (event) => { event.stopPropagation() })
  el.addEventListener('click', () => {
    label.textContent = '更新中…'
    void runUpdate(tag).then((result) => {
      if (result.ok) {
        label.textContent = result.hostChanged === true ? `已更新到 ${tag}（含宿主侧变更），请重启 dsh 生效` : `已更新到 ${tag}，客户端自动刷新生效（未见变化可硬刷新 Ctrl/Cmd+Shift+R）`
        el.setAttribute('title', '已更新，硬刷新生效')
        return
      }
      if (result.link) {
        void navigator.clipboard?.writeText(updatePrompt(tag))
          .then(() => { label.textContent = `本地 link 安装：已跳过自动更新，更新提示词已复制到剪贴板` })
          .catch(() => { label.textContent = `本地 link：请手动执行 pnpm add '${PACKAGE_SPEC}@github:${MIRROR}#${tag}'` })
        el.setAttribute('title', '悬停查看本地 link 说明')
        return
      }
      void navigator.clipboard?.writeText(updatePrompt(tag))
        .then(() => { label.textContent = `自动更新失败（详见剪贴板提示词）：${result.detail.slice(0, 80)}` })
        .catch(() => { label.textContent = `自动更新失败：${result.detail.slice(0, 80)}` })
      el.setAttribute('title', result.recovery !== undefined ? `${result.detail}\n恢复命令：${result.recovery}` : result.detail)
    })
  })
  document.body.appendChild(el)
  relayout()
}

/** Neutral gray chip shown when the version check cannot reach the network. */
function renderOfflineChip(): void {
  if (document.querySelector(`[data-update-chip="${UPDATE_ID}"]`) !== null) return
  const el = document.createElement('div')
  el.setAttribute('data-update-chip', UPDATE_ID)
  el.setAttribute('title', '无法连接宿主端点 / GitHub 查询新版本（可能是网络不可达）')
  el.style.cssText = 'position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #4a5060;border-radius:10px;background:#22252c;color:#9aa3b5;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);'
  const label = document.createElement('span')
  label.style.cssText = 'pointer-events:none;'
  label.textContent = `⚠ ${LABEL} 版本检查失败（网络不可达），点击重试`
  const retry = document.createElement('button')
  retry.textContent = '重试'
  retry.setAttribute('aria-label', '重试版本检查')
  retry.style.cssText = 'pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;'
  const close = document.createElement('button')
  close.textContent = '×'
  close.setAttribute('aria-label', '关闭')
  close.title = '关闭'
  close.style.cssText = 'pointer-events:auto;border:0;background:transparent;color:#8fa3c8;font:inherit;cursor:pointer;padding:0 2px;line-height:1;'
  close.addEventListener('click', (event) => { event.stopPropagation(); el.remove(); relayout() })
  el.appendChild(label)
  el.appendChild(retry)
  el.appendChild(close)
  let retrying = false
  const retryOnce = (): void => {
    if (retrying) return
    retrying = true
    label.textContent = '版本检查中…'
    void checkOnce().then((notice) => {
      retrying = false
      if (notice === undefined) { label.textContent = `⚠ ${LABEL} 仍无法查询新版本`; return }
      el.remove()
      relayout()
    })
  }
  retry.addEventListener('click', (event) => { event.stopPropagation(); retryOnce() })
  el.addEventListener('click', (event) => { if ((event.target as HTMLElement).closest('button') === null) retryOnce() })
  document.body.appendChild(el)
  relayout()
}

/** Amber informational chip: the newest release needs a DSH version this host does not run. */
function renderBlockedChip(tag: string, dshVersion: string): void {
  if (document.querySelector(`[data-update-chip="${UPDATE_ID}"]`) !== null) return
  const el = document.createElement('div')
  el.setAttribute('data-update-chip', UPDATE_ID)
  el.setAttribute('title', `新版本 ${tag} 支持更高的 DSH 版本，但不支持当前 DSH ${dshVersion}；升级 DSH 后再更新插件`)
  el.style.cssText = 'position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #8a6d2f;border-radius:10px;background:#2d2718;color:#e8cf9a;font:12px/1.4 system-ui,Segoe UI,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);'
  const label = document.createElement('span')
  label.style.cssText = 'pointer-events:none;'
  label.textContent = `⧗ ${LABEL} 新版本 ${tag} 支持更高 DSH 版本，当前 DSH ${dshVersion} 暂不可用`
  const close = document.createElement('button')
  close.textContent = '×'
  close.setAttribute('aria-label', '关闭')
  close.title = '关闭'
  close.style.cssText = 'pointer-events:auto;border:0;background:transparent;color:#b7a677;font:inherit;cursor:pointer;padding:0 2px;line-height:1;'
  close.addEventListener('click', (event) => { event.stopPropagation(); el.remove(); relayout() })
  el.appendChild(label)
  el.appendChild(close)
  el.addEventListener('pointerdown', (event) => { event.stopPropagation() })
  document.body.appendChild(el)
  relayout()
}

/** Transient confirmation when the check succeeds and we are already current. */
function renderCurrentChip(tag: string): void {
  if (document.querySelector(`[data-update-chip="${UPDATE_ID}"]`) !== null) return
  const el = document.createElement('div')
  el.setAttribute('data-update-chip', UPDATE_ID)
  el.setAttribute('title', '版本检查成功，当前已是最新版本')
  el.style.cssText = 'position:fixed;left:12px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #2f5d3a;border-radius:10px;background:#1c2a22;color:#9fd8ae;font:12px/1.4 system-ui,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);'
  const label = document.createElement('span')
  label.style.cssText = 'pointer-events:none;'
  label.textContent = `✓ ${LABEL} 已是最新版本 ${tag}`
  el.appendChild(label)
  el.addEventListener('pointerdown', (event) => { event.stopPropagation() })
  el.addEventListener('click', () => { el.remove(); relayout() })
  document.body.appendChild(el)
  relayout()
  setTimeout(() => { el.remove(); relayout() }, 4000)
}
