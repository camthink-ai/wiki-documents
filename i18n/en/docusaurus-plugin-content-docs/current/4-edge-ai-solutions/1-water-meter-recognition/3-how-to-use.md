---
sidebar_label: "How to Use"
description: "From purchase to a running solution: requirements, install, device setup, model setup, configuration and verification."
---
# How to Use

## 3.1 Requirements

**Hardware**: NE101 × meters (with brackets); a Linux host running NeoMind (or NG4500); regular network.

**Software**: NeoMind ([install](/docs/neomind/user-guide/install-setup)); NE101 stock firmware; paddle-ocr-v6 + ne101_camera (marketplace).

## 3.2 Hardware Setup

**Step 1 — Mount**: official bracket, lens square to the digit wheels; mind condensation in wells (lens down or hooded).

**Step 2 — Power**: insert the 7.2V pack; battery life scales linearly with capture frequency (5/day ≈ 2.4–6.2 yr Wi-Fi, theoretical).

**Step 3 — Network**: pick Wi-Fi / Cat.1 / HaLow per site; ensure reachability to the NeoMind host.

## 3.3 Device Setup

**Step 1 — Access**: press the capture key 2s to open the NE101 AP; open its web page.

**Step 2 — Configure**: schedule, fill light, uplink address (stock firmware; see [NE101 dev guide](/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide)).

**Step 3 — Verify**: camera online, capture works, images reach the platform.

## 3.4 Install / Configure AI Model

**Step 1** — pick paddle-ocr-v6 (meter scenario, tiny tier default).
**Step 2** — install from the marketplace (with ne101_camera component).
**Step 3** — bind the camera component, set pipeline to paddle-ocr-v6, frame the digit-wheel ROI.
**Step 4** — trigger one capture and confirm the reading. Full walkthrough: [OCR use case](/docs/neomind/use-cases/camera-ocr).

## 3.5 Configure the Solution

```text
NE101 scheduled capture
   ↓ Webhook/MQTT
ne101_camera (ROI)
   ↓ processingExtensionId
paddle-ocr-v6
   ↓ Transform parse+validate
meter_reading metric
   ↓ rules / dashboard / Data Push
business systems
```

Rule suggestions (anomaly/leak/low-battery/offline): [automation rules](/docs/neomind/user-guide/automation-rules).

## 3.6 Verify the Result

```text
snapshot → dial detected → ROI hit → reading "001238" → meter_reading=1238
   → dashboard curve updates → business endpoint receives the push
```

If any link is missing, see [8. Troubleshooting](./troubleshooting).
