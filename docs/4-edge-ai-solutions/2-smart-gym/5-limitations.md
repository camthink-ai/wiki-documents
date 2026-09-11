---
sidebar_label: "Limitations & Boundaries"
description: "方案边界:适用条件、AI 与硬件限制、推荐部署参数。"
---
# Limitations & Boundaries

## 5.1 Environmental Conditions

- 入口逆光(玻璃门)拉低计数精度,调机位或利用夜视
- 器械区遮挡(梁柱/器械堆叠)造成漏检,必要时两机互补
- 过低吊高会缩小覆盖,过高则目标过小

## 5.2 AI Limitations

- 通用行人模型:不做身份识别/个体追踪(设计边界,也是隐私卖点)
- 高密度重叠人群占用统计偏低
- 摔倒等行为类事件需定制模型(官方 Verified Apps 覆盖人员出现/占用)

## 5.3 Hardware Limitations

- 单台 20 TOPS:每台负责一个区域,超大区域需拆分
- 需要 PoE 供电(无电池模式)

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| 入口安装 | 顶装,通道最窄处,正对动线 |
| 器械区覆盖 | 4~6 台器械/台 |
| 吊高 | 2.5~3.5 m(典型层高) |
| 光照 | 常规营业照明;暗区依赖 AI-ISP 夜视 |

**Not Recommended**
- 需要识别"谁"(个体身份)的场景
- 无 PoE 布线条件且不便改造的旧场
