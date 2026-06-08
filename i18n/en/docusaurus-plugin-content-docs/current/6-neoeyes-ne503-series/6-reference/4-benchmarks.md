---
description: Comprehensive evaluation report on NE503 AI model benchmarks, NPU parallelism, inference scheduling parameters, and video decoding capabilities, covering throughput and latency data for 12 models on Hailo-15H SoC, multi-model parallel inference test results, ai-runtime scheduling parameter activation analysis, and video decoding performance bottleneck assessment.
keywords: [NE503 benchmarks, Hailo-15H, NPU performance, AI model benchmark, parallel inference, video decoding, ai-runtime, HailoRT, throughput, latency]
tags: [Benchmark, NPU Performance, NE503, Platform Contributors, System Operations]
---

# AI Model Performance Benchmarks

## 1 Test Environment

| Item | Value |
|------|-------|
| Device | NE503 (AM20-01) |
| SoC | Hailo-15H (SoC total 26 TOPS, NPU 20 TOPS) |
| NPU Compute | 20 TOPS (INT8) |
| CPU | 4x Cortex-A53 @ 1.3 GHz (12k DMIPS) |
| DSP | Vector DSP, 256 MACs @ 700 MHz (350 GOPs) |
| Memory | 8 GB LPDDR4X 32-bit @ 4266 MT/s, bandwidth 68.3 GB/s |
| Power | < 5W |
| ISP | Dual ISP, 12 MP, 600 Mpixel/s |
| Firmware | HailoRT 5.3.0 |
| Compiler | HEF Compiler 5.2.0 / 5.3.0 |
| Test Tool | `hailortcli benchmark --batch-size 1` |
| NPU Config | max_model_cache=3, exclusive mode (no concurrent models) |
| ai-runtime Config | global_concurrent_limit=8, queue_size=64 |
| Test Date | 2026-05-18 |

---

## 2 AI Model Benchmarks

### 2.1 Object Detection Models

#### 2.1.1 YOLOv8n Detection (hailo_yolov8n_384_640)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/detection/hailo_yolov8n_384_640.hef` |
| Size | 4.7 MB |
| Input | NV12, 384x640 |
| Output | YOLOv8 NMS, 4 classes, up to 100 bounding boxes per class |
| Contexts | 2 (Multi-Context) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **444.9** |
| **Latency** | **2.25 ms** |
| Temperature | 81.2C (average) |

Post-processing config: score threshold 0.20, IoU threshold 0.60, image 384x640.

