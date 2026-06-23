---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 3
description: AI-assisted development with Claude Code and the ne503-dev skill — describe the requirement in one sentence, and Claude writes the app code (logic + manifest), deploys it to the device, and verifies it. Full on-device demo with a "loitering alert" app.
keywords: [NE503, ne503-dev, Claude Code, skill, AI-assisted development, app development, loitering alert, dwell, state machine, natural language]
tags: [App Development, NE503, AI-Assisted Development, skill]
---

# AI-Assisted Development

This page demonstrates **AI-assisted development**: describe the requirement in one sentence of natural language, and Claude (using the `ne503-dev` skill) takes care of the app's development, deployment, and verification — with no manual command execution.

The demo app is a **loitering alert** (Loitering Detection): when a person stays in frame continuously for 10 seconds, it fires an alert; when they leave, it resets.

## 1. Prerequisites

| Prerequisite | Description |
|:---|:---|
| Claude Code | Installed locally. |
| ne503 source repo | Clone locally (bundled with the NE503 SDK); the `ne503-dev` skill resides at `.claude/skills/ne503-dev/`. Alternatively, [download the skill zip](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) and extract it into `.claude/skills/`. |
| Docker | On the local machine, for building app images. |
| NE503 device | Ready: IP + admin password known; platform initialized (HALv2 installed, ai-runtime healthy, detection model scanned + loaded). |

## 2. From One Sentence to a New App

Traditional development requires writing the `app.py` business logic, configuring `app.yaml` permissions, discovering the device's available models and video streams, building the image, deploying, and verifying — AI-assisted development hands all of this to Claude; the developer only describes the requirement in natural language. Below is a real on-device session (2026-06-22) where the only input was a single sentence.

### 2.1 Input requirement

In Claude Code, invoke the `ne503-dev` skill and describe the requirement in natural language:

> Build an app: fire an alert after someone is detected lingering for 10 seconds. Deploy to `<device-IP>`.

Claude reads the skill, starts planning on its own, and — after confirming a few details with the developer — gets to work:

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

### 2.2 Claude develops the app (the core)

Once the requirement is confirmed, Claude develops the app autonomously, starting from the SDK's `apps/template/` app template. Three key decisions shape the app:

- **Placeholder fixes**: the template's sample model and stream don't run on a real device; Claude queries the device and substitutes the real values — model `hailo_yolov8n_384_640`, stream `sub` (publishes raw NV12 frames; `main` only publishes encoded H264 and cannot be used for inference).
- **Dwell state machine**: the app's core logic. A timer starts when a person enters the frame; an alert fires once they linger continuously for 10 seconds; if no person is detected for 3 seconds, they're deemed to have left and the state resets. A 3-second grace window (`GRACE_SECONDS`) tolerates brief detection drops from turning or occlusion.
- **Manifest config**: `app.yaml` declares the required video stream, model, event topics, and tunable env vars (dwell seconds `LOITER_SECONDS`, detection threshold `DETECTION_THRESHOLD`, grace seconds `GRACE_SECONDS`, etc.).

The full development process (template selection → placeholder fixing → state machine implementation) is below:

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-end_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

### 2.3 Claude deploys and verifies

With the code written, deployment is likewise handled by Claude — the skill's bundled script chains "build → upload → install → start → verify" into one fully-automatic pass, and the app enters `running`.

After deployment, Claude verifies three things: inference is actually live (logs confirm the model is loaded and the first frame has arrived); the platform-injected permissions match `app.yaml`; and actually stepping into the camera frame triggers a complete detection cycle. The verification from the Web Console's perspective is below:

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

The cycle repeated many times on-device; every alert landed at 10.1 s, totaling 3 independent alerts — no false alarms, no missed ones.

One requirement in, a live loitering-detection app on the device out — with no manual step in between.

Full end-to-end process (watch on demand):

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>
