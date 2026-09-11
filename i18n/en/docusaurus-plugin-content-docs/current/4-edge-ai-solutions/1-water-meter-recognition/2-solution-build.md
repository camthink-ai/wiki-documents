---
sidebar_label: "Solution Build"
description: "From purchase to production: product combination, build steps, business integration and boundaries."
---
# Solution Build

## Bill of Materials (product combination)

| # | Item | Spec | Qty | Purpose |
|---|---|---|---|---|
| 1 | **NE101 AI camera** | battery · scheduled capture · Wi-Fi/Cat.1/HaLow | 1/meter | dial capture |
| 2 | Meter bracket | official NE101 accessory | 1/meter | fixes lens-to-dial geometry |
| 3 | Platform host | Linux host / NG4500 running NeoMind | 1 | ingest, OCR, rules, egress |
| 4 | Battery | 7.2V high-capacity | 1/camera | power (5/day Wi-Fi ≈ 2.4–6.2 yr, theoretical) |

> Starter kit (≤10 meters): **one NE101 per meter + one Linux host**; growth only adds cameras.

## Build Steps

### ① Hardware installation

Official bracket, lens square to the wheels (< 10° off-axis); battery in; condensation care in wells; network configured to reach the NeoMind host.

### ② Device setup

Press the capture key 2s to open the NE101 AP → web page: schedule, fill light, uplink (stock firmware — [NE101 dev guide](/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide)). Platform side: [device onboarding](/docs/neomind/user-guide/onboard-device).

### ③ Recognition setup

Install **paddle-ocr-v6** + **ne101_camera** from the marketplace (tiny model built in, no GPU/internet). Add the camera component bound to the device, set the pipeline to paddle-ocr-v6, frame the digit-wheel ROI.

### ④ Verify

```text
snapshot → dial detected → ROI hit → reading "00123.8" → meter_reading=123.8
   → dashboard updates → business endpoint receives the push
```

Full walkthrough (water-meter screenshots): [OCR use case](/docs/neomind/use-cases/camera-ocr).

## Business Integration

**Pull (OpenAPI)**

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<id>/telemetry/latest?metric=meter_reading"
```

**Push (Data Push / Webhook)**: subscribe the reading metric — [Data Push](/docs/neomind/user-guide/7c-data-push); anomaly events via [notifications](/docs/neomind/user-guide/notifications) Webhook.

**Rule suggestions**: reading anomaly (backward/out-of-range/low confidence), leak (hourly delta), low battery, offline — [automation rules](/docs/neomind/user-guide/automation-rules).

**Field mapping**: meter ID ↔ device; reading ↔ `meter_reading`; time ↔ timestamp; evidence ↔ snapshot URL.

## Boundaries & Conditions

- Environment: dark sites need fill light; glare hurts OCR; lens square to wheels; dirt/condensation needs cleaning
- AI: mid-carry wheel states may flip digits (use a consecutive-consistency rule); pointer dials out of scope; blurred images lower confidence
- Recommended: bracket-spec distance, < 10° angle, wheel area ≥ 1/3 of frame, 1–4 captures/day
- **Not recommended**: pointer/mixed dials; unfixable glare; minute-level monitoring needs
