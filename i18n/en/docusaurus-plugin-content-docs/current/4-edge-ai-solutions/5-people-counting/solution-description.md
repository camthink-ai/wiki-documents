---
title: Solution Description
sidebar_label: "Solution Description"
sidebar_position: 1
description: "Line-crossing statistics solution built on NeoEyes NE301 and the line-crossing app: draw a line and count bidirectional traffic on-device, with customizable detection models, simple Type-C/PoE deployment, and window reports pushed straight to your business system via MQTT/Webhook at one-camera-per-site cost."
---

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/edge-ai-solutions/people-counting/index/people-counting-demo.webp" alt="Line Crossing app realtime page: a target crosses the counting line, IN/OUT counts update instantly and a crossing event is logged" style={{ maxWidth: '62%', height: 'auto' }} />
</div>

*Line Crossing realtime page: a target crosses the counting line → IN/OUT counts update instantly → the crossing event is logged. Everything runs on the camera itself.*

<!-- TODO (on-site capture): hero photo — NE301 mounted on site plus the app realtime view (counting line and IN/OUT statistics) -->

## Background

Demand for line-crossing counting spans sites of every kind: stores track entries and exits, corridors reveal flow direction, and facility gates need peak-hour analysis. Traditional approaches are all costly in their own way: gates and infrared beams require hardware plus construction work and still miss targets on wide passages; cloud video analytics charges per-camera subscriptions while footage leaves the local network; a self-hosted platform means servers, licenses and weeks of deployment.

Most sites don't need platform-grade precision. They need a solution that is **fast to deploy, low in cost, and working the same day**.

## Solution Overview

The idea: **one affordable camera plus one counting line turns "crossings" into structured data.**

Deploy a CamThink **NeoEyes NE301** edge AI camera (STM32N6, 0.6 TOPS, modular design) at the site and install the **line-crossing** app. All configuration happens in the web page: first deploy the detection model for your target and set the target class, then **two clicks draw the counting line** on the live view, drag the endpoints to fine-tune, and **swap IN/OUT direction** with one tap. The app runs object detection, multi-object tracking and line-crossing judgement on the camera, outputting bidirectional counts in real time; window reports are generated at the configured statistics period and pushed straight to your business system over **MQTT / Webhook** — no extra platform software.

What gets counted is decided by the **on-device detection model**: the camera ships with a person-detection model for footfall counting out of the box; for custom targets, **train a dedicated detection model for your scenario and deploy it to the camera** — training, quantization and deployment are fully open source, with zero changes to the solution code.

The whole loop closes on the camera: detection, counting and report generation in one device. Footage never leaves the local network — your business system only receives lightweight counting results.

<!-- TODO (on-site): solution architecture diagram — NE301 (line drawing / on-device counting) → MQTT/Webhook → business system -->

## Solution Components (BOM)

| # | Component | Model / Spec | Qty | Role |
|---|---|---|---|---|
| 1 | Edge AI camera | NeoEyes **NE301** (comm module per site: Wi-Fi 6 / Cat-1 / PoE) | 1 per site | On-device detection, tracking and line-crossing counting |
| 2 | line-crossing app | `.neapp` app package, delivered with the solution | 1 set | Line configuration, realtime statistics, window report generation |
| 3 | Power & network accessories | Type-C power / PoE; Wi-Fi AP / PoE switch / SIM card | As needed | Camera deployment kit |
| 4 | Business system receiver | MQTT broker (incl. MQTTS) or Webhook-capable HTTP service | 1 set | Receives window reports into business flows |

> Low-cost starting point: **1× NE301 (Type-C power + Wi-Fi) + the app package + any existing MQTT/Webhook receiver** completes a site — no gate construction, no server.

## Workflow

1. **Deploy the model and set the target** — upload the specified detection model for what you want to count (a Model Zoo example or your own trained model) and select the matching target class; the bundled person model counts footfall out of the box
2. **Define the counting line** — two clicks place the line with its outside direction, drag endpoints to fine-tune, save to apply
3. **On-device detection & tracking** — the camera detects and tracks targets continuously, producing stable trajectories
4. **Crossing judgement & counting** — a trajectory crossing the line counts as IN or OUT by direction; totals survive power loss
5. **Window statistics** — IN/OUT per period is summarized (configurable 1–1440 min) into window reports
6. **Report delivery** — reports are pushed via MQTT / Webhook; during outages they buffer within capacity and are re-sent best-effort after recovery

## Key Features

**Flexible deployment**

- **Draw to configure**: two clicks define the counting criteria — no calibration, no training, edits take effect immediately
- **Simple power and networking**: direct Type-C power supply, or PoE single-cable power plus Ethernet; comm module (Wi-Fi 6 / Cat-1 / PoE) selected per site
- **Self-contained on the camera**: the app runs on the camera itself — no server, no platform software; relocating a site is uninstall-and-reinstall

**Customizable detection models**

- **Self-trained model deployment**: train a detection model for your scenario and deploy it to the camera to count your own targets; training and deployment are fully open source
- **Model Zoo examples**: the official model library offers tuned vision models (PT / ONNX / TFLite) ready to download and use
- **Progressively improvable accuracy**: the bundled person model provides a usable baseline; keep training on field samples, optimizing and redeploying to raise accuracy iteration by iteration
- **On-device inference**: detection and counting run locally on the 0.6 TOPS NPU — no cloud dependency

**Low cost**

- **Starts at one camera**: no gates, no construction; deployed the same day
- **No cloud subscription**: counting results go straight into your existing systems — no per-camera fees, no video egress bandwidth costs
- **Data locality**: footage and counts remain on the local network, fully under your control

## Outcome

- Per-site cost is a single camera, producing data the day it is deployed — replaces manual tallies
- Switching scenarios requires only another detection model and a redrawn line; the statistics framework never changes
- In/out traffic lands in your system by window, giving scheduling, merchandising and efficiency analysis continuous data
- Accuracy is affected by mounting angle, lighting and target density; intended for traffic-trend analysis. Improve it iteratively by training on field samples and redeploying — always validate on site

## Learn More

- [Engineering Guide: scenarios / BOM / setup / data integration / operations](engineering-guide)
- [NeoEyes NE301 Product Overview](../../neoeyes-ne301-series/overview)
- [Model Training and Deployment (NE301 Application Guide)](../../neoeyes-ne301-series/application-guide/model-training) · [CamThink Model Zoo](https://www.camthink.ai/developer-center/models/)
- ne30x-app open-source repo: [github.com/camthink-ai/ne30x-app](https://github.com/camthink-ai/ne30x-app) · [app package Releases](https://github.com/camthink-ai/ne30x-app/releases)
