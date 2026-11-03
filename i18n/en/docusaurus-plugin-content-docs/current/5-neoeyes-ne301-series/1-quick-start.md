---
description: Complete getting-started guide for NeoEyes NE301 — covers device assembly, Web UI login, and the eight modules (Feature Debugging, Model Validation, Application Management, Hardware Management, Capture Settings, System Settings, Storage Management, Device Information) for deploying and debugging edge AI applications.
keywords: [NE301 quick start, NeoEyes tutorial, AI camera config, Web UI debugging, model deployment, MQTT config, Webhook push, edge AI, firmware upgrade, real-time inference]
tags: [Quick Start, NE301, User Guide, AI Debugging, Configuration]
---

# Quick Start

## Overview

This tutorial walks you through the NeoEyes NE301 from scratch: device installation, basic usage, configuration and debugging across the eight Web UI modules, model deployment, and data reporting.

> This guide applies to firmware **v4.3.1** (Web frontend 1.5.0.8). Older firmware versions may differ in UI and features — see the [Release Notes](https://github.com/camthink-ai/ne301/releases) for change details.

## Prerequisites

- One NE301 main unit (mainboard, battery compartment, housing)
- 4 x AA batteries, or an alternative DC / solar power supply
- Phillips screwdriver, mounting bracket and fixings
- Optional extensions: Cat-1 module, Wi-Fi HaLow module (requires a HaLow gateway), different lens modules
- A WiFi-capable phone or computer to access the device's Web UI

> Tip: The fully-assembled version comes with core firmware and a factory model pre-installed — just load the batteries to start debugging. If you have the dev-board version, make sure all expansion boards are firmly connected before assembling.

## Using the Device

### Powering On

Use a screwdriver to remove the NE301 rear cover, install the batteries according to the battery compartment layout, and wait for the blue light on the front of the camera to light up — this means the system has started successfully. Once confirmed, refit the rear cover. The device is now ready for configuration.

<div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup1.jpg" style={{ maxWidth: '48%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup2.jpg" style={{ maxWidth: '48%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Connecting and Logging In

The NE301 hosts a built-in WiFi AP that serves a Web UI for debugging model inference, parameters and features. The AP SSID follows the pattern `NE301{last 6 hex of MAC}`. Connect a phone or computer to this AP, then open a browser and navigate to `192.168.10.10` to reach the configuration page.

**Steps:**

1. **Confirm the device is on**: Briefly press the shutter button on the right side of the camera — if the indicator lights up, the device is running. During debugging, pressing the shutter makes the NE301 capture the current frame and upload it via your configured MQTT/MQTTS or Webhook endpoint.
2. **Wake and connect the WiFi AP**: Long-press the shutter button for about 2 seconds to wake the WiFi AP (the blue system indicator on the front lights up). Find the `NE301{last 6 hex of MAC}` hotspot in your WiFi list and connect — no password is needed. Once connected, open `192.168.10.10` in a browser to load the configuration page.

> A short press triggers a capture; a 2-second long-press wakes the WiFi AP. The AP enters sleep after being idle for a while — if the page disconnects, long-press again to wake it, or adjust the sleep timer under System Settings → Device Password.

3. **Log in**: The web page opens to the login screen. The username is the built-in `admin` (not editable) and the initial password is `hicamthink`, which can be changed under System Settings → Device Password. Enter the password to enter the main UI.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/login-en.png" alt="login page" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Module Overview

After logging in, the top navigation provides 8 modules covering everything from debugging to application integration and system management:

| Module | Path | Purpose |
|:---|:---|:---|
| **Feature Debugging** | `/device-tool` | Live preview, model management, inference params, power modes, media streaming, wakeup sources |
| **Model Validation** | `/model-verification` | Upload a local image for offline inference with the current model, returns JSON results |
| **Application Management** | `/application-management` | Data reporting channels: MQTT/MQTTS and Webhook |
| **Hardware Management** | `/hardware-management` | Image params (flip, ISP, grayscale) and supplement-light policy |
| **Capture Settings** | `/capture-settings` | Capture-upload pipeline: upload modes, storage location and record management |
| **System Settings** | `/system-settings` | Communication method, device password, firmware upgrade |
| **Storage Management** | `/storage-management` | SD card status, capacity, file management and storage policy |
| **Device Information** | `/device-information` | Device name, MAC, SN, HW/SW versions, power and communication |

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/feature-debugging.png" alt="Feature Debugging main UI" style={{ maxWidth: '720px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 1. Feature Debugging

The most frequently used module — integrates live preview, model deployment, inference tuning, power and operating modes, media streaming, and wakeup source configuration (PIR / Remote Control / Scheduled Capture).

### 1.1 First-time Guidance

The first time a phone or PC connects, a guided wizard appears (Select Model → inference params → wakeup source). Follow it for initial setup, or click Skip. The main Feature Debugging UI appears afterwards.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/guidance.png" alt="Guidance" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 1.2 Live Preview Toolbar

The toolbar at the top of the page controls the live view:

- **Reload**: Reload the live video stream.
- **Photo Capture**: Manually trigger a capture.
- **AI Inference**: Toggle real-time AI overlay (on by default).
- **Stream Info**: View current stream parameters.
- **Snapshot**: Save the current frame as a snapshot.
- **Fullscreen**: Fullscreen preview.

The device supports millisecond-level real-time inference on the live stream — preview the feed and verify AI results in real time on the Web UI via the local WiFi AP, with no cloud service required.

### 1.3 Model Management

The **Current Model** area shows the deployed model. The NE301 runs TFLite Int8 inference on the STM32N6 NPU; model packages come in two output-format suffixes: `_uf` (float32 output) and `_ui` (int8 output). The factory-preset model is a YOLOv8 Nano object detection model (COCO 80 classes, `_uf` / Float32 output variant). Click `upload / Choose File` to upload a new model package and replace it in one step — the new model takes effect immediately.

To train a model tailored to your own scenario, see [Training and Deploying YOLOv8 on STM32N6](./3-application-guide/0-model-training-and-deployment/0-model-training-and-deployment.md).

> Model packages must align with the firmware major version: v4.3.1 requires **4.x**-prefixed model packages — mismatched versions trigger a validation warning. The AI partition is now an 8MB A/B dual-slot layout, supporting larger models and slot switching.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/change-model.gif" alt="model replacement" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 1.4 Hot-reloading Inference Parameters

**Inference Settings** supports hot-reload — drag the slider or type a value and it takes effect immediately, no reboot:

- **NMS Threshold**: Non-Maximum Suppression threshold, range 0–100, default 50. Lower values suppress overlapping boxes more aggressively.
- **Confidence Threshold**: Range 0–100, default 20. Detections below this threshold are filtered out.

### 1.5 Power and Operating Modes

To balance performance against power draw, Feature Debugging exposes three performance-related settings:

- **Power Mode**:
  - `Full Speed Mode` (default): Full-load operation, highest inference FPS, highest power draw.
  - `Low Power Mode`: Reduced compute and clock — ideal for long-term, battery-powered duty.
- **Operating Mode**: Currently supports `Image Mode`; more modes will be added.
- **Work frequency**: CPU clock — `HSE 200 MHz` / `HSE 400 MHz` / `HSI 800 MHz` / `HSE 800 MHz` (default). Higher frequency = faster inference and higher power; lower frequency suits energy-saving scenarios.

> Tip: For long-running battery deployments, combine `Low Power Mode` + a lower Work frequency with the wakeup-source policy below to significantly extend battery life.

### 1.6 Media Streaming (RTMP / RTSP)

**Stream Settings** pushes the device feed to an external server via RTMP or RTSP, integrated directly into Feature Debugging — no CLI required.

- **Enable RTMP Service**: Master switch for streaming, off by default. When on, the streaming service **starts automatically at power-on** (including when entering config mode with a long press; capture-only wake-ups such as PIR / scheduled do not auto-start); turning the switch off while running stops the stream. URL / Secret Key and `connect` are disabled while the switch is off.
- **Stream Type**: Select `RTMP` or `RTSP`.
- **URL**: Stream server address (max 256 chars).
- **Secret Key**: Stream key (max 128 chars, show/hide toggle).
- **Status / Connection Duration**: Live connection state (disconnected / connected) and duration.
- With the switch on, click `connect` to start pushing immediately — status turns connected when successful; with it off, streaming waits for the next power-on.

> Advanced debugging can still use the CLI `rtmp_url <url> [stream_key]`. For a full live-streaming recipe, see [RTMP Video Streaming](./3-application-guide/8-rtmp-video-streaming.md).

### 1.7 Wakeup Source Configuration

Wakeup sources control what events wake the device from low-power sleep to capture a frame. There are three — IO Trigger-PIR, Remote Control, and Scheduled Capture — each enabled by a switch that expands into detailed settings.

#### IO Trigger-PIR

Triggers a capture via the PIR (passive infrared) sensor — suited for human-detection scenes like corridors and entrances. Configure after enabling:

- **Usage**: `Rising Edge` or `Falling Edge`, matching the sensor signal edge.
- **Sensitivity**: Range 0–255. Indoors 20–50 recommended; lower it outdoors to reduce false triggers from wind and motion.
- **Ignore Time**: Time window after a trigger during which the sensor does not respond (0–15) — prevents rapid repeat triggers.
- **Pulse Count**: Number of signal pulses required for a valid trigger (1–4); 2–3 filters out interference.
- **Window Time**: Time window for evaluating a valid trigger (0–3).

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/pir-config.png" alt="PIR trigger config" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

#### Remote Control

When enabled, the device accepts server-issued commands (remote capture, sleep, etc.) via the Data Receiving Topic configured under Application Management → MQTT. Leaving it on long-term adds network overhead — enable as needed.

Supported remote commands:

Capture:

```json
{
  "cmd": "capture",
  "request_id": "req-001",
  "params": {
    "enable_ai": true,
    "chunk_size": 0,
    "store_to_sd": false
  }
}
```

Sleep:

```json
{
  "cmd": "sleep",
  "request_id": "req-002",
  "params": {
    "duration_sec": 60
  }
}
```

#### Scheduled Capture

When enabled, supports two Capture Modes — click `confirm` after configuration to apply:

- **Interval**: Capture at a fixed interval.
  - **Interval Type**: `Normal` (regular interval) or `Scheduled` (planned interval).
  - **Interval**: Interval value, unit selectable in `minute` / `hour` / `day`.
  - The page shows **Next Capture** (next capture time) so you can verify the schedule.
- **Fixed Point**: Capture at fixed times of day — click `add` to add multiple time points (00:00–23:59).

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture.png" alt="Interval capture" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture-fixed.png" alt="Fixed point capture" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

Combine with PIR or other hardware triggers for a "scheduled patrol + event capture" hybrid strategy.

## 2. Model Validation

Model Validation lets you test the deployed model offline — no need to capture on-site. Click or drag to upload a local image (jpeg / png / jpg / webp) on the Model Validation page; the device runs inference with the current model, **overlays green detection boxes on the image**, and shows the JSON result (class, confidence, coordinates) below, so you can quickly evaluate model performance across scenes.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic1.png" alt="Model Validation upload entry" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic2.png" alt="Inference result (detection boxes + JSON)" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-validation.gif" alt="Model Validation demo" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 3. Application Management

Application Management configures the device's data reporting channel — **MQTT/MQTTS** or **Webhook**, switched via the top tabs. Choose by scenario: MQTT for bidirectional communication (reporting + remote control), Webhook for lightweight one-way data push.

### 3.1 MQTT/MQTTS

For scenarios that need bidirectional communication (data reporting + remote control commands).

- **Protocol**: Select `MQTT` or `MQTTS` (SSL-encrypted); choosing MQTTS expands the certificate options.
- **Server Address**: Domain or IP of the MQTT server.
- **Port**: MQTT default `1883`, MQTTS default `8883`.
- **Data Receiving Topic**: Topic the device subscribes to for server-issued remote commands.
- **Data Reporting Topic**: Topic the device publishes capture and inference data to.
- **Client ID**: Unique client identifier in the MQTT service.
- **QoS**: Quality of Service — `QoS 0` / `QoS 1` / `QoS 2`.
- **Username / Password**: Credentials for connection authentication.
- **CA Certificate** (MQTTS only): Upload the CA certificate to verify server identity.
- **Client Certificate** (MQTTS only): Upload the client certificate for mutual authentication.
- **Private Key** (MQTTS only): Upload the client private key for encrypted communication.
- **SNI (Server Name Indication)** (MQTTS only): For servers hosting multiple TLS certificates.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-mqtt.png" alt="MQTT config" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-mqtts.png" alt="MQTTS certificate config" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> For more on MQTT, see [MQTT Data Interaction](./3-application-guide/2-mqtt-data-interaction/2-mqtt-data-interaction.md).

### 3.2 Webhook

For scenarios that only need to push capture / inference data to your own service, without bidirectional communication. The device HTTP(S) POSTs data to a URL you specify — lighter to integrate than MQTT.

- **Enable Push**: Toggle Webhook push on/off.
- **Push Status**: Current enabled / disabled state.
- **HTTP(S) Push URL**: Server URL that receives the data — HTTP or HTTPS.
- **Authentication**: Auth method (e.g. None) per your server's requirements.
- **Custom CA Certificate**: For HTTPS, upload a self-signed CA cert; defaults to the built-in CA bundle (Using built-in CA bundle). Supports upload and Clear.
- **Test Push**: Send a test request to verify the URL and certificate.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-webhook.png" alt="Webhook config" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 4. Hardware Management

Hardware Management has two sub-modules — **Image Management** and **Lighting Management** — switched via the top tabs. The camera module connection status is shown at the top (Connection Status).

### 4.1 Image Management

Configures frame orientation and capture parameters:

- **Camera configuration**
  - **Flip Horizontal**: Mirror the frame horizontally — for installations that need a flipped image.
  - **Flip Vertical**: Flip the frame vertically.
  - **ISP mode**: Image Signal Processing mode — optimizes image quality for the lighting environment. Default `Outdoor / bright light`; switch based on your installation environment.
  - **Grayscale mode**: Black-and-white imaging — useful in low light or for texture-sensitive recognition; takes effect immediately.
- **Capture configuration** has moved to **Capture Settings** (see section 5), including skip frames / resolution / JPEG quality and upload parameters.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/image-management.png" alt="Image Management" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 4.2 Lighting Management

**Work Supplement Light** supports three modes:

- **Always On**: Light always on.
- **Custom**: On during a custom time range (e.g. 20:00–06:00).
- **Always Off**: Light always off.

- **Use as fill light while working**: When enabled, the light follows the flash configuration above for as long as the device is running, and runtime captures no longer toggle it; sleep-wakeup captures are unaffected. Off by default.

> Tip: The supplement light is only effective at close range; for power-sensitive scenarios, choose Always Off.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/lighting-management.png" alt="Lighting Management" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 5. Capture Settings

Capture Settings manages the full "capture → storage → reporting" pipeline, with two tabs: **Capture Config** and **Records**.

**Capture Config**

- **Capture Mode**: `Snap & Upload` / `Batch Upload` / `Scheduled Upload` / `Store Only`.
- **Storage Location**: `Auto` prefers the SD card with hot-plug auto-switching; without an SD card, records go to internal Flash with a total record limit of 16–256 (default 32) — the oldest records are removed when exceeded.
- **Storage Policy**: Wrap (oldest first) or Stop when full.
- **Upload Protocol / Upload Network**: Deliver via MQTT or Webhook; the upload network defaults to following the current communication type and only applies to low-power wake captures — configure the reporting channel under Application Management first.
- **Retry**: Failed uploads retry automatically; the max attempt count is adjustable (0 = unlimited).
- **Keep Uploaded Files**: Default 72000 hours (≈ keep permanently; records are only removed when storage is full or the record limit is reached); 0 deletes files immediately after a successful upload.

**Records**

Manage capture records by date: time-range filtering, batch delete and retry, image download (original / inference overlay). The captures directory is read-only in Storage Management → File Manager — manage records on this page.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/capture-settings.png" alt="Capture Settings" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> This is a module overview; field ranges and combinations are documented in the on-page hints.

## 6. System Settings

System Settings contains three sub-modules: **Communications**, **Device Password**, and **Firmware Upgrade**.

### 6.1 Communications

The NE301 supports WiFi, Cat-1, POE, and Wi-Fi HaLow communication options (depending on the hardware variant). **Change Communication Method** switches between them. With WiFi selected, the page auto-scans and lists nearby hotspots.

**WiFi connection flow**: Find the target hotspot in the scan list, click `connect` on the right, enter the password in the "Enter Wi-Fi Password" dialog and click `confirm`. The device always saves the most recent SSID and password.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-wifi.png" alt="WiFi scan list" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wifi-connect-password.png" alt="WiFi password input" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **WiFi**: Built into the standard version. Select a target hotspot, enter the password, and connect. The device always stores the most recent SSID and password. After connecting to an external network, the connected-network details show link and IP info (SSID / signal strength / channel / IP configuration); a **Region** setting (us / eu / jp / kr / cn) is available — pick the one matching your location.
- **Cat-1**: Requires a SIM card in the front-cover slot (most regions except North America are supported); once inserted, the page auto-reads the **IMEI**. Under Cellular, fill in **APN**, **Cellular Username**, **Cellular Password**, and **PIN Code** per your carrier, then choose **Authentication** (auth type), **Operator** (default Auto, manual PLMN selection supported), and **Roaming** (toggle). The **AT Commands** section lets you enter AT commands and click `Send` to test the modem response. After filling in the fields, click `save`, then `connect` to dial up; use `details` to view network registration details.
<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-cellular.png" alt="Cat-1 Cellular configuration" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **Wi-Fi HaLow** (802.11ah, for variants with the HaLow module): switch the communication method to `Wi-Fi HaLow` — the page provides the Region country code, HaLow network scan and IP configuration, plus radio parameters (**Radio Settings**: TX power, scan dwell, MCS, bandwidth, guard interval) and a power-save switch (off by default). A HaLow network requires a HaLow gateway; HaLow is hardware-mutually-exclusive with PoE / 4G — the device automatically disables the conflicting link when switching.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-halow.png" alt="Wi-Fi HaLow network scan" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>


- **POE** (Power over Ethernet): After plugging in the cable, the page shows "cable connected" and the power status (e.g. `POE_ONLINE`). IP acquisition supports DHCP (default, automatic) and Static (manual IP / mask / gateway / DNS). Network issues surface as specific error codes (e.g. `POE_STATUS_DHCP_FAILED`, `POE_STATUS_IP_CONFLICT`).

> Note: Switching communication methods or connecting to an external WiFi network may close the local WiFi AP and disconnect the current configuration page. After confirming the device has joined the target network, access it via the new network.

### 6.2 Device Password

#### Local WiFi Settings

- **WiFi Name**: Device hotspot name, following `NE301{last 6 hex of MAC}` — the MAC is on the housing label.
- **No hotspot password**: Since v4.3.1 the hotspot is always an open network and setting a password is no longer supported (a WiFi-chip limitation — with a password set on the AP, the STA cannot connect to networks); a password saved on older firmware stops taking effect after the upgrade.
- **Sleep Time**: Auto-off timer for the WiFi AP, with fixed tiers of Never / 10 / 20 / 30 minutes (default Never); the web login password (default `hicamthink`) is in Login Password below.

#### Login Password

- **Username**: Built-in, not editable.
- **Password**: Enter the current and new password to save. The rule is 8–32 chars; use letters, digits and symbols, and avoid weak passwords tied to device info.
- Show/hide toggle supported. If you forget the password, perform a Device Reset to restore factory settings and reset the password to `hicamthink` (reset clears all custom config — export a backup first).

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-pwd.png" alt="Device Password" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 6.3 Firmware Upgrade

The page top shows **Firmware Information** with six component versions (App / Web / AI model / FSBL / WakeCore / WiFi firmware; 4.x aligns with the firmware major version). App / Web are the routine upgrade targets; the WiFi firmware upgrade is auto-guided on version mismatch (pushing to the chip takes about 1–3 minutes — do not power off).

**How to upgrade**: Click **Import Firmware** and upload the matching `_pkg.bin` (App / Web / AI model / config file); FSBL / WiFi / bundle entries are under **Advanced Options**. For whole-device upgrades prefer the **bundle one-click upgrade** — upload a `*_bundle.bin` once; it supports partition-table migration and same-version skips. Download firmware per version from [GitHub Releases](https://github.com/camthink-ai/ne301/releases). Config imports are merged (missing keys keep device values); Export backs up the current config. Model import: see [1.3 Model Management](#_3-model-management).

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-import-advanced.png" alt="Import Firmware dialog and advanced options" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> **Upgrading from v2.1.0**: The partition table was redesigned — follow the official sequence or the Web interface becomes inaccessible; **MQTTS certificates / private keys are lost**, back them up first. See the [OTA Update Guide](https://github.com/camthink-ai/ne301/blob/main/Docs/NE301_v4.3.1_OTA_Update_Guide.md). Keep power stable during upgrades; a failed upgrade keeps the old version — the device will not brick.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-upgrade.png" alt="Firmware Upgrade" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 7. Storage Management

Storage Management handles the device's storage media — captures and inference results can be written to a local SD card so data is retained locally when the network is down.

- **Internal Flash**: Shows capacity and usage of the internal Flash, with a **File Manager** entry — browse, upload, delete and format files on the internal Flash and SD card from the browser; the `captures` directory is read-only there — manage records under Capture Settings → Records.
- **SD Card Status**: Whether an SD card is detected (Not Detected means none is inserted or recognized).
- **Capacity**: Used / total capacity (e.g. Used 0 GB / 0.00 GB).
- **Storage Policy**: Currently supports `Loop Coverage` — when the SD card fills up, the oldest data is overwritten automatically so recording continues uninterrupted.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/storage-management.png" alt="Storage Management" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 8. Device Information

Shows the device's core attributes:

| Field | Description |
|:---|:---|
| Device Name | Device name, default `NE301{last 6 hex of MAC}`, editable; uploaded in the `devName` field of the JSON report |
| MAC Address | Device MAC address |
| SN | Unique device identifier, used for identification and after-sales |
| Hardware Version | Hardware version |
| Software Version | Current firmware version |
| Camera Module | Camera module model |
| Function Extension Module | Extension module model, `--` if none |
| Memory Card | Storage card model and capacity, `--` if none |
| Power Supply | Battery shows level (high / mid / low, colored green / orange / red); external power (solar / USB / POE) shows constant power |
| Communication | Communication method: wifi / cat-1 / poe |

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-information.png" alt="Device Information" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Factory Reset

**Steps**

Quickly press the shutter button twice, then long-press for about 10 seconds — the device restores to factory defaults.

**What gets cleared**

A reset wipes all custom configuration, including:

- Custom models (restored to the factory-preset model)
- Network and communication settings (WiFi / Cat-1 / POE, etc.)
- All function parameters and the device password (the password reverts to the default `hicamthink`)

**Back up first**

A reset is irreversible. Before resetting, export the current configuration (`.json`) via System Settings → Firmware Upgrade → Export Firmware so you can restore it afterwards or deploy it across devices.
