---
description: NE503 Media 和 Image 页的码流、RTSP、画面、隐私遮罩、镜头与红外配置。
keywords: [NE503 视频, 码流, RTSP, VLC, AI ISP, 隐私遮罩, 镜头控制]
tags: [用户指南, NE503, 视频, 图像, RTSP]
---

# Video and Imaging

**Media** 配置码流和 RTSP，**Image** 配置画面、叠加、镜头和红外。

## 实时画面与码流

进入 **Media** 页面：主区域是实时画面，上方是工具栏，右侧 **Configuration** 面板配置码流与 RTSP。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-media.png" />

### 工具栏

工具栏提供音量、对讲、截图和全屏操作；对讲需接扬声器。

### 码流设置

切换 **Main / Sub / Third** 后按需调整编码格式、分辨率、帧率、码率和 I 帧间隔。带宽不足时降低分辨率或码率；不用的码流关闭。

### RTSP 推流

开启 **Enable RTSP Stream** 后，所选码流即开放标准 RTSP 地址，输入框中显示 URL，可一键复制：

| 码流 | 地址 |
|------|------|
| 主码流 | `rtsp://<设备IP>:8554/main` |
| 子码流 | `rtsp://<设备IP>:8554/sub` |
| 三码流 | `rtsp://<设备IP>:8554/third` |

默认端口 `8554`。

## RTSP 对接

外部系统通过 RTSP 拉取码流。

- 仅支持 RTSP over TCP。
- RTSP 默认端口为 `8554`，无用户名和密码；公网部署前配置防火墙，见[安全加固](./7-security-hardening.md)。
- AI 应用使用 `sub` 或 `third` 原始帧；`main` 仅提供编码流，不能作为推理输入。

### 示例：用 VLC 验证拉流

RTSP 是 NE503 对接 NVR / VMS 的主要协议。用 VLC 快速验证能否正常拉流：

1. 打开 VLC → 媒体 → 打开网络串流，输入上表中的 RTSP 地址：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network.png" alt="VLC 打开网络串流" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network-2.png" alt="VLC 输入 RTSP 地址" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

2. 点击播放，确认画面流畅、无花屏：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-1.png" alt="VLC 播放验证" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-2.png" alt="VLC 播放成功" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

> 无法拉流时，用 `aipc-cli stream list` 确认码流状态。

### 命令行验证

FFmpeg 拉流必须指定 TCP：

```bash
ffmpeg -rtsp_transport tcp -i "rtsp://<设备IP>:8554/main" -t 10 -f null -
```

命令无报错并持续收到帧，即可继续配置 NVR 或 VMS。

### 接入 NVR / VMS

NE503 使用 RTSP 对接，不提供 ONVIF 自动发现。在 NVR 中手动添加：

1. 选择「手动添加设备」或「自定义 RTSP」
2. 填写 RTSP 地址：`rtsp://<设备IP>:8554/main`
3. 传输协议选择 **TCP**
4. 按需选码流：NVR 录像用 `main`，多画面预览用 `sub`

## 画面、叠加与镜头

**Image** 页面包含 **Image / Overlay / Control** 三个子标签。控件随镜头配置变化。

### 画质与变换（Image 标签）

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-quality.png" />

开启 **Enable AI ISP** 可增强弱光和高动态场景。

**ISP 设置**

Manual Mode 用于固定曝光、增益和白平衡；Powerline Frequency 选择现场 50Hz/60Hz；White Balance 在偏色时调整。

**画面变换（Transform）**

Rotation / Flip 按安装方向调整；Distortion 用于广角畸变校正；Grayscale 用于灰度画面；DIS / EIS 用于防抖，EIS 需要陀螺仪。

### 叠加层与隐私遮罩（Overlay 标签）

在 **Overlay** 中选择 **Stream**，再配置叠加或遮罩。叠加可在预览画面中拖动。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-overlay.png" />

**信息叠加**

Text Overlay、DateTime Overlay 和 Image Overlay 分别用于显示文字、时间和图片，按页面提供的尺寸和上传限制配置。

**隐私遮罩**

Privacy Mask 遮挡固定区域；AI Auto Mask 跟随目标遮挡。两者相互独立。

### 镜头与红外（Control 标签）

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-control.png" />

**镜头控制**

Zoom、Focus 和 One-shot AF 用于调整镜头；Reset to 1.0x 恢复最小倍率；IR-Cut Filter 切换红外滤光片。

**红外补光（IR Light Control）**

Near IR 和 Far IR 分别控制近、远距离红外补光及亮度，按场景和距离调整。

应用远程控制镜头或红外时，需要授予 **Device Control** 权限。
