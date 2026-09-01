---
description: NE100-MB01 hardware connection reference, including revision-aware power-control GPIOs, PIR wiring, connector definitions, and multiplexing limits.
keywords: [NE100-MB01, hardware connection, GPIO, pin definition, PIR, UART, I2C, SPI, hardware revision]
tags: [hardware guide, NE100-MB01, pin definition, revision compatibility]
---

# Hardware Connection

> Identify the hardware revision from the PCBA marking before wiring. Pins with an applicability field in the tables below can be used only on the stated revisions.

## **Main Board Interfaces Overview**

### Top side Interfaces:

- Type-C for UART and Power Supply
- MicroSD Slot
- Reset Button
- Wireless Module Connector
- Sanp Button
- Uart Port for Debug
- USB Camera  Connector
- LED Board Connector
- FPC Camera Module Connector  
![NE10X_Top_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Top_IO_Marker.png)

### Bottom side Interfaces:

- Power Input Connector
- Alarm Input Connector
- PIR Input Connector
- Expansioin GPIOs, include UART、I2C、SPI、Power Output
- Boot Button  
![NE10X_Bot_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Bot_IO_Marker.png)

## **Demo Kit quick start guide**

- After unpacking, inspect the Main Board and accessories to ensure they are intact.
- Connect the Camera Module (OV5640 Module or USB Module) to the main board.
- Attach the communication module (Cat-1 or WiFi-Halow) to the main board (optional).
- Connect the debug UART port via the Type-C or 4Pin Wafer connector.
- Supply power through the Type-C port or the power connector.
- After completing the above steps, you may begin the related debugging procedures.

 **For program and debug, please ref**：[AI Camera System Flashing](../2-software-guide/1-system-flashing-and-initialization.md)

## **Interfaces description**

### Peripherals power Ctrl

Before using the camera, ISP, fill light, light sensor, or battery-level detection, set the relevant power-control GPIO high for the installed board revision. Enable TF-card power before using the card. On V2.0, TF-card power shares GPIO48 with Cat-1/HaLow module power enable, so it cannot be handled using only the legacy TF-card logic.

| Purpose | GPIO | Applicable hardware revision | Wiring or software-control note |
| --- | --- | --- | --- |
| Camera, fill-light, and battery-detection power control | CAM_PWR / GPIO3 | V1.0, V1.1, V1.2 | V2.0 does not use this GPIO for power control. |
| Camera, fill-light, and battery-detection power control | CAM_PWR / GPIO42 | V2.0 | Replaces the V1.x GPIO3 control. |
| TF-card power control | TF_PWR / GPIO42 | V1.0, V1.1, V1.2 | V2.0 does not use this GPIO for TF-card power control. |
| TF-card power control | TF_PWR_ON / GPIO48 | V2.0 | Shared with Cat-1/HaLow module-power enable; evaluate module-power state when enabling the TF card. |


### USB Camera Connector
| PIN# | Pin Name  | Functions     | Notes| 
| ---- | --------- | ------------  | ------------| 
| 1    | VDD       | Power supply         |Max current 500mA|              
| 2    | GND       | GND                |Common with signal ground|
| 3    | DM      | USB Differential (-)      | Needs to match USB2.0|             
| 4    | DP      | USB Differential (+)      |  Needs to match USB2.0|           

### PIR GPIOs Defined

The PIR connector is supported only on V1.1, V1.2, and V2.0. V1.0 does not include this connector. J21 follows the schematic net names:
| PIN# | Pin Name | Functions | Pin Type | Pull Up/Down | Alternate Function | Applicable hardware revision |
| ---- | -------- | --------- | -------- | ------------ | ------------------ | ---------------------------- |
| 1 | 3V3_PIR | PIR 3.3 V supply | S | | — | V1.1, V1.2, V2.0 |
| 2 | GND | Ground | S | | — | V1.1, V1.2, V2.0 |
| 3 | SDIO_IRQ(INT) | Interrupt / multiplexed signal | I/O | | GPIO41; conflicts with TF/HaLow use | V1.1, V1.2, V2.0 |
| 4 | ALA_IN | Alarm input | I | | GPIO2 | V1.1, V1.2, V2.0 |

### RTC (V2.0 only)

V1.0, V1.1, and V1.2 do not have an on-board RTC. On V2.0, the RTC shares the I2C bus with the camera. Software accessing both must use the same bus configuration.

| RTC signal | GPIO | Applicable hardware revision | Notes |
| --- | --- | --- | --- |
| RTC interrupt | GPIO3 | V2.0 | On V2.0, GPIO3 no longer controls power for the camera, fill light, or battery detection. |
| I2C_SDA | GPIO4 | V2.0 | Shared with the FPC camera module I2C_SDA. |
| I2C_SCL | GPIO5 | V2.0 | Shared with the FPC camera module I2C_SCL. |


### 16Pin GPIOs Expansion
The 16 pins expansion header provide communication interface like uart, I2C,  SPI and GPIOs. Developer can use these interfaces to expand sensor modules like PIR sensor, OLED module as their needed.

