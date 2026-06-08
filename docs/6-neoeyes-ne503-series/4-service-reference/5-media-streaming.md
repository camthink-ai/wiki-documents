---
description: NE503 媒体流管线完整参考，涵盖 Camera Daemon 视频采集与帧分发、DMA-BUF 零拷贝与 SHM 双通道、硬件编码、RTSP/H.264 流服务和 WebSocket 实时传输。
keywords: [NE503 媒体流, Camera Daemon, DMA-BUF零拷贝, RTSP, H.264, 视频编码, SHM共享内存]
tags: [服务参考, NE503, 媒体流, 视频管线, 平台贡献者]
---

# Media Streaming Service

NE503 实现了从摄像头硬件采集到 Web 前端播放的完整低延迟视频管线，支持 RTSP 协议输出，并通过 Platform API 的 WebSocket 端点提供实时视频流推送。系统采用 DMA-BUF 零拷贝、引用计数帧分发、Unix Domain Socket 通信等技术，端到端延迟 < 100ms。

- **协议** — RTSP 1.0 + RTP/AVP/TCP 交织传输；H.264/H.265 FU-A 分片
- **零拷贝** — DMA-BUF FD 直通 + 引用计数，AI 推理路径无内存拷贝
- **双通道** — FD Passthrough（零拷贝）与 SHM Ring Buffer（单次 memcpy）共存，按 App 权限自动选择
- **多客户端** — 同一流可同时服务 RTSP、WebSocket、AI 推理等多个消费者
- **热更新** — 动态调整编码参数（码率、帧率、GOP），无需重启编码器

## 数据流架构

```mermaid
sequenceDiagram
    participant Camera as 摄像头硬件
    participant HAL as HAL.Video
    participant Encoder as HAL.Codec
    participant Publisher as EncodedPublisher
    participant RTSP as RTSP 服务器
    participant API as Platform-API
    participant Player as 播放器

    Camera->>HAL: 采集 YUV
    HAL->>Encoder: YUV -> H.264/H.265
    Encoder->>Publisher: on_packet()（零拷贝）
    Publisher->>Publisher: 双线程分发
    Publisher->>RTSP: UDS (.sock)
    RTSP->>RTSP: SDP 生成
    RTSP->>Player: RTSP over TCP（8554）
    Publisher->>API: WebSocket
    API->>Player: H.264 over WebSocket
    Player->>Player: 解码渲染
    Note over Publisher: V1/V2 协议自动检测
    Note over API: Annex-B 转 AVCC
```

## Camera Daemon

Camera Daemon 是 NE503 平台的核心 C++ 服务，负责视频采集、帧分发、编码与多通道帧发布，直接操作 HAL 硬件抽象层。

### 整体架构

```mermaid
graph TB
    subgraph Hardware["硬件"]
        ISP[ISP / Sensor]
    end

    subgraph HAL["HAL .so（dlopen）"]
        HAL_VIDEO[hal_video]
        HAL_CODEC[hal_codec]
        HAL_OSD[hal_osd]
    end

    subgraph Daemon["camera-daemon"]
        HL[HalLoader<br/>dlopen/dlsym]
        VS[VideoSource<br/>Push 模式回调]
        FR[FrameRouter<br/>引用计数分发<br/>retain / release]
        WD[FrameWatchdog<br/>200ms 超时守护]

        OSD[OsdManager<br/>就地绘制]
        ENC[EncoderManager<br/>HAL Codec]
        SHM[ShmPublisher<br/>memcpy -> Ring Buffer]
        FDP[FdPublisher<br/>SCM_RIGHTS 零拷贝]
    end

    subgraph Consumers["消费者"]
        RTSP[RTSP / HLS<br/>编码数据包]
        APP_SHM[普通 App<br/>SHM mmap PROT_READ]
        APP_FD[可信 App<br/>recv_id + mmap]
        AI_RT[ai-runtime<br/>SCM_RIGHTS 直通]
    end

    ISP --> HAL_VIDEO
    HL -->|dlopen| HAL_VIDEO
    HL -->|dlopen| HAL_CODEC
    HL -->|dlopen| HAL_OSD
    HAL_VIDEO -->|HalRawFrame*| VS
    VS -->|帧回调| FR
    WD -.->|force_reclaim| FR

    FR -->|ref++| OSD
    OSD -->|就地绘制| ENC
    ENC -->|release| FR
    ENC --> RTSP

    FR -->|ref++| SHM
    SHM -->|release| FR
    SHM -->|SHM 文件| APP_SHM

    FR -->|retain 每客户端| FDP
    FDP -->|release| FR
    FDP -->|SCM_RIGHTS UDS| APP_FD

    FR -->|SCM_RIGHTS| AI_RT
```

### 双通道帧分发

App 容器通过两种方式获取视频帧，Daemon 根据 App 权限自动选择。

