---
description: NE503 AIPC 平台常见问题解答，涵盖构建、部署、推理、流媒体、容器、SDK、安全和开发等方面的常见问题与解决方案。
keywords: [NE503 FAQ, 常见问题, AIPC 平台, 故障排查, 构建, 部署, 推理]
tags: [高级参考, NE503, FAQ, 故障排查]
---

# FAQ

## 1 构建问题

### Q: make layer1 失败，提示 protobuf not found？

**A:** 确认 Protocol Buffers 编译器已安装。运行 `sudo apt install protobuf-compiler`，然后重新执行 `make layer1`。

### Q: 如何编译 HAL stub 模式？

**A:** 使用 `make hal-stub` 编译 HAL stub 模式。这会生成 `libhal-stub.so`，允许在没有真实硬件的情况下测试平台功能。

```bash
make hal-stub
make all  # 重新构建所有依赖 HAL stub 的服务
```

### Q: C++ 编译失败，提示找不到头文件？

**A:** 确认 CMake 配置正确。检查 `platform/*/CMakeLists.txt` 中的路径设置，或清理后重新构建。

```bash
make clean
make all
```

## 2 部署问题

### Q: 如何烧录固件到设备？

**A:** 使用 Hailo 提供的固件工具。将固件文件放在 `/opt/firmware/`，然后执行：

```bash
sudo hailo-update -f /opt/firmware/hailo15_fw.bin
reboot  # 重启设备使固件生效
```

### Q: 服务启动顺序是什么？

**A:** 服务依赖关系如下，systemd 会自动按此顺序启动：

```
containerd → camera-daemon → ai-runtime → event-bus → platform-api, device-control, app-manager
```

使用 `aipc-cli system start` 可按正确顺序启动所有服务。

### Q: 如何查看服务日志？

**A:** 使用 journalctl 查看系统日志：

```bash
# 实时查看日志
journalctl -u ai-runtime -f

# 查看最近 1 小时日志
journalctl -u camera-daemon --since "1 hour ago"

# 查看错误日志
journalctl -u platform-api -p err
```

## 3 推理问题

### Q: 支持哪些模型格式？

**A:** 平台主要支持 Hailo 优化格式（.hef）模型，兼容以下格式转换：

- YOLOv8/YOLOv5（.pt 转换）
- TensorFlow Lite（.tflite）
- ONNX（.onnx，需转换为 .hef）
- PyTorch（.pth，需转换为 .hef）

### Q: 如何调整推理并发？

**A:** 修改 `configs/ai/ai-runtime.yaml` 中的调度器配置：

```yaml
scheduler:
  global_qps_limit: 100        # 全局 QPS 限制（配置项，当前未实现）
  global_concurrent_limit: 16  # 全局并发限制（实际生效：控制工作线程数）
  default_session:
    max_qps: 30                 # 每会话 QPS（当前未实现）
    max_concurrent: 2           # 每会话并发数（当前未实现）
```

修改后重启 ai-runtime 服务。

> **注意**：推理并发主要由 `global_concurrent_limit` 控制。`max_qps` 和 `max_concurrent` 参数当前未在代码中实现。

### Q: NPU 温度过高怎么办？

**A:** 温度超过 80°C 时自动触发降频，超过 85°C 自动停机保护。解决方案：

1. 检查散热系统：清洁风扇、改善通风
2. 降低推理负载：减少并发会话或降低 FPS
3. 使用温度保护：在配置中设置温度限制

```yaml
monitoring:
  temperature_limit_c: 85
  throttle_temperature_c: 80
```

## 4 流媒体问题

### Q: 平台是否支持 RTSP 拉流？

**A:** 支持 RTSP 1.0 协议拉流，但平台主要作为 RTSP 服务端推流。拉流推荐使用 FFmpeg：

```bash
# 拉取 RTSP 流
ffmpeg -rtsp_transport tcp -i rtsp://camera-ip:554/stream -c copy output.mp4
```

### Q: 如何优化前端播放高延迟？

**A:** 优化方法：

1. 调整编码参数：减小 GOP 大小、提高帧率
2. 启用硬件加速：使用 WebCodecs 替代 MSE
3. 优化网络：确保局域网带宽充足
4. 减少缓冲：降低 WebSocket 缓冲区大小

