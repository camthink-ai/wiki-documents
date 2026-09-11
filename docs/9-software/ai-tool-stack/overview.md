---
sidebar_label: "Overview"
sidebar_position: 0
description: "AI ToolStack:面向 NeoEyes NE301/NE101 的端到端 AI 工具集,覆盖数据采集、标注、训练、量化到部署。"
---

# AI ToolStack

AI ToolStack 是 CamThink 面向 [NeoEyes NE301 / NE101](https://github.com/camthink-ai/ne301) 及行业边缘设备的**端到端 AI 工具集**，覆盖从数据采集、标注、训练、量化到部署的完整工作流，显著提升视觉模型落地的效率与可靠性。

CamThink 秉持「**硬件驱动的数据闭环 + 一体化生产部署**」理念，将设备图像自动采集 → 标注 → 模型训练/量化 → 部署到边缘设备深度打通，支持模型持续优化与快速迭代，解决碎片化场景下小样本专用视觉模型落地成本高的痛点。

模型训练与量化能力基于开源项目 [Ultralytics](https://github.com/ultralytics/ultralytics) 构建，特别致谢。

> **保证NE301与部署AI Tool Stack的服务器或PC处于同一个网络下，例如他们都连接同一台路由器，或者服务器有开放的IP和域名**

为了实现NE301相机与AI Tool Stack应用的连接，因为AI Tool Stack内置了MQTT服务，我们将通过NE301内置的MQTT功能与AI Tool Stack的MQTT服务进行连接，来实现NE301数据采集的上传，后续将支持模型的远程更新，因此在开始之前你需要保证NE301可访问到AI Tool Stack服务，AI Tool Stack服务内的MQTT服务要可被外部访问，网络拓扑如下：

![Topological](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Topological.png)

## 核心功能

| 模块 | 能力 |
|------|------|
| AI 模型项目 | MQTT 图像自动采集、标注工作台（检测/分类，COCO·YOLO·ZIP 导入导出）、训练与测试、NE301 量化打包、绑定数据源 |
| 模型空间 | 模型版本管理（自动保存/回滚/导出）、模型测试、外部模型量化（免训练导入 YOLO） |
| 设备管理 | NE101/NE301 设备接入与在线状态、设备-项目绑定与图像自动归集、数据溯源 |
| 系统设置 | 多 MQTT Broker 管理、MQTTS 加密、MQTT 证书管理 |

| 工作台 | 项目管理 | 标注工作台 |
|:---:|:---:|:---:|
| ![Dashboard](/img/aitoolstack/dashboard.webp) | ![Project](/img/aitoolstack/project.webp) | ![Annotation](/img/aitoolstack/annotation.webp) |

| 模型训练 | 模型空间 | 模型测试 |
|:---:|:---:|:---:|
| ![Train](/img/aitoolstack/train.webp) | ![ModelSpace](/img/aitoolstack/modelspace.webp) | ![ModelTest](/img/aitoolstack/modeltest.webp) |

| 设备管理 | 系统设置 |
|:---:|:---:|
| ![DeviceManage](/img/aitoolstack/devicemanage.webp) | ![SystemSettings](/img/aitoolstack/systemsettings.webp) |

## 文档导航

- [快速上手（Docker）](./quick-start) — 环境要求、部署步骤、环境变量
- [AI 模型项目与标注](./projects-and-annotation) — 创建项目、构建数据集、数据标注
- [训练、量化与部署](./training-and-deployment) — 模型训练、量化打包、现有模型量化
- [设备管理与系统设置](./device-and-system) — 设备接入绑定、MQTT Broker、证书管理

## 相关链接

- [GitHub 仓库 camthink-ai/AIToolStack](https://github.com/camthink-ai/AIToolStack)
- [Ultralytics](https://github.com/ultralytics/ultralytics)
