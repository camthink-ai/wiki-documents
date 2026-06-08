---
description: NE503 全部 YAML 配置文件速查参考，涵盖 platform-api、app-manager、event-bus、device-control、camera-daemon、discovery、ai-runtime 七大服务的完整配置参数与默认值，支持快速定位和修改配置项。
keywords: [NE503配置, YAML参考, platform-api, app-manager, event-bus, camera-daemon, ai-runtime, device-control, 配置文件]
tags: [配置参考, NE503, YAML, 平台贡献者, 系统运维]
---

# Configuration File Reference

## 1 概述

NE503 平台所有服务均采用 YAML 格式配置文件，部署路径为 `/opt/aipc/etc/`。本文档列出所有服务的完整配置参数及默认值，供系统配置和故障排查参考。

## 2 配置文件清单

| 文件 | 服务 | 说明 |
|------|------|------|
| `configs/platform-api.yaml` | platform-api | Web API 网关 |
| `configs/platform/app-manager.yaml` | app-manager | 容器管理 |
| `configs/platform/event-bus.yaml` | event-bus | 消息总线 |
| `configs/platform/device-control.yaml` | device-control | 设备控制 |
| `configs/platform/camera-daemon.yaml` | camera-daemon | 媒体管线 |
| `configs/platform/discovery.yaml` | device-discovery | 设备发现 |
| `configs/ai/ai-runtime.yaml` | ai-runtime | AI 推理 |
| `configs/preload.yaml` | pack-factory | 工厂预装（预装模型与应用） |

## 3 platform-api.yaml

```yaml
service:
  name: platform-api
  http_addr: ":8080"            # HTTP 监听地址
  log_level: debug              # 日志级别
  log_file: "/var/log/aipc/platform-api.log"

services:
  ai_runtime: "unix:///run/aipc/ai-runtime.sock"
  event_bus: "unix:///run/aipc/event-bus.sock"
  device_control: "unix:///run/aipc/device-control.sock"
  app_manager: "unix:///run/aipc/app-manager.sock"
  camera_control: "unix:///run/aipc/camera-control.sock"

```

> **注意**：`camera-control.sock` 用于设备控制通信，与 AI Runtime 中 FdReceiver 引用的 `camera.sock`（用于视频帧传输）是不同的 Socket。

```yaml

model:
  storage_path: "/opt/aipc/models"

storage:
  root_path: "/opt/aipc"
  model_blob_path: "/opt/aipc/models/blobs"
  min_free_bytes: 104857600     # 最小可用空间 100MB

stream:
  camera_config: "/opt/aipc/etc/camera-daemon.yaml"
  rtsp_base_url: "rtsp://localhost:8554"
  encoded_pub_dir: "/run/aipc/encoded"

web:
  static_path: "/opt/aipc/web"
  enable_cors: true

auth:
  enabled: true
  token_key: "aipc-secure-token-secret"
  username: "admin"
  password: "password"

database:
  path: "/opt/aipc/data/platform.db"
```

## 4 app-manager.yaml

