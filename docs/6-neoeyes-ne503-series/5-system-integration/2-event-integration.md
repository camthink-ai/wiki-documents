---
description: NE503 事件总线对接实战指南，涵盖 MQTT 桥接、推理结果订阅、REST API 远程管理和业务系统集成模式。
keywords: [NE503, Event Bus, MQTT, REST API, 事件集成, 系统对接]
tags: [系统集成, NE503, 事件总线, MQTT]
---

# 事件集成

NE503 的 Event Bus 是平台级 Pub/Sub 消息中枢，AI 推理结果、设备告警、应用生命周期等事件均通过它分发。本文面向需要将 NE503 事件集成到外部系统的开发者，介绍 Topic 协议、MQTT 桥接、REST API 调用和常见集成模式。

## 1. 事件总线协议概览

### 1.1 接入方式

| 接入方式 | 端点 | 适用场景 |
|:---|:---|:---|
| gRPC（Unix Socket） | `unix:///run/aipc/event-bus.sock` | 设备内部服务、容器内应用 |
| gRPC（TCP） | `127.0.0.1:50053` | C++ 客户端 |
| REST API | `http://<设备IP>:8080/api/v1/events/*` | 外部系统集成 |
| WebSocket | `ws://<设备IP>:8080/api/v1/events/stream` | Web 前端实时订阅 |

### 1.2 Topic 命名与通配符

Event Bus 使用 `/` 分隔的层级式 Topic，支持三种通配符：`*`（单级）、`**`（多级）、`**/suffix`（后缀）。详细匹配规则参见 [Event Bus 服务参考](../6-reference/service-reference/2-event-bus.md)。

| Topic 前缀 | 来源 | 示例 |
|:---|:---|:---|
| `inference/` | AI Runtime | `inference/person_v1` |
| `device/` | 设备控制服务 | `device/temperature_alert` |
| `app/` | 应用管理器 | `app.started`、`app.crashed` |
| `system/` | 系统级事件 | `system/ota_progress` |

### 1.3 Event 消息结构

```json
{
  "topic": "inference/person_v1",
  "timestamp_ns": 1717545600000000000,
  "source": "ai-runtime",
  "event_id": "evt-1717545600000-1",
  "payload": { ... },
  "payload_type": "json",
  "metadata": { "stream": "cam0_main", "model_id": "person_v1" }
}
```

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `topic` | string | 事件主题 |
| `timestamp_ns` | uint64 | 纳秒级时间戳 |
| `source` | string | 来源（服务名或 app_id） |
| `event_id` | string | 自动生成的唯一 ID |
| `payload` | bytes | JSON 编码的事件载荷 |
| `metadata` | map | 可选键值对元数据 |

## 2. MQTT 桥接配置

NE503 Event Bus 使用 gRPC 协议，外部 MQTT 系统需通过桥接程序接入。桥接程序作为 Event Bus 订阅者，将事件转发到外部 MQTT Broker。

```
NE503 Event Bus (gRPC) --> [Bridge] --> MQTT Broker --> 业务系统
```

桥接客户端示例：

```python
import json
import paho.mqtt.client as mqtt
from hailo_ipc_sdk.events import EventClient

MQTT_BROKER = "mqtt.example.com"
MQTT_PORT = 1883
MQTT_PREFIX = "ne503"

mqtt_client = mqtt.Client(client_id="ne503-bridge")
mqtt_client.username_pw_set("username", "password")  # 可选认证
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
mqtt_client.loop_start()

event_client = EventClient(endpoint="192.168.1.100:50053")

try:
    for event in event_client.subscribe("**"):
        mqtt_topic = f"{MQTT_PREFIX}/{event.topic}"
        payload = json.dumps({
            "timestamp_ns": event.timestamp_ns,
            "source": event.source,
            "event_id": event.event_id,
            "payload": event.payload,
            "metadata": event.metadata,
        })
        mqtt_client.publish(mqtt_topic, payload, qos=1)
finally:
    event_client.close()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
```

MQTT Broker 认证支持用户名密码（`username_pw_set`）、TLS 证书（`tls_set`）和 Token 方式。

## 3. 订阅 AI 推理结果

AI Runtime 完成推理后自动发布到 `inference/{model_id}` Topic，`auto_publish_results` 默认开启。

### 3.1 推理结果 Payload

```json
{
  "model_id": "person_v1",
  "stream_id": "cam0_main",
  "frame_sequence": 42,
  "objects": [
    { "label": "person", "confidence": 0.92,
      "bbox": { "x": 0.15, "y": 0.20, "width": 0.30, "height": 0.55 } }
  ],
  "infer_time_us": 8500
}
```

载荷中的结果类型取决于模型：检测模型填充 `objects`、分类模型填充 `classifications`、姿态模型填充 `landmarks`。

### 3.2 消费者示例

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()

# 订阅特定模型
for event in event_client.subscribe("inference/person_v1"):
    persons = [o for o in event.payload.get("objects", [])
               if o["label"] == "person"]
    print(f"[{event.event_id}] 检测到 {len(persons)} 人")

# 通配符订阅所有模型
for event in event_client.subscribe("inference/**"):
    model = event.topic.split("/")[-1]
    stream = event.payload.get("stream_id", "?")
    count = len(event.payload.get("objects", []))
    print(f"[{model}] stream={stream}, objects={count}")

