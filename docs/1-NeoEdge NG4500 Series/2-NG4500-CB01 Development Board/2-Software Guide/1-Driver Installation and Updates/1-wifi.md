# WIFI

本文档以 Realtek RTL8821CE 为例，介绍 NG4520平 台下 WIFI 驱动的安装与使用方法。

## 安装方式

WIFI 驱动支持两种安装方式：

1. **系统内直接安装**（推荐，简单快捷）

2. **源码编译后烧写**（适用于定制或内核版本不兼容场景）

## 系统内直接安装

**安装步骤如下：**

1. 安装驱动

```
$ sudo apt update
$ sudo apt install rtl8821ce-dkms
```

2. 加载驱动

```
$ sudo modprobe rtl8821ce
```

3. 验证驱动加载

```
$ dmesg | grep rtl
```

           典型日志输出示例：

```
[   10.805932] rtl8821ce 0001:01:00.0: Adding to iommu group 3
[   10.806901] rtl8821ce 0001:01:00.0: enabling device (0000 -> 0003)
[   11.077841] Bluetooth: hci0: RTL: loading rtl_bt/rtl8821c_fw.bin
[   11.079036] Bluetooth: hci0: RTL: loading rtl_bt/rtl8821c_config.bin
[   11.320620] rtl8821ce 0001:01:00.0 wlP1p1s0: renamed from wlan0
```

## 源码编译安装

