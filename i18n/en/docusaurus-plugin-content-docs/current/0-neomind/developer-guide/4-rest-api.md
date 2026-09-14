---
description: "NeoMind REST API reference: base URL, auth (JWT + API Key), unified response format, main endpoint groups (devices / dashboards / rules / agents / messages / extensions / data-push / LLM backends), public endpoints, error format."
keywords: [NeoMind, REST API, HTTP, JWT, API Key]
tags: [NeoMind, Developer Guide]
---

# REST API Reference

The NeoMind backend serves a REST API on Axum. This page is an **integrator's overview**: base URL, auth, unified response format, and endpoint groups by business domain. The authoritative endpoint list lives in `crates/neomind-api/src/server/router.rs`.

## Entry Points

| Item | Value |
|------|-------|
| Base URL | `http://<SERVER_IP>:9375/api` |
| Interactive API docs | `http://<SERVER_IP>:9375/api/docs` (Swagger-style, 339 routes, try-it-out) |
| Machine-readable route list | `GET /api/docs/routes.json` |
| Endpoint definitions (source) | `crates/neomind-api/src/server/router.rs` |
| Default port | 9375 (override with `--port` or the `NEOMIND_PORT` env var) |

> **Every endpoint path starts with `/api`.** The endpoint lists below omit the `/api` prefix.
>
> **Start at `/api/docs`**: since 0.9.24 an interactive API console is built in — every route grouped by auth class, expandable, and executable via Try it out (add your API Key to the request headers). This page covers contracts and pitfalls; the console is faster for per-endpoint exploration.

## Authentication

Two schemes:

### 1. JWT (User Session)

Default for the Web UI:

```
POST /api/auth/login    { "username": "...", "password": "..." }
→ returns a JWT
Subsequent requests add the header:
  Authorization: Bearer <jwt>
```

### 2. API Key (Programmatic)

For scripts / 3rd-party integrations:

- Generate a key under **Settings → API Keys**
- Send the header on every request:

```
X-API-Key: <key>
```

API Keys are independent of user sessions and can be scoped and set to expire.

### Public Endpoints (No Auth)

A handful of endpoints are open:

- `/api/health` / `/health/status` / `/health/live` / `/health/ready`
- `/api/metrics` (Prometheus text-format runtime metrics: HTTP request counters, EventBus dropped events, uptime and version — point a Prometheus scraper at it)
- `/api/system/network-info`
- `/api/auth/status` / `/auth/verify`
- `/api/auth/login` / `/auth/register`
- `/api/setup/*` (first-run wizard)
- `/api/llm-backends/types`
- `/api/messages/channels/types`
- `/api/extensions`
- `/api/capabilities` / `/capabilities/:name`
- `/api/tools`

## Unified Response Format

### Success

```json
{
  "success": true,
  "data": { /* business payload */ },
  "meta": { /* optional: pagination / count / timestamps */ }
}
```

**Integration note**: the CLI wraps an extra `data` layer — integrators extracting from `data.data` should be aware. The raw HTTP response is as shown above.

### Failure

```json
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device with id 'xxx' not found"
  }
}
```

HTTP status codes follow convention: 4xx client errors, 5xx server errors. Pull the human-readable text from `error.message`.

## Field Naming Convention

> **Important gotcha**: the backend returns **snake_case** (e.g. `data_source`), the frontend uses **camelCase** (e.g. `dataSource`). The frontend converts every API response via `web/src/store/persistence/types.ts::fromDashboardDTO()`. When you parse the JSON yourself as an integrator, trust the backend's snake_case.

> This page targets integrators and script authors. UI-level operations live in the [User Guide](../user-guide/1-install-setup.md).

## Main Endpoint Groups

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login, get JWT |
| POST | `/auth/register` | Self-service registration (disabled by default; an admin can enable it in settings. Registrants get the regular user role — the first admin is created via `/setup/initialize`) |
| GET | `/auth/status` | Current auth status |
| GET | `/auth/verify` | Verify JWT validity |

