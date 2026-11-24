---
id: ek410-quick-start
title: Quick Guide
sidebar_position: 1
description: Hands-on EK410 first use—unbox and charge, SoftAP, Web console, join Wi‑Fi, push the first image.
keywords: [EK410, quick start, SoftAP provisioning, Web console, e-paper signage]
tags: [EK410, quick start, provisioning]
---

# Quick Guide

<div align="center">
  <img src="/img/epaper-ek410-series/quick-start/hero-effect.webp" alt="EK410 display effect sample" style={{ maxWidth: '520px', width: '100%', height: 'auto' }} />
</div>

This page walks you from **unboxing to the first image on the panel**. Each step says which key to press, which button to click, and what “success” looks like. Field tables and deep troubleshooting live in the user guide.

You can also use the mobile app [NeoLinker](https://github.com/camthink-ai/NeoLinker) over BLE (long-press **PAGE**); advertise name **`EK410-XXXXXX`** (hyphen). See [Provisioning and connectivity](./2-user-guide/0-softap-provisioning.md).

Screenshots show the Web console in **English** (switch language on the System page if you prefer Chinese). Opening `http://192.168.4.1` on SoftAP and the STA IP after Wi‑Fi join is the same UI.

## What you will finish

1. Charge / power on and read the status LED;
2. Long-press **MAIN** for SoftAP, join the hotspot, open the Web console;
3. On **Network**, join home / office **2.4 GHz** Wi‑Fi;
4. (Optional) Enter NeoMind MQTT and test;
5. On **Display**, use one of three tabs (**Image / Editor / Markdown**); day one starts with **Image**.

About **10–15 minutes** of clicking (plus 25–35 s for one full refresh).

## Unbox and prepare

Typical package: e-paper unit ×1, desktop support rod ×1, USB Type-C cable ×1, digital manual.

| Item | Notes |
| :--- | :--- |
| EK410 unit | Prefer a **partial/full Type-C charge** before a long demo |
| Support rod (optional) | Desktop stand; wall mount is fine—keep Type-C / TF reachable |
| Phone or PC | Wi‑Fi + Chrome / Safari / Edge |
| 2.4 GHz Wi‑Fi | Note **SSID** and **password** (scan is 2.4 GHz; brochure band list subject to delivered hardware) |

### Buttons and ports

Locate controls on the top edge, back, and bottom edge:

<div align="center">
  <img src="/img/epaper-ek410-series/quick-start/interfaces.png" alt="EK410 buttons and ports" style={{ maxWidth: '640px', width: '100%', height: 'auto' }} />
</div>

| Label in diagram | Location | Firmware name | Day-one use |
| :--- | :--- | :--- | :--- |
| **Button** | Top edge | **MAIN** | Hold ~2.5 s → SoftAP; short-press from deep sleep → wake into SoftAP |
| **Reset** | Top pinhole | **RESET** | Hardware reset |
| **Switch button** | Back side key | **PAGE** | Hold ~2.5 s → BLE (skip for this tutorial) |
| **LED** | Bottom edge | Status LED | See **Status LED** below |
| **USB-C** | Bottom edge | Charge / debug | Charging; UART when developing |
| **Micro SD Card** | Bottom edge | TF slot | Optional storage |

**BOOT** is for service / factory recovery—skip on first use. GPIO and partitions: [Hardware specifications](./3-hardware-guide/0-specifications.md).

#### Button actions

| Key | How to press | What the device does | LED |
| :--- | :--- | :--- | :--- |
| **MAIN** (Button) | **Hold ~2.5 s**, then release | Opens SoftAP hotspot + Web console; closes BLE first if it was up | **Blue blink** |
| **MAIN** | **Short press** (while awake) | No provisioning action; LED unchanged | Unchanged |
| **MAIN** | Deep sleep: **short or long press** | Wakes and enters SoftAP | **Blue blink** after wake |
| **PAGE** (Switch) | **Hold ~2.5 s**, then release | Opens BLE CT-Prov (NeoLinker); **hold again** to close BLE | **Cyan blink** while open |
| **PAGE** | **Short press** (while awake) | No page-turn feature yet; LED unchanged | Unchanged |
| **PAGE** | Deep sleep: **short or long press** | Wakes and enters BLE | **Cyan blink** after wake |
| **MAIN + PAGE** | **Hold both ~6 s** (releasing early cancels) | Factory reset (keeps `deviceId`), then reboot | **Red fast blink**, then reboot |
| **RESET** (pinhole) | Brief press / poke | Hardware reset; exits SoftAP / BLE; restores last e-paper frame (CamThink logo if empty) | May go off during reset, then follow boot LED rules |
| **BOOT** | Hold ~50 ms at power-on | Factory reset (service). **Holding through reset** enters ROM download mode | Do not use on day one |

:::tip Two rules to remember
Day-one Wi‑Fi setup: **hold top-edge MAIN ~2.5 s → blue LED**. For BLE: **hold back PAGE ~2.5 s → cyan LED**. SoftAP and BLE **cannot run at the same time**.
:::

#### Status LED

Bottom-edge **LED** is an RGB status light (driven by an I/O expander). **MQTT does not change the LED**—use Overview / Network badges. Short presses on MAIN / PAGE do **not** flash blue/cyan; only long-press provisioning claims those colors.

| Color / pattern | Meaning | What you should do |
| :--- | :--- | :--- |
| **Solid green** | Running normally: STA joined, or idle not yet provisioned | Never provisioned → hold MAIN for SoftAP; already on LAN → open `http://<STA-IP>` |
| **Blue blink** (~1 Hz) | SoftAP is on | Join `EK410_<MAC6>` (**SoftAP MAC** suffix — often differs from STA `devMac` by the last octet), open `http://192.168.4.1` |
| **Orange blink** (~1 Hz) | Connecting / reconnecting to home Wi‑Fi (when SoftAP is off) | Wait; if it stalls, fix password on Network or move closer to the AP |
| **Cyan blink** (~1 Hz) | BLE CT-Prov window open | Use NeoLinker; or hold PAGE again to exit; or hold MAIN to switch to SoftAP |
| **Red short blink / pulse** | Transient fault (SoftAP / BLE open failed, OTA / panel error, …) | **Never stays solid**; check whether green / blue / orange returns; if it repeats, Event log or UART |
| **Purple fast blink** (~4 Hz) | OTA firmware update in progress | **Do not unplug**; wait for reboot |
| **Off** | Deep sleep: LED and panel power cut; image remains on the e-paper | **Short-press MAIN** → SoftAP, or short-press PAGE → BLE |

:::note
- While SoftAP is up, expect **blue blink** first (even if STA is also joining). Do not use “no orange” to judge Wi‑Fi success—use Connected + IP on the Web UI.
- BLE idle timeout (~2 minutes) exits normally; afterward you usually get solid green (online) or orange (joining)—**not** sticky red.
- During the long boot panel paint (~tens of seconds) the LED may stay off briefly, then follow the table—normal.
:::

## 1. Power on and confirm the unit is awake

**Do this:**

1. Plug the included Type-C cable into a charger (or confirm battery charge).
2. Wait for the **CamThink** logo boot screen (full refresh is slow—normal).
3. Match the bottom LED to **Status LED** above; common day-one states:

| LED | Next |
| :--- | :--- |
| Solid green | Never provisioned → step 2 SoftAP |
| Blue blinking | SoftAP already on → step 3 |
| Orange blinking | Connecting / reconnecting Wi‑Fi → wait, or fix password later on Network |
| Cyan blinking | BLE open → long-press PAGE to exit, or use NeoLinker |
| Off | Deep sleep → **short-press MAIN** to wake (enters SoftAP), then continue |

**Success:** Boot art on the panel, or an LED that is not stuck off.

## 2. Long-press MAIN to start SoftAP

**Do this:**

1. Find **MAIN**, **hold ~2.5 seconds**, then release (too short = no hotspot).
2. LED should be **blue blinking**.
3. Panel should show a provisioning guide: large text + **QR code** (scan opens the console URL).

Hotspot rules (fixed):

:::info SoftAP parameters
- **SSID**: `EK410_<MAC6>` (**SoftAP interface MAC** last 3 bytes, uppercase hex; matches the panel — often differs from Overview STA `devMac` by the last octet)
- **Password**: `12345678`
- **Console**: `http://192.168.4.1` (http only—no https)
- **Timeout**: ~**2 minutes** idle closes SoftAP (HTTP access extends); even with a client, ~**15 minutes** hard cap → long-press MAIN again
:::

**Success:** Blue blink + provisioning guide / QR on the panel.

## 3. Join the hotspot and open the Web console

**Do this:**

1. On phone/PC **Wi‑Fi settings**, join `EK410_XXXXXX` with password `12345678`.
2. If the phone says “no Internet” and falls back to cellular:
   - **Turn off mobile data**, or
   - Choose **stay on this WLAN**.  
   Otherwise `192.168.4.1` will not load.
3. Browser → `http://192.168.4.1` → Enter.
4. You should see the CamThink EK410 console. Nav (left on desktop, bottom on phone): **Overview / Network / Display / System**.

### Glance at Overview

Open **Overview** (default):

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/quick-start/overview.png" alt="Overview page" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

Check:

| What you see | Meaning |
| :--- | :--- |
| Badge **Hotspot on** | SoftAP OK |
| **WLAN** disconnected | Expected before home Wi‑Fi |
| Orange **Configure network** | Goes to Network—next step |
| **Edit screen** | Goes to Display—for push |
| **Current panel** empty hint | Normal until first successful push |

:::tip Opening the console after Wi‑Fi join
When home Wi‑Fi works, Overview shows an **IP** (e.g. `192.168.31.241`). Join that LAN and browse `http://that-IP`—**no SoftAP needed**.
:::

### Console map (four pages)

| Nav page | What is on the page | In this guide |
| :--- | :--- | :--- |
| **Overview** | Status badges, shortcuts, Current panel snapshot | Step 3 |
| **Network** | Left **Wi‑Fi**, right **MQTT**, bottom **Provisioning** | Steps 4–5 |
| **Display** | Top tabs **Image / Editor / Markdown** + shared preview tools | Step 6 |
| **System** | Preferences, Device info, Event log, Danger zone, Work mode, Name & update | Step 8 |

**Success:** Overview loads stably (not a blank timeout).

## 4. Configure home Wi‑Fi (required)

### What Network looks like

Open **Network** (or **Configure network** on Overview). On desktop you get three regions:

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network.png" alt="Network page default: list collapsed, Show networks visible" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| Region | Label | Role |
| :--- | :--- | :--- |
| Left | **Wi‑Fi** | Scan, SSID / Password, **Save & connect** |
| Right | **MQTT** | NeoMind (optional—step 5) |
| Bottom | **Provisioning** | Toggle SoftAP / BLE from the page; mutually exclusive |

Wi‑Fi card controls:

| Control | Notes |
| :--- | :--- |
| Status bar | Green **Connected · SSID · IP** on success |
| **Show networks** / **Hide list** | **Interactive toggle**: collapsed = buttons only; expanded = nearby SSID list (label becomes **Hide list**) |
| **Refresh** | Rescan 2.4 GHz; button disables while scanning |
| **SSID** / **Password** | Manual entry OK; tapping a list row fills SSID; **Show** to verify password |
| **Save & connect** | **Tries ~10–20 s first; saves NVS only on success**; failure keeps a previous good password |

#### Show networks — expanded

By default the list is **collapsed** (image above). Click **Show networks** (or **Refresh**—a successful scan also opens the list) to pick an AP:

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network-scan-expanded.png" alt="Show networks expanded: nearby SSID list; tap a row to fill SSID" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| In the expanded state | Meaning |
| :--- | :--- |
| Button reads **Hide list** | List is open; click again to collapse |
| Each row: SSID + lock + signal bars | Clickable; **tap a row → SSID field fills** (current AP highlighted) |
| Scrollable list | Many APs—scroll; do not assume only the first screen |

**Do this in order:**

1. Open **Network** → left **Wi‑Fi**.
2. Click **Refresh** to scan; if the list stays closed, click **Show networks**.
3. **Tap** your 2.4 GHz SSID (fills the field), or type it.
4. Enter **Password** (blank for open nets).
5. Click **Save & connect**; wait **~10–20 s**—do not spam clicks.
6. Success: green **Connected · … · IP**; Overview **WLAN** badge turns connected.

**If it fails:**

| Symptom | Fix |
| :--- | :--- |
| Empty list | Move closer, Refresh again; enable 2.4 GHz on the router |
| Stuck orange “reconnecting” | Wrong password or weak signal—fix again |
| Phone online, device not | Disable AP isolation / guest Wi‑Fi; avoid 5 GHz–only SSIDs |
| Blue LED still blinking after save | SoftAP can coexist with STA (APSTA); trust Connected + IP on the card |

**Success:** Network shows Connected with an IP; opening that IP on the LAN is a plus.

## 5. (Optional) NeoMind MQTT

Skip to step 6 if you only need local push for now.

Stay on **Network**, right-hand **MQTT** card (same page as Wi‑Fi):

| Control | Notes |
| :--- | :--- |
| **Protocol** | **MQTT** or **MQTTS**; **not** inferred from port |
| **Broker** / **Port** | Platform host; MQTT often 1883, MQTTS often 8883 |
| **Client ID** | Read-only (`ek410-…`)—do not change |
| **QoS** | Keep **QoS 1** |
| **Username** / **Password** | Platform credentials; password is **never** read back |
| **MQTT topics** | Collapsible: expands to read-only **Uplink / Downlink** (from deviceId) |
| **Test connection** / **Save** | Needs home Wi‑Fi; SoftAP test may pause the page a few seconds |

After expanding **MQTT topics**:

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network-mqtt-topics.png" alt="MQTT topics expanded: read-only Uplink / Downlink" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**Do this:**

1. Choose **Protocol** → fill **Broker**, **Port**, **Username**, **Password**.
2. Open **MQTT topics** and confirm  
   `device/ek410_Eink/{deviceId}/uplink` and `.../downlink`.
3. Click **Test connection**, or **Save** and check the MQTT badge on Overview.
4. NeoMind → device list → find the unit → **Approve**.

:::note
- Changing broker or username requires re-entering the password.  
- Badge **MQTT deferred (heap)**: MQTT pauses during large downloads / OTA, then resumes.  
- Bottom **Provisioning** can also open/close SoftAP / BLE (same as the keys; mutually exclusive).
:::

Full fields: [Provisioning and connectivity](./2-user-guide/0-softap-provisioning.md).

## 6. Display page: three modes in detail + first push

Open **Display** (or **Edit screen** on Overview). The three top tabs are **mutually exclusive**; the logical canvas is always **1600×1200**. **Push** only sends the **active** tab’s preview.

| Tab | In one line | In this guide |
| :--- | :--- | :--- |
| **Image** | Full-screen JPG / PNG / WebP | **Required** (6.1) |
| **Editor** | Text + boxes + QR + partial images | Try once (6.2) |
| **Markdown** | Write Markdown → generate layout → push | Try once (6.3) |

### Shared top bar (all modes)

| Control | Role |
| :--- | :--- |
| **Original** | Source / design colors — **not** final ink |
| **E-ink 6** | Spectra 6 dither preview — **check before every Push** |
| **Layout guides** | Safe area, midlines, resolution badge |
| **Push to screen** | Full refresh ~**25–35 s** (up to ~40 s on some units) |

:::warning
While refreshing the API returns busy — **do not power off or spam Push**. On failure check **System → Event log**. Full field tables: [Displaying content](./2-user-guide/1-display-content.md).
:::

### 6.1 Image mode (full-screen) — required

**Best for:** posters, photos, full-bleed artwork. The browser quantizes to a six-color frame, then uploads.

Prepare a **JPG / PNG / WebP** (any orientation).

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-image.png" alt="Display · Image: Content preview + Image source" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**What you see:**

| Area | Notes |
| :--- | :--- |
| Center **Content preview** | 1600×1200; first open may show a sample gradient (*Sample · replace by upload*) — **not** auto-pushed |
| Right **Image source** | Upload, URL, Fit, load from panel |

**Image source controls:**

| Control | How to use |
| :--- | :--- |
| **Upload image** (Click or drop) | Local JPG / PNG / WebP |
| **URL** + **Load preview** | Device fetches via STA; on SoftAP the phone often has no Internet — **must use device fetch** |
| **Fit → Cover** | Fill, may crop |
| **Fit → Contain** | Full image, may letterbox — **use this first** |
| **Fit → Stretch** | Force fill, may distort |
| **Load from panel** | Pull saved panel art back into the preview |

**Steps:**

1. Top tab **Image**.
2. Upload a file, **or** paste a URL → **Load preview** (URL needs home Wi‑Fi).
3. Choose **Fit** (start with **Contain**).
4. Switch to **E-ink 6**; enable **Layout guides** if useful.
5. **Push to screen** → wait for the full refresh.
6. On Overview, confirm **Current panel** has a snapshot (**Refresh** if needed).

| If it fails | Try |
| :--- | :--- |
| URL fails on SoftAP | Join home Wi‑Fi, or upload locally |
| Big color mismatch | Were you on **E-ink 6** before Push? |
| Bad crop / letterbox | Switch Cover / Contain / Stretch |

### 6.2 Editor mode (canvas layout) — try once

**Best for:** meeting-room / desk signs — stack **text / boxes / QR / small images**. For a full-screen photo, go back to **Image**.

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-editor.png" alt="Display · Editor: tools + Layers + Properties" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**Regions:**

| Area | Role |
| :--- | :--- |
| Left tools / right **Quick add** | **Text**, **Image** (layer), **Box**, **QR code** |
| **Canvas → Background** | Page fill (one of six colors, e.g. White) |
| **Layers** | Select; **Up / Down / Delete** |
| **Properties** | Edit the **selected** layer (*Select a layer to edit* when none) |
| Drag on canvas | Reposition (*Drag to place*) |

**What each layer edits in Properties:**

| Type | Typical fields |
| :--- | :--- |
| **Text** | **Content**, **Color**, **X / Y**, **Scale** |
| **Box** | **Color**, position / size — bars and dividers |
| **QR code** | **URL** (link or text), position / size |
| **Image** (layer) | Upload / **Replace image** — partial paste, not Image-mode full-screen |

**Walkthrough (doorplate):**

1. Tab **Editor**; **Background** → White.
2. Add **Text** for the title → set Color / Scale → drag into place.
3. Add body **Text**; optionally a **Box** bar and a **QR** with a URL.
4. In **Layers**, keep text above boxes (Up / Down).
5. Check **E-ink 6** + **Layout guides**.
6. **Push to screen** and wait.

| Limit | Notes |
| :--- | :--- |
| Elements | Prefer ≤ **48**; QR ≤ **2** |
| Font | No color emoji — replaced with text symbols |
| vs Image | Switching tabs does **not** turn a full-screen photo into layers |

### 6.3 Markdown mode (notices) — try once

**Best for:** notices, agendas, bullet lists. Left = Markdown source; right = **mapped layout preview** — not Word-style live WYSIWYG.

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-markdown.png" alt="Display · Markdown: Write Markdown + Layout preview" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

:::important
Editing the left pane does **not** equal the final panel. Click **Generate preview**, trust the **right** Layout preview, then **Push to screen**.
:::

**Controls:**

| Control | Notes |
| :--- | :--- |
| **Background** / **Text** | Six-color fill and text |
| Editor | Type Markdown; replace the sample text if present |
| **Open file** | Load a local `.md` |
| **Paste** | Paste sample / clipboard |
| **Generate preview** | Map to the right preview (H1→large, paragraphs→body, lists→lines) |

**Syntax habits:**

| Write | Preview |
| :--- | :--- |
| `#` / `##` | Large / secondary headings |
| Paragraphs, `-` / `*` lists | Body / multi-line items |
| `![](url)` | Image insert (device must reach the URL; SoftAP-only often fails) |

Overlong content may **truncate** (toast): shorten text, then Generate again.

**Steps:**

1. Tab **Markdown**; set Background / Text.
2. Edit the box, or **Open file** / **Paste**.
3. **Generate preview** → inspect the right side; edit and regenerate as needed.
4. Confirm with **E-ink 6**.
5. **Push to screen** and wait.

**Success:** At least one successful **Image** Push with an Overview snapshot; walking through Editor and Markdown once is better. Full controls and troubleshooting: [Displaying content](./2-user-guide/1-display-content.md).

## 7. First-run checklist

- [ ] SoftAP opens; browser loads `192.168.4.1`
- [ ] Home 2.4 GHz Wi‑Fi shows Connected with an IP
- [ ] At least one successful Push; panel looks correct
- [ ] (If cloud) MQTT test OK; device approved in NeoMind
- [ ] (Optional) Tried Editor or Markdown once

## 8. Suggested next settings (System page)

Open **System**. Top to bottom you get several cards:

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/system.png" alt="System page card overview" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| Card | What you can change |
| :--- | :--- |
| **Preferences** | UI **Language** (中文 / English); **URL image: Quality / Speed** (on-device URL decode only; SoftAP local upload stays full-res) |
| **Device info** | Read-only: MAC, Firmware, Partition (`ota_0` / `ota_1`) |
| **Event log** | **Download log** / **Clear** (~48KB / 7 days) |
| **Danger zone** | **Reboot**, **Factory reset** (keeps `deviceId`) |
| **Work mode** | **Always on** / **Timed refresh** / **Hibernate**; **Save work mode**, **Sleep now** |
| **Name & update** (scroll further) | Device name (max 32 bytes); local `.bin` upload or HTTPS OTA URL |

| Goal | Where |
| :--- | :--- |
| Wake → refresh → sleep (signage) | **Work mode** → **Timed refresh** → set period (min) + online window (sec, default **120**) → **Save work mode** |
| Long idle | **Hibernate**, or **Sleep now** |
| Display name | **Name & update** → Device name → Save |
| Firmware | Upload `.bin` or HTTPS OTA URL; LED should be **purple fast blink** during OTA |

See [Power management](./2-user-guide/2-power-management.md), [System maintenance](./2-user-guide/3-system-maintenance.md).

## 9. Related pages

- [Provisioning and connectivity](./2-user-guide/0-softap-provisioning.md)
- [Displaying content](./2-user-guide/1-display-content.md)
- [Power management](./2-user-guide/2-power-management.md)
- [System maintenance](./2-user-guide/3-system-maintenance.md)
- [Hardware specifications](./3-hardware-guide/0-specifications.md)
- [Product Information](./0-overview.md)
