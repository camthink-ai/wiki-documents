---
description: NE503 AI 模型性能基准与 NPU 并行性、推理调度参数、视频解码能力的综合评估报告，涵盖 Hailo-15H SoC 上 12 款模型的吞吐量与延迟数据、多模型并行推理实测结果、ai-runtime 调度参数激活状态分析，以及视频解码性能瓶颈评估。
keywords: [NE503基准测试, Hailo-15H, NPU性能, AI模型基准, 并行推理, 视频解码, ai-runtime, HailoRT, 吞吐量, 延迟]
tags: [基准测试, NPU性能, NE503, 平台贡献者, 系统运维]
---

# AI Model Performance Benchmarks

## 1 测试环境

| 项目 | 值 |
|------|-----|
| 设备 | NE503 (AM20-01) |
| SoC | Hailo-15H（SoC 总算力 26 TOPS，其中 NPU 20 TOPS） |
| NPU 算力 | 20 TOPS (INT8) |
| CPU | 4x Cortex-A53 @ 1.3 GHz (12k DMIPS) |
| DSP | Vector DSP，256 MACs @ 700 MHz (350 GOPs) |
| 内存 | 8 GB LPDDR4X 32-bit @ 4266 MT/s，带宽 68.3 GB/s |
| 功耗 | < 5W |
| ISP | 双 ISP，12 MP，600 Mpixel/s |
| 固件 | HailoRT 5.3.0 |
| 编译器 | HEF Compiler 5.2.0 / 5.3.0 |
| 测试工具 | `hailortcli benchmark --batch-size 1` |
| NPU 配置 | max_model_cache=3，独占模式（无并发模型） |
| ai-runtime 配置 | global_concurrent_limit=8，queue_size=64 |
| 测试日期 | 2026-05-18 |

---

## 2 AI 模型基准测试

### 2.1 目标检测模型

#### 2.1.1 YOLOv8n 检测 (hailo_yolov8n_384_640)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/detection/hailo_yolov8n_384_640.hef` |
| 大小 | 4.7 MB |
| 输入 | NV12, 384x640 |
| 输出 | YOLOv8 NMS，4 类，每类最多 100 个边界框 |
| Contexts | 2 (Multi-Context) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **444.9** |
| **延迟** | **2.25 ms** |
| 温度 | 81.2°C (均值) |

后处理配置：分数阈值 0.20，IoU 阈值 0.60，图像 384x640。

