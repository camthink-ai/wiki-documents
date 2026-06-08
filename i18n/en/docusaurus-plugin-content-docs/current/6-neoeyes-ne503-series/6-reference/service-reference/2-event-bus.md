---
description: NE503 Event Bus service complete reference, covering publish/subscribe message bus, MQTT-style wildcard matching, dual-listener mode, pure in-memory architecture, and performance parameters.
keywords: [NE503 Event Bus, publish subscribe, message bus, MQTT wildcard, event system, gRPC]
tags: [service reference, NE503, Event Bus, messaging system, platform contributor]
---

# Event Bus Service

## Overview

`event-bus` is the local Pub/Sub message bus for the NE503 platform, responsible for AI inference result distribution, application event reporting, and system event notification. It supports MQTT-style wildcard Topic matching, uses a pure in-memory implementation, and requires no external dependencies.

**Tech Stack**: Go + gRPC, zero disk I/O, pure in-memory architecture.

**Core Capabilities**:

- **MQTT-style Wildcards**: Supports three matching modes — `*` (single-level), `**` (multi-level), and `**/suffix` (suffix)
- **Dual Listener Mode**: Provides both Unix Socket (Go clients) and TCP Socket (C++ clients) access methods simultaneously
- **Pure In-memory Queue**: 1000-message buffer per subscriber, asynchronous non-blocking delivery
- **Batch Processing Optimization**: Worker threads + batch delivery, single message publish latency < 0.1 ms

## Architecture

Event Bus serves as the platform-level messaging hub, connecting multiple event sources and subscribers including AI Runtime, device control, and application management.

```mermaid
graph TB
    subgraph "Publishers"
        P1["AI Runtime<br/>Inference Results"]
        P2["Device Control<br/>Device Events"]
        P3["App Manager<br/>App Events"]
        P4["User Apps<br/>Custom Events"]
    end

    subgraph "Event Bus Service"
        EB["EventBus<br/>gRPC Server"]
        subgraph "Dual Listener Mode"
            US["Unix Socket<br/>Go Clients"]
            TS["TCP Socket<br/>C++ Clients"]
        end
        subgraph "Core Components"
            PS["Publisher Manager"]
            SM["Subscriber Manager"]
            TM["Topic Matcher"]
            ST["Statistics System"]
        end
    end

    subgraph "Subscribers"
        S1["platform-api<br/>Web API"]
        S2["Web Console<br/>Real-time Updates"]
        S3["User Apps<br/>Event Processing"]
        S4["Monitoring Service<br/>Log Collection"]
    end

    subgraph "Features"
        Q["In-memory Queue<br/>1000 msgs/subscriber"]
        W["Worker Threads<br/>4 threads"]
        B["Batch Delivery<br/>10 msgs/batch"]
        R["Read-Write Lock<br/>Concurrency Safe"]
    end

    P1 -->|Publish| EB
    P2 -->|Publish| EB
    P3 -->|Publish| EB
    P4 -->|Publish| EB

    EB --> US
    EB --> TS

    PS -->|Message Delivery| SM
    SM -->|Topic Matching| TM
    TM -->|Match Results| SM

    EB -->|Stream Push| S1
    EB -->|Stream Push| S2
    EB -->|Stream Push| S3
    EB -->|Stream Push| S4

    PS -.->|Stats Update| ST
    EB -.->|Performance Metrics| W
    EB -.->|Queue Management| Q
    EB -.->|Batch Processing| B
    EB -.->|Concurrency Control| R
```

## Publish/Subscribe Flow

```mermaid
sequenceDiagram
    participant P as Publisher
    participant EB as EventBus Server
    participant SM as Subscriber Manager
    participant S as Subscriber
    participant Q as Message Queue

    P->>EB: gRPC Publish(topic="model/detected")
    EB->>EB: Generate event_id / set timestamp_ns
    EB->>SM: findMatchingSubscribers()
    SM->>SM: Topic wildcard matching
    SM-->>EB: Return matched subscriber list

    loop Iterate each subscriber
        EB->>Q: Deliver to subscriber queue
        Q-->>S: Non-blocking delivery
        alt Queue not full
            S->>S: Process event
        else Queue full
            Note over EB: Drop old messages
        end
    end

    EB->>EB: Update statistics counters
    EB-->>P: PublishResponse
```

Key flow points: auto-generated event_id → wildcard matching to find subscribers → buffered channel non-blocking delivery → drop old messages when queue is full to protect throughput.

## Dual Listener Mode

Event Bus starts both Unix Socket and TCP Socket gRPC listeners simultaneously, optimizing the access experience for Go clients and C++ clients respectively.

