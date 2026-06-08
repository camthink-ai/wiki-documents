---
description: Complete reference for the NE503 media streaming pipeline, covering Camera Daemon video capture and frame distribution, DMA-BUF zero-copy and SHM dual-channel, hardware encoding, RTSP/H.264 streaming, and WebSocket real-time transport.
keywords: [NE503 media streaming, Camera Daemon, DMA-BUF zero-copy, RTSP, H.264, video encoding, SHM shared memory]
tags: [Service Reference, NE503, Media Streaming, Video Pipeline, Platform Contributors]
---

# Media Streaming Service

NE503 implements a complete low-latency video pipeline from camera hardware capture to web frontend playback, supporting RTSP protocol output, and provides real-time video streaming via WebSocket endpoints of the Platform API. The system employs DMA-BUF zero-copy, reference-counted frame distribution, Unix Domain Socket communication, and other technologies to achieve end-to-end latency of less than 100ms.

- **Protocol** — RTSP 1.0 + RTP/AVP/TCP interleaved transport; H.264/H.265 FU-A fragmentation
- **Zero-copy** — DMA-BUF FD passthrough + reference counting, no memory copies on the AI inference path
- **Dual-channel** — FD Passthrough (zero-copy) and SHM Ring Buffer (single memcpy) coexist, automatically selected based on App permissions
- **Multi-client** — A single stream can simultaneously serve multiple consumers including RTSP, WebSocket, and AI inference
- **Hot update** — Dynamically adjust encoding parameters (bitrate, frame rate, GOP) without restarting the encoder

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Camera as Camera Hardware
    participant HAL as HAL.Video
    participant Encoder as HAL.Codec
    participant Publisher as EncodedPublisher
    participant RTSP as RTSP Server
    participant API as Platform-API
    participant Player as Player

    Camera->>HAL: Capture YUV
    HAL->>Encoder: YUV -> H.264/H.265
    Encoder->>Publisher: on_packet() (zero-copy)
    Publisher->>Publisher: Dual-thread distribution
    Publisher->>RTSP: UDS (.sock)
    RTSP->>RTSP: SDP generation
    RTSP->>Player: RTSP over TCP (8554)
    Publisher->>API: WebSocket
    API->>Player: H.264 over WebSocket
    Player->>Player: Decode & render
    Note over Publisher: V1/V2 protocol auto-detection
    Note over API: Annex-B to AVCC conversion
```

## Camera Daemon

Camera Daemon is the core C++ service on the NE503 platform, responsible for video capture, frame distribution, encoding, and multi-channel frame publishing. It directly operates the HAL hardware abstraction layer.

### Overall Architecture

```mermaid
graph TB
    subgraph Hardware["Hardware"]
        ISP[ISP / Sensor]
    end

    subgraph HAL["HAL .so (dlopen)"]
        HAL_VIDEO[hal_video]
        HAL_CODEC[hal_codec]
        HAL_OSD[hal_osd]
    end

    subgraph Daemon["camera-daemon"]
        HL[HalLoader<br/>dlopen/dlsym]
        VS[VideoSource<br/>Push-mode callback]
        FR[FrameRouter<br/>Reference-counted distribution<br/>retain / release]
        WD[FrameWatchdog<br/>200ms timeout guard]

        OSD[OsdManager<br/>In-place drawing]
        ENC[EncoderManager<br/>HAL Codec]
        SHM[ShmPublisher<br/>memcpy -> Ring Buffer]
        FDP[FdPublisher<br/>SCM_RIGHTS zero-copy]
    end

    subgraph Consumers["Consumers"]
        RTSP[RTSP / HLS<br/>Encoded packets]
        APP_SHM[Normal App<br/>SHM mmap PROT_READ]
        APP_FD[Trusted App<br/>recv_id + mmap]
        AI_RT[ai-runtime<br/>SCM_RIGHTS passthrough]
    end

    ISP --> HAL_VIDEO
    HL -->|dlopen| HAL_VIDEO
    HL -->|dlopen| HAL_CODEC
    HL -->|dlopen| HAL_OSD
    HAL_VIDEO -->|HalRawFrame*| VS
    VS -->|Frame callback| FR
    WD -.->|force_reclaim| FR

    FR -->|ref++| OSD
    OSD -->|In-place drawing| ENC
    ENC -->|release| FR
    ENC --> RTSP

    FR -->|ref++| SHM
    SHM -->|release| FR
    SHM -->|SHM file| APP_SHM

    FR -->|retain per client| FDP
    FDP -->|release| FR
    FDP -->|SCM_RIGHTS UDS| APP_FD

    FR -->|SCM_RIGHTS| AI_RT
