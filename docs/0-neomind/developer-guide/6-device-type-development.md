---
description: "NeoMind 设备类型开发指南：设备数据模型、DeviceTypeTemplate、ConnectionConfig、MQTT 主题与 Webhook 数据格式、自动发现流程、CLI 设备管理、ESP32/Python 实战示例。"
keywords: [NeoMind, 设备类型, Device, MQTT, Webhook, 自动发现, ESP32]
tags: [NeoMind, 开发指南]
sidebar_label: "Device Type Development"
---

# 设备类型开发

本文讲解 NeoMind 的设备数据模型、数据接入协议（MQTT / Webhook）、自动发现流程，以及如何用 CLI 管理设备。读完你能把任何传感器或执行器接入 NeoMind。

> **仓库**：设备类型定义提交到 [camthink-ai/NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)。运行时设备管理在主仓库 `neomind-devices` crate 中。

## 设备数据模型

### DeviceConfig（设备实例）

每个接入 NeoMind 的设备都是一个 `DeviceConfig` 实例，存储在 `data/device_registry.redb` 中：

```rust
pub struct DeviceConfig {
    pub device_id: String,           // 全局唯一 ID（如 "living-room-sensor"）
    pub name: String,                // 显示名（如 "客厅温湿度"）
    pub device_type: String,         // 引用 DeviceTypeTemplate（如 "dht22_sensor"）
    pub adapter_type: String,        // 适配器类型：mqtt / webhook / hass
    pub connection_config: ConnectionConfig, // 协议相关配置
    pub adapter_id: Option<String>,  // 管理此设备的适配器 ID
    pub last_seen: i64,              // 最后活跃时间戳（0 = 从未连接）
}
```

### ConnectionConfig（连接配置）

连接配置是协议无关的结构，通过 `Option` 字段支持多种协议：

```rust
pub struct ConnectionConfig {
    // MQTT 相关
    pub telemetry_topic: Option<String>,   // 上行数据主题
    pub command_topic: Option<String>,     // 下行命令主题
    pub json_path: Option<String>,         // JSON 取值路径

    // Home Assistant 相关
    pub entity_id: Option<String>,

    // 其他协议特定参数（扁平化扩展）
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}
```

### DeviceTypeTemplate（设备类型模板）

设备类型模板定义了一类设备的指标和命令，可被多个设备实例引用：

```rust
pub struct DeviceTypeTemplate {
    pub device_type: String,            // 唯一标识（如 "dht22_sensor"）
    pub name: String,                   // 显示名
    pub description: String,
    pub categories: Vec<String>,        // 分组（如 ["sensor", "environment"]）
    pub mode: DeviceTypeMode,           // Simple 或 Full
    pub metrics: Vec<MetricDefinition>, // 提供的指标
    pub uplink_samples: Vec<Value>,     // Simple 模式的样本数据
    pub commands: Vec<CommandDefinition>, // 支持的命令
}
```

### MetricDefinition（指标定义）

```rust
pub struct MetricDefinition {
    pub name: String,           // 指标名（支持点号嵌套，如 "values.temperature"）
    pub display_name: String,   // 显示名
    pub data_type: MetricDataType, // Float / Integer / Boolean / String / Binary / Enum
    pub unit: String,           // 单位（如 "°C"、"%"、"hPa"）
    pub min: Option<f64>,       // 数值范围（可选）
    pub max: Option<f64>,
}
```

> DataSourceId 格式为 `device:{device_id}:{metric_name}`，仪表板和规则引擎通过此 ID 引用设备指标。

## 数据接入协议

### MQTT（推荐）

NeoMind 内嵌 MQTT 3.1.1 Broker（端口 `1883`），设备直接连接即可。

**主题格式**：

| 方向 | 主题 | 说明 |
|------|------|------|
| 上行（遥测） | `device/{device_type}/{device_id}/uplink` | 设备发送数据 |
| 下行（命令） | `device/{device_type}/{device_id}/downlink` | NeoMind 发送命令 |

**Payload 格式**（JSON）：

```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "battery": 3.7
}
```

如果设备 payload 有嵌套结构，可在 `ConnectionConfig` 的 `json_path` 中指定取值路径（如 `data.values`）。

### Webhook

适用于只有 HTTP 能力的设备（如 ESP32-CAM、树莓派）。

**端点**：`POST http://<服务器IP>:9375/api/devices/{device_id}/webhook`

**Payload**：

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

`timestamp` 可省略（自动用当前时间），`data` 对象的 key 必须与设备类型的 metric name 对应。

## 自动发现流程

NeoMind 默认开启自动发现。任何向 MQTT Broker 发送数据的未知设备都会被捕获为 **Draft（草稿）**，等待用户审批。