#### FD Passthrough（零拷贝）— FdPublisher

适用可信 App（manifest 声明 `dma_buf: true`）。通过 `SCM_RIGHTS` 直接传递 DMA-BUF fd，App 使用 `mmap` 访问像素数据，全程零拷贝。每客户端最多同时持有 3 帧（背压保护），Watchdog 200ms 超时强制回收防止 HAL 缓冲区泄漏。

**通信协议（`fd_protocol.h`）：**

| 方向 | 消息 | 说明 |
|------|------|------|
| Client -> Server | `SUBSCRIBE(stream_name)` | 订阅视频流 |
| Server -> Client | `FRAME` + SCM_RIGHTS | 帧元数据 + DMA-BUF fd |
| Client -> Server | `RELEASE(frame_id)` | 归还帧 |
| Client -> Server | `UNSUBSCRIBE` | 取消订阅 |

#### SHM Ring Buffer（单次 memcpy）— ShmPublisher

适用所有 App（无需特殊容器权限）。帧数据 memcpy 到共享内存 Ring Buffer，App 通过 `mmap PROT_READ` 只读访问。内部缓存 DMA-BUF mmap 结果，避免每帧 mmap/munmap 系统调用。性能：640x640 NV12 约 0.1ms，4K 约 2ms。

#### 两种方式对比

| | FD Passthrough | SHM |
|---|---|---|
| 拷贝次数 | 0 | 1 次 memcpy |
| 640x640 延迟 | 约 0.03ms | 约 0.1ms |
| 4K 延迟 | 约 0.03ms | 约 2ms |
| 容器权限 | seccomp: ioctl, SCM_RIGHTS | 无特殊权限 |
| App 崩溃风险 | HAL 缓冲区泄漏（Watchdog 保护） | 无影响 |
| Python 接口 | recv_fd + mmap + np.frombuffer | mmap + np.frombuffer |
| 推荐场景 | AI 推理、高帧率处理 | 通用分析、图像保存 |

### 帧生命周期

#### 引用计数流程

```mermaid
stateDiagram-v2
    [*] --> Created: HAL 回调
    Created --> Distributed: ref_count = N 个订阅者

    Distributed --> Retained: FdPublisher retain() +1
    Retained --> Distributed: 一个客户端 RELEASE -> release() -1

    Distributed --> Released: release() -> ref_count=0
    Released --> HAL_Pool: release_frame()
    HAL_Pool --> [*]

    Distributed --> ForceReclaimed: Watchdog 超时 200ms
    ForceReclaimed --> Released: 后续 release() 调用
    note right of ForceReclaimed: reclaimed=true<br/>HAL 已释放<br/>跳过 HAL release
```

#### Watchdog 强制回收

扫描线程每 50ms 检查未归还帧，超过 200ms 触发 `force_reclaim`：标记 `reclaimed=true` 并立即归还 HAL，但保留 ManagedFrame 对象。后续 `release()` 检查标记跳过 HAL 释放，ref_count 降为 0 时删除对象。

### 模块说明

| 模块 | 源文件 | 职责 |
|------|--------|------|
| **HalLoader** | `hal_loader.h/cpp` | 通过 `dlopen`/`dlsym` 动态加载 HAL 共享库（Video 必需，Codec/OSD 可选） |
| **VideoSource** | `video_source.h/cpp` | 封装 HAL Video 接口，Push 模式帧回调，支持多流（ISP 硬件缩放） |
| **FrameRouter** | `frame_router.h/cpp` | 引用计数帧分发核心，管理 `ManagedFrame` 生命周期（ref_count / reclaimed） |
| **FrameWatchdog** | `frame_watchdog.h/cpp` | 超时强制回收守护，100ms 扫描周期，500ms 超时阈值，300ms 告警阈值 |
| **FdPublisher** | `fd_publisher.h/cpp` | 零拷贝 DMA-BUF FD 发布，SCM_RIGHTS 传输，1 accept + N recv 线程模型 |
| **ShmPublisher** | `shm_publisher.h/cpp` | SHM Ring Buffer 帧发布，DMA-BUF mmap 缓存优化 |
| **OsdManager** | `osd_manager.h/cpp` | 按流管理 OSD 实例，就地像素修改（仅编码路径，不影响 AI 推理流） |
| **EncoderManager** | `encoder_manager.h/cpp` | 管理 HAL Codec 硬件编码器实例，支持运行时参数调整 |

`VideoSource` 关键点：4K 主流 + 640x640 AI 流 + 子流均为 ISP 硬件缩放输出，无软件缩放开销。

> AI 流（640x640）通过 DMA-BUF 直接分发给 AI Runtime，不经过硬件编码器。

## RTSP 服务器

RTSP 服务器实现 RTSP 1.0 + RTP/AVP/TCP 交织传输，支持 H.264/H.265，最多 8 个并发客户端，端口 8554。

