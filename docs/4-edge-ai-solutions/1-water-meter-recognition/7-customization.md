---
sidebar_label: "Customization & Further Development"
description: "定制与二次开发:自定义模型、数据集、流水线、API 与 NeoMind 集成。"
---
# Customization & Further Development

## 7.1 Custom Model

替换 OCR 模型:NeoMind 扩展体系支持接入其他识别扩展;更换后在流水线 `processingExtensionId` 切换即可,相机侧零改动。

## 7.2 Custom Dataset

特殊表型(字轮字体/表盘配色差异)可微调模型:

```text
Collect(抓拍积累) → Annotate → Train → Export → Deploy(扩展更新)
```

训练与量化工具链见 [AI ToolStack](/docs/software/ai-tool-stack/overview)。

## 7.3 Custom AI Pipeline

流水线可插拔组合(检测 → OCR → 校验 → 结构化),NeoMind 处理流水线对扩展透明,可替换/串接其他能力(如目标检测先定位表位)。

## 7.4 API Integration

**方式一:业务系统拉取(OpenAPI)**

适合已有定时任务的营收系统。NeoMind 提供完整 REST API(Swagger 见服务端 `/api/docs`):

```bash
# 查询设备最新遥测(读数指标)
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<device_id>/telemetry/latest?metric=meter_reading"
```

- API Key 在 **Settings → API Keys** 管理(格式 `nmk_*`)
- 建议业务侧每日结算时拉取一次,配合"抓拍原图 URL"字段留档

**方式二:平台推送(Data Push / Webhook)**

适合实时性要求高的场景。NeoMind **Data Push** 可把指定指标的新数据点实时转发到外部 HTTP 端点:

- 配置入口:Settings → Data Push;支持按设备/指标过滤、失败重试
- 配置文档见 [数据推送](/docs/neomind/user-guide/7c-data-push)

告警类事件(读数异常/低电量/离线)则走 [消息通知](/docs/neomind/user-guide/notifications) 的 Webhook 渠道,消息体为 JSON,直接映射工单字段。

**字段映射示例**

| 营收系统字段 | NeoMind 来源 |
|---|---|
| 表号 | 设备 ID / 设备名称 |
| 读数 | 遥测 `meter_reading` |
| 抄表时间 | 数据点时间戳 |
| 抓拍凭证 | 数据点关联的图像 URL |
| 异常标记 | 规则触发记录 |

## 7.5 NeoMind Integration

```text
读数指标 → NeoMind 规则/Agent → MQTT / Webhook / 通知
```

- 规则:读数异常、漏水(小时差分)、低电量、离线
- Data Push:实时转发读数到业务端点
- AI Chat/Agent:用自然语言查询"某表本月用量"等(平台内置能力)
