---
description: NE503 AIPC platform developer guide covering environment setup, layered builds, and common build issues.
keywords: [NE503, development environment, build, Docker, Hailo SDK, cross-compile]
tags: [platform development, NE503, environment setup, build]
---

# Developer Guide

This document guides you through setting up the complete NE503 AIPC development environment and building from source to release package.

## Part A: Environment Setup

### 1. System Requirements

| System | Support Level | Notes |
|--------|--------------|--------|
| Ubuntu 20.04+ | Full support | Recommended, all layers available natively |
| macOS (Intel / Apple Silicon) | Supported | Layer 1/2 native; Layer 3 via Docker image (arm64 native, no QEMU) |

**Hardware:** Minimum 4-core CPU, 8 GB RAM, 20 GB disk. 4 GB RAM sufficient for Go/Web-only development.

### 2. Get Source Code

```bash
git clone <repo-url> && cd ne503
```

Verify repository integrity:

```bash
ls Makefile platform/ web/
```

Project root structure:

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
├── scripts/       # Build/test/deploy scripts
└── docker/        # Docker development environment
```

### 3. Install Dependencies

The NE503 build system has three layers:

| Layer | Contents | Typical Use Case |
|-------|----------|-----------------|
| Layer 1 | Go + Node.js + protoc + Python | Platform services, Web console, SDK development |
| Layer 2 | Layer 1 + CMake + g++ + gRPC C++ | Native C/C++ components like camera-daemon |
| Layer 3 | Layer 1/2 + Hailo Yocto SDK (cross-compile) | Hailo-15 HAL firmware builds |

Most developers only need Layer 1/2.

**A full release build (`pack-release`) requires Layer 3**; it can be skipped only when developing Go services, the Web console, or the Python SDK.

**Which option to choose:**

| Your situation | Choose |
|----------------|--------|
| Want to ship a release fastest / no local setup / on macOS | Option A Docker (recommended) |
| Ubuntu native development, can run scripts online | Option B Script install |
| Script failed / offline / need precise version control | Option C Manual install |

> Option B is the automated wrapper of Option C — if the script fails, fall back to Option C and follow the manual steps to debug.

#### Option A: Docker Pre-built Image (Recommended)

The pre-built image includes all three layers of dependencies, ready to use out of the box.

The image is **multi-platform** (amd64 + arm64); on Apple Silicon it pulls the arm64 native variant automatically — no QEMU emulation, with performance on par with native Linux.

**Pull the image:**

```bash
docker pull camthink/ne503-dev:latest
```

**Create a persistent dev container:**

```bash
docker run -d --name ne503-dev \
  -v $(pwd):/ne503 \
  -w /ne503 \
  camthink/ne503-dev:latest \
  bash -c "sleep infinity"
```

The container is reusable and long-lived — no need to recreate it each time. Use `docker exec` for daily work:

```bash
docker exec -it ne503-dev bash         # Enter container interactively
docker exec ne503-dev make env-check   # Run commands inside the container
```

All three layers are pre-installed. Skip to [§4 Verify Environment](#4-verify-environment) to confirm.

#### Option B: Script Install

The project provides automated scripts supporting Ubuntu/Debian (apt) and macOS (brew), covering Layer 1/2:

```bash
./scripts/setup_env.sh layer1    # Go + Node.js + protoc + Python
./scripts/setup_env.sh layer2    # Layer 1 + cmake + g++ + gRPC C++
```

Scripts automatically detect and skip existing tools. For first-time setup, run `./scripts/setup_env.sh layer2` directly.

The script also offers a `layer3` entry point, but it **does not auto-download the Hailo SDK** (the SDK is a ~2.7 GB private toolchain, obtainable from technical support) — it only prints the manual SDK installation steps:

```bash
./scripts/setup_env.sh layer3    # installs Layer 2 + prints Hailo SDK manual install steps
```

For full builds, Option A (Docker image, SDK built in) is recommended; or follow the steps printed by `layer3` to install the SDK manually (see Option C).

After installation, **ensure `$(go env GOPATH)/bin` is in your PATH** (scripts do not configure this automatically):

```bash
# macOS
echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.zshrc && source ~/.zshrc

# Ubuntu
echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.bashrc && source ~/.bashrc
```

#### Option C: Manual Install

<details>
<summary>Ubuntu 20.04+</summary>

**Layer 1:**

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

# Python 3
sudo apt-get install -y python3 python3-pip
```

**Layer 2 (in addition to Layer 1):**

