---
sidebar_label: "Hardware & Deployment"
description: "CamThink water-meter recognition solution: NE101 cameras + on-host NeoMind OCR for automatic meter reading and business push."
---
# Hardware & Deployment

## Why NE101

**NE101 across the board**, because:

- **Battery powered, no wiring**: 7.2V pack + deep sleep — 5 captures/day for 2.4–6.2 yr on Wi-Fi (theoretical); installs even in unpowered wells/pump rooms
- **Three radios to choose from**: Wi-Fi / Cat.1 / Wi-Fi HaLow modules cover near, remote and cellular-only sites
- **Scheduled capture is enough**: settlement needs 1–4 reads/day; capture frequency trades linearly with battery life
- **Recognition stays on the host**: the camera just captures a clear image — model iterations never touch field devices

## Installation Essentials

- Use the **official water-meter bracket**; lens square to the digit wheels to avoid distortion
- Keep lens-to-dial distance within the bracket spec
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