#### 2.1.2 YOLOv5m Vehicle Detection (yolov5m_vehicles)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/detection/yolov5m_vehicles.hef` |
| Size | 18 MB |
| Input | F8CR, 1080x1920 (1080x1920x3) |
| Output | YOLOv5 NMS, 1 class (vehicle), up to 80 bounding boxes |
| Contexts | 5 (Multi-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **46.6** |
| **Latency** | **21.5 ms** |
| Temperature | 80.0C (average) |

Full HD input resolution. Built-in NMS post-processing, no external post-processing required.

#### 2.1.3 Tiny YOLOv4 License Plate Detection (tiny_yolov4_license_plates)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/detection/tiny_yolov4_license_plates.hef` |
| Size | 4.7 MB |
| Input | NHWC RGB, 416x416 |
| Output | Raw -- 13x13x18 + 26x26x18 (no built-in NMS) |
| Contexts | 1 (Single-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **908.4** |
| **Latency** | **1.10 ms** |
| Temperature | 86.0C (average) |

Used as the first stage of the LPR pipeline. No built-in NMS, requires external post-processing.

### 2.2 Image Classification Models

#### 2.2.1 ViT Large (vit_large)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/classification/vit_large.hef` |
| Size | 268 MB |
| Input | NHWC RGB, 224x224 |
| Output | 1x1x1000 (1000 class probabilities) |
| Contexts | 32 (Multi-Context, most complex model) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **18.9** |
| **Latency** | **52.9 ms** |
| Temperature | 83.2C (average) |

Largest model by file size. 32 Contexts means significant NPU scheduling overhead.

### 2.3 Semantic Segmentation Models

#### 2.3.1 Linknet MobileNetV1 (linknet_mbv1_ss_dpm_256)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/segmentation/linknet_mbv1_ss_dpm_256.hef` |
| Size | 1.9 MB |
| Input | NV12, 256x256 (128x256x3 in NV12 layout) |
| Output | 256x256x2 (2-class segmentation mask) |
| Contexts | 1 (Single-Context) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **1073.2** |
| **Latency** | **0.93 ms** |
| Temperature | 84.6C (average) |

Smallest model, highest throughput. Sub-millisecond latency.

### 2.4 Keypoint Detection Models

#### 2.4.1 Face Landmarks Lite (face_landmarks_lite)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/keypoint/face_landmarks_lite.hef` |
| Size | 1.9 MB |
| Input | NV12, 192x96 (96x192x3 in NV12 layout) |
| Output | 1x1x1404 (keypoints) + 1x1x1 (confidence) |
| Contexts | 3 (Multi-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **811.8** |
| **Latency** | **1.23 ms** |
| Temperature | 81.9C (average) |

1404 keypoints = 468 points x 3 coordinates (x, y, z). Needs to run alongside a face detector (yolov8n).

### 2.5 Depth Estimation Models

#### 2.5.1 SCDepthV3 (scdepthv3)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/depth/scdepthv3.hef` |
| Size | 12 MB |
| Input | NHWC RGB, 256x320 |
| Output | 256x320x1 (depth map, UINT16) |
| Contexts | 1 (Single-Context) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **737.3** |
| **Latency** | **1.36 ms** |
| Temperature | 87.5C (average) |

Highest NPU temperature observed during testing (peak 89.2C). Monocular depth estimation model.

### 2.6 CLIP Zero-Shot Models

#### 2.6.1 CLIP ViT-B/32 NV12 (clip_vit_b_32_image_encoder_nv12)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/clip/clip_vit_b_32_image_encoder_nv12.hef` |
| Size | 83 MB |
| Input | NV12, 224x112 (112x224x3 in NV12 layout) |
| Output | 1x1x512 (image embedding vector) |
| Contexts | 14 (Multi-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **72.7** |
| **Latency** | **13.8 ms** |
| Temperature | 83.4C (average) |

NV12 input variant, supports zero-copy transfer from camera pipeline.

#### 2.6.2 CLIP ViT-B/16 (clip_vit_b_16_image_encoder)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/zeroshot/clip_vit_b_16_image_encoder.hef` |
| Size | 76 MB |
| Input | NHWC RGB, 224x224 |
| Output | 1x1x512 (image embedding vector) |
| Contexts | 14 (Multi-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **57.6** |
| **Latency** | **17.4 ms** |
| Temperature | 83.3C (average) |

ViT-B/16 has finer patch granularity (16x16), slightly slower than ViT-B/32 (32x32) but higher accuracy.

### 2.7 OCR Models

#### 2.7.1 LPRNet (lprnet)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/ocr/lprnet.hef` |
| Size | 4.4 MB |
| Input | NHWC RGB, 75x300 |
| Output | 1x19x11 (19 characters x 11 classes) |
| Contexts | 1 (Single-Context) |
| HEF Compiler | 5.2.0 |
| **NPU FPS** | **201.5** |
| **Latency** | **4.96 ms** |
| Temperature | 83.5C (average) |

License plate character recognition. 11 classes = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ-".

#### 2.7.2 PaddleOCR v5 Mobile Detection (paddle_ocr_v5_mobile_detection)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/ocr/paddle_ocr_v5_mobile_detection.hef` |
| Size | 5.0 MB |
| Input | NHWC RGB, 544x960 |
| Output | 544x960x1 (text region heatmap) |
| Contexts | 4 (Multi-Context) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **22.5** |
| **Latency** | **44.4 ms** |
| Temperature | 82.6C (average) |

Largest input resolution (960x544), heaviest OCR model. Used as the first stage of the OCR pipeline.

#### 2.7.3 PaddleOCR v5 Mobile Recognition (paddle_ocr_v5_mobile_recognition_nv12)

| Item | Value |
|------|-------|
| File | `/opt/aipc/models/ocr/paddle_ocr_v5_mobile_recognition_nv12.hef` |
| Size | 4.9 MB |
| Input | NV12, 48x320 (24x320x3 in NV12 layout) |
| Output | FCR 1x40x18385 (40 characters x 18385 classes) |
| Contexts | 5 (Multi-Context) |
| HEF Compiler | 5.3.0 |
| **NPU FPS** | **127.4** |
| **Latency** | **7.85 ms** |
| Temperature | 81.2C (average) |

NV12 input variant. 18385 classes cover the complete CJK + Latin character set.

### 2.8 Pipeline Performance

#### 2.8.1 LPR License Plate Recognition Pipeline

```
Camera Frame -> tiny_yolov4 (detect plate ROI) -> LPRNet (recognize characters) -> Result
```

| Stage | Model | NPU FPS | Latency |
|-------|-------|---------|---------|
| 1. Detection | tiny_yolov4_license_plates | 908 | 1.10 ms |
| 2. Recognition | lprnet | 201 | 4.96 ms |
| **Pipeline Total** | Serial + ROI cropping | **~30 FPS** (estimated) | **~6 ms + overhead** |

Bottleneck: ROI extraction and per-plate recognition when multiple plates are detected simultaneously.

#### 2.8.2 OCR Text Recognition Pipeline

```
Camera Frame -> paddle_det (detect text regions) -> paddle_rec (recognize text) -> Result
```

| Stage | Model | NPU FPS | Latency |
|-------|-------|---------|---------|
| 1. Detection | paddle_ocr_v5_mobile_detection | 22.5 | 44.4 ms |
| 2. Recognition | paddle_ocr_v5_mobile_recognition | 127 | 7.85 ms |
| **Pipeline Total** | Serial + ROI cropping | **~18 FPS** (estimated) | **~52 ms + overhead** |

Bottleneck: First stage detection (44.4 ms). Second stage runs per text region.

### 2.9 Performance Overview

#### Throughput Ranking (NPU FPS, descending)

| Rank | Model | Type | Input | FPS | Latency | Size |
|------|-------|------|-------|-----|---------|------|
| 1 | linknet_mbv1_ss_dpm_256 | Semantic Segmentation | 256x256 | **1073** | 0.93 ms | 1.9M |
| 2 | tiny_yolov4_license_plates | Object Detection | 416x416 | **908** | 1.10 ms | 4.7M |
| 3 | face_landmarks_lite | Keypoint Detection | 192x96 | **812** | 1.23 ms | 1.9M |
| 4 | scdepthv3 | Depth Estimation | 256x320 | **737** | 1.36 ms | 12M |
| 5 | hailo_yolov8n_384_640 | Object Detection | 384x640 | **445** | 2.25 ms | 4.7M |
| 6 | lprnet | OCR Recognition | 75x300 | **202** | 4.96 ms | 4.4M |
| 7 | paddle_recognition | OCR Recognition | 48x320 | **127** | 7.85 ms | 4.9M |
| 8 | clip_vit_b_32 | CLIP | 224x112 | **73** | 13.8 ms | 83M |
| 9 | clip_vit_b_16 | CLIP | 224x224 | **58** | 17.4 ms | 76M |
| 10 | yolov5m_vehicles | Object Detection | 1080x1920 | **47** | 21.5 ms | 18M |
| 11 | paddle_detection | OCR Detection | 544x960 | **22** | 44.4 ms | 5.0M |
| 12 | vit_large | Image Classification | 224x224 | **19** | 52.9 ms | 268M |

#### Performance Tiers

| Tier | FPS Range | Models | Use Cases |
|------|-----------|--------|-----------|
| Ultra-high throughput | >500 FPS | linknet, tiny_yolov4, face_landmarks, scdepthv3, yolov8n | Real-time multi-stream, low latency |
| Medium throughput | 20-200 FPS | yolov5m, lprnet, paddle_rec, clip_b_32, clip_b_16 | Single-stream real-time |
| Heavy load | `<25` FPS | paddle_det, vit_large | Batch processing, non-real-time |

#### NPU Utilization Notes

- **Contexts** indicates NPU scheduling complexity. More Contexts = higher scheduling overhead, but supports model interleaved execution.
- **max_model_cache=3** is designed to allow up to 3 models loaded simultaneously, but this parameter is currently not implemented in code (see Section 3.3.5). Model switching overhead is approximately 10-50ms.
- **Temperature**: All tests ran at 80-89C. SCDepthV3 peaked at 89.2C (close to the 85C shutdown protection threshold).
- **`device_mode` not implemented**: The `performance.device_mode` parameter (high/normal/low) in the config is not passed to HailoRT, so all tests effectively ran in the firmware default (high-performance) mode. Changing this setting in the config will not affect NPU temperature or performance behavior.
- **Actual FPS** is typically 60-80% of NPU benchmark, affected by video decoding, pre/post-processing, and memory copy overhead.

---

## 3 Inference Scheduling Performance Parameter Analysis

> Config file: `configs/ai/ai-runtime.yaml`
> Source path: `/home/work/ne503/platform/ai-runtime/`

### 3.1 Configuration Overview

```yaml
# Inference scheduler configuration
scheduler:
  global_qps_limit: 100
  global_concurrent_limit: 8
  default_session:
    max_qps: 30
    max_concurrent: 2
    priority: 5
  strategy: fair
  queue_size: 64
  timeout_ms: 5000

# Performance configuration
performance:
  device_mode: high
  batch_enabled: false
  batch_size: 1
  batch_timeout_ms: 100
  max_model_cache: 3
  memory_limit_mb: 2048
```

### 3.2 Scheduler Parameters

#### 3.2.1 global_qps_limit: 100

- **Meaning**: Global maximum inference requests per second
- **Code consumption**: **Not implemented** -- `global_qps_limit` field exists in `Config` struct but no business code reads it
- **Current behavior**: No QPS throttling
- **Design intent**: Prevent NPU overload from many clients sending inference requests simultaneously

#### 3.2.2 global_concurrent_limit: 8

- **Meaning**: Global maximum concurrent inferences
- **Code mapping**: `cfg.scheduler_workers` -> `InferenceScheduler` `num_workers_`
- **Actual effect**: Starts **8 worker threads** simultaneously pulling requests from the queue for inference execution
- **Code path**: `main.cpp:85` -> `InferenceScheduler(model_mgr, session_mgr, 8, 64)`

```
                    +--- Worker 0 --> NPU inference --+
                    +--- Worker 1 --> NPU inference --+
Request queue -->    +--- Worker 2 --> NPU inference --+--- Callback
  (64 slots)        +--- ...                          |
                    +--- Worker 7 --> NPU inference --+
```

- **Tuning recommendation**: 8 threads suit multi-model parallel scenarios. For single-model scenarios, 3-4 threads are sufficient; extra threads idle.

#### 3.2.3 default_session.max_qps: 30

- **Meaning**: Default QPS limit per session
- **Code consumption**: **Not implemented** -- field exists but unused
- **Design intent**: Limit inference request frequency for individual clients

#### 3.2.4 default_session.max_concurrent: 2

- **Meaning**: Maximum concurrent inferences per session
- **Code consumption**: **Not implemented** -- field exists but unused
- **Design intent**: Limit concurrent inference requests from a single client

#### 3.2.5 default_session.priority: 5

- **Meaning**: Default session priority (higher value = higher priority)
- **Code consumption**: **Not implemented** -- current scheduler uses Round-Robin fair rotation, no priority sorting
- **Design intent**: Takes effect when `strategy: priority`

#### 3.2.6 strategy: fair

- **Meaning**: Scheduling strategy selection
- **Available values**: `fair` | `priority` | `fifo`
- **Code consumption**: **Not implemented** -- this field is declared in the config file, but code is **hardcoded to Round-Robin fair queue**
- **Current implementation**: `inference_scheduler.cpp:81-105`

```cpp
// Round-robin selection -- each session takes one request in turn
do {
    if (rr_index_ >= active_sessions_.size())
        rr_index_ = 0;
    const std::string& sid = active_sessions_[rr_index_];
    auto& sq = session_queues_[sid];
    if (!sq.empty()) {
        req = std::move(sq.front());
        // ...
    }
} while (!active_sessions_.empty());
```

- **Effect**: When multiple clients infer simultaneously, **fair rotation** execution prevents any single client from being starved

#### 3.2.7 queue_size: 64

- **Meaning**: Maximum capacity of the inference request queue
- **Code mapping**: `cfg.scheduler_queue_size` -> `queue_capacity_`
- **Actual effect**: Queue can accumulate up to 64 pending requests; new requests are dropped immediately when exceeded

```cpp
// inference_scheduler.cpp:46
if (total_queued_ >= queue_capacity_) {
    LOG_WARN("Inference queue full (%d), dropping request", queue_capacity_);
    return false;
}
```

- **Tuning recommendation**: 64 is sufficient for 8 worker threads. Each request typically waits no more than 10ms in queue.

#### 3.2.8 timeout_ms: 5000

- **Meaning**: Inference request timeout
- **Code consumption**: **Not implemented** -- written to `InferRequest::timeout_ms` but worker threads do not check timeout
- **Current behavior**: Requests are never cancelled due to timeout

### 3.3 Performance Parameters

#### 3.3.1 device_mode: high

- **Meaning**: NPU performance/power mode
- **Available values**: `high` | `normal` | `low`
- **Code consumption**: **Partially implemented** -- stored in `cfg.device_mode` but not passed to HAL/HailoRT
- **HailoRT corresponding API**: `hailortcli fw-control set-power-mode` can switch power mode

| Mode | Expected Behavior |
|------|-------------------|
| `high` | NPU full speed, 20 TOPS, maximum power consumption |
| `normal` | Underclocked, approximately 15 TOPS |
| `low` | Minimum power, approximately 10 TOPS or less |

- **Current actual behavior**: HailoRT firmware defaults to high-performance mode; configuration value does not affect actual behavior
- **Activation method**: Requires calling HailoRT power mode API during HAL initialization

#### 3.3.2 batch_enabled: false

- **Meaning**: Whether to enable inference batching (merge multiple requests into one inference)
- **Code consumption**: **Not implemented** -- declared in YAML but not parsed or used
- **Principle**:

```
Disabled (false):
  Request 1 --> NPU --> Result 1   (21ms)
  Request 2 --> NPU --> Result 2   (21ms)
  Total: 42ms

Enabled (true, batch_size=4):
  Request 1 |
  Request 2 +--> NPU (batch=4) --> Results 1,2,3,4  (30ms)
  Request 3 |
  Request 4 |
  Total: 30ms + wait time
```

- **Applicable scenarios**: Can improve throughput when multiple clients infer on the same model simultaneously
- **Risk**: Increases P99 latency (must wait to fill batch or timeout)

#### 3.3.3 batch_size: 1

- **Meaning**: Batch size
- **Code consumption**: **Not implemented**
- **Valid range**: 1-8 (depends on batch dimension set during model compilation)

#### 3.3.4 batch_timeout_ms: 100

- **Meaning**: Batch wait timeout -- if batch_size cannot be filled, wait at most 100ms before starting inference
- **Code consumption**: **Not implemented**
- **Tuning**: Shorter timeout means lower latency but less throughput improvement; longer timeout means higher throughput but higher latency

#### 3.3.5 max_model_cache: 3

- **Meaning**: Maximum number of models that can reside in NPU simultaneously
- **Code consumption**: **Not implemented** -- no LRU eviction mechanism; models remain in memory after registration until explicitly deregistered
- **Current behavior**: No limit; models can be registered as long as memory is sufficient
- **Actual test**: Successfully loaded 4 models simultaneously (see parallelism tests)

#### 3.3.6 memory_limit_mb: 2048

- **Meaning**: Total memory limit for all registered model weight tensors
- **Code consumption**: **Not implemented** -- memory limit is not checked when registering models
- **Current behavior**: The only memory limit is physical DDR (8 GB)

### 3.4 Parameter Activation Status Overview

| Parameter | Config Value | Code Status | Actually Active |
|-----------|-------------|-------------|-----------------|
| `global_qps_limit` | 100 | **Not consumed** | No |
| `global_concurrent_limit` | 8 | **Consumed** -> worker thread count | Yes (8 threads) |
| `default_session.max_qps` | 30 | **Not consumed** | No |
| `default_session.max_concurrent` | 2 | **Not consumed** | No |
| `default_session.priority` | 5 | **Not consumed** | No |
| `strategy` | fair | **Not consumed** (hardcoded RR) | Partial (fixed fair rotation) |
| `queue_size` | 64 | **Consumed** -> queue capacity | Yes |
| `timeout_ms` | 5000 | **Not consumed** | No |
| `device_mode` | high | **Not consumed** (not passed to HAL) | No |
| `batch_enabled` | false | **Not consumed** | No |
| `batch_size` | 1 | **Not consumed** | No |
| `batch_timeout_ms` | 100 | **Not consumed** | No |
| `max_model_cache` | 3 | **Not consumed** | No |
| `memory_limit_mb` | 2048 | **Not consumed** | No |

**Only 2 parameters are actually active**: `global_concurrent_limit` (worker thread count) and `queue_size` (queue capacity).

### 3.5 Actual Scheduling Workflow

```
Client gRPC inference request
         |
         v
   +------------------+
   |  submit()        |  <- Check queue_capacity (64)
   |  Route by        |
   |  session_id to   |
   |  respective      |
   |  session queue   |
   +--------+---------+
            |
            v notify_one()
   +------------------+
   |  8 Workers       |  <- global_concurrent_limit
   |  Round-Robin     |
   |  fair rotation   |
   +--------+---------+
            |
            v
   +------------------+
   |  ModelManager    |
   |  .infer()        |  <- Call HAL -> HailoRT -> NPU
   +--------+---------+
            |
            v
   +------------------+
   |  on_complete()   |  <- Callback returns result
   |  callback        |
   +------------------+
```

Key characteristics:

- **Session-level fair scheduling**: Requests from different clients (sessions) execute in rotation, preventing mutual starvation
- **No priority**: All session requests have equal weight
- **No timeout**: Requests are never cancelled due to waiting too long
- **No QPS throttling**: Clients can submit requests at unlimited speed, constrained only by the 64 queue capacity

### 3.6 Recommended Tuning Values

#### Scenario 1: Single Application Single Model (current model-showcase typical config)

```yaml
scheduler:
  global_concurrent_limit: 4    # Reduce threads, lower CPU overhead
  queue_size: 32                # Single client doesn't need large queue
```

#### Scenario 2: Multi-Application Multi-Model Parallel

```yaml
scheduler:
  global_concurrent_limit: 8    # Keep 8 threads to match NPU scheduling capacity
  queue_size: 64                # Keep large queue to absorb burst requests
```

#### Scenario 3: High-Throughput Batch Processing (requires batch logic implementation)

```yaml
performance:
  batch_enabled: true
  batch_size: 4
  batch_timeout_ms: 50
```

---

## 4 NPU Parallelism Benchmarks

> Test date: 2025-05-25

### 4.1 HailoRT Software Limits

Source `hailort/libhailort/include/hailo/hailort.h`:

```c
#define HAILO_MAX_NETWORK_GROUPS           (8)   // Maximum simultaneously loaded network groups
#define HAILO_MAX_STREAMS_COUNT            (40)  // Maximum data streams
#define HAILO_MAX_NETWORKS_IN_NETWORK_GROUP (8)  // Maximum sub-networks per group
```

**Key constraints**:

- A single VDevice can have at most **8 network groups** (models) active simultaneously
- Each network group can have at most **8 sub-networks**
- Total data stream limit of **40**
- NPU internally time-slices NN Core by **Context**

### 4.2 Model Context Consumption

Context is the NPU's basic scheduling unit. Each HEF model is compiled into several Contexts; all loaded models' Contexts share NN Core time slices.

| Model | Contexts | Input Size | Type | Complexity |
|-------|----------|-----------|------|------------|
| yolov8n (384x640) | 2 | NV12 192x640 | Object Detection | Small |
| face_landmarks_lite | 2 | RGB 192x192 | Keypoint Detection | Small |
| lprnet | 1 | -- | OCR Recognition | Small |
| tiny_yolov4_license_plates | 1 | -- | Object Detection | Small |
| scdepthv3 | 1 | RGB 256x320 | Depth Estimation | Small |
| linknet_mbv1_ss_dpm_256 | 1 | -- | Semantic Segmentation | Small |
| yolov5m_vehicles | 4 | -- | Object Detection | Medium |
| paddle_ocr_v5_det | 4 | -- | OCR Detection | Medium |
| paddle_ocr_v5_rec | 5 | -- | OCR Recognition | Medium |
| clip_vit_b_32 | 14 | NV12 112x224 | CLIP Encoding | Large |
| vit_large | 32 | -- | General Classification | Large |
| Qwen3-VL-2B (prefill) | 140 | -- | VLM | Extra Large |
| Qwen3-VL-2B (tbt) | 138 | -- | VLM | Extra Large |
| Qwen3-VL-2B (vision) | 92 | -- | VLM | Extra Large |

**Total Context count directly affects parallel inference latency** -- more Contexts means higher scheduling overhead per complete inference round.

> **Note**: Some models in the table above have different Context counts compared to Section 2 benchmark data (e.g., face_landmarks_lite shows 2 vs 3, yolov5m_vehicles shows 4 vs 5), because different tests may use different HEF compilation configurations. Context counts are based on their respective test environments.

### 4.3 Parallel Inference Test Results

Test environment: inside model-showcase container, using `InferenceClient` to call ai-runtime via gRPC.

#### 4.3.1 Single Model Serial Inference (Baseline)

Each model tested exclusively on NPU, one at a time.

| Model | Average Latency | P50 | P95 | Min | Max | N |
|-------|----------------|-----|-----|-----|-----|---|
| YOLOv8n | 21.6 ms | 20.3 ms | 34.5 ms | 14.3 ms | 36.3 ms | 30 |
| FaceLandmarks | 9.8 ms | 9.2 ms | 13.8 ms | 7.2 ms | 14.8 ms | 30 |
| SCDepth | 41.6 ms | 41.6 ms | 49.9 ms | 33.7 ms | 56.9 ms | 30 |

#### 4.3.2 Dual-Model Parallel

YOLOv8n + FaceLandmarks loaded simultaneously, dual-thread concurrent inference.

| Model | Serial Latency | Parallel Latency | **Latency Increase** |
|-------|---------------|-----------------|---------------------|
| YOLOv8n | 21.4 ms | 29.5 ms | **+38%** |
| FaceLandmarks | 9.5 ms | 19.4 ms | **+104%** |

| Metric | Value |
|--------|-------|
| Parallel throughput | **73.2 inf/s** |
| Equivalent serial throughput | ~31.5 inf/s (1/(21+10)ms) |
| **Parallel speedup** | **2.3x** |

#### 4.3.3 Three-Model Parallel

YOLOv8n + FaceLandmarks + SCDepth loaded simultaneously, triple-thread concurrent inference.

| Model | Serial Latency | Parallel Latency | **Latency Increase** |
|-------|---------------|-----------------|---------------------|
| YOLOv8n | 22.0 ms | 36.0 ms | **+64%** |
| FaceLandmarks | 10.5 ms | 24.7 ms | **+135%** |
| SCDepth | 40.3 ms | 59.2 ms | **+47%** |

| Metric | Value |
|--------|-------|
| Parallel throughput | **49.8 inf/s** |
| Equivalent serial throughput | ~13.7 inf/s (1/(22+10+41)ms) |
| **Parallel speedup** | **3.6x** |

#### 4.3.4 Four-Model Parallel

Loaded a 4th model (CLIP ViT-B/32) to verify feasibility of running 4 models simultaneously.

| Result | Description |
|--------|-------------|
| Registration | All 4 models registered successfully |
| Inference | All 4 models inferred successfully |
| YOLOv8n | 26.4 ms |
| FaceLandmarks | 10.8 ms |
| SCDepth | 45.9 ms |
| CLIP ViT-B | 29.6 ms |

> YAML `max_model_cache: 3` is not implemented in code; model registration count is not constrained by this. The actual limit comes from HailoRT's `HAILO_MAX_NETWORK_GROUPS=8` and physical memory.

### 4.4 Theoretical Limit Analysis

#### 4.4.1 Constraint Dimensions

| Dimension | Hard Limit | Source |
|-----------|-----------|--------|
| Network groups | **8** | `HAILO_MAX_NETWORK_GROUPS` (HailoRT header) |
| Total data streams | **40** | `HAILO_MAX_STREAMS_COUNT` (HailoRT header) |
| Physical memory | **8 GB DDR** | Shared (CPU + NPU, no dedicated VRAM) |
| NN Core compute | **20 TOPS** | Hardware specification |

> Note: YAML `memory_limit_mb: 2048` and `max_model_cache: 3` are **not implemented in code** and do not affect actual limits. Real constraints are HailoRT's 8 network group limit and 8 GB physical memory.

#### 4.4.2 Practical Capacity Estimation

Based on current model combinations on the device (constraints: HailoRT max 8 network groups, 8 GB DDR shared):

| Scenario | Model Combination | Total Contexts | Feasibility |
|----------|-------------------|---------------|-------------|
| Lightweight x 6 | yolov8n + landmarks + lprnet + plate_det + scdepth + linknet | 2+2+1+1+1+1 = 8 | Feasible |
| Lightweight x 3 + Medium x 1 | yolov8n + landmarks + scdepth + yolov5m | 2+2+1+4 = 9 | Feasible |
| Lightweight x 2 + Large x 1 | yolov8n + landmarks + clip_vit_b_32 | 2+2+14 = 18 | Feasible |
| Large x 2 | clip_vit_b_32 + vit_large | 14+32 = 46 | Near limit |
| VLM | Qwen3-VL-2B | 370 | Exclusive, not parallelizable |

> The above feasibility is a theoretical estimate. HailoRT's `VDevice::create_infer_model()` checks resources when models are actually loaded to NPU, returning an error code when exceeding hardware capability.

#### 4.4.3 Latency vs. Parallelism Trend

```
Latency (ms)
  80 +                                        +-- SCDepth
  60 +                              +---------+
  40 +               +--------------+
  30 +     +---------+  YOLOv8n
  20 +-----+
  10 +-- FaceLandmarks
   0 +------+-------+-------+-------+-------+
        1 model   2 models  3 models  4 models  8 models
       (exclusive) (parallel) (parallel) (tested) (theoretical)
```

**Patterns**:

- Small models are more affected by parallelism (latency increase 100%+), because their own inference is fast and scheduling wait proportion is higher
- Large models are less affected by parallelism (latency increase ~50%), because inference itself dominates
- Parallel throughput always exceeds serial (**3-model parallel throughput is 3.6x serial**)

### 4.5 Parallel Capability Summary

#### 4.5.1 Actually Active Constraints

| Constraint | Actual Limit | Source |
|-----------|-------------|--------|
| Simultaneously loaded models | **8** | HailoRT `HAILO_MAX_NETWORK_GROUPS` |
| Physical memory | **8 GB** | DDR shared, no dedicated VRAM |
| Worker threads | **8** | ai-runtime `global_concurrent_limit` |
| Request queue | **64** | ai-runtime `queue_size` |

#### 4.5.2 Inactive Configuration (retained in code but not implemented)

The following parameters exist in YAML but are not consumed by code; modifying them will have no effect:

- `max_model_cache` -- does not limit model registration count
- `memory_limit_mb` -- does not limit model memory usage
- `strategy` -- scheduling strategy is fixed to Round-Robin fair queue
- `device_mode` -- not passed to HailoRT
- `batch_*` -- batching not implemented
- QPS/priority/timeout -- all not implemented

#### 4.5.3 Recommended Parallel Model Count by Scenario

| Scenario | Recommended Models | Notes |
|----------|-------------------|-------|
| Smart security (detection + keypoints) | 2-3 | Current model-showcase typical configuration |
| Multi-model analysis (detection + depth + segmentation + OCR) | 4-5 | Primarily small models, controllable latency |
| Lightweight full parallel (6 small models) | 6 | Total Contexts=8, near but below HailoRT limit |
| With CLIP/ViT and other large models | 2-3 | Large model Context overhead high (14-32), squeezing scheduling space |

### 4.6 Parallel Performance Summary

| Metric | Value | Source |
|--------|-------|--------|
| NPU compute | 20 TOPS (INT8) | Hardware specification |
| HailoRT max network groups | **8** | `HAILO_MAX_NETWORK_GROUPS` hardcoded |
| Physical memory | **8 GB DDR** (CPU + NPU shared) | Hardware specification |
| Small model theoretical max parallelism | **5-6** (constrained by HailoRT 8 network groups + DDR) | Estimated |
| With large models recommended parallelism | **2-3** | Tested |
| 3-model parallel throughput | **49.8 inf/s** (3.6x serial 13.7 inf/s) | Tested |
| Best single-model latency | 9.8 ms (FaceLandmarks) | Tested |
| 3-model parallel max latency | 59.2 ms (SCDepth, still ~17 FPS) | Tested |

**Core conclusion**: The real constraints on NPU parallelism are HailoRT's 8 network group limit and 8 GB physical memory. YAML `max_model_cache` and `memory_limit_mb` are **not implemented in code** and do not affect actual behavior.

---

## 5 Video Decoding Capability Assessment

### 5.1 Current Decoding Architecture

```
Video File (MP4/AVI/MKV)
       |
       v  (no hardware decoder in container)
OpenCV VideoCapture (FFmpeg backend)
       |
       v  (CPU software decoding)
BGR numpy array (numpy.ndarray)
       |
       +---> _prepare_input_from_bgr() -> resize + NV12/RGB conversion -> NPU inference
       |
       +---> MJPEG stream -> frontend display
```

**Key constraint**: No `ffprobe`/`ffmpeg` CLI tools in container, and **no hardware decode acceleration** -- fully dependent on CPU software decoding. Hailo-15 hardware codecs (H.264/H.265 encoders) are exclusively used by camera-daemon for **encoding output**, no decoding API is provided.

### 5.2 Assessment Dimensions

| Dimension | Description | Metric |
|-----------|-------------|--------|
| Decode throughput | Decodable frames per second | FPS |
| Resolution limit | Maximum supported resolution | Max width x height |
| CPU overhead | CPU consumed by decoding | % CPU / core utilization |
| Memory overhead | Memory consumed by decoding | MB |
| Format compatibility | Supported encoding formats | H.264 / H.265 / VP9 / AV1 |
| Decode + Inference combined | Bottleneck when decoding and inference run simultaneously | Total FPS + Latency |
| Seek performance | Random seek latency | ms/operation |

### 5.3 Assessment Test Matrix

| Resolution | Frame Rate | Encoding | Bitrate | File Size |
|-----------|-----------|----------|---------|-----------|
| 640x384 | 15 | H.264 | 1 Mbps | Small |
| 640x384 | 30 | H.264 | 2 Mbps | Small |
| 1280x720 | 15 | H.264 | 2 Mbps | Medium |
| 1280x720 | 30 | H.264 | 4 Mbps | Medium |
| 1920x1080 | 15 | H.264 | 4 Mbps | Large |
| 1920x1080 | 30 | H.264 | 8 Mbps | Large |
| 1920x1080 | 30 | H.265 | 4 Mbps | Large |
| 3840x2160 | 15 | H.264 | 16 Mbps | Extra Large |
| 3840x2160 | 15 | H.265 | 8 Mbps | Extra Large |

### 5.4 Bottleneck Analysis

#### 5.4.1 CPU is the Primary Bottleneck

| Resource | Specification | Impact |
|----------|--------------|--------|
| CPU | 4x A53 @ 1.3 GHz | Software decoding will max out CPU |
| Memory | 8 GB DDR | Sufficient |
| NPU | 20 TOPS | Inference unaffected by decoding |

Software decoding 1080p@30fps H.264 on Cortex-A53 requires approximately **1.5-2 cores**. The 4-core CPU also needs to run ai-runtime, camera-daemon, and other services, so the actual compute available for decoding may be only **1.5-2 cores**.

#### 5.4.2 Estimated Performance Range

| Resolution | Estimated Decode-Only FPS | Estimated Decode + Inference FPS | Primary Bottleneck |
|-----------|--------------------------|--------------------------------|-------------------|
| 640x384 | 60-90 | 25-40 | NPU inference |
| 1280x720 | 30-50 | 20-30 | Decoding + Inference |
| 1920x1080 | 15-25 | 10-18 | CPU decoding |
| 3840x2160 | 3-8 | 3-8 | CPU severely insufficient |

#### 5.4.3 Decode and Encode Resource Contention

Current CPU usage per service:

| Service | CPU Usage | Description |
|---------|-----------|-------------|
| camera-daemon | ~10-15% | ISP + encoding 3 H.264 streams |
| ai-runtime | ~5-10% | NPU scheduling (CPU portion overhead very low) |
| platform-api | ~2-3% | REST API |
| Other services | ~3-5% | event-bus, app-manager, etc. |
| **Remaining available** | **~60-70%** (~2.5 cores) | For video decoding |

### 5.5 Assessment Output Template

#### Decode Throughput

| Resolution | Decode-Only FPS | Decode + Resize FPS | Decode + Inference FPS |
|-----------|----------------|---------------------|----------------------|
| 640x384 | _To be tested_ | _To be tested_ | _To be tested_ |
| 1280x720 | _To be tested_ | _To be tested_ | _To be tested_ |
| 1920x1080 | _To be tested_ | _To be tested_ | _To be tested_ |
| 3840x2160 | _To be tested_ | _To be tested_ | _To be tested_ |

#### Seek Performance

| Resolution | Average Seek | P50 | Max |
|-----------|-------------|-----|-----|
| 640x384 | _To be tested_ | _To be tested_ | _To be tested_ |
| 1280x720 | _To be tested_ | _To be tested_ | _To be tested_ |
| 1920x1080 | _To be tested_ | _To be tested_ | _To be tested_ |

#### Resource Usage

| Resolution | CPU | Memory Increase |
|-----------|-----|----------------|
| 640x384 | _To be tested_ | _To be tested_ |
| 1280x720 | _To be tested_ | _To be tested_ |
| 1920x1080 | _To be tested_ | _To be tested_ |

### 5.6 Optimization Directions

#### 5.6.1 Short-term (Software Optimization)

| Approach | Expected Benefit | Complexity |
|----------|-----------------|------------|
| Separate decode and inference threads | Avoid frame rate mutual drag | Low |
| Skip-frame decoding (1 of every N frames) | Reduce decode load | Low |
| Decode at lower resolution | Linearly reduce compute | Low |
| FFmpeg multi-threaded decoding (-threads 2) | Utilize multiple cores | Medium |

#### 5.6.2 Mid-term (Architecture Optimization)

| Approach | Expected Benefit | Complexity |
|----------|-----------------|------------|
| Hardware decoding via V4L2 M2M | Zero CPU decode overhead | High |
| DMA-BUF direct transfer to NPU (skip resize) | Zero-copy | High |
| Media pipeline integrated decoding | Leverage Hailo hardware | High |

#### 5.6.3 Hardware Decoding Feasibility

The Hailo-15 Vision subsystem includes hardware H.264/H.265 codecs, but the current HAL codec module only exposes the **encoder** API (`HalCodecOps`), with no decoder API. Enabling hardware decoding requires:

1. Adding a `HalDecoderOps` interface in HAL
2. Integrating Hailo media library decoding functionality
3. Mapping decoded output directly as DMA-BUF for zero-copy transfer to NPU

This is the optimal solution but requires significant engineering effort.

---

## 6 Related Documentation

- [AI Runtime Service](./service-reference/0-ai-runtime.md) -- AI inference service usage and API reference
- [Media Streaming Service](./service-reference/5-media-streaming.md) -- Media streaming service configuration and usage
- [Configuration Reference](./3-config-reference.md) -- NE503 complete YAML configuration quick reference
- [Platform Architecture](../3-platform-development/0-platform-architecture.md) -- NE503 software platform overall architecture
