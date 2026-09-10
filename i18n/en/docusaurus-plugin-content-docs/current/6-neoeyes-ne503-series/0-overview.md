---
description: NeoEyes NE503 is an edge AI smart camera and computing platform based on the Hailo-15H SoC, featuring a 20 TOPS NPU, 4K video encoding, containerized application management, a web console, and multi-model concurrent inference for smart security, industrial inspection, and AIoT applications.
keywords: [NeoEyes NE503, Hailo-15H, edge AI platform, 20 TOPS, AI camera, smart IPC, containerized applications, edge computing, AI-ISP, RTSP]
tags: [NE503, AI camera, edge computing, smart IPC, AIoT]
---

import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import SupportGrid from '@site/src/components/SupportGrid';

# Product Information

## Overview

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-architecture.png" alt="NeoEyes NE503" width="100%" />
</div>

NeoEyes NE503 is an edge AI smart camera based on the **Hailo-15H SoC**, featuring a 20 TOPS NPU and a Sony IMX678 4K imaging system. NE503 completes the full closed loop from image capture and AI inference to event output and business linkage within a single device, significantly reducing the deployment complexity of edge intelligence solutions. It combines the professional imaging capabilities of an AI Camera with the open edge computing platform attributes—supporting containerized application deployment, multi-model concurrent inference, and RTSP / Event Bus protocol integration for visual application and edge AI secondary development scenarios.

### Core Capabilities

- **On-Device AI Inference Loop**: 20 TOPS (INT8) NPU supports multi-model concurrent inference. Image capture, analysis, and structured output run entirely on-device with zero cloud dependency, meeting low-latency and data localization requirements.

