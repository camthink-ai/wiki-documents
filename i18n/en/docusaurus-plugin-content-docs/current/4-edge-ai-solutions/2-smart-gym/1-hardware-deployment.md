---
sidebar_label: "Hardware & Deployment"
description: "CamThink Smart Gym solution — built entirely on NeoEyes NE503 edge AI cameras: occupancy, equipment utilization and safety alerts."
---
# Hardware & Deployment

## Why NE503 Only

| Need | NE503 capability |
|---|---|
| Single-device end-to-end | capture → 20 TOPS NPU → event output in-camera ([overview](/docs/neoeyes-ne503-series/overview)) |
| Indoor / humid | IP67 |
| Simple wiring | PoE 802.3AT single-cable |
| Low light &lt;0.01 Lux | Sony IMX678 + AI-ISP full-color night vision |
| App updates | Containerized apps, web-console deploy/upgrade |

## Lenses & Placement

| Spot | Lens | Mount | App |
|---|---|---|---|
| Entrance | AF Lens (44.5°) | top-down on the lane | footfall counting |
| Equipment zone | Motorized zoom (110°) | ceiling over 4–6 machines | occupancy |
| Corridor (optional) | wide | corridor top-down | Person Detection fallback |

- Put the counting view at the narrowest point of the lane, away from turnstile occlusion
- Pick ceiling points with least occlusion; two cameras can complement in beam-dense rooms
- Glass-door backlight hurts accuracy — angle away

## Deploy in Three Steps

1. **Power & network**: PoE to the switch; web console address in [Quick Start](/docs/neoeyes-ne503-series/quick-start)
2. **Install apps**: web console → Applications → upload the Verified App `app.yaml` + `image.tar` ([deploy method](/docs/neoeyes-ne503-series/application-guide/verified-apps#deployment))
3. **Wire events**: apps emit on the Event Bus — point them at display/platform/system (see [Platform Configuration](./platform-configuration))

## Privacy

- Post signage; state purpose & retention in the membership terms
- The solution emits **counts/events only** — no face recognition, no individual tracking
- Keep event-snapshot retention ≤ 7 days (camera/platform settings)