```bash
sudo apt-get install -y build-essential cmake protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

**Layer 3 — Hailo SDK:**

The Hailo Yocto Poky SDK is an x86_64 Linux-only cross-compile toolchain for building camera-daemon, ai-runtime, and HAL v2 firmware.

1. Contact [CamThink Technical Support](mailto:support@camthink.ai) for the SDK installer (filename format: `poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh`, approximately 2.7 GB)

2. Install to `/opt/poky`:

```bash
chmod +x poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh
sudo ./poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh -d /opt/poky/4.0.23 -y
```

3. Verify installation:

```bash
ls /opt/poky/4.0.23/environment-setup-armv8a-poky-linux
```

> A manual install places the SDK at `/opt/poky/4.0.23`. Commands in later sections use the Docker default `/opt/hailo-sdk` — manual-install users should substitute `/opt/poky/4.0.23`.

</details>

<details>
<summary>macOS</summary>

**Layer 1:**

```bash
brew install go node protobuf
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
npm install -g pnpm
```

**Layer 2 (in addition to Layer 1):**

```bash
brew install cmake grpc
xcode-select --install
```

**Layer 3 — Hailo SDK (Linux only):**

macOS cannot install the Hailo SDK natively (it is an x86_64 Linux-only cross-compile toolchain). **For Layer 3, use the [Option A: Docker pre-built image](#option-a-docker-pre-built-image-recommended)** — the image is multi-platform (amd64 + arm64), Apple Silicon pulls the arm64 native variant, so Go / Node / CMake / the SDK cross-compiler all run natively; all three layers are available inside the container, with no manual SDK configuration required.

</details>

#### Dependency Versions

| Tool | Minimum Version | Check Command | Layer |
|------|----------------|---------------|-------|
| Go | 1.25+ | `go version` | L1 |
| Node.js | 20+ | `node --version` | L1 |
| pnpm | Latest | `pnpm --version` | L1 |
| protoc | 3.12+ | `protoc --version` | L1 |
| protoc-gen-go | Latest | `which protoc-gen-go` | L1 |
| protoc-gen-go-grpc | Latest | `which protoc-gen-go-grpc` | L1 |
| Python | 3.8+ | `python3 --version` | L1 |
| CMake | 3.16+ | `cmake --version` | L2 |
| GCC/G++ | 10+ (C++20) | `g++ --version` | L2 |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` | L2 |

### 4. Verify Environment

```bash
make env-check
```

This command checks all three layers and reports status. Output when all three layers pass:

```plaintext
=== NE503 Build Environment ===

--- Layer 1 (Universal) ---
  OK: go version go1.25.x linux/arm64
  OK: libprotoc 3.x.x
  OK: protoc-gen-go
  OK: protoc-gen-go-grpc
  OK: Node.js v20.x.x
  OK: Python 3.x.x
  OK: pnpm x.x.x

--- Layer 2 (Native C/C++) ---
  OK: cmake version 3.x.x
  OK: g++ (Ubuntu 13.x / Apple clang) x.x.x
  OK: grpc_cpp_plugin

--- Layer 3 (Hailo-15 Cross-compile) ---
  OK: Hailo SDK (/opt/hailo-sdk)
```

> The above is the output from the Docker pre-built image (Option A). Under manual install (Option C), Layer 3 shows `OK: Hailo SDK (/opt/poky/4.0.23)` — both paths are valid.

If Layer 3 is not installed, you will see:

```plaintext
--- Layer 3 (Hailo-15 Cross-compile) ---
  NOT FOUND: Hailo SDK
```

Missing Layer 3 only affects full release builds (`pack-release`), not Go service or Web console development.

> If you see `WARNING: hailo15 target requested`, a stale `Makefile.docker` exists in the project root. Remove it: `rm Makefile.docker`.

### 5. Python SDK & IDE Configuration

> Run the commands below inside your dev environment: Docker users first enter the container with `docker exec -it ne503-dev bash`; native users run from the project root.

#### Python SDK (development mode)

```bash
cd sdk/python
pip3 install -e ".[dev]"
```

> On `error: externally-managed-environment` (Ubuntu 24.04+, macOS Homebrew Python), use a venv:
>
> ```bash
> cd sdk/python
> python3 -m venv .venv && source .venv/bin/activate
> pip install -e ".[dev]"
> ```
>
> Run `deactivate` when done; re-run `source .venv/bin/activate` before each development session.

#### Recommended IDE

VS Code with extensions:

- Go — `golang.go`
- Python — `ms-python.python`
- C/C++ — `ms-vscode.cpptools`
- CMake Tools — `ms-vscode.cmake-tools`
- Protocol Buffers — `bufbuild.vscode-buf`

## Part B: Release Build

### 6. Full Build

The build produces `build/release/aipc-hailo15-<version>.tar.gz` containing platform services, HAL libraries, Web console, and deployment scripts.

#### In-container build (recommended, all platforms)

Run inside the `ne503-dev` container created in Option A — works identically on Ubuntu / macOS Intel / Apple Silicon:

```bash
docker exec ne503-dev bash -c \
  'source /opt/hailo-sdk/environment-setup-armv8a-poky-linux && \
   make pack-release SDK_PATH=/opt/hailo-sdk VERSION=1.0.0'
```

