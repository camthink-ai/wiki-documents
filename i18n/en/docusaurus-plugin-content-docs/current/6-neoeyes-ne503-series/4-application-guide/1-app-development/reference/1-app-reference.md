---
description: NE503 container application development reference, covering the complete app.yaml field definitions, Dockerfile patterns, permission model, and multi-container configuration.
keywords: [NE503, application development, app.yaml, Dockerfile, container, permission model]
tags: [application development, NE503, reference, container]
---

# App Reference

This document is the complete configuration reference for NE503 container applications, covering all `app.yaml` field definitions, Dockerfile authoring patterns, security sandbox model, and multi-container architecture. For a step-by-step tutorial for beginners, please refer to [SDK Examples](./3-sdk-examples.md).

## 1. Application Overview

Applications on the NE503 platform run as OCI containers, with their lifecycle managed by the App Manager. Each application declares its image, resource requirements, and permissions through an `app.yaml` manifest file.

**Core Concepts:**

- **Single-Container Mode** -- Most applications only need one container. Simply specify the image in `spec.image`.
- **Multi-Container Mode** -- Complex applications can be split into main + sub containers for process-level isolation. Only the main container has platform service access.
- **Principle of Least Privilege** -- All permissions (video streams, inference, device control, etc.) must be explicitly declared. Undeclared permissions are not available.

**Project File Structure:**

```
my-app/
├── app.yaml          # Application manifest (required)
├── Dockerfile        # Build definition (required)
├── app.py            # Entry point
├── requirements.txt  # Python dependencies (optional)
└── config/           # Configuration files (optional)
```

## 2. app.yaml Complete Reference

The application manifest is the core configuration file of the AIPC platform. This section explains all fields level by level.

### 2.1 Minimal Configuration

```yaml
apiVersion: v1
kind: Application
metadata:
  id: my_app
  name: My Application
  version: 1.0.0
spec:
  image: aipc/my_app:1.0.0
```

### 2.2 Complete Single-Container Configuration

The following example includes all available fields, grouped and explained by level:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: my_app                          # Required - unique identifier
  name: My Application                # Required - display name
  version: 1.0.0                      # Required - semantic version
  description: Application description # Optional - application description
  author: Developer                   # Optional - author
  email: dev@example.com              # Optional - contact email

