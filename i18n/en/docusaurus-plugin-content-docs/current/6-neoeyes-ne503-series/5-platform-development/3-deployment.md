---
description: NE503 AIPC platform cross-platform deployment guide, covering build artifact architecture verification, Go/C++ cross-compilation, three deployment methods (script/manual/Docker), runtime dependency checking, configuration file adaptation, deployment verification, and common troubleshooting.
keywords: [NE503 deployment, cross-compilation, ARM64, container deployment, systemd, runtime dependencies, embedded deployment, HAL library, deployment scripts]
tags: [platform deployment, NE503, cross-compilation, operations guide, embedded]
---

# Platform Deployment

NE503 AIPC platform build artifacts are located in the `build/output/` directory and can be deployed directly to target devices. Before deployment, confirm that the build artifact architecture matches the target platform, and complete cross-compilation, dependency installation, and configuration adaptation as needed. This document covers the complete deployment process from build to verification.

## 1. Build Artifacts Overview

```bash
build/output/
├── ai-runtime          # AI inference service (Go)
├── app-manager         # Application management service (Go)
├── camera-daemon       # Camera daemon (C++)
├── device-control      # Device control service (Go)
├── device-discovery    # Device discovery service (Go)
├── event-bus           # Event bus service (Go)
├── platform-api        # Platform API gateway (Go)
└── hal/                # HAL dynamic libraries (C++)
    └── libhal-*.so
```

## 2. Architecture Verification

Before deployment, you must confirm that the build artifact architecture matches the target platform.

### 2.1 Check Build Artifact Architecture

```bash
file build/output/ai-runtime

# Example output:
# ELF 64-bit LSB executable, x86-64        → x86_64 architecture
# ELF 64-bit LSB executable, ARM aarch64   → ARM64 architecture
```

### 2.2 Check Target Platform Architecture

```bash
# Execute on the target device
uname -m
# Possible output: x86_64 / aarch64 / armv7l
```

The build artifact architecture must match the target platform architecture, otherwise you will get an "exec format error" at runtime.

## 3. Cross-Compilation

When the development machine and target device have different architectures, cross-compilation is required.

### 3.1 Go Service Cross-Compilation

Go services natively support cross-compilation without building on the target platform:

```bash
# ARM64 (common for embedded platforms)
export GOOS=linux
export GOARCH=arm64
make platform

# ARMv7 (32-bit ARM)
export GOOS=linux
export GOARCH=arm
export GOARM=7
make platform

# x86_64 (default)
export GOOS=linux
export GOARCH=amd64
make platform
```

### 3.2 C++ Component Cross-Compilation

C++ components (camera-daemon, HAL libraries) require a cross-compilation toolchain:

```bash
# Install ARM64 cross-compilation toolchain
sudo apt-get install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# Cross-compile camera-daemon
cd platform/camera-daemon
mkdir -p build && cd build
cmake .. \
  -DCMAKE_SYSTEM_NAME=Linux \
  -DCMAKE_SYSTEM_PROCESSOR=aarch64 \
  -DCMAKE_C_COMPILER=aarch64-linux-gnu-gcc \
  -DCMAKE_CXX_COMPILER=aarch64-linux-gnu-g++
make -j$(nproc)
```

## 4. Deployment Methods

### 4.1 Method 1: Deployment Script (Recommended)

```bash
./scripts/deploy.sh <target-ip> [username]

# Example
./scripts/deploy.sh 192.168.1.100 root
```

The script automatically completes the following operations:

- Check SSH connection
- Create directory structure
- Transfer binary files
- Deploy configuration files
- Install systemd services

### 4.2 Method 2: Manual Deployment

**Step 1 -- Package deployment files**

```bash
mkdir -p deploy/aipc/{bin,lib/hal,etc,logs}

# Copy binary files
cp build/output/* deploy/aipc/bin/
cp build/output/hal/hailo15/*.so deploy/aipc/lib/hal/ 2>/dev/null || true

# Copy configuration files
cp -r configs/* deploy/aipc/etc/

# Package
cd deploy
tar czf aipc-platform.tar.gz aipc/
```

**Step 2 -- Transfer to target device**

```bash
# Using scp
scp deploy/aipc-platform.tar.gz user@target:/tmp/

# Or using rsync (incremental sync)
rsync -avz build/output/ user@target:/opt/aipc/bin/
```

**Step 3 -- Install on target device**

```bash
ssh user@target

# Extract
cd /tmp
tar xzf aipc-platform.tar.gz -C /opt/

# Set permissions
chmod +x /opt/aipc/bin/*
chmod 644 /opt/aipc/etc/*.yaml

# Create runtime directories
mkdir -p /run/aipc/{shm,sockets}
mkdir -p /opt/aipc/logs
```

### 4.3 Method 3: Docker Container

```bash
# Build image containing all artifacts
docker build -t <registry>/aipc-platform:latest -f Dockerfile.deploy .

# Run on target platform
docker run -d \
  --name aipc-platform \
  --privileged \
  -v /opt/aipc/etc:/opt/aipc/etc \
  -v /opt/aipc/logs:/opt/aipc/logs \
  <registry>/aipc-platform:latest
```

