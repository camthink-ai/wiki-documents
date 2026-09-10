---
description: NeoEyes NE301 是一款低功耗边缘 AI 智能相机，搭载 STM32N6 芯片，具备 0.6TOPS 算力。支持 Web UI 调试、模块化扩展（WiFi/Cat-1/POE）及多种传感器触发，适用于智慧城市、工业及农业场景。
keywords: [NeoEyes NE301, 边缘AI相机, STM32N6, 低功耗相机, 智能视觉, 嵌入式AI, 物联网, 模块化设计, 智慧城市, 工业检测]
tags: [NE301, AI相机, 边缘计算, 物联网, 智能硬件]
---

import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import useBaseUrl from '@docusaurus/useBaseUrl';
import SupportGrid from '@site/src/components/SupportGrid';

# Product Information

## 基本介绍

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/301.png" alt="image" width="70%" />
</div>

NeoEyes NE301 是一款基于 STM32N6 MCU 的低功耗边缘 AI 智能相机，集成 0.6 TOPS 算力，采用模块化硬件架构，支持相机、通讯、供电等组件按需更换，具备丰富的接口扩展与完全开源的软硬件生态，助力开发者快速完成从原型到商业产品的落地。

### 核心能力

- **边缘 AI 推理**：0.6 TOPS 算力，Web UI 零代码模型部署与实时推理预览，支持 YOLOv8 等模型热替换。
- **超低功耗**：深度休眠仅 6.1 μA，4 节 AA 电池续航可达数年，支持 PIR / 雷达智能唤醒。
- **模块化硬件**：相机模组（CPI / USB，3 种视角）、通讯模组（WiFi / Cat-1 / PoE）、供电方案（电池 / Type-C / 太阳能 / PoE）均可按需更换。
- **端到端 AI 工具链**：开源 AI Tool Stack 平台与 NeoMind 云平台，从数据采集、标注、训练到量化部署全流程约 2 小时完成。
- **传感器扩展生态**：Sensor 扩展板支持 9 种传感器（PIR、雷达、温湿度、ToF、热成像等）、OLED / TFT 显示屏、麦克风，即插即用。
- **多通讯与多触发**：WiFi 6 / Cat-1 / PoE 多方案通讯，支持 MQTT / RTMP 数据上报与视频推流；PIR / 雷达 / 声音 / IO / 定时 / MQTT 远程 / AI 检测等多触发抓拍。
- **完整开源**：固件、传感器驱动及软件平台全部开源（GitHub），开发者可自由定制与二次开发。
- **Web UI 设备管理**：浏览器端完成设备配置、实时视频预览、推理参数调节、配置导入导出，无需 SDK 集成。

## 产品规格

NE301整机产品规格如下：

