---
description: NE503 system image flashing and upgrade guide, covering UART recovery, SPI Flash boot chain, eMMC system flashing, and TFTP-based upgrades.
keywords: [NE503, flashing, system image, Hailo-15, eMMC, TFTP, U-Boot]
tags: [platform development, NE503, flashing, system deployment]
---

# System Flashing

The NE503 device software consists of two layers:

| Layer | Name | Contents | Update Method |
|-------|------|----------|---------------|
| System Image | hailo-os | Linux kernel, device tree, root filesystem | Flashing/upgrade (this document) |
| Platform Software | hailo-ne503 | Platform services, HAL, Web console | [Software Deployment](./3-software-deployment.md) |

This document covers the initial flashing and subsequent upgrades of the system image. For building and deploying platform software, see [Software Deployment](./3-software-deployment.md).

## Workflow Overview

Choose a path based on the current state of the device:

- **Initial deployment / full flash** (new board, or bootloader corrupted): [§1 Prerequisites](#1-prerequisites) → [§2 Flash Boot Chain](#2-flash-boot-chain) → [§3 Flash System Image](#3-flash-system-image) → [§4 System Login](#4-system-login) → [§6 Verification](#6-verification)
- **Upgrade system image only** (device already boots normally): [§1.3 TFTP](#13-tftp-server) → [§5.1 Upgrade](#51-u-boot-tftp-upgrade) → [§6 Verification](#6-verification)

> **When to skip §2:** if the device can reach the U-Boot menu or already boots into Linux, the boot chain is intact — go straight to §3 or §5. You only need §2 for a brand-new board or a corrupted bootloader (no U-Boot output on power-up).

## 1. Prerequisites

### 1.1 Firmware Package

Obtain the firmware package from [CamThink Technical Support](mailto:support@camthink.ai). After extraction, it contains the following files, grouped by purpose:

**Boot-chain components (used by [§2](#2-flash-boot-chain), 9 files)**

| File | Purpose |
|------|---------|
| `hailo15_uart_recovery_fw.bin` | UART recovery firmware |
| `hailo15_scu_bl.bin` | SCU bootloader |
| `scu_bl_cfg_a.bin` | SCU boot configuration |
| `hailo15_scu_fw.bin` | SCU firmware |
| `u-boot.dtb.signed` | U-Boot device tree (signed) |
| `u-boot-spl.bin` | U-Boot SPL |
| `u-boot-initial-env` | U-Boot initial environment variables |
| `customer_certificate.bin` | Customer certificate |
| `u-boot-tfa.itb` | U-Boot TF-A image |

**System image (used by [§3](#3-flash-system-image) / [§5](#5-system-upgrade), 3 files)**

| File | Purpose |
|------|---------|
| `fitImage` | Linux kernel image |
| `swupdate-image-hailo15-ne503.ext4.gz` | System root filesystem |
| `hailo-update-image-hailo15-ne503.swu` | SWUpdate upgrade package |

### 1.2 Host Tools

> Only needed for [§2 Flash Boot Chain](#2-flash-boot-chain); skip this section if you only do §3/§5 system-image flashing or upgrades.

Boot-chain flashing in §2 supports both **Ubuntu** and **macOS** (validated `hailo15_board_tools` version 1.9.0). `hailo15_board_tools` is a cross-platform Python wheel; the only differences between the two platforms are how dependencies are installed and the serial device node.

> **Critical dependency `mkenvimage`:** the `hailo15_spi_flash_program` tool in §2.3 shells out to `mkenvimage` to build the U-Boot env image. If not installed, the flash crashes while writing the 5th component (U-Boot env), **leaving a half-written boot chain**. Both platforms must install it first — Ubuntu provides it via `apt-get install u-boot-tools`, macOS via `brew install u-boot-tools`.

#### Ubuntu

```bash
# Hailo flashing tool (replace <VERSION> with the actual version; validated version is 1.9.0)
pip install hailo15_board_tools-<VERSION>.whl

# U-Boot utilities (provides mkenvimage, required by §2.3)
sudo apt-get update && sudo apt-get install u-boot-tools
```

![Install Hailo flashing tool](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-01-pip-install.png)

![Install U-Boot tools](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-02-u-boot-tools.png)

![U-Boot tools installed](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-03-install-done.png)

#### macOS

```bash
# 1. mkenvimage (required by §2.3, otherwise the flash crashes mid-way)
brew install u-boot-tools

# 2. Install the wheel inside a venv (Homebrew Python is PEP 668 externally-managed; a bare pip install is rejected)
python3 -m venv hailo-venv
./hailo-venv/bin/pip install hailo15_board_tools-<VERSION>.whl
# Then use ./hailo-venv/bin/uart_boot_fw_loader and ./hailo-venv/bin/hailo15_spi_flash_program
```

> **Serial device node:** Ubuntu is typically `/dev/ttyACM0`; macOS is typically `/dev/cu.usbserial-*` or `/dev/tty.usbserial-*`. Pass your actual node to `--serial-device-name` (see [§1.4 Hardware Connection](#14-hardware-connection) for how to find it).

### 1.3 TFTP Server

> Required for [§3 Flash System Image](#3-flash-system-image) / [§5 System Upgrade](#5-system-upgrade); skip this section if you only do §2 boot-chain flashing.

System images are large (100MB+) and must be transferred to the device via TFTP.

#### Ubuntu

```bash
# Install TFTP server
sudo apt install tftpd-hpa

# Edit configuration
sudo nano /etc/default/tftpd-hpa
```

Configuration:

```text
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/var/lib/tftpboot"
TFTP_ADDRESS="0.0.0.0:69"
TFTP_OPTIONS="--secure"
```

Start the service and deploy firmware files:

```bash
sudo mkdir -p /var/lib/tftpboot
sudo chmod -R 777 /var/lib/tftpboot
sudo systemctl restart tftpd-hpa

# Copy firmware files to TFTP directory
cp fitImage swupdate-image-hailo15-ne503.ext4.gz hailo-update-image-hailo15-ne503.swu /var/lib/tftpboot/
```

#### macOS

macOS includes `tftpd`, which runs on-demand via launchd:

```bash
# Create firmware directory
mkdir -p ~/Downloads/Firmware
chmod 777 ~/Downloads/Firmware

# Write launchd configuration
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

# Start the service
sudo launchctl load -w /Library/LaunchDaemons/com.tftp.local.plist

# Verify
sudo lsof -i :69
```

> Replace `<USER>` with your macOS username. Place firmware files in `~/Downloads/Firmware/`.
>
> If TFTP reports "Operation not permitted", add `/usr/libexec/tftpd` to **System Settings → Privacy & Security → Full Disk Access**, or use `/private/tftpboot` as the TFTP directory instead.

### 1.4 Hardware Connection

1. Connect the NE503 debug UART to the host using a USB-to-serial adapter

> The NE503 debug UART uses **1.8V** logic levels. A 1.8V-compatible USB-to-serial adapter is required (common 3.3V adapters may not work reliably). Contact [CamThink](mailto:support@camthink.ai) for the recommended serial adapter board.

2. Connect the NE503 Ethernet port to the host (direct cable or same switch)

CamThink serial adapter:

![CamThink serial adapter](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-04-serial-board.png)

Connected to NE503 board:

![NE503 board serial connection](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-05-board-connection.png)

3. Identify the serial device:

```bash
ls /dev/serial/by-id/* -lh
# Example output: usb-1a86_USB_Serial_5B1E071587-if00 -> ../../ttyACM0
```

![Query serial device node](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-06-device-node.png)

> The examples below use `/dev/ttyACM0`. Replace with your actual device node. On macOS, the device is typically `/dev/tty.usbmodem*` or `/dev/tty.usbserial*`.

Open a serial terminal (baud rate **115200**). All subsequent flashing logs, U-Boot menu interaction, and system login happen in this terminal:

```bash
# Ubuntu (minicom also works)
screen /dev/ttyACM0 115200

# macOS
screen /dev/tty.usbmodem* 115200
```

> On Windows, use SecureCRT or PuTTY at the same 115200 baud rate. To exit screen: press `Ctrl+A`, then `K`, then `Y`.

#### DIP Switch Modes

The NE503 uses two DIP switches (BOOT0, BOOT1) to select the power-on behavior. Later sections refer to these modes by name only — check this table:

| Mode | BOOT0 | BOOT1 | When to use |
| ---- | ----- | ----- | ----------- |
| UART recovery (flash boot chain) | OFF | ON | [§2 Flash Boot Chain](#2-flash-boot-chain) only |
| Normal boot | OFF | OFF | [§3 Flash System Image](#3-flash-system-image) onward; daily operation |

## 2. Flash Boot Chain

Boot chain flashing is only needed for initial deployment or if the bootloader is corrupted. Skip this step during normal operation.

### 2.1 Enter UART Recovery Mode

Set the DIP switches to **UART recovery mode** (BOOT0 OFF, BOOT1 ON; see [§1.4 DIP Switch Modes](#dip-switch-modes)):

![DIP switch flash mode](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-07-dip-switch.png)

Steps:

1. Switch to UART recovery mode (BOOT0 OFF, BOOT1 ON)
2. Power on the device via PoE (RJ45 Ethernet port)
3. Press the **Reset** button to enter flashing wait state

![Reset button](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-08-reset-button.png)

### 2.2 Load UART Recovery Firmware

```bash
uart_boot_fw_loader \
  --serial-device-name /dev/ttyACM0 \
  --firmware ./hailo15_uart_recovery_fw.bin
```

![UART recovery firmware loading](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-09-uart-boot.png)

### 2.3 Flash SPI Flash Bootloader Components

This step writes all bootloader components to SPI Flash, including SCU firmware, U-Boot SPL, device tree, and more:

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

Expected output:

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

> The above is typical output. Actual output may vary in casing or spelling across tool versions (e.g. `Storage program validatation`), and the SCU bootloader config may be programmed twice (A/B redundant slots). **Judge success by each component finally printing `successfully programmed` and the process exiting with code 0**; all 8 components should program successfully.

After flashing, restore the DIP switches to normal mode:

- **BOOT0:** OFF
- **BOOT1:** OFF

![DIP switch normal mode](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-18-dip-normal.png)

## 3. Flash System Image

Once the boot chain is ready, use the U-Boot menu to write the system image to eMMC.

### 3.1 Enter U-Boot Menu

Confirm the DIP switches are in **normal mode** (BOOT0 OFF, BOOT1 OFF; see [§1.4 DIP Switch Modes](#dip-switch-modes) — if you just finished §2, the switches are already in normal mode). Power on the device via PoE through the RJ45 port. The on-board green LED will blink.

![PoE power-on](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-19-poe-power.png)

Once powered on, press `↑`/`↓` keys in the serial terminal to stop autoboot and enter the U-Boot menu:

![U-Boot boot menu](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-21-emmc-init-1.png)

Available boot modes:

| Mode | Description |
|------|-------------|
| Autodetect | Auto-detect and boot (for devices with existing system) |
| Boot from eMMC | Boot from eMMC |
| eMMC Board Init | **Recommended for first flashing**: flash single system to eMMC |
| eMMC AB Board Init | Flash redundant dual-system to eMMC |
| U-Boot console | Enter command line mode |

### 3.2 Configure Network

U-Boot pulls images from the host pointed to by `serverip` — i.e. the host running your TFTP server from [§1.3](#13-tftp-server): the device IP defaults to `10.0.0.1` and `serverip` to `10.0.0.2`. Before flashing, put the **TFTP host** and the device on the same subnet. Choose one of the following depending on the host's subnet.

**Option 1 (recommended): put the host on the 10.0.0.x subnet.** For a direct connection, assign the host NIC a static IP of `10.0.0.2` and leave the device at its default `10.0.0.1` — no U-Boot console needed:

```bash
# Ubuntu (replace the interface name, e.g. eth0 / enp0s25)
sudo ip addr add 10.0.0.2/24 dev eth0
# macOS: System Settings → Network → Ethernet → IPv4 Manual
#   IP address 10.0.0.2   Subnet mask 255.255.255.0
```

**Option 2: keep the host on another subnet and change the device IP to match.** In the U-Boot menu, select **U-Boot console** and use `setenv` to modify the device environment. The defaults are shown below (use to confirm or reset back to the default network):

```bash
setenv ipaddr 10.0.0.1            # Device IP (default)
setenv serverip 10.0.0.2          # TFTP server (host) IP (default)
saveenv
reset
```

> If the host is on another subnet (e.g. 192.168.93.x), replace the `ipaddr` / `serverip` above with addresses on the host's subnet: ensure the device `ipaddr` is on the same subnet as the host, and `serverip` is the host IP.

### 3.3 Execute Flashing

Return to the U-Boot menu and select **eMMC Board Init**. The device will automatically:

1. Download `fitImage` (kernel) via TFTP into memory
2. Download `swupdate-image-hailo15-ne503.ext4.gz` (root filesystem) via TFTP into memory
3. Verify image signatures (RSA-3072 + SHA-256)
4. Apply the `.swu` upgrade package via SWUpdate to write the system to eMMC

![eMMC Board Init flashing (1/2)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-22-emmc-init-2.png)

![eMMC Board Init flashing complete (2/2)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-23-emmc-init-3.png)

> Relationship between the three system-image files: `fitImage` (kernel) and `swupdate-image-hailo15-ne503.ext4.gz` (root filesystem) are packed into `hailo-update-image-hailo15-ne503.swu` (the SWUpdate bundle); after eMMC Board Init fetches it over TFTP, SWUpdate verifies the signature and writes the system to eMMC. All three must be placed in the TFTP directory from [§1.3](#13-tftp-server).

The device reboots into Linux after flashing completes.

## 4. System Login

After flashing, the device reboots automatically. Log in via serial console or SSH:

- **Username:** `root`
- **Password:** `root`

![System login](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-24-linux-login.png)

> For system checks after logging in, see [§6 Verification](#6-verification).

## 5. System Upgrade

This section covers system image upgrades, performed in-place via the SWUpdate mechanism using `.swu` packages.

### 5.1 U-Boot TFTP Upgrade

A full system-image upgrade reuses the same flow from [§3.3](#33-execute-flashing) (U-Boot menu → eMMC Board Init → TFTP → SWUpdate writes eMMC); the only difference is replacing the `.swu` package in the TFTP directory with the new version. **No need to redo §2 boot chain.**

Brief steps:

1. Overwrite the old `hailo-update-image-hailo15-ne503.swu` with the new version in the TFTP directory from [§1.3](#13-tftp-server)
2. Power on in normal mode, enter the U-Boot menu (press `↑`/`↓` to stop autoboot), and select **eMMC Board Init**
3. The device automatically downloads the new `.swu` package over TFTP; SWUpdate writes it to eMMC

```plaintext
# Upgrade log example
hailo-update-image-h   9% |***                      | 72.1M  0:03:49 ETA
```

> The `.swu` package is large (~100MB+). Over 100Mbps Ethernet the full upgrade takes about 5-10 minutes. **Do not power off or disconnect during the upgrade.**

### 5.2 Runtime Firmware Update

> Steps for online system-image upgrades via the SWUpdate CLI from within a running Linux system are pending and will be provided by the engineering team. For runtime deployment of platform software (ai-runtime, Web console, etc.), see [Software Deployment](./3-software-deployment.md).

<!-- TODO: Engineering team to provide runtime swupdate CLI upgrade steps -->

## 6. Verification

After flashing or upgrading, verify the following:

```bash
# 1. Kernel version
uname -r
# 5.15.x (yocto-standard)

# 2. Filesystem
df -h /
# /dev/mmcblk1p2  3.6G  3.xG  xxM  xx% /

# 3. Hailo kernel modules (NPU / ISP / video pipeline)
lsmod | grep hailo
# hailo_integrated_nnc / hailo15_isp / hailo15_video_cap ...

# 4. Network interface
ip addr show eth0

# 5. Platform services (if platform software is deployed)
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api
```

> Device nodes: the system image lives on eMMC (`/dev/mmcblk1`) and the boot chain on SPI Flash (`/dev/mtdblock0`). The Hailo NPU is provided by the `hailo_integrated_nnc` kernel driver and is not necessarily exposed as a `/dev/hailo*` device node — use `lsmod | grep hailo` to verify the driver is loaded.

## 7. Troubleshooting

Common issues are listed in operational order (§2 boot chain → §3 system image → §5 upgrade). Each follows the pattern: Symptom → Cause → Resolution.

### 7.1 Boot-Chain Flashing Issues

**Symptom: `uart_boot_fw_loader` or `hailo15_spi_flash_program` is unresponsive / reports a serial error**

- **Cause:** The DIP switches are not in UART recovery mode, the serial device node is wrong, or the serial adapter is not 1.8V-level.
- **Resolution:**
  - Confirm the DIP switches are BOOT0 OFF, BOOT1 ON (UART recovery mode, see [§1.4 DIP Switch Modes](#dip-switch-modes)), and that Reset has been pressed;
  - Confirm `--serial-device-name` points to the correct node (on Ubuntu, typically `/dev/ttyACM0`);
  - Confirm the serial adapter is 1.8V-compatible (see [§1.4 Hardware Connection](#14-hardware-connection)).

**Symptom: `hailo15_spi_flash_program` reports `could not connect to the recovery agent`; or crashes mid-way (e.g. `mkenvimage` not found, or `write didn't succeeded`), leaving the boot chain half-written**

- **Cause:** The device is not in UART recovery mode; or the host is missing `mkenvimage` (see [§1.2](#12-host-tools)); or a previous tool crash left the device's UART recovery agent in a degraded state, so on retry the flash writes receive no ACK — even erasing-without-writing, which makes the boot chain less complete.
- **Resolution:**
  1. Confirm the DIP switches are in UART recovery mode (BOOT0 OFF, BOOT1 ON), and that `mkenvimage` is installed on the host (Ubuntu: `u-boot-tools`; macOS: `brew install u-boot-tools`);
  2. **Fully power-cycle** the device (unplug PoE → wait 3 seconds → re-apply), keep the DIP switches unchanged, then press Reset once more — a single Reset is usually insufficient to reset a degraded recovery agent;
  3. Run `uart_boot_fw_loader` + `hailo15_spi_flash_program` back-to-back in a single recovery session, without leaving a long gap between them.
- A corrupted boot chain is always recoverable: UART recovery runs from the SoC's masked ROM and is independent of SPI Flash contents.

### 7.2 TFTP & Network Issues

**Symptom: U-Boot reports `TFTP error: 'Access violation' (2)` or download times out**

- **Cause:** The TFTP server is not running, or firmware files are missing from the TFTP directory / have insufficient permissions.
- **Resolution:**

  ```bash
  # Ubuntu: check service status and directory
  sudo systemctl status tftpd-hpa
  ls -la /var/lib/tftpboot/
  # macOS: check port 69 listener
  sudo lsof -i :69
  ```

  Ensure `fitImage`, `swupdate-image-hailo15-ne503.ext4.gz`, and `hailo-update-image-hailo15-ne503.swu` are present in the TFTP directory and readable.

**Symptom: macOS TFTP reports `Operation not permitted`**

- **Cause:** macOS privacy protection prevents `tftpd` from reading user directories.
- **Resolution (either):**
  - System Settings → Privacy & Security → Full Disk Access → Add `/usr/libexec/tftpd`
  - Change the TFTP directory to `/private/tftpboot`

**Symptom: U-Boot menu is reachable, but TFTP download is unresponsive**

- **Cause:** The host and device are on different subnets, or the host IP is not the address pointed to by the device's `serverip`.
- **Resolution:** Check [§3.2 Configure Network](#32-configure-network) — set the host to `10.0.0.2` and leave the device at its default `10.0.0.1`; or test connectivity manually from the U-Boot console with `tftp 0x80800000 fitImage`.

### 7.3 eMMC Flashing Issues

**Symptom: Selecting eMMC Board Init fails or hangs**

- **Cause:** No network connectivity, missing TFTP files, or image signature verification failure (corrupted files).
- **Resolution:**
  - Check the Ethernet cable and IP configuration ([§3.2](#32-configure-network));
  - Confirm the files in the TFTP directory are complete and not truncated;
  - Re-obtain the firmware package from CamThink to overwrite any corrupted files.

### 7.4 Upgrade Interruption Recovery

**Symptom: Power loss during upgrade leaves the device unbootable**

- **Cause:** The interruption left the eMMC system image or boot chain incomplete.
- **Resolution:**
  1. If the boot chain is corrupted (no U-Boot menu), re-execute [§2 Flash Boot Chain](#2-flash-boot-chain);
  2. Re-execute [§3 Flash System Image](#3-flash-system-image) to write a complete image.

### 7.5 U-Boot Fails to Boot

**Symptom: No U-Boot menu output on the serial terminal after power-on**

- **Cause:** The DIP switches are not in normal mode, or the boot chain is not flashed / is corrupted.
- **Resolution:**
  - Confirm the DIP switches are in normal mode (BOOT0 OFF, BOOT1 OFF);
  - If there is still no output, re-execute [§2 Flash Boot Chain](#2-flash-boot-chain).

## 8. Related Documentation

- [System Architecture](./0-system-architecture.md) — Four-layer architecture and core services
- [Software Deployment](./3-software-deployment.md) — Platform software deployment and iterative development
