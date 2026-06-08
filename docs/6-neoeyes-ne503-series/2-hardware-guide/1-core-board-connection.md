---
description: NE503 核心处理板（Hailo15H）硬件资源与接口定义，涵盖 SoC 内建资源、板载 I2C 设备、高速接口及通过连接器扩展的功能接口。
keywords: [NE503, Hailo15H, 核心处理板, IO配置, 引脚定义, LPDDR4, eMMC, IMX678, 硬件连接]
tags: [NE503, 核心处理板, IO配置, Hailo15H]
---

# Core Board

![NE503 硬件设计框图](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/specifications/hardware-block-diagram.png)

核心处理板承载 Hailo15H SoC、NPU、内存、存储子系统，通过板对板连接器向接口板暴露扩展接口。本文档从 chip-level 视角描述核心板上的硬件资源及引脚定义。

## 硬件资源概述

NE503 由以下物理模组组成：

| 模组 | 主控芯片 | 说明 |
|:-----|:---------|:-----|
| 核心处理板 | Hailo15H SoC | SoC、NPU、内存、存储、I2C 传感器、PCIe 时钟、以太网 PHY |
| 接口板 | STM32G0B0RET6 | MCU 管理外部 IO、电源、外设控制，板上集成 TF 卡座（详见 [Interface Board](./2-aipc-board-connection.md)） |
| 传感器板 | IMX678-AAQR1-C | 4K CMOS 图像传感器，通过 FPC 连接器接入 |
| 灯板 | — | 双光灯板（白光/红光 PWM）+ 红外灯板（近/远红外 PWM） |
| 镜头模组 | AN41908A-VBA | AF 自动变焦与自动对焦镜头驱动 |

核心板与接口板通过板对板连接器互联：核心板提供 SoC 原生引脚，接口板上的设备通过连接器挂接到这些引脚。

## 功能总览

核心板资源按物理归属分为两类：

**核心板板载资源** — 物理焊接在核心处理板上：

| # | 功能 | 芯片型号 | 类别 |
|:--|:-----|:---------|:-----|
| 1 | LPDDR4 | MT53E2G32D4DE-046 WT:C | SoC 内建 |
| 2 | eMMC | SDINBDA6-64G-H | SoC 内建 |
| 3 | QSPI Flash | IS25WP064D-JKLE | SoC 内建 |
| 4 | 温度传感器 | TMP1075DSGR | 板载 I2C |
| 5 | 陀螺仪 | LSM6DSR | 板载 I2C |
| 6 | EEPROM | AT24C02D | 板载 I2C |
| 7 | PCIe 时钟 | PI6CG18201 | 板载 I2C |
| 8 | PCIe & USB | Hailo15H 内置 | SoC 高速接口 |
| 9 | 以太网 PHY | LAN8720AI | 板载 RMII |

**通过连接器扩展的资源** — 物理位于接口板或外部模组，通过核心板连接器引脚挂接：

| # | 功能 | 芯片/模组 | 连接方式 | 类别 |
|:--|:-----|:----------|:---------|:-----|
| 10 | 图像传感器 | IMX678-AAQR1-C | MIPI CSI-2 + I2C0 | 内部预留 |
| 11 | TF 卡 | — | SDIO0 + GPIO | 整机接口 |
| 12 | 调试串口 | — | UART0 | 调试接口 |
| 13 | BOOT 模式 | — | BOOT0/BOOT1 | 调试接口 |
| 14 | 镜头驱动 | AN41908A-VBA | SPI（CS1） | 内部预留 |
| 15 | 音频编解码 | NAU88C10 | I2S + I2C0 | 内部预留 |
| 16 | 雷达模组 | — | UART2 + GPIO | 内部预留 |
| 17 | MCU 复位控制 | SN74LVC1G14DCK | GPIO | 内部预留 |

## SoC 内建资源

以下资源通过 SoC 原生接口直连，物理焊接在核心处理板上。

### LPDDR4（MT53E2G32D4DE-046 WT:C）

8 GB LPDDR4，4266 Mb/s，8.5 GB/s 单通道带宽。

| 引脚 | 功能 |
|:---|:---|
| DDR_CH0_DQ0 ~ DDR_CH0_DQ15 | Channel 0 数据线 |
| DDR_CH1_DQ0 ~ DDR_CH1_DQ15 | Channel 1 数据线 |
| DDR_CH0_CA0 ~ DDR_CH0_CA5 | Channel 0 命令/地址线 |
| DDR_CH1_DQS1N / DDR_CH1_DQS1P | Channel 1 数据选通差分对 |
| DDR_CH0_DQS1N / DDR_CH0_DQS1P | Channel 0 数据选通差分对 |