### Devices

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices` | List devices |
| POST | `/devices` | Create device (requires `connection_config: {}` even if empty) |
| GET | `/devices/:id` | Device detail (metrics + commands; `status` is three-state: `online` / `offline` (seen before, timed out) / `disconnected` (never seen)) |
| GET | `/devices/:id/current` | Current values for all device metrics |
| PUT | `/devices/:id` | Update device. `offline_timeout_secs` tri-state: **absent** = keep current, `null` = clear override (fall back to template/global), number = set (30–86400 seconds) |
| DELETE | `/devices/:id` | Delete device |
| GET | `/devices/:id/telemetry` | Device telemetry history — see [Telemetry query contract](#telemetry-query-contract) |
| GET | `/telemetry` | Cross-device telemetry query (`?source=&metric=&start=&end=&limit=&offset=`; `offset` skips the newest N items for server-side pagination; the response carries an exact `total_count`) |
| POST | `/devices/:id/command/:command` | Send command (body is the params object, e.g. `{"offset": 1}`) |
| POST | `/devices/:id/webhook` | Push data via webhook (no auth) |
| GET | `/device-types` | List device types |
| POST | `/device-types` | Create device type |
| GET | `/devices/drafts` | Pending drafts (auto-discovered) |
| POST | `/devices/drafts/:id/approve` | Approve a draft |

### Telemetry query contract

Query parameters for `GET /devices/:id/telemetry` (timestamps are always **Unix seconds**):

| Parameter | Semantics |
|-----------|------------|
| `metric` | A specific metric; omit for all metrics of the device |
| `start` / `end` | Time window (seconds). **`hours=N`** (1–720) derives the window when `start` is absent (honored since 0.9.24; previously ignored) |
| `aggregate` | `avg` / `min` / `max` / `sum` / `last` — **the `value` field reflects the requested function** (since 0.9.24; previously always avg); unknown values return 400; the raw fields (min/max/sum/count) always ride along |
| `limit` | Points per page, 1–5000, default 100 |
| `offset` | Skip the newest N points (offset pagination) |
| `cursor` | Cursor pagination: the previous page's oldest timestamp; the next page returns **strictly older** points (no boundary duplicates). `pagination.next_cursor` being `null` in the response means last page (short-page signal) — stop paginating |
| `history=true` | Access to a **deleted device's** archived data — an unknown device 404s here (consistent with `/devices/:id`); this flag reads the archive |
| `bucketed` | Server-side downsampling; returns at most `limit` evenly-spaced points for charts |

> **Polling note for integrators**: when a device is deleted by another client (CLI, second session), this endpoint changes from 200+empty to 404 — pollers should handle 404 and stop polling that device, or switch to `history=true` for the archive.

`GET /telemetry` (cross-device) additionally supports `count` for `aggregate`; unknown values are likewise a 400.

### Dashboards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboards` | List dashboards |
| POST | `/dashboards` | Create dashboard |
| GET | `/dashboards/:id` | Dashboard detail |
| PUT | `/dashboards/:id` | Update dashboard (including layout) |
| DELETE | `/dashboards/:id` | Delete dashboard |
| POST | `/dashboards/:id/share` | Generate a share link (with expiration) |
| GET | `/share/:token` | Access a shared dashboard (no auth) |

### Rules

| Method | Path | Description |
|--------|------|-------------|
| GET | `/rules` | List rules |
| POST | `/rules` | Create rule — **JSON body** (name / trigger / condition / actions) |
| GET | `/rules/:id` | Rule detail |
| PUT | `/rules/:id` | Update rule |
| DELETE | `/rules/:id` | Delete rule |
| POST | `/rules/:id/test` | Dry-run the rule (no real action) |

> **Rules use JSON format** (not a DSL string). Example POST body:

```json
{
  "name": "High Temp Alert",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
  "actions": [ { "type": "notify", "message": "Too hot" } ]
}
```

Condition types: `comparison` / `range` / `logical`. Action types: `notify` / `execute` / `trigger_agent`. Trigger types: `data_change` / `schedule` / `manual`.

### Agents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/agents` | List agents |
| POST | `/agents` | Create agent |
| GET | `/agents/:id` | Agent detail |
| PUT | `/agents/:id` | Update agent |
| DELETE | `/agents/:id` | Delete agent |
| POST | `/agents/:id/status` | Control execution (body `{"status": "active"}` / `"paused"`) |
| GET | `/agents/:id/executions` | Execution history |

> **Required fields for create**: `user_prompt` (required), `schedule: {"schedule_type": "..."}` (required). When no resources are bound, also set `execution_mode: "free"`.

### LLM Backends

| Method | Path | Description |
|--------|------|-------------|
| GET | `/llm-backends` | List backends |
| POST | `/llm-backends` | Add backend (Ollama / OpenAI / Anthropic / …) |
| GET | `/llm-backends/:id` | Backend detail (includes probed capabilities) |
| PUT | `/llm-backends/:id` | Update backend |
| DELETE | `/llm-backends/:id` | Delete backend |
| PATCH | `/llm-backends/:id/capabilities` | Manually override capability (body `{"multimodal": true}` / `false` / `null`, null clears) |

