# 安装

**简体中文** | [English](./INSTALL.en.md)

> **当前默认**：`v0.3.6`（面向 `dsh-v0.1.2-alpha.1`，源码构建安装）——直接装最新 tag 即可；以下为历史快照兼容记录。

> **版本选择**：`v0.3.3`（默认，含睡觉动画）面向 DSH 快照 snapshot0810（`snapshots/20260810T155924Z`），同时兼容 snapshot0811（`snapshots/20260811T152241Z`）与最终快照 snapshot0812（`snapshots/20260812T172954Z-final`）；`v0.3.2`（含睡觉动画）面向 snapshot0806（`snapshots/20260806T160212Z`）；`v0.2.0` 同为 0806 构建（无睡觉动画）；`v0.1.0` 面向 snapshot0805（`snapshots/20260805T134133Z`），按旧方式安装。以上构建同时兼容 snapshot0807（`snapshots/20260807T130646Z`）、snapshot0808（`snapshots/20260808T121140Z`）与 snapshot0809（`snapshots/20260809T140917Z`）——0807~0812 用户直接安装默认版本即可。版本对应详见 [README.md](README.md#版本对应--version-compatibility)。

> **npm 发版**：`v0.3.3` 兼容 DSH npm 发版 `@deepseek-ai/dsh@0.0.1-rc.5`（dist-tag `next`，即最终快照 snapshot0812 的 npm 发版）与 `@deepseek-ai/dsh@0.0.1-rc.2`（snapshot0811 的 npm 发版），实测运行/类型/启动清单通过。0811 起 vendored cordis 更名为 `@deepseek-ai/cordis`——本插件已把类型导入与 peer 迁移至 `@deepseek-ai/cordis`（`^4.0.1-rc.1`，npm rc.5 基线上为 `4.0.1-rc.4`），纯 `npm install` 不再报 ERESOLVE。经 `dsh plugin`/pnpm 安装自动处理。

前置：**DSH 已构建快照**（`~/.dsh/source/current` 指向含 `lib/` 产物的快照——`cordis` 与各 `@deepseek-ai/dsh-client-*` 的 `link:` 开发依赖从该快照解析）+ `dsh web` 运行中。本插件是**纯客户端插件包**（`dshClient` 行，Node half 为空），安装 = ① 包可被配置树解析 + ② 配置里加一行。

## 当前默认安装（dsh-v0.1.2-alpha.1，v0.3.5）

**最新版默认安装**：`v0.3.5` 面向 `dsh-v0.1.2-alpha.1`（GitHub tag，源码构建安装，不发布 npm；同为 `0.1.1-rc.1` 之后的最新版本）。

```sh
# 1. 克隆仓库，构建产物已入库（无需构建）
git clone https://github.com/omdsh-dev/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install

# 2. 装进 web profile
dsh plugin --profile web add link:/path/to/dsh-ui-whale
#   或固定 tag 的 git 依赖：
#   dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:omdsh-dev/dsh-ui-whale#v0.3.5'
```

> 配置行（`$DSH_HOME/profiles/web/cordis.patch.yml`，热重载，无需重启）：
> ```yaml
> - insert:
>     - id: dsh-ui-whale
>       name: '@dsh-external/dsh-ui-whale'
> ```

## 提示词安装（让 DSH 自己装）

把下面这段提示词发给任意一个 DSH 会话，模型会替你完成安装：

> 帮我安装 dsh-ui-whale 插件（DSH 会话标题栏像素鲸鱼伙伴），步骤：
> 1. 执行 `dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:omdsh-dev/dsh-ui-whale#v0.3.6'`（首次可能被 pnpm 11 拦截 node-pty 构建脚本而失败）
> 2. 在 `~/.dsh/profiles/web` 下执行 `pnpm approve-builds --all`（放行构建脚本）
> 3. 再执行一次第 1 步的安装命令
> 4. 完成后提醒我硬刷新浏览器（Ctrl/Cmd+Shift+R）
> 遇到报错先查 https://github.com/omdsh-dev/dsh-ui-whale README 的常见问题/已知限制。

## 迁移指南（DSH 0.1.1-rc.1 → 0.1.2-alpha.1）

0.1.2-alpha.1 是面向插件作者的 alpha（不发布 npm），客户端 API 有破坏性重构，但官方保留 `ChatSnapshot.legacy` 兼容投影，本插件 v0.3.5 已完成迁移：

- **`@deepseek-ai/dsh-client-runtime` 包已移除**：`ClientContext` 改从 `@deepseek-ai/cordis` 导入（`import type { Context as ClientContext }`）。
- **`ConversationSnapshot` 重构为 views 架构**：旧字段 `partial`/`runningCalls` 移到 `ChatSnapshot.legacy` 兼容投影；会话生命周期字段（`running` 等）仍在新 `SessionSnapshot`。
- **组件 props**：`PropsRuntime` 经 `useSession`（生命周期）+ `useConversation`（ConversationSnapshot）双座读取；跨包 slot 注册改用 `ctx.slots.inject(name, () => ctx.slots.register(...))`。
- **插件作者迁移步骤**：① 替换 `ClientContext`/类型导入路径；② 读流式/工具状态改走 `useConversation → views.get('chat')?.legacy`；③ 会话生命周期改走 `useSession`；④ 注册改 `ctx.slots.inject`；⑤ 更新 `package.json` 的 `dsh.client.inject`（移除 `dsh-client-runtime`）与 `devDependencies` link。

## snapshot0810（v0.3.3）——profile 安装方式

```sh
# 1. 克隆仓库，构建产物已入库，无需构建
git clone https://github.com/omdsh-dev/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install

# 2. 装进 web profile（等价于在 $DSH_HOME/profiles/web 下执行 pnpm add）
dsh plugin --profile web add link:/path/to/dsh-ui-whale
#   或固定 tag 的 git 依赖：
#   dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:omdsh-dev/dsh-ui-whale#v0.3.3'
```

## snapshot0806（v0.3.2 / v0.3.1 / v0.3.0 / v0.2.0）——profile 安装方式

```sh
# 1. 克隆仓库，构建产物已入库，无需构建
git clone https://github.com/omdsh-dev/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install

# 2. 装进 web profile（等价于在 $DSH_HOME/profiles/web 下执行 pnpm add）
dsh plugin --profile web add link:/path/to/dsh-ui-whale
#   或固定 tag 的 git 依赖：
#   dsh plugin --profile web add '@dsh-external/dsh-ui-whale@github:omdsh-dev/dsh-ui-whale#v0.3.2'
```

配置行（`$DSH_HOME/profiles/web/cordis.patch.yml`，热重载，无需重启）：

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

## snapshot0806 —— registry 安装方式（可选通道）

前提：DSH 已集成 plugin-registry（`dsh registry` 命令可用；该集成为内部流程，本插件公开镜像不依赖它，公开安装走上文 profile 方式）。本插件的 `dsh.plugin.json` 清单已通过

```sh
# 目录安装（需要代码，克隆 + pnpm install 后）
dsh registry install /path/to/dsh-ui-whale
# 或 tarball 分发（接收方无需克隆）：
#   tar -czf dsh-ui-whale.tgz -C ./dsh-ui-whale .
#   dsh registry install dsh-ui-whale.tgz
dsh registry enable @dsh-external/dsh-ui-whale
```

## snapshot0805（v0.1.0）——旧安装方式

### 路径一：克隆 + link 装进 harness（推荐）

```sh
# 1. 克隆仓库，构建产物已入库，无需构建
git clone https://github.com/omdsh-dev/dsh-ui-whale.git
cd dsh-ui-whale && pnpm install

# 2. 让包装进 harness 依赖链（在 DSH 快照根目录，~/.dsh/source/current 指向的那个）
pnpm add -w link:/path/to/dsh-ui-whale
```

> 若你的 pnpm 因 store 版本不匹配拒绝 `pnpm add -w`，可手动 symlink 代替：
> `mkdir -p node_modules/@dsh-external && ln -s /path/to/dsh-ui-whale node_modules/@dsh-external/dsh-ui-whale`

### 路径二：git 依赖（固定 commit/tag，无隐式 latest）

```sh
# 在 harness 根目录执行；<commit> 为发布 commit（0805 用 tag v0.1.0）
pnpm add '@dsh-external/dsh-ui-whale@github:omdsh-dev/dsh-ui-whale#v0.1.0'
```

### 配置行（0805 旧机制）

`~/.dsh/config.yaml`（不存在则创建）：

```yaml
- insert:
    - id: dsh-ui-whale
      name: '@dsh-external/dsh-ui-whale'
```

## 重启 `dsh web`

插件集合变更按「重启生效」纪律（0805 旧机制下适用；0806 profile 方式配置行热重载，无需重启）。停掉当前 web（Ctrl+C）后重新启动。

## 验证

会话标题栏（标题行右侧）出现像素鲸鱼：空闲时眨眼/偶尔摆尾/动胸鳍；模型思考或工具运行时尾巴持续摆动、胸鳍持续扑动；一个回合完成时头顶喷出水花（单向 0-1-2-3-4-5-6）；点击鲸鱼时左上角冒出一颗从小变大的粉色爱心再消失（单向 0-1-2-3-0）。

## 演示

![dsh-ui-whale 完整演示](docs/dsh-ui-whale-demo.gif)

各动作 GIF：

<img src="docs/眨眼.gif" alt="眨眼" width="200"> <img src="docs/摆尾巴.gif" alt="摆尾巴" width="200"> <img src="docs/摆腹鳍.gif" alt="摆腹鳍" width="200">

<img src="docs/喷水花.gif" alt="喷水花" width="200"> <img src="docs/冒爱心.gif" alt="冒爱心" width="200"> <img src="docs/睡觉.gif" alt="睡觉" width="200">

> 完整视频：[docs/dsh-ui-whale-demo.mp4](docs/dsh-ui-whale-demo.mp4)