1. 代码获取
- 官方仓库：[GitHub - tomaspinho/rtl8821ce](https://github.com/tomaspinho/rtl8821ce)
- 或由 WIFI 厂商提供](https://github.com/tomaspinho/rtl8821ce)
2. 目录放置

            将源码放置于：

```
Linux_for_Tegra/source/nvidia-oot/drivers/net/wireless/realtek/rtl8821ce
```

3. Makefile 配置

            在主 Makefile 中添加：

```
obj-m += rtl8821ce/
```

            按需修改 rtl8821ce 目录下 Makefile，**使能 TEGRA 平台支持**：

```
diff --git a/Makefile b/Makefile
index 5b5dc9a..01b1e24 100755
--- a/Makefile
+++ b/Makefile
@@ -15,6 +15,8 @@ EXTRA_CFLAGS += -Wno-unused-parameter
 EXTRA_CFLAGS += -Wno-unused-function
 EXTRA_CFLAGS += -Wno-unused
 #EXTRA_CFLAGS += -Wno-uninitialized
+EXTRA_CFLAGS += -Wno-missing-prototypes
+EXTRA_CFLAGS += -Wno-error=misleading-indentation

 GCC_VER_49 := $(shell echo `$(CC) -dumpversion | cut -f1-2 -d.` \>= 4.9 | bc )
 ifeq ($(GCC_VER_49),1)
@@ -29,6 +31,7 @@ else
     export TopDIR ?= $(srctree)/$(src)
 endif

+TopDIR = $(srctree.nvidia-oot)/drivers/net/wireless/realtek/rtl8821ce
 EXTRA_CFLAGS += -I$(TopDIR)/include

 EXTRA_LDFLAGS += --strip-debug
@@ -113,7 +116,8 @@ CONFIG_RTW_SDIO_PM_KEEP_POWER = y
 ###################### MP HW TX MODE FOR VHT #######################
 CONFIG_MP_VHT_HW_TX_MODE = n
 ###################### Platform Related #######################
-CONFIG_PLATFORM_I386_PC = y
+CONFIG_PLATFORM_TEGRA = y
+CONFIG_PLATFORM_I386_PC = n
 CONFIG_PLATFORM_ANDROID_X86 = n
 CONFIG_PLATFORM_ANDROID_INTEL_X86 = n
 CONFIG_PLATFORM_JB_X86 = n
@@ -1212,6 +1216,15 @@ endif

 EXTRA_CFLAGS += -DDM_ODM_SUPPORT_TYPE=0x04

+ifeq ($(CONFIG_PLATFORM_TEGRA), y)
+ARCH = arm
+KVER := $(shell uname -r)
+KSRC := /lib/modules/$(KVER)/build
+EXTRA_CFLAGS += -DCONFIG_LITTLE_ENDIAN
+EXTRA_CFLAGS += -DCONFIG_IOCTL_CFG80211 -DRTW_USE_CFG80211_STA_EVENT
+EXTRA_CFLAGS += -Wno-error=date-time
+MODULE_NAME = rtl8821ce
+endif
 ifeq ($(CONFIG_PLATFORM_I386_PC), y)
 EXTRA_CFLAGS += -DCONFIG_LITTLE_ENDIAN
 EXTRA_CFLAGS += -DCONFIG_IOCTL_CFG80211 -DRTW_USE_CFG80211_STA_EVENT
@@ -2232,7 +2245,7 @@ ifeq ($(CONFIG_RTL8723B), y)
 $(MODULE_NAME)-$(CONFIG_MP_INCLUDED)+= core/rtw_bt_mp.o
 endif

-obj-$(CONFIG_RTL8821CE) := $(MODULE_NAME).o
+obj-m := $(MODULE_NAME).o

 else
```

4. 编译与烧录

            执行内核或模块编译，将模块安装到 rootfs 下，烧录系统。具体编译、烧录方法参见 Jetson 官方文档。

5. 使用与验证

加载驱动

```
$ sudo modprobe rtl8821ce
```

查看设备

```
0001:01:00.0 Network controller: Realtek Semiconductor Co., Ltd. RTL8821CE 802.11ac PCIe Wireless Network Adapter
```

查看日志

```
$ sudo dmesg | grep rtl
[    9.785137] rtl8821ce 0001:01:00.0: Adding to iommu group 3
[    9.785307] rtl8821ce 0001:01:00.0: enabling device (0000 -> 0003)
[   10.010615] Bluetooth: hci0: RTL: loading rtl_bt/rtl8821c_fw.bin
[   10.011780] Bluetooth: hci0: RTL: loading rtl_bt/rtl8821c_config.bin
[   10.441574] rtl8821ce 0001:01:00.0 wlP1p1s0: renamed from wlan0
```

查看网络接口

![RTL8821_wifi_connection1.png](/img/RTL8821_wifi_connection1.png)

ifconfig查看网络设备

```
wlP1p1s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.204.218  netmask 255.255.255.0  broadcast 192.168.204.255
        inet6 fe80::aba:6776:77ec:4831  prefixlen 64  scopeid 0x20<link>
        inet6 2409:8934:20d4:908:f2b8:fd54:f19a:a11a  prefixlen 64  scopeid 0x0<global>
        inet6 2409:8934:20d4:908:5de2:d217:83e0:d943  prefixlen 64  scopeid 0x0<global>
        ether a4:e8:8d:0f:e4:ce  txqueuelen 1000  (Ethernet)
        RX packets 2060  bytes 2644294 (2.6 MB)
        RX errors 0  dropped 48  overruns 0  frame 0
        TX packets 1656  bytes 195010 (195.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0ons 0
```

网络连通性测试

```
$ ping -I wlP1p1s0 www.baidu.com
PING www.baidu.com(2409:8c20:6:1d55:0:ff:b09c:7d77 (2409:8c20:6:1d55:0:ff:b09c:7d77)) from 2409:8934:20d4:908:5de2:d217:83e0:d943 wlP1p1s0: 56 data bytes
64 bytes from 2409:8c20:6:1d55:0:ff:b09c:7d77 (2409:8c20:6:1d55:0:ff:b09c:7d77): icmp_seq=1 ttl=48 time=88.7 ms
64 bytes from 2409:8c20:6:1d55:0:ff:b09c:7d77 (2409:8c20:6:1d55:0:ff:b09c:7d77): icmp_seq=2 ttl=48 time=50.8 ms
64 bytes from 2409:8c20:6:1d55:0:ff:b09c:7d77 (2409:8c20:6:1d55:0:ff:b09c:7d77): icmp_seq=3 ttl=48 time=80.5 ms
64 bytes from 2409:8c20:6:1d55:0:ff:b09c:7d77 (2409:8c20:6:1d55:0:ff:b09c:7d77): icmp_seq=4 ttl=48 time=86.1 ms
```

---

如需支持其它 WIFI 芯片驱动，参考对应厂商文档和内核适配流程。
