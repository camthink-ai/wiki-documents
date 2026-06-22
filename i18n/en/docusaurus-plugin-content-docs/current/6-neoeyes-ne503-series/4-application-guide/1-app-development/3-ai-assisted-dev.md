---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 3
description: AI-assisted development with Claude Code and the ne503-dev skill — you describe the app you want in one sentence, Claude writes the new app's code (logic + manifest), then deploys it to the device and verifies it. Full demo with a brand-new app, a "loitering alert", that isn't in the other pages.
keywords: [NE503, ne503-dev, Claude Code, skill, AI-assisted development, app development, loitering alert, dwell, state machine, natural language]
tags: [App Development, NE503, AI-Assisted Development, skill]
---

# AI-Assisted Development

This page is about **AI-assisted development** — you describe the app you want in one sentence, and Claude (using the `ne503-dev` skill) **writes it for you**, deploys it to the device, and verifies it. You never type a command; you speak only in natural language.

The demo is a brand-new app: a **loitering alert** — when someone stays in frame continuously for 10 seconds, it fires an alert; when they leave, it resets. The focus is on how Claude **develops** this app's code from a requirement.

## 1. What this path is for

In one line: **you don't write the code yourself**. Everything the manual flow does — writing the `app.py` business logic, configuring `app.yaml` permissions, finding which model works and which stream carries raw frames, building, deploying — AI-assisted development hands all of it to Claude; you just describe what you want.

**Development comes first, deployment second** — this page focuses on development (§2); deployment is just confirming the app runs (§2.3). For the step-by-step under the hood of deployment, go to [Hello World](./1-hello-world.md) and [Person Detection](./2-person-detection.md) (the manual flow).

## 2. From one sentence to a new app

Before you start, make sure you have:

- **Claude Code** installed.
- The **ne503 source repo** on your machine (ships with the NE503 SDK) — the `ne503-dev` skill lives in the repo's `.claude/skills/ne503-dev/` (it rides with the repo, not a standalone tool); without the repo, [download the skill zip](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) and unzip it into your `.claude/skills/` (the zip already contains a `ne503-dev/` folder, so you end up with `.claude/skills/ne503-dev/`).
- **Docker** on your machine (for building app images).
- A **ready NE503 device**: its IP, admin username + password, with the platform already initialized (HALv2 installed, ai-runtime healthy, the detection model scanned + loaded — normally done at the factory or on first deploy).

With those in place, the rest of this section is you just talking.

Below is a real on-device session from 2026-06-22. **I typed one sentence**, and Claude took the app from requirement to running.

### 2.1 What I typed

In Claude Code, I invoked the `ne503-dev` skill and said:

> Build an app: fire an alert after someone is detected lingering for 10 seconds. Deploy to 192.168.93.20.

That's exactly the one line I typed in Claude Code — invoke the skill, state the requirement in one sentence, and Claude reads the skill and starts planning on its own (build a loitering-detection app, study the person-detection sample, check the deploy script):

![Invoking the skill in Claude Code with a one-sentence requirement](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/01-skill-invoke.png)

Claude read the skill, confirmed a point or two with me, then got to work.

### 2.2 Claude develops the app (the core)

Claude took this and ran the whole thing itself — you just watched. Here's its actual trajectory from the session log (every step is **Claude's action**, not something for you to type):

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

Your only input the whole time was the one sentence in §2.1 (plus one reply when it asked for the device password); everything else was Claude. The rest of this section zooms in on the **core** — how it turns "is there a person this frame" into "alert after 10 seconds".

Claude doesn't build the file structure from scratch — it starts from the `apps/template/` app template in the SDK source. The template has three placeholder values that won't run on a real device; Claude queries the device and fixes them:

- Video stream: `cam0_main.raw` → `sub.raw` (`main` only carries encoded H264, which makes `subscribe` hang; `sub` carries the raw NV12 frames inference can run on)
- Model: `person_v1` → `hailo_yolov8n_384_640` (the actually-registered detection model on the device)
- The `subscribe` args are updated to match those two real values

With the placeholders fixed, the app still only reports "is there a person, this frame." To turn that into "alert after 10 seconds," Claude writes a **dwell state machine** — this is the brain of the app, and the part AI-assisted development genuinely writes for you:

