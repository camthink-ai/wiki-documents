---
sidebar_label: "Business Integration"
description: "CamThink water-meter recognition solution: NE101/NE301 cameras + on-host NeoMind OCR for automatic meter reading and business push."
---
# Business Integration

## Option 1: pull via OpenAPI

For billing systems with scheduled jobs. NeoMind exposes a full REST API (Swagger at `/api/docs`):

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<device_id>/telemetry/latest?metric=meter_reading"
```

- API keys live in **Settings → API Keys** (`nmk_*`)
- Recommended: pull once per settlement cycle, keep the snapshot URL as the audit artifact

## Option 2: push via Data Push / Webhook

For real-time needs. **Data Push** forwards new datapoints of selected metrics to your HTTP endpoint — per-device/metric filters with retry. Config: [Data Push](/docs/neomind/user-guide/7c-data-push).

Alert-class events (anomaly/low battery/offline) ride the [notifications](/docs/neomind/user-guide/notifications) Webhook channel as JSON, mapping straight to ticket fields.

## Field Mapping Example

| Billing field | NeoMind source |
|---|---|
| Meter ID | device ID / name |
| Reading | telemetry `meter_reading` |
| Read at | datapoint timestamp |
| Snapshot | datapoint image URL |
| Anomaly flag | rule trigger record |

## Data Security

- Transport: built-in TLS proxy or nginx HTTPS — see [Install & Upgrade](/docs/neomind/user-guide/install-setup)
- Auth: business side holds an API key only; revocable anytime
- Compliance: snapshot retention configurable, auto-expired ([settings](/docs/neomind/user-guide/settings))
