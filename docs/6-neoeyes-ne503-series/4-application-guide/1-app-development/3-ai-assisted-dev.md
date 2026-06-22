---
id: ai-assisted-dev
title: AI 辅助开发
sidebar_position: 3
description: 用 Claude Code 配合 ne503-dev skill 做 AI 辅助开发——你用一句话描述要什么应用，Claude 替你把这个新应用的代码写出来（逻辑 + 清单），再部署到设备、验收跑通。用一个 docs 里没有的新应用"停留告警"做完整演示。
keywords: [NE503, ne503-dev, Claude Code, skill, AI 辅助开发, 应用开发, 停留告警, loitering, 状态机, 自然语言]
tags: [应用开发, NE503, AI 辅助开发, skill]
---

# AI 辅助开发

本篇讲 **AI 辅助开发**——你用一句话描述要什么应用，Claude（用 `ne503-dev` skill）替你把它**写出来**、部署到设备、验收跑通。全程你不敲命令，只说自然语言。

演示用一个新应用：**停留告警**——画面里有人连续停留 10 秒就发告警，人走开重置。重点看 Claude 怎么从一个需求**开发**出代码。

## 1. 这条路图什么

一句话：**不用自己写**。手动流程那些事（写 `app.py` 业务逻辑、配 `app.yaml` 权限、查设备能用哪个模型 / 哪条流出原始帧、构建、部署）——AI 辅助开发全交给 Claude，你只描述要什么。

**开发在前，部署在后**——本篇重点在开发（§2），部署只是确认跑起来了（§2.3）。想看部署每一步的底层，去 [Hello World](./1-hello-world.md)、[Person Detection](./2-person-detection.md)（手动流程）。

## 2. 从一句话到一个新应用

开始之前，确认你已经有：

- **Claude Code** 装好。
- **ne503 源码仓库**拿到本地（随 NE503 SDK 提供）——`ne503-dev` skill 就在仓库的 `.claude/skills/ne503-dev/`（跟着仓库走、不是独立工具）；没仓库的话[下载 skill zip](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) 解压到你的 `.claude/skills/`（zip 内含 `ne503-dev/`，解压后自动得到 `.claude/skills/ne503-dev/`）。
- 本机 **Docker**（构建应用镜像用）。
- 一台**就绪的 NE503 设备**：设备 IP + admin 密码；平台侧已初始化（HALv2 已装、ai-runtime 健康、检测模型已 scan+load——通常出厂或首次部署时就做好）。

齐了，下面整段你只需要说话。

下面是 2026-06-22 的一次真机会话。**我只说了一句话**，Claude 把应用从需求开发到跑通。

### 2.1 我输入的

在 Claude Code 里调起 `ne503-dev` skill，说：

> 做一个应用：检测到人停留 10 秒就发告警。部署到 192.168.93.20。

这就是我在 Claude Code 里实际打的那一句——调 skill、一句话提需求，Claude 读完 skill 就自己开始规划（建停留检测 app、读 person-detection 样本、查部署脚本）：

![在 Claude Code 里调起 skill、一句话提需求](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/01-skill-invoke.png)

Claude 读了 skill，跟我确认了一两个点，然后开工。

### 2.2 Claude 开发这个应用（核心）

Claude 接到这句话，全程自己跑，你只看着。下面是它会话日志里的实际轨迹（每一步都是 **Claude 的动作**，不是你要敲的）：

<div class="dev-log">

