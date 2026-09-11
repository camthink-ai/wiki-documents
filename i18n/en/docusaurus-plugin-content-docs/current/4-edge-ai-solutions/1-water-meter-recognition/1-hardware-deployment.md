---
sidebar_label: "Hardware & Deployment"
description: "CamThink water-meter recognition solution: NE101/NE301 cameras + on-host NeoMind OCR for automatic meter reading and business push."
---
# Hardware & Deployment

## Camera Selection

| Dimension | NE101 (recommended start) | NE301 |
|---|---|---|
| Power | Battery (7.2V), no wiring | DC/USB, for rooms with power |
| Imaging | Fine for close-up dials | Higher quality for distant / small digits |
| Network | Wi-Fi / Cat.1 / Wi-Fi HaLow swappable | Wi-Fi / wired |
| Capture | Deep sleep + scheduled wake; 5/day for 2.4–6.2 yr (Wi-Fi, theoretical) | Powered, high frequency possible |
| On-device inference | No (images uploaded) | Optional (NPU) |

Most meter-reading cases need **1–4 reads/day** — NE101's scheduled capture is enough; choose NE301 only for minute-level monitoring or easy power.

## Installation Essentials

- Use the **official water-meter bracket**; lens square to the digit wheels to avoid distortion
- Keep lens-to-dial distance within the bracket spec; small-digit legacy dials favor NE301
- In wells/pump rooms watch for condensation: lens facing down or with a hood
- Enable NE101 fill light for dark environments (built-in firmware feature, see [NE101 overview](/docs/neoeyes-ne101-series/overview))

## Power & Network

NE503 battery life by radio (official theoretical values):

| Radio | Default low-power (5/day) | Optimized ceiling | Fit |
|---|---|---|---|
| Wi-Fi | 2.39 yr | 6.20 yr | Mid/near range with router coverage |
| Wi-Fi HaLow | 1.46 yr | 4.30 yr | Remote / obstructed sites |
| Cat.1 | 0.83 yr | 2.08 yr | Cellular-only sites; add external power for high frequency |

- Battery life scales linearly with capture frequency (1/day ≈ 5× the 5/day figure)
- Radio modules are swappable — see [communication expansion](/docs/neoeyes-ne101-series/overview)

## Device-Side Setup

NE101 firmware ships with scheduled capture, MQTT upload, fill-light control and network management out of the box. Flashing & config: [NE101 dev guide](/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide). Receiver side: [Platform Configuration](./platform-configuration).
