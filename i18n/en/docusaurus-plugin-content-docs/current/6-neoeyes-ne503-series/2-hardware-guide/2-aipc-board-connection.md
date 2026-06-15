---
description: NE503 interface board (STM32G0B0RET6) hardware interface pin definitions, distinguishing external interfaces, on-board resources, and debug interfaces, covering Alarm, RS-485, IR-CUT, light boards, LENS Driver, fan, RTC, and more.
keywords: [NE503, STM32G0B0, interface board, IO configuration, pin definition, RS-485, IR-CUT, light board, hardware connection]
tags: [NE503, interface board, IO configuration, STM32G0B0]
---

# Interface Board

The interface board uses an independent MCU (STM32G0B0RET6) to manage external IO, power, and peripheral control. It communicates with the core processing board via UART0.

## Interface Overview

**External Interfaces** — Exposed on the device enclosure for user access:

| # | Function | Description | Category |
|:--|:---------|:------------|:---------|
| 1 | Alarm I/O | Alarm input/output | Product |
| 2 | RS-485 | Serial communication bus | Product |

**On-Board Resources** — Implemented features:

| # | Function | Chip/Module | Description | Category |
|:--|:---------|:------------|:------------|:---------|
| 3 | IR-CUT Driver | IR-CUT device | Day/night filter switching | Internal |
| 4 | Light Sensor Detection | Photoresistor | ADC ambient light sampling | Internal |
| 5 | IR Light Board Driver | External light board | Near/Far-IR LED PWM | Internal |
| 6 | LENS Driver | AN41908A-VBA | SPI lens driver | Internal |
| 7 | System LED | — | Blue status LED | Internal |
| 8 | Temperature Sensor | LMT87DCK | ADC temperature sampling | Internal |
| 9 | Bidirectional Reset | SN74LVC1G14DCK + PD8 | SoC resets MCU (chip) / MCU resets Processor Board (PD8) | Internal |
| 10 | RTC | Supercapacitor | VBAT power-fail retention | Internal |

**Internal Reserved Resources** — Reserved features, not yet enabled:

| # | Function | Chip/Module | Description | Category |
|:--|:---------|:------------|:------------|:---------|
| 11 | Radar Power Enable | — | PB0 power control | Internal (Reserved) |
| 12 | Dual-Light Board Driver | External light board | White/Red LED PWM | Internal (Reserved) |
| 13 | Fan Driver | — | 12V fan enable | Internal (Reserved) |
| 14 | Heater | — | 12V heater enable | Internal (Reserved) |

**Debug Interfaces** — For development and debugging:

| # | Function | Description | Category |
|:--|:---------|:------------|:---------|
| 15 | ST-LINK | SWD debug port | Debug |
| 16 | Debug UART1 | USART1 | Debug |

## External Interfaces

### Alarm I/O

Alarm input/output on the device enclosure.

| Pin | Function | Note |
|:---|:---|:---|
| PB13 | Alarm_IN0 | External alarm input 0 |
| PB14 | Alarm_IN1 | External alarm input 1 |
| PA8 | Alarm_OUT0 | Alarm output 0 (level output) |
| PA9 | Alarm_OUT1 | Alarm output 1 (multiplexed with USART1_TX) |

### RS-485

RS-485 serial communication on the device enclosure.

| Pin | Function |
|:---|:---|
| PC4 | RS485_TXD3 (Transmit) |
| PC5 | RS485_RXD3 (Receive) |
| PB1 | RS485_EN (Transceive enable) |

## On-Board Resources

### IR-CUT

IR-CUT day/night filter driver.

| Pin | Function | Note |
|:---|:---|:---|
| PB8 | IR_CUT_EN (IR-CUT driver enable) | Supports auto / day / night three-mode switching |

### Light Sensor Detection

Photoresistor ADC sampling for ambient light threshold detection, driving automatic day/night mode switching.

| Pin | Function | Note |
|:---|:---|:---|
| PA1 | PD_ADC (ADC1_IN1, photoresistor sampling) | Ambient light threshold detection |

### Light Board Drivers

The interface board controls external light boards via PWM (independent physical modules connected via connectors).

**IR Light Board (Near-IR/Far-IR):**

| Pin | Function |
|:---|:---|
| PC9 | PWM_Far (Far-IR PWM) |
| PC8 | PWM_Near (Near-IR PWM) |

### LENS Driver (AN41908A-VBA)

The MCU SPI1 interface controls the AF auto-zoom and autofocus lens module. The SoC-side SPI CS1 is also connected to the same chip (default control path), while the MCU side handles lens homing and limit protection.

| Pin | Function |
|:---|:---|
| PA5 | SPI1_CLK (SPI clock) |
| PA6 | SPI1_MISO (SPI master in slave out) |
| PA7 | SPI1_MOSI (SPI master out slave in) |
| PA4 | SPI1_CS (SPI chip select) |
| PB3 | LENSPOWER_EN (Lens power enable) |
| PD6 | F_RST (Focus reset) |
| PD5 | Z_RST (Zoom reset) |
| PD4 | RSTB (Master reset) |
| PD3 | PLS2 (Step control 2) |
| PD2 | PLS1 (Step control 1) |
| PD1 | VD_FZ (Vertical drive Focus/Zoom) |
| PD0 | LS_FZ (Limit switch Focus/Zoom) |

### System LED

| Pin | Function | Note |
|:---|:---|:---|
| PD9 | SYS-LED (System status LED) | Blue, MCU direct control |

### Temperature Sensor (LMT87DCK)

| Pin | Function |
|:---|:---|
| PB2 | Temp_ADC (Temperature ADC sampling) |

### Main Board Reset

MCU controls core processing board reset via PD8. Conversely, the SoC can also reset the MCU via H_GPIO_18 (SN74LVC1G14DCK) (see [Core Board](./1-core-board-connection.md)).

| Pin | Function |
|:---|:---|
| PD8 | POWER_RST (Core processing board reset control) |

### RTC

MCU VBAT powered by external supercapacitor to maintain RTC operation, synchronized with core processing board system time.

| Function | Description |
|:---|:---|
| RTC Power | VBAT with external supercapacitor |
| Time Sync | MCU RTC synchronized with core processing board |
| Power-Fail Retention | Supercapacitor maintains RTC operation |

## Internal Reserved Resources

### Radar Power Enable

MCU controls the radar module power switch.

| Pin | Function |
|:---|:---|
| PB0 | Radar_EN (Radar power enable) |

### Dual-Light Board Driver

| Pin | Function |
|:---|:---|
| PB4 | PWM_R (Red light PWM) |
| PB5 | PWM_W (White light PWM) |
| PB6 | R_CTL (Red light switch control) |
| PB7 | W_CTL (White light switch control) |

### Fan Driver

| Pin | Function | Note |
|:---|:---|:---|
| PB9 | FAN_EN (Fan enable) | 12V |

### Heater

| Pin | Function | Note |
|:---|:---|:---|
| PA15 | HEAT_EN (Heater enable) | 12V |

## Debug Interfaces

### ST-LINK

MCU SWD debug port for firmware flashing and online debugging.

| Pin | Function |
|:---|:---|
| PA14 | SWDCLK / BOOT0 |
| PA13 | SWDIO |

### UART1 (Debug Serial Port)

| Pin | Function |
|:---|:---|
| PA10 | USART1_RX (Receive) |
| PA9 | USART1_TX (Transmit) | Mutually exclusive with Alarm_OUT1, only one can be used at a time |
