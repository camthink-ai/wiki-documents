---
description: Complete reference for NE503 Device Discovery service, covering CT-Disc device discovery protocol, UDP multicast and MQTT dual transport modes, device state management, gRPC API, and network topology.
keywords: [NE503 Device Discovery, CT-Disc, device discovery, UDP multicast, MQTT, device management]
tags: [service reference, NE503, Device Discovery, device discovery, platform contributor]
---

# Device Discovery Service

Device Discovery is a Go + gRPC based device discovery service that implements the **CT-Disc** (CamThink Device Discovery & Management) protocol for automatic discovery and unified management of CamThink devices in LAN and WAN environments.

Core capabilities: **dual transport mode** (UDP multicast + MQTT auto-selected by network type), **unified device model** (normalized storage by SN), **real-time state management** (automatic online/offline detection), **management command channel** (remote command dispatch).

## System Architecture

```mermaid
graph TB
    subgraph "CamThink Device Layer"
        NE301["NE301 (STM32)<br/>Ethernet"]
        NE503["NE503 (Linux)<br/>Ethernet/WiFi"]
        NE101_WIFI["NE101 (ESP32-S3)<br/>WiFi/HaLow"]
        NE101_CAT1["NE101 (ESP32-S3)<br/>CAT1 Cellular"]
    end

    subgraph "Network Transport Layer"
        MC["UDP Multicast<br/>239.255.255.250:19850"]
        MQ["MQTT Broker<br/>CamThink Platform"]
        MD["mDNS (Optional)<br/>_aipc._tcp.local"]
    end

    subgraph "Discovery Service"
        DS["DeviceDiscovery<br/>gRPC Server"]
        subgraph "Listeners"
            ML["Multicast Listener<br/>UDP multicast listener"]
        end
        subgraph "Registry"
            REG["Registry<br/>Device Info Storage"]
        end
        subgraph "State Management"
            SM["Timeout Detector<br/>Timeout detection"]
        end
        subgraph "gRPC Handler"
            GH["Handler<br/>gRPC API Implementation"]
        end
    end

    subgraph "Management"
        PA["platform-api"]
        WC["Web Console"]
    end

    NE301 -->|ct-announce| ML
    NE503 -->|ct-announce| ML
    NE101_WIFI -->|ct-announce| ML
    NE101_CAT1 -->|ct-register| MQ
    NE101_WIFI -.->|Optional| MD
    NE503 -.->|Optional| MD
    ML -->|Receive multicast| DS
    MQ -->|MQTT messages| DS
    DS -->|Update| REG
    DS -->|Detect timeout| SM
    SM -->|Periodic check| REG
    GH -->|gRPC API| PA
    PA -->|REST API| WC
    DS -->|Device events| PA

    style ML fill:#e3f2fd
    style REG fill:#e8f5e9
    style SM fill:#f3e5f5
    style GH fill:#fff3e0
```

## CT-Disc Protocol

CT-Disc defines the complete interaction flow for devices to automatically announce, register with the management platform, and accept management commands.

### Multicast Discovery

After powering on, devices automatically send `ct-announce` via UDP multicast. The Discovery service listens and registers them.

```mermaid
sequenceDiagram
    participant D as Device (NE301/NE503/NE101)
    participant ML as Multicast Listener
    participant REG as Registry
    participant DS as Discovery Service
    participant GH as gRPC Handler

    Note over D: Device powered on, network ready
    D->>D: Initialize CT-Disc, start timer (5s)

    loop Every 5 seconds
        D->>ML: UDP multicast ct-announce (239.255.255.250:19850)
        ML->>ML: Parse JSON packet
        ML->>REG: Registry.Update()

        alt New device
            REG->>REG: Create device record
            REG->>DS: Trigger ONLINE event
            DS->>GH: gRPC event push
        else Existing device
            REG->>REG: Update last_seen
        end
    end
```

### Device State Management

Each device maintains four states in the registry, with automatic transitions through timeout detection.

