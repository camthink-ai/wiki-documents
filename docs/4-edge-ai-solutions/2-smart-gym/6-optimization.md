---
sidebar_label: "Optimization"
description: "优化方向:模型、系统与部署三层。"
---
# Optimization

## 6.1 AI Optimization

- ROI 收紧到通道/器械区,排除无关画面
- 检测阈值按人流密度调优(高峰降误检)
- 计数漂移定期校正(夜间清零规则)

## 6.2 System Optimization

- 事件上报周期与批量策略(降 Event 流量)
- 多机事件在汇聚端按 device_id 去重合并

## 6.3 Deployment Optimization

- 连锁:按店分组接入 NeoMind,统一规则模板与告警通道
- 大门店多机:划分计数区/占用区职责,避免重叠计数

> 📝 **模板占位**:待补:优化前后对比数据(计数准确率/事件延迟)。
