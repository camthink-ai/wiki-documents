---
description: NE503 core-board resources, interface connections, and key electrical parameters.
keywords: [NE503, core processing board, IO configuration, pin definition, LPDDR4, eMMC, hardware connection]
tags: [NE503, core processing board, IO configuration, hardware connection]
---

# Core Board

The core processing board provides the SoC, NPU, memory, storage, and high-speed interfaces and expansion pins for the interface board.

> Part numbers are for datasheet, driver, and debugging reference; follow the BOM and schematic for hardware changes.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/core-board-connection/core-board-annotation.png" alt="NE503 Core Board Interface Annotation" style={{ width: '60%', height: 'auto' }} />

## Hardware Resource Overview

NE503 consists of the following physical modules:

| Module | Description |
|:-------|:------------|
| Core Processing Board | SoC, NPU, memory, storage, I2C sensors, PCIe clock, Ethernet PHY |
| Interface Board | MCU managing external IO, power, and peripheral control; TF card slot on board (see [Interface Board](./2-aipc-board-connection.md)) |
| Sensor Board | 4K CMOS image sensor, connected via FPC connector |
| Light Board | Dual-light board (white/red PWM) + IR light board (near/far-IR PWM) |
| Lens Module | Selectable `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`; the driver device and controls depend on the configuration |

The core board and interface board are interconnected via board-to-board connectors: the core board provides native SoC pins, and devices on the interface board are connected to these pins through the connectors.

[Download NE503 Hardware Block Diagram](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/specifications/hardware-block-diagram.png)

## Interface Overview

Core board resources are divided into two categories by physical location:

**On-Board Resources** — Physically soldered on the core processing board:

| # | Function | Main Parameters | Category |
|:--|:---------|:----------------|:---------|
| 1 | LPDDR4 | 4 GB / 8 GB | SoC built-in |
| 2 | eMMC | 64 GB | SoC built-in |
| 3 | QSPI Flash | 8 MB, Quad SPI | SoC built-in |
| 4 | Temperature Sensor | I2C1, 12-bit, 0.0625°C | On-board I2C |
| 5 | Gyroscope | I2C2, ±16 g / ±4000 dps | On-board I2C |
| 6 | EEPROM | I2C1, 2 Kb | On-board I2C |
| 7 | PCIe Clock | I2C1, 25 MHz, 0.3 ps | On-board I2C |
| 8 | PCIe & USB | Native PCIe Gen4 and USB | SoC high-speed |
| 9 | Ethernet PHY | 10/100M RMII, IO 1.6V ~ 3.6V | On-board RMII |

**Expansion Resources** — Physically located on the interface board or external modules, connected through core board connector pins:

| # | Function | Main Parameters | Connection | Category |
|:--|:---------|:----------------|:-----------|:---------|
| 10 | Image Sensor | 4K CMOS | MIPI CSI-2 + I2C0 | Internal |
| 11 | TF Card | — | SDIO0 + GPIO | Product |
| 12 | Debug UART | — | UART0 | Debug |
| 13 | BOOT Mode | — | BOOT0/BOOT1 | Debug |
| 14 | Lens Driver | — | SPI (CS1) | Internal |
| 15 | Audio Codec | I2C0 address 0x1A | I2S + I2C0 | Internal |
| 16 | Radar Module | — | UART2 + GPIO | Internal |
| 17 | MCU Reset Control | Bidirectional reset | GPIO | Internal |

## SoC Built-in Resources

The following resources are directly connected via native SoC interfaces and physically soldered on the core processing board.

### LPDDR4 (documented 8 GB configuration: MT53E2G32D4DE-046 WT:C)

NE503 is available with 4 GB or 8 GB LPDDR4. The documented 8 GB configuration uses MT53E2G32D4DE-046 WT:C at 4266 Mb/s with 8.5 GB/s single-channel bandwidth; the 4 GB configuration follows its BOM.

| Pin | Function |
|:---|:---|
| DDR_CH0_DQ0 ~ DDR_CH0_DQ15 | Channel 0 data lines |
| DDR_CH1_DQ0 ~ DDR_CH1_DQ15 | Channel 1 data lines |
| DDR_CH0_CA0 ~ DDR_CH0_CA5 | Channel 0 command/address lines |
| DDR_CH1_DQS1N / DDR_CH1_DQS1P | Channel 1 data strobe differential pair |
| DDR_CH0_DQS1N / DDR_CH0_DQS1P | Channel 0 data strobe differential pair |

