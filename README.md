# @dsh-external/dsh-ui-whale

DSH Web UI 的常驻像素鲸鱼伙伴插件：会话标题栏（标题行右侧）常驻一只小鲸鱼，随会话快照实时反应——**零核心改动**。

## 演示 Demo

![dsh-ui-whale 完整演示](docs/dsh-ui-whale-demo.gif)

各动作 GIF：

<img src="docs/眨眼.gif" alt="眨眼" width="200"> <img src="docs/摆尾巴.gif" alt="摆尾巴" width="200"> <img src="docs/摆腹鳍.gif" alt="摆腹鳍" width="200">

<img src="docs/喷水花.gif" alt="喷水花" width="200"> <img src="docs/冒爱心.gif" alt="冒爱心" width="200"> <img src="docs/睡觉.gif" alt="睡觉" width="200">

> 完整视频：[docs/dsh-ui-whale-demo.mp4](docs/dsh-ui-whale-demo.mp4)

> **你的 DSH 版本决定装哪个插件版本**（装错会崩：常见症状 `useConversation is not a function`）
> - DSH **0.1.1-rc.2**（npm 最新）：装**旧版** `'@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.4'`
> - DSH **0.1.2-alpha.1 / alpha.2 / alpha.3 / alpha.4 / alpha.5 / rc.1**：装**新版**（下方默认命令）
## 安装

```sh
# 方式一：git 依赖固定 tag（公开镜像，推荐；也可用 github:lhh010/dsh-ui-whale）
dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.15'

# 方式二：本地 link（开发）
git clone https://github.com/lhh010/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install && pnpm run build
dsh plugin --profile web add link:/path/to/dsh-ui-whale
```

配置行（`$DSH_HOME/profiles/web/cordis.patch.yml`，热重载，无需重启）：

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

> **安装提示**：pnpm 11 首次安装可能拦截 node-pty 等构建脚本——在 `~/.dsh/profiles/web` 下执行 `pnpm approve-builds --all` 放行后重跑安装命令；装完**硬刷新浏览器**（Ctrl/Cmd+Shift+R）。

### 提示词安装（让 DSH 自己装）

把下面这段提示词发给任意一个 DSH 会话，模型会替你完成安装：

> 帮我安装 dsh-ui-whale 插件（DSH 会话标题栏像素鲸鱼伙伴），步骤：
> 1. 执行 `dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.15'`（首次可能被 pnpm 11 拦截 node-pty 构建脚本而失败）
> 2. 在 `~/.dsh/profiles/web` 下执行 `pnpm approve-builds --all`（放行构建脚本）
> 3. 再执行一次第 1 步的安装命令
> 4. 完成后提醒我硬刷新浏览器（Ctrl/Cmd+Shift+R）
> 遇到报错先查 https://github.com/lhh010/dsh-ui-whale README 的常见问题/已知限制。

## 版本对应 / Version compatibility

## 版本对应 / Version compatibility

构建产物随 DSH 快照版本更新，安装时按快照选择对应版本：

