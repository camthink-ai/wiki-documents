---
description: NE503 软件平台架构概览：说明应用容器、平台服务、HAL 与硬件四层关系，以及一帧图像从采集到推理结果的主要路径；实现细节和接口定义链接到 NeoRuntime 源码仓库。
keywords: [NE503 架构, AIPC 平台, 平台服务, HAL, 数据流, 应用容器, AI 推理, NeoRuntime]
tags: [平台架构, NE503, 边缘 AI, 开发者文档, 系统设计]
---

# System Architecture

NE503 软件平台由四层组成：**应用容器 → 平台服务 → HAL → 硬件**。本文聚焦层级关系和三条数据流；API、配置、Socket 与启动依赖见文末源码。

## 1. 四层平台架构

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

| 层级 | 职责 | 上层关系 |
|:---|:---|:---|
| 应用容器 | 运行业务应用和推理管线 | 通过 SDK 或平台接口调用设备能力，不直接访问硬件 |
| 平台服务 · 数据面 | `camera-daemon` 输出原始帧和编码流；`ai-runtime` 调度 NPU 推理 | 编排视频和推理数据流 |
| 平台服务 · 管理面 | `platform-api`、`app-manager`、`event-bus`、`device-control`、`device-discovery` | 处理控制、生命周期和事件，不直接传输视频帧 |
| HAL v2 | 提供视频、推理、编解码、外设和缓冲区接口 | 屏蔽 SoC 与厂商运行时差异 |
| 硬件与运行时 | 执行采集、编码、推理和 MCU 外设控制 | 由平台 HAL 实现驱动 |

## 2. 端到端数据流

平台数据流分为视频、AI 推理和外设控制三条路径。

### 视频与媒体路径

```mermaid
flowchart LR
    SENSOR[Sensor / ISP] --> CAM["camera-daemon"]
    CAM --> SHM["原始帧 SHM / DMA-BUF\n→ ai-runtime"]
    CAM --> ENC["编码流 H.264 / H.265\n→ RTSP / 远程访问"]
    CAM --> HBUF[hal_buffer.h\n统一帧缓冲]

    classDef src fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef svc fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef out fill:#fff3e0,stroke:#ef6c00,color:#000
    classDef hal fill:#fce4ec,stroke:#880e4f,color:#000

    class SENSOR src
    class CAM svc
    class SHM,ENC out
    class HBUF hal
```

- `camera-daemon` 通过 HAL 管理成像管线，向 `ai-runtime` 输出 DMA-BUF 原始帧，并输出 RTSP 编码流。

### AI 推理与事件路径

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

- `ai-runtime` 经 HAL 调度 NPU 完成推理和后处理；启用事件发布后，将结果发布到 `event-bus`，由业务/模型容器订阅，Web Console 经 `platform-api` 获取。

### 外设控制路径

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

- 请求经 `platform-api` → `device-control` → `HAL.IO/MCU` 控制灯光、PTZ、GPIO 和镜头，状态沿回传链路返回。

## 3. 源码参考

- [架构与数据流](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/README.md) —— 分层、组件和数据流
- [HAL v2](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/hal_v2_overview.md) —— 接口和平台实现
- [平台服务](https://github.com/camthink-ai/neoruntime/tree/main/docs/services) —— 服务说明
- [服务配置](https://github.com/camthink-ai/neoruntime/tree/main/configs) —— 配置模板
- [平台源码与 proto](https://github.com/camthink-ai/neoruntime/tree/main/platform) —— 实现、gRPC 和消息定义
- [NE503 SDK](https://github.com/camthink-ai/neoruntime-sdks) —— Python / C++ SDK 和共享 proto
- [NE503 应用](https://github.com/camthink-ai/neoruntime-apps) —— 应用模板和示例

**相关页面**：

- [开发者指南](./1-developer-guide.md) —— 开发环境、构建和部署入口
