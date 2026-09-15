---
title: 方案搭建
sidebar_label: "Solution Setup"
sidebar_position: 3
description: "水表方案搭建三步:NE101 设备入网、NeoMind 安装与 OCR 扩展安装、联调验证,附设备与平台文档链接。"
---

# 方案搭建

本页覆盖方案落地的三个环节:**设备入网 → 平台安装 → 联调验证**。选型、BOM 与组网方式见 [工程介绍](./engineering-intro)。

## 1. 设备入网设置

1. 长按 NE101 拍照键 2s 开启设备 WiFi AP,使用电脑或手机连接
2. 进入 NE101 Web UI → **System Settings → Communications**,选择现场路由 WiFi,确保设备可访问 NeoMind 主机
3. 进入 **Application Management**,填写 Data Reporting Topic 与 Server Address(取自平台侧摄像头组件顶部的 MQTT 信息),点击 **connect**
4. 之后每次按动拍照键,图像自动上传至绑定的项目中

![设备上报后进入待审核列表](https://resources.camthink.ai/NeoMind/v0923/devices-pending.png)

## 2. NeoMind 安装与扩展安装

- **NeoMind 安装**:一键脚本 / 手动部署 / HTTPS 配置,见 [安装与升级](/docs/neomind/user-guide/install-setup)
- **扩展安装**:NeoMind 扩展市场一键安装 **paddle-ocr-v6**(OCR 识别);确认 **ne101_camera** 组件可用,见 [安装扩展与组件](/docs/neomind/use-cases/camera-ocr)

![扩展市场](https://resources.camthink.ai/NeoMind/v0923/extensions-marketplace.png)

## 3. 联调

按以下顺序逐环验证,任一环不通先排查该环:

1. **抓拍**:手动按动 NE101 拍照键,确认图像到达 NeoMind(组件图片列表可见)
2. **识别**:确认 OCR 流水线产出读数字段(仪表板组件可见识别结果)
3. **规则**:确认读数经 Transform 解析为数字并入库为 `meter_reading` 指标
4. **转发**:验证 Data Push / Webhook 已将读数推送到业务端点

## 4. 相关文档

| 类别 | 文档 | 说明 |
|---|---|---|
| 平台 | [NeoMind 安装与升级](/docs/neomind/user-guide/install-setup) | 一键脚本、手动部署、HTTPS 配置 |
| 平台 | [OCR 用例:NE101 采集图像](/docs/neomind/use-cases/camera-ocr) | 设备接入、扩展与组件安装的完整步骤与截图 |
| 设备 | [NE101 快速入门](/docs/neoeyes-ne101-series/quick-start) | 设备激活、Web UI 与通讯配置 |
