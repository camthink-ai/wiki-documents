# System  Flashing

本章旨在介绍 NG4500 系列产品的烧录方法，重点提供烧录镜像包的具体操作步骤。本文以 NG4511 设备为例，详细说明其烧录流程。

## 准备工作

- 一台 Ubuntu 电脑（推荐版本：20.04 或 22.04）

- Jetson 设备（如 NG4511）

- 一根 Micro USB 数据线

## PC（Ubuntu 电脑）环境配置

     在烧录前，请确保已预先安装以下软件包。可通过以下命令进行安装：

```shell
sudo apt update
sudo apt install -y build-essential git wget curl python3 python3-pip \
  python3-venv python3-distutils python3-setuptools python3-pexpect \
  python3-serial libusb-1.0-0-dev pkg-config device-tree-compiler \
  unzip bzip2 zstd
```

## 硬件准备​

**在进行软件烧录前，请完成以下硬件连接与设置：**

1. 使用 Micro USB 数据线，将 Jetson 设备的 Micro USB 端口连接至 Ubuntu 主机的 USB Type-A 端口。

2. 连接完成后，将设备上的 `SW1` 拨码开关的第 1 位拨至 `ON`，使设备进入 Recovery 模式。

![](/img/NG45XX_SOFTWARE/NG45XX_Recovery_SW1.png)

3. 若设备已进入 Recovery 模式，命令输出中会显示带有 **ID 0955:7623** 的 NVIDIA Corp 设备。
   
   > 注：如果没有出现NVidia Corp 设备，说明未正确进入recovery模式，请检查recovery按键拨码和usb线缆

![NG45XX_flash_lsusb](/img/NG45XX_flash_lsusb.jpg)

## 烧录镜像包方法

请按以下步骤下载并解压 AIBOX 烧录包：

1. 下载 AIBOX 烧录包，下载链接如下：

| 设备型号-版本类型 | 镜像包链接（含JetPack）                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 镜像包链接（不含JetPack）                                                                                                                                                                                                                                                                                                                                                                                                                       | 硬件型号                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| NG4510    | 镜像包：[aibox-NG4510-36.4.3-super-jetpack-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4510-super_42936/aibox-NG4510-36.4.3-super-jetpack-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4510-36.4.3-super-jetpack-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4510-super_42936/md5sum-aibox-NG4510-36.4.3-super-jetpack-V1.1.txt) | 镜像包：[aibox-NG4510-36.4.3-super-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4510-super_43202/aibox-NG4510-36.4.3-super-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4510-36.4.3-super-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4510-super_43202/md5sum-aibox-NG4510-36.4.3-super-V1.1.txt) | Jetson Orin nano 4GB |
| NG4511    | 镜像包：[aibox-NG4511-36.4.3-super-jetpack-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4511-super_42937/aibox-NG4511-36.4.3-super-jetpack-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4511-36.4.3-super-jetpack-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4511-super_42937/md5sum-aibox-NG4511-36.4.3-super-jetpack-V1.1.txt) | 镜像包：[aibox-NG4511-36.4.3-super-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4511-super_43203/aibox-NG4511-36.4.3-super-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4511-36.4.3-super-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4511-super_43203/md5sum-aibox-NG4511-36.4.3-super-V1.1.txt) | Jetson Orin nano 8GB |
| NG4520    | 镜像包：[aibox-NG4520-36.4.3-super-jetpack-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4520-super_42938/aibox-NG4520-36.4.3-super-jetpack-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4520-36.4.3-super-jetpack-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4520-super_42938/md5sum-aibox-NG4520-36.4.3-super-jetpack-V1.1.txt) | 镜像包：[aibox-NG4520-36.4.3-super-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4520-super_43204/aibox-NG4520-36.4.3-super-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4520-36.4.3-super-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4520-super_43204/md5sum-aibox-NG4520-36.4.3-super-V1.1.txt) | Jetson Orin nx 8GB   |
| NG4521    | 镜像包：[aibox-NG4521-36.4.3-super-jetpack-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4521-super_42939/aibox-NG4521-36.4.3-super-jetpack-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4521-36.4.3-super-jetpack-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4521-super_42939/md5sum-aibox-NG4521-36.4.3-super-jetpack-V1.1.txt) | 镜像包：[aibox-NG4521-36.4.3-super-V1.1.tgz](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4521-super_43205/aibox-NG4521-36.4.3-super-V1.1.tgz)<br/>md5sum：[md5sum-aibox-NG4521-36.4.3-super-V1.1.txt](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/download/firmware/aibox/NG45XX/36.4.3/v1.1/aibox-NG4521-super_43205/md5sum-aibox-NG4521-36.4.3-super-V1.1.txt) | Jetson Orin nx 16GB  |

