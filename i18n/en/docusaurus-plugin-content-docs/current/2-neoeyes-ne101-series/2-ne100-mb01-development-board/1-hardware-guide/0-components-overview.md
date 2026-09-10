---
description: Detailed overview of the NeoEyes NE100-MB01 development board components, including ESP32-S3 module, camera modules (OV5640, SC200AI), and wireless expansion options.
keywords: [NE100-MB01 Components, ESP32-S3, OV5640, USB Camera, Cat-1 Module, WiFi Halow, Hardware Overview]
tags: [NE100-MB01, Hardware Components, Camera Modules, Wireless Modules, Overview]
---

# Components Overview
## **Product Brief**

This development board is designed for low-power wireless battery-powered snapshot camera solutions. Based on Espressif's ESP32-S3 module, it supports 2.4GHz WiFi and BLE. Paired with an OV5640 camera module, it can be expanded with Cat-1 or WiFi-Halow communication. Suitable for wirelessly deployed image capture scenarios with optional flexible mounting brackets.

## **Main Board Overview**

The main board features Espressif's ESP32-S3-WROOM-1-N16R8 module with 16MB Flash and 8MB PSRAM. Supports IEEE 802.11b/g/n (2.4GHz Wi-Fi) and Bluetooth® 5 (LE). Expandable with Cat-1 or WiFi-Halow wireless modules, plus additional GPIOs for secondary development. Comes standard with OV5640 camera module, with optional USB camera module (UVC protocol).

Key Features:  
- ESP32-S3 module with Xtensa dual-core @240MHz  
- 16MB Flash, 8MB PSRAM  
- IEEE 802.11b/g/n (2.4GHz Wi-Fi) & Bluetooth® 5 (LE)  
- Expandable with Cat-1 or WiFi-Halow wireless modules  
- OV5640 DCMI interface camera module + optional USB camera  
- Warm light fill flash with photosensitive sensor  
- One-touch snapshot function  
- External Alarm IO input or PIR Module input  
- Expansion GPIOs for secondary development  
- Type-C based debug UART

## **Camera Module Overview**

### OV5640 Module

OV5640 sensor with a maximum resolution of 2592×1944 and a 1/4-inch optical format. It offers two lens options with D-FOV 120° and 60°, and supports two focus configurations: macro capture and standard focus, selectable based on application needs.

| Item                 | Description                       | Note       |
| :------------------- | :-------------------------------- | :--------- |
| CMOS Sensor          | OV5640 PLCC, 1/4"                 |            |
| Max. Resolution      | 2592×1944                         |            |
| F.No                 | 2.4                               |            |
| Focal Length         | 1.79mm to 3.97mm                  | Optional   |
| Focusing Distance    | Macro or Normal                   | Optional   |
| FOV(D)               | 59°                               |            |
| FPC Connector        | 38.5×12.5mm, 24Pins 0.5mm pitch   |            |
| Dimensions           | 8.5×8.5×6.5mm (without FPC)       |            |
| Operating Temperature| -10°C to 65°C                     |            |

### USB Camera Module (SC200AI)

USB camera module is Equipped with the Smartsens SC200AI sensor, offering a resolution of 1920×1080 and a 1/2.8-inch optical format.
It features an M12 lens mount, supporting multiple FOV options to accommodate a variety of application scenarios.

| Item                 | Description               | Note          |
| :------------------- | :------------------------ | :------------ |
| CMOS Sensor          | SC200AI, 1/2.8"           |               |
| Max. Resolution      | 1920×1080                 |               |
| Focal Length         | 2.5mm/3mm/6mm             | Optional LENS |
| Focusing Distance    | Normal                    |               |
| FOV(D)               | 165°/97°/59°              |               |
| Communication        | USB                       |               |
| Operating Temperature| -20°C to 60°C             |               |
| Storage Temperature  | -40°C to 85°C             |               |
| Dimensions           | 25×23.86mm                |               |

## **Cat-1 Module Overview**

### Global Version (Non-North America)  

The global version (excluding North America) uses the Quectel EG912 series module, which communicates with the main board via UART.

| Module               | Quectel EG912UGL                                   |
| :------------------- | :------------------------------------------------- |
| LTE-FDD              | B1/2/3/4/5/7/8/12/13/17/18/19/20/25/26/28/66      |
| LTE-TDD              | B34/38/39/40/41                                    |
| GSM                  | B2/3/5/8                                           |
| Antenna              | PCB Antenna                                        |
| Communication        | UART                                               |
| Power Supply         | 4-6V DC                                            |
| Operating Temp       | -20°C to 60°C                                      |
| Storage Temp         | -40°C to 85°C                                      |
| Dimensions           | 60×60mm                                            |
| Certifications       | CE                                                 |

### North America Version  

The North American version uses the Quectel EG915Q-NA module, which communicates with the main board via UART.

| Module               | Quectel EG915Q-NA                                   |
| :------------------- | :-------------------------------------------------- |
| LTE-FDD              | B2/B4/B5/B12/B13/B14/B66/B71                        |
| Antenna              | PCB Antenna                                         |
| Communication        | UART                                                |
| Power Supply         | 4-6V DC                                             |
| Operating Temp       | -20°C to 60°C                                       |
| Storage Temp         | -40°C to 85°C                                       |
| Dimensions           | 60×60mm                                             |
| Certifications       | FCC                                                 |

## **WiFi Halow Module Overview**

WiFi Halow module is built with the Quectel FGH100M, supporting both 868 MHz and 915 MHz frequency bands. It communicates with the main board via an SPI interface.

| Module               | Quectel FGH100M             |
| :------------------- | :-------------------------- |
| WiFi Protocol        | IEEE 802.11ah               |
| Operating Modes      | AP/STA                      |
| Frequency            | Sub-1GHz: 850-950MHz        |
| Channel Width        | 1/2/4/8 MHz                 |
| Antenna              | PCB Antenna                 |
| Communication        | SPI                         |
| Power Supply         | 4-6V DC                     |
| Operating Temp       | -20°C to 60°C               |
| Storage Temp         | -40°C to 85°C               |
| Dimensions           | 60×60mm                     |
| Certifications       | CE/FCC                      |

## **Accessories and Brackets**

### Camera Modules
- UVC-compliant USB camera module with SC200AI image sensor

### Sensor Modules
- External sensors (e.g., PIR) via DI/DO, RS485, RS232, GPIO interfaces

### Expansion Modules
- WiFi Halow Module
- Cat-1 Module

### Mounts and enclosures

Provides flexible installation bracket accessories, please refer to: [Product Installation](../../0-overview.md#product-installation)
