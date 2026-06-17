---
description: "NeoMind device type development guide: device data model, DeviceTypeTemplate, ConnectionConfig, MQTT topics and webhook data formats, auto-discovery flow, CLI device management, ESP32/Python hands-on examples."
keywords: [NeoMind, device type, Device, MQTT, Webhook, auto-discovery, ESP32]
tags: [NeoMind, Developer Guide]
sidebar_label: "Device Type Development"
---

# Device Type Development

This page covers NeoMind's device data model, data ingestion protocols (MQTT / Webhook), the auto-discovery flow, and CLI device management. By the end you can connect any sensor or actuator to NeoMind.

> **Repo**: device type definitions go to [camthink-ai/NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes). Runtime device management lives in the main repo's `neomind-devices` crate.

## Device Data Model

### DeviceConfig (Device Instance)

Every device connected to NeoMind is a `DeviceConfig` instance stored in `data/device_registry.redb`:

```rust
pub struct DeviceConfig {
    pub device_id: String,           // globally unique id (e.g. "living-room-sensor")
    pub name: String,                // display name
    pub device_type: String,         // references DeviceTypeTemplate (e.g. "dht22_sensor")
    pub adapter_type: String,        // adapter: mqtt / webhook / hass
    pub connection_config: ConnectionConfig, // protocol-specific config
    pub adapter_id: Option<String>,  // adapter managing this device
    pub last_seen: i64,              // last active timestamp (0 = never connected)
}
```

### ConnectionConfig (Connection Config)

The connection config is protocol-agnostic, supporting multiple protocols via `Option` fields:

```rust
pub struct ConnectionConfig {
    // MQTT-specific
    pub telemetry_topic: Option<String>,   // uplink data topic
    pub command_topic: Option<String>,     // downlink command topic
    pub json_path: Option<String>,         // JSON extraction path

    // Home Assistant-specific
    pub entity_id: Option<String>,

    // Other protocol-specific params (flattened extension)
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}
```

### DeviceTypeTemplate (Device Type Template)

A device type template defines the metrics and commands for a class of devices. Multiple device instances can reference the same template:

```rust
pub struct DeviceTypeTemplate {
    pub device_type: String,            // unique id (e.g. "dht22_sensor")
    pub name: String,                   // display name
    pub description: String,
    pub categories: Vec<String>,        // grouping (e.g. ["sensor", "environment"])
    pub mode: DeviceTypeMode,           // Simple or Full
    pub metrics: Vec<MetricDefinition>, // metrics provided
    pub uplink_samples: Vec<Value>,     // sample data for Simple mode
    pub commands: Vec<CommandDefinition>, // supported commands
}
```

### MetricDefinition (Metric Definition)

```rust
pub struct MetricDefinition {
    pub name: String,           // metric name (supports dot notation, e.g. "values.temperature")
    pub display_name: String,   // display name
    pub data_type: MetricDataType, // Float / Integer / Boolean / String / Binary / Enum
    pub unit: String,           // unit (e.g. "°C", "%", "hPa")
    pub min: Option<f64>,       // range (optional)
    pub max: Option<f64>,
}
```

> The DataSourceId format is `device:{device_id}:{metric_name}`. Dashboards and the rule engine reference device metrics by this ID.

## Data Ingestion Protocols

### MQTT (Recommended)

NeoMind embeds an MQTT 3.1.1 broker (port `1883`). Devices connect directly.

**Topic format**:

| Direction | Topic | Description |
|-----------|-------|-------------|
| Uplink (telemetry) | `device/{device_type}/{device_id}/uplink` | Device sends data |
| Downlink (command) | `device/{device_type}/{device_id}/downlink` | NeoMind sends commands |

**Payload format** (JSON):

```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "battery": 3.7
}
```

If the device payload is nested, set `json_path` in `ConnectionConfig` to specify the extraction path (e.g. `data.values`).

### Webhook

For devices with only HTTP capability (e.g. ESP32-CAM, Raspberry Pi).

**Endpoint**: `POST http://<server_ip>:9375/api/devices/{device_id}/webhook`

**Payload**:

```json
{
  "timestamp": 1718300000,
  "quality": 1.0,
  "data": {
    "temperature": 25.3,
    "humidity": 60
  }
}
```

`timestamp` can be omitted (auto-filled with current time). The `data` object keys must match the device type's metric names.

## Auto-Discovery Flow

Auto-discovery is enabled by default. Any unknown device sending data to the MQTT broker is captured as a **Draft**, pending user approval.

```
Device publishes to any MQTT topic
        │
        ▼
Matches a known device type? ─── yes ──→ Device created (auto-registered)
        │ no
        ▼
Draft created (collects 5 samples)
        │
        ▼
User approves via Web UI or CLI ─── approve ──→ Registered as a device
        │                                             │
        │ reject                                       │ Metrics written to telemetry.redb
        ▼                                             │
  Draft deleted                                       ▼
                                        Dashboard / Rules / Agent ready
```

**CLI draft management**:

```bash
# List pending devices
neomind device drafts list

# View details (with sample data)
neomind device drafts get <DRAFT_ID>

# Approve (specify name and type)
neomind device drafts approve <DRAFT_ID> --name "Living Room Sensor" --type dht22_sensor

# Reject
neomind device drafts reject <DRAFT_ID>
```

## CLI Device Management

### Creating Devices

```bash
# MQTT device
neomind device create \
  --name "Temp/Humidity Sensor" \
  --device-type dht22_sensor \
  --adapter-type mqtt \
  --json '{"connection_config": {"telemetry_topic": "device/dht22/living-room/uplink"}}'

# Webhook device
neomind device create \
  --name "Webhook Device" \
  --adapter-type webhook \
  --json '{"connection_config": {}}'

# Get webhook URL
neomind device webhook-url <DEVICE_ID>
# → http://192.168.1.100:9375/api/devices/abc123/webhook
```

### Querying and Controlling

```bash
# List devices
neomind device list [--device-type <TYPE>] [--status <STATUS>]

# View device details + current metric values
neomind device get <DEVICE_ID>

# View telemetry history
neomind device history <DEVICE_ID> [--metric temperature] [--time-range 1h]

# Send command
neomind device control <DEVICE_ID> set_brightness \
  --params '{"brightness": 80}'

# Write metric directly (for testing)
neomind device write-metric <DEVICE_ID> temperature 25.5
```

### Device Type Management

```bash
# List all device types
neomind device types list

# Create device type
neomind device types create \
  --name 'Temperature Sensor' \
  --metrics '[{"name":"temperature","display_name":"Temperature","data_type":"Float","unit":"°C"}]' \
  --commands '[{"name":"calibrate","display_name":"Calibrate","description":"Calibrate sensor","parameters":[{"name":"offset","data_type":"Float"}]}]'

# View type details
neomind device types get <TYPE_ID>
```

## REST API Quick Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/devices` | List devices |
| `POST` | `/api/devices` | Create device |
| `GET` | `/api/devices/{id}` | Device details |
| `PUT` | `/api/devices/{id}` | Update device |
| `DELETE` | `/api/devices/{id}` | Delete device |
| `GET` | `/api/devices/{id}/current` | Latest metric values |
| `POST` | `/api/devices/{id}/command/{cmd}` | Send command |
| `POST` | `/api/devices/{id}/webhook` | Webhook data ingestion |
| `GET` | `/api/devices/drafts` | Pending device drafts |
| `POST` | `/api/devices/drafts/{id}/approve` | Approve draft |
| `GET` | `/api/device-types` | List device types |

> Full API reference: [REST API — Devices](./4-rest-api.md#devices)

## Hands-On Example: ESP32 + MQTT

Here is a complete example of an ESP32 + DHT22 temperature/humidity sensor connecting to NeoMind via MQTT.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22

const char* wifi_ssid = "YourWiFi";
const char* wifi_pass = "password";
const char* mqtt_host = "192.168.1.100";  // NeoMind server IP
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(wifi_ssid, wifi_pass);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  client.setServer(mqtt_host, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    while (!client.connect("esp32-dht22")) delay(1000);
  }

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (!isnan(temp) && !isnan(hum)) {
    char payload[64];
    snprintf(payload, 64,
      "{\"temperature\":%.1f,\"humidity\":%.1f}", temp, hum);
    client.publish("device/dht22/living-room/uplink", payload);
  }

  client.loop();
  delay(5000);  // report every 5 seconds
}
```

After the device powers on, NeoMind's auto-discovery captures it. Approve it in the CLI:

```bash
neomind device drafts list
neomind device drafts approve <DRAFT_ID> --name "Living Room Sensor" --type dht22_sensor
```

## Hands-On Example: Python + Webhook

For scenarios without an MQTT library:

```python
import requests
import time
import random

DEVICE_ID = "webhook-sensor-01"
API_BASE = "http://192.168.1.100:9375/api"
WEBHOOK_URL = f"{API_BASE}/devices/{DEVICE_ID}/webhook"

while True:
    payload = {
        "data": {
            "temperature": round(20 + random.random() * 10, 1),
            "humidity": round(40 + random.random() * 30, 1),
        }
    }
    resp = requests.post(WEBHOOK_URL, json=payload)
    print(f"Status: {resp.status_code}")
    time.sleep(10)
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Device data not ingested | MQTT topic mismatch | Check `telemetry_topic` config |
| Auto-discovery not triggering | Auto-discovery disabled | `neomind device drafts config --enabled true` |
| Webhook returns 404 | device_id doesn't exist | Create the device first with `neomind device create` |
| Metric values null | payload key ≠ metric name | Verify `MetricDefinition.name` matches payload JSON keys |
| Command not received | Device not subscribed to downlink | Check device code subscribes to `device/{type}/{id}/downlink` |

## Next Steps

- Use device metrics in dashboards → [Dashboard Component Development](./8-dashboard-component-dev.md)
- Trigger rules from device metrics → [REST API — Rules](./4-rest-api.md#rules)
- Device metrics as Agent data sources → [Extension Development](./7-extension-development.md)

---

*Last updated: 2026-06-15*