```mermaid
stateDiagram-v2
    [*] --> ONLINE : announce/register received
    ONLINE --> ONLINE : Periodic last_seen refresh
    ONLINE --> OFFLINE : No message for 30s
    OFFLINE --> ONLINE : Message received again
    OFFLINE --> DELETED : Manual deletion
    ONLINE --> UPDATING : IP address changed
    UPDATING --> ONLINE : Update complete

    state "OFFLINE State" as OfflineState {
        [*] --> WaitingTimeout
        WaitingTimeout --> ON_TIMEOUT : Timeout detection
    }
    state "ONLINE State" as OnlineState {
        [*] --> ONLINE
        ONLINE --> ON_REFRESH : Refresh timer
    }
```

| State | Description | Trigger Condition |
|-------|-------------|-------------------|
| **ONLINE** | Device is online | announce/register message received |
| **OFFLINE** | Device is offline | No heartbeat received for over 30s |
| **DELETED** | Deleted | Manually removed by management |
| **UPDATING** | Information updating | Key field change such as IP address |

### Multi-Protocol Unified Management

Regardless of whether devices connect via UDP multicast or MQTT, they are all normalized and stored in the registry by SN.

```mermaid
flowchart TB
    A[Device comes online] --> B{Network Type}
    B -->|Ethernet/WiFi/HaLow| C[Multicast Discovery]
    B -->|CAT1 Cellular| D[MQTT Discovery]
    C --> E[Parse ct-announce]
    D --> F[Parse ct-register]
    E --> G[Registry stores by SN]
    F --> G
    G --> H[Unified Device Model]
    H --> I[Event Push]
    H --> J[gRPC Query]
    H --> K[Web Management UI]

    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style G fill:#e8f5e9
```

## gRPC API

Service name `aipc.discovery.DiscoveryService`, listening on `unix:///run/aipc/device-discovery.sock`.

### ListDevices {#listdevices}

Query the list of discovered devices, with support for filtering by product model and status.

```protobuf
rpc ListDevices(ListDevicesRequest) returns (ListDevicesResponse)
```

| Field | Type | Description |
|-------|------|-------------|
| `product` | string | **Request**: Filter by product model, empty string for no filter |
| `status` | DeviceStatus | **Request**: Filter by device status |
| `devices` | DiscoveredDevice[] | **Response**: Device list |

### GetDevice {#getdevice}

Query a single device's details by serial number. Returns a `DiscoveredDevice` object containing the device's full information (SN, product model, IP, MAC, firmware version, capabilities, network type, and current status).

| Field | Type | Description |
|-------|------|-------------|
| `serial_number` | string | Device serial number |

### TriggerScan {#triggerscan}

Actively trigger a multicast probe to discover newly connected devices on the network.

```protobuf
rpc TriggerScan(TriggerScanRequest) returns (TriggerScanResponse)
```

| Field | Type | Description |
|-------|------|-------------|
| `timeout_seconds` | int32 | Request: scan timeout duration |
| `found_count` | int32 | Response: number of devices found |
| `new_devices` | DiscoveredDevice[] | Response: list of newly discovered devices |

```mermaid
flowchart TD
    A[User triggers scan] --> B[gRPC TriggerScan]
    B --> C[Send multicast Probe]
    C --> D[Wait for device response]
    D --> E{Response collection}
    E -->|Timeout| F[Return results]
    E -->|Response received| G[Process new devices]
    G --> H[Update registry] --> I[Trigger ONLINE event] --> F
    F --> J[Return scan results] --> K[Web UI update]
    style C fill:#e3f2fd
    style G fill:#e8f5e9
```

### WatchDevices {#watchdevices}

Subscribe to device event stream (server streaming) for real-time online/offline and state change events. No request parameters are required — calling this RPC opens a persistent stream that pushes events for all discovered devices.

| Field | Type | Description |
|-------|------|-------------|
| `type` | EventType | `ONLINE` / `OFFLINE` / `UPDATED` |
| `device` | DiscoveredDevice | Device information |

### SendCommand {#sendcommand}

Send a management command to a specified device via the MQTT channel and wait for a response.

| Field | Type | Description |
|-------|------|-------------|
| `serial_number` | string | Target device serial number |
| `action` | string | Command action |
| `params` | string | Command parameters (JSON) |
| `timeout_seconds` | int32 | Response wait timeout duration |

## Transport Parameters

| Transport | Multicast Address/Topic | Port | Interval | QoS | Max Packet |
|-----------|------------------------|------|----------|-----|------------|
| **UDP Multicast** | `239.255.255.250` | `19850` | `5000ms` | - | `512 bytes` |
| **MQTT Register** | `ct/disc/register` | - | `30000ms` | `0` | - |
| **MQTT Command** | `ct/cmd/{sn}` | - | - | `1` | - |
| **MQTT Response** | `ct/resp/{sn}` | - | - | `1` | - |

