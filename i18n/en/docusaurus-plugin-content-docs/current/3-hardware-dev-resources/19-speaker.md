---
sidebar_position: 19
description: This document introduces the Dragonstate HDK-302008ZA-3C13 dynamic speaker, covering product overview, electrical specifications, and pin definitions for embedded device audio output selection.
keywords: [dynamic speaker, speaker, HDK-302008, Dragonstate, 8 ohm, audio output, embedded audio]
tags: [speaker, hardware development resources, sensor expansion board]
---
# Speaker

## Overview

The Dragonstate HDK-302008ZA-3C13 is a 30mm × 20mm square dynamic speaker with a rated power of 1.5W, impedance of 8Ω, and sensitivity of 90dB. The speaker comes with 1.2mm front and back adhesive for easy mounting, suitable for smart terminals, security devices, IoT gateways, and other embedded devices requiring voice prompts or alarm output.

![Speaker-HDK302008](https://resources.camthink.ai/wiki/img/hardware-dev-resources/speaker/speaker-hdk302008.png)

## 1. Product Overview

### 1.1 Key Features

- **Square miniature design**: 30mm × 20mm compact size, suitable for space-constrained embedded devices
- **Adhesive mounting**: 1.2mm front and back adhesive, simplifying installation
- **High sensitivity**: 90dB SPL (0.5W/0.1m), sufficient volume at low power
- **Wide frequency response**: Fo(1000Hz) ~ 20KHz frequency range, covering the main human auditory range
- **RoHS compliant**: Meets environmental requirements

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the speaker serves as a **local alarm and voice feedback output device**, capable of playing alarm sound effects when events are detected, or broadcasting alarm device status via voice. Combined with PIR/radar and other sensor triggers, it achieves a complete "detection—capture—alarm" closed loop.

| Application Scenario | Description |
|:---|:---|
| Security Alarm | Plays alarm sound effects after intrusion events are detected for on-site deterrence |
| Status Notification | Plays voice prompts when the device comes online/offline or encounters anomalies |
| IoT Gateway | Plays voice feedback after receiving remote commands to confirm operation execution |
| Industrial Equipment | Plays alarm prompts when sensor data exceeds thresholds |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Manufacturer | Dragonstate Electronic Corporation |
| Model | HDK-302008ZA-3C13 (RoHS) |
| Type | Dynamic Speaker |
| Dimensions | 30 × 20 mm (square) |
| Weight | 6.0g ± 0.2g |
| Adhesive | Front 1.2mm adhesive |
| Wire Length | 65mm |

### 2.2 Electrical Specifications

| Parameter | Specification |
|:---|:---|
| Rated Input Power | 1.5W |
| Maximum Input Power | 1.7W (1 minute) |
| Impedance | 8Ω ± 15% @ 2000Hz |
| Resonant Frequency Fo | 1000Hz ± 20% @ 1V |
| Sensitivity SPL | 90dB (0.5W/0.1m) ± 3dB |
| Frequency Range | Fo ~ 20KHz |
| Total Harmonic Distortion THD | Max 10% @ 1KHz, 1.5W |

### 2.3 Operating Conditions

| Parameter | Range |
|:---|:---|
| Operating Temperature | -20°C ~ +60°C |
| Storage Temperature | -30°C ~ +70°C |

### 2.4 Test Conditions

| Item | Specification |
|:---|:---|
| Standard Environment | Temperature 15\~35°C, Humidity 25\~85% |
| Reference Environment | Temperature 20±3°C, Humidity 60~70% |
| Test Fixture | Input power 0.5W (2.0V), zero level |

## 3. Pin Definition

The HDK-302008ZA-3C13 connects via 65mm wire leads with the following polarity definition:

| Terminal | Marking | Description |
|:---|:---|:---|
| (+) | Positive | When positive voltage is applied, the diaphragm moves forward |
| (-) | Negative | Connect to ground or audio amplifier output negative terminal |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
