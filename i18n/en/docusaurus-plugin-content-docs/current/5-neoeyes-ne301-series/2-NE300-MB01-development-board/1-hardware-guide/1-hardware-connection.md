---
description: Detailed pinout and connection guide for NE300-MB01. Learn about power control, RS485 interfaces, camera CSI-2 connections, and 16-pin expansion headers.
keywords: [NE300-MB01 Connection, Hardware Pinout, STM32N657, CSI-2 Interface, RS485 Control, Expansion Header, Power Tree, SPI, I2C]
tags: [NE300-MB01, Hardware, Connection Guide, Pinout, STM32N6]
---

# Hardware Connection

## Top-Side Interfaces

- Type-C connector for power and USB debug
- SD card slot
- Reset button
- Snapshot button
- UART debug header (STM32N6)
- ST-Link header (STM32N6)
- ST-Link header (STM32U0, V1.1–V1.3)
- ST BOOT mode selector
- Alarm input terminal
- V1.0–V1.2: shared J10 ISP/PIR connector; V1.3: separate J10 ISP connector and J5 PIR connector
- Dual CV light-board headers
- OS04C10 camera connector
- Battery isolation slide switch

## Bottom-Side Interfaces

- Power input terminals
- Expansion IO headers (SPI, I2C, UART, GPIO, and power rails)

## Interface Details

> **Hardware revision applicability:** Only wiring differences confirmed from the V1.0–V1.3 schematics are marked below. Do not reuse the V1.1–V1.3 Wi-Fi, J12 SPI, or U0 entries on V1.0 boards. For assembly-dependent options not listed in a table, verify the board silkscreen, PCBA/BOM, and the schematic for the exact revision.

#### Peripheral Power Control — STM32N657L0H3

Enable the following rails before using their peripherals: raise `CAM_PWR` for the camera & fill light, `TF_PWR_ON` for the TF card, `BAT_DET_ON` for battery sensing, and `PWR_USB_3.3V` for USB data.

| Pin | Signal | MCU Pin | Type | Default State | Alt | Applicable hardware |
| --- | --- | --- | --- | --- | --- | --- |
| T2 | CAM_PWR | PF9 | I/O | Pulldown 100 KΩ | — | V1.0–V1.3 |
| W12 | TF_PWR_ON | PA1 | I/O | Pulldown 100 KΩ | — | V1.0–V1.3 |
| U17 | BAT_DET_ON | PA2 | I/O | — | — | V1.0 |
| T8 | BAT_DET_ON | PA11 | I/O | Pulldown 100 KΩ | — | V1.1–V1.3 |
| W11 | PWR_USB_3.3V | PG13 | I/O | — | — | V1.0–V1.3 |

#### RS485 Control — STM32N657L0H3

Set `RS485_RE#`/`RS485_DE` high or low to switch TX/RX direction. Leave them tristated when unused.

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| A18 | RS485_USART3_RX | PE0 | I/O | — | USART3_RX |
| B17 | RS485_RE# | PB3 | I/O | — | — |
| B18 | RS485_USART3_TX | PE1 | I/O | — | USART3_TX |
| B19 | RS485_DE | PE2 | I/O | — | — |

#### Camera Interface

The OS04C10 uses a CSI-2 interface. Pull `CAM_PWR` high before use.

| Pin | Signal | Function | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| 1 | GND | Ground | — | — | — |
| 2 | CSI_D0N | CSI_D0N | Input | — | — |
| 3 | CSI_D0P | CSI_D0P | Input | — | — |
| 4 | GND | Ground | — | — | — |
| 5 | CSI_D1N | CSI_D1N | Input | — | — |
| 6 | CSI_D1P | CSI_D1P | Input | — | — |
| 7 | GND | Ground | — | — | — |
| 8 | CSI_CKN | CSI clock- | Input | — | — |
| 9 | CSI_CKP | CSI clock+ | Input | — | — |
| 10 | GND | Ground | — | — | — |
| 11 | CSI_EN | PG0 | I/O | — | — |
| 12 | CSI_CLK | PA8 | I/O | — | — |
| 13 | CSI_I3C2_SCL | PB10 | I/O | Pull-up 4.7 KΩ | — |
| 14 | CSI_I3C2_SDA | PB11 | I/O | Pull-up 4.7 KΩ | — |
| 15 | 3V3_CSI | 3.3 V | — | — | — |

