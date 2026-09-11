---
sidebar_label: "Customization & Further Development"
description: "Customization: model, dataset, pipeline, API and NeoMind integration."
---
# Customization & Further Development

## 7.1 Custom Model

Swap the OCR extension in the marketplace; switch the pipeline `processingExtensionId` — zero camera-side change.

## 7.2 Custom Dataset

Special dial fonts/finishes: Collect → Annotate → Train → Export → Deploy. Toolchain: [AI ToolStack](/docs/software/ai-tool-stack/overview).

## 7.3 Custom AI Pipeline

Pluggable stages (detection → OCR → validation → structuring); other extensions can replace or chain.

## 7.4 API Integration

**Pull (OpenAPI)**

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<device_id>/telemetry/latest?metric=meter_reading"
```

**Push (Data Push / Webhook)**: forward new datapoints live — [Data Push](/docs/neomind/user-guide/7c-data-push).

Field mapping: meter ID ↔ device; reading ↔ metric; read-at ↔ timestamp; snapshot ↔ image URL.

## 7.5 NeoMind Integration

```text
reading metric → NeoMind rules/Agent → MQTT / Webhook / notifications
```

Rules (anomaly / leak delta / low battery / offline), Data Push, and natural-language queries via AI Chat.
