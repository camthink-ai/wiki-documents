---
description: NeoEyes NE101 is an event-triggered AI camera based on ESP32-S3. Ideal for low-frequency capture and 3-year battery life applications.
keywords: [NeoEyes NE101, ESP32-S3, Battery Powered Camera, Low Power IoT, Event-Triggered Vision, PIR Sensor, CamThink]
tags: [NeoEyes NE101, ESP32-S3 AI, Battery Powered Camera, Event Triggered Vision, Product Overview]
---

import Link from "@docusaurus/Link";
import SupportGrid from '@site/src/components/SupportGrid';
import AccessoriesTable from '@site/src/components/AccessoriesTable';
import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Product Information

## Product Introduction

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101.png" alt="NE101" width="20%" />
</div>

CamThink Event-triggered Camera NeoEyes NE101 is a low-power consumption camera based on event-triggered mechanisms. It adopts a modular design concept and features **ultra-low power consumption**. The camera supports developers to expand multiple photography trigger methods (PIR/radar/sound, etc.), and can be equipped with different sensor modules to achieve **event monitoring image capture**and autonomously wake up and collect images based on trigger conditions, greatly extending the battery life. Its **open-architecture hardware** allows developers to flexibly expand functional modules according to actual needs and quickly complete the implementation from prototype to commercial product.

### Hardware Specifications

> NeoEyes NE101 camera consists of multiple functional units such as front cover, camera module, motherboard, communication module, and battery. Each module is connected through standardized interfaces, which is convenient for disassembly, assembly and maintenance, and supports developers to replace, upgrade or customize specific modules as needed.

