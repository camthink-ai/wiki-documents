---
sidebar_label: "Development & Resources"
description: "Customization, optimization and resources, with support contacts."
---
# Development & Extension

## Technical Specifications

| Item | Specification |
|---|---|
| Model | hailo_yolov8n_384_640 |
| Task | person detection / zone occupancy |
| Input / Output | video stream (384×640) → boxes / zone count / events |
| Framework | Hailo HEF (in-camera NPU) |
| Accelerator | Hailo-15H NPU (20 TOPS INT8) |

Pipelines — Occupancy Monitor: stream → detect → zone aggregation → periodic occupancy; Person Detection: stream → detect → event decision → Event Bus publish.

## Customization

- **Custom model**: train → HEF convert → container package → publish alongside official apps ([model training & HEF](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef))
- **Custom pipeline**: detection → tracking → classification → line-crossing inside the container ([Cookbook — Person Detection](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection))
- **NeoMind integration**: events → rules/Agent → MQTT/Webhook/notifications for multi-store aggregation ([NeoMind](/docs/neomind/product-overview/what-is-neomind))

## Optimization Guide

- AI: tighten ROI; density-aware thresholds; overnight drift correction
- System: event batching; de-duplicate by device_id
- Deployment: group stores into NeoMind with shared rule templates; split counting vs occupancy duties in large stores

## Troubleshooting Quick Table

| Problem | Possible Cause | Solution |
|---|---|---|
| Camera offline | PoE/cable | check switch port & power |
| App won't start | image/version | match app.yaml & image.tar |
| Counting drift | angle/backlight | adjust, re-frame ROI |
| Occupancy stuck 0 | ROI not saved | re-set the zone |
| No events | channel config | check Webhook/Event Bus |
| Night misses | low light | AI-ISP night mode; add lighting |

## Resources

| Resource | Link |
|---|---|
| NE503 docs | [NeoEyes NE503 Series](/docs/neoeyes-ne503-series/overview) |
| Verified apps | [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps) |
| App tutorials | [Cookbook](/docs/neoeyes-ne503-series/application-guide/cookbook/hello-world) |
| Model training | [Training & HEF conversion](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef) |
| Platform | [NeoMind Edge AI Platform](/docs/neomind/product-overview/what-is-neomind) |

## Support

For solution customization, bulk deployment or technical integration, contact the CamThink support team:

- **Community**: [Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **Business & technical contact**: [Contact us](https://www.camthink.ai/company/contact-us/)
