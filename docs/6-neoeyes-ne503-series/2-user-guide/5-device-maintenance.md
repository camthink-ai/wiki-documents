---
description: NE503 设备维护说明：网络与时间配置、日志与存储管理、设备管理工具和维护工具。
keywords: [NE503 设备维护, 网络配置, NTP, 日志, 存储, ct-disc, aipc-cli]
tags: [用户指南, NE503, 设备维护, 运维]
---

# Device Maintenance

本页用于设备上线后的日常维护：配置网络和时间、查看日志、管理存储，并使用设备管理工具。

## 1. 网络与时间

需要固定设备 IP 时进行配置，并同步设备时间。

### 1.1 静态 IP 配置

进入 **Settings → Network** 的 **IPv4 Settings**（接口 eth0）界面：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-network.png" />

1. 将 **Mode** 切换为 **Static Address**。
2. 填写与现场网络规划一致的 IP 地址、子网掩码与网关，DNS 按现场环境填写。
3. 保存后设备以新 IP 对外提供服务，浏览器需改用新地址访问。

**成功：**设备重启后 IP 不变，并可用新地址访问 Web 控制台。

DHCP 环境下，可在路由器按 MAC 地址绑定 IP。

### 1.2 时区与 NTP 配置

进入 **Settings → Time** 界面：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-time-settings.png" />

1. **Timezone** 选择部署地时区。
2. **Sync Mode** 选择 **NTP Sync**，填写现场可用的 NTP 服务器地址。
3. 点击 **Sync Now** 立即同步一次。

**成功：**同步无报错，OSD 时间与现场标准时间一致。

## 2. 日志与存储

### 2.1 日志查看与采集

在 **Maintenance → Logs** 查看并按时间或关键字筛选日志。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-logs.png" />

需要命令行排查时，使用 `journalctl -u <服务名>`；平台日志位于 `/data/aipc/logs/`。

### 2.2 存储清理

**Settings → Storage** 页面显示内置存储使用情况，分为 **System**（系统分区，不可修改）与 **Data**（数据分区）两部分。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-storage.png" />

在 **Settings → Storage** 查看 **System** 和 **Data** 使用量。Data 使用率过高时，先导出所需日志，再清理日志、卸载闲置应用或删除模型。

```bash
truncate -s 0 /data/aipc/logs/*.log
```

录像由外部 NVR / VMS 拉流保存，设备不提供本机录像存储。

## 3. 维护工具

**Maintenance** 页面提供文件管理、终端和进程管理：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-file-manager.png" />

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-terminal.png" />

终止平台关键进程可能导致功能异常，非必要不要执行 **Kill**。

## 4. 设备管理工具

### 4.1 CT-Disc

在与设备同一局域网的电脑上执行：

~~~bash
ct-disc scan
~~~

输出应包含设备 MAC、SN、IP 和固件信息。常用命令：

~~~bash
ct-disc scan --timeout 3
ct-disc list --product NE503 --timeout 5
ct-disc watch
~~~

CLI 和 GUI 源码见 [neoruntime/tools/ct-disc](https://github.com/camthink-ai/neoruntime/tree/main/tools/ct-disc)。

### 4.2 aipc-cli

在设备的 **Maintenance → Terminal** 或 SSH 中执行：

~~~bash
ssh root@<设备IP>
aipc-cli system health
aipc-cli app list
aipc-cli app logs <id> -f
aipc-cli stream list
aipc-cli model list
~~~

使用 `aipc-cli --help` 查看完整命令。
