---
description: NE503 系统镜像烧录与升级操作指南，涵盖 UART 恢复、SPI Flash 引导链、eMMC 系统烧录和 TFTP 升级。
keywords: [NE503, 烧录, 系统镜像, Hailo-15, eMMC, TFTP, U-Boot]
tags: [平台开发, NE503, 烧录, 系统部署]
---

# System Flashing

NE503 整机软件分为两层：

| 层级   | 名称          | 内容                 | 更新方式                                              |
| ---- | ----------- | ------------------ | ------------------------------------------------- |
| 系统镜像 | hailo-os    | Linux 内核、设备树、根文件系统 | 烧录/升级（本文档）                                        |
| 平台软件 | hailo-ne503 | 平台服务、HAL、Web 控制台   | [Software Deployment](./3-software-deployment.md) |

本文档说明系统镜像的首次烧录和后续升级。平台软件的构建和部署请参阅 [Software Deployment](./3-software-deployment.md)。

## 流程概览

根据设备当前状态选择路径：

- **首次部署 / 全量烧录**（全新板或引导损坏）：[§1 准备](#1-准备工作) → [§2 烧引导链](#2-烧录引导链) → [§3 烧系统镜像](#3-烧录系统镜像) → [§4 登录](#4-系统登录) → [§6 验证](#6-验证)
- **仅升级系统镜像**（设备已能正常启动）：[§1.3 TFTP](#13-tftp-服务器) → [§5.1 升级](#51-通过-u-boot-tftp-升级) → [§6 验证](#6-验证)

> **何时跳过 §2：** 设备能进入 U-Boot 菜单或已能正常启动到 Linux，说明引导链完好，直接做 §3 或 §5。只有引导损坏（上电无 U-Boot 输出）或全新板才需要 §2。

## 1. 准备工作

### 1.1 固件包

从 [CamThink 技术支持](mailto:support@camthink.ai) 获取固件包，解压后包含以下文件。按用途分为两组：

**引导链组件（[§2](#2-烧录引导链) 使用，共 9 个）**

| 文件                             | 用途             |
| ------------------------------ | -------------- |
| `hailo15_uart_recovery_fw.bin` | UART 恢复固件      |
| `hailo15_scu_bl.bin`           | SCU 引导加载器      |
| `scu_bl_cfg_a.bin`             | SCU 引导配置       |
| `hailo15_scu_fw.bin`           | SCU 固件         |
| `u-boot.dtb.signed`            | U-Boot 设备树（签名） |
| `u-boot-spl.bin`               | U-Boot SPL     |
| `u-boot-initial-env`           | U-Boot 初始环境变量  |
| `customer_certificate.bin`     | 客户证书           |
| `u-boot-tfa.itb`               | U-Boot TF-A 镜像 |

**系统镜像（[§3](#3-烧录系统镜像) / [§5](#5-系统升级) 使用，共 3 个）**

| 文件                                     | 用途           |
| -------------------------------------- | ------------ |
| `fitImage`                             | Linux 内核镜像   |
| `swupdate-image-hailo15-ne503.ext4.gz` | 系统根文件系统      |
| `hailo-update-image-hailo15-ne503.swu` | SWUpdate 升级包 |

### 1.2 主机工具

> 仅 [§2 烧录引导链](#2-烧录引导链) 需要；只做 §3/§5 系统镜像烧录或升级的可跳过本节。

§2 引导链烧录支持 **Ubuntu** 和 **macOS**（验证的 `hailo15_board_tools` 版本 1.9.0）。`hailo15_board_tools` 是跨平台 Python wheel，两个平台的差异只在依赖安装方式和串口设备节点。

> **关键依赖 `mkenvimage`：** §2.3 的 `hailo15_spi_flash_program` 会调用 `mkenvimage` 生成 U-Boot env 镜像。若主机未安装，烧录会在写入第 5 个组件（U-Boot env）时崩溃，**留下半写的引导链**。两个平台都必须先装好——Ubuntu 由 `apt-get install u-boot-tools` 提供，macOS 由 `brew install u-boot-tools` 提供。

#### Ubuntu

```bash
# Hailo 烧录工具（将 <VERSION> 替换为实际版本号，当前验证版本 1.9.0）
pip install hailo15_board_tools-<VERSION>.whl

# U-Boot 辅助工具（提供 mkenvimage，§2.3 必需）
sudo apt-get update && sudo apt-get install u-boot-tools
```

![安装 Hailo 烧录工具](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-01-pip-install.png)

![安装 U-Boot 工具](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-02-u-boot-tools.png)

![U-Boot 工具安装完成](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-03-install-done.png)

#### macOS

```bash
# 1. mkenvimage（§2.3 必需，否则烧录中途崩溃）
brew install u-boot-tools

# 2. 在 venv 中安装 wheel（Homebrew Python 受 PEP 668 限制，不能直接 pip install）
python3 -m venv hailo-venv
./hailo-venv/bin/pip install hailo15_board_tools-<VERSION>.whl
# 之后用 ./hailo-venv/bin/uart_boot_fw_loader 与 ./hailo-venv/bin/hailo15_spi_flash_program
```

> **串口设备节点：** Ubuntu 一般为 `/dev/ttyACM0`；macOS 一般为 `/dev/cu.usbserial-*` 或 `/dev/tty.usbserial-*`。传入 `--serial-device-name` 时用本机实际节点（确认方法见 [§1.4 硬件连接](#14-硬件连接)）。

### 1.3 TFTP 服务器

> [§3 烧录系统镜像](#3-烧录系统镜像) / [§5 系统升级](#5-系统升级) 需要；只做 §2 引导链烧录的可跳过本节。

系统镜像较大（100MB+），通过 TFTP 网络协议传输到设备。

#### Ubuntu

```bash
# 安装 TFTP 服务端
sudo apt install tftpd-hpa

# 编辑配置
sudo nano /etc/default/tftpd-hpa
```

配置内容：

```text
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/var/lib/tftpboot"
TFTP_ADDRESS="0.0.0.0:69"
TFTP_OPTIONS="--secure"
```

启动服务并部署镜像文件：

```bash
sudo mkdir -p /var/lib/tftpboot
sudo chmod -R 777 /var/lib/tftpboot
sudo systemctl restart tftpd-hpa

# 将固件文件拷贝到 TFTP 目录
cp fitImage swupdate-image-hailo15-ne503.ext4.gz hailo-update-image-hailo15-ne503.swu /var/lib/tftpboot/
```

#### macOS

macOS 自带 `tftpd`，通过 launchd 按需启动：

```bash
# 创建固件目录
mkdir -p ~/Downloads/Firmware
chmod 777 ~/Downloads/Firmware

# 写入 launchd 配置
sudo tee /Library/LaunchDaemons/com.tftp.local.plist > /dev/null << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tftp.local</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/libexec/tftpd</string>
        <string>-i</string>
        <string>/Users/<USER>/Downloads/Firmware</string>
    </array>
    <key>inetdCompatibility</key>
    <dict>
        <key>Wait</key>
        <true/>
    </dict>
    <key>InitGroups</key>
    <true/>
    <key>Sockets</key>
    <dict>
        <key>Listeners</key>
        <dict>
            <key>SockServiceName</key>
            <string>tftp</string>
            <key>SockType</key>
            <string>dgram</string>
        </dict>
    </dict>
</dict>
</plist>
EOF

# 启动服务
sudo launchctl load -w /Library/LaunchDaemons/com.tftp.local.plist

# 验证
sudo lsof -i :69
```

> 将 `<USER>` 替换为你的 macOS 用户名。将固件文件放入 `~/Downloads/Firmware/` 目录。
> 如果 TFTP 报 "Operation not permitted"，在 **系统设置 → 隐私与安全性 → 完全磁盘访问权限** 中添加 `/usr/libexec/tftpd`，或改用 `/private/tftpboot` 作为 TFTP 目录。

### 1.4 硬件连接

1. 使用 USB 转串口线连接 NE503 调试串口和主机

> NE503 调试串口为 **1.8V** 电平，需使用 1.8V 兼容的 USB 转串口线（常见 3.3V 串口线可能无法正常通信）。建议从 [CamThink](mailto:support@camthink.ai) 获取配套串口小板。

2. 使用网线连接 NE503 网口和主机（直连或同一交换机）

CamThink 串口小板：

![CamThink 串口小板](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-04-serial-board.png)

接入 NE503 主板：

![NE503 主板串口连接](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-05-board-connection.png)

3. 确认串口设备节点：

```bash
ls /dev/serial/by-id/* -lh
# 输出示例：usb-1a86_USB_Serial_5B1E071587-if00 -> ../../ttyACM0
```

![查询串口设备节点](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-06-device-node.png)

> 下文以 `/dev/ttyACM0` 为例，请根据实际设备节点修改。macOS 下设备节点通常为 `/dev/tty.usbmodem*` 或 `/dev/tty.usbserial*`。

打开串口终端（波特率 **115200**），后续烧录日志、U-Boot 菜单交互与系统登录均在此终端中完成：

```bash
# Ubuntu（也可使用 minicom）
screen /dev/ttyACM0 115200

# macOS
screen /dev/tty.usbmodem* 115200
```

> Windows 可使用 SecureCRT 或 PuTTY，波特率同为 115200。退出 screen：依次按 `Ctrl+A`、`K`、`Y`。

#### 拨码开关模式

NE503 通过两个拨码开关（BOOT0、BOOT1）选择上电后的行为。后文涉及拨码操作时只标注模式名，对照此表即可：

| 模式                | BOOT0 | BOOT1 | 何时使用                         |
| ----------------- | ----- | ----- | ---------------------------- |
| UART 恢复（烧引导链）     | OFF   | ON    | 仅 [§2 烧录引导链](#2-烧录引导链)       |
| 正常启动              | OFF   | OFF   | [§3 烧录系统镜像](#3-烧录系统镜像) 及以后、日常运行 |

## 2. 烧录引导链

引导链烧录仅在首次部署或引导损坏时需要。正常使用中跳过此步骤。

### 2.1 进入 UART 恢复模式

将拨码开关拨到 **UART 恢复模式**（BOOT0 OFF、BOOT1 ON，见 [§1.4 拨码开关模式](#拨码开关模式)）：

![拨码开关烧录模式](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-07-dip-switch.png)

操作步骤：

1. 拨到 UART 恢复模式（BOOT0 OFF、BOOT1 ON）
2. 通过 PoE（RJ45 网口）为设备上电
3. 按下 **Reset** 复位键，进入烧录等待状态

![Reset 复位键](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-08-reset-button.png)

### 2.2 加载 UART 恢复固件

```bash
uart_boot_fw_loader \
  --serial-device-name /dev/ttyACM0 \
  --firmware ./hailo15_uart_recovery_fw.bin
```

![UART 恢复固件加载](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-09-uart-boot.png)

### 2.3 烧录 SPI Flash 引导组件

此步骤将引导链各组件写入 SPI Flash，包括 SCU 固件、U-Boot SPL、设备树等：

```bash
hailo15_spi_flash_program \
  --scu-bootloader ./hailo15_scu_bl.bin \
  --scu-bootloader-config ./scu_bl_cfg_a.bin \
  --scu-firmware ./hailo15_scu_fw.bin \
  --uboot-device-tree ./u-boot.dtb.signed \
  --bootloader ./u-boot-spl.bin \
  --bootloader-env ./u-boot-initial-env \
  --customer-certificate ./customer_certificate.bin \
  --uboot-tfa ./u-boot-tfa.itb \
  --uart-load \
  --serial-device-name /dev/ttyACM0
```

预期输出：

```plaintext
UART recovery load firmware and script version: 1.4
flash detected, flash jedec_id: 0x9d701700
Programming SCU firmware file: ./hailo15_scu_fw.bin...
Erasing flash from 0x8000 B to 0x39350 B...
Erased successfully
Storage program validation passed successfully
Provided file ./hailo15_scu_fw.bin was successfully programmed
Programming SCU bootloader file: ./hailo15_scu_bl.bin...
Erasing flash from 0x0 B to 0x2c74 B...
Erased successfully
Storage program validation passed successfully
Provided file ./hailo15_scu_bl.bin was successfully programmed
Programming SCU bootloader config file...
Erasing flash from 0x5000 B to 0x502c B...
Erased successfully
Storage program validation passed successfully
Provided file ./scu_bl_cfg_a.bin was successfully programmed
Programming U-Boot SPL file: ./u-boot-spl.bin...
Erasing flash from 0x54000 B to 0x76a2c B...
Erased successfully
Storage program validation passed successfully
Provided file ./u-boot-spl.bin was successfully programmed
Programming U-Boot env file: ./u-boot-initial-env...
Erasing flash from 0x50000 B to 0x54000 B...
Erased successfully
Storage program validation passed successfully
Provided file ./u-boot-initial-env was successfully programmed
Programming Customer certificate file: ./customer_certificate.bin...
Erasing flash from 0x4f000 B to 0x4fa14 B...
Erased successfully
Storage program validation passed successfully
Provided file ./customer_certificate.bin was successfully programmed
Programming u-boot device-tree file: ./u-boot.dtb.signed...
Erasing flash from 0x40000 B to 0x46d84 B...
Erased successfully
Storage program validation passed successfully
Provided file ./u-boot.dtb.signed was successfully programmed
Programming U-Boot & TF-A file: ./u-boot-tfa.itb...
Erasing flash from 0x80000 B to 0x103e80 B...
Erased successfully
Storage program validation passed successfully
Provided file ./u-boot-tfa.itb was successfully programmed
```

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-11-spi-flash-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-12-spi-flash-3.png" style={{width: '50%'}} />
</div>

> 以上为典型输出。不同工具版本的实际输出可能存在大小写或拼写差异（如 `Storage program validatation`），且 SCU 引导配置可能写入两次（A/B 冗余槽位）。**以每个组件最终打印 `successfully programmed`、进程退出码 0 为成功判据**；共 8 个组件应全部编程成功。

烧录完成后，引导链已写入 SPI Flash。将拨码开关恢复为正常模式：

- **BOOT0:** OFF
- **BOOT1:** OFF

![拨码开关正常模式](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-18-dip-normal.png)

## 3. 烧录系统镜像

引导链就绪后，通过 U-Boot 菜单将系统镜像写入 eMMC。

### 3.1 进入 U-Boot 菜单

确认拨码开关处于 **正常模式**（BOOT0 OFF、BOOT1 OFF，见 [§1.4 拨码开关模式](#拨码开关模式)；若刚做完 §2，拨码已恢复为正常模式）。通过 RJ45 端口接入 PoE 上电，板载绿色指示灯闪烁。

![PoE 上电](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-19-poe-power.png)

设备上电后，在串口终端中按 `↑`/`↓` 键停止自动启动，进入 U-Boot 菜单：

![U-Boot 启动菜单](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-21-emmc-init-1.png)

U-Boot 提供以下启动模式：

| 模式                 | 说明                     |
| ------------------ | ---------------------- |
| Autodetect         | 自动检测并启动（已装系统的设备）       |
| Boot from eMMC     | 从 eMMC 启动              |
| eMMC Board Init    | **首次烧录推荐**：烧录单系统到 eMMC |
| eMMC AB Board Init | 烧录冗余双系统到 eMMC          |
| U-Boot console     | 进入命令行模式                |

### 3.2 配置网络

U-Boot 默认从 `serverip` 指向的主机拉取镜像——即你在 [§1.3](#13-tftp-服务器) 跑 TFTP 服务的那台：设备 IP 默认 `10.0.0.1`，`serverip` 默认 `10.0.0.2`。烧录前需让**运行 TFTP 的主机**与设备处于同一网段。根据主机所在网段选择以下任一方式。

**方式一（推荐）：主机改为 10.0.0.x 网段。** 直连时给主机网卡配置静态 IP `10.0.0.2`，设备保持默认 `10.0.0.1`，无需进入 U-Boot console：

```bash
# Ubuntu（接口名按实际替换，如 eth0 / enp0s25）
sudo ip addr add 10.0.0.2/24 dev eth0
# macOS：系统设置 → 网络 → 以太网 → 手动配置 IPv4
#   IP 地址 10.0.0.2   子网掩码 255.255.255.0
```

**方式二：主机保持在其他网段，改设备 IP 与主机匹配。** 在 U-Boot 菜单选择 **U-Boot console** 进入命令行，用 `setenv` 修改设备环境变量。下面为默认值（用于确认或重置回默认网络）：

```bash
setenv ipaddr 10.0.0.1            # 设备 IP（默认）
setenv serverip 10.0.0.2          # TFTP 服务器（主机）IP（默认）
saveenv
reset
```

> 若主机在其他网段（如 192.168.93.x），将上面的 `ipaddr` / `serverip` 替换为主机网段的地址：确保设备 `ipaddr` 与主机同网段，`serverip` 为主机 IP。

### 3.3 执行烧录

返回 U-Boot 菜单，选择 **eMMC Board Init**。设备将自动：

1. 通过 TFTP 下载 `fitImage`（内核）到内存
2. 通过 TFTP 下载 `swupdate-image-hailo15-ne503.ext4.gz`（根文件系统）到内存
3. 验证镜像签名（RSA-3072 + SHA-256）
4. 通过 SWUpdate 应用 `.swu` 升级包，将系统写入 eMMC

![eMMC Board Init 烧录（1/2）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-22-emmc-init-2.png)

![eMMC Board Init 烧录完成（2/2）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-23-emmc-init-3.png)

> 三个系统镜像文件的关系：`fitImage`（内核）与 `swupdate-image-hailo15-ne503.ext4.gz`（根文件系统）被打包进 `hailo-update-image-hailo15-ne503.swu`（SWUpdate 升级包）；eMMC Board Init 通过 TFTP 拉取后，由 SWUpdate 校验签名并写入 eMMC。三者都需放在 [§1.3](#13-tftp-服务器) 的 TFTP 目录中。

烧录完成后设备自动重启进入 Linux 系统。

## 4. 系统登录

烧录完成后设备自动重启，通过串口或 SSH 登录系统：

- **用户名：** `root`
- **密码：** `root`

![系统登录](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-24-linux-login.png)

> 登录后的系统检查见 [§6 验证](#6-验证)。

## 5. 系统升级

本节说明系统镜像的升级，通过 SWUpdate 机制使用 `.swu` 升级包完成在线更新。

### 5.1 通过 U-Boot TFTP 升级

系统镜像的完整升级复用 [§3.3](#33-执行烧录) 的同一套流程（U-Boot 菜单 → eMMC Board Init → TFTP → SWUpdate 写入 eMMC），区别只是把 TFTP 目录里的 `.swu` 包换成新版，**无需重做 §2 引导链**。

简要步骤：

1. 在 [§1.3](#13-tftp-服务器) 的 TFTP 目录中用新版 `hailo-update-image-hailo15-ne503.swu` 覆盖旧版
2. 正常模式上电，进入 U-Boot 菜单（按 `↑`/`↓` 停止自动启动），选择 **eMMC Board Init**
3. 设备自动通过 TFTP 下载新 `.swu` 包，由 SWUpdate 写入 eMMC

```plaintext
# 升级过程日志示例
hailo-update-image-h   9% |***                      | 72.1M  0:03:49 ETA
```

> `.swu` 包较大（约 100MB+），100Mbps 网络下整个升级过程约需 5-10 分钟。升级过程中**不要断电或断网**。

### 5.2 运行时固件更新

> 在已启动的 Linux 内通过 SWUpdate 命令行在线升级系统镜像的步骤待工程团队补充。平台软件（ai-runtime、Web 控制台等）的运行时部署见 [Software Deployment](./3-software-deployment.md)。

<!-- TODO: Engineering team to provide runtime swupdate CLI upgrade steps -->

## 6. 验证

烧录或升级完成后，检查以下项目：

```bash
# 1. 内核版本
uname -r
# 5.15.x（yocto-standard）

# 2. 文件系统
df -h /
# /dev/mmcblk1p2  3.6G  3.xG  xxM  xx% /

# 3. Hailo 内核模块（NPU / ISP / 视频通路）
lsmod | grep hailo
# hailo_integrated_nnc / hailo15_isp / hailo15_video_cap ...

# 4. 网络接口
ip addr show eth0

# 5. 平台服务状态（如已部署平台软件）
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api
```

> 设备节点说明：系统镜像存储在 eMMC（`/dev/mmcblk1`），引导链存储在 SPI Flash（`/dev/mtdblock0`）。Hailo NPU 通过内核驱动 `hailo_integrated_nnc` 提供，不一定暴露为 `/dev/hailo*` 设备节点，用 `lsmod | grep hailo` 验证驱动加载即可。

## 7. 故障排查

按烧录流程顺序（§2 引导链 → §3 系统镜像 → §5 升级）列出常见问题，每项遵循「现象 → 原因 → 解决」。

### 7.1 引导链烧录问题

**现象：`uart_boot_fw_loader` 或 `hailo15_spi_flash_program` 无响应 / 报串口错误**

- **原因：** 拨码开关未处于 UART 恢复模式，或串口设备节点不对、串口线非 1.8V 电平。
- **解决：**
  - 确认拨码开关为 BOOT0 OFF、BOOT1 ON（UART 恢复模式，见 [§1.4 拨码开关模式](#拨码开关模式)），并已按过 Reset；
  - 确认 `--serial-device-name` 指向正确节点（Ubuntu 一般为 `/dev/ttyACM0`）；
  - 确认串口小板为 1.8V 兼容（见 [§1.4 硬件连接](#14-硬件连接)）。

**现象：`hailo15_spi_flash_program` 报 `could not connect to the recovery agent`；或中途崩溃（如 `mkenvimage` 未找到、`write didn't succeeded`），引导链只写了一半**

- **原因：** 设备未进入 UART 恢复模式；或主机侧缺 `mkenvimage`（见 [§1.2](#12-主机工具)）；或上次工具崩溃后设备 UART 恢复代理状态不稳定，重试时写 Flash 未收到 ACK，甚至出现「擦除后未写入」使引导链更不完整。
- **解决：**
  1. 确认拨码为 UART 恢复模式（BOOT0 OFF、BOOT1 ON），且主机已装 `mkenvimage`（Ubuntu：`u-boot-tools`；macOS：`brew install u-boot-tools`）；
  2. **完整掉电重启**设备（拔 PoE → 等 3 秒 → 插回），保持拨码不变，再按一次 Reset——单按 Reset 通常不足以重置已降级的恢复代理；
  3. 在同一次恢复会话里连续执行 `uart_boot_fw_loader` + `hailo15_spi_flash_program`，不要在两者之间留长间隔。
- 即便引导链已损坏也可恢复：UART 恢复走 SoC 内 masked ROM，与 SPI Flash 内容无关。

### 7.2 TFTP 与网络问题

**现象：U-Boot 报 `TFTP error: 'Access violation' (2)` 或下载超时**

- **原因：** TFTP 服务未运行，或固件文件不在 TFTP 目录、权限不足。
- **解决：**

  ```bash
  # Ubuntu：检查服务状态与目录
  sudo systemctl status tftpd-hpa
  ls -la /var/lib/tftpboot/
  # macOS：检查 69 端口监听
  sudo lsof -i :69
  ```

  确认 `fitImage`、`swupdate-image-hailo15-ne503.ext4.gz`、`hailo-update-image-hailo15-ne503.swu` 已放入 TFTP 目录且可读。

**现象：macOS 下 TFTP 报 `Operation not permitted`**

- **原因：** macOS 隐私保护阻止 `tftpd` 读取用户目录。
- **解决（任选其一）：**
  - 系统设置 → 隐私与安全性 → 完全磁盘访问权限 → 添加 `/usr/libexec/tftpd`
  - 将 TFTP 目录改为 `/private/tftpboot`

**现象：能进入 U-Boot 菜单，但 TFTP 下载无响应**

- **原因：** 主机与设备不在同一网段，或主机 IP 不是设备 `serverip` 所指地址。
- **解决：** 按 [§3.2 配置网络](#32-配置网络) 检查——主机设为 `10.0.0.2`、设备默认 `10.0.0.1`；或在 U-Boot console 中用 `tftp 0x80800000 fitImage` 手动测试连通性。

### 7.3 eMMC 烧录问题

**现象：选择 eMMC Board Init 后烧录失败或卡住**

- **原因：** 网络不通、TFTP 文件缺失，或镜像签名校验失败（文件损坏）。
- **解决：**
  - 检查网线与 IP 配置（[§3.2](#32-配置网络)）；
  - 确认 TFTP 目录文件完整且未被截断；
  - 重新从 CamThink 获取固件包，覆盖可能损坏的文件。

### 7.4 升级中断恢复

**现象：升级过程中断电，重启后设备无法启动**

- **原因：** 升级中断导致 eMMC 系统镜像或引导链不完整。
- **解决：**
  1. 若引导链损坏（无 U-Boot 菜单），重新执行 [§2 烧录引导链](#2-烧录引导链)；
  2. 重新执行 [§3 烧录系统镜像](#3-烧录系统镜像) 完整写入。

### 7.5 U-Boot 无法启动

**现象：上电后串口无 U-Boot 菜单输出**

- **原因：** 拨码开关未恢复为正常模式，或引导链未烧录 / 已损坏。
- **解决：**
  - 确认拨码开关为正常模式（BOOT0 OFF, BOOT1 OFF）；
  - 仍无输出则重新执行 [§2 烧录引导链](#2-烧录引导链)。

## 8. 相关文档

- [System Architecture](./0-system-architecture.md) — 四层架构和核心服务
- [Software Deployment](./3-software-deployment.md) — 平台软件部署和迭代开发