```yaml
service:
  name: app-manager
  listen: "unix:///run/aipc/app-manager.sock"
  http_port: 8081
  log_level: info
  log_file: "/var/log/aipc/app-manager.log"

containerd:
  address: "/run/containerd/containerd.sock"
  namespace: aipc
  runtime: io.containerd.runc.v2
  snapshotter: overlayfs

  registry:
    default: registry.aipc.local
    mirrors:
      - https://docker.io

apps:
  registry_path: "/opt/aipc/apps/registry"
  instances_path: "/opt/aipc/apps/instances"
  manifests_path: "/etc/aipc/apps"
  images_path: "/var/lib/containerd/images"
  logs_path: "/opt/aipc/logs/apps"
  log_retention_days: 7

security:
  seccomp_profile: "/etc/aipc/seccomp-default.json"
  readonly_rootfs: true
  no_new_privileges: true
  capabilities_drop:
    - CAP_SYS_ADMIN
    - CAP_NET_ADMIN
    - CAP_SYS_MODULE
    - CAP_SYS_TIME
    - CAP_SYS_BOOT
    - CAP_SYS_NICE
    - CAP_SYS_RESOURCE
    - CAP_SYS_RAWIO
    - CAP_SYS_PTRACE
  namespaces:
    - pid
    - net
    - ipc
    - uts
    - mount

resources:
  default_cpu_quota: 50         # 单核百分比
  default_memory_mb: 256
  default_pids_limit: 128
  max_total_cpu_cores: 2
  max_total_memory_gb: 2

healthcheck:
  enabled: true
  interval_sec: 30
  timeout_sec: 5
  auto_restart: true
  max_restart_count: 5
  restart_backoff_sec: 10

network:
  mode: none                    # none | bridge | host
  bridge_name: aipc-br0
  dns_servers:
    - 8.8.8.8
    - 8.8.4.4

ai_runtime:
  enabled: true
  endpoint: "unix:///run/aipc/ai-runtime.sock"
  auto_register_permissions: true

event_bus:
  enabled: true
  endpoint: "unix:///run/aipc/event-bus.sock"
  publish_events:
    - app.installed
    - app.started
    - app.stopped
    - app.crashed
    - app.updated

monitoring:
  enabled: true
  metrics_port: 9092
  stats_interval_sec: 10
  monitor_cpu: true
  monitor_memory: true
  monitor_network: true
  alert_cpu_percent: 90
  alert_memory_percent: 90
```

## 5 event-bus.yaml

```yaml
service:
  name: event-bus
  listen: "unix:///run/aipc/event-bus.sock"
  tcp_listen: "127.0.0.1:50053"  # 供 C++ 客户端使用
  log_level: info
  log_file: "/var/log/aipc/event-bus.log"

bus:
  queue_size: 1000              # 每个订阅者的队列大小
  max_topics: 1000
  workers: 4
  batch_size: 10
  inactive_topic_ttl: 3600      # 非活跃主题过期时间（秒）
  persist_enabled: false        # 是否启用消息持久化
  persist_path: "/opt/aipc/data/event-bus"

routing:
  priorities:
    "system/": 10               # 最高优先级
    "alert/": 8
    "model/": 5
    "app/": 5
  rate_limits:
    "model/*": 1000              # 消息数/秒
    "app/*": 100

monitoring:
  stats_enabled: true
  stats_interval_sec: 10
  metrics_port: 9091

security:
  auth_enabled: false           # 是否启用认证
  acl_enabled: true
  acl_file: "/opt/aipc/etc/security/event-acl.yaml"
```

## 6 device-control.yaml

```yaml
service:
  name: device-control
  listen: "unix:///run/aipc/device-control.sock"
  log_level: info
  log_file: "/var/log/aipc/device-control.log"

camera_daemon:
  lens_endpoint: "/run/aipc/camera-control.sock"

mcu:
  protocol: uart
  device: "/dev/ttyS0"
  baudrate: 921600
  data_bits: 8
  parity: none
  stop_bits: 1
  timeout_ms: 1000
  max_retries: 3
  heartbeat_enabled: true
  heartbeat_interval_sec: 30

capabilities:
  light:
    white_light: true
    ir_led: true
    ir_cut: true
  ptz:
    enabled: true
    pan_range: [-180, 180]      # 角度
    tilt_range: [-45, 45]
    max_speed: 100
    presets: 16
  lens:
    zoom: true
    focus: true
    autofocus: true
    iris: true
    zoom_range: [1.0, 2.88]    # 光学变焦倍率
    focus_range: [0.1, 10.0]   # 米
    default_zoom_limit: [-3236, 760]
    default_focus_limit: [-844, 592]
  gpio:
    available_pins: [12, 13, 21, 22]
    input_pins: [12, 13]
    output_pins: [21, 22]

automation:
  day_night_auto:
    enabled: true
    light_sensor_threshold: 300
    hysteresis: 50
    delay_sec: 10
  temperature_protection:
    enabled: true
    warning_temp_c: 75
    critical_temp_c: 85
    action: throttle

event_bus:
  enabled: true
  endpoint: "unix:///run/aipc/event-bus.sock"
  publish_events:
    - gpio_change
    - temperature_alert
    - day_night_switch
```

