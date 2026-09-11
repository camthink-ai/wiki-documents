---
sidebar_label: "Platform Configuration"
description: "CamThink Smart Gym solution — built entirely on NeoEyes NE503 edge AI cameras: occupancy, equipment utilization and safety alerts."
---
# Platform Configuration

Two shapes by store scale:

## Shape A: single store, no server

Use each NE503's **web console**:

- Applications page manages start/stop & parameters (detection zone, reporting period)
- In-camera live view & stats ([NE503 dashboard](/docs/neoeyes-ne503-series/user-guide/dashboard))
- Events push via Event Bus / Webhook straight to the display or front desk
- Fits 1–3 cameras — **zero extra purchase**

## Shape B: multi-store / unified ops (+ NeoMind)

With 3+ cameras or multiple stores, run [NeoMind](/docs/neomind/product-overview/what-is-neomind):

### 1. Onboarding

NE503 events/metrics arrive over MQTT/Webhook — [onboarding](/docs/neomind/user-guide/onboard-device).

### 2. Metrics

| Metric | Source | Notes |
|---|---|---|
| `zone_occupancy` | Occupancy Monitor | hourly aggregation = utilization |
| enter/exit events | Person Detection | accumulated into footfall curves |
| `occupancy` | host rule | in − out |
| safety events | detection app | event-type, with snapshot |

Cleaning & cross-metric math via [Data Transforms](/docs/neomind/user-guide/7b-data-transforms) (overnight reset, drift correction).

### 3. Dashboard & Display

Big occupancy card, today/7-day curves, zone heat bars; store display via dashboard view-mode fullscreen ([dashboards](/docs/neomind/user-guide/use-dashboard)).

### 4. Rules

| Rule | Example | Action |
|---|---|---|
| Over capacity | occupancy > limit for 2 min | front-desk notify + display hint |
| Count drift | occupancy < 0 / spike | ops calibration ticket |
| Safety event | detection fires | multi-channel notify + snapshot |
| After-hours presence | occupancy > 0 post-close | duty notify |

See [automation rules](/docs/neomind/user-guide/automation-rules) and [notifications](/docs/neomind/user-guide/notifications).
