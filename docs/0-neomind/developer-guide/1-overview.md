---
description: "NeoMind 开发指南总览：按角色选择学习路径（扩展开发 / 组件开发 / 设备类型 / 主项目贡献 / 集成商），四仓库地图、技术栈速查与全部文档入口。"
keywords: [NeoMind, 开发指南, 架构, crate, 仓库, SDK]
tags: [NeoMind, 开发指南]
sidebar_label: "Developer Guide Overview"
---

# 开发指南总览

NeoMind 是一个模块化生态，按**开发目标**分成四个独立仓库。本文帮你判断该从哪个仓库切入，并给出每个维度的深入入口。

:::tip 推荐用 AI 辅助开发
NeoMind 的代码库为 AI 编程工具（如 **Claude Code**）做了专门优化——项目自带 `CLAUDE.md` 上下文、33 节前端设计规范、27 个参考扩展实现。**无论你要写扩展、做组件还是贡献主项目，都建议先用 AI 辅助开发。** 详见 [AI 辅助开发指南](./5-ai-assisted-development.md)。
:::

## 按角色选路径

| 你是… | 推荐路径 | 预计投入 |
|-------|---------|---------|
| **扩展开发者**（接入新协议 / AI 模型 / 第三方系统） | [Extension SDK](./3-extension-sdk.md) → [扩展开发实战](./7-extension-development.md) → [案例研究](./case-studies/0-overview.md) 1–5 | 数天 |
| **组件开发者**（自定义可视化） | [组件开发](./8-dashboard-component-dev.md) → [案例 6：metric_card](./case-studies/6-metric-card-component.md) → [案例 7：NE101 相机](./case-studies/7-ne101-camera-component/index.md) | 1–2 天 |
| **设备接入者**（新传感器 / 新设备类型） | [设备类型开发](./6-device-type-development.md)（纯 JSON，最轻） | 半天 |
| **主项目贡献者** | [产品架构](./2-architecture.md) → [AI 辅助开发](./5-ai-assisted-development.md) → [贡献指南](./9-contributing.md) | 持续 |
| **集成商 / 运维**（把 NeoMind 接进现有系统） | [REST API](./4-rest-api.md) + [用户指南](../user-guide/1-install-setup.md) | 按需 |

> 先修知识：没装过 NeoMind？先过一遍 [五分钟快速开始](../quick-start/1-five-minute-guide.md)；遇到术语不确定，查[术语表](../concepts/1-glossary.md)。

## 先问自己：你要做什么？

```text
我要做什么？
│
├─ 给 NeoMind 加一种新设备 / 新的传感器指标
│   → 仓库：camthink-ai/NeoMind-DeviceTypes（纯 JSON）
│   → 详见：[设备类型开发](./6-device-type-development.md)
│
├─ 给 NeoMind 加一种新能力（AI 模型 / 视觉算法 / 第三方集成）
│   → 仓库：camthink-ai/NeoMind-Extensions（Rust，基于 Extension SDK）
│   → 详见：[Extension SDK](./3-extension-sdk.md) 与 [扩展开发实战](./7-extension-development.md)
│
├─ 做一个仪表板组件（图表 / 仪表盘 / 自定义可视化）
│   → 仓库：camthink-ai/NeoMind-Dashboard-Components（JS / React）
│   → 详见：[Dashboard 组件开发](./8-dashboard-component-dev.md)
│
└─ 给主项目贡献代码 / 修 Bug / 接入新的后端 API
    → 仓库：camthink-ai/NeoMind（Rust + React）
    → 详见：[产品架构](./2-architecture.md)、[REST API](./4-rest-api.md) 与 [贡献指南](./9-contributing.md)
```

## 仓库一览

| 仓库 | 语言 | 用途 | 二进制 / 产物 |
|------|------|------|--------------|
| **[NeoMind](https://github.com/camthink-ai/NeoMind)** | Rust + TypeScript | 核心平台（后端 + 前端 + Tauri 桌面） | `neomind` 服务、`neomind-extension-runner`、Web 前端 |
| **[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)** | Rust | 官方扩展市场（视觉 / 语音 / 流媒体 / 工业桥接等 27 个） | `.nep` 扩展包 |
| **[NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)** | JSON（+ 元数据） | 设备类型定义（129 个，指标 / 指令 / 默认配置） | JSON 类型文件 |
| **[NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)** | TypeScript / React | Dashboard 组件市场（6 个） | JS 组件包 |

## 技术栈速查

**主项目（NeoMind）**：

- 后端：Rust（edition 2021，工具链 1.92.0）、Tokio 异步运行时、Axum Web 框架、redb 嵌入式存储、serde 序列化
- 前端：React 18 + TypeScript + Vite + Zustand + Radix UI + Tailwind CSS
- 桌面：Tauri 2.x
- 协议：REST + WebSocket + SSE + MQTT 3.1.1

**扩展**：Rust，依赖 `neomind-extension-sdk` crate（0.6.x），通过 FFI 宏 `neomind_export!` 导出，运行在 `neomind-extension-runner` 提供的隔离进程中。

**设备类型**：声明式 JSON，无运行时代码——只描述有哪些指标（metric）、指令（command）、默认配置。NeoMind 加载后即生效。

**Dashboard 组件**：React 组件，遵循 Dashboard Component Registry 协议，通过动态加载注入仪表板画布。

## 各方向入口

### 设备类型开发 — 最轻的接入方式

设备类型是一个 JSON 文件，声明 `metrics`（指标）、`commands`（指令）与默认配置；提交 PR 合并后所有用户开箱即用。

> 完整字段说明、payload_template 命令模板与 129 个现有类型参考 → [设备类型开发](./6-device-type-development.md)

### 扩展开发 — 能力最强的接入方式

流程：SDK 模板创建 crate → 实现 `Extension` trait 并用 `neomind_export!` 导出 → 声明 capability（20 种内置或自定义）→（可选）打包 ML 模型 → 打包 `.nep` 安装。

> 前置 [Extension SDK](./3-extension-sdk.md)；完整教程 [扩展开发实战](./7-extension-development.md)；真实工程案例见 [案例研究](./case-studies/0-overview.md)。

### Dashboard 组件开发 — 自定义可视化

React 组件 + 配置 schema，可选绑定数据源与设备；用 ECharts / Recharts / 自绘 SVG 均可。

> manifest 字段、Props API 与安装流程 → [Dashboard 组件开发](./8-dashboard-component-dev.md)；进阶案例 [metric_card](./case-studies/6-metric-card-component.md) 与 [NE101 相机](./case-studies/7-ne101-camera-component/index.md)。

### 主项目开发

典型工作：修 Bug / 加 HTTP API（[REST API 参考](./4-rest-api.md)）/ 加 LLM 后端 / 改前端（务必先读 `web/DESIGN_SPEC.md`）。

**编译与运行**：

```bash
# 后端（端口 9375）
cargo run -p neomind-cli -- serve

# 前端开发服务器（端口 5173）
cd web && npm install && npm run dev

# 桌面应用
cd web && npm run tauri:dev
```

## 下一步

- 找不到该做哪个仓库？回看 [按角色选路径](#按角色选路径)
- 动手前建议先读 [AI 辅助开发指南](./5-ai-assisted-development.md)
- 准备贡献代码？直接跳 [贡献指南](./9-contributing.md)

---

*最后更新: 2026-09-08*
