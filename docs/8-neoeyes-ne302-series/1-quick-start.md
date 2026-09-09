---
id: ne302-quick-start
title: Quick Guide
sidebar_position: 1
description: 帮助首次使用者完成 NE302 的组装、上电、登录、模型验证和一次触发记录，并确认首次使用是否成功。
keywords: [NE302, 快速指南, Web 控制台, Feature Debugging, Model Validation]
tags: [NE302, 快速指南, NeoEyes]
---

# Quick Guide

按以下路径完成首次验证：组装并上电 → 登录 Web 控制台 → 确认画面 → 上传模型并验证图片 → 触发一次并确认记录。字段说明和故障排查见用户指南。

## 1. 准备硬件

准备 NE302 主板、接口板、摄像头组件、当前 SKU 对应的天线，以及 USB Type-C（5 V）持续电源或通过 USB Type-C 供电的交付兼容外部电池组。需要保存抓拍记录时，再准备 MicroSD 卡和一台可访问设备网络的电脑。

本流程适用于 NE302 整机（主板 + 接口板）。主板也可用于单主板定制集成，应按交付资料使用 DC 供电；其中不适用接口板提供的 MicroSD 相关步骤。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', margin: '24px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-product-render-cropped.png" alt="NE302 白色外置天线成品图" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-board-connection-tight-v2.png" alt="NE302 主板和接口板组装图" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
</div>

左图为成品，右图为主板与接口板组装状态。供电、天线和板卡版本以交付硬件资料为准。

## 2. 组装并上电

1. 在断电状态下，按板间连接器的防呆方向连接主板和接口板；不要强行插入或斜插。
2. 连接当前 SKU 对应的天线；需要本地保存时插入 MicroSD 卡。
3. 按现场视野将设备固定到位。标准外壳可使用后置磁吸或双面胶，具体操作见下文。
4. 按交付资料将 USB Type-C 接至持续电源或兼容的外部电池组，等待设备启动。

### 安装方式

本节适用于带标准外壳的双板整机。先在断电状态下完成安装，确认镜头视野无遮挡、供电线缆和天线有维护空间。单主板配置应按交付资料完成 DC 供电和机械固定；本节的标准外壳安装方式不一定适用。

**后置磁吸**

1. 选择可被磁铁吸附的平整安装面，并确认安装位置能覆盖目标视野。
2. 让设备背面的磁吸面完全贴合安装面。
3. 轻推设备，确认不会滑动或脱落；再连接天线和电源线，避免线缆拉扯设备。

**背面双面胶**

1. 选择平整、干燥的安装面，清洁设备背面和安装面。
2. 撕下双面胶的离型膜，对准目标位置后将设备背面均匀压紧。
3. 确认设备已固定，再连接天线和电源线，避免线缆拉扯设备。

安装后，确认镜头前方无遮挡，外置天线已固定并避开大面积金属遮挡。上电后在**功能调试**中检查预览画面的取景方向和覆盖范围；若画面不合适，先断电调整安装位置，再重新检查预览。

如果设备没有启动，先断电检查板间连接、摄像头连接和供电，再重新上电。

## 3. 登录 Web 控制台

1. 让电脑连接到交付资料指定的设备网络。
2. 在浏览器打开设备地址。部分测试设备使用 `http://192.168.10.10/`，实际地址以设备配置为准。
3. 使用随设备提供的凭据登录；如页面要求修改登录密码，按提示完成后用新密码重新登录。

![NE302 Web 控制台登录页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-login.png)

登录成功后，即可看到控制台的功能导航。

## 4. 确认实时画面

1. 打开**功能调试**。
2. 等待预览区域和相机设置加载完成。
3. 确认预览持续显示图像，且画面方向与安装方向一致。

![NE302 功能调试中的实时画面和相机设置](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging.png)

没有画面时，先检查摄像头连接和供电，再参阅[抓拍与存储](./2-user-guide/0-capture-storage.md)。

## 5. 上传模型并验证图片

1. 从 [CamThink 开发者中心的模型页面](https://www.camthink.ai/developer-center/models/) 下载与当前设备匹配的 `.bin` 模型包。
2. 在**功能调试 → 相机设置**的当前模型区域选择**上传**，等待模型加载完成。
3. 打开**模型验证**，上传一张固定测试图片。
4. 等待结果区域更新，确认已出现本次推理结果。

![NE302 模型验证页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-model-validation.png)

模型格式、参数和结果解读见[AI 模型验证](./2-user-guide/2-ai-model-validation.md)。

## 6. 触发一次并确认记录

1. 在**功能调试 → 唤醒源配置**中只启用一种测试来源，并保存设置。
2. 用该来源触发一次抓拍。
3. 打开**抓拍设置 → 记录**，按触发时间找到对应记录。

![NE302 唤醒源配置页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging-stream-wakeup.png)

![NE302 抓拍设置中的记录页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-capture-records.png)

当记录列表出现对应时间的条目时，首次抓拍验证完成。

## 7. 下一步

- [抓拍与存储](./2-user-guide/0-capture-storage.md)：配置抓拍、存储和触发。
- [数据传输](./2-user-guide/1-data-transmission.md)：配置 MQTT/MQTTS、Webhook 和媒体流发送。
- [AI 模型验证](./2-user-guide/2-ai-model-validation.md)：管理模型和推理验证。
- [系统维护](./2-user-guide/3-system-maintenance.md)：管理网络、固件、存储和设备信息。
- [硬件指南](./3-hardware-guide/0-components-overview.md)：确认板卡、接口和硬件版本。
- [软件指南](./4-software-guide/0-development-environment.md)：构建、烧录和维护源码工程。