> This table defines physical pins and signal nets only. Availability depends on the hardware revision and active TF, Cat-1, HaLow, and USB configuration; do not treat a multiplexed GPIO in this table as available on every revision.


| PIN# | Pin Name | Functions   | Pin Type | Pull Up/Down | Alternate Function |
| ---- | -------- | ----------- | -------- | ------------ | ------------------ |
| 1    | TXD0     | Uart0 TX    | I/O/T    | PU 10K       | GPIO43             |
| 2    | GND      | GND         | S        |              |                    |
| 3    | RXD0     | Uart0 RX    | I/O/T    | PU 10K       | GPIO44             |
| 4    | GND      | GND         | S        |              |                    |
| 5    | GPIO     | GPIO41      | I/O/T    |              |                    |
| 6    | 5V0      | 5V0 Input   | S        |              |                    |
| 7    | SPI_MISO | SPI_MISO    | I/O/T    |              | GPIO40             |
| 8    | 3V3      | 3V3 Output  | S        |              |                    |
| 9    | SPI_CLK  | SPI_CLK     | I/O/T    |              | GPIO39             |
| 10   | Alarm_IN | Alarm Input | I        |              | GPIO2,ADC1_CH1     |
| 11   | SPI_MOSI | SPI_MOSI    | I/O/T    |              | GPIO38             |
| 12   | SPI_CS   | SPI_CS      | I/O/T    |              | GPIO45             |
| 13   | GPIO     | GPIO19      | I/O/T    |              | USB_D-,ADC2_CH8    |
| 14   | GPIO     | GPIO48      | I/O/T    |              |                    |
| 15   | GPIO     | GPIO20      | I/O/T    |              | USB_D+,ADC2_CH9    |
| 16   | GPIO     | GPIO46      | I/O/T    |              |                    |


### FPC Camera Module Connector

Camera Module OV5640 support 8-bit paralle input interface. The IOs of main board config as below


| PIN# | Pin Name  | Functions    | Pin Type | Pull Up/Down | ESP32-S3 PINs |
| ---- | --------- | ------------ | -------- | ------------ | ------------- |
| 1    | Null      |              |          |              |               |
| 2    | GND       | GND          | S        |              |               |
| 3    | I2C_SDA   | I2C_Data     | I/O      | PU 4K7       | GPIO4         |
| 4    | AVDD      | 2.8V         | S        |              |               |
| 5    | I2C_SCL   | I2C_Clock    | O        | PU 4K7       | GPIO5         |
| 6    | CAM_RST   | Reset#low    |          |              | RC circuit    |
| 7    | CSI_VSYNC | V-Sync       | I        |              | GPIO6         |
| 8    | CSI_PWDN  |              |          | PD 1K        |               |
| 9    | CSI_HSYNC | H-Sync       | I        |              | GPIO7         |
| 10   | DVDD      | 1V2          | S        |              |               |
| 11   | DOVDD     | 2V8          | S        |              |               |
| 12   | CSI_D7    | Data_Bit7    | I        |              | GPIO16        |
| 13   | CSI_MCLK  | Clock_output | O        |              | GPIO15        |
| 14   | CSI_D6    | Data_Bit6    | I        |              | GPIO17        |
| 15   | GND       | GND          | S        |              |               |
| 16   | CSI_D5    | Data_Bit5    | I        |              | GPIO18        |
| 17   | CSI_PCLK  | Pixel Clock  | I        |              | GPIO13        |
| 18   | CSI_D4    | Data_Bit4    | I        |              | GPIO12        |
| 19   | CSI_D0    | Data_Bit0    | I        |              | GPIO11        |
| 20   | CSI_D3    | Data_Bit3    | I        |              | GPIO10        |
| 21   | CSI_D1    | Data_Bit1    | I        |              | GPIO9         |
| 22   | CSI_D2    | Data_Bit2    | I        |              | GPIO8         |
| 23   | Null      |              |          |              |               |
| 24   | Null      |              |          |              |               |