```mermaid
graph LR
    subgraph "EventBus Service"
        subgraph "Service Instance"
            EB["EventBus Server<br/>Go gRPC Service"]
        end

        subgraph "Listeners"
            US["Unix Socket Listener<br/>/run/aipc/event-bus.sock<br/>Low overhead, Go clients"]
            TS["TCP Listener<br/>127.0.0.1:50053<br/>C++ client compatible"]
        end

        EB --> US
        EB --> TS
    end

    subgraph "Client Types"
        GC["Go Client<br/>Uses Unix Socket<br/>Performance priority"]
        CC["C++ Client<br/>Uses TCP Socket<br/>Compatibility priority"]
    end

    GC --> US
    CC --> TS
```

**Design Rationale**: Unix Socket has zero network overhead for local communication, making it ideal for high-performance inter-service calls between Go services; TCP Socket addresses the limited Unix Socket support in C++ gRPC libraries. Both listeners share the same core logic.

## gRPC API

Service name: `EventBus`

- Unix Socket: `unix:///run/aipc/event-bus.sock`
- TCP Socket: `127.0.0.1:50053`

### RPC Methods

| RPC | Request Type | Response Type | Description |
|-----|---------|----------|------|
| `Publish` | `PublishRequest` | `PublishResponse` | Publish a single event |
| `PublishBatch` | `stream PublishRequest` | `Status` | Batch publish (client streaming) |
| `Subscribe` | `SubscribeRequest` | `stream Event` | Subscribe to Topic (supports wildcards, server streaming) |
| `Unsubscribe` | `SubscribeRequest` | `Status` | Unsubscribe |
| `ListTopics` | `Empty` | `TopicListResponse` | List active Topics |
| `GetTopicInfo` | `TopicInfo` | `TopicInfo` | Get Topic details |
| `GetStats` | `Empty` | `SystemStats` | Get system statistics |
| `GetTopicStats` | `TopicInfo` | `EventStats` | Get Topic statistics |

### Core Message Structures

**Event** (event message):

```protobuf
message Event {
  string topic = 1;           // Topic (e.g., "model/person_v1/detections")
  uint64 timestamp_ns = 2;    // Nanosecond timestamp
  string source = 3;          // Source (app_id / service name)
  string event_id = 4;        // Event ID (auto-generated)
  bytes payload = 10;         // Payload (JSON or protobuf)
  string payload_type = 11;   // "json" / "protobuf"
  map<string, string> metadata = 20;
}
```

**SubscribeRequest** (subscribe request):

```protobuf
message SubscribeRequest {
  string topic = 1;           // Supports wildcards
  string subscriber_id = 2;   // Subscriber ID
  map<string, string> filters = 10;  // Optional filters
  uint32 queue_size = 20;     // Queue size
  bool drop_old = 21;         // Drop old messages when queue is full
}
```

**Statistics** (statistics):

```protobuf
message EventStats {
  string topic = 1;
  uint64 published_count = 2;   // Published count
  uint64 delivered_count = 3;   // Delivered count
  uint64 dropped_count = 4;     // Dropped count
  float avg_latency_us = 5;     // Average latency (microseconds)
}

message SystemStats {
  repeated EventStats topic_stats = 1;
  uint32 total_subscribers = 2;  // Total subscribers
  uint32 total_topics = 3;       // Total topics
  uint64 uptime_ms = 4;          // Uptime (milliseconds)
}
```

## Topic Wildcard Matching

Event Bus supports MQTT-style wildcard matching based on `/`-delimited hierarchical Topic paths.

### Matching Patterns

| Pattern | Description | Example |
|------|------|------|
| Exact match | Topic is exactly equal | `app/test/alert` |
| `*` | Match a single level (does not cross `/`) | `app/*/alert` matches `app/test/alert` |
| `**` | Match zero or more levels | `app/**` matches `app/a/b/c` |
| `**/suffix` | Suffix matching | `app/**/events` matches `app/a/b/events` |

**Matching Rules**:

- `*` matches only a single path segment, does not cross `/` separators
- `**` matches zero to multiple path segments, supports recursive backtracking
- The matching algorithm uses segment-by-segment recursive comparison to correctly handle nested wildcards

### Matching Examples

| Subscription Pattern | Topic | Match Result | Description |
|----------|-------|---------|------|
| `model/person_v1/detections` | `model/person_v1/detections` | ✅ | Exact match |
| `model/person_v1/detections` | `model/yolov8/detections` | ❌ | No match |
| `model/*/detections` | `model/person_v1/detections` | ✅ | `*` matches `person_v1` |
| `model/*/detections` | `model/a/b/detections` | ❌ | `*` does not cross levels |
| `app/**` | `app/test/alert` | ✅ | `**` matches `test/alert` |
| `app/**` | `app/a/b/c` | ✅ | `**` matches `a/b/c` |
| `app/**` | `app` | ✅ | `**` matches zero segments |
| `model/**/detections` | `model/cam0_main/person_v1/detections` | ✅ | `**` matches `cam0_main/person_v1` |
| `**/alert` | `system/device/error/alert` | ✅ | Suffix match |

