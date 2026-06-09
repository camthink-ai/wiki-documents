---
description: NE503 AIPC 平台构建与部署指南，涵盖分层构建、项目结构、开发工作流、调试技巧和发布打包。
keywords: [NE503, 构建, 部署, Makefile, Docker, HAL, 发布打包]
tags: [平台开发, NE503, 构建, 部署]
---

# Build and Deploy

NE503 AIPC 平台采用三层渐进式构建体系：Layer 1 可在任何开发机上完成，Layer 2 添加原生模拟组件，Layer 3 面向 Hailo-15H 目标设备交叉编译。本文档从项目结构出发，沿 构建 -> 验证 -> 调试 -> 部署 -> 打包 的单一主线，覆盖完整开发周期。

## 1 构建概览

### 1.1 三层构建体系

| 层级 | 内容 | 依赖要求 | 命令 |
|------|------|---------|------|
| Layer 1 | Go 服务 + Web 控制台 + Python SDK | Go, Node, protoc | `make layer1` |
| Layer 2 | + HAL stub + camera-daemon + ai-runtime + CLI + 工具 | + cmake, g++, gRPC | `make layer2` |
| Layer 3 | Hailo-15H 交叉编译（ARM64） | + Hailo SDK 4.0.23 | 见[第 5 节](#5-layer-3-交叉编译hailo-15h-目标) |

```bash
# 检查当前环境
make env-check

# 无硬件依赖，任何 Linux/macOS 均可
make layer1

# 需要 cmake/g++/gRPC（原生模拟）
make layer2
```

### 1.2 环境要求

```bash
# 自动安装（Ubuntu/macOS）
./scripts/setup_env.sh layer1    # Go + Node + protoc
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC
./scripts/setup_env.sh layer3    # + Hailo SDK 说明
```

**手动安装 -- Ubuntu 22.04**

```bash
# Layer 1
sudo apt install -y golang-go nodejs protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"

# Layer 2
sudo apt install -y build-essential cmake protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev

# Python 工具
pip3 install grpcio grpcio-tools pytest pytest-cov black flake8
```

**手动安装 -- macOS**

```bash
brew install go node protobuf cmake grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

## 2 项目结构

```
aipc/
├── platform/              # 平台服务（Go + C++）
│   ├── ai-runtime/        # AI 推理服务（C++）
│   ├── event-bus/         # 事件消息总线（Go）
│   ├── device-control/    # 设备/MCU 控制（Go）
│   ├── device-discovery/  # 网络设备发现（Go）
│   ├── app-manager/       # 容器生命周期管理（Go）
│   ├── platform-api/      # HTTP API 网关（Go）
│   ├── camera-daemon/     # 视频采集/编码（C++）
│   └── common/            # 共享 Go 库
│
├── hal/                   # HAL v1（C，legacy）
│   ├── include/           # HAL 接口头文件
│   ├── media/             # 摄像头/ISP 实现
│   ├── accel/             # AI 加速器实现
│   └── board/             # MCU/GPIO 实现
│
├── hal_v2/                # HAL v2（C++，模块化，推荐）
│   ├── include/           # media / model / peripheral / dsp 接口
│   └── src/               # 各平台实现（stub / hailo15）
│
├── sdk/                   # 开发者 SDK
│   ├── python/            # Python SDK（hailo_ipc_sdk）
│   └── go/                # Go SDK
│
├── web/                   # Web 控制台（React 19 + TypeScript + Vite）
├── apps/                  # 容器应用示例（10+）
├── configs/               # YAML 配置模板
│   ├── platform/          # 平台服务配置
│   ├── ai/                # AI 推理配置
│   └── security/          # 安全策略（seccomp）
├── systemd/               # systemd 服务单元
├── tools/                 # 开发工具
│   ├── aipc-cli/          # CLI 管理工具（Go）
│   └── shm-reader/        # 共享内存调试工具（C++）
├── scripts/               # 构建/测试/部署脚本
├── docker/                # Docker 开发环境
├── docs/                  # 内部文档
└── tests/                 # 单元/集成测试
```

各平台服务的详细信息请参考 [服务参考](../6-reference/service-reference/0-ai-runtime.md)。

## 3 Layer 1：通用构建

Layer 1 无硬件依赖，生成所有 Go 服务、Web 前端和 Python SDK，可在任何 Linux/macOS 上完成。

### 3.1 工具版本

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| Go | 1.25+ | `go version` |
| Node.js | 20+ | `node --version` |
| protoc | 3.12+ | `protoc --version` |
| protoc-gen-go | latest | `which protoc-gen-go` |
| protoc-gen-go-grpc | latest | `which protoc-gen-go-grpc` |
| Python | 3.8+ | `python3 --version` |

### 3.2 构建命令与输出

```bash
make layer1
# 等同于：make proto platform web sdk-python
```

输出二进制文件在 `build/output/`：

```
build/output/
├── device-control       # 设备控制服务
├── event-bus            # 事件总线服务
├── app-manager          # 应用管理服务
├── platform-api         # API 网关
├── device-discovery     # 设备发现服务
└── web/                 # Web 控制台（dist/）
```

### 3.3 CGo 状态

所有 Go 平台服务使用 `CGO_ENABLED=0` 编译（静态链接），无需 glibc 兼容：

| 服务 | CGo | 说明 |
|------|-----|------|
| device-control | 否 | 可选 CGo dlopen 代码在 build tag 后；禁用时使用 gRPC lens client |
| event-bus | 否 | 纯 Go |
| platform-api | 否 | 纯 Go |
| app-manager | 否 | 纯 Go |
| device-discovery | 否 | 纯 Go |

### 3.4 初始化项目

```bash
git clone <repo-url>
cd ne503

# 下载 Go modules
go mod download

# 安装 Python SDK（开发模式）
cd sdk/python
pip3 install -e .
cd ../..
```

## 4 Layer 2：原生 C/C++ 构建

Layer 2 在 Layer 1 基础上添加 HAL stub 库、camera-daemon、ai-runtime、CLI 工具和调试工具的主机架构构建，用于本地模拟和集成测试。

### 4.1 额外工具要求

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| CMake | 3.16+ | `cmake --version` |
| GCC/G++ | 10+（C++20） | `g++ --version` |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` |

### 4.2 构建命令与输出

```bash
make layer2
# 等同于：make layer1 hal-v2 camera-daemon ai-runtime aipc-cli tools
```

额外输出：

```
build/output/
├── ai-runtime               # AI 推理服务（C++）
├── camera-daemon            # 摄像头守护进程（C++）
├── aipc-cli                 # CLI 管理工具
├── shm-reader               # 共享内存读取工具
├── nv12-to-jpeg             # 图像格式转换工具
└── hal/
    └── stub/
        └── libaipc_hal*.so  # HAL stub 动态库
```

> HAL v2 使用 `libaipc_hal` 前缀，HAL v1 使用 `libhal` 前缀。两者共存于不同的构建目标中。

### 4.3 构建验证

```bash
# 检查 Go 二进制架构（应为静态链接）
file build/output/device-control
# ELF 64-bit LSB executable, x86-64 ...

# 检查 C++ 二进制动态依赖
ldd build/output/camera-daemon
# libstdc++.so.6 / libgcc_s.so.1 / libc.so.6 ...

# 确认 HAL stub 库存在
ls build/output/hal/stub/libaipc_hal*.so
```

## 5 Layer 3：交叉编译（Hailo-15H 目标）

Layer 3 使用 Hailo Yocto Poky SDK 将 HAL 库和 C++ 服务交叉编译为 ARM64 架构，用于部署到 NE503 设备。

### 5.1 前置条件

- Hailo SDK 4.0.23 安装在 `/opt/poky/4.0.23/`（可从 Hailo 开发者门户获取）
- 加载 SDK 环境（设置 `CC`, `CXX`, `CMAKE_TOOLCHAIN_FILE` 等）

### 5.2 Go 服务交叉编译

Go 服务原生支持交叉编译，无需 Hailo SDK：

```bash
# ARM64（NE503 设备架构）
GOOS=linux GOARCH=arm64 make platform
```

当 `HAL_PLATFORM=hailo15` 时，Makefile 自动设置 `CGO_ENABLED=0 GOOS=linux GOARCH=arm64`：

```bash
make platform HAL_PLATFORM=hailo15
```

### 5.3 HAL v2 交叉编译

```bash
# 加载 SDK 环境
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux

# 验证交叉编译器
echo $CC
# 输出：aarch64-poky-linux-gcc

# 构建 Hailo-15 的 HAL v2
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### 5.4 camera-daemon 和 ai-runtime 交叉编译

```bash
# camera-daemon
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23

# ai-runtime
make ai-runtime HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### 5.5 验证交叉编译产物

```bash
# 确认为 ARM64 架构
file build/output/camera-daemon
# ELF 64-bit LSB executable, ARM aarch64

file build/output/hal/hailo15/libaipc_hal.so
# ELF 64-bit LSB shared object, ARM aarch64

# 在目标设备上验证
ssh root@192.168.93.72 "uname -m"
# aarch64
```

## 6 开发工作流

### 6.1 平台服务开发（Go）

```bash
# 修改代码
cd platform/device-control/server
vim main.go

# 单独构建
make device-control

# 或直接用 go build
go build -o device-control .

# 本地运行（测试用）
./device-control --config ../../../configs/platform/device-control.yaml

# 运行单元测试
go test ./...

# 格式化
go fmt ./...
```

### 6.2 HAL 开发（C/C++）

```bash
# 编辑 HAL v2 接口或实现
vim hal_v2/include/media/hal_media.h
vim hal_v2/src/media/hailo15/media_manager.cpp

# 构建 stub 版本验证编译
make hal-v2

# 构建 Hailo-15 版本（需要 SDK）
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```


### 6.3 SDK 开发（Python）

```bash
cd sdk/python

# 开发模式安装
pip3 install -e .

# 运行测试
pytest tests/

# 格式化代码
black hailo_ipc_sdk/

# 构建 SDK 文档
make -C docs/en html
```

### 6.4 Web 控制台开发

```bash
cd web

# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:5173）
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 7 调试

### 7.1 gRPC 调试

```bash
# 启用 gRPC 全量追踪
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
./device-control --config configs/platform/device-control.yaml

# 使用 grpcurl 测试 Unix socket
grpcurl -plaintext -unix /run/aipc/device-control.sock list
```

### 7.2 日志级别

```bash
# 设备上查看服务日志
journalctl -u camera-daemon -f
journalctl -u ai-runtime -n 100

# 应用日志
tail -f /opt/aipc/logs/apps/<app-id>/stdout.log

# 设置 Go 服务日志级别
export LOG_LEVEL=DEBUG
./platform-api --config configs/platform-api.yaml
```

### 7.3 Socket 调试

```bash
# 检查 socket 文件
ls -l /run/aipc/*.sock

# 检查 socket 权限
stat /run/aipc/device-control.sock

# 测试 gRPC 连接
grpcurl -plaintext -unix /run/aipc/ai-runtime.sock list
```

### 7.4 Go 服务调试（delve）

```bash
cd platform/device-control/server
dlv debug -- --config config.yaml

# 设置断点
(dlv) break main.main
(dlv) continue
```

### 7.5 HAL 调试

```bash
export HAL_DEBUG=1
export HAL_LOG_LEVEL=DEBUG
gdb --args ./test_program
```

### 7.6 系统资源监控

```bash
# CPU 和内存（所有 aipc 进程）
top -p $(pgrep -d',' aipc)

# NPU 利用率
watch -n 1 'cat /sys/class/hailo/hailo0/device_utilization'

# 共享内存使用
ls -lh /run/aipc/shm/
```

更多调试和故障排查内容请参考 [故障排查](../6-reference/2-troubleshooting.md)。

## 8 常用 Make 目标

### 8.1 构建目标

| 目标 | 说明 |
|------|------|
| `make layer1` | proto + Go 服务 + Web + Python SDK |
| `make layer2` | Layer 1 + HAL stub + camera-daemon + ai-runtime + tools |
| `make all` | proto + HAL v2 + 平台服务 |
| `make proto` | 编译所有 .proto 文件生成 Go 代码 |
| `make platform` | 构建所有 Go 服务（CGO_ENABLED=0） |
| `make hal-v2` | 构建 HAL v2（默认 stub，`HAL_PLATFORM=hailo15` 交叉编译） |
| `make camera-daemon` | 构建 C++ camera-daemon |
| `make ai-runtime` | 构建 C++ AI 推理服务 |
| `make web` | 构建 Web 控制台（pnpm） |
| `make sdk-python` | 构建 Python SDK |
| `make sdk-go` | 构建 Go SDK |
| `make aipc-cli` | 构建 CLI 工具 |
| `make tools` | 构建 shm-reader、nv12-to-jpeg |

### 8.2 单独服务构建

```bash
make device-control       # 仅构建 device-control
make event-bus            # 仅构建 event-bus
make app-manager          # 仅构建 app-manager
make platform-api         # 仅构建 platform-api
make device-discovery     # 仅构建 device-discovery
```

### 8.3 工具与维护

| 目标 | 说明 |
|------|------|
| `make env-check` | 检查构建依赖是否满足 |
| `make clean` | 清理构建产物 |
| `make distclean` | 深度清理（含 node_modules） |
| `make fmt` | 格式化代码（Go + C/C++） |
| `make lint` | 代码静态检查（golangci-lint） |
| `make install` | 安装到 `/opt/aipc` |

### 8.4 测试目标

| 目标 | 说明 |
|------|------|
| `make test` | 运行所有测试（单元 + 集成） |
| `make test-unit` | Go 单元测试（`go test -race ./platform/...`） |
| `make test-integration` | 集成测试 |
| `make test-e2e` | 端到端测试 |

详细测试流程请参考 [平台测试](../6-reference/0-platform-testing.md)。

## 9 设备部署

### 9.1 快速部署（scp 单文件）

适用于迭代开发阶段的快速更新：

```bash
# 部署单个 Go 服务
scp build/output/device-control root@192.168.93.72:/opt/aipc/bin/

# 重启服务
ssh root@192.168.93.72 "systemctl restart device-control"
```

### 9.2 Make 远程部署（推荐）

Makefile 内置了完整的远程部署能力，支持逐服务热替换：

```bash
# 首次设置 SSH 免密登录
make setup-ssh TARGET=root@192.168.93.72

# 初始化远程目录结构（首次部署）
make deploy-init TARGET=root@192.168.93.72

# 快速迭代部署所有模块（无需打包，逐服务 scp + restart）
make deploy-all TARGET=root@192.168.93.72

# 部署单个服务
make deploy-device-control TARGET=root@192.168.93.72
make deploy-camera-daemon TARGET=root@192.168.93.72 SDK_PATH=/opt/poky/4.0.23
```

服务按依赖顺序部署：device-control -> event-bus -> app-manager -> platform-api -> camera-daemon -> ai-runtime -> web。

### 9.3 自定义安装路径

设备 `/opt` 空间有限时，可指定其他路径：

```bash
# 初始化到 /data/aipc
make deploy-init TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc

# 部署到自定义路径
make deploy-all TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc
```

`deploy-init` 会自动完成目录创建、数据迁移、symlink 更新、systemd 单元和 YAML 配置路径替换。

### 9.4 发布包部署

使用发布 tarball 部署（含自动备份和回滚）：

```bash
# 构建 Hailo-15 发布包
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0

# 传输到设备
scp build/release/aipc-hailo15-nx-1.0.tar.gz root@192.168.93.72:/tmp/

# 在设备上执行热替换部署
ssh root@192.168.93.72
cd /tmp && tar xzf aipc-hailo15-nx-1.0.tar.gz
cd aipc-hailo15-nx-1.0 && ./deploy.sh

# 回滚到上一版本
./deploy.sh --rollback

# 查看部署状态
./deploy.sh --status
```

### 9.5 部署验证

```bash
# 检查所有平台服务状态
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api

# 查看所有 aipc 相关服务
systemctl list-units --type=service | grep -E 'ai-runtime|camera-daemon|app-manager|event-bus|device-control|platform-api'

# 检查二进制架构匹配
file /opt/aipc/bin/ai-runtime
# ELF 64-bit LSB executable, ARM aarch64

# 检查 HAL 库
ls -l /opt/aipc/lib/hal/libaipc_hal*.so
```

## 10 发布打包

### 10.1 本地 stub 发布

用于测试验证，无需 Hailo SDK：

```bash
# 构建并打包（默认 stub 平台）
make pack

# 指定版本号
make pack VERSION=nx-1.0
```

### 10.2 Hailo-15 完整发布

需要 Hailo SDK，交叉编译所有组件：

```bash
# 指定 SDK 路径
make pack-release SDK_PATH=/opt/poky/4.0.23

# 指定版本号
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0
```

### 10.3 Legacy 打包脚本

`scripts/pack_release.sh` 提供 CLI 接口，内部委托给 Makefile 目标：

```bash
# stub 打包
./scripts/pack_release.sh --version nx-1.0

# Hailo-15 打包
./scripts/pack_release.sh --sdk-path /opt/poky/4.0.23 --version nx-1.0

# 跳过构建，仅重新打包
./scripts/pack_release.sh --skip-build --version nx-1.0

# 清理后重新构建
./scripts/pack_release.sh --clean --sdk-path /opt/poky/4.0.23 --version nx-1.0
```

### 10.4 发布包内容

输出：`build/release/aipc-<platform>-<version>.tar.gz`

| 路径 | 内容 |
|------|------|
| `opt/aipc/bin/` | 二进制文件（服务、CLI、工具） |
| `opt/aipc/lib/hal/` | HAL 共享库 |
| `opt/aipc/etc/` | YAML 配置文件 |
| `opt/aipc/etc/security/` | 安全策略（seccomp） |
| `opt/aipc/web/` | Web 控制台资源 |
| `opt/aipc/swagger-ui/` | API 文档 |
| `opt/aipc/models/` | 模型目录（空，用户通过脚本下载） |
| `systemd/` | systemd 服务单元 |
| `deploy.sh` | 热替换部署脚本 |
| `VERSION` | 版本元数据（version / build_date / git_commit / platform） |

### 10.5 模型文件部署

模型文件不包含在发布包中，需单独部署：

```bash
# 从本地目录复制 HEF 模型
make models-deploy MODELS_PATH=/home/share

# 或在远程设备上下载
make download-models TARGET=root@192.168.93.72

# 指定安装路径
make download-models TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc
```

### 10.6 Docker 开发环境

如需在容器中进行交叉编译：

```bash
# 构建 Docker 镜像（含 Hailo SDK）
make docker-build-image SDK_PATH=/opt/poky/4.0.23

# 启动持久化开发容器
make docker-dev
make docker-dev-shell    # 进入容器

# 或挂载宿主机源码
make docker-dev-mount

# Web UI 构建服务器（:8080）
make docker-build-server
```

## 11 常见构建问题

### protoc: not found

```bash
sudo apt install protobuf-compiler
```

### protoc-gen-go: not found

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"
```

### grpc_cpp_plugin: not found（camera-daemon 构建）

```bash
sudo apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

### camera-daemon cmake 选择了错误的工具链

CMake 使用缓存可能导致工具链残留。清理后重新配置：

```bash
rm -rf platform/camera-daemon/build
make camera-daemon
```

### HAL v2 hailo15 构建失败 -- SDK 未找到

确保已加载 SDK 环境并指定路径：

```bash
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### "exec format error"（部署后）

构建产物架构与目标设备不匹配。确认交叉编译设置：

```bash
# 检查产物架构
file build/output/ai-runtime

# 检查目标设备架构
ssh root@192.168.93.72 "uname -m"
# aarch64 -> 需要 ARM64 编译
```

### Socket 创建失败

设备上运行时目录不存在或权限不足：

```bash
mkdir -p /run/aipc/shm /run/aipc/sockets
chmod 777 /run/aipc
```

## 12 相关文档

- [平台架构](./0-platform-architecture.md) -- NE503 软件平台四层架构与服务依赖关系
- [贡献指南](../6-reference/1-platform-contributing.md) -- 代码风格、Git 工作流和 PR 流程
- [平台测试](../6-reference/0-platform-testing.md) -- 测试层级和测试环境配置
- [故障排查](../6-reference/2-troubleshooting.md) -- 运行时问题排查和性能分析
- [配置参考](../6-reference/3-config-reference.md) -- 所有服务配置文件参数
- [CLI 工具](../5-system-integration/3-cli-guide.md) -- aipc-cli 命令行工具使用参考
