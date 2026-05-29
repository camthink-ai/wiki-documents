---
description: NE503 core processing board (Hailo15H) hardware interface pin definitions, covering complete IO configurations for 16 interfaces including LPDDR4, eMMC, QSPI Flash, sensors, audio, and TF card.
keywords: [NE503, Hailo15H, core processing board, IO configuration, pin definition, LPDDR4, eMMC, IMX678, hardware connection]
tags: [NE503, core processing board, IO configuration, Hailo15H]
---

# Core Board Interfaces

The core processing board hosts the Hailo15H SoC, NPU, memory, storage, and imaging subsystems, managing high-speed data paths and AI inference interfaces.

## Interface Overview

| # | Function | Description |
|:---|:---|:---|
| 1 | LPDDR4 | 8 GB |
| 2 | eMMC | SDINBDA6-64G-H |
| 3 | SPI NOR Flash | 8 MB, IS25WP064D-JKLE |
| 4 | Temperature Sensor | TMP1075DSGR |
| 5 | Gyroscope Sensor | LSM6DSR |
| 6 | EEPROM | AT24C02D, 2 Kb |
| 7 | Image Sensor | IMX678 |
| 8 | PCIe & USB | — |
| 9 | RMII | — |
| 10 | TF Card | Low-speed and high-speed (external daughterboard) |
| 11 | Debug UART0 | — |
| 12 | BOOT | — |
| 13 | LENS Driver | SPI |
| 14 | AUDIO | NAU88C10, I2S |
| 15 | Radar Driver | UART2 |
| 16 | Reset Chip | Resets STM32G0B0 |

## Storage & Memory

### LPDDR4 (MT53E2G32D4DE-046 WT:C)

8 GB LPDDR4, 4266 Mb/s, 8.5 GB/s single-channel bandwidth.

| Pin | Function |
|:---|:---|
| DDR_CH0_DQ0 ~ DDR_CH0_DQ15 | Channel 0 data lines |
| DDR_CH1_DQ0 ~ DDR_CH1_DQ15 | Channel 1 data lines |
| DDR_CH0_CA0 ~ DDR_CH0_CA5 | Channel 0 command/address lines |
| DDR_CH1_DQS1N / DDR_CH1_DQS1P | Channel 1 data strobe differential pair |
| DDR_CH0_DQS1N / DDR_CH0_DQS1P | Channel 0 data strobe differential pair |

### eMMC (SDINBDA6-64G-H)

64 GB eMMC.

| Pin | Function |
|:---|:---|
| SDIO1_DAT0 | Data line 0 |
| SDIO1_DAT1 | Data line 1 |
| SDIO1_DAT2 | Data line 2 |
| SDIO1_DAT3 | Data line 3 |
| SDIO1_CMD | Command line |
| SDIO1_SDCLK | Clock line |

### QSPI Flash (IS25WP064D-JKLE)

8 MB, Quad SPI protocol.

| Pin | Function |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 (Data line 0) |
| H_SPI_DQ1 | FLASH_DQ1 (Data line 1) |
| H_SPI_DQ2 | FLASH_DQ2 (Data line 2) |
| H_SPI_DQ3 | FLASH_DQ3 (Data line 3) |
| H_SPI_CLK | FLASH_CLK (Clock) |
| H_SPI_CS0 | FLASH_CS0 (Chip select) |

### TF Card

Supports low-speed and high-speed modes (external daughterboard).

| Pin | Function |
|:---|:---|
| H_GPIO_17 | Speed mode control (high = low-speed, low = high-speed) |
| SDIO0_DAT0 | Data line 0 |
| SDIO0_DAT1 | Data line 1 |
| SDIO0_DAT2 | Data line 2 |
| SDIO0_DAT3 | Data line 3 |
| SDIO0_CMD | Command line |
| SDIO0_SDCLK | Clock line |

