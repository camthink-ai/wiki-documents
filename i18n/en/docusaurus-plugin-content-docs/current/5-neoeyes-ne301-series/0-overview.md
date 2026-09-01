---
description: Meet NeoEyes NE301, the world's first STM32N6 powered AI camera. Features 0.6 TOPS NPU, modular design, and ultra-low power consumption.
keywords: [NeoEyes NE301, STM32N6, Neural-ART NPU, Low Power AI Camera, IoT Vision, Modular Design, CamThink]
tags: [NeoEyes NE301, STM32N6 NPU, Ultra-Low Power AI, IoT Vision Camera, Product Overview]
---

import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import useBaseUrl from '@docusaurus/useBaseUrl';
import SupportGrid from '@site/src/components/SupportGrid';

# Product Information

## Overview

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/301.png" alt="NeoEyes NE301 camera" width="70%" />
</div>

NeoEyes NE301 is a low-power edge AI camera built on the STM32N6 MCU with 0.6 TOPS of on-device compute. Its modular hardware architecture allows camera, communication, and power components to be swapped on demand, while rich IO expansion and a fully open-source ecosystem help developers move swiftly from prototype to commercial deployment.

### Key Capabilities

- **Edge AI inference**: 0.6 TOPS compute with Web UI zero-code model deployment and real-time inference preview; supports YOLOv8 and other models with hot-swap.
- **Ultra-low power**: 6.1 μA deep-sleep current; up to years of battery life on 4× AA batteries with PIR / radar smart wake-up.
- **Modular hardware**: Swappable camera modules (CPI / USB, 3 FOV options), communication modules (Wi‑Fi / Cat‑1 / PoE), and power solutions (battery / Type‑C / solar / PoE).
- **End-to-end AI toolchain**: Open-source AI Tool Stack platform and NeoMind cloud platform — from data collection, annotation, and training to quantization and deployment in ~2 hours.
- **Sensor expansion ecosystem**: Sensor expansion board supports 9 sensors (PIR, radar, temperature/humidity, ToF, thermal imaging, etc.), OLED / TFT displays, and microphones — plug-and-play.
- **Multiple connectivity & triggers**: Wi‑Fi 6 / Cat‑1 / PoE with MQTT / RTMP data upload and video streaming; PIR / radar / acoustic / IO / scheduled / MQTT remote / AI detection trigger modes.
- **Fully open source**: Firmware, sensor drivers, and software platforms are all open-source on GitHub — ready for customization and secondary development.
- **Web UI device management**: Browser-based configuration, real-time video preview, inference parameter tuning, and config import/export — no SDK integration required.

## System Specifications