```
设备发布数据到任意 MQTT 主题
        │
        ▼
NeoMind 匹配已知设备类型？─── 是 ──→ 直接创建设备（自动注册）
        │ 否
        ▼
创建 Draft（收集 5 条样本数据）
        │
        ▼
用户在 Web UI 或 CLI 审批 ─── approve ──→ 注册为正式设备
        │                                    │
        │ reject                              │ 指标开始写入 telemetry.redb
        ▼                                    │
  删除 Draft                                 ▼
                                    仪表板 / 规则 / Agent 可用
```

**CLI 管理 Draft**：

```bash
# 查看待审批设备
neomind device drafts list

# 查看详情（含样本数据）
neomind device drafts get <DRAFT_ID>

# 审批通过（指定名称和类型）
neomind device drafts approve <DRAFT_ID> --name "客厅传感器" --type dht22_sensor

# 拒绝
neomind device drafts reject <DRAFT_ID>
```

## CLI 设备管理

### 创建设备

```bash
# MQTT 设备
neomind device create \
  --name "温湿度传感器" \
  --device-type dht22_sensor \
  --adapter-type mqtt \
  --json '{"connection_config": {"telemetry_topic": "device/dht22/living-room/uplink"}}'

# Webhook 设备
neomind device create \
  --name "Webhook 设备" \
  --adapter-type webhook \
  --json '{"connection_config": {}}'

# 获取 Webhook URL
neomind device webhook-url <DEVICE_ID>
# → http://192.168.1.100:9375/api/devices/abc123/webhook
```

### 查询与控制

```bash
# 列出设备
neomind device list [--device-type <TYPE>] [--status <STATUS>]

# 查看设备详情 + 当前指标值
neomind device get <DEVICE_ID>

# 查看遥测历史
neomind device history <DEVICE_ID> [--metric temperature] [--time-range 1h]

# 发送命令
neomind device control <DEVICE_ID> set_brightness \
  --params '{"brightness": 80}'

# 直接写入指标（测试用）
neomind device write-metric <DEVICE_ID> temperature 25.5
```

### 设备类型管理

```bash
# 列出所有设备类型
neomind device types list

# 创建设备类型
neomind device types create \
  --name '温度传感器' \
  --metrics '[{"name":"temperature","display_name":"温度","data_type":"Float","unit":"°C"}]' \
  --commands '[{"name":"calibrate","display_name":"校准","description":"校准传感器","parameters":[{"name":"offset","data_type":"Float"}]}]'

# 查看类型详情
neomind device types get <TYPE_ID>
```

## REST API 快速参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/devices` | 列出设备 |
| `POST` | `/api/devices` | 创建设备 |
| `GET` | `/api/devices/{id}` | 设备详情 |
| `PUT` | `/api/devices/{id}` | 更新设备 |
| `DELETE` | `/api/devices/{id}` | 删除设备 |
| `GET` | `/api/devices/{id}/current` | 最新指标值 |
| `POST` | `/api/devices/{id}/command/{cmd}` | 发送命令 |
| `POST` | `/api/devices/{id}/webhook` | Webhook 数据上报 |
| `GET` | `/api/devices/drafts` | 待审批设备列表 |
| `POST` | `/api/devices/drafts/{id}/approve` | 审批 Draft |
| `GET` | `/api/device-types` | 设备类型列表 |

> 完整 API 参考：[REST API — Devices](./4-rest-api.md)

## 实战示例：ESP32 + MQTT

以下是一个 ESP32 + DHT22 温湿度传感器通过 MQTT 接入 NeoMind 的完整示例。

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22

const char* wifi_ssid = "YourWiFi";
const char* wifi_pass = "password";
const char* mqtt_host = "192.168.1.100";  // NeoMind 服务器 IP
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
  delay(5000);  // 每 5 秒上报一次
}
```

设备上电后，NeoMind 的自动发现会捕获它。在 CLI 里审批：

```bash
neomind device drafts list
neomind device drafts approve <DRAFT_ID> --name "客厅温湿度" --type dht22_sensor
```

## 实战示例：Python + Webhook

适用于没有 MQTT 库的场景：

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

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 设备数据不上报 | MQTT topic 不匹配 | 检查 `telemetry_topic` 配置 |
| 自动发现没触发 | 自动发现被关闭 | `neomind device drafts config --enabled true` |
| Webhook 返回 404 | device_id 不存在 | 先 `neomind device create` 创建设备 |
| 指标值为 null | payload key 与 metric name 不匹配 | 核对 `MetricDefinition.name` 与 payload JSON key |
| 命令下发无响应 | 设备未订阅 downlink topic | 检查设备代码是否订阅 `device/{type}/{id}/downlink` |

## 下一步

- 设备指标用于仪表板 → [Dashboard 组件开发](./8-dashboard-component-dev.md)
- 设备指标触发规则 → [REST API — Rules](./4-rest-api.md)
- 设备指标作为 Agent 数据源 → [扩展开发实战](./7-extension-development.md)

---

*最后更新: 2026-06-15*
