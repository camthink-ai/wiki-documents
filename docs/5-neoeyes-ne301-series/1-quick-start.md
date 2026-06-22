---
description: 本教程详细介绍 NeoEyes NE301 的完整上手流程，涵盖设备组装、Web UI 连接登录，以及功能调试、模型验证、应用管理、硬件管理、系统设置、存储管理、设备信息七大模块的配置与使用，帮助开发者快速完成边缘 AI 应用的部署与调试。
keywords: [NE301快速开始, NeoEyes教程, AI相机配置, Web UI调试, 模型部署, MQTT配置, Webhook推送, 边缘AI入门, 固件升级, 实时推理]
tags: [快速入门, NE301, 使用教程, AI调试, 配置指南]
---

# Quick Start

## 概述

本教程将详细说明 NeoEyes NE301 如何从 0 开始上手使用，涵盖内容有：设备安装、基本使用、Web UI 七大功能模块的配置与调试、模型部署与数据上报等。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/ne301-2.png" alt="ne301" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/ne301-1.png" alt="ne301" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 产品准备

- NE301 主机一套（含主板、电池仓、外壳）
- AA 电池 4 节，或直流 / 太阳能等替代供电方案
- 十字螺丝刀、安装支架及固定件
- 可选扩展：Cat-1 模块、不同规格的镜头模组
- 可连接 WiFi 的电脑或手机，用于访问设备 Web 页面

> 提示：整机版本已预装核心固件与出厂模型，仅需装入电池即可进入调试。若使用开发板版本，请确认各扩展板连接牢固，再完成装配。

## 产品使用

### 设备开机

使用螺丝刀拆卸 NE301 后盖，按照电池仓分布安装电池，等待相机前部的蓝色灯光亮起后，表示相机系统已经成功启动。确定开机顺利后即可将后盖重新安装回设备，到这里你便完成了设备的基本启动，接下来可对设备进行配置。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup1.jpg" alt="开机示例" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup2.jpg" alt="电池安装" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
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

登录后进入 Web 主界面，顶部导航栏提供 7 个功能模块，覆盖设备调试、应用对接与系统管理的全部能力：

| 模块 | 路径 | 作用 |
|:---|:---|:---|
| **功能调试** Feature Debugging | `/device-tool` | 实时预览、模型管理、推理参数、电源模式、媒体流推送、唤醒源配置 |
| **模型验证** Model Validation | `/model-verification` | 上传本地图片用当前模型离线推理，输出 JSON 结果 |
| **应用管理** Application Management | `/application-management` | 数据上报通道配置：MQTT/MQTTS 与 Webhook |
| **硬件管理** Hardware Management | `/hardware-management` | 图像参数（翻转、ISP、抓拍）与补光灯策略 |
| **系统设置** System Settings | `/system-settings` | 通信方式、设备密码、固件升级 |
| **存储管理** Storage Management | `/storage-management` | SD 卡状态、容量与存储策略 |
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

- **Stream Type**：下拉选择 `RTMP` 或 `RTSP`。
- **URL**：流服务器地址（最大 256 字符）。
- **Secret Key**（密钥）：推流密钥（最大 128 字符，支持显示 / 隐藏切换）。
- **Status / Connection Duration**：实时显示连接状态（disconnected / connected）与持续时长。
- 点击 `connect` 即可开始推流，状态变为 connected 表示推流成功。

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
- **Capture configuration**（抓拍配置）
  - **Skip frames**：跳帧数，默认 30，用于抓拍前跳过若干帧以获得稳定画面。
  - **Resolution**：抓拍分辨率，支持 `1280x720` / `1920x1080` / `2688x1520` 三档。
  - **JPEG quality**：JPEG 图像质量，默认 80。质量越高图像越大，超过 1 MB 时将自动分块上传，上传时间相应延长。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/image-management.png" alt="图像管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 4.2 灯光管理（Lighting Management）