<table>
  <thead>
    <tr>
      <th>分类</th>
      <th>项目</th>
      <th>规格</th>
    </tr>
  </thead>
  <tbody>
    <!-- MCU -->
    <tr>
      <td rowspan="7">MCU</td>
      <td>Core</td>
      <td>Cortex-M55，主频 800 MHz，支持 Arm Helium 矢量处理技术</td>
    </tr>
    <tr>
      <td>NPU</td>
      <td>集成 Neural-ART™ 加速器，运行频率 1 GHz，AI 算力高达 600 GOPS（0.6 TOPS），支持实时神经网络推理</td>
    </tr>
    <tr>
      <td>SRAM</td>
      <td>4.2 MB</td>
    </tr>
    <tr>
      <td>ISP Image Processor</td>
      <td>内置专用 ISP，具备去马赛克、自动白平衡等预处理功能</td>
    </tr>
    <tr>
      <td>Video Codec</td>
      <td>H.264 硬件编码器与 JPEG 编码器，支持 1080p@30fps 视频处理</td>
    </tr>
    <tr>
      <td>能效指标</td>
      <td>NPU 能效达 3 TOPS/W，全速运行无需散热</td>
    </tr>
    <tr>
      <td>启动/唤醒速度</td>
      <td>微秒级启动，毫秒级唤醒</td>
    </tr>
    <!-- 主板 -->
    <tr>
      <td rowspan="11">主板</td>
      <td>HyperFlash</td>
      <td>128 MB</td>
    </tr>
    <tr>
      <td>PSRAM</td>
      <td>64 MB</td>
    </tr>
    <tr>
      <td>按键</td>
      <td>复位按键、Boot 按键、抓拍/录像按键</td>
    </tr>
    <tr>
      <td>指示灯</td>
      <td>电源指示灯、系统指示灯</td>
    </tr>
    <tr>
      <td>通讯</td>
      <td>Wi-Fi 6 / BLE / 以太网（通过POE模块）</td>
    </tr>
    <tr>
      <td>镜头模组接口</td>
      <td>4 Pin USB ×1，MIPI CSI-2 ×1</td>
    </tr>
    <tr>
      <td>16 Pin IO</td>
      <td>UART×1<br/>RS485×1<br/>I2C×1<br/>SPI×1<br/>GPIO×2<br/>3.3V×1 / 5V×1（供电可控）<br/>GND×2</td>
    </tr>
    <tr>
      <td>调试与供电</td>
      <td>USB Type-C ×1，UART 4-Pin Wafer ×1</td>
    </tr>
    <tr>
      <td>音频输入输出</td>
      <td>Audio Input×1 (Wafer) 与 Audio Output×1 (Wafer)</td>
    </tr>
    <tr>
      <td>通讯模块扩展接口</td>
      <td>12-Pin + 16-Pin IO 座子（通讯模块/传感器扩展）</td>
    </tr>
    <tr>
      <td>扩展存储</td>
      <td>TF Card (Micro SD)</td>
    </tr>
    <!-- 结构参数与其它 -->
    <tr>
      <td rowspan="5">结构参数与其它</td>
      <td>电源输入</td>
      <td>DC 5 V</td>
    </tr>
    <tr>
      <td>尺寸</td>
      <td>77mm × 77mm × 48mm</td>
    </tr>
    <tr>
      <td>工作温度</td>
      <td>−20 °C ~ +50 °C</td>
    </tr>
    <tr>
      <td>湿度</td>
      <td>0% ~ 90% RH（无凝露）</td>
    </tr>
    <tr>
      <td>认证</td>
      <td>CE / FCC / RoHS/ SRRC</td>
    </tr>
  </tbody>
</table>

## 性能与边缘AI

### 低功耗设计

NeoEyes NE301 以 STM32N6 负责 AI 推理与图像处理。V1.1–V1.3 增加 STM32U073Kx 电源管理芯片，在深度休眠中监测传感器并按需唤醒系统；V1.0 为初始电源架构，接口与控制方式请按硬件版本确认。

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/U0.png" alt="双MCU架构" width="60%" />
</div>

| 指标 | 参数 |
| :--- | :--- |
| **深度休眠功耗** | 6.1 μA（V1.1–V1.3 由 U0 芯片控制） |
| **工作功耗** | 170–180 mA（WiFi 模式） |
| **唤醒延迟** | 毫秒级（从深度休眠到工作） |
| **电池续航** | 4 节 AA 电池，1 次/天抓拍可达约 13 年 |

> 注：续航数据基于 WiFi 模式、4 节 AA 碱性电池（2500mAh），具体请以实际部署为准。

### 边缘 AI 计算

设备 MCU 采用 STM32N6 为核心进行开发，集成 Neural-ART™ 加速器，0.6 TOPS 算力足以在本地运行轻量级人物检测、手势识别等模型，无需上传云端。通过将 AI 推理下沉到边缘侧，在成本、时延和隐私性方面相比传统的"设备 + 服务器"方案更优。

| 指标 | 参数 |
| :--- | :--- |
| **NPU 算力** | 600 GOPS（0.6 TOPS） |
| **本地图像推理响应** | 2–3 秒 |
| **AI 实时视频推理** | 720P @ 25 Hz，1080P @ 15 Hz |
| **NPU 能效** | 3 TOPS/W，全速运行无需散热 |
| **预置模型** | YOLOv8 Nano（COCO 80 类目标检测） |

## 硬件介绍

NeoEyes NE301 由前盖、镜头模组、主板、通讯模块、电池模块等功能单元组成，各模块通过标准化接口连接，支持按需拆装与更换。

