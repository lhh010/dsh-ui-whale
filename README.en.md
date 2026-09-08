# @dsh-external/dsh-ui-whale

[简体中文](./README.md) | **English**

A resident pixel-whale companion plugin for the DSH Web UI: a small whale lives permanently in the session title bar (right side of the title row) and reacts in real time to the session snapshot — **zero core changes**.

> **Pick the plugin version that matches your DSH** (a mismatch crashes: common symptom `useConversation is not a function`)
> - DSH **0.1.1-rc.2** (npm latest): install the **old** version `'@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.4'`
> - DSH **0.1.2-alpha.1 / alpha.2 / alpha.3 / alpha.4 / alpha.5 / rc.1**: install the **new** version (the default command below)
## Install

```sh
# Option 1: pinned-tag git dependency (public mirror, recommended; github:lhh010/dsh-ui-whale also works)
dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.16'

# Option 2: local link (development)
git clone https://github.com/lhh010/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install && pnpm run build
dsh plugin --profile web add link:/path/to/dsh-ui-whale
```

Config line (`$DSH_HOME/profiles/web/cordis.patch.yml`, hot-reloaded, no restart needed):

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

> **Install tips**: pnpm 11 may block node-pty build scripts on first install — run `pnpm approve-builds --all` under `~/.dsh/profiles/web` and re-run the install; then **hard-refresh the browser** (Ctrl/Cmd+Shift+R).

### Prompt install (let DSH install it)

Paste this prompt into any DSH session and the agent installs it for you:

> Install the dsh-ui-whale plugin (DSH session-header pixel whale pet):
> 1. Run `dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.16'` (the first run may fail because pnpm 11 blocks node-pty build scripts)
> 2. Under `~/.dsh/profiles/web`, run `pnpm approve-builds --all` (approve the build scripts)
> 3. Re-run the install command from step 1
> 4. Remind me to hard-refresh the browser (Ctrl/Cmd+Shift+R)
> On errors, first check the FAQ/known limitations in the README at <https://github.com/lhh010/dsh-ui-whale>.

## Version compatibility

## 版本对应 / Version compatibility

Build artifacts are updated with each DSH snapshot; pick the version matching your snapshot when installing:

| Plugin version | DSH snapshot | Notes |
| --- | --- | --- |
| `v0.1.0` | `snapshots/20260805T134133Z` (snapshot0805) | Legacy build; install with the old method (`~/.dsh/config.yaml` + `pnpm add -w link:`) |
| `v0.2.0` | `snapshots/20260806T160212Z` (snapshot0806) | New 0806 build; install with the new method |
| `v0.3.0` | `snapshots/20260806T160212Z` (snapshot0806) | 0806 build + sleep animation (falls asleep after 10 s of continuous idle) |
| `v0.3.1` | `snapshots/20260806T160212Z` (snapshot0806) | Sleep Z changed to a 5-frame loop `0-1-2-3-4-5-1-…`; the tail gained one frame, changed to `0-1-2-3-4-3-2-1-0` |
| `v0.3.2` | `snapshots/20260806T160212Z` (snapshot0806) | Fixed the sleep Z float trajectory (repositioned the Z of sleep frames 2~5) |
| `v0.3.8` (default) | `dsh-v0.1.2-alpha.1` (GitHub tag, source-built install) | Current: migrated to the 0.1.2-alpha.1 client API (views/legacy projection + ctx.slots.inject), with the compat self-diagnostic banner |
| `v0.3.5` | `dsh-v0.1.2-alpha.1` | Introduced the compat self-diagnostic banner |
| `v0.3.4` | npm `@deepseek-ai/dsh@0.1.1-rc.1` | 0.1.1-rc.1 real boot verified (boot manifest + client.js 200); relied slots/services unchanged |
| `v0.3.3` (default) | `snapshots/20260810T155924Z` (snapshot0810) | Compatibility build: client plugin m