**Work Supplement Light**（补光灯模式）支持三种模式，按实际场景选择：

- **Always On**：补光灯常开。
- **Custom**：自定义时间段开启（如 20:00–06:00），时间范围内常开。
- **Always Off**：补光灯常关。

> 提示：补光灯效果仅在近距离场景较明显；对功耗敏感的场景建议选择 Always Off。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/lighting-management.png" alt="灯光管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 5. 系统设置（System Settings）

系统设置包含**通信管理**、**设备密码**、**固件升级**三个子模块。

### 5.1 通信管理（Communications）

NE301 支持 WiFi、Cat-1、POE 三种通信方案。页面通过 **Change Communication Method**（切换通信方式）在不同方案间切换；选择 WiFi 方案时，页面会自动扫描并列出当前环境可用的 WiFi 热点。

**WiFi 连接流程**：在扫描列表中找到目标热点，点击右侧 `connect`，在弹出的「Enter Wi-Fi Password」对话框中输入密码并点击 `confirm` 即可连接。设备会保存最近一次连接的 SSID 与密码，重复设置时始终覆盖为最近一次。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-wifi.png" alt="WiFi 扫描列表" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wifi-connect-password.png" alt="WiFi 密码输入" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **WiFi 方案**：标准版本自带。在配置界面选择目标 WiFi，输入密码后连接；重复设置时设备始终保存最近一次的 SSID 与密码。
- **Cat-1 方案**：需在设备前盖 SIM 卡槽插入 SIM 卡（当前支持除北美以外的大部分地区），插入后页面自动读取 **IMEI**。在 Cellular 配置中按运营商信息填写 **APN**、**Cellular Username**、**Cellular Password**、**PIN Code**，选择 **Authentication**（认证类型）、**Operator**（运营商，默认 Auto）、**Roaming**（漫游开关）；可在下方 **AT Commands** 区域输入 AT 指令点击 `Send` 测试 modem 响应。填写完成后点击 `save` 保存，再点 `connect` 拨号，可通过 `details` 查看网络注册详情。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications-cellular.png" alt="Cat-1 蜂窝网络配置" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **POE 方案**（以太网供电）：插入网线后页面自动显示「网线已连接」及供电状态（如 `POE_ONLINE`）。IP 获取支持 DHCP（默认，自动获取）与 Static（静态 IP，需手动填写 IP / 掩码 / 网关 / DNS）。遇到网络问题时会显示具体错误码（如 `POE_STATUS_DHCP_FAILED`、`POE_STATUS_IP_CONFLICT`）。

> 注意：切换通信方式或连接到外部 WiFi 时，设备可能会关闭本地 WiFi AP，导致当前配置页面断开。请在确认设备已成功加入目标网络后，通过新网络访问设备。

### 5.2 设备密码（Device Password）

#### 本机 WiFi 设置（Local WiFi Settings）

- **WiFi Name**：设备热点名称，命名规则为 `NE301{Mac 后六位}`，MAC 信息见设备外壳标签。
- **WiFi Password**：默认**无密码**（开放热点，连接无需输入密码）；可在此设置一个 WiFi 密码，修改后 WiFi AP 将重启，可能需要重新连接。网页登录密码（默认 `hicamthink`）见下方「登录密码」。
- **Sleep Time**：WiFi AP 开启后的自动关闭时间，默认 30 分钟，期间的 Web 操作会重置计时。为减少电池功耗，不建议长时间开启。

#### 登录密码（Login Password）

- **Username**：系统内置，固定不可修改。
- **Password**：输入当前密码与新密码后保存生效。规则建议 8–20 位，包含字母、数字与符号，避免使用与设备信息相关的弱口令。
- 支持显示 / 隐藏密码切换。若遗忘密码，可通过「设备重置」恢复出厂设置，密码恢复为 `hicamthink`（重置会清除所有自定义配置，请提前导出备份）。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-pwd.png" alt="设备密码" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 5.3 固件升级（Firmware Upgrade）

