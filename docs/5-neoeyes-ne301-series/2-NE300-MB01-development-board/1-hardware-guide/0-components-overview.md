---
title: Components Overview
description: 本文档详细解析 NE300-MB01 开发板硬件组件，涵盖 STM32N657L0H3 主控、STM32U0 电源管理、Wi-Fi 6 模块及 OS04C10/USB 摄像头接口参数。提供丰富的 I/O 扩展与调试接口说明，助力硬件开发与集成。
keywords: [NE300-MB01, 硬件组件, STM32N6, STM32U0, Wi-Fi 6, 摄像头接口, 开发板资源, OS04C10, 硬件规格, 嵌入式开发]
tags: [硬件组件, NE300, 开发板, 接口定义, 硬件资源]
---

## Components Overview

本开发板是一款低功耗无线电池版本抓拍/录像，并可以实现对图像进行识别和推理的相机方案。产品核心搭载了意法半导体基于**Arm® Cortex®-M55内核的**STM32N657L0H3芯片，产品支持wifi6和BLE等无线通信。可搭配OS04C10和USB摄像头作为图像采集，可拓展CAT1通信模组。产品适用于无线部署图像抓拍相关场景，并有灵活安装的支架可选。

## 主板概述

主板搭载STM32N657L0H3芯片，并连接有64MB外部PSRAM和128MB外部Flash。V1.1–V1.3 配置 STM32U073KBU6，用于电源管理和超低功耗休眠；V1.0 为初始电源架构，不含该 U0 控制芯片。配有wifi芯片SiWN917M100LGTBA，支持单频2.4G的WIFI6（IEEE 802.11 b/g/n/ax）和Bluetooth5.4。支持拓展cat-1无线通信模组，以及拓展有GPIO用于其他的二次开发。标配OS04C10摄像头模组，并可选配USB摄像头模组。核心特性：

* **主控芯片**：板载STM32N657L0H3微控制器，集成Arm® Cortex®-M55内核，最高工作频率可达800MHz，ST Neural-ART Accelerator, frequency up to1 GHz, 600 Gops, 288 MAC/cycle。

* **外置PSRAM**：APS512XX-OBR-BG，64MB，Clock rate up to 250MHz，16线制通信。

* **外置FLASH**：MX66UM1G45G高性能 SPI NAND Flash，128MB，时钟最大到200MHz，8线制通信。

* **WIFI芯片**：板载SiWN917M100LGTBA，单频2.4G的WIFI6（IEEE 802.11 b/g/n/ax）和Bluetooth5.4。

* **摄像头模组**：OS04C10摄像头模组，CSI-2接口；并支持可选配的USB模组

* **按键抓拍**：支持一键抓拍功能

* **指示灯**：蓝色LED状态指示灯，和0.5W白色补光灯

* **调试接口**：ST-Link接口和USB接口以及UART串口

* **一键断电**：通过滑动开关实现一键切断电池电源输入。

* **外拓传感器模组**：支持外部Alarm IO 报警输入及其他传感器输入；独立 PIR 接口仅适用于 V1.3，其他版本请按接口表确认。

* **丰富的可扩展IO**：SPI+I2C+UART+SAI（音频接口，可兼容I2S）+普通GPIO等

* **拓展无线模组**：CAT1无线通信模组

## 摄像头模组参数

- 标准模组OS04C10：分辨率2688x1520，靶面尺寸为1/4英寸。镜头DFOV选择有59、97、165三种。镜头可根据实际需求调整焦距大小。
- USB镜头模组: 搭配Smartsens的SC200AI，分辨率为1920×1080，靶面尺寸为1/2.8"，可配多种FOV镜头。

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    margin: '20px 0'
  }}