```yaml
# camera-daemon.yaml 中的编码器配置（数组格式）
encoders:
  - stream_name: main
    codec: h264
    width: 1920
    height: 1080
    fps: 30
    gop: 15          # 减小 GOP 到 15 帧（0.5 秒）
    bitrate: 4000000
```

### Q: 平台是否支持多路视频流？

**A:** 支持，通过配置多个编码器实例实现：

```yaml
# 多路流通过配置多个编码器实例实现
encoders:
  - stream_name: main
    codec: h264
    width: 1920
    height: 1080
    fps: 30
  - stream_name: sub
    codec: h264
    width: 1280
    height: 720
    fps: 30
```

每路流独立管理，可设置不同的分辨率和帧率。

## 5 容器问题

### Q: 应用如何访问平台服务？

**A:** 主容器通过环境变量自动获得平台 Socket 访问权限：

```bash
# 容器内连接 AI Runtime
export AI_RUNTIME_ENDPOINT=/run/aipc/ai-runtime.sock

# 连接事件总线
export EVENT_BUS_ENDPOINT=/run/aipc/event-bus.sock
```

### Q: 容器之间如何通信？

**A:**

1. **Main/Sub 容器**：通过共享卷和网络通信
2. **跨应用**：通过 Event Bus 发布/订阅
3. **直接访问**：主容器可访问其他应用的主容器

```yaml
# 主容器配置
volumes:
  - name: shared-data
    host: /opt/aipc/data/shared
    container: /app/data

# 网络配置
networking:
  mode: internal
  ingress:
    - port: 80
      target: api-gateway:8080
```

### Q: 如何限制容器资源？

**A:** 在应用 Manifest 中配置资源限制：

```yaml
resources:
  cpu: "1.0"          # 1 个 CPU 核心
  memory: "512Mi"     # 512MB 内存
  pids_limit: 100      # 最大进程数

# 或在全局配置中设置默认值
default_cpu_quota: 50
default_memory_mb: 256
```

## 6 SDK 问题

### Q: 如何安装 Python SDK？

**A:** 使用 pip 安装开发版本：

```bash
# 克隆项目
git clone https://github.com/aipc/platform.git
cd platform/sdk/python

# 安装 SDK
pip install -e .

# 验证安装
python -c "from hailo_ipc_sdk import InferenceClient; print('SDK installed')"
```

### Q: 如何在容器内使用 SDK？

**A:** 在 Dockerfile 中添加 SDK 安装：

```dockerfile
FROM python:3.9-slim

# 安装 SDK
RUN pip install hailo-ipc-sdk

# 设置环境变量
ENV AI_RUNTIME_ENDPOINT=/run/aipc/ai-runtime.sock
ENV EVENT_BUS_ENDPOINT=/run/aipc/event-bus.sock

# 应用代码
COPY . /app
CMD ["python", "app.py"]
```

### Q: 支持哪些语言？

**A:** 目前支持以下语言 SDK：

- **Python**：主要 SDK，支持所有功能
- **Go**：基础 gRPC 支持
- **C++**：性能敏感场景
- **TypeScript/JavaScript**：前端集成

未来计划支持 Rust 和 Java。

## 7 性能问题

### Q: 如何优化推理性能？

**A:** 优化建议：

1. 使用批量推理
2. 调整模型精度（FP16/INT8）
3. 优化输入预处理
4. 使用合适的调度策略

```yaml
performance:
  device_mode: high    # 高性能模式
  batch_enabled: true  # 启用批量推理
  batch_size: 4       # 批次大小
```

### Q: 如何监控系统性能？

**A:** 使用内置监控工具：

```bash
# 查看 AI Runtime 统计
aipc-cli ai-runtime stats

# 查看容器资源使用
aipc-cli app stats <app-id>

# 查看 NPU 性能
hailortcli scan

# 实时监控
aipc-cli system health
```

### Q: 内存使用过高怎么办？

**A:** 解决方案：

1. 检查模型缓存数量
2. 限制并发会话数
3. 优化应用内存使用
4. 增加系统内存

