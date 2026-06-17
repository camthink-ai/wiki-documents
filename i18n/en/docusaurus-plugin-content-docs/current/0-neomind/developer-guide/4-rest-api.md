---
description: "NeoMind REST API reference: base URL, auth (JWT + API Key), unified response format, main endpoint groups (devices / dashboards / rules / agents / messages / extensions / data-push / LLM backends), Swagger entry, error format."
keywords: [NeoMind, REST API, HTTP, Swagger, JWT, API Key]
tags: [NeoMind, Developer Guide]
---

# REST API Reference

The NeoMind backend serves a REST API on Axum. This page is an **integrator's overview**: base URL, auth, unified response format, and endpoint groups by business domain. For the full interactive reference, see Swagger UI.

## Entry Points

| Item | Value |
|------|-------|
| Base URL | `http://<SERVER_IP>:9375/api` |
| Swagger UI (interactive) | `http://<SERVER_IP>:9375/api/docs` |
| Default port | 9375 (override with `--port` or the `PORT` env var) |

> **Every endpoint path starts with `/api`.** The endpoint lists below omit the `/api` prefix.

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

## Main Endpoint Groups

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login, get JWT |
| POST | `/auth/register` | Register (first user becomes admin) |
| GET | `/auth/status` | Current auth status |
| GET | `/auth/verify` | Verify JWT validity |

### Devices

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices` | List devices |
| POST | `/devices` | Create device (requires `connection_config: {}` even if empty) |
| GET | `/devices/:id` | Device detail (metrics + commands) |
| PUT | `/devices/:id` | Update device |
| DELETE | `/devices/:id` | Delete device |
| GET | `/devices/:id/history` | Telemetry history (`?metric=&time_range=`) |
| POST | `/devices/:id/control` | Send command (`{"command": "...", "params": {...}}`) |
| POST | `/devices/:id/webhook` | Push data via webhook (no auth) |
| GET | `/devices/types` | List device types |
| POST | `/devices/types` | Create device type |
| GET | `/devices/drafts` | Pending drafts (auto-discovered) |
| POST | `/devices/drafts/:id/approve` | Approve a draft |

### Dashboards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboards` | List dashboards |
| POST | `/dashboards` | Create dashboard |
| GET | `/dashboards/:id` | Dashboard detail |
| PUT | `/dashboards/:id` | Update dashboard (including layout) |
| DELETE | `/dashboards/:id` | Delete dashboard |
| POST | `/dashboards/:id/share` | Generate a share link (with expiration) |
| GET | `/dashboards/shared/:token` | Access a shared dashboard (no auth) |

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
| PUT | `/messages/channels/:id` | Update channel |
| DELETE | `/messages/channels/:id` | Delete channel |
| POST | `/messages/channels/:id/test` | Test channel delivery |
| POST | `/messages/send` | Send a message manually |

### Extensions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/extensions` | List installed extensions |
| GET | `/extensions/types` | Enumerate extension types |
| POST | `/extensions/discover` | Scan the extensions directory |
| GET | `/extensions/:id` | Extension detail |
| GET | `/extensions/:id/health` | Health check |
| GET | `/extensions/:id/commands` | List extension commands |
| POST | `/extensions/:id/commands/:cmd` | Execute an extension command |
| GET | `/extensions/:id/components` | Dashboard components provided by the extension |

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
| GET | `/system/info` | System info (MQTT / network / webhook) |
| GET | `/system/network-info` | Network info |

## Realtime API

In addition to REST, NeoMind exposes:

- **WebSocket**: `ws://<host>:9375/api/events` — dashboard live data, device state changes
- **SSE**: `GET /api/events` (Server-Sent Events) — same event stream over plain HTTP
- **MQTT**: connect directly to `mqtt://<host>:1883` and subscribe to device topics

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

- **Full interactive docs**: `/api/docs` (Swagger) — every endpoint + parameter schema + live try-it
- Adding a new endpoint → add a handler under `crates/neomind-api/src/`, follow the existing per-module pattern
- Realtime push → WebSocket / SSE (see `web/src/lib/websocket.ts`)

---

*Last updated: 2026-06-15*