```

### Dual-Channel Frame Distribution

App containers acquire video frames through two methods. The Daemon automatically selects the appropriate method based on App permissions.

#### FD Passthrough (Zero-Copy) — FdPublisher

For trusted Apps (with `dma_buf: true` declared in manifest). DMA-BUF fd is passed directly via `SCM_RIGHTS`. The App uses `mmap` to access pixel data — zero-copy throughout. Each client can hold a maximum of 3 frames simultaneously (backpressure protection). The Watchdog enforces a 200ms timeout for forced reclamation to prevent HAL buffer leaks.

**Communication Protocol (`fd_protocol.h`):**

| Direction | Message | Description |
|-----------|---------|-------------|
| Client -> Server | `SUBSCRIBE(stream_name)` | Subscribe to video stream |
| Server -> Client | `FRAME` + SCM_RIGHTS | Frame metadata + DMA-BUF fd |
| Client -> Server | `RELEASE(frame_id)` | Return frame |
| Client -> Server | `UNSUBSCRIBE` | Unsubscribe |

#### SHM Ring Buffer (Single memcpy) — ShmPublisher

For all Apps (no special container permissions required). Frame data is memcpy'd to a shared memory Ring Buffer. Apps access it read-only via `mmap PROT_READ`. Internally caches DMA-BUF mmap results to avoid per-frame mmap/munmap system calls. Performance: 640x640 NV12 approximately 0.1ms, 4K approximately 2ms.

#### Comparison of Both Methods

| | FD Passthrough | SHM |
|---|---|---|
| Copy count | 0 | 1 memcpy |
| 640x640 latency | Approx. 0.03ms | Approx. 0.1ms |
| 4K latency | Approx. 0.03ms | Approx. 2ms |
| Container permissions | seccomp: ioctl, SCM_RIGHTS | No special permissions |
| App crash risk | HAL buffer leak (Watchdog protection) | No impact |
| Python interface | recv_fd + mmap + np.frombuffer | mmap + np.frombuffer |
| Recommended use case | AI inference, high-frame-rate processing | General analysis, image saving |

### Frame Lifecycle

#### Reference Counting Flow

```mermaid
stateDiagram-v2
    [*] --> Created: HAL callback
    Created --> Distributed: ref_count = N subscribers

    Distributed --> Retained: FdPublisher retain() +1
    Retained --> Distributed: One client RELEASE -> release() -1

    Distributed --> Released: release() -> ref_count=0
    Released --> HAL_Pool: release_frame()
    HAL_Pool --> [*]

    Distributed --> ForceReclaimed: Watchdog timeout 200ms
    ForceReclaimed --> Released: Subsequent release() calls
    note right of ForceReclaimed: reclaimed=true<br/>HAL released<br/>Skip HAL release
```

#### Watchdog Forced Reclamation

The scanning thread checks unreturned frames every 50ms. Frames exceeding 200ms trigger `force_reclaim`: marks `reclaimed=true` and immediately returns to HAL, but retains the ManagedFrame object. Subsequent `release()` calls check the flag and skip HAL release; the object is deleted when ref_count drops to 0.

### Module Reference

| Module | Source File | Responsibility |
|--------|-------------|----------------|
| **HalLoader** | `hal_loader.h/cpp` | Dynamically loads HAL shared libraries via `dlopen`/`dlsym` (Video required, Codec/OSD optional) |
| **VideoSource** | `video_source.h/cpp` | Wraps HAL Video interface, Push-mode frame callback, supports multi-stream (ISP hardware scaling) |
| **FrameRouter** | `frame_router.h/cpp` | Reference-counted frame distribution core, manages `ManagedFrame` lifecycle (ref_count / reclaimed) |
| **FrameWatchdog** | `frame_watchdog.h/cpp` | Timeout forced reclamation guard, 100ms scan cycle, 500ms timeout threshold, 300ms warning threshold |
| **FdPublisher** | `fd_publisher.h/cpp` | Zero-copy DMA-BUF FD publishing, SCM_RIGHTS transport, 1 accept + N recv thread model |
| **ShmPublisher** | `shm_publisher.h/cpp` | SHM Ring Buffer frame publishing, DMA-BUF mmap cache optimization |
| **OsdManager** | `osd_manager.h/cpp` | Per-stream OSD instance management, in-place pixel modification (encoding path only, does not affect AI inference stream) |
| **EncoderManager** | `encoder_manager.h/cpp` | Manages HAL Codec hardware encoder instances, supports runtime parameter adjustment |

`VideoSource` key point: 4K main stream + 640x640 AI stream + sub-stream are all ISP hardware-scaled outputs with no software scaling overhead.

> **Note**: The AI stream uses DMA-BUF file descriptors for zero-copy delivery to ai-runtime via SCM_RIGHTS over Unix Domain Socket. This avoids any memory copy between the camera pipeline and the NPU inference pipeline.

## RTSP Server

The RTSP server implements RTSP 1.0 + RTP/AVP/TCP interleaved transport, supporting H.264/H.265 with up to 8 concurrent clients on port 8554.

### State Machine

```mermaid
stateDiagram-v2
    [*] --> INIT: New connection established
    INIT --> READY: DESCRIBE request
    READY --> PLAYING: SETUP + PLAY request
    PLAYING --> PLAYING: Data transmission in progress
    PLAYING --> READY: PAUSE request
    READY --> PLAYING: RESUME request
    PLAYING --> READY: TEARDOWN request
    READY --> [*]: Connection closed
    PLAYING --> [*]: Service shutdown

    state "Transport Setup" as SETUP
    state "Data Transmission" as PLAY
    state "Close Connection" as TEARDOWN
