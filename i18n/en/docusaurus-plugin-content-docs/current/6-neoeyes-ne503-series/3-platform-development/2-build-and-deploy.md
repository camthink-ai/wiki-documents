---
description: NE503 AIPC platform build and deployment guide, covering layered builds, project structure, development workflows, debugging tips, and release packaging.
keywords: [NE503, build, deploy, Makefile, Docker, HAL, release packaging]
tags: [platform development, NE503, build, deploy]
---

# Build and Deploy

The NE503 AIPC platform uses a three-tier progressive build system: Layer 1 can be completed on any development machine, Layer 2 adds native simulation components, and Layer 3 cross-compiles for the Hailo-15H target device. Starting from the project structure, this document follows a single thread of Build -> Verify -> Debug -> Deploy -> Package, covering the complete development lifecycle.

## 1 Build Overview

### 1.1 Three-Tier Build System

| Tier | Contents | Requirements | Command |
|------|----------|-------------|---------|
| Layer 1 | Go services + Web console + Python SDK | Go, Node, protoc | `make layer1` |
| Layer 2 | + HAL stub + camera-daemon + ai-runtime + CLI + tools | + cmake, g++, gRPC | `make layer2` |
| Layer 3 | Hailo-15H cross-compilation (ARM64) | + Hailo SDK 4.0.23 | See [Section 5](#5-layer-3-cross-compilation-hailo-15h-target) |

```bash
# Check current environment
make env-check

# No hardware dependencies, works on any Linux/macOS
make layer1

# Requires cmake/g++/gRPC (native simulation)
make layer2
```

### 1.2 Environment Requirements

```bash
# Automatic installation (Ubuntu/macOS)
./scripts/setup_env.sh layer1    # Go + Node + protoc
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC
./scripts/setup_env.sh layer3    # + Hailo SDK instructions
```

**Manual Installation -- Ubuntu 22.04**

```bash
# Layer 1
sudo apt install -y golang-go nodejs protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"

# Layer 2
sudo apt install -y build-essential cmake protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev

# Python tools
pip3 install grpcio grpcio-tools pytest pytest-cov black flake8
```

**Manual Installation -- macOS**

```bash
brew install go node protobuf cmake grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

## 2 Project Structure

```
aipc/
├── platform/              # Platform services (Go + C++)
│   ├── ai-runtime/        # AI inference service (C++)
│   ├── event-bus/         # Event message bus (Go)
│   ├── device-control/    # Device/MCU control (Go)
│   ├── device-discovery/  # Network device discovery (Go)
│   ├── app-manager/       # Container lifecycle management (Go)
│   ├── platform-api/      # HTTP API gateway (Go)
│   ├── camera-daemon/     # Video capture/encoding (C++)
│   └── common/            # Shared Go libraries
│
├── hal/                   # HAL v1 (C, legacy)
│   ├── include/           # HAL interface headers
│   ├── media/             # Camera/ISP implementation
│   ├── accel/             # AI accelerator implementation
│   └── board/             # MCU/GPIO implementation
│
├── hal_v2/                # HAL v2 (C++, modular, recommended)
│   ├── include/           # media / model / peripheral / dsp interfaces
│   └── src/               # Platform implementations (stub / hailo15)
│
├── sdk/                   # Developer SDK
│   ├── python/            # Python SDK (hailo_ipc_sdk)
│   └── go/                # Go SDK
│
├── web/                   # Web console (React 19 + TypeScript + Vite)
├── apps/                  # Container app examples (10+)
├── configs/               # YAML configuration templates
│   ├── platform/          # Platform service configs
│   ├── ai/                # AI inference configs
│   └── security/          # Security policies (seccomp)
├── systemd/               # systemd service units
├── tools/                 # Development tools
│   ├── aipc-cli/          # CLI management tool (Go)
│   └── shm-reader/        # Shared memory debug tool (C++)
├── scripts/               # Build/test/deploy scripts
├── docker/                # Docker development environment
├── docs/                  # Internal documentation
└── tests/                 # Unit/integration tests
```

For details on each platform service, see the [Service Reference](../6-reference/service-reference/0-ai-runtime.md).

## 3 Layer 1: Universal Build

Layer 1 has no hardware dependencies. It produces all Go services, the Web frontend, and the Python SDK, and can be completed on any Linux/macOS machine.

### 3.1 Tool Versions

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Go | 1.25+ | `go version` |
| Node.js | 20+ | `node --version` |
| protoc | 3.12+ | `protoc --version` |
| protoc-gen-go | latest | `which protoc-gen-go` |
| protoc-gen-go-grpc | latest | `which protoc-gen-go-grpc` |
| Python | 3.8+ | `python3 --version` |

### 3.2 Build Commands and Output

```bash
make layer1
# Equivalent to: make proto platform web sdk-python
```

Output binaries are in `build/output/`:

```
build/output/
├── device-control       # Device control service
├── event-bus            # Event bus service
├── app-manager          # App manager service
├── platform-api         # API gateway
├── device-discovery     # Device discovery service
└── web/                 # Web console (dist/)
```

### 3.3 CGo Status

All Go platform services are compiled with `CGO_ENABLED=0` (statically linked), requiring no glibc compatibility:

| Service | CGo | Notes |
|---------|-----|-------|
| device-control | No | Optional CGo dlopen code behind build tags; uses gRPC lens client when disabled |
| event-bus | No | Pure Go |
| platform-api | No | Pure Go |
| app-manager | No | Pure Go |
| device-discovery | No | Pure Go |

### 3.4 Initialize Project

```bash
git clone <repo-url>
cd ne503

# Download Go modules
go mod download

# Install Python SDK (development mode)
cd sdk/python
pip3 install -e .
cd ../..
```

## 4 Layer 2: Native C/C++ Build

Layer 2 adds host-architecture builds of the HAL stub library, camera-daemon, ai-runtime, CLI tool, and debug tools on top of Layer 1, for local simulation and integration testing.

### 4.1 Additional Tool Requirements

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| CMake | 3.16+ | `cmake --version` |
| GCC/G++ | 10+ (C++20) | `g++ --version` |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` |

### 4.2 Build Commands and Output

```bash
make layer2
# Equivalent to: make layer1 hal-v2 camera-daemon ai-runtime aipc-cli tools
```

Additional output:

```
build/output/
├── ai-runtime               # AI inference service (C++)
├── camera-daemon            # Camera daemon (C++)
├── aipc-cli                 # CLI management tool
├── shm-reader               # Shared memory reader tool
├── nv12-to-jpeg             # Image format converter
└── hal/
    └── stub/
        └── libaipc_hal*.so  # HAL stub shared library
```

> HAL v2 uses the `libaipc_hal` prefix, while HAL v1 uses the `libhal` prefix. Both coexist in different build targets.

### 4.3 Build Verification

```bash
# Check Go binary architecture (should be statically linked)
file build/output/device-control
# ELF 64-bit LSB executable, x86-64 ...

# Check C++ binary dynamic dependencies
ldd build/output/camera-daemon
# libstdc++.so.6 / libgcc_s.so.1 / libc.so.6 ...

# Confirm HAL stub library exists
ls build/output/hal/stub/libaipc_hal*.so
```

## 5 Layer 3: Cross-Compilation (Hailo-15H Target)

Layer 3 uses the Hailo Yocto Poky SDK to cross-compile the HAL libraries and C++ services into ARM64 architecture for deployment on NE503 devices.

### 5.1 Prerequisites

- Hailo SDK 4.0.23 installed at `/opt/poky/4.0.23/` (available from the Hailo developer portal)
- Load the SDK environment (sets `CC`, `CXX`, `CMAKE_TOOLCHAIN_FILE`, etc.)

### 5.2 Go Service Cross-Compilation

Go services natively support cross-compilation without the Hailo SDK:

```bash
# ARM64 (NE503 device architecture)
GOOS=linux GOARCH=arm64 make platform
```

When `HAL_PLATFORM=hailo15`, the Makefile automatically sets `CGO_ENABLED=0 GOOS=linux GOARCH=arm64`:

```bash
make platform HAL_PLATFORM=hailo15
```

### 5.3 HAL v2 Cross-Compilation

```bash
# Load SDK environment
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux

# Verify cross-compiler
echo $CC
# Output: aarch64-poky-linux-gcc

# Build HAL v2 for Hailo-15
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### 5.4 camera-daemon and ai-runtime Cross-Compilation

```bash
# camera-daemon
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23

# ai-runtime
make ai-runtime HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### 5.5 Verify Cross-Compiled Artifacts

```bash
# Confirm ARM64 architecture
file build/output/camera-daemon
# ELF 64-bit LSB executable, ARM aarch64

file build/output/hal/hailo15/libaipc_hal.so
# ELF 64-bit LSB shared object, ARM aarch64

# Verify on target device
ssh root@192.168.93.72 "uname -m"
# aarch64
```

## 6 Development Workflow

### 6.1 Platform Service Development (Go)

```bash
# Modify code
cd platform/device-control/server
vim main.go

# Build individually
make device-control

# Or use go build directly
go build -o device-control .

# Run locally (for testing)
./device-control --config ../../../configs/platform/device-control.yaml

# Run unit tests
go test ./...

# Format
go fmt ./...
```

### 6.2 HAL Development (C/C++)

```bash
# Edit HAL v2 interfaces or implementations
vim hal_v2/include/media/hal_media.h
vim hal_v2/src/media/hailo15/media_manager.cpp

# Build stub version to verify compilation
make hal-v2

# Build Hailo-15 version (requires SDK)
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

For details on HAL interface implementation and SoC porting, see the [HAL Porting Guide](./3-hal-porting.md).

### 6.3 SDK Development (Python)

```bash
cd sdk/python

# Install in development mode
pip3 install -e .

# Run tests
pytest tests/

# Format code
black hailo_ipc_sdk/

# Build SDK documentation
make -C docs/en html
```

### 6.4 Web Console Development

```bash
cd web

# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## 7 Debugging

### 7.1 gRPC Debugging

```bash
# Enable full gRPC tracing
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
./device-control --config configs/platform/device-control.yaml

# Test Unix socket with grpcurl
grpcurl -plaintext -unix /run/aipc/device-control.sock list
```

### 7.2 Log Levels

```bash
# View service logs on device
journalctl -u camera-daemon -f
journalctl -u ai-runtime -n 100

# Application logs
tail -f /opt/aipc/logs/apps/<app-id>/stdout.log

# Set Go service log level
export LOG_LEVEL=DEBUG
./platform-api --config configs/platform-api.yaml
```

### 7.3 Socket Debugging

```bash
# Check socket files
ls -l /run/aipc/*.sock

# Check socket permissions
stat /run/aipc/device-control.sock

# Test gRPC connection
grpcurl -plaintext -unix /run/aipc/ai-runtime.sock list
```

### 7.4 Go Service Debugging (delve)

```bash
cd platform/device-control/server
dlv debug -- --config config.yaml

# Set breakpoint
(dlv) break main.main
(dlv) continue
```

### 7.5 HAL Debugging

```bash
export HAL_DEBUG=1
export HAL_LOG_LEVEL=DEBUG
gdb --args ./test_program
```

### 7.6 System Resource Monitoring

```bash
# CPU and memory (all aipc processes)
top -p $(pgrep -d',' aipc)

# NPU utilization
watch -n 1 'cat /sys/class/hailo/hailo0/device_utilization'

# Shared memory usage
ls -lh /run/aipc/shm/
```

For more debugging and troubleshooting, see [Troubleshooting](../6-reference/2-troubleshooting.md).

## 8 Common Make Targets

### 8.1 Build Targets

| Target | Description |
|--------|-------------|
| `make layer1` | proto + Go services + Web + Python SDK |
| `make layer2` | Layer 1 + HAL stub + camera-daemon + ai-runtime + tools |
| `make all` | proto + HAL v2 + platform services |
| `make proto` | Compile all .proto files to generate Go code |
| `make platform` | Build all Go services (CGO_ENABLED=0) |
| `make hal-v2` | Build HAL v2 (default stub; `HAL_PLATFORM=hailo15` for cross-compilation) |
| `make camera-daemon` | Build C++ camera-daemon |
| `make ai-runtime` | Build C++ AI inference service |
| `make web` | Build Web console (pnpm) |
| `make sdk-python` | Build Python SDK |
| `make sdk-go` | Build Go SDK |
| `make aipc-cli` | Build CLI tool |
| `make tools` | Build shm-reader, nv12-to-jpeg |

### 8.2 Individual Service Build

```bash
make device-control       # Build device-control only
make event-bus            # Build event-bus only
make app-manager          # Build app-manager only
make platform-api         # Build platform-api only
make device-discovery     # Build device-discovery only
```

### 8.3 Tools and Maintenance

| Target | Description |
|--------|-------------|
| `make env-check` | Check if build dependencies are met |
| `make clean` | Clean build artifacts |
| `make distclean` | Deep clean (including node_modules) |
| `make fmt` | Format code (Go + C/C++) |
| `make lint` | Static analysis (golangci-lint) |
| `make install` | Install to `/opt/aipc` |

### 8.4 Test Targets

| Target | Description |
|--------|-------------|
| `make test` | Run all tests (unit + integration) |
| `make test-unit` | Go unit tests (`go test -race ./platform/...`) |
| `make test-integration` | Integration tests |
| `make test-e2e` | End-to-end tests |

For detailed testing procedures, see [Platform Testing](../6-reference/0-platform-testing.md).

## 9 Device Deployment

### 9.1 Quick Deployment (scp single file)

Suitable for rapid updates during iterative development:

```bash
# Deploy a single Go service
scp build/output/device-control root@192.168.93.72:/opt/aipc/bin/

# Restart service
ssh root@192.168.93.72 "systemctl restart device-control"
```

### 9.2 Make Remote Deployment (Recommended)

The Makefile includes built-in remote deployment capabilities, supporting per-service hot replacement:

```bash
# Set up SSH passwordless login (first time)
make setup-ssh TARGET=root@192.168.93.72

# Initialize remote directory structure (first deployment)
make deploy-init TARGET=root@192.168.93.72

# Rapid iterative deployment of all modules (no packaging, per-service scp + restart)
make deploy-all TARGET=root@192.168.93.72

# Deploy a single service
make deploy-device-control TARGET=root@192.168.93.72
make deploy-camera-daemon TARGET=root@192.168.93.72 SDK_PATH=/opt/poky/4.0.23
```

Services are deployed in dependency order: device-control -> event-bus -> app-manager -> platform-api -> camera-daemon -> ai-runtime -> web.

### 9.3 Custom Installation Path

When device `/opt` space is limited, you can specify an alternate path:

```bash
# Initialize to /data/aipc
make deploy-init TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc

# Deploy to custom path
make deploy-all TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc
```

`deploy-init` automatically handles directory creation, data migration, symlink updates, systemd unit and YAML configuration path replacement.

### 9.4 Release Package Deployment

Deploy using a release tarball (includes automatic backup and rollback):

```bash
# Build Hailo-15 release package
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0

# Transfer to device
scp build/release/aipc-hailo15-nx-1.0.tar.gz root@192.168.93.72:/tmp/

# Execute hot replacement deployment on device
ssh root@192.168.93.72
cd /tmp && tar xzf aipc-hailo15-nx-1.0.tar.gz
cd aipc-hailo15-nx-1.0 && ./deploy.sh

# Rollback to previous version
./deploy.sh --rollback

# View deployment status
./deploy.sh --status
```

### 9.5 Deployment Verification

```bash
# Check all platform service statuses
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api

# List all aipc-related services
systemctl list-units --type=service | grep -E 'ai-runtime|camera-daemon|app-manager|event-bus|device-control|platform-api'

# Verify binary architecture matches
file /opt/aipc/bin/ai-runtime
# ELF 64-bit LSB executable, ARM aarch64

# Check HAL libraries
ls -l /opt/aipc/lib/hal/libaipc_hal*.so
```

## 10 Release Packaging

### 10.1 Local Stub Release

For testing and verification, no Hailo SDK required:

```bash
# Build and package (default stub platform)
make pack

# Specify version number
make pack VERSION=nx-1.0
```

### 10.2 Hailo-15 Full Release

Requires Hailo SDK to cross-compile all components:

```bash
# Specify SDK path
make pack-release SDK_PATH=/opt/poky/4.0.23

# Specify version number
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0
```

### 10.3 Legacy Packaging Script

`scripts/pack_release.sh` provides a CLI interface, delegating internally to Makefile targets:

```bash
# Stub packaging
./scripts/pack_release.sh --version nx-1.0

# Hailo-15 packaging
./scripts/pack_release.sh --sdk-path /opt/poky/4.0.23 --version nx-1.0

# Skip build, repackage only
./scripts/pack_release.sh --skip-build --version nx-1.0

# Clean and rebuild
./scripts/pack_release.sh --clean --sdk-path /opt/poky/4.0.23 --version nx-1.0
```

### 10.4 Release Package Contents

Output: `build/release/aipc-<platform>-<version>.tar.gz`

| Path | Contents |
|------|----------|
| `opt/aipc/bin/` | Binaries (services, CLI, tools) |
| `opt/aipc/lib/hal/` | HAL shared libraries |
| `opt/aipc/etc/` | YAML configuration files |
| `opt/aipc/etc/security/` | Security policies (seccomp) |
| `opt/aipc/web/` | Web console assets |
| `opt/aipc/swagger-ui/` | API documentation |
| `opt/aipc/models/` | Model directory (empty; users download via script) |
| `systemd/` | systemd service units |
| `deploy.sh` | Hot replacement deployment script |
| `VERSION` | Version metadata (version / build_date / git_commit / platform) |

### 10.5 Model File Deployment

Model files are not included in the release package and must be deployed separately:

```bash
# Copy HEF models from local directory
make models-deploy MODELS_PATH=/home/share

# Or download on remote device
make download-models TARGET=root@192.168.93.72

# Specify installation path
make download-models TARGET=root@192.168.93.72 REMOTE_PREFIX=/data/aipc
```

### 10.6 Docker Development Environment

For cross-compilation in a container:

```bash
# Build Docker image (includes Hailo SDK)
make docker-build-image SDK_PATH=/opt/poky/4.0.23

# Start persistent development container
make docker-dev
make docker-dev-shell    # Enter container

# Or mount host source code
make docker-dev-mount

# Web UI build server (:8080)
make docker-build-server
```

## 11 Common Build Issues

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

### grpc_cpp_plugin: not found (camera-daemon build)

```bash
sudo apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

### camera-daemon cmake selected wrong toolchain

CMake cache may retain stale toolchain settings. Clean and reconfigure:

```bash
rm -rf platform/camera-daemon/build
make camera-daemon
```

### HAL v2 hailo15 build failed -- SDK not found

Ensure the SDK environment is loaded and the path is specified:

```bash
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux
make hal-v2 HAL_PLATFORM=hailo15 SDK_PATH=/opt/poky/4.0.23
```

### "exec format error" (after deployment)

Build artifact architecture does not match the target device. Verify cross-compilation settings:

```bash
# Check artifact architecture
file build/output/ai-runtime

# Check target device architecture
ssh root@192.168.93.72 "uname -m"
# aarch64 -> requires ARM64 compilation
```

### Socket creation failed

Runtime directory does not exist or insufficient permissions on device:

```bash
mkdir -p /run/aipc/shm /run/aipc/sockets
chmod 777 /run/aipc
```

## 12 Related Documentation

- [Platform Architecture](./0-platform-architecture.md) -- NE503 software platform four-layer architecture and service dependencies
- [HAL Porting Guide](./3-hal-porting.md) -- HAL interface implementation and SoC porting process
- [Contributing Guide](../6-reference/1-platform-contributing.md) -- Code style, Git workflow, and PR process
- [Platform Testing](../6-reference/0-platform-testing.md) -- Test tiers and test environment configuration
- [Troubleshooting](../6-reference/2-troubleshooting.md) -- Runtime issue diagnosis and performance analysis
- [Configuration Reference](../6-reference/3-config-reference.md) -- All service configuration file parameters
- [CLI Tool](../5-system-integration/3-cli-guide.md) -- aipc-cli command-line tool usage reference
