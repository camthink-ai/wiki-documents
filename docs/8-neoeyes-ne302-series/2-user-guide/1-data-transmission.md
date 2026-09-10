---
id: ne302-data-transmission
title: Data Transmission
sidebar_position: 1
description: 说明如何在 NE302 Web 控制台中配置 MQTT、MQTTS、Webhook 与 RTSP/RTMP 视频流的数据发送和验证。
keywords: [NE302, Application Management, MQTT, MQTTS, Webhook, RTSP, RTMP]
tags: [NE302, 用户指南, 数据发送, MQTT, Webhook]
---

# Data Transmission

在**应用管理**中设置 MQTT/MQTTS 或 Webhook，将设备结果发送到外部系统；如需输出视频，则在**功能调试 → 视频流设置**中配置 RTSP 或 RTMP。先在[AI 模型验证](./2-ai-model-validation.md)中用固定图片确认本地结果正常，再配置外部通道。

## 1. MQTT/MQTTS

打开**应用管理 → MQTT/MQTTS**。填写连接信息后，先点击**保存**，再点击**连接**；只有**连接状态**显示“已连接”时，设备才算成功连接到 Broker。

![应用管理中的 MQTT/MQTTS 配置页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/data-transmission/ne302-application-management-mqtt.png)

| 字段 | 怎么填 | 何时需要注意 |
| :--- | :--- | :--- |
| 协议 | 选择 MQTT 或 MQTTS。切换协议会断开当前 MQTT 连接。 | 切换到 MQTT 时端口自动改为 1883；切换到 MQTTS 时自动改为 8883，仍应以 Broker 实际监听端口为准。 |
| 服务器地址 / 端口 | 填写设备能够访问的 Broker 主机名或 IP 地址及监听端口。 | 连接失败时先核对这两项和设备网络连通性。 |
| 数据接收主题 / 数据上报主题 | 分别填设备接收和设备上报所用的主题。 | 接收端订阅**数据上报主题**才能看到设备上报。主题最长 128 个字符。 |
| 客户端 ID | 为每台设备填唯一 ID。 | 重复的客户端 ID 可能使已有客户端被 Broker 断开；长度不超过 23 个字符。 |
| 服务质量 | 按接收端的订阅策略选择。 | 若接收端不能处理重复消息，应先在测试主题验证。 |
| 用户名 / 密码 | 按 Broker 的认证要求填写。 | 用户名和密码最长 32 个字符；页面不会显示密码明文。 |

使用 MQTTS 时，展开证书设置，按 Broker 要求上传 CA 证书；需要双向认证时再上传客户端证书和私钥，并填写 SNI。保存并连接后，在 Broker 的**数据上报主题**订阅一条由固定图片触发的结果。页面显示“已连接”但收不到消息时，优先检查订阅主题、客户端 ID 和 Broker ACL。

## 2. Webhook

打开**应用管理 → Webhook**，开启**启用推送**，填写接收端的 HTTP(S) 地址，然后点击**保存**。地址必须以 `http://` 或 `https://` 开头，且不超过 256 个字符。

![应用管理中的 Webhook 配置页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/data-transmission/ne302-application-management-webhook.png)

| 设置 | 作用 | 操作要点 |
| :--- | :--- | :--- |
| 启用推送 | 控制是否发送 Webhook。 | 保存后查看**推送状态**；状态显示“已启用”时才会推送。 |
| 认证方式 | 选择接收端要求的认证方式。 | 选择非“无”的方式后必须填写**认证密钥 / 令牌**。 |
| 自定义 CA 证书 | 让设备验证私有 CA 签发的 HTTPS 服务端证书。 | 公共 CA 可保留内置 CA 证书包；更换自定义证书时先点**清除**再上传新文件。 |
| 测试推送 | 向当前 URL 发送测试请求。 | 先保存，再点击；成功提示只证明测试请求已发送，仍需用固定图片验证实际结果上报。 |

验证时，先在接收服务查看测试推送请求，再执行一次固定图片推理。接收服务同时收到测试请求和结果请求，且**推送状态**保持启用时，即可认为该通道已基本连通。

## 3. 视频流

打开**功能调试 → 视频流设置**，选择所需协议后保存配置。

![功能调试中视频流设置的 RTSP 配置页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/data-transmission/ne302-stream-settings-rtsp.png)

| 协议 | 设备端操作 | 通过标准 |
| :--- | :--- | :--- |
| **RTSP** | 开启 RTSP 服务，设置端口；需要认证时选择摘要认证并填写用户名和密码。页面会生成视频流 URL。 | 用同一网络的播放器打开该 URL 并持续看到画面。 |
| **RTMP** | 填写服务端 URL 和流密钥，启用后启动推送。 | 流媒体服务端出现活动输入流并可播放画面。 |

RTSP 端口必须在 1–65535 之间。RTMP 的 Stream Key 最长 128 个字符。页面显示正常但外部看不到画面时，先检查协议、地址、端口或 Stream Key，再检查播放器或流服务端日志。
