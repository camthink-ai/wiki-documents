---
sidebar_label: "Troubleshooting"
description: "Quick troubleshooting table."
---
# Troubleshooting

| Problem | Possible Cause | Solution |
|---|---|---|
| Camera offline | PoE/cable | check switch port & power |
| App won't start | image/version | match app.yaml with image.tar version |
| Counting drift | angle/backlight | adjust, re-frame ROI |
| Occupancy stuck 0 | ROI not saved | re-set the detection zone |
| No events at display | channel config | check Webhook/Event Bus receiver |
| Night misses | low light | confirm AI-ISP night mode; add lighting |

NE503 general issues: [NE503 troubleshooting](/docs/neoeyes-ne503-series/troubleshooting).
