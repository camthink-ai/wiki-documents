---
sidebar_label: "Platform Configuration"
description: "CamThink 智慧健身房解决方案——全部基于 NeoEyes NE503 端到端 AI 相机:客流统计、器械利用率与安全告警。"
---
# 平台配置

两种形态,按门店规模选:

## 形态 A:单店轻量(无服务器)

直接使用每台 NE503 的 **Web 控制台**:

- Applications 页管理应用启停与参数(检测区域、上报周期)
- 相机本机查看实时检测画面与统计([NE503 仪表板](/docs/neoeyes-ne503-series/user-guide/dashboard))
- 事件经 Event Bus / Webhook 直推大屏或前台(浏览器接收即可)
- 适合 1~3 台相机的小型门店,**零额外采购**

## 形态 B:多店/统一管理(加 NeoMind)

3 台以上相机、或多门店统一运营时,部署一套 [NeoMind](/docs/neomind/product-overview/what-is-neomind):

### 1. 设备接入

NE503 事件与指标经 MQTT/Webhook 接入,步骤见 [设备接入](/docs/neomind/user-guide/onboard-device)。

### 2. 指标与计算

| 指标 | 来源 | 说明 |
|---|---|---|
| `zone_occupancy` | Occupancy Monitor | 器械区占用,小时聚合为利用率 |
| `enter/exit 事件` | Person Detection | 平台侧累计为客流曲线 |
| `occupancy` | 平台规则 | 在场人数 = 累计进 − 出 |
| 安全事件 | 检测应用 | 事件型,带截图 |

清洗与跨指标计算用 [数据变换](/docs/neomind/user-guide/7b-data-transforms)(夜间闭店清零、计数漂移校正)。

### 3. 仪表板与大屏

实时在场大字卡、今日/7 天客流曲线、器械区热度条形图;门店大屏用仪表板展示模式浏览器全屏常驻([使用仪表板](/docs/neomind/user-guide/use-dashboard))。

### 4. 规则告警

| 规则 | 条件(示例) | 动作 |
|---|---|---|
| 超员 | `occupancy` > 限流值,持续 2 分钟 | 前台通知 + 大屏提示 |
| 计数异常 | `occupancy` < 0 / 突变 | 通知运维校准 |
| 安全事件 | 检测触发 | 多通道即时通知 + 截图留档 |
| 闭店滞留 | 闭店后在场 > 0 | 通知值班 |

见 [自动化规则](/docs/neomind/user-guide/automation-rules) 与 [消息通知](/docs/neomind/user-guide/notifications)。
