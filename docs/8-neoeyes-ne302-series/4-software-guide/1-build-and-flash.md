---
id: ne302-build-and-flash
title: Build, Flash and Update
sidebar_position: 1
description: 说明如何构建 NE302 固件，连接正确的 ST-LINK 接口，烧录 STM32N6 或 WakeCore，并安全更新软件包。
keywords: [NE302, 构建, 烧录, FSBL, App, Web, WakeCore, STM32N6, STM32U0, ST-LINK]
tags: [NE302, 软件指南, 构建, 烧录]
---

# Build, Flash and Update

本页说明 NE302 源码的构建、硬件烧录和更新包准备。烧录时必须连接目标 MCU 对应的接口：STM32N6 使用 `N6-STLINK`，STM32U0 / WakeCore 使用 `U0-STLINK`。

开始前先完成[环境配置](./0-development-environment.md)，并确认目标设备、源码版本和要烧录的组件。

## 1. 先确定烧录目标

| 目标 | MCU | 设备接口 | Boot 开关 | 主要命令 |
| :--- | :--- | :--- | :--- | :--- |
| FSBL、App、Web、Model、WiFi | STM32N6 | `N6-STLINK` | `N6-BOOT` | `make flash-<component>` 或 `make flash` |
| WakeCore | STM32U0 | `U0-STLINK` | `U0-BOOT` | `make flash-wakecore` |

N6 和 U0 是两条独立的烧录路径。一次只连接其中一条；不要用 `N6-STLINK` 烧录 WakeCore，也不要把 WakeCore 文件上传到 App、Model 或 Web 的更新入口。

## 2. 构建、签名和打包

在源码根目录执行：

```bash
make info
make                 # 构建 FSBL、App、Web、Model 和 WakeCore
make app             # 只构建 App
make web             # 只构建 Web
make model           # 只构建 Model
make wifi-image      # 构建 WiFi 镜像
```

`make` 会生成构建产物，但各组件在烧录前需要的处理并不相同：

| 组件 | 编译 | 签名 | 打包 | 烧录 |
| :--- | :--- | :--- | :--- | :--- |
| FSBL | `make fsbl` | `make sign-fsbl` | `make pkg-fsbl`（用于 OTA） | `make flash-fsbl` |
| App | `make app` | `make sign-app` | `make pkg-app` | `make flash-app` |
| Web | `make web` | 不需要 | `make pkg-web` | `make flash-web` |
| Model | `make model` | 不需要 | `make pkg-model` | `make flash-model` |
| WiFi | `make wifi-image` | 不需要 | `make pkg-wifi` | `make flash-wifi` |
| WakeCore | `make wakecore` | 不需要 | 不走普通 OTA | `make flash-wakecore` |

签名后的 FSBL `.bin` 可以直接烧录；App 必须先签名再打包；Web 和 Model 不需要签名，但烧录和 OTA 都使用打包文件。需要生成完整 OTA 包时执行：

```bash
make sign
make pkg
```

WakeCore 由自己的构建流程直接烧录，不包含在普通 `make pkg` 包中。

### 模型运行时变体

源码支持 `2.2`、`3.0` 和 `4.0`，默认值为 `4.0`。重新生成 Model 时，`STEDGEAI_VARIANT`、`STEDGEAI_CORE_DIR`、App 运行时和 Model 包必须使用同一变体：

```bash
make model STEDGEAI_VARIANT=4.0
```

变体不一致时，先回到[环境配置](./0-development-environment.md)检查工具和环境，不要继续烧录。

## 3. 烧录 STM32N6

STM32N6 负责 FSBL、App、Web、Model 和 WiFi。烧录顺序固定为：**先拨码 → 接线 → 上电或复位 → 在 PC 执行命令 → 完成后拨回运行状态**。

下图标出实际接口板上的烧录和串口接口：`N6_STLINK` 用于 STM32N6，`U0-STLINK` 用于 STM32U0；中间的 `N6_UART` 是串口接口，不是 ST-LINK 烧录接口。

![NE302 实际烧录设备接口板](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/software-guide/build-and-flash/ne302-interface-board-programming-map-v2.png)

### 硬件接入

1. 关闭设备电源。
2. 将接口板上的 `N6-BOOT` 拨到印有 **ON** 的一侧。
3. 按以下顺序连接：**设备 `N6-STLINK` → ST-LINK → PC**。
4. 为设备上电或复位。

![STM32N6 烧录连接：设备 N6-STLINK 接口通过 ST-LINK 连接到电脑](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/software-guide/build-and-flash/ne302-n6-flash-connection.png)

### 执行烧录

在 PC 的源码目录执行对应命令：

```bash
make flash-fsbl
make flash-app
make flash-web
make flash-model
make flash-wifi
```

需要一次烧录全部 N6 组件时执行：

```bash
make flash
```

`make flash` 会烧录 FSBL、App、Web、Model 和 WiFi，并执行 `erase-ota`。全量烧录会改变设备状态；日常开发优先使用单个组件的命令。

### 恢复运行模式

1. 关闭设备电源。
2. 将 `N6-BOOT` 拨回 **OFF**。
3. 重新上电或复位，等待设备启动。

## 4. 烧录 STM32U0 / WakeCore

STM32U0 运行 WakeCore。它使用独立的 U0 接口和 Boot 开关，不能沿用 N6 的接线方式。

### 硬件接入和烧录

1. 关闭设备电源。
2. 将接口板上的 `U0-BOOT` 拨到印有 **ON** 的一侧。
3. 按以下顺序连接：**设备 `U0-STLINK` → ST-LINK → PC**。
4. 为设备上电或复位。
5. 在 PC 的源码目录执行：

![STM32U0 烧录连接：设备 U0-STLINK 接口通过 ST-LINK 连接到电脑](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/software-guide/build-and-flash/ne302-u0-flash-connection.png)

   ```bash
   make flash-wakecore
   ```

### 恢复运行模式

1. 关闭设备电源。
2. 将 `U0-BOOT` 拨回 **OFF**。
3. 重新上电或复位，检查 WakeCore 相关的唤醒和触发行为。

## 5. 更新包和 HEX 产物

设备 Web 控制台的**固件升级**页面使用打包文件。文件与升级入口的对应关系见[系统维护](../2-user-guide/3-system-maintenance.md#2-固件升级)。只上传与组件和版本匹配的包；模型与应用程序还必须使用相同的 `STEDGEAI_VARIANT`。

需要生成组合烧录文件时执行：

```bash
make pack-hex
make pack-hex-wakecore
```

主固件、主固件加 WiFi 和 WakeCore 的 HEX 产物对应不同目标 MCU，不能混用。

## 6. 烧录后确认

1. 确认目标 Boot 开关已经回到 **OFF**，并重新上电。
2. 打开 Web 控制台，在**固件信息**中查看对应组件版本。
3. 更新应用程序、Web 页面或模型后，在**功能调试**中检查预览和推理。
4. 更新 WakeCore 后，检查设备是否能按预期唤醒和响应触发。

如果 PC 无法识别目标，先检查设备是否供电、Boot 开关是否为 **ON**、ST-LINK 是否接入正确的 `N6-STLINK` 或 `U0-STLINK`，以及是否误用了另一条烧录路径。

## 7. 擦除命令

以下命令会改变设备状态，执行前确认目标设备并备份需要保留的配置：

```bash
make erase-nvs
make erase-ota
make erase-all
make erase-chip
```

`erase-chip` 会擦除整片芯片，不是普通构建或烧录步骤。