### eMMC (SDINBDA6-64G-H)

64 GB eMMC, connected directly to SoC SDIO1 interface.

| Pin | Function |
|:---|:---|
| SDIO1_DAT0 | Data line 0 |
| SDIO1_DAT1 | Data line 1 |
| SDIO1_DAT2 | Data line 2 |
| SDIO1_DAT3 | Data line 3 |
| SDIO1_CMD | Command line |
| SDIO1_SDCLK | Clock line |

### QSPI Flash (IS25WP064D-JKLE)

8 MB, Quad SPI protocol, connected directly to SoC H_SPI interface.

| Pin | Function |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 (Data line 0) |
| H_SPI_DQ1 | FLASH_DQ1 (Data line 1) |
| H_SPI_DQ2 | FLASH_DQ2 (Data line 2) |
| H_SPI_DQ3 | FLASH_DQ3 (Data line 3) |
| H_SPI_CLK | FLASH_CLK (Clock) |
| H_SPI_CS0 | FLASH_CS0 (Chip select) |

### PCIe & USB

Hailo-15H SoC provides native PCIe Gen4 and USB interfaces. The PCIe clock is provided by on-board PI6CG18201.

### Ethernet PHY (LAN8720AI)

10/100M Ethernet PHY, IO voltage 1.6V ~ 3.6V, connected to SoC via RMII interface, providing wired network communication.

| Pin | Function | Note |
|:---|:---|:---|
| RMII_RXD0 | ETH_RMII_RXD0 | — |
| RMII_RXD1 | ETH_RMII_RXD1 | — |
| RMII_RX_ER | ETH_RMII_RXD2 | SoC pin mux name |
| RMII_CRS_DV | ETH_RMII_RXD3 | SoC pin mux name |
| RX_CLK | ETH_RMII_RX_CLK | RMII reference clock 50 MHz |
| RMII_TXD0 | ETH_RMII_TXD0 | — |
| RMII_TXD1 | ETH_RMII_TXD1 | — |
| RMII_TX_EN | ETH_RMII_TXD2 | SoC pin mux name |
| MDIO | ETH_MDIO | — |
| MDC | ETH_MDC | — |

## On-Board I2C Devices

The following I2C devices are physically soldered on the core board, allocated by bus. Devices on the same bus are distinguished by different slave addresses.

| I2C Bus | On-Board Device | Slave Address |
|:--------|:----------------|:--------------|
| I2C1 | TMP1075 (Temperature Sensor), AT24C02D (EEPROM), PI6CG18201 (PCIe Clock) | 0x49, 0x50, 0x6A |
| I2C2 | LSM6DSR (Gyroscope) | 0x6A |

> Note: PI6CG18201 (I2C1, address 0x6A) and LSM6DSR (I2C2, address 0x6A) are on different I2C buses, so there is no address conflict.

I2C0 bus is routed to the interface board via connectors, connecting IMX678 and NAU88C10 (see Expansion Interfaces below).

### Temperature Sensor (TMP1075DSGR)

I2C1 slave address **0x49**, 12-bit resolution, 0.0625°C.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

### Gyroscope (LSM6DSR)

I2C2 slave address **0x6A**, integrated 3-axis accelerometer (±16 g) and 3-axis gyroscope (±4000 dps).

| Pin | Function |
|:---|:---|
| I2C2_SDA | GPIO_6 (I2C2 data line) |
| I2C2_SCL | GPIO_7 (I2C2 clock line) |

### EEPROM (AT24C02D)

I2C1 slave address **0x50**, 2 Kb (256 × 8), standby current < 1 µA.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

### PCIe Clock Generator (PI6CG18201)

I2C1 slave address **0x6A**, 25 MHz, PCIe Gen4 low jitter 0.3 ps.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

## Expansion Interfaces

The following interfaces are routed through core board connectors. Physical devices are located on the interface board or external modules.

### Image Sensor (MIPI CSI-2 + I2C0)

The core board connects to the image sensor via MIPI CSI-2 data lanes and I2C0 control bus. IMX678-AAQR1-C is located on a separate sensor board, connected via FPC connector. I2C0 slave address **0x10**.

