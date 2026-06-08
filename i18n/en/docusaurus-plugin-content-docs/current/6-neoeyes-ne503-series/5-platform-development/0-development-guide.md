---
description: NE503 AIPC platform development guide, covering environment setup, project structure, layered builds, development workflows, debugging tips, and performance analysis to help platform contributors get started quickly.
keywords: [NE503 development guide, build system, development environment, project structure, debugging, performance analysis, HAL]
tags: [platform development, NE503, development guide, contributor]
---

# Development Guide

## 1 Quick Start

```bash
# Check dependencies
make env-check

# Build Go services + Web + SDK (no hardware required)
make layer1

# Build full native Linux version (stub HAL + camera-daemon)
make layer2
```

## 2 Build Layers

| Layer | Contents | Dependencies | Command |
|-------|----------|--------------|---------|
| 1 | Go services, Web, SDK | Go, Node, protoc | `make layer1` |
| 2 | + stub HAL, camera-daemon | + cmake, g++, gRPC | `make layer2` |
| 3 | Hailo-15 cross-compilation | + Hailo SDK 4.0.23 | See Section 7 |

## 3 Environment Setup

### Prerequisites

**Operating System:**
- Linux (Ubuntu 22.04+ recommended, Layer 2 requires GCC 10+)
- macOS (with limitations)
- Windows WSL2

### Automatic Installation (Ubuntu/macOS)

```bash
./scripts/setup_env.sh layer1    # Go + Node + protoc
./scripts/setup_env.sh layer2    # + cmake + g++ + gRPC
./scripts/setup_env.sh layer3    # + Hailo SDK instructions
```

### Manual Installation — Ubuntu 22.04

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

### Manual Installation — macOS

```bash
brew install go node protobuf cmake grpc
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

## 4 Initialize Project

```bash
git clone <repo-url>
cd ne503

# Initialize Go modules
go mod download

# Install Python SDK (development mode)
cd sdk/python
pip3 install -e .
cd ../..
```

## 5 Layer 1: General Build

No hardware dependencies; supports any Linux/macOS.

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Go | 1.25+ (latest stable version recommended) | `go version` |
| Node.js | 20+ | `node --version` |
| protoc | 3.12+ | `protoc --version` |
| protoc-gen-go | latest | `which protoc-gen-go` |
| protoc-gen-go-grpc | latest | `which protoc-gen-go-grpc` |
| Python | 3.8+ | `python3 --version` |

```bash
make layer1
# Equivalent to: make proto platform web sdk-python
```

Output binaries are in `build/output/`:
- `device-control`, `event-bus`, `app-manager`, `platform-api`, `device-discovery`
- `web/dist/` (Web assets)

All Go services are compiled with `CGO_ENABLED=0` (pure Go, no C dependencies), except device-control which includes optional CGo lens control code.

### CGo Status

All Go platform services are built with `CGO_ENABLED=0` (except device-control, see table below):

| Service | CGo | Notes |
|---------|-----|-------|
| device-control | No | CGo dlopen code behind build tag; uses gRPC lens client instead |
| event-bus | No | Pure Go |
| platform-api | No | Pure Go |
| app-manager | No | Pure Go |

device-control has optional CGo code (dlopen/dlsym for lens HAL bridging) behind `//go:build linux && cgo` tags. When CGo is disabled, the stub returns an error and falls back to the gRPC lens client path.

## 6 Layer 2: Native C/C++ Build

Adds HAL stub library and camera-daemon host architecture build.

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| CMake | 3.16+ | `cmake --version` |
| GCC/G++ | 10+ (C++20) | `g++ --version` |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` |

```bash
make layer2
# Equivalent to: make layer1 hal-v2 camera-daemon
```

Additional outputs:
- `build/output/hal/stub/libaipc_hal*.so` (stub HAL)
- `build/output/camera-daemon` (native binary)

> HAL v2 uses the `libaipc_hal` prefix, while HAL v1 uses the `libhal` prefix. Both coexist under different build targets.

## 7 Layer 3: Hailo-15 Cross-Compilation

### General Cross-Compilation

```bash
# ARM64 Go services
GOOS=linux GOARCH=arm64 make platform

