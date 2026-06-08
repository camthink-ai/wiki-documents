---
description: NE503 AIPC 平台开发环境搭建指南，涵盖系统要求、依赖安装、项目初始化和 IDE 配置。
keywords: [NE503, 开发环境, 环境搭建, Go, Node.js, protoc, IDE]
tags: [平台开发, NE503, 环境搭建, 开发者]
---

# Development Environment

本文档指导你搭建 NE503 AIPC 平台的完整开发环境，包括 Go 服务开发、Web 控制台开发、Python SDK 开发，以及通过 stub HAL 模拟硬件的端到端构建验证。

## 1 系统要求

**操作系统：**

| 系统 | 支持程度 | 说明 |
|------|---------|------|
| Ubuntu 22.04+ | 完全支持 | 推荐，所有构建层级均可用 |
| macOS (Intel / Apple Silicon) | 部分支持 | Layer 1/2 可用，Layer 3 交叉编译需 Linux |
| Windows WSL2 | 未测试 | 理论可行，建议使用原生 Linux |

**硬件最低要求：** 4 核 CPU、8 GB 内存、20 GB 磁盘。仅 Go/Web 开发时 4 GB 内存即可。建议配置：8 核 CPU、16 GB 内存、50 GB 磁盘。

## 2 快速安装

项目提供自动化脚本 `scripts/setup_env.sh`，支持 Ubuntu/Debian（apt）和 macOS（brew），按构建层级安装：

```bash
./scripts/setup_env.sh layer1    # Go + Node.js + protoc + Python（通用构建）
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC C++（原生 C/C++ 构建）
./scripts/setup_env.sh layer3    # + Hailo SDK 说明（交叉编译）
```

脚本自动检测已有工具并跳过。首次搭建建议直接运行 `./scripts/setup_env.sh layer2`。

## 3 手动安装

### Ubuntu 22.04

**Layer 1（通用构建）：**

```bash
# Go 1.25+
sudo add-apt-repository -y ppa:longsleep/golang-backports
sudo apt-get update -qq && sudo apt-get install -y golang-go

# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs && npm install -g pnpm

# protoc + Go 插件
sudo apt-get install -y protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"

# Python 3 + 开发工具
sudo apt-get install -y python3 python3-pip
pip3 install grpcio grpcio-tools pytest pytest-cov black flake8
```

**Layer 2（C/C++ 构建，Layer 1 基础上追加）：**

```bash
sudo apt-get install -y build-essential cmake protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

### macOS

```bash
brew install go node protobuf cmake grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
npm install -g pnpm
export PATH="$PATH:$(go env GOPATH)/bin"
```

> macOS C/C++ 工具链通过 `xcode-select --install` 安装。

### 依赖版本一览

| 工具 | 最低版本 | 检查命令 | 用途 |
|------|---------|---------|------|
| Go | 1.25+ | `go version` | 平台服务 |
| Node.js | 20+ | `node --version` | Web 控制台 |
| pnpm | 最新 | `pnpm --version` | Web 依赖管理 |
| protoc | 3.12+ | `protoc --version` | gRPC 代码生成 |
| protoc-gen-go | 最新 | `which protoc-gen-go` | Go protobuf 插件 |
| protoc-gen-go-grpc | 最新 | `which protoc-gen-go-grpc` | Go gRPC 插件 |
| Python | 3.8+ | `python3 --version` | SDK 开发 |
| CMake | 3.16+ | `cmake --version` | C/C++ 构建（Layer 2） |
| GCC/G++ | 10+ | `g++ --version` | C/C++ 编译（Layer 2） |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` | camera-daemon（Layer 2） |

## 4 依赖验证

```bash
make env-check
```

该命令会逐项检查 Layer 1-3 所有依赖并报告状态。Layer 3 的 Hailo SDK 提示 `NOT FOUND` 是正常的，仅在交叉编译时需要。

## 5 获取源码

```bash
git clone <repo-url> && cd ne503

# 下载 Go 依赖
go mod download

# 安装 Python SDK（开发模式）
cd sdk/python && pip3 install -e . && cd ../..
```

项目根目录结构：

```
ne503/
├── platform/      # 平台服务（Go + C++）
├── hal/           # HAL v1（C，legacy）
├── hal_v2/        # HAL v2（C++，推荐）
├── sdk/           # 开发者 SDK（Python / Go）
├── web/           # Web 控制台（React + TypeScript）
├── apps/          # 示例应用
├── configs/       # 配置模板
├── tools/         # 开发工具
└── scripts/       # 构建/测试/部署脚本
```

> 详细的目录结构说明参见 [平台架构](./0-platform-architecture.md)。

## 6 IDE 配置

### VS Code（推荐）

推荐扩展：**Go** (`golang.go`)、**Python** (`ms-python.python`)、**C/C++** (`ms-vscode.cpptools`)、**CMake Tools** (`ms-vscode.cmake-tools`)、**Protocol Buffers** (`bufbuild.vscode-buf`)、**ESLint** (`dbaeumer.vscode-eslint`)。

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "go.toolsManagement.autoUpdate": true,
  "go.lintTool": "golangci-lint",
  "go.testFlags": ["-v", "-race"],
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools",
  "editor.formatOnSave": true,
  "[go]": { "editor.defaultFormatter": "golang.go" },
  "[python]": { "editor.defaultFormatter": "ms-python.black-formatter" }
}
```

### GoLand / CLion

- **GoLand**：打开项目根目录，自动识别 `go.mod`；确认 Go Modules 集成已启用；配置 File Watcher 自动运行 `go fmt`
- **CLion**：在 CMake 配置中指向 `hal_v2/` 或 `platform/camera-daemon/`；交叉编译时配置工具链指向 Hailo SDK

## 7 验证环境

运行 Layer 1 构建验证环境配置是否正确：

```bash
make layer1
```

该命令编译 protobuf 定义、构建所有 Go 平台服务、Web 控制台和 Python SDK。首次构建约 3-5 分钟。成功后输出文件位于 `build/output/`，包括 `device-control`、`event-bus`、`app-manager`、`platform-api`、`device-discovery` 和 `web/dist/`。

如需验证 Layer 2（含 HAL stub 和 camera-daemon），运行 `make layer2`。

> 构建失败时先运行 `make env-check` 确认依赖。常见问题参见 [构建与部署](./2-build-and-deploy.md)。

## 8 相关文档

- [平台架构](./0-platform-architecture.md) — 四层架构和核心服务详解
- [构建与部署](./2-build-and-deploy.md) — 分层构建、交叉编译和部署流程
- [HAL 移植指南](./3-hal-porting.md) — HAL v2 接口实现和 SoC 移植
- [应用开发参考](../4-application-development/1-app-reference.md) — 应用容器开发和 Python SDK 使用
