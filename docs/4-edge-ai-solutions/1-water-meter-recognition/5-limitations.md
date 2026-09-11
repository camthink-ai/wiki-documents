---
sidebar_label: "Limitations & Boundaries"
description: "方案边界:适用条件、AI 与硬件限制、推荐部署参数。"
---
# Limitations & Boundaries

## 5.1 Environmental Conditions

- 光照:暗环境需开启补光;强逆光/反光会影响识别
- 角度:镜头须正对字轮,斜角导致数字变形
- 遮挡:表盘污损/水汽附着需人工清洁后恢复
- 距离:在支架标称范围内,超距成像质量下降

## 5.2 AI Limitations

- 字轮处于进位中间态(半字符)时读数可能跳变,靠"连续两次一致才入库"规则缓解
- 非数字轮(指针式表盘)不适用本 OCR 流程
- 图像严重模糊/低分辨率时置信度下降,被规则标记为可疑

## 5.3 Hardware Limitations

- NE101 采集频率与电池寿命线性权衡,不支持视频流
- 平台侧吞吐随表数增长,超大数量需分主机/分区部署

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| 镜头-表盘距离 | 官方支架标称范围 |
| 安装角度 | 正对字轮,偏角 < 10° |
| 光照 | 均匀环境光或开启补光 |
| 抓拍分辨率 | 字轮区域占画面 ≥ 1/3 |
| 采集频率 | 日 1~4 次(结算需求) |

**Not Recommended**
- 指针式/滚码混合老表(识别路线不同)
- 长期强反光且无法调整机位的表位
- 分钟级高频监测需求(需另选持续供电方案)
