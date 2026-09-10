---
description: NE503 interface-board external interfaces, on-board resources, debug interfaces, and key pin definitions.
keywords: [NE503, STM32G0B0, interface board, IO configuration, pin definition, RS-485, IR-CUT, hardware connection]
tags: [NE503, interface board, IO configuration, hardware connection]
---

# Interface Board

The interface-board MCU manages external IO, power, and peripherals, and communicates with the core board over UART0. Its terminals provide PoE, Wiegand, alarm, and audio wiring.

> Part numbers are for datasheet, driver, and debugging reference; follow the BOM and schematic for hardware changes.

The annotated photos are shown below:

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
  <div style={{ flex: '1', minWidth: '200px' }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/interface-board-annotation-1.png" alt="NE503 Interface Board Annotation (Side 1)" style={{ width: '100%', height: 'auto' }} />
  </div>
  <div style={{ flex: '1', minWidth: '200px' }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/interface-board-annotation-2.png" alt="NE503 Interface Board Annotation (Side 2)" style={{ width: '100%', height: 'auto' }} />
  </div>
  <div style={{ flex: '1', minWidth: '200px' }}>
    <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/terminal-block-annotation.png" alt="NE503 External Terminal Block Annotation" style={{ width: '100%', height: 'auto' }} />
  </div>
</div>

## Interface Overview

**External Interfaces** — Exposed on the device enclosure for user access:

| # | Function | Description | Category |
|:--|:---------|:------------|:---------|
| 1 | Alarm I/O | Alarm input/output | Product |
| 2 | RS-485 | Serial communication bus | Product |

**On-Board Resources** — Implemented features:

| # | Function | Description | Category |
|:--|:---------|:------------|:---------|
| 3 | IR-CUT Driver | Day/night filter switching | Internal |
| 4 | Light Sensor Detection | ADC ambient light sampling | Internal |
| 5 | IR Light Board Driver | Near/Far-IR PWM | Internal |
| 6 | LENS Driver | SPI lens driver | Internal |
| 7 | System LED | Blue status LED | Internal |
| 8 | Temperature Sensor | ADC temperature sampling | Internal |
| 9 | Bidirectional Reset | SoC resets MCU / MCU resets Processor Board | Internal |
| 10 | RTC | VBAT power-fail retention | Internal |

**Internal Reserved Resources** — Reserved features, not yet enabled:

| # | Function | Description | Category |
|:--|:---------|:------------|:---------|
| 11 | Radar Power Enable | PB0 power control | Internal (Reserved) |
| 12 | Dual-Light Board Driver | White/Red LED PWM | Internal (Reserved) |
| 13 | Fan Driver | 12V fan enable | Internal (Reserved) |
| 14 | Heater | 12V heater enable | Internal (Reserved) |

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

> **Note**: The MCU exposes 2 Alarm IN pins (PB13/PB14), but the product enclosure connector only routes out **1 Alarm IN**.

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

The MCU SPI1 interface provides the control path for the installed lens module. The AN41908A-VBA entry on this page corresponds to the documented board-level driver device; the product offers `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`, while the actual lens capabilities, driver device, and firmware controls depend on the specific SKU/BOM. The SoC-side SPI CS1 is also connected to this driver path (default control path), while the MCU side handles lens homing and limit protection.

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

| Pin | Function | Notes |
|:---|:---|:---|
| PA10 | USART1_RX (Receive) | — |
| PA9 | USART1_TX (Transmit) | Mutually exclusive with Alarm_OUT1, only one can be used at a time |
