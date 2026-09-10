---
description: "NeoMind technical architecture deep dive: crate layout and dependencies, main process + extension process isolation, event bus, extension FFI ABI, redb storage layer, Tokio concurrency and semaphores."
keywords: [NeoMind, architecture, crate, process isolation, event bus, storage, Tokio]
tags: [NeoMind, Developer Guide]
---

# Product Architecture

This is the technical architecture reference for the NeoMind main project (`camthink-ai/NeoMind`). After reading it you should be able to locate any feature by layer and crate, and understand the process and concurrency boundaries.

> For the non-technical, user-facing view (what the product is made of, how data flows), see [Product Overview — What is NeoMind](../product-overview/1-what-is-neomind.md).

## Layered View

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

## Crate Layout

NeoMind is a Rust workspace. Each crate has a single, clear responsibility:

| Crate | Responsibility |
|-------|----------------|
| **neomind-core** | Core traits and types: `EventBus`, `DataSourceId`, `LLM` trait, capability detection |
| **neomind-api** | Axum web server, HTTP / WebSocket / SSE handlers, route definitions centralized in `src/server/router.rs` |
| **neomind-agent** | AI agent: LLM backends, tool calling, memory system, skill system, scheduler |
| **neomind-devices** | Device management: MQTT / webhook adapters, registration, command queue, draft approval |
| **neomind-storage** | redb embedded storage: schema and access layer for all `*.redb` tables |
| **neomind-messages** | Message notification: 7 external channel types (webhook/email/telegram/wecom/dingtalk/slack/feishu) + the in-app message center |
| **neomind-rules** | JSON rule engine: parse, execute, event trigger |
| **neomind-extension-sdk** | Extension SDK: `neomind_export!` macro, capability, ML model lifecycle (public API surface) |
| **neomind-extension-runner** | Extension process host: isolated sandbox, FFI bridge, crash-loop protection |
| **neomind-data-push** | Data push: forward telemetry to external webhook / MQTT |
| **neomind-cli** | CLI entry point (the `neomind` binary) |
| **neomind-cli-ops** | CLI command implementations: one module per domain (device/rule/agent/...), dispatched in-process |

> **The Tauri crate is outside the workspace**: `web/src-tauri/` is a separate Cargo project that calls neomind-api via `edge_api::start_server()`. When you change neomind-api's re-exports, verify Tauri still compiles.

## Process Model

NeoMind at runtime consists of **two process classes**:

### 1. Main Process (`neomind serve`)

A single process hosting all core functionality:

- Axum HTTP / WS / SSE server (port 9375)
- MQTT broker (port 1883, embedded)
- Event bus
- Agent execution pool
- Rule engine
- Storage (redb)

### 2. Extension Processes (one per extension)

Spawned and supervised by `neomind-extension-runner`:

- Each extension runs in its own OS process — full process-level isolation
- The extension dynamic library (`.so` / `.dylib` / `.dll`) is loaded in-process by the runner via FFI (C ABI); the runner then talks to the main process over stdin/stdout JSON IPC
- **A crash doesn't affect the main process**: the runner has crash-loop protection (auto-restart + max retry count + cooldown) and stops restarting once the retry limit is reached
- Capability-gated: the extension declares required capabilities via the SDK's `ExtensionCapability` (including `Custom` names); calls to undeclared capabilities are rejected, and the runner additionally applies resource limits (memory / CPU) to the extension process

```
┌─────────────────────────┐
│     Main (neomind)       │
│  ┌───────────────────┐  │
│  │ extension-runner  │──┼──→ Process A (weather)
│  │  (supervisor)     │──┼──→ Process B (yolo-video)
│  └───────────────────┘──┼──→ Process C (ocr)
│         ↑ FFI           │
│   ExtensionProxy        │
│   inside main           │
└─────────────────────────┘
```

## Event Bus

`neomind-core::event_bus` is the nervous system that decouples components. All cross-module communication flows through events — modules never import each other directly. The `NeoMindEvent` enum (`crates/neomind-core/src/event.rs`) has **45 variants**, grouped by domain:

