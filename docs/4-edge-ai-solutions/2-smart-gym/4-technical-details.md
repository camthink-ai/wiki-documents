---
sidebar_label: "Technical Details"
description: "技术细节:模型规格、AI 流水线与性能指标。"
---
# Technical Details

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

## 4.3 Performance

| Metric | Result |
|---|---|
| 双向客流计数准确率 | ≥ 95%(顶装无遮挡,以现场标定为准) |
| 事件响应 | 本地秒级 |
| 单机覆盖 | 一台一个区域(20 TOPS 支持多模型并发) |

> 📝 **模板占位**:补充实测:各点位 FPS/延迟/夜视表现抽样数据。
