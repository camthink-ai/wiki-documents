---
sidebar_label: "Business Integration"
description: "CamThink 水表识别解决方案——NE101 相机 + NeoMind 本地 OCR,自动抄读与业务推送。"
---
# 业务集成

读数进入 NeoMind 后,与营收系统/工单系统/大屏的对接有两种主流方式。

## 方式一:业务系统拉取(OpenAPI)

适合已有定时任务的营收系统。NeoMind 提供完整 REST API(Swagger 见服务端 `/api/docs`):

```bash
# 查询设备最新遥测(读数指标)
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<device_id>/telemetry/latest?metric=meter_reading"
```

- API Key 在 **Settings → API Keys** 管理(格式 `nmk_*`)
- 建议业务侧每日结算时拉取一次,配合"抓拍原图 URL"字段留档

## 方式二:平台推送(Data Push / Webhook)

适合实时性要求高的场景。NeoMind **Data Push** 可把指定指标的新数据点实时转发到外部 HTTP 端点:

- 配置入口:Settings → Data Push;支持按设备/指标过滤、失败重试
- 配置文档见 [数据推送](/docs/neomind/user-guide/7c-data-push)

告警类事件(读数异常/低电量/离线)则走 [消息通知](/docs/neomind/user-guide/notifications) 的 Webhook 渠道,消息体为 JSON,直接映射工单字段。

## 字段映射示例

| 营收系统字段 | NeoMind 来源 |
|---|---|
| 表号 | 设备 ID / 设备名称 |
| 读数 | 遥测 `meter_reading` |
| 抄表时间 | 数据点时间戳 |
| 抓拍凭证 | 数据点关联的图像 URL |
| 异常标记 | 规则触发记录 |

## 数据安全

- 传输:NeoMind 支持内置 TLS 前置代理或 nginx HTTPS,见 [安装与升级 — HTTPS](/docs/neomind/user-guide/install-setup)
- 认证:业务侧仅持 API Key,不落用户密码;Key 可随时吊销
- 合规:抓拍原图保留周期可在数据保留设置中控制,到期自动清理
