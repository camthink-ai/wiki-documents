---
sidebar_position: 3
description: This document details the technical specifications and usage guide for the OV5640 camera module, featuring a 5MP CMOS sensor, 60°/120° field of view options, and autofocus support, designed for embedded vision development. It covers product features, pin definitions, and installation configuration instructions.
keywords: [OV5640, camera module, 5 megapixel, DVP interface, embedded vision, autofocus, CMOS sensor, hardware development, image capture, wide-angle lens]
tags: [camera, OV5640, vision module, hardware resources, image sensor]
---

import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Camera Module-OV5640

## Product Features

### Key Features
- **Sensor**: OmniVision OV5640 CMOS sensor (1/4" format)
- **Resolution**: 2592×1944 pixels (5 megapixels)
- **Optical Design**: Available in 60° and 120° field of view (FOV) versions
- **Focus Distance**: Supports focusing at 8cm and 3m ranges

### Model Comparison

| Parameter          | OV5640 Module (60°) | OV5640 Module (120°) |
| ------------------ | ------------------- | -------------------- |
| **FOV**            | 60°                 | 120°                 |
| **Focal Length (mm)** | 3.97             | 1.79                 |
| **Aperture (F/No)**| 2.4                 | 2.0                  |
| **Focus Distance** | 15cm or 400cm       | 8cm or 300cm         |

---

## Specifications

| Parameter          | Description                 | Notes                        |
| ------------------ | --------------------------- | ---------------------------- |
| **Max Resolution** | 2592×1944                   | Supports JPEG/YUV output     |
| **Sensor Size**    | 1/4"                        | OmniBSI™ technology          |
| **Pixel Count**    | 5MP                         |                              |
| **FOV**            | 60° / 120°                  | Selectable versions          |
| **Aperture (F/No)**| 2.4 (60°) / 2.0 (120°)      | Larger aperture improves low-light performance |
| **Focal Length (mm)** | 3.97 (60°) / 1.79 (120°) | Short focal length enables ultra-wide angle |
| **Focus Distance** | 8cm or 3m                   | Supports close-up and long-range capture |
| **Operating Temperature** | -10°C ~ +65°C       | Industrial-grade temperature range |

---

## Pinout

| Pin No. | Signal Name | Type   | Description                           |
| ------- | ----------- | ------ | ------------------------------------- |
| 1       | NC          | -      | Not connected                         |
| 2       | AGND        | GND    | Analog ground                         |
| 3       | SDA         | I/O    | SCCB interface data line              |
| 4       | AVDD        | Power  | Analog power supply (2.6–3.0V; 2.8V typical; NE101 uses 2.8V) |
| 5       | SCL         | I/O    | SCCB interface clock line             |
| 6       | RESET       | Input  | Hardware reset (active low)           |
| 7       | VSYNC       | Output | Vertical sync signal                  |
| 8       | PWDN        | Input  | Power-down control (active high; default low) |
| 9       | HSYNC       | Output | Horizontal sync signal                |
| 10      | DVDD        | Power  | Digital core power supply (1.5V)      |
| 11      | DOVDD       | Power  | Digital I/O power supply (1.8–2.8V; NE101 uses 2.8V) |
| 12      | D9          | Output | Image data output (D9)                |
| 13      | MCLK        | Input  | Master clock input (6–27MHz; 24MHz typical; sensor-side DOVDD logic domain, 2.8V on NE101) |
| 14      | D8          | Output | Image data output (D8)                |
| 15      | GND         | GND    | Digital ground                        |
| 16      | D7          | Output | Image data output (D7)                |
| 17      | PCLK        | Output | Pixel clock signal                    |
| 18      | D6          | Output | Image data output (D6)                |
| 19      | D2          | Output | Image data output (D2)                |
| 20      | D5          | Output | Image data output (D5)                |
| 21      | D3          | Output | Image data output (D3)                |
| 22      | D4          | Output | Image data output (D4)                |
| 23      | NC          | -      | Not connected                         |
| 24      | NC          | -      | Not connected                         |

> **Current shipped module**: The electrical parameters above apply to the current shipped 60°/15cm OV5640 module. NE101 uses AVDD `2.8V`, DVDD `1.5V`, and DOVDD `2.8V`; the `1V2` schematic net name is a DVDD labeling error. RESET is active low, and PWDN is active high. The OV5640 MCLK (XVCLK) sensor specification is `6–27MHz`, with `24MHz` typical; the sensor-side logic domain follows DOVDD (`2.8V` on NE101). The current NE101 production configuration uses `5MHz` MCLK. This is a board-level configuration validated for this board's interconnect and signal integrity; it is not the generic module-rated input range.

---

## Usage Instructions

### Installation Steps
1. **Hardware Connection**:
   - Connect the FPC connector (38.5×12.5mm, 24Pin@0.5mm pitch) to the main board.
   - Ensure power lines (AVDD/DVDD/DOVDD) and ground lines (AGND/DGND) are correctly connected.

2. **Initialization Configuration**:
   - Write register configurations via the SCCB interface (SDA/SCL) (refer to `Register Tables` in the `OV5640 datasheet`).
   - Configure FOV, exposure time, gain, and other parameters.

3. **Image Output**:
   - Enable the DVP interface (Digital Video Port) and set the data format to YUV422 or RGB565.
   - Read image data via VSYNC/HREF sync signals.

### Precautions
- **ESD Protection**: Wear an anti-static wrist strap during handling.
- **Power Supply Stability**: Ensure AVDD voltage fluctuation is within ±5%.
- **Thermal Design**: Consider a thermal dissipation solution for prolonged operation.

## Outline Dimensions
![NG45_PCBA_IO_Bottom](https://resources.camthink.ai/wiki/img/hardware-dev-resources/ov5640-camera-module/OV5640_Module_Outline.png)
