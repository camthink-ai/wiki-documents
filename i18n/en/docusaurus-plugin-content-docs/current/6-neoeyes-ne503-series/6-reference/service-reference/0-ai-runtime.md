---
description: NE503 AI Runtime service complete reference, covering NPU inference scheduling, model lifecycle management, inference pipeline architecture, DMA-BUF zero-copy, GenAI support, and configuration guide.
keywords: [NE503 AI Runtime, NPU inference, model management, Hailo-15, DMA-BUF zero-copy, inference scheduling, GenAI]
tags: [service reference, NE503, AI Runtime, NPU, platform contributors]
---

# AI Runtime Service

## 1 Overview

AI Runtime is the unified inference service on the NE503 platform, responsible for NPU compute scheduling, model lifecycle management, and inference execution. It supports traditional CV model inference as well as GenAI (LLM/VLM) streaming generation, serving as the core hub of the entire AI inference pipeline.

Technology stack: **C++17 + gRPC**, dynamically loading hardware acceleration libraries through HAL (Hardware Abstraction Layer) to achieve transparent invocation of the Hailo-15H NPU.

Core capabilities:

- **Model lifecycle management** — Supports multi-application model sharing, reference counting, and RAII automatic release
- **Fair scheduling** — Round-Robin algorithm ensures fair NPU resource usage across multiple sessions
- **Zero-copy data path** — DMA-BUF file descriptor passing, zero memory copies from camera to NPU
- **GenAI streaming generation** — Supports LLM/VLM text generation and image understanding

## 2 Architecture

```mermaid
flowchart TD
    subgraph "Application Layer"
        A[Client Application] -->|gRPC| B[AI Runtime]
        C[Model Showcase] -->|gRPC| B
    end

    subgraph "AI Runtime Core"
        B -->|Manage| C1[ModelManager]
        B -->|Quota Management| C2[SessionManager]
        B -->|Schedule| C3[InferenceScheduler]
        B -->|Zero Copy| C4[FdReceiver]
        B -->|Auto Inference| C5[AutoInfer]
    end

    subgraph "HAL Abstraction Layer"
        C1 -->|Load/Unload| H1[HalInferenceOps]
        C1 -->|Postprocess| H2[HalPostprocessOps]
        C1 -->|Draw| H3[HalDrawOps]
        C1 -->|CLIP Encode| H4[HalClipTextEncoderOps]
        C1 -->|GenAI| H5[HalGenaiOps]
    end

    subgraph "Hardware Layer"
        H1 -->|DMA-BUF| NPU[Hailo-15H NPU]
        H2 -->|NMS/Decode| NPU
        H3 -->|Video Draw| NPU
        H4 -->|Text Encode| NPU
        H5 -->|LLM/VLM| NPU
    end

    subgraph "External Services"
        C4 -->|SCM_RIGHTS| D1[camera-daemon]
        C5 -->|Subscribe| D1
        B -->|Publish| D2[Event Bus]
        C1 -->|Dynamic Load| D3[libaipc_hal.so]
    end

    B -->|Event Publish| D2
```

The architecture is divided into four layers: the application layer connects through gRPC/Unix Socket; the AI Runtime core layer contains five major components that coordinate the entire inference workflow; the HAL abstraction layer hides hardware differences through dynamic loading of `libaipc_hal.so` for pluggable hardware acceleration; the hardware layer interacts directly with the Hailo-15H NPU.

## 3 Core Components

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| **ModelManager** | Model loading/unloading, lifecycle management | Reference counting, co-ownership, atomic snapshots |
| **SessionManager** | Session quota management (QPS/concurrency/FPS) | Independent queues, sliding window statistics |
| **InferenceScheduler** | Inference task scheduling | Round-Robin fair scheduling, worker thread pool |
| **FdReceiver** | DMA-BUF zero-copy frame reception | Connection reuse, reference counting, multicast distribution |
| **AutoInfer** | Automatic inference pipeline | Frame subscription → inference → postprocess → event publish |

The HAL layer provides five sets of operation interfaces:

| HAL Interface | Function | Key Methods |
|---------------|----------|-------------|
| `HalInferenceOps` | Core inference | `create`, `run`, `destroy` |
| `HalPostprocessOps` | Post-processing (NMS, decoding, etc.) | `create`, `run`, `apply_config_json` |
| `HalDrawOps` | Visualization drawing | `overlay_detection`, etc. |
| `HalClipTextEncoderOps` | CLIP text encoding | `create`, `encode`, `destroy` |
| `HalGenaiOps` | GenAI LLM/VLM | `create`, `generate_stream`, `abort_generation` |

## 4 Inference Pipeline

```mermaid
flowchart TD
    A[Client gRPC Request] --> B[SessionManager Quota Check]
    B -->|Pass| C[ModelManager Get Model Snapshot]
    B -->|Limit Exceeded| D[Return Error]

    C --> E[InferenceScheduler Task Queue]
    E --> F[Round-Robin Select Active Session]
    F --> G[N Worker Thread Pool]

    G --> H[HAL Inference Session]
    H -->|Zero Copy| I[DMA-BUF Input Tensor]
    H -->|Direct Execute| J[NPU Hardware Inference]
    J --> K[Raw Output Tensor]
    K --> L[Optional Post-Processing]

    L -->|Detection/Classification/Segmentation| M[Post-Processing Results]
    L -->|No Post-Processing| N[Raw Tensor]

    M --> O[HAL Memory Management]
    N --> O

    O --> P[Callback Return Results]
    P --> Q[Event Bus Publish]
    Q --> R[camera-daemon Draw]
    P --> S[Client Response]

    style H fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#f9f,stroke:#333,stroke-width:2px
```

Key inference pipeline flow:

1. **Quota validation** — SessionManager checks QPS, concurrency, and FPS limits
2. **Model snapshot** — Acquires ModelSnapshot through atomic reference, ensuring thread safety
3. **Scheduled execution** — Round-Robin algorithm fairly selects tasks from the active session queue
4. **Zero-copy input** — DMA-BUF file descriptors passed directly to NPU, no memory copying
5. **Post-processing (optional)** — Detection, classification, segmentation, etc. automatically execute corresponding post-processing
6. **Result distribution** — Simultaneously publishes via Event Bus to camera-daemon for video overlay drawing

## 5 Auto Inference Pipeline

The AutoInfer component implements a fully automated pipeline from camera frames to inference result publishing:

```mermaid
flowchart TD
    A[Camera Frame Input] --> B[FdReceiver Subscribe]
    B --> C[DMA-BUF Mapping]
    C --> D[Input Preprocessing]

    subgraph "Preprocessing Branch"
        D -->|CLIP Model| E[NV12→RGB Resize]
        D -->|Other Models| F[NV12 Scale/Copy]
    end

    E --> G[Build HalTensor]
    F --> G

    G --> H[Submit Task to Scheduler]
    H --> I[MAX_IN_FLIGHT=3 Check]

    I -->|Not Full| J[Enqueue]
    I -->|Full| K[Drop and Release]

    J --> L[Inference Execution]
    L --> M[Post-Processing]
    M --> N[Publish Event Bus]
    N --> O[camera-daemon Draw]

    subgraph "Post-Processing Types"
        M -->|Detection| P[Non-Maximum Suppression NMS]
        M -->|Classification| Q[Top-K Selection]
        M -->|Segmentation| R[Mask RLE Encoding]
        M -->|CLIP| S[Embedding Vector Extraction]
    end

    style N fill:#f9f,stroke:#333,stroke-width:2px
```

**AutoInfer Features**:
- **MAX_IN_FLIGHT=3** — Prevents camera buffer pool exhaustion
- **Adaptive Preprocessing** — Automatically converts input format based on model type
- **Flow Control** — FPS throttling and frame drop protection

**Event Bus Inference Result Topic**: Inference results are automatically published to topics in the format `inference/{model_id}/{stream_id}`. Developers can subscribe to this topic to receive real-time inference results.