### eMMC（SDINBDA6-64G-H）

64 GB eMMC，SoC SDIO1 接口直连。

| 引脚 | 功能 |
|:---|:---|
| SDIO1_DAT0 | 数据线 0 |
| SDIO1_DAT1 | 数据线 1 |
| SDIO1_DAT2 | 数据线 2 |
| SDIO1_DAT3 | 数据线 3 |
| SDIO1_CMD | 命令线 |
| SDIO1_SDCLK | 时钟线 |

### QSPI Flash（IS25WP064D-JKLE）

8 MB，四线 SPI 协议，SoC H_SPI 接口直连。

| 引脚 | 功能 |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0（数据线 0） |
| H_SPI_DQ1 | FLASH_DQ1（数据线 1） |
| H_SPI_DQ2 | FLASH_DQ2（数据线 2） |
| H_SPI_DQ3 | FLASH_DQ3（数据线 3） |
| H_SPI_CLK | FLASH_CLK（时钟） |
| H_SPI_CS0 | FLASH_CS0（片选） |

### PCIe & USB

Hailo15H SoC 原生 PCIe Gen4 与 USB 接口。PCIe 时钟由板载 PI6CG18201 提供。

### 以太网 PHY（LAN8720AI）

10/100M 以太网 PHY 芯片，IO 电压 1.6V ~ 3.6V，通过 RMII 接口与 SoC 连接，提供有线网络通信能力。

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| RMII_RXD0 | ETH_RMII_RXD0 | — |
| RMII_RXD1 | ETH_RMII_RXD1 | — |
| RMII_RX_ER | ETH_RMII_RXD2 | SoC 引脚复用名 |
| RMII_CRS_DV | ETH_RMII_RXD3 | SoC 引脚复用名 |
| RX_CLK | ETH_RMII_RX_CLK | RMII 参考时钟 50 MHz |
| RMII_TXD0 | ETH_RMII_TXD0 | — |
| RMII_TXD1 | ETH_RMII_TXD1 | — |
| RMII_TX_EN | ETH_RMII_TXD2 | SoC 引脚复用名 |
| MDIO | ETH_MDIO | — |
| MDC | ETH_MDC | — |

## 板载 I2C 设备

以下 I2C 设备物理焊接在核心板上，按总线分配，同一总线上的设备通过不同从设备地址区分。

| I2C 总线 | 板载设备 | 从设备地址 |
|:---------|:---------|:----------|
| I2C1 | TMP1075（温度传感器）、AT24C02D（EEPROM）、PI6CG18201（PCIe 时钟） | 0x49、0x50、0x6A |
| I2C2 | LSM6DSR（陀螺仪） | 0x6A |

> 注：PI6CG18201（I2C1，地址 0x6A）和 LSM6DSR（I2C2，地址 0x6A）位于不同的 I2C 总线上，不存在地址冲突。

I2C0 总线通过连接器引出至接口板，挂接 IMX678 和 NAU88C10（见下文扩展接口）。

### 温度传感器（TMP1075DSGR）

I2C1 从设备地址 **0x49**，12 bit 分辨率，0.0625°C。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

### 陀螺仪（LSM6DSR）

I2C2 从设备地址 **0x6A**，集成 3 轴加速度计（±16 g）和 3 轴陀螺仪（±4000 dps）。

| 引脚 | 功能 |
|:---|:---|
| I2C2_SDA | GPIO_6（I2C2 数据线） |
| I2C2_SCL | GPIO_7（I2C2 时钟线） |

### EEPROM（AT24C02D）

I2C1 从设备地址 **0x50**，2 Kb（256 × 8），待机电流 < 1 µA。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

### PCIe 时钟发生器（PI6CG18201）

I2C1 从设备地址 **0x6A**，25 MHz，PCIe Gen4 低抖动 0.3 ps。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

## 扩展接口

以下接口通过核心板连接器引出，物理设备位于接口板或外部模组上。

### 图像传感器（MIPI CSI-2 + I2C0）

核心板通过 MIPI CSI-2 数据通道和 I2C0 控制总线连接图像传感器。IMX678-AAQR1-C 位于独立传感器板上，通过 FPC 连接器接入。I2C0 从设备地址 **0x10**。

