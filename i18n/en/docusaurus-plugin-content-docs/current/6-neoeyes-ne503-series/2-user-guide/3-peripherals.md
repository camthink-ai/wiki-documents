---
description: "NE503 peripheral IO: audio, alarm input, Wiegand output, and linkage."
keywords: [NE503 peripherals, Alarm Input, Wiegand, access control, audio, IO]
tags: [User Guide, NE503, Peripherals]
---

# Peripherals

Configure audio, alarm input, and access-control outputs on the **Peripherals** page.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/peripherals/qs-peripherals.png" />

## I/O Control

- **Mic Input**: enable the microphone for monitoring, talk-back, or app audio capture.
- **Speaker Output**: enable the speaker for talk-back or app audio.
- **Alarm Input**: alarm input switch. The current firmware does not report it to the event bus/API; use external wiring for linkage.
- **Alarm Input Level**: `High` / `Low` trigger level; not effective in the current firmware.
- **Wiegand CH0 / CH1**: two outputs for access-control controllers; not for card readers.

> NE503 provides one alarm-input channel. Follow the hardware documentation for wiring and power requirements.

## Linkage

- **Two-way talk**: enable Mic Input and Speaker Output, then use **Talk** on Media.
- **AI events**: an app or business system subscribes to events and drives an external relay; the platform has no built-in automatic linkage.
