---
sidebar_label: "Platform Configuration"
description: "CamThink 水表识别解决方案——NE101 相机 + NeoMind 本地 OCR,自动抄读与业务推送。"
---
# NeoMind 平台配置

目标:设备上线 → 抓拍图与读数进平台 → 仪表板可视 → 异常有告警。所有步骤均有站内教程,此处给出串联路径。

## 1. 设备接入

- NE101 抓拍图经 **Webhook 或 MQTT** 进入 NeoMind;NeoMind 内置 MQTT Broker 与 Webhook 接入,无需外部中间件
- 接入操作见 [设备接入指南](/docs/neomind/user-guide/onboard-device);首次接入会进入待审核列表,审核时关联设备类型模板

## 2. 摄像头组件 + OCR 流水线

在仪表板添加 `ne101_camera` 组件绑定设备,`AI 处理流水线(processingExtensionId)` 选择 `paddle-ocr-v6`,配置 ROI 后开启 AI 处理——**抓拍 → 识别 → 读数回写**全自动。完整步骤(含水表示例截图)见 [OCR 用例第 5 节](/docs/neomind/use-cases/camera-ocr#5-仪表板配置摄像头--ocr-处理流水线)。

识别结果会作为虚拟指标(如 `meter_reading`)随遥测入库,可被仪表板、规则、API 统一消费。

## 3. 仪表板

建议三块内容:

- **读数卡片**:最新读数 + 更新时间(数据卡组件)
- **趋势曲线**:日/周/月用水量(读数差分),识别漏水与异常用水
- **设备健康**:电池电压、信号强度、最后在线时间(NE101 遥测自带)

仪表板搭建见 [使用仪表板](/docs/neomind/user-guide/use-dashboard)。

## 4. 规则与告警

| 规则 | 触发条件(示例) | 动作 |
|---|---|---|
| 读数异常 | 读数倒退 / 超量程 / 置信度 < 阈值 | 标记数据可疑,推送复核工单 |
| 用水异常 | 小时用水量 > 阈值(漏水) | 即时通知运维 |
| 低电量 | 电池电压 < 阈值 | 提前 30 天提醒换电池 |
| 设备离线 | 超过 N 个采集周期无上报 | 通知检查网络/设备 |

规则配置见 [自动化规则](/docs/neomind/user-guide/automation-rules);通知渠道(邮件/IM/Webhook)见 [消息通知](/docs/neomind/user-guide/notifications)。
