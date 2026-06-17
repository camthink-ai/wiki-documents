---
description: 将设备接入 NeoMind 的完整指南：通过 MQTT（内置 Broker，自动发现）、HTTP Webhook、手动注册或外部 Broker 四种方式接入，含 ESP32/Python 示例与草稿审批流程。
keywords: [NeoMind, 设备接入, onboarding, MQTT, Webhook, 自动发现, ESP32]
tags: [NeoMind, 用户指南]
sidebar_label: "Onboard a Device"
---

# 接入设备

 NeoMind 提供四种设备接入方式。**首次使用推荐 MQTT 方式**——NeoMind 内置了 MQTT Broker，设备发一条消息就能自动发现，全程零配置。

## 前置准备

开始前，请逐项确认：

- [ ] NeoMind 服务已启动（浏览器能打开 Web UI）
- [ ] 你的设备能通过网络访问 NeoMind 的 **MQTT 端口（1883）**
- [ ] 你知道 NeoMind 服务器的 IP 地址（或域名）

> **"能访问 1883 端口"是什么意思？** 取决于部署方式：
>
> | 部署方式 | 设备需要 |
> |---------|---------|
> | **本机 / 桌面应用** | 设备和 NeoMind 在同一台机器，用 `localhost` |
> | **局域网服务器** | 设备和服务器在同一网络，用内网 IP（如 `192.168.1.100`） |
> | **远程服务器 / 云主机** | 设备能访问服务器的公网 IP，且防火墙 / 安全组已放行 **1883** 端口 |
> | **Docker** | 设备能访问宿主机 IP 的 1883 端口（注意 Docker 端口映射） |

:::tip 不知道服务器 IP？
在 NeoMind 所在机器的终端运行：

```bash
neomind system info    # 输出中的 server_ip 就是
```

或手动查找：

```bash
# macOS / Linux（局域网 IP）
ifconfig | grep 'inet ' | grep -v 127.0.0.1
# Windows
ipconfig
```

- 局域网部署：找 `192.168.x.x` / `10.x.x.x` 地址
- 云服务器：使用公网 IP（在云控制台查看，或 `curl ifconfig.me`）
- 同一台机器：用 `localhost`
:::

## 30 秒快速验证

在写任何设备代码之前，先用一条命令验证 MQTT 连通性。

```bash
# 1. 安装 mosquitto 客户端（如果还没有）
#    macOS:   brew install mosquitto
#    Linux:   sudo apt install mosquitto-clients
#    Windows: https://mosquitto.org/download/

# 2. 发送一条测试数据（把 192.168.1.100 换成你的服务器 IP）
mosquitto_pub -h 192.168.1.100 -p 1883 -t "test/my-sensor" -m '{"temperature": 25.5}'
```

发送后，打开 Web UI → **Devices → Pending Devices** 标签页：

<img src="https://resources.camthink.ai/NeoMind/devices-pending.png" alt="Pending Devices 标签页 — 新发现的草稿设备" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

如果看到了新草稿设备，说明 MQTT 已经通了。

> 看不到草稿？逐项检查：
> 1. NeoMind 服务是否在运行？→ `curl http://localhost:9375/api/health`
> 2. IP 地址是否正确？→ 在 NeoMind 所在机器上用 `localhost` 试试
> 3. 端口 1883 是否被防火墙拦截？→ `telnet <IP> 1883`
> 4. 自动发现是否开启？→ `neomind device drafts config`

## 完整接入流程（MQTT）

> **什么是 MQTT？** 简单理解，MQTT 是一种物联网通信协议，类似"设备群聊"。NeoMind 内置了一个 **MQTT Broker**（消息中转服务器），设备连上后就能收发消息。**Topic** 是消息的频道名（如 `sensors/room1/temp`），**Payload** 是消息内容（通常是 JSON 格式）。

### 第 1 步：获取连接信息

```bash
neomind system info
```

记下这几个关键信息：

