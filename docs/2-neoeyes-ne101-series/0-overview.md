---
description: NeoEyes NE101 是一款基于事件触发抓拍的超低功耗智能相机，采用模块化设计，具有灵活的扩展能力，适用于AIoT和户外监测场景。
keywords: [NeoEyes NE101, 事件相机, 低功耗, 智能相机, 模块化设计, AIoT, 户外监测, 工业自动化, 边缘AI, PIR, WiFi Halow]
tags: [产品概述, 智能相机, IoT, 低功耗, 模块化, 边缘AI]
---

import Link from "@docusaurus/Link";
import SupportGrid from '@site/src/components/SupportGrid';
import AccessoriesTable from '@site/src/components/AccessoriesTable';
import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import useBaseUrl from '@docusaurus/useBaseUrl';

## 产品信息

## 产品介绍
<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101.png" alt="NE101" width="20%" />
</div>

CamThink Event Camera NeoEyes NE101 是一款基于事件触发抓拍的低功耗智能相机，采用模块化设计理念，具有**超低功耗**的特点。相机支持开发者扩展多种触发拍照方式（PIR/雷达/声音等），可搭配不同传感器模块实现**事件监测图像抓取**根据触发条件自主唤醒并进行图像采集，极大节省功耗。其**开放式硬件架构**允许开发者根据实际需求灵活扩展功能模块，快速完成从原型到商业产品的落地。

