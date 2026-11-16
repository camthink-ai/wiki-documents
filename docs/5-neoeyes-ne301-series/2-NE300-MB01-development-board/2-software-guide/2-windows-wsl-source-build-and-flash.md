---
title: Windows Wsl Source Build And Flash
description: 本文档为NE301用户提供在Windows + WSL环境中从源码构建和烧录NE301的详细指南。涵盖了环境准备（WSL2、Docker、STLink驱动、STM32CubeProgrammer）、ST-LINK透传到WSL的步骤、Docker开发容器的启动、固件构建与烧录流程，以及Docker命令、CRLF脚本问题、USBIPD attach失败、ST-LINK连接故障等常见问题的排查与解决方案。
keywords: [NE301, Windows, WSL, Docker, ST-LINK, 源码构建, 固件烧录, 嵌入式开发, 故障排查, STM32]
tags: [NE301, Windows, WSL, 烧录指南, 软件开发]
---

> 适用对象：参照[《开发环境搭建》](./development-environment-setup)、[《系统烧录与初始化》](./system-flashing-and-initialization)在 Windows + WSL 环境中通过 Docker 从源码构建并烧录 NE301 的用户。本篇仅做参考，具体可结合设备使用情况分析。

以下是关键过程示例：

## 1. 环境准备
1. **安装/启用**
   - Windows 10/11 + WSL2（推荐 Ubuntu）。
   - Docker Desktop，并在 Settings → Resources → WSL Integration 中启用对应发行版。
   - STLink 驱动安装：https://www.st.com/en/development-tools/stsw-link009.html?utm_source=chatgpt.com#get-software
   - STM32CubeProgrammer（v2.19.0）: https://www.st.com/en/development-tools/stm32cubeprog.html#get-software （可辅助验证调试器与连接线）
2. **克隆仓库（WSL 中完成）**
   ```bash
   git clone https://github.com/camthink-ai/ne301.git
   cd ne301
   ```
3. **修正 CRLF 脚本**
   有些脚本在 Windows 中会变成 CRLF，执行会报 `$'\r': command not found`。在 WSL 中将其改为 LF：
   ```bash
   sed -i 's/\r$//' Script/generate-reloc-model.sh
   ```
4. **确认 WSL 能访问 Docker 命令**：`docker version` 应输出客户端信息。

## 2. 透传 ST-LINK 到 WSL
1. 在 **管理员 PowerShell** 中安装 usbipd-win（已安装可跳过）：
   ```powershell
   winget install --exact dorssel.usbipd-win
   ```
2. 插好 ST-LINK，查设备：
   ```powershell
   usbipd list
   ```
   记下 ST-LINK 所在的 `<busid>`（例如，可能是： 2-3）。