| Pin | Function |
|:---|:---|
| CSI0_RX0P ~ CSI0_RX3N | MIPI CSI-2 data lanes (4 Lanes) |
| H_I2C0_SDA | I2C0 data line |
| H_I2C0_SCL | I2C0 clock line |

### Lens Driver

The core board SPI bus is routed via CS1 chip select to provide the lens-driver control path. It shares the SPI bus with QSPI Flash and is distinguished by a separate chip select. The board record on this page corresponds to the AN41908A-VBA driver device; the installed lens option, driver device, and autofocus/zoom capabilities must follow the specific SKU, BOM, and firmware. MCU SPI1 handles lens homing and limit protection (see [Interface Board](./2-aipc-board-connection.md)).

| Pin | Function |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 |
| H_SPI_DQ1 | FLASH_DQ1 |
| H_SPI_DQ2 | FLASH_DQ2 |
| H_SPI_DQ3 | FLASH_DQ3 |
| H_SPI_CLK | FLASH_CLK |
| H_SPI_CS1 | FLASH_CS1 (Lens driver chip select) |

> Note: The function column names FLASH_DQ0 ~ FLASH_DQ3 and FLASH_CLK above come from the SoC QSPI controller pin naming. These pins are connected to the AN41908A lens driver via CS1 chip select, sharing the same data and clock lines as the QSPI Flash (CS0), distinguished by different chip select signals.

### Audio Codec (I2S + I2C0)

The core board routes audio channels via I2S data interface and I2C0 control bus, connecting to the NAU88C10 audio codec on the interface board. I2C0 slave address **0x1A**.

| Pin | Function |
|:---|:---|
| H_I2S_SDI | I2S data input |
| H_I2S_SDO | I2S data output |
| H_I2S_WS | I2S word select |
| H_I2S_SCK | I2S clock |
| H_I2C0_SCL | I2C0 clock line |
| H_I2C0_SDA | I2C0 data line |

### UART2 (Radar Module)

Core board UART2 pins routed via connector for external radar module connection. Pins can be multiplexed as GPIO.

| Pin | Function | Note |
|:---|:---|:---|
| H_GPIO_4 | UART2_TX | Can be multiplexed as GPIO |
| H_GPIO_6 | UART2_RX | Can be multiplexed as GPIO, shared with I2C2_SDA |
| SAFETY_FATAL | Safety fault signal | — |

### SDIO0 (TF Card)

Core board SDIO0 interface routed via connector to the TF card slot on the interface board, supporting low-speed and high-speed modes.

| Pin | Function |
|:---|:---|
| H_GPIO_17 | Speed mode control (high = low-speed, low = high-speed) |
| SDIO0_DAT0 | Data line 0 |
| SDIO0_DAT1 | Data line 1 |
| SDIO0_DAT2 | Data line 2 |
| SDIO0_DAT3 | Data line 3 |
| SDIO0_CMD | Command line |
| SDIO0_SDCLK | Clock line |

### GPIO (MCU Reset Control)

Core board GPIO18 pin is routed via connector to the SN74LVC1G14DCK reset chip for resetting the interface board MCU (STM32G0B0). In the reverse direction, the MCU can also reset the core processing board via PD8 (POWER_RST) (see [Interface Board](./2-aipc-board-connection.md)).

| Pin | Function |
|:---|:---|
| H_GPIO_18 | Reset control (active high) |

## Debug Interfaces

The following interfaces are used for system debugging and firmware flashing, with connectors located on the interface board.

### UART0 (Debug Serial Port)

The native SoC UART0 is routed via connector for system debugging. This serial port has a dual role: it serves as the SoC debug serial port for system log output and interactive debugging, and also acts as the primary communication channel between the core processing board and the interface board MCU (STM32G0B0).

| Pin | Function |
|:---|:---|
| SOC_UART0_RXD | UART0 receive |
| SOC_UART0_TXD | UART0 transmit |

### BOOT Mode

SoC boot mode configuration pins, routed via connector.

| Pin | Function |
|:---|:---|
| BOOT0 | Boot mode select 0 |
| BOOT1 | Boot mode select 1 |

SoC BootMode\[0:1\] configuration:

| Mode | BOOT\[1:0\] |
|:---|:---|
| QSPI Flash | 00 |
| PCIe | 01 |
| UART | 10 |
