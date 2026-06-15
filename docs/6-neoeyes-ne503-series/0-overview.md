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

- **4K 专业成像系统**：Sony IMX678（1/1.8"）+ Hailo Gen2 AI-ISP + AF 自动变焦镜头（F1.6），支持 4K@30fps H.265 编码与 &lt;0.01 LUX 全彩夜视，在 HDR、低照及并发推理负载下保持成像质量，兼顾广角覆盖与远端识别。

- **容器化应用平台**：基于 containerd 运行时，OCI 标准镜像部署，沙箱隔离。模型与应用可独立部署升级，算法供应商、集成商与 OEM 厂商基于统一底座构建行业方案，避免供应商锁定。

- **工业级一体化交付**：成像、推理、告警联动、协议输出与运维管理集成于单机。IP67 防护 + PoE 802.3AT 供电 + Web 控制台，支持从开发验证到商业部署全流程。

- **全栈开发者工具链**：Python SDK + aipc-cli + RESTful API，适配多种接入方式。模块化 HAL 解耦软硬件，支持跨 SoC 平台平滑迁移。

## 产品总览规格

NE503 整机核心规格如下：

<table>
  <colgroup>
    <col width="14%" />
    <col width="18%" />
    <col width="68%" />
  </colgroup>
  <thead>
    <tr>
      <th>分类</th>
      <th>项目</th>
      <th>规格说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="6">核心平台</td>
      <td>SoC</td>
      <td>Hailo-15H</td>
    </tr>
    <tr>
      <td>CPU</td>
      <td>Cortex-A53 × 4 @ 1.3 GHz</td>
    </tr>
    <tr>
      <td>NPU</td>
      <td>Hailo NPU，20 TOPS @ INT8</td>
    </tr>
    <tr>
      <td>内存 / 存储</td>
      <td>8 GB LPDDR4 / 64 GB eMMC，支持 TF Card 与 M.2 SSD 扩展（M.2 暂未支持）</td>
    </tr>
    <tr>
      <td>视频编码</td>
      <td>H.264 / H.265 硬件编码，4K@30fps</td>
    </tr>
    <tr>
      <td>系统功耗</td>
      <td>5–6W（典型负载）</td>
    </tr>
    <tr>
      <td rowSpan="3">成像系统</td>
      <td>图像传感器</td>
      <td>Sony IMX678，1/1.8" CMOS，4K UHD</td>
    </tr>
    <tr>
      <td>镜头模组</td>
      <td>AF 自动变焦 8–32mm，F1.6</td>
    </tr>
    <tr>
      <td>ISP</td>
      <td>Hailo Gen2 AI-ISP，&lt;0.01 LUX 全彩夜视</td>
    </tr>
    <tr>
      <td rowSpan="3">网络与协议</td>
      <td>以太网</td>
      <td>100M LAN，支持 PoE 802.3AT</td>
    </tr>
    <tr>
      <td>视频协议</td>
      <td>RTSP</td>
    </tr>
    <tr>
      <td>数据协议</td>
      <td>MQTT / Event Bus / RTMP（规划）</td>
    </tr>
    <tr>
      <td rowSpan="3">部署环境</td>
      <td>供电</td>
      <td>DC 12V 或 PoE 802.3AT</td>
    </tr>
    <tr>
      <td>防护等级</td>
      <td>IP67</td>
    </tr>
    <tr>
      <td>工作温度</td>
      <td>-40°C – +60°C</td>
    </tr>
    <tr>
      <td rowSpan="2">外部接口</td>
      <td>报警 IO</td>
      <td>Alarm IN × 2 + Alarm OUT × 2（继电器 + 电平）</td>
    </tr>
    <tr>
      <td>扩展接口</td>
      <td>RS-485（补光灯接口为内部模组，非用户外部接口）</td>
    </tr>
    <tr>
      <td rowSpan="2">软件平台</td>
      <td>操作系统</td>
      <td>嵌入式 Linux（Yocto 构建），容器运行时 containerd</td>
    </tr>
    <tr>
      <td>管理方式</td>
      <td>Web 控制台 + SSH + REST API + aipc-cli</td>
    </tr>
  </tbody>
</table>

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
| 可支持任务 | 检测 / OCR / 人脸检测与识别 / ReID / 姿态估计 / 行为分析 / 属性识别等 |
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

NE503 成像系统由 Sony IMX678（1/1.8"）图像传感器与 AF 自动变焦镜头组成，传感器与镜头靶面 1:1 匹配，边缘画质无明显衰减。镜头覆盖 8mm（H 45.1°）至 32mm（H 14.7°）焦距段，单机即可完成广角全景监控与远端细节识别，AF 自动变焦支持现场按需切换。F1.6 大光圈配合 AI-ISP 低照增强，在暗光和逆光场景下仍保持成像质量。

### 传感器

| 参数 | 规格 |
|------|------|
| 传感器 | Sony IMX678，1/1.8" CMOS |
| 有效像素 | 3840 × 2160（4K UHD） |
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
      <td>焦距范围</td>
      <td>8mm（广角）– 32mm（长焦）</td>
    </tr>
    <tr>
      <td>最大光圈</td>
      <td>F1.6</td>
    </tr>
    <tr>
      <td>视场角</td>
      <td>水平 45.1°（W）/ 14.7°（T）；对角线 52.8°（W）/ 16.8°（T）；垂直 24.6°（W）/ 8.4°（T）</td>
    </tr>
    <tr>
      <td>机电能力</td>
      <td>AF 自动对焦与自动变焦，IR-Cut 电磁切换</td>
    </tr>
  </tbody>
