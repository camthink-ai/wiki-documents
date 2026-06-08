---
description: NE503 Event Bus integration practical guide, covering MQTT bridging, inference result subscription, REST API remote management, and business system integration patterns.
keywords: [NE503, Event Bus, MQTT, REST API, Event Integration, System Integration]
tags: [System Integration, NE503, Event Bus, MQTT]
---

# Event Integration

The NE503 Event Bus is a platform-level Pub/Sub messaging hub. AI inference results, device alerts, application lifecycle events, and more are all distributed through it. This guide is intended for developers who need to integrate NE503 events into external systems, covering the Topic protocol, MQTT bridging, REST API calls, and common integration patterns.

## 1. Event Bus Protocol Overview

### 1.1 Access Methods

| Access Method | Endpoint | Use Case |
|:---|:---|:---|
| gRPC (Unix Socket) | `unix:///run/aipc/event-bus.sock` | On-device services, in-container applications |
| gRPC (TCP) | `127.0.0.1:50053` | C++ clients |
| REST API | `http://<device-ip>:8080/api/v1/events/*` | External system integration |
| WebSocket | `ws://<device-ip>:8080/api/v1/events/stream` | Web frontend real-time subscription |

### 1.2 Topic Naming and Wildcards

The Event Bus uses `/`-separated hierarchical Topics and supports three wildcard types: `*` (single level), `**` (multi-level), and `**/suffix` (suffix). For detailed matching rules, see the [Event Bus Service Reference](../6-reference/service-reference/2-event-bus.md).

| Topic Prefix | Source | Example |
|:---|:---|:---|
| `inference/` | AI Runtime | `inference/person_v1` |
| `device/` | Device Control Service | `device/temperature_alert` |
| `app/` | Application Manager | `app.started`, `app.crashed` |
| `system/` | System-level events | `system/ota_progress` |

### 1.3 Event Message Structure

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

| Field | Type | Description |
|:---|:---|:---|
| `topic` | string | Event topic |
| `timestamp_ns` | uint64 | Nanosecond timestamp |
| `source` | string | Source (service name or app_id) |
| `event_id` | string | Auto-generated unique ID |
| `payload` | bytes | JSON-encoded event payload |
| `metadata` | map | Optional key-value metadata |

## 2. MQTT Bridge Configuration

The NE503 Event Bus uses the gRPC protocol. External MQTT systems need to connect through a bridge program. The bridge acts as an Event Bus subscriber, forwarding events to an external MQTT Broker.

```
NE503 Event Bus (gRPC) --> [Bridge] --> MQTT Broker --> Business System
```

Bridge client example:

```python
import json
import paho.mqtt.client as mqtt
from hailo_ipc_sdk.events import EventClient

MQTT_BROKER = "mqtt.example.com"
MQTT_PORT = 1883
MQTT_PREFIX = "ne503"

mqtt_client = mqtt.Client(client_id="ne503-bridge")
mqtt_client.username_pw_set("username", "password")  # Optional authentication
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

MQTT Broker authentication supports username/password (`username_pw_set`), TLS certificates (`tls_set`), and token-based methods.

## 3. Subscribing to AI Inference Results

After AI Runtime completes inference, it automatically publishes to the `inference/{model_id}` Topic. `auto_publish_results` is enabled by default.

### 3.1 Inference Result Payload

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

The result types in the payload depend on the model: detection models populate `objects`, classification models populate `classifications`, and pose models populate `landmarks`.

### 3.2 Consumer Examples

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()

# Subscribe to a specific model
for event in event_client.subscribe("inference/person_v1"):
    persons = [o for o in event.payload.get("objects", [])
               if o["label"] == "person"]
    print(f"[{event.event_id}] Detected {len(persons)} person(s)")

# Wildcard subscription to all models
for event in event_client.subscribe("inference/**"):
    model = event.topic.split("/")[-1]
    stream = event.payload.get("stream_id", "?")
    count = len(event.payload.get("objects", []))
    print(f"[{model}] stream={stream}, objects={count}")

# Filter by metadata for a specific stream
for event in event_client.subscribe(
    "inference/**", filters={"stream": "cam0_sub"}
):
    print(f"Sub-stream: {event.event_id}")
```

