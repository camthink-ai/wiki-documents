---
id: ek410-development-environment
title: Development Environment
sidebar_position: 0
description: Setting up the EK410 firmware development environment (ESP32-C61), building and flashing, embedding the Web console and version management conventions.
keywords: [EK410, ESP-IDF, build, flash, firmware development]
tags: [EK410, software guide, development]
---

# Development Environment

This page explains how to set up the EK410 firmware (ESP32-C61) development environment, build and flash it, and manage Web console assets and firmware versions.

Firmware source: [https://github.com/camthink-ai/EK410](https://github.com/camthink-ai/EK410)

```bash
git clone https://github.com/camthink-ai/EK410.git
cd EK410
```

## Requirements

| Item | Requirement |
| :--- | :--- |
| ESP-IDF | 5.5.x (components declare `>=5.3.0`) |
| Target | `esp32c61` |
| Python | 3.11 (IDF virtual environment) |
| Driver | CH340 USB-UART |

## Build and Flash

Run `set-target` before the first build:

```bash
export IDF_PATH=~/esp/esp-idf-5.5
export IDF_PYTHON_ENV_PATH=~/.espressif/python_env/idf5.5_py3.11_env
export PATH="$HOME/.espressif/tools/riscv32-esp-elf/esp-14.2.0_20260121/riscv32-esp-elf/bin:$IDF_PYTHON_ENV_PATH/bin:$PATH"

cd /path/to/EK410
python3 "$IDF_PATH/tools/idf.py" set-target esp32c61   # first time
python3 "$IDF_PATH/tools/idf.py" build
python3 "$IDF_PATH/tools/idf.py" -p PORT flash monitor
```

- `sdkconfig` is not committed (gitignored); project configuration is based on `sdkconfig.defaults` — change defaults there and regenerate.
- The partition table is `partitions.csv` at the repository root (dual 4MB OTA partitions + a 1MB frame snapshot partition).

## Web Console Assets

The SoftAP Web console is a single-file SPA: the source is `main/www/index.html` (including the embedded i18n dictionary and six-color quantization script). After editing, re-embed it into the firmware:

```bash
python3 tools/gen_www.py   # generates main/www_html.h
```

The UI design baseline (visual tokens, information architecture, quantization algorithm) is documented in `docs/design/ui-preview/DESIGN.md` in the repository.

## Version Management

Firmware versions follow Semantic Versioning and are maintained across these files:

| File | Role |
| :--- | :--- |
| `VERSION` | Canonical version `X.Y.Z` |
| `main/version.h` | Firmware-embedded version macros |
| `CHANGELOG.md` | Release notes |
| `tools/bump_version.py` | Sync and check across the three |

```bash
python3 tools/bump_version.py --show
python3 tools/bump_version.py --check
python3 tools/bump_version.py 1.3.10
# edit CHANGELOG.md, commit, then:
git tag -a v1.3.10 -m "EK410 v1.3.10"
```

Release image helpers:

```bash
bash tools/build_release.sh        # fullclean + build → dist/ek410.bin
bash tools/flash_release.sh PORT   # flash bootloader + partition table + dual-slot image
```

Conventions:

- **MAJOR**: breaking MQTT / HTTP or panel protocol changes; **MINOR**: backward-compatible new features; **PATCH**: fixes.
- Git tag format `vX.Y.Z`.
- Do not change the `deviceId` generation logic lightly — it is the device's NeoMind identity.

## Toolchain

The repository `tools/` directory provides these helper scripts:

| Script | Purpose |
| :--- | :--- |
| `gen_www.py` | Embed `main/www/index.html` into `main/www_html.h` |
| `bump_version.py` | Sync `VERSION` ↔ `main/version.h` |
| `build_release.sh` / `flash_release.sh` | Release build and flash |
| `run_host_tests.py` | Host regressions (no device / IDF; `build_release.sh` runs these first) |
| `fix_verification.py` | On-device HTTP checks for this release’s fixes; `--verify-url` / `--firmware` / `--power` |
| `frame_convert.py` | Arbitrary image → 960000-byte 4bpp native frame (real CS0/CS1 + 90° layout) |
| `gen_font.py` / `gen_font_hz.py` | Generate ASCII / CJK font headers (CJK from Noto Sans CJK SC) |
| `gen_splash_logo.py` | Brand PNG → boot splash header |
| `qa_gate.py` | Single-image QA gate (`smoke` / `candidate` / `soak`; binds `fwVersion`); broker/downlink cases need `--mqtt-password` |
| `stability_stress.py` | Longevity / stress testing over serial or HTTP |
| `gpio_scan/` | Standalone IDF project for pin debugging |

```bash
python3 tools/run_host_tests.py
python3 tools/qa_gate.py --tier smoke --port PORT --host IP
python3 tools/qa_gate.py --tier candidate --port PORT --host IP \
  --mqtt-password '…' --verify-url 'https://…/image.jpg'
```

Run at least `candidate` before shipping; use `--tier soak` for 72 h. See firmware `docs/qa_automation.md`.

## Related Pages

- [HTTP API Reference](./1-http-api.md): the device's external interfaces.
- [MQTT Protocol](./2-mqtt-protocol.md): the platform integration protocol.
- [OTA Firmware Upgrade](../2-user-guide/3-system-maintenance.md): field upgrade mechanism.
