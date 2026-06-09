---
description: NE503 AIPC platform development environment setup guide, covering system requirements, dependency installation, project initialization, and IDE configuration.
keywords: [NE503, development environment, environment setup, Go, Node.js, protoc, IDE]
tags: [platform development, NE503, environment setup, developer]
---

# Development Environment

This document guides you through setting up the complete development environment for the NE503 AIPC platform, including Go service development, web console development, Python SDK development, and end-to-end build verification using the stub HAL to simulate hardware.

## 1 System Requirements

**Operating System:**

| System | Support Level | Notes |
|--------|--------------|-------|
| Ubuntu 22.04+ | Fully supported | Recommended; all build layers available |
| macOS (Intel / Apple Silicon) | Partially supported | Layer 1/2 available; Layer 3 cross-compilation requires Linux |
| Windows WSL2 | Untested | Theoretically feasible; native Linux recommended |

**Minimum hardware:** 4-core CPU, 8 GB RAM, 20 GB disk. For Go/web development only, 4 GB RAM is sufficient. Recommended configuration: 8-core CPU, 16 GB RAM, 50 GB disk.

## 2 Quick Install

The project provides an automated script `scripts/setup_env.sh` that supports Ubuntu/Debian (apt) and macOS (brew), installing dependencies by build layer:

```bash
./scripts/setup_env.sh layer1    # Go + Node.js + protoc + Python (general build)
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC C++ (native C/C++ build)
./scripts/setup_env.sh layer3    # + Hailo SDK instructions (cross-compilation)
```

The script automatically detects existing tools and skips them. For first-time setup, we recommend running `./scripts/setup_env.sh layer2` directly.

## 3 Manual Install

### Ubuntu 22.04

**Layer 1 (General Build):**

```bash
# Go 1.25+
sudo add-apt-repository -y ppa:longsleep/golang-backports
sudo apt-get update -qq && sudo apt-get install -y golang-go

# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs && npm install -g pnpm

# protoc + Go plugins
sudo apt-get install -y protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"

# Python 3 + development tools
sudo apt-get install -y python3 python3-pip
pip3 install grpcio grpcio-tools pytest pytest-cov black flake8
```

**Layer 2 (C/C++ Build, on top of Layer 1):**

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

> Install the macOS C/C++ toolchain via `xcode-select --install`.

### Dependency Versions

| Tool | Minimum Version | Check Command | Purpose |
|------|----------------|---------------|---------|
| Go | 1.25+ | `go version` | Platform services |
| Node.js | 20+ | `node --version` | Web console |
| pnpm | Latest | `pnpm --version` | Web dependency management |
| protoc | 3.12+ | `protoc --version` | gRPC code generation |
| protoc-gen-go | Latest | `which protoc-gen-go` | Go protobuf plugin |
| protoc-gen-go-grpc | Latest | `which protoc-gen-go-grpc` | Go gRPC plugin |
| Python | 3.8+ | `python3 --version` | SDK development |
| CMake | 3.16+ | `cmake --version` | C/C++ build (Layer 2) |
| GCC/G++ | 10+ | `g++ --version` | C/C++ compilation (Layer 2) |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` | camera-daemon (Layer 2) |

## 4 Dependency Verification

```bash
make env-check
```

This command checks all Layer 1-3 dependencies one by one and reports their status. A `NOT FOUND` prompt for the Layer 3 Hailo SDK is normal — it is only needed for cross-compilation.

## 5 Get the Source Code

```bash
git clone <repo-url> && cd ne503

# Download Go dependencies
go mod download

# Install Python SDK (development mode)
cd sdk/python && pip3 install -e . && cd ../..
```

Project root directory structure:

```
ne503/
├── platform/      # Platform services (Go + C++)
├── hal/           # HAL v1 (C, legacy)
├── hal_v2/        # HAL v2 (C++, recommended)
├── sdk/           # Developer SDK (Python / Go)
├── web/           # Web console (React + TypeScript)
├── apps/          # Example applications
├── configs/       # Configuration templates
├── tools/         # Development tools
└── scripts/       # Build/test/deploy scripts
```

> For a detailed directory structure description, see [Platform Architecture](./0-platform-architecture.md).

## 6 IDE Configuration

### VS Code (Recommended)

Recommended extensions: **Go** (`golang.go`), **Python** (`ms-python.python`), **C/C++** (`ms-vscode.cpptools`), **CMake Tools** (`ms-vscode.cmake-tools`), **Protocol Buffers** (`bufbuild.vscode-buf`), **ESLint** (`dbaeumer.vscode-eslint`).

Create `.vscode/settings.json` in the project root:

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

- **GoLand**: Open the project root directory; it will automatically detect `go.mod`. Confirm that Go Modules integration is enabled. Configure a File Watcher to run `go fmt` automatically.
- **CLion**: Point the CMake configuration to `hal_v2/` or `platform/camera-daemon/`. For cross-compilation, configure the toolchain to point to the Hailo SDK.

## 7 Verify the Environment

Run the Layer 1 build to verify that the environment is configured correctly:

```bash
make layer1
```

This command compiles protobuf definitions, builds all Go platform services, the web console, and the Python SDK. The first build takes approximately 3-5 minutes. On success, output files are located in `build/output/`, including `device-control`, `event-bus`, `app-manager`, `platform-api`, `device-discovery`, and `web/dist/`.

To verify Layer 2 (including HAL stub and camera-daemon), run `make layer2`.

> If the build fails, run `make env-check` first to verify dependencies. For common issues, see [Build and Deploy](./2-build-and-deploy.md).

## 8 Related Documentation

- [Platform Architecture](./0-platform-architecture.md) — Four-layer architecture and core service details
- [Build and Deploy](./2-build-and-deploy.md) — Layered build, cross-compilation, and deployment process
- [Application Development Reference](../4-application-development/1-app-reference.md) — Application container development and Python SDK usage