### 状态机

```mermaid
stateDiagram-v2
    [*] --> INIT: 新连接建立
    INIT --> READY: DESCRIBE 请求
    READY --> PLAYING: SETUP + PLAY 请求
    PLAYING --> PLAYING: 数据传输中
    PLAYING --> READY: PAUSE 请求
    READY --> PLAYING: RESUME 请求
    PLAYING --> READY: TEARDOWN 请求
    READY --> [*]: 连接关闭
    PLAYING --> [*]: 服务关闭

    state "传输建立" as SETUP
    state "数据传输" as PLAY
    state "关闭连接" as TEARDOWN
```

### RTP FU-A 分片

当 NAL 单元大于 1390 字节时执行 FU-A 分片：

```mermaid
flowchart TD
    A[接收 NAL 单元] --> B{"NAL 大小 > 1390?"}
    B-->|是| C[启动 FU-A 分片]
    B-->|否| D[单包发送]

    C --> E["创建 FU-A 头：F=0 NRI=原始值 TYPE=28"]
    E --> F[首包：S=1, E=0]
    F --> G["分片载荷 <=1380 字节"]
    G --> H{还有数据?}
    H-->|是| I[中间包：S=0, E=0]
    H-->|否| J[尾包：S=0, E=1]
    I --> G

    J --> K[RTP 包：头 + FU-A + 载荷]
    K --> L[TCP 交织传输]
    L --> M[更新 RTP 序列号]

    D --> N[RTP 包：原始 NAL]
    N --> M
```

## 编码流发布

EncodedPublisher 采用双线程架构，将编码回调与网络分发解耦：

```mermaid
flowchart TD
    subgraph "编码回调线程 — 快速入队，非阻塞"
        A["编码回调 on_packet"] --> B[格式检查]
        B --> C[队列检查]
        C --> D{"V1(22B)/V2(30B)?"}
        D --> V1
        D --> V2
        V1 --> E["V1 头：4B 大小 + 1B 编码类型 + 1B 标志 + 8B PTS"]        V2 --> F["V2 头：4B 大小 + 1B 编码类型 + 1B 标志 + 8B PTS + 8B DTS"]
        E --> G[推入队列]
        F --> G
        G --> H[条件通知分发线程]
    end

    subgraph "分发线程 — 独立处理，避免阻塞编码"
        I[等待队列条件] --> J[出队帧数据]
        J --> K[关键帧检测]
        K --> L[UDP/TCP 广播]
        L --> M[统计更新]
    end

    H --> I
    M --> N{更多数据?}
    N-->|是| J
    N-->|否| O[休眠等待]
    O --> I
```

编码器输出 V1（22 字节）或 V2（30 字节）协议头，系统通过 `total_size >= 30` 自动检测版本。V2 头包含：4B 总大小 + 1B 编码类型（0=H264, 1=H265）+ 1B 标志（bit0=关键帧）+ 8B PTS + 8B DTS + 8B 保留。

> V1 头实际结构：4B 大小 + 1B 编码类型 + 1B 标志 + 8B PTS + 8B 保留字段 = 22 字节。

## H.264 WebSocket API

Platform-API 通过 WebSocket 端点 `/api/v1/h264/:stream` 转发 H.264 流，内部通过 UDS 连接 EncodedPublisher。

### 连接处理流程

```mermaid
flowchart TD
    A[新 WebSocket 连接] --> B[创建 H264Stream 实例]
    B --> C[启动 readLoop]
    C --> D[连接 UDS: /run/aipc/camera.sock]
    D --> E{连接成功?}

    E-->|是| F[发送缓存的 SPS/PPS]
    E-->|否| G[指数退避重试]

    F --> H[接收帧数据]
    G --> I[延迟 1s/2s/4s/8s/10s]
    I --> D

    H --> J[协议版本检测]
    J --> K{total_size >= 30?}

    K-->|V1| L[读取 22 字节头]
    K-->|V2| M[读取 30 字节头]

    L --> N[提取 PTS]
    M --> O[提取 PTS + DTS]

    N --> P[拆分 Annex-B]
    O --> P

    P --> Q[转换为 AVCC]
    Q --> R[广播到所有客户端]

    R --> S[追踪关键帧]
    S --> T{超过 GOP-1?}
    T-->|是| U[请求 IDR 帧]
    T-->|否| V[继续处理]

    U --> R
    V --> H
```

### Annex-B 转 AVCC

编码器输出为 Annex-B 格式，WebSocket 传输需转换为 AVCC 格式（4 字节长度前缀）：

