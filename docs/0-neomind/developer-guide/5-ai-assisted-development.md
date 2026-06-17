---
description: "用 Claude Code 等 AI 编程工具高效开发 NeoMind 扩展、仪表板组件和贡献主项目：项目上下文配置、扩展开发工作流、组件开发工作流、Prompt 模式与实战示例。"
keywords: [NeoMind, Claude Code, AI 编程, 扩展开发, 组件开发, Copilot]
tags: [NeoMind, 开发指南]
sidebar_label: "AI-Assisted Development"
---

# AI 辅助开发指南

NeoMind 的代码库从第一天起就为 **AI 辅助编程**而设计——结构清晰的 crate 分层、项目级的 `CLAUDE.md` 上下文文件、33 节前端设计规范、以及专门的扩展开发技能（Skill）。本文教你如何用 **Claude Code**（或任何支持项目上下文的 AI 编程工具）把开发效率拉满。

> **核心理念**：你不需要读完所有源码才能动手。把仓库 clone 下来，用 AI 工具打开，用自然语言描述你要做什么——AI 会帮你探索代码、生成实现、跑测试。

## 为什么 NeoMind 适合 AI 开发？

| 设计决策 | 对 AI 的好处 |
|----------|-------------|
| **项目级 `CLAUDE.md`** | AI 打开项目就自动读取技术栈、命令、架构规则、代码约定——零配置 |
| **`web/DESIGN_SPEC.md`（33 节）** | 前端开发时 AI 自动遵守颜色系统、组件规范、无障碍标准 |
| **Crate 化分层** | `neomind-devices`、`neomind-rules`、`neomind-extension-sdk`…AI 能精确定位目标模块 |
| **真实扩展代码库** | 16 个官方扩展是现成的参考实现——AI 可以直接读代码学模式 |
| **CLI 优先架构** | `neomind widget create`、`neomind extension install`…AI 用 CLI 就能完成构建-测试-安装闭环 |
| **强类型 Rust + TypeScript** | 编译器是 AI 的即时验证——生成代码对不对，编译一下就知道 |

## 快速上手（5 分钟）

### Step 1：安装 Claude Code

```bash
# 安装 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 验证
claude --version
```

### Step 2：Clone 你要开发的仓库

```bash
# 扩展开发 → clone 扩展仓库
git clone https://github.com/camthink-ai/NeoMind-Extensions.git
cd NeoMind-Extensions

# 或组件开发 → clone 组件仓库
git clone https://github.com/camthink-ai/NeoMind-Dashboard-Components.git
cd NeoMind-Dashboard-Components

# 或主项目开发 → clone 主仓库
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind
```

### Step 3：用 Claude Code 打开项目

```bash
claude
```

Claude Code 会自动读取项目根目录的 `CLAUDE.md`（如果存在），获取技术栈、构建命令、代码约定等上下文。NeoMind 主仓库自带 `CLAUDE.md`，打开即用。

### Step 4：开始对话

```
> 帮我创建一个 Modbus 扩展，读取保持寄存器并作为 metric 暴露
```

Claude Code 会：探索现有扩展代码 → 参考类似实现 → 生成代码 → 运行编译验证。

## 项目上下文：CLAUDE.md

`CLAUDE.md` 是 NeoMind 主仓库根目录的项目指令文件。Claude Code 打开项目时**自动加载**，无需手动操作。

它包含 AI 需要知道的关键信息：

| 部分 | 内容 | AI 用它来做什么 |
|------|------|----------------|
| **Tech Stack** | Rust / React 18 / Tauri 2.x | 选择正确的语言和框架 |
| **Development Commands** | `cargo build`、`npm run dev`、`npm run tauri:dev` | 知道怎么编译、测试、运行 |
| **Project Structure** | crates/ 下各模块职责 | 定位目标代码位置 |
| **Key Rules** | Ollama 用 `/api/chat`、DataSourceId 格式、Tauri API base | 避免常见陷阱 |
| **Code Conventions** | Rust fmt/clippy、Zustand slices 模式、DESIGN_SPEC.md | 遵循项目编码规范 |
| **Frontend Design Standards** | 33 节设计规范索引 | 生成符合设计系统的前端代码 |

> **扩展仓库和组件仓库**目前没有 `CLAUDE.md`。建议开发前让 AI 先读 `docs/guides/en/extension-system.md` 或对应的技术文档来建立上下文：
> ```
> > 先读 docs/guides/en/extension-system.md 理解扩展架构，然后帮我创建...
> ```

