---
sidebar_label: "Business Integration"
description: "CamThink Smart Gym solution — built entirely on NeoEyes NE503 edge AI cameras: occupancy, equipment utilization and safety alerts."
---
# Business Integration

## Single Store (direct to cameras)

NE503 events push straight to your endpoint (Event Bus / Webhook):

- Payloads are structured JSON (counts/event type/timestamp), frontends consume directly
- Route all cameras to one endpoint; distinguish by device ID

## Platform Shape (via NeoMind)

| Integration | Method | Notes |
|---|---|---|
| Store SaaS / backend | [OpenAPI](/docs/neomind/developer-guide/rest-api) pull | daily metric pulls for reports |
| Realtime | [Data Push](/docs/neomind/user-guide/7c-data-push) | occupancy/events forwarded live |
| Display | dashboard view-mode | zero dev, browser fullscreen |
| Tickets / duty | notifications Webhook | safety, over-capacity, after-hours |

### Example: live occupancy push

```json
{
  "device": "gym-entrance-01",
  "metric": "occupancy",
  "value": 87,
  "timestamp": "2026-09-11T19:30:00+08:00"
}
```

### Example: end-of-day pull

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<id>/telemetry?metric=enter_count&hours=24"
```

## Member-Experience Hooks

- Peak prediction from 2–4 weeks of curves → off-peak promotions
- Class scheduling informed by zone heat
- All based on **anonymous aggregate counts** — no individual identification

## Data Security

- Video never leaves the camera/store; only structured metrics go out
- Snapshot retention controlled, auto-expired ([settings](/docs/neomind/user-guide/settings))
- HTTPS + API key for external interfaces ([install & upgrade](/docs/neomind/user-guide/install-setup))
