---
description: NeoEyes NE503 是一款基于 Hailo-15H SoC 的边缘 AI 智能相机与计算平台，搭载 20 TOPS NPU，支持 4K 视频编码、容器化应用管理、Web 控制台及多模型并发推理，适用于智能安防、工业检测、AIoT 等场景。
keywords: [NeoEyes NE503, Hailo-15H, 边缘AI平台, 20 TOPS, AI摄像头, 智能IPC, 容器化应用, 边缘计算, AI-ISP, RTSP]
tags: [NE503, AI摄像头, 边缘计算, 智能IPC, AIoT]
---

import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import SupportGrid from '@site/src/components/SupportGrid';

# Product Information

## 基本介绍

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-architecture.png" alt="NeoEyes NE503" width="100%" />
</div>

NeoEyes NE503 是一款基于 **Hailo-15H SoC** 的边缘 AI 智能相机，搭载 20 TOPS NPU 与 Sony IMX678 4K 成像系统。NE503 在单一设备内完成从图像采集、AI 推理到事件输出与业务联动的完整闭环，大幅降低边缘智能方案的部署复杂度。它兼具 AI Camera 的专业成像能力与开放边缘计算平台的属性——支持容器化应用部署、多模型并发推理及 RTSP / Event Bus 等协议对接，面向视觉应用与边缘 AI 的二次开发场景。

### 核心能力

- **端侧 AI 闭环推理**：20 TOPS（INT8）NPU 支持多模型并发推理，图像采集、分析与结构化输出全程在设备端完成，零云端依赖，满足低延迟与数据本地化要求。

- **4K 专业成像系统**：Sony IMX678（1/1.8"）+ Hailo Gen2 AI-ISP + 可选镜头配置（`AF Lens (44.5° HFOV)` 或 `Motorized Zoom (110° HFOV)`），支持 4K@30fps H.265 编码与 &lt;0.01 LUX 全彩夜视。视场范围及对焦/变焦能力取决于所选镜头配置。

- **容器化应用平台**：基于 containerd 运行时，OCI 标准镜像部署，沙箱隔离。模型与应用可独立部署升级，算法供应商、集成商、OEM 厂商与运维团队基于统一底座构建行业方案，避免供应商锁定。

- **工业级一体化交付**：成像、推理、告警联动、协议输出与运维管理集成于单机。IP67 防护 + PoE 802.3AT 供电 + Web 控制台，支持从开发验证到商业部署全流程。

- **全栈开发者工具链**：Python SDK + aipc-cli + RESTful API，适配多种接入方式。模块化 HAL 解耦软硬件，支持跨 SoC 平台平滑迁移。

## 产品总览规格

NE503 整机核心规格摘要如下，芯片级与模组级完整参数见[硬件规格](./2-hardware-guide/0-specifications.md)：

| 规格参数 | 参数 |
|------|------|
| CPU | 四核 Cortex-A53 × 4 @ 1.3 GHz |
| AI 算力 | 20 TOPS @ INT8（支持 4-bit 量化），DSP 350 GOPS |
| 内存 / 存储 | 4 GB 或 8 GB LPDDR4 / 64 GB eMMC，支持 TF Card 扩展（M.2 暂未支持） |
| 图像传感器 | 1/1.8" CMOS，4K UHD，AI-ISP（&lt;0.01 LUX 全彩夜视） |
| 镜头 | `AF Lens (44.5° HFOV)` 或 `Motorized Zoom (110° HFOV)`；具体控制能力随配置而定 |
| 视频 | H.264 / H.265 硬件编码 4K@30fps；RTSP 主/子/三码流 |
| 网络 | 10/100M LAN，支持 PoE 802.3AT；数据协议 MQTT / Event Bus |
| 供电 / 功耗 | DC 12V 或 PoE 802.3AT；5–6W（典型负载） |
| 防护 / 环境 | IP67 / IK10；-40°C – +60°C，0–95% RH（无冷凝） |
| 外部接口 | Alarm IN × 1 + Wiegand 输出 × 2（继电器 + 电平）、Line-In / Line-Out、RS-485 |
| 软件平台 | 嵌入式 Linux（Yocto）+ containerd；Web 控制台 / SSH / REST API / aipc-cli 管理 |
| 尺寸 / 重量 / 认证 | 320 × 134 × 126 mm / 2.5 kg / CE、FCC |

## 性能与边缘 AI

### AI 推理能力

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-pipeline.png" alt="AI 推理管线" width="80%" />
</div>

NE503 搭载 Hailo-15H SoC，集成 Hailo NPU 提供 20 TOPS（INT8）算力，辅以 350 GOPS DSP 完成预处理与后处理任务。Zero-copy Pipeline 通过 DMA/SHM 直传实现零拷贝数据流转，避免内存拷贝开销。AI Runtime 统一负责模型加载、推理调度与多模型并行执行，推理结果通过 Event Bus 以结构化事件输出，支持本地硬件联动与上云对接。