# 按 metadata 过滤码流
for event in event_client.subscribe(
    "inference/**", filters={"stream": "cam0_sub"}
):
    print(f"子码流: {event.event_id}")
```

## 4. 设备告警订阅

设备控制服务自动发布以下事件：

| 事件 Topic | 触发条件 | 关键字段 |
|:---|:---|:---|
| `device/temperature_alert` | 温度超过阈值（75°C 警告 / 85°C 严重） | `temperature`, `level` |
| `device/day_night_switch` | 昼夜模式切换 | `mode`（`day` / `night`） |
| `device/gpio_change` | GPIO 状态变化 | `pin`, `value` |
| `device/ptz_preset_reached` | PTZ 到达预设位 | `preset_id` |

应用管理器发布生命周期事件：`app.started`、`app.stopped`、`app.crashed`、`app.installed`。

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()

for event in event_client.subscribe("device/**"):
    level = event.payload.get("level", "info")
    if level == "critical":
        temp = event.payload.get("temperature")
        print(f"[严重] 设备温度 {temp}°C")
```

## 5. REST API 远程管理

外部系统通过 HTTP 端点管理事件和应用，无需 gRPC 连接。认证默认关闭，启用后需携带 Token。

### 5.1 Token 认证

```bash
# 登录获取 Token
curl -X POST http://192.168.1.100:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# 请求时携带 Token（三选一）
curl -H "Authorization: Bearer <token>" ...
curl -H "X-API-Key: <token>" ...
curl "ws://...?token=<token>"  # WebSocket
```

### 5.2 事件 API

```bash
# 列出活跃 Topic
curl http://192.168.1.100:8080/api/v1/events/topics

# 发布事件
curl -X POST http://192.168.1.100:8080/api/v1/events/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "app/custom_alert", "payload": {"type": "intrusion"}}'
```

WebSocket 实时订阅（浏览器端）：

```javascript
const ws = new WebSocket("ws://192.168.1.100:8080/api/v1/events/stream?token=<token>");
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  console.log(`[${d.topic}]`, d.payload);
};
```

### 5.3 应用管理 API

| 操作 | 方法 | 路径 |
|:---|:---|:---|
| 列出应用 | GET | `/api/v1/apps` |
| 启动应用 | POST | `/api/v1/apps/{id}/start` |
| 停止应用 | POST | `/api/v1/apps/{id}/stop` |
| 卸载应用 | DELETE | `/api/v1/apps/{id}` |
| 查看日志 | GET | `/api/v1/apps/{id}/logs` |

## 6. 业务系统集成模式

### 6.1 单设备直连

通过 WebSocket 或 REST API 直接获取单台设备的事件，适合设备少、实时性要求高的场景。

```
NE503 ──HTTP/WebSocket──> 业务服务器
```

### 6.2 多设备 MQTT 汇聚

每台设备运行桥接程序，事件汇聚到中央 MQTT Broker，Topic 中携带设备标识区分来源：

```
NE503 #1 ─┐
NE503 #2 ─┤──MQTT Bridge──> Broker ──> 业务服务
NE503 #3 ─┘
```

桥接时使用 `f"ne503/{DEVICE_ID}/{event.topic}"` 作为 MQTT Topic。

### 6.3 Webhook 转发

将事件通过 HTTP POST 转发到外部端点：

```python
import requests
from hailo_ipc_sdk.events import EventClient

WEBHOOK_URL = "https://api.example.com/ne503/events"
event_client = EventClient()

for event in event_client.subscribe("inference/**"):
    try:
        requests.post(WEBHOOK_URL, json={
            "device_id": "ne503-001",
            "topic": event.topic,
            "timestamp_ns": event.timestamp_ns,
            "payload": event.payload,
        }, timeout=5)
    except requests.RequestException as e:
        print(f"Webhook 投递失败: {e}")
```

### 6.4 数据库持久化

将推理结果写入数据库供后续分析：

```python
import sqlite3
from datetime import datetime
from hailo_ipc_sdk.events import EventClient

db = sqlite3.connect("inference_log.db")
db.execute("""CREATE TABLE IF NOT EXISTS detections (
    event_id TEXT PRIMARY KEY, model_id TEXT, stream_id TEXT,
    object_count INTEGER, infer_time_us INTEGER, timestamp TEXT)""")

event_client = EventClient()
for event in event_client.subscribe("inference/**"):
    model_id = event.topic.split("/")[-1]
    ts = datetime.fromtimestamp(event.timestamp_ns / 1e9).isoformat()
    db.execute("INSERT OR IGNORE INTO detections VALUES (?,?,?,?,?,?)",
               (event.event_id, model_id,
                event.payload.get("stream_id", ""),
                len(event.payload.get("objects", [])),
                event.payload.get("infer_time_us", 0), ts))
    db.commit()
```

## 7. 相关文档

- [RESTful API 参考](./1-restful-api.md) — 所有 HTTP 端点的完整参考
- [Event Bus 服务参考](../6-reference/service-reference/2-event-bus.md) — gRPC 接口、通配符匹配和性能参数详解
- [应用开发参考](../4-application-development/1-app-reference.md) — 基于 SDK 开发自定义应用
