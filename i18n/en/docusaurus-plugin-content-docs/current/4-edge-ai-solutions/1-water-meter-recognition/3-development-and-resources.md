---
sidebar_label: "Development & Resources"
description: "Customization, optimization and resources, with support contacts."
---
# Development & Extension

## Technical Specifications

| Item | Specification |
|---|---|
| Model | paddle-ocr-v6 (detection + recognition) |
| Task | dial digit OCR (host-side) |
| Input / Output | snapshot ROI → reading text + confidence |
| Framework | PaddleOCR via NeoMind extension |
| Accelerator | CPU (no GPU/NPU required) |

Pipeline: snapshot → ne101_camera (ROI) → paddle-ocr-v6 → Transform (parse + range check) → `meter_reading` metric.

## Customization

- **Custom model**: swap the OCR extension; switch `processingExtensionId` — zero camera change
- **Custom dataset**: Collect → Annotate → Train → Export → Deploy, toolchain [AI ToolStack](/docs/software/ai-tool-stack/overview)
- **Pipeline extension**: pluggable stages (detection → OCR → validation → structuring)

## Optimization Guide

- AI: tighten ROI; confidence threshold + consistency check; tiny→small/medium tier
- System: stagger capture windows; snapshot retention policy
- Deployment: shard 200–500 meters per host; separate Cat.1/Wi-Fi channels

## Troubleshooting Quick Table

| Problem | Possible Cause | Solution |
|---|---|---|
| Camera offline | battery / network | check battery, re-provision |
| No images at platform | uplink config | verify Webhook/MQTT |
| Empty recognition | ROI missing | re-frame ROI |
| Reading jumps | mid-carry state | enable consistency rule |
| Low confidence | light/glare/dirt | fill light, clean, adjust |

## Resources

| Resource | Link |
|---|---|
| NE101 docs | [NeoEyes NE503 Series → NE101](/docs/neoeyes-ne101-series/overview) |
| NeoMind docs | [NeoMind Edge AI Platform](/docs/neomind/product-overview/what-is-neomind) |
| OCR tutorial | [OCR use case](/docs/neomind/use-cases/camera-ocr) |
| Training toolchain | [AI ToolStack](/docs/software/ai-tool-stack/overview) |
| Platform API | [REST API](/docs/neomind/developer-guide/rest-api) |

## Support

For solution customization, bulk deployment or technical integration, contact the CamThink support team:

- **Community**: [Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **Business & technical contact**: [Contact us](https://www.camthink.ai/company/contact-us/)