```yaml
performance:
  memory_limit_mb: 2048
  max_model_cache: 2  # 减少模型缓存数量
```

## 8 安全问题

### Q: 如何加强平台安全？

**A:** 安全加固措施：

1. 启用只读文件系统
2. 限制容器能力
3. 使用 Seccomp 配置文件
4. 定期更新依赖

```yaml
security:
  readonly_rootfs: true
  no_new_privileges: true
  seccomp_profile: /etc/aipc/seccomp-default.json
```

### Q: 容器权限如何控制？

**A:** 通过 Capability 控制权限：

```yaml
security:
  capabilities_drop:
    - CAP_SYS_ADMIN
    - CAP_NET_ADMIN
    - CAP_SYS_MODULE
```

主容器获得必要权限；子容器遵循最小权限原则。

### Q: 如何处理安全漏洞？

**A:**

1. 定期运行安全扫描：`gosec ./...`
2. 更新依赖：`go get -u`
3. 应用安全补丁
4. 关注漏洞报告

## 9 开发问题

### Q: 如何开发对新模型的支持？

**A:** 开发步骤：

1. 在 HAL 中添加新的后处理类型
2. 更新模型注册 API
3. 实现相应的后处理逻辑
4. 添加测试用例

```cpp
// 在 HAL 中添加新的后处理类型
case HAL_POST_TYPE_CUSTOM:
    // 自定义后处理逻辑
    break;
```

### Q: 如何贡献代码？

**A:** 贡献流程：

1. Fork 项目
2. 创建功能分支
3. 编写测试
4. 提交 PR
5. 代码审查

确保所有代码通过 `make test` 和 `make lint` 检查。

### Q: 如何调试服务问题？

**A:** 调试方法：

1. 启用调试日志
2. 使用 grpcurl 测试 API
3. 检查 Socket 连接
4. 查看详细错误信息

```bash
# 启用调试日志
export LOG_LEVEL=debug

# 测试 API 连接
grpcurl -plaintext -d '{}' unix:///run/aipc/service.sock list
```

## 10 故障排查

### Q: 服务启动失败怎么办？

**A:** 排查步骤：

1. 检查依赖服务是否运行
2. 查看错误日志
3. 验证配置文件
4. 检查系统资源

```bash
systemctl status ai-runtime camera-daemon app-manager
journalctl -u ai-runtime -f
```

### Q: 模型注册失败怎么办？

**A:** 解决方案：

1. 检查模型路径
2. 验证模型格式
3. 检查 NPU 状态
4. 验证权限设置

```bash
hailortcli scan
ls -la /opt/aipc/models/
```

### Q: 容器应用无法访问外网？

**A:** 配置网络：

```yaml
networking:
  mode: bridge  # 使用桥接模式
  port_mappings:
    - container: 80
      host: 8080
```

或在运行时添加网络参数：

```bash
aipc-cli app start <app-id> --network=host
```

## 11 常见错误码

> 以下为应用层简化错误码。系统服务层的详细错误码请参考[故障排查指南](./2-troubleshooting.md#13-错误码表)。

| 错误码 | 描述 | 解决方案 |
|--------|------|---------|
| E001 | 服务未启动 | 检查服务状态 |
| E002 | Socket 连接失败 | 检查 Socket 文件 |
| E003 | 模型加载失败 | 验证模型文件 |
| E004 | 会话配额超限 | 调整配置 |
| E005 | 权限不足 | 检查用户权限 |
| E006 | 内存不足 | 增加内存或优化 |

## 12 相关文档

- [平台架构](../3-platform-development/0-platform-architecture.md) — NE503 软件平台整体架构
- [开发指南](../3-platform-development/1-development-environment.md) — 开发环境搭建与工作流
- [故障排查](./2-troubleshooting.md) — 完整故障排查手册
- [配置参考](./3-config-reference.md) — 所有服务配置文件参数
- [CLI 工具](../5-system-integration/3-cli-guide.md) — 命令行工具使用说明

## 13 诊断命令速查

```bash
# 运行全量诊断脚本
./scripts/test_all.sh

# 查看系统日志
journalctl -u ai-runtime -f

# 查看文档
ls docs/
```
