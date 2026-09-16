---
title: Solution Description
sidebar_label: "Solution Description"
sidebar_position: 1
description: "Smart gym solution built on NeoEyes NE503 and NeoMind: member identification, zone and equipment usage analytics, rep counting and personal training reports — all data stays on-premises."
---

![Smart gym solution: the NeoMind dashboard showing member training analysis, equipment occupancy and traffic trends](/img/solutions/smart-gym/dashboard-demo.webp)

*NeoMind dashboard: member training analysis, equipment occupancy and traffic trends at a glance*

## Background

Gym operations have long struggled with a few blind spots: what members trained and how many reps they did relies purely on memory, leaving coaches without quantified guidance; which machines are busiest and which zones sit idle is opaque to management; and outsourcing video analytics means footage leaves the premises, raising member privacy concerns.

Gyms don't lack cameras — they lack the intelligence that lets cameras "understand" training: knowing who the member is, which machine they're using, what movements they performed and how long they trained.

## Solution Overview

The idea: **one camera + one platform, turning workouts into structured data.**

Deploy a single CamThink **NeoEyes NE503** edge AI camera (Hailo-15H, 20 TOPS NPU) overhead to cover a mid-size training area of 10–20 people. The camera runs four models concurrently on-device — person detection, 17-keypoint pose, face detection and face features — handling member identification and trajectory tracking; the **gym-tracker extension** on the **NeoMind platform** takes care of member library matching, equipment zone detection, rep counting and training report generation.

The entire analysis runs on-premises: data stays on the NeoMind host and never passes through third-party clouds. Members participate only as face feature vectors — no raw footage is stored — balancing intelligence with privacy compliance.

## Workflow

1. **Member identification** — face features are matched against the member library to recognize returning members automatically; new faces are auto-enrolled, with details filled in later
2. **Trajectory tracking** — ByteTrack multi-object tracking outputs stable IDs and foot-point coordinates, covering the whole floor with a single camera
3. **Zone & equipment analytics** — foot points hit pre-defined equipment zones (with 3-second dwell debouncing that filters passers-by) to determine when equipment use starts and ends
4. **Movement recognition & counting** — pose keypoints combined with a joint-angle state machine recognize and count exercises such as squats, bench presses, biceps curls and rows, judging whether the range of motion is sufficient
5. **Training reports & operations overview** — per member: duration, equipment, movement details and historical trends; per gym: occupancy, equipment usage and traffic by time slot

## Key Benefits

- **Single-camera coverage**: 10–20 people in a mid-size gym with one NE503 — no multi-camera handoff
- **Four models on-device**: 20 TOPS NPU local inference with zero cloud dependency and low-latency output
- **Privacy first**: only face feature vectors are stored, never raw footage; training data stays on the gym's local host
- **Cable-free retrofit**: PoE single-cable power and data, IP67 rated for humid environments — install and go
- **Visual ROI editing**: rectangle, polygon and lasso tools to define equipment zones; changes take effect immediately
- **Auto enrollment**: unknown visitors are automatically enrolled as profiles for admins to complete later

## Outcome

- Every workout automatically produces a detailed report (duration, equipment, movements and reps) — traceable, comparable, with training suggestions
- Coaches plan programs based on data reports, shifting guidance from gut feeling to evidence
- Occupancy, equipment utilization and time-slot traffic are visible in real time, informing scheduling and floor decisions
- Recognition accuracy depends on lighting, crowd density and occlusion; use on-site measurement as the baseline

## Learn More

- [NeoEyes NE503 Overview](/docs/neoeyes-ne503-series/overview)
- [NeoMind Platform Docs](/docs/neomind/product-overview/what-is-neomind)
- gym-tracker extension repository: [github.com/camthink-ai/NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)