| 引脚 | 功能 |
|:---|:---|
| CSI0_RX0P ~ CSI0_RX3N | MIPI CSI-2 数据通道（4 Lanes） |
| H_I2C0_SDA | I2C0 数据线 |
| H_I2C0_SCL | I2C0 时钟线 |

### 镜头驱动（SPI CS1）

核心板 SPI 总线通过 CS1 片选引出，连接 AN41908A-VBA AF 自动变焦与自动对焦镜头驱动。与 QSPI Flash 共享 SPI 总线，通过不同片选区分。MCU 侧 SPI1 也连接同一芯片，负责镜头归零与限位保护（详见 [Interface Board](./2-aipc-board-connection.md)）。

| 引脚 | 功能 |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 |
| H_SPI_DQ1 | FLASH_DQ1 |
| H_SPI_DQ2 | FLASH_DQ2 |
| H_SPI_DQ3 | FLASH_DQ3 |
| H_SPI_CLK | FLASH_CLK |
| H_SPI_CS1 | FLASH_CS1（镜头驱动片选） |

> 注：上表中功能列的 FLASH_DQ0 ~ FLASH_DQ3、FLASH_CLK 名称来自 SoC QSPI 控制器的引脚命名。这些引脚通过 CS1 片选连接到镜头驱动芯片 AN41908A，与 QSPI Flash（CS0）共享同一组数据线和时钟线，通过不同片选信号区分访问目标。

### 音频编解码器（I2S + I2C0）

核心板通过 I2S 数据接口和 I2C0 控制总线引出音频通道，挂接 NAU88C10 音频编解码器（位于接口板上），I2C0 从设备地址 **0x1A**。

| 引脚 | 功能 |
|:---|:---|
| H_I2S_SDI | I2S 数据输入 |
| H_I2S_SDO | I2S 数据输出 |
| H_I2S_WS | I2S 帧同步 |
| H_I2S_SCK | I2S 时钟 |
| H_I2C0_SCL | I2C0 时钟线 |
| H_I2C0_SDA | I2C0 数据线 |

### UART2（雷达模组）

核心板 UART2 引脚通过连接器引出，可连接外部雷达模组。引脚可复用为 GPIO。

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| H_GPIO_4 | UART2_TX | 可复用为 GPIO |
| H_GPIO_6 | UART2_RX | 可复用为 GPIO，与 I2C2_SDA 共用引脚 |
| SAFETY_FATAL | 安全故障信号 | — |

### SDIO0（TF 卡）

核心板 SDIO0 接口通过连接器引出至接口板 TF 卡座，支持低速和高速模式。

| 引脚 | 功能 |
|:---|:---|
| H_GPIO_17 | 速度模式控制（高电平 = 低速，低电平 = 高速） |
| SDIO0_DAT0 | 数据线 0 |
| SDIO0_DAT1 | 数据线 1 |
| SDIO0_DAT2 | 数据线 2 |
| SDIO0_DAT3 | 数据线 3 |
| SDIO0_CMD | 命令线 |
| SDIO0_SDCLK | 时钟线 |

### GPIO（MCU 复位控制）

核心板 GPIO18 引脚通过连接器引出，挂接 SN74LVC1G14DCK 复位芯片用于复位接口板 MCU（STM32G0B0）。反向地，MCU 也可通过 PD8（POWER_RST）复位核心处理板（详见 [Interface Board](./2-aipc-board-connection.md)）。

| 引脚 | 功能 |
|:---|:---|
| H_GPIO_18 | 复位控制（高电平有效） |

## 调试接口

以下接口用于系统调试和固件烧录，连接器位于接口板上。

### UART0（调试串口）

SoC 原生 UART0，通过连接器引出。该串口具有双重角色：既作为 SoC 调试串口用于系统日志输出与交互调试，同时也作为核心板与接口板 MCU（STM32G0B0）之间的主通信通道。

| 引脚 | 功能 |
|:---|:---|
| SOC_UART0_RXD | UART0 接收 |
| SOC_UART0_TXD | UART0 发送 |

### BOOT 模式

SoC 启动模式配置引脚，通过连接器引出。

| 引脚 | 功能 |
|:---|:---|
| BOOT0 | 启动模式选择 0 |
| BOOT1 | 启动模式选择 1 |

SoC BootMode\[0:1\] 配置：

| 模式 | BOOT\[1:0\] |
|:---|:---|
| QSPI Flash | 00 |
| PCIe | 01 |
| UART | 10 |
