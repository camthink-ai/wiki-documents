---
id: ne302-ai-model-validation
title: AI Model Validation
sidebar_position: 2
description: 说明如何上传 NE302 模型包，在 Camera Settings 中调整推理参数，并用固定图片确认推理结果。
keywords: [NE302, Feature Debugging, Model Validation, AI 模型, 推理]
tags: [NE302, 用户指南, AI 模型, 模型验证]
---

# AI Model Validation

本页说明如何将模型包上传到 NE302，并用固定测试图片确认模型能正常输出结果。

## 1. 下载或准备模型包

在 [CamThink 模型中心](https://www.camthink.ai/developer-center/models/?product=ne302) 选择 **ne302**，再按场景、任务或模型架构筛选。

![NE302 模型中心筛选页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/ai-model-validation/ne302-model-zoo.png)

上传到设备的必须是 NE302 模型包，例如 `ne302_Model_xxx_pkg.bin`。原始 `.tflite` 或 `.onnx` 文件不能直接上传；请按 [NE302 Model README](https://github.com/camthink-ai/ne302/blob/main/Model/README.md) 准备 JSON 配置并生成模型包。

## 2. 相机设置

打开**功能调试 → 相机设置**。这里可以查看和上传当前模型，并调整推理阈值、运行模式和工作频率。

![NE302 模型上传入口](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/ai-model-validation/ne302-model-upload.png)

| 设置 | 用途与操作 |
| :--- | :--- |
| 当前模型 | 显示当前已加载的模型。点击**上传**选择一个 NE302 模型包；一次只能选择一个文件，文件上限为 10 MB。上传、校验和模型重载完成后，重新查看这里，确认模型已切换。 |
| NMS 阈值 | 控制重叠检测框的处理。需要减少或保留重叠框时，用同一张固定图片一次只调整这一项，再比较结果。 |
| 置信度阈值 | 过滤低于阈值的结果。结果为空时，先用同一张已知目标图片降低该值复测。 |
| 电源模式 | 在全速模式和低功耗模式之间选择。切换后用固定图片重新检查结果。 |
| 运行模式 | 选择设备的运行方式；当前页面显示“图像模式”，实际可选项以设备页面为准。 |
| 工作频率 | 选择系统时钟配置。该设置会在下一次重启或唤醒时生效，因此更改后必须重新验证模型结果。 |

上传过程中不要刷新页面或断电。如果当前模型没有更新，先确认所选文件是模型包，而不是原始模型或 JSON 文件。

## 3. 用固定图片验证

打开**模型验证**。选择一张 `jpg`、`jpeg`、`png` 或 `webp` 图片（不超过 10 MB），等待 JSON 结果区域更新。

![NE302 模型验证页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/user-guide/ai-model-validation/ne302-model-validation.png)

固定图片验证通过时，页面会显示当前模型，图片可被接受，JSON 结果区域会更新。`detections` 为空只表示这张图片没有检测结果，不代表模型上传失败；可换一张已知包含目标的图片，或调整置信度阈值后用同一张图片复测。