> **Compatibility note**: the builds in the table above were all developed against snapshot0806 and are also compatible with snapshot0807 (`snapshots/20260807T130646Z`), snapshot0808 (`snapshots/20260808T121140Z`), snapshot0809 (`snapshots/20260809T140917Z`), snapshot0810 (`snapshots/20260810T155924Z`), snapshot0811 (`snapshots/20260811T152241Z`) and the final snapshot snapshot0812 (`snapshots/20260812T172954Z-final`) — users on 0807~0812 can simply install the default version (`v0.3.8`) (real-hardware boot verified for 0811 and 0812, see below).

> **alpha release compatibility**: compatible with `dsh-v0.1.2-alpha.1` (GitHub tag `dsh-v0.1.2-alpha.1`, source-built install, not published to npm; v0.3.5 migrated & verified: 0.1.2-alpha.1 removed the `@deepseek-ai/dsh-client-runtime` client package — `ClientContext` now imports from `@deepseek-ai/cordis`, and `ConversationSnapshot` was refactored into a views architecture (the old `partial`/`runningCalls` moved to the `ChatSnapshot.legacy` compatibility projection). This plugin rewrote its data sources on the 0.1.2-alpha.1 source baseline (`useSession` reads the Session lifecycle snapshot; `useConversation` reads streaming/tool state via `views.get('chat').legacy`), with typecheck, all 34 unit tests, and the build green; registration uses the new `ctx.slots.inject('conversation.session.header.actions', …)` form).

> **npm release compatibility**: compatible with the DSH npm release `@deepseek-ai/dsh@0.0.1-rc.5` (dist-tag `next`, i.e. the npm release of the final snapshot snapshot0812; `npm exec -p @deepseek-ai/dsh@0.0.1-rc.5 -- dsh --profile web --port <port>` can access and start that version, lib production mode), while remaining compatible with `@deepseek-ai/dsh@0.0.1-rc.2` (the npm release of snapshot0811). Verified on a real machine (npm rc.5 baseline): after `dsh web` starts, the `window.__DSH_BOOT__` manifest includes `@dsh-external/dsh-ui-whale` (inject: `dsh-client-locale`/`dsh-client-runtime`/`dsh-client-ui-conversation`), and `/plugins/@dsh-external/dsh-ui-whale/client.js` returns 200; the source typechecks fully green against the rc.5 baseline build artifacts (this plugin has migrated its cordis type imports and peer dependency to `@deepseek-ai/cordis`, see below). Note: starting from 0811 the vendored cordis was renamed to `@deepseek-ai/cordis` (the npm release no longer publishes the vendored package under the `cordis` name); this plugin has migrated accordingly (peer declaration `@deepseek-ai/cordis: ^4.0.1-rc.1`, which is `4.0.1-rc.4` on the npm rc.5 baseline), and a plain `npm install` no longer reports ERESOLVE.

> Pinning the tag for git dependencies (public mirror, recommended): `pnpm add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.16'` (or `github:lhh010/dsh-ui-whale`; historical: 0810/0811 users use `#v0.3.3`, 0806~0809 users `#v0.3.2`, 0805 users `#v0.1.0`).

## 0809 compatibility highlights (snapshot0809, real-hardware verified)

- On a running 0809 `dsh web`, the `window.__DSH_BOOT__` manifest includes `@dsh-external/dsh-ui-whale`, and the title-bar whale renders correctly — blink / tail-wag / think / spout / sleep animations and the heart click are all verified working.
- **Loading mechanism change**: 0809 refactored the client plugin mechanism — the old `dsh.plugin.json` manifest + `resolveClientPath` (`packages/plugin/plugin`) was removed, replaced by the **`dshClient` declaration in package.json** (`platform: 'web'`, optional `inject`/`immediately`) + `exports["./client"]` pointing at the build artifact; the host scans loader entries to compose the boot graph, and the Web side fetches from `/plugins/<id>/client.js`. This plugin's package.json already satisfies that declaration; no changes needed.
- The slot this plugin uses, `conversation.session.header.actions` (list/session), is still declared by the official `ui-conversation` on 0809, and the owner contract is unchanged; the `useSession` session-snapshot contract is unchanged.
- **Build requirement**: the 0809 host validates the build artifacts of the `dshClient` package at activation; a missing artifact throws `ClientPackageCompositionError` and **refuses to start `dsh web`** — after upgrading the snapshot or editing source code, you must re-run `pnpm run build` before starting, otherwise the browser pulls the stale `lib/client.js`.