>
  <div>
    <h4 style={{ margin: '0 0 12px' }}>OS04C10 摄像头模组</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <th style={{ width: '40%', background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>CMOS传感器</th>
          <td style={{ padding: '6px 8px' }}>OS04C10-A43A</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>镜头光学尺寸</th>
          <td style={{ padding: '6px 8px' }}>1/2.9"</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>最高分辨率</th>
          <td style={{ padding: '6px 8px' }}>2688×1520</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>焦距</th>
          <td style={{ padding: '6px 8px' }}>2.5mm / 3mm / 6mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>通信接口</th>
          <td style={{ padding: '6px 8px' }}>CSI-2</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>DFOV</th>
          <td style={{ padding: '6px 8px' }}>59 / 97 / 165</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>模组尺寸</th>
          <td style={{ padding: '6px 8px' }}>25 × 25mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>工作温度</th>
          <td style={{ padding: '6px 8px' }}>-20° ~ 60°</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div>
    <h4 style={{ margin: '0 0 12px' }}>USB 摄像头模组</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <th style={{ width: '40%', background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>CMOS传感器</th>
          <td style={{ padding: '6px 8px' }}>SC200AI</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>镜头光学尺寸</th>
          <td style={{ padding: '6px 8px' }}>1/2.8"</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>最高分辨率</th>
          <td style={{ padding: '6px 8px' }}>1920×1080</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>焦距</th>
          <td style={{ padding: '6px 8px' }}>2.5mm / 3mm / 6mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>通信接口</th>
          <td style={{ padding: '6px 8px' }}>USB</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>DFOV</th>
          <td style={{ padding: '6px 8px' }}>59 / 97 / 165</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>模组尺寸</th>
          <td style={{ padding: '6px 8px' }}>25 × 23.86mm</td>
        </tr>
        <tr>
          <th style={{ background: 'var(--ifm-table-head-background-color, #d9e2ff)', color: 'var(--ifm-table-head-color, var(--ifm-font-color-base))', textAlign: 'left', padding: '6px 8px' }}>工作温度</th>
          <td style={{ padding: '6px 8px' }}>-20° ~ 60°</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>



## CAT1模组参数

全球版本（除北美）采用 Quectel的EG912系列模组，通过UART与主板进行通讯。

| 项次      | EG912参数                                                      |
| ------- | ------------------------------------------------------------ |
| LTE-FDD | B1/ 2/ 3/ 4/ 5/ 7/ 8/ 12/ 13/ 17/ 18/ 19/ 20/ 25/ 26/ 28/ 66 |
| LTE-TDD | B34/ 38/ 39/ 40/ 41                                          |
| GSM     | B2/ 3/ 5/ 8                                                  |
| 天线      | 板载天线                                                         |
| 通信方式    | UART、USB                                                     |
| 供电电压    | 4V-6V                                                        |
| 工作温度    | -20-60℃                                                      |
| 存储温度    | -40-85℃                                                      |
| 板子尺寸    | 60*60mm                                                      |
| 认证      | CE                                                           |

北美版本采用Quectel的EG915Q-NA模组，通过UART与主板进行通讯

| 项次      | EG915参数                                                  |
| ------- | -------------------------------------------------------- |
| LTE-FDD | B2/B4/B5/B12/B13/B14/B66/B71B2/B4/B5/B12/B13/B14/B66/B71 |
| 天线      | 板载天线                                                     |
| 通信方式    | UART、USB                                                 |
| 供电电压    | 4V-6V                                                    |
| 工作温度    | -20-60℃                                                  |
| 存储温度    | -40-85℃                                                  |
| 板子尺寸    | 60*60mm                                                  |
| 认证      | FCC                                                      |

## 配件和支架

### 镜头模组

基于UVC协议的USB镜头模组,搭配SC200AI图像传感器

### 传感器模块

可通过DI/DO，及RS485,SPI，I2C，UART，SAI, GPIO来外接各种传感器，如PIR传感器

### 无线通信模块

CAT-1模块

### 支架安装

提供灵活安装的支架配件,具体参考：[产品配件](../../0-overview.md#产品配件)
