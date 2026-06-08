---
description: NE503 AIPC 平台跨平台部署指南，涵盖构建产物架构验证、Go/C++ 交叉编译、三种部署方式（脚本/手动/Docker）、运行时依赖检查、配置文件适配、部署验证及常见问题排查。
keywords: [NE503部署, 交叉编译, ARM64, 容器部署, systemd, 运行时依赖, 嵌入式部署, HAL库, 部署脚本]
tags: [平台部署, NE503, 交叉编译, 运维指南, 嵌入式]
---

# Platform Deployment

NE503 AIPC 平台编译产物位于 `build/output/` 目录，可直接部署到目标设备。部署前须确认构建产物架构与目标平台匹配，并按需完成交叉编译、依赖安装和配置适配。本文档覆盖从构建到验证的完整部署流程。

## 1. 构建产物概览

```bash
build/output/
├── ai-runtime          # AI 推理服务 (Go)
├── app-manager         # 应用管理服务 (Go)
├── camera-daemon       # 摄像头守护进程
├── device-control      # 设备控制服务 (Go)
├── device-discovery    # 设备发现服务
├── event-bus           # 事件总线服务 (Go)
├── platform-api        # 平台 API 网关 (Go)
└── hal/                # HAL 动态库 (C++)
    └── libhal-*.so
```

## 2. 架构验证

部署前必须确认构建产物架构与目标平台一致。

### 2.1 检查构建产物架构

```bash
file build/output/ai-runtime

# 输出示例:
# ELF 64-bit LSB executable, x86-64        → x86_64 架构
# ELF 64-bit LSB executable, ARM aarch64   → ARM64 架构
```

### 2.2 检查目标平台架构

```bash
# 在目标设备上执行
uname -m
# 可能输出: x86_64 / aarch64 / armv7l
```

构建产物架构必须与目标平台架构一致，否则运行时会报 "exec format error"。

## 3. 交叉编译

当开发机与目标设备架构不同时，需要进行交叉编译。

### 3.1 Go 服务交叉编译

Go 服务原生支持交叉编译，无需在目标平台上构建：

```bash
# ARM64（嵌入式平台常用）
export GOOS=linux
export GOARCH=arm64
make platform

# ARMv7（32位 ARM）
export GOOS=linux
export GOARCH=arm
export GOARM=7
make platform

# x86_64（默认）
export GOOS=linux
export GOARCH=amd64
make platform
```

### 3.2 C++ 组件交叉编译

C++ 组件（camera-daemon、HAL 库）依赖交叉编译工具链：

```bash
# 安装 ARM64 交叉编译工具链
sudo apt-get install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# 交叉编译 camera-daemon
cd platform/camera-daemon
mkdir -p build && cd build
cmake .. \
  -DCMAKE_SYSTEM_NAME=Linux \
  -DCMAKE_SYSTEM_PROCESSOR=aarch64 \
  -DCMAKE_C_COMPILER=aarch64-linux-gnu-gcc \
  -DCMAKE_CXX_COMPILER=aarch64-linux-gnu-g++
make -j$(nproc)
```

## 4. 部署方式

### 4.1 方式一：部署脚本（推荐）

```bash
./scripts/deploy.sh <target-ip> [username]

# 示例
./scripts/deploy.sh 192.168.1.100 root
```

脚本自动完成以下操作：

- 检查 SSH 连接
- 创建目录结构
- 传输二进制文件
- 部署配置文件
- 安装 systemd 服务

### 4.2 方式二：手动部署

**步骤 1 -- 打包部署文件**

```bash
mkdir -p deploy/aipc/{bin,lib/hal,etc,logs}

# 复制二进制文件
cp build/output/* deploy/aipc/bin/
cp build/output/hal/hailo15/*.so deploy/aipc/lib/hal/ 2>/dev/null || true

# 复制配置文件
cp -r configs/* deploy/aipc/etc/

# 打包
cd deploy
tar czf aipc-platform.tar.gz aipc/
```

**步骤 2 -- 传输到目标设备**

```bash
# 使用 scp
scp deploy/aipc-platform.tar.gz user@target:/tmp/

# 或使用 rsync（增量同步）
rsync -avz build/output/ user@target:/opt/aipc/bin/
```

**步骤 3 -- 在目标设备上安装**

```bash
ssh user@target

# 解压
cd /tmp
tar xzf aipc-platform.tar.gz -C /opt/

# 设置权限
chmod +x /opt/aipc/bin/*
chmod 644 /opt/aipc/etc/*.yaml

# 创建运行时目录
mkdir -p /run/aipc/{shm,sockets}
mkdir -p /opt/aipc/logs
```

### 4.3 方式三：Docker 容器

```bash
# 构建包含所有产物的镜像
docker build -t <registry>/aipc-platform:latest -f Dockerfile.deploy .

# 在目标平台运行
docker run -d \
  --name aipc-platform \
  --privileged \
  -v /opt/aipc/etc:/opt/aipc/etc \
  -v /opt/aipc/logs:/opt/aipc/logs \
  <registry>/aipc-platform:latest
```