## 5. Runtime Dependency Check

### 5.1 Go Binary Dependencies

```bash
# Check dynamic library dependencies
ldd build/output/ai-runtime

# Common dependencies:
# - libc.so.6 (glibc)
# - libpthread.so.0
```

> Note: Go binaries compiled with `CGO_ENABLED=0` are statically linked. `ldd` will report "not a dynamic executable." Use `file` and `readelf` commands if you need to check external dependencies.

It is recommended to use static compilation to eliminate runtime dependencies:

```bash
# Add static compilation parameters in Makefile
GO_BUILD_FLAGS := -v -ldflags '-linkmode external -extldflags "-static"'

# Or use CGO_ENABLED=0 (pure Go code)
CGO_ENABLED=0 go build -o build/output/ai-runtime ./platform/ai-runtime/server
```

### 5.2 C++ Binary Dependencies

```bash
ldd build/output/camera-daemon

# May need:
# - libstdc++.so.6
# - libgcc_s.so.1
# - libc.so.6
```

### 5.3 System Service Dependencies

app-manager depends on the containerd runtime:

```bash
systemctl status containerd

# If not installed:
sudo apt-get install containerd
```

## 6. Configuration File Adaptation

When deploying to different platforms, configuration files need to be modified according to the actual environment.

### 6.1 Network Configuration

```yaml
# configs/platform-api.yaml
service:
  listen: "0.0.0.0:8080"  # Adjust based on target platform network environment
```

### 6.2 Path Configuration

```yaml
# configs/platform/app-manager.yaml
apps:
  registry_path: /opt/aipc/apps/registry
  instances_path: /opt/aipc/apps/instances
  manifests_path: /etc/aipc/apps
```

### 6.3 Socket Path

```yaml
# Ensure socket directory exists and has write permissions
service:
  listen: unix:///run/aipc/app-manager.sock
```

## 7. Deployment Verification

### 7.1 Check Binary Files

```bash
# Execute on the target device
file /opt/aipc/bin/ai-runtime
ldd /opt/aipc/bin/ai-runtime
```

### 7.2 Test Service Startup

```bash
# Manual startup test
/opt/aipc/bin/ai-runtime -config /opt/aipc/etc/ai/ai-runtime.yaml

# View logs
tail -f /opt/aipc/logs/ai-runtime.log
```

### 7.3 Check Service Status

```bash
# systemd management
systemctl status ai-runtime
systemctl status ai-runtime camera-daemon app-manager

# List all platform services
systemctl list-units --type=service | grep -E 'ai-runtime|camera-daemon|app-manager|event-bus|device-control|platform-api'
```

## 8. Common Troubleshooting

### 8.1 "exec format error"

**Cause**: Architecture mismatch; the binary cannot execute on the current platform.

**Solution**: Re-cross-compile so the architecture matches the target platform.

```bash
export GOOS=linux GOARCH=arm64
make platform
```

### 8.2 "No such file or directory"

**Cause**: Missing dynamic link library.

**Solution**: Use static compilation, or install missing libraries on the target platform.

```bash
ldd /opt/aipc/bin/ai-runtime | grep "not found"
```

### 8.3 "Permission denied"

**Cause**: File lacks executable permission.

**Solution**:

```bash
chmod +x /opt/aipc/bin/*
```

### 8.4 Socket Creation Failed

**Cause**: Directory does not exist or insufficient permissions.

**Solution**:

```bash
mkdir -p /run/aipc/sockets
chmod 777 /run/aipc/sockets
```

## 9. One-Click Automated Deployment Script

The following script can automatically detect the target architecture and complete compilation and deployment:

```bash
#!/bin/bash
# deploy-to-target.sh

TARGET=$1
ARCH=$(ssh $TARGET "uname -m")

echo "Target architecture: $ARCH"

# Cross-compile
export GOOS=linux
case $ARCH in
  aarch64) export GOARCH=arm64 ;;
  armv7l)  export GOARCH=arm GOARM=7 ;;
  x86_64)  export GOARCH=amd64 ;;
esac

make clean
make platform

# Deploy
./scripts/deploy.sh $TARGET
```

Usage:

```bash
./deploy-to-target.sh user@192.168.1.100
```

## 10. Deployment Checklist

- [ ] Confirm target platform architecture (`uname -m`)
- [ ] Cross-compile binaries for the architecture
- [ ] Check runtime dependencies (`ldd`)
- [ ] Prepare and adapt configuration files
- [ ] Create necessary directory structure
- [ ] Set correct file permissions
- [ ] Test service startup
- [ ] Configure systemd services (if needed)

---

## Related Documentation

- [Platform Architecture](../3-software-platform/0-platform-architecture.md) -- Understand the NE503 AIPC four-layer architecture and service dependencies
- [Development Guide](./0-development-guide.md) -- Platform development environment setup and development workflow
- [Configuration Reference](../6-advanced-reference/1-config-reference.md) -- Complete configuration parameters for each service
- [CLI Tool](../3-software-platform/4-cli-guide.md) -- aipc-cli command-line tool usage reference