</table>

### 镜头驱动与图像稳定

NE503 支持 AF 自动对焦与自动变焦，光学变焦范围 4x。控制方式支持 SoC 通过 SPI CS1 控制镜头（默认运行时控制路径），MCU 通过 SPI1 提供镜头归零与限位保护。板载陀螺仪支持 EIS 电子防抖，在变焦远端仍可保持画面稳定。

## 硬件架构

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/hardware-architecture.png" alt="硬件架构总览" width="80%" />
</div>

NE503 采用**核心处理板**与**接口板**双板结构，通过板对板连接器互联。核心处理板承载 SoC、NPU、内存及成像子系统，负责全部计算与 AI 推理任务；接口板集成独立 MCU、外部 IO 及电源管理电路，即使核心处理板异常，镜头归零、补光控制和 IO 保护等底层功能依然正常工作。

### 核心处理板

核心处理板集成 SoC、NPU、内存、存储及相机接口，承载全部计算与 AI 推理任务：

| 项目 | 规格 |
|------|------|
| SoC | Hailo-15H，Cortex-A53 × 4 @ 1.3 GHz |
| NPU | Hailo NPU，20 TOPS @ INT8 |
| DSP | 350 GOPS |
| 内存 | 8 GB LPDDR4 |
| 存储 | 64 GB eMMC |
| SSD 扩展 | M.2 KEY M（SoC 原生支持 PCIe Gen4，具体速率以硬件文档为准）⚠️ 暂未支持 |

### 接口板

接口板通过独立 MCU（Arm Cortex-M0+，64 MHz）管理全部外设与通信接口，通过 UART0 与核心处理板通信，并集成整机电能输入与分配电路。以太网 PHY 位于核心处理板上，TF 卡座等 SoC 接口也通过连接器引至接口板。

#### 外部接口

| 项目 | 规格 |
|------|------|
| Alarm I/O | 报警输入 × 2 + 报警输出 × 2（继电器 + 电平） |
| RS-485 | 串行通信总线 |
| 以太网 | 100M LAN，支持 PoE 802.3AT 供电 |
| TF Card | 支持 UHS-I 高速存储卡 |
| 补光灯接口 | 可接红外补光灯（已支持）、白光补光灯（预留） |

#### MCU 管理

| 项目 | 规格 |
|------|------|
| MCU | Arm Cortex-M0+ @ 64 MHz |
| 管理范围 | AF 镜头、补光灯、IR-CUT、加热器（预留）、风扇（预留）、Alarm IO、RS-485、光敏采样 |
| 温控 | 12V 风扇（预留）+ 12V 加热器（预留） |
| RTC | 法拉电容断电保持 |

#### 供电

| 项目 | 规格 |
|------|------|
| 供电方式 | DC 12V 适配器 或 PoE 802.3AT（一线供电） |
| 系统功耗 | 5–6W（典型负载） |

## 系统架构

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/software-stack.png" alt="软件栈架构" width="80%" />
</div>

NeoEyes NE503 采用四层分层架构，从底层硬件到 Web 管理界面清晰解耦：

<table>
  <thead>
    <tr>
      <th>层级</th>
      <th>组件</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web 管理控制台</td>
      <td>React 19 + TypeScript + Vite</td>
      <td>仪表盘、媒体设置、应用管理、系统管理</td>
    </tr>
    <tr>
      <td>平台服务层（Go）</td>
      <td>platform-api · app-manager · device-control · ai-runtime · event-bus</td>
      <td>REST API 网关、容器生命周期、硬件控制、AI 推理、事件总线</td>
    </tr>
    <tr>
      <td>HAL 及 C++ 服务层</td>
      <td>camera-daemon · libaipc_hal.so</td>
      <td>视频采集编码、硬件抽象层</td>
    </tr>
    <tr>
      <td>硬件层</td>
      <td>Hailo-15H SoC · Hailo NPU · MCU</td>
      <td>AI 加速、视频处理、外设控制</td>
    </tr>
  </tbody>
</table>

## 产品应用

NeoEyes NE503 凭借 20 TOPS 本地算力、容器化微服务架构和丰富的外设接口，将传统 IPC 转变为边缘计算一体机，适用于对画质、算力和定制化有高要求的高端智能安防及 AIoT 场景。

### 智能安防

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 支持 24/7 全天候复杂安防任务。AI-ISP 在极低照度下输出清晰彩色画面，多模型并发实现行人检测、车牌识别、周界入侵检测等功能，事件总线联动硬件告警（补光、对焦、Alarm 输出），支持 GenAI 自然语言检索非预定义目标。
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
          description: "实时检测工作人员是否佩戴安全帽、防护服、反光背心等，发现违规立即联动 Alarm 输出告警信号。",
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
- aipc-cli 命令行管理工具
- RESTful API（Bearer Token 认证）
- Hailo Dataflow Compiler 模型编译工具

## 技术支持

<SupportGrid />