- **4K Professional Imaging System**: Sony IMX678 (1/1.8") + Hailo Gen2 AI-ISP + selectable lens configurations (`AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`), supporting 4K@30fps H.265 encoding and &lt;0.01 LUX full-color night vision. The field of view and focus/zoom capabilities depend on the selected lens configuration.

- **Containerized Application Platform**: Built on containerd runtime with OCI image deployment and sandbox isolation. Models and applications can be independently deployed and upgraded. Algorithm vendors, integrators, OEMs, and operations teams build industry solutions on a unified platform, avoiding vendor lock-in.

- **Industrial-Grade All-in-One Delivery**: Imaging, inference, alarm linkage, protocol output, and operations management integrated in a single device. IP67 protection + PoE 802.3AT power + Web console, supporting the full lifecycle from development validation to commercial deployment.

- **Full-Stack Developer Toolchain**: Python SDK + aipc-cli + RESTful APIs for diverse integration approaches. Modular HAL decouples software from hardware, enabling smooth cross-SoC platform migration.

## Product Specifications

Below is a summary of the NE503's core specifications. For full chip-level and module-level parameters, see [Hardware Specifications](./2-hardware-guide/0-specifications.md):

| Specification | Details |
|------|---------------|
| CPU | Quad-core Cortex-A53 × 4 @ 1.3 GHz |
| AI Compute | 20 TOPS @ INT8 (supports 4-bit quantization), DSP 350 GOPS |
| Memory / Storage | 4 GB or 8 GB LPDDR4 / 64 GB eMMC, supports TF Card expansion (M.2 not yet supported) |
| Image Sensor | 1/1.8" CMOS, 4K UHD, AI-ISP (&lt;0.01 LUX full-color night vision) |
| Lens | `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`; exact controls depend on the configuration |
| Video | H.264 / H.265 hardware encoding 4K@30fps; RTSP main / sub / third stream |
| Network | 10/100M LAN, supports PoE 802.3AT; data protocols MQTT / Event Bus |
| Power / Consumption | DC 12V or PoE 802.3AT; 5–6W (typical load) |
| Protection / Environment | IP67 / IK10; -40°C to +60°C, 0–95% RH (non-condensing) |
| External Interfaces | Alarm IN × 1 + Wiegand output × 2 (relay + level), Line-In / Line-Out, RS-485 |
| Software Platform | Embedded Linux (Yocto) + containerd; Web console / SSH / REST API / aipc-cli |
| Dimensions / Weight / Certifications | 320 × 134 × 126 mm / 2.5 kg / CE, FCC |

## Performance &amp; Edge AI

### AI Inference Capability

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-pipeline.png" alt="AI Inference Pipeline" width="80%" />
</div>

NE503 is powered by the Hailo-15H SoC with an integrated Hailo NPU delivering 20 TOPS (INT8) compute, complemented by a 350 GOPS DSP for pre-processing and post-processing tasks. The Zero-copy Pipeline achieves zero-copy data transfer via DMA/SHM direct transmission, avoiding memory copy overhead. AI Runtime manages model loading, inference scheduling, and multi-model parallel execution. Inference results are output as structured events via Event Bus, supporting both local hardware linkage and cloud integration.

| Metric | Parameter |
|--------|-----------|
| Inference Latency Target | &lt; 50ms |
| Concurrent Inference | Supports multi-model simultaneous execution |
| Data Transfer | Zero-copy Pipeline (DMA/SHM direct) |
| Supported Tasks | Detection / OCR / Face Detection &amp; Recognition / ReID / Pose Estimation / Behavior Analysis / Visual Search, etc. |
| Pre-installed Models | Person Detection (YOLOv8n), Face Landmarks, CLIP Image Encoder |
| Event Output | Structured inference results + event messages + device status data |

### Video Encoding

The hardware encoder supports dual-format H.264/H.265 encoding at 4K@30fps, paired with Hailo Gen2 AI-ISP for &lt;0.01 LUX ultra-low-light full-color night vision. The AI denoising adapts to different scenes without retraining models.

| Metric | Parameter |
|--------|-----------|
| Encoding Format | H.264 / H.265 hardware encoding, supports CBR / VBR rate control |
| RTSP Streams | Main stream / Sub stream / Third stream |
| AI Denoising | AI denoising, adapts to different scenes without model retraining |

### Low-Light Imaging

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-isp-comparison.png" alt="AI-ISP Low-Light Comparison" width="80%" />
</div>

AI-ISP delivers clear color images even in extremely low-light environments, with AI denoising that adapts to varying illumination conditions. Combined with automatic IR-CUT filter switching and fill light control, it achieves 24/7 all-weather imaging.

## Imaging System

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/imaging-module.jpg" alt="Imaging Module" width="60%" />
</div>

The NE503 imaging system combines a Sony IMX678 (1/1.8") image sensor, Hailo Gen2 AI-ISP, and a selectable lens module. The available lens configurations are `AF Lens (44.5° HFOV)` and `Motorized Zoom (110° HFOV)`; the actual field of view and focus/zoom capabilities depend on the selected SKU and device firmware. AI-ISP low-light enhancement helps maintain image quality in dark and backlit conditions.

### Sensor

| Parameter | Specification |
|------|------|
| Sensor | Sony IMX678, 1/1.8" CMOS |
| Effective Pixels | 3856(H) × 2180(V) (native, approx. 8.4 MP), 4K UHD output 3840 × 2160 |
| Pixel Size | 2.0 µm × 2.0 µm |
| Sensor Interface | MIPI CSI-2, RAW10 / RAW12 |
| HDR | Digital Overlap / Dual Gain HDR |

### Lens

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Available Lenses</td>
      <td><code>AF Lens (44.5° HFOV)</code>; <code>Motorized Zoom (110° HFOV)</code></td>
    </tr>
    <tr>
      <td>Configuration Differences</td>
      <td>Focal length, aperture, focus, zoom, and other electromechanical capabilities depend on the selected lens configuration and device firmware</td>
    </tr>
  </tbody>
</table>

### Lens Drive & Image Stabilization

The lens-control path is coordinated by the SoC-side SPI CS1 and the interface-board MCU-side SPI1. The available autofocus, zoom, homing, and limit-protection functions depend on the selected lens configuration and device firmware. The onboard gyroscope supports EIS electronic image stabilization.

## Hardware Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/hardware-architecture.png" alt="Hardware Architecture Overview" width="80%" />
</div>

NE503 features a dual-board structure with a **Processor Board** and an **Interface Board**, interconnected via board-to-board connectors. The Processor Board carries the SoC, NPU, memory, and imaging subsystem, handling all computing and AI inference tasks. The Interface Board integrates an independent MCU, external IO, and power management circuitry. Even if the Processor Board fails, underlying functions such as lens homing, fill light control, and IO protection continue to operate normally.

### Processor Board & Interface Board

The Processor Board integrates the SoC, NPU, memory, storage, and camera interface (4 GB or 8 GB LPDDR4, 64 GB eMMC; M.2 SSD expansion is documented but not yet enabled by the current firmware), handling all computing and AI inference tasks. The Interface Board manages peripherals and communication interfaces through an independent MCU (Arm Cortex-M0+ @ 64 MHz), including lens control, fill light, IR-CUT, Alarm IO, RS-485, light sensor, and reserved thermal control. The exact lens-control capabilities depend on the selected configuration. External interfaces brought out by the Interface Board include Alarm IN × 1 + Wiegand output × 2, Line-In / Line-Out, RS-485, and TF Card (UHS-I); the fill light interface provides IR fill light (supported, 80m) with white fill light reserved.

Board-level component details, terminal definitions, and power supply details are covered in [Hardware Specifications](./2-hardware-guide/0-specifications.md), [Core Board](./2-hardware-guide/1-core-board-connection.md), and [Interface Board](./2-hardware-guide/2-aipc-board-connection.md).

## System Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/software-stack.png" alt="Software Stack Architecture" width="80%" />
</div>

The NE503 software stack has four layers from the bottom up: hardware, hardware abstraction (HAL), platform services, and the web management console. Applications run as containers and reach the NPU, camera, and peripherals only through platform services — they never touch hardware directly. This preserves app portability and the system security boundary. Layered data flow and each layer's responsibilities are covered in [System Architecture](./3-software-guide/0-system-architecture.md).

## Applications

With 20 TOPS local computing power, containerized microservice architecture, and rich peripheral interfaces, NeoEyes NE503 transforms traditional IPCs into all-in-one edge computing devices for high-end smart security and AIoT scenarios that demand high image quality, computing power, and customization.

### Smart Security

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 supports 24/7 all-weather complex security tasks. AI-ISP delivers clear color images in extremely low-light conditions, while multi-model concurrent inference enables person detection, license plate recognition, and perimeter intrusion detection. The event bus links hardware alarms (fill light, focus, alarm output) and supports GenAI natural language retrieval of non-predefined targets.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Smart Perimeter Protection",
          description: "Multi-model concurrent execution of person detection and CLIP visual encoder, supporting natural language target retrieval (e.g., 'person wearing a red jacket'), with automatic fill light, focus, and alarm linkage upon match.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-perimeter.png",
          imageAlt: "Smart Perimeter Protection"
        },
        {
          title: "License Plate Recognition",
          description: "Containerized deployment of license plate recognition models for real-time video stream analysis. Recognition results are pushed to business systems via the event bus, suitable for parking lots, campus entrances, and similar scenarios.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-lpr.png",
          imageAlt: "License Plate Recognition"
        },
        {
          title: "Privacy-Compliant Monitoring",
          description: "Dynamic Privacy Mask automatically pixelates irrelevant pedestrian faces for desensitization, meeting GDPR and other privacy compliance requirements before forwarding to the monitoring center.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-privacy.png",
          imageAlt: "Privacy-Compliant Monitoring"
        }
      ]
    }
  ]}
