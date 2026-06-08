---
description: NE503 AIPC platform FAQ covering common questions and solutions for build, deployment, inference, streaming, containers, SDK, security, and development.
keywords: [NE503 FAQ, common questions, AIPC platform, troubleshooting, build, deployment, inference]
tags: [Advanced Reference, NE503, FAQ, Troubleshooting]
---

# FAQ

## 1 Build Issues

### Q: make layer1 fails with "protobuf not found"?

**A:** Confirm that the Protocol Buffers compiler is installed. Run `sudo apt install protobuf-compiler`, then re-run `make layer1`.

### Q: How to compile HAL stub mode?

**A:** Use `make hal-stub` to compile HAL stub mode. This generates `libhal-stub.so`, which allows testing platform functionality without real hardware.

```bash
make hal-stub
make all  # Rebuild all services depending on HAL stub
```

### Q: C++ compilation fails with header file not found?

**A:** Confirm that CMake configuration is correct. Check path settings in `platform/*/CMakeLists.txt`, or clean and rebuild.

```bash
make clean
make all
```

## 2 Deployment Issues

### Q: How to flash firmware to the device?

**A:** Use the firmware tool provided by Hailo. Place the firmware file in `/opt/firmware/`, then execute:

```bash
sudo hailo-update -f /opt/firmware/hailo15_fw.bin
reboot  # Reboot the device for firmware to take effect
```

### Q: What is the service startup order?

**A:** Service dependencies are as follows, systemd will automatically start in this order:

```
containerd -> camera-daemon -> ai-runtime -> event-bus -> platform-api, device-control, app-manager
```

Use `aipc-cli system start` to start all services in the correct order.

### Q: How to view service logs?

**A:** Use journalctl to view system logs:

```bash
# View logs in real time
journalctl -u ai-runtime -f

# View logs from the last 1 hour
journalctl -u camera-daemon --since "1 hour ago"

# View error logs
journalctl -u platform-api -p err
```

## 3 Inference Issues

### Q: What model formats are supported?

**A:** The platform primarily supports Hailo optimized format (.hef) models, compatible with the following format conversions:

- YOLOv8/YOLOv5 (.pt conversion)
- TensorFlow Lite (.tflite)
- ONNX (.onnx, requires conversion to .hef)
- PyTorch (.pth, requires conversion to .hef)

### Q: How to adjust inference concurrency?

**A:** Modify the scheduler configuration in `configs/ai/ai-runtime.yaml`:

```yaml
scheduler:
  global_qps_limit: 100        # Global QPS limit
  global_concurrent_limit: 16   # Global concurrency limit (configurable, currently not implemented)
  default_session:
    max_qps: 30                 # Per-session QPS
    max_concurrent: 2           # Per-session concurrency
```

> **Note**: Among the scheduler parameters, only `global_concurrent_limit` (controls worker thread count) and `queue_size` (controls request queue capacity) are actually implemented in code. Parameters such as `global_qps_limit`, `max_qps`, `max_concurrent`, `priority`, `strategy`, and `timeout_ms` exist in the config file but are not consumed by the runtime. See [Benchmarks](./4-benchmarks.md) for detailed parameter activation status.

Restart the ai-runtime service after modification.

### Q: What to do when NPU temperature is too high?

**A:** Temperature above 80C triggers automatic throttling; above 85C triggers automatic shutdown protection. Solutions:

1. Check the cooling system: clean fans, improve ventilation
2. Reduce inference load: decrease concurrent sessions or lower FPS
3. Use temperature protection: set temperature limits in configuration

```yaml
monitoring:
  temperature_limit_c: 85
  throttle_temperature_c: 80
```

## 4 Streaming Issues

### Q: Does the platform support RTSP pull?

**A:** RTSP 1.0 protocol pull is supported, but the platform primarily serves as an RTSP server for pushing streams. FFmpeg is recommended for pulling:

```bash
# Pull RTSP stream
ffmpeg -rtsp_transport tcp -i rtsp://camera-ip:554/stream -c copy output.mp4
```

### Q: How to optimize high-latency frontend playback?

