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
| **neomind-api** | Axum web server, HTTP / WebSocket / SSE handlers, Swagger at `/api/docs` |
| **neomind-agent** | AI agent: LLM backends, tool calling, memory system, skill system, scheduler |
| **neomind-devices** | Device management: MQTT / webhook adapters, registration, command queue, draft approval |
| **neomind-storage** | redb embedded storage: schema and access layer for all `*.redb` tables |
| **neomind-messages** | Message notification: 7 channels (webhook/email/telegram/wecom/dingtalk/slack/feishu) + in-app |
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
- Communicates with the main process via FFI (C ABI)
- **A crash doesn't affect the main process**: the runner has crash-loop protection; an extension that crashes repeatedly is auto-disabled
- Capability-gated: the extension declares required capabilities (network, filesystem, ml-model) at startup; the runner authorizes exactly those

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

`neomind-core::event_bus` is the nervous system that decouples components. All cross-module communication flows through events — modules never import each other directly:

| Source | Event | Subscribers |
|--------|-------|-------------|
| Device MQTT data | `DeviceDataReceived` | Rule engine, data push, dashboard WS |
| Rule fires | `RuleTriggered` | Message notifier, agent |
| Agent completes | `AgentExecutionCompleted` | Memory system, message notifier |
| Extension metric | `ExtensionMetric` | Storage, dashboard |
| System state change | `SystemEvent` | In-app message center |

Pub/sub — multiple subscribers fire in parallel; within a single subscriber, events are processed sequentially.

## Extension ABI

Extensions are written in Rust but **compile to a separate binary** from the main process, bridged by FFI:

- The `neomind_export!` macro (in the SDK) auto-generates C ABI entry points (`extern "C"` functions) from your `ExtensionHandler` trait impl
- The runner loads the extension binary → invokes the agreed entry → wraps it in an `ExtensionProxy` registered with the main process
- Data crosses the FFI boundary as serde JSON (metrics, commands, config)

**Capability system**: the extension declares `capabilities: ["network", "filesystem:read", "ml-model"]` in its metadata; the runner opens the sandbox accordingly when spawning. Calls requiring undeclared capabilities are rejected.

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

*Last updated: 2026-06-15*