| 信息 | 示例值 | 用途 |
|------|--------|------|
| **MQTT 地址** | `192.168.1.100` | 设备代码里填这个 IP |
| **MQTT 端口** | `1883` | 默认端口，一般不用改 |
| **TLS** | `false`（默认关闭） | 如果是 `true`，设备需用 `mqtts://` |
| **认证** | `false`（默认关闭） | 如果是 `true`，需要用户名密码 |

也可以在 Web UI 查看：**Settings → Device Connections**

<img src="https://resources.camthink.ai/NeoMind/settings-mqtt-detail.png" alt="Settings → Device Connections：MQTT Broker 运行状态、IP 与端口" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

### 第 2 步：让设备发送数据

设备只需要做三件事：**连上 → 发数据 → 保持连接**。

选择你的平台：

#### Python（推荐，最容易上手）

> 前置：`pip install paho-mqtt`

```python
import paho.mqtt.client as mqtt
import json, time, random

# ↓↓↓ 只需改这三行 ↓↓↓
SERVER_IP = "192.168.1.100"   # 改成你的服务器 IP
WIFI_OR_NETWORK = "无需修改"   # Python 跑在电脑上，不需要 WiFi
DEVICE_NAME = "my-python-sensor"
# ↑↑↑ 改完即可运行 ↑↑↑

client = mqtt.Client(DEVICE_NAME)
client.connect(SERVER_IP, 1883)

while True:
    # 模拟传感器数据（替换成你的真实读数）
    data = {
        "temperature": round(random.uniform(20, 30), 1),
        "humidity": round(random.uniform(40, 70), 1)
    }
    # 发送数据到 topic "sensors/<设备名>/data"
    client.publish(f"sensors/{DEVICE_NAME}/data", json.dumps(data))
    print(f"已发送: {data}")
    time.sleep(10)  # 每 10 秒发一次
```

运行后会持续输出 `已发送: {'temperature': 25.3, 'humidity': 60.5}`，说明数据正在发送。

#### ESP32 + Arduino（C++）

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// ↓↓↓ 改成你的实际值 ↓↓↓
const char* ssid       = "YOUR_WIFI_NAME";       // WiFi 名称
const char* password   = "YOUR_WIFI_PASSWORD";    // WiFi 密码
const char* mqtt_server = "192.168.1.100";        // NeoMind 服务器 IP
// ↑↑↑ 改完即可烧录 ↑↑↑

const int mqtt_port = 1883;
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("连接 WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println(" WiFi 已连接");

  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    Serial.println("连接 MQTT...");
    client.connect("esp32-sensor-01");
    delay(2000);
    return;
  }

  // 读取传感器（这里用模拟值代替，换成你的真实传感器代码）
  float temp = 25.0;  // ← 改成你的传感器读数

  // 发送数据
  char msg[64];
  snprintf(msg, 64, "{\"temperature\": %.1f}", temp);
  client.publish("sensors/esp32-01/data", msg);
  Serial.print("已发送: ");
  Serial.println(msg);

  delay(5000);  // 每 5 秒发一次
}
```

#### 其他平台

任何支持 MQTT 的语言/平台都可以。核心就两步：

```
1. 连接:  mqtt_connect("<服务器IP>", 1883)
2. 发送:  mqtt_publish("sensors/my-device/data", '{"value": 23.5}')
```

### 第 3 步：审批设备（在 Web UI 中操作）

设备第一次发送数据后，会进入「待审批」。这是 NeoMind 的安全机制——防止未知设备随意接入。

**操作路径**：Web UI → **Devices → Pending Devices** 标签页

<img src="https://resources.camthink.ai/NeoMind/devices-pending.png" alt="Pending Devices 标签页 — 等待审批的草稿设备" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

1. 看到新设备后，点击行尾的 **Actions → Process**（操作 → 处理），弹出审批对话框：

<img src="https://resources.camthink.ai/NeoMind/device-approve-dialog.png" alt="审批对话框 — 设备信息、检测指标、原始数据、注册表单" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

审批对话框分为以下几个区域：

**① 设备信息** — 显示草稿的基本信息：

| 字段 | 说明 |
|------|------|
| Device ID | 系统自动生成的设备唯一标识 |
| Source | 数据来源（MQTT / Webhook） |
| Samples | 已采集的样本数（如 `3 / 10`） |

**② 检测到的指标（Metrics）** — 系统自动从样本数据中解析出的指标列表：

| 字段 | 说明 |
|------|------|
| Path | 指标在 JSON 中的字段路径（如 `temperature`） |
| Display Name | 指标显示名称，**可编辑**（如改成"温度"） |
| Data Type | 数据类型：String / Integer / Float / Boolean |
| Unit | 单位，**可编辑**（如 `°C`、`%`） |

> 点击指标区域的 **Edit** 按钮可以修改显示名称、数据类型和单位。

**③ 原始数据（Original Data）** — 展示设备实际发送的 JSON 样本（最多 5 条），可以点击标签页切换查看，帮助你理解数据结构。

**④ 注册表单** — 需要你填写：

| 字段 | 必填 | 说明 |
|------|------|------|
| **Device Name**（设备名称） | ✅ | 给设备起个易识别的名字，如"客厅温湿度传感器" |
| **Device Type**（设备类型） | ✅ | 搜索已有类型或创建新类型（见下方说明） |

> **设备类型怎么选？**
>
> 输入框会自动搜索并推荐匹配的已有类型，每个推荐会显示**匹配度评分**。你有两种选择：
>
> - **使用已有类型**：从推荐列表中选择，适用于标准设备（如 `temp_sensor`）
> - **创建新类型**：如果没有匹配的，直接输入新类型名称。此时需要额外填写：
>   - **Type Name**（类型名称，必填）
>   - **Description**（类型描述，选填）
>
> NeoMind 会用检测到的指标自动为新类型生成 metrics 定义。

2. 填写完毕后，点击 **Confirm Register**（确认注册）

也可以用 CLI 审批：

```bash
# 查看待审批列表
neomind device drafts list

