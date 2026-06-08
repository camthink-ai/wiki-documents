---
description: NE503 容器应用开发参考，涵盖 app.yaml 完整字段定义、Dockerfile 模式、权限模型和多容器配置。
keywords: [NE503, 应用开发, app.yaml, Dockerfile, 容器, 权限模型]
tags: [应用开发, NE503, 参考, 容器]
---

# 应用开发参考

本文档是 NE503 容器应用的完整配置参考，涵盖 `app.yaml` 全部字段定义、Dockerfile 编写模式、安全沙箱模型以及多容器架构。如需面向新手的分步教程，请参阅 [SDK 示例](./3-sdk-examples.md)。

## 1 应用概览

NE503 平台上的应用以 OCI 容器形式运行，由 App Manager 统一管理生命周期。每个应用通过 `app.yaml` 清单文件声明其镜像、资源需求和权限。

**核心概念：**

- **单容器模式** -- 大多数应用只需一个容器，在 `spec.image` 中指定镜像即可。
- **多容器模式** -- 复杂应用可拆分为 main + sub 容器，实现进程级隔离。仅 main 容器拥有平台服务访问权限。
- **最小权限原则** -- 所有权限（视频流、推理、设备控制等）必须显式声明，未声明的权限不可使用。

**项目文件结构：**

```
my-app/
├── app.yaml          # 应用清单（必需）
├── Dockerfile        # 构建定义（必需）
├── app.py            # 入口文件
├── requirements.txt  # Python 依赖（可选）
└── config/           # 配置文件（可选）
```

## 2 app.yaml 完整参考

应用清单是 AIPC 平台的核心配置文件。本节按层级逐一说明所有字段。

### 2.1 最小配置

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

### 2.2 完整单容器配置

以下示例包含全部可用字段，按层级分组说明：

```yaml
apiVersion: v1
kind: Application

metadata:
  id: my_app                          # 必需 - 唯一标识
  name: My Application                # 必需 - 显示名称
  version: 1.0.0                      # 必需 - 语义化版本
  description: 应用功能描述            # 可选 - 应用描述
  author: Developer                   # 可选 - 作者
  email: dev@example.com              # 可选 - 联系邮箱

spec:
  image: aipc/my_app:1.0.0            # 必需 - 容器镜像（不含 registry 前缀时自动补 docker.io/）

  # ── 资源限制 ─────────────────────────────────
  resources:
    cpu: "50%"                         # CPU 限制，支持百分比（"50%"）或核数（"1.5"）
    memory: "256Mi"                    # 内存限制，支持 Mi/Gi 后缀（"512Mi"、"1Gi"）

  # ── 权限声明 ─────────────────────────────────
  permissions:
    video:                             # 视频流访问
      - cam0_main.raw                  #   原始视频流（DMA-BUF 共享内存，零拷贝）
      - cam0_main                      #   编码视频流（Unix Domain Socket）
      - cam0_sub                       #   子码流
    inference:                         # AI 推理
      models: [yolov8n, person_v1]     #   允许使用的模型列表
      max_qps: 30                      #   最大每秒推理请求数
      max_concurrent: 2                #   最大并发推理数
      allow_register_model: false      #   是否允许动态注册新模型
    events:                            # 事件总线
      publish: [app/my_app/*]          #   可发布的主题（支持通配符 *）
      subscribe: [model/*/detections, system/*]  # 可订阅的主题
    device:                            # 设备控制
      light: true                      #   补光灯
      ir_cut: true                     #   IR-CUT 滤光片
      ptz: false                       #   云台控制
      lens: false                      #   镜头变焦/对焦
      gpio:
        read: [12, 13]                 #   可读 GPIO 引脚编号
        write: [21, 22]                #   可写 GPIO 引脚编号
    network:                           # 网络访问
      mode: isolated                   #   网络模式：isolated（默认）或 host
      outbound:                        #   出站白名单（仅 isolated 模式生效）
        - "https://api.example.com"
        - "mqtt://broker.example.com:8883"
      inbound:                         #   入站端口（仅 host 模式生效）
        - 8554

  # ── 环境变量 ─────────────────────────────────
  env:
    - name: LOG_LEVEL
      value: INFO
    - name: CUSTOM_CONFIG
      value: "production"

  # ── 卷挂载 ───────────────────────────────────
  volumes:
    - host: /opt/aipc/data/my_app      # 宿主机路径（自动适配部署前缀）
      container: /app/data             # 容器内路径
      readonly: false                  # 是否只读挂载

  # ── 安全沙箱 ─────────────────────────────────
  security:
    no_new_privileges: true            # 禁止提权（默认 true）
    readonly_rootfs: true              # 只读根文件系统（默认 true）

  # ── 启动策略 ─────────────────────────────────
  autostart: true                      # 开机自启（默认 false）
  restart_policy: on-failure           # 基础重启策略：always | on-failure | no

  # ── 健康检查 ─────────────────────────────────
  healthcheck:
    enabled: true
    type: command                      # 检查类型：command | http | tcp
    command: "/app/main --health"      # command 类型：执行的命令
    path: /healthz                     # http 类型：检查路径
    port: 8080                         # http/tcp 类型：端口号
    interval: 30s                      # 检查间隔
    timeout_seconds: 5                 # 超时时间（秒）
    retries: 3                         # 连续失败次数阈值

  # ── 自动重启（增强版，含指数退避） ───────────
  auto_restart:
    enabled: true                      # 启用自动重启
    max_retries: 3                     # 最大重启次数（0 = 无限）
    retry_delay_seconds: 10            # 初始重试延迟（秒）
    backoff_multiplier: 2.0            # 退避倍数（每次失败延迟 × 此值，上限 5 分钟）
    health_check_interval_seconds: 30  # 健康检查轮询间隔（秒）

  # ── 插件系统 ─────────────────────────────────
  plugin:
    capabilities:
      - id: rtsp-server                # 能力唯一标识
        version: "1.0"                 # 能力版本
        transport: both                # 通信方式：grpc | event | both
        description: RTSP 流媒体服务
        proto: "rtsp.RtspService"      # gRPC 服务定义（grpc/both 必需）
        topics:                        # 事件主题（event/both 必需）
          publish:
            - "plugin/rtsp/stream-status"
          subscribe:
            - "system/video-config-changed"

  plugin_dependencies:                 # 声明依赖的其他插件能力
    - capability: rtsp-server          # 能力标识
      min_version: "1.0"               # 最低版本要求
      required: true                   # 是否为硬性依赖
```

