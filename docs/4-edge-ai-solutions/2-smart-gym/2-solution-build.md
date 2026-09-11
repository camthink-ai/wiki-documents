---
sidebar_label: "方案搭建"
description: "从采购到上线:商品组合、搭建步骤、业务对接与适用条件。"
---
# 方案搭建

## 采购清单(商品组合)

| # | 采购项 | 型号/规格 | 数量 | 用途 |
|---|---|---|---|---|
| 1 | **NE503 AI 相机**(入口) | AF Lens 44.5° 定焦 | 每出入口 1 台 | 客流计数 |
| 2 | **NE503 AI 相机**(器械区) | Motorized Zoom 110° 广角 | 每 4~6 台器械 1 台 | 区域占用/安全检测 |
| 3 | PoE 交换机 | 802.3AT,端口数 = 相机数 + 1 | 1 台 | 单线供电组网 |
| 4 | 平台主机(可选) | Linux 主机运行 NeoMind | 多店/统一管理时 1 台 | 汇聚、统一 API 与告警 |

> 起步配置(1 入口 + 2 器械区):**3 × NE503 + 1 × PoE 交换机**即可上线核心功能,无需服务器。

## 搭建步骤

### ① 硬件安装

- 入口:顶装、正对通道最窄处(AF 44.5°);器械区:吊装覆盖 4~6 台器械(110°)
- PoE 线接入交换机,相机自动上线;避开玻璃门逆光与梁柱遮挡

### ② 设备配置

- 浏览器进入 NE503 Web 控制台(地址见 [快速开始](/docs/neoeyes-ne503-series/quick-start)),确认在线与画面正常
- 在应用参数中框定检测区域(器械区/通道 ROI)

### ③ 安装 AI 应用

- Web 控制台 → Applications,上传 **Verified Apps** 的 `app.yaml` + `image.tar`:
  - **Occupancy Monitor**(区域人数统计+占用率)——器械区
  - **Person Detection**(人员事件+告警联动)——入口/走道
- 部署方法详见 [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps#部署方法)

### ④ 结果验证

```text
走进入口 → Person Detection 事件 → 在场人数 +1(大屏 3s 内更新)
站上器械区 → Occupancy Monitor 上报 zone_occupancy
触发检测(挥手模拟)→ 告警通道收到通知 + 截图
```

## 业务对接

**单店(直连相机)**:NE503 事件经 Event Bus / Webhook 直推大屏/前台,JSON 结构按 device_id 区分点位。

**多店/统一管理(加 NeoMind)**:

- 设备接入见 [设备接入](/docs/neomind/user-guide/onboard-device)
- 告警规则:超员(持续 2 分钟)、计数漂移、安全事件、闭店滞留——[自动化规则](/docs/neomind/user-guide/automation-rules)
- 数据出口:[OpenAPI](/docs/neomind/developer-guide/rest-api) 日终拉取 / [Data Push](/docs/neomind/user-guide/7c-data-push) 实时转发
- 门店大屏:仪表板展示模式浏览器全屏([使用仪表板](/docs/neomind/user-guide/use-dashboard))

**示例:实时在场人数推送**

```json
{"device": "gym-entrance-01", "metric": "occupancy", "value": 87, "timestamp": "2026-09-11T19:30:00+08:00"}
```

## 适用条件与边界

**环境要求**: + glim_env.replace('## 5.1 Environmental Conditions','').strip() + 

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| 入口安装 | 顶装,通道最窄处,正对动线 |
| 器械区覆盖 | 4~6 台器械/台 |
| 吊高 | 2.5~3.5 m(典型层高) |
| 光照 | 常规营业照明;暗区依赖 AI-ISP 夜视 |

**Not Recommended**
- 需要识别"谁"(个体身份)的场景
- 无 PoE 布线条件且不便改造的旧场

**不建议使用**:需要识别"谁"(个体身份)的场景;无 PoE 布线条件且不便改造的旧场。
