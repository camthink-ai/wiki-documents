---
description: NE503 hardware specifications for board, storage, interface, imaging, and operating-environment parameters.
keywords: [NE503, hardware specifications, LPDDR4, eMMC, SoC, MCU, interfaces]
tags: [NE503, hardware specifications, interfaces, hardware reference]
---

# Hardware Specifications

## Module-Level Specifications

Key specifications for each physical module in NE503:

### Core Processing Board

| Type | Specifications |
|:---|:---|
| CPU / SoC | Quad-core Arm Cortex-A53, 1.3 GHz; AI performance up to 20 TOPS; ISP supports up to 12 MP resolution, 600 Mpixel/s pixel rate, HDR and noise reduction; VPU supports H.265/H.264 encoding |
| LPDDR4 | 4 GB or 8 GB; the documented 8 GB configuration is 4266 Mb/s with 8.5 GB/s single-channel bandwidth; the 4 GB configuration follows its BOM |
| eMMC | 64 GB |
| QSPI Flash | 8 MB, Quad SPI protocol, standby current 8 µA, erase cycles > 100,000 |
| Temperature Sensor | 12-bit resolution, 0.0625°C, I2C interface |
| EEPROM | 2 Kb (256 × 8), I2C interface, standby current < 1 µA, 1,000,000 write cycles |
| PCIe Clock Generator | 25 MHz, full-output operating current (IDD) 15 mA, low-jitter PCIe Gen4: 0.3 ps |
| Ethernet PHY | 10/100M Ethernet, RMII interface, IO voltage 1.6V ~ 3.6V |
| Inertial Measurement Unit (IMU) | Integrated 3-axis digital accelerometer (programmable, max ±16 g) and 3-axis digital gyroscope (up to ±4000 dps) |

### Interface Board

| Type | Specifications |
|:---|:---|
| MCU | Arm Cortex-M0+, 64 MHz, 512 KB Flash, 144 KB RAM |
| Temperature Sensor | Analog output, -50°C ~ 150°C |
| Lens Driver | Lens options are `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`; the driver device and available controls depend on the specific SKU/BOM and firmware |
| Audio Codec | I2S interface, controlled by the processing board |

### External Modules

| Type | Specifications |
|:---|:---|
| Image Sensor | 1/1.8-inch 4K CMOS image sensor, up to 60fps 4K full-pixel output |

### Light Board (Independent Module)

| Type | Description |
|:---|:---|
| Dual-Light Board | White + Red LED, PWM dimming, connected to interface board via connector |
| IR Light Board | Near-IR + Far-IR LED, PWM dimming, connected to interface board via connector |

## Operating Environment

| Parameter | Specification |
|:---|:---|
| Operating Temperature | -40 ~ 60°C |
| Relative Humidity | 0 ~ 95% non-condensing |

## Version History

| Version | Date | Changes |
|:---|:---|:---|
| V1.0 | 2026-04-02 | Initial release |

## Related Documentation

- [Core Board](./1-core-board-connection.md)
- [Interface Board](./2-aipc-board-connection.md)
