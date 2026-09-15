---
title: Solution Description
sidebar_label: "Solution Description"
sidebar_position: 1
description: "Automated water meter reading built on NE101 low-power cameras and NeoMind local OCR: keep the installed meters, auto-ingest readings, full photo audit trail."
---

![Automated water meter reading: NeoMind dashboard showing live NE101 captures and OCR readings](https://resources.camthink.ai/wiki/img/edge-ai-solutions/water-meter-recognition/index/water-meter-demo.webp)

*NeoMind dashboard: NE101 captures meter dials on schedule — OCR readings, battery status and capture history in one view*

## Background

In water utilities, property management and energy metering, most installed water meters are still mechanical meters with no communication capability. They sit in dispersed locations — stairwells, meter pits, pump rooms — and rely on periodic manual reading: high labor cost, long reading cycles, error-prone manual entry, and no on-site evidence when a reading is disputed.

Replacing all legacy meters with smart meters solves the problem once and for all, but means water-outage construction, high procurement cost and ongoing maintenance — which is why retrofit programs move slowly.

## Solution Overview

The idea: **keep the meter — give it a pair of "eyes".**

Mount one CamThink **NeoEyes NE101** low-power AI camera next to each water meter; the official mounting bracket fixes the lens-to-dial position in one shot. The camera wakes up on schedule, captures the dial, and uploads the photo to the **NeoMind platform** over Wi-Fi (incl. HaLow) or Cat.1. The platform runs the OCR engine locally and converts dial readings into structured data (reading + timestamp + photo evidence), which is written into the system after rule-based validation and pushed in real time to billing or O&M systems.

The entire recognition process runs **locally** on the NeoMind server — no GPU, no dependency on external AI services. Every reading is bound to its capture photo as evidence: when a reading is disputed, one photo beats any explanation.

![Water meter reading architecture: scheduled NE101 capture → NeoMind local OCR and validation → billing / work orders / dashboards](/img/solutions/water-meter-architecture.svg)

For hardware selection, the BOM and the deployment process, see [Engineering Implementation](./engineering-intro).

## Workflow

1. **Scheduled capture** — NE101 wakes up on the configured cycle and photographs the dial
2. **Image upload** — photos are sent back to the NeoMind platform over Wi-Fi (incl. HaLow) or Cat.1
3. **Local OCR** — the platform recognizes the digit wheel locally and structures the reading
4. **Rule validation** — range, monotonicity and confidence checks flag abnormal readings
5. **Data egress** — readings and photo evidence are pushed to billing / O&M systems

## Key Benefits

- **Zero meter retrofit**: no meter replacement, no water outage; bracket mounting completes the same day
- **Long battery life**: deep sleep + scheduled wake-up; 2.39–6.20 years at the default 5 captures/day on Wi-Fi (theoretical values) — deployable where no power exists
- **Local recognition**: OCR runs on the NeoMind host; readings and images never leave the premises, and model upgrades never touch field devices
- **Full audit trail**: every reading is bound to its capture photo — metering disputes are traceable anytime
- **Scales on demand**: from 10 meters to thousands, the platform architecture stays unchanged

## Outcome

- Readings are recognized and ingested automatically, replacing manual meter reading and cutting labor cost
- Every reading is archived with its capture photo, so metering disputes can be traced
- No meter replacement or outage — per-meter retrofit cost is far below replacing meters with smart meters
- Recognition accuracy depends on dial condition, mounting angle and lighting; use on-site calibration results as the baseline
