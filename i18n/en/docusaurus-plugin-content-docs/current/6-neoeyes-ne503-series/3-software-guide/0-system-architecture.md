---
description: "NE503 software platform architecture overview: the relationship between application containers, platform services, HAL, and hardware, plus the main path from image capture to inference results. Implementation details and interface definitions link to the NeoRuntime source repository."
keywords: [NE503 architecture, AIPC platform, platform services, HAL, data flow, application containers, AI inference, NeoRuntime]
tags: [Platform Architecture, NE503, Edge AI, Developer Documentation, System Design]
---

# System Architecture

The NE503 software platform has four layers: **application containers → platform services → HAL → hardware**. This page covers their relationships and three data flows. See the source links for APIs, configuration, sockets, and startup dependencies.

## 1. Four-Layer Platform Architecture

```mermaid
flowchart TB
APP["Application Layer<br/>Containers & AI Pipelines"]

subgraph PLATFORM["Platform Services Layer"]
direction LR

DP["Data Plane<br/>camera-daemon<br/>ai-runtime"]

CP["Control Plane<br/>API · Lifecycle<br/>Events · Device"]

end

HAL["HAL v2<br/>Unified Hardware Interfaces<br/>Video · AI · Codec · IO"]

HW["Hardware Layer<br/>Sensor · NPU · MCU"]


APP -->|SDK / gRPC| CP

APP -->|Media API| DP

CP -->|Control| DP

DP -->|DMA-BUF<br/>Inference Buffer| HAL

HAL --> HW


classDef app fill:#e3f2fd,stroke:#1565c0,color:#000
classDef platform fill:#e8f5e9,stroke:#2e7d32,color:#000
classDef hal fill:#fce4ec,stroke:#ad1457,color:#000
classDef hw fill:#efebe9,stroke:#4e342e,color:#000


class APP app
class DP,CP platform
class HAL hal
class HW hw
```

| Layer | Responsibility | Relationship |
|:---|:---|:---|
| Application Containers | Run business applications and inference pipelines | Call device capabilities through SDKs or platform interfaces; no direct hardware access |
| Platform Services · Data Plane | `camera-daemon` outputs raw frames and encoded streams; `ai-runtime` schedules NPU inference | Orchestrate video and inference flows |
| Platform Services · Control Plane | `platform-api`, `app-manager`, `event-bus`, `device-control`, and `device-discovery` | Handle control, lifecycle, and events; do not move video frames directly |
| HAL v2 | Provide interfaces for video, inference, codecs, peripherals, and buffers | Abstract SoC and vendor-runtime differences |
| Hardware & Runtimes | Execute capture, encoding, inference, and MCU peripheral control | Driven by the platform HAL implementation |

## 2. End-to-End Data Flow

Platform data flows are divided into video, AI inference, and peripheral control paths.

### Video and Media Path

```mermaid
flowchart LR
    SENSOR[Sensor / ISP] --> CAM["camera-daemon"]
    CAM --> SHM["Raw Frames SHM / DMA-BUF\n→ ai-runtime"]
    CAM --> ENC["Encoded H.264 / H.265\n→ RTSP / Remote Access"]
    CAM --> HBUF[hal_buffer.h\nUnified Frame Buffer]

    classDef src fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef svc fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef out fill:#fff3e0,stroke:#ef6c00,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000

    class SENSOR src
    class CAM svc
    class SHM,ENC out
    class HBUF hal
```

- `camera-daemon` manages the imaging pipeline through HAL, outputs DMA-BUF raw frames to `ai-runtime`, and provides encoded RTSP streams.

### AI Inference and Event Path

```mermaid
flowchart TB
    FRAME["Raw Frames<br/>SHM / DMA-BUF<br/>camera-daemon"]
    AIRT["ai-runtime<br/>Model · Session · Scheduler"]
    HAL["HAL Inference API<br/>hal_inference.h"]
    NPU[NPU]
    POST["Post-processing"]
    RES["Inference Results"]
    EB["event-bus"]

    subgraph SUBS["Result Subscribers"]
        direction LR
        BIZ["Business Service<br/>Container"]
        MODEL["Model Service<br/>Container"]
        WEB["Web Console<br/>via platform-api"]
    end

    FRAME -->|DMA-BUF / SHM| AIRT
    AIRT --> HAL
    HAL --> NPU
    NPU --> POST
    POST --> RES
    RES -->|When event publishing is enabled| EB
    EB -->|Pub/Sub| BIZ
    EB -->|Pub/Sub| MODEL
    EB -->|HTTP API| WEB

    classDef src fill:#e1f5fe,stroke:#01579b,color:#000
    classDef svc fill:#e8f5e9,stroke:#1b5e20,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000
    classDef hw fill:#efebe9,stroke:#3e2723,color:#000
    classDef out fill:#fff3e0,stroke:#e65100,color:#000
    classDef bus fill:#f3e5f5,stroke:#4a148c,color:#000

    class FRAME src
    class AIRT svc
    class HAL hal
    class NPU hw
    class POST,RES out
    class EB bus
    class BIZ,MODEL,WEB src
```

- `ai-runtime` schedules NPU inference and post-processing through HAL. When event publishing is enabled, it publishes results to `event-bus`; business/model containers subscribe, and the Web Console accesses them through `platform-api`.

### Peripheral Control Path

```mermaid
flowchart TB
    APP["Application / Web / SDK"]
    API["platform-api"]
    DC["device-control<br/>gRPC"]
    HIO["HAL.IO<br/>hal_io.h"]
    MCU["MCU<br/>UART"]
    PERI["Light · PTZ · GPIO · Lens"]
    FB["Status Feedback"]

    APP -->|HTTP / gRPC| API
    API -->|gRPC| DC
    DC --> HIO
    HIO -->|MCU protocol| MCU
    MCU --> PERI
    PERI --> FB
    FB -->|Status / Events| DC

    classDef app fill:#e1f5fe,stroke:#01579b,color:#000
    classDef svc fill:#fff3e0,stroke:#e65100,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000
    classDef hw fill:#efebe9,stroke:#3e2723,color:#000
    classDef peri fill:#fff3e0,stroke:#ef6c00,color:#000
    classDef feedback fill:#f3e5f5,stroke:#4a148c,color:#000

    class APP app
    class API,DC svc
    class HIO hal
    class MCU hw
    class PERI peri
    class FB feedback
```

- Requests flow through `platform-api` → `device-control` → `HAL.IO/MCU` to control lights, PTZ, GPIO, and lenses; status returns through the same path.

## 3. Source References

- [Architecture and data flows](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/README.md) — layers, components, and data flows
- [HAL v2](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/hal_v2_overview.md) — interfaces and platform implementations
- [Platform services](https://github.com/camthink-ai/neoruntime/tree/main/docs/services) — service documentation
- [Service configurations](https://github.com/camthink-ai/neoruntime/tree/main/configs) — configuration templates
- [Platform source and protos](https://github.com/camthink-ai/neoruntime/tree/main/platform) — implementations, gRPC, and message definitions
- [NE503 SDK](https://github.com/camthink-ai/neoruntime-sdks) — Python / C++ SDKs and shared protos
- [NE503 applications](https://github.com/camthink-ai/neoruntime-apps) — application templates and examples

**Related page**:

- [Developer Guide](./1-developer-guide.md) — development environment, build, and deployment entry points