2. 下载完成后，解压烧录包

```
sudo tar -zxvf aibox-NG4511-36.4.3-base-jetpack-V1.0.tgz -C ./
```

3. 解压完成后，切换到烧录目录，运行以下命令开始烧录

```
cd aibox-NG4511-36.4.3-base-jetpack-V1.0
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --network usb0 --flash-only --showlogs
```

4. 烧录过程结束后，日志中出现 `Flash is successful` 即表示烧录成功。将SW1拨码1拨到off，重启即可。

**注： 确认设备硬件版本方法**

**A. ​系统已启动并可访问的情况下**​

- 可通过以下命令获取设备型号信息

```shell
cat /proc/device-tree/model

# 输出示例
NVIDIA Jetson Orin Nano Engineering Reference Developer Kit Super
```

**B. 系统未启动且无法访问时** 

- 查看设备标签或包装盒型号​确认

- 检查模组模组背面二维码下方，有一串 ​**​15 位数字组合​**​（如 `900-13767-0030-000`）。具体可以参考下述表格
  
  - **`3767` → Orin 相关设备​**​（如 AGX Orin、Orin NX、Orin Nano）
  
  - **`0030` → Jetson Nano（8GB RAM）​**

| SKU  | 设备类型                         | 设备名称                             |
| ---- | ---------------------------- | -------------------------------- |
| 3767 | NVIDIA Jetson Orin NX和Nano模块 | Jetson Orin NX和Nano模块            |
| 3701 | NVIDIA Jetson AGX Orin模块     | Jetson AGX Orin模块                |
| 3768 | Jetson Orin Nano载板           | Jetson Orin Nano载板               |
| 3737 | Jetson AGX Orin载板            | Jetson AGX Orin载板                |
| 0000 | Jetson AGX Orin模块            | Jetson AGX Orin                  |
| 0004 | Jetson AGX Orin模块            | Jetson AGX Orin 32GB (32 GB RAM) |
| 0005 | Jetson AGX Orin模块            | Jetson AGX Orin 64GB (64 GB RAM) |
| 0000 | Jetson Orin NX和Nano模块        | Jetson Orin NX 16GB (16 GB RAM)  |
| 0001 | Jetson Orin NX和Nano模块        | Jetson Orin NX 8GB (8 GB RAM)    |
| 0003 | Jetson Orin NX和Nano模块        | Jetson Orin Nano 8GB (8 GB RAM)  |
| 0005 | Jetson Orin NX和Nano模块        | Jetson Orin Nano 8GB (8 GB RAM)  |
| 0004 | Jetson Orin NX和Nano模块        | Jetson Orin Nano 4GB (4 GB RAM)  |

## NVIDIA官方烧录方法

- **SDK Manager烧录方式**，请参考：[Install Ethernet Switch with SDK Manager — SDK Manager](https://docs.nvidia.com/sdk-manager/install-with-sdkm-switch/index.html)

- **脚本烧录方式**，请参考：[Quick Start — NVIDIA Jetson Linux Developer Guide 1 documentation](https://docs.nvidia.com/jetson/archives/r36.2/DeveloperGuide/IN/QuickStart.html#to-flash-the-jetson-developer-kit-operating-software)
