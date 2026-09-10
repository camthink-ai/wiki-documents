---
id: ne302-development-environment
title: Environment setup
sidebar_position: 0
description: Set up, configure and verify the NE302 source build environment before building or flashing firmware.
keywords: [NE302, environment setup, ARM GCC, STM32CubeProgrammer, STM32CubeCLT, ST Edge AI, pnpm]
tags: [NE302, software-guide, toolchain, build]
---

# Environment setup

This page prepares the NE302 source development environment. Commands and tools follow the repository [SETUP.md](https://github.com/camthink-ai/ne302/blob/main/SETUP.md). When this page is complete, continue to [Build, Flash and Update](./1-build-and-flash.md).

## 1. Docker (recommended)

NE302 and NE301 use the same development platform. For the default `STEDGEAI_VARIANT=4.0`, use the NE301 [`camthink/ne301-dev:v4.0`](https://hub.docker.com/r/camthink/ne301-dev) Docker image. When building a `2.2` or `3.0` model variant, use the matching image tag; firmware, model packages and the toolchain must use the same variant. The image keeps the cross-compilation toolchain and build dependencies in the container, avoiding a host installation of ARM GCC, Node.js, pnpm and ST tools.

| `STEDGEAI_VARIANT` | Docker image |
| :--- | :--- |
| `2.2` | `camthink/ne301-dev:v2.2` |
| `3.0` | `camthink/ne301-dev:v3.0` |
| `4.0` (default) | `camthink/ne301-dev:v4.0` |

Confirm Docker is available, clone the NE302 source, and pull the image:

```bash
docker version
git clone https://github.com/camthink-ai/ne302.git
cd ne302
docker pull camthink/ne301-dev:v4.0
```

Start the container; the source directory is mounted at `/workspace`:

```bash
# Build only; no USB pass-through is needed.
docker run -it --rm \
  -v "$PWD":/workspace \
  -w /workspace \
  camthink/ne301-dev:v4.0

# Use USB pass-through only when flashing through ST-LINK on Linux.
docker run -it --rm --privileged \
  -v "$PWD":/workspace \
  -v /dev/bus/usb:/dev/bus/usb \
  -w /workspace \
  camthink/ne301-dev:v4.0
```

Inside the container, use NE302's own checks and non-destructive build verification:

```bash
./check_env.sh
make info
make -n
```

The Docker environment is ready for the next build step when `./check_env.sh` shows `Result: Essential tools complete! ✓` and both `make info` and `make -n` complete without an error. See [Build, Flash and Update](./1-build-and-flash.md) for flashing commands.

## 2. Local build environment (fallback)

Use this section only when Docker is unavailable or host tools must be run directly. Clone the source, then check which tools are missing:

```bash
git clone https://github.com/camthink-ai/ne302.git
cd ne302
./check_env.sh
```

Run the setup and check scripts for your operating system:

```bash
# Linux / macOS / Git Bash
./setup.sh
./check_env.sh

# Windows
setup.bat
check_env.bat
```

The setup script generates `.make.env` at the project root. Script completion does not mean that every task is available; use the result in section 5 to determine whether the environment is ready to build, flash, or regenerate a model.

## 3. Install tools by task

| Task | Required tools | When required |
| :--- | :--- | :--- |
| Build FSBL, App, Web or WakeCore | ARM GNU Toolchain, GNU Make, Python 3, Node.js, pnpm | Modifying or building source |
| Sign firmware | STM32 SigningTool CLI, supplied with STM32CubeCLT | Creating deployable FSBL or App output |
| Flash through ST-LINK | STM32CubeProgrammer CLI | Running `make flash*` |
| Regenerate Model | ST Edge AI Core (`stedgeai`) and `STEDGEAI_CORE_DIR` | Modifying or recompiling a model |

`stedgeai` is not required to build App or Web. It is also unnecessary when using the precompiled models in the repository `bin/` directory.

### ARM GCC, Make and base build tools

On Windows, [STM32CubeCLT](https://www.st.com/stm32cubeclt) is recommended. Its default ARM GCC directory is:

```text
C:\ST\STM32CubeCLT\GNU-tools-for-STM32\bin
```

On Ubuntu or Debian:

```bash
sudo apt update
sudo apt install gcc-arm-none-eabi make build-essential
```

On macOS:

```bash
brew install --cask gcc-arm-embedded
xcode-select --install
```

Web builds also require Node.js and pnpm:

```bash
npm install -g pnpm
```

### SigningTool and STM32CubeProgrammer

- Install [STM32CubeCLT](https://www.st.com/stm32cubeclt) for `STM32_SigningTool_CLI`. Do not assume it is installed if CubeProgrammer cannot find it.
- Install [STM32CubeProgrammer](https://www.st.com/stm32cubeprog) for `STM32_Programmer_CLI`. NE302 SETUP.md specifies version `2.19.0` or later.
- The default CubeProgrammer `bin` directory on Windows is:

```text
C:\Program Files\STMicroelectronics\STM32Cube\STM32CubeProgrammer\bin
```

Add the relevant directories to `PATH`, then run the checks in section 5.

### ST Edge AI Core

To regenerate a model, install [ST Edge AI Core](https://www.st.com/en/development-tools/stedgeai-core.html#get-software) and set `STEDGEAI_CORE_DIR`. Replace `<version>` with the installed version:

```bash
# Linux
export STEDGEAI_CORE_DIR="$HOME/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-AI/<version>"
export PATH="$STEDGEAI_CORE_DIR/Utilities/linux:$PATH"

# macOS
export STEDGEAI_CORE_DIR="$HOME/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-AI/<version>"
export PATH="$STEDGEAI_CORE_DIR/Utilities/mac:$PATH"
```

On Windows, add the `stedgeai` directory to the system environment and set `STEDGEAI_CORE_DIR` to the matching X-CUBE-AI installation directory. The ST Edge AI variant must match the `STEDGEAI_VARIANT` used for the firmware and model build.

## 4. Configure `.make.env`

The setup script generates `.make.env` at the project root. Set `GCC_PATH` for the local toolchain; set `STEDGEAI_CORE_DIR` only when regenerating a model. For example:

```makefile
GCC_PATH = /path/to/arm-gnu-toolchain/bin
MAKEFLAGS += -j8
export STEDGEAI_CORE_DIR=/path/to/STEdgeAI
```

You can also pass a GCC path for one build:

```bash
make GCC_PATH=/path/to/toolchain/bin
```

Do not copy Flash addresses from another project into `.make.env`; the NE302 root Makefile manages flashing commands and addresses.

## 5. Verify the local environment

Run the repository check for your operating system:

```bash
# Linux / macOS / Git Bash
./check_env.sh

# Windows Command Prompt
check_env.bat
```

The basic build environment is ready when the script ends with one of these results:

```text
# Linux / macOS / Git Bash
Result: Essential tools complete! ✓

# Windows
Result: Essential tools complete! [OK]
```

That result confirms that these base tool checks have passed:

```text
ARM GCC Compiler
GNU Make
Python 3
Node.js
pnpm
```

If the output is `Result: <number> essential tool(s) missing`, install the missing tools and rerun the check script for your operating system.

Before building FSBL, App, or WakeCore, also confirm that `ARM Objcopy` shows `[OK]`. The Linux/macOS script lists this tool but does not include it in the `Essential tools complete` missing count.

Use the following extra checks for task-specific work:

| Planned operation | Entries that must also show `[OK]` |
| :--- | :--- |
| Create signed FSBL or App firmware | `STM32 Signing Tool` |
| Flash existing build output through ST-LINK | `STM32 Programmer` |
| Regenerate a model | `ST Edge AI`, `STEDGEAI_CORE_DIR` |

`Note: <number> optional tool(s) missing` means basic builds are available, but the operation that needs the missing tool is not.

## 6. Check the build without flashing

```bash
make info
make -n
```

Successful `make info` output includes `NE302 Version Information`, with FSBL, APP, WEB, MODEL and WAKECORE versions and the active `STEdgeAI` variant. `make -n` only prints the build commands that would run; it does not build or flash the device.

When both commands finish without an error, continue to [Build, Flash and Update](./1-build-and-flash.md).

## 7. Common setup issues

| Symptom | Check first |
| :--- | :--- |
| `arm-none-eabi-gcc` is not found | Confirm ARM GCC is installed and its `bin` directory is in `PATH` or `GCC_PATH` |
| `make` is not found | Use Git Bash or install Make on Windows; install Command Line Tools on macOS |
| `STM32_Programmer_CLI` is not found | Confirm CubeProgrammer is installed and its `bin` directory is in `PATH` |
| `stedgeai` or `STEDGEAI_CORE_DIR` is unavailable | Only needed to regenerate models; confirm the installation path, PATH and environment variable point to the same version |

After correcting an issue, rerun the applicable `./check_env.sh` or `check_env.bat` check before continuing.
