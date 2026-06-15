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

- **4K Professional Imaging System**: Sony IMX678 (1/1.8") + Hailo Gen2 AI-ISP + AF auto-zoom lens (F1.6), supporting 4K@30fps H.265 encoding and &lt;0.01 LUX full-color night vision. Maintains image quality under HDR, low-light, and concurrent inference workloads, balancing wide-angle coverage and long-range recognition.

- **Containerized Application Platform**: Built on containerd runtime with OCI image deployment and sandbox isolation. Models and applications can be independently deployed and upgraded. Algorithm vendors, integrators, and OEMs build industry solutions on a unified platform, avoiding vendor lock-in.

- **Industrial-Grade All-in-One Delivery**: Imaging, inference, alarm linkage, protocol output, and operations management integrated in a single device. IP67 protection + PoE 802.3AT power + Web console, supporting the full lifecycle from development validation to commercial deployment.

- **Full-Stack Developer Toolchain**: Python SDK + aipc-cli + RESTful APIs for diverse integration approaches. Modular HAL decouples software from hardware, enabling smooth cross-SoC platform migration.

## Product Specifications

NE503 core specifications are as follows:

<table>
  <colgroup>
    <col width="14%" />
    <col width="18%" />
    <col width="68%" />
  </colgroup>
  <thead>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="6">Core Platform</td>
      <td>SoC</td>
      <td>Hailo-15H</td>
    </tr>
    <tr>
      <td>CPU</td>
      <td>Cortex-A53 × 4 @ 1.3 GHz</td>
    </tr>
    <tr>
      <td>NPU</td>
      <td>Hailo NPU, 20 TOPS @ INT8</td>
    </tr>
    <tr>
      <td>Memory / Storage</td>
      <td>8 GB LPDDR4 / 64 GB eMMC, supports TF Card and M.2 SSD expansion (M.2 not yet supported)</td>
    </tr>
    <tr>
      <td>Video Encoding</td>
      <td>H.264 / H.265 hardware encoding, 4K@30fps</td>
    </tr>
    <tr>
      <td>System Power</td>
      <td>< 5-6W (typical load)</td>
    </tr>
    <tr>
      <td rowSpan="3">Imaging System</td>
      <td>Image Sensor</td>
      <td>Sony IMX678, 1/1.8" CMOS, 4K UHD</td>
    </tr>
    <tr>
      <td>Lens Module</td>
      <td>AF auto-zoom 8–32mm, F1.6</td>
    </tr>
    <tr>
      <td>ISP</td>
      <td>Hailo Gen2 AI-ISP, &lt;0.01 LUX full-color night vision</td>
    </tr>
    <tr>
      <td rowSpan="3">Network &amp; Protocols</td>
      <td>Ethernet</td>
      <td>100M LAN, supports PoE 802.3AT</td>
    </tr>
    <tr>
      <td>Video Protocol</td>
      <td>RTSP</td>
    </tr>
    <tr>
      <td>Data Protocol</td>
      <td>MQTT / Event Bus / RTMP (planned)</td>
    </tr>
    <tr>
      <td rowSpan="3">Deployment Environment</td>
      <td>Power Supply</td>
      <td>DC 12V or PoE 802.3AT</td>
    </tr>
    <tr>
      <td>Protection Rating</td>
      <td>IP67</td>
    </tr>
    <tr>
      <td>Operating Temperature</td>
      <td>-40°C to +60°C</td>
    </tr>
    <tr>
      <td rowSpan="2">External Interfaces</td>
      <td>Alarm IO</td>
      <td>Alarm IN × 2 + Alarm OUT × 2 (relay + level)</td>
    </tr>
    <tr>
      <td>Expansion Interfaces</td>
      <td>RS-485 (fill light connector is an internal module, not a user-facing external interface)</td>
    </tr>
    <tr>
      <td rowSpan="2">Software Platform</td>
      <td>Operating System</td>
      <td>Embedded Linux (Yocto build), containerd container runtime</td>
    </tr>
    <tr>
      <td>Management</td>
      <td>Web console + SSH + REST API + aipc-cli</td>
    </tr>
  </tbody>
</table>

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
| Supported Tasks | Detection / OCR / Face Detection &amp; Recognition / ReID / Pose Estimation / Behavior Analysis / Attribute Recognition, etc. |
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

The NE503 imaging system pairs a Sony IMX678 (1/1.8") image sensor with an AF auto-zoom lens. The sensor and lens share a matched 1/1.8" target surface, minimizing edge sharpness falloff. The lens covers 8mm (H 45.1°) to 32mm (H 14.7°), enabling a single unit to handle both wide-area surveillance and distant detail identification, with AF auto-zoom for on-site adjustment. The F1.6 wide aperture, combined with AI-ISP low-light enhancement, maintains image quality in dark and backlit conditions.

### Sensor

| Parameter | Specification |
|------|------|
| Sensor | Sony IMX678, 1/1.8" CMOS |
| Effective Pixels | 3840 × 2160 (4K UHD) |
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
      <td>Focal Length</td>
      <td>8mm (wide) – 32mm (telephoto)</td>
    </tr>
    <tr>
      <td>Max Aperture</td>
      <td>F1.6</td>
    </tr>
    <tr>
      <td>Field of View</td>
      <td>Horizontal 45.1° (W) / 14.7° (T); Diagonal 52.8° (W) / 16.8° (T); Vertical 24.6° (W) / 8.4° (T)</td>
    </tr>
    <tr>
      <td>Electromechanical</td>
      <td>AF autofocus and auto-zoom, IR-Cut electromagnetic switching</td>
    </tr>
  </tbody>
</table>

### Lens Drive & Image Stabilization

The NE503 supports AF autofocus and auto-zoom with 4x optical zoom. Lens control is handled by the SoC via SPI CS1 (the default runtime control path), while the MCU provides lens homing and limit protection via SPI1. The onboard gyroscope supports EIS electronic image stabilization, maintaining image stability even at the telephoto end.

## Hardware Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/hardware-architecture.png" alt="Hardware Architecture Overview" width="80%" />
</div>

NE503 features a dual-board structure with a **Processor Board** and an **Interface Board**, interconnected via board-to-board connectors. The Processor Board carries the SoC, NPU, memory, and imaging subsystem, handling all computing and AI inference tasks. The Interface Board integrates an independent MCU, external IO, and power management circuitry. Even if the Processor Board fails, underlying functions such as lens homing, fill light control, and IO protection continue to operate normally.

### Processor Board

The Processor Board integrates the SoC, NPU, memory, storage, and camera interface, handling all computing and AI inference tasks:

| Item | Specification |
|------|---------------|
| SoC | Hailo-15H, Cortex-A53 × 4 @ 1.3 GHz |
| NPU | Hailo NPU, 20 TOPS @ INT8 |
| DSP | 350 GOPS |
| Memory | 8 GB LPDDR4 |
| Storage | 64 GB eMMC |
| SSD Expansion | M.2 KEY M (SoC natively supports PCIe Gen4, see hardware documentation for details) ⚠️ Not yet supported |

### Interface Board

The interface board manages all peripherals and communication interfaces through an independent MCU (Arm Cortex-M0+, 64 MHz), communicating with the Processor Board via UART0, and integrates the system power input and distribution circuitry. The Ethernet PHY is located on the core processing board, while SoC interfaces such as the TF card slot are routed to the interface board via board-to-board connectors.

#### External Interfaces

| Item | Specification |
|------|---------------|
| Alarm I/O | Alarm input × 2 + Alarm output × 2 (relay + level) |
| RS-485 | Serial communication bus |
| Ethernet | 100M LAN, supports PoE 802.3AT power supply |
| TF Card | Supports UHS-I high-speed storage cards |
| Fill Light Interface | Supports IR fill light (supported), White fill light (reserved) |

#### MCU Management

| Item | Specification |
|------|---------------|
| MCU | Arm Cortex-M0+ @ 64 MHz |
| Management Scope | AF lens, fill light, IR-CUT, heater (reserved), fan (reserved), Alarm IO, RS-485, light sensor |
| Thermal Control | 12V fan (reserved) + 12V heater (reserved) |
| RTC | Supercapacitor power-fail retention |

#### Power Supply

| Item | Specification |
|------|---------------|
| Power Supply | DC 12V adapter or PoE 802.3AT (single-cable) |
| System Power | < 5-6W (typical load) |

## System Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/software-stack.png" alt="Software Stack Architecture" width="80%" />
</div>

NeoEyes NE503 adopts a four-layer architecture with clear separation from underlying hardware to the web management interface:

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Components</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web Management Console</td>
      <td>React 19 + TypeScript + Vite</td>
      <td>Dashboard, media settings, application management, system management</td>
    </tr>
    <tr>
      <td>Platform Services (Go)</td>
      <td>platform-api · app-manager · device-control · ai-runtime · event-bus</td>
      <td>REST API gateway, container lifecycle, hardware control, AI inference, event bus</td>
    </tr>
    <tr>
      <td>HAL &amp; C++ Services</td>
      <td>camera-daemon · libaipc_hal.so</td>
      <td>Video capture and encoding, hardware abstraction layer</td>
    </tr>
    <tr>
      <td>Hardware Layer</td>
      <td>Hailo-15H SoC · Hailo NPU · MCU</td>
      <td>AI acceleration, video processing, peripheral control</td>
    </tr>
  </tbody>
</table>

## Applications

With 20 TOPS local computing power, containerized microservice architecture, and rich peripheral interfaces, NeoEyes NE503 transforms traditional IPCs into all-in-one edge computing devices for high-end smart security and AIoT scenarios that demand high image quality, computing power, and customization.

### Smart Security

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 supports 24/7 all-weather complex security tasks. AI-ISP delivers clear color images in extremely low-light conditions, while multi-model concurrent inference enables person detection, license plate recognition, and perimeter intrusion detection. The event bus links hardware alarms (fill light, focus, Alarm output) and supports GenAI natural language retrieval of non-predefined targets.
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
          description: "Real-time detection of whether workers are wearing hard hats, protective clothing, reflective vests, etc. Violations immediately trigger Alarm output warning signals.",
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
- aipc-cli command-line management tool
- RESTful API (Bearer Token authentication)
- Hailo Dataflow Compiler model compilation tool

## Support

<SupportGrid />