| 指标 | 参数 |
|------|------|
| 推理延迟目标 | &lt; 50ms |
| 并发推理 | 支持多模型同时运行 |
| 数据传输 | Zero-copy Pipeline（DMA/SHM 直传） |
| 可支持任务 | 检测 / OCR / 人脸检测与识别 / ReID / 姿态估计 / 行为分析 / 视觉搜索（visual search）等 |
| 预置模型 | 行人检测（YOLOv8n）、人脸关键点、CLIP 图像编码器 |
| 事件输出 | 结构化推理结果 + 事件消息 + 设备状态数据 |

### 视频编码能力

硬件编码器支持 4K@30fps 的 H.264/H.265 双格式编码，配合 Hailo Gen2 AI-ISP 实现 &lt;0.01 LUX 极低照度全彩夜视，AI 降噪无需重新训练模型即可适配不同场景。

| 指标 | 参数 |
|------|------|
| 编码格式 | H.264 / H.265 硬件编码，支持 CBR / VBR 码率控制 |
| RTSP 码流 | 主码流 / 子码流 / 三码流 |
| AI 降噪 | AI 降噪，无需重新训练模型即可适配不同场景 |

### 低照度成像

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-isp-comparison.png" alt="AI-ISP 低照度对比" width="80%" />
</div>

AI-ISP 在极低照度环境下仍可输出清晰彩色画面，AI 降噪自适应不同光照条件。结合 IR-CUT 滤光片自动切换和补光灯控制，实现 24/7 全天候成像。

## 成像系统

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/imaging-module.jpg" alt="成像模组" width="60%" />
</div>

NE503 成像系统由 Sony IMX678（1/1.8"）图像传感器、Hailo Gen2 AI-ISP 与可选镜头模组组成。镜头配置包括 `AF Lens (44.5° HFOV)` 和 `Motorized Zoom (110° HFOV)`；实际视场范围及对焦、变焦能力以所选 SKU 和设备固件为准。AI-ISP 低照增强可帮助设备在暗光和逆光场景下保持成像质量。

### 传感器

| 参数 | 规格 |
|------|------|
| 传感器 | Sony IMX678，1/1.8" CMOS |
| 有效像素 | 3856(H) × 2180(V)（原生，约 8.4 MP），4K UHD 输出 3840 × 2160 |
| 像素尺寸 | 2.0 µm × 2.0 µm |
| 传感器接口 | MIPI CSI-2，RAW10 / RAW12 |
| HDR | Digital Overlap / Dual Gain HDR |

### 镜头

<table>
  <thead>
    <tr>
      <th>参数</th>
      <th>规格</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>可选镜头</td>
      <td><code>AF Lens (44.5° HFOV)</code>；<code>Motorized Zoom (110° HFOV)</code></td>
    </tr>
    <tr>
      <td>配置差异</td>
      <td>焦距、光圈、对焦、变焦及其他机电能力以所选镜头配置和设备固件为准</td>
    </tr>
  </tbody>
</table>

### 镜头驱动与图像稳定

镜头控制链路由 SoC 侧 SPI CS1 与接口板 MCU 侧 SPI1 协同实现；实际可用的自动对焦、变焦、归零和限位功能取决于所选镜头配置和设备固件。板载陀螺仪支持 EIS 电子防抖。

## 硬件架构

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/hardware-architecture.png" alt="硬件架构总览" width="80%" />
</div>

NE503 采用**核心处理板**与**接口板**双板结构，通过板对板连接器互联。核心处理板承载 SoC、NPU、内存及成像子系统，负责全部计算与 AI 推理任务；接口板集成独立 MCU、外部 IO 及电源管理电路，即使核心处理板异常，镜头归零、补光控制和 IO 保护等底层功能依然正常工作。

### 核心处理板与接口板

核心处理板集成 SoC、NPU、内存、存储与相机接口（4 GB 或 8 GB LPDDR4、64 GB eMMC，支持 M.2 SSD 扩展但当前固件暂未启用），承载全部计算与 AI 推理任务；接口板通过独立 MCU（Arm Cortex-M0+ @ 64 MHz）管理外设和镜头控制、补光灯、IR-CUT、Alarm IO、RS-485、光敏采样及温控预留。镜头的具体控制能力随所选配置而定。接口板引出的外部接口有 Alarm IN × 1 + Wiegand 输出 × 2、Line-In / Line-Out、RS-485、TF Card（UHS-I），补光灯接口含红外补光（已支持，80m）与白光补光（预留）。

板级器件、接线端子定义与供电详表见[硬件规格](./2-hardware-guide/0-specifications.md)、[核心板接线](./2-hardware-guide/1-core-board-connection.md)与[接口板接线](./2-hardware-guide/2-aipc-board-connection.md)。

