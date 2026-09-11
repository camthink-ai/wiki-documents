---
sidebar_label: "Customization & Further Development"
description: "Customization: model, dataset, pipeline, API and NeoMind integration."
---
# Customization & Further Development

## 7.1 Custom Model

Train → HEF convert → package as a container app, published alongside official apps. Follow [Cookbook — Person Detection](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection) for the SDK & Event Bus usage.

## 7.2 Custom Dataset

Collect → Annotate → Train → Export (HEF) → Benchmark → Deploy. Training guide: [model training & HEF conversion](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef).

## 7.3 Custom AI Pipeline

Compose freely inside the container: detection → tracking → classification → line-crossing counting.

## 7.4 API Integration

- Single store: NE503 Event Bus / Webhook straight to your endpoint (JSON, by device_id)
- Platform shape: [OpenAPI](/docs/neomind/developer-guide/rest-api) pull + [Data Push](/docs/neomind/user-guide/7c-data-push) live forward

## 7.5 NeoMind Integration

```text
NE503 events/metrics → NeoMind → rules (over-capacity/safety/after-hours) → MQTT / Webhook / notifications
```

Multi-store aggregation & unified dashboards: [NeoMind](/docs/neomind/product-overview/what-is-neomind); onboarding: [device onboarding](/docs/neomind/user-guide/onboard-device).
