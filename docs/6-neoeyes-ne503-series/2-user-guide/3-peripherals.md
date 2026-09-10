---
description: NE503 外设 IO：音频、报警输入、Wiegand 输出和联动说明。
keywords: [NE503 外设, 报警输入, Wiegand, 门禁, 音频, IO]
tags: [用户指南, NE503, 外设]
---

# Peripherals

在 **Peripherals** 页面配置音频、报警输入和门禁输出。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/peripherals/qs-peripherals.png" />

## I/O 控制

- **Mic Input**：启用麦克风，用于监听、对讲或应用采集音频。
- **Speaker Output**：启用扬声器，用于对讲或应用发声。
- **Alarm Input**：报警输入开关。当前固件暂未上报事件总线/API；需要联动时由外部系统接线。
- **Alarm Input Level**：`High` / `Low` 触发电平；当前固件暂未生效。
- **Wiegand CH0 / CH1**：两路输出，用于向门禁控制器发送联动信号，不用于接入读卡器。

> NE503 提供 1 路报警输入，接线和供电要求以硬件资料为准。

## 联动

- **对讲**：开启 Mic Input 和 Speaker Output，在 Media 页使用 **Talk**。
- **AI 事件**：应用或业务系统订阅事件后驱动外部继电器；平台不内置自动联动。
