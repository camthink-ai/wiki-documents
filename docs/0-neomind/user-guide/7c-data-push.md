---
description: "NeoMind 数据推送使用指南：将设备遥测数据实时或定时推送到外部 Webhook 或 MQTT Broker，含推送目标配置、数据过滤、重试策略、批量发送、投递日志与统计。"
keywords: [NeoMind, 数据推送, data push, webhook, MQTT, 实时推送, 外部集成]
tags: [NeoMind, 用户指南]
sidebar_label: "Data Push"
sidebar_position: 7.75
---

# 数据推送

数据推送（Data Push）将 NeoMind 的设备遥测数据**自动推送到外部系统**——当设备发布新数据或按固定间隔，将数据发送到你配置的 Webhook 端点或 MQTT Broker。典型用途：

- 将传感器数据转发到企业内部的数据平台 / 数据湖
- 实时同步设备状态到第三方监控系统（如 Grafana、ThingsBoard）
- 将 AI 推理结果推送到业务系统触发后续流程
- 桥接 NeoMind 到另一个 IoT 平台

> 数据推送位于 **Data Explorer** 页面的 **Push** 标签下，与 [规则](./7-automation-rules.md)（条件触发动作）和 [数据转换](./7b-data-transforms.md)（实时数据加工）互补。

## 界面概览

进入左侧导航的 **Data Explorer**（数据库图标），切换到 **Push** 页签：

<img src="https://resources.camthink.ai/NeoMind/data-push-list.png" alt="数据推送列表 — 推送目标、类型、状态、调度方式、数据源" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

页面以表格形式展示所有推送目标，每行包含：

| 列 | 说明 |
|------|------|
| **名称** | 推送目标的显示名称 |
| **类型** | Webhook / MQTT |
| **状态** | 运行中 / 已停止 |
| **调度方式** | Event Driven（事件驱动）/ Interval（定时间隔） |
| **数据源** | 匹配的数据源模式（如 `device:*:temperature`） |
| **更新时间** | 最后修改时间 |
| **操作** | 编辑、删除、测试、查看日志 |

## 创建推送目标

点击 **Create** 按钮，打开全屏配置对话框：

<img src="https://resources.camthink.ai/NeoMind/data-push-create.png" alt="推送目标创建对话框 — 名称、类型、目标地址、调度方式" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

### 1. 基本信息

| 字段 | 说明 |
|------|------|
| **Name（名称）** | 推送目标的标识名 |
| **Target Type（目标类型）** | `Webhook` — HTTP POST 到指定 URL；`MQTT` — 发布到 MQTT Broker |

### 2. 目标配置

**Webhook 类型**：

| 字段 | 说明 |
|------|------|
| **URL** | 接收数据的 HTTP 端点（如 `https://api.example.com/ingest`） |
| **Method** | HTTP 方法（默认 `POST`） |
| **Headers** | 自定义请求头（如 `Authorization: Bearer <token>`、`Content-Type: application/json`） |

**MQTT 类型**：

| 字段 | 说明 |
|------|------|
| **Broker URL** | MQTT Broker 地址（如 `mqtt://broker.example.com:1883`） |
| **Topic** | 发布主题（如 `factory/line1/sensors`） |
| **Username / Password** | 认证凭据（可选） |

### 3. 调度方式

| 调度类型 | 说明 | 适用场景 |
|---------|------|---------|
| **Event Driven（事件驱动）** | 有新数据到达时立即推送 | 实时同步、低延迟场景 |
| **Interval（定时间隔）** | 每隔 N 秒批量推送一次 | 减少请求频率、批量场景 |

### 4. 数据源过滤

<img src="https://resources.camthink.ai/NeoMind/data-push-create-sources.png" alt="推送目标 — 数据源选择面板，按类型分组的多选" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

选择哪些数据源的数据需要推送：

| 配置 | 说明 |
|------|------|
| **Source Patterns（数据源模式）** | 使用通配符匹配。`device:*:temperature` = 所有设备的温度指标；`device:sensor-01:*` = sensor-01 的所有指标 |
| **Only Changes（仅变化推送）** | 开启后只在数据值发生变化时推送，跳过重复值，减少流量 |

数据源面板按类型分组（Device / Extension / Transform / System），支持搜索和多选。

### 5. 重试与批量

<img src="https://resources.camthink.ai/NeoMind/data-push-create-retry.png" alt="推送目标 — 重试策略与批量配置" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

**重试策略（Retry Config）**：

| 字段 | 说明 | 默认值 |
|------|------|--------|
| **Max Retries** | 最大重试次数 | 3 |
| **Backoff (secs)** | 初始退避秒数 | 5 |
| **Max Backoff (secs)** | 最大退避秒数 | 60 |