```text
Thought for 42s, read 2 files

Now let me check build_app.sh (what deploy_app.py actually calls) and probe the device's auth status so I know whether I need a password.

  Thought for 39s, read 1 file, ran 1 shell command

Device is reachable and the health endpoint is public (code:0 no auth) — suggests auth may be disabled. The skill notes .20 is a known-good device (HALv2, ai-runtime healthy, hailo_yolov8n_384_640 scanned+loaded as of 2026-06-18). Let me confirm login works with the documented admin/admin fallback and verify the model is still loaded before I build.

  Thought for 3m 22s, ran 1 shell command

⏺ Write(apps/loitering-detection/app.py)
Wrote 338 lines to apps/loitering-detection/app.py
#!/usr/bin/env python3
"""
Loitering Detection Application for AIPC Platform

Fires an alert when a person is detected lingering (continuously present) in the
camera frame for longer than a configurable duration (default 10 seconds).

Behavior:
  - Subscribes to the on-device YOLOv8n detector (stream "sub", model
    "hailo_yolov8n_384_640") at a low fps.
… +328 lines

⏺ Write(apps/loitering-detection/app.yaml)
Wrote 93 lines to apps/loitering-detection/app.yaml
# AIPC Platform Application Manifest
# Loitering Detection - alert when a person lingers past the threshold (default 10s)

apiVersion: v1
kind: Application

metadata:
  id: loitering-detection
  name: Loitering Detection
  version: 1.0.0
… +83 lines

⏺ Write(apps/loitering-detection/Dockerfile)
Wrote 55 lines to apps/loitering-detection/Dockerfile
# Loitering Detection Application Container
# For ARM64 (Hailo platform) with AIPC SDK

FROM python:3.11-slim-bookworm

LABEL maintainer="aipc@example.com"
LABEL version="1.0.0"
LABEL description="Loitering Detection Application with AIPC SDK"

# Install system dependencies
… +45 lines

⏺ Write(apps/loitering-detection/build.sh)
Wrote 47 lines to apps/loitering-detection/build.sh
#!/bin/bash
# Build script for Loitering Detection Application
# Usage: ./build.sh [arm64|amd64]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="loitering-detection"
VERSION="1.0.0"
ARCH="${1:-arm64}"
… +37 lines

⏺ Write(apps/loitering-detection/requirements.txt)
Wrote 4 lines to apps/loitering-detection/requirements.txt
# Python dependencies for Loitering Detection Application
# SDK is installed locally from the included package

numpy>=1.21.0

⏺ Write(apps/loitering-detection/README.md)
Wrote 82 lines to apps/loitering-detection/README.md
# Loitering Detection

Fires an alert when a person is detected **lingering** (continuously present) in the
camera frame for longer than a configurable duration — **default 10 seconds**.

## How it works

1. Subscribes to the on-device YOLOv8n detector: stream `sub`, model
   `hailo_yolov8n_384_640`, at a low fps.
2. Tracks continuous person presence. A **grace window** (`GRACE_SECONDS`) tolerates
… +72 lines

  Thought for 36s

All 6 files written. Quick syntax check, then build the arm64 image.

  Thought for 15s, ran 1 shell command

Syntax clean. Now building the arm64 image (this runs Docker buildx — may take a few minutes):

  Thought for 58s, ran 1 shell command

Built — loitering-detection.aipc (97M). Deploying to the device:

  Thought for 42s, ran 1 shell command

App is Running. Verifying real inference — checking the container logs for the first inference frame and the dwell logic:

  Thought for 35s, ran 1 shell command

Real inference is live and the dwell logic is correctly idle (persons=0, dwell=0.0s, alerted=False). Heartbeats every 50 frames (~10s) confirm ~5 fps processing.
```

</div>

整个过程你只输入了 §2.1 那一句（外加它问设备密码时你回了一句），其余全是 Claude 跑的。下面挑其中的**核心**展开——它怎么把"每帧有没有人"写成"停留 10 秒才告警"。

Claude 不会从零搭文件——它先拿 SDK 源码里的 `apps/template/` 应用模板当起点。模板里有三处占位值在真机上跑不通，Claude 查设备后改掉：

- 视频流：`cam0_main.raw` → `sub.raw`（`main` 只发编码 H264，subscribe 会挂；`sub` 才发能推理的原始 NV12）
- 模型：`person_v1` → `hailo_yolov8n_384_640`（设备上真实注册的检测模型）
- subscribe 参数同步改成上面两个真实值

改完占位值，应用还只是"每帧报有没有人"。要变成"停留 10 秒才告警"，Claude 写了一段**停留状态机**——这是这个应用的脑子，也是 AI 辅助开发真正替你写的部分：

```python
# Claude 写的停留状态机主干（完整文件在 apps/loitering-detection/app.py）
for frame_seq, result in self.inference.subscribe(
    stream="sub", model="hailo_yolov8n_384_640", fps=5,
):
    persons = [o for o in result.objects
               if o.label == "person" and o.score >= 0.3]
    if persons:
        if self.first_seen_ts is None:              # 进入：第一次检测到人，开始计时
            self.first_seen_ts = now
            logger.info("Person detected - dwell timer started.")
        self.last_seen_ts = now
        dwell = now - self.first_seen_ts
        if not self.alerted and dwell >= 10:        # 累计满 10 秒：发告警（每个停留周期一次）
            self._fire_alert(frame_seq, persons, dwell)
    else:
        gap = now - self.last_seen_ts
        if gap >= 3:                                 # 连续 3 秒没检测到：判定离开，重置
            self._reset()
```

