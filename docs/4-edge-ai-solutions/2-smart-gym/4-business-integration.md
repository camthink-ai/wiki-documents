---
sidebar_label: "Business Integration"
description: "CamThink 智慧健身房解决方案——全部基于 NeoEyes NE503 端到端 AI 相机:客流统计、器械利用率与安全告警。"
---
# 业务集成

## 单店形态(直连相机)

NE503 事件直推业务端点(Event Bus / Webhook),适合自建大屏或简单看板:

- 事件 payload 为结构化 JSON(人数/事件类型/时间戳),前端直接消费
- 多台相机事件统一到一个端点,按设备 ID 区分点位

## 平台形态(经 NeoMind)

| 对接 | 方式 | 说明 |
|---|---|---|
| 门店 SaaS / 管理后台 | [OpenAPI](/docs/neomind/developer-guide/rest-api) 拉取 | 日终拉取客流/利用率指标出报表 |
| 实时联动 | [数据推送 Data Push](/docs/neomind/user-guide/7c-data-push) | 在场人数/事件实时转发到业务端点 |
| 大屏 | 仪表板展示模式 | 无开发,浏览器全屏 |
| 工单/值班 | 消息通知 Webhook | 安全事件、超员、闭店滞留直达 |

### 示例:在场人数实时推送

```json
{
  "device": "gym-entrance-01",
  "metric": "occupancy",
  "value": 87,
  "timestamp": "2026-09-11T19:30:00+08:00"
}
```

### 示例:日终报表拉取

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<id>/telemetry?metric=enter_count&hours=24"
```

## 与会员体验的结合

- 高峰预测:2~4 周客流曲线 → 错峰促销时段
- 团课排期:器械区热度反推课程类型与时段
- 全部基于**匿名聚合计数**,不涉及会员个体识别

## 数据安全

- 视频不出相机/不出店;对外仅结构化指标
- 事件截图保留期可控,到期自动清理([系统设置](/docs/neomind/user-guide/settings))
- 对外接口 HTTPS + API Key([安装与升级](/docs/neomind/user-guide/install-setup))
