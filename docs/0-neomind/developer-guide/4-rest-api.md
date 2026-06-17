---
description: "NeoMind REST API 参考：base URL、认证（JWT + API Key）、统一响应格式、主要端点分组（设备 / 仪表板 / 规则 / Agent / 消息 / 扩展 / 数据推送 / LLM 后端），含 Swagger 入口与错误格式。"
keywords: [NeoMind, REST API, HTTP, Swagger, JWT, API Key, 端点]
tags: [NeoMind, 开发指南]
sidebar_label: "REST API Reference"
---

# REST API 参考

NeoMind 后端用 Axum 提供 REST API。本文给出**面向集成商的 API 总览**：base URL、认证、统一响应格式、各业务域端点分组。完整交互式文档见 Swagger UI。

## 入口

| 项 | 值 |
|----|----|
| Base URL | `http://<SERVER_IP>:9375/api` |
| Swagger UI（交互式文档） | `http://<SERVER_IP>:9375/api/docs` |
| 默认端口 | 9375（可用 `--port` / `PORT` 环境变量改） |

> **所有端点路径以 `/api` 开头**。下文的端点列表都省略 `/api` 前缀。

## 认证

两种鉴权方式：

### 1. JWT（用户会话）

Web UI 默认走这套：

```
POST /api/auth/login    { "username": "...", "password": "..." }
→ 返回 JWT
之后所有请求加 Header:
  Authorization: Bearer <jwt>
```

### 2. API Key（编程访问）

适合脚本 / 第三方集成：

- 在 **Settings → API Keys** 生成一个 Key
- 请求时加 Header：

```
X-API-Key: <key>
```

API Key 不依赖用户会话，可设过期时间与权限范围。

### 公开端点（无需认证）

少数端点无需鉴权：

- `/api/health` / `/health/status` / `/health/live` / `/health/ready`
- `/api/system/network-info`
- `/api/auth/status` / `/auth/verify`
- `/api/auth/login` / `/auth/register`
- `/api/setup/*`（首次配置向导）
- `/api/llm-backends/types`（列出后端类型）
- `/api/messages/channels/types`
- `/api/extensions`（列出扩展）
- `/api/capabilities` / `/capabilities/:name`
- `/api/tools`

## 统一响应格式

### 成功

```json
{
  "success": true,
  "data": { /* 业务数据 */ },
  "meta": { /* 可选：分页 / 计数 / 时间戳 */ }
}
```

**CLI / 编程集成提醒**：CLI 包一层 `data`，集成商从 `data.data` 取真实业务对象。

### 失败

```json
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device with id 'xxx' not found"
  }
}
```

HTTP 状态码遵循惯例：4xx 客户端错误、5xx 服务端错误。从 `error.message` 提取可读信息。

## 字段命名约定

> **重要陷阱**：后端返回 **snake_case**（如 `data_source`），前端使用 **camelCase**（如 `dataSource`）。前端所有 API 响应都经 `web/src/store/persistence/types.ts::fromDashboardDTO()` 转换。集成商自己解析 JSON 时，字段以**后端原样 snake_case** 为准。

## 主要端点分组

### Auth（认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录拿 JWT |
| POST | `/auth/register` | 注册（首个用户自动 admin） |
| GET | `/auth/status` | 当前认证状态 |
| GET | `/auth/verify` | 验证 JWT 是否有效 |

### Devices（设备）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/devices` | 列出设备 |
| POST | `/devices` | 创建设备（需 `connection_config: {}` 即使为空） |
| GET | `/devices/:id` | 设备详情（含 metrics + commands） |
| PUT | `/devices/:id` | 更新设备 |
| DELETE | `/devices/:id` | 删除设备 |
| GET | `/devices/:id/history` | 遥测历史（`?metric=&time_range=`） |
| POST | `/devices/:id/control` | 下发指令（`{"command": "...", "params": {...}}`） |
| POST | `/devices/:id/webhook` | Webhook 推数据（无需认证） |
| GET | `/devices/types` | 列出设备类型 |
| POST | `/devices/types` | 创建设备类型 |
| GET | `/devices/drafts` | 待审批草稿（自动发现） |
| POST | `/devices/drafts/:id/approve` | 审批草稿 |

### Dashboards（仪表板）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dashboards` | 列出仪表板 |
| POST | `/dashboards` | 创建仪表板 |
| GET | `/dashboards/:id` | 仪表板详情 |
| PUT | `/dashboards/:id` | 更新仪表板（含布局） |
| DELETE | `/dashboards/:id` | 删除仪表板 |
| POST | `/dashboards/:id/share` | 生成分享链接（带过期） |
| GET | `/dashboards/shared/:token` | 访问分享（无需认证） |