# 审批并命名
neomind device drafts approve <DRAFT_ID> --name "客厅温湿度传感器" --type temp_sensor
```

审批后，设备会出现在 Device List 标签页中：

<img src="https://resources.camthink.ai/NeoMind/devices-list.png" alt="Device List 标签页 — 已接入的设备" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

:::tip 觉得手动审批太麻烦？
开启自动审批，设备发数据后自动通过（适合测试环境）：

```bash
neomind device drafts config --auto-approve true
```
:::

### 第 4 步：验证数据

```bash
# 查看设备列表
neomind device list

# 查看具体设备的最新数据
neomind device get <DEVICE_ID>
```

也可以在 Web UI → **Devices → Device List** 中点击设备查看实时数据曲线：

<img src="https://resources.camthink.ai/NeoMind/device-detail-telemetry.png" alt="设备详情页 — 实时遥测数据曲线" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

---

## 其他接入方式

### 手动注册（Manual Add）

适合场景：已有明确的设备信息，想跳过自动发现直接注册；或者需要使用自定义设备类型。

#### 操作步骤

1. **打开添加设备对话框**：Web UI → **Devices → Device List** → 点击右上角 **Add Device** 按钮

   弹出的对话框左侧有三个标签页：

   | 标签 | 用途 |
   |------|------|
   | **BLE Provision** | 通过蓝牙配网 CamThink 硬件（NE101/NE301） |
   | **Manual Add** | 手动填写设备信息 ← 选这个 |
   | **Auto Discovery** | 查看自动发现的使用说明 |

2. **点击 Manual Add**，右侧出现注册表单：

<img src="https://resources.camthink.ai/NeoMind/device-manual-add-mqtt.png" alt="Manual Add 对话框 — MQTT 模式：设备类型、ID、名称、连接设置" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

#### 字段说明

**设备信息区域**：

| 字段 | 必填 | 说明 |
|------|------|------|
| **Device Type**（设备类型） | ✅ | 选择设备的模板类型（下拉列表）。决定设备上报哪些指标、支持哪些指令。详见下方解释 |
| **Device ID**（设备 ID） | 自动生成 | 系统自动生成 10 位随机 ID，可点刷新按钮重新生成，也可手动修改 |
| **Device Name**（设备名称） | 选填 | 给设备起个好认的名字。不填则默认用 Device ID |

**连接设置区域**——选择设备的通信方式：

| 选项 | 适用场景 |
|------|---------|
| **MQTT**（默认） | 支持双向通信，可收可发。IoT 传感器、嵌入式设备首选 |
| **Webhook** | 仅接收数据（单向）。只能发 HTTP POST 的设备用这个 |

- 选 **MQTT** 时会显示当前内置 Broker 的连接信息（地址、端口、协议、是否需要认证），以及自动生成的遥测 Topic（`device/{类型}/{ID}/uplink`）和指令 Topic
- 选 **Webhook** 时会显示该设备专属的 Webhook URL 和可选的 Token（详见下方 [Webhook 接入](#http-webhook适合只能发-http-的设备)）

> **为什么必须选择设备类型？**
>
> 设备类型是设备的"模板"，它定义了：
> - **指标（Metrics）**：设备会上报哪些数据（如 `temperature`、`humidity`），包括字段名、数据类型、单位
> - **指令（Commands）**：设备支持哪些控制命令（如 `power_on`、`set_mode`）及参数定义
>
> NeoMind 收到设备数据后，需要根据类型模板来**解析和存储**数据。没有类型，系统就不知道 `{ "t": 25.3 }` 里的 `t` 代表什么，也就无法在仪表板上正确展示。
>
> 内置类型包括 CamThink 硬件（NE301 边缘 AI 相机、NE101 感知相机）和常见传感器类型。你也可以在 **Settings → Device Types** 创建自定义类型。

3. **填写完毕后点击 Add**，设备创建完成。此时设备状态为 **Disconnected**（未连接），等设备开始发数据后会自动变为 Online。

#### CLI 方式

```bash
# 查看可用设备类型
neomind device types list