- **Layered structure design**: NE101 adopts a modular layout with front/middle/rear separation, which facilitates quick disassembly and function expansion, and supports users’ on-demand DIY modification. If you need to obtain structural design documents, please contact us for the resource.
- **Diversified installation support**: The main structure of NE101 reserves abundant installation holes and is compatible with a variety of brackets and mounting solutions.With the [「product accessories」](#product-accessories)provided by CamThink, it can be flexibly deployed in different scenarios.
- **Optional camera modules**: The NE101 motherboard supports CPI and USB camera modules, and allows customers to replace lenses with different specifications to meet the image collection requirements differ by scenes. For further details on camera module replacement and support, please refer to[「Interchangeable Camera Modules」](#interchangeable-camera-module).
- **Optional communication solutions**: NE101 supports WiFi, Cat-1, and WiFi-Halow communication solution switching to meet communication needs in different scenarios. For details on communication module replacement and support specifications, please refer to [「Communication Expansion Solution」](#communication-expansion-solution).
- **Optional power supply solution**: NE101 supports battery power by default. It can work with 4 x AA batteries, or Type-C charging through the motherboard.
- **Hardware openness**: Fully open to provide the structural design files for DIY housing (3D printable) or customized extensions, also provide complete open source firmware, allowing developers to start quickly with useful functions such as: low-power mode, device wake-up, MQTT data transmission, fill-light control, scheduled shooting, image parameter adjustment, and network management. Details on development and flashing, please refer to [「Development Guide」](./2-ne100-mb01-development-board/0-dev-guide.md).

![NE101](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Module.png)

### Ultra-low Power Consumption Support

> NeoEyes NE101 adopts an advanced low-power design concept and is suitable for application scenarios with strict battery life requirements such as periodic image collection. The official software supports low-power working mode by default, and developers can also flexibly expand functions based on basic projects.

- **Long Standby Battery Life**: In Wi-Fi communication mode, the default low-power configuration can support 10 shots per day, with a battery life of more than 3 years (theoretical value), which greatly reduces the frequency of maintenance and is suitable for outdoor or non-continuous power supply environments. For more power consumption test performance, please see the table below:
<!--
  | Communication Methods | 6V Battery Life | 7.2V Lithium Battery Life | User Suggestions |
  |---------|------------|-----------------|----------|
  | Wi-Fi | 2.39 years | 6.20 years | Performs best under 7.2V high-energy battery conditions, mostly suitable for medium and short range deployment needs. |
  | Halow Wi-Fi | 1.46 years | 4.30 years | Balance both battery life and long-distance communication, it is suitable for remote or obstacle environments. |
  | Cat.1 | 0.83 years | 2.08 years | Supports cellular networks to cover wide-area communication, but it is recommended to use an external power supply to optimize the power consumption. |
  > Note: The test conditions are 10 shots per day with 70% battery usage. We use a 6V battery as a standard AA battery, and use a 4-cell 38.8Wh specification 7.2V lithium battery. Please note that **currently the lithium battery does not come with the standard battery setup. If necessary, please contact us**.-->

- **Low Power Consumption Sensor Expansion Support**: NE101 supports event-triggered image capture mechanisms (such as PIR, radar, temperature, etc.), and it maintains deep sleep mode in non-working status, fully ensuring the controllable system power consumption under different trigger frequencies. For details on the development cases of how to expand the sensor connection for event-triggered image capture, please refer to: [「PIR Example」](./2-ne100-mb01-development-board/2-software-guide/3-example-pir.md)

- **Open Source Firmware and Commercialization Support**: The firmware source code of NE101 is completely open source, supporting free commercial use and secondary development. The firmware provides ready-to-use functions such as image capture, low-power management, and data communication. On this basis, developers can quickly expand application logic and shorten the development cycle from prototype to implementation. For details on firmware functions and developer guidelines, please refer to:[「Ultra-low power camera example」](./3-application-guide/0-low-power-image-acquisition.md)

![Wireless communication](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Conet.png)

### Hardware Interface Extension

> NeoEyes NE101 supports expandable hardware capabilities based on hardware usage scenarios. For information on the use of various physical interfaces, please refer to[「Hardware Guide」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md).

- **16-pin IO Interface**: There is a 16pin connector reserved on the back of the motherboard, with GPIOs, DI, DO and other interfaces, which supports access to various sensors to trigger shooting (resource usage depends on the occupancy of the communication module and USB camera). For specific IO resources, please refer to[「Hardware Guide - Hardware Connection - 16-pin GPIO Expansion」](./2-ne100-mb01-development-board/1-hardware-guide/1-hardware-connection.md)
- **Power Interface**: There is a 2-pin power socket on the back of the motherboard, which supports battery connection for power supply. There is a Type-C interface on the bottom of the motherboard that supports a wired connection for direct power supply (In the case of NE101, it needs to open a hole to let the wire through).
- **Micro TF Card Slot**: It can be used for storage expansion, suitable for local image or data storage.
- **Debugging Interface**: Type-C and UART are used for serial port debugging during development.
- **Fill Light**：Fill light and photosensitive support, suitable for collecting images in close-range dark environments.
- **Alam Interface**: 2-pin Wafer supports Alarm input.
- **PIR Interface**：4-pin wafer connector for PIR sensor integration.
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE100-MB01_1.png" alt="主板正面" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE100-MB01_2.png" alt="主板背面" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### Communication Expansion Solution

> NeoEyes NE101 supports Wi-Fi communication to transmit data by default, and offers optional selection of LTE Cat-1 and Wi-Fi Halow communication modules. Plugging the module to the pin socket on the front of the motherboard to enable the LTE Cat-1 or Wi-Fi Halow communication. It is easy to replace and expand the hardware communication solution. For the replacement and use of modules, please refer to the[「Hardware Guide」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md).

- **Interface and Compatibility**: Standard pin connector, located on the front of the motherboard, supports driver-free identification.
- **Cat.1 Module Specifications**: Quectel EG912UGL, supports LTE FDD/TDD and GSM（global frequency bands expect for North America）, dimension at 60mm x 60mm.
- **Wi-Fi HaLow Module Specifications**：Quectel FGH100M, compliant with IEEE 802.11ah protocol, using for long-distance low power consumption scenarios, dimension at 60mm x 60mm.
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.jpg" alt="Cat-1 PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/wifihalow.jpg" alt="WiFi HaLow PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### Interchangeable Camera Module

> NeoEyes NE101 adopts a modular camera design, allowing users to flexibly replace lens modules with different parameters that meet diverse requirements of shooting angles and focusing distances in various scenarios. For details on module replacement and use, please refer to [「Hardware Guide」](./2-ne100-mb01-development-board/1-hardware-guide/0-components-overview.md).

#### Unique Hardware Advantages

- **Flexible Deployment:** Developer can select the most suitable lens module based on deployment height, space size and identification target.
- **Cost-effective Upgrade**: Significantly improve the visual effect by only replacing the lens module without changing the motherboard.

#### Supported Camera Module Specifications

<table style={{ width: '100%', tableLayout: 'fixed' }}>
  <thead>
    <tr>
      <th style={{ width: '20%' }}>Category</th>
      <th style={{ width: '20%' }}>Item No.</th>
      <th style={{ width: '20%' }}>Angle</th>
      <th style={{ width: '20%' }}>Focus Distance</th>
      <th style={{ width: '20%' }}>Application Scenarios</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="4">CPI Camera</td>
      <td>OV5640</td>
      <td>60°</td>
      <td>15cm</td>
      <td>Close-range shooting</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>60°</td>
      <td>4m</td>
      <td>Standard distance shooting</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>120°</td>
      <td>8cm</td>
      <td>Close-range and wide-angle shooting</td>
    </tr>
    <tr>
      <td>OV5640</td>
      <td>120°</td>
      <td>3m</td>
      <td>Standard distance and wide-angle shooting</td>
    </tr>
    <tr>
      <td rowSpan="3">USB Camera</td>
      <td>SC200AI-51-4M</td>
      <td>51°</td>
      <td>4m</td>
      <td>Standard angle shooting</td>
    </tr>
    <tr>
      <td>SC200AI-88-3M</td>
      <td>88°</td>
      <td>3m</td>
      <td>Wide-angle shooting</td>
    </tr>
    <tr>
      <td>SC200AI-137-2M</td>
      <td>137°</td>
      <td>2m</td>
      <td>Ultra-wide angle shooting</td>
    </tr>
  </tbody>
</table>

Note: The USB camera module will occupy extra I/O resources. For details, please refer to
[「Hardware Guide-Hardware Connection-16Pin GPIO Expansion」](./2-ne100-mb01-development-board/1-hardware-guide/1-hardware-connection.md)

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="Cat-1 PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor2.png" alt="WiFi HaLow PCBA" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### Applicability and Deployment

> NeoEyes NE101 is designed with both outdoor stability and deployment flexibility, making it suitable for a variety of installation environments and scenarios.

- **Tempered Glass Lens Cover**: The front cover of the lens is made of high-transmittance tempered glass, which has excellent resistance to water accumulation and ensures long-term stable outdoor shooting performance.
- **Wireless and Outdoor Deployment Support**: NE101 supports battery power supply, low power consumption operation, combined with IP67 protection design, suitable for long-term deployment in various harsh environments.
- **Flexible Installations**: NE101 supports various installation methods such as wall mounting, desktop mounting, pole installation, etc., and provides a wide range of original brackets and house extension components to meet various deployment needs. Common bracket specifications and main uses can be found in[Product Accessories-Product Optional Accessories](#Product Optional Accessories).
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

## Product Information

### Product Specification

NE101 camera specifications:

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/ProductBL.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/ProductR.png" alt="NE101" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>
<table style={{ width: '100%', tableLayout: 'fixed' }}>
  <thead>
    <tr>
      <th style={{ width: '20%' }}>Product Item No.</th>
      <th style={{ width: '16%' }}>NE101</th>
      <th style={{ width: '16%' }}>NE101-L01GL</th>
      <th style={{ width: '16%' }}>NE101-L02NA</th>
      <th style={{ width: '16%' }}>NE101-HL00</th>
      <th style={{ width: '16%' }}>NE101-HL01</th>
    </tr>
  </thead>
  <tbody style={{ textAlign: 'center' }}>
    <tr>
      <td style={{ width: '20%' }}><strong>Communication</strong></td>
      <td style={{ width: '16%' }}>Wi-Fi</td>
      <td style={{ width: '16%' }}>Cat.1（Supports global frequency bands except for North America）</td>
      <td style={{ width: '16%' }}>Cat.1（Supports North America）</td>
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
      <td style={{ width: '20%' }}><strong>Camera module</strong></td>
      <td colSpan="5">
         <p>OV5640 Module, selectable 120°/60°FOV and near/far focus options</p>
         <span>More lenses available</span> 
      </td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Fill light</strong></td>
      <td colSpan="5">supported</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Bluetooth</strong></td>
      <td colSpan="5">supported</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Button</strong></td>
      <td colSpan="5"> Snap(Side of the camera), Boot(located on the motherboard), Reset(located on the motherboard)</td>
    </tr>
        <tr>
      <td style={{ width: '20%' }}><strong>Storage</strong></td>
      <td colSpan="5">Micro-TF（located on the motherboard）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Alarm interface</strong></td>
      <td colSpan="5">Alarm *1（located on the motherboard）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Expandable IO</strong></td>
      <td colSpan="5">UART *1, 16Pin IO *1（located on the motherboard）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Power supply</strong></td>
      <td colSpan="5">Battery powered, Type-C powered（located on the motherboard）</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Operational temperature</strong></td>
      <td colSpan="5">-20°C ~ 50°C</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Operational humidity</strong></td>
      <td colSpan="5">0% ~ 90% RH</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>IP grade</strong></td>
      <td colSpan="5">IP67</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Certification</strong></td>
      <td colSpan="5">CE / FCC / RoHs</td>
    </tr>
    <tr>
      <td style={{ width: '20%' }}><strong>Dimension</strong></td>
      <td colSpan="5">77mm × 77mm × 48mm</td>
    </tr>
  </tbody>
</table>

# Brackets and Usage

NE101 provides a number of bracket accessories, supports multiple installation methods, and can meet the needs of various scenarios.

### Product Dimension

![NE_Series_OutlineSize.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_OutlineSize.png)

### Product Accessories

<!-- #### Product Standard Accessories
>CamThink Event Camera NeoEyes NE101 series provides following standard accessories:

<AccessoriesTable
  accessories={[
    {
      image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/Battery.png",
      name: "Battery",
      quantity: "4",
      description: ["AA Battery"]
    }
  ]}
/>

#### Product Optional Accessories -->

> CamThink Event Camera NeoEyes NE101 series provides following optional accessories:

<AccessoriesTable
accessories={[
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png",
name: "Desktop Bracket Extension",
quantity: "1",
description: ["Suitable for desktop and top mounting installations"]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png",
name: "Back Bracket Extension",
quantity: "1",
description: ["Suitable for wall mounting installation"]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png",
name: "Pole Bracket",
quantity: "1",
description: ["Suitable for complex scenes when the camera needs to be adjusted at multiple angles. The kit includes metal poles*2 and conversion heads*2. The metal poles can be customized."]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/4.png",
name: "Dial Bracket",
quantity: "1",
description: ["Suitable for fixed installation of instrument image collection in a stable light condition."]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/2.png",
name: "Meter Bracket",
quantity: "-",
description: ["Printable 3D design files can be provided to users for customization, please note that this is a non-physical selection."]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor2.png",
name: "OV5640 Camera Module",
quantity: "1",
description: [
"Supports 4 specifications：",
"60° FOV, 15cm focus",
"60° FOV, 4m focus",
"120° FOV, 8cm focus",
"120° FOV, 3m focus",
]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png",
name: "SC200AI USB Camera Module",
quantity: "1",
description: [
"Supports 3 specifications：",
"1080P ,51° FOV, 4m focus",
"1080P ,88° FOV, 3m focus",
"1080P ,137° FOV, 2m focus",
]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/wifihalow.png",
name: "Wi-Fi-Halow wireless module and antenna",
quantity: "1",
description: ["Can be installed via the motherboard slot; supports 868/915 MHz frequency band versions."]
},
{
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.png",
name: "Cat.1 wireless module and antenna",
quantity: "1",
description: ["Can be installed via the motherboard slot; supports both global and North America versions."]
},
]}
/>

### Product Installation

#### Wall Mounting Bracket and Installation Instruction

![NE_Series_Bracket_Wall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Wall_Mount.png)

![NE_Series_Wall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Wall_Mount.png)

#### Meter Bracket and Installation Instruction

![NE_Series_Bracket_Meter_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Meter_Mount.png)

![NE_Series_Meter_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Meter_Mount.png)

#### Pole Bracket and Installation Instruction

![NE_Series_Bracket_Rod_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_Rod_Mount.png)

![NE_Series_Rod_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Rod_Mount.png)

#### 3-axis Ball Bracket and Installation Instruction

![NE_Series_Bracket_ShaftBall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_ShaftBall_Mount.png)

![NE_Series_ShaftBall_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_ShaftBall_Mount.png)

#### Desktop Bracket and Installation Instruction

![NE_Series_Bracket_U_Type_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_Bracket_U_Type_Mount.png)

![NE_Series_U_Type_Mount.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE_Series_U_Type_Mount.png)

## Product Applications

### Applicable Scenarios

> NE101 event-triggered camera adopts a modular design and features ultra-low power consumption, widely used in IoT scenarios that require event triggering or periodic image collection.

<ApplicationScenarios
imagePosition="center"
maxDescriptionLines={4}
categories={[
{
title: "Smart Agriculture",
items: [
{
title: "Crop Growth Monitoring",
description: "Through timed shooting or triggering by environmental changes, it records the growth status of crops and supports remote monitoring of crop growth. It can last for more than 3 years when shooting 10 times a day, which is especially suitable for remote farmland scenes.",
image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/zw.jpg"
},
{
title: "Livestock Behavior Analysis",
description: "Combined with PIR sensors to monitor livestock activities and automatically capture behavioral images, it can help owners to detect the behavior of sick animals or animals in estrus timely, and improve the efficiency of breeding management.",
image: "https://cdn.prod.website-files.com/6479eab6eb2ed5e597810e9e/67ed59d05b90b9b7844d7b8d_66574ab3528f7a863374f263_Abi%2520Animals%2520fig2%2520(1).png"
}
]
},
{
title: "Industrial Monitoring",
items: [
{
title: "Equipment Meter Readings",
description: "It regularly collects industrial instrument data images and automatically identifies values through AI algorithms with an accuracy of 99%. It replaces manual meter reading and is suitable for water meters, electricity meters and other scenarios.",
image: "https://paddlepaddle-static.cdn.bcebos.com/paddle-wechat-image/mmbiz.qpic.cn/mmbiz_jpg/sKia1FKFiafggJl2ia9vZspq5HEUD40PZ45jncMjpzAkFTS2rGdUgKUVRbv6BEv6pVHrUxCgib0EGRGWX8ewYMZL4A/image"
},
{
title: "Equipment Status Monitoring",
description: "Vibration sensors are used to trigger abnormal status captures, and temperature sensors are combined to achieve overheating warnings. Local storage and cloud synchronization are supported to prevent equipment failures.",
image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2kIJ75qOclzQcDP17foO33PreHzALfI2RUA&s"
}
]
},
{
title: "Outdoor Monitoring",
items: [
{
title: "Intrusion Detection",
description: "It is equipped with PIR/radar sensors to achieve low-power perimeter protection. When moving objects are detected, it automatically wakes up to shoot and upload alarm images. The standby power consumption is only 0.8W, saving more than 90% of power consumption than traditional IPC.",
image: "https://ai-studio-static-online.cdn.bcebos.com/cd55436715184210b0877245a1b2e88a4ccb3b799e61443f94925578a596eb3f"
},
{
title: "Wildlife Monitoring",
description: "Deployed in nature reserves, NE101 uses infrared triggering to shoot wild animal activities, supports Wi-Fi HaLow for long-distance transmission, the maximum communication distance is 1km, and the battery power supply can last for more than 2 years.",
image: "https://cdn.prod.website-files.com/6479eab6eb2ed5e597810e9e/67ed59d05b90b9b7844d7b9b_66574b3555420ad0324a7750_Abi%2520Animals%2520fig6%2520(1).png"
}
]
},
]}
/>

### Application Engineering Examples

> The NE101 series products can meet diverse application requirements through flexible configuration. The following are typical application cases. Each case provides detailed deployment guides to help you quickly implement the project.

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
        title: "AI Facial Recognition",
        image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/NE101_example_human_detect_1.png",
        description: "This example shows how to use NE101 to implement a real-time facial recognition use case. You can replace it with other AI scenarios.",
        path: "human-face-detect"
      },
      {
        title: "Low Power Image Collection",
        image: "https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/lowpower.png",
        description: "NE101 supports low-power working mode and maintains 3 years battery life on the setting of 10 shots per day. Its extendability allows the combination of sensors to capture images based on trigger settings. This project provides complete project engineering source code to support developers' secondary development and expansion capabilities.",
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

## Product Resource

### Product Tutorial

About how to quickly set up NE101 series products[「Quick Start」](./1-quick-start.md)

About how to use the NE100-MB01 motherboard and its related hardware and system development instructions, please refer to [「Dev Guide」](./2-ne100-mb01-development-board/0-dev-guide.md)

About the application scenarios and guidelines for NE101 series products, please refer to[「Application Guide」](./3-application-guide/0-low-power-image-acquisition.md)

NE101 Schematic [「Download」](https://resources.camthink.ai/wiki/doc/ne101-schematic-open.pdf)

NE101 PCB File [「Download」](https://resources.camthink.ai/wiki/doc/ne101-pcb-open.pdf)


<!-- ### 产品资源

| 资源名称                 | 地址                                                                 |
|--------------------------|----------------------------------------------------------------------|
| 硬件原理图               | [/docs/hardware-schematic](/docs/hardware-schematic)                 |
| 硬件设计指南             | [/docs/hardware-guide](/docs/hardware-guide)                         | -->

## Technical Support

<SupportGrid />