> Note: Before use, set the camera power-control GPIO high for the installed revision; see [Peripherals power Ctrl](#peripherals-power-ctrl).

### Flash and Light Sensor IOs


| PIN# | Pin Name       | Functions | Pin Type | Pull Up/Down | ESP32-S3 PINs |
| ---- | -------------- | --------- | -------- | ------------ | ------------- |
| 24   | FLASH_LED      | LEDC_PWM  | O        | PD 100K      | GPIO47        |
| 39   | LIGHT_RESISTOR | ADC       | A        |              | GPIO1         |


> Note: 1. Before use, set the camera/fill-light power-control GPIO high for the installed revision; see [Peripherals power Ctrl](#peripherals-power-ctrl); 2. A light intensity of 0% to 100% corresponds to an output voltage of 0 to 2.5V.

### TF Card IOs


| PIN# | Pin Name | Functions | Pin Type | Pull Up/Down | ESP32-S3 PINs |
| ---- | -------- | --------- | -------- | ------------ | ------------- |
| 31   | CMD      | SDIO_CMD  | O        | PU 10K       | GPIO38        |
| 32   | CLK      | SDIO_CLK  | O        | PU 10K       | GPIO39        |
| 33   | DAT0     | SDIO_DA0  | I        | PU 10K       | GPIO40        |
| 34   | CD       | SDIO_IRQ  | I        | PU 1M        | GPIO41        |


> Note: 1. Before use, set the TF-card power-control GPIO high for the installed revision; see [Peripherals power Ctrl](#peripherals-power-ctrl); 2. Use an MMC 1-bit mode protocol driver; 3. GPIO38–GPIO41 and GPIO45 cannot be used concurrently with conflicting WiFi-Halow or 4G Cat-1 configurations.

### Other IOs


| PIN# | Pin Name | Functions | Pin Type | Pull Up/Down | ESP32-S3 PINs |
| ---- | -------- | --------- | -------- | ------------ | ------------- |
| 23   | CFG_KEY  | IRQ_IN    | I        | PU 10K       | GPIO21        |
| 22   | BAT_DET  | ADC       | A        |              | GPIO14        |


> Note: 1. Before starting battery-level detection, set the relevant power-control GPIO high for the installed revision; see [Peripherals power Ctrl](#peripherals-power-ctrl); 2. The battery level from 0% to 100% corresponds to a voltage range of 1.8 to 3V.

### Communication Module Pins Header defined

Communication Module is mounted on J11 & J15  Pins Header.  The J11 16 Pins Header provide related signals. The J15 12 Pins Header only for phsical support.  
Please note that for IOs sources lack, the IO configuration conflit with some IOs 

### Expansioin GPIOs(16 Pins)

Detailed information please reference the comparison table.


| PIN# | Pin Name   | Functions    | Pin Type | Pull Up/Down | ESP32-S3 PINs          |
| ---- | ---------- | ------------ | -------- | ------------ | ---------------------- |
| 1    | VCC_IN     | Power Output | S        |              |                        |
| 2    | 3V3        | 3V3 Output   | S        |              |                        |
| 3    | VCC_IN     | Power Output | S        |              |                        |
| 4    | 3V3        | 3V3 Output   | S        |              |                        |
| 5    | WIFI_PWR_H | Power Enable | I/O/T    |              | GPIO48                 |
| 6    | GND        |              | GND      |              |                        |
| 7    | SPI_MOSI   | SPI_MOSI     | I/O/T    |              | GPIO38                 |
| 8    | SPI_MISO   | SPI_MISO     | I/O/T    |              | GPIO40                 |
| 9    | SPI_CS     | SPI_CS       | I/O/T    |              | GPIO45                 |
| 10   | SPI_CS     | SPI_CS       | I/O/T    |              | GPIO45                 |
| 11   | WIFI_BUSY  | Status       | I/O/T    |              | GPIO20,USB_D+,ADC2_CH9 |
| 12   | IRQ        | Interrupt    | I/O/T    |              | GPIO41                 |
| 13   | GND        |              | GND      |              |                        |
| 14   | WIFI_WAKE  | Wake_Up      | I/O/T    |              | GPIO19,USB_D-,ADC2_CH8 |
| 15   | SPI_CLK    | SPI_CLK      | I/O/T    |              | GPIO39                 |
| 16   | WIFI_RST   | Reset#low    | I/O/T    |              | GPIO46                 |


### GPIO conflicts
Do not attach another peripheral to a GPIO already used by the active communication module, TF card, USB, or PIR configuration. The matrix below lists occupied schematic nets for each configuration. An em dash means only that the configuration assigns no role to that GPIO; it does not mean the GPIO is safe to use for another purpose.

| ESP32-S3 GPIO | WiFi only | WiFi + Cat-1 + UART | WiFi + Cat-1 + USB | HaLow WiFi |
| --- | --- | --- | --- | --- |
| GPIO19 | — | — | USB_D- | WIFI_WAKE |
| GPIO20 | — | — | USB_D+ | WIFI_RST |
| GPIO46 | — | Cat-1 TX | USB_VBUS | WIFI_BUSY |
| GPIO48 | — | CAT1_PWR_H | CAT1_PWR_H | WIFI_PWR_H |
| GPIO41 | TFCARD_DET | — | — | SDIO_IRQ(INT) |
| GPIO40 | SDIO_DA0 / TF | — | — | SDIO_DA0 / MISO |
| GPIO39 | SDIO_CLK / TF | — | — | SDIO_CLK / CLK |
| GPIO38 | SDIO_CMD / TF | — | — | SDIO_CMD / MOSI |
| GPIO45 | — | Cat-1 RX | — | SDIO_DA3 / CS |
| GPIO2 | Alarm input in all configurations | Alarm input in all configurations | Alarm input in all configurations | Alarm input in all configurations |
| TXD0 / RXD0 | System-programming UART in all configurations | System-programming UART in all configurations | System-programming UART in all configurations | System-programming UART in all configurations |