### Messages

| Method | Path | Description |
|--------|------|-------------|
| GET | `/messages` | Message list |
| GET | `/messages/channels` | List notification channels |
| POST | `/messages/channels` | Add a channel (webhook/email/telegram/wecom/dingtalk/slack/feishu) |
| PUT | `/messages/channels/:name` | Update channel |
| DELETE | `/messages/channels/:name` | Delete channel |
| POST | `/messages/channels/:name/test` | Test channel delivery |
| POST | `/messages` | Send a message manually |

### Extensions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/extensions` | List installed extensions |
| GET | `/extensions/types` | Enumerate extension types |
| POST | `/extensions/sync` | Scan the extensions directory and install (sync) |
| GET | `/extensions/:id` | Extension detail |
| GET | `/extensions/:id/health` | Health check |
| GET | `/extensions/:id/commands` | List extension commands |
| POST | `/extensions/:id/command` | Execute an extension command |
| GET | `/extensions/:id/components` | Dashboard components provided by the extension |

> **Marketplace component install** (`POST /frontend-components/market/install`, since 0.9.24): failures return real 4xx/5xx (component not found, marketplace unreachable, …) instead of HTTP 200 wrapping `success:false` — clients branching on status codes are now reliable.
| GET / WS | `/extensions/:id/stream` | Extension stream session (Push-mode real-time frames; see [Realtime API](#realtime-api)) |

### Data Push

| Method | Path | Description |
|--------|------|-------------|
| GET | `/data-push` | List push targets |
| POST | `/data-push` | Create a push target (Webhook or MQTT) |
| GET | `/data-push/:id` | Detail |
| PUT | `/data-push/:id` | Update |
| DELETE | `/data-push/:id` | Delete |
| POST | `/data-push/:id/test` | Push once as a test |
| POST | `/data-push/:id/start` | Start |
| POST | `/data-push/:id/stop` | Stop |
| GET | `/data-push/:id/logs` | Delivery logs |

### Storage & System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings/*` | System settings (retention policy, etc.) |
| GET | `/system/network-info` | Network info (MQTT / webhook endpoints) |
| GET | `/metrics` | Prometheus text metrics (public): HTTP request counters, uptime, event-bus drop counters |

## Realtime API

In addition to REST, NeoMind exposes:

- **WebSocket**: `ws://<host>:9375/api/events/ws` — dashboard live data, device state changes
- **SSE**: `GET /api/events/stream` (Server-Sent Events) — same event stream over plain HTTP
- **MQTT**: connect directly to `mqtt://<host>:1883` and subscribe to device topics

### Extension Stream (`/api/extensions/:id/stream`)

Push-mode extensions (video/audio and other continuous-frame outputs) establish a stream session through this WebSocket endpoint. Since **0.9.23**, optional **binary push frames** are supported:

1. The client opts in by sending `{"binary": true}` in the `init` config
2. The server confirms via `session_created.binary`; if unconfirmed, the legacy Text (JSON + base64) format is kept
3. Once enabled, `push_output` frames travel as WS Binary frames, avoiding double base64 encoding overhead. Frame format:

```
[kind u8=1][version u8=1][sequence u64 BE][meta_len u32 BE][meta JSON][payload bytes]
```

`meta` mirrors the Text envelope fields (minus `data`/`sequence`); control messages (`session_created`, `error`, etc.) always travel on Text frames — the WS frame type is the first-level discriminator. Any combination of old/new frontends and old/new servers degrades safely.

The canonical reference for the realtime protocol (WebSocket / SSE) is the frontend implementation: `web/src/lib/events.ts` and `web/src/lib/websocket.ts`.

## Error Handling Example

```python
import requests

resp = requests.post(
    "http://host:9375/api/devices",
    json={"name": "sensor", "device_type": "temp", "connection_config": {}},
    headers={"X-API-Key": KEY},
)
data = resp.json()
if not data.get("success"):
    err = data["error"]
    print(f"[{err['code']}] {err['message']}")
else:
    device = data["data"]
```

## Next Steps

- **Full endpoint list**: `crates/neomind-api/src/server/router.rs` — the authoritative route definitions (public / protected / admin)
- Adding a new endpoint → add a handler under `crates/neomind-api/src/`, follow the existing per-module pattern
- Realtime push → WebSocket / SSE (see `web/src/lib/websocket.ts`)

---

*Last updated: 2026-09-14*
