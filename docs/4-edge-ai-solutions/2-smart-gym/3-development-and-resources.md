---
sidebar_label: "方案开发与资源"
description: "定制开发、性能优化与相关资源,含技术支持入口。"
---
# 方案开发与扩展

## 技术规格

## 4.1 AI Model

| Item | Specification |
|---|---|
| Model | hailo_yolov8n_384_640 |
| Task | 人员检测 / 区域占用统计 |
| Input | 视频流(384×640 推理档) |
| Output | 人员框 / 区域人数 / 事件 |
| Framework | Hailo HEF(相机内 NPU) |
| Accelerator | Hailo-15H NPU(20 TOPS INT8) |

## 4.2 AI Pipeline

| App | 流水线 |
|---|---|
| Occupancy Monitor | 视频流 → 检测 → 区域聚合 → 占用率周期发布 |
| Person Detection | 视频流 → 检测 → 事件判定 → Event Bus 发布(可联动补光/告警) |

## 计数逻辑

- **区域占用(器械区)**:Occupancy Monitor 周期输出区域人数,小时聚合即利用率,无需计数线
- **出入口客流**:Person Detection 事件 + 平台侧进出判定;对精度要求高时基于同源模型做越线统计(轨迹与计数线求交,进出双向),在场人数 = 累计进 − 累计出

## 定制开发

**自定义模型**:门店专属行为(特定器械动作等)→ 训练 → HEF 转换 → 容器打包为私有应用,与官方应用并存。工具链:[模型训练与 HEF 转换](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef)。

**自定义流水线**:容器内自由组合 检测 → 跟踪 → 分类 → 越线计数;SDK 与 Event Bus 用法见 [Cookbook — Person Detection](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection)。

**NeoMind 深度集成**:事件/指标 → 规则/Agent → MQTT/Webhook/通知,实现多店汇聚、自然语言查询等平台能力,见 [NeoMind](/docs/neomind/product-overview/what-is-neomind)。

## 性能优化指引

- **AI**:ROI 收紧、按人流密度调阈值、计数漂移夜间校正
- **系统**:事件批量上报、多机按 device_id 去重
- **部署**:连锁按店分组接入 NeoMind,统一规则模板;大店划分计数区/占用区职责避免重叠

## 常见问题速查

| Problem | Possible Cause | Solution |
|---|---|---|
| 相机不在线 | PoE/网线 | 检查交换机端口与供电 |
| 应用无法启动 | 镜像/版本 | 核对 app.yaml 与 image.tar 版本匹配 |
| 计数偏差大 | 机位/逆光 | 调整角度,避开逆光;重标 ROI |
| 占用率恒为 0 | ROI 未生效 | 重设检测区域并保存 |
| 大屏无事件 | Event 通道配置 | 检查 Webhook/Event Bus 接收端 |
| 夜间漏检 | 照明不足 | 确认 AI-ISP 夜视开启;补照明 |

NE503 通用问题见 [NE503 故障排查](/docs/neoeyes-ne503-series/troubleshooting)。

## 相关资源

| 资源 | 链接 |
|---|---|
| NE503 产品文档 | [NeoEyes NE503 Series](/docs/neoeyes-ne503-series/overview) |
| 官方验证应用 | [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps) |
| 应用开发教程 | [Cookbook(Hello World / Parking / Person Detection)](/docs/neoeyes-ne503-series/application-guide/cookbook/hello-world) |
| 模型训练 | [模型训练与 HEF 转换](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef) |
| 平台汇聚 | [NeoMind Edge AI Platform](/docs/neomind/product-overview/what-is-neomind) |

## 技术支持

需要方案定制、批量部署或技术对接,欢迎联系 CamThink 技术支持团队:

- **社区支持**:[Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **商务与技术对接**:[联系我们](https://www.camthink.ai/company/contact-us/)
