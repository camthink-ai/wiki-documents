---
description: "NeoMind 开发指南总览：按设备类型、扩展、Dashboard 组件、主项目四个仓库维度切入，含技术栈、crate 布局与各文档入口。"
keywords: [NeoMind, 开发指南, 架构, crate, 仓库, SDK]
tags: [NeoMind, 开发指南]
sidebar_label: "Developer Guide Overview"
---

# 开发指南总览

NeoMind 是一个模块化生态，按**开发目标**分成四个独立仓库。本文帮你判断该从哪个仓库切入，并给出每个维度的深入入口。

:::tip 推荐用 AI 辅助开发
NeoMind 的代码库为 AI 编程工具（如 **Claude Code**）做了专门优化——项目自带 `CLAUDE.md` 上下文、33 节前端设计规范、16 个参考扩展实现。**无论你要写扩展、做组件还是贡献主项目，都建议先用 AI 辅助开发。** 详见 [AI 辅助开发指南](./5-ai-assisted-development.md)。
:::

## 先问自己：你要做什么？

```
我要做什么？
│
├─ 给 NeoMind 加一种新设备 / 新的传感器指标
│   → 仓库：camthink-ai/NeoMind-DeviceTypes（JS / JSON）
│   → 详见：本文 §设备类型开发
│
├─ 给 NeoMind 加一种新能力（AI 模型 / 视觉算法 / 第三方集成）
│   → 仓库：camthink-ai/NeoMind-Extensions（Rust，基于 Extension SDK）
│   → 详见：扩展开发（./7-extension-development.md）与 Extension SDK（./3-extension-sdk.md）
│
├─ 做一个仪表板组件（图表 / 仪表盘 / 自定义可视化）
│   → 仓库：camthink-ai/NeoMind-Dashboard-Components（JS / React）
│   → 详见：本文 §Dashboard 组件开发
│
└─ 给主项目贡献代码 / 修 Bug / 接入新的后端 API
    → 仓库：camthink-ai/NeoMind（Rust + React）
    → 详见：产品架构（./2-architecture.md）与 REST API（./4-rest-api.md）
```

## 仓库一览

| 仓库 | 语言 | 用途 | 二进制 / 产物 |
|------|------|------|--------------|
| **[NeoMind](https://github.com/camthink-ai/NeoMind)** | Rust + TypeScript | 核心平台（后端 + 前端 + Tauri 桌面） | `neomind` 服务、`neomind-extension-runner`、Web 前端 |
| **[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)** | Rust | 官方扩展市场（天气 / YOLO / OCR / 人脸 / 流媒体 / 集成桥） | `.nep` 扩展包 |
| **[NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)** | JSON（+ 元数据） | 设备类型定义（指标 / 指令 / 默认配置） | JSON 类型文件 |
| **[NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)** | TypeScript / React | Dashboard 组件市场 | JS 组件包 |

## 技术栈速查

**主项目（NeoMind）**：

- 后端：Rust（edition 2021，工具链 1.92.0）、Tokio 异步运行时、Axum Web 框架、redb 嵌入式存储、serde 序列化
- 前端：React 18 + TypeScript + Vite + Zustand + Radix UI + Tailwind CSS
- 桌面：Tauri 2.x
- 协议：REST + WebSocket + SSE + MQTT 3.1.1

**扩展**：Rust，依赖 `neomind-extension-sdk` crate（最新 v0.6.3），通过 FFI 宏 `neomind_export!` 导出，运行在 `neomind-extension-runner` 提供的隔离进程中。

**设备类型**：声明式 JSON，无运行时代码——只描述有哪些指标（metric）、指令（command）、默认配置。NeoMind 加载后即生效。

**Dashboard 组件**：React 组件，遵循 Dashboard Component Registry 协议，通过动态加载注入仪表板画布。

## 设备类型开发

**仓库**：`camthink-ai/NeoMind-DeviceTypes`

设备类型是一个 JSON 文件，声明：

- `metrics`：设备会产生的指标（名称、显示名、数据类型、单位）
- `commands`：可下发的指令（名称、参数 schema）
- `defaults`：默认配置（图标、轮询周期等）

**典型场景**：你接入了一种新传感器，想让所有用户开箱即用——提交一个 PR 把类型定义加到仓库，合并后所有人 `neomind device types list` 都能看到。

**示例**（简化）：

```json
{
  "name": "temp_humidity_sensor",
  "display_name": "温湿度传感器",
  "metrics": [
    {"name": "temperature", "display_name": "温度", "data_type": "Float", "unit": "°C"},
    {"name": "humidity", "display_name": "湿度", "data_type": "Float", "unit": "%"}
  ],
  "commands": []
}
```

详细字段与提交规范见仓库 README。

## 扩展开发

**仓库**：`camthink-ai/NeoMind-Extensions`（社区扩展也提 PR 到这里）

**前置**：先读 [Extension SDK](./3-extension-sdk.md) 理解 `neomind_export!` 宏、capability 系统、ML 模型生命周期与跨平台打包。

**流程概览**（详见 [扩展开发实战](./7-extension-development.md)）：

1. 用 SDK 模板创建 crate
2. 实现 `Extension` trait，用 `neomind_export!` 导出
3. 声明 capability（`network`、`filesystem`、`ml-model` 等）
4. （可选）打包 ML 模型，使用 lazy-load 生命周期
5. `cargo build --release` 后打包成 `.nep`
6. 上传到 NeoMind 的 Extensions 页，或提交到 Extensions 仓库

## Dashboard 组件开发

**仓库**：`camthink-ai/NeoMind-Dashboard-Components`

Dashboard 组件是一个 React 组件，实现 Dashboard Component Registry 协议：

- 声明 `componentType`（唯一标识）、配置 schema（用户在 UI 上填什么）
- 渲染时收到 `dataSource`（DataSourceId）、`config`（用户配置）、`data`（实时数据）
- 用 ECharts / Recharts / 自绘 SVG 都行

**典型场景**：内置组件库没有你需要的可视化（如热力图、地图、3D 仪表）。

**流程**：参考仓库模板创建组件 → 本地 Vite 开发 → 发布到市场 → 在 NeoMind 里安装。

## 主项目开发

**仓库**：`camthink-ai/NeoMind`

**前置**：读 [产品架构](./2-architecture.md) 理解 crate 依赖、进程模型、事件总线、扩展 ABI、存储层。

**典型工作**：

- 修 Bug、改逻辑 → 找到对应 crate（如设备相关在 `neomind-devices`、规则在 `neomind-rules`）
- 加新的 HTTP API → 在 `neomind-api` 加 handler，参考 [REST API 参考](./4-rest-api.md)
- 加新的 LLM 后端 → 在 `neomind-agent/src/llm_backends/` 加 backend 实现
- 改前端 → `web/src/` 下对应模块（务必先读 `web/DESIGN_SPEC.md`）

**编译与运行**：

```bash
# 后端（端口 9375）
cargo run -p neomind-cli -- serve

# 前端开发服务器（端口 5173）
cd web && npm install && npm run dev

# 桌面应用
cd web && npm run tauri:dev
```

---

*最后更新: 2026-06-16*
