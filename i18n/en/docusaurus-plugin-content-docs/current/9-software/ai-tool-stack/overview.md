---
sidebar_label: "Overview"
sidebar_position: 0
description: "AI ToolStack: an end-to-end AI toolset for NeoEyes NE301/NE101 covering data collection, annotation, training, quantization and deployment."
---
# AI ToolStack

**AI Tool Stack** is an end-to-end AI toolset designed for [NeoEyes NE301/NE101](https://github.com/camthink-ai/ne301) and other industry edge devices, covering the entire workflow from data collection, annotation, training, quantization, to deployment — significantly improving the efficiency and reliability of visual model implementation.

CamThink adopts the philosophy of **"hardware-driven data closed-loop + integrated production deployment"**, deeply integrating device image auto-collection → label annotation → model training/quantization → deployment to edge devices, supporting continuous model optimization and rapid iteration for fragmented small-sample scenarios.

Training & quantization are built on the open-source [Ultralytics](https://github.com/ultralytics/ultralytics) project — special thanks!

> **Ensure that NE301 and the server or PC deploying AI Tool Stack are on the same network, for example, they are all connected to the same router, or the server has an open IP and domain name**

To enable connection between NE301 cameras and AI Tool Stack applications, since AI Tool Stack has a built-in MQTT service, we will connect through NE301's built-in MQTT functionality with AI Tool Stack's MQTT service to implement NE301 data collection upload. Remote model updates will be supported in the future. Therefore, before starting, you need to ensure that NE301 can access the AI Tool Stack service, and the MQTT service within the AI Tool Stack service must be accessible externally. The network topology is as follows:

![Topological](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Topological.png)

## Core Features

| Module | Capabilities |
|--------|--------------|
| AI Model Projects | MQTT image auto-collection, annotation workbench (detection/classification, COCO·YOLO·ZIP import/export), training & testing, NE301 quantization packaging, bound data sources |
| Model Space | Model versioning (auto-save/rollback/export), model testing, external model quantization (import YOLO without retraining) |
| Device Management | NE101/NE301 onboarding & online status, device-project binding with auto image routing, data traceability |
| System Settings | Multi-MQTT-broker management, MQTTS encryption, MQTT certificate management |

| Dashboard | Project Management | Annotation Workbench |
|:---:|:---:|:---:|
| ![Dashboard](/img/aitoolstack/dashboard.webp) | ![Project](/img/aitoolstack/project.webp) | ![Annotation](/img/aitoolstack/annotation.webp) |

| Model Training | Model Space | Model Testing |
|:---:|:---:|:---:|
| ![Train](/img/aitoolstack/train.webp) | ![ModelSpace](/img/aitoolstack/modelspace.webp) | ![ModelTest](/img/aitoolstack/modeltest.webp) |

| Device Management | System Settings |
|:---:|:---:|
| ![DeviceManage](/img/aitoolstack/devicemanage.webp) | ![SystemSettings](/img/aitoolstack/systemsettings.webp) |

## Documentation

- [Quick Start (Docker)](./quick-start) — requirements, deployment steps, environment variables
- [Projects & Annotation](./projects-and-annotation) — create projects, build datasets, annotate
- [Training & Deployment](./training-and-deployment) — training, quantization, existing-model quantization
- [Device & System](./device-and-system) — device binding, MQTT brokers, certificates

## Links

- [GitHub: camthink-ai/AIToolStack](https://github.com/camthink-ai/AIToolStack)
- [Ultralytics](https://github.com/ultralytics/ultralytics)