### 2.3 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `apiVersion` | string | 是 | API 版本，当前固定为 `v1` |
| `kind` | string | 是 | 资源类型：`Application`、`ModelService`、`BusinessService` |
| `metadata` | object | 是 | 应用元数据，详见 [2.4 metadata 字段](#24-metadata-字段) |
| `spec` | object | 是 | 应用规格，详见 [2.5 spec 字段](#25-spec-字段) |

### 2.4 metadata 字段

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `id` | string | 是 | 唯一标识符，小写字母/数字/下划线，创建后不可修改 |
| `name` | string | 是 | 应用显示名称 |
| `version` | string | 是 | 语义化版本号（major.minor.patch） |
| `description` | string | 否 | 应用功能描述 |
| `author` | string | 否 | 作者名称 |
| `email` | string | 否 | 联系邮箱 |

### 2.5 spec 字段

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `image` | string | 单容器必需 | 容器镜像引用，自动补全 registry 前缀 |
| `resources` | object | 否 | 资源限制（`cpu`、`memory`） |
| `permissions` | object | 否 | 权限声明，详见 [2.6 permissions 字段](#26-permissions-字段) |
| `env` | array | 否 | 环境变量列表，每项含 `name` 和 `value` |
| `volumes` | array | 否 | 卷挂载列表，详见下方说明 |
| `security` | object | 否 | 安全沙箱配置，详见 [4 权限模型](#4-权限模型) |
| `autostart` | bool | 否 | 开机自启，默认 `false` |
| `restart_policy` | string | 否 | 基础重启策略：`always`、`on-failure`、`no`（默认） |
| `restart_max_retries` | int | 否 | 基础重启最大次数 |
| `healthcheck` | object | 否 | 健康检查配置 |
| `auto_restart` | object | 否 | 增强自动重启配置（含指数退避，优先于 `restart_policy`） |
| `plugin` | object | 否 | 插件能力声明 |
| `plugin_dependencies` | array | 否 | 插件依赖声明 |
| `containers` | map | 否 | 多容器模式，详见 [5 多容器配置](#5-多容器配置) |
| `networking` | object | 否 | 多容器网络配置 |
| `lifecycle` | object | 否 | 多容器生命周期配置 |

### 2.6 permissions 字段

**video** -- 视频流访问列表：

| 值 | 说明 |
|:---|:---|
| `cam0_main.raw` | 原始视频流（DMA-BUF 共享内存，零拷贝传输） |
| `cam0_main` | 编码视频流（Unix Domain Socket） |
| `cam0_sub` | 子码流 |

声明 `.raw` 流时，平台自动挂载 `/dev/dma_heap` 设备并共享 IPC 命名空间以支持内存映射。

**inference** -- AI 推理权限：

| 字段 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `models` | string[] | -- | 允许使用的模型 ID 列表（必填，启动时自动向 AI Runtime 注册） |
| `max_qps` | int | 0 | 最大每秒推理请求数 |
| `max_concurrent` | int | 0 | 最大并发推理数 |
| `allow_register_model` | bool | false | 是否允许运行时动态注册新模型 |

**events** -- 事件总线权限：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `publish` | string[] | 可发布的主题模式，支持 `*` 通配符（如 `app/my_app/*`） |
| `subscribe` | string[] | 可订阅的主题模式，支持 `*` 通配符（如 `model/*/detections`） |

**device** -- 设备控制权限：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `light` | bool | 补光灯控制 |
| `ir_cut` | bool | IR-CUT 滤光片控制 |
| `ptz` | bool | 云台控制 |
| `lens` | bool | 镜头变焦/对焦控制 |
| `gpio.read` | int[] | 可读取的 GPIO 引脚编号列表 |
| `gpio.write` | int[] | 可写入的 GPIO 引脚编号列表 |

**network** -- 网络访问权限：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `mode` | string | `isolated`（默认，独立网络命名空间）或 `host`（共享主机网络） |
| `outbound` | string[] | 出站白名单，仅 `isolated` 模式生效 |
| `inbound` | int[] | 入站端口列表，仅 `host` 模式生效 |

### 2.7 volumes 字段

每个卷挂载项包含：

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `host` | string | 是 | 宿主机路径（`/opt/aipc` 前缀会自动适配实际部署路径） |
| `container` | string | 是 | 容器内挂载路径 |
| `readonly` | bool | 否 | 是否只读挂载，默认 `false` |

平台会自动挂载 `/run/aipc` 目录，使容器能够访问所有 IPC Socket（`ai-runtime.sock`、`event-bus.sock` 等）。无需手动声明。

### 2.8 healthcheck 字段

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `enabled` | bool | 是否启用健康检查 |
| `type` | string | 检查类型：`command`（执行命令）、`http`（HTTP 请求）、`tcp`（TCP 连接） |
| `command` | string | `type=command` 时执行的命令 |
| `path` | string | `type=http` 时请求的路径 |
| `port` | int | `type=http` 或 `type=tcp` 时的端口号 |
| `interval` | string | 检查间隔（如 `30s`） |
| `timeout_seconds` | int | 单次检查超时（秒） |
| `retries` | int | 连续失败多少次后判定为不健康 |

### 2.9 auto_restart 字段

增强版自动重启策略，支持指数退避。当 `auto_restart.enabled` 为 `true` 时，优先于 `restart_policy` 生效。

| 字段 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| `enabled` | bool | false | 是否启用自动重启 |
| `max_retries` | int | 0 | 最大重启次数（0 表示无限重试） |
| `retry_delay_seconds` | int | 5 | 首次重试延迟（秒） |
| `backoff_multiplier` | float | 1.5 | 退避倍数，每次失败延迟乘以此值，上限 5 分钟 |
| `health_check_interval_seconds` | int | 30 | 后台健康检查轮询间隔（秒） |

**退避计算示例**（`retry_delay_seconds: 10`，`backoff_multiplier: 2.0`）：

- 第 1 次重启：延迟 10 秒
- 第 2 次重启：延迟 20 秒
- 第 3 次重启：延迟 40 秒
- ...上限为 300 秒（5 分钟）

### 2.10 plugin 字段

声明应用提供的插件能力，供其他应用发现和依赖。

**capabilities 项：**

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `id` | string | 是 | 能力唯一标识 |
| `version` | string | 是 | 能力语义化版本 |
| `transport` | string | 是 | 通信方式：`grpc`、`event`、`both` |
| `description` | string | 否 | 能力描述 |
| `proto` | string | grpc/both 必需 | gRPC 服务定义（如 `"rtsp.RtspService"`） |
| `topics` | object | event/both 必需 | 包含 `publish` 和 `subscribe` 主题列表 |

插件运行时 Socket 路径为 `/run/aipc/plugins/<app_id>.sock`。

**plugin_dependencies 项：**

| 字段 | 类型 | 必需 | 说明 |
|:---|:---|:---|:---|
| `capability` | string | 是 | 依赖的能力 ID |
| `min_version` | string | 否 | 最低版本要求 |
| `required` | bool | 否 | 是否为硬性依赖（为 true 时，依赖未满足则应用无法启动） |

### 2.11 验证规则

App Manager 在安装时执行以下校验：

1. `apiVersion` 必须为 `v1`
2. `kind` 必须为 `Application`、`ModelService` 或 `BusinessService`
3. `metadata.id`、`metadata.name`、`metadata.version` 为必填
4. 单容器模式下 `spec.image` 必填；多容器模式下各容器的 `image` 必填
5. `network.mode` 仅允许 `isolated` 或 `host`；`inbound` 仅在 `host` 模式下可用
6. 多容器模式下必须有且仅有一个 `role: main` 容器，且 sub 容器不可声明任何 permissions
7. 插件能力的事件主题必须在 `permissions.events` 中有对应的发布/订阅权限

## 3 Dockerfile 模式

### 3.1 Python -- 基础镜像（推荐）

SDK 预装在基础镜像中，无需额外安装步骤：

```dockerfile
FROM aipc/python-base:1.0
WORKDIR /app
COPY . /app/
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
CMD ["python", "app.py"]
```

### 3.2 Python -- Wheel 文件（离线环境）

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

### 3.3 Go -- 多阶段构建

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

### 3.4 最佳实践

- **非 root 运行** -- 创建专用用户（UID 1000），使用 `USER` 指令切换。平台会自动注入 AIPC 组 GID (1001) 以访问 Socket，无需手动配置。
- **镜像瘦身** -- 使用多阶段构建、`--no-cache-dir`、清理临时文件，减小镜像体积。
- **只读文件系统兼容** -- 避免向 `/etc`、`/var` 等系统目录写入。数据应写入 `volumes` 挂载的路径。
- **代理构建** -- 在 x86 开发机上交叉编译时使用 `--build-arg HTTP_PROXY=...`。
- **跨架构** -- 使用 `docker buildx build --platform linux/arm64` 构建 ARM 镜像。

## 4 权限模型

NE503 采用多层安全沙箱，所有安全策略由平台强制执行，开发者无需在 Dockerfile 中配置。

### 4.1 Linux Capabilities

容器启动时自动丢弃以下危险 capabilities：

| 被丢弃的 Capability | 风险 |
|:---|:---|
| `CAP_SYS_ADMIN` | 超级管理员权限 |
| `CAP_NET_ADMIN` | 网络配置修改 |
| `CAP_SYS_MODULE` | 加载内核模块 |
| `CAP_SYS_TIME` | 修改系统时钟 |
| `CAP_SYS_BOOT` | 重启系统 |
| `CAP_SYS_NICE` | 修改进程优先级 |
| `CAP_SYS_RESOURCE` | 绕过资源限制 |
| `CAP_SYS_RAWIO` | 直接 I/O 端口访问 |
| `CAP_SYS_PTRACE` | 进程追踪 |
| `CAP_SYS_CHROOT` | 修改根目录 |
| `CAP_MKNOD` | 创建设备文件 |

### 4.2 Seccomp 系统调用过滤

App Manager 在容器启动时加载 Seccomp 配置文件，默认策略为白名单模式（`defaultAction: SCMP_ACT_ERRNO`），仅允许常用系统调用。配置文件路径由平台管理员设置，开发者无需关心。

### 4.3 文件系统与命名空间隔离

| 安全机制 | 默认值 | 可通过 app.yaml 覆盖 |
|:---|:---|:---|
| `no_new_privileges` | true | `security.no_new_privileges: false` |
| `readonly_rootfs` | true | `security.readonly_rootfs: false` |
| PID 命名空间隔离 | 独立 | 不可覆盖 |
| 挂载命名空间隔离 | 独立 | 不可覆盖 |
| UTS 命名空间隔离 | 独立 | `host` 网络模式下共享 |
| 网络 命名空间隔离 | 独立 | `permissions.network.mode: host` 时共享 |
| IPC 命名空间隔离 | 独立 | 声明 `.raw` 视频流时自动共享（DMA-BUF 需要） |
| PIDs 限制 | 128 | 不可覆盖 |

### 4.4 网络隔离

- **isolated 模式**（默认）：容器拥有独立网络命名空间，仅可通过 `outbound` 白名单访问外部地址。
- **host 模式**：容器共享主机网络栈，可通过 `inbound` 声明需要监听的端口。适用于 RTSP 流媒体等需要对外暴露服务的场景。

### 4.5 Socket 访问机制

平台将 `/run/aipc` 目录挂载到所有容器中，该目录包含所有 IPC Socket。容器通过 AIPC 组 GID (1001) 获得访问权限，此机制由平台自动注入，开发者无需在 Dockerfile 中添加用户组配置。

## 5 多容器配置

当应用需要进程级隔离时，可使用多容器模式。例如将推理引擎和业务逻辑拆分为独立容器，便于独立更新和资源限制。

### 5.1 架构模型

| 角色 | 平台服务访问 | permissions | 典型用途 |
|:---|:---|:---|:---|
| **main** | 拥有，可访问 AI Runtime、Event Bus 等平台 Socket | 可声明 | 业务逻辑、平台交互 |
| **sub** | 无，完全隔离 | 不可声明 | 独立算法进程、第三方服务 |

约束：
- 必须有且仅有一个 `role: main` 容器
- sub 容器不可声明任何 permissions
- 容器间通过网络命名空间共享互相通信

### 5.2 完整示例

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
      role: main                          # 必须声明
      permissions:
        video: [cam0_main.raw]
        inference:
          models: [yolov8n]
      resources:
        cpu: "100%"
        memory: "512Mi"
      ports:
        - containerPort: 8080
          protocol: TCP
          name: http                      # 服务发现名称
      env:
        - name: SUB_DETECTOR_ADDR
          value: "detector:50051"
      volumes:
        - name: shared-data               # 容器级卷挂载
          container: /app/shared
          readonly: false
      security:
        readonly_rootfs: false

    detector:
      image: smart-detection-detector:1.0
      role: sub                           # sub 容器，不可声明 permissions
      resources:
        cpu: "50%"
        memory: "256Mi"
      ports:
        - containerPort: 50051
          protocol: TCP
      command: ["/app/detector"]          # 覆盖 ENTRYPOINT
      args: ["--workers=4"]               # 追加参数

  networking:
    mode: internal                        # internal（默认）| bridge | host
    ingress:
      - port: 8080                        # 外部端口
        target: main:8080                 # 目标容器:端口
        protocol: HTTP                    # HTTP | TCP | UDP

  lifecycle:
    startup_order: [detector, main]       # 先启动 sub
    shutdown_order: [main, detector]      # 先停止 main

  volumes:                                # 应用级共享卷（所有容器可见）
    - host: /opt/aipc/data/smart_detection
      container: /app/data
```

### 5.3 ContainerSpec 字段

每个容器（`containers` 下的条目）支持以下字段：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `image` | string | 容器镜像 |
| `role` | string | `main` 或 `sub` |
| `permissions` | object | 权限声明（仅 main 容器可声明） |
| `resources` | object | 资源限制（`cpu`、`memory`） |
| `env` | array | 环境变量列表 |
| `ports` | array | 端口声明列表，每项含 `containerPort`、`protocol`、`name` |
| `command` | string[] | 覆盖镜像 ENTRYPOINT |
| `args` | string[] | 追加参数 |
| `healthcheck` | object | 容器级健康检查 |
| `volumes` | array | 容器级卷挂载，每项含 `name`、`container`、`readonly` |
| `security` | object | 容器级安全配置（未设置时继承应用级 `spec.security`） |

### 5.4 网络模式

| 模式 | 说明 | 适用场景 |
|:---|:---|:---|
| `internal` | 容器间共享网络命名空间，外部不可访问（默认） | 内部微服务通信 |
| `bridge` | 通过 `aipc-br0` 网桥接入局域网 | 需要局域网发现的服务 |
| `host` | 共享主机网络栈 | 需要对外暴露端口的服务 |

### 5.5 启动与关闭顺序

- `startup_order` -- 指定容器启动顺序。未指定时默认先启动所有 sub 容器，最后启动 main 容器。各容器启动间有 500ms 间隔。
- `shutdown_order` -- 指定容器停止顺序。未指定时默认为启动顺序的逆序（先停 main，再停 sub）。停止超时为 10 秒。

### 5.6 自动注入的环境变量

多容器模式下，平台为每个容器自动注入以下环境变量：

| 变量 | 说明 |
|:---|:---|
| `APP_ID` | 应用 ID（来自 `metadata.id`） |
| `APP_ROLE` | 容器角色（`main` 或 `sub`） |
| `CONTAINER_NAME` | 容器名称（`containers` 中的键名） |
| `AIPC_HOST_PREFIX` | 平台部署路径前缀（如 `/data/aipc`） |

## 6 生命周期管理

应用从安装到卸载的完整生命周期由 App Manager 管理：

| 阶段 | CLI 命令 | 说明 |
|:---|:---|:---|
| **install** | `aipc-cli app install <yaml> <tar>` | 导入镜像、校验清单、注册到应用仓库 |
| **start** | `aipc-cli app start <id>` | 预加载模型、创建容器、启动运行 |
| **stop** | `aipc-cli app stop <id>` | 优雅停止容器（默认超时 10 秒） |
| **uninstall** | `aipc-cli app uninstall <id>` | 停止容器、删除镜像和实例数据、注销注册 |
| **update** | 先 stop + uninstall 旧版，再 install + start 新版 | 暂不支持热更新，需手动替换 |

**安装方式：**

- **本地镜像文件** -- 传入 `.tar` 或 `.tar.gz` 文件，直接导入 containerd。
- **远程镜像仓库** -- 传入镜像引用（如 `docker.io/my/app:1.0`），自动拉取并标准化为完整引用。

**故障自愈：**

- 启动时检测 overlayfs 快照损坏（常见于断电），自动从 content store 重新解包镜像。
- 安装时保存镜像 tar 备份，用于断电恢复后重建。

## 7 环境变量参考

平台自动注入的容器环境变量：

| 变量 | 来源 | 说明 |
|:---|:---|:---|
| `APP_ID` | `metadata.id` | 应用唯一标识 |
| `APP_ROLE` | `containerSpec.role` | 容器角色（仅多容器模式） |
| `CONTAINER_NAME` | containers 键名 | 容器名称（仅多容器模式） |
| `AIPC_HOST_PREFIX` | 平台配置 | 部署路径前缀，用于路径转换 |
| `<自定义>` | `spec.env` | 用户在 app.yaml 中声明的变量 |

SDK 自动读取的连接配置变量（通常无需修改，平台已通过 Socket 挂载提供）：

| 变量 | 默认值 | 说明 |
|:---|:---|:---|
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` | AI Runtime gRPC 端点 |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` | Event Bus gRPC 端点 |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` | 设备控制 gRPC 端点 |
| `CAMERA_CONTROL_ENDPOINT` | `unix:///run/aipc/camera-control.sock` | 摄像头控制 gRPC 端点 |
| `SHM_BASE_PATH` | `/run/aipc/shm` | 共享内存基础路径 |
| `LOG_LEVEL` | `INFO` | 日志级别 |
| `DEBUG` | `0` | 调试模式开关 |

## 8 相关文档

- [Python SDK 参考](./2-sdk-reference.md) -- SDK API 签名与数据类型
- [SDK 示例](./3-sdk-examples.md) -- 完整应用示例和开发教程
- [平台架构](../3-platform-development/0-platform-architecture.md) -- 系统设计与数据流
- [CLI 工具](../5-system-integration/3-cli-guide.md) -- aipc-cli 完整命令参考
- [App Manager 服务参考](../6-reference/service-reference/1-app-manager.md) -- App Manager 深度解析