```

### RTP FU-A Fragmentation

FU-A fragmentation is performed when the NAL unit exceeds 1390 bytes:

```mermaid
flowchart TD
    A[Receive NAL unit] --> B{"NAL size > 1390?"}
    B-->|Yes| C[Start FU-A fragmentation]
    B-->|No| D[Single packet send]

    C --> E["Create FU-A header: F=0 NRI=original TYPE=28"]
    E --> F[First packet: S=1, E=0]

    F --> G["Fragment payload <=1380 bytes"]
    G --> H{More data?}
    H-->|Yes| I[Middle packet: S=0, E=0]
    H-->|No| J[Last packet: S=0, E=1]
    I --> G

    J --> K[RTP packet: header + FU-A + payload]
    K --> L[TCP interleaved transport]
    L --> M[Update RTP sequence number]

    D --> N[RTP packet: original NAL]
    N --> M
```

## Encoded Stream Publishing

EncodedPublisher uses a dual-thread architecture to decouple encoding callbacks from network distribution:

```mermaid
flowchart TD
    subgraph "Encoding callback thread — fast enqueue, non-blocking"
        A["Encoding callback on_packet"] --> B[Format check]
        B --> C[Queue check]
        C --> D{"V1(22B)/V2(30B)?"}
        D --> V1
        D --> V2
        V1 --> E["V1 header: 4B size + 1B codec type + 1B flags + 8B PTS"]
        V2 --> F["V2 header: 4B size + 1B codec type + 1B flags + 8B PTS + 8B DTS"]
        E --> G[Push to queue]
        F --> G
        G --> H[Signal distribution thread]
    end

    subgraph "Distribution thread — independent processing, avoids blocking encoding"
        I[Wait for queue signal] --> J[Dequeue frame data]
        J --> K[Keyframe detection]
        K --> L[UDP/TCP broadcast]
        L --> M[Statistics update]
    end

    H --> I
    M --> N{More data?}
    N-->|Yes| J
    N-->|No| O[Sleep and wait]
    O --> I
```

The encoder outputs V1 (22-byte) or V2 (30-byte) protocol headers. The system auto-detects the version via `total_size >= 30`. The V2 header contains: 4B total size + 1B codec type (0=H264, 1=H265) + 1B flags (bit0=keyframe) + 8B PTS + 8B DTS + 8B reserved.

> **V1 header structure** (22 bytes): `4B total_size + 1B codec_type + 1B flags + 8B PTS + 8B reserved` (no DTS field). The V2 header extends V1 by replacing the 8B reserved field with `8B DTS + 8B reserved`.

## H.264 WebSocket API

Platform-API forwards the H.264 stream via the WebSocket endpoint `/api/v1/h264/:stream`, connecting to EncodedPublisher internally through UDS.

### Connection Handling Flow

```mermaid
flowchart TD
    A[New WebSocket connection] --> B[Create H264Stream instance]
    B --> C[Start readLoop]
    C --> D[Connect UDS: /run/aipc/camera.sock]
    D --> E{Connection successful?}

    E-->|Yes| F[Send cached SPS/PPS]
    E-->|No| G[Exponential backoff retry]

    F --> H[Receive frame data]
    G --> I[Delay 1s/2s/4s/8s/10s]
    I --> D

    H --> J[Protocol version detection]
    J --> K{total_size >= 30?}

    K-->|V1| L[Read 22-byte header]
    K-->|V2| M[Read 30-byte header]

    L --> N[Extract PTS]
    M --> O[Extract PTS + DTS]

    N --> P[Split Annex-B]
    O --> P

    P --> Q[Convert to AVCC]
    Q --> R[Broadcast to all clients]

    R --> S[Track keyframes]
    S --> T{Exceeds GOP-1?}
    T-->|Yes| U[Request IDR frame]
    T-->|No| V[Continue processing]

    U --> R
    V --> H
