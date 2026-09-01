---
title: Components Overview
description: Detailed overview of the NE300-MB01 development board components, featuring STM32N657L0H3 MCU, Neural-ART Accelerator, and OS04C10 camera module.
keywords: [NE300-MB01, STM32N6, Neural-ART, AI Camera Board, OS04C10, Hardware Components, Wi-Fi 6, Edge AI]
tags: [NE300-MB01, Hardware Components, STM32N6, AI Camera, Overview]
---

## Product Overview

The NE300-MB01 development board is a low-power wireless camera platform capable of snapshots, video streaming, and onboard visual inference. It uses STMicroelectronics' STM32N657L0H3 (Arm® Cortex®-M55) as the main processor with Wi-Fi 6 and BLE radios. OS04C10 and USB cameras are supported for image capture, and a Cat-1 modem can be added for cellular uplink. The board is ideal for low-power, edge-deployed imaging scenarios that require flexible mounting accessories.

## Main Board Overview

The main board integrates the STM32N657L0H3 MCU with 64 MB of external PSRAM and 128 MB of external Flash. V1.1–V1.3 use an STM32U073KBU6 for power management and ultra-low-power sleep control; V1.0 has the initial power architecture and does not include this U0 controller. Connectivity is provided by the SiWN917M100LGTBA Wi-Fi 6/BLE 5.4 combo chip. Optional Cat-1 cellular modules and GPIO expansions allow for further customization. The default kit ships with an OS04C10 camera module, while USB camera modules are also available. Highlights:

* **Application MCU** – STM32N657L0H3 with an Arm® Cortex®-M55 core up to 800 MHz and ST Neural-ART Accelerator (up to 1 GHz, 600 GOPS, 288 MAC/cycle)
* **External PSRAM** – APS512XX-OBR-BG, 64 MB, up to 250 MHz, 16-bit bus
* **External Flash** – MX66UM1G45G SPI NAND, 128 MB, up to 200 MHz, 8-bit bus
* **Wi-Fi module** – SiWN917M100LGTBA with 2.4 GHz Wi-Fi 6 (IEEE 802.11 b/g/n/ax) and Bluetooth 5.4
* **Camera modules** – OS04C10 CSI-2 module by default, optional USB module
* **Capture button** – One-touch snapshot trigger
* **Indicators** – Blue status LED plus a 0.5 W white fill light
* **Debug interfaces** – ST-Link, USB, and UART headers
* **Power kill switch** – Slide switch to fully disconnect the battery input
* **External sensor ports** – Alarm IO and other sensor inputs; the dedicated PIR connector is available on V1.3 only and other revisions require checking the interface table
* **Expandable IO** – SPI + I2C + UART + SAI (I2S compatible) + general-purpose GPIO
* **Modem options** – Cat-1 cellular module socket

## Camera Module Specifications

- **OS04C10 standard module**: 2688 × 1520 resolution, 1/4" sensor, lenses with DFOV 59° / 97° / 165°, manual focus.
- **USB camera module**: Smartsens SC200AI sensor, 1920 × 1080 resolution, 1/2.8" sensor size, multiple FOV lens choices, UVC compliant.

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    margin: '20px 0'
  }}
>
  <div>
    <h4 style={{ margin: '0 0 12px' }}>OS04C10 Camera Module</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <th style={{ width: '40%', background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>CMOS Sensor</th>
          <td style={{ padding: '6px 8px' }}>OS04C10-A43A</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Optical Format</th>
          <td style={{ padding: '6px 8px' }}>1/2.9"</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Max Resolution</th>
          <td style={{ padding: '6px 8px' }}>2688 × 1520</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Focal Length</th>
          <td style={{ padding: '6px 8px' }}>2.5 mm / 3 mm / 6 mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Interface</th>
          <td style={{ padding: '6px 8px' }}>CSI-2</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>DFOV</th>
          <td style={{ padding: '6px 8px' }}>59° / 97° / 165°</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Module Size</th>
          <td style={{ padding: '6px 8px' }}>25 × 25 mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Operating Temp</th>
          <td style={{ padding: '6px 8px' }}>-20 °C ~ 60 °C</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div>
    <h4 style={{ margin: '0 0 12px' }}>USB Camera Module</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <th style={{ width: '40%', background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>CMOS Sensor</th>
          <td style={{ padding: '6px 8px' }}>SC200AI</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Optical Format</th>
          <td style={{ padding: '6px 8px' }}>1/2.8"</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Max Resolution</th>
          <td style={{ padding: '6px 8px' }}>1920 × 1080</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Focal Length</th>
          <td style={{ padding: '6px 8px' }}>2.5 mm / 3 mm / 6 mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Interface</th>
          <td style={{ padding: '6px 8px' }}>USB (UVC)</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>DFOV</th>
          <td style={{ padding: '6px 8px' }}>59° / 97° / 165°</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Module Size</th>
          <td style={{ padding: '6px 8px' }}>25 × 23.86 mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>Operating Temp</th>
          <td style={{ padding: '6px 8px' }}>-20 °C ~ 60 °C</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

## Cat-1 Module Specifications

The global variant (outside North America) uses Quectel EG912 modules connected over UART.

| Item | EG912 Specs |
| --- | --- |
| LTE-FDD | B1 / 2 / 3 / 4 / 5 / 7 / 8 / 12 / 13 / 17 / 18 / 19 / 20 / 25 / 26 / 28 / 66 |
| LTE-TDD | B34 / 38 / 39 / 40 / 41 |
| GSM | B2 / 3 / 5 / 8 |
| Antenna | On-board |
| Interfaces | UART, USB |
| Supply Voltage | 4 V – 6 V |
| Operating Temp | -20 °C ~ 60 °C |
| Storage Temp | -40 °C ~ 85 °C |
| Board Size | 60 × 60 mm |
| Certifications | CE |

The North America SKU uses Quectel EG915Q-NA (UART connection).

| Item | EG915 Specs |
| --- | --- |
| LTE-FDD | B2 / B4 / B5 / B12 / B13 / B14 / B66 / B71 |
| Antenna | On-board |
| Interfaces | UART, USB |
| Supply Voltage | 4 V – 6 V |
| Operating Temp | -20 °C ~ 60 °C |
| Storage Temp | -40 °C ~ 85 °C |
| Board Size | 60 × 60 mm |
| Certifications | FCC |

## Accessories & Mounts

### Lens Modules

UVC-compliant USB lens module powered by the SC200AI image sensor.

### Sensor Modules

Sensors can be attached over DI/DO, RS485, SPI, I2C, UART, SAI, or GPIO—for example PIR sensors.

### Wireless Modules

Cat-1 cellular modules.

### Mounting Accessories

A variety of flexible mounts are available. See [Product Accessories](../../0-overview.md#product-accessories).
