---
id: ne302-development-environment
title: Environment setup
sidebar_position: 0
description: 说明如何在构建或烧录固件前，为 NE302 源码准备、配置并验证工具链、环境变量和构建环境。
keywords: [NE302, 环境配置, ARM GCC, STM32CubeProgrammer, STM32CubeCLT, ST Edge AI, pnpm]
tags: [NE302, 软件指南, 工具链, 构建]
---

# Environment setup

本页说明如何准备 NE302 源码开发环境。命令和工具以仓库 [SETUP.md](https://github.com/camthink-ai/ne302/blob/main/SETUP.md) 为准；完成本页后再进入[构建、烧录与更新](./1-build-and-flash.md)。

## 1. Docker（推荐）

NE302 与 NE301 复用同一开发平台。默认 `STEDGEAI_VARIANT=4.0` 时，使用 NE301 的 [`camthink/ne301-dev:v4.0`](https://hub.docker.com/r/camthink/ne301-dev) Docker 镜像。若构建 `2.2` 或 `3.0` 变体的模型，必须改用对应标签；固件、模型包和工具链必须使用同一变体。镜像将交叉编译工具链和构建依赖隔离在容器中，避免先在主机安装 ARM GCC、Node.js、pnpm 和 ST 工具。

| `STEDGEAI_VARIANT` | Docker 镜像 |
| :--- | :--- |
| `2.2` | `camthink/ne301-dev:v2.2` |
| `3.0` | `camthink/ne301-dev:v3.0` |
| `4.0`（默认） | `camthink/ne301-dev:v4.0` |

先确认 Docker 可用、克隆 NE302 源码并拉取镜像：

```bash
docker version
git clone https://github.com/camthink-ai/ne302.git
cd ne302
docker pull camthink/ne301-dev:v4.0
```

启动容器后，源码目录会挂载到容器内的 `/workspace`：

```bash
# 构建，不包含烧录设备所需的 USB 透传
docker run -it --rm \
  -v "$PWD":/workspace \
  -w /workspace \
  camthink/ne301-dev:v4.0

# 仅在 Linux 上通过 ST-LINK 烧录时，改用 USB 透传
docker run -it --rm --privileged \
  -v "$PWD":/workspace \
  -v /dev/bus/usb:/dev/bus/usb \
  -w /workspace \
  camthink/ne301-dev:v4.0
```

进入容器后，使用 NE302 自己的检查与只读构建验证：

```bash
./check_env.sh
make info
make -n
```

当 `./check_env.sh` 显示 `Result: Essential tools complete! ✓`，且 `make info`、`make -n` 无报错时，Docker 环境已可用于后续构建。烧录命令见[构建、烧录与更新](./1-build-and-flash.md)。

## 2. 本机构建环境（备选）

仅在 Docker 不可用，或需要在主机直接运行工具时使用本节。克隆源码后，先运行检查脚本，确认本机缺少哪些工具：

```bash
git clone https://github.com/camthink-ai/ne302.git
cd ne302
./check_env.sh
```

建议先运行与操作系统对应的安装和检查脚本：

```bash
# Linux / macOS / Git Bash
./setup.sh
./check_env.sh

# Windows
setup.bat
check_env.bat
```

安装脚本会在项目根目录生成 `.make.env`。脚本执行完并不代表所有任务都已可用；请以第 5 节的检查结果判断能否构建、烧录或重新生成模型。

## 3. 按任务安装工具

| 任务 | 必需工具 | 何时需要 |
| :--- | :--- | :--- |
| 构建 FSBL、App、Web 或 WakeCore | ARM GNU Toolchain、GNU Make、Python 3、Node.js、pnpm | 修改或构建源码 |
| 签名固件 | STM32 SigningTool CLI（随 STM32CubeCLT 提供） | 构建 FSBL 或 App 的可部署产物 |
| 通过 ST-LINK 烧录 | STM32CubeProgrammer CLI | 执行 `make flash*` |
| 重新生成 Model | ST Edge AI Core（`stedgeai`）及 `STEDGEAI_CORE_DIR` | 修改或重新编译模型 |

`stedgeai` 不是构建 App 或 Web 的前提；只使用仓库 `bin/` 中预编译模型时，也不需要安装它。

### ARM GCC、Make 和基础构建工具

Windows 推荐安装 [STM32CubeCLT](https://www.st.com/stm32cubeclt)，其默认 ARM GCC 目录为：

```text
C:\ST\STM32CubeCLT\GNU-tools-for-STM32\bin
```

Linux（Ubuntu/Debian）可安装：

```bash
sudo apt update
sudo apt install gcc-arm-none-eabi make build-essential
```

macOS 可安装 ARM GCC，并安装 Command Line Tools：

```bash
brew install --cask gcc-arm-embedded
xcode-select --install
```

Web 构建还需要 Node.js 与 pnpm：

```bash
npm install -g pnpm
```

### SigningTool 和 STM32CubeProgrammer

- 从 [STM32CubeCLT](https://www.st.com/stm32cubeclt) 获取 `STM32_SigningTool_CLI`；若 CubeProgrammer 中没有该工具，不要假设已安装。
- 从 [STM32CubeProgrammer](https://www.st.com/stm32cubeprog) 获取 `STM32_Programmer_CLI`。NE302 的 SETUP.md 要求版本 `2.19.0` 或更高。
- Windows 的 CubeProgrammer 默认 `bin` 目录为：

```text
C:\Program Files\STMicroelectronics\STM32Cube\STM32CubeProgrammer\bin
```

安装后将对应目录加入 `PATH`，然后执行第 5 节的验证命令。

### ST Edge AI Core

重新生成模型时，安装 [ST Edge AI Core](https://www.st.com/en/development-tools/stedgeai-core.html#get-software)，并设置 `STEDGEAI_CORE_DIR`。安装目录以下示例中的 `<version>` 为实际版本号：

```bash
# Linux
export STEDGEAI_CORE_DIR="$HOME/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-AI/<version>"
export PATH="$STEDGEAI_CORE_DIR/Utilities/linux:$PATH"

# macOS
export STEDGEAI_CORE_DIR="$HOME/STM32Cube/Repository/Packs/STMicroelectronics/X-CUBE-AI/<version>"
export PATH="$STEDGEAI_CORE_DIR/Utilities/mac:$PATH"
```

Windows 将 `stedgeai` 所在目录加入系统环境变量，并设置 `STEDGEAI_CORE_DIR` 为对应的 X-CUBE-AI 安装目录。使用的 ST Edge AI 变体必须与后续固件和模型构建的 `STEDGEAI_VARIANT` 一致。

## 4. 配置 `.make.env`

安装脚本会在项目根目录生成 `.make.env`。打开该文件，将本机工具路径填入 `GCC_PATH`；只有需要重新生成模型时才设置 `STEDGEAI_CORE_DIR`。例如：

```makefile
GCC_PATH = /path/to/arm-gnu-toolchain/bin
MAKEFLAGS += -j8
export STEDGEAI_CORE_DIR=/path/to/STEdgeAI
```

也可以只为一次构建临时指定 GCC 路径：

```bash
make GCC_PATH=/path/to/toolchain/bin
```

不要把其他工程的 Flash 地址复制到 `.make.env`；烧录命令和地址由 NE302 根目录的 Makefile 管理。

## 5. 验证本机环境

运行与系统对应的仓库检查脚本：

```bash
# Linux / macOS / Git Bash
./check_env.sh

# Windows Command Prompt
check_env.bat
```

基础构建环境准备完成后，输出末尾会出现以下任一结果：

```text
# Linux / macOS / Git Bash
Result: Essential tools complete! ✓

# Windows
Result: Essential tools complete! [OK]
```

这表示以下基础工具已通过检查：

```text
ARM GCC Compiler
GNU Make
Python 3
Node.js
pnpm
```

如果看到 `Result: <number> essential tool(s) missing`，请安装提示中缺失的工具，再重新执行对应系统的检查脚本。

构建 FSBL、App 或 WakeCore 前，还要确认 `ARM Objcopy` 显示 `[OK]`。Linux/macOS 脚本会列出该项，但不会把它计入 `Essential tools complete` 的缺失计数。

下面的项目按任务要求判断：

| 准备进行的操作 | 还必须显示 `[OK]` 的项目 |
| :--- | :--- |
| 生成签名的 FSBL 或 App 固件 | `STM32 Signing Tool` |
| 通过 ST-LINK 烧录已有构建产物 | `STM32 Programmer` |
| 重新生成模型 | `ST Edge AI`、`STEDGEAI_CORE_DIR` |

`Note: <number> optional tool(s) missing` 表示可以进行基础构建，但不能执行依赖缺失工具的操作。

## 6. 不烧录时检查构建

```bash
make info
make -n
```

`make info` 成功时会输出 `NE302 Version Information`，其中包含 FSBL、APP、WEB、MODEL、WAKECORE 版本和当前 `STEdgeAI` 变体。`make -n` 只显示将执行的构建命令，不会编译，也不会烧录设备。

两条命令均无报错后，即可开始构建。构建、打包和烧录命令见[构建、烧录与更新](./1-build-and-flash.md)。

## 7. 常见环境问题

| 现象 | 先检查 |
| :--- | :--- |
| `arm-none-eabi-gcc` 找不到 | ARM GCC 是否已安装；其 `bin` 目录是否在 `PATH` 或 `GCC_PATH` 中 |
| `make` 找不到 | Windows 使用 Git Bash 或安装 Make；macOS 安装 Command Line Tools |
| `STM32_Programmer_CLI` 找不到 | CubeProgrammer 是否已安装；其 `bin` 目录是否已加入 `PATH` |
| `stedgeai` 或 `STEDGEAI_CORE_DIR` 不可用 | 仅在重新生成模型时需要；核对安装目录、PATH 和环境变量是否指向同一版本 |

修正后重新运行与系统对应的 `./check_env.sh` 或 `check_env.bat`，再继续后续操作。
