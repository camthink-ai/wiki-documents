---
description: 本教程详细介绍 NeoEyes NE301 的完整上手流程，涵盖设备组装、Web UI 连接登录，以及功能调试、模型验证、应用管理、硬件管理、抓拍设置、系统设置、存储管理、设备信息八大模块的配置与使用，帮助开发者快速完成边缘 AI 应用的部署与调试。
keywords: [NE301快速开始, NeoEyes教程, AI相机配置, Web UI调试, 模型部署, MQTT配置, Webhook推送, 边缘AI入门, 固件升级, 实时推理]
tags: [快速入门, NE301, 使用教程, AI调试, 配置指南]
---

# Quick Start

## 概述

本教程将详细说明 NeoEyes NE301 如何从 0 开始上手使用，涵盖内容有：设备安装、基本使用、Web UI 八大功能模块的配置与调试、模型部署与数据上报等。

> 本文内容对应固件 **v4.3.1**（Web 前端 1.5.0.8）；旧版本固件的界面与功能可能存在差异，变更明细以 [Release Notes](https://github.com/camthink-ai/ne301/releases) 为准。

## 产品准备

- NE301 主机一套（含主板、电池仓、外壳）
- AA 电池 4 节，或直流 / 太阳能等替代供电方案
- 十字螺丝刀、安装支架及固定件
- 可选扩展：Cat-1 模块、Wi-Fi HaLow 模组（需配合 HaLow 网关使用）、不同规格的镜头模组
- 可连接 WiFi 的电脑或手机，用于访问设备 Web 页面

> 提示：整机版本已预装核心固件与出厂模型，仅需装入电池即可进入调试。若使用开发板版本，请确认各扩展板连接牢固，再完成装配。

## 产品使用

### 设备开机

使用螺丝刀拆卸 NE301 后盖，按照电池仓分布安装电池，等待相机前部的蓝色灯光亮起后，表示相机系统已经成功启动。确定开机顺利后即可将后盖重新安装回设备，到这里你便完成了设备的基本启动，接下来可对设备进行配置。

<div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup1.jpg" style={{ maxWidth: '48%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup2.jpg" style={{ maxWidth: '48%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 设备连接与登录

NE301 内置 WiFi AP，提供 Web UI 交互方式，供用户对设备的模型推理、参数和功能进行调试与修改。NE301 设备 WiFi AP 的 SSID 名称规则为 `NE301{Mac 后六位}`，请保证身边有手机或电脑可以连接该 WiFi AP 来访问 Web 网页进行配置修改。成功连接 WiFi AP 后，可在浏览器中输入 `192.168.10.10` 来访问 Web 界面。

**操作步骤：**

1. **确认设备处于开机状态**：手指轻按一下相机右侧的拍照按钮，若指示灯亮起说明当前机器处于开机状态。调试时点击拍照按键，NE301 将抓取当前画面图像，并通过你配置的 MQTT/MQTTS 或 Webhook 地址上传图像。
2. **唤醒并连接 WiFi AP**：长按拍照按键约 2 秒唤醒 WiFi AP（设备前部蓝色系统指示灯同时亮起）。在电脑或手机的 WiFi 列表中寻找 SSID 为 `NE301{Mac 后六位}` 的热点并连接，无需密码。连接成功后，在浏览器中访问 `192.168.10.10` 即可打开配置页面。

> 短按拍照键触发抓拍；长按拍照键 2 秒唤醒 WiFi AP。WiFi AP 默认空闲一段时间后会进入休眠，若页面断开，可再次长按唤醒，或在「系统设置 → 设备密码」中调整休眠时间。

3. **登录配置页面**：访问 Web 页面后进入登录界面。默认用户名为系统内置的 `admin`（不可修改），初始密码为 `hicamthink`，可在「系统设置 → 设备密码」中修改。输入正确密码后即可进入主界面。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/login-en.png" alt="登录页面" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 功能概览

登录后进入 Web 主界面，顶部导航栏提供 8 个功能模块，覆盖设备调试、应用对接与系统管理的全部能力：

| 模块 | 路径 | 作用 |
|:---|:---|:---|
| **功能调试** Feature Debugging | `/device-tool` | 实时预览、模型管理、推理参数、电源模式、媒体流推送、唤醒源配置 |
| **模型验证** Model Validation | `/model-verification` | 上传本地图片用当前模型离线推理，输出 JSON 结果 |
| **应用管理** Application Management | `/application-management` | 数据上报通道配置：MQTT/MQTTS 与 Webhook |
| **硬件管理** Hardware Management | `/hardware-management` | 图像参数（翻转、ISP、灰阶）与补光灯策略 |
| **抓拍设置** Capture Settings | `/capture-settings` | 抓拍上传管道：上传模式、存储位置与记录管理 |
| **系统设置** System Settings | `/system-settings` | 通信方式、设备密码、固件升级 |
| **存储管理** Storage Management | `/storage-management` | SD 卡状态、容量、文件管理与存储策略 |
| **设备信息** Device Information | `/device-information` | 设备名称、MAC、SN、软硬件版本、供电与通信方式 |

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/feature-debugging.png" alt="功能调试主界面" style={{ maxWidth: '720px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 1. 功能调试（Feature Debugging）

功能调试是使用频率最高的模块，集成了实时预览、模型部署、推理调参、电源与工作模式、媒体流推送以及唤醒源（PIR / 远程控制 / 排程采集）配置。

### 1.1 功能引导

手机或 PC 首次连接设备时会弹出引导步骤（Select Model → 推理参数 → 唤醒源），可按引导完成首次配置，也可点击 Skip 跳过。引导完成后即进入功能调试主界面。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/guidance.png" alt="功能引导" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 1.2 实时预览工具栏

主界面顶部工具栏用于控制实时画面：

- **Reload**：重新加载实时视频流。
- **Photo Capture**：手动触发一次抓拍。
- **AI Inference**：开关实时 AI 推理叠加显示（默认开启）。
- **Stream Info**：查看当前视频流参数信息。
- **Snapshot**：将当前画面保存为快照。
- **Fullscreen**：全屏预览。

设备支持毫秒级视频流实时推理，通过本地 WiFi AP 在 Web 端实时预览画面并同步验证 AI 结果，无需依赖外部云服务。

### 1.3 模型管理

**Current Model** 区域显示当前部署的模型。NE301 基于 STM32N6 NPU 运行 TFLite Int8 推理，模型包按**输出数据格式**分为两种后缀：`_uf`（float32 输出）与 `_ui`（int8 输出）。出厂预置 YOLOv8 Nano 目标检测模型（COCO 80 类，`_uf` / Float32 输出版本）。点击 `upload / Choose File` 可上传新的模型包进行一键替换，部署完成后立即生效。

如果你希望训练适合自身场景的专用模型，可参考 [在 STM32N6 上训练与部署 YOLOv8](./3-application-guide/0-model-training-and-deployment/0-model-training-and-deployment.md)。

> 模型包需与固件大版本对齐：v4.3.1 对应 **4.x** 前缀的模型包，上传不匹配版本会触发校验提示；AI 分区升级为 8MB A/B 双槽，支持更大模型与双槽切换。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/change-model.gif" alt="模型替换" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 1.4 推理参数热加载

**Inference Settings** 支持推理参数热加载，拖动滑块或输入数值后即时生效，无需重启：

- **NMS Threshold**（NMS 阈值）：非极大值抑制阈值，范围 0–100，默认 50。值越小，重叠框抑制越强。
- **Confidence Threshold**（置信度阈值）：范围 0–100，默认 20。低于该阈值的检测结果将被过滤。

### 1.5 电源与工作模式

为兼顾性能与功耗，功能调试页提供三档性能相关配置：

- **Power Mode**（电源模式）：
  - `Full Speed Mode`（全速模式，默认）：满负荷运行，推理帧率最高，功耗最大。
  - `Low Power Mode`（低功耗模式）：降低算力与频率，适合电池供电的长期值守场景。
- **Operating Mode**（工作模式）：当前支持 `Image Mode`（图像模式），后续将扩展更多模式。
- **Work frequency**（工作频率）：CPU 主频可选 `HSE 200 MHz` / `HSE 400 MHz` / `HSI 800 MHz` / `HSE 800 MHz`（默认）。频率越高推理越快、功耗越大；低频适合节能场景。

> 提示：电池供电且需要长期运行的场景，建议使用 `Low Power Mode` + 较低工作频率，并配合下文的唤醒源策略，可显著延长续航。

### 1.6 媒体流推送（RTMP / RTSP）

**Stream Settings** 支持将设备画面以 RTMP 或 RTSP 协议推送到外部服务器，集成在功能调试页内，无需额外命令行操作。

- **Enable RTMP Service**（启用推流服务）：推流总开关，默认关闭。开启后设备**上电自动启动推流**（长按进入配置模式时同样自启；PIR / 定时等抓拍唤醒不会自启）；运行中关闭开关即停止推流。开关关闭时 URL / Secret Key 与 `connect` 均不可用。
- **Stream Type**：下拉选择 `RTMP` 或 `RTSP`。
- **URL**：流服务器地址（最大 256 字符）。
- **Secret Key**（密钥）：推流密钥（最大 128 字符，支持显示 / 隐藏切换）。
- **Status / Connection Duration**：实时显示连接状态（disconnected / connected）与持续时长。
- 开关开启后，点击 `connect` 可立即开始推流，状态变为 connected 表示推流成功；不开开关则等待下次上电自动启动。

> 高级调试仍可使用 CLI 指令 `rtmp_url <url> [stream_key]`。更详细的直播方案请参考 [RTMP 视频推流](./3-application-guide/8-rtmp-video-streaming.md)。

### 1.7 唤醒源配置（Wakeup Source Configuration）

唤醒源用于控制设备在低功耗状态下被何种事件唤醒并抓拍，包含 IO 触发-PIR、远程控制、排程采集三项，均通过开关启用，启用后展开详细配置。

#### IO 触发-PIR

通过 PIR（红外人体感应）传感器触发抓拍，适用于走廊、出入口等人体检测场景。启用后配置以下参数：

- **Usage**（触发沿）：`Rising Edge`（上升沿）或 `Falling Edge`（下降沿），对应传感器信号电平变化方向。
- **Sensitivity**（灵敏度）：范围 0–255。室内建议 20–50，室外适当调低以减少风吹草动误报。
- **Ignore Time**（忽略时间）：触发后传感器不响应的时间窗口（0–15），用于防止短时间内重复触发。
- **Pulse Count**（脉冲计数）：检测到多少个信号脉冲才视为一次有效触发（1–4），建议 2–3 以过滤干扰。
- **Window Time**（窗口时间）：判定有效触发的时间窗口（0–3）。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/pir-config.png" alt="PIR 触发配置" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

#### 远程控制（Remote Control）

启用后，设备可接收服务端下发的指令执行远程抓拍、休眠等操作，通过「应用管理 → MQTT」中的数据接收主题（Data Receiving Topic）下发。长期开启会增加网络开销，建议按需启用。

目前支持的远程控制指令：

拍照命令：

```json
{
  "cmd": "capture",
  "request_id": "req-001",
  "params": {
    "enable_ai": true,
    "chunk_size": 0,
    "store_to_sd": false
  }
}
```

睡眠命令：

```json
{
  "cmd": "sleep",
  "request_id": "req-002",
  "params": {
    "duration_sec": 60
  }
}
```

#### 排程采集（Scheduled Capture）

启用后排程采集，支持两种 Capture Mode，配置完成后点击 `confirm` 保存生效：

- **Interval（间隔抓图）**：按固定时间间隔抓拍。
  - **Interval Type**：`Normal`（常规间隔）或 `Scheduled`（按计划间隔）。
  - **Interval**：间隔数值，单位可选 `minute` / `hour` / `day`。
  - 页面实时显示 **Next Capture**（下次抓拍时间），便于确认排程。
- **Fixed Point（定点抓图）**：在每天指定的固定时间点抓拍，点击 `add` 添加多个时间点（00:00–23:59）。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture.png" alt="间隔抓图" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture-fixed.png" alt="定点抓图" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

配合 PIR 等硬件触发可构建「定时巡检 + 事件抓拍」的混合策略。

## 2. 模型验证（Model Validation）

模型验证用于离线测试当前部署模型的识别效果，无需到现场抓拍。在「模型验证」页点击或拖拽上传本地图片（支持 jpeg / png / jpg / webp），设备将使用当前模型对图片进行推理，**在图片上叠加绿色检测框**，并在下方实时显示 JSON 推理结果（检测类别、置信度、坐标），方便快速验证不同场景下的模型性能。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic1.png" alt="模型验证上传入口" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic2.png" alt="推理结果（检测框 + JSON）" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-validation.gif" alt="模型验证动图" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 3. 应用管理（Application Management）

应用管理用于配置设备的数据上报通道，支持 **MQTT/MQTTS** 与 **Webhook** 两种方式，通过顶部 Tab 切换。两者可按场景选用：MQTT 适合双向通信（上报 + 远程控制），Webhook 适合轻量单向数据推送。

### 3.1 MQTT/MQTTS

适合需要双向通信的场景（数据上报 + 远程控制下发）。

- **Protocol**（协议）：下拉选择 `MQTT` 或 `MQTTS`（SSL 加密），选择 MQTTS 后展开证书配置。
- **Server Address**（服务器地址）：MQTT 服务端的域名或 IP。
- **Port**（端口）：MQTT 默认 `1883`，MQTTS 默认 `8883`。
- **Data Receiving Topic**（数据接收主题）：设备订阅该主题以接收服务端下发的远程控制指令。
- **Data Reporting Topic**（数据上报主题）：设备将抓拍与推理数据发布到该主题。
- **Client ID**（客户端 ID）：设备在 MQTT 服务中的唯一标识。
- **QoS**：服务质量等级，可选 `QoS 0` / `QoS 1` / `QoS 2`。
- **Username / Password**：连接校验所需的用户名与密码。
- **CA Certificate**（仅 MQTTS）：上传 CA 证书，用于验证服务器身份。
- **Client Certificate**（仅 MQTTS）：上传客户端证书，用于双向认证。
- **Private Key**（仅 MQTTS）：上传客户端私钥，用于加密通信。
- **SNI (Server Name Indication)**（仅 MQTTS）：服务器名称指示，用于单台服务器承载多张 TLS 证书的场景。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-mqtt.png" alt="MQTT 配置" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-mqtts.png" alt="MQTTS 证书配置" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> 更多 MQTT 应用说明请参考 [MQTT 数据交互](./3-application-guide/2-mqtt-data-interaction/2-mqtt-data-interaction.md)。

### 3.2 Webhook

适合无需双向通信、仅需把抓拍 / 推理数据推送到自有服务的场景。设备通过 HTTP(S) POST 把数据推送到用户指定的 URL，接入比 MQTT 更轻量。

- **Enable Push**（启用推送）：开关 Webhook 推送。
- **Push Status**（推送状态）：显示当前启用 / 禁用。
- **HTTP(S) Push URL**（推送地址）：接收数据的服务端 URL，支持 HTTP 或 HTTPS。
- **Authentication**（认证）：可选认证方式（如 None），按服务端要求配置。
- **Custom CA Certificate**（自定义 CA 证书）：HTTPS 场景下可上传自签名 CA 证书；默认使用内置 CA 证书包（Using built-in CA bundle），支持 upload 上传与 Clear 清除。
- **Test Push**（测试推送）：一键发送测试请求，验证 URL 与证书是否正确。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/application-management-webhook.png" alt="Webhook 配置" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 4. 硬件管理（Hardware Management）

硬件管理包含**图像管理**与**灯光管理**两个子模块，通过顶部 Tab 切换。页面顶部显示相机模组的连接状态（Connection Status）。

### 4.1 图像管理（Image Management）

配置相机画面方向与抓拍参数：

- **Camera configuration**（相机配置）
  - **Flip Horizontal**：水平翻转画面，适用于安装后成像需要水平翻转的场景。
  - **Flip Vertical**：垂直翻转画面。
  - **ISP mode**（图像信号处理模式）：根据环境光照优化成像质量，默认 `Outdoor / bright light`（户外 / 强光），可按实际安装环境切换。
  - **Grayscale mode**（灰阶模式）：黑白成像模式，低光或纹理敏感的识别场景可开启，切换即时生效。
- **Capture configuration**（抓拍参数）已迁移至「抓拍设置」（见第 5 节），含跳帧数 / 分辨率 / JPEG 质量与上传参数。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/image-management.png" alt="图像管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 4.2 灯光管理（Lighting Management）

**Work Supplement Light**（补光灯模式）支持三种模式，按实际场景选择：

- **Always On**：补光灯常开。
- **Custom**：自定义时间段开启（如 20:00–06:00），时间范围内常开。
- **Always Off**：补光灯常关。

- **Use as fill light while working**（工作期补光）：开启后设备运行期间补光灯按上方配置常亮，运行期抓拍不再触发闪光；休眠唤醒抓拍仍按闪光逻辑。默认关闭。

> 提示：补光灯效果仅在近距离场景较明显；对功耗敏感的场景建议选择 Always Off。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/lighting-management.png" alt="灯光管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 5. 抓拍设置（Capture Settings）

抓拍设置管理「抓拍 → 存储 → 上报」的完整链路，包含**配置**（Capture Config）与**记录**（Records）两个标签页。

**Capture Config（配置）**

- **抓拍模式**（Capture Mode）：`Snap & Upload`（抓拍即传）/ `Batch Upload`(批量上传）/ `Scheduled Upload`（定时上传）/ `Store Only`（仅本地存储）四种。
- **存储位置**（Storage Location）：`Auto` 优先 SD 卡并支持热插拔自动切换；无 SD 卡时写入内部 Flash，记录总数上限 16–256（默认 32），超限自动删除最旧记录。
- **Storage Policy**（存储策略）：循环覆盖（Wrap）或到量停止（Stop）。
- **Upload Protocol / Upload Network**（上传协议 / 上传网络）：选择经 MQTT 或 Webhook 投递；上传网络默认跟随当前通信方式，仅对低功耗唤醒抓拍生效，上报配置需先在「应用管理」中完成。
- **Retry**（重试）：失败自动重试，最大次数可调（0 = 不限次）。
- **Keep Uploaded Files**（保留时长）：默认 72000 小时（≈ 永久保留，仅在满盘或达到上限时清理）；设为 0 表示上传成功即删。

**Records（记录）**

按日期管理抓拍记录：支持时间范围筛选、批量删除与重试、图片下载（原图 / 推理图）。抓拍目录在「存储管理 → File Manager」中为只读，记录请在本页管理。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/capture-settings.png" alt="抓拍设置" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> 以上为模块速览；各字段取值范围与组合策略以页面内提示为准。

## 6. 系统设置（System Settings）

系统设置包含**通信管理**、**设备密码**、**固件升级**三个子模块。

### 6.1 通信管理（Communications）

NE301 支持 WiFi、Cat-1、POE 与 Wi-Fi HaLow 通信方案（按机型硬件而定）。页面通过 **Change Communication Method**（切换通信方式）在不同方案间切换；选择 WiFi 方案时，页面会自动扫描并列出当前环境可用的 WiFi 热点。

**WiFi 连接流程**：在扫描列表中找到目标热点，点击右侧 `connect`，在弹出的「Enter Wi-Fi Password」对话框中输入密码并点击 `confirm` 即可连接。设备会保存最近一次连接的 SSID 与密码，重复设置时始终覆盖为最近一次。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-wifi.png" alt="WiFi 扫描列表" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wifi-connect-password.png" alt="WiFi 密码输入" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **WiFi 方案**：标准版本自带。在配置界面选择目标 WiFi，输入密码后连接；重复设置时设备始终保存最近一次的 SSID 与密码。连接外部网络后，可在已连网络详情中查看链路与 IP 信息（SSID / 信号强度 / 信道 / IP 配置）；页面提供 **Region**（国家码）设置（us / eu / jp / kr / cn），按所在地区选择。
- **Cat-1 方案**：需在设备前盖 SIM 卡槽插入 SIM 卡（当前支持除北美以外的大部分地区），插入后页面自动读取 **IMEI**。在 Cellular 配置中按运营商信息填写 **APN**、**Cellular Username**、**Cellular Password**、**PIN Code**，选择 **Authentication**（认证类型）、**Operator**（运营商，默认 Auto，支持手动指定 PLMN）、**Roaming**（漫游开关）；可在下方 **AT Commands** 区域输入 AT 指令点击 `Send` 测试 modem 响应。填写完成后点击 `save` 保存，再点 `connect` 拨号，可通过 `details` 查看网络注册详情。
<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-cellular.png" alt="Cat-1 蜂窝网络配置" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **Wi-Fi HaLow 方案**（802.11ah，选配 HaLow 模组机型）：通信方式切换为 `Wi-Fi HaLow` 后，页面提供 Region 国家码、HaLow 网络扫描接入与 IP 配置，以及射频参数（**Radio Settings**：发射功率、扫描驻留时间、MCS、带宽、保护间隔）与省电模式开关（默认关闭）。HaLow 网络需配合 HaLow 网关使用；HaLow 与 PoE / 4G 存在硬件互斥，切换时设备会自动停用冲突链路。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-halow.png" alt="Wi-Fi HaLow 网络扫描" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **POE 方案**（以太网供电）：插入网线后页面自动显示「网线已连接」及供电状态（如 `POE_ONLINE`）。IP 获取支持 DHCP（默认，自动获取）与 Static（静态 IP，需手动填写 IP / 掩码 / 网关 / DNS）。遇到网络问题时会显示具体错误码（如 `POE_STATUS_DHCP_FAILED`、`POE_STATUS_IP_CONFLICT`）。

> 注意：切换通信方式或连接到外部 WiFi 时，设备可能会关闭本地 WiFi AP，导致当前配置页面断开。请在确认设备已成功加入目标网络后，通过新网络访问设备。

### 6.2 设备密码（Device Password）

#### 本机 WiFi 设置（Local WiFi Settings）

- **WiFi Name**：设备热点名称，命名规则为 `NE301{Mac 后六位}`，MAC 信息见设备外壳标签。
- **热点不设密码**：v4.3.1 起热点固定为开放网络，不再支持设置密码（WiFi 芯片限制：设置密码会导致 STA 模式无法联网）；旧固件保存过的热点密码升级后自动失效。
- **Sleep Time**：热点空闲自动关闭时间，固定档可选 永不 / 10 / 20 / 30 分钟（默认永不）；网页登录密码（默认 `hicamthink`）见下方「登录密码」。

#### 登录密码（Login Password）

- **Username**：系统内置，固定不可修改。
- **Password**：输入当前密码与新密码后保存生效。规则为 8–32 位，建议包含字母、数字与符号，避免使用与设备信息相关的弱口令。
- 支持显示 / 隐藏密码切换。若遗忘密码，可通过「设备重置」恢复出厂设置，密码恢复为 `hicamthink`（重置会清除所有自定义配置，请提前导出备份）。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-pwd.png" alt="设备密码" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 6.3 固件升级（Firmware Upgrade）

页面顶部 **Firmware Information** 逐项显示六个组件版本（App / Web / AI 模型 / FSBL / WakeCore / WiFi 固件，4.x 与固件大版本对齐）。App / Web 为日常升级对象；WiFi 固件不匹配时 Web 自动引导升级（推送到芯片约 1–3 分钟，期间勿断电）。

**升级方式**：点击 **Import Firmware** 上传对应 `_pkg.bin`（App / Web / AI 模型 / 配置文件）；FSBL / WiFi / 整合包入口在 **Advanced Options** 中。整机升级推荐**整合包一键升级**——上传 `*_bundle.bin` 一次完成，支持分区表迁移，同版本条目可跳过。固件按版本从 [GitHub Releases](https://github.com/camthink-ai/ne301/releases) 下载。配置导入为合并语义（缺失项保留设备当前值），导出一键备份当前配置；模型导入见 [1.3 模型管理](#_3-模型管理)。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-import-advanced.png" alt="导入固件对话框与高级选项" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> **从 v2.1.0 升级**：分区表已重新设计，必须按官方指引顺序升级，跳步或乱序将导致 Web 无法访问；**MQTTS 证书 / 私钥会丢失**，请提前备份。详见 [OTA 升级指南](https://github.com/camthink-ai/ne301/blob/main/Docs/NE301_v4.3.1_OTA_Update_Guide.md)。升级过程保持供电稳定，失败会保留旧版本，不会变砖。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-upgrade.png" alt="固件升级" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 7. 存储管理（Storage Management）

存储管理用于管理设备的存储介质，支持将抓拍图像与推理结果落盘到本地 SD 卡，便于断网时本地留存。

- **Internal Flash**（内部 Flash）：显示内部 Flash 的容量与使用情况，并提供 **File Manager** 入口——可在浏览器中管理内部 Flash 与 SD 卡文件（浏览 / 上传 / 删除 / 格式化）；`captures` 抓拍目录为只读，记录请到「抓拍设置 → Records」管理。
- **SD Card Status**（SD 卡状态）：显示 SD 卡是否被检测到（如 Not Detected 表示未插入或未识别）。
- **Capacity**（容量）：显示已用 / 总容量（如 Used 0 GB / 0.00 GB）。
- **Storage Policy**（存储策略）：当前支持 `Loop Coverage`（循环覆盖），即 SD 卡写满后自动覆盖最旧的数据，保证持续录制不中断。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/storage-management.png" alt="存储管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 8. 设备信息（Device Information）

展示设备的核心属性，字段说明如下：

| 字段 | 说明 |
|:---|:---|
| Device Name | 设备名称，默认 `NE301{Mac 后六位}`，可手动修改；数据上报时随 JSON 的 `devName` 字段上传 |
| MAC Address | 设备 MAC 地址 |
| SN | 设备唯一标识，用于身份判断与售后服务 |
| Hardware Version | 硬件版本 |
| Software Version | 当前固件版本 |
| Camera Module | 相机模组型号 |
| Function Extension Module | 功能扩展模块型号，无则显示 `--` |
| Memory Card | 存储卡型号与容量，无则显示 `--` |
| Power Supply | 供电状态：电池供电时显示电量（高 / 中 / 低，对应绿 / 橙 / 红三色标识）；外接供电（太阳能 / USB / POE）显示常供电标识 |
| Communication | 通信方式：wifi / cat-1 / poe |

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-information.png" alt="设备信息" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 出厂重置（Factory Reset）

**操作步骤**

快速按两次拍照键，随后长按约 10 秒，设备即恢复出厂设置。

**清除范围**

重置会清除所有自定义配置，包括：

- 自定义模型（恢复为出厂预置模型）
- 网络与通信设置（WiFi / Cat-1 / POE 等）
- 各项功能参数与设备密码（密码恢复为默认 `hicamthink`）

**操作前备份**

重置不可撤销，建议操作前通过「系统设置 → 固件升级 → Export Firmware」导出当前配置（`.json`）备份，以便事后恢复或跨设备批量下发。