**A:** Optimization methods:

1. Adjust encoding parameters: reduce GOP size, increase frame rate
2. Enable hardware acceleration: use WebCodecs instead of MSE
3. Optimize network: ensure sufficient LAN bandwidth
4. Reduce buffering: lower WebSocket buffer size

```yaml
encoders:
  - gop: 15        # Reduce GOP to 15 frames (0.5 seconds)
    fps: 30        # Increase frame rate
```

### Q: Does the platform support multiple video streams?

**A:** Yes, by configuring multiple encoder instances:

```yaml
encoders:
  - name: main
    width: 1920
    height: 1080
    fps: 30
  - name: sub
    width: 1280
    height: 720
    fps: 30
```

Each stream is managed independently with different resolution and frame rate settings.

## 5 Container Issues

### Q: How do applications access platform services?

**A:** The main container automatically gains platform Socket access through environment variables:

```bash
# Connect to AI Runtime from within container
export AI_RUNTIME_ENDPOINT=/run/aipc/ai-runtime.sock

# Connect to event bus
export EVENT_BUS_ENDPOINT=/run/aipc/event-bus.sock
```

### Q: How do containers communicate with each other?

**A:**

1. **Main/Sub containers**: Communicate via shared volumes and networking
2. **Cross-application**: Via Event Bus pub/sub
3. **Direct access**: Main container can access other applications' main containers

```yaml
# Main container configuration
volumes:
  - name: shared-data
    host: /opt/aipc/data/shared
    container: /app/data

# Network configuration
networking:
  mode: internal
  ingress:
    - port: 80
      target: api-gateway:8080
```

### Q: How to limit container resources?

**A:** Configure resource limits in the application Manifest:

```yaml
resources:
  cpu: "1.0"          # 1 CPU core
  memory: "512Mi"     # 512MB memory
  pids_limit: 100      # Maximum process count

# Or set defaults in global configuration
default_cpu_quota: 50
default_memory_mb: 256
```

## 6 SDK Issues

### Q: How to install the Python SDK?

**A:** Install the development version using pip:

```bash
# Clone the project
git clone https://github.com/aipc/platform.git
cd platform/sdk/python

# Install SDK
pip install -e .

# Verify installation
python -c "from hailo_ipc_sdk import InferenceClient; print('SDK installed')"
```

### Q: How to use the SDK inside a container?

**A:** Add SDK installation in the Dockerfile:

```dockerfile
FROM python:3.9-slim

# Install SDK
RUN pip install hailo-ipc-sdk

# Set environment variables
ENV AI_RUNTIME_ENDPOINT=/run/aipc/ai-runtime.sock
ENV EVENT_BUS_ENDPOINT=/run/aipc/event-bus.sock

# Application code
COPY . /app
CMD ["python", "app.py"]
```

### Q: Which languages are supported?

**A:** The following language SDKs are currently supported:

- **Python**: Primary SDK, supports all features
- **Go**: Basic gRPC support
- **C++**: Performance-sensitive scenarios
- **TypeScript/JavaScript**: Frontend integration

Rust and Java support is planned for the future.

## 7 Performance Issues

### Q: How to optimize inference performance?

**A:** Optimization recommendations:

1. Use batch inference
2. Adjust model precision (FP16/INT8)
3. Optimize input preprocessing
4. Use an appropriate scheduling strategy

```yaml
performance:
  device_mode: high    # High performance mode
  batch_enabled: true  # Enable batch inference
  batch_size: 4       # Batch size
```

### Q: How to monitor system performance?

**A:** Use built-in monitoring tools:

```bash
# View AI Runtime statistics
aipc-cli ai-runtime stats

# View container resource usage
aipc-cli app stats <app-id>

# View NPU performance
hailortcli scan

# Real-time monitoring
aipc-cli system health
```

### Q: What to do about high memory usage?

**A:** Solutions:

1. Check model cache count
2. Limit concurrent session count
3. Optimize application memory usage
4. Increase system memory

```yaml
performance:
  memory_limit_mb: 2048
  max_model_cache: 2  # Reduce model cache count
```