| 插件版本 | DSH 快照 | 说明 |
| --- | --- | --- |
| `v0.1.0` | `snapshots/20260805T134133Z`（snapshot0805） | 旧构建，按旧安装方式（`~/.dsh/config.yaml` + `pnpm add -w link:`） |
| `v0.2.0` | `snapshots/20260806T160212Z`（snapshot0806） | 0806 新构建，按新安装方式 |
| `v0.3.0` | `snapshots/20260806T160212Z`（snapshot0806） | 0806 构建 + 睡觉动画（连续空闲 10 s 入睡） |
| `v0.3.1` | `snapshots/20260806T160212Z`（snapshot0806） | 睡觉 Z 改 5 帧循环 `0-1-2-3-4-5-1-…`；尾巴加一帧改 `0-1-2-3-4-3-2-1-0` |
| `v0.3.2` | `snapshots/20260806T160212Z`（snapshot0806） | 修正睡觉 Z 浮动轨迹（重新定位 睡觉2~5 的 Z 位置） |
| `v0.3.3` | `snapshots/20260810T155924Z`（snapshot0810） | 兼容性构建：客户端插件元数据从顶层 `dshClient` 迁移为嵌套 `dsh.client`（0810 的 ClientModuleHostService 只读该字段；顶层 `dshClient` 被静默忽略），inject/platform 原样保留 |
| `v0.3.15` | `dsh-v0.1.2-alpha.1`~`alpha.5`、`rc.1`、`0.1.3-alpha.1`、`0.1.3-alpha.2` | 当前版本：声明支持 0.1.3-alpha.2（npm 已发布，钉版本实机验证；alpha.2 改动全在 pi-ai/Web 顶栏/子代理消息/host 面，client 插件面零代码差异；typecheck/build/单测全绿） |
| `v0.3.14` | `dsh-v0.1.2-alpha.1`~`alpha.5`、`rc.1`、`0.1.3-alpha.1` | 声明支持 0.1.3-alpha.1（npm 未发布，源码宿主实机验证；0.1.3 破坏性变更集中在 host/session 侧，client 插件面零代码差异；typecheck/build/单测全绿） |
| `v0.3.13` | `dsh-v0.1.2-alpha.1`~`alpha.5`、`rc.1` | 声明支持 rc.1（alpha.5→rc.1 为纯版本号提交，零代码差异；实机 rc.1 验证通过） |
| `v0.3.12` | `dsh-v0.1.2-alpha.1`~`alpha.5` | 声明支持 alpha.5（typecheck/build 全绿；alpha.5 为纯 bug 修复，无 API 变更） |
| `v0.3.11` | `dsh-v0.1.2-alpha.1`~`alpha.4` | 声明支持 alpha.4 + 演示 Demo 前置 |
| `v0.3.10` | `dsh-v0.1.2-alpha.1`~`alpha.3` | 更新提示词补「按 DSH 版本选 tag」路由说明与排查指引 |
| `v0.3.9` | `dsh-v0.1.2-alpha.1`~`alpha.3` | 更新端点鉴权（x-dsh-plugin-update 头 + 同源校验）与 hostChanged 检测 |
| `v0.3.8` | `dsh-v0.1.2-alpha.1`（GitHub tag，源码构建安装） | 迁移到 0.1.2-alpha.1 客户端 API（views/legacy 投影 + ctx.slots.inject），带兼容自诊断横幅 |
| `v0.3.5` | `dsh-v0.1.2-alpha.1` | 兼容性自诊断横幅引入 |
| `v0.3.4` | npm `@deepseek-ai/dsh@0.1.1-rc.1` | 0.1.1-rc.1 实机 boot 验证通过（boot 清单 + client.js 200），依赖的槽位/服务不变 |

> **兼容性说明**：上表构建均基于 snapshot0806 开发，同时兼容 snapshot0807（`snapshots/20260807T130646Z`）、snapshot0808（`snapshots/20260808T121140Z`）、snapshot0809（`snapshots/20260809T140917Z`）、snapshot0810（`snapshots/20260810T155924Z`）、snapshot0811（`snapshots/20260811T152241Z`）与最终快照 snapshot0812（`snapshots/20260812T172954Z-final`）——0807~0812 用户直接安装默认版本（`v0.3.8`）即可（0811 与 0812 实机 boot 验证通过，见下）。

