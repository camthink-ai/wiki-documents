---
id: ek410-specifications
title: Specifications and Interfaces
sidebar_position: 0
description: EK410 hardware summary, keys and status LEDs, Flash partition table and MCU pin map.
keywords: [EK410, hardware specs, pins, partitions, ESP32-C61]
tags: [EK410, hardware guide, specifications]
---

# Specifications and Interfaces

Hardware summary, user-facing keys and LEDs, Flash partitions and MCU pins. Pin map from the [firmware repository](https://github.com/camthink-ai/EK410) `main/pindefine.h` for secondary development and bring-up.

## Summary

Unit specs follow the product brochure; GPIO / partition details are below.

| Item | Specification |
| :--- | :--- |
| Product | EK410 · CamThink 7.09″ six-color e-paper signage |
| MCU | ESP32-C61HR2 (RISC-V, 160 MHz) |
| Flash / PSRAM | 16 MB / 2 MB (QUAD) |
| Panel | E Ink Spectra 6, 7.09″, active area 108 × 144 mm, 1200 × 1600 (282 PPI) |
| Firmware canvas | logical 1600 × 1200 (native 1200 × 1600, dual driver ICs) |
| Full refresh | about 25–35 s |
| Frame | 960000-byte native 4bpp (dual CS halves), 2 pixels per byte |
| Dimensions / weight | 185 × 149 × 14 mm / 0.28 kg |
| Mounting | Desktop support rod or wall mount |
| Battery | Built-in 5000 mAh Li-polymer; up to ~6 months (1 update/day estimate) |
| Charging | USB Type-C |
| Wireless | Wi-Fi 6 (802.11ax); BLE 5.0 (firmware SoftAP/STA on 2.4 GHz) |
| Memory card | MicroSD (TF) |
| USB-UART | CH340 (development) |
| Keys | MAIN / PAGE / BOOT / RESET (brochure: Power / Reset / Switch) |
| Status LED | RGB (AW9523B over I2C) |
| Panel bus | SPI, dual CS; SPI can switch to TF card |
| Operating temperature | 0–50 °C |

## Keys

| Key | GPIO | Behavior |
| :--- | :--- | :--- |
| MAIN | GPIO2 | Hold ~2.5 s → SoftAP; deep-sleep wake → SoftAP |
| PAGE | GPIO3 | Hold ~2.5 s → enter / exit BLE CT-Prov; deep-sleep wake → BLE |
| MAIN + PAGE | — | Hold both ~6 s → factory reset (keeps `deviceId`) |
| BOOT | GPIO9 | Low for ~50 ms at boot → factory reset (service). Holding through reset enters ROM download mode |
| RESET | EN | Hardware reset; exits SoftAP / BLE handoff and restores last frame |

## Status LED

RGB via AW9523B (I2C 0x59, SDA GPIO22 / SCL GPIO28):

| Color | Meaning |
| :--- | :--- |
| Blue blink | SoftAP |
| Orange blink | Connecting / reconnecting Wi‑Fi |
| Cyan blink | BLE CT-Prov |
| Solid green | Running (STA up) or unprovisioned idle |
| Red short blink | Fault (provisioning / OTA / panel) — never solid |
| Purple fast blink | OTA in progress |
| Off in deep sleep | LED and panel power cut |

## Flash Partitions

From repository `partitions.csv`:

| Partition | Size | Role |
| :--- | :--- | :--- |
| `nvs` | 24 KB | Config (Wi-Fi, MQTT, power, …) |
| `phy_init` | 4 KB | RF calibration |
| `otadata` | 8 KB | OTA slot select |
| `ota_0` | 4 MB | App slot A |
| `ota_1` | 4 MB | App slot B (same binary; rollback) |
| `lastfrm` | 1 MB | Last successful user frame (native 4bpp + header; erase skipped if unchanged) |
| `evtlog` | 64 KB | Event-log partition (app soft cap ~48 KB / 7 days) |

## Pin Map (`main/pindefine.h`)

| Function | GPIO |
| :--- | :--- |
| SPI CS0 / CS1 (panel) | 23 / 24 |
| SPI CLK / MOSI / MISO | 25 / 26 / 27 |
| EPD BUSY / RST | 29 / 12 |
| SPI mux (panel ↔ TF) | 8 |
| I2C SDA / SCL (AW9523B) | 22 / 28 |
| MAIN / PAGE | 2 / 3 |
| Battery ADC | 4 |

## Related Pages

- [Display Panel Characteristics](./1-display-panel.md)
- [OTA Firmware Upgrade](../2-user-guide/3-system-maintenance.md)
- [Development Environment](../4-software-guide/0-development-environment.md)