## 工作流一：用 AI 开发扩展

扩展是 NeoMind 生态最常见的发展方向。用 AI 开发扩展的标准流程：

### 1. 描述需求

```
> 我要做一个 OPC UA 桥接扩展。
> 功能：连接 OPC UA 服务器，订阅指定节点的值变化，
> 将值作为 metric 暴露给 NeoMind 仪表板。
> 参考已有的 modbus-bridge 扩展的代码结构。
```

### 2. AI 探索与生成

Claude Code 会：
- 读取 `modbus-bridge` 的代码作为参考模式
- 创建项目结构（`Cargo.toml` + `src/lib.rs` + `manifest.json`）
- 实现 `Extension` trait（`new`、`metadata`、`start`、`stop`、metric 发布）
- 用 `neomind_export!()` 宏导出 FFI 入口
- 运行 `cargo build --release` 验证编译

### 3. 调试与迭代

```
> 编译报错了，看看是什么问题
> 加一个 connect 命令，让 Agent 可以触发连接
> metric 的单位标错了，应该是摄氏度不是华氏度
```

### 4. 打包与安装

```
> 帮我打包成 .nep 并安装到本地 NeoMind 测试
```

AI 会运行跨平台编译脚本，生成 `.nep` 包，然后通过 `neomind extension install` 安装。

### 参考实现

NeoMind-Extensions 仓库有 **16 个官方扩展**可直接参考：

| 扩展 | 适合参考的场景 |
|------|---------------|
| `weather-forecast-v2` | HTTP API 调用 + metric 发布 |
| `yolo-device-inference` | ML 模型加载 + 推理命令 |
| `modbus-bridge` | 工业协议桥接 |
| `opcua-bridge` | OPC UA 协议接入 |
| `image-analyzer-v2` | 图片处理 + 分析命令 |
| `yolo-video-v2` | 视频流处理 + 流式推理 |
| `homeassistant-bridge` | 第三方平台集成 |
| `face-recognition` | 计算机视觉 + 组件 |

> **Prompt 技巧**：让 AI 参考**最接近你需求**的现有扩展。例如做 BACnet 桥接，参考 `modbus-bridge`；做车牌识别，参考 `yolo-device-inference`。

### 扩展开发 Skill

NeoMind 内置了扩展开发技能文件（`crates/neomind-agent/src/skills/builtins/extension-development.md`），包含：
- 完整的 Rust 代码模板（所有 trait 方法）
- 状态管理模式（Atomic / RwLock / Mutex）
- HTTP 请求模式（`ureq` 同步库）
- 扩展类型分类（tool / connector / processor / analyzer / bridge）
- 常见错误与解决方案

让 AI 读这个文件可以快速进入状态：

```
> 读 crates/neomind-agent/src/skills/builtins/extension-development.md，
> 然后按里面的模板帮我创建扩展
```

## 工作流二：用 AI 开发仪表板组件

仪表板组件是 React 组件，遵循 Dashboard Component Registry 协议。

### 1. 用 CLI 脚手架创建

```bash
# 先用 NeoMind CLI 创建骨架
neomind widget create "温度热力图" --widget-type custom
```

### 2. 用 Claude Code 实现组件

```
> 帮我实现这个仪表板组件。
> 功能：接收 dataSource 的温度数据，渲染为热力图。
> 必须遵守 web/DESIGN_SPEC.md 的颜色系统（只用 design token）。
> 用 ECharts 的 heatmap 图表类型。
```

Claude Code 会：
- 读取 `DESIGN_SPEC.md` 第 1 节（Color System）和第 30 节（Data Visualization）
- 生成 `manifest.json`（组件声明 + 配置 schema）
- 生成 `bundle.js`（IIFE 格式的 React 组件）
- 使用 CSS 变量（`var(--color-*)`）而非硬编码颜色

### 3. 本地开发与预览

```bash
# Vite 开发服务器热更新
npm run dev
```

### 4. 安装到 NeoMind

```bash
neomind widget install ./dist
```

> **关键**：始终让 AI 读 `DESIGN_SPEC.md`。这个 33 节规范覆盖了颜色系统、对话框、加载状态、表单、无障碍等所有前端标准。AI 读完后生成的代码天然符合项目设计语言。

## 工作流三：用 AI 贡献主项目

### 场景 A：修 Bug

```
> 设备列表在移动端不显示状态图标。
> 找到相关组件，定位问题，修复它。
```

Claude Code 会搜索 `web/src/components/` 找到 DeviceList 组件，分析渲染逻辑，定位 CSS/逻辑问题，修复并验证。

