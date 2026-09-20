---
description: "NeoMind REST API 参考：OpenAPI 规范与工具链（Scalar 控制台 / 代码生成 / Apifox 导入）、认证（JWT + API Key）、统一响应格式、主要端点分组（设备 / 仪表板 / 规则 / Agent / 消息 / 扩展 / 数据推送 / LLM 后端）、公开端点与错误格式。"
keywords: [NeoMind, REST API, OpenAPI, Swagger, HTTP, JWT, API Key, 端点, 代码生成]
tags: [NeoMind, 开发指南]
sidebar_label: "REST API Reference"
---

# REST API 参考

NeoMind 后端用 Axum 提供 REST API。本文给出**面向集成商的 API 总览**：OpenAPI 规范与工具链、base URL、认证、统一响应格式、各业务域端点分组。

## 入口

| 项 | 值 |
|----|----|
| Base URL | `http://<SERVER_IP>:9375/api` |
| 交互式 API 控制台 | `http://<SERVER_IP>:9375/api/docs`（Scalar，可浏览可调试） |
| OpenAPI 3 规范 | `GET /api/docs/openapi.json`（354 个操作、278 个路径、136 个 schema） |
| 路由清单（机器可读，含鉴权类） | `GET /api/docs/routes.json` |
| 端点定义（源码） | `crates/neomind-api/src/server/router.rs` |
| 默认端口 | 9375（可用 `--port` 或 `NEOMIND_PORT` 环境变量改） |

> **所有端点路径以 `/api` 开头**。下文的端点列表都省略 `/api` 前缀。

## OpenAPI 规范与工具链

自 **0.9.24** 起，OpenAPI 3.0 规范覆盖**全部** REST 操作——334/338 个 handler 带完整注解（其余 4 个是通配路由，见下文"诚实边界"），136 个 schema 全部注册、135 个 `$ref` 全部可解析。这意味着你可以直接把规范导入任何标准工具，或生成强类型客户端。

### 下载规范文件

```bash
curl -o neomind-openapi.json http://<SERVER_IP>:9375/api/docs/openapi.json
```

约 230 KB。规范由 CI 漂移测试守护：每个注解路径必须真实存在于路由表，注解与实现不会悄悄脱节。

### 在线控制台（Scalar）

浏览器打开 `/api/docs` 即用，无需安装任何东西：

1. 左侧按业务域 tag 分组（devices、rules、agents、dashboards……共 37 组），点开展开每个端点的参数、请求体 schema 与响应码说明；
2. 点击任一端点 → **Try it out** → 填参数/请求体 → **Execute**，右侧直接看到真实响应（含响应头与耗时）；
3. **鉴权**：规范本身不内嵌 security 定义（鉴权类见下表，端点粒度的权威来源是 `routes.json`），调试受保护端点时需手动加请求头——在控制台的请求参数区给该请求添加 Header `X-API-Key: <你的key>`（或 `Authorization: Bearer <JWT>`）；
4. 控制台右上角可导出规范文件（OpenAPI JSON）。

### 导入 Apifox / Postman

**Apifox**（推荐国内团队）：

1. 项目设置 → **导入数据** → 选 **OpenAPI/Swagger**；
2. 数据源选"URL"填 `http://<SERVER_IP>:9375/api/docs/openapi.json`（或用上面下载的文件）；
3. 导入后所有端点、请求体结构、枚举值直接可用，可在 Apifox 环境变量里配 `X-API-Key` 批量鉴权。

**Postman**：Import → 支持直接粘贴该 URL 或拖入文件，效果相同。

### 生成强类型客户端

```bash
# 安装一次
npm install @openapitools/openapi-generator-cli -g

# TypeScript + axios 客户端
openapi-generator-cli generate \
  -i neomind-openapi.json -g typescript-axios -o src/api-generated

# Python 客户端
openapi-generator-cli generate \
  -i neomind-openapi.json -g python -o ./neomind-client
```

