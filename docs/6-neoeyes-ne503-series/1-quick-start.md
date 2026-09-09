---
description: NE503 快速入门：完成首次上电、登录、画面和 AI 验证。
keywords: [NE503 快速入门, 首次部署, Web 登录, AI Model Showcase, 默认 IP]
tags: [快速入门, NE503, 首次部署]
---

# Quick Start

完成：上电连接 → 登录改密 → 验证画面和码流 → 体验 AI → 配置网络。

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-main.png" alt="NeoEyes NE503" width="100%" />
</div>

## 1. 准备

| 项目 | 要求 |
|:--|:--|
| 供电 | PoE 802.3AT，或 DC 12V |
| 网络 | 交换机、网线、可设置以太网 IP 的电脑 |
| 浏览器 | Chrome、Edge、Firefox 或 Safari |

IP67，工作温度 -40 °C ~ +60 °C，功耗 5–6 W。安装需使用匹配的壁挂或其他支架。

## 2. 上电并连接

PoE：网线接 PoE 交换机；DC：12V 适配器接 DC 口。指示灯常亮后进入下一步（约 30–60 秒）。

出厂 IP 为 `10.0.0.1`。将电脑设为同网段地址，例如 `10.0.0.100/24`，然后执行：

~~~bash
ping 10.0.0.1
~~~

能通即连接成功。不能连接时检查供电、网线、电脑 IP 和防火墙；若设备已接入 DHCP，从路由器查询新地址。

## 3. 登录并改密

访问 `https://10.0.0.1`，用 `admin` / `password` 登录。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-login.png" />

进入 **Settings → Device Info → Change Password**，设置新密码并保存。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png" />

> 设备没有本地密码重置功能。忘记密码需联系支持重新刷机。

## 4. 验证画面和码流

进入 **Media**，看到实时画面即摄像头链路正常。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-media.png" />

开启 **Enable RTSP Stream**，用 VLC 打开：

~~~text
rtsp://<设备IP>:8554/main
~~~

能正常播放即拉流成功。黑屏或卡顿时确认 RTSP 已保存，并在播放器中使用 TCP。

## 5. 体验 AI

下载 [model-showcase-latest-arm64.neoapp](https://github.com/camthink-ai/neoruntime-apps/releases)。

在 **Applications → Import → Upload Package** 中选择该 `.neoapp` 文件，按需授予模型和码流权限后点击 **Install**。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-app-management.png" />

启动应用，点击 **Visit App** 查看推理结果。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-model-showcase.png" />

源码、SDK 和构建资源见 [Resources](./4-application-guide/3-resources.md)。

## 6. 配置网络和时区

进入 **Settings → Network**，选择 DHCP 或 Static Address。保存后使用新 IP 重新访问设备。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-network.png" />

进入 **Settings → Time Settings**，选择时区，配置 NTP 后点击 **Sync Now**。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-time-settings.png" />

设备维护见[设备维护](./2-user-guide/5-device-maintenance.md)。
