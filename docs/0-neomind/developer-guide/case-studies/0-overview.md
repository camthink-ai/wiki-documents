---
description: 工程实践案例集 — 从 27 个扩展 + 6 个组件中精选 7 个真实案例，做完整工程剖析
keywords: [NeoMind, 扩展开发, 工程案例, 最佳实践]
tags: [NeoMind, 开发指南, 案例集]
sidebar_label: Overview
---

# 案例集总览

本案例集区别于 [扩展 API 通用参考](../7-extension-development.md) 与 [组件 API 通用参考](../8-dashboard-component-dev.md)——那两篇讲的是「API 长什么样、能做什么」；本系列只讲**真实工程实战**：为什么这样设计、踩过哪些坑、工程标准如何落地。每个案例都是从 NeoMind 生态现有仓库中精选的真实代码，经人工 audit 后整理成可复现的工程剖析。

## 7 个案例一览

| # | 案例 | 类型 | 难度 | 体量 | 价值点 |
|---|------|------|------|------|--------|
| 1 | [weather-forecast](./1-weather-forecast.md) | 数据型扩展 | 入门 | ~700 行 | 第一个扩展范本（HTTP 拉取 + 周期指标 + React 前端） |
| 2 | [yolo-device-inference](./2-yolo-device-inference.md) | AI 推理 | 进阶 | ~1950 行 | 模型懒加载 / 跨 session 复用 / 设备相机集成 |
| 3 | [yolo-video](./3-yolo-video-v2.md) | 流式扩展 | 进阶 | ~3900 行 | stream session + 视频帧处理 + VLM 仪表板联动 |
| 4 | [onvif-bridge](./4-onvif-bridge.md) | 协议桥接 | 进阶 | ~2700 行 | IP 摄像头 / 标准协议接入（呼应 NeoEyes） |
| 5 | [uink-rms-bridge](./5-uink-rms-bridge.md) | 协议桥接 | 进阶 | ~2250 行 | 真实生产验证的桥接 |
| 6 | [metric_card](./6-metric-card-component.md) | 仪表板组件 | 入门 | ~400 行 | 组件范本（数值卡 + 阈值/趋势/单位） |
| 7 | [ne101_camera](./7-ne101-camera-component/index.md) | 扩展-组件联动 | 旗舰 | ~2500-3500 行（拆 8 子页） | 端到端深度教程 |

## 4 条阅读路径

按角色和目标挑选最短路径：

- **路径 1（新手）**：[1](./1-weather-forecast.md) → [6](./6-metric-card-component.md) → [7](./7-ne101-camera-component/index.md) —— 先用最简单的扩展和组件建立直觉，再挑战端到端旗舰案例。
- **路径 2（AI 工程师）**：[2](./2-yolo-device-inference.md) → [3](./3-yolo-video-v2.md) → [7](./7-ne101-camera-component/index.md) —— 从单帧推理到视频流处理，最后看完整产品集成。
- **路径 3（工业集成商）**：[4](./4-onvif-bridge.md) → [5](./5-uink-rms-bridge.md) → [7](./7-ne101-camera-component/index.md) —— 两个协议桥接案例打底，再做相机产品级集成。
- **路径 4（组件开发者）**：[6](./6-metric-card-component.md) → [7](./7-ne101-camera-component/index.md) → 任意扩展案例 —— 先掌握组件范式，再学如何与扩展联动。

## 版本对齐表

案例代码与源仓库 release 对齐，audit 时锁定 commit。

| 案例 | 源仓库版本 | SDK 版本 | 最后 audit |
|------|-----------|----------|------------|
| 1 weather-forecast | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 2 yolo-device-inference | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 3 yolo-video | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 4 onvif-bridge | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 5 uink-rms-bridge | v2.7.6 | SDK 0.6 | 2026-06-22 |
| 6 metric_card | v1.7.0 | — | 2026-06-22 |
| 7 ne101_camera | v2.14.9 | — | 2026-06-22 |

源仓库 release 时触发案例 audit（人工，非自动化）。

## 组件源码格式说明

> NeoMind Dashboard Components 采用**手写 IIFE JavaScript**作为分发格式——文件名是 `bundle.js`，但**不是编译产物**，而是人写的源码。
>
> 具体约定：
>
> - 使用 `var React = window.React` + `var jsx = window.jsxRuntime.jsx` 注入运行时依赖（React / JSX runtime 由 Host 页面提供）。
> - 保留完整注释、合理分行，可读性接近普通源码——可以直接阅读，不需要 source map。
> - 当前体量：`metric_card` 352 行，`ne101_camera` 1972 行。
>
> 因此案例 6 / 7 的「关键代码走读」会直接指向 `bundle.js` 的具体行号，读者可以打开源文件边读边对照。

## 延伸阅读

- [扩展 API 通用参考](../7-extension-development.md) —— 扩展 trait、宏、capability、生命周期、ML 模型加载的 API 文档。
- [组件 API 通用参考](../8-dashboard-component-dev.md) —— Dashboard 组件 schema、数据源绑定、渲染管线的 API 文档。
- [共享工程标准附录](./appendix-standards.md) —— 所有案例共同遵循的工程标准（代码风格、错误处理、日志、测试、版本对齐等）。

---

*最后更新: 2026-06-22*
