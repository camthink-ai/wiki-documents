---
sidebar_label: "Customization & Further Development"
description: "定制与二次开发:自定义模型、数据集、流水线、API 与 NeoMind 集成。"
---
# Customization & Further Development

## 7.1 Custom Model

替换检测模型:训练后转 HEF,按容器规范打包上架为私有应用,与官方应用并存。

门店专属需求(特定器械动作识别、更精细的行为分类)走 Hailo 官方训练链:

1. 用 [模型训练与 HEF 转换](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef) 把自采数据训练为 YOLO 系模型并转为 HEF
2. 按容器应用规范打包(参照 [Cookbook — Hello World](/docs/neoeyes-ne503-series/application-guide/cookbook/hello-world) 的构建与部署流程)
3. Web 控制台上架为私有应用,与官方应用并存

大多数门店**用两个官方应用即可覆盖核心需求**,建议先跑通再决定是否定制。

## 7.2 Custom Dataset

```text
Collect(门店场景采集) → Annotate → Train → Export(HEF) → Benchmark → Deploy
```

训练与 HEF 转换见 [模型训练与 HEF 转换](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef)。

## 7.3 Custom AI Pipeline

容器应用内可自由组合:检测 → 跟踪 → 分类 → 越线计数;参考 [Cookbook](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection) 的 SDK 与 Event Bus 用法。

## 7.4 API Integration

- 单店:NE503 Event Bus / Webhook 直推业务端点(JSON,按 device_id 区分点位)
- 平台形态:[OpenAPI](/docs/neomind/developer-guide/rest-api) 拉取与 [Data Push](/docs/neomind/user-guide/7c-data-push) 实时转发

## 7.5 NeoMind Integration

```text
NE503 事件/指标 → NeoMind → 规则(超员/安全/闭店滞留) → MQTT / Webhook / 通知
```

多店汇聚、统一看板与告警通道的完整形态见 [NeoMind](/docs/neomind/product-overview/what-is-neomind);接入步骤见 [设备接入](/docs/neomind/user-guide/onboard-device)。