## 7 camera-daemon.yaml

> 以下为 camera-daemon.yaml 的完整配置参考。部分参数（如 watchdog、编码器）的默认值可能与 media-streaming 服务文档中的简化示例不同，以本配置参考为准。

```yaml
hal:
  video_library: "/opt/aipc/lib/hal/libaipc_hal.so"
  codec_library: "/opt/aipc/lib/hal/libaipc_hal.so"
  lens_library: "/opt/aipc/lib/hal/libhal-lens-bridge.so"

media:
  config_path: "/etc/imaging/cfg/medialib_configs/ai_example_medialib_config.json"
  backup_path: "/opt/aipc/data/media-backup"

video:
  device_path: "/dev/video0"

watchdog:
  scan_interval_ms: 100
  frame_timeout_ms: 500
  warn_threshold_ms: 300

rtsp:
  enabled: true

ai_overlay:
  enabled: true
  event_bus_endpoint: "unix:///run/aipc/event-bus.sock"
  topic_prefix: "inference/"
  draw_labels: true
  draw_confidence: true
  draw_landmarks: true
  box_thickness: 2
  stream_map: "third:main,sub:main"

encoders:
  - stream_name: main
    codec: h264
    width: 1920
    height: 1080
    fps: 30
    bitrate: 4000000             # 4Mbps
    gop: 30
    enabled: true
  - stream_name: sub
    codec: h264
    width: 1280
    height: 720
    fps: 30
    bitrate: 2000000             # 2Mbps
    gop: 60
    enabled: true
  - stream_name: third
    codec: h264
    width: 640
    height: 384
    fps: 15
    bitrate: 512000              # 512Kbps
    gop: 30
    enabled: true

service:
  log_level: debug
  log_file: "/var/log/aipc/camera-daemon.log"
```

## 8 discovery.yaml

```yaml
service:
  name: device-discovery
  listen: "unix:///run/aipc/device-discovery.sock"
  log_level: info

discovery:
  multicast_addr: "239.255.255.250"
  multicast_port: 19850
  announce_interval: 5           # 秒
  timeout: 30                    # 秒
  interface: ""                  # 空字符串表示所有接口
```

## 9 ai-runtime.yaml

```yaml
service:
  name: ai-runtime
  listen: "unix:///run/aipc/ai-runtime.sock"
  log_level: debug
  log_file: "/var/log/aipc/ai-runtime.log"

hal:
  library_path: "/opt/aipc/lib/hal/libaipc_hal.so"
  device_path: "/dev/hailo0"

models:
  repository_path: "/opt/aipc/models"
  cache_path: "/var/cache/aipc/models"
  preload: []                    # 预加载的模型 ID 列表

scheduler:
  global_qps_limit: 100
  global_concurrent_limit: 8
  default_session:
    max_qps: 30
    max_concurrent: 2
    priority: 5
  strategy: fair                 # fair | priority | fifo
  queue_size: 64
  timeout_ms: 5000

fd_receiver:
  socket_path: "/run/aipc/camera.sock"

performance:
  device_mode: high              # high | normal | low
  batch_enabled: false
  batch_size: 1
  batch_timeout_ms: 100
  max_model_cache: 3
  memory_limit_mb: 2048

monitoring:
  enabled: true
  stats_interval_sec: 10
  metrics_port: 9090
  temperature_limit_c: 85
  throttle_temperature_c: 80

event_bus:
  enabled: true
  endpoint: "unix:///run/aipc/event-bus.sock"
  auto_publish_results: true
  result_topic_prefix: "inference/"

auto_infer:
  enabled: false
```

## 10 相关文档

- [平台架构](../3-platform-development/0-platform-architecture.md) -- 四层分层架构与核心服务总览
- [App Manager 服务](./service-reference/1-app-manager.md) -- 容器生命周期管理详细说明
- [AI Runtime 服务](./service-reference/0-ai-runtime.md) -- NPU 推理调度与模型管理详细说明
- [Event Bus 服务](./service-reference/2-event-bus.md) -- 发布/订阅消息总线详细说明
- [故障排查](./2-troubleshooting.md) -- 常见问题与排查方法