### Rules（规则）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/rules` | 列出规则 |
| POST | `/rules` | 创建规则 — **JSON body**（name / trigger / condition / actions） |
| GET | `/rules/:id` | 规则详情 |
| PUT | `/rules/:id` | 更新规则 |
| DELETE | `/rules/:id` | 删除规则 |
| POST | `/rules/:id/test` | 试跑规则（不实际触发动作） |

> **规则用 JSON 格式**（不是 DSL 字符串）。POST body 示例：

```json
{
  "name": "高温告警",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
  "actions": [ { "type": "notify", "message": "温度过高" } ]
}
```

条件类型：`comparison` / `range` / `logical`。动作类型：`notify` / `execute` / `trigger_agent`。触发类型：`data_change` / `schedule` / `manual`。

### Agents（AI 智能体）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/agents` | 列出 Agent |
| POST | `/agents` | 创建 Agent |
| GET | `/agents/:id` | Agent 详情 |
| PUT | `/agents/:id` | 更新 Agent |
| DELETE | `/agents/:id` | 删除 Agent |
| POST | `/agents/:id/status` | 控制运行（body `{"status": "active"}` / `"paused"`） |
| GET | `/agents/:id/executions` | 执行历史 |

> **创建 Agent 必填字段**：`user_prompt`（必填）、`schedule: {"schedule_type": "..."}`（必填）。无资源绑定时需 `execution_mode: "free"`。

### LLM Backends（LLM 后端）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/llm-backends` | 列出后端 |
| POST | `/llm-backends` | 添加后端（Ollama / OpenAI / Anthropic / ...） |
| GET | `/llm-backends/:id` | 后端详情（含能力探测结果） |
| PUT | `/llm-backends/:id` | 更新后端 |
| DELETE | `/llm-backends/:id` | 删除后端 |
| PATCH | `/llm-backends/:id/capabilities` | 手动覆盖能力（body `{"multimodal": true}` / `false` / `null`，null 清除覆盖） |

### Messages（消息通知）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/messages` | 消息列表 |
| GET | `/messages/channels` | 列出通知渠道 |
| POST | `/messages/channels` | 添加渠道（webhook/email/telegram/wecom/dingtalk/slack/feishu） |
| PUT | `/messages/channels/:id` | 更新渠道 |
| DELETE | `/messages/channels/:id` | 删除渠道 |
| POST | `/messages/channels/:id/test` | 测试渠道投递 |
| POST | `/messages/send` | 手动发消息 |

### Extensions（扩展）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/extensions` | 列出已装扩展 |
| GET | `/extensions/types` | 扩展类型枚举 |
| POST | `/extensions/discover` | 扫描扩展目录 |
| GET | `/extensions/:id` | 扩展详情 |
| GET | `/extensions/:id/health` | 健康检查 |
| GET | `/extensions/:id/commands` | 扩展命令列表 |
| POST | `/extensions/:id/commands/:cmd` | 执行扩展命令 |
| GET | `/extensions/:id/components` | 扩展提供的 Dashboard 组件 |

### Data Push（数据推送）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/data-push` | 列出推送目标 |
| POST | `/data-push` | 创建推送目标（Webhook 或 MQTT） |
| GET | `/data-push/:id` | 详情 |
| PUT | `/data-push/:id` | 更新 |
| DELETE | `/data-push/:id` | 删除 |
| POST | `/data-push/:id/test` | 试推一次 |
| POST | `/data-push/:id/start` | 启动 |
| POST | `/data-push/:id/stop` | 停止 |
| GET | `/data-push/:id/logs` | 投递日志 |

### Storage & System

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/settings/*` | 系统设置（保留策略等） |
| GET | `/system/info` | 系统信息（MQTT / 网络 / webhook） |
| GET | `/system/network-info` | 网络信息 |

## 实时 API

除 REST 外，NeoMind 提供：

- **WebSocket**：`ws://<host>:9375/api/events` — 仪表板实时数据流、设备状态变化推送
- **SSE**：`GET /api/events`（Server-Sent Events）— 同样的事件流，HTTP 单向
- **MQTT**：直连 `mqtt://<host>:1883` 订阅设备原始 topic

实时协议（WebSocket / SSE）的权威实现参考 Web 前端 `web/src/lib/events.ts` 与 `web/src/lib/websocket.ts`。

## 错误处理建议

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

## 下一步

- **完整交互式文档**：`/api/docs`（Swagger）——所有端点 + 参数 schema + 在线试调用
- 加新端点 → 在 `crates/neomind-api/src/` 加 handler，遵循现有分模块模式
- 实时推送 → WebSocket / SSE（参考 `web/src/lib/websocket.ts`）

---

*最后更新: 2026-06-15*