- Default low-speed mode: H_GPIO_17 is high
- Switch to high-speed mode: pull H_GPIO_17 low

## Sensors & I2C Devices

I2C devices are allocated by bus. Devices on the same bus are distinguished by different slave addresses.

| I2C Bus | Device | Slave Address |
|:--------|:-------|:--------------|
| I2C0 | IMX678 (Image Sensor), NAU88C10 (Audio Codec) | 0x10, 0x1A |
| I2C1 | TMP1075 (Temperature Sensor), AT24C02D (EEPROM), PI6CG18201 (PCIe Clock) | 0x49, 0x50, 0x6A |
| I2C2 | LSM6DSR (IMU) | 0x6A |

### Temperature Sensor (TMP1075DSGR)

Slave address **0x49**, 12-bit resolution, 0.0625°C.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

### Gyroscope Sensor (LSM6DSR)

Slave address **0x6A**, integrated 3-axis accelerometer (±16 g) and 3-axis gyroscope (±4000 dps).

| Pin | Function |
|:---|:---|
| I2C2_SDA | GPIO_6 (I2C2 data line) |
| I2C2_SCL | GPIO_7 (I2C2 clock line) |

### EEPROM (AT24C02D)

Slave address **0x50**, 2 Kb (256 × 8), standby current < 1 µA.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

### Image Sensor (IMX678)

Slave address **0x10**, 1/1.8-inch 4K CMOS, 60fps full-pixel output.

| Pin | Function |
|:---|:---|
| H_I2C0_SDA | I2C0 data line |
| H_I2C0_SCL | I2C0 clock line |
| CSI0_RX0P ~ CSI0_RX3N | MIPI CSI-2 data lanes (4 Lanes) |

### PCIe & USB (PI6CG18201)

Slave address **0x6A**, 25 MHz, PCIe Gen4 low jitter 0.3 ps.

| Pin | Function |
|:---|:---|
| H_I2C1_SDA | I2C1 data line |
| H_I2C1_SCL | I2C1 clock line |

## Communication Interfaces

### Ethernet PHY (LAN8720AI)

10/100M Ethernet PHY, IO voltage 1.6V ~ 3.6V.

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

### UART0 (Debug Serial Port)

| Pin | Function |
|:---|:---|
| SOC_UART0_RXD | UART0 receive |
| SOC_UART0_TXD | UART0 transmit |

### Audio (NAU88C10)

Slave address **0x1A**, I2S interface.

| Pin | Function |
|:---|:---|
| H_I2S_SDI | I2S data input |
| H_I2S_SDO | I2S data output |
| H_I2S_WS | I2S word select |
| H_I2S_SCK | I2S clock |
| H_I2C0_SCL | I2C0 clock line |
| H_I2C0_SDA | I2C0 data line |

### Radar Driver

The radar module connects via UART2.

| Pin | Function | Note |
|:---|:---|:---|
| H_GPIO_4 | UART2_TX | Can be multiplexed as GPIO |
| H_GPIO_6 | UART2_RX | Can be multiplexed as GPIO, shared with I2C2_SDA |
| SAFETY_FATAL | Safety fault signal | — |

## System Control

### BOOT Mode

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

### LENS Driver (AN41908A-VBA)

Motorized zoom and autofocus lens driver, SPI interface (shares SPI bus with QSPI Flash, distinguished by different chip selects).

| Pin | Function |
|:---|:---|
| H_SPI_DQ0 | FLASH_DQ0 |
| H_SPI_DQ1 | FLASH_DQ1 |
| H_SPI_DQ2 | FLASH_DQ2 |
| H_SPI_DQ3 | FLASH_DQ3 |
| H_SPI_CLK | FLASH_CLK |
| H_SPI_CS1 | FLASH_CS1 |

### Reset Chip (SN74LVC1G14DCK)

Resets STM32G0B0.

| Pin | Function |
|:---|:---|
| H_GPIO_18 | Reset control (active high) |