<div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
  <div style={{ textAlign: "center", width: "45%" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/motherboard-front.png" alt="主板正面" style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
    <p style={{ marginTop: "8px", color: "#888", fontSize: "0.9em" }}>主板正面</p>
  </div>
  <div style={{ textAlign: "center", width: "45%" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/motherboard-back.png" alt="主板背面" style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
    <p style={{ marginTop: "8px", color: "#888", fontSize: "0.9em" }}>主板背面</p>
  </div>
</div>

### 模块化设计

NE301 采用前/中/后分离的模块化布局，各功能模块均可独立更换：

- **相机模组**：支持 CPI、USB 相机，提供 51°/88°/137° 三种视角可选，详见[「可换相机模组」](#可换相机模组)。
- **通讯模组**：支持 WiFi、Cat-1、PoE 以太网切换，详见[「通讯方案」](#通讯方案)。
- **供电方案**：4 节 AA 电池（标配）、USB Type-C 有线供电、太阳能、PoE 供电。
- **安装扩展**：结构主体预留丰富安装孔位，配合 CamThink [「产品配件」](#产品配件)可灵活部署。如需结构设计文件（可 3D 打印），请联系我们获取。
- **开源固件**：完整开源，开箱即用低功耗模式、设备唤醒、MQTT 传输、补光控制、定时拍摄等功能。开发和烧录请参见「开发指南」。

### 硬件接口

主板提供丰富的接口用于外部扩展与调试：

- **16Pin IO**：GPIOs、DI、DO 等接口，支持接入外部传感器触发拍摄（资源取决于通讯模块和 USB 相机占用情况）。
- **电源**：背面 2pin 电池仓供电；正面下方 Type-C 有线供电（整机密封需开孔引出）。
- **存储**：Micro TF 卡槽，用于本地图像或数据存储。
- **调试**：USB Type-C 和 UART 串口调试。
- **灯光**：补光灯和系统指示灯。
- **Alarm / PIR**：2Pin Alarm 输入；独立 4Pin PIR 接口仅适用于 V1.3，其余版本的 ISP/PIR 接线需按硬件版本确认。

### 可换相机模组

<table>
  <colgroup>
    <col width="12%" />
    <col width="30%" />
    <col width="18%" />
    <col width="18%" />
    <col width="22%" />
  </colgroup>
  <thead>
    <tr>
      <th>类别</th>
      <th>型号</th>
      <th>视角</th>
      <th>适配距离</th>
      <th>应用场景</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CPI相机</td>
      <td>OS04C10-51-4M <br/>OS04C10-88-3M <br/>OS04C10-137-4M</td>
      <td>51°<br/>88°<br/>137°</td>
       <td>4m <br/>3m <br/>2m</td>
      <td>标准角度拍摄 <br/>大角度拍摄<br/>广角拍摄</td>
    </tr>
   <tr>
      <td>USB相机</td>
      <td>SC200AI-51-4M <br/>SC200AI-88-3M <br/>SC200AI-137-4M</td>
      <td>51°<br/>88°<br/>137°</td>
      <td>4m <br/>3m <br/>2m</td>
      <td>标准角度拍摄 <br/>大角度拍摄<br/>广角拍摄</td>
    </tr>
  </tbody>
</table>

> 注：整机标配为CPI相机-OS04C10,如需USB相机可额外选购。

### 通讯方案

> NeoEyes NE301默认支持WiFi通讯传输数据，支持选用LTE Cat-1通讯模块或POE模块，POE模块可同时提供以太网有线连接与供电，模块与主板正面pin座子连接即可支持以太网、LTE Cat-1或WiFi-Halow通讯，易于硬件的通讯方案更换和扩展。

- **接口与兼容性**：标准PIN座连接，位于主板正面，支持免驱动识别。
- **POE模块**：通过POE扩展模块实现以太网有线连接与POE供电一体化，适用于对网络稳定性和供电便捷性要求较高的部署场景。
- **Cat-1模块规格**：移远EG912U-GL（全球非北美地区）和移远EG915Q-NA（北美地区），支持LTE FDD/TDD和GSM等，尺寸60mm x 60mm。

### Sensor 扩展板

通过主板扩展接口连接 Sensor 扩展板，可对接多种外部设备：

- **传感器**：PIR、雷达、温湿度、ToF 测距、热成像等多种传感器，实现环境感知与事件触发。
- **显示屏**：OLED / TFT 显示屏，支持本地信息展示与人机交互。
- **麦克风**：音频输入，支持语音采集与声学触发。

> 传感器扩展板详细规格与驱动开发请参见[「Sensor 扩展板指南」](../3-hardware-dev-resources/23-sensor-extension-board.md)。

## 产品配件

> NE301产品系列支持选配安装，结构安装同NE101，具体配件如下

| 图片                                                                                                        | 名称                  | 数量 | 说明                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png" alt="底部支架扩展件" width="180" />      | 底部支架扩展件        | 1    | 适合顶部安装、底部安装扩展使用                                                                                  |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png" alt="背部支架扩展件" width="180" />      | 背部支架扩展件        | 1    | 适合壁装相机时扩展使用                                                                                          |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png" alt="杆件支架" width="180" />            | 杆件支架              | 1    | 适合复杂场景需要多角度调整相机时根据场景扩展使用，套件包含金属杆*2、转换头*2，金属杆可定制                    |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/4.png" alt="表盘支架" width="180" />            | 表盘支架              | 1    | 适合环境光线影响较少的仪表采集固定安装使用                                                                      |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/2.png" alt="水表支架" width="180" />            | 水表支架              | -    | 可提供3D设计文件自行3D打印，非实体支架选配                                                                      |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="04C10相机模组" width="180" />         | OS04C10 摄像头        | 1    | 支持3种规格：``51° FOV, 4m focus``、``88° FOV, 3m focus ``、``137° FOV, 2m focus``                           |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="SC200AI USB摄像头模组" width="180" /> | SC200AI USB摄像头模组 | 1    | 支持3种规格：``51° FOV, 4m focus``、``88° FOV , 3m focus``、``137° FOV, 2m focus`` |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.jpg" alt="Cat.1通讯模块" width="180" />        | Cat.1通讯模块         | 1    | 可自行通过主板插槽装配，支持全球版本或北美版本可选                                                              |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/poe.png" alt="image" width="180" />                                            | POE通讯模块           | 1    | 可自行通过主板插槽装配                                                                                          |

### 部署与安装

NeoEyes NE301 设计兼顾户外稳定性与灵活部署能力，适用于多种安装环境和场景。

- **前盖镜头钢化玻璃**：镜头前盖采用高透光钢化玻璃，具备出色的防雨水积聚能力，保障长期户外拍摄效果稳定。
- **无线与户外部署支持**：支持电池供电、低功耗运行，结合 IP67 级防护设计，适用于各种恶劣环境中的长期部署；通过POE模块可同时获得以太网有线连接与供电，满足对网络稳定性要求较高的场景。
- **灵活的安装方式**：支持墙面、顶部、立杆等多种安装方式，提供丰富的原装支架和外壳扩展组件，满足多样部署需求。

#### 壁装支架及安装示意

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Wall_Mount.png" alt="壁装支架" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Wall_Mount.png" alt="壁装安装示意" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### 表盘支架及安装示意

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Meter_Mount.png" alt="表盘支架" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Meter_Mount.png" alt="表盘安装示意" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### 杆件支架及安装示意

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Rod_Mount.png" alt="杆件支架" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Rod_Mount.png" alt="杆件安装示意" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### 三轴球支架及安装示意

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_ShaftBall_Mount.png" alt="三轴球支架" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_ShaftBall_Mount.png" alt="三轴球安装示意" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### 座装支架及安装示意

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_U_Type_Mount.png" alt="座装支架" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_U_Type_Mount.png" alt="座装安装示意" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

## 产品应用

NeoEyes NE301 凭借本地 AI 推理能力与超低功耗设计，适用于边缘计算与推理、事件触发、周期采样等视觉类 AI 应用，以下为场景使用示例。

### 智慧城市

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-city.png" alt="智慧城市应用概述" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE301 凭借其超低功耗设计（休眠功耗仅7-8μA）和边缘AI计算能力，可在城市环境中长时间部署，无需人力频繁更换电池，同时实时进行本地AI推理，保障数据隐私与低延迟响应。
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
          title: "占有检测",
          description: "通过事件触发抓拍（如 PIR / 雷达）实时监测公共区域，识别位置占用、违规占用及物品堆积，并立即上报告警。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-possession-detection.png",
          imageAlt: "占有检测"
        },
        {
          title: "无人零售",
          description: "利用边缘 AI 实时分析顾客行为与商品识别，实现自动结算与防盗；在无外接电源场景下仍可保持长期稳定运行。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-unmanned-retail.png",
          imageAlt: "无人零售"
        },
        {
          title: "智慧广告屏",
          description: "结合客流统计与人群属性分析，优化广告投放策略；设备本地处理视频流，仅上传分析结果，大幅节省带宽。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-advertising-screen.png",
          imageAlt: "智慧广告屏"
        }
      ]
    }
  ]}
/>

### 智能工厂

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-factory.png" alt="智能工厂应用概述" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE301 的模块化设计支持灵活更换相机模组与通讯方案，满足工业场景的多样化需求；其边缘AI能力可在本地完成安全装备检测，避免网络延迟，提升响应速度。
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
          description: "实时监测工作人员是否佩戴安全帽、防护服等，发现违规立即告警。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-industrial-safety.png",
          imageAlt: "工业安全装备检测"
        },
        {
          title: "生产检测",
          description: "流水线生产过程中，实时监测产品是否符合规范，发现异常及时告警。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-industrial-testing.png",
          imageAlt: "流水线生产"
        }
      ]
    }
  ]}