## 6 Model Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unregistered: Model not loaded

    Unregistered --> Registering: register_model()
    Registering --> Ready: HAL load success
    Registering --> Unregistered: Load failed

    Ready --> Active: acquire_model_snapshot()
    Ready --> Unregistering: unregister_model()
    Active --> Ready: release_model()
    Active --> Ready: release_model() ref_count=0

    Unregistering --> Unregistered: HAL session destroy success
    Unregistering --> Ready: Still has references/owners

    Active --> Registered: Add co-owner
    Ready --> Registered: Add co-owner

    state "Co-ownership" as CO {
        [*] --> Owner: Add owner_id
        Owner --> Owner: Add new owner
        Owner --> Unowner: Remove owner
        Unowner --> [*]: All owners cleared
    }

    Registered --> Owner: register_model(owner_id)
    Owner --> Registered: Owner count > 1
    Owner --> Ready: Last owner leaves
```

**Key model management features**:

- **Reference Counting** — `ref_count` tracks active model usage; model can only be unloaded when it reaches zero
- **Co-ownership** — Multiple applications can share the same model, with independent unloading per owner
- **Atomic Snapshots** — `ModelSnapshot` ensures safe model resource access across multiple threads
- **RAII Protection** — `ModelGuard` automatically releases model references when scope ends, preventing resource leaks

## 7 gRPC API

Service name: `InferenceService`, listen address `unix:///run/aipc/ai-runtime.sock`.

### Model Management

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `RegisterModel` | `ModelRegisterRequest` | `ModelRegisterResponse` | Register model to NPU |
| `UnregisterModel` | `ModelInfo` | `Status` | Unload model |
| `ListModels` | `Empty` | `ModelListResponse` | List registered models |
| `GetModelInfo` | `ModelInfo` | `ModelInfo` | Get model details |

### Inference

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `Infer` | `InferRequest` | `InferResponse` | Single inference |
| `StreamInfer` | `StreamInferRequest` | `stream StreamInferResponse` | Streaming inference (real-time video) |

### Session Management

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `CreateSession` | `SessionConfig` | `SessionCreateResponse` | Create quota session |
| `DestroySession` | `SessionConfig` | `Status` | Destroy session |

### Statistics & Configuration

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `GetStats` | `Empty` | `SystemStats` | Get system statistics |
| `UpdatePostprocessConfig` | `UpdatePostprocessConfigRequest` | `UpdatePostprocessConfigResponse` | Update post-processing config |
| `EncodeText` | `EncodeTextRequest` | `EncodeTextResponse` | CLIP text encoding |

### GenAI (LLM/VLM)

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `GenaiCreateSession` | `GenaiCreateSessionRequest` | `GenaiCreateSessionResponse` | Create GenAI session |
| `GenaiDestroySession` | `GenaiCreateSessionRequest` | `Status` | Destroy session (reuses GenaiCreateSessionRequest as only session_id is needed) |
| `GenaiGenerate` | `GenaiGenerateRequest` | `stream GenaiGenerateResponse` | Streaming generation |
| `GenaiAbort` | `GenaiAbortRequest` | `Status` | Abort generation |

### Key Message Structures

**Tensor data**:

```protobuf
message Tensor {
  repeated int32 shape = 1;
  DataType dtype = 2;     // UINT8/INT8/FLOAT16/FLOAT32, etc.
  bytes data = 3;
  int32 dma_fd = 4;       // DMA-BUF zero-copy file descriptor
}
```

**Structured post-processing results**:

```protobuf
message PostResult {
  repeated Detection detections = 1;          // Object detection
  repeated Classification classifications = 2; // Classification
  repeated LandmarkSet landmarks = 3;         // Keypoints
  repeated SegmentationMask masks = 4;        // Segmentation
  repeated OcrLine ocr_lines = 5;             // OCR
  repeated Embedding embeddings = 6;          // Embedding vectors
  repeated DepthMap depth_maps = 7;           // Depth estimation
}
```

**Model registration request**:

```protobuf
message ModelRegisterRequest {
  string model_path = 1;     // protobuf field number 1
  string model_id = 2;       // protobuf field number 2
  repeated TensorSpec inputs = 3;   // protobuf field number 3
  repeated TensorSpec outputs = 4;  // protobuf field number 4
  string model_type = 13;      // detection, landmarks, segmentation, classification
  string model_variant = 14;   // yolov8n, yolov8s, etc.
  string owner_id = 12;
}
```

## 8 DMA-BUF Zero-Copy

```mermaid
sequenceDiagram
    participant C as camera-daemon
    participant F as FdReceiver
    participant S as Subscriber 1
    participant S2 as Subscriber 2
    participant S3 as Subscriber 3

    Note over C,S3: Phase 1: Subscription Setup

    S->>F: subscribe(cam1, sub1, callback)
    F->>C: Connect /run/aipc/camera.sock
    F->>C: Send SUBSCRIBE
    C-->>F: OK + SCMs (DMA-BUF FDs)
    F->>F: Start recv_thread
    Note over F: Physical connection established

    S2->>F: subscribe(cam1, sub2, callback)
    F-->>S2: Reuse connection
    Note over F: Add to subscriber list

    S3->>F: subscribe(cam1, sub3, callback)
    F-->>S3: Reuse connection
    Note over F: subscribers = [sub1, sub2, sub3]

    Note over C,S3: Phase 2: Frame Reception & Distribution

    loop Per Frame
        C->>F: fd_pub_sendmsg(FRAME + 3 FDs)
        F->>F: recv_loop processing
        F->>F: ref_count = 3 (multiple subscribers)

        par Parallel Distribution
            F->>S: callback(frame1)
            F->>S2: callback(frame1)
            F->>S3: callback(frame1)
        end

        Note over S,S3: Each subscriber gets the same frame_fd_group
    end

    Note over C,S3: Phase 3: Release Mechanism

    S->>F: release_frame(cam1, fid=123)
    F->>F: ref_count-- = 2
    F->>F: Do not send RELEASE

    S2->>F: release_frame(cam1, fid=123)
    F->>F: ref_count-- = 1
    F->>F: Do not send RELEASE

    S3->>F: release_frame(cam1, fid=123)
    F->>F: ref_count-- = 0
    F->>C: fd_pub_sendmsg(RELEASE)

    Note over C,S3: Release back to camera-daemon buffer pool
```

**FdReceiver key features**:

- **Connection reuse** — Multiple subscribers to the same camera-daemon stream share a physical connection
- **Reference counting** — Prevents DMA-BUF from being released prematurely; buffer is only returned to the pool after all subscribers release
- **Multicast distribution** — All subscribers receive the same frame data
- **RAII management** — `FdGroup` automatically closes file descriptors, preventing FD leaks

## 9 Post-Processing Types

| Post-Processing Type | HAL Enum | Model Type | Default Parameters |
|---------------------|----------|------------|-------------------|
| Object Detection | `HAL_POST_TYPE_DETECTION` | detection, yolo | Confidence 0.25, NMS 0.45 |
| Keypoints | `HAL_POST_TYPE_KEYPOINT` | landmarks, keypoint | Confidence 0.25 |
| Segmentation | `HAL_POST_TYPE_SEGMENTATION` | segmentation | Confidence 0.25 |
| Classification | `HAL_POST_TYPE_CLASSIFICATION` | classification | Confidence 0.25, Top-K 5 |
| CLIP | `HAL_POST_TYPE_CLIP` | clip, embedding | Default config |
| OCR Detection | `HAL_POST_TYPE_OCR_DETECTION` | ocr_detection | Confidence 0.25, NMS 0.45 |
| OCR Recognition | `HAL_POST_TYPE_OCR_RECOGNITION` | ocr_recognition | Default config |
| Depth Map | `HAL_POST_TYPE_DEPTH` | depth, monocular_depth | Default config |

## 10 GenAI Support

AI Runtime supports streaming generation for LLMs (Large Language Models) and VLMs (Vision Language Models). When creating a GenAI session, the system forcefully unloads all loaded CV models to free NPU resources, and waits for HAL to complete cleanup (approximately 6 seconds) before loading the GenAI model.

