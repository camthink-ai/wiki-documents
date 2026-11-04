---
title: Solution Description
sidebar_label: "Solution Description"
sidebar_position: 1
description: "Edge face recognition with the NeoEyes NE302: on-device detection and tracking, mosaic privacy masking, crop reporting and live result overlay over Webhook or MQTT."
---

![Solution demo: face detection, mosaic masking and live name overlay](/img/solutions/face-recognition/overview-demo.webp)

*Solution demo: mosaic does not affect backend recognition; enrolled faces show names live*

*Live view: face boxes with track IDs and detection confidence; enrolled faces show recognized names, others are mosaiced*

## Background

Access control, visitor check-in, member greeting and watchlist scenarios all need face recognition. The common approach streams video to the cloud: high latency, high bandwidth, and **faces are biometric data — moving them off-site is a compliance risk**.

These scenarios share a pattern: recognition only matters in the seconds a face appears; the rest of the time the camera just needs to detect. The steps that truly need the raw image (enrollment, review) can be human-supervised.

## Solution

The idea: **detection and tracking on the camera, recognition on your backend, results overlaid on both.**

A CamThink **NeoEyes NE302** mini AI camera (STM32N6, Neural-ART NPU) runs YuNet face detection and IoU tracking on-device: every face gets a stable track ID, and boxes/IDs/confidences are burned into the video stream. An optional **mosaic** protects faces in the preview/recording streams. When a new face appears (or on a configurable period), the camera crops the **unblurred** face from the raw frame and reports it over **Webhook (sync response) or MQTT (async reply)** to your recognition service; the returned name and confidence are associated back by track ID and overlaid in real time.

The recognition service can be your own application, or the bundled **mock backend script** (real ArcFace recognition) for instant demos.

![Architecture: on-camera detect/track, backend recognition, results overlaid](/img/solutions/face-recognition/architecture-en.svg)

## Workflow

1. **Detection** — YuNet 320×320 on-device inference (~7ms/frame): box, confidence, 5 landmarks
2. **Tracking** — IoU tracker assigns stable IDs (N-frame confirmation; brief misses keep the ID)
3. **Privacy** — optional mosaic applies to the encoded stream only; the reported crop is taken **before** blurring so the backend sees the original face
4. **Crop reporting** — new faces always report once; periodic re-report and cooldown are configurable; uniform expansion with edge clamping, native size or fixed-size letterbox
5. **Result return** — Webhook sync response / MQTT control channel; `{request_id, track_id, status, name, confidence}` matched by request_id, with timeout/unknown/error states
6. **Presentation** — burned-in overlay (box color = status, single-line `#ID conf name conf`) plus the web page recognition list (full names, archived records)

## Highlights

- **Edge/cloud split**: detect/track/mosaic on-camera (low bandwidth, low latency); recognition on your backend (any engine, protocol-decoupled)
- **Dual channel**: Webhook (sync, REST-friendly) or MQTT (async, message-friendly), switchable live from the web UI
- **Privacy first**: irreversible mosaic on video; reported images go only to your configured backend; explicit warnings for public brokers
- **Keypoint-less compatible**: supports both landmark (YuNet/BlazeFace) and box-only face models
- **Fully verifiable chain**: mock backend (tiered recognizer with ArcFace), on-device photo-based recognition check, per-stage diagnostics

## Results

- Enrolled faces show name + confidence within 1 second; unknown faces show "unknown"; unreachable backend shows "timeout" after the configured window (default 5s)
- Recognition can be checked offline by uploading a photo — no one needs to stand in front of the camera
- Accuracy depends on lighting, pose and distance; validate on site

## Learn More

- [Engineering Guide: setup / integration / usage / operations](/docs/edge-ai-solutions/face-recognition/engineering-guide)
- [NeoEyes NE302 overview](/docs/neoeyes-ne302-series/ne302-overview)
- [NE302 Data Transmission (MQTT / Webhook)](/docs/neoeyes-ne302-series/user-guide/ne302-data-transmission)
- Open-source project (firmware / web / model / mock backend): [github.com/camthink-ai/ne302](https://github.com/camthink-ai/ne302)
