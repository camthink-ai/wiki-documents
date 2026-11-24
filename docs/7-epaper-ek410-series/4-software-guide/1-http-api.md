---
id: ek410-http-api
title: HTTP API Reference
sidebar_position: 1
description: EK410 的 SoftAP / 局域网 HTTP API 参考：设备信息、网络配置、显示刷新、电源管理与 CT-Prov。
keywords: [EK410, HTTP API, REST, uploadFrame, getDevInfo, CT-Prov]
tags: [EK410, 软件指南, API]
---

# HTTP API Reference

EK410 在 SoftAP 与局域网（STA IP）提供同一套 HTTP API。基址：

- SoftAP 模式：`http://192.168.4.1`
- STA 模式：`http://{设备IP}`

约定：

- 多数接口返回扁平 JSON 对象；错误格式统一为 `{"code":1,"msg":"..."}`。
- **接口没有鉴权**：能访问到设备的任何终端均可调用（热点与局域网相同，约 32 个开放路由）。量产请做网络隔离或外层鉴权；威胁面与建议见固件仓 [`docs/security.md`](https://github.com/camthink-ai/EK410/blob/main/docs/security.md)。
- JSON 请求体 ≤ 16 KB、嵌套 ≤ 8 层（超限在解析前拒绝）；CT-Prov 请求体 ≤ 4 KB。
- 未列出的根路径 `GET /` 返回内嵌 Web 控制台页面。

完整字段说明以固件仓 [`docs/api.md`](https://github.com/camthink-ai/EK410/blob/main/docs/api.md) / [`docs/zh/api.md`](https://github.com/camthink-ai/EK410/blob/main/docs/zh/api.md) 为准；本页覆盖集成常用接口。

## 设备信息

### `GET /api/v1/system/getDevInfo`

返回设备全量状态，Web 控制台概览页即基于此接口：

| 字段 | 类型 | 含义 |
| :--- | :--- | :--- |
| `devName` | string | 设备名（≤ 32 字节 UTF‑8） |
| `deviceId` | string | 8 位十六进制设备编号 |
| `devMac` | string | **STA** MAC（与 SoftAP SSID 后缀可能不同，见配网页说明） |
| `softApSsid` / `softApPass` | string | 热点名称 / 密码（热点开启时；SSID 基于 SoftAP MAC） |
| `fwVersion` / `panel` | string | 固件版本 / 面板型号 |
| `ip` | string | STA IP |
| `wifiConnected` / `wifiState` / `wifiSsid` | bool / string / string | Wi-Fi 状态 |
| `mqttConnected` / `mqttStarted` / `mqttReason` / `mqttLastError` | bool / … | MQTT 状态与失败原因 |
| `httpServerUp` / `softapUp` / `bleProvUp` / `provisioned` | bool | HTTP / SoftAP / BLE / 是否已配网 |
| `panelOk` / `displayBusy` | bool | 面板自检 / 刷新忙 |
| `uptime_s` | number | 运行秒数 |
| `batterySense` / `batteryMv` / `batteryPercent` | number | 电池采样与百分比 |
| `otaPartition` / `otaPendingVerify` | string / bool | 当前 OTA 分区 / 待验证标志 |
| `otaState` / `otaError` | string | `idle` \| `running` \| `failed`；失败时带错误 |
| `powerMode` / `sleepMin` / `wakeSec` | string / number / number | 电源模式 / 周期分钟 / 在线窗秒数 |

## 系统

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| POST | `/api/v1/system/setDevInfo` | 修改设备名 `{"devName":"..."}`（1–32 字节 UTF‑8） |
| POST | `/api/v1/system/setDevReset` | 重启 |
| POST | `/api/v1/system/setDevFactory` | 恢复出厂（清配置、BLE 配对与事件日志；保留 `deviceId`）后重启 |
| POST | `/api/v1/system/setDevUpgrade` | HTTPS OTA `{"url":"https://..."}`；下载前即返回，轮询 `otaState` |
| POST | `/api/v1/system/uploadFirmware` | 原始 `application/octet-stream` 镜像，200 KB–4 MB，需 `Content-Length` |
| GET / POST | `/api/v1/system/getEventLogMeta` / `eventLog` / `clearEventLog` | 事件日志元信息、下载、清空 |
| GET / POST | `/api/v1/system/getPowerParam` / `setPowerParam` | 电源：`mode` / `sleepMin` / `wakeSec` / `wakeUrl` / `imageQuality`；只改请求体中出现的字段 |
| POST | `/api/v1/system/sleepNow` | 立即深睡；SoftAP 开启时拒绝 |
| GET | `/api/v1/system/getDiag` | 诊断：`heap`（内部 / PSRAM 空闲与最大块）与各任务 `stackMin`（最小剩余栈，字节） |

`setPowerParam`：`wakeSec` 为 30–600（默认 120）；`sleepMin` 在 cycle 下为 1–525600；可能返回 `sleepArmed` 与 `sleepDeferred`（`"softap"` / `"no_sta"`）。详见[电源管理](../2-user-guide/2-power-management.md)。

:::caution `getDiag` 不要当状态轮询
概览用的是 `getDevInfo`。高频轮询会留下 TCP 控制块、切割 PSRAM 连续块，大图 URL / 原生帧更容易 `need …KB, max block …KB`。排障时偶发调用即可。
:::

## 网络

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET / POST | `/api/v1/network/getWifiParam` / `setWifiParam` | Wi-Fi；密码永不回传（`hasPassword`）；`setWifiParam` 先试连、成功才保存 |
| GET | `/api/v1/network/scanWifi` | 扫描 AP 列表 |
| GET / POST | `/api/v1/network/getMqttParam` / `setMqttParam` | MQTT；密码永不回传（`hasPassword`）；换 host/用户名时空密码不沿用 |
| POST | `/api/v1/network/testMqtt` | 探测 MQTT（`connected` 需 STA 在线） |
| POST | `/api/v1/network/openSoftAp` / `closeSoftAp` | SoftAP 开关（完成后轮询 `softapUp`） |
| POST | `/api/v1/network/openBleProv` / `closeBleProv` | BLE CT-Prov 开关；可选 `{idleSec}` |
| POST | `/api/v1/ctprov` | NeoLinker **CT-Prov/1** JSON 信封；STA IP 上同样可达 |

配网行为见[配网与连接](../2-user-guide/0-softap-provisioning.md)。

## 显示

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| POST | `/api/v1/display/renderText` | 全屏文字 `{text,color,bg,scale}` |
| POST | `/api/v1/display/renderCanvas` | 画布 `{bg,items[]}`（≤ 48 项，≤ 2 个二维码） |
| POST | `/api/v1/display/uploadFrame` | 上传 960000 字节原生 4bpp 帧并全刷 |
| POST | `/api/v1/display/displayUrl` | 设备拉取 URL（原生帧 / JPEG / PNG；http 与 https） |
| POST | `/api/v1/display/proxyImage` | 设备代拉图片字节供浏览器预览 |
| GET | `/api/v1/display/getLastFrameMeta` | 快照元信息 |
| GET | `/api/v1/display/lastFrame` | 读取 960000 字节原生帧 |
| POST | `/api/v1/display/testPattern` | 六色测试图案 |

### 推荐推图路径

- **Web 控制台（SoftAP / 浏览器）**：`proxyImage`（或本地上传 / `lastFrame`）→ 浏览器 Spectra 6 量化 → `uploadFrame`。
- **平台 / 唤醒路径**：MQTT `display_url` 或电源 `wakeUrl` → 设备 `displayUrl`。设备侧不支持 WebP；**仅 baseline JPEG**；URL 最多 5 跳；体积受 PSRAM 最大块约束（见[内容显示](../2-user-guide/1-display-content.md)）。

### 屏幕快照与并发

成功的用户刷屏会把原生帧写入 `lastfrm`（画面未变时跳过擦写）。全刷约 20–40 秒，同一时刻仅一个刷新任务，忙时返回 `render busy`。

## 调用示例

```bash
# 设备信息
curl http://192.168.4.1/api/v1/system/getDevInfo

# 全屏文字
curl -X POST http://192.168.4.1/api/v1/display/renderText \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello EK410","scale":3}'

# 六色测试图案
curl -X POST http://192.168.4.1/api/v1/display/testPattern
```

## 相关资料

- [MQTT 协议](./2-mqtt-protocol.md)：平台侧等效指令。
- [屏幕与显示特性](../3-hardware-guide/1-display-panel.md)：原生帧与色码格式。
- [开发环境](./0-development-environment.md)：自行编译固件。