**Streaming generation flow**:

1. Client creates a session via `GenaiCreateSession`
2. Sends a `GenaiGenerate` request with prompt and generation parameters (Temperature, Top-P, etc.)
3. HAL generates tokens one by one through callback mechanism, each token is immediately returned to the client via gRPC Server Stream
4. Sends a completion signal when the end-of-sequence token is encountered

Supported capabilities: text generation, image understanding, multi-turn dialogue, LoRA fine-tuning.

## 11 Configuration

Configuration file: `configs/ai/ai-runtime.yaml`

| Config Section | Key Parameters | Description |
|---------------|----------------|-------------|
| **service** | `listen` | gRPC listen address, default `unix:///run/aipc/ai-runtime.sock` |
| **hal** | `library_path`, `device_path` | HAL dynamic library path, NPU device path (`/dev/hailo0`) |
| **models** | `repository_path`, `cache_path`, `preload` | Model repository path, cache path, preloaded model list |
| **scheduler** | `global_qps_limit`, `strategy`, `timeout_ms` | Global QPS limit, scheduling strategy (priority/fifo/fair), timeout |
| **performance** | `device_mode`, `batch_enabled`, `max_model_cache` | Device mode (high/normal/low), batch inference, max model cache count |
| **monitoring** | `enabled`, `stats_interval_sec`, `temperature_limit_c` | Monitoring switch, stats interval, thermal protection threshold (85°C shutdown protection, 80°C throttle) |
| **event_bus** | `enabled`, `endpoint`, `auto_publish_results` | Event Bus switch, connection address, auto-publish inference results |
| **auto_infer** | `enabled`, `pipelines` | Auto inference switch, pipeline config (model_id, stream_id, fps) |

**Scheduling strategy descriptions**:

- **fair** (default) — Round-Robin fair rotation, ensuring each session gets balanced inference opportunities
- **priority** — Schedules by session priority, higher priority sessions execute first
- **fifo** — First-in-first-out, executes in submission order

**Session quota configuration example**:

```yaml
scheduler:
  default_session:
    max_qps: 30          # Default max QPS
    max_concurrent: 2    # Default max concurrent inferences
    priority: 5          # Default priority (1-10)
```

## 12 Monitoring Statistics

### System Statistics Metrics

| Metric | Description |
|--------|-------------|
| **NPU Utilization** | Hardware accelerator usage rate |
| **CPU Utilization** | System CPU usage rate |
| **DSP Utilization** | Digital signal processor load |
| **Memory Usage** | Total and used memory |
| **Inference Latency** | Queue wait + inference execution time |
| **FPS Statistics** | Per-session actual inference frame rate |

## 13 Troubleshooting

| Issue | Possible Cause | Troubleshooting Method |
|-------|---------------|----------------------|
| Model registration failed | Incorrect model path, insufficient NPU device permissions | Check model file path, `/dev/hailo0` permissions |
| Inference timeout | Queue backlog, concurrency limit too low | Check `global_qps_limit` and `max_concurrent` config |
| Zero-copy failure | camera-daemon connection abnormal | Check `/run/aipc/camera.sock` connection status |
| Insufficient memory | Too many model caches, concurrency too high | Lower `max_model_cache` and concurrency limits |
| Device overheating | NPU load too high, insufficient cooling | Check `temperature_limit_c` config, reduce inference load |

Common debug commands:

```bash
# View service logs
journalctl -u ai-runtime

# View Hailo device status
hailortcli scan

# Performance analysis
perf stat
```

## 14 Related Documentation

- [Platform Architecture](../../3-platform-development/0-platform-architecture.md) — NE503 software platform overall architecture
- [App Development Guide](../../4-application-development/1-app-reference.md) — AI application development workflow
- [SDK Reference](../../4-application-development/2-sdk-reference.md) — Python/CLI SDK usage guide
- [CLI Tool Guide](../../5-system-integration/3-cli-guide.md) — Command-line tool `aipc-cli` usage
- [RESTful API](../../5-system-integration/1-restful-api.md) — RESTful API interface reference