用于查看固件版本、执行本地升级，以及模型与配置的导入导出。页面顶部显示当前固件版本信息，下方提供导入（Import）与导出（Export）操作。

**固件版本信息（Firmware Information）**

NE301 的固件由以下几部分组成，页面逐项显示版本号。按是否需要日常升级标注如下：

- **App Version**：主应用固件——设备核心逻辑。**【日常升级】**常规升级的主要对象。
- **Web Version**：Web 前端——本配置界面本身。**【日常升级】**随 App 一并升级。
- **FSBL Version**：第一阶段引导加载器。**【特殊升级】**仅引导相关更新时才需要，日常无需升级。
- **AI Model Version**：当前模型包版本。**【按需】**模型导入 / 替换时变化（见下文）。
- **WakeCore Version**：唤醒核固件——负责低功耗唤醒。**【一般无需升级】**日常不动。

**导入（Import）**

按导入内容分三类，入口与方式各不相同：

1. **固件升级（APP / Web / FSBL）**：日常升级覆盖 APP 与 Web；FSBL 仅特殊情况升级。三者均通过 Web 页面上传 `_pkg.bin` 包刷入（**网页升级只认 `_pkg.bin` 后缀，纯 `.bin` 文件无法网页升级**）。
   - **APP / Web**：在本页点击 **Import Firmware**，选择对应 `pkg.bin` 文件上传。
   - **FSBL**：专用路径——登录配置页面后，在浏览器地址栏访问 `http://192.168.10.10/import-fsbl`，上传 `ne301_FSBL_signed_*_pkg.bin`。
   - **升级顺序**：建议 **FSBL → APP → Web**，每完成一项等待设备自动重启并重新连接 AP 后，再进行下一项。
   - **固件示例**（可从 GitHub Releases 下载）：
     - APP：[ne301_App_signed_v2.0.1.30_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_App_signed_v2.0.1.30_pkg.bin)
     - Web：[ne301_Web_v1.3.4.4_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_Web_v1.3.4.4_pkg.bin)
     - FSBL：[ne301_FSBL_signed_v1.0.0.2_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_FSBL_signed_v1.0.0.2_pkg.bin)
2. **模型导入（按需）**：在「功能调试 → Current Model」上传模型包（模型文件 + 参数），部署后在功能调试页验证推理效果（详见 1.3 模型管理）。
3. **配置导入（按需）**：将此前导出的 `.json` 配置文件重新导入设备，用于批量下发或异常恢复。跨固件版本导入可能存在不兼容项，若导入失败请参考版本发布说明或先升级到兼容版本。

点击 **Import Firmware** 弹出如下对话框，按类别上传对应的 `_pkg.bin` 包后点击 **Confirm Burn** 开始刷入：

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-import.png" alt="导入固件对话框" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**导出（Export）**

- **Export Firmware**：一键导出当前设备配置（`.json`），用于备份与跨设备批量下发。建议在升级或重置前先导出。

> 升级与导入过程请保持供电稳定，操作完成前不要断电或刷新页面；升级失败会保留旧版本，设备不会变砖。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/firmware-upgrade.png" alt="固件升级" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 6. 存储管理（Storage Management）

存储管理用于管理设备的 SD 卡存储，支持将抓拍图像与推理结果落盘到本地 SD 卡，便于断网时本地留存。

- **SD Card Status**（SD 卡状态）：显示 SD 卡是否被检测到（如 Not Detected 表示未插入或未识别）。
- **Capacity**（容量）：显示已用 / 总容量（如 Used 0 GB / 0.00 GB）。
- **Storage Policy**（存储策略）：当前支持 `Loop Coverage`（循环覆盖），即 SD 卡写满后自动覆盖最旧的数据，保证持续录制不中断。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/storage-management.png" alt="存储管理" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 7. 设备信息（Device Information）

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