## 5. 运行时依赖检查

### 5.1 Go 二进制依赖

```bash
# 检查动态库依赖
ldd build/output/ai-runtime

# 常见依赖:
# - libc.so.6 (glibc)
# - libpthread.so.0
```

> 注意：使用 `CGO_ENABLED=0` 编译的 Go 二进制为静态链接，`ldd` 会报告 "not a dynamic executable"。如需检查外部依赖，请使用 `file` 和 `readelf` 命令。

推荐使用静态编译消除运行时依赖：

```bash
# Makefile 中添加静态编译参数
GO_BUILD_FLAGS := -v -ldflags '-linkmode external -extldflags "-static"'

# 或使用 CGO_ENABLED=0（纯 Go 代码）
CGO_ENABLED=0 go build -o build/output/ai-runtime ./platform/ai-runtime/server
```

### 5.2 C++ 二进制依赖

```bash
ldd build/output/camera-daemon

# 可能需要:
# - libstdc++.so.6
# - libgcc_s.so.1
# - libc.so.6
```

### 5.3 系统服务依赖

app-manager 依赖 containerd 运行时：

```bash
systemctl status containerd

# 未安装时执行:
sudo apt-get install containerd
```

## 6. 配置文件适配

部署到不同平台时，需根据实际环境修改配置文件。

### 6.1 网络配置

```yaml
# configs/platform-api.yaml
service:
  listen: "0.0.0.0:8080"  # 根据目标平台网络环境调整
```

### 6.2 路径配置

```yaml
# configs/platform/app-manager.yaml
apps:
  registry_path: /opt/aipc/apps/registry
  instances_path: /opt/aipc/apps/instances
  manifests_path: /etc/aipc/apps
```

### 6.3 Socket 路径

```yaml
# 确保 socket 目录存在且具有写入权限
service:
  listen: unix:///run/aipc/app-manager.sock
```

## 7. 部署验证

### 7.1 检查二进制文件

```bash
# 在目标设备上执行
file /opt/aipc/bin/ai-runtime
ldd /opt/aipc/bin/ai-runtime
```

### 7.2 测试服务启动

```bash
# 手动启动测试
/opt/aipc/bin/ai-runtime -config /opt/aipc/etc/ai/ai-runtime.yaml

# 查看日志
tail -f /opt/aipc/logs/ai-runtime.log
```

### 7.3 检查服务状态

```bash
# systemd 管理
systemctl status ai-runtime
systemctl status ai-runtime camera-daemon app-manager

# 查看所有平台服务
systemctl list-units --type=service | grep -E 'ai-runtime|camera-daemon|app-manager|event-bus|device-control|platform-api'
```

## 8. 常见问题排查

### 8.1 "exec format error"

**原因**：架构不匹配，二进制文件无法在当前平台执行。

**解决**：重新交叉编译，使架构与目标平台一致。

```bash
export GOOS=linux GOARCH=arm64
make platform
```

### 8.2 "No such file or directory"

**原因**：缺少动态链接库。

**解决**：使用静态编译，或在目标平台上安装缺失的库。

```bash
ldd /opt/aipc/bin/ai-runtime | grep "not found"
```

### 8.3 "Permission denied"

**原因**：文件缺少可执行权限。

**解决**：

```bash
chmod +x /opt/aipc/bin/*
```

### 8.4 Socket 创建失败

**原因**：目录不存在或权限不足。

**解决**：

```bash
mkdir -p /run/aipc/sockets
chmod 777 /run/aipc/sockets
```

## 9. 一键自动部署脚本

以下脚本可自动检测目标架构并完成编译与部署：

```bash
#!/bin/bash
# deploy-to-target.sh

TARGET=$1
ARCH=$(ssh $TARGET "uname -m")

echo "Target architecture: $ARCH"

# 交叉编译
export GOOS=linux
case $ARCH in
  aarch64) export GOARCH=arm64 ;;
  armv7l)  export GOARCH=arm GOARM=7 ;;
  x86_64)  export GOARCH=amd64 ;;
esac

make clean
make platform

# 部署
./scripts/deploy.sh $TARGET
```

使用方法：

```bash
./deploy-to-target.sh user@192.168.1.100
```

## 10. 部署检查清单

- [ ] 确认目标平台架构（`uname -m`）
- [ ] 按架构交叉编译二进制文件
- [ ] 检查运行时依赖（`ldd`）
- [ ] 准备并适配配置文件
- [ ] 创建必要的目录结构
- [ ] 设置正确的文件权限
- [ ] 测试服务启动
- [ ] 配置 systemd 服务（如需要）

---

## 相关文档

- [平台架构](../3-software-platform/0-platform-architecture.md) -- 了解 NE503 AIPC 四层架构与服务依赖关系
- [开发指南](./0-development-guide.md) -- 平台开发环境搭建与开发流程
- [配置参考](../6-advanced-reference/1-config-reference.md) -- 各服务完整配置参数说明
- [CLI 工具](../3-software-platform/4-cli-guide.md) -- aipc-cli 命令行工具使用参考