# 创建设备（MQTT 模式）
neomind device create --name "我的传感器" --device-type temp_sensor --adapter-type mqtt

# 创建设备（Webhook 模式）
neomind device create --name "气象站" --device-type weather-station --adapter-type webhook

# 若无匹配类型，先创建自定义类型
neomind device types create \
  --name 'My Sensor' \
  --metrics '[{"name":"temperature","display_name":"Temperature","data_type":"Float","unit":"°C"}]'
```

---

### HTTP Webhook（适合只能发 HTTP 的设备）

:::note 与 MQTT 的区别
Webhook 是单向的——设备只能向 NeoMind 发数据，**不能接收指令**。如果你的设备支持 MQTT，优先用 MQTT。
:::

#### 操作步骤

1. **创建 Webhook 设备**：在 Manual Add 对话框的连接设置中选择 **Webhook**：

<img src="https://resources.camthink.ai/NeoMind/device-manual-add-webhook.png" alt="Manual Add 对话框 — Webhook 模式：Webhook URL 和 Token" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

   系统会自动生成该设备专属的 **Webhook URL**（格式：`http://<服务器IP>:9375/api/devices/<设备ID>/webhook`）。

2. **（可选）生成 Webhook Token**：点击 Token 旁边的钥匙图标自动生成 `whk_` 开头的令牌。如果设置了 Token，设备发数据时必须携带它用于身份验证。

3. **点击 Add 创建设备**，然后让设备向该 URL 发送 HTTP POST 请求：

```bash
curl -X POST http://192.168.1.100:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -d '{"data": {"temperature": 23.5, "humidity": 65}}'
```

#### 数据格式

Webhook 接收 JSON 格式的 POST 请求，只有 `data` 字段必填：

```json
{
  "data": {              // ✅ 必填：实际的传感器数据
    "temperature": 23.5,
    "humidity": 65
  },
  "timestamp": 1718534400,  // 选填：数据采集时间戳，不填用服务器时间
  "quality": 1.0            // 选填：数据质量（0~1）
}
```

#### 身份验证（可选）

如果创建设备时设置了 Token，请求时需要携带：