> **npm 发版兼容**：兼容 DSH npm 发版 `@deepseek-ai/dsh@0.1.1-rc.1`（v0.3.4 实机 boot 验证通过：`dsh --profile web` 启动后 boot 清单包含 `@dsh-external/dsh-ui-whale`，`/plugins/@dsh-external/dsh-ui-whale/client.js` 返回 200；`conversation.session.header.actions` 槽位与 `locale`/`invariants` 服务在 0.1.1-rc.1 上保持不变），同时兼容 `@deepseek-ai/dsh@0.0.1-rc.5`（dist-tag `next`，即最终快照 snapshot0812 的 npm 发版；`npm exec -p @deepseek-ai/dsh@0.0.1-rc.5 -- dsh --profile web --port <port>` 可访问指定版本并启动，lib 生产模式），同时保持兼容 `@deepseek-ai/dsh@0.0.1-rc.2`（snapshot0811 的 npm 发版）。实测（npm rc.5 基线）：`dsh web` 启动后 `window.__DSH_BOOT__` 清单包含 `@dsh-external/dsh-ui-whale`（inject: `dsh-client-locale`/`dsh-client-runtime`/`dsh-client-ui-conversation`），`/plugins/@dsh-external/dsh-ui-whale/client.js` 返回 200；src 对 rc.5 基线构建产物 typecheck 全绿（本插件已把 cordis 类型导入与 peer 迁移至 `@deepseek-ai/cordis`，见下）。注意：0811 起 vendored cordis 更名为 `@deepseek-ai/cordis`（npm 发版不再发布 `cordis` 名义的 vendored 包），本插件已迁移（peer 声明 `@deepseek-ai/cordis: ^4.0.1-rc.1`，npm rc.5 基线上为 `4.0.1-rc.4`），纯 `npm install` 不再报 ERESOLVE。

> **alpha 发版兼容**：兼容 `dsh-v0.1.2-alpha.1`（GitHub tag `dsh-v0.1.2-alpha.1`，源码构建安装，不发布 npm；v0.3.5 迁移并验证：0.1.2-alpha.1 移除了 `@deepseek-ai/dsh-client-runtime` 客户端包，`ClientContext` 改从 `@deepseek-ai/cordis` 导入、`ConversationSnapshot` 重构为 views 架构（旧 `nodes`/`partial`/`runningCalls` 等字段移到 `ChatSnapshot.legacy` 兼容投影）。本插件已在 0.1.2-alpha.1 源码基线上重写数据来源（`useSession` 读 Session 生命周期、`useConversation` 经 `views.get('chat').legacy` 读流式/工具状态），typecheck、34 个单测与构建全绿，注册改用 `ctx.slots.inject('conversation.session.header.actions', …)` 新范式）。
本插件 v0.3.8 起内置**兼容性自诊断**：apply 时探测所需客户端 API,不满足时不再崩溃,而是在页面右下角渲染修复指引横幅(点击可关闭),提示升级 DSH 或更新插件。

> git 依赖方式固定 tag（公开镜像，推荐）：`pnpm add '@dsh-external/dsh-ui-whale@github:lhh010/dsh-ui-whale#v0.3.15'`（或 `github:lhh010/dsh-ui-whale`；历史版本：0810/0811 用户用 `#v0.3.3`，0806~0809 用户用 `#v0.3.2`，0805 用户用 `#v0.1.0`）。

## 0809 兼容要点（snapshot0809，实机验证）

- 0809 运行中的 `dsh web` 的 `window.__DSH_BOOT__` 清单包含 `@dsh-external/dsh-ui-whale`，标题栏鲸鱼正常渲染——眨眼/摆尾/思考/喷水/睡觉动画与点击爱心均实测可用。
- **加载机制变化**：0809 重构了客户端插件机制——旧的 `dsh.plugin.json` 清单 + `resolveClientPath`（`packages/plugin/plugin`）已删除，改为 **package.json 的 `dshClient` 声明**（`platform: 'web'`，可选 `inject`/`immediately`）+ `exports["./client"]` 指向构建产物；宿主扫描 loader 条目组成 boot 图，Web 端从 `/plugins/<id>/client.js` 拉取。本插件 package.json 已满足该声明，无需改动。
- 本插件使用的槽位 `conversation.session.header.actions`（list/session）在 0809 上仍由官方 `ui-conversation` 声明，owner 契约未变；`useSession` 会话快照契约未变。
- **构建要求**：0809 宿主在激活时校验 `dshClient` 包的构建产物，缺失会抛 `ClientPackageCompositionError` 并**拒绝启动 `dsh web`**——升级快照或改源码后必须重新 `pnpm run build` 再启动，否则浏览器拉到的是旧 `lib/client.js`。

