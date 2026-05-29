---
description: NE503 核心处理板（Hailo15H）硬件接口引脚定义，涵盖 LPDDR4、eMMC、QSPI Flash、传感器、音频、TF 卡等 16 个接口的完整 IO 配置。
keywords: [NE503, Hailo15H, 核心处理板, IO配置, 引脚定义, LPDDR4, eMMC, IMX678, 硬件连接]
tags: [NE503, 核心处理板, IO配置, Hailo15H]
---

# Core Board Interfaces

核心处理板承载 Hailo15H SoC、NPU、内存、存储及成像子系统，管理高速数据通路与 AI 推理接口。

## 功能总览

| # | 功能 | 说明 |
|:---|:---|:---|
| 1 | LPDDR4 | 8 GB |
| 2 | eMMC | SDINBDA6-64G-H |
| 3 | SPI NOR Flash | 8 MB，IS25WP064D-JKLE |
| 4 | 温度传感器 | TMP1075DSGR |
| 5 | 陀螺仪传感器 | LSM6DSR |
| 6 | EEPROM | AT24C02D，2 Kb |
| 7 | 图像 sensor | IMX678 |
| 8 | PCIe & USB | — |
| 9 | RMII | — |
| 10 | TF 卡 | 低速和高速（外扩小板） |
| 11 | 调试串口 UART0 | — |
| 12 | BOOT | — |
| 13 | LENS Driver | SPI |
| 14 | AUDIO | NAU88C10，I2S |
| 15 | 雷达驱动 | UART2 |
| 16 | 复位芯片 | 复位 STM32G0B0 |

## 存储与内存

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

64 GB eMMC。

| 引脚 | 功能 |
|:---|:---|
| SDIO1_DAT0 | 数据线 0 |
| SDIO1_DAT1 | 数据线 1 |
| SDIO1_DAT2 | 数据线 2 |
| SDIO1_DAT3 | 数据线 3 |
| SDIO1_CMD | 命令线 |
| SDIO1_SDCLK | 时钟线 |

### QSPI Flash（IS25WP064D-JKLE）

8 MB，四线 SPI 协议。

| 引脚 | 功能 |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0（数据线 0） |
| H_SPI_DQ1 | FLASH_DQ1（数据线 1） |
| H_SPI_DQ2 | FLASH_DQ2（数据线 2） |
| H_SPI_DQ3 | FLASH_DQ3（数据线 3） |
| H_SPI_CLK | FLASH_CLK（时钟） |
| H_SPI_CS0 | FLASH_CS0（片选） |

### TF 卡

支持低速和高速模式（外扩小板）。

| 引脚 | 功能 |
|:---|:---|
| H_GPIO_17 | 速度模式控制（高电平 = 低速，低电平 = 高速） |
| SDIO0_DAT0 | 数据线 0 |
| SDIO0_DAT1 | 数据线 1 |
| SDIO0_DAT2 | 数据线 2 |
| SDIO0_DAT3 | 数据线 3 |
| SDIO0_CMD | 命令线 |
| SDIO0_SDCLK | 时钟线 |

- 默认低速模式：H_GPIO_17 为高电平
- 切换高速模式：H_GPIO_17 拉低

## 传感器与 I2C 设备

以下 I2C 设备按总线分配，同一总线上的设备通过不同从设备地址区分。

| I2C 总线 | 设备 | 从设备地址 |
|:---------|:-----|:----------|
| I2C0 | IMX678（图像传感器）、NAU88C10（Audio 编解码器） | 0x10、0x1A |
| I2C1 | TMP1075（温度传感器）、AT24C02D（EEPROM）、PI6CG18201（PCIe 时钟） | 0x49、0x50、0x6A |
| I2C2 | LSM6DSR（陀螺仪） | 0x6A |

### 温度传感器（TMP1075DSGR）

从设备地址 **0x49**，12 bit 分辨率，0.0625°C。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

### 陀螺仪传感器（LSM6DSR）

从设备地址 **0x6A**，集成 3 轴加速度计（±16 g）和 3 轴陀螺仪（±4000 dps）。

| 引脚 | 功能 |
|:---|:---|
| I2C2_SDA | GPIO_6（I2C2 数据线） |
| I2C2_SCL | GPIO_7（I2C2 时钟线） |

### EEPROM（AT24C02D）

从设备地址 **0x50**，2 Kb（256 × 8），待机电流 < 1 µA。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

### 图像传感器（IMX678）

从设备地址 **0x10**，1/1.8 英寸 4K CMOS，60fps 全像素输出。

| 引脚 | 功能 |
|:---|:---|
| H_I2C0_SDA | I2C0 数据线 |
| H_I2C0_SCL | I2C0 时钟线 |
| CSI0_RX0P ~ CSI0_RX3N | MIPI CSI-2 数据通道（4 Lanes） |

### PCIe & USB（PI6CG18201）

从设备地址 **0x6A**，25 MHz，PCIe Gen4 低抖动 0.3 ps。

| 引脚 | 功能 |
|:---|:---|
| H_I2C1_SDA | I2C1 数据线 |
| H_I2C1_SCL | I2C1 时钟线 |

## 通信接口

### 以太网 PHY（LAN8720AI）

10/100M 以太网 PHY，IO 电压 1.6V ~ 3.6V。

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

### UART0（调试串口）

| 引脚 | 功能 |
|:---|:---|
| SOC_UART0_RXD | UART0 接收 |
| SOC_UART0_TXD | UART0 发送 |

### Audio（NAU88C10）

从设备地址 **0x1A**，I2S 接口。

| 引脚 | 功能 |
|:---|:---|
| H_I2S_SDI | I2S 数据输入 |
| H_I2S_SDO | I2S 数据输出 |
| H_I2S_WS | I2S 帧同步 |
| H_I2S_SCK | I2S 时钟 |
| H_I2C0_SCL | I2C0 时钟线 |
| H_I2C0_SDA | I2C0 数据线 |

### 雷达驱动

雷达模组通过 UART2 连接。

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| H_GPIO_4 | UART2_TX | 可复用为 GPIO |
| H_GPIO_6 | UART2_RX | 可复用为 GPIO，与 I2C2_SDA 共用引脚 |
| SAFETY_FATAL | 安全故障信号 | — |

## 系统控制

### BOOT 模式

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

### LENS Driver（AN41908A-VBA）

电动变焦与自动对焦镜头驱动，SPI 接口（与 QSPI Flash 共享 SPI 总线，通过不同片选区分）。

| 引脚 | 功能 |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 |
| H_SPI_DQ1 | FLASH_DQ1 |
| H_SPI_DQ2 | FLASH_DQ2 |
| H_SPI_DQ3 | FLASH_DQ3 |
| H_SPI_CLK | FLASH_CLK |
| H_SPI_CS1 | FLASH_CS1 |

### 复位芯片（SN74LVC1G14DCK）

复位 STM32G0B0。

| 引脚 | 功能 |
|:---|:---|
| H_GPIO_18 | 复位控制（高电平有效） |
