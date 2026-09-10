---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 2
description: 使用 Claude Code 和 ne503-dev 构建并部署 NE503 应用。
keywords: [NE503, ne503-dev, Claude Code, AI 辅助开发, 应用开发]
tags: [应用开发, NE503, AI 辅助开发]
---

# AI-Assisted Development

本例使用 **Claude Code** 和 ne503-dev 构建“人员停留 10 秒告警”应用：人员连续出现 10 秒告警，离开后重置。

:::tip 直接体验成品
下载[预编译包](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/lingering-detection.tar)，解压后按 [Hello World 部署步骤](./2-cookbook/0-hello-world.md#3-部署到设备)导入。
:::

## 1. 前置准备

| 项目 | 要求 |
|:--|:--|
| Claude Code | 已安装并可运行 |
| Skill name | `ne503-dev`；[下载](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip)，解压到 `~/.claude/skills/ne503-dev/` |
| [neoruntime](https://github.com/camthink-ai/neoruntime) | 平台服务、HAL、构建与部署脚本 |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python/C++ SDK |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | 应用模板和示例 |
| Docker | 构建 ARM64 镜像 |
| 目标设备 | NE503 已联网；模型、HAL v2 和 ai-runtime 可用 |

## 2. 开发流程

在 Claude Code 中调用 ne503-dev，输入：

> 检测到人停留 10 秒后发送告警，部署到设备 IP。

确认停留时长、检测阈值和设备地址后，工具完成：

1. 查询设备可用的模型和原始视频流；
2. 生成状态机、app.yaml 和权限；
3. 构建 ARM64 镜像、安装并启动应用。

示例使用 hailo_yolov8n_384_640 和原始流 sub。实际模型和流名以设备查询结果为准。

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

## 3. 验收

确认：

- 应用状态为 Running；
- 日志出现模型加载和首帧推理；
- 人进入画面后触发告警，离开后状态重置。

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

完整过程：[ai-assisted-development_new.mp4](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4)。