The key specifications of the complete NE301 unit are listed below.

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <!-- MCU -->
    <tr>
      <td rowspan="7">MCU</td>
      <td>Core</td>
      <td>Cortex-M55 @ 800 MHz with Arm Helium vector extensions</td>
    </tr>
    <tr>
      <td>NPU</td>
      <td>Neural-ART™ accelerator @ 1 GHz, up to 600 GOPS (0.6 TOPS), real-time inference</td>
    </tr>
    <tr>
      <td>SRAM</td>
      <td>4.2 MB</td>
    </tr>
    <tr>
      <td>ISP Image Processor</td>
      <td>Dedicated ISP with demosaic, auto white balance, and other preprocessing</td>
    </tr>
    <tr>
      <td>Video Codec</td>
      <td>Hardware H.264 and JPEG encoders supporting 1080p@30 fps</td>
    </tr>
    <tr>
      <td>Efficiency</td>
      <td>3 TOPS/W NPU efficiency without active cooling</td>
    </tr>
    <tr>
      <td>Boot / wake-up</td>
      <td>Microsecond boot, millisecond wake-up</td>
    </tr>
    <!-- Main board -->
    <tr>
      <td rowspan="11">Main board</td>
      <td>HyperFlash</td>
      <td>128 MB</td>
    </tr>
    <tr>
      <td>PSRAM</td>
      <td>64 MB</td>
    </tr>
    <tr>
      <td>Buttons</td>
      <td>Reset, Boot, Capture / Record</td>
    </tr>
    <tr>
      <td>Status LEDs</td>
      <td>Power LED, system LED</td>
    </tr>
    <tr>
      <td>Connectivity</td>
      <td>Wi‑Fi 6 / BLE / Ethernet (via PoE module)</td>
    </tr>
    <tr>
      <td>Camera interfaces</td>
      <td>USB 4-pin ×1, MIPI CSI-2 ×1</td>
    </tr>
    <tr>
      <td>16-pin IO</td>
      <td>UART ×1<br/>RS485 ×1<br/>I2C ×1<br/>SPI ×1<br/>GPIO ×2<br/>3.3 V ×1 / 5 V ×1 (power switchable)<br/>GND ×2</td>
    </tr>
    <tr>
      <td>Debug & power</td>
      <td>USB Type‑C ×1, 4-pin UART Wafer ×1</td>
    </tr>
    <tr>
      <td>Audio IO</td>
      <td>Audio Input ×1 (Wafer), Audio Output ×1 (Wafer)</td>
    </tr>
    <tr>
      <td>Expansion headers</td>
      <td>12-pin + 16-pin connectors for communication / sensor modules</td>
    </tr>
    <tr>
      <td>Storage</td>
      <td>TF card (Micro SD)</td>
    </tr>
    <!-- Structure -->
    <tr>
      <td rowspan="5">Mechanical & other</td>
      <td>Power input</td>
      <td>DC 5 V</td>
    </tr>
    <tr>
      <td>Dimensions</td>
      <td>77 mm × 77 mm × 48 mm</td>
    </tr>
    <tr>
      <td>Operating temperature</td>
      <td>−20 °C to +50 °C</td>
    </tr>
    <tr>
      <td>Humidity</td>
      <td>0% – 90% RH (non-condensing)</td>
    </tr>
    <tr>
      <td>Certifications</td>
      <td>CE / FCC / RoHS / SRRC</td>
    </tr>
  </tbody>
</table>

## Performance & Edge AI

### Low-Power Design

NeoEyes NE301 uses the STM32N6 for AI inference and image processing. V1.1–V1.3 add an STM32U073Kx power controller that monitors sensors during deep sleep and wakes the system on demand; V1.0 uses the initial power architecture, so its interfaces and control paths must be checked by hardware revision.

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/U0.png" alt="Dual-MCU architecture" width="60%" />
</div>

| Metric | Value |
| :--- | :--- |
| **Deep-sleep current** | 6.1 μA (managed by U0 on V1.1–V1.3) |
| **Active current** | 170–180 mA (Wi‑Fi mode) |
| **Wake-up latency** | Milliseconds (deep sleep to active) |
| **Battery life** | 4× AA batteries, ~13 years at 1 capture/day |

> Battery life is based on Wi‑Fi mode with 4× AA alkaline batteries (2500 mAh). Actual results may vary by deployment.

### Edge AI Compute

The STM32N6 MCU integrates a Neural-ART™ accelerator delivering 0.6 TOPS — sufficient to run lightweight person detection, gesture recognition, and similar models locally without sending frames to the cloud. By moving workloads to the edge, NE301 lowers cost, latency, and privacy risk compared with traditional "device + server" architectures.

| Metric | Value |
| :--- | :--- |
| **NPU compute** | 600 GOPS (0.6 TOPS) |
| **Local inference latency** | 2–3 s |
| **Realtime AI video** | 720P @ 25 Hz, 1080P @ 15 Hz |
| **NPU efficiency** | 3 TOPS/W, no active cooling required |
| **Pre-installed model** | YOLOv8 Nano (COCO 80-class object detection) |

## Hardware

NeoEyes NE301 consists of an outer shell, camera modules, main board, communication module, and battery tray. All modules connect via standardized board-to-board connectors and can be swapped independently.