生成物包含每个端点的函数、全部请求/响应类型定义（含枚举与必填约束）。前端项目也可用 [orval](https://orval.dev/)（`npx orval --input neomind-openapi.json --output src/api.ts --client axios`）生成 React Query 钩子。

### 鉴权类速查（来自 routes.json）

| 类 | 含义 | 请求头 |
|----|------|--------|
| `public` | 无需鉴权 | 无 |
| `jwt-or-api-key` | Web 会话 **或** API Key 均可 | `X-API-Key: <key>` 或 `Authorization: Bearer <jwt>` |
| `jwt-only` | 仅管理员 JWT，**API Key 不适用** | `Authorization: Bearer <jwt>` |
| `webhook` / `ws` / `debug` | 特殊通道（签名校验 / WebSocket 升级） | 见各端点说明 |

对某个端点拿不准时：`GET /api/docs/routes.json` 里每个条目都带 `method`、`path`、`auth` 三个字段。

### 诚实边界（规范里没有的东西）

- **4 个通配路由**（`GET /api/images/*path`、`GET /api/docs/*rest`、`GET /api/extensions/:id/assets/*asset_path`、`ANY /api/share/:token/proxy/*path`）无法用 OpenAPI 路径模板表达——它们只在 `routes.json` 里；
- **鉴权元数据**不在规范内（见上表）；
- **长任务接口**（`builtin-llm/download`、`upload-model`、`import-local`）单次调用可能占用连接数分钟到数十分钟，代码生成客户端时建议单独设置超时。

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
- `/api/metrics`（Prometheus 文本格式运行指标：HTTP 请求计数、EventBus 丢弃事件数、运行时长与版本——可直接接入 Prometheus 抓取）
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

> **0.9.24 起错误信封全端统一**：认证失败（401/403）与限流（429）此前是另一种形状（`error` 为字符串、无 `success` 字段），现在与上述格式一致——`code` 分别为 `UNAUTHORIZED` / `FORBIDDEN` / `RATE_LIMITED`。用一个反序列化结构就能处理全部错误路径。限流响应同时带 `Retry-After` 头。

## 字段命名约定

> **重要陷阱**：后端返回 **snake_case**（如 `data_source`），前端使用 **camelCase**（如 `dataSource`）。前端所有 API 响应都经 `web/src/store/persistence/types.ts::fromDashboardDTO()` 转换。集成商自己解析 JSON 时，字段以**后端原样 snake_case** 为准。

> 本页面向集成商与脚本作者。字段命名、认证与实时协议的细节均在本页内；UI 层操作见[用户指南](../user-guide/1-install-setup.md)。

## 主要端点分组

### Auth（认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 登录拿 JWT |
| POST | `/auth/register` | 自助注册（默认关闭，需管理员在设置中开启；注册用户为普通角色——首个管理员由 `/setup/initialize` 创建） |
| GET | `/auth/status` | 当前认证状态 |
| GET | `/auth/verify` | 验证 JWT 是否有效 |

### Devices（设备）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/devices` | 列出设备 |
| POST | `/devices` | 创建设备（需 `connection_config: {}` 即使为空）。**注意 upsert 语义**：若 `device_id` 已存在会**替换**原设备的名称与配置，响应含 `updated_existing: true` 标明是覆盖而非新建 |
| GET | `/devices/:id` | 设备详情（含 metrics + commands；`status` 三态：`online` / `offline`（曾在线但超时）/ `disconnected`（从未上线）） |
| GET | `/devices/:id/current` | 设备全部指标当前值 |
| PUT | `/devices/:id` | 更新设备。`offline_timeout_secs` 三态：**缺省**＝保留现值、`null`＝清除覆盖（回退模板/全局默认）、数字＝设置（30–86400 秒） |
| DELETE | `/devices/:id` | 删除设备 |
| GET | `/devices/:id/telemetry` | 设备遥测历史，参数见下方[遥测查询契约](#遥测查询契约) |
| GET | `/telemetry` | 跨设备遥测查询（`?source=&metric=&start=&end=&limit=&offset=`；`offset` 为跳过最新 N 条，用于服务端分页，响应含精确 `total_count`） |
| POST | `/devices/:id/command/:command` | 下发指令（body 为参数对象，如 `{"offset": 1}`） |
| POST | `/devices/:id/webhook` | Webhook 推数据（无需认证） |
| GET | `/device-types` | 列出设备类型 |
| POST | `/device-types` | 创建设备类型 |
| GET | `/devices/drafts` | 待审批草稿（自动发现） |
| POST | `/devices/drafts/:id/approve` | 审批草稿 |

### 遥测查询契约

`GET /devices/:id/telemetry` 的查询参数（时间戳一律 **Unix 秒**）：

| 参数 | 语义 |
|------|------|
| `metric` | 指定指标名；缺省返回该设备全部指标 |
| `start` / `end` | 时间窗（秒）。**`hours=N`**（1–720）在 `start` 缺省时推导窗口（0.9.24 起生效，此前被忽略） |
| `aggregate` | `avg` / `min` / `max` / `sum` / `last`——**`value` 字段反映请求的函数**（0.9.24 起，此前恒为 avg）；未知值返回 400；原始字段（min/max/sum/count）始终随行返回 |
| `limit` | 每页点数，1–5000，默认 100 |
| `offset` | 跳过最新 N 条（偏移分页） |
| `cursor` | 游标分页：上一页最旧点的时间戳；下一页返回**严格更旧**的点（边界点不重复）。响应里 `pagination.next_cursor` 为 `null` 即最后一页（短页信号），可直接停止 |
| `history=true` | **设备已删除**的历史数据访问口——设备不存在时本端点 404（与 `/devices/:id` 一致），加此参数可查存档数据 |
| `bucketed` | 服务端降采样，图表场景返回至多 `limit` 个均匀分布的点 |

> **第三方轮询注意**：设备被其他客户端（CLI、另一会话）删除后，遥测端点从 200+空数据变为 404——轮询方需处理 404 并停止该设备的轮询，或改用 `history=true` 读取存档。

`GET /telemetry`（跨设备）的 `aggregate` 另支持 `count`；未知值同样 400。

### Dashboards（仪表板）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dashboards` | 列出仪表板 |
| POST | `/dashboards` | 创建仪表板 |
| GET | `/dashboards/:id` | 仪表板详情 |
| PUT | `/dashboards/:id` | 更新仪表板（含布局） |
| DELETE | `/dashboards/:id` | 删除仪表板 |
| POST | `/dashboards/:id/share` | 生成分享链接（带过期） |
| GET | `/share/:token` | 访问分享仪表板（无需认证） |

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

### Sessions（聊天会话）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/sessions/:id/history` | 会话历史消息，支持分页（见下方契约） |

> **历史分页契约（0.9.24+）**：`?limit=N&before=<游标>` 向前翻页，`before` 取上一页最旧一条的原始索引，响应含 `total` 与 `has_more`。分页边界带碎片保护——翻页起点回退到最近一条 `user` 消息，一轮对话（1 条 user + 3 条 assistant 记录）不会从中间切开。不传参数返回全部历史，老客户端无需改动。

### Messages（消息通知）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/messages` | 消息列表 |
| GET | `/messages/channels` | 列出通知渠道 |
| POST | `/messages/channels` | 添加渠道（webhook/email/telegram/wecom/dingtalk/slack/feishu） |
| PUT | `/messages/channels/:name` | 更新渠道 |
| DELETE | `/messages/channels/:name` | 删除渠道 |
| POST | `/messages/channels/:name/test` | 测试渠道投递 |
| POST | `/messages` | 手动发消息 |

### Extensions（扩展）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/extensions` | 列出已装扩展 |
| GET | `/extensions/types` | 扩展类型枚举 |
| POST | `/extensions/sync` | 扫描扩展目录并安装（同步） |
| GET | `/extensions/:id` | 扩展详情 |
| GET | `/extensions/:id/health` | 健康检查 |
| GET | `/extensions/:id/commands` | 扩展命令列表 |
| POST | `/extensions/:id/command` | 执行扩展命令（body `{"command": "...", "args": {...}}`） |
| GET | `/extensions/:id/components` | 扩展提供的 Dashboard 组件 |

> **组件市场安装**（`POST /frontend-components/market/install`，0.9.24 起）：失败返回真实的 4xx/5xx（组件不存在、市场不可达等），不再用 HTTP 200 包 `success:false`——按状态码分支处理的客户端从此可靠。
| GET / WS | `/extensions/:id/stream` | 扩展流会话（Push 模式实时帧；见[实时 API](#实时-api)） |

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
| GET | `/system/network-info` | 网络信息（MQTT / webhook 地址） |
| GET | `/metrics` | Prometheus 文本指标（公开）：HTTP 请求计数、uptime、事件总线丢弃计数等 |

## 实时 API

除 REST 外，NeoMind 提供：

- **WebSocket**：`ws://<host>:9375/api/events/ws` — 仪表板实时数据流、设备状态变化推送
- **SSE**：`GET /api/events/stream`（Server-Sent Events）— 同样的事件流，HTTP 单向
- **MQTT**：直连 `mqtt://<host>:1883` 订阅设备原始 topic

### 扩展流（`/api/extensions/:id/stream`）

Push 模式扩展（视频/音频等连续帧输出）通过该 WebSocket 端点建立流会话。自 **0.9.23** 起支持**二进制推送帧**（可选启用）：

1. 客户端在 `init` 配置中携带 `{"binary": true}` 主动协商
2. 服务端在 `session_created.binary` 中确认；未确认则保持旧版 Text（JSON + base64）格式
3. 启用后，`push_output` 帧改用 WS Binary 帧传输，免去双重 base64 编码开销，帧格式：

```
[kind u8=1][version u8=1][sequence u64 BE][meta_len u32 BE][meta JSON][payload bytes]
```

`meta` 与 Text 信封字段一致（不含 `data`/`sequence`）；控制消息（`session_created`、`error` 等）始终走 Text 帧——WS 帧类型即第一级判别器。新旧前端与新旧服务器的任意组合均可安全回退。

实时协议（WebSocket / SSE）的权威实现参考 Web 前端 `web/src/lib/events.ts` 与 `web/src/lib/websocket.ts`；Push 帧格式的实战案例见[案例研究：yolo-video](./case-studies/3-yolo-video-v2.md)。

## 相关页面

- [设备接入](../user-guide/3-onboard-device.md) — Webhook 推入与设备模型
- [自动化规则](../user-guide/7-automation-rules.md) · [数据推送](../user-guide/7c-data-push.md) · [通知](../user-guide/8-notifications.md)
- [扩展管理](../user-guide/9-extensions.md) · [配置 LLM 后端](../user-guide/2-configure-llm.md)
- [设备类型开发](./6-device-type-development.md) · [扩展开发](./7-extension-development.md)

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

- **完整端点清单**：`crates/neomind-api/src/server/router.rs` —— 所有路由（公开 / 保护 / 管理员）的权威定义
- 加新端点 → 在 `crates/neomind-api/src/` 加 handler，遵循现有分模块模式
- 实时推送 → WebSocket / SSE（参考 `web/src/lib/websocket.ts`）

---

*最后更新: 2026-09-14*
