---
description: "NeoMind 产品技术架构：crate 布局与依赖、主进程 + 扩展进程隔离模型、事件总线、扩展 FFI ABI、redb 存储层、Tokio 并发与信号量。"
keywords: [NeoMind, 架构, crate, 进程隔离, 事件总线, 存储, Tokio]
tags: [NeoMind, 开发指南]
sidebar_label: "Product Architecture"
---

# 产品架构

本文是 NeoMind 主项目（`camthink-ai/NeoMind`）的技术架构深度参考。读完后你应能定位任何功能在哪一层、哪个 crate，并理解进程与并发边界。

> 面向用户/决策者的非技术架构（产品由哪些部分组成、数据如何流动）见 [产品介绍 — 什么是 NeoMind](../product-overview/1-what-is-neomind.md)。

## 分层视图

```
┌──────────────────────────────────────────────────────────────┐
│                  Desktop App / Web UI                         │
│                   React 18 + TypeScript                       │
├──────────────────────────────────────────────────────────────┤
│                   Tauri 2.x / Browser                         │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST / WebSocket / SSE
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                        API Gateway                            │
│                     Axum Web Server                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ Auth   │ │Devices │ │Automate│ │Messages│ │Extension│   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │ Event Bus
          ┌──────────────┼──────────────┬────────────────┐
          ▼              ▼              ▼                ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐    ┌────────────┐
   │  Agent   │   │ Devices  │   │  Rules   │    │ Extensions │
   │ (LLM)   │   │  (MQTT)  │   │ (JSON)   │    │ (Process)  │
   └────┬─────┘   └────┬─────┘   └────┬─────┘    └─────┬──────┘
        │              │              │                │
        └──────────────┴──────┬───────┴────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   redb Storage   │
                    │  (time-series)   │
                    └──────────────────┘
```

## Crate 布局

NeoMind 是一个 Rust workspace。每个 crate 有清晰单一的责任：

| Crate | 职责 |
|-------|------|
| **neomind-core** | 核心 trait 与类型：`EventBus`、`DataSourceId`、`LLM` trait、能力探测 |
| **neomind-api** | Axum Web 服务器，HTTP / WebSocket / SSE handler，Swagger 在 `/api/docs` |
| **neomind-agent** | AI Agent：LLM 后端、工具调用、记忆系统、技能系统、调度器 |
| **neomind-devices** | 设备管理：MQTT / Webhook 适配器、设备注册、命令队列、草稿审批 |
| **neomind-storage** | redb 嵌入式存储：所有 `*.redb` 表的 schema 与访问层 |
| **neomind-messages** | 消息通知：7 个渠道（webhook/email/telegram/wecom/dingtalk/slack/feishu）+ 应用内 |
| **neomind-rules** | JSON 规则引擎：解析、执行、事件触发 |
| **neomind-extension-sdk** | 扩展 SDK：`neomind_export!` 宏、capability、ML 模型生命周期（公开 API） |
| **neomind-extension-runner** | 扩展进程宿主：隔离沙箱、FFI 桥、崩溃循环保护 |
| **neomind-data-push** | 数据推送：把遥测数据转发到外部 Webhook / MQTT |
| **neomind-cli** | 命令行入口（`neomind` 二进制） |
| **neomind-cli-ops** | CLI 命令实现：每个领域（device/rule/agent/...）一个模块，进程内分发 |

> **Tauri crate 在 workspace 外**：`web/src-tauri/` 是独立 Cargo 项目，通过 `edge_api::start_server()` 调用 neomind-api。改 neomind-api 的 re-export 时要同步检查 Tauri 是否还在用。

## 进程模型

NeoMind 运行时由**两类进程**组成：

### 1. 主进程（`neomind serve`）

唯一进程，承载所有核心功能：

- Axum HTTP / WS / SSE 服务（端口 9375）
- MQTT Broker（端口 1883，内嵌）
- 事件总线
- Agent 执行池
- 规则引擎
- 存储（redb）

### 2. 扩展进程（每个扩展一个）

由 `neomind-extension-runner` 启动并监管：

- 每个扩展独立 OS 进程，进程级隔离
- 通过 FFI（C ABI）与主进程通信
- **崩溃不影响主进程**：runner 有崩溃循环保护，连续崩溃的扩展会被自动禁用
- Capability 受控：扩展启动时声明所需能力（网络、文件系统、ML 模型），runner 按声明授权

```
┌─────────────────────────┐
│      主进程 (neomind)    │
│  ┌───────────────────┐  │
│  │ extension-runner  │──┼──→ 进程 A (weather)
│  │   (监管子模块)     │──┼──→ 进程 B (yolo-video)
│  └───────────────────┘──┼──→ 进程 C (ocr)
│         ↑ FFI           │
│      主进程内的          │
│   ExtensionProxy        │
└─────────────────────────┘
```

## 事件总线

