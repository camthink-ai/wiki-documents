---
sidebar_label: "Platform Configuration"
description: "CamThink water-meter recognition solution: NE101 cameras + on-host NeoMind OCR for automatic meter reading and business push."
---
# NeoMind Platform Configuration

Goal: devices online → snapshots & readings flow in → dashboards → alerts. Every step links to an in-wiki tutorial.

## 1. Device Onboarding

- NE101 snapshots arrive via **Webhook or MQTT**; NeoMind ships both endpoints (built-in broker), no extra middleware
- See [device onboarding](/docs/neomind/user-guide/onboard-device); first-seen devices land in the pending list for approval

## 2. Camera Component + OCR Pipeline

Add the `ne101_camera` component bound to the device, set its AI processing pipeline (`processingExtensionId`) to `paddle-ocr-v6`, configure the ROI — **capture → recognize → write back** is fully automatic. Full steps (with water-meter screenshots): [OCR use case §5](/docs/neomind/use-cases/camera-ocr#5-dashboard-configuration-camera--ocr-pipeline).

Readings land as a virtual metric (e.g. `meter_reading`) consumable by dashboards, rules and API.

## 3. Dashboard

- **Reading card**: latest value + update time
- **Trend**: daily/weekly consumption (reading deltas) — spot leaks and anomalies
- **Device health**: battery voltage, signal, last seen (NE101 telemetry)

Build guide: [Using dashboards](/docs/neomind/user-guide/use-dashboard).

## 4. Rules & Alerts

| Rule | Trigger (example) | Action |
|---|---|---|
| Reading anomaly | backward / out-of-range / low confidence | flag suspect, push review ticket |
| Usage anomaly | hourly delta > threshold (leak) | notify O&M instantly |
| Low battery | voltage < threshold | remind ~30 days ahead |
| Offline | no report for N cycles | check network/device |

Rules: [automation rules](/docs/neomind/user-guide/automation-rules); channels (email/IM/Webhook): [notifications](/docs/neomind/user-guide/notifications).