## 0810 兼容要点（snapshot0810，实机验证）

- **元数据发现变化**：0810 的 ClientModuleHostService 在启动时扫描已加载插件的 package.json，但只读**嵌套 `dsh.client`**（`packages/client/modules/src/index.ts` 的 `resolveMeta`，`pkg.dsh.client`）；顶层 `dshClient` 字段读不到会静默丢出 boot 图——无日志、无报错，"启动顺利但插件全没"。本插件已从顶层 `dshClient` 迁移为嵌套 `dsh.client`（inject/platform 原样保留），0810 实机验证 `window.__DSH_BOOT__` 清单包含本插件、鲸鱼各动画与爱心互动正常。
- **无需重构建**：`lib/client.js` 构建产物不变，package.json 不参与编译；symlink 安装改源仓库即生效，无需重装。

## 0811 兼容要点（snapshot0811，实机验证）

- **cordis 更名（本快照唯一影响本插件的官方变化）**：0811 将 vendored cordis 由 `cordis@4.0.0-rc.7` 更名为 **`@deepseek-ai/cordis@4.0.1-rc.1`**（官方 client 包随之全部改从 `@deepseek-ai/cordis` 导入）。本插件对 cordis 只有 type-only 导入（`src/invariant.ts` 的 `import type { Context } from 'cordis'`，tests 有一处 value 导入但同样为本地测试用），**构建产物（lib/*.js）零 cordis 运行时导入**——更名不影响已构建 bundle 的运行时加载；但源码对 npm rc.2 基线 typecheck 时 `cordis` 裸导入报 TS2307（仅此一处），**将类型导入迁移为 `from '@deepseek-ai/cordis'` 后全绿**。建议同步把 `peerDependencies.cordis` 迁移为 `@deepseek-ai/cordis: ^4.0.1-rc.1`。
- **实机 boot 验证**：snapshot0811（`snapshots/20260811T152241Z`）web 启动后 `window.__DSH_BOOT__` 清单包含 `@dsh-external/dsh-ui-whale`（inject: `dsh-client-locale`/`dsh-client-runtime`/`dsh-client-ui-conversation`），`/plugins/@dsh-external/dsh-ui-whale/client.js` 返回 200。本插件使用的槽位 `conversation.session.header.actions`（list/session）在 0811 上仍由官方 `ui-conversation` 声明，owner 契约未变；`useSession` 会话快照契约未变（0811 仅新增 `views` 字段，不影响快照读取）。typecheck（含 tests，34 个单测）对 0811 基线通过。

### 0812/最终快照 兼容要点（snapshots/20260812T172954Z-final，实机验证）

- **cordis 更名落地**：本插件已把 type-only 导入（`src/invariant.ts` 的 `import type { Context } from '@deepseek-ai/cordis'`，tests 的 value 导入同步迁移）与 `peerDependencies`/`devDependencies` 迁移至 `@deepseek-ai/cordis`（`^4.0.1-rc.1`；npm rc.5 基线上为 `@deepseek-ai/cordis@4.0.1-rc.4`）——构建产物（lib/*.js）零 cordis 运行时导入，npm rc.5 消费者 typecheck 全绿，`npm install` 无需 `--legacy-peer-deps`。
- **invariants 源码包迁移（仅影响本地 typecheck）**：最终快照将 `@deepseek-ai/dsh-invariants` 源码包由 `packages/support/invariants` 移至 `packages/runtime-diagnostics/invariants`，devDependencies 路径已同步更新；服务名 `invariants` 与注册协议未变，运行不受影响。
- **实机 boot 验证**：最终快照（`snapshots/20260812T172954Z-final`）web 启动后 `window.__DSH_BOOT__` 清单包含 `@dsh-external/dsh-ui-whale`，`/plugins/@dsh-external/dsh-ui-whale/client.js` 返回 200；npm rc.5 consumer `dsh web` 启动后 boot 清单同样包含本插件。本插件使用的槽位 `conversation.session.header.actions`（list/session）在最终快照与 rc.5 上仍由官方 `ui-conversation` 声明，owner 契约未变；`useSession` 会话快照契约未变（0811 新增的 `views` 与 `InputState.imageIds` 均不影响快照读取）。typecheck、build 与 34 个单测对最终快照基线通过。

## 它做什么

- **平时（空闲）**：隔一会儿眨一次眼（约 5 秒）；偶尔摆一下尾巴（约 11 秒一次，0-1-2-3-4-3-2-1-0 来回）；偶尔动动胸鳍（约 7 秒一次，0-1-2-1-0 来回）。
- **睡觉**：连续空闲 **10 秒**后入睡——头顶灰色「Z」按 **0-1-2-3-4-5-1-2-3-4-5-1-…** 循环（先静止姿态 0 一次，再上浮→渐小→淡出 1-5 反复）；睡觉期间动鱼鳍和甩尾巴照常；一有活动（思考 / 工作 / 运行 / 喷水庆祝）立即醒来。
- **思考 / 运行 / 工作中**：尾巴持续摆动 + 胸鳍持续扑动 + 眨眼更频繁。
- **回合完成时**：头顶喷水庆祝——水花按**单向 0-1-2-3-4-5-6** 喷起散开（不反向），喷完结束。
- **点击鲸鱼**：左上角冒出一颗粉色爱心，从小变大再消失（**单向 0-1-2-3-0**），期间其它动作照常进行；再点一次会重新从小爱心开始。

## 美术与实现

- 素材：22 帧手绘像素画（25×40 网格，7 色调色板：深蓝 `#203864`、身体蓝 `#0066FF`、浅蓝 `#B4C7E7`、白 `#F2F2F2`、粉 `#CC3399`、灰 `#808080`——睡眠 Z 符号），`sprites/` 里保存帧数据。
- 渲染：分层 CSS box-shadow 像素画（身体 / 眼睛 / 尾巴 / 胸鳍 / 喷水花 / 爱心 / 睡眠 Z 各一层），动画 = 固定 DOM 树上的样式切换，无逐帧布局。
- 分层由帧数据自动推导：每个动画区域 = 该动作任一帧相对静止姿势变化的单元格集合，组合姿势逐像素还原原图（有测试钉住）。
- 动画引擎是纯 tick 状态机（`src/client/animation.ts`），情绪由会话快照的 running / 推理 partial / 运行中工具推导；睡觉由连续空闲 tick 数（10 s）推导。

## 安装（组织内成员）

完整步骤见 [INSTALL.md](INSTALL.md)。两条通道任选其一（互斥，勿同时用）：

**官方 profile 通道**（0806 默认，配置行热重载，无需重启）：

```sh
git clone https://github.com/lhh010/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install
dsh plugin --profile web add link:/path/to/dsh-ui-whale
```

`$DSH_HOME/profiles/web/cordis.patch.yml` 配置行：

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

**registry 通道**（需 DSH 已集成 plugin-registry，`dsh registry` 可用；清单已满足 registry id 校验）：

```sh
dsh registry install /path/to/dsh-ui-whale   # 或打包后的 dsh-ui-whale.tgz
dsh registry enable @dsh-external/dsh-ui-whale
```

## 开发

```sh
pnpm install        # 依赖（link: 到 ../.dsh/source/current 快照）
pnpm build          # tsdown → lib/{index,invariant,client}.js
pnpm typecheck      # tsc
pnpm test           # vitest（帧一致性 / 动画序列 / 插件注册）
```

## Model Experience

无——纯浏览器端 UI 呈现：不进入模型请求、不增加提示词内容、不改任何工具 schema。

## License

BSD-3-Clause（见 [LICENSE](LICENSE)）。