```plaintext
# Expected output (stage progress; per-file compile lines omitted)
==> Compiling proto (inference / device / event / camera / app / ...)
==> Building device-control (CGO_ENABLED=0)
==> Building event-bus / app-manager / platform-api / device-discovery
==> Building Web Console
==> Building Python SDK
=== Layer 1 complete: proto + Go services + web + Python SDK ===
==> Building HAL v2 [platform=hailo15]
==> Building camera-daemon / ai-runtime (C++) / aipc-cli
==> Building tools (shm-reader, nv12-to-jpeg)
=== Layer 2 complete ===
==> Packaging release [1.0.0, platform=hailo15]
=== Release Package Ready ===
File:   build/release/aipc-hailo15-1.0.0.tar.gz (111M)
```

> Under manual install (Option C), the SDK path is `/opt/poky/4.0.23` — replace the env script and `SDK_PATH` in the command above with that path.

#### Verify Build Artifacts

Confirm binaries are ARM aarch64 (the container has no `file`, use `readelf`):

```bash
docker exec ne503-dev bash -c \
  'readelf -h build/output/device-control | grep Machine'
# Expected output: Machine: AArch64
```

All artifacts under `build/output/` (Go/C++ services, `aipc-cli`, `shm-reader`, `hal/hailo15/libaipc_hal.so`) are aarch64. On the host (outside the container) you can also run `file build/output/device-control` (output contains `ARM aarch64`).

### 7. Individual Service Builds

During development iteration, rebuild and replace only the service you're working on:

```bash
# Device management
make device-control HAL_PLATFORM=hailo15

# Event bus
make event-bus HAL_PLATFORM=hailo15

# App management
make app-manager HAL_PLATFORM=hailo15

# API gateway
make platform-api HAL_PLATFORM=hailo15

# Device discovery
make device-discovery HAL_PLATFORM=hailo15

# Video capture (source SDK environment first)
source /opt/hailo-sdk/environment-setup-armv8a-poky-linux
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk

# AI inference (source SDK environment first)
source /opt/hailo-sdk/environment-setup-armv8a-poky-linux
make ai-runtime HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk
```

> `HAL_PLATFORM=hailo15` automatically sets cross-compile parameters. Run these commands inside the container or on a Linux host with the SDK environment sourced; macOS users should first enter the container with `docker exec -it ne503-dev bash`.

### 8. Build Troubleshooting

#### protoc / protoc-gen-go not found

```bash
sudo apt install protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"
```

#### grpc_cpp_plugin not found

```bash
sudo apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

#### camera-daemon cross-compile protobuf version mismatch

C++ proto files must be generated with the SDK's bundled protoc. The Makefile handles this automatically when `HAL_PLATFORM=hailo15`.

If auto-generation fails, run the matching proto target manually (e.g. `make proto-camera`), or run `make help` to list the `proto-*` series.

#### CMake selected wrong toolchain

```bash
rm -rf platform/camera-daemon/build-hailo15
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk
```

#### pnpm reports "Ignored build scripts" on first run

```bash
cd web && pnpm approve-builds esbuild msw unrs-resolver
```

#### Web console build fails (missing modules)

`pnpm build` reports `Cannot find module '.../lib/...'`. The root cause is the `.gitignore` `lib/` rule catching `web/src/**/lib/`, so those source files are not tracked by git. Confirm `.gitignore` has the un-ignore exception:

```gitignore
lib/
!web/src/**/lib/
```

Add the exception, re-pull, and `pnpm build` works again.

#### Python SDK docs build reports ModuleNotFoundError: grpc

The `Building Python SDK Documentation` stage prints many `ModuleNotFoundError: No module named 'grpc'` lines — sphinx autodoc tries to import SDK modules without `grpcio` installed. **Non-fatal**: the Python SDK itself builds successfully, the docs are still generated, and the build continues into Layer 2; the final release package is unaffected. Safe to ignore.

### Make Target Reference

| Target | Description |
|--------|-------------|
| `make pack-release` | Full Hailo-15 release (build + package) |
| `make pack` | Package from existing build artifacts (no SDK needed) |
| `make platform` | All Go services |
| `make hal-v2` | HAL v2 (`HAL_PLATFORM=hailo15` cross-compile) |
| `make camera-daemon` | C++ camera-daemon |
| `make ai-runtime` | C++ AI inference service |
| `make proto` | Compile .proto to Go code |
| `make web` | Web console (pnpm) |
| `make layer1` | proto + Go + Web + Python SDK |
| `make layer2` | Layer 1 + HAL stub + C++ components |
| `make env-check` | Check build dependencies |
| `make clean` | Clean build artifacts |
| `make test` | Run all tests |

## Related Documentation

- [System Architecture](./0-system-architecture.md) — Four-layer architecture and core services
- [System Flashing](./2-system-flashing.md) — System image flashing and upgrades
- [Software Deployment](./3-software-deployment.md) — Platform software deployment and iterative development
- [Platform Services](./4-reference/0-platform-services.md) — Service responsibilities and source pointers
- [Troubleshooting](./4-reference/1-troubleshooting.md) — Runtime issue diagnostics
