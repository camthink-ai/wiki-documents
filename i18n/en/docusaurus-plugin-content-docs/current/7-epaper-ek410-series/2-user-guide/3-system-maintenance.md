---
id: ek410-system-maintenance
title: System Maintenance
sidebar_position: 3
description: Device info, rename, event log, OTA upgrade, reboot, and factory reset step by step.
keywords: [EK410, system maintenance, OTA, firmware upgrade, factory reset]
tags: [EK410, user guide, maintenance]
---

# System Maintenance

The **System** page covers: preferences, device info, event log, dangerous actions, work mode, name & upgrade. Work mode details: [Power management](./2-power-management.md).

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/system.png" alt="System page" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

---

## Device information

In **Device information**:

| UI item | Meaning |
| :--- | :--- |
| MAC | STA MAC |
| Firmware | Current version (this wiki targets **1.3.10**) |
| Partition | Active OTA slot (`ota_0` / `ota_1`) |

More from `getDevInfo` (Overview uses it): `deviceId`, IP, Wi‑Fi/MQTT state, `batteryPercent`, `uptime_s`, `otaState`, `powerMode` / `sleepMin` / `wakeSec`, `softapUp` / `bleProvUp`, etc.

---

## Rename device: steps

1. Scroll to **Name & upgrade**.
2. Edit **Device name** (UTF‑8, **max 32 bytes**; longer returns error).
3. **Save**.
4. Overview title and MQTT telemetry `devName` update.

:::tip
Overview polling **does not** overwrite a name you are still typing.
:::

---

## Event log: steps

1. **Event log** shows usage (e.g. cap ~48KB / 7 days).
2. **Download log**: text file for provision / Wi‑Fi / MQTT / display / sleep issues.
3. **Clear**: erase log (UI shows error on failure).

Do not post passwords or sensitive data in public tickets—redact before sharing.

---

## OTA upgrade: two methods

### Method A: upload local firmware (recommended on site)

1. Prepare release `ek410.bin` (or official package).
2. **Name & upgrade** → **Choose file**, select `.bin`.
3. **Upload upgrade**.
4. Watch progress; LED should be **magenta fast blink**.
5. Reboot into new slot; bootloader rolls back if panel self-test fails or device unreachable.

### Method B: HTTPS URL

1. Host firmware at HTTPS URL (**HTTP OTA forbidden**).
2. Enter `https://...` in **OTA URL**.
3. **URL upgrade**.
4. API may return success before download starts—watch page status or poll `otaState`:
   - `running`: in progress;
   - `failed`: see `otaError`, UI shows failure;
   - success: reboot into new firmware.

| Mechanism | Notes |
| :--- | :--- |
| Dual partition | `ota_0` / `ota_1` 4MB each; failure keeps current system |
| Confirm | Panel self-test **and** device reachable (web up or STA online) before commit |
| MQTT | Pauses during large download, resumes after |

---

## Reboot

1. **Dangerous actions** → **Reboot device**.
2. Settings kept; wait for device on network before reopening console.

---

## Factory reset: steps and impact

Clears Wi‑Fi, MQTT, power settings, **BLE pairing**, and event log; **keeps `deviceId`** (NeoMind identity unchanged), then reboots. Re-provision required.

### Web

1. **Dangerous actions** → **Factory reset**.
2. Confirm per prompt.
3. After reboot, SoftAP or BLE again.

### Buttons (no web access)

| Method | Action |
| :--- | :--- |
| Both keys | **Hold MAIN + PAGE together ~6 s** (release mid-hold invalidates) |
| Boot BOOT | Within ~50 ms of power-on, BOOT (GPIO9) low → factory; service use. **Holding BOOT through reset enters ROM download mode**—do not confuse with factory reset |

---

## Related

- [Power management](./2-power-management.md)
- [HTTP API](../4-software-guide/1-http-api.md)
- [Development environment](../4-software-guide/0-development-environment.md)