<div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
  <div style={{ textAlign: "center", width: "45%" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/motherboard-front.png" alt="Motherboard Front" style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
    <p style={{ marginTop: "8px", color: "#888", fontSize: "0.9em" }}>Motherboard Front</p>
  </div>
  <div style={{ textAlign: "center", width: "45%" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/motherboard-back.png" alt="Motherboard Back" style={{ width: "100%", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
    <p style={{ marginTop: "8px", color: "#888", fontSize: "0.9em" }}>Motherboard Back</p>
  </div>
</div>

### Modular Design

NE301 uses a front / middle / rear layered layout where each functional module can be replaced independently:

- **Camera modules**: CPI and USB sensors with 51° / 88° / 137° FOV options. See [“Interchangeable Camera Modules”](#interchangeable-camera-modules) for details.
- **Communication modules**: Wi‑Fi, Cat‑1, or PoE Ethernet — hot-swappable. See [“Communication”](#communication) for details.
- **Power options**: 4× AA batteries (included), USB Type‑C, solar panels, or PoE.
- **Mounting**: The enclosure reserves abundant mounting holes. See CamThink [“Product Accessories”](#product-accessories) for available brackets. Contact us for mechanical design files (3D-printable).
- **Open-source firmware**: Fully open-source with out-of-the-box support for low-power modes, wake-up control, MQTT, fill light, scheduled capture, and more. See the “Developer Guide” for build and flashing instructions.

### Hardware Interfaces

The main board provides a rich set of interfaces for external expansion and debugging:

- **16-pin IO**: GPIO, DI, and DO for connecting external sensors to trigger capture (availability depends on communication module and USB camera usage).
- **Power**: 2-pin battery header on the back; USB Type‑C on the front bottom for wired power (aperture required for sealed enclosures).
- **Storage**: Micro TF card slot for local images or data.
- **Debug**: USB Type‑C and UART for serial debugging.
- **Lighting**: Built-in fill light and status LED.
- **Alarm / PIR**: 2-pin Alarm input; the dedicated 4-pin PIR connector is available on V1.3 only. Check the hardware revision for ISP/PIR wiring on other boards.

### Interchangeable Camera Modules

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
      <th>Type</th>
      <th>Model</th>
      <th>Field of View</th>
      <th>Focus Distance</th>
      <th>Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CPI camera</td>
      <td>OS04C10-51-4M <br/>OS04C10-88-3M <br/>OS04C10-137-4M</td>
      <td>51°<br/>88°<br/>137°</td>
      <td>4 m<br/>3 m<br/>2 m</td>
      <td>Standard<br/>Wide angle<br/>Ultra-wide angle</td>
    </tr>
   <tr>
      <td>USB camera</td>
      <td>SC200AI-51-4M <br/>SC200AI-88-3M <br/>SC200AI-137-4M</td>
      <td>51°<br/>88°<br/>137°</td>
      <td>4 m<br/>3 m<br/>2 m</td>
      <td>Standard<br/>Wide angle<br/>Ultra-wide angle</td>
    </tr>
  </tbody>
</table>

> The standard kit ships with the CPI OS04C10 module. USB modules can be purchased separately.

### Communication

> Wi‑Fi comes standard. An LTE Cat‑1 or PoE module can be added by mounting it onto the front-side headers. The PoE module provides both Ethernet connectivity and power delivery. Swapping communication modules is straightforward.

- **Interface & compatibility**: Standard pin headers located on the front of the main board, recognized without additional drivers.
- **PoE module**: Delivers Ethernet wired connectivity and PoE power in one module, suitable for deployments requiring both network stability and simplified cabling.
- **Cat‑1 specifications**: Quectel EG912U‑GL (global, excluding North America) and EG915Q‑NA (North America) with LTE FDD/TDD and GSM support, 60 mm × 60 mm footprint.

### Sensor Expansion Board

Connect the Sensor expansion board via the main board expansion header to interface with a variety of external devices:

- **Sensors**: PIR, radar, temperature/humidity, ToF ranging, thermal imaging, and more for environmental awareness and event triggering.
- **Displays**: OLED / TFT displays for local information display and human-machine interaction.
- **Microphones**: Audio input for voice capture and acoustic triggering.

> For detailed specifications and driver development, see the [Sensor Expansion Board Guide](../3-hardware-dev-resources/23-sensor-extension-board.md).

## Product Accessories

> Optional accessories share the same mounting scheme as NeoEyes NE101. The table below lists the available kits.

| Image | Name | Qty | Description |
| ----- | ---- | --- | ----------- |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/1.png" alt="Bottom bracket extension" width="180" /> | Bottom bracket extension | 1 | Extends top or bottom installation points |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/3.png" alt="Back bracket extension" width="180" /> | Back bracket extension | 1 | Adds mounting options for wall installations |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/5.png" alt="Pole bracket" width="180" /> | Pole bracket | 1 | Adjustable pole mount with two metal rods and adapters (rods can be customized) |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/4.png" alt="Dial bracket" width="180" /> | Dial bracket | 1 | Stable mounting for meters with minimal ambient light interference |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/2.png" alt="Water meter bracket" width="180" /> | Water-meter bracket | – | 3D printable design files available on request |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="OS04C10 camera module" width="180" /> | OS04C10 camera module | 1 | 51° / 88° / 137° FOV options (4 m / 3 m / 2 m focus) |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/sensor1.png" alt="SC200AI USB camera module" width="180" /> | SC200AI USB camera module | 1 | 51° / 88° / 137° FOV options (4 m / 3 m / 2 m focus) |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/cat1PCBA.jpg" alt="Cat.1 module" width="180" /> | Cat.1 module | 1 | Plug-in Cat‑1 module for global or North America variants |
| <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/poe.png" alt="PoE module" width="180" /> | PoE module | 1 | Optional plug-in PoE module |

### Deployment

NeoEyes NE301 is designed for outdoor stability and flexible deployment across multiple environments.

- **Tempered-glass lens cover**: Highly transparent glass prevents water accumulation and secures long-term imaging quality outdoors.
- **Outdoor-grade power & protection**: Battery-powered, low-energy operation plus IP67 ingress protection suits harsh environments. The PoE module provides both Ethernet connectivity and power delivery for deployments requiring wired network stability.
- **Flexible mounting**: Supports wall, ceiling, and pole mounting. Original brackets and additional enclosures are available to match different scenarios.

#### Wall Mount

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Wall_Mount.png" alt="Wall bracket" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Wall_Mount.png" alt="Wall mount example" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### Dial Mount

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Meter_Mount.png" alt="Dial bracket" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Meter_Mount.png" alt="Dial mount example" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### Pole Mount

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_Rod_Mount.png" alt="Pole bracket" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Rod_Mount.png" alt="Pole mount example" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### Shaft & Ball Mount

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_ShaftBall_Mount.png" alt="Shaft & ball bracket" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_ShaftBall_Mount.png" alt="Shaft & ball mount example" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

#### Base Mount

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_Bracket_U_Type_Mount.png" alt="Base bracket" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
  <div style={{ flex: "1 1 45%", textAlign: "center" }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/NE_Series_U_Type_Mount.png" alt="Base mount example" style={{ width: "100%", borderRadius: "8px" }} />
  </div>
</div>

## Application Scenarios

NeoEyes NE301 delivers on-device AI while maintaining ultra-low power consumption. It fits edge inference, event-triggered capture, and periodic sampling scenarios across multiple industries.

### Smart City

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-city.png" alt="Smart city overview" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    Thanks to μA-level sleep current and strong edge AI, NE301 can stay deployed in city environments for long periods without frequent battery replacement, while keeping data on device for low-latency responses.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Use Cases",
      items: [
        {
          title: "Occupancy detection",
          description: "Triggered by PIR, radar, or other events to monitor public zones, spot illegal parking or clutter, and push instant alerts.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-possession-detection.png",
          imageAlt: "Occupancy detection illustration"
        },
        {
          title: "Unmanned retail",
          description: "Performs edge analytics on customer behavior and product recognition to enable autonomous checkout and anti-theft—even without wired power.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-unmanned-retail.png",
          imageAlt: "Unmanned retail illustration"
        },
        {
          title: "Smart advertising",
          description: "Combines traffic analytics with demographic profiling to optimize ad placements. Only inference results are uploaded, saving bandwidth.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-advertising-screen.png",
          imageAlt: "Smart advertising illustration"
        }
      ]
    }
  ]}
/>

### Smart Factory

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-factory.png" alt="Smart factory overview" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    Modular sensors and communication modules make it easy to adapt NE301 to industrial requirements. Local AI inference shortens response time and reduces reliance on upstream networks.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Use Cases",
      items: [
        {
          title: "Safety gear inspection",
          description: "Detects whether workers wear helmets, vests, and other safety gear in real time and raises instant alerts for violations.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-industrial-safety.png",
          imageAlt: "Industrial PPE inspection illustration"
        },
        {
          title: "Production inspection",
          description: "Monitors production processes and flags anomalies in real time to ensure quality compliance.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-industrial-testing.png",
          imageAlt: "Production line inspection"
        }
      ]
    }
  ]}
/>

### Smart Agriculture & Livestock

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-agriculture.png" alt="Smart agriculture overview" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    Low power consumption and battery operation suit off-grid farmlands. Periodic capture with edge analytics enables data-driven farming and husbandry.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Use Cases",
      items: [
        {
          title: "Crop growth capture",
          description: "Takes scheduled photos and analyzes plant growth with AI to support precision agriculture.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-plant.png",
          imageAlt: "Crop monitoring illustration"
        },
        {
          title: "Livestock monitoring",
          description: "Tracks animal activity and health, raising alerts when abnormal behavior is detected.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-animal.png",
          imageAlt: "Livestock monitoring illustration"
        },
        {
          title: "Smart feeding",
          description: "Identifies individual pigs and coordinates automatic feeders for accurate dosing or counting.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-pig.png",
          imageAlt: "Smart breeding illustration"
        }
      ]
    }
  ]}
