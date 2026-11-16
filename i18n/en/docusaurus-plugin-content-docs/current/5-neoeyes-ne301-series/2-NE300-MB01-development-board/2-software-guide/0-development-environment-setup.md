---
description: Setup guide for NE301 development environment. Learn how to configure Docker (recommended) or manually install ARM GCC, STM32 tools, and AI toolchains.
keywords: [NE301 Development, Environment Setup, Docker Container, ARM GCC, STM32CubeProgrammer, ST Edge AI, GitHub Repository, Toolchain Installation]
tags: [NE301, Development Environment, Docker, STM32N6, Toolchain]
---

##  Quick Start
###  Clone NE301 Repository

```bash
git clone https://github.com/camthink-ai/ne301.git
cd ne301
```
### Development Environment Setup

####  Method 1: Docker (Recommended)

**Prerequisites:** Docker 20.10+  Disk Space > 10GB+

```bash
# 1. Build (Or pull)Docker image
docker build -t ne301-dev:latest .

# or pull (faster)
docker pull camthink/ne301-dev:latest

# 2. Run container
docker run -it --rm --privileged \
  -v $(pwd):/workspace \
  -v /dev/bus/usb:/dev/bus/usb \
  camthink/ne301-dev:latest

# 3. Inside container
make                        # Build all
```

#### Method 2: Manual Installation

**Prerequisites:**
- ARM GCC 13.3+
- GNU Make 3.81+
- Python 3.8+
- Node.js 20+
- pnpm 9+
- STM32CubeProgrammer(v2.19.0)
- STM32_SigningTool_CLI(v2.19.0)
- stedgeai (v2.2 / v3.0 / v4.0, must match `STEDGEAI_VARIANT`)

```bash
# 1. Check environment
./check_env.sh

# 2. Install as prompted
./setup.sh                  # Linux/macOS
setup.bat                   # Windows

# 3. Verify
./check_env.sh
# success output：
  =========================================
  NE301 Required Tools Check
  =========================================

  Essential Tools:
  ----------------
  [OK] ARM GCC Compiler
  arm-none-eabi-gcc.exe (GNU Tools for STM32 13.3.rel1.20240926-1715) 13.3.1 20240614
  [OK] ARM Objcopy
  GNU objcopy (GNU Tools for STM32 13.3.rel1.20240926-1715) 2.42.0.20240614
  [OK] GNU Make
  GNU Make 4.2.1

  Build Tools:
  ------------
  [OK] Python 3
  Python 3.11.3
  [OK] Node.js
  v22.17.0
  [OK] pnpm
  10.16.1

  STM32 Tools:
  ------------
  [OK] STM32 Programmer
  -------------
  [OK] STM32 Signing Tool
        -------------------------------------------------------------------

  AI Model Tools:
  ---------------
  [OK] ST Edge AI
  ST Edge AI Core v2.2.0-20266 2adc00962
  [OK] STEDGEAI_CORE_DIR = H:\stm32\STEdgeAI\2.2

  =========================================
  Result: Essential tools complete! ✓

  You can now run:
    make              # Build firmware
    make web          # Build web
    make model        # Build AI model
    make flash        # Flash to device
  =========================================
```
If every tool reports **[OK]**, you're ready to build for NE301 🎉
