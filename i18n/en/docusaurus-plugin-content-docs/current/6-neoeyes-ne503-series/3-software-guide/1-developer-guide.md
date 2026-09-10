---
description: Steps to set up the NE503 development environment, get source code, and build a platform software release package.
keywords: [NE503, development environment, build, Docker, Hailo SDK, release package]
tags: [platform development, NE503, environment, build]
---

# Developer Guide

This page shows how to build an NE503 platform software release package from NeoRuntime source.

## 1. Get the Source

| Repository | Use |
|:---|:---|
| [neoruntime](https://github.com/camthink-ai/neoruntime) | Platform services, HAL, deployment assets, MCU firmware, and Web console |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python/C++ SDKs and proto |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | App templates and examples |

```bash
git clone https://github.com/camthink-ai/neoruntime.git
cd neoruntime
```

For SDK and app development, use the corresponding repository directly.

## 2. Start the Docker Build Environment

The Docker image includes the Hailo/Poky SDK.

```bash
docker pull camthink/ne503-dev:v1.0

docker run --rm -it \
  --entrypoint /bin/bash \
  --user root \
  -v "$PWD:/ne503" \
  -w /ne503 \
  -e SDK_PATH=/opt/hailo-sdk \
  camthink/ne503-dev:v1.0
```

## 3. Build the Release Package

Run this inside the container:

```bash
git config --global --add safe.directory /ne503
make pack-release VERSION=<version>
```

The release package is written to `build/release/`.

`pack-release` rebuilds the MCU OTA firmware by default. If existing MCU artifacts should be reused:

```bash
make pack-release VERSION=<version> BUILD_MCU_FW=0
```

## 4. Quick Validation

```bash
make test-basic
```

Run `make test` for the full test suite.

If the SDK or a build target is not found, confirm that you are using `camthink/ne503-dev:v1.0`, then see the [NeoRuntime build guide](https://github.com/camthink-ai/neoruntime/blob/main/docs/getting-started/BUILD.md).

## 5. Related Documentation

- [NeoRuntime testing guide](https://github.com/camthink-ai/neoruntime/blob/main/tests/TESTING_GUIDE.md)
- [NE503 SDK](https://github.com/camthink-ai/neoruntime-sdks)
- [NE503 applications](https://github.com/camthink-ai/neoruntime-apps)
- After building, follow [Software Deployment](./3-software-deployment.md) to install or upgrade the device.