#### Fill-Light Control — STM32N657L0H3

Set `CAM_PWR` high before toggling the PWM LED.

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| R2 | PWM_LED | PF7 | I/O | Pulldown 100 KΩ | TIM3_CH3 |

#### Indicator LEDs — STM32N657L0H3

`U0_PWR_3V3` must be high and STM32N6 must be running.

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| P1 | LIGHT_RESISTOR | PF3 | I/O | Pulldown 51 KΩ | — |
| V16 | PWR_LED1 | PG9 | I/O | — | — |
| T12 | DEBUG_LED | PG10 | I/O | — | — |

#### TF Card Interface — STM32N657L0H3

Raise `TF_PWR_ON` before accessing the TF card.

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| 1 | SDIO_TF_D2 | PC10 | I/O | Pull-up 10 KΩ | — |
| 2 | SDIO_TF_D3 | PC11 | I/O | Pull-up 10 KΩ | — |
| 3 | SDIO_TF_CMD | PH2 | I/O | Pull-up 10 KΩ | — |
| 4 | SDIO_TF_CK | PC12 | I/O | Pull-up 10 KΩ | — |
| 5 | SDIO_TF_D0 | PC8 | I/O | Pull-up 10 KΩ | — |
| 6 | SDIO_TF_D1 | PC9 | I/O | Pull-up 10 KΩ | — |
| 7 | SDIO_TF_INT | PD0 | I/O | Pull-up 1 MΩ | — |

#### Wi-Fi Chip Interface — STM32N657L0H3

V1.0 uses SPI2 for Wi-Fi. From V1.1 onward, the Wi-Fi and J12 SPI controllers were exchanged, so Wi-Fi uses SPI4. Do not mix these two mappings.

| Pin | Signal | MCU Pin | Type | Applicable hardware |
| --- | --- | --- | --- | --- |
| P4 | SPI2_SCK | PF2 | I/O | V1.0 |
| A7 | SPI2_NSS | PC1 | I/O | V1.0 |
| D13 | SPI2_MOSI | PD2 | I/O | V1.0 |
| F11 | SPI2_MISO | PD6 | I/O | V1.0 |
| A13 | WIFI_SPI2_IRQ | PE7 | I/O | V1.0 |
| A15 | WIFI_SleepMode_STA | PD5 | I/O | V1.0 |
| A11 | WIFI_ULP_WAKEUP | PD12 | I/O | V1.0 |
| A17 | WIFI_RESET_N | PD11 | I/O | V1.0 |
| A14 | WIFI_POC_IN | PB15 | I/O | V1.0 |
| C17 | PWR_WIFI | PB13 | I/O | V1.0 |

The following table applies to V1.1–V1.3:

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| D10 | SPI4_SCK | PE12 | I/O | Pull-up 10 KΩ | — |
| D8 | SPI4_NSS | PE11 | I/O | Pull-up 10 KΩ | — |
| E16 | SPI4_MOSI | PB7 | I/O | — | — |
| D19 | SPI4_MISO | PB6 | I/O | — | — |
| A13 | WIFI_SPI4_IRQ | PE8 | I/O | — | — |
| A15 | WIFI_SleepMode_STA | PD5 | I/O | — | — |
| A11 | WIFI_ULP_WAKEUP | PD12 | I/O | — | — |
| A17 | WIFI_RESET_N | PD11 | I/O | Pull-up 100 KΩ | — |
| A14 | WIFI_POC_IN | PB15 | I/O | — | — |
| B15 | N6_PWR_WIFI | PB9 | I/O | Pulldown 100 KΩ | — |

#### External PSRAM — STM32N657L0H3

