---
sidebar_label: "How to Use"
description: "From purchase to a running solution."
---
# How to Use

## 3.1 Requirements

**Hardware**: NE503 (1 entrance + 1–2 zones to start); PoE switch (ports = cameras + 1).

**Software**: NE503 stock firmware; Verified App packages (`app.yaml` + `image.tar`).

## 3.2 Hardware Setup

**Step 1 — Mount**: entrance top-down (AF 44.5° on the lane); zones ceiling-mounted (110° covering 4–6 machines); avoid backlight and occlusion.

**Step 2 — Power/network**: PoE to the switch; cameras come online automatically.

**Step 3 — Console**: open the NE503 web console ([Quick Start](/docs/neoeyes-ne503-series/quick-start)).

## 3.3 Device Setup

**Step 1** — log in, confirm camera online and image OK.
**Step 2** — set detection ROIs (zone / lane).
**Step 3** — verify: inference ready, event bus publishable, storage available.

## 3.4 Install / Configure AI Model (apps)

1. **Apps**: console → Applications → upload the Verified App `app.yaml` + `image.tar` ([deploy method](/docs/neoeyes-ne503-series/application-guide/verified-apps#deployment))
2. **Events**: apps emit on the Event Bus — point them at display/platform/system (see [7.4](./customization) & [7.5](./customization#75-neomind-integration))

## 3.5 Configure the Solution

```text
NE503 (entrance) Person Detection → in/out events
NE503 (zones) Occupancy Monitor → zone_occupancy
        ↓ Event Bus / Webhook
Display (occupancy = cumulative in−out) / alerts (over-capacity/safety)
```

## 3.6 Verify the Result

```text
walk in → person event → occupancy +1 (display < 3s)
enter zone → zone_occupancy=2 reported
wave test → alert channel receives notice + snapshot
```