## 4. Device Alert Subscription

The Device Control Service automatically publishes the following events:

| Event Topic | Trigger Condition | Key Fields |
|:---|:---|:---|
| `device/temperature_alert` | Temperature exceeds threshold (75°C warning / 85°C critical) | `temperature`, `level` |
| `device/day_night_switch` | Day/night mode switch | `mode` (`day` / `night`) |
| `device/gpio_change` | GPIO state change | `pin`, `value` |
| `device/ptz_preset_reached` | PTZ reached preset position | `preset_id` |

The Application Manager publishes lifecycle events: `app.started`, `app.stopped`, `app.crashed`, `app.installed`.

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()

for event in event_client.subscribe("device/**"):
    level = event.payload.get("level", "info")
    if level == "critical":
        temp = event.payload.get("temperature")
        print(f"[CRITICAL] Device temperature {temp}°C")
```

## 5. REST API Remote Management

External systems can manage events and applications through HTTP endpoints without requiring a gRPC connection. Authentication is disabled by default; when enabled, a Token must be provided.

### 5.1 Token Authentication

```bash
# Log in to obtain a Token
curl -X POST http://192.168.1.100:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Include Token in requests (choose one of three methods)
curl -H "Authorization: Bearer <token>" ...
curl -H "X-API-Key: <token>" ...
curl "ws://...?token=<token>"  # WebSocket
```

### 5.2 Event API

```bash
# List active Topics
curl http://192.168.1.100:8080/api/v1/events/topics

# Publish an event
curl -X POST http://192.168.1.100:8080/api/v1/events/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "app/custom_alert", "payload": {"type": "intrusion"}}'
```

WebSocket real-time subscription (browser-side):

```javascript
const ws = new WebSocket("ws://192.168.1.100:8080/api/v1/events/stream?token=<token>");
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  console.log(`[${d.topic}]`, d.payload);
};
```

### 5.3 Application Management API

| Operation | Method | Path |
|:---|:---|:---|
| List applications | GET | `/api/v1/apps` |
| Start application | POST | `/api/v1/apps/{id}/start` |
| Stop application | POST | `/api/v1/apps/{id}/stop` |
| Uninstall application | DELETE | `/api/v1/apps/{id}` |
| View logs | GET | `/api/v1/apps/{id}/logs` |

## 6. Business System Integration Patterns

### 6.1 Single Device Direct Connection

Directly obtain events from a single device via WebSocket or REST API, suitable for scenarios with few devices and high real-time requirements.

```
NE503 ──HTTP/WebSocket──> Business Server
```

### 6.2 Multi-Device MQTT Aggregation

Each device runs a bridge program. Events are aggregated to a central MQTT Broker, with device identifiers in the Topic to distinguish sources:

```
NE503 #1 ─┐
NE503 #2 ─┤──MQTT Bridge──> Broker ──> Business Service
NE503 #3 ─┘
```

Use `f"ne503/{DEVICE_ID}/{event.topic}"` as the MQTT Topic when bridging.

### 6.3 Webhook Forwarding

Forward events to an external endpoint via HTTP POST:

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
        print(f"Webhook delivery failed: {e}")
```

### 6.4 Database Persistence

Write inference results to a database for subsequent analysis:

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

## 7. Related Documentation

- [RESTful API Reference](./1-restful-api.md) — Complete reference for all HTTP endpoints
- [Event Bus Service Reference](../6-reference/service-reference/2-event-bus.md) — gRPC interface, wildcard matching, and performance parameter details
- [Application Development Reference](../4-application-development/1-app-reference.md) — Develop custom applications based on the SDK