/>

### Additional Integrations

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-integrated-applications-overview.png" alt="Integration overview" style={{ width: "260px", maxWidth: "100%" }} />
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    The open hardware and rich IO make NE301 easy to integrate into existing systems, widening the scope of edge AI applications.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Use Cases",
      items: [
        {
          title: "Smart doorbells / peepholes",
          description: "Triggered by PIR or radar to capture suspicious visitors and run on-device recognition for home security.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-smart-doorball.png",
          imageAlt: "Smart doorbell or peephole"
        },
        {
          title: "Production lines",
          description: "Integrates into industrial equipment for real-time video analytics to supervise quality and process flow.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-production.png",
          imageAlt: "Production line monitoring"
        },
        {
          title: "In-vehicle systems",
          description: "Monitors driver fatigue and issues timely warnings to improve road safety.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/overview/app-drowsy.png",
          imageAlt: "In-vehicle system monitoring"
        }
      ]
    }
  ]}
/>

## Application Examples

- [Model Training & Deployment](./3-application-guide/0-model-training-and-deployment/0-model-training-and-deployment.md)

## Resources

### Product Tutorials

- [Quick Start](./1-quick-start.md)
- NE300-MB01 Development Board:
  - [Overview](./2-NE300-MB01-development-board/0-dev-guide.md)
  - Hardware Guide:
    - [Components Overview](./2-NE300-MB01-development-board/1-hardware-guide/0-components-overview.md)
    - [Hardware Connection](./2-NE300-MB01-development-board/1-hardware-guide/1-hardware-connection.md)
    - NE301 Schematic [「Download」](https://resources.camthink.ai/wiki/doc/ne301-schematic-open.pdf)
    - NE301 PCB File [「Download」](https://resources.camthink.ai/wiki/doc/ne301-pcb-open.pdf)
  - Software Guide:
    - [Development Environment Setup](./2-NE300-MB01-development-board/2-software-guide/0-development-environment-setup.md)
    - [System Flashing And Initialization](./2-NE300-MB01-development-board/2-software-guide/1-system-flashing-and-initialization.md)
    - [Windows + WSL Source Build And Flash](./2-NE300-MB01-development-board/2-software-guide/2-windows-wsl-source-build-and-flash.md)

## Technical Support

<SupportGrid />
