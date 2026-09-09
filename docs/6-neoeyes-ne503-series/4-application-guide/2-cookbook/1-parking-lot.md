---
id: parking-lot
title: Parking Lot
description: 在 NE503 上部署 Parking Lot Showcase，完成车辆检测、车牌识别和深度防伪的配置、启动与事件验证。
keywords: [NE503, Parking Lot, 停车场, 车辆检测, 车牌识别, 深度防伪, Event Bus, Cookbook]
tags: [NE503, 应用开发, Cookbook, 车辆检测, 事件集成]
---

# Parking Lot

本文在 NE503 上部署 `neoruntime-apps` 的 Parking Lot Showcase，并通过 Event Bus 验证车辆事件。

应用源码和完整配置见 [neoruntime-apps/showcases/parking-lot](https://github.com/camthink-ai/neoruntime-apps/tree/main/showcases/parking-lot)。本文只保留部署和验证所需的信息，源码细节以仓库为准。

## 1. 目标与前提

完成后，你应能看到 Parking Lot Monitor 页面，并收到以下主题的事件：

- `parking/vehicles`：车辆框和置信度；
- `parking/plates`：车牌区域和识别文本；
- `parking/alerts`：深度防伪告警。

开始前确认：

- NE503 已完成系统烧录并能打开 Web Console；
- 设备上的 `/data/aipc/models` 已提供 Showcase 需要的四个 HEF；
- 使用 ARM64 Release bundle，或准备好 Docker 和源码构建环境。

## 2. 关键配置

### 2.1 模型与事件

| 模型 ID | 用途 | 输入 |
|:---|:---|:---|
| `yolov5m_vehicles` | 车辆检测 | RGB，1920 × 1080 |
| `scdepthv3` | 深度防伪分析 | RGB，320 × 256 |
| `license_plate_det` | 车牌区域检测 | RGB，416 × 416 |
| `plate_recognition` | 车牌字符识别 | NV12，320 × 48 |

模型文件从设备的 `/data/aipc/models` 读取，完整配置以源码仓库为准。

默认清单使用 `sub.raw` 和 `STREAM_ID=sub`。设备没有对应原始流时无法推理。

## 3. 获取并构建应用

### 3.1 直接下载 Release bundle

推荐使用 [Parking Lot ARM64 bundle](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/parking-lot-latest-arm64.neoapp)。Web 端导入直接使用该 `.neoapp` 文件；如需校验或命令行安装，解压后应包含 `app.yaml`、`parking-lot-image.tar` 和 `SHA256SUMS`：

```bash
tar -xzf parking-lot-latest-arm64.neoapp
cd parking-lot-*-arm64
sha256sum -c SHA256SUMS
```

### 3.2 从源码构建（进阶）

从 GitHub 源码构建属于进阶路径。当前上游构建流程以 `neoruntime-apps` README 为准，可能仍需要同级 SDK 源码和本地 wheel；不要把它当作默认 SDK 安装方式。

```bash
git clone https://github.com/camthink-ai/neoruntime-apps.git

# 已有仓库时更新
git -C neoruntime-apps pull
```

如需在宿主机直接运行 Python 代码，使用 PyPI 安装 SDK：

```bash
cd neoruntime-apps
pip install neoruntime-ipc-sdk
```

Python 代码中的导入模块为 `neoruntime_ipc_sdk`。如需构建源码包，按 [neoruntime-apps README](https://github.com/camthink-ai/neoruntime-apps#showcase-bundles) 的当前说明执行。

### 3.3 核对关键清单字段

在安装前打开 `app.yaml`，确认关键项没有被旧 bundle 覆盖：

```yaml
permissions:
  video:
    - sub.raw
  inference:
    models:
      - yolov5m_vehicles
      - scdepthv3
      - license_plate_det
      - plate_recognition
    allow_register_model: true
  events:
    publish:
      - parking/vehicles
      - parking/plates
      - parking/alerts
  network:
    mode: host

env:
  - name: STREAM_ID
    value: "sub"
  - name: HD_PREVIEW_ENABLED
    value: "0"
```

保持 `HD_PREVIEW_ENABLED=0`，使用应用的 MJPEG `/stream` 预览。

## 4. 安装与启动

### 4.1 安装

在 Web Console 中进入 **App Management**，通过 **Import → Upload Package** 上传下载的 `.neoapp` 文件，然后点击 **Install**。

也可以在已登录设备的终端执行仓库 README 中的安装命令：

```bash
aipc-cli app install app.yaml parking-lot-image.tar
```

### 4.2 启动

安装完成后，在 **App Management → Installed Apps** 找到 `parking_lot`，点击 **Start**。状态变为 **Running** 后再做验证；仅显示安装成功不能证明推理流水线已运行。

### 4.3 打开 Web UI

在能访问设备的浏览器中打开：

```text
http://<设备IP>:8090
```

预期结果：看到 `Parking Lot Monitor`、实时画面和模型统计。黑屏时确认 `HD_PREVIEW_ENABLED=0`，并检查 `/stream`。

## 5. 验证结果

### 5.1 验证页面和车辆检测

1. 刷新 `http://<设备IP>:8090`，等待页面加载完成。
2. 确认预览区显示真实摄像头画面。
3. 确认 `Active Models` 列出四个模型。
4. 将镜头对准车辆，观察车辆框、`VEHICLES` 数值和统计信息。

FPS、推理耗时和检测数量随场景和设备负载变化。

![Parking Lot Monitor 实时检测界面](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/cookbook/parking-lot/webui-dashboard.png)

### 5.2 验证 Event Bus

在设备上订阅停车场主题：

```bash
aipc-cli event subscribe 'parking/*'
```

将镜头对准车辆，先确认收到 `parking/vehicles`。车牌和防伪主题需要满足对应场景条件。

### 5.3 查看状态和日志

在 Web Console 的应用详情页确认状态为 **Running**，并查看应用日志。重点检查：

- 四个模型是否完成注册；
- 是否持续出现媒体取帧失败、模型超时或 `Pipeline error`；
- 应用是否发生重启；
- 页面有画面但没有事件时，当前画面是否确实满足车牌或防伪触发条件。

## 6. 相关文档

- [资源](../3-resources.md) — `app.yaml`、SDK、API 和事件协议参考
- [人员检测](./2-person-detection.md) — 单模型推理和事件发布示例
