---
description: NE100-MB01 开发板组件概览，详细介绍主板、相机模组、Cat-1 模块、WiFi Halow 模块等硬件规格与技术参数，支持多种通信方式和镜头选配。
keywords: [NE100-MB01, 组件概览, 硬件规格, OV5640, Cat-1, WiFi Halow, USB 相机, 模块化设计, ESP32-S3]
tags: [硬件指南, NE100-MB01, 组件说明, 相机模组, 通信模块]
---

# Components Overview
## **Product Brief**

本开发板适用于款低功耗无线电池版本抓拍相机方案。基于乐鑫的ESP32-S3模组进行开发，支持2.4G WiFi 和BLE。搭配OV5640 Cameras模组，可拓展Cat-1或WiFi-Halow通讯方式。适用于无线布署的图片抓拍相关场景，并有灵活安装的支架可选。

## **Main Board Overview**

主板搭配乐鑫的ESP32-S3-WROOM-1-N16R8模组，Flash 支持16MB, PSRAM支持8MB。支持 IEEE 802.11b/g/n (2.4 GHz Wi-Fi) 和 Bluetooth® 5 (LE)。支持拓展Cat-1或WiFi-Halow无线模组，及拓展其它GPIOs适用于二次开发。标配OV5640 Camera模组，并可选配USB Camera模组（UVC协议）。
主要特性： 

- 搭配ESP32-S3模组，Xtensa双核@240MHz

- Flash 16MB， PSRAM 8MB

- 支持 IEEE 802.11b/g/n (2.4 GHz Wi-Fi) 和 Bluetooth® 5 (LE)

- 支持Cat-1或WiFi-Halow无线模组拓展

- 搭配OV5640 DCMI 接口 Camear模组，并可选USB 镜头模组

- 支持暖光灯补光，且带光敏传感器 

- 一键抓拍功能

- 支持外部Alarm IO 输入，或PIR Module 输入

- 拓展GPIOs,适用于二次开发

- 支持基于Type-C的调试UART

## **Camera Module Overview**

模组搭配OV5640,分辨率为2592*1944，靶面尺寸为1/4。镜头有D-FOV 120和60度两种可选。并可依场景需求提供微距抓拍及正常抓拍两种对焦版本。

|           Module      | OV5640  Module                  |          |
| --------------------- | ------------------------------- | -------- |
| Items                 | Description                     |          |
| CMOS Sensor           | OV5640PLCC, 1/4"                |          |
| Max.Resolution        | 2592*1944                       |          |
| F.No                  | 2.4                             |          |
| Focal Length          | 1.79mm ro3.97mm                 | Optional |
| Focusing distance     | Micro or Normal                 | Optional |
| FOV(D)                | 59                              |          |
| FPC Connector         | 38.5*12.5mm，24Pins 0.5mm        |          |
| Dimensions            | 8.5 x 8.5 x 6.5mm (without FPC) |          |
| Operation Temperature | -10° -- 65°                     |          |

USB镜头模组:搭配Smartsens的SC200AI，分辨率为1920*1080， 靶面尺寸为1/2.8“， 镜头接口为M12，可配多种FOV镜头可选。

|        Module            | USB Camera Module |               |
| ------------------------ | ----------------- | ------------- |
| Items                    | Description       |               |
| CMOS Sensor              | SC200AI, 1/2.8"   |               |
| Max.Resolution           | 1920*1080         |               |
| Focal Length             | 2.5mm/3mm/6mm     | Optional LENS |
| Focusing distance        | Normal            |               |
| FOV(D)                   | 165/97/59         |               |
| Communication Interfaces | USB               |               |
| Operation Temperature    | -20°-- 60°        |               |
| Storage Temperature      | -40°-- 85°        |               |
| Dimensions               | 25mm x 23.86mm    |               |


## **Cat-1 Module Overview**

全球版本（除北美）采用 Quectel的EG912系列模组，通过UART与主板进行通讯。
| Module                   | Quectel EG912UGL                                             |
| ------------------------ | ------------------------------------------------------------ |
| LTE-FDD                  | B1/ 2/ 3/ 4/ 5/ 7/ 8/ 12/ 13/ 17/ 18/ 19/ 20/ 25/ 26/ 28/ 66 |
| LTE-TDD                  | B34/ 38/ 39/ 40/ 41                                          |
| GSM                      | B2/ 3/ 5/ 8                                                  |
| Antenna                  | PCB Antenna                                                  |
| Communication Interfaces | UART                                                         |
| Power Supply             | DC 4 -- 6 V                                                  |
| Operation Temperature    | -20°-- 60°                                                   |
| Storage Temperature      | -40°-- 85°                                                   |
| Dimensions               | 60mm x 60mm                                                 |
| Certifications           | CE                                                           |

北美版本采用Quectel的EG915Q-NA模组，通过UART与主板进行通讯
| Module                   | Quectel EG915Q-NA                                             |
|:------------------------:|:------------------------------------------------------------:|
| LTE-FDD                  | B2/B4/B5/B12/B13/B14/B66/B71B2/B4/B5/B12/B13/B14/B66/B71 |
| Antenna                  | PCB Antenna                                                  |
| Communication Interfaces | UART                                                         |
| Power Supply             | DC 4-6V                                                      |
| Operation Temperature    | -20℃ ~ +60℃                                                  |
| Storage Temperature      | -40℃ ~ +85℃                                                  |
| Dimensions               | 60 x 60 mm                                                   |
| Certifications           | FCC                                                           |
## **WiFi Halow Module Overview**

采用 Quectel的FGH100M模组，支持868MHz, 915MHz两个频段。通过SPI接口与主板进行通讯。
| Module                   | Quectel FGH100M            |
| ------------------------ | -------------------------- |
| WiFi Protocol            | IEEE 802.11 ah             |
| Operating Modes          | AP/STA                     |
| Operation Frequencey     | Sub-1 G: 850–950 MHz       |
| Channel Width            | 1 MHz, 2 MHz, 4 MHz, 8 MHz |
| Antenna                  | PCB Antenna                |
| Communication Interfaces | SPI                        |
| Power Supply             | DC 4 -- 6 V                |
| Operation Temperature    | -20°-- 60°                 |
| Storage Temperature      | -40°-- 85°                 |
| Dimensions               | 60mm x 60mm                |
| Certifications           | CE/FCC                     |

## **Accessories and Brackets**

### Camera modules

基于UVC协议的USB镜头模组,搭配SC200AI图像传感器

### Sensor modules

可通过DI/DO，及RS485,RS232, GPIO来外接各种传感器，如PIR传感器

### Expansion modules

- WiFi Halow  Module
- Cat-1 Module

### Mounts and enclosures

提供灵活安装的支架配件,具体参考：[产品安装](../../0-overview.md#产品安装)
