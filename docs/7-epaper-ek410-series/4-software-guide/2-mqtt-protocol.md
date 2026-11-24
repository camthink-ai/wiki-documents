---
id: ek410-mqtt-protocol
title: MQTT Protocol and NeoMind
sidebar_position: 2
description: EK410 的 NeoMind MQTT 协议：连接参数、主题约定、上行报文格式与下行指令全集。
keywords: [EK410, MQTT, NeoMind, 协议, 指令]
tags: [EK410, 软件指南, MQTT]
---

# MQTT Protocol and NeoMind

EK410 通过 MQTT 接入 NeoMind 平台。设备类型为 `ek410_Eink`，配置好 Wi-Fi 与 MQTT 后，设备会出现在 NeoMind 平台设备列表（待审批），审批后即可用平台规则与 Agent 驱动设备。

## 连接参数

| 项目 | 值 |
| :--- | :--- |
| 设备类型 | `ek410_Eink` |
| Client ID | `ek410-{deviceId}` |
| 上行主题 | `device/ek410_Eink/{deviceId}/uplink` |
| 下行主题 | `device/ek410_Eink/{deviceId}/downlink` |
| 传输 | `mqtt`（TCP，默认 1883）/ `mqtts`（TLS；`tlsVerify` 默认 true，可选自定义 CA） |
| Keepalive | 30 秒（应用层每 30 秒发一次遥测心跳） |
| 凭据回读 | `getMqttParam` **不返回密码**，仅 `hasPassword`；更换 broker 或用户名后需重新填写密码 |

主题由固件按 `deviceId` 自动生成，Web 控制台与配置接口中均为只读。遗嘱消息（LWT）发布到上行主题（`type=status`、retain）。

## 上行报文

上行 JSON 为扁平结构，用 `type` 区分三类报文：

### 遥测（`telemetry`，每 30 秒）

```json
{
  "type": "telemetry",
  "devName": "EK410-A1B2C3D4",
  "deviceId": "a1b2c3d4",
  "clientId": "ek410-a1b2c3d4",
  "rssi_dbm": -58,
  "heap_free": 120000,
  "uptime_s": 3600,
  "fwVersion": "1.3.10",
  "panel": "EK410 7.09\" 1600x1200 6c",
  "battery_percent": 85,
  "battery_mv": 4000,
  "hb": 1,
  "online": true,
  "ts": 3600
}
```

### 状态（`status`）

在线 / 离线状态（含 LWT）：

```json
{"type": "status", "state": "online", "clientId": "ek410-a1b2c3d4", "deviceId": "a1b2c3d4", "ts": 0}
```

### 指令回执（`cmd_ack`，每条下行指令执行后回复）

```json
{"type": "cmd_ack", "last_cmd": "render_text", "cmd_status": "ok", "detail": "queued", "deviceId": "a1b2c3d4", "ts": 42}
```

刷屏类指令先回 `queued`，完成后再回完成态 `cmd_ack`。休眠无法开始时会补发 `error` 的 `cmd_ack`（跟随请求命令；定时器触发的入睡不 ack）。

## 下行指令

下行报文为 JSON，指令放 `cmd` 字段，参数放 `params` 对象（也可直接平铺在根对象）。每条指令执行后都会回 `cmd_ack`。单条指令最大 8192 字节（超长报文自动分片重组），指令队列深度 4。

### 显示指令

| `cmd` | 参数 | 行为 |
| :--- | :--- | :--- |
| `render_text` | `text`（`\n` 分行，最多 10 行）、`color`、`bg`、`scale`（默认 3） | 全屏渲染文字后刷新 |
| `render_canvas` | 画布 JSON（与 HTTP `renderCanvas` 的 `{bg, items[]}` 一致） | 设备合成画布后刷新 |
| `display_url` | `url`（≤511 字符；原生帧 / JPEG / PNG，不支持 WebP） | 设备拉取 URL 解码后刷新 |
| `clear` | `color`（可选，默认白） | 全屏纯色填充后刷新 |

### 设备管理指令

| `cmd` | 参数 | 行为 |
| :--- | :--- | :--- |
| `ping` / `heartbeat` | — | 回一条遥测 + `cmd_ack`（`pong`） |
| `reboot` | — | 回执后重启 |
| `sleep_now` / `sleep` | — | 回执后立即深度睡眠（SoftAP 开启时可能失败并回 `error`） |
| `set_power` | `mode` / `sleepMin` / `wakeSec` / `wakeUrl` / `imageQuality`（均可选） | 更新电源配置；只改出现的字段 |

`set_power` 的 `mode`：`always` / `cycle` / `hibernate`；`wakeSec` 30–600（默认 120）；`imageQuality`：`quality` / `speed`。字段含义见[电源管理](../2-user-guide/2-power-management.md)。

### 典型交互示例

平台在内容变化时推送新画面：

```json
{"cmd": "display_url", "params": {"url": "https://example.com/frames/1600x1200.png"}}
```

定时换帧：电源模式设为 `cycle`，配置 `sleepMin` 与 `wakeUrl`（可选调整 `wakeSec`），设备每次唤醒自动拉取刷新。

## 刷新与队列约束

- 全刷约 20–40 秒，由显示任务异步执行；刷新进行中新指令回 `cmd_ack`（`error` / `render busy`）。
- 指令队列满时直接回 `cmd_ack`（`device busy`）。
- OTA / URL 大图下载期间 MQTT 可能暂时停止，结束后恢复。
- MQTT 不驱动状态灯；设备在线状态以遥测心跳与 LWT 为准。

## 相关资料

- [HTTP API 参考](./1-http-api.md)：`renderCanvas` 请求体与 URL 拉图格式。
- [配网与连接](../2-user-guide/0-softap-provisioning.md)：MQTT 参数配置。
- [电源管理](../2-user-guide/2-power-management.md)：`set_power` 字段语义。