## 8 Security Issues

### Q: How to strengthen platform security?

**A:** Security hardening measures:

1. Enable read-only filesystem
2. Restrict container capabilities
3. Use Seccomp profiles
4. Update dependencies regularly

```yaml
security:
  readonly_rootfs: true
  no_new_privileges: true
  seccomp_profile: /etc/aipc/seccomp-default.json
```

### Q: How are container permissions controlled?

**A:** Permissions are controlled through Capabilities:

```yaml
security:
  capabilities_drop:
    - CAP_SYS_ADMIN
    - CAP_NET_ADMIN
    - CAP_SYS_MODULE
```

The main container receives necessary permissions; sub-containers follow the principle of least privilege.

### Q: How to handle security vulnerabilities?

**A:**

1. Run security scans regularly: `gosec ./...`
2. Update dependencies: `go get -u`
3. Apply security patches
4. Monitor vulnerability reports

## 9 Development Issues

### Q: How to develop support for a new model?

**A:** Development steps:

1. Add a new post-processing type in HAL
2. Update the model registration API
3. Implement the corresponding post-processing logic
4. Add test cases

```cpp
// Add a new post-processing type in HAL
case HAL_POST_TYPE_CUSTOM:
    // Custom post-processing logic
    break;
```

### Q: How to contribute code?

**A:** Contribution process:

1. Fork the project
2. Create a feature branch
3. Write tests
4. Submit a PR
5. Code review

Ensure all code passes `make test` and `make lint` checks.

### Q: How to debug service issues?

**A:** Debugging methods:

1. Enable debug logging
2. Use grpcurl to test APIs
3. Check Socket connections
4. View detailed error messages

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Test API connection
grpcurl -plaintext -d '{}' unix:///run/aipc/service.sock list
```

## 10 Troubleshooting

### Q: What to do when a service fails to start?

**A:** Troubleshooting steps:

1. Check if dependent services are running
2. View error logs
3. Verify configuration files
4. Check system resources

```bash
systemctl status ai-runtime camera-daemon app-manager
journalctl -u ai-runtime -f
```

### Q: What to do when model registration fails?

**A:** Solutions:

1. Check model path
2. Verify model format
3. Check NPU status
4. Verify permission settings

```bash
hailortcli scan
ls -la /opt/aipc/models/
```

### Q: Container application cannot access the external network?

**A:** Configure networking:

```yaml
networking:
  mode: bridge  # Use bridge mode
  port_mappings:
    - container: 80
      host: 8080
```

Or add network parameters at runtime:

```bash
aipc-cli app start <app-id> --network=host
```

## 11 Common Error Codes

> **Note**: Error codes are organized into two layers — **Application Layer** (1xxxx range, returned by Platform API to frontend/external clients) and **Service Layer** (returned by individual gRPC services such as AI Runtime, App Manager, etc.). For detailed service layer error codes, see the [Troubleshooting Guide](./2-troubleshooting.md#13-error-code-reference).

| Error Code | Description | Solution |
|-----------|-------------|----------|
| E001 | Service not started | Check service status |
| E002 | Socket connection failed | Check Socket file |
| E003 | Model loading failed | Verify model file |
| E004 | Session quota exceeded | Adjust configuration |
| E005 | Insufficient permissions | Check user permissions |
| E006 | Out of memory | Add memory or optimize |

## 12 Related Documentation

- [Platform Architecture](../3-platform-development/0-platform-architecture.md) -- NE503 software platform overall architecture
- [Development Guide](../3-platform-development/1-development-environment.md) -- Development environment setup and workflow
- [Troubleshooting](./2-troubleshooting.md) -- Complete troubleshooting guide
- [Configuration Reference](./3-config-reference.md) -- All service configuration file parameters
- [CLI Tool](../5-system-integration/3-cli-guide.md) -- Command-line tool usage instructions

## 13 Diagnostic Commands

```bash
# Run full diagnostic script
./scripts/test_all.sh

# View system logs
journalctl -u ai-runtime -f

# View documentation
ls docs/
```