### 硬件特性信息
>NeoEyes NE101产品由前盖、镜头模组、主板、通讯模块、电池模块等多个功能单元组成。各模块间通过标准化接口连接，便于拆装与维护，支持开发者按需替换、升级或定制特定模块。
- **分层式结构设计**：采用前/中/后分离的模块化布局，便于快速拆装与功能扩展，支持用户按需DIY改装。如需获取结构设计文件，请联系我们获取。
- **多样化安装支持**：结构主体预留丰富的安装孔位，兼容多种支架和外壳扩展方案。配合 CamThink 提供的[「产品配件」](#产品配件)，可灵活部署于不同使用场景。
- **相机模组可选**：主板支持CPI、USB相机模组，可更换不同规格的镜头，用于满足不同场景的图像采集需求，相机模组更换和支持规格详见[「可换相机模组」](#可换相机模组)。
- **通讯方案可选**：支持WiFi、Cat-1、WiFi-Halow通讯方案切换，满足不同场景通讯需求，通讯模组更换和支持规格详见[「通讯方案扩展」](#通讯方案扩展)。
- **供电方案可选**：默认支持电池仓方案供电，4节AA电池即可工作，也可通过主板Type-C进行有线供电。
- **硬件开放性**：提供结构设计文件用于DIY外壳（可3D打印）或自定义扩展，提供完整开源固件，具备开箱即用功能：低功耗模式、设备唤醒、MQTT数据传输、补光控制、定时拍摄、图像参数调整、网络管理。开发和烧录请参见[「开发指南」](./2-ne100-mb01-development-board/0-dev-guide.md)

![NE101](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Module.png)


### 超低功耗支持
>NeoEyes NE101采用先进的低功耗设计理念，适用于周期性图像采集等对续航有严格要求的应用场景，官方软件默认即支持低功耗工作模式，开发者也可基于基础工程灵活扩展功能。
- **超长续航表现**：在Wi-Fi通信模式下，默认低功耗配置可支持每日拍摄5次，续航超3年（理论值），极大降低运维频率，适用于野外或无持续供电环境，更多功耗测试表现详见下方表格：
<!-- 
  | 通信方式 | 6V电池续航 | 7.2V锂亚电池续航 | 使用建议 |
  |---------|------------|-----------------|----------|
  | Wi-Fi | 2.39年 | 6.20年 | 在7.2V高能电池条件下表现最佳，适合大多数中近距离部署需求 |
  | Halow Wi-Fi | 1.46年 | 4.30年 | 兼顾续航与远距离通信，适合偏远或障碍环境 |
  | Cat.1 | 0.83年 | 2.08年 | 虽支持广域蜂窝网络，但在极低功耗场景中建议搭配外部供电优化使用策略 |
  > 注：测试条件为每日拍摄10次，电池使用率70%。6V电池为标配AA电池，7.2V锂亚电池为4节38.8Wh规格，其中**锂亚电池暂不支持当前的标准电池仓安装，若有需要可联系我们**。 -->

- **传感器感知低功耗扩展支持**：支持图像触发模式下的事件唤醒抓拍运行机制（如PIR、雷达、温度等），在非工作状态下进入深度休眠，充分保障系统在不同触发频率下的功耗可控，关于如何扩展传感器事件抓拍的传感器连接的开发案例详见：[「PIR示例」](./2-ne100-mb01-development-board/2-software-guide/3-example-pir.md)

- **开源固件，支持商用**：固件源码完全开源，支持免费商用与二次开发，固件提供图像采集、低功耗管理、数据通信等开箱即用功能，开发者可在此基础上快速扩展应用逻辑，缩短从原型到落地的开发周期。关于固件功能及开发者指引详见：[「超低功耗相机示例」](./3-application-guide/0-low-power-image-acquisition.md)

![Wireless communication](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Conet.png)

### 硬件接口扩展
>NeoEyes NE101支持根据硬件使用场景扩展硬件能力，关于各种物理接口的使用可见[「硬件指南」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md)
- **16Pin IO接口**：主板背部预留16pin座子，带有GPIOs、DI、DO等接口，支持接入各种传感器触发拍摄（资源使用取决于通信模块和USB相机的占用情况），具体IO资源详见[「硬件指南-硬件连接-16Pin GPIO扩展」](./2-ne100-mb01-development-board/1-hardware-guide/1-hardware-connection.md)
- **电源接口**：主板背面留有2pin电源座子，支持电池仓连接供电，主板正面下方带有Type-C接口可支持有线连接直供电（整机使用需要下方开孔引出）。
- **Micro TF卡槽**：可用于存储扩展，适用于本地图像或数据存储。
- **调试接口**：Type-C和UART用于开发串口调试使用。
- **补光灯**：补光灯和光敏支持，适合在近距离黑暗环境中采集图像使用。
- **Alam接口**：2Pin Wafer支持Alarm输入。
- **PIR接口**：4Pin Wafer支持PIR传感器连接。
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE100-MB01_1.png" alt="主板正面" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE100-MB01_2.png" alt="主板背面" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### 通讯方案扩展
>NeoEyes NE101默认支持WiFi通讯传输数据，支持选用LTE Cat-1、WiFi-Halow通讯模块，模块与主板正面pin座子连接即可支持LTE Cat-1或WiFi-Halow通讯，易于硬件的通讯方案更换和扩展，关于模组的更换使用可见[「硬件指南」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md)。
- **接口与兼容性**：标准PIN座连接，位于主板正面，支持免驱动识别。
- **Cat-1模块规格**：移远EG912U-GL（全球非北美地区）和移远EG915Q-NA（北美地区），支持LTE FDD/TDD和GSM等，尺寸60mm x 60mm。
- **WiFi HaLow模块规格**：移远FGH100M，基于IEEE 802.11ah协议，用于长距离低功耗连接，支持868MHz/915MHz，尺寸60mm x 60mm。
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.jpg" alt="Cat-1 PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/wifihalow.jpg" alt="WiFi HaLow PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### 可换相机模组
> NeoEyes NE101 采用模块化相机设计，支持用户根据实际应用场景灵活更换不同参数的镜头模组，以适配不同的拍摄角度和对焦距离需求。关于模组更换与使用详见 [「硬件指南」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md)。

#### 硬件特性优势
- **灵活部署**：可根据部署高度、空间大小和识别目标，选择最适配的镜头模组。
- **低成本升级**：仅需更换镜头模组即可显著提升视觉效果，无需更换主板。

#### 支持的相机模组规格
<table style={{ width: '100%', tableLayout: 'fixed' }}>
  <thead>
    <tr>
      <th style={{ width: '20%' }}>类型</th>
      <th style={{ width: '20%' }}>型号</th>
      <th style={{ width: '20%' }}>视角</th>
      <th style={{ width: '20%' }}>对焦距离</th>
      <th style={{ width: '20%' }}>应用场景</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="4">CPI相机</td>
      <td>OV5640</td>
      <td>60°</td>
      <td>15cm</td>
      <td>近距离拍摄</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>60°</td>
      <td>4m</td>
      <td>标准距离拍摄</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>120°</td>
      <td>8cm</td>
      <td>近距离广角拍摄</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>120°</td>
      <td>3m</td>
      <td>标准距离广角拍摄</td>
    </tr>
    <tr>
      <td rowSpan="3">USB相机</td>
      <td>SC200AI-51-4M</td>
      <td>51°</td>
      <td>4m</td>
      <td>标准角度拍摄</td>
    </tr>
    <tr>
      <td>SC200AI-88-3M</td>
      <td>88°</td>
      <td>3m</td>
      <td>大角度拍摄</td>
    </tr>
    <tr>
      <td>SC200AI-137-2M</td>
      <td>137°</td>
      <td>2m</td>
      <td>广角拍摄</td>
    </tr>
  </tbody>
</table>

注：USB相机模组会占用额外IO资源，详见
[「硬件指南-硬件连接-16Pin GPIO扩展」](./2-ne100-mb01-development-board/1-hardware-guide/1-hardware-connection.md)。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="Cat-1 PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor2.png" alt="WiFi HaLow PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### 适用性与部署
>NeoEyes NE101 设计兼顾户外稳定性与灵活部署能力，适用于多种安装环境和场景
- **前盖镜头钢化玻璃**：镜头前盖采用高透光钢化玻璃，具备出色的防雨水积聚能力，保障长期户外拍摄效果稳定。
- **无线与户外部署支持**：支持电池供电、低功耗运行，结合 IP67 级防护设计，适用于各种恶劣环境中的长期部署。
- **灵活的安装方式**：支持墙面、顶部、立杆等多种安装方式，提供丰富的原装支架和外壳扩展组件，满足多样部署需求，支架规格和主要使用常见可见[「产品配件-产品选配配件」](#产品选配配件)
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

## 产品信息
### 产品规格
NE101整机产品规格如下：
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/ProductBL.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/ProductR.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>
<table style={{ width: '100%', tableLayout: 'fixed' }}>
  <thead>
    <tr>
      <th style={{ width: '20%' }}>产品型号</th>
      <th style={{ width: '16%' }}>NE101</th>
      <th style={{ width: '16%' }}>NE101-L01GL</th>
      <th style={{ width: '16%' }}>NE101-L02NA</th>
      <th style={{ width: '16%' }}>NE101-HL00</th>
      <th style={{ width: '16%' }}>NE101-HL01</th>
    </tr>
  </thead>
  <tbody style={{ textAlign: 'center' }}>
    <tr>
      <td style={{ width: '20%' }}><strong>通信</strong></td>
      <td style={{ width: '16%' }}>WiFi</td>
      <td style={{ width: '16%' }}>Cat.1（支持全球除北美地区外的其他地区）</td>
      <td style={{ width: '16%' }}>Cat.1（支持北美地区）</td>
      <td style={{ width: '16%' }}>WiFi-HaLow（868MHz）</td>
      <td style={{ width: '16%' }}>WiFi-HaLow（915MHz）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>MCU</strong></td>
      <td colSpan="5">ESP32-S3</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>RAM</strong></td>
      <td colSpan="5">8MB</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Flash</strong></td>
      <td colSpan="5">16MB</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>相机模组</strong></td>
      <td colSpan="5">
        <p>Default OV5640 Module（120° FOV 3m focus ）</p>
        <span>More lenses available</span> 
      </td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>补光灯</strong></td>
      <td colSpan="5">支持</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>蓝牙</strong></td>
      <td colSpan="5">支持</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>按键</strong></td>
      <td colSpan="5"> Snap（主机侧面）, Boot(位于主板), Reset(位于主板)</td>
    </tr>
        <tr>
      <td style={{ width: '20%' }}><strong>存储</strong></td>
      <td colSpan="5">Micro-TF（位于主板）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>告警接口</strong></td>
      <td colSpan="5">Alarm *1（位于主板）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>扩展IO</strong></td>
      <td colSpan="5">UART *1、16Pin IO *1（位于主板）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>供电</strong></td>
      <td colSpan="5">电池供电,Type-C供电支持（位于主板）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>工作温度</strong></td>
      <td colSpan="5">-20°C ~ 50°C</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>工作湿度</strong></td>
      <td colSpan="5">0% ~ 90% RH</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>防护等级</strong></td>
      <td colSpan="5">IP67</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>认证</strong></td>
      <td colSpan="5">CE / FCC / RoHs</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>外形尺寸</strong></td>
      <td colSpan="5">77mm × 77mm × 48mm</td>
    </tr>
  </tbody>
</table>


## 支架和使用

本产品提供多种支架配件，支持多种安装方式，可满足多种场景使用需求。


### 产品外形整尺寸

![NE_Series_OutlineSize.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_OutlineSize.png)



### 产品配件

<!-- #### 产品标准配件
>CamThink Event Camera NeoEyes NE101产品系列提供的标准配件如下：

<AccessoriesTable
  accessories={[
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Battery.png",
      name: "电池",
      quantity: "4",
      description: ["常规5号AA电池"]
    }
  ]}
/> -->

#### 产品选配配件

>CamThink Event Camera NeoEyes NE101产品系列支持选配配件如下：

<AccessoriesTable
  accessories={[
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png",
      name: "底部支架扩展件",
      quantity: "1",
      description: ["适合顶部安装、底部安装扩展使用"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png",
      name: "背部支架扩展件",
      quantity: "1",
      description: ["适合壁装相机时扩展使用"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png",
      name: "杆件支架",
      quantity: "1",
      description: ["适合复杂场景需要多角度调整相机时根据场景扩展使用，套件包含金属杆*2、转换头*2，金属杆可定制"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/4.png",
      name: "表盘支架",
      quantity: "1",
      description: ["适合环境光线影响较少的仪表采集固定安装使用"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/2.png",
      name: "水表支架",
      quantity: "-",
      description: ["可提供3D设计文件自行3D打印，非实体支架选配"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor2.png",
      name: "OV5640相机模组",
      quantity: "1",
      description: [
        "支持4种规格：",
        "60° FOV, 15cm focus",
        "60° FOV, 4m focus",
        "120° FOV, 8cm focus",
        "120° FOV, 3m focus",
      ]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png",
      name: "SC200AI USB摄像头模组",
      quantity: "1",
      description: [
        "支持3种规格：",
        "1080P ,51° FOV, 4m focus",
        "1080P ,88° FOV, 3m focus",
        "1080P ,137° FOV, 2m focus",
      ]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/wifihalow.png",
      name: "WiFi-Halow通讯模块",
      quantity: "1",
      description: ["可自行通过主板插槽装配，支持868/915频段版本选择"]
    },
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.png",
      name: "Cat.1通讯模块",
      quantity: "1",
      description:["可自行通过主板插槽装配，支持全球版本或北美版本可选"]
    },
  ]}
/>

### 产品安装

#### 壁装支架及安装示意

![NE_Series_Bracket_Wall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Wall_Mount.png)

![NE_Series_Wall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Wall_Mount.png)

#### 表盘支架及安装示意

![NE_Series_Bracket_Meter_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Meter_Mount.png)

![NE_Series_Meter_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Meter_Mount.png)

#### 杆件支架及安装示意

![NE_Series_Bracket_Rod_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Rod_Mount.png)

![NE_Series_Rod_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Rod_Mount.png)

#### 三轴球支架及安装示意

![NE_Series_Bracket_ShaftBall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_ShaftBall_Mount.png)

![NE_Series_ShaftBall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_ShaftBall_Mount.png)

#### 座装支架及安装示意

![NE_Series_Bracket_U_Type_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_U_Type_Mount.png)

![NE_Series_U_Type_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_U_Type_Mount.png)


## 产品应用

### 产品适用场景

>NE101低功耗智能相机凭借其超低功耗特性和模块化设计，可广泛应用于需要事件触发或周期性图像采集的物联网场景

<ApplicationScenarios
  imagePosition="center"
  maxDescriptionLines={4}
  categories={[
    {
      title: "智慧农业",
      items: [
        {
          title: "农作物生长监测",
          description: "通过定时拍摄或环境变化触发，记录农作物生长状态，支持远程监测作物长势，每日拍摄10次情况下可续航3年以上，特别适合偏远农田场景。",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/zw.jpg"
        },
        {
          title: "畜牧行为分析", 
          description: "结合PIR传感器监测牲畜活动，自动抓拍行为图像，帮助及时发现病畜或发情期动物行为，提升养殖管理效率。",
          image: "https://cdn.prod.website-files.com/6479eab6eb2ed5e597810e9e/67ed59d05b90b9b7844d7b8d_66574ab3528f7a863374f263_Abi%2520Animals%2520fig2%2520(1).png"
        }
      ]
    },
    {
      title: "工业监测",
      items: [
        {
          title: "设备仪表读数",
          description: "定时采集工业仪表数据图像，通过AI算法自动识别数值，准确率99%，替代人工抄表，适用于水表、电表等场景。",
          image: "https://paddlepaddle-static.cdn.bcebos.com/paddle-wechat-image/mmbiz.qpic.cn/mmbiz_jpg/sKia1FKFiafggJl2ia9vZspq5HEUD40PZ45jncMjpzAkFTS2rGdUgKUVRbv6BEv6pVHrUxCgib0EGRGWX8ewYMZL4A/image"
        },
        {
          title: "设备状态监控",
          description: "通过振动传感器触发异常状态抓拍，结合温度传感器实现过热预警，支持本地存储和云端同步，预防设备故障。",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2kIJ75qOclzQcDP17foO33PreHzALfI2RUA&s"
        }
      ]
    },
    {
      title: "户外检测",
      items: [
        {
          title: "入侵检测",
          description: "搭配PIR/雷达传感器实现低功耗周界防护，检测到移动物体自动唤醒拍摄并上传告警图像，比传统IPC节省90%以上能耗。",
          image: "https://ai-studio-static-online.cdn.bcebos.com/cd55436715184210b0877245a1b2e88a4ccb3b799e61443f94925578a596eb3f"
        },
        {
          title: "野生动物监测",
          description: "在自然保护区部署，通过红外触发拍摄野生动物活动，支持WiFi HaLow远距离传输，最大通讯距离达1km，电池供电可工作2年以上。",
          image: "https://cdn.prod.website-files.com/6479eab6eb2ed5e597810e9e/67ed59d05b90b9b7844d7b9b_66574b3555420ad0324a7750_Abi%2520Animals%2520fig6%2520(1).png"
        }
      ]
    },
  ]}
/>

### 应用工程示例

>NE101系列产品可通过灵活配置满足多样化应用需求，以下是典型应用案例。每个案例都提供详细部署指南，帮助您快速实现项目落地。

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  }}
>
  {(() => {
    const BASE_URL = useBaseUrl("/docs/neoeyes-ne101-series/application-guide/");

    const examples = [
      { 
        title: "AI人脸识别", 
        image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101_example_human_detect_1.png", 
        description: "本示例为如何使用NE101实现一个实时人脸检测的用例，你可以更换成其他所需的AI场景应用。", 
        path: "human-face-detect"
      },
      { 
        title: "低功耗图像采集", 
        image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/lowpower.png", 
        description: "实现NE101低功耗工作模式，每日10次拍摄情况下电池续航可实现3年及以上，可扩展结合传感器完成事件场景抓拍，本项目提供完整项目工程源代码，支持开发者二次开发扩展能力。", 
        path: "low-power-image-acquisition"
      }
    ];
    
    return examples.map((item, index) => (
      <a href={`${BASE_URL}${item.path}`} key={index} style={{ textDecoration: "none", color: "inherit" }}>
        <div
          style={{
            border: "1px solid var(--ifm-color-emphasis-200)",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "1rem",
            textAlign: "left",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          }}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>{item.title}</h3>
          <img
            className="no-zoom"
            src={item.image}
            alt={item.title}
            style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "0", width: "100%" }}
          />
          <p
            style={{
              marginTop: "0.5rem",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              WebkitLineClamp: 2,
              textOverflow: "ellipsis",
              transition: "all 0.3s ease-in-out",
            }}
          >
            {item.description}
          </p>
        </div>
      </a>
    ));
  })()}
</div>


## 产品资源
### 产品教程

关于如何快速使用NE101系列产品可见[「快速开始」](./1-quick-start.md)

关于如何使用NE100-MB01主板的相关硬件使用和系统应用开发说明可见[「开发指南」](./2-ne100-mb01-development-board/0-dev-guide.md)

关于NE101系列产品的应用场景与指南可见[「应用指南」](./3-application-guide/0-low-power-image-acquisition.md)

NE101原理图[「下载」](https://resources.camthink.ai/wiki/doc/ne101-schematic-open.pdf)

NE101PCB文件[「下载」](https://resources.camthink.ai/wiki/doc/ne101-pcb-open.pdf)


<!-- ### 产品资源

| 资源名称                 | 地址                                                                 |
|--------------------------|----------------------------------------------------------------------|
| 硬件原理图               | [/docs/hardware-schematic](/docs/hardware-schematic)                 |
| 硬件设计指南             | [/docs/hardware-guide](/docs/hardware-guide)                         | -->

## 技术支持

<SupportGrid />