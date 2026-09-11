---
sidebar_label: "Solution Build"
description: "From purchase to production: product combination, build steps, business integration and boundaries."
---
# Solution Build

## Bill of Materials (product combination)

| # | Item | Spec | Qty | Purpose |
|---|---|---|---|---|
| 1 | **NE503 AI camera** (entrance) | AF Lens 44.5° | 1/entrance | footfall counting |
| 2 | **NE503 AI camera** (zones) | Motorized zoom 110° | 1 per 4–6 machines | occupancy / safety |
| 3 | PoE switch | 802.3AT, ports = cameras + 1 | 1 | single-cable power+network |
| 4 | Platform host (optional) | Linux host with NeoMind | 1 for multi-store | aggregation & unified API |

> Starter kit (1 entrance + 2 zones): **3× NE503 + 1× PoE switch** — no server needed.

## Build Steps

### ① Hardware installation

Entrance top-down at the narrowest lane point (AF 44.5°); zones ceiling-mounted (110° over 4–6 machines); PoE to the switch; avoid backlight and occlusion.

### ② Device setup

Open the NE503 web console ([Quick Start](/docs/neoeyes-ne503-series/quick-start)); confirm online & image; frame detection ROIs.

### ③ Install AI apps

Console → Applications → upload **Verified Apps** (`app.yaml` + `image.tar`):
- **Occupancy Monitor** — zone head-count & occupancy (equipment zones)
- **Person Detection** — person events & alert linkage (entrances/corridors)

Deploy method: [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps#deployment)

### ④ Verify

```text
walk in → person event → occupancy +1 (display < 3s)
enter zone → zone_occupancy reported
wave test → alert channel receives notice + snapshot
```

## Business Integration

**Single store**: NE503 events push straight to your endpoint (Event Bus / Webhook, JSON by device_id).

**Multi-store / unified (+ NeoMind)**:
- Onboarding: [device onboarding](/docs/neomind/user-guide/onboard-device)
- Alerts — over-capacity, drift, safety, after-hours: [automation rules](/docs/neomind/user-guide/automation-rules)
- Data egress: [OpenAPI](/docs/neomind/developer-guide/rest-api) / [Data Push](/docs/neomind/user-guide/7c-data-push)
- Store display: dashboard view-mode fullscreen ([dashboards](/docs/neomind/user-guide/use-dashboard))

**Example: live occupancy push**

```json
{{"device": "gym-entrance-01", "metric": "occupancy", "value": 87, "timestamp": "2026-09-11T19:30:00+08:00"}}
```

## Boundaries & Conditions

- Environment: entrance backlight lowers counting; occlusion needs complementary cameras; 2.5–3.5 m mounting
- AI: no identity recognition/tracking (privacy by design); dense overlapping crowds undercount; behavior events need custom models
- **Not recommended**: identifying *who*; sites where PoE cabling is impossible
