---
description: NE503 AIPC 平台开发指南，涵盖环境搭建、项目结构、分层构建、开发工作流、调试技巧和性能分析，帮助平台贡献者快速上手开发。
keywords: [NE503 开发指南, 构建系统, 开发环境, 项目结构, 调试, 性能分析, HAL]
tags: [平台开发, NE503, 开发指南, 贡献者]
---

# Development Guide

## 1 快速开始

```bash
# 检查依赖
make env-check

# 构建 Go 服务 + Web + SDK（无需硬件）
make layer1

# 构建完整原生 Linux 版本（stub HAL + camera-daemon）
make layer2
```

## 2 构建分层

| 层级 | 内容 | 依赖要求 | 命令 |
|------|------|---------|------|
| 1 | Go 服务、Web、SDK | Go, Node, protoc | `make layer1` |
| 2 | + stub HAL、camera-daemon | + cmake, g++, gRPC | `make layer2` |
| 3 | Hailo-15 交叉编译 | + Hailo SDK 4.0.23 | 见第 7 节 |

## 3 环境搭建

### 前置条件

**操作系统：**
- Linux（推荐 Ubuntu 22.04+，Layer 2 需要 GCC 10+）
- macOS（部分功能有限制）
- Windows WSL2

### 自动安装（Ubuntu/macOS）

```bash
./scripts/setup_env.sh layer1    # Go + Node + protoc
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC
./scripts/setup_env.sh layer3    # + Hailo SDK 说明
```

### 手动安装 — Ubuntu 22.04

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

### 手动安装 — macOS

```bash
brew install go node protobuf cmake grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

## 4 初始化项目

```bash
git clone <repo-url>
cd ne503

# 初始化 Go modules
go mod download

# 安装 Python SDK（开发模式）
cd sdk/python
pip3 install -e .
cd ../..
```

## 5 Layer 1：通用构建

无硬件依赖，支持任何 Linux/macOS。

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| Go | 1.25+（建议使用最新稳定版） | `go version` |
| Node.js | 20+ | `node --version` |
| protoc | 3.12+ | `protoc --version` |
| protoc-gen-go | latest | `which protoc-gen-go` |
| protoc-gen-go-grpc | latest | `which protoc-gen-go-grpc` |
| Python | 3.8+ | `python3 --version` |

```bash
make layer1
# 等同于：make proto platform web sdk-python
```

输出二进制文件在 `build/output/`：
- `device-control`、`event-bus`、`app-manager`、`platform-api`、`device-discovery`
- `web/dist/`（Web 资源）

大部分 Go 服务使用 `CGO_ENABLED=0` 编译（device-control 除外，它包含可选的 CGo 镜头控制代码）。

### CGo 状态

所有 Go 平台服务使用 `CGO_ENABLED=0` 构建（device-control 除外，详见下表）：

| 服务 | CGo | 说明 |
|------|-----|------|
| device-control | 否 | CGo dlopen 代码在 build tag 后；使用 gRPC lens client 替代 |
| event-bus | 否 | 纯 Go |
| platform-api | 否 | 纯 Go |
| app-manager | 否 | 纯 Go |

device-control 有可选的 CGo 代码（dlopen/dlsym 用于 lens HAL 桥接）位于 `//go:build linux && cgo` 标签后。禁用 CGo 时，stub 返回错误并改用 gRPC lens client 路径。

## 6 Layer 2：原生 C/C++ 构建

添加 HAL stub 库和 camera-daemon 的主机架构构建。

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| CMake | 3.16+ | `cmake --version` |
| GCC/G++ | 10+（C++20） | `g++ --version` |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` |

```bash
make layer2
# 等同于：make layer1 hal-v2 camera-daemon
```

额外输出：
- `build/output/hal/stub/libaipc_hal*.so`（stub HAL）
- `build/output/camera-daemon`（原生二进制）

> HAL v2 使用 `libaipc_hal` 前缀，HAL v1 使用 `libhal` 前缀。两者共存于不同的构建目标中。

## 7 Layer 3：Hailo-15 交叉编译

需要 Hailo Yocto Poky SDK 进行 ARM 交叉编译。

### 通用交叉编译

```bash
# ARM64 Go 服务
GOOS=linux GOARCH=arm64 make platform