```mermaid
flowchart TD
    A[Annex-B 数据] --> B[定位 Start Code 位置]
    B --> C[提取 NAL 单元]
    C --> D{NAL 类型?}

    D-->|"SPS(7)"| E["AVCC：4 字节长度 + SPS"]
    D-->|"PPS(8)"| F["AVCC：4 字节长度 + PPS"]
    D-->|"IDR(5)"| G["AVCC：4 字节长度 + IDR"]
    D-->|其他| H["AVCC：4 字节长度 + NAL"]

    E --> I[加入 SPS/PPS 缓存]
    F --> I
    G --> J[标记为关键帧]
    H --> K[普通数据包]

    I --> L[广播完整帧]
    J --> L
    K --> L
```

SPS/PPS 缓存确保新客户端连接时立即收到参数集，分辨率切换时自动刷新。

## 前端播放

```mermaid
flowchart TD
    A[WebSocket 接收] --> B[解包 V2 头]
    B --> C[提取 PTS/DTS]
    C --> D[拆分 AVCC NAL]

    subgraph "WebCodecs 路径（推荐）"
        D --> E[创建 VideoDecoder]
        E --> F[解码器配置]
        F --> G[解码 NAL 单元]
        G --> H[获取 VideoFrame]
    end

    subgraph "MSE 路径（降级）"
        D --> I[创建 MediaSource]
        I --> J["appendBuffer 追加数据"]
        J --> K[SourceBuffer 处理]
        K --> L[触发 timeupdate]
    end

    H --> M[Canvas 渲染]
    L --> M
```

- **WebCodecs（推荐）** — `VideoDecoder` 直接解码 NAL 单元，`VideoFrame` 通过 Canvas 渲染，延迟最低。
- **MSE（降级）** — `MediaSource` + `SourceBuffer` 交给浏览器内置解码器，兼容性更好。
- 内置指数退避重连（1s -> 10s），断连自动恢复。

## 性能参数

| 组件 | 参数 | 值 | 说明 |
|------|------|----|------|
| RTSP | epoll 超时 | 500ms | 平衡响应性与资源占用 |
| RTSP | 发送缓冲区 | 4MB | 避免 TCP 阻塞 |
| RTSP | RTP_MTU | 1390 字节 | IP + TCP + RTP + FU-A 开销 |
| RTSP | 最大客户端数 | 8 | 并发连接上限 |
| RTSP | 端到端延迟 | 编码约 20ms + 网络约 30ms + 渲染约 30ms | 目标 < 100ms |
| Publisher | 协议版本 | V1 (22B) / V2 (30B) | 自动检测 |
| Publisher | 队列大小 | 无限制 | 避免丢帧 |
| WebSocket | 自动重连 | 指数退避 1s -> 10s | 最多 5 次递增 |
| WebSocket | 心跳间隔 | 30s | 保活探测 |
| WebSocket | 空闲超时 | 5 分钟 | 无数据自动断开 |

## 配置

```yaml
hal:
  video_library: /opt/aipc/lib/hal/hal-hailo15.so
  codec_library: ""
  osd_library: ""

video:
  device_path: /dev/video0
  streams:
    - { name: main, width: 3840, height: 2160, fps: 30, pool: 8 }
    - { name: ai,   width: 640,  height: 640,  fps: 15, pool: 6 }
    - { name: sub,  width: 640,  height: 480,  fps: 10, pool: 4 }

shm:
  directory: /run/aipc/shm
  buffer_count: 4

fd_publisher:
  sock_path: /run/aipc/camera.sock
  max_clients: 16
  max_outstanding_per_client: 3

watchdog:
  scan_interval_ms: 100
  frame_timeout_ms: 500
  warn_threshold_ms: 300

encoder:
  main:
    codec: h264
    width: 1920
    height: 1080
    bitrate: 4000000
    fps: 30
    gop: 30
    profile: high
    level: 4.1
  sub:
    codec: h264
    width: 1280
    height: 720
    bitrate: 2000000
    fps: 30
    gop: 60
```

> 上述示例中子流采集与编码分辨率不同，实际部署时建议编码分辨率不超过采集分辨率以避免上采样浪费码率。

```yaml
rtsp:
  enabled: true
  port: 8554
  max_clients: 8
  buffer_size: 4194304
  timeout: 500

websocket:
  path: /api/v1/h264
  max_reconnect_delay: 10
  initial_reconnect_delay: 1
  idle_timeout: 300
  ping_interval: 30
```

| 操作 | 热更新 | 全量重配置 |
|------|--------|------------|
| 影响 | 无缝，< 50ms | 重启编码器，约 100ms |
| 参数 | 码率、帧率、GOP | 分辨率、编码格式 |
| 体验 | 无中断 | 短暂黑屏 |

## 相关文档

- [NE503 概览](../0-overview.md) — 产品核心能力与规格总览
- [软件平台](../3-software-platform/0-platform-architecture.md) — 平台架构与容器化应用
- [平台开发](../5-platform-development/0-development-guide.md) — SDK 与开发工具链