### Matching Algorithm Flow

```mermaid
flowchart TD
    A[Receive Topic and Pattern] --> B[Split path segments by /]
    B --> C{Pattern Type}

    C -->|Exact Match| D[Full equality check]
    C -->|Single-level Wildcard *| E["* matches a single path segment"]
    C -->|Multi-level Wildcard **| F["** matches multiple path segments"]
    C -->|Suffix Match| G["**/suffix format"]

    D --> H[Return match result]
    E --> I[Check if path segment counts are equal]
    F --> J[Recursively match remaining parts]
    G --> K[Match from end backwards]

    H --> L[Return match result]
    I --> L
    J --> L
    K --> L

    style B fill:#e3f2fd
    style E fill:#f3e5f5
    style F fill:#e8f5e9
    style G fill:#fff3e0
```

## Pure In-Memory Architecture

Event Bus uses a pure in-memory design where all data structures reside in process memory with no external storage dependencies.

```mermaid
graph LR
    subgraph "Event Bus Memory Layout"
        A["Publisher Map<br/>Publishers"] --> B["Topic → Publisher List"]
        C["Subscriber Map<br/>Subscribers"] --> D["Topic → Subscriber List"]
        E["Statistics Map<br/>Statistics"] --> F["Topic → Statistics"]
        G["Message Queues<br/>Queues"] --> H["Subscriber ID → Channel"]
    end

    subgraph "Performance Optimizations"
        I["Zero-copy Pointer Passing"]
        J["Read-Write Lock Protection"]
        K["Batch Delivery"]
        L["Async Non-blocking"]
    end

    B -->|Read/Write| I
    D -->|Read/Write| J
    F -->|Atomic Update| I
    H -->|Channel Delivery| K

    style A fill:#e1f5fe
    style C fill:#e1f5fe
    style E fill:#e1f5fe
    style G fill:#e1f5fe

    style I fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
```

**Core Design**: Zero-copy pointer passing, read-write lock concurrency control, buffered channel isolation for slow consumers, async publish with immediate return, automatic inactive Topic reclamation (default 3600 seconds).

## Performance Characteristics

| Metric | Value | Description |
|------|------|------|
| Single message publish latency | < 0.1 ms | Including matching and delivery |
| Maximum throughput | 100,000 msg/s | Batch publish mode |
| Memory usage | < 50 MB | Including subscriptions and statistics |
| Maximum Topics | 1000 | Configurable |
| Queue per subscriber | 1000 messages | Configurable |

## Configuration

Configuration file path: `configs/platform/event-bus.yaml`

| Configuration Item | Default Value | Description |
|--------|--------|------|
| **service.name** | `event-bus` | Service name |
| **service.listen** | `unix:///run/aipc/event-bus.sock` | Unix Socket listen address (Go clients) |
| **service.tcp_listen** | `127.0.0.1:50053` | TCP listen address (C++ client compatible) |
| **service.log_level** | `info` | Log level |
| **bus.queue_size** | `1000` | Queue size per subscriber |
| **bus.max_topics** | `1000` | Maximum number of Topics |
| **bus.workers** | `4` | Number of worker threads |
| **bus.batch_size** | `10` | Batch delivery size |
| **bus.inactive_topic_ttl** | `3600` | Inactive Topic cleanup interval (seconds) |
| **routing.priorities** | — | Topic prefix priorities (`system/` → 10, `alert/` → 8, `model/` → 5, `app/` → 5) |
| **routing.rate_limits** | — | Topic rate limits (`model/*` → 1000 msg/s, `app/*` → 100 msg/s) |
| **monitoring.stats_enabled** | `true` | Enable statistics |
| **monitoring.stats_interval_sec** | `10` | Statistics collection interval (seconds) |
| **monitoring.metrics_port** | `9091` | Prometheus metrics port |

## Related Documentation

- [AI Inference Service](./0-ai-runtime.md) — One of the main event sources for Event Bus
- [Device Control Service](./3-device-control.md) — Device events distributed through Event Bus
- [App Manager Service](./1-app-manager.md) — Application lifecycle events published to Event Bus
- [CLI Tool Guide](../../5-system-integration/3-cli-guide.md) — Use `aipc-cli event` commands to operate Event Bus
