---
id: ek410-mqtt-protocol
title: MQTT Protocol and NeoMind
sidebar_position: 2
description: EK410 NeoMind MQTT — connection parameters, topics, uplink formats and downlink commands.
keywords: [EK410, MQTT, NeoMind, protocol, commands]
tags: [EK410, software guide, MQTT]
---

# MQTT Protocol and NeoMind

EK410 joins NeoMind over MQTT as device type `ek410_Eink`. After Wi-Fi and MQTT are configured it appears pending approval; once approved, rules and agents can drive the device.

## Connection Parameters

| Item | Value |
| :--- | :--- |
| Device type | `ek410_Eink` |
| Client ID | `ek410-{deviceId}` |
| Uplink | `device/ek410_Eink/{deviceId}/uplink` |
| Downlink | `device/ek410_Eink/{deviceId}/downlink` |
| Transport | `mqtt` (TCP, default 1883) / `mqtts` (TLS; `tlsVerify` default true, optional custom CA) |
| Keepalive | 30 s (application telemetry heartbeat every 30 s) |
| Credentials | `getMqttParam` **never returns the password** — only `hasPassword`; re-enter the password after changing broker or username |

Topics are generated from `deviceId` and are read-only in the Web console. LWT publishes to the uplink topic (`type=status`, retain).

## Uplink Messages

Flat JSON with a `type` discriminator:

### Telemetry (`telemetry`, every 30 s)

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

### Status (`status`)

Online / offline (including LWT):

```json
{"type": "status", "state": "online", "clientId": "ek410-a1b2c3d4", "deviceId": "a1b2c3d4", "ts": 0}
```

### Command Ack (`cmd_ack`)

```json
{"type": "cmd_ack", "last_cmd": "render_text", "cmd_status": "ok", "detail": "queued", "deviceId": "a1b2c3d4", "ts": 42}
```

Display commands ack `queued` first, then a completion `cmd_ack`. Sleep that cannot start gets a follow-up `cmd_ack` with `error` (timer-driven sleep does not ack).

## Downlink Commands

JSON with `cmd` and optional `params` (or flat on the root). Every command gets a `cmd_ack`. Max command size 8192 bytes (auto reassembly); queue depth 4.

### Display

| `cmd` | Params | Behavior |
| :--- | :--- | :--- |
| `render_text` | `text` (`\n` lines, ≤10), `color`, `bg`, `scale` (default 3) | Full-screen text then refresh |
| `render_canvas` | Canvas JSON (same as HTTP `{bg, items[]}`) | Compose then refresh |
| `display_url` | `url` (≤511; native / JPEG / PNG, no WebP) | Fetch, decode, refresh |
| `clear` | `color` (optional, default white) | Solid fill then refresh |

### Device Management

| `cmd` | Params | Behavior |
| :--- | :--- | :--- |
| `ping` / `heartbeat` | — | Telemetry + `cmd_ack` (`pong`) |
| `reboot` | — | Ack then reboot |
| `sleep_now` / `sleep` | — | Ack then deep sleep (may fail with SoftAP up) |
| `set_power` | `mode` / `sleepMin` / `wakeSec` / `wakeUrl` / `imageQuality` (all optional) | Update power; only present fields change |

`mode`: `always` / `cycle` / `hibernate`; `wakeSec` 30–600 (default 120); `imageQuality`: `quality` / `speed`. See [Power Management](../2-user-guide/2-power-management.md).

### Example

```json
{"cmd": "display_url", "params": {"url": "https://example.com/frames/1600x1200.png"}}
```

For scheduled frames: set `cycle` with `sleepMin` and `wakeUrl` (optionally tune `wakeSec`).

## Refresh and Queue Limits

- Full refresh ~20–40 s; mid-refresh commands ack `error` / `render busy`.
- Full queue → `device busy`.
- MQTT may pause during OTA / large URL downloads and resume after.
- MQTT does not drive the status LED; online presence is telemetry + LWT.

## Related Pages

- [HTTP API Reference](./1-http-api.md)
- [Provisioning and Connectivity](../2-user-guide/0-softap-provisioning.md)
- [Power Management](../2-user-guide/2-power-management.md)