3. 强制绑定并启用自动挂载到所有 WSL2 发行版：
   ```powershell
   usbipd bind --force --busid <busid>
   usbipd attach --wsl --auto-attach --busid <busid>
   ```

   <div style={{display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center'}}>
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/windows-wsl-source-build-and-flash/lsusb.png" alt="NE301主板正面图" style={{width:'100%', maxWidth:'360px', borderRadius:'8px'}} />
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/windows-wsl-source-build-and-flash/attach.png" alt="NE301主板接口图" style={{width:'100%', maxWidth:'360px', borderRadius:'8px'}} />
   </div>

   - 若提示需要重启，重启 Windows 后重跑以上命令。
   - 如果 attach 提示 failed，可 `usbipd detach --busid <busid>`、`usbipd unbind --busid <busid>`、`wsl --shutdown` 后重插 ST-LINK，再重复 bind/attach。

   > Tips: 如果使用STM32CubeProgrammer连接绑定了STLink,需断开连接再重新透传到WSL。

4. 回到 WSL，验证：
   ```bash
   lsusb
   ```
   能看到 `0483:3748 STMicroelectronics ST-LINK/V2` 即表示透传成功。若中途 ST-LINK 重枚举导致消失，重复 PowerShell 的 attach 步骤即可。

## 3. 启动 Docker 开发容器
在 WSL 的仓库目录运行（推荐使用 `$(pwd)`，不要在 PowerShell 中用 `\` 续行）：
```bash
docker run -it --rm --privileged \
  -v "$(pwd)":/workspace \
  -v /dev/bus/usb:/dev/bus/usb \
  camthink/ne301-dev:latest
```
> 若必须在 PowerShell 运行，请改为单行或使用反引号 ``` ` ``` 续行；主机缺少 `/dev/bus/usb` 时无法透传，仍建议在 WSL 中执行。

进入容器后，确认工具链与 ST-LINK：
```bash
STM32_Programmer_CLI -l
```
若未列出 ST-LINK，再检查 usbipd attach 状态。

## 4. 构建 + 烧录流程
1. **推荐一键命令**（容器内）：
   ```bash
   make flash
   ```
2. **如果仅需构建**：
   ```bash
   make          # FSBL + App + Web + Model
   make app      # 等同单模块
   ```
3. **分组件烧录**：
   ```bash
   make flash-fsbl
   make flash-app
   make flash-web
   make flash-model
   make flash-wakecore
   ```

## 5. 常见问题与解决
### 5.1 Docker 命令报 `invalid reference format`
PowerShell 中 `\` 不能续行；使用一行命令或反引号 ``` ` ```。推荐在 WSL 内运行。

### 5.2 `$'\r': command not found`
脚本被 Windows 转为 CRLF。用 `sed -i 's/\r$//' <file>` 或在编辑器中改为 LF。

### 5.3 `usbpipd` attach 失败/设备消失
- 确保命令在 **管理员 PowerShell** 执行。
- 重插设备，`usbipd detach/unbind` → `wsl --shutdown` → `usbipd bind --force` → `usbipd attach --wsl --auto-attach`。

### 5.4 `Unable to get core ID / No STM32 target found`
- 多为接触不良或芯片跑飞：检查 SWDIO/SWCLK/GND/NRST 线缆，确保共地；确认拨码开关与供电。
- 尝试低频 + 硬复位连接：
  ```bash
  STM32_Programmer_CLI -c port=SWD mode=UR reset=HARD_RST freq=1000
  ```
  需要时按住 Reset 后执行。

### 5.5 擦除外部 Flash 失败（可选）
1. 手动擦除：
   ```bash
   STM32_Programmer_CLI -c port=SWD mode=UR reset=HARD_RST freq=1000 \
     -e 0x70000000 0x70300000
   ```
2. 再写入：
   ```bash
   STM32_Programmer_CLI -c port=SWD mode=UR reset=HARD_RST freq=1000 \
     -d build/ne301_App_signed_pkg.bin 0x70100000 -v
   ```
3. 若再失败，检查供电/线材或在 GUI 中用自带 External Loader 做 Mass Erase。

### 5.6 输入 STM32_Programmer_CLI -l 无法获取到ST-Link的信息
   
   示例如下：
   ```
   root@1e35ac8374ea:/workspace# STM32_Programmer_CLI -l
   Detected locale "C" with character encoding "ANSI_X3.4-1968", which is not UTF-8.
   Qt depends on a UTF-8 locale, and has switched to "C.UTF-8" instead.
   If this causes problems, reconfigure your locale. See the locale(1) manual
   for more information.
   -------------------------------------------------------------------
   STM32CubeProgrammer v2.19.0
   -------------------------------------------------------------------

   ===== DFU Interface =====

   No STM32 device in DFU mode connected

   ===== J-Link Interface =====
   No J-Link/flasher probe detected.
   ===== STLink Interface =====
   No ST-Link detected!

   ===== UART Interface =====

   Total number of serial ports available: 0

   root@1e35ac8374ea:/workspace#
   ```

如果出现这种情况是容器里完全看不到 ST-LINK/串口，说明 USB 没透传进来或根本没连上。可按照以下思路进行排查：
- 在宿主/WSL 里看设备：lsusb 是否有 “STMicroelectronics ST-LINK/V2” 之类；WSL 如果没有，先 `sudo apt install usbutils`。
- WSL 环境需要用 `usbipd wsl list` 查看设备状态，未附加的用 `usbipd wsl attach --busid <busid>`，然后再 lsusb 确认。
容器启动参数要包含 USB 透传：--privileged -v /dev/bus/usb:/dev/bus/usb。当前容器如果是无 USB 的，退出后用这个参数重新 docker run 再进来。
- 重新进入容器后再 lsusb；能看到 ST-LINK 后再跑 STM32_Programmer_CLI -l 应该会列出。
- 确认板子上电、线缆正常，别的程序（如 VSCode 调试、STM32_Programmer Connect）没有占用 ST-LINK。



## 6. 设备 MAC 获取

如果烧录完成，可以重启设备Reset或者重新上电，然后连接WiFi AP,其名字为`NE301+Mac后六位字母`。
如果周边只有一台NE301设备，直接连接即可，如果是多台设备，需要确认对应设备的MAC地址。

- 或者尝试设备连入局域网后，在路由器/交换机的 DHCP 租约或 ARP 列表中查到 IP 对应的 MAC。已知设备 IP 时，Windows 下执行：
  ```powershell
  ping <设备IP>
  arp -a <设备IP>
  ```
- 或者整机下直接查看设备的标签页确认
- 最直接：启动串口日志（会打印设备 MAC）。
连接串口后，输入`ifconfig wifi ap`指令查看串口输出

<p align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/windows-wsl-source-build-and-flash/info.png" alt="串口调试" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
</p>

## 7.特殊情况

如果你已顺利完善环境搭建并成功烧录，但依旧无法开启设备的WiFi AP 那么可能是WiFi固件部分没有升级，可加入我们 [Discord](https://discord.com/invite/6TZb2Y8WKx) 做进一步沟通处理。


## 8.总结

使用WSL环境构建项目，通过以上步骤，即可在 Windows + WSL 环境中顺畅复现[《开发环境搭建》](./development-environment-setup)、[《系统烧录与初始化》](./system-flashing-and-initialization)中的流程，熟知这些流程并规避常见坑。可将本文与原始文档交叉参考，希望对你有所帮助！
