---
sidebar_label: "AI Model"
description: 基于 NeoEyes 相机、端侧 OCR 与 NeoMind 平台的水表自动抄读方案。
sidebar_position: 3
---

# 模型与算法
## 识别流程
- 表盘定位(检测) → 字轮区域裁剪 → 数字识别(OCR)

## 模型与训练
- 数据采集要求(光照/角度/污损样本量)
- 训练与 ONNX 转换(可引用 AI ToolStack)

## 端侧部署
- NE301 本地推理 vs 图片上传平台识别的取舍