spec:
  image: aipc/my_app:1.0.0            # Required - container image (docker.io/ prefix is automatically added when no registry prefix is specified)

  # ── Resource Limits ──────────────────────────────
  resources:
    cpu: "50%"                         # CPU limit, supports percentage ("50%") or core count ("1.5")
    memory: "256Mi"                    # Memory limit, supports Mi/Gi suffix ("512Mi", "1Gi")

  # ── Permission Declarations ──────────────────────
  permissions:
    video:                             # Video stream access
      - sub.raw                        #   Raw video stream (sub publishes NV12 frames, DMA-BUF zero-copy, used for inference)
      - main                           #   Encoded video stream (H264, for RTSP pull, cannot subscribe for inference)
    inference:                         # AI inference
      models: [hailo_yolov8n_384_640]  #   Allowed model list (must match models loaded on the device)
      max_qps: 30                      #   Maximum inference requests per second
      max_concurrent: 2                #   Maximum concurrent inferences
      allow_register_model: false      #   Whether to allow dynamic registration of new models
    events:                            # Event bus
      publish: [app/my_app/*]          #   Publishable topics (supports * wildcard)
      subscribe: [model/*/detections, system/*]  # Subscribable topics
    device:                            # Device control
      light: true                      #   Fill light
      ir_cut: true                     #   IR-CUT filter
      ptz: false                       #   PTZ control
      lens: false                      #   Lens zoom/focus
      gpio:
        read: [12, 13]                 #   Readable GPIO pin numbers
        write: [21, 22]                #   Writable GPIO pin numbers
    network:                           # Network access
      mode: isolated                   #   Network mode: isolated (default) or host
      outbound:                        #   Outbound whitelist (only effective in isolated mode)
        - "https://api.example.com"
        - "mqtt://broker.example.com:8883"
      inbound:                         #   Inbound ports (only effective in host mode)
        - 8554

  # ── Environment Variables ────────────────────────
  env:
    - name: LOG_LEVEL
      value: INFO
    - name: CUSTOM_CONFIG
      value: "production"

  # ── Volume Mounts ────────────────────────────────
  volumes:
    - host: /opt/aipc/data/my_app      # Host path (automatically adapts to deployment prefix)
      container: /app/data             # Container path
      readonly: false                  # Whether read-only mount

  # ── Security Sandbox ────────────────────────────
  security:
    no_new_privileges: true            # Disable privilege escalation (default: true)
    readonly_rootfs: true              # Read-only root filesystem (default: true)

  # ── Startup Policy ──────────────────────────────
  autostart: true                      # Auto-start on boot (default: false)
  restart_policy: on-failure           # Basic restart policy: always | on-failure | no
  restart_max_retries: 3               # Maximum restart attempts for basic restart

  # ── Health Check ────────────────────────────────
  healthcheck:
    enabled: true
    type: command                      # Check type: command | http | tcp
    command: "/app/main --health"      # command type: command to execute
    path: /healthz                     # http type: check path
    port: 8080                         # http/tcp type: port number
    interval: 30s                      # Check interval
    timeout_seconds: 5                 # Timeout in seconds
    retries: 3                         # Consecutive failure threshold

  # ── Auto Restart (Enhanced, with exponential backoff) ──
  auto_restart:
    enabled: true                      # Enable auto restart
    max_retries: 3                     # Maximum restart attempts (0 = unlimited)
    retry_delay_seconds: 10            # Initial retry delay in seconds
    backoff_multiplier: 2.0            # Backoff multiplier (each failure delay x this value, capped at 5 minutes)
    health_check_interval_seconds: 30  # Health check polling interval in seconds

  # ── Plugin System ───────────────────────────────
  plugin:
    capabilities:
      - id: rtsp-server                # Capability unique identifier
        version: "1.0"                 # Capability version
        transport: both                # Communication mode: grpc | event | both
        description: RTSP streaming service
        proto: "rtsp.RtspService"      # gRPC service definition (required for grpc/both)
        topics:                        # Event topics (required for event/both)
          publish:
            - "plugin/rtsp/stream-status"
          subscribe:
            - "system/video-config-changed"

  plugin_dependencies:                 # Declare dependencies on other plugin capabilities
    - capability: rtsp-server          # Capability identifier
      min_version: "1.0"               # Minimum version requirement
      required: true                   # Whether this is a hard dependency
```

### 2.3 Top-Level Fields

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `apiVersion` | string | Yes | API version, currently fixed as `v1` |
| `kind` | string | Yes | Resource type: `Application`, `ModelService`, `BusinessService` |
| `metadata` | object | Yes | Application metadata, see [2.4 metadata Field](#24-metadata-field) |
| `spec` | object | Yes | Application spec, see [2.5 spec Field](#25-spec-field) |

### 2.4 metadata Field

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `id` | string | Yes | Unique identifier, lowercase letters/digits/underscores, immutable after creation |
| `name` | string | Yes | Application display name |
| `version` | string | Yes | Semantic version number (major.minor.patch) |
| `description` | string | No | Application description |
| `author` | string | No | Author name |
| `email` | string | No | Contact email |

### 2.5 spec Field

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `image` | string | Required for single-container | Container image reference, registry prefix is automatically completed |
| `resources` | object | No | Resource limits (`cpu`, `memory`) |
| `permissions` | object | No | Permission declarations, see [2.6 permissions Field](#26-permissions-field) |
| `env` | array | No | Environment variable list, each item contains `name` and `value` |
| `volumes` | array | No | Volume mount list, see description below |
| `security` | object | No | Security sandbox configuration, see [4 Permission Model](#4-permission-model) |
| `autostart` | bool | No | Auto-start on boot, default `false` |
| `restart_policy` | string | No | Basic restart policy: `always`, `on-failure`, `no` (default) |
| `restart_max_retries` | int | No | Maximum restart attempts for basic restart |
| `healthcheck` | object | No | Health check configuration |
| `auto_restart` | object | No | Enhanced auto restart configuration (with exponential backoff, takes priority over `restart_policy`) |
| `plugin` | object | No | Plugin capability declaration |
| `plugin_dependencies` | array | No | Plugin dependency declaration |
| `containers` | map | No | Multi-container mode, see [5 Multi-Container Configuration](#5-multi-container-configuration) |
| `networking` | object | No | Multi-container network configuration |
| `lifecycle` | object | No | Multi-container lifecycle configuration |

### 2.6 permissions Field

**video** -- Video stream access list:

| Value | Description |
|:---|:---|
| `sub.raw` | Raw video stream (the sub stream publishes NV12 frames, DMA-BUF shared-memory zero-copy, **used for inference subscription**) |
| `main` | Encoded video stream (H264, for RTSP pull, cannot be used for inference subscription) |

When declaring a `.raw` stream, the platform automatically mounts the `/dev/dma_heap` device (in multi-container mode, the main container additionally shares the host IPC namespace) to support DMA-BUF zero-copy memory mapping. `main` only publishes encoded H264; `subscribe(stream="main")` hangs forever — inference must use `sub`.

**inference** -- AI inference permissions:

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `models` | string[] | -- | Allowed model ID list (required, automatically registered with AI Runtime at startup) |
| `max_qps` | int | 0 | Maximum inference requests per second |
| `max_concurrent` | int | 0 | Maximum concurrent inferences |
| `allow_register_model` | bool | false | Whether to allow dynamic registration of new models at runtime |

**events** -- Event bus permissions:

| Field | Type | Description |
|:---|:---|:---|
| `publish` | string[] | Publishable topic patterns, supports `*` wildcard (e.g., `app/my_app/*`) |
| `subscribe` | string[] | Subscribable topic patterns, supports `*` wildcard (e.g., `model/*/detections`) |

**device** -- Device control permissions:

| Field | Type | Description |
|:---|:---|:---|
| `light` | bool | Fill light control |
| `ir_cut` | bool | IR-CUT filter control |
| `ptz` | bool | PTZ control |
| `lens` | bool | Lens zoom/focus control |
| `gpio.read` | int[] | List of readable GPIO pin numbers |
| `gpio.write` | int[] | List of writable GPIO pin numbers |

**network** -- Network access permissions:

| Field | Type | Description |
|:---|:---|:---|
| `mode` | string | `isolated` (default, independent network namespace) or `host` (shared host network) |
| `outbound` | string[] | Outbound whitelist, only effective in `isolated` mode |
| `inbound` | int[] | Inbound port list, only effective in `host` mode |

### 2.7 volumes Field

Each volume mount item contains:

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | Yes | Host path (`/opt/aipc` prefix is automatically adapted to the actual deployment path) |
| `container` | string | Yes | Mount path inside the container |
| `readonly` | bool | No | Whether to mount as read-only, default `false` |

The platform automatically mounts the `/run/aipc` directory, enabling the container to access all IPC Sockets (`ai-runtime.sock`, `event-bus.sock`, etc.). No manual declaration is needed.

### 2.8 healthcheck Field

| Field | Type | Description |
|:---|:---|:---|
| `enabled` | bool | Whether to enable health checks |
| `type` | string | Check type: `command` (execute command), `http` (HTTP request), `tcp` (TCP connection) |
| `command` | string | Command to execute when `type=command` |
| `path` | string | Request path when `type=http` |
| `port` | int | Port number when `type=http` or `type=tcp` |
| `interval` | string | Check interval (e.g., `30s`) |
| `timeout_seconds` | int | Single check timeout in seconds |
| `retries` | int | Number of consecutive failures before marking as unhealthy |

### 2.9 auto_restart Field

Enhanced auto restart policy with exponential backoff support. When `auto_restart.enabled` is `true`, it takes priority over `restart_policy`.

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `enabled` | bool | false | Whether to enable auto restart |
| `max_retries` | int | 0 | Maximum restart attempts (0 means unlimited retries) |
| `retry_delay_seconds` | int | 5 | Initial retry delay in seconds |
| `backoff_multiplier` | float | 1.5 | Backoff multiplier, each failure delay is multiplied by this value, capped at 5 minutes |
| `health_check_interval_seconds` | int | 30 | Background health check polling interval in seconds |

**Backoff Calculation Example** (`retry_delay_seconds: 10`, `backoff_multiplier: 2.0`):

- 1st restart: 10 seconds delay
- 2nd restart: 20 seconds delay
- 3rd restart: 40 seconds delay
- ...capped at 300 seconds (5 minutes)

### 2.10 plugin Field

Declares the plugin capabilities provided by the application for other applications to discover and depend on.

**capabilities item:**

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `id` | string | Yes | Capability unique identifier |
| `version` | string | Yes | Capability semantic version |
| `transport` | string | Yes | Communication mode: `grpc`, `event`, `both` |
| `description` | string | No | Capability description |
| `proto` | string | Required for grpc/both | gRPC service definition (e.g., `"rtsp.RtspService"`) |
| `topics` | object | Required for event/both | Contains `publish` and `subscribe` topic lists |

The plugin runtime Socket path is `/run/aipc/plugins/<app_id>.sock`.

**plugin_dependencies item:**

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `capability` | string | Yes | Dependent capability ID |
| `min_version` | string | No | Minimum version requirement |
| `required` | bool | No | Whether this is a hard dependency (when true, the application cannot start if the dependency is not met) |

### 2.11 Validation Rules

The App Manager performs the following validations during installation:

1. `apiVersion` must be `v1`
2. `kind` must be `Application`, `ModelService`, or `BusinessService`
3. `metadata.id`, `metadata.name`, `metadata.version` are required
4. In single-container mode, `spec.image` is required; in multi-container mode, each container's `image` is required
5. `network.mode` only allows `isolated` or `host`; `inbound` is only available in `host` mode
6. In multi-container mode, there must be exactly one container with `role: main`, and sub containers cannot declare any permissions
7. Plugin capability event topics must have corresponding publish/subscribe permissions in `permissions.events`

## 3. Dockerfile Patterns

### 3.1 Python -- Base Image (Recommended)

The SDK is pre-installed in the base image, no additional installation steps required:

```dockerfile
FROM aipc/python-base:1.0
WORKDIR /app
COPY . /app/
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
CMD ["python", "app.py"]
```

### 3.2 Python -- Wheel File (Offline Environment)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY hailo_ipc_sdk-*.whl /tmp/
RUN pip install --no-cache-dir /tmp/hailo_ipc_sdk-*.whl && rm /tmp/*.whl
COPY . /app/
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
CMD ["python", "app.py"]
```

### 3.3 Go -- Multi-Stage Build

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/main

FROM alpine:3.18
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /app/main /app/main
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/sh -D appuser
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD /app/main --health-check
ENTRYPOINT ["/app/main"]
```

### 3.4 Best Practices

- **Non-root execution** -- Create a dedicated user (UID 1000) and switch using the `USER` directive. The platform automatically injects the AIPC group GID (1001) for Socket access; no manual configuration needed.
- **Image slimming** -- Use multi-stage builds, `--no-cache-dir`, and clean up temporary files to reduce image size.
- **Read-only filesystem compatibility** -- Avoid writing to system directories such as `/etc` and `/var`. Data should be written to `volumes` mount paths.
- **Proxy builds** -- Use `--build-arg HTTP_PROXY=...` when cross-compiling on x86 development machines.
- **Cross-architecture** -- Use `docker buildx build --platform linux/arm64` to build ARM images.

## 4. Permission Model

NE503 employs a multi-layer security sandbox. All security policies are enforced by the platform; developers do not need to configure them in the Dockerfile.

### 4.1 Linux Capabilities

The following dangerous capabilities are automatically dropped when a container starts:

| Dropped Capability | Risk |
|:---|:---|
| `CAP_SYS_ADMIN` | Superuser privileges |
| `CAP_NET_ADMIN` | Network configuration modification |
| `CAP_SYS_MODULE` | Kernel module loading |
| `CAP_SYS_TIME` | System clock modification |
| `CAP_SYS_BOOT` | System reboot |
| `CAP_SYS_NICE` | Process priority modification |
| `CAP_SYS_RESOURCE` | Bypass resource limits |
| `CAP_SYS_RAWIO` | Direct I/O port access |
| `CAP_SYS_PTRACE` | Process tracing |
| `CAP_SYS_CHROOT` | Root directory modification |
| `CAP_MKNOD` | Device file creation |

### 4.2 Seccomp System Call Filtering

The App Manager loads a Seccomp configuration file when starting a container. The default policy uses a whitelist mode (`defaultAction: SCMP_ACT_ERRNO`), allowing only common system calls. The configuration file path is set by the platform administrator; developers do not need to be concerned with it.

### 4.3 Filesystem and Namespace Isolation

| Security Mechanism | Default | Overridable via app.yaml |
|:---|:---|:---|
| `no_new_privileges` | true | `security.no_new_privileges: false` |
| `readonly_rootfs` | true | `security.readonly_rootfs: false` |
| PID namespace isolation | Independent | Not overridable |
| Mount namespace isolation | Independent | Not overridable |
| UTS namespace isolation | Independent | Shared in `host` network mode |
| Network namespace isolation | Independent | Shared when `permissions.network.mode: host` |
| IPC namespace isolation | Independent | Shared with host IPC when a multi-container main container declares a video stream (required for DMA-BUF mmap) |
| PIDs limit | 128 | Not overridable |

### 4.4 Network Isolation

- **Isolated mode** (default): The container has an independent network namespace and can only access external addresses through the `outbound` whitelist.
- **Host mode**: The container shares the host network stack and can declare ports to listen on via `inbound`. Suitable for scenarios that require exposing services externally, such as RTSP streaming.

### 4.5 Socket Access Mechanism

The platform mounts the `/run/aipc` directory into all containers. This directory contains all IPC Sockets. Containers gain access through the AIPC group GID (1001). This mechanism is automatically injected by the platform; developers do not need to add user group configurations in the Dockerfile.

## 5. Multi-Container Configuration

When an application requires process-level isolation, multi-container mode can be used. For example, splitting the inference engine and business logic into separate containers enables independent updates and resource limits.

### 5.1 Architecture Model

| Role | Platform Service Access | permissions | Typical Use |
|:---|:---|:---|:---|
| **main** | Has access to AI Runtime, Event Bus, and other platform Sockets | Can be declared | Business logic, platform interaction |
| **sub** | None, fully isolated | Cannot be declared | Independent algorithm processes, third-party services |

Constraints:
- There must be exactly one container with `role: main`
- Sub containers cannot declare any permissions
- Containers communicate with each other through shared network namespace

### 5.2 Complete Example

```yaml
apiVersion: v1
kind: Application
metadata:
  id: smart_detection
  name: Smart Detection
  version: 1.0.0
spec:
  containers:
    main:
      image: smart-detection-main:1.0
      role: main                          # Must be declared
      permissions:
        video: [sub.raw]
        inference:
          models: [hailo_yolov8n_384_640]
      resources:
        cpu: "100%"
        memory: "512Mi"
      ports:
        - containerPort: 8080
          protocol: TCP
          name: http                      # Service discovery name
      env:
        - name: SUB_DETECTOR_ADDR
          value: "detector:50051"
      volumes:
        - name: shared-data               # Container-level volume mount
          container: /app/shared
          readonly: false
      security:
        readonly_rootfs: false

    detector:
      image: smart-detection-detector:1.0
      role: sub                           # Sub container, cannot declare permissions
      resources:
        cpu: "50%"
        memory: "256Mi"
      ports:
        - containerPort: 50051
          protocol: TCP
      command: ["/app/detector"]          # Override ENTRYPOINT
      args: ["--workers=4"]               # Append arguments

  networking:
    mode: internal                        # internal (default) | bridge | host
    ingress:
      - port: 8080                        # External port
        target: main:8080                 # Target container:port
        protocol: HTTP                    # HTTP | TCP | UDP

  lifecycle:
    startup_order: [detector, main]       # Start sub first
    shutdown_order: [main, detector]      # Stop main first

  volumes:                                # Application-level shared volumes (visible to all containers)
    - host: /opt/aipc/data/smart_detection
      container: /app/data
```

### 5.3 ContainerSpec Field

Each container (entries under `containers`) supports the following fields:

| Field | Type | Description |
|:---|:---|:---|
| `image` | string | Container image |
| `role` | string | `main` or `sub` |
| `permissions` | object | Permission declarations (only main container can declare) |
| `resources` | object | Resource limits (`cpu`, `memory`) |
| `env` | array | Environment variable list |
| `ports` | array | Port declaration list, each item contains `containerPort`, `protocol`, `name` |
| `command` | string[] | Override image ENTRYPOINT |
| `args` | string[] | Append arguments |
| `healthcheck` | object | Container-level health check |
| `volumes` | array | Container-level volume mounts, each item contains `name`, `container`, `readonly` |
| `security` | object | Container-level security configuration (inherits application-level `spec.security` when not set) |

### 5.4 Network Modes

| Mode | Description | Use Case |
|:---|:---|:---|
| `internal` | Containers share network namespace, not externally accessible (default) | Internal microservice communication |
| `bridge` | Connect to LAN via `aipc-br0` bridge | Services requiring LAN discovery |
| `host` | Share host network stack | Services that need to expose ports externally |

### 5.5 Startup and Shutdown Order

- `startup_order` -- Specifies the container startup order. When not specified, all sub containers are started first, then the main container.
- `shutdown_order` -- Specifies the container stop order. When not specified, it defaults to the reverse of the startup order (stop main first, then sub).

### 5.6 Auto-Injected Environment Variables

In multi-container mode, the platform automatically injects the following environment variables for each container:

| Variable | Description |
|:---|:---|
| `APP_ID` | Application ID (from `metadata.id`) |
| `APP_ROLE` | Container role (`main` or `sub`) |
| `CONTAINER_NAME` | Container name (key name in `containers`) |
| `AIPC_HOST_PREFIX` | Platform deployment path prefix (e.g., `/data/aipc`) |

## 6. Lifecycle Management

The complete lifecycle from installation to uninstallation is managed by the App Manager:

| Phase | CLI Command | Description |
|:---|:---|:---|
| **install** | `aipc-cli app install <yaml> <tar>` | Import image, validate manifest, register to application repository |
| **start** | `aipc-cli app start <id>` | Preload models, create container, start running |
| **stop** | `aipc-cli app stop <id>` | Gracefully stop container (default timeout 10 seconds) |
| **uninstall** | `aipc-cli app remove <id>` | Stop container, delete image and instance data, unregister |
| **update** | Stop + uninstall old version, then install + start new version | Hot update is not currently supported; manual replacement required |

**Installation Methods:**

- **Local image file** -- Pass a `.tar` or `.tar.gz` file, which is directly imported into containerd.
- **Remote image registry** -- Pass an image reference (e.g., `docker.io/my/app:1.0`), which is automatically pulled and normalized to a full reference.

**Fault Recovery:**

- At startup, overlayfs snapshot corruption is detected (common after power loss), and the image is automatically re-unpacked from the content store.
- At installation, the image tar backup is saved for rebuilding after power loss recovery.

## 7. Environment Variable Reference

Container environment variables automatically injected by the platform:

| Variable | Source | Description |
|:---|:---|:---|
| `APP_ID` | `metadata.id` | Application unique identifier |
| `APP_ROLE` | `containerSpec.role` | Container role (multi-container mode only) |
| `CONTAINER_NAME` | containers key name | Container name (multi-container mode only) |
| `AIPC_HOST_PREFIX` | Platform configuration | Deployment path prefix, used for path conversion |
| `<Custom>` | `spec.env` | Variables declared by the user in app.yaml |

Connection configuration variables automatically read by the SDK (usually no modification needed; the platform provides them through Socket mounting):

| Variable | Default | Description |
|:---|:---|:---|
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` | AI Runtime gRPC endpoint |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` | Event Bus gRPC endpoint |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` | Device control gRPC endpoint |
| `CAMERA_CONTROL_ENDPOINT` | `unix:///run/aipc/camera-control.sock` | Camera control gRPC endpoint |
| `SHM_BASE_PATH` | `/run/aipc/shm` | Shared memory base path |
| `LOG_LEVEL` | `INFO` | Log level |
| `DEBUG` | `0` | Debug mode switch |

## 8. Related Documentation

- [SDK Reference](./2-sdk-reference.md) -- SDK API signatures and data types
- [SDK Examples](./3-sdk-examples.md) -- Complete application examples and development tutorial
- [Platform Architecture](../../../3-software-guide/0-system-architecture.md) -- System design and data flow
- [Platform Services Overview](../../../3-software-guide/4-reference/0-platform-services.md) -- App Manager and other service responsibilities with source pointers
