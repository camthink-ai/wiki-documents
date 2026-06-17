---
description: NE503 troubleshooting guide covering general troubleshooting workflows, service startup failures, video streaming, device control, web console, log diagnostics, performance monitoring, and error code quick reference to help quickly identify and resolve platform issues.
keywords: [NE503 troubleshooting, AIPC diagnostics, gRPC, journalctl, NPU overheating, RTSP, WebSocket, web console, error codes]
tags: [Advanced Reference, NE503, Troubleshooting, Diagnostic Commands]
---

# Troubleshooting Guide

## 1. Overview

This guide provides systematic troubleshooting procedures and solutions for the NE503 AIPC platform. The platform uses a microservice architecture where services communicate via Unix Sockets and follow a specific startup sequence. When encountering issues, follow this general workflow:

1. Confirm the issue symptom
2. Check related logs
3. Refer to the corresponding section
4. Execute the recommended solution

## 2. General Troubleshooting Workflow

```mermaid
flowchart TD
    A["Issue Detected"] --> B{"Is service running?"}
    B -->|No| C["Check startup order<br/>systemctl status"]
    B -->|Yes| D["Check service logs<br/>journalctl -u service"]

    C --> E{"Service status"}
    E -->|failed| F["Check journalctl logs<br/>analyze error stack"]
    E -->|active| G["Check Socket connection"]

    D --> H{"Error type"}
    H -->|"Startup failure"| I["Check dependent services"]
    H -->|"Runtime error"| J["View specific error details"]
    H -->|"Performance issue"| K["Monitor resource usage"]

    F --> L["Locate section by error type"]
    G --> M{"Does Socket exist?"}
    M -->|Yes| N["Test gRPC connection"]
    M -->|No| O["Check service process"]

    N --> P{"Connection successful?"}
    P -->|Yes| L
    P -->|No| Q["Check permissions/network"]

    I --> R["Verify upstream services"]
    K --> S["Check CPU/Memory/Disk"]

    L --> T["Execute solution"]
    Q --> T
    R --> T
    S --> T
```

## 3. Service Startup Failure Troubleshooting

### 3.1 Check systemd Status

```bash
# View all AIPC service statuses
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api

# View a specific service status
systemctl status ai-runtime.service

# View failed services
systemctl --failed

# View service dependencies
systemctl list-dependencies platform-api.service
```

### 3.2 Check if Unix Socket Exists

```bash
# List /run/aipc directory
ls -la /run/aipc/

# The platform has 7 sockets:
#   ai-runtime.sock        — AI inference service
#   app-manager.sock       — Container app management
#   device-control.sock    — Device peripheral control
#   event-bus.sock         — Event bus
#   device-discovery.sock  — Device discovery
#   camera.sock            — camera-daemon frame publisher (fd zero-copy)
#   camera-control.sock    — camera-daemon control (lens/HAL)
ls -la /run/aipc/*.sock

# Test Socket connection
nc -U /run/aipc/ai-runtime.sock
```

### 3.3 View Logs with journalctl

```bash
# View service logs in real time
journalctl -u ai-runtime -f

# View logs from the last 1 hour
journalctl -u camera-daemon --since "1 hour ago"

# View logs containing error keywords
journalctl -u app-manager | grep -i "error\|failed\|fatal"

# View detailed startup failure errors
journalctl -u app-manager -b --no-pager

# Filter by error level
journalctl -u event-bus -p err
journalctl -u device-control -p warning
```

### 3.4 Common Startup Issues

```mermaid
flowchart TD
    A["Service startup failed"] --> B{"Check error type"}
    B -->|"Dependency not ready"| C["Check upstream services"]
    B -->|"Socket in use"| D["Stop occupying process"]
    B -->|"Permission denied"| E["Check file permissions"]
    B -->|"Binary not found"| F["Verify file path"]
    B -->|"Config error"| G["Validate YAML config"]

    C --> H["systemctl status upstream services"]
    D --> I["lsof -t /run/aipc/*.sock"]
    E --> J["ls -la /usr/bin/"]
    F --> K["ls -la /usr/bin/"]
    G --> L["yamllint config.yaml"]

    I --> M["kill PID"]
    L --> N["Fix syntax errors"]
    M --> O["Restart service"]
    N --> O
```

### 3.5 Socket Permission Check

```bash
# Check Socket directory and file permissions
ls -ld /run/aipc/
ls -la /run/aipc/*.sock
```

## 4. Video Streaming Troubleshooting

### 4.1 RTSP Connection Failure

