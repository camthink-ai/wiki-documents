---
sidebar_label: "AI Model"
description: "CamThink 智慧健身房解决方案——全部基于 NeoEyes NE503 端到端 AI 相机:客流统计、器械利用率与安全告警。"
---
# 模型与应用

NE503 的应用以**容器**为单位管理,本方案全部使用官方验证过的现成应用,无需训练。

## 开箱即用的两个核心应用

均来自 [Verified Apps](/docs/neoeyes-ne503-series/application-guide/verified-apps),官方验证通过,提供 `app.yaml` + `image.tar` 一键部署:

| 应用 | 模型 | 健身房用途 | 验证结论 |
|---|---|---|---|
| **Occupancy Monitor** | hailo_yolov8n_384_640 | 器械区/全场**区域人数统计 + 占用率周期上报** | 占用率周期发布正常 ✅ |
| **Person Detection** | hailo_yolov8n_384_640 | 出入口/走道**人员出现事件**,可联动补光与告警 | 持续检测 3 人 · 426 万+ 帧推理 ✅ |

部署步骤与效果截图见 [Verified Apps — 部署方法](/docs/neoeyes-ne503-series/application-guide/verified-apps#部署方法);从源码走一遍完整流程可跟 [Cookbook — Person Detection](/docs/neoeyes-ne503-series/application-guide/cookbook/person-detection)(原始视频流推理 → 人员事件发布 → 补光灯联动)。

## 计数逻辑

- **区域占用(器械区)**:Occupancy Monitor 周期输出区域人数,小时聚合即利用率,无需计数线
- **出入口客流**:Person Detection 事件 + 平台侧进出判定;对精度要求高时基于同源模型做越线统计(轨迹与计数线求交,进出双向),在场人数 = 累计进 − 累计出

## 需要定制模型时(可选)

门店专属需求(特定器械动作识别、更精细的行为分类)走 Hailo 官方训练链:

1. 用 [模型训练与 HEF 转换](/docs/neoeyes-ne503-series/application-guide/model-training-and-hef) 把自采数据训练为 YOLO 系模型并转为 HEF
2. 按容器应用规范打包(参照 [Cookbook — Hello World](/docs/neoeyes-ne503-series/application-guide/cookbook/hello-world) 的构建与部署流程)
3. Web 控制台上架为私有应用,与官方应用并存

大多数门店**用两个官方应用即可覆盖核心需求**,建议先跑通再决定是否定制。
