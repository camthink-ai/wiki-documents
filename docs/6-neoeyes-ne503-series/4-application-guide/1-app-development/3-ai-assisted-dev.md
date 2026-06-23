---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 3
description: 用 Claude Code 配合 ne503-dev skill 做 AI 辅助开发——一句话描述需求，Claude 自动写出应用代码（逻辑 + 清单）、部署到设备并验收跑通。以"停留告警"应用做完整真机演示。
keywords: [NE503, ne503-dev, Claude Code, skill, AI 辅助开发, 应用开发, 停留告警, loitering, 状态机, 自然语言]
tags: [应用开发, NE503, AI 辅助开发, skill]
---

# AI-Assisted Development

本篇演示 **AI 辅助开发**：用一句自然语言描述需求，由 Claude（基于 `ne503-dev` skill）完成应用的开发、部署与验收，全程无需手动执行命令。

演示应用为 **停留告警**（Loitering Detection）：检测到人员连续停留 10 秒即触发告警，人员离开后重置。

## 1. 前置准备

| 条件 | 说明 |
|:---|:---|
| Claude Code | 已安装。 |
| ne503 源码仓库 | 克隆到本地（随 NE503 SDK 一并提供）；`ne503-dev` skill 位于仓库的 `.claude/skills/ne503-dev/`。或[下载 skill zip](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) 解压至 `.claude/skills/`。 |
| Docker | 本机已安装，用于构建应用镜像。 |
| NE503 设备 | 就绪：设备 IP + admin 密码；平台已初始化（HALv2 已装、ai-runtime 健康、检测模型已 scan+load）。 |

## 2. 从一句话到一个新应用

传统开发流程要做的事——编写 `app.py` 业务逻辑、配置 `app.yaml` 权限、查询设备可用的模型与视频流、构建镜像、部署、验收——在 AI 辅助开发里全部交给 Claude，开发者只需用自然语言描述需求。以下是一次真机会话的完整过程（2026-06-22），输入仅一句话。

### 2.1 输入需求

在 Claude Code 中调用 `ne503-dev` skill，用自然语言描述需求：

> 做一个应用：检测到人停留 10 秒就发告警。部署到 `<设备 IP>`。

Claude 读取 skill 后自主启动规划，就少数细节与开发者确认后开工：

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

### 2.2 Claude 开发这个应用（核心）

需求确认后，Claude 以 SDK 的 `apps/template/` 应用模板为起点自主开发，关键决策有三：

- **占位值修正**：模板里的示例模型与视频流在真机上跑不通，Claude 查询设备后改为真实值——模型 `hailo_yolov8n_384_640`、视频流 `sub`（发布原始 NV12 帧；`main` 只发编码 H264，无法推理）。
- **停留状态机**：应用的核心逻辑。人进入画面即开始计时，连续停留满 10 秒触发告警，连续 3 秒未检测到则判定离开并重置；3 秒宽限窗口（`GRACE_SECONDS`）容忍侧身、遮挡造成的短暂丢帧。
- **清单配置**：`app.yaml` 声明所需的视频流、模型、事件主题，以及可调环境变量（停留时长 `LOITER_SECONDS`、检测阈值 `DETECTION_THRESHOLD`、宽限秒数 `GRACE_SECONDS` 等）。

完整的开发过程（模板选取 → 占位修正 → 状态机编写）见下：

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-end_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

### 2.3 Claude 部署并验收

代码写完后，部署同样由 Claude 自主完成——调用 skill 内置脚本串联"构建→上传→安装→启动→验收"全自动一次跑通，应用进入 `running`。

部署完成后，Claude 进一步验证三件事：推理确实上线（拉日志确认模型加载与首帧到达）、平台注入的权限与 `app.yaml` 声明一致、实际进入摄像头画面能触发完整一轮检测。Web 控制台视角的验收过程见下：

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

真机重复多轮，告警稳定落在 10.1 秒，累计 3 次独立告警，无误报、无漏报。

一句需求进，一个在设备上实跑的停留告警应用出——中间无任何手动步骤。

完整过程汇总视频（按需查看）：

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>