### 场景 B：加 API 端点

```
> 加一个 API 端点 GET /api/devices/:id/history，
> 返回指定设备最近 24 小时的遥测数据。
> 参考 neomind-api/src/handlers/ 下现有的 handler 模式。
```

### 场景 C：加 LLM 后端

```
> 我想接入一个新的 LLM 后端（xx 面板的 API）。
> 参考 crates/neomind-agent/src/llm_backends/ 下现有的 backend 实现。
```

AI 会参考 `openai.rs` 或 `ollama.rs` 的模式，实现 trait、注册到 instance manager、加 API handler。

### 场景 D：探索不熟悉的模块

```
> 我不熟悉 neomind-rules 的代码。帮我梳理规则引擎的执行流程，
> 从 API 接收到规则触发到执行 action 的完整链路。
```

Claude Code 会逐文件追踪调用链，给出带文件路径和行号的流程图。

## Prompt 模式速查

| 场景 | 推荐 Prompt |
|------|------------|
| **创建扩展** | 「参考 `{similar-extension}` 的结构，创建一个 `{feature}` 扩展，实现 `{capability}`」 |
| **创建组件** | 「遵守 `DESIGN_SPEC.md`，用 `{library}` 实现一个 `{visualization}` 组件」 |
| **修 Bug** | 「`{症状描述}`。找到相关代码，定位根因，修复」 |
| **加功能** | 「参考 `{existing-pattern}` 的模式，加一个 `{feature}`」 |
| **探索代码** | 「帮我梳理 `{module}` 的执行流程，从 `{入口}` 到 `{终点}`」 |
| **代码审查** | 「审查这段代码有没有安全问题、性能问题、不符合 `CLAUDE.md` 约定的地方」 |
| **跨平台编译** | 「帮我编译扩展到 6 个平台（linux/darwin/windows × amd64/arm64）」 |

## 最佳实践

### DO

- **先让 AI 探索再动手**：复杂的改动先说「帮我理解这部分代码的结构」，确认 AI 理解正确后再让它改
- **用现有代码做参考锚点**：「参考 `modbus-bridge` 的结构」比从零描述需求效果好 10 倍
- **小步迭代**：一次改一个功能点，编译验证后再继续，而不是一次性生成整个项目
- **用编译器当验证**：Rust 和 TypeScript 有强类型系统——让 AI 生成代码后立刻编译，报错信息是最好的迭代反馈

### DON'T

- **不要跳过 CLAUDE.md**：如果仓库没有，先创建一个，写清楚构建命令和约定——这是 AI 理解项目的关键
- **不要让 AI 猜 API 格式**：让 AI 先读 `docs/guides/en/14-api.md` 或 Swagger 文档，再写集成代码
- **不要在前端用硬编码颜色**：让 AI 读 `DESIGN_SPEC.md` 第 1 节，只用 design token 类名

## 为自己的仓库配置 AI 上下文

如果你在开发**自己的扩展或组件**（不在官方仓库里），创建一个 `CLAUDE.md` 来帮助 AI 理解你的项目：

```markdown
# My Custom Extension

## Build
cargo build --release

## Test
# 安装到本地 NeoMind 测试
neomind extension install ./target/release/my-extension.nep

## Conventions
- metric 名用 snake_case
- 命令参数用 JSON
- 参考 NeoMind-Extensions/weather-forecast-v2 的代码风格
```

这样 Claude Code 打开你的项目就知道怎么构建、测试、以及参考哪个现有实现。

## 工具生态

| 工具 | 用途 |
|------|------|
| **Claude Code** | 项目级 AI 编程，支持代码探索、编辑、终端命令、多文件改动 |
| **`neomind widget create`** | 仪表板组件脚手架 |
| **`neomind extension install`** | 扩展安装与测试 |
| **`cargo build --release`** | Rust 扩展编译 |
| **Swagger UI** (`/api/docs`) | API 文档——让 AI 读这个了解端点格式 |

## 下一步

- **[扩展开发实战](./7-extension-development.md)** — 从零写一个扩展的完整教程
- **[Dashboard 组件开发](./8-dashboard-component-dev.md)** — 组件协议、打包、安装全流程
- **[Extension SDK 参考](./3-extension-sdk.md)** — trait 签名、capability 系统、ML 模型生命周期
- **[产品架构](./2-architecture.md)** — crate 分层、进程模型、事件总线（贡献主项目必读）

---

*最后更新: 2026-06-16*
