---
description: 本指南介绍如何在 NE301 上接入 PIR 人体感应传感器（NP624M-F），结合 MQTT 数据转发和 NeoMind 平台，实现人体移动触发自动抓拍的完整方案。
keywords: [NE301, PIR, NP624M-F, 人体感应, 触发抓拍, MQTT, NeoMind, 安防监控]
tags: [NE301, PIR, 传感器, 抓拍, MQTT]
---

import SupportGrid from '@site/src/components/SupportGrid';

# Pir Sensor Integration

---

本指南介绍如何将 PIR 人体感应传感器接入 [NE301](https://www.camthink.ai/store/ne301/)，结合 MQTT 数据转发和 NeoMind 平台，搭建一套高效精准按需抓拍的解决方案。

---

## 1. 概览

### 1.1 为什么需要 PIR 传感器

在安防监控、工地防范、野生动物监测等场景中，持续拍摄会产生大量无意义的画面，既浪费存储和带宽，也增加了无效数据的筛选成本。PIR（Passive Infrared）人体感应传感器能够在检测到目标移动时输出信号，触发设备进行抓拍，确保每次抓拍都是真正有意义的事件画面。

[NE301](https://www.camthink.ai/store/ne301/) 支持电池供电和外部供电两种方式。在电池供电场景下，PIR 按需触发尤为关键——设备在无人活动时保持低功耗状态，仅在检测到目标时唤醒抓拍，显著延长续航时间。外部供电场景下，PIR 触发同样可以减少无效数据量，降低存储和传输压力。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/ne301-with-pir.jpeg)

### 1.2 方案简介

本方案的完整链路如下：

```
PIR 传感器（NP624M-F）→ NE301 抓拍 → MQTT 转发 → NeoMind 平台
```

- **PIR 传感器**：检测人体移动，输出触发信号
- **NE301**：接收触发信号后执行抓拍
- **MQTT 转发**：将抓拍数据通过 MQTT 协议推送到指定 Broker
- **NeoMind**：基于大语言模型的边缘 AI 平台，通过 MQTT 协议管理设备，支持自动化规则引擎和数据可视化看板（[GitHub](https://github.com/camthink-ai/NeoMind)）

### 1.3 前置要求

| 项目 | 要求 |
|------|------|
| 硬件 | NE301 设备、PIR 传感器（例如 NP624M-F） |
| 软件 | NeoMind 平台账号、可用的 MQTT Broker |
| 网络 | NE301 设备能够访问 MQTT Broker 和 NeoMind 平台 |

---

## 2. 硬件准备与连接

### 2.1 所需材料

| 组件 | 说明 |
|------|------|
| NE301 设备 | 确保 FSBL 为 1.0.3 或更新版本 |
| PIR 传感器 | 例如：NP624M-F，数字双元，抗射频干扰 |

### 2.2 安装步骤

将 PIR 传感器连接到 NE301 主板的 PIR 接口，确保传感器朝向覆盖目标检测区域。安装完成后，NE301 将呈现如下形态：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/ne301-pir-connection.JPG)

如需接入其他 PIR 传感器，请参考 [硬件连接指南](https://wiki.camthink.ai/docs/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/hardware-connection) 中 PIR Sensor Header（STM32U073KBU6）部分的针脚说明。

---

## 3. PIR 传感器配置

### 3.1 查看设备状态

登录 NE301 网页配置界面，确认设备状态正常：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/ne301-status.png)

确认以下信息：
- 网络连接正常
- 模型配置正确
- MQTT 配置正确

### 3.2 配置 PIR 参数

进入 PIR 传感器配置页面，根据实际场景调整参数：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/PIR-settings.png)

**主要配置项**：

| 参数 | 说明 | 建议值 |
|------|------|--------|
| IO Trigger-PIR | 启用 PIR 触发，PIR 可唤醒设备进行抓拍 | 开启 |
| Usage | 触发方式，支持上升沿（Rising Edge）、下降沿（Falling Edge）、双边沿（Both Edges） | Rising Edge |
| Sensitivity | 灵敏度数值，数值越小越灵敏，检测距离越远/越容易触发，室内建议 30~40 | 30 |
| Ignore Time | 触发后的忽略时间，N = N×0.5+0.5 秒（如 7 对应 4 秒） | 7 |
| Pulse Count | 触发后的脉冲数，增大可提高抗干扰能力，但会略微降低响应速度 | 2 |
| Window Time | 脉冲发生的最大时间窗口，M = M×2+2 秒（如 2 对应 0~6 秒） | 2 |

---

## 3. MQTT 数据转发配置

### 4.1 MQTT 转发功能说明

PIR 触发抓拍后，NE301 可以通过 MQTT 协议将抓拍数据转发到指定的 MQTT Broker。NeoMind 平台通过 MQTT 协议自动发现和注册设备，订阅对应的 Topic 接收数据，并通过数据看板和自动化规则引擎进行事件处理。

### 4.2 配置步骤

**步骤 1**：进入 MQTT 转发设置页面

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/mqtt-forwarding-setting.png)

