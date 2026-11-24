---
id: ek410-http-api
title: HTTP API Reference
sidebar_position: 1
description: EK410 SoftAP / LAN HTTP API — device info, network, display, power and CT-Prov.
keywords: [EK410, HTTP API, REST, uploadFrame, getDevInfo, CT-Prov]
tags: [EK410, software guide, API]
---

# HTTP API Reference

The same HTTP API is served on SoftAP and on the STA IP:

- SoftAP: `http://192.168.4.1`
- STA: `http://{deviceIP}`

Conventions:

- Most handlers return a flat JSON object; errors are `{"code":1,"msg":"..."}`.
- **No authentication**: anyone who can reach the device may call every route (~32 open handlers on SoftAP and STA). Isolate the network or add an outer auth layer before mass deployment — see [`docs/security.md`](https://github.com/camthink-ai/EK410/blob/main/docs/security.md).
- JSON bodies ≤ 16 KB and ≤ 8 nesting levels (rejected before parse); CT-Prov bodies ≤ 4 KB.
- `GET /` serves the embedded Web console.

Authoritative field lists live in [`docs/api.md`](https://github.com/camthink-ai/EK410/blob/main/docs/api.md); this page covers integration-facing routes.

## Device Info

### `GET /api/v1/system/getDevInfo`

Full device status used by the Overview page:

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `devName` | string | Device name (≤ 32 bytes UTF‑8) |
| `deviceId` | string | 8-hex id |
| `devMac` | string | **STA** MAC (may differ from SoftAP SSID suffix — see provisioning note) |
| `softApSsid` / `softApPass` | string | Hotspot SSID / password while SoftAP is up (SSID from SoftAP MAC) |
| `fwVersion` / `panel` | string | Firmware / panel |
| `ip` | string | STA IP |
| `wifiConnected` / `wifiState` / `wifiSsid` | bool / string / string | Wi-Fi |
| `mqttConnected` / `mqttStarted` / `mqttReason` / `mqttLastError` | bool / … | MQTT |
| `httpServerUp` / `softapUp` / `bleProvUp` / `provisioned` | bool | HTTP / SoftAP / BLE / provisioned |
| `panelOk` / `displayBusy` | bool | Panel probe / refresh busy |
| `uptime_s` | number | Uptime seconds |
| `batterySense` / `batteryMv` / `batteryPercent` | number | Battery |
| `otaPartition` / `otaPendingVerify` | string / bool | OTA slot / pending verify |
| `otaState` / `otaError` | string | `idle` \| `running` \| `failed` (+ error) |
| `powerMode` / `sleepMin` / `wakeSec` | string / number / number | Power mode / cycle min / online window |

## System

| Method | Path | Notes |
| :--- | :--- | :--- |
| POST | `/api/v1/system/setDevInfo` | `{"devName":"..."}` (1–32 bytes UTF‑8) |
| POST | `/api/v1/system/setDevReset` | Reboot |
| POST | `/api/v1/system/setDevFactory` | Factory reset (config, BLE bonds, event log; keep `deviceId`) then reboot |
| POST | `/api/v1/system/setDevUpgrade` | HTTPS OTA `{"url":"https://..."}`; returns before download — poll `otaState` |
| POST | `/api/v1/system/uploadFirmware` | Raw `application/octet-stream` app image, 200 KB–4 MB, `Content-Length` required |
| GET / POST | `/api/v1/system/getEventLogMeta` / `eventLog` / `clearEventLog` | Event log meta, download, clear |
| GET / POST | `/api/v1/system/getPowerParam` / `setPowerParam` | `mode` / `sleepMin` / `wakeSec` / `wakeUrl` / `imageQuality`; only fields present change |
| POST | `/api/v1/system/sleepNow` | Deep sleep now; refused while SoftAP is up |
| GET | `/api/v1/system/getDiag` | Diagnostics: `heap` (internal / PSRAM free + largest block) and per-task `stackMin` (bytes) |

`setPowerParam`: `wakeSec` 30–600 (default 120); `sleepMin` 1–525600 for cycle; may return `sleepArmed` and `sleepDeferred` (`"softap"` / `"no_sta"`). See [Power Management](../2-user-guide/2-power-management.md).

:::caution Do not poll `getDiag` as status
Overview uses `getDevInfo`. Frequent polls leave TCP control blocks that fragment PSRAM and make large URL / native frames fail with `need …KB, max block …KB`. Call occasionally when debugging.
:::

## Network

| Method | Path | Notes |
| :--- | :--- | :--- |
| GET / POST | `/api/v1/network/getWifiParam` / `setWifiParam` | Password never returned (`hasPassword`); try-connect before NVS write |
| GET | `/api/v1/network/scanWifi` | AP scan |
| GET / POST | `/api/v1/network/getMqttParam` / `setMqttParam` | Password never returned; blank password keeps stored one only if host + username unchanged |
| POST | `/api/v1/network/testMqtt` | Connect probe (`connected` needs STA) |
| POST | `/api/v1/network/openSoftAp` / `closeSoftAp` | SoftAP; poll `softapUp` |
| POST | `/api/v1/network/openBleProv` / `closeBleProv` | BLE CT-Prov; optional `{idleSec}` |
| POST | `/api/v1/ctprov` | NeoLinker **CT-Prov/1** JSON envelope; also on STA IP |

See [Provisioning and Connectivity](../2-user-guide/0-softap-provisioning.md).

## Display

| Method | Path | Notes |
| :--- | :--- | :--- |
| POST | `/api/v1/display/renderText` | Full-screen text `{text,color,bg,scale}` |
| POST | `/api/v1/display/renderCanvas` | Canvas `{bg,items[]}` (≤ 48 items, ≤ 2 QR) |
| POST | `/api/v1/display/uploadFrame` | 960000-byte native 4bpp frame + full refresh |
| POST | `/api/v1/display/displayUrl` | Device fetch URL (native / JPEG / PNG; http and https) |
| POST | `/api/v1/display/proxyImage` | Device fetch image bytes for browser preview |
| GET | `/api/v1/display/getLastFrameMeta` | Snapshot meta |
| GET | `/api/v1/display/lastFrame` | Raw 960000-byte native frame |
| POST | `/api/v1/display/testPattern` | Six-color test pattern |

### Recommended Push Paths

- **Web console (SoftAP)**: `proxyImage` (or local / `lastFrame`) → browser Spectra 6 quantize → `uploadFrame`.
- **Platform / wake**: MQTT `display_url` or power `wakeUrl` → device `displayUrl`. No WebP on-device; **baseline JPEG only**; ≤5 redirects; size limited by largest PSRAM block — see [Displaying content](../2-user-guide/1-display-content.md).

### Snapshot and Concurrency

Successful user refreshes write `lastfrm` (erase skipped if unchanged). Full refresh ~20–40 s; one refresh at a time — busy replies `render busy`.

## Examples

```bash
curl http://192.168.4.1/api/v1/system/getDevInfo

curl -X POST http://192.168.4.1/api/v1/display/renderText \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello EK410","scale":3}'

curl -X POST http://192.168.4.1/api/v1/display/testPattern
```

## Related Pages

- [MQTT Protocol](./2-mqtt-protocol.md)
- [Display Panel Characteristics](../3-hardware-guide/1-display-panel.md)
- [Development Environment](./0-development-environment.md)