`neomind-core::event_bus` 是组件解耦的神经系统。所有跨模块通信走事件，不直接 import 对方：

| 事件源 | 事件 | 订阅者 |
|--------|------|--------|
| 设备 MQTT 数据 | `DeviceDataReceived` | 规则引擎、数据推送、仪表板 WS |
| 规则触发 | `RuleTriggered` | 消息通知、Agent |
| Agent 完成 | `AgentExecutionCompleted` | 记忆系统、消息通知 |
| 扩展 metric | `ExtensionMetric` | 存储、仪表板 |
| 系统状态变化 | `SystemEvent` | 应用内消息中心 |

发布订阅模型，多订阅者并行触发，单订阅者内串行处理。

## 扩展 ABI

扩展用 Rust 写，但**编译产物与主进程是两个二进制**，靠 FFI 桥接：

- `neomind_export!` 宏（在 SDK 里）：把 `ExtensionHandler` trait impl 自动导出为 C ABI 入口（`extern "C"` 函数）
- runner 加载扩展二进制 → 调用约定入口 → 包装成 `ExtensionProxy` 注册到主进程
- 数据用 serde JSON 序列化跨 FFI 边界（metric、command、配置）

**Capability 系统**：扩展在 metadata 里声明 `capabilities: ["network", "filesystem:read", "ml-model"]`，runner 在 spawn 时按声明开启 sandbox 权限。未声明的能力调用会被拒。

详细 macro 用法与生命周期见 [Extension SDK](./3-extension-sdk.md)。

## 存储层

NeoMind 用 **redb**（纯 Rust 嵌入式 KV 数据库，类似 lmdb）。所有数据在 `data/` 目录下：

| 表 | 内容 |
|----|------|
| `telemetry.redb` | **时序遥测**（所有设备的指标历史）。这是最大的表，按 (device_id, metric, timestamp) 索引 |
| `devices.redb` | 设备注册表（id、name、type、adapter、config） |
| `dashboards.redb` | 仪表板定义（布局、组件配置） |
| `rules.redb` | 规则定义（JSON 配置、启用状态） |
| `agents.redb` | Agent 定义（prompt、schedule、resources） |
| `messages.redb` | 消息投递记录 |
| `sessions.redb` | AI Chat 会话历史 |
| `llm_backends.redb` | LLM 后端配置 |
| `settings.redb` | 系统设置 |
| `users.redb` / `api_keys.redb` | 用户与 API Key |
| `extensions.redb` | 已安装扩展清单 |
| `instances.redb` | 多实例后端注册 |

**无外部数据库**。备份 = 停服 + 拷贝 `data/` 目录。迁移到新机器相同路径即可。

存储访问全部经 `neomind-storage` crate 的 repository 模式，不允许其他 crate 直接打开 redb 表。

## 并发与线程模型

**Tokio 异步运行时**，多线程调度器。

**并发上限**（防止雪崩）：

| 信号量 | 上限 | 作用域 |
|--------|------|--------|
| 全局执行信号量 | 10 | 整个主进程同时运行的 Agent 执行数 |
| 每 LLM 后端信号量 | 2 | 同一后端并发请求数（防 429） |
| 工具并发信号量 | 6 | 同时运行的工具调用数 |

**Agent 执行保护**：

- 全局 5 分钟（300s）超时，包整个 `execute_internal`
- RAII `StatusGuard`：无论 panic / 超时 / drop，状态都会从 `Executing` 复位为 `Active`，防止卡死
- 调度器跳过的执行（并发上限内未抢到）不推进 `next_execution`，下一 tick 重试

**WebSocket / SSE**：每个前端连接一个 task，订阅事件总线，断开后自动重连与补数据。

## 关键不变量（写代码时牢记）

- **后端 snake_case / 前端 camelCase**：所有 API 响应必须经 `fromDashboardDTO()`（`web/src/store/persistence/types.ts`）转换。新代码从 API 加载仪表板必须用这个函数。
- **Ollama 用 `/api/chat`**，不是 `/v1/chat/completions`。
- **DataSourceId 格式**：`{type}:{id}:{field}`，解析与生成都在 `neomind-core`。
- **多模态能力层次**：用户覆盖 > 运行时探测 > LiteLLM 注册表 > 启发式 > false（详见 memory 与 `crates/neomind-core/src/llm/registry.rs`）。
- **扩展组件渲染**：不要给 `ComponentRenderer` 加 `mountedRef` 模式（React 18 StrictMode 双挂载会断）；不要在 `renderDashboardComponent` 里包 ErrorBoundary。

## 下一步

- 写扩展 → [Extension SDK](./3-extension-sdk.md) + [扩展开发实战](./7-extension-development.md)
- 加 HTTP API → [REST API 参考](./4-rest-api.md)
- 调代码 → 各 crate 的 `lib.rs` 顶部注释与 `docs/guides/` 对应模块文档

---

*最后更新: 2026-06-15*