| Pin | Signal | MCU Pin | Type |
| --- | --- | --- | --- |
| H18 | XSPIM_P1_IO0 | PP0 | I/O |
| F18 | XSPIM_P1_IO1 | PP1 | I/O |
| K18 | XSPIM_P1_IO2 | PP2 | I/O |
| K19 | XSPIM_P1_IO3 | PP3 | I/O |
| L19 | XSPIM_P1_IO4 | PP4 | I/O |
| J19 | XSPIM_P1_IO5 | PP5 | I/O |
| H19 | XSPIM_P1_IO6 | PP6 | I/O |
| G19 | XSPIM_P1_IO7 | PP7 | I/O |
| F19 | XSPIM_P1_IO8 | PP8 | I/O |
| E19 | XSPIM_P1_IO9 | PP9 | I/O |
| D18 | XSPIM_P1_IO10 | PP10 | I/O |
| N19 | XSPIM_P1_IO11 | PP11 | I/O |
| N18 | XSPIM_P1_IO12 | PP12 | I/O |
| M19 | XSPIM_P1_IO13 | PP13 | I/O |
| M18 | XSPIM_P1_IO14 | PP14 | I/O |
| L18 | XSPIM_P1_IO15 | PP15 | I/O |
| F16 | XSPIM_P1_NCS1 | PO0 | I/O |
| G18 | XSPIM_P1_DQS0 | PO2 | I/O |
| E18 | XSPIM_P1_DQS1 | PO3 | I/O |
| J18 | XSPIM_P1_CLK | PO4 | I/O |

#### External Flash — STM32N657L0H3

| Pin | Signal | MCU Pin | Type |
| --- | --- | --- | --- |
| R19 | XSPIM_P2_DQS0 | PN0 | I/O |
| P16 | XSPIM_P2_NCS1 | PN1 | I/O |
| T19 | XSPIM_P2_IO0 | PN2 | I/O |
| P19 | XSPIM_P2_IO1 | PN3 | I/O |
| V19 | XSPIM_P2_IO2 | PN4 | I/O |
| U18 | XSPIM_P2_IO3 | PN5 | I/O |
| U19 | XSPIM_P2_CLK | PN6 | I/O |
| V18 | XSPIM_P2_IO4 | PN8 | I/O |
| T18 | XSPIM_P2_IO5 | PN9 | I/O |
| R18 | XSPIM_P2_IO6 | PN10 | I/O |
| P18 | XSPIM_P2_IO7 | PN11 | I/O |

#### Reset Button — STM32N657L0H3

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| F2 | NRST | NRST | Input | Pull-up 47 KΩ |

#### UART Debug Header (J26) — STM32N657L0H3

| Pin | Signal | MCU Pin | Type | Default | Applicable hardware |
| --- | --- | --- | --- | --- | --- |
| 1 | 3V3 | — | Supply | — | V1.0–V1.2 |
| 1 | VCC_IN-compatible output | — | Supply | Schematic R181 is NC | V1.3 |
| 2 | USART2_RX | PA2 | I/O | Pull-up 10 KΩ | V1.0–V1.3 |
| 3 | USART2_TX | PF6 | I/O | Pull-up 10 KΩ | V1.0–V1.3 |
| 4 | GND | — | Supply | — | V1.0–V1.3 |

> V1.3 adds only VCC_IN output compatibility; R181 is marked NC in the schematic. Confirm the actual PCBA assembly before using this pin as a supply. It is not a default output on every V1.3 unit.

#### ST-Link Header — STM32N657L0H3

| Pin | Signal | MCU Pin | Type |
| --- | --- | --- | --- |
| 1 | VCC_IN | — | Supply |
| 2 | SWDIO | PA13 | I/O |
| 3 | SWCLK | PA14 | I/O |
| 4 | GND | — | Supply |

#### BOOT Mode Selector — STM32N657L0H3

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| F4 | BOOT0 | BOOT0 | Input | Pulldown 1 MΩ |
| T10 | BOOT1 | PA6 | I/O | Pulldown 1 MΩ |

#### External Oscillators — STM32N657L0H3

| Pin | Signal | MCU Pin | Type |
| --- | --- | --- | --- |
| A5 | HSE_OSC_IN | PH0-OSC_IN | I/O |
| B5 | HSE_OSC_OUT | PH1-OSC_OUT | I/O |
| D1 | N6_32.768KHZ_P | PC15-OSC32_OUT | I/O |
| E1 | N6_32.768KHZ_N | PC14-OSC32_IN | I/O |