| Domain | Events (`NeoMindEvent` variants) | Typical subscribers |
|----|------|--------|
| Devices | `DeviceOnline` / `DeviceOffline` / `DeviceTransportOnline` / `DeviceTransportOffline` / **`DeviceMetric`** / `DeviceCommandResult` / `DeviceDiscovered` | Rule engine, data push, dashboard WS, auto-onboarding |
| Rules | `RuleEvaluated` / `RuleTriggered` / `RuleExecuted` | Notifications, audit |
| Alerts & messages | `AlertCreated` / `AlertAcknowledged` / `MessageCreated` / `MessageAcknowledged` / `MessageResolved` | In-app message center, notification channels, Agent |
| IM | `ImMessageReceived` | IM bridge sessions |
| Agent | `AgentExecutionStarted` / `AgentThinking` / `AgentDecision` / `AgentProgress` / `AgentExecutionCompleted` / `AgentMemoryUpdated` / `AgentStreamChunk` / `AgentStreamEnd` | Memory system, notifications, Chat SSE |
| LLM decision loop | `PeriodicReviewTriggered` / `LlmDecisionProposed` / `LlmDecisionExecuted` | Agent decision execution |
| Tools | `ToolExecutionStart` / `ToolExecutionSuccess` / `ToolExecutionFailure` | Agent process display |
| Extensions | `ExtensionOutput` / `ExtensionLifecycle` / `ExtensionCommandStarted` / `ExtensionCommandCompleted` / `ExtensionCommandFailed` | Storage, dashboards |
| System | `ModelDownloadProgress` / `SystemUpgradeProgress` / `DashboardUpdated` / `DataChanged` / `UserMessage` / `LlmResponse` / `Custom` | Frontend event stream (SSE/WS) |

**Subscription semantics**: pub/sub — multiple subscribers fire in parallel; within a single subscriber, events are processed sequentially. A slow subscriber causes events to be dropped (observable via `neomind_eventbus_dropped_total` on `/api/metrics`) — never do slow work inside a subscriber; `spawn` first.

**The one event that drives everything**: `DeviceMetric` is the primary event — every device data write (MQTT / Webhook / extension virtual metrics) publishes it, powering the rule engine, data push, and dashboard WebSockets.

<details>
<summary>Full enum definition</summary>

```rust
// crates/neomind-core/src/event.rs
pub enum NeoMindEvent { /* 45 variants, serialized by variant name */ }
```

The variant names are authoritative: update this table when adding events.
</details>

## Lifecycle of One Data Write

Take "a LoRaWAN temperature sensor reports 23.5°C" through the whole architecture:

```text
MQTT message arrives (rmqtt, :1883)
  → neomind-devices adapter parses + matches device (unknown → draft/auto-onboard)
  → written to neomind-storage (telemetry.redb, second-precision timestamps)
  → publishes NeoMindEvent::DeviceMetric on the event bus
      ├→ neomind-rules: evaluates all matching rules immediately (>30°C → notify action)
      ├→ transforms (neomind-api automation): input unwrap → JS pipeline → derived metrics re-stored
      ├→ neomind-data-push: matches push targets → external Webhook / MQTT
      └→ dashboard WebSocket: pushed in real time to subscribed charts
```

Understanding this path explains most behavior: why rules evaluate "on write" (event-driven), why transforms read already-stored data, and why dashboards never poll.

## Extension Load Sequence

The full sequence from `.nep` to usable (`neomind-core/src/extension/loader/isolated.rs`):

```text
Install: upload/market download → unpack & validate (zip layout + ABI 3 + platform binary) → extensions/<id>/
Start: API spawn → neomind-extension-runner child process
  → runner dlopens the platform binary → checks neomind_extension_abi_version() == 3
  → JSON bridge handshake (hello → capabilities → descriptor)
  → main process registers extension metrics/commands/components → state Running
Crash: process exit / hang (liveness Ping timeout) → auto-restart (up to 3×, 5s apart)
  → limit reached → state Crashed, auto-restart stops, alert via notification channels
```

## Extension ABI

Extensions are written in Rust but **compile to a separate binary** from the main process, bridged by FFI:

- The `neomind_export!` macro (in the SDK) auto-generates C ABI entry points (`extern "C"` functions such as `neomind_extension_abi_version` / `neomind_extension_metadata` / `neomind_extension_execute_command_json`) from your `Extension` trait impl
- The main process's isolated loader spawns the runner process → the runner loads the extension dynamic library and invokes the agreed entry points → the main process wraps all communication with the extension process in an `ExtensionProxy` (`neomind-core::extension::proxy`)
- Data crosses the FFI / IPC boundary as serde JSON (metrics, commands, config)

**Capability system**: the extension declares required capabilities via the SDK's `ExtensionCapability` enum (20 built-ins + `Custom(String)` names such as `network` / `filesystem:read` / `ml-model`); the platform validates every capability call at runtime and rejects undeclared ones. The runner additionally applies resource limits to the extension process (memory cap / CPU affinity / nice level, see the runner's `resource_limits.rs`).

See [Extension SDK](./3-extension-sdk.md) for macro usage and lifecycle.

## Storage

NeoMind uses **redb** (a pure-Rust embedded KV store, lmdb-like). All data lives under `data/`:

| Table | Contents |
|-------|----------|
| `telemetry.redb` | **Time-series telemetry** (every device's metric history). Largest table, indexed by (device_id, metric, timestamp) |
| `devices.redb` | Device registry (id, name, type, adapter, config) |
| `dashboards.redb` | Dashboard definitions (layout, widget config) |
| `rules.redb` | Rule definitions (JSON config, enabled state) |
| `agents.redb` | Agent definitions (prompt, schedule, resources) |
| `messages.redb` | Message delivery records |
| `sessions.redb` | AI Chat session history |
| `llm_backends.redb` | LLM backend config |
| `settings.redb` | System settings |
| `users.redb` / `api_keys.redb` | Users and API keys |
| `extensions.redb` | Installed extension manifest |
| `instances.redb` | Multi-backend registrations |

**No external database**. Backup = stop the service + copy the `data/` directory. Migrate by copying to the same path on a new host.

All storage access goes through `neomind-storage`'s repository pattern — no other crate opens redb tables directly.

## Concurrency & Threading

**Tokio** async runtime, multi-threaded scheduler.

**Concurrency caps** (prevent avalanches):

| Semaphore | Limit | Scope |
|-----------|-------|-------|
| Global execution | 10 | Agent executions running concurrently in the main process |
| Per-LLM-backend | 2 | Concurrent requests to the same backend (avoids 429) |
| Tool concurrency | 6 | Concurrent tool calls |

**Agent execution safety**:

- Global 5-minute (300s) timeout wrapping all of `execute_internal`
- RAII `StatusGuard`: on panic / timeout / drop, the agent's state resets from `Executing` back to `Active`, preventing stuck agents
- Skipped executions (couldn't acquire the concurrency slot) don't advance `next_execution` — they retry on the next tick

**WebSocket / SSE**: one task per frontend connection, subscribed to the event bus; auto-reconnect and backfill on disconnect.

## Key Invariants (Memorize Before Coding)

- **Backend snake_case / frontend camelCase**: every API response goes through `fromDashboardDTO()` (`web/src/store/persistence/types.ts`). Any new code loading dashboards from the API must use this function.
- **Ollama uses `/api/chat`**, NOT `/v1/chat/completions`.
- **DataSourceId format**: `{type}:{id}:{field}` — parsing and generation live in `neomind-core`.
- **Multimodal capability hierarchy**: user override > runtime probe > LiteLLM registry > heuristic > false (see `crates/neomind-core/src/llm/registry.rs`).
- **Extension component rendering**: do NOT add a `mountedRef` pattern to `ComponentRenderer` (React 18 StrictMode double-mount breaks it); do NOT wrap `renderDashboardComponent` in an ErrorBoundary.

## Next Steps

- Building an extension → [Extension SDK](./3-extension-sdk.md) + [Extension Development](./7-extension-development.md)
- Adding an HTTP API → [REST API Reference](./4-rest-api.md)
- Reading the code → each crate's `lib.rs` header comment and the matching `docs/guides/` module doc

---

*Last updated: 2026-09-08*