> 重试使用指数退避策略：第 1 次重试等 5s，第 2 次等 10s，第 3 次等 20s……直到达到 Max Backoff 上限。

**批量配置（Batch Config）**：

| 字段 | 说明 |
|------|------|
| **Batch Size** | 每批最大数据条数 |
| **Batch Interval (ms)** | 批量发送间隔（毫秒） |

配置完成后点击 **Save** 保存。

## 推送目标操作

每个推送目标支持以下操作：

| 操作 | 说明 |
|------|------|
| **Start / Stop** | 启动 / 停止推送 |
| **Test** | 发送一条测试数据验证连接是否正常 |
| **Logs** | 查看投递日志（成功 / 失败 / 重试记录） |
| **Edit** | 编辑配置 |
| **Delete** | 删除推送目标 |

## 投递日志

点击推送目标的 **Logs** 查看投递历史：

每条日志记录：
- **状态**：Pending / Success / Failed / Retrying
- **数据源**：推送的数据源 ID
- **发送内容**：实际发送的 payload
- **响应**：目标返回的响应（成功时）
- **尝试次数**：当前是第几次重试
- **错误信息**：失败时的错误详情
- **时间**：发送时间与完成时间

## CLI 管理

```bash
# 列出所有推送目标
neomind data-push list

# 创建推送目标
neomind data-push create --json '{
  "name": "Temperature to API",
  "target_type": "webhook",
  "config": {
    "url": "https://api.example.com/ingest",
    "method": "POST",
    "headers": {"Content-Type": "application/json"}
  },
  "schedule": {"type": "event_driven"},
  "data_filter": {"source_patterns": ["device:*:temperature"], "only_changes": false}
}'

# 启动 / 停止
neomind data-push start <target_id>
neomind data-push stop <target_id>

# 测试推送
neomind data-push test <target_id>

# 查看投递日志
neomind data-push logs <target_id>

# 查看统计
neomind data-push stats

# 删除
neomind data-push delete <target_id>
```

## REST API

```bash
# 创建推送目标
curl -X POST http://localhost:9375/api/data-push \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temperature to API",
    "target_type": "webhook",
    "config": {"url": "https://api.example.com/ingest", "method": "POST"},
    "schedule": {"type": "event_driven"},
    "data_filter": {"source_patterns": ["device:*:temperature"], "only_changes": false},
    "enabled": true
  }'

# 列出所有推送目标
curl http://localhost:9375/api/data-push

# 启动推送
curl -X POST http://localhost:9375/api/data-push/<id>/start

# 测试推送
curl -X POST http://localhost:9375/api/data-push/<id>/test

# 查看投递日志
curl http://localhost:9375/api/data-push/<id>/logs

# 查看统计
curl http://localhost:9375/api/data-push/stats
```

## 典型场景

### 场景 1：实时推送温度数据到企业 API

- **类型**：Webhook
- **调度**：Event Driven（有新数据即推送）
- **数据源**：`device:*:temperature`
- **Only Changes**：开启（避免重复值）
- **重试**：3 次，指数退避

### 场景 2：批量同步设备状态到 MQTT Broker

- **类型**：MQTT
- **调度**：Interval，每 60 秒
- **数据源**：`device:*:online`
- **批量**：每批 100 条，间隔 5 秒
- **Only Changes**：开启（只推送状态变化）

### 场景 3：推送 AI 推理结果到业务系统

- **类型**：Webhook
- **调度**：Event Driven
- **数据源**：`extension:yolo-detector:detections`
- **目标 URL**：业务系统的接收端点

## 与其他模块联动

| 模块 | 说明 |
|------|------|
| [设备](./3-onboard-device.md) | 推送设备发布的原始遥测数据 |
| [数据转换](./7b-data-transforms.md) | 可推送 Transform 生成的派生指标 |
| [扩展](./9-extensions.md) | 可推送扩展输出的指标（如 YOLO 检测结果） |
| [规则](./7-automation-rules.md) | 规则在内部评估数据；推送将数据输出到外部 |

## 最佳实践

- **开启 Only Changes**：对于状态类数据（如 `online`），开启后大幅减少无效推送
- **合理设置批量**：高频数据用 Interval + 批量推送，避免对目标系统造成请求风暴
- **配置重试策略**：网络不稳定时，3 次指数退避重试可覆盖大多数临时故障
- **先 Test 再启用**：创建后先用 Test 验证连接正常，再启动推送
- **监控投递日志**：定期查看失败日志，及时发现目标系统异常

---

*最后更新: 2026-06-16*