逻辑三步：**进入**（第一次检测到人，开始计时）→ **累计**（满 10 秒且本轮没告警过，发告警，每个停留周期只发一次）→ **离开**（连续 3 秒没检测到，重置计时器）。留 3 秒宽限（`GRACE_SECONDS`）是为了容忍人侧身、遮挡造成的短暂丢帧，不然计时会被频繁打断。

清单 `app.yaml` Claude 也一并写了：声明这个应用要一条 `sub.raw` 视频流、一个 `hailo_yolov8n_384_640` 模型、两个事件 topic，外加停留时长/检测阈值/宽限秒数几个可调环境变量。到这一步，**一个新应用的代码就开发完了**。

这些环境变量都在 `app.yaml` 里改（应用行为）：

| 旋钮 | 默认值 | 作用 |
|---|---|---|
| `LOITER_SECONDS` | 10 | 连续停留多久触发告警 |
| `GRACE_SECONDS` | 3 | 连续多久没检测到才判定离开（容忍短暂丢帧） |
| `ALERT_REPEAT_SECONDS` | 0 | 告警重复间隔；0 = 每个停留周期只告警一次 |
| `ALERT_LIGHT_ENABLED` | false | 设 true 时触发白光警示 |
| `DETECTION_THRESHOLD` | 0.3 | person 置信度阈值 |
| `SUBSCRIBE_FPS` | 5 | 订阅推理的帧率 |

控制台看实时告警：`http://<设备 IP>:8080` → 应用管理 → loitering-detection → 日志。

### 2.3 Claude 部署并验收它写的应用

代码写好，Claude 自己构镜像、自己部署——它调用 skill 自带的部署脚本，把"构建→上传→安装→启动→验收"10 步串起来全自动跑（这是 **Claude 的动作**，不是我要敲的命令），一次跑通，应用 `running`：

![应用管理页：Loitering Detection 已 Running](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/02-apps-running.png)

部署成功不等于真在推理。Claude 拉日志确认模型加载了、帧在流；应用详情里平台注入的权限正好是 `app.yaml` 声明的那些（`sub` 流、`hailo_yolov8n_384_640` 模型、事件总线、补光灯控）：

![应用详情：权限与资源](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/03-app-detail.png)

然后请我站到摄像头前配合验收。Web 控制台实时日志里捕到的完整一轮——进入、累计、告警、离开重置：

![实时日志：满 10 秒触发 ALERT](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/04-logs-live.png)

```
[2026-06-22 03:56:57] [INFO] Person detected - dwell timer started.
[2026-06-22 03:57:05] [INFO] status: frames=1250 persons=1 dwell=8.2s alerted=False alerts=0
[2026-06-22 03:57:07] [WARNING] ALERT #1: 1 person(s) lingering 10.1s >= 10.0s threshold
[2026-06-22 03:57:16] [INFO] status: frames=1300 persons=1 dwell=18.8s alerted=True alerts=1
[2026-06-22 03:57:20] [INFO] Scene clear (gap 3.2s >= grace 3.0s) - resetting loiter state.
```

进入即计时（`Person detected`），状态行每 50 帧（约 10 秒）报一次进度，满 10.1 秒触发 `ALERT #1` 并把告警事件发到 `app/loitering-detection/loitering` 和 `alerts/loitering`，人离开后 `Scene clear` 重置状态机。**Claude 写的那段状态机，真的按预期工作了。** 这轮在真机上重复多次，每次告警都落在 10.1 秒。

告警事件同步发到事件总线，结构化、可订阅（`app/loitering-detection/status`）：

```
{"present": true, "dwell_seconds": 73.76, "alerted": true, "alerts_fired": 1}
```

整个验收里人来了又走好几回，累计 3 次独立告警——每次都在停留满 10 秒时触发、人离开才重置，没误报也没漏报。

**就这些。** 我输入的是 §2.1 那一句话；写代码、配清单、构建、部署、验收——全是 Claude 干的，我没碰命令行。一句话进，一个在设备上实跑、真人停留 10 秒就告警的应用出——中间没有任何手动步骤。

## 相关文档

- [SDK 工作流](./0-sdk-workflow.md) —— SDK 用法总览
- [Hello World](./1-hello-world.md) —— 最小应用 + 手动部署
- [Person Detection](./2-person-detection.md) —— person-detection 完整应用 + 手动开发部署详解