```

### Annex-B to AVCC Conversion

The encoder outputs in Annex-B format. WebSocket transmission requires conversion to AVCC format (4-byte length prefix):

```mermaid
flowchart TD
    A[Annex-B data] --> B[Locate Start Code positions]
    B --> C[Extract NAL units]
    C --> D{NAL type?}

    D-->|"SPS(7)"| E["AVCC: 4-byte length + SPS"]
    D-->|"PPS(8)"| F["AVCC: 4-byte length + PPS"]
    D-->|"IDR(5)"| G["AVCC: 4-byte length + IDR"]
    D-->|Other| H["AVCC: 4-byte length + NAL"]

    E --> I[Add to SPS/PPS cache]
    F --> I
    G --> J[Mark as keyframe]
    H --> K[Normal data packet]

    I --> L[Broadcast complete frame]
    J --> L
    K --> L
```

The SPS/PPS cache ensures that new clients immediately receive parameter sets upon connection, and automatically refreshes on resolution changes.

## Frontend Playback

```mermaid
flowchart TD
    A[WebSocket receive] --> B[Unpack V2 header]
    B --> C[Extract PTS/DTS]
    C --> D[Split AVCC NAL units]

    subgraph "WebCodecs path (recommended)"
        D --> E[Create VideoDecoder]
        E --> F[Decoder configuration]
        F --> G[Decode NAL units]
        G --> H[Get VideoFrame]
    end

    subgraph "MSE path (fallback)"
        D --> I[Create MediaSource]
        I --> J["appendBuffer to append data"]
        J --> K[SourceBuffer processing]
        K --> L[Trigger timeupdate]
    end

    H --> M[Canvas rendering]
    L --> M
```

- **WebCodecs (recommended)** — `VideoDecoder` directly decodes NAL units, `VideoFrame` renders via Canvas, lowest latency.
- **MSE (fallback)** — `MediaSource` + `SourceBuffer` delegates to the browser's built-in decoder, better compatibility.
- Built-in exponential backoff reconnection (1s -> 10s), automatic recovery on disconnection.

## Performance Parameters

| Component | Parameter | Value | Description |
|-----------|-----------|-------|-------------|
| RTSP | epoll timeout | 500ms | Balances responsiveness and resource usage |
| RTSP | Send buffer | 4MB | Prevents TCP blocking |
| RTSP | RTP_MTU | 1390 bytes | IP + TCP + RTP + FU-A overhead |
| RTSP | Max clients | 8 | Concurrent connection limit |
| RTSP | End-to-end latency | Encoding approx. 20ms + Network approx. 30ms + Rendering approx. 30ms | Target < 100ms |
| Publisher | Protocol version | V1 (22B) / V2 (30B) | Auto-detected |
| Publisher | Queue size | Unlimited | Avoids frame drops |
| WebSocket | Auto-reconnect | Exponential backoff 1s -> 10s | Up to 5 increments |
| WebSocket | Heartbeat interval | 30s | Keepalive probe |
| WebSocket | Idle timeout | 5 minutes | Auto-disconnect on no data |

## Configuration

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

> **Note**: The sub-stream resolution (`1280x720`) and the AI stream resolution (`640x640`) are independent configurations. The sub-stream is intended for secondary viewing/recording, while the AI stream is specifically sized for NPU model input.

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

| Operation | Hot Update | Full Reconfiguration |
|-----------|------------|---------------------|
| Impact | Seamless, < 50ms | Restarts encoder, approx. 100ms |
| Parameters | Bitrate, frame rate, GOP | Resolution, codec format |
| Experience | No interruption | Brief black screen |

## Related Documentation

- [NE503 Overview](../0-overview.md) — Product core capabilities and specifications
- [Software Platform](../3-software-platform/0-platform-architecture.md) — Platform architecture and containerized applications
- [Platform Development](../5-platform-development/0-development-guide.md) — SDK and development toolchain
