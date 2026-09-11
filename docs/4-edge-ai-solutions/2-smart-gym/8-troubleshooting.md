---
sidebar_label: "Troubleshooting"
description: "常见问题速查表。"
---
# Troubleshooting

| Problem | Possible Cause | Solution |
|---|---|---|
| 相机不在线 | PoE/网线 | 检查交换机端口与供电 |
| 应用无法启动 | 镜像/版本 | 核对 app.yaml 与 image.tar 版本匹配 |
| 计数偏差大 | 机位/逆光 | 调整角度,避开逆光;重标 ROI |
| 占用率恒为 0 | ROI 未生效 | 重设检测区域并保存 |
| 大屏无事件 | Event 通道配置 | 检查 Webhook/Event Bus 接收端 |
| 夜间漏检 | 照明不足 | 确认 AI-ISP 夜视开启;补照明 |

NE503 通用问题见 [NE503 故障排查](/docs/neoeyes-ne503-series/troubleshooting)。