**步骤 2**：填写 MQTT Broker 信息

| 配置项 | 说明 |
|--------|------|
| Broker 地址 | MQTT 服务器地址 |
| 端口 | MQTT 服务端口（通常为 1883 或 8883） |
| 用户名 | MQTT 认证用户名 |
| 密码 | MQTT 认证密码 |
| Topic | 数据发布主题，需与 NeoMind 订阅一致 |

**步骤 3**：保存配置并测试连接

配置完成后，建议进行一次 PIR 触发测试，确认数据能够正常通过 MQTT 转发。

---

## 4. NeoMind 平台

### 4.1 设备管理与数据看板

NeoMind 平台通过 MQTT 协议自动发现和注册 NE301 设备，提供设备管理和数据看板功能。通过可视化的界面，用户可以实时查看 PIR 触发事件、抓拍数据以及设备运行状态。

### 4.2 抓拍效果展示

当 PIR 传感器检测到人体移动并触发抓拍后，NeoMind 仪表盘将展示对应的事件记录和抓拍数据：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/pir-sensor-integration/neomind-dashboard-data.png)

在仪表盘中可以查看：
- 触发事件时间线
- 抓拍图片预览
- 事件统计数据

### 4.3 更多配置

关于 NeoMind 平台的详细配置和使用方法，请参考 [NeoMind 快速入门](https://wiki.camthink.ai/docs/neomind/quick-start/five-minute-guide)，本文不再赘述。

---

## 5. 联调与测试

完成上述所有配置后，按以下步骤验证方案是否正常运行：

1. 确认硬件连接正常，设备在线，PIR 功能已启用
2. 在 PIR 传感器前方走动，确认 NE301 响应触发并执行抓拍
3. 在 NeoMind 仪表盘确认抓拍数据已到达，事件记录和图片预览正常显示
4. 确认无人活动时设备处于低功耗状态

---

## 6. 故障排查

| 问题 | 排查方向 |
|------|----------|
| PIR 未触发 | 减小 Sensitivity 数值 / 减小 Ignore Time / 检查传感器是否连接到位 |
| 无抓拍数据 | 检查 MQTT Broker 地址、端口、认证信息及网络连通性 |
| 仪表盘无数据 | 确认 MQTT 发布 Topic 与 NeoMind 订阅 Topic 一致 |
| 电池消耗过快 | 增大 Sensitivity 数值或增大 Ignore Time，减少无效触发 |

---

## 7. 附录

### 参考资源

- [NeoMind 快速入门](https://wiki.camthink.ai/docs/neomind/quick-start/five-minute-guide)


### PIR 传感器规格（示例）

| 参数 | 值 |
|------|-----|
| 型号 | NP624M-F |
| 类型 | 数字双元 |
| 供电电压 | 1.6~3.6V |
| 功耗 | 5μA |
| 特性 | 抗射频干扰 |

---

*最后更新: 2026-04-02*