/>

### 智慧农业、畜牧业

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-agriculture.png" alt="智慧农业与畜牧业应用概述" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE301 的低功耗特性与电池供电方案使其适用于无电网覆盖的农业场景，通过周期性抓拍与边缘分析，实现作物与牲畜的智能化管理。
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
          title: "周期性抓拍农作物生长",
          description: "定时拍摄作物图像，通过 AI 分析生长状态，为精准农业提供数据支持。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-plant.png",
          imageAlt: "周期性抓拍农作物生长"
        },
        {
          title: "畜牧业周期性抓拍",
          description: "监测牲畜活动与健康状况，及时发现异常并联动告警。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-animal.png",
          imageAlt: "畜牧业周期性抓拍"
        },
        {
          title: "智能养殖",
          description: "识别单头生猪后联动下料器精准投喂或计数，提升养殖效率。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-pig.png",
          imageAlt: "智能养殖"
        }
      ]
    }
  ]}
/>

### 其它集成

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-integrated-applications-overview.png" alt="其它集成应用概述" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE301 的开放式硬件架构与丰富接口支持轻松集成到各类设备中，扩展应用边界，满足多场景的定制化需求。
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
          title: "智能门铃 / 猫眼",
          description: "通过 PIR 或雷达传感器触发，抓拍可疑人员并本地识别，保障家庭安全。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-doorball.png",
          imageAlt: "智能门铃或猫眼"
        },
        {
          title: "工业产线",
          description: "集成到产线设备，实时视频流 AI 分析，监控生产质量与流程。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-production.png",
          imageAlt: "工业产线监控"
        },
        {
          title: "车载系统",
          description: "检测驾驶员疲劳状态，及时发出警报，提升行车安全。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-drowsy.png",
          imageAlt: "车载系统监测"
        }
      ]
    }
  ]}