#### STM32U073KBU6 Link

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| U1 | UART9_RX | PF1 | I/O | Pull-up 10 KΩ |
| U3 | UART9_TX | PF0 | I/O | Pull-up 10 KΩ |

### Communication Module Headers

Expansion modules mount on J11/J15. J12, J15, and J11 pinouts are listed below.

#### 16-pin Expansion Header (J12)

Provides UART, I2C, SPI, RS485, etc., for sensor modules such as PIR or OLED. V1.0 uses SPI4 on this connector; from V1.1 onward it uses SPI2.

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| 1 | RS485_B | — | — | — | — |
| 2 | GND | — | Supply | — | — |
| 3 | RS485_A | — | — | — | — |
| 4 | GND | — | Supply | — | — |
| 5 | PD8_TAMP | PD8 | I/O | — | — |
| 6 | 5V0_POE | Power-In | Supply | — | — |
| 7 | SPI2_MISO | PD6 | I/O | — | — |
| 8 | VCC_3V3 | Power-Out | Supply | — | — |
| 9 | SPI2_SCK | PF2 | I/O | Pull-up 10 KΩ | — |
| 10 | PF4_ADC | PF4 | I/O | — | ADC_INP18 |
| 11 | SPI2_MOSI | PD2 | I/O | — | — |
| 12 | SPI2_NSS | PB12 | I/O | — | — |
| 13 | I2C2_SCL | PD14 | I/O | Pull-up 4.7 KΩ | — |
| 14 | LPUART1_TX | PA9 | I/O | — | — |
| 15 | I2C2_SDA | PD15 | I/O | Pull-up 4.7 KΩ | — |
| 16 | LPUART1_RX | PA10 | I/O | — | — |

The following J12 SPI pins are replaced on V1.0. Other connector functions are unchanged from the table above.

| Pin | V1.0 signal | MCU Pin | V1.1–V1.3 counterpart |
| --- | --- | --- | --- |
| 7 | SPI4_MISO | PB6 | SPI2_MISO / PD6 |
| 9 | SPI4_SCK | PE12 | SPI2_SCK / PF2 |
| 11 | SPI4_MOSI | PB7 | SPI2_MOSI / PD2 |
| 12 | SPI4_NSS | PE11 | SPI2_NSS / PB12 |

`VCC_3V3` Control (STM32N657L0H3): Set `PWR_VCC_EXT` high to enable the 3.3 V rail.

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| M2 | PWR_VCC_EXT | PF10 | I/O | Pulldown 100 KΩ |

#### 12-pin Module Header (J15)

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| 1 | CAT1_MAIN_IR | PA2 (U0) | I/O | — |
| 2 | 3V3_VDD0 | — | Supply | — |
| 3 | GND | — | Supply | — |
| 4 | GND | — | Supply | — |
| 5 | I2C1_SCL | PE5 | I/O | Pull-up 10 KΩ |
| 6 | I2C1_SDA | PE6 | I/O | Pull-up 10 KΩ |
| 7 | SAI1_FS_B | PG1 | I/O | — |
| 8 | SAI1_MCLK_B | PG12 | I/O | — |
| 9 | SAI1_SD_B | PA3 | I/O | — |
| 10 | SAI1_SCK_B | PG0 | I/O | — |
| 11 | OTG2_HSDP | OTG2_HSDP | I/O | — |
| 12 | OTG2_HSDM | OTG2_HSDM | I/O | — |

`3V3_VDD0` Control (STM32N657L0H3): Raise `PWR_VDD0` to enable.

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| P2 | PWR_VDD0 | PF14 | I/O | Pulldown 100 KΩ |

#### 16-pin Module Header (J11)