```bash
# 方式 1：Authorization 头（推荐）
curl -X POST http://<SERVER>:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer whk_你的Token' \
  -d '{"data": {"temperature": 23.5}}'

# 方式 2：URL 查询参数
curl -X POST 'http://<SERVER>:9375/api/devices/<DEVICE_ID>/webhook?token=whk_你的Token' \
  -H 'Content-Type: application/json' \
  -d '{"data": {"temperature": 23.5}}'
```

#### CLI 快捷方式

```bash
# 1. 创建设备
neomind device create --name "气象站" --device-type weather-station --adapter-type webhook

# 2. 查看 webhook URL
neomind device webhook-url <DEVICE_ID>
# 输出：POST http://<SERVER_IP>:9375/api/devices/<DEVICE_ID>/webhook
```

---

### 外部 MQTT Broker（已有 EMQX / Mosquitto）

如果你已有外部 MQTT Broker（如厂房里的 EMQX 集群），可以让 NeoMind 订阅它，无需让设备改连 NeoMind 内置 Broker。

#### Web UI 操作

1. **进入 Broker 管理**：Web UI → **Settings → Device Connections** → 点击 **MQTT** 卡片

   这里可以看到当前所有 MQTT Broker 实例，包括内置 Broker 的运行状态和连接信息：

<img src="https://resources.camthink.ai/NeoMind/settings-mqtt-brokers.png" alt="MQTT Broker 管理页 — 内置 Broker 实例列表与添加按钮" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

2. **添加外部 Broker**：点击 **Add Connection** 按钮，弹出配置对话框：

<img src="https://resources.camthink.ai/NeoMind/settings-broker-add-dialog.png" alt="添加外部 Broker 对话框 — 名称、地址、端口、认证" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

   | 字段 | 必填 | 说明 |
   |------|------|------|
   | **Instance Name**（实例名称） | ✅ | 给这个 Broker 连接起个名字，如"厂房EMQX" |
   | **Broker Address**（Broker 地址） | ✅ | 外部 Broker 的 IP 或域名，如 `emqx.local` |
   | **Port**（端口） | ✅ | 默认 `1883`，TLS 加密通常用 `8883` |
   | **Username**（用户名） | 选填 | 如果 Broker 启用了认证，填写用户名 |
   | **Password**（密码） | 选填 | 对应的密码 |
   | **Client ID**（客户端 ID） | 选填 | NeoMind 连接 Broker 的标识，留空自动生成 |

3. **保存后测试**：添加后会自动尝试连接。在 Broker 卡片上可以看到连接状态，也可以点 **Test** 按钮手动测试。

#### CLI 操作

```bash
# 1. 创建外部 Broker 连接
neomind connector create --name "厂房EMQX" --host emqx.local --port 1883

# 2. 查看连接状态
neomind connector list

# 3. 测试连接是否正常
neomind connector test <ID>

# 4. 查看订阅的 topic
neomind connector subscriptions
```

连接成功后，外部 Broker 上符合 `device/+/+/uplink` 格式的消息会被 NeoMind 自动接收并处理。未知设备仍会进入 Pending 审批流程。

## 向设备下发指令

MQTT 方式接入的设备支持双向通信——可以远程控制：

```bash
# 语法：neomind device control <设备ID> <命令> --params '<参数JSON>'
neomind device control ac-01 power_on --params '{"mode": "cool", "temp": 24}'
```

指令通过 MQTT 发送到设备的 `{topic}/command`，设备订阅该 topic 即可接收。

## 设备状态说明

NeoMind 中设备会经历不同的生命周期阶段，每个阶段对应不同状态。

### 设备生命周期

```
新设备发送数据 → [Waiting Processing] → 审批通过 → [Online / Offline] → 可下发指令
                                         ↓
                                    审批拒绝 → 设备被丢弃
```

### 草稿状态（审批前）

设备第一次发送数据后、尚未审批时处于草稿阶段：

| 状态 | 含义 | 颜色标识 |
|------|------|---------|
| **Waiting Processing**（等待处理） | 设备已被自动发现，等待管理员审批 | 黄色 / 橙色 |

> 草稿设备不会出现在 Device List 中，只有在 **Pending Devices** 标签页可见。审批通过后才会正式注册为设备。

### 设备状态（审批后）