#### 2.1.2 YOLOv5m 车辆检测 (yolov5m_vehicles)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/detection/yolov5m_vehicles.hef` |
| 大小 | 18 MB |
| 输入 | F8CR, 1080x1920 (1080x1920x3) |
| 输出 | YOLOv5 NMS，1 类 (车辆)，最多 80 个边界框 |
| Contexts | 5 (Multi-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **46.6** |
| **延迟** | **21.5 ms** |
| 温度 | 80.0°C (均值) |

Full HD 输入分辨率。内置 NMS 后处理，无需外部后处理。

#### 2.1.3 Tiny YOLOv4 车牌检测 (tiny_yolov4_license_plates)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/detection/tiny_yolov4_license_plates.hef` |
| 大小 | 4.7 MB |
| 输入 | NHWC RGB, 416x416 |
| 输出 | Raw — 13x13x18 + 26x26x18（无内置 NMS） |
| Contexts | 1 (Single-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **908.4** |
| **延迟** | **1.10 ms** |
| 温度 | 86.0°C (均值) |

作为 LPR 管线第一阶段使用。无内置 NMS，需要外部后处理。

### 2.2 图像分类模型

#### 2.2.1 ViT Large (vit_large)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/classification/vit_large.hef` |
| 大小 | 268 MB |
| 输入 | NHWC RGB, 224x224 |
| 输出 | 1x1x1000 (1000 类概率) |
| Contexts | 32 (Multi-Context，最复杂的模型) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **18.9** |
| **延迟** | **52.9 ms** |
| 温度 | 83.2°C (均值) |

按文件大小区分的最大模型。32 个 Context 意味着较大的 NPU 调度开销。

### 2.3 语义分割模型

#### 2.3.1 Linknet MobileNetV1 (linknet_mbv1_ss_dpm_256)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/segmentation/linknet_mbv1_ss_dpm_256.hef` |
| 大小 | 1.9 MB |
| 输入 | NV12, 256x256 (NV12 布局下 128x256x3) |
| 输出 | 256x256x2 (2 类分割掩码) |
| Contexts | 1 (Single-Context) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **1073.2** |
| **延迟** | **0.93 ms** |
| 温度 | 84.6°C (均值) |

最小的模型，最高的吞吐量。亚毫秒级延迟。

### 2.4 关键点检测模型

#### 2.4.1 Face Landmarks Lite (face_landmarks_lite)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/keypoint/face_landmarks_lite.hef` |
| 大小 | 1.9 MB |
| 输入 | NV12, 192x96 (NV12 布局下 96x192x3) |
| 输出 | 1x1x1404 (关键点) + 1x1x1 (置信度) |
| Contexts | 3 (Multi-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **811.8** |
| **延迟** | **1.23 ms** |
| 温度 | 81.9°C (均值) |

1404 个关键点 = 468 个点 x 3 坐标 (x, y, z)。需要与人脸检测器 (yolov8n) 同时运行。

### 2.5 深度估计模型

#### 2.5.1 SCDepthV3 (scdepthv3)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/depth/scdepthv3.hef` |
| 大小 | 12 MB |
| 输入 | NHWC RGB, 256x320 |
| 输出 | 256x320x1 (深度图, UINT16) |
| Contexts | 1 (Single-Context) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **737.3** |
| **延迟** | **1.36 ms** |
| 温度 | 87.5°C (均值) |

测试中观察到的最高 NPU 温度 (峰值 89.2°C)。单目深度估计模型。

### 2.6 CLIP 零样本模型

#### 2.6.1 CLIP ViT-B/32 NV12 (clip_vit_b_32_image_encoder_nv12)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/clip/clip_vit_b_32_image_encoder_nv12.hef` |
| 大小 | 83 MB |
| 输入 | NV12, 224x112 (NV12 布局下 112x224x3) |
| 输出 | 1x1x512 (图像嵌入向量) |
| Contexts | 14 (Multi-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **72.7** |
| **延迟** | **13.8 ms** |
| 温度 | 83.4°C (均值) |

NV12 输入变体，支持从摄像头管线零拷贝传输。

#### 2.6.2 CLIP ViT-B/16 (clip_vit_b_16_image_encoder)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/zeroshot/clip_vit_b_16_image_encoder.hef` |
| 大小 | 76 MB |
| 输入 | NHWC RGB, 224x224 |
| 输出 | 1x1x512 (图像嵌入向量) |
| Contexts | 14 (Multi-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **57.6** |
| **延迟** | **17.4 ms** |
| 温度 | 83.3°C (均值) |

ViT-B/16 的 patch 粒度更细 (16x16)，相比 ViT-B/32 (32x32) 略慢但精度更高。

### 2.7 OCR 模型

#### 2.7.1 LPRNet (lprnet)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/ocr/lprnet.hef` |
| 大小 | 4.4 MB |
| 输入 | NHWC RGB, 75x300 |
| 输出 | 1x19x11 (19 个字符 x 11 个类别) |
| Contexts | 1 (Single-Context) |
| HEF 编译器 | 5.2.0 |
| **NPU FPS** | **201.5** |
| **延迟** | **4.96 ms** |
| 温度 | 83.5°C (均值) |

车牌字符识别。11 个类别 = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ-"。

#### 2.7.2 PaddleOCR v5 Mobile 检测 (paddle_ocr_v5_mobile_detection)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/ocr/paddle_ocr_v5_mobile_detection.hef` |
| 大小 | 5.0 MB |
| 输入 | NHWC RGB, 544x960 |
| 输出 | 544x960x1 (文本区域热力图) |
| Contexts | 4 (Multi-Context) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **22.5** |
| **延迟** | **44.4 ms** |
| 温度 | 82.6°C (均值) |

输入分辨率最大 (960x544)，最重的 OCR 模型。作为 OCR 管线第一阶段使用。

#### 2.7.3 PaddleOCR v5 Mobile 识别 (paddle_ocr_v5_mobile_recognition_nv12)

| 项目 | 值 |
|------|-----|
| 文件 | `/opt/aipc/models/ocr/paddle_ocr_v5_mobile_recognition_nv12.hef` |
| 大小 | 4.9 MB |
| 输入 | NV12, 48x320 (NV12 布局下 24x320x3) |
| 输出 | FCR 1x40x18385 (40 个字符 x 18385 个类别) |
| Contexts | 5 (Multi-Context) |
| HEF 编译器 | 5.3.0 |
| **NPU FPS** | **127.4** |
| **延迟** | **7.85 ms** |
| 温度 | 81.2°C (均值) |

NV12 输入变体。18385 个类别覆盖完整 CJK + Latin 字符集。

### 2.8 管线性能

#### 2.8.1 LPR 车牌识别管线

```
摄像头帧 → tiny_yolov4 (检测车牌 ROI) → LPRNet (识别字符) → 结果
```

| 阶段 | 模型 | NPU FPS | 延迟 |
|------|------|---------|------|
| 1. 检测 | tiny_yolov4_license_plates | 908 | 1.10 ms |
| 2. 识别 | lprnet | 201 | 4.96 ms |
| **管线总计** | 串行 + ROI 裁剪 | **约 30 FPS** (估算) | **约 6 ms + 开销** |

瓶颈：ROI 提取以及多车牌同时被检测时的逐车牌识别。

#### 2.8.2 OCR 文字识别管线

```
摄像头帧 → paddle_det (检测文本区域) → paddle_rec (识别文字) → 结果
```

| 阶段 | 模型 | NPU FPS | 延迟 |
|------|------|---------|------|
| 1. 检测 | paddle_ocr_v5_mobile_detection | 22.5 | 44.4 ms |
| 2. 识别 | paddle_ocr_v5_mobile_recognition | 127 | 7.85 ms |
| **管线总计** | 串行 + ROI 裁剪 | **约 18 FPS** (估算) | **约 52 ms + 开销** |

瓶颈：第一阶段检测 (44.4 ms)。第二阶段按文本区域逐个运行。

### 2.9 性能总览

#### 吞吐量排名 (NPU FPS，降序)

| 排名 | 模型 | 类型 | 输入 | FPS | 延迟 | 大小 |
|------|------|------|------|-----|------|------|
| 1 | linknet_mbv1_ss_dpm_256 | 语义分割 | 256x256 | **1073** | 0.93 ms | 1.9M |
| 2 | tiny_yolov4_license_plates | 目标检测 | 416x416 | **908** | 1.10 ms | 4.7M |
| 3 | face_landmarks_lite | 关键点检测 | 192x96 | **812** | 1.23 ms | 1.9M |
| 4 | scdepthv3 | 深度估计 | 256x320 | **737** | 1.36 ms | 12M |
| 5 | hailo_yolov8n_384_640 | 目标检测 | 384x640 | **445** | 2.25 ms | 4.7M |
| 6 | lprnet | OCR 识别 | 75x300 | **202** | 4.96 ms | 4.4M |
| 7 | paddle_recognition | OCR 识别 | 48x320 | **127** | 7.85 ms | 4.9M |
| 8 | clip_vit_b_32 | CLIP | 224x112 | **73** | 13.8 ms | 83M |
| 9 | clip_vit_b_16 | CLIP | 224x224 | **58** | 17.4 ms | 76M |
| 10 | yolov5m_vehicles | 目标检测 | 1080x1920 | **47** | 21.5 ms | 18M |
| 11 | paddle_detection | OCR 检测 | 544x960 | **22** | 44.4 ms | 5.0M |
| 12 | vit_large | 图像分类 | 224x224 | **19** | 52.9 ms | 268M |

#### 性能分级

| 级别 | FPS 范围 | 模型 | 适用场景 |
|------|---------|------|---------|
| 超高吞吐 | >500 FPS | linknet, tiny_yolov4, face_landmarks, scdepthv3, yolov8n | 实时多流、低延迟 |
| 中等吞吐 | 20-200 FPS | yolov5m, lprnet, paddle_rec, clip_b_32, clip_b_16 | 单流实时 |
| 重负载 | `<25` FPS | paddle_det, vit_large | 批处理、非实时 |

#### NPU 利用率说明

- **Contexts** 表示 NPU 调度复杂度。更多 Context = 更高的调度开销，但支持模型交错执行。
- **max_model_cache=3** 设计上允许最多 3 个模型同时加载，但该参数当前未在代码中实现（见第 3.3.5 节）。模型切换开销约 10-50ms。
- **温度**：所有测试在 80-89°C 下运行。SCDepthV3 峰值 89.2°C（接近 85°C 停机保护阈值）。

> 注：config-reference 中 `temperature_limit_c` 配置为 85°C（AI Runtime 级别）。上表中的温度超过 85°C 是因为 `device_mode` 参数（含温度保护功能）当前未在代码中实现。
- **实际 FPS** 通常为 NPU 基准的 60-80%，受视频解码、前后处理和内存拷贝开销影响。

---

## 3 推理调度性能参数分析

> 配置文件：`configs/ai/ai-runtime.yaml`
> 源码路径：`/home/work/ne503/platform/ai-runtime/`

### 3.1 配置总览

```yaml
# 推理调度器配置
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

# 性能配置
performance:
  device_mode: high
  batch_enabled: false
  batch_size: 1
  batch_timeout_ms: 100
  max_model_cache: 3
  memory_limit_mb: 2048
```

### 3.2 scheduler 调度参数

#### 3.2.1 global_qps_limit: 100

- **含义**：全局每秒最大推理请求数
- **代码消费情况**：**未实现** — `Config` 结构体中有 `global_qps_limit` 字段，但无业务代码读取
- **当前行为**：无 QPS 限流
- **设计用途**：防止大量客户端同时发送推理请求导致 NPU 过载

#### 3.2.2 global_concurrent_limit: 8

- **含义**：全局最大并发推理数
- **代码映射**：`cfg.scheduler_workers` -> `InferenceScheduler` 的 `num_workers_`
- **实际效果**：启动 **8 个工作线程**同时从队列拉取请求执行推理
- **代码路径**：`main.cpp:85` -> `InferenceScheduler(model_mgr, session_mgr, 8, 64)`

```
                    +--- Worker 0 --> NPU 推理 --+
                    +--- Worker 1 --> NPU 推理 --+
请求队列 -->         +--- Worker 2 --> NPU 推理 --+--- 回调
  (64 槽位)         +--- ...                      |
                    +--- Worker 7 --> NPU 推理 --+
```

- **调优建议**：8 线程适合多模型并行场景。单模型场景下 3-4 线程足够，多余线程会空闲等待。

#### 3.2.3 default_session.max_qps: 30

- **含义**：每个会话的默认 QPS 限制
- **代码消费情况**：**未实现** — 字段存在但未使用
- **设计用途**：限制单个客户端的推理请求频率

#### 3.2.4 default_session.max_concurrent: 2

- **含义**：每个会话的最大并发推理数
- **代码消费情况**：**未实现** — 字段存在但未使用
- **设计用途**：限制单个客户端同时发起的推理请求数

#### 3.2.5 default_session.priority: 5

- **含义**：默认会话优先级（数值越高优先级越高）
- **代码消费情况**：**未实现** — 当前调度器使用 Round-Robin 公平轮转，无优先级排序
- **设计用途**：当 `strategy: priority` 时生效

#### 3.2.6 strategy: fair

- **含义**：调度策略选择
- **可选值**：`fair` | `priority` | `fifo`
- **代码消费情况**：**未实现** — 配置文件中声明了此字段，但代码中**硬编码为 Round-Robin 公平队列**
- **当前实现**：`inference_scheduler.cpp:81-105`

```cpp
// 轮转选择 — 每个会话轮流取一个请求
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

- **效果**：多客户端同时推理时，按**公平轮转**执行，防止任一客户端被饿死

#### 3.2.7 queue_size: 64

- **含义**：推理请求队列最大容量
- **代码映射**：`cfg.scheduler_queue_size` -> `queue_capacity_`
- **实际效果**：队列最多累积 64 个待处理请求，超出后新请求立即丢弃

```cpp
// inference_scheduler.cpp:46
if (total_queued_ >= queue_capacity_) {
    LOG_WARN("Inference queue full (%d), dropping request", queue_capacity_);
    return false;
}
```

- **调优建议**：64 对 8 个工作线程已足够。每个请求通常在队列中等待不超过 10ms。

#### 3.2.8 timeout_ms: 5000

- **含义**：推理请求超时时间
- **代码消费情况**：**未实现** — 写入 `InferRequest::timeout_ms` 但工作线程不检查超时
- **当前行为**：请求永远不会因超时被取消

### 3.3 performance 性能参数

#### 3.3.1 device_mode: high

- **含义**：NPU 性能/功耗模式
- **可选值**：`high` | `normal` | `low`
- **代码消费情况**：**部分实现** — 存入 `cfg.device_mode` 但未传递给 HAL/HailoRT
- **HailoRT 对应 API**：`hailortcli fw-control set-power-mode` 可切换功耗模式

| 模式 | 预期行为 |
|------|---------|
| `high` | NPU 全速运行，20 TOPS，最高功耗 |
| `normal` | 降频运行，约 15 TOPS |
| `low` | 最低功耗，约 10 TOPS 或以下 |

- **当前实际行为**：HailoRT 固件默认为高性能模式；配置值不影响实际行为
- **激活方式**：需在 HAL 初始化时调用 HailoRT 功耗模式 API

#### 3.3.2 batch_enabled: false

- **含义**：是否启用推理批处理（将多个请求合并为一次推理）
- **代码消费情况**：**未实现** — 在 YAML 中声明但未被解析或使用
- **原理**：

```
禁用 (false):
  请求 1 --> NPU --> 结果 1   (21ms)
  请求 2 --> NPU --> 结果 2   (21ms)
  总计: 42ms

启用 (true, batch_size=4):
  请求 1 |
  请求 2 +--> NPU (batch=4) --> 结果 1,2,3,4  (30ms)
  请求 3 |
  请求 4 |
  总计: 30ms + 等待时间
```

- **适用场景**：多个客户端同时对同一模型推理时可提升吞吐量
- **风险**：增加 P99 延迟（必须等待填满批次或超时）

#### 3.3.3 batch_size: 1

- **含义**：批处理大小
- **代码消费情况**：**未实现**
- **有效范围**：1-8（取决于模型编译时设置的 batch 维度）

#### 3.3.4 batch_timeout_ms: 100

- **含义**：批次等待超时 — 若 batch_size 无法填满，最多等待 100ms 后开始推理
- **代码消费情况**：**未实现**
- **调优**：更短的超时意味着更低延迟但吞吐提升更少；更长的超时意味着更高吞吐但延迟更大

#### 3.3.5 max_model_cache: 3

- **含义**：NPU 中可同时驻留的最大模型数
- **代码消费情况**：**未实现** — 无 LRU 淘汰机制；模型注册后一直保留在内存中直到显式注销
- **当前行为**：无限制；只要内存充足即可注册模型
- **实测**：成功同时加载 4 个模型（见并行性测试）

#### 3.3.6 memory_limit_mb: 2048

- **含义**：所有已注册模型权重张量的总内存限制
- **代码消费情况**：**未实现** — 注册模型时不检查内存限制
- **当前行为**：唯一的内存限制是物理 DDR (8 GB)

### 3.4 参数激活状态总览

| 参数 | 配置值 | 代码状态 | 实际生效 |
|------|--------|---------|---------|
| `global_qps_limit` | 100 | **未消费** | 否 |
| `global_concurrent_limit` | 8 | **已消费** -> 工作线程数 | 是 (8 线程) |
| `default_session.max_qps` | 30 | **未消费** | 否 |
| `default_session.max_concurrent` | 2 | **未消费** | 否 |
| `default_session.priority` | 5 | **未消费** | 否 |
| `strategy` | fair | **未消费** (硬编码 RR) | 部分 (固定公平轮转) |
| `queue_size` | 64 | **已消费** -> 队列容量 | 是 |
| `timeout_ms` | 5000 | **未消费** | 否 |
| `device_mode` | high | **未消费** (未调用 HAL) | 否 |
| `batch_enabled` | false | **未消费** | 否 |
| `batch_size` | 1 | **未消费** | 否 |
| `batch_timeout_ms` | 100 | **未消费** | 否 |
| `max_model_cache` | 3 | **未消费** | 否 |
| `memory_limit_mb` | 2048 | **未消费** | 否 |

**实际生效的参数仅 2 个**：`global_concurrent_limit`（工作线程数）和 `queue_size`（队列容量）。

### 3.5 实际调度工作流

```
客户端 gRPC 推理请求
         |
         v
   +------------------+
   |  submit()        |  <- 检查 queue_capacity (64)
   |  按 session_id   |
   |  路由到各自的     |
   |  会话队列        |
   +--------+---------+
            |
            v notify_one()
   +------------------+
   |  8 个 Worker     |  <- global_concurrent_limit
   |  Round-Robin     |
   |  公平轮转        |
   +--------+---------+
            |
            v
   +------------------+
   |  ModelManager    |
   |  .infer()        |  <- 调用 HAL -> HailoRT -> NPU
   +--------+---------+
            |
            v
   +------------------+
   |  on_complete()   |  <- 回调返回结果
   |  回调            |
   +------------------+
```

关键特性：

- **会话级公平调度**：不同客户端（会话）的请求轮流执行，防止互相饿死
- **无优先级**：所有会话请求权重相同
- **无超时**：请求永远不会因等待过久被取消
- **无 QPS 限流**：客户端可以无限制速度提交请求，仅受 64 队列容量约束

### 3.6 推荐调优值

#### 场景一：单应用单模型（当前 model-showcase 典型配置）

```yaml
scheduler:
  global_concurrent_limit: 4    # 减少线程，降低 CPU 开销
  queue_size: 32                # 单客户端不需要大队列
```

#### 场景二：多应用多模型并行

```yaml
scheduler:
  global_concurrent_limit: 8    # 保持 8 线程以匹配 NPU 调度能力
  queue_size: 64                # 保持大队列以吸收突发请求
```

#### 场景三：高吞吐批处理（需实现 batch 逻辑）

```yaml
performance:
  batch_enabled: true
  batch_size: 4
  batch_timeout_ms: 50
```

---

## 4 NPU 并行性基准测试

> 测试日期：2025-05-25（注：与第 2 节基准测试日期 2026-05-18 不同，两次测试间隔约 1 年，测试环境可能有变化）

### 4.1 HailoRT 软件限制

来源 `hailort/libhailort/include/hailo/hailort.h`：

```c
#define HAILO_MAX_NETWORK_GROUPS           (8)   // 最大同时加载的网络组数
#define HAILO_MAX_STREAMS_COUNT            (40)  // 最大数据流数
#define HAILO_MAX_NETWORKS_IN_NETWORK_GROUP (8)  // 每组最大子网络数
```

**关键约束**：

- 单个 VDevice 最多同时激活 **8 个网络组**（模型）
- 每个网络组最多 **8 个子网络**
- 数据流总量上限 **40**
- NPU 内部以 **Context** 为单位对 NN Core 进行时间分片

### 4.2 模型 Context 消耗

Context 是 NPU 的基本调度单位。每个 HEF 模型编译为若干 Context；所有已加载模型的 Context 共享 NN Core 时间片。

| 模型 | Contexts | 输入尺寸 | 类型 | 复杂度 |
|------|----------|---------|------|--------|
| yolov8n (384x640) | 2 | NV12 192x640 | 目标检测 | 小 |
| face_landmarks_lite | 2 | RGB 192x192 | 关键点检测 | 小 |
| lprnet | 1 | -- | OCR 识别 | 小 |
| tiny_yolov4_license_plates | 1 | -- | 目标检测 | 小 |
| scdepthv3 | 1 | RGB 256x320 | 深度估计 | 小 |
| linknet_mbv1_ss_dpm_256 | 1 | -- | 语义分割 | 小 |
| yolov5m_vehicles | 4 | -- | 目标检测 | 中 |
| paddle_ocr_v5_det | 4 | -- | OCR 检测 | 中 |
| paddle_ocr_v5_rec | 5 | -- | OCR 识别 | 中 |
| clip_vit_b_32 | 14 | NV12 112x224 | CLIP 编码 | 大 |
| vit_large | 32 | -- | 通用分类 | 大 |
| Qwen3-VL-2B (prefill) | 140 | -- | VLM | 极大 |
| Qwen3-VL-2B (tbt) | 138 | -- | VLM | 极大 |
| Qwen3-VL-2B (vision) | 92 | -- | VLM | 极大 |

**Context 总数直接影响并行推理延迟** — Context 越多，每次完整推理轮次的调度开销越高。

> **注意**：上表中部分模型的 Context 数与第 2 节基准测试数据不同（如 face_landmarks_lite 为 2 vs 3，yolov5m_vehicles 为 4 vs 5），这是因为不同测试使用的 HEF 编译配置可能不同。Context 数以各自测试环境为准。

### 4.3 并行推理测试结果

测试环境：model-showcase 容器内，使用 `InferenceClient` 通过 gRPC 调用 ai-runtime。

#### 4.3.1 单模型串行推理（基线）

每个模型独占 NPU，逐一测试。

| 模型 | 平均延迟 | P50 | P95 | 最小值 | 最大值 | N |
|------|---------|-----|-----|-------|-------|---|
| YOLOv8n | 21.6 ms | 20.3 ms | 34.5 ms | 14.3 ms | 36.3 ms | 30 |
| FaceLandmarks | 9.8 ms | 9.2 ms | 13.8 ms | 7.2 ms | 14.8 ms | 30 |
| SCDepth | 41.6 ms | 41.6 ms | 49.9 ms | 33.7 ms | 56.9 ms | 30 |

#### 4.3.2 双模型并行

YOLOv8n + FaceLandmarks 同时加载，双线程并发推理。

| 模型 | 串行延迟 | 并行延迟 | **延迟增幅** |
|------|---------|---------|-------------|
| YOLOv8n | 21.4 ms | 29.5 ms | **+38%** |
| FaceLandmarks | 9.5 ms | 19.4 ms | **+104%** |

| 指标 | 值 |
|------|-----|
| 并行吞吐量 | **73.2 inf/s** |
| 等效串行吞吐量 | 约 31.5 inf/s (1/(21+10)ms) |
| **并行加速比** | **2.3x** |

#### 4.3.3 三模型并行

YOLOv8n + FaceLandmarks + SCDepth 同时加载，三线程并发推理。

| 模型 | 串行延迟 | 并行延迟 | **延迟增幅** |
|------|---------|---------|-------------|
| YOLOv8n | 22.0 ms | 36.0 ms | **+64%** |
| FaceLandmarks | 10.5 ms | 24.7 ms | **+135%** |
| SCDepth | 40.3 ms | 59.2 ms | **+47%** |

| 指标 | 值 |
|------|-----|
| 并行吞吐量 | **49.8 inf/s** |
| 等效串行吞吐量 | 约 13.7 inf/s (1/(22+10+41)ms) |
| **并行加速比** | **3.6x** |

#### 4.3.4 四模型并行

加载第 4 个模型 (CLIP ViT-B/32) 以验证 4 个模型同时运行的可行性。

| 结果 | 说明 |
|------|------|
| 注册 | 4 个模型全部注册成功 |
| 推理 | 4 个模型全部推理成功 |
| YOLOv8n | 26.4 ms |
| FaceLandmarks | 10.8 ms |
| SCDepth | 45.9 ms |
| CLIP ViT-B | 29.6 ms |

> YAML `max_model_cache: 3` 未在代码中实现；模型注册数量不受此约束。实际限制来自 HailoRT 的 `HAILO_MAX_NETWORK_GROUPS=8` 和物理内存。

### 4.4 理论极限分析

#### 4.4.1 约束维度

| 维度 | 硬限制 | 来源 |
|------|--------|------|
| 网络组数 | **8** | `HAILO_MAX_NETWORK_GROUPS` (HailoRT 头文件) |
| 数据流总量 | **40** | `HAILO_MAX_STREAMS_COUNT` (HailoRT 头文件) |
| 物理内存 | **8 GB DDR** | 共享（CPU + NPU 无独立显存） |
| NN Core 算力 | **20 TOPS** | 硬件规格 |

> 注意：YAML `memory_limit_mb: 2048` 和 `max_model_cache: 3` **未在代码中实现**，不影响实际限制。真实约束为 HailoRT 的 8 网络组上限和 8 GB 物理内存。

#### 4.4.2 实际容量估算

基于当前设备上的模型组合（约束：HailoRT 最大 8 网络组，8 GB DDR 共享）：

| 场景 | 模型组合 | Context 总计 | 可行性 |
|------|---------|-------------|--------|
| 轻量 x 6 | yolov8n + landmarks + lprnet + plate_det + scdepth + linknet | 2+2+1+1+1+1 = 8 | 可行 |
| 轻量 x 3 + 中等 x 1 | yolov8n + landmarks + scdepth + yolov5m | 2+2+1+4 = 9 | 可行 |
| 轻量 x 2 + 大型 x 1 | yolov8n + landmarks + clip_vit_b_32 | 2+2+14 = 18 | 可行 |
| 大型 x 2 | clip_vit_b_32 + vit_large | 14+32 = 46 | 接近极限 |
| VLM | Qwen3-VL-2B | 370 | 需独占，不可并行 |

> 以上可行性为理论估算。HailoRT 的 `VDevice::create_infer_model()` 在模型实际加载到 NPU 时会检查资源，超出硬件能力时返回错误码。

#### 4.4.3 延迟与并行度趋势

```
延迟 (ms)
  80 +                                        +-- SCDepth
  60 +                              +---------+
  40 +               +--------------+
  30 +     +---------+  YOLOv8n
  20 +-----+
  10 +-- FaceLandmarks
   0 +------+-------+-------+-------+-------+
        1 模型   2 模型   3 模型   4 模型   8 模型
       (独占)   (并行)   (并行)   (实测)   (理论)
```

**规律**：

- 小模型受并行影响更大（延迟增幅 100%+），因为自身推理快，调度等待占比更高
- 大模型受并行影响较小（延迟增幅约 50%），因为推理本身占比更高
- 并行吞吐始终优于串行（**3 模型并行吞吐为串行的 3.6 倍**）

### 4.5 并行能力总结

#### 4.5.1 实际生效的约束

| 约束 | 实际限制 | 来源 |
|------|---------|------|
| 同时加载模型数 | **8** | HailoRT `HAILO_MAX_NETWORK_GROUPS` |
| 物理内存 | **8 GB** | DDR 共享，无独立显存 |
| 工作线程 | **8** | ai-runtime `global_concurrent_limit` |
| 请求队列 | **64** | ai-runtime `queue_size` |

#### 4.5.2 未生效的配置（代码中保留但未实现）

以下参数存在于 YAML 中但未被代码消费，修改不会产生效果：

- `max_model_cache` — 不限制模型注册数量
- `memory_limit_mb` — 不限制模型内存使用
- `strategy` — 调度策略固定为 Round-Robin 公平队列
- `device_mode` — 未传递给 HailoRT
- `batch_*` — 批处理未实现
- QPS/优先级/超时 — 均未实现

#### 4.5.3 按场景推荐并行模型数

| 场景 | 推荐模型数 | 说明 |
|------|-----------|------|
| 智能安防（检测 + 关键点） | 2-3 | 当前 model-showcase 典型配置 |
| 多模型分析（检测 + 深度 + 分割 + OCR） | 4-5 | 以小模型为主，延迟可控 |
| 轻量全并行（6 个小模型） | 6 | Context 总计=8，接近但未达 HailoRT 上限 |
| 含 CLIP/ViT 等大型模型 | 2-3 | 大模型 Context 开销高 (14-32)，挤压调度空间 |

### 4.6 并行性能汇总

| 指标 | 值 | 来源 |
|------|-----|------|
| NPU 算力 | 20 TOPS (INT8) | 硬件规格 |
| HailoRT 最大网络组数 | **8** | `HAILO_MAX_NETWORK_GROUPS` 硬编码 |
| 物理内存 | **8 GB DDR** (CPU + NPU 共享) | 硬件规格 |
| 小模型理论最大并行数 | **5-6** (受 HailoRT 8 网络组 + DDR 约束) | 估算 |
| 含大型模型推荐并行数 | **2-3** | 实测 |
| 3 模型并行吞吐量 | **49.8 inf/s** (串行 13.7 inf/s 的 3.6 倍) | 实测 |
| 最佳单模型延迟 | 9.8 ms (FaceLandmarks) | 实测 |
| 3 模型并行最大延迟 | 59.2 ms (SCDepth，仍约 17 FPS) | 实测 |

**核心结论**：NPU 并行性的真实约束是 HailoRT 的 8 网络组上限和 8 GB 物理内存。YAML 中的 `max_model_cache` 和 `memory_limit_mb` **未在代码中实现**，不影响实际行为。

---

## 5 视频解码能力评估

### 5.1 当前解码架构

```
视频文件 (MP4/AVI/MKV)
       |
       v  (容器内无硬件解码器)
OpenCV VideoCapture (FFmpeg 后端)
       |
       v  (CPU 软件解码)
BGR numpy 数组 (numpy.ndarray)
       |
       +---> _prepare_input_from_bgr() -> 缩放 + NV12/RGB 转换 -> NPU 推理
       |
       +---> MJPEG 流 -> 前端显示
```

**关键约束**：容器内无 `ffprobe`/`ffmpeg` CLI 工具，且**无硬件解码加速** — 完全依赖 CPU 软件解码。Hailo-15 硬件编解码器（H.264/H.265 编码器）被 camera-daemon 独占用于**编码输出**，未提供解码 API。

### 5.2 评估维度

| 维度 | 说明 | 度量指标 |
|------|------|---------|
| 解码吞吐量 | 每秒可解码帧数 | FPS |
| 分辨率上限 | 最大支持分辨率 | 最大宽 x 高 |
| CPU 开销 | 解码消耗的 CPU | % CPU / 核利用率 |
| 内存开销 | 解码消耗的内存 | MB |
| 格式兼容性 | 支持的编码格式 | H.264 / H.265 / VP9 / AV1 |
| 解码+推理联合 | 解码和推理同时运行的瓶颈 | 总 FPS + 延迟 |
| Seek 性能 | 随机跳转延迟 | ms/次 |

### 5.3 评估测试矩阵

| 分辨率 | 帧率 | 编码 | 码率 | 文件大小 |
|--------|-----|------|------|---------|
| 640x384 | 15 | H.264 | 1 Mbps | 小 |
| 640x384 | 30 | H.264 | 2 Mbps | 小 |
| 1280x720 | 15 | H.264 | 2 Mbps | 中 |
| 1280x720 | 30 | H.264 | 4 Mbps | 中 |
| 1920x1080 | 15 | H.264 | 4 Mbps | 大 |
| 1920x1080 | 30 | H.264 | 8 Mbps | 大 |
| 1920x1080 | 30 | H.265 | 4 Mbps | 大 |
| 3840x2160 | 15 | H.264 | 16 Mbps | 极大 |
| 3840x2160 | 15 | H.265 | 8 Mbps | 极大 |

### 5.4 瓶颈分析

#### 5.4.1 CPU 是主要瓶颈

| 资源 | 规格 | 影响 |
|------|------|------|
| CPU | 4x A53 @ 1.3 GHz | 软件解码会占满 CPU |
| 内存 | 8 GB DDR | 充足 |
| NPU | 20 TOPS | 推理不受解码影响 |

在 Cortex-A53 上以 H.264 软件解码 1080p@30fps 约需 **1.5-2 个核心**。4 核 CPU 还需运行 ai-runtime、camera-daemon 等服务，实际可用于解码的算力可能仅有 **1.5-2 个核心**。

#### 5.4.2 预估性能范围

| 分辨率 | 预估纯解码 FPS | 预估解码+推理 FPS | 主要瓶颈 |
|--------|--------------|-----------------|---------|
| 640x384 | 60-90 | 25-40 | NPU 推理 |
| 1280x720 | 30-50 | 20-30 | 解码 + 推理 |
| 1920x1080 | 15-25 | 10-18 | CPU 解码 |
| 3840x2160 | 3-8 | 3-8 | CPU 严重不足 |

#### 5.4.3 解码与编码资源竞争

当前各服务的 CPU 占用：

| 服务 | CPU 占用 | 说明 |
|------|---------|------|
| camera-daemon | 约 10-15% | ISP + 编码 3 路 H.264 流 |
| ai-runtime | 约 5-10% | NPU 调度（CPU 部分开销很低） |
| platform-api | 约 2-3% | REST API |
| 其他服务 | 约 3-5% | event-bus、app-manager 等 |
| **剩余可用** | **约 60-70%** (约 2.5 核) | 用于视频解码 |

### 5.5 评估输出模板

#### 解码吞吐量

| 分辨率 | 纯解码 FPS | 解码+缩放 FPS | 解码+推理 FPS |
|--------|-----------|-------------|-------------|
| 640x384 | _待测_ | _待测_ | _待测_ |
| 1280x720 | _待测_ | _待测_ | _待测_ |
| 1920x1080 | _待测_ | _待测_ | _待测_ |
| 3840x2160 | _待测_ | _待测_ | _待测_ |

#### Seek 性能

| 分辨率 | 平均 Seek | P50 | 最大值 |
|--------|----------|-----|-------|
| 640x384 | _待测_ | _待测_ | _待测_ |
| 1280x720 | _待测_ | _待测_ | _待测_ |
| 1920x1080 | _待测_ | _待测_ | _待测_ |

#### 资源占用

| 分辨率 | CPU | 内存增量 |
|--------|-----|---------|
| 640x384 | _待测_ | _待测_ |
| 1280x720 | _待测_ | _待测_ |
| 1920x1080 | _待测_ | _待测_ |

### 5.6 优化方向

#### 5.6.1 短期（软件优化）

| 方案 | 预期收益 | 复杂度 |
|------|---------|--------|
| 解码线程与推理线程分离 | 避免帧率互相拖累 | 低 |
| 跳帧解码（每 N 帧取 1 帧） | 降低解码负载 | 低 |
| 以更低分辨率解码 | 线性减少计算量 | 低 |
| FFmpeg 多线程解码 (-threads 2) | 利用多核 | 中 |

#### 5.6.2 中期（架构优化）

| 方案 | 预期收益 | 复杂度 |
|------|---------|--------|
| 通过 V4L2 M2M 硬件解码 | 零 CPU 解码开销 | 高 |
| DMA-BUF 直传 NPU（跳过缩放） | 零拷贝 | 高 |
| 媒体管线集成解码 | 利用 Hailo 硬件 | 高 |

#### 5.6.3 硬件解码可行性

Hailo-15 Vision 子系统包含硬件 H.264/H.265 编解码器，但当前 HAL codec 模块仅暴露了**编码器** API (`HalCodecOps`)，无解码器 API。启用硬件解码需要：

1. 在 HAL 中添加 `HalDecoderOps` 接口
2. 集成 Hailo 媒体库的解码功能
3. 将解码输出直接映射为 DMA-BUF，零拷贝传递给 NPU

这是最优方案但需要较大的工程投入。

---

## 6 相关文档

- [AI Runtime 服务](./service-reference/0-ai-runtime.md) — AI 推理服务的使用说明与 API 参考
- [Media Streaming 服务](./service-reference/5-media-streaming.md) — 媒体流服务的配置与使用
- [配置参考](./3-config-reference.md) — NE503 全部 YAML 配置文件速查
- [平台架构](../3-platform-development/0-platform-architecture.md) — NE503 软件平台整体架构说明