| Pin | Signal | MCU Pin | Type | Default | Alt |
| --- | --- | --- | --- | --- | --- |
| 1 | VCC_IN | — | Supply | — | — |
| 2 | 3V3 | — | Supply | — | — |
| 3 | VCC_IN | — | Supply | — | — |
| 4 | 3V3 | — | Supply | — | — |
| 5 | CAT1_PWR_ON (Halow Wi-Fi) | PG8 | I/O | — | — |
| 6 | GND | — | Supply | — | — |
| 7 | Halow SPI6_MOSI | PA7 | I/O | — | — |
| 8 | Halow SPI6_MISO | PB4 | I/O | — | — |
| 9 | CAT1_UART7_RX | PG11 | I/O | Pull-up 10 KΩ | — |
| 10 | Halow SPI6_NSS | PA0 | I/O | — | ADC_INP18 |
| 11 | CAT1_UART7_TX | PA15 | I/O | — | — |
| 12 | Halow_IRQ | PA4 | I/O | — | — |
| 13 | GND | — | I/O | Pull-up 4.7 KΩ | — |
| 14 | SAI1_SD_A (Wi-Fi wake) | PB2 | I/O | — | — |
| 15 | Halow SPI6_SCK | PA5 | I/O | Pull-up 4.7 KΩ | — |
| 16 | Halow_RST | PB0 | I/O | — | — |

> The following STM32U073KBU6 entries apply only to V1.1–V1.3. V1.0 has no U0 controller and must not reuse its power, button, reset, or PIR control pins.

3.3 V Output Control — STM32U073KBU6: Raise `U0_PWR_3V3` to enable.

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| 11 | PWR_VDD0 | PA5 | I/O | Pulldown 100 KΩ |

#### Trigger Button — STM32U073KBU6

| Pin | Signal | MCU Pin | Type | Default |
| --- | --- | --- | --- | --- |
| 6 | U0_CONFIG | PA0-CK_IN | I/O | Pull-up 47 KΩ |

#### STM32N6 ↔ STM32U0 Link

| Pin | Signal | MCU Pin | Type |
| --- | --- | --- | --- |
| 29 | U0_LPUART2_TX | PB6 | I/O |
| 30 | U0_LPUART2_RX | PB7 | I/O |

#### Control & Trigger Pins — STM32U073KBU6 (V1.1–V1.3)

| Pin | Signal | MCU Pin | Type | Default | Applicable hardware |
| --- | --- | --- | --- | --- | --- |
| 8 | CAT1_MAIN_IR | PA2 | I/O | — | V1.1–V1.3 |
| 10 | U0_PWR_WIFI | PA4 | I/O | Pulldown 100 KΩ | V1.1–V1.3 |
| 11 | U0_PWR_3V3 | PA5 | I/O | Pulldown 100 KΩ | V1.1–V1.3 |
| 12 | U0_PWR_AON | PA6 | I/O | Pulldown 100 KΩ | V1.1–V1.3 |
| 13 | U0_PWR_N6 | PA7 | I/O | Pulldown 100 KΩ | V1.1–V1.3 |
| 14 | CAT1_PWR_ON (Halow Wi-Fi) | PB0 | I/O | — | V1.1–V1.3 |
| 15 | U0_RST_N6 | PB1 | I/O | Pull-up 47 KΩ | V1.2–V1.3 |
| 18 | TEST_USB_IN | PA8 | I/O | — | V1.1–V1.3 |
| 21 | WIFI_SPI4_IRQ | PA1 / PA9 | I/O | — | V1.1–V1.3 |

#### PIR and ISP Interfaces (Revision-dependent)

| Hardware revision | Interface state | Confirmed signals | Wiring requirement |
| --- | --- | --- | --- |
| V1.0–V1.2 | J10 is a shared ISP/PIR connector, not a dedicated 4-pin PIR header. | PIR control and supply selection vary by revision. | Do not use the V1.3 J5 pin information. |
| V1.3 | J10 is retained independently for ISP; J5 is the dedicated PIR connector. | J5 pin 3: PIR Serial (U0 PA3 or N6 selectable); pin 4: PIR trigger (U0 PA1 or PD8 selectable). | Power and signal selection depend on resistor assembly. Confirm the actual PCBA, BOM, and silkscreen before wiring; do not assume a fixed VDD/GND/PA3/PA1 order. |

#### IR-CUT Driver Header (V1.3 only)

| Connector | Signals | Applicable hardware | Notes |
| --- | --- | --- | --- |
| J17 | IR_CUTP / IR_CUTN | V1.3 | IR-CUT driver outputs added in the schematic; this header is absent on V1.0–V1.2. |
