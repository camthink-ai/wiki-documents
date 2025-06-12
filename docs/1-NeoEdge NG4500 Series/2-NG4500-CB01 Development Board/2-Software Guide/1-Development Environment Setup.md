# Development Environment Setup

本章详细介绍 **NG4520** 的开发环境搭建流程，包括本地开发环境配置、源码部署、交叉编译、内核与设备树更新，以及远程调试与桌面访问等内容，旨在帮助开发者高效构建适用于嵌入式 AI 边缘计算设备的开发体系。

## 1. 本地源码开发环境搭建

### 前提条件

- Ubuntu 主机（推荐 20.04/22.04 LTS，空间>100GB ,用于交叉编译）

- 安装必要开发工具：

```shell
sudo apt update 
sudo apt install git-core build-essential bc flex bison libssl-dev
```

### 源码部署

1. 下载并解压 Linux_for_Tegra 源码

```shell
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v4.0/release/Jetson_Linux_R36.4.0_aarch64.tbz2
tar xf Jetson_Linux_R36.4.0_aarch64.tbz2 
```

2. 下载并解压文件系统

```shell
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v4.0/release/Tegra_Linux_Sample-Root-Filesystem_R36.4.0_aarch64.tbz2
sudo tar xpf Tegra_Linux_Sample-Root-Filesystem_R36.4.0_aarch64.tbz2 -C Linux_for_Tegra/rootfs/
```

3. 拉取内核源码

```shell
cd Linux_for_Tegra/source/
./source_sync.sh -t jetson_36.4
```

4. 获取下述代码并覆盖原始源代码

```shell
cd ../..
mkdir -p gitlab/Linux_for_Tegra
git clone git@gitlab.milesight.com:ai-developer/aibox/l4t.git  gitlab/Linux_for_Tegra
cp -r gitlab/Linux_for_Tegra/* Linux_for_Tegra/
```

5. 部署NVIDIA Tegra组件​​

```shell
cd Linux_for_Tegra
sudo ./apply_binaries.sh
```

### 交叉编译工具链部署

下载并解压交叉编译工具链

```shell
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
mkdir -p $HOME/l4t-gcc
tar xf aarch64--glibc--stable-2022.08-1.tar.bz2 -C $HOME/l4t-gcc
```

### 编译方法

**环境变量配置**，每次新开终端编译前，需配置如下环境变量：

```shell
cd Linux_for_Tegra/source
export CROSS_COMPILE=$HOME/l4t-gcc/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
export INSTALL_MOD_PATH=$PWD/Linux_for_Tegra/rootfs/
```

**完整编译方法（包含内核、模块、设备树）**

```shell
./nvbuild.sh
```

**单独编译方法**

1. 编译内核

```shell
cd Linux_for_Tegra/source
./nvbuild.sh -o $PWD/kernel_output  
```

2. 编译Out-of-Tree Modules

```shell
cd Linux_for_Tegra/source
make modules

# 安装模块驱动到rootfs
sudo -E make modules_install
```

3. 编译设备树

```shell
cd Linux_for_Tegra/source
make dtbs
```

### 更新内核和设备树（非刷机方式）

1. 查看`/boot/extlinux/extlinux.conf`文件，确认当前设备所使用的IMAGE和DTB的路径，如下图中的LINUX和FDT后面的位置信息。

```shell
TIMEOUT 30
DEFAULT primary

MENU TITLE L4T boot options

LABEL primary
      MENU LABEL primary kernel
      LINUX /boot/Image
      FDT /boot/dtb/kernel_tegra234-NG45XX-p3768-0000+p3767-0003-nv-super.dtb
      INITRD /boot/initrd
      APPEND ${cbootargs} root=PARTUUID=756c2935-3ec5-487a-96c8-424f306ca235 rw rootwait rootfstype=ext4 mminit_loglevel=4 console=ttyTCU0,115200 firmware_class.path=/etc/firmware fbcon=map:0 nospectre_bhb video=efifb:off console=tty0
      OVERLAYS /boot/tegra234-p3767-camera-p3768-imx678-C.dtbo
```

2. 将原始的内核镜像进行备份

```shell
sudo cp /boot/Image /boot/Image.backup
sudo cp /boot/dtb/kernel_tegra234-NG45XX-p3768-0000+p3767-0003-nv-super.dtb /boot/dtb/kernel_tegra234-NG45XX-p3768-0000+p3767-0003-nv-super.dtb.backup
```

3. 通过`scp`命令将编译好的IMAGE和DTB，拷贝到上述的路径进行替换即可

```shell
sudo cp $HOME/Image /boot/Image.backup
sudo cp $HOME/kernel_tegra234-NG45XX-p3768-0000+p3767-0003-nv-super.dtb /boot/dtb/kernel_tegra234-NG45XX-p3768-0000+p3767-0003-nv-super.dtb
```

## 2. 远程调试方法

### 前置条件

需要完成对AIBOX的**网络配置**，配置步骤如下：

1. 点击桌面右上角 **Ethernet** → 选择 **"Wired Settings"**

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_Setting.png)

2. 在弹出的网络设置窗口中，选择当前的有线网络连接。

3. 点击 `齿轮` 图标进入详细设置
   
   - 在 `IPv4` 标签页下，选择 `Manual`（手动）配置。
   
   - 输入静态 IP 地址、子网掩码和网关。例如：
     
     - **Address**: `192.168.231.100` 
     
     - **Netmask**: `255.255.255.0` 
     
     - **Gateway**: `192.168.231.1` 
   
   - 在 DNS 部分，输入 DNS 服务器地址，例如 `8.8.8.8` 和 `8.8.4.4`。
   
   - 点击 `Apply` 保存设置。

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_Setting_Network.png)

4. 配置完成后，重启网络以应用新的设置。

**网络验证**

5. 打开终端，通过以下指令确认网络是否正常

```shell
ping google.com
```

### SSH访问

1. windows电脑下，按`win+R`，打开“运行”对话框

2. 输入 `powershell`，然后按 ​**​Enter键​**​

3. 然后通过ssh连接到AIBOX，参考下述指令如下：

```shell
# 连接到AIBOX
ssh username@aibox-ip
# 执行远程命令
ssh username@aibox-ip "uname -a"
```

### RDP远程桌面访问

1. 启动JETSON终端，安装如下内容：

```shell
sudo apt update
sudo apt-get install tightvncserver xrdp 
sudo systemctl enable xrdp  
sudo systemctl start xrdp
```

2. 在 Windows 上打开“远程桌面连接”，输入 Jetson 的 IP 地址

3. 点击“连接”，输入账号密码
   
   ![Remote_Desktop_Login](/img/Remote_Desktop_Login.png)

4. 如下图，则为说明进入成功
   ![Remote_Desktop](/img/Remote_Desktop.png)

## 参考

[Kernel Customization — NVIDIA Jetson Linux Developer Guide 1 documentation](https://docs.nvidia.com/jetson/archives/r36.2/DeveloperGuide/SD/Kernel/KernelCustomization.html)