/>

### Smart Industry

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503's independent MCU peripheral control ensures industrial-grade reliability—even if containers crash, underlying hardware limit protection remains active. Rich IO interfaces support connecting various industrial sensors and actuators.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Safety Equipment Detection",
          description: "Real-time detection of whether workers are wearing hard hats, protective clothing, reflective vests, etc. Violations immediately trigger alarm output.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-safety.png",
          imageAlt: "Safety Equipment Detection"
        },
        {
          title: "Production Line Quality Inspection",
          description: "Containerized deployment of custom inspection models for real-time analysis of product appearance on production lines, supporting multi-angle zoom and focus for inspection, with automatic defect marking.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-quality.png",
          imageAlt: "Production Line Quality Inspection"
        }
      ]
    }
  ]}
/>

### AIoT &amp; Custom Applications

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503's containerized microservice architecture and modular HAL design significantly lower the hardware deployment barrier for third-party algorithm companies. Based on the containerd runtime, custom AI applications can be deployed via standard OCI images, breaking hardware vendor lock-in.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "VMS Integration",
          description: "Run professional video management systems like NX Witness in containers. NE503 simultaneously serves as both a smart IPC and NVR, reducing system complexity and cost.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-vms.png",
          imageAlt: "VMS Integration"
        },
        {
          title: "Natural Language Video Search",
          description: "Deploy CLIP / VLM and other vision-language models to support free-text video content search, enabling 'non-predefined target retrieval' such as identifying persons carrying specific items.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-nl-search.png",
          imageAlt: "Natural Language Video Search"
        },
        {
          title: "Multi-Sensor Fusion",
          description: "Connect external sensors via RS-485, Alarm IO, and other channels. Combined with edge AI inference, achieve multi-dimensional environmental perception and linkage control.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-sensor.png",
          imageAlt: "Multi-Sensor Fusion"
        }
      ]
    }
  ]}
/>

### Edge AI Box

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    In projects with existing standard IPC deployments, NE503 can pull RTSP streams from surrounding non-AI IPCs for centralized proxy inference, acting as an 'AI Box inside a camera' to upgrade legacy projects with minimal retrofit cost.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Legacy IPC AI Upgrade",
          description: "NE503 simultaneously pulls multiple RTSP streams, centrally runs person detection, zone intrusion, and other AI models, pushing inference results to business systems—upgrading to smart surveillance without replacing existing cameras.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-ai-box.png",
          imageAlt: "Legacy IPC AI Upgrade"
        }
      ]
    }
  ]}
/>

## Resources

### Developer Resources

- Python SDK (MediaClient, InferenceClient, DeviceClient)
- [C++ SDK API reference](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/)
- aipc-cli command-line management tool
- RESTful API (Bearer Token authentication)
- Hailo Dataflow Compiler model compilation tool

## Support

<SupportGrid />