## 系统架构

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/software-stack.png" alt="软件栈架构" width="80%" />
</div>

NeoEyes NE503 软件栈自底向上分为硬件、硬件抽象（HAL）、平台服务、Web 管理控制台四层：应用以容器形式运行，只通过平台服务调用 NPU、相机与外设，不直接触碰硬件——这保证了应用的可移植性与系统安全边界。分层数据流与各层职责详见[系统架构](./3-software-guide/0-system-architecture.md)。

## 产品应用

NeoEyes NE503 凭借 20 TOPS 本地算力、容器化微服务架构和丰富的外设接口，将传统 IPC 转变为边缘计算一体机，适用于对画质、算力和定制化有高要求的高端智能安防及 AIoT 场景。

### 智能安防

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 支持 24/7 全天候复杂安防任务。AI-ISP 在极低照度下输出清晰彩色画面，多模型并发实现行人检测、车牌识别、周界入侵检测等功能，事件总线联动硬件告警（补光、对焦、告警输出），支持 GenAI 自然语言检索非预定义目标。
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "应用示例",
      items: [
        {
          title: "智能周界防护",
          description: "多模型并发运行行人检测与 CLIP 视觉编码器，支持自然语言描述目标检索（如「穿着红色夹克的人」），匹配后自动联动补光、对焦和告警。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-perimeter.png",
          imageAlt: "智能周界防护"
        },
        {
          title: "车牌识别",
          description: "容器化部署车牌识别模型，实时分析视频流，识别结果通过事件总线推送至业务系统，适用于停车场、园区出入口等场景。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-lpr.png",
          imageAlt: "车牌识别"
        },
        {
          title: "隐私合规监控",
          description: "动态隐私遮蔽（Dynamic Privacy Mask）自动对无关路人面部进行像素化脱敏，满足 GDPR 等隐私合规要求后再推送至监控中心。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-privacy.png",
          imageAlt: "隐私合规监控"
        }
      ]
    }
  ]}
/>

### 智慧工业

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 的独立 MCU 外设控制保障工业级可靠性——即使容器崩溃，底层硬件的掉电和限位保护依然生效。丰富的 IO 接口支持接入各类工业传感器和执行器。
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "应用示例",
      items: [
        {
          title: "安全装备检测",
          description: "实时检测工作人员是否佩戴安全帽、防护服、反光背心等，发现违规立即联动告警输出。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-safety.png",
          imageAlt: "安全装备检测"
        },
        {
          title: "产线质量检测",
          description: "容器化部署定制检测模型，实时分析产线产品外观，支持多角度变焦对焦配合检测，异常产品自动标记。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-quality.png",
          imageAlt: "产线质量检测"
        }
      ]
    }
  ]}
/>

### AIoT 与定制化应用

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 的容器化微服务架构和模块化 HAL 设计大幅降低了第三方算法公司的硬件部署门槛。基于 containerd 容器运行时，通过标准 OCI 镜像即可部署自定义 AI 应用，打破硬件供应商锁定。
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "应用示例",
      items: [
        {
          title: "VMS 视频管理集成",
          description: "以容器方式运行 NX Witness 等专业视频管理系统，NE503 同时承担智能 IPC 和 NVR 角色，降低系统复杂度和成本。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-vms.png",
          imageAlt: "VMS 视频管理集成"
        },
        {
          title: "自然语言视频检索",
          description: "部署 CLIP / VLM 等视觉语言模型，支持自由文本搜索视频内容，实现「非预定义目标的检索」，如识别携带特定物品的人员。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-nl-search.png",
          imageAlt: "自然语言视频检索"
        },
        {
          title: "多传感器融合",
          description: "通过 RS-485、Alarm IO 等对接外部传感器，结合边缘 AI 推理实现多维度环境感知与联动控制。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-sensor.png",
          imageAlt: "多传感器融合"
        }
      ]
    }
  ]}
/>

### 边缘 AI Box

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    在已有普通 IPC 存量部署的项目中，NE503 可通过 RTSP 拉取周边无算力 IPC 的视频流进行集中代理推理，扮演「摄像机里的 AI Box」角色，以最低改造成本实现存量项目的智能化升级。
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "应用示例",
      items: [
        {
          title: "存量 IPC 智能化改造",
          description: "NE503 同时拉取多路 RTSP 流，集中运行行人检测、区域入侵等 AI 模型，将推理结果推送至业务系统，无需更换现有摄像头即可升级为智能监控。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-ai-box.png",
          imageAlt: "存量 IPC 智能化改造"
        }
      ]
    }
  ]}
/>

## 产品资源

### 开发者资源

- Python SDK（MediaClient、InferenceClient、DeviceClient）
- [C++ SDK API 参考](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/)
- aipc-cli 命令行管理工具
- RESTful API（Bearer Token 认证）
- Hailo Dataflow Compiler 模型编译工具

## 技术支持

<SupportGrid />