### JSON Payload Format

Both transport modes use a similar JSON structure. Field descriptions are as follows:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `ct-announce` (multicast) or `ct-register` (MQTT) |
| `product` | string | Product model, e.g. `NE503`, `NE101` |
| `sn` | string | Device serial number |
| `mac` / `ip` / `fw` / `port` | - | MAC address, IP, firmware version, HTTP port |
| `hw` | string | Hardware platform, e.g. `Hailo-15`, `ESP32-S3` |
| `caps` | string[] | Capability list: `camera`, `mqtt`, `http`, `cellular` |
| `net` | string | MQTT only: network type, e.g. `cat1` |

**ct-announce example** (multicast announcement)

```json
{ "type": "ct-announce", "product": "NE503", "sn": "CT503-2026-00001",
  "mac": "AA:BB:CC:DD:EE:FF", "ip": "192.168.1.50", "fw": "v1.0.0",
  "port": 80, "hw": "Hailo-15", "caps": ["camera", "mqtt", "http"] }
```

**ct-register example** (MQTT registration)

```json
{ "type": "ct-register", "product": "NE101", "sn": "CT101-2026-00001",
  "mac": "AA:BB:CC:DD:EE:FF", "ip": "10.0.1.50", "fw": "v1.0.0",
  "port": 80, "hw": "ESP32-S3", "caps": ["camera", "mqtt", "http", "cellular"], "net": "cat1" }
```

## Management Commands

Standard management commands dispatched via the `SendCommand` API or MQTT command topics.

| action | Description | params Example | Applicable Devices |
|--------|-------------|----------------|-------------------|
| `reboot` | Reboot device | `{}` | All |
| `get_info` | Get device detailed information | `{}` | All |
| `set_config` | Push configuration | `{"key": "value"}` | All |
| `ota_upgrade` | OTA firmware upgrade | `{"url": "..."}` | NE101, NE503 |
| `capture` | Trigger photo capture | `{}` | NE101 |
| `set_network` | Modify network configuration | `{"mode": "static"}` | NE503 |

**Command message** (`ct/cmd/{sn}`): `{"id": "cmd-001", "action": "reboot", "params": {}, "timestamp": 1716163200}`

**Command response** (`ct/resp/{sn}`): `{"id": "cmd-001", "result": "ok", "data": {}, "timestamp": 1716163201}`

## Network Topology

```mermaid
graph TB
    subgraph "LAN Environment"
        subgraph "Same Subnet Devices"
            NE301["NE301<br/>STM32N6570"]
            NE503["NE503<br/>Hailo-15"]
            NE101["NE101<br/>ESP32-S3"]
        end
        MC["239.255.255.250:19850<br/>UDP Multicast"]
    end

    subgraph "WAN Environment"
        NE101_CAT1["NE101 CAT1<br/>Cellular Network"]
        MQTT["CamThink MQTT Broker"]
    end

    subgraph "Management"
        DS["device-discovery<br/>Go Service"]
        PA["platform-api"]
        WEB["Web Console"]
    end

    NE301 -->|ct-announce| MC
    NE503 -->|ct-announce| MC
    NE101 -->|ct-announce| MC
    NE101_CAT1 -->|ct-register| MQTT
    MC -->|Listen| DS
    MQTT -->|Subscribe| DS
    DS -->|gRPC| PA
    PA -->|REST| WEB

    style MC fill:#e3f2fd
    style MQTT fill:#f3e5f5
    style DS fill:#e8f5e9
```

## Configuration

Configuration file: `configs/platform/discovery.yaml`

```yaml
service:
  name: device-discovery
  listen: unix:///run/aipc/device-discovery.sock
  log_level: info

discovery:
  multicast_addr: 239.255.255.250
  multicast_port: 19850
  announce_interval: 5
  timeout: 30
  interface: ""  # Bind to network interface, empty for auto-select
```

## Related Documentation

- [AI Runtime](./0-ai-runtime.md) — AI inference runtime service
- [Event Bus](./2-event-bus.md) — Event bus service
- [Quick Start](../1-quick-start.md) — NE503 quick start guide
