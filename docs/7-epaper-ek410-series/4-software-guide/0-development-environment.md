---
id: ek410-development-environment
title: Development Environment
sidebar_position: 0
description: EK410 固件开发环境搭建、编译烧录、Web 控制台资源嵌入、工具链与版本管理约定。
keywords: [EK410, ESP-IDF, 编译, 烧录, 固件开发]
tags: [EK410, 软件指南, 开发]
---

# Development Environment

本页说明如何搭建 EK410 固件（ESP32-C61）的开发环境并完成编译、烧录，以及 Web 控制台资源与版本号的管理约定。

固件源码：[https://github.com/camthink-ai/EK410](https://github.com/camthink-ai/EK410)

```bash
git clone https://github.com/camthink-ai/EK410.git
cd EK410
```

## 环境要求

| 项目 | 要求 |
| :--- | :--- |
| ESP-IDF | 5.5.x（组件声明 `>=5.3.0`） |
| 目标芯片 | `esp32c61` |
| Python | 3.11（IDF 虚拟环境） |
| 驱动 | CH340 USB-UART |

## 编译与烧录

首次编译前执行 `set-target`：

```bash
export IDF_PATH=~/esp/esp-idf-5.5
export IDF_PYTHON_ENV_PATH=~/.espressif/python_env/idf5.5_py3.11_env
export PATH="$HOME/.espressif/tools/riscv32-esp-elf/esp-14.2.0_20260121/riscv32-esp-elf/bin:$IDF_PYTHON_ENV_PATH/bin:$PATH"

cd /path/to/EK410
python3 "$IDF_PATH/tools/idf.py" set-target esp32c61   # 首次
python3 "$IDF_PATH/tools/idf.py" build
python3 "$IDF_PATH/tools/idf.py" -p PORT flash monitor
```

- `sdkconfig` 不入库（gitignored），工程配置以 `sdkconfig.defaults` 为准；改动默认配置请修改 `sdkconfig.defaults` 并重新生成。
- 烧录分区表为仓库根目录 `partitions.csv`（双 4MB OTA 分区 + 1MB 帧快照分区）。

## Web 控制台资源

SoftAP Web 控制台是单文件 SPA：源文件为 `main/www/index.html`（含内嵌的 i18n 词典与六色量化脚本），修改后需要重新嵌入固件：

```bash
python3 tools/gen_www.py   # 生成 main/www_html.h
```

UI 设计基线（视觉 Token、页面信息架构、量化算法）见仓库 `docs/design/ui-preview/DESIGN.md`。

## 版本管理

固件版本遵循语义化版本（SemVer），由以下文件共同维护：

| 文件 | 作用 |
| :--- | :--- |
| `VERSION` | 权威版本号 `X.Y.Z` |
| `main/version.h` | 固件内嵌版本宏 |
| `CHANGELOG.md` | 发布说明 |
| `tools/bump_version.py` | 三者同步与校验 |

```bash
python3 tools/bump_version.py --show
python3 tools/bump_version.py --check
python3 tools/bump_version.py 1.3.10
# 编辑 CHANGELOG.md 并提交后：
git tag -a v1.3.10 -m "EK410 v1.3.10"
```

发布镜像也可：

```bash
bash tools/build_release.sh        # fullclean + build → dist/ek410.bin
bash tools/flash_release.sh PORT   # 烧 bootloader + 分区表 + 双槽同镜像
```

约定：

- **MAJOR**：破坏 MQTT / HTTP 协议或面板协议；**MINOR**：向后兼容的新功能；**PATCH**：修复。
- Git tag 格式 `vX.Y.Z`。
- 不要轻易修改 `deviceId` 生成逻辑——它是设备的 NeoMind 身份标识。

## 工具链

仓库 `tools/` 提供以下辅助脚本：

| 脚本 | 用途 |
| :--- | :--- |
| `gen_www.py` | 将 `main/www/index.html` 嵌入为 `main/www_html.h` |
| `bump_version.py` | `VERSION` ↔ `main/version.h` 同步 |
| `build_release.sh` / `flash_release.sh` | 发布构建与烧录 |
| `run_host_tests.py` | 主机回归（无需设备 / IDF；`build_release.sh` 会先跑） |
| `fix_verification.py` | 真机 HTTP 核对本版修复（相对上一版应失败的用例）；可用 `--verify-url` / `--firmware` / `--power` |
| `frame_convert.py` | 任意图片 → 960000 字节 4bpp 原生帧（真实 CS0/CS1 + 90° 布局） |
| `gen_font.py` / `gen_font_hz.py` | 生成 ASCII / CJK 字库头文件（CJK 使用 Noto Sans CJK SC） |
| `gen_splash_logo.py` | 品牌 PNG → 开机 splash 头文件 |
| `qa_gate.py` | 单镜像 QA 门禁（`smoke` / `candidate` / `soak`；绑定 `fwVersion`）；改 broker / 下行需 `--mqtt-password` |
| `stability_stress.py` | 串口 / HTTP 长稳压测 |
| `gpio_scan/` | 引脚排查用的独立 IDF 工程 |

```bash
python3 tools/run_host_tests.py
python3 tools/qa_gate.py --tier smoke --port PORT --host IP
python3 tools/qa_gate.py --tier candidate --port PORT --host IP \
  --mqtt-password '…' --verify-url 'https://…/image.jpg'
```

发版前建议至少跑通 `candidate`；72 h 用 `--tier soak`。说明见仓内 `docs/qa_automation.md`。

## 相关资料

- [HTTP API 参考](./1-http-api.md)：设备对外接口。
- [MQTT 协议](./2-mqtt-protocol.md)：平台对接协议。
- [OTA 固件升级](../2-user-guide/3-system-maintenance.md)：现场升级机制。
