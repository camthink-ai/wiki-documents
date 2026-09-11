---
sidebar_label: "Technical Details"
description: "Technical details: model spec, AI pipeline, performance."
---
# Technical Details

## 4.1 AI Model

| Item | Specification |
|---|---|
| Model | hailo_yolov8n_384_640 |
| Task | person detection / zone occupancy |
| Input | video stream (384×640 inference) |
| Output | person boxes / zone count / events |
| Framework | Hailo HEF (in-camera NPU) |
| Accelerator | Hailo-15H NPU (20 TOPS INT8) |

## 4.2 AI Pipeline

| App | Pipeline |
|---|---|
| Occupancy Monitor | stream → detect → zone aggregation → periodic occupancy publish |
| Person Detection | stream → detect → event decision → Event Bus publish (light/alert linkage) |

Zone occupancy needs no counting line; entrance footfall = Person Detection events + host-side in/out decision (line-crossing optional).

## 4.3 Performance

| Metric | Result |
|---|---|
| Bidirectional counting accuracy | ≥ 95% (top-down, unobstructed; calibrate on site) |
| Event latency | local, seconds |
| Per-camera coverage | one zone per camera (multi-model concurrency) |

> 📝 **Template placeholder**: Add sampled FPS/latency/night-vision figures per point.