# SoC-specific HAL
export CROSS_COMPILE=aarch64-linux-gnu-
export TARGET_SOC=hailo15
make hal
```

### Prerequisites

- Hailo SDK 4.0.23 installed at `/opt/poky/4.0.23/`
- Available from the Hailo developer portal

### Build Steps

```bash
# Load SDK environment (sets CC, CXX, CMAKE_TOOLCHAIN_FILE, etc.)
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux

# Verify cross-compiler
echo $CC   # Should display: aarch64-poky-linux-gcc

# Build HAL v2 for Hailo-15
make hal-v2 PLATFORM=hailo15

# Cross-compile camera-daemon (using SDK cmake toolchain)
mkdir -p platform/camera-daemon/build && cd platform/camera-daemon/build
cmake -DCMAKE_TOOLCHAIN_FILE=$OECORE_TARGET_SYSROOT/../cmake/toolchain-file.cmake ..
make -j$(nproc)
```

### Deploy to Device

```bash
# HAL libraries
scp build/output/hal/hailo15/*.so root@192.168.93.72:/opt/aipc/lib/hal/

# Platform services (Go ARM64 binaries)
scp build/output/device-control build/output/event-bus \
    build/output/app-manager build/output/platform-api \
    root@192.168.93.72:/opt/aipc/bin/

# Camera daemon
scp build/output/camera-daemon root@192.168.93.72:/opt/aipc/bin/
```

## 8 Project Structure

```
aipc/
├── platform/          # Platform services (Go + C++)
│   ├── ai-runtime/    # AI inference service
│   ├── event-bus/     # Event message bus
│   ├── device-control/# Device/MCU control
│   ├── device-discovery/ # Network device discovery
│   ├── app-manager/   # Container lifecycle management
│   ├── platform-api/  # HTTP API gateway
│   ├── camera-daemon/ # Video capture/encoding (C++)
│   └── common/        # Shared Go libraries
│
├── hal/               # Hardware abstraction layer (C)
│   ├── include/       # HAL interface headers
│   ├── media/         # Camera/ISP implementation
│   ├── accel/         # AI accelerator implementation
│   └── board/         # MCU/GPIO implementation
│
├── hal_v2/            # Next-generation HAL (C++), preferred for Hailo-15
│
├── sdk/               # Developer SDK
│   └── python/        # Python SDK
│
├── web/               # Web console (React 19 + TypeScript + Vite)
├── apps/              # Example applications
├── docs/              # Documentation
├── configs/           # Configuration templates
└── tools/             # Development tools
```

## 9 Development Workflow

### Platform Service Development (Go)

```bash
cd platform/ai-runtime/server

# Build after code changes
go build -o ai-runtime .

# Run locally (for testing)
./ai-runtime --config ../../../configs/ai/ai-runtime.yaml

# Format code
go fmt ./...

# Run tests
go test ./...
```

### HAL Development (C/C++)

```bash
cd hal

# Edit interfaces or implementations
vim include/hal_video.h
vim media/hailo15_impl.c

# Build
mkdir -p build && cd build
cmake .. -DTARGET_SOC=hailo15
make

# Test
./tests/test_video
```

### Python SDK Development

```bash
cd sdk/python

# Edit code
vim hailo_ipc_sdk/inference.py

# Install in development mode
pip3 install -e .

# Run tests
pytest tests/

# Format code
black hailo_ipc_sdk/

# Type check
mypy hailo_ipc_sdk/
```

### Application Development

```bash
cd apps/my-app

# Edit application
vim app.py

# Test locally (when services are running)
python3 app.py

# Build container
docker build -t my-app:dev .

# Export
docker save my-app:dev -o my-app.tar
```

## 10 IDE Configuration

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

- Import project as Go Module
- Enable Go Modules support
- Configure CMake for C++ components

## 11 Debugging

### Go Service Debugging

```bash
# Using delve
cd platform/ai-runtime/server
dlv debug -- --config config.yaml

# Set breakpoint
(dlv) break main.main
(dlv) continue
```

### Python SDK Debugging

```bash
export DEBUG=1
export LOG_LEVEL=DEBUG
python3 -m pdb my_app.py
```

### HAL Debugging

```bash
export HAL_DEBUG=1
export HAL_LOG_LEVEL=DEBUG
gdb --args ./test_program
```

### Viewing Logs

```bash
# System logs (on device)
journalctl -u ai-runtime -f

# Application logs
tail -f /opt/aipc/logs/apps/<app-id>/stdout.log

# Service logs
tail -f /opt/aipc/logs/ai-runtime.log
```

### gRPC Call Tracing

```bash
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
./ai-runtime --config config.yaml
```

### System Resource Monitoring

```bash
# CPU and memory
top -p $(pgrep -d',' aipc)

# NPU utilization
watch -n 1 'cat /sys/class/hailo/hailo0/device_utilization'

# SHM usage
ls -lh /run/aipc/shm/
```

## 12 Testing

### Unit Tests

```bash
./scripts/run_unit_tests.sh
# Or run individually
go test ./platform/...
cd sdk/python && pytest
```

### Integration Tests

```bash
./scripts/run_integration_tests.sh
# Or run manually
cd tests/integration
go test -v ./...
```

### Manual Testing

```bash
./scripts/start_mvp.sh
./tools/aipc-cli/aipc-cli app list
./tools/aipc-cli/aipc-cli device status
cd sdk/python && pytest tests/
```

## 13 Common Build Targets

```bash
make proto                  # Generate Go protobuf code
make platform               # Build all Go services
make platform-device-control # Build device-control only
make hal-v2                 # Build HAL v2 (PLATFORM=stub, default)
make hal-v2 PLATFORM=hailo15 # Build HAL v2 for Hailo-15
make camera-daemon          # Build camera-daemon (native)
make aipc-cli               # Build CLI tool
make tools                  # Build shm-reader, nv12-to-jpeg
make web                    # Build Web console
make sdk-python             # Build Python SDK
make install                # Install to /opt/aipc
make clean                  # Clean build artifacts
make env-check              # Check build dependencies
make help                   # Show all targets
make all                    # Build all layer1 + layer2 components
make test                   # Run all tests
make fmt                    # Format code
make lint                   # Static code analysis
```

## 14 Release Packaging

Build everything and generate a self-contained deployment package:

```bash
# Local stub release (for testing)
make pack
make pack VERSION=nx-1.0

# Hailo-15 full release (requires SDK)
make pack-release SDK_PATH=/opt/poky/4.0.23
make pack-release SDK_PATH=/opt/poky/4.0.23 VERSION=nx-1.0

# Legacy packaging script (still works, delegates to Makefile internally)
./scripts/pack_release.sh --version nx-1.0
./scripts/pack_release.sh --sdk-path /opt/poky/4.0.23 --version nx-1.0
./scripts/pack_release.sh --skip-build --version nx-1.0   # Repackage only
```

Output: `build/release/aipc-<platform>-<version>.tar.gz`

### Release Package Contents

| Path | Contents |
|------|----------|
| `opt/aipc/bin/` | All binaries (services, CLI, tools) |
| `opt/aipc/lib/hal/` | HAL shared libraries |
| `opt/aipc/etc/` | Configuration files |
| `opt/aipc/web/` | Web console assets |
| `opt/aipc/models/` | HEF model files (if any) |
| `opt/aipc/swagger-ui/` | API documentation |
| `systemd/` | systemd service units |
| `deploy.sh` | Hot-swap deployment script |
| `VERSION` | Version metadata |

### Deploy to Device

```bash
scp build/release/aipc-hailo15-nx-1.0.tar.gz root@192.168.93.72:/tmp/
ssh root@192.168.93.72
cd /tmp && tar xzf aipc-hailo15-nx-1.0.tar.gz
cd aipc-hailo15-nx-1.0 && ./deploy.sh

# Rollback
./deploy.sh --rollback
```

## 15 Common Tasks

### Adding a New Protobuf Message

```bash
vim platform/ai-runtime/proto/inference.proto
cd platform/ai-runtime/proto
protoc --go_out=. --go_opt=paths=source_relative \
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \
       inference.proto
```

### Adding a New HAL Function

```c
// 1. Edit interface
vim hal/include/hal_video.h

// 2. Implement for each SoC
vim hal/media/hailo15_impl.c
vim hal/media/rk3588_impl.c

// 3. Update documentation
vim docs/hal/interfaces.md
```

### Adding a New SDK Method

```python
# 1. Add to SDK
vim sdk/python/hailo_ipc_sdk/inference.py

# 2. Update docstrings
# 3. Add examples
vim sdk/python/README.md

# 4. Add tests
vim sdk/python/tests/test_inference.py
```

### Adding a New Configuration Option

```bash
# 1. Update YAML template
vim configs/ai/ai-runtime.yaml

# 2. Update Go struct
vim platform/ai-runtime/server/main.go

# 3. Update documentation
vim docs/configuration.md
```

## 16 Performance Analysis

### Go Performance Profiling

```bash
# CPU profiling
go test -cpuprofile=cpu.prof -bench=.
go tool pprof cpu.prof

# Memory profiling
go test -memprofile=mem.prof -bench=.
go tool pprof mem.prof
```

### Python Performance Profiling

```python
import cProfile
import pstats

cProfile.run('my_function()', 'output.prof')
stats = pstats.Stats('output.prof')
stats.sort_stats('cumulative')
stats.print_stats()
```

### System Performance Profiling

```bash
# perf (Linux)
perf record -g ./ai-runtime
perf report

# valgrind (memory leaks)
valgrind --leak-check=full ./camera-daemon
```

## 17 Common Build Issues

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

### camera-daemon cmake selected the wrong toolchain

```bash
rm -rf platform/camera-daemon/build
mkdir platform/camera-daemon/build && cd platform/camera-daemon/build
cmake ..  # Reconfigure
```

### HAL v2 hailo15 build fails — SDK not found

```bash
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux
make hal-v2 PLATFORM=hailo15
```

## 18 Runtime Troubleshooting

### Service Fails to Start

```bash
# View logs
journalctl -u ai-runtime -n 100

# Validate configuration
aipc-cli config validate

# Check dependent services
systemctl status ai-runtime camera-daemon app-manager event-bus device-control platform-api
```

### gRPC Connection Refused

```bash
# Check if socket files exist
ls -l /run/aipc/*.sock

# Check permissions
stat /run/aipc/ai-runtime.sock

# Test connection
grpcurl -plaintext -unix:///run/aipc/ai-runtime.sock list
```

### High CPU Usage

```bash
# Profile service performance
go tool pprof http://localhost:9090/debug/pprof/profile

# Check goroutines
go tool pprof http://localhost:9090/debug/pprof/goroutine
```

## 19 Related Documentation

- [Platform Architecture](../3-software-platform/0-platform-architecture.md) — NE503 software platform overall architecture
- [Contributing Guide](./1-contributing.md) — Code style, Git workflow, and PR process
- [Test Environment Setup](./2-test-environment.md) — Test layers and test environment configuration
- [Deployment Guide](./3-deployment.md) — Cross-platform deployment and release packaging
- [HAL Porting Guide](./4-hal-porting.md) — HAL interface implementation and SoC porting
- [Configuration Reference](../6-advanced-reference/1-config-reference.md) — All service configuration file parameters