审批通过后，设备正式注册。根据连接情况，设备会在以下状态间切换：

| 状态 | 含义 | 触发条件 | 颜色 |
|------|------|---------|------|
| **Online**（在线） | 设备已连接，正在正常发送数据 | 5 分钟内有数据上报 | 绿色 |
| **Offline**（离线） | 设备曾经连过，但当前已断开或超时 | 曾经上报过数据，但超过 5 分钟未收到新数据 | 黄色 |
| **Disconnected**（未连接） | 设备从未发送过数据 | 通过手动注册或 CLI 创建，但设备从未上线 | 蓝色 |

> NeoMind 判断设备在线的标准是 **5 分钟内是否有数据上报**。即使设备 MQTT 连接还在，如果超过 5 分钟没发数据，状态也会变为 Offline。
>
> **Disconnected** 常见于手动注册的设备——在 Web UI 中点了 Manual Add 或用 CLI `neomind device create` 创建了设备，但设备本身还没开始发数据。等设备第一次上报数据后，状态会自动变为 Online。

### 指令执行状态

通过 `neomind device control` 下发指令后，每条指令有自己的执行状态：

| 状态 | 含义 |
|------|------|
| **Pending**（排队中） | 指令已发出，等待设备响应 |
| **Executing**（执行中） | 指令正在发送给设备 |
| **Success**（成功） | 设备已确认执行 |
| **Failed**（失败） | 执行失败（设备拒绝或参数错误） |
| **Timeout**（超时） | 设备未在规定时间内响应 |

## 支持的设备类型

NeoMind 内置 CamThink 硬件类型。在 Web UI → **Settings → Device Types** 可查看和管理所有类型：

<img src="https://resources.camthink.ai/NeoMind/device-types.png" alt="设备类型管理页 — 内置与自定义类型" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

| 型号 | 名称 | 特点 |
|------|------|------|
| **NE301** | 边缘 AI 相机 | 视频流 + AI 推理 |
| **NE101** | 感知相机 | 图像 + 环境传感 |

完整定义见 [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)。

## 概念速查

| 术语 | 通俗解释 |
|------|---------|
| **MQTT** | 物联网通信协议，类似"设备群聊" |
| **Broker** | 消息中转服务器。NeoMind 内置了一个，不用额外安装 |
| **Topic** | 消息频道名，如 `sensors/temp`。设备发数据时自己定 |
| **Payload** | 消息内容，通常是 JSON 格式（如 `{"temp": 25}`） |
| **Draft（草稿）** | 设备首次发数据后进入的状态，需要人工审批才正式接入 |
| **Adapter** | 设备的连接方式：MQTT（双向）或 Webhook（仅接收） |
| **遥测（Telemetry）** | 设备上报的传感器数据（温度、湿度等） |
| **下行指令** | NeoMind 发给设备的控制命令（开关、调节参数等） |

## 常见问题

| 现象 | 可能原因 | 解决方法 |
|------|---------|---------|
| 设备发了数据但 Pending 里没出现 | MQTT 没连上 | 1. 确认 IP 和端口（1883）  2. `neomind system info` 检查 MQTT 状态  3. 确认自动发现开启 |
| `Connection refused` | 服务未运行或端口被拦 | 检查 NeoMind 是否在运行，防火墙是否放行 1883 |
| `Auth failed` | 启用了认证 | `neomind system info` 查看凭据，填入设备代码 |
| `TLS handshake failed` | 启用了 TLS | 设备改用 `mqtts://` 并信任 CA 证书 |
| 设备数据有但不显示曲线 | 设备类型不匹配 | 审批时选择正确的设备类型 |
| 审批后设备变 Offline | 设备断开了连接 | 检查设备是否还在运行、网络是否通 |

更多见 [故障排查](./10-troubleshooting.md)。

## 下一步

- [使用仪表板](./4-use-dashboard.md) — 将设备数据可视化
- [AI Chat](./5-ai-chat.md) — 用自然语言查询设备状态
- [自动化规则](./7-automation-rules.md) — 设定阈值告警与联动控制

---

*最后更新: 2026-06-16*
