---
sidebar_label: "AI Model"
description: "CamThink Smart Gym solution — built entirely on NeoEyes NE503 edge AI cameras: occupancy, equipment utilization and safety alerts."
---
# AI Model

Apps are managed as **containers** on NE503; this solution uses official validated apps only — no training required.

## Two Core Apps, Out of the Box

Both from [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps) — validated, downloadable as `app.yaml` + `image.tar`:

| App | Model | Gym role | Verdict |
|---|---|---|---|
| **Occupancy Monitor** | hailo_yolov8n_384_640 | zone head-count + periodic occupancy for equipment areas | periodic occupancy publishing verified ✅ |
| **Person Detection** | hailo_yolov8n_384_640 | entrance/corridor person events, optional light & alert linkage | sustained 3-person detection over 4.26M+ frames ✅ |

Deployment & screenshots: [Verified Apps — deployment](/docs/neoeyes-ne503-series/application-guide/verified-apps#deployment). For a from-source walkthrough: [Cookbook — Person Detection](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection) (raw-stream inference → person events → fill-light linkage).

## Counting Logic

- **Zone occupancy**: Occupancy Monitor reports zone head-count periodically; hourly aggregation = utilization, no counting line needed
- **Entrance footfall**: Person Detection events + host-side in/out decision; for higher accuracy, line-crossing on the same model (track center vs. line intersection, bidirectional); occupancy = cumulative in − out

## Custom Models (Optional)

Store-specific behaviors can ride the Hailo training chain: train & convert with [model training & HEF conversion](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef), package as a container app (see [Cookbook — Hello World](/docs/neoeyes-ne503-series/application-guide/cookbook/hello-world)), and publish alongside official apps. Most stores are covered by the two official apps — run those first.
