---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 2
description: Build and deploy a NE503 app with Claude Code and ne503-dev.
keywords: [NE503, ne503-dev, Claude Code, AI-assisted development, app development]
tags: [Application Development, NE503, AI-assisted development]
---

# AI-Assisted Development

This example uses **Claude Code** and ne503-dev to build a “10-second loitering alert” app: alert after a person remains for 10 seconds, then reset after the person leaves.

:::tip Try the packaged app
Download the [prebuilt package](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/lingering-detection.tar), extract it, and follow the [Hello World deployment steps](./2-cookbook/0-hello-world.md#3-deploy-to-the-device).
:::

## 1. Prerequisites

| Item | Requirement |
|:--|:--|
| Claude Code | Installed and working |
| Skill name | `ne503-dev`; [download](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) and extract to `~/.claude/skills/ne503-dev/` |
| [neoruntime](https://github.com/camthink-ai/neoruntime) | Platform services, HAL, build, and deployment scripts |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python/C++ SDKs |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | App templates and examples |
| Docker | Build ARM64 images |
| Target device | NE503 connected; model, HAL v2, and ai-runtime available |

## 2. Development Flow

Call ne503-dev in Claude Code with:

> Send an alert when a person remains for 10 seconds. Deploy to the device IP.

Confirm the duration, detection threshold, and device address. The tool then:

1. Queries the device's available model and raw stream;
2. Generates the state machine, app.yaml, and permissions;
3. Builds the ARM64 image, installs, and starts the app.

The example uses hailo_yolov8n_384_640 and raw stream sub. Use values returned by the device instead of copying names from another device.

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

## 3. Verify

Confirm:

- app state is Running;
- logs show model loading and the first inference;
- a person entering the frame triggers an alert and leaving resets the state.

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

Full walkthrough: [ai-assisted-development_new.mp4](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4).
