---
sidebar_label: "Optimization"
description: "优化方向:模型、系统与部署三层。"
---
# Optimization

## 6.1 AI Optimization

- ROI 收紧到字轮区:减少无关区域,提高识别率与速度
- 置信度阈值 + "连续一致"校验:过滤进位瞬间的跳读
- 档位选择:tiny→small/medium 换精度(首次切换需联网下载)

## 6.2 System Optimization

- 抓拍时段错峰(按表分时上传),降低主机瞬时并发
- 图像保留策略:识别后仅保留抽检样张,控制存储

## 6.3 Deployment Optimization

- 大规模分域:每 200~500 表一台 NeoMind 主机,区域汇聚后统一 API
- 网络分区:Cat.1 表位与 Wi-Fi 表位分通道,避免蜂窝流量峰值

> 📝 **模板占位**:待补:各优化项的量化收益(前后对比数据)。