```python
# The dwell state machine Claude wrote (full file at apps/loitering-detection/app.py)
for frame_seq, result in self.inference.subscribe(
    stream="sub", model="hailo_yolov8n_384_640", fps=5,
):
    persons = [o for o in result.objects
               if o.label == "person" and o.score >= 0.3]
    if persons:
        if self.first_seen_ts is None:              # enter: first detection, start the timer
            self.first_seen_ts = now
            logger.info("Person detected - dwell timer started.")
        self.last_seen_ts = now
        dwell = now - self.first_seen_ts
        if not self.alerted and dwell >= 10:        # 10 s reached: fire the alert (once per streak)
            self._fire_alert(frame_seq, persons, dwell)
    else:
        gap = now - self.last_seen_ts
        if gap >= 3:                                 # no detection for 3 s: person left, reset
            self._reset()
```

Three steps: **enter** (first detection starts the timer) → **accumulate** (at 10 seconds with no alert yet this streak, fire it — once per streak) → **leave** (no detection for 3 seconds straight resets the timer). The 3-second grace (`GRACE_SECONDS`) tolerates brief detection drops when someone turns or is occluded, so the timer isn't constantly interrupted.

Claude also wrote the manifest `app.yaml`: declares one `sub.raw` video stream, one `hailo_yolov8n_384_640` model, two event topics, and a few tunable env vars (dwell seconds, detection threshold, grace seconds). At this point **a new app's code is developed.**

These env vars are all set in `app.yaml` (app behavior):

| Knob | Default | Effect |
|---|---|---|
| `LOITER_SECONDS` | 10 | How long someone must linger before an alert fires |
| `GRACE_SECONDS` | 3 | How long with no detection before the person is considered gone (tolerates brief drops) |
| `ALERT_REPEAT_SECONDS` | 0 | Alert repeat interval; 0 = fire once per loiter streak |
| `ALERT_LIGHT_ENABLED` | false | Set true to trigger the white-light deterrent |
| `DETECTION_THRESHOLD` | 0.3 | person confidence threshold |
| `SUBSCRIBE_FPS` | 5 | Frames per second for inference subscription |

Live alerts in the console: `http://<device-IP>:8080` → App Management → loitering-detection → Logs.

### 2.3 Claude deploys and verifies the app it wrote

With the code written, Claude builds the image and deploys it itself — it calls the skill's bundled deploy script, chaining "build → upload → install → start → verify" (10 steps) into one fully-automatic run (this is **Claude's action**, not a command for me to type). It passes in one go; the app is `running`:

![App Management: Loitering Detection is Running](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/02-apps-running.png)

"Deployed" doesn't mean "actually inferring." Claude pulls the logs to confirm the model is loaded and frames are flowing; in the app detail, the permissions the platform injected are exactly those declared in `app.yaml` (the `sub` stream, the `hailo_yolov8n_384_640` model, the event bus, light control):

![App detail: Permissions & Resources](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/03-app-detail.png)

Then it asks me to stand in front of the camera to verify. The web console's live log captured a full cycle — enter, accumulate, alert, leave-and-reset:

![Live log: ALERT fires at 10 seconds](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/04-logs-live.png)

```
[2026-06-22 03:56:57] [INFO] Person detected - dwell timer started.
[2026-06-22 03:57:05] [INFO] status: frames=1250 persons=1 dwell=8.2s alerted=False alerts=0
[2026-06-22 03:57:07] [WARNING] ALERT #1: 1 person(s) lingering 10.1s >= 10.0s threshold
[2026-06-22 03:57:16] [INFO] status: frames=1300 persons=1 dwell=18.8s alerted=True alerts=1
[2026-06-22 03:57:20] [INFO] Scene clear (gap 3.2s >= grace 3.0s) - resetting loiter state.
```

Entry starts the timer (`Person detected`), a status line reports progress every 50 frames (~10 s), at 10.1 s `ALERT #1` fires and publishes the alert event to `app/loitering-detection/loitering` and `alerts/loitering`, and after I step out `Scene clear` resets the state machine. **The state machine Claude wrote actually works as intended.** This cycle repeated many times on-device; every alert landed at 10.1 s.

The alert event is also published to the event bus, structured and subscribable (`app/loitering-detection/status`):

```
{"present": true, "dwell_seconds": 73.76, "alerted": true, "alerts_fired": 1}
```

Over the whole verification the person came and went several times, totaling 3 independent alerts — each fired exactly when dwell hit 10 s, each reset only when they left; no false alarms, no missed ones.

**That's it.** My input was the one sentence in §2.1; writing the code, configuring the manifest, building, deploying, verifying — Claude did all of it. I never touched a command line. One sentence in, a live app on the device that fires when a real person lingers 10 seconds — with no manual step in between.

## Related docs

- [SDK Workflow](./0-sdk-workflow.md) — the SDK surface
- [Hello World](./1-hello-world.md) — minimal app + manual deploy
- [Person Detection](./2-person-detection.md) — full person-detection app + manual develop & deploy