```mermaid
flowchart TD
    A["RTSP connection failed"] --> B{"Check service status"}
    B -->|"camera-daemon not running"| C["Start camera-daemon"]
    B -->|"Port in use"| D["Check port 8554"]
    B -->|"Network issue"| E["Check client network"]

    C --> F["systemctl start camera-daemon"]
    D --> G["Check port 8554 usage"]
    E --> H["Test connection from client"]

    F --> I["Wait for service startup"]
    G --> J["Kill occupying process"]
    H --> K["Test with VLC"]

    I --> L["View service logs"]
    J --> L
    K --> L

    L --> M{"Is RTSP normal?"}
    M -->|Yes| N["Check client configuration"]
    M -->|No| O["Deep troubleshoot camera-daemon"]
```

**Diagnostic commands:**

```bash
# Check RTSP service status
systemctl status camera-daemon

# View RTSP logs
journalctl -u camera-daemon -f

# Test RTSP connection (replace <device-ip> with the actual device IP)
ffmpeg -rtsp_transport tcp -i rtsp://<device-ip>:8554/main -t 10 -f null -
```

> For Web Console WebSocket disconnection troubleshooting (video playback layer), see [Application Troubleshooting — Video Stream Integration](../../4-application-guide/1-app-development/reference/troubleshooting.md#2-video-stream-integration-troubleshooting).

## 5. Device Control Troubleshooting

| Symptom | Possible Cause | Diagnostic Command |
|---------|---------------|-------------------|
| Lens control abnormality | Focus/zoom/iris motor fault | `grpcurl ... DeviceControl/GetLensStatus`; `grpcurl ... DeviceControl/LensResetZero` |
| UART communication failure | Baud rate/wiring/voltage issue | `ls -la /dev/ttyS*`; `stty -F /dev/ttyS0 921600` |

The complete gRPC interface is defined in `platform/device-control/proto/device.proto`.

## 6. Web Console Troubleshooting

### 6.1 Browser Compatibility

| Browser | Minimum Version | Support Level | Known Issues | Solution |
|---------|----------------|--------------|-------------|----------|
| Chrome | 88+ | Full support | -- | -- |
| Firefox | 78+ | Basic support | No WebCodecs | Use MSE playback |
| Safari | 14+ | Partial support | No WebCodecs | Degrade to MSE |
| Edge | 88+ | Full support | -- | -- |
| Mobile browsers | -- | Limited support | Performance issues | Use desktop |

Chrome 88+ or Edge 88+ recommended for the best experience. Safari auto-degrades to MSE with slightly lower performance.

### 6.2 WebSocket and Video Playback Troubleshooting

Video playback relies on WebSocket to transport H.264 frames. Common issues:

| Symptom | Possible Cause | Solution |
|---------|---------------|----------|
| WebSocket 1006 | Abnormal connection close | Check if platform-api is running, firewall allows port 8080 |
| WebSocket 401/403 | Invalid or expired token | Re-login to get a new token |
| Black screen | WebSocket not established / SPS-PPS not received | Refresh page, check WebSocket connection status |
| Artifacts/mosaic | Network packet loss / decoder incompatibility | Switch browser or check network quality |
| High latency | Network latency / buffer too large | Ensure sufficient LAN bandwidth, reduce encoding GOP |

### 6.3 API Request Failures

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 401 | Authentication failed | Clear token and re-login |
| 403 | Insufficient permissions | Check user permissions |
| 404 | Resource not found | Check API path |
| 500 | Server error | Check `/var/log/aipc/platform-api.log` |
| 503 | Service unavailable | Check service status, restart if needed |

## 7. Log Level Adjustment

### 7.1 Temporarily Adjust Log Level

```bash
# Temporarily set to debug level
# Note: journalctl does not support --log-level; set debug level in the service configuration file instead
sudo journalctl -u ai-runtime -f

# View error level and above logs
sudo journalctl -u camera-daemon -p err
```

### 7.2 Modify Configuration File

The actual config files on the device are located at `/opt/aipc/etc/*.yaml` (the path specified in systemd ExecStart). The `configs/` directory in the source repo is only a template.

```yaml
# /opt/aipc/etc/ai-runtime.yaml — adjust log_level
service:
  name: ai-runtime
  listen: unix:///run/aipc/ai-runtime.sock
  log_level: debug  # debug, info, warn, error
```

### 7.3 Log Level Reference

| Level | Description |
|-------|-------------|
| `debug` | Detailed debugging information |
| `info` | Key runtime status |
| `warn` | Non-fatal warnings |
| `error` | Critical errors |

### 7.4 Log Analysis Tips

```bash
# View error rate
journalctl -u ai-runtime --since "1 hour ago" | grep -c "error"

# View most frequent errors
journalctl -u ai-runtime | grep "error" | sort | uniq -c | sort -nr

# Filter specific errors
journalctl -u ai-runtime | grep -E "(timeout|connection refused|permission denied)"
```

## 8. Performance Monitoring

### 8.1 System Resource Monitoring

```bash
# Monitor CPU usage
top -p $(pgrep -f ai-runtime)

# Monitor memory usage
free -h && ps aux | grep ai-runtime

# Monitor disk I/O
iostat -x 1 5

# Monitor network
iftop -i eth0
```

### 8.2 Service Performance Metrics

```bash
# AI Runtime statistics
grpcurl -plaintext -d '{}' unix:///run/aipc/ai-runtime.sock aipc.inference.InferenceService/GetStats

# Container statistics
aipc-cli app info <app-id>

# Device status
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/GetDeviceStatus
```

### 8.3 Real-time Monitoring Script

```bash
#!/bin/bash
# Monitoring script example

while true; do
    echo "=== $(date) ==="
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}'
    echo "Memory Usage:"
    free | grep Mem | awk '{printf "%.2f%%\n", $3/$2 * 100.0}'
    echo "Disk Usage:"
    df /opt/aipc | tail -1 | awk '{print $5}'
    echo "NPU Temperature:"
    hailortcli fw-control --temperature | awk '{print $3}'
    sleep 5
done
```

## 9. Common Diagnostic Commands Quick Reference

| Scenario | Command | Description |
|----------|---------|-------------|
| View service status | `systemctl status ai-runtime camera-daemon app-manager` | Check core platform services |
| View service logs | `journalctl -u <service-name> -f` | View service logs in real time |
| Check Socket | `ls -la /run/aipc/` | View Unix Socket files |
| Check system resources | `top -p $(pidof service)` | Monitor service resource usage |
| View container status | `aipc-cli app list` | List all container applications |
| Test network connection | `curl http://localhost:8080/api/v1/media/status` | Test API endpoint |
| View model status | `grpcurl -plaintext -d '{}' unix:///run/aipc/ai-runtime.sock aipc.inference.InferenceService/ListModels` | List registered models |
| Check NPU status | `hailortcli scan` | View Hailo device status |
| View event logs | `aipc-cli event-log list` | View event bus logs |
| Check disk usage | `df -h /opt/aipc` | Check disk space |
| Check memory usage | `free -h` | Check system memory |

## 10. Error Code Reference

The following are business error codes returned by platform-api. The full definition is in `platform/platform-api/handlers/response.go`.

Code ranges: **1xxx** General/Request · **2xxx** Auth · **3xxx** Service/Infra · **4xxx** Resource · **5xxx** AI/Model · **6xxx** App Manager · **7xxx** Device · **8xxx** File/Storage · **9xxx** SSH · **10xxx** Process.

| Code | Meaning | Code | Meaning | Code | Meaning |
|:---|:---|:---|:---|:---|:---|
| 0 | Success | 1000 | Unknown error | 1001 | Invalid request |
| 1002 | Invalid JSON | 1003 | Missing parameter | 1004 | Invalid parameter |
| 2000 | Unauthorized | 2001 | Forbidden | 2002 | Token expired |
| 2003 | Invalid token | 3000 | Service unavailable | 3001 | Service timeout |
| 3002 | Service error | 3003 | gRPC error | 3004 | Database error |
| 4000 | Not found | 4001 | Already exists | 4002 | Resource exhausted |
| 4003 | Operation failed | 5000 | Model not found | 5001 | Model load failed |
| 5002 | Inference error | 5003 | Invalid model format | 6000 | App not found |
| 6001 | App install failed | 6002 | App start failed | 6003 | App stop failed |
| 6004 | App running | 6005 | App not running | 7000 | Device error |
| 7001 | PTZ error | 7002 | Camera error | 7003 | GPIO error |
| 8000 | File not found | 8001 | File upload failed | 8002 | File delete failed |
| 8003 | Storage full | 8004 | Access denied | 9000 | SSH config error |
| 9001 | SSH service error | 10000 | Process not found | 10001 | Process kill failed |

## 11. Troubleshooting Summary

1. **Check service status first** -- Use `systemctl status` to confirm if services are running
2. **View error logs** -- Use `journalctl` to view detailed error information
3. **Verify network connections** -- Check if Sockets and ports are normal
4. **Check resource usage** -- Ensure system resources are sufficient
5. **Troubleshoot module by module** -- Verify progressively from low-level hardware to upper-level applications
6. **Preserve complete logs** -- Save sufficient log information before and after failures

## Related Documentation

- [Services Overview](./0-platform-services.md) — Service responsibilities, collaboration, and source pointers
- [Platform Architecture](../0-system-architecture.md)
- [App Troubleshooting](../../4-application-guide/1-app-development/reference/troubleshooting.md) — Application development troubleshooting (containers, video streams, event bus)
