---
sidebar_label: "Troubleshooting"
description: "常见问题速查表。"
---
# Troubleshooting

| Problem | Possible Cause | Solution |
|---|---|---|
| 相机不在线 | 电池耗尽/网络变更 | 检查电量指示;重配网络 |
| 平台无图像 | 上行地址/凭证错误 | 核对 Webhook/MQTT 配置 |
| 识别结果为空 | ROI 未框选或过小 | 重设 ROI,覆盖完整字轮区 |
| 读数频繁跳变 | 字轮进位中间态 | 启用"连续一致"校验规则 |
| 置信度普遍偏低 | 光照/反光/污损 | 开补光、清洁表盘、调机位 |
| 业务端未收到数据 | Data Push/网络策略 | 查看 Data Push 状态与重试记录 |

更多平台侧问题见 [NeoMind 故障排查](/docs/neomind/user-guide/troubleshooting)。