# 指定 SoC 的 HAL
export CROSS_COMPILE=aarch64-linux-gnu-
export TARGET_SOC=hailo15
make hal
```

### 前置条件

- Hailo SDK 4.0.23 安装在 `/opt/poky/4.0.23/`
- 可从 Hailo 开发者门户获取

### 构建步骤

```bash
# 加载 SDK 环境（设置 CC, CXX, CMAKE_TOOLCHAIN_FILE 等）
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux

# 验证交叉编译器
echo $CC   # 应显示：aarch64-poky-linux-gcc

# 构建 Hailo-15 的 HAL v2
make hal-v2 PLATFORM=hailo15

# 交叉编译 camera-daemon（使用 SDK 的 cmake toolchain）
mkdir -p platform/camera-daemon/build && cd platform/camera-daemon/build
cmake -DCMAKE_TOOLCHAIN_FILE=$OECORE_TARGET_SYSROOT/../cmake/toolchain-file.cmake ..
make -j$(nproc)
```

### 部署到设备

```bash
# HAL 库
scp build/output/hal/hailo15/*.so root@192.168.93.72:/opt/aipc/lib/hal/

# 平台服务（Go ARM64 二进制）
scp build/output/device-control build/output/event-bus \
    build/output/app-manager build/output/platform-api \
    root@192.168.93.72:/opt/aipc/bin/

# Camera daemon
scp build/output/camera-daemon root@192.168.93.72:/opt/aipc/bin/
```

## 8 项目结构

```
aipc/
├── platform/          # 平台服务（Go + C++）
│   ├── ai-runtime/    # AI 推理服务
│   ├── event-bus/     # 事件消息总线
│   ├── device-control/# 设备/MCU 控制
│   ├── device-discovery/ # 网络设备发现
│   ├── app-manager/   # 容器生命周期管理
│   ├── platform-api/  # HTTP API 网关
│   ├── camera-daemon/ # 视频采集/编码（C++）
│   └── common/        # 共享 Go 库
│
├── hal/               # 硬件抽象层（C）
│   ├── include/       # HAL 接口头文件
│   ├── media/         # 摄像头/ISP 实现
│   ├── accel/         # AI 加速器实现
│   └── board/         # MCU/GPIO 实现
│
├── hal_v2/            # 新一代 HAL（C++），Hailo-15 优选
│
├── sdk/               # 开发者 SDK
│   └── python/        # Python SDK
│
├── web/               # Web 控制台（React 19 + TypeScript + Vite）
├── apps/              # 示例应用
├── docs/              # 文档
├── configs/           # 配置模板
└── tools/             # 开发工具
```

## 9 开发工作流

### 平台服务开发（Go）

```bash
cd platform/ai-runtime/server

# 修改代码后构建
go build -o ai-runtime .

# 本地运行（测试用）
./ai-runtime --config ../../../configs/ai/ai-runtime.yaml

# 格式化代码
go fmt ./...

# 运行测试
go test ./...
```

### HAL 开发（C/C++）

```bash
cd hal

# 编辑接口或实现
vim include/hal_video.h
vim media/hailo15_impl.c

# 构建
mkdir -p build && cd build
cmake .. -DTARGET_SOC=hailo15
make

# 测试
./tests/test_video
```

### Python SDK 开发

```bash
cd sdk/python

# 修改代码
vim hailo_ipc_sdk/inference.py

# 开发模式安装
pip3 install -e .

# 运行测试
pytest tests/

# 格式化代码
black hailo_ipc_sdk/

# 类型检查
mypy hailo_ipc_sdk/
```

### 应用开发

```bash
cd apps/my-app

# 编辑应用
vim app.py

# 本地测试（服务运行时）
python3 app.py

# 构建容器
docker build -t my-app:dev .

# 导出
docker save my-app:dev -o my-app.tar
```

## 10 IDE 配置

### VS Code

```json
{
  "go.toolsManagement.autoUpdate": true,
  "go.lintTool": "golangci-lint",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools"
}
```

### GoLand / CLion

- 导入项目为 Go Module
- 启用 Go Modules 支持
- 为 C++ 组件配置 CMake

## 11 调试

### Go 服务调试

```bash
# 使用 delve
cd platform/ai-runtime/server
dlv debug -- --config config.yaml

# 设置断点
(dlv) break main.main
(dlv) continue
```

### Python SDK 调试

```bash
export DEBUG=1
export LOG_LEVEL=DEBUG
python3 -m pdb my_app.py
```

### HAL 调试

```bash
export HAL_DEBUG=1
export HAL_LOG_LEVEL=DEBUG
gdb --args ./test_program
```

### 查看日志

```bash
# 系统日志（设备上）
journalctl -u ai-runtime -f

# 应用日志
tail -f /opt/aipc/logs/apps/<app-id>/stdout.log

# 服务日志
tail -f /opt/aipc/logs/ai-runtime.log
```

### gRPC 调用追踪

```bash
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
./ai-runtime --config config.yaml
```

### 系统资源监控

```bash
# CPU 和内存
top -p $(pgrep -d',' aipc)

# NPU 利用率
watch -n 1 'cat /sys/class/hailo/hailo0/device_utilization'

# SHM 使用
ls -lh /run/aipc/shm/
```

## 12 测试

### 单元测试

```bash
./scripts/run_unit_tests.sh
# 或单独运行
go test ./platform/...
cd sdk/python && pytest
```

### 集成测试

```bash
./scripts/run_integration_tests.sh
# 或手动运行
cd tests/integration
go test -v ./...
```

### 手动测试

```bash
./scripts/start_mvp.sh
./tools/aipc-cli/aipc-cli app list
./tools/aipc-cli/aipc-cli device status
cd sdk/python && pytest tests/
```

## 13 常用构建目标

```bash
make proto                  # 生成 Go protobuf 代码
make platform               # 构建所有 Go 服务
make platform-device-control # 仅构建 device-control
make hal-v2                 # 构建 HAL v2（PLATFORM=stub，默认）
make hal-v2 PLATFORM=hailo15 # 构建 Hailo-15 的 HAL v2
make camera-daemon          # 构建 camera-daemon（原生）
make aipc-cli               # 构建 CLI 工具
make tools                  # 构建 shm-reader、nv12-to-jpeg
make web                    # 构建 Web 控制台
make sdk-python             # 构建 Python SDK
make install                # 安装到 /opt/aipc
make clean                  # 清理构建产物
make env-check              # 检查构建依赖
make help                   # 显示所有目标
make all                    # 构建 layer1 + layer2 全部组件
make test                   # 运行所有测试
make fmt                    # 格式化代码
make lint                   # 代码静态检查
```

## 14 发布打包

构建全部并生成自包含部署包：

```bash
# 本地 stub 发布（测试用）
make pack
make pack VERSION=nx-1.0

# Hailo-15 完整发布（需要 SDK）
make pack-release SDK_PATH=/opt/poky/4.0.23
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0

# Legacy 打包脚本（仍可用，内部委托给 Makefile）
./scripts/pack_release.sh --version nx-1.0
./scripts/pack_release.sh --sdk-path /opt/poky/4.0.23 --version nx-1.0
./scripts/pack_release.sh --skip-build --version nx-1.0   # 仅重新打包
```

输出：`build/release/aipc-<platform>-<version>.tar.gz`

### 发布包内容

| 路径 | 内容 |
|------|------|
| `opt/aipc/bin/` | 所有二进制文件（服务、CLI、工具） |
| `opt/aipc/lib/hal/` | HAL 共享库 |
| `opt/aipc/etc/` | 配置文件 |
| `opt/aipc/web/` | Web 控制台资源 |
| `opt/aipc/models/` | HEF 模型文件（如有） |
| `opt/aipc/swagger-ui/` | API 文档 |
| `systemd/` | systemd 服务单元 |
| `deploy.sh` | 热替换部署脚本 |
| `VERSION` | 版本元数据 |

### 部署到设备

```bash
scp build/release/aipc-hailo15-nx-1.0.tar.gz root@192.168.93.72:/tmp/
ssh root@192.168.93.72
cd /tmp && tar xzf aipc-hailo15-nx-1.0.tar.gz
cd aipc-hailo15-nx-1.0 && ./deploy.sh

# 回滚
./deploy.sh --rollback
```

## 15 常见任务

### 添加新 Protobuf 消息

```bash
vim platform/ai-runtime/proto/inference.proto
cd platform/ai-runtime/proto
protoc --go_out=. --go_opt=paths=source_relative \
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \
       inference.proto
```

### 添加新 HAL 函数

```c
// 1. 编辑接口
vim hal/include/hal_video.h

// 2. 为每个 SoC 实现
vim hal/media/hailo15_impl.c
vim hal/media/rk3588_impl.c

// 3. 更新文档
vim docs/hal/interfaces.md
```

### 添加新 SDK 方法

```python
# 1. 添加到 SDK
vim sdk/python/hailo_ipc_sdk/inference.py

# 2. 更新文档字符串
# 3. 添加示例
vim sdk/python/README.md

# 4. 添加测试
vim sdk/python/tests/test_inference.py
```

### 添加新配置选项

```bash
# 1. 更新 YAML 模板
vim configs/ai/ai-runtime.yaml

# 2. 更新 Go 结构体
vim platform/ai-runtime/server/main.go

# 3. 更新文档
vim docs/configuration.md
```

## 16 性能分析

### Go 性能分析

```bash
# CPU 分析
go test -cpuprofile=cpu.prof -bench=.
go tool pprof cpu.prof

# 内存分析
go test -memprofile=mem.prof -bench=.
go tool pprof mem.prof
```

### Python 性能分析

```python
import cProfile
import pstats

cProfile.run('my_function()', 'output.prof')
stats = pstats.Stats('output.prof')
stats.sort_stats('cumulative')
stats.print_stats()
```

### 系统性能分析

```bash
# perf（Linux）
perf record -g ./ai-runtime
perf report

# valgrind（内存泄漏）
valgrind --leak-check=full ./camera-daemon
```

## 17 常见构建问题

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

```bash
rm -rf platform/camera-daemon/build
mkdir platform/camera-daemon/build && cd platform/camera-daemon/build
cmake ..  # 重新配置
```

### HAL v2 hailo15 构建失败 — SDK 未找到

```bash
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux
make hal-v2 PLATFORM=hailo15
```

## 18 运行时问题排查

### 服务无法启动

```bash
# 查看日志
journalctl -u ai-runtime -n 100

# 校验配置
aipc-cli config validate

# 检查依赖服务
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api
```

### gRPC 连接被拒

```bash
# 检查 socket 文件是否存在
ls -l /run/aipc/*.sock

# 检查权限
stat /run/aipc/ai-runtime.sock

# 测试连接
grpcurl -plaintext -unix:///run/aipc/ai-runtime.sock list
```

### CPU 使用率过高

```bash
# 分析服务性能
go tool pprof http://localhost:9090/debug/pprof/profile

# 检查 goroutine
go tool pprof http://localhost:9090/debug/pprof/goroutine
```

## 19 相关文档

- [平台架构](../3-software-platform/0-platform-architecture.md) — NE503 软件平台整体架构
- [贡献指南](./1-contributing.md) — 代码风格、Git 工作流和 PR 流程
- [测试环境搭建](./2-test-environment.md) — 测试层级和测试环境配置
- [部署指南](./3-deployment.md) — 跨平台部署和发布打包
- [HAL 移植指南](./4-hal-porting.md) — HAL 层接口实现和 SoC 移植
- [配置参考](../6-advanced-reference/1-config-reference.md) — 所有服务配置文件参数
