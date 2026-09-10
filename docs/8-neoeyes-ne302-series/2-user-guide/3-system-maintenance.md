---
id: ne302-system-maintenance
title: System Maintenance
sidebar_position: 3
description: 说明如何在 Web 控制台中修改 NE302 登录密码、选择匹配的固件包升级，并安全管理设备存储。
keywords: [NE302, System Settings, Storage Management, 固件, 密码]
tags: [NE302, 用户指南, 系统维护, 固件升级]
---

# System Maintenance

本页说明如何修改登录密码、升级固件和管理设备存储。网络连接与结果发送见[数据传输](./1-data-transmission.md)；抓拍保存策略和记录见[抓拍与存储](./0-capture-storage.md)。

## 1. 修改登录密码

打开**系统设置 → 设备密码**：

1. 在**登录密码**中输入新密码并确认；长度为 8–32 个字符；
2. 点击该区域的**保存**；
3. 退出后用新密码重新登录。

用户名固定为 `admin`。**本地 WiFi 设置**与登录密码是两组独立配置；保存 Wi-Fi 设置后，可能需要重新连接设备网络。

![NE302 设备密码设置页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/system-maintenance/ne302-system-settings-device-password.png)

## 2. 固件升级

打开**系统设置 → 固件升级**，先在**固件信息**中查看当前版本。固件从 [NE302 GitHub Releases](https://github.com/camthink-ai/ne302/releases) 下载。下表列出截至 2026-08-17 已核验可访问的 `v4.3.0` 文件；使用其他版本时，只能使用同一发布版本中的配套文件。

![NE302 固件导入对话框](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/system-maintenance/ne302-firmware-upgrade.png)

| 组件 | v4.3.0 文件 | 用途 |
| :--- | :--- | :--- |
| 应用程序 | [ne302_App_signed_v4.3.0.12_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_App_signed_v4.3.0.12_pkg.bin) | 上传到应用程序导入框 |
| Web 页面 | [ne302_Web_v1.5.0.1_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Web_v1.5.0.1_pkg.bin) | 上传到 Web 页面导入框 |
| AI 模型 | [ne302_Model_v4.0.0.0_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Model_v4.0.0.0_pkg.bin) | 上传到 AI 模型导入框 |
| FSBL | [ne302_FSBL_signed_v1.0.3.0_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_FSBL_signed_v1.0.3.0_pkg.bin) | **高级选项**中的 FSBL 固件升级 |
| WiFi 固件 | [ne302_Wifi_flash_v2.15.5.2_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Wifi_flash_v2.15.5.2_pkg.bin) | **高级选项**中的 WiFi 固件升级 |
| WakeCore | [ne302_WakeCore.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_WakeCore.bin) | 不使用 Web 页面；按[构建、烧录与更新](../4-software-guide/1-build-and-flash.md)通过 U0-STLINK 烧录 |

如需保留当前配置，先通过**导出固件**导出**设备文件**。导出的 `.json` 是配置备份，不是升级包。

1. 下载与目标组件对应的 `_pkg.bin`，一次只升级一个组件；
2. 在**导入固件**中将文件上传到对应位置。应用程序、Web 页面、AI 模型和 FSBL 完成校验后，点击**确认烧录**；
3. 升级 WiFi 时，上传 `ne302_Wifi_flash_*_pkg.bin`，页面提示已写入 Flash 后点击**确认升级**；
4. 等待设备重启，重新登录后在**固件信息**中确认版本。

FSBL 仅在 Release 或工程师明确要求时升级。不要混用不同 Release 的包，也不要将 `.json`、`.hex` 或未打包映像上传到 OTA 框。

## 3. 存储管理

打开**存储管理**，先确认**SD 卡状态**和**内部 Flash**的可用空间。

![NE302 存储管理页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/system-maintenance/ne302-storage-management.png)

在对应存储的**文件管理器**中，先用**预览**确认文件，再用**下载**导出需要保留的内容，最后删除明确选中的文件或目录。删除目录会同时删除其中的文件。

需要清空内部 Flash 时，先导出要保留的文件，再在**文件管理器 → 格式化 Flash**中输入设备密码并完成确认。格式化会永久清除内部 Flash 中的文件。