## 0810 compatibility highlights (snapshot0810, real-hardware verified)

- **Metadata discovery change**: 0810's ClientModuleHostService scans the package.json of loaded plugins at startup but only reads the **nested `dsh.client`** (`resolveMeta` in `packages/client/modules/src/index.ts`, `pkg.dsh.client`); when the top-level `dshClient` field can't be read, it is silently dropped from the boot graph — no logs, no errors, "starts smoothly but no plugins at all". This plugin has migrated from the top-level `dshClient` to the nested `dsh.client` (inject/platform preserved as-is); verified on 0810 real hardware that the `window.__DSH_BOOT__` manifest includes this plugin, and all whale animations and the heart interaction work.
- **No rebuild needed**: the `lib/client.js` build artifact is unchanged, and package.json does not participate in compilation; with a symlink install, edits to the source repo take effect without reinstalling.

## 0811 compatibility highlights (snapshot0811, real-hardware verified)

- **cordis rename (the only official change in this snapshot affecting this plugin)**: 0811 renamed the vendored cordis from `cordis@4.0.0-rc.7` to **`@deepseek-ai/cordis@4.0.1-rc.1`** (all official client packages accordingly switched to importing from `@deepseek-ai/cordis`). This plugin has only type-only imports of cordis (`import type { Context } from 'cordis'` in `src/invariant.ts`; the tests have one value import, but it is likewise only for local testing), and the **build artifacts (lib/*.js) contain zero runtime cordis imports** — the rename does not affect the runtime loading of already-built bundles; however, when typechecking the source against the npm rc.2 baseline, the bare `cordis` import reports TS2307 (only that one spot), and **after migrating the type import to `from '@deepseek-ai/cordis'` everything is green**. It is recommended to also migrate `peerDependencies.cordis` to `@deepseek-ai/cordis: ^4.0.1-rc.1`.
- **Real-hardware boot verification**: on snapshot0811 (`snapshots/20260811T152241Z`), after web starts, the `window.__DSH_BOOT__` manifest includes `@dsh-external/dsh-ui-whale` (inject: `dsh-client-locale`/`dsh-client-runtime`/`dsh-client-ui-conversation`), and `/plugins/@dsh-external/dsh-ui-whale/client.js` returns 200. The slot this plugin uses, `conversation.session.header.actions` (list/session), is still declared by the official `ui-conversation` on 0811, and the owner contract is unchanged; the `useSession` session-snapshot contract is unchanged (0811 only added a `views` field, which does not affect snapshot reads). Typecheck (including tests, 34 unit tests) passes against the 0811 baseline.

### 0812/final snapshot compatibility highlights (snapshots/20260812T172954Z-final, real-hardware verified)

- **cordis rename landed**: this plugin has migrated its type-only imports (`import type { Context } from '@deepseek-ai/cordis'` in `src/invariant.ts`; the tests' value imports migrated in sync) and `peerDependencies`/`devDependencies` to `@deepseek-ai/cordis` (`^4.0.1-rc.1`; `@deepseek-ai/cordis@4.0.1-rc.4` on the npm rc.5 baseline) — the build artifacts (lib/*.js) contain zero runtime cordis imports, npm rc.5 consumers typecheck fully green, and `npm install` needs no `--legacy-peer-deps`.
- **invariants source package moved (only affects local typecheck)**: the final snapshot moved the `@deepseek-ai/dsh-invariants` source package from `packages/support/invariants` to `packages/runtime-diagnostics/invariants`; the devDependencies path has been updated accordingly; the service name `invariants` and its registration protocol are unchanged, so runtime is unaffected.
- **Real-hardware boot verification**: on the final snapshot (`snapshots/20260812T172954Z-final`), after web starts, the `window.__DSH_BOOT__` manifest includes `@dsh-external/dsh-ui-whale`, and `/plugins/@dsh-external/dsh-ui-whale/client.js` returns 200; after the npm rc.5 consumer `dsh web` starts, the boot manifest likewise includes this plugin. The slot this plugin uses, `conversation.session.header.actions` (list/session), is still declared by the official `ui-conversation` on the final snapshot and rc.5, and the owner contract is unchanged; the `useSession` session-snapshot contract is unchanged (the `views` added in 0811 and `InputState.imageIds` do not affect snapshot reads). Typecheck, build and the 34 unit tests pass against the final snapshot baseline.

## 演示 Demo

![dsh-ui-whale full demo](docs/dsh-ui-whale-demo.gif)

Each action GIF:

<img src="docs/眨眼.gif" alt="Blink" width="200"> <img src="docs/摆尾巴.gif" alt="Tail wag" width="200"> <img src="docs/摆腹鳍.gif" alt="Pectoral fin wave" width="200">

<img src="docs/喷水花.gif" alt="Water spout" width="200"> <img src="docs/冒爱心.gif" alt="Hearts" width="200"> <img src="docs/睡觉.gif" alt="Sleep" width="200">

> Full video: [docs/dsh-ui-whale-demo.mp4](docs/dsh-ui-whale-demo.mp4)

## What it does

- **Idle (normal)**: blinks once in a while (about every 5 s); occasionally wags its tail (about once every 11 s, back-and-forth `0-1-2-3-4-3-2-1-0`); occasionally moves its pectoral fins (about once every 7 s, back-and-forth `0-1-2-1-0`).
- **Sleeping**: falls asleep after **10 s** of continuous idle — a gray "Z" above its head loops through **0-1-2-3-4-5-1-2-3-4-5-1-…** (the static pose 0 plays once first, then float-up → shrink → fade-out 1-5 repeats); while sleeping it keeps moving its fins and wagging its tail as usual; any activity (thinking / working / running / spout celebration) wakes it immediately.
- **Thinking / running / working**: the tail wags continuously + the pectoral fins flutter continuously + blinks more frequently.
- **When a turn completes**: spouts water from the top of its head as a celebration — the spray shoots up and spreads out in a **one-way 0-1-2-3-4-5-6** (no reverse), and ends when the spray is done.
- **Clicking the whale**: a pink heart pops up in the upper-left corner, growing from small to large and then disappearing (**one-way 0-1-2-3-0**); other actions continue as usual meanwhile; clicking again starts over from the small heart.

## Art & implementation

- Assets: 22 frames of hand-drawn pixel art (25×40 grid, 7-color palette: deep blue `#203864`, body blue `#0066FF`, light blue `#B4C7E7`, white `#F2F2F2`, pink `#CC3399`, gray `#808080` — the sleep Z symbol), with frame data kept in `sprites/`.
- Rendering: layered CSS box-shadow pixel art (one layer each for body / eyes / tail / pectoral fins / spout spray / heart / sleep Z); animation = style switching on a fixed DOM tree, no per-frame layout.
- Layers are derived automatically from the frame data: each animation region = the set of cells that change relative to the static pose in any frame of that action, and the composed poses reproduce the original image pixel-by-pixel (pinned by tests).
- The animation engine is a pure tick state machine (`src/client/animation.ts`); mood is derived from the session snapshot's running / inference partial / running tools; sleep is derived from the count of consecutive idle ticks (10 s).

## Installation

Full steps in [INSTALL.md](INSTALL.md). Two channels — pick either one (mutually exclusive, do not use both):

**Official profile channel** (default for 0806; config lines hot-reload, no restart needed):

```sh
git clone https://github.com/lhh010/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install
dsh plugin --profile web add link:/path/to/dsh-ui-whale
```

Config lines in `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

**Registry channel** (requires DSH to have plugin-registry integrated and `dsh registry` available; the manifest already satisfies the registry id validation):

```sh
dsh registry install /path/to/dsh-ui-whale   # or the packaged dsh-ui-whale.tgz
dsh registry enable @dsh-external/dsh-ui-whale
```

## Development

```sh
pnpm install        # 依赖（link: 到 ../.dsh/source/current 快照）
pnpm build          # tsdown → lib/{index,invariant,client}.js
pnpm typecheck      # tsc
pnpm test           # vitest（帧一致性 / 动画序列 / 插件注册）
```

## Model Experience

None — purely browser-side UI rendering: it never enters model requests, adds no prompt content, and changes no tool schemas.

## License

BSD-3-Clause (see [LICENSE](LICENSE)).