/>

## 应用工程实例

- [模型训练与部署](./3-application-guide/0-model-training-and-deployment/0-model-training-and-deployment.md)

<!--链接到应用指南-->

<!-- NE301可满足多类场景需求，最本质的优势是支持本地AI推理，以下是典型应用案例，每个案例提供完整且详细的部署过程，助您快速上手应用完成实际项目落地

Alarm 报警触发

水表模型即时识别

人物姿态检测

物品识别分类

人数统计、课堂签到，100人教室识别

数据处理、分析和可视化：BeaverIOT
-->
## 产品资源

### 产品教程

- [快速开始](./1-quick-start.md)
- NE300-MB01 开发板教程：
  - [总览](./2-NE300-MB01-development-board/0-dev-guide.md)
  - 硬件指南：
    - [组件总览](./2-NE300-MB01-development-board/1-hardware-guide/0-components-overview.md)
    - [硬件连接](./2-NE300-MB01-development-board/1-hardware-guide/1-hardware-connection.md)
    - NE301原理图[「下载」](https://resources.camthink.ai/wiki/doc/ne301-schematic-open.pdf)
    - NE301PCB文件[「下载」](https://resources.camthink.ai/wiki/doc/ne301-pcb-open.pdf)
  - 软件指南：
    - [开发环境搭建](./2-NE300-MB01-development-board/2-software-guide/0-development-environment-setup.md)
    - [系统烧录与初始化](./2-NE300-MB01-development-board/2-software-guide/1-system-flashing-and-initialization.md)
    - [Windows + WSL 源码构建与烧录](./2-NE300-MB01-development-board/2-software-guide/2-windows-wsl-source-build-and-flash.md)

## 技术支持
<SupportGrid />
<!--Discord、GIthub issue-->
