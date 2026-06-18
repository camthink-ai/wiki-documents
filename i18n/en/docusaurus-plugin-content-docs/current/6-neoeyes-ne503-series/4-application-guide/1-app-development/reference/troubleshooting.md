---
description: NE503 application development troubleshooting covering container app installation/startup/health checks, video stream WebSocket integration, and event bus publish/subscribe issues to help app developers quickly identify common problems.
keywords: [NE503 app troubleshooting, container startup failure, health check, WebSocket disconnection, event bus, SDK debugging]
tags: [App Development, NE503, Troubleshooting, Container, Event Bus]
---

# Troubleshooting

This page covers common issues encountered by application developers when using the NE503 platform SDK and APIs. For platform service troubleshooting, see the [Troubleshooting Guide](../../../3-software-guide/4-reference/1-troubleshooting.md).

## 1. Container Application Troubleshooting

### 1.1 Application Installation Failure

Installation failure usually falls into three categories: image pull (network/image source), manifest parsing (`app.yaml` syntax), or permission (the runtime user must belong to the aipc group).

**Diagnostic commands:**

```bash
# View installation logs (manifest field errors and image import failures both report specific reasons here)
journalctl -u app-manager -f

# Pre-check app.yaml syntax locally
yamllint app.yaml
```

### 1.2 Container Startup Failure

Startup failure is usually insufficient resources (see the `resources` quota) or a dependent upstream service not ready; the container sandbox imposes security limits (dropped capabilities, etc.). The most common real-device `parent snapshot`/`no space` error is covered in §4 #5.

**Diagnostic commands:**

```bash
# View container logs
journalctl -u app-manager | grep -i "container"

# Check system resources
free -h
df -h
systemd-cgtop

# Check containerd status
systemctl status containerd
```

### 1.3 Health Check Failure

`app.yaml` supports HTTP / command / TCP health probes; on failure, reproduce manually by probe type (curl / `aipc-cli app exec` / netstat).

**Diagnostic commands:**

```bash
# View health check logs
journalctl -u app-manager | grep -i "healthcheck"

# Execute the health check command manually inside the app container
aipc-cli app exec <app-id> -- /path/to/healthcheck.sh

# View app status
aipc-cli app info <app-id>
```

## 2. Video Stream Integration Troubleshooting

### 2.1 WebSocket Disconnection

WebSocket disconnection is usually client timeout, a server-side error, or network fluctuation; for the integration side (including the recommended reconnection strategy), see [Video Integration](../../2-3rd-party-integration/1-video-integration.md).

**Diagnostic commands:**

```bash
# View WebSocket connection logs
journalctl -u platform-api | grep -i "websocket\|h264"

# Test WebSocket connection
wscat -c ws://localhost:8080/api/v1/h264/main
```

## 3. Event Bus Troubleshooting

### 3.1 Event Publishing Failure

First confirm event-bus is running; the Topic must use the `app/<app_id>/<event>` format (e.g. `app/person_alert/person_detected`).

**Diagnostic commands:**

```bash
# Check event-bus status
systemctl status event-bus

# View event logs
journalctl -u event-bus -f

# Test event publishing
aipc-cli event publish app/demo/started '{"message": "test"}'
```

### 3.2 Subscription Failure

Subscription failure is usually an undeclared Topic permission (`permissions.events.subscribe` in `app.yaml`) or the client not reconnecting after a drop.

**Diagnostic commands:**

```bash
# Confirm event-bus is running
systemctl status event-bus

# Subscribe test, verify Topic permission
aipc-cli event subscribe "app/<your_app>/*"
```

## 4. Real-Deployment Troubleshooting Checklist (Field-Verified)

The following are common issues verified during real NE503 container-app deployments, organized as "Symptom → Root Cause → Fix". Sections 1–3 above are generic quick checks; this section covers the hard problems that recur in the field and need concrete operations.

### 4.1 Quick Reference

| # | Symptom | Root Cause | Fix |
|:--|:--------|:-----------|:----|
| 1 | `apk add ... I/O error` during build | Docker Desktop + buildx + alpine intermittent | Re-run the build command once |
| 2 | Start returns `DeadlineExceeded` | First-time image load into containerd exceeds the 10s gRPC timeout | Call the start API once more |
| 3 | Logs fail to parse with `json.tool` | Response is NDJSON (one JSON per line, not an array) | `json.loads` line by line |
| 4 | `curl -F app=@.aipc` JSON parse error | Old single-file upload API is deprecated | Use the two-step upload: upload-image + upload-manifest + install-package |
| 5 | Start reports `parent snapshot` or `no space` | containerd data can't lay out on the small root partition (3.3GB) | Move containerd root to the /data partition (see 4.2) |
| 6 | Start reports `mount ... no such file` | A volume's host directory declared in app.yaml doesn't exist | Create it manually with `mkdir -p` (see 4.2) |
| 7 | upload-image returns `no space left` | Root partition filled by stale logs/core dumps | Clean up large logs and core dumps (see 4.2) |
| 8 | Inference reports `NOT_FOUND: Model not found` | Model/stream name hardcoded, doesn't match the device | Query real names via `list_models()`/`list_streams()` (see 4.2) |
| 9 | Stuck in `SIMULATION mode`, no detections | camera-daemon not running (HAL missing, etc.) | See 4.2 |

### 4.2 Key Issues in Detail

#### #5 containerd partition misconfiguration (why large images can't lay out)

The device has two partitions: root `/` (~3.3GB, holds `/opt/aipc` platform + container data) and `/data` (~53GB, designed for apps/models/logs). If containerd's `root` is configured on the small root partition, images of tens of MB or more fill it on unpack and startup fails with `Failed to create container: parent snapshot sha256:...`.

```bash
# Diagnose: check partition usage
curl http://<device-ip>:8080/api/v1/monitor/disk -H "Authorization: Bearer <token>"
ssh root@<device-ip> "df -h / /data"

# Confirm containerd root location (should be /data/containerd)
ssh root@<device-ip> "grep '^root' /etc/containerd/config.toml"

# Fix: move to /data (restore design intent)
ssh root@<device-ip> "
  cp /etc/containerd/config.toml /etc/containerd/config.toml.bak
  sed -i 's|^root = \"/opt/aipc/containerd\"|root = \"/data/containerd\"|' /etc/containerd/config.toml
  mkdir -p /data/containerd
  systemctl restart containerd && systemctl restart app-manager
  rm -rf /opt/aipc/containerd   # clean up the orphaned dir we moved away from
"
```

#### #6 App volume directory doesn't exist

`app.yaml`'s `volumes` declares `host:/opt/aipc/data/<id> → container:/app/data`, but app-manager **does not auto-create the host directory**. If it's missing, runc fails to mount: `error mounting "/opt/aipc/data/<id>" ... no such file or directory`.

```bash
ssh root@<device-ip> "mkdir -p /opt/aipc/data/<app-id> /opt/aipc/logs/<app-id>"
```

#### #7 Root partition full

Find what's hogging the root partition and clean up stale files:

```bash
ssh root@<device-ip> "du -sh /opt/aipc/* /home/root/* | sort -rh | head"
# Common cleanable items: stale logs (/opt/aipc/logs/*.log), crash core dumps (/home/root/*.core), redundant install packages
ssh root@<device-ip> "truncate -s 0 /opt/aipc/logs/<big-log>; rm -f /home/root/*.core"
```

#### #8 Model/stream name mismatch

Inference subscription reports `StatusCode.NOT_FOUND: Model not found`, or app-manager logs `requires model X, but not found`. The cause is that the model/stream names hardcoded in `app.py` / `app.yaml` don't match the device.

```python
# Query the real names first, then fill them into app.py and app.yaml
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())              # e.g. ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())               # e.g. ['main', 'sub']
```

You can also confirm models via API: `curl http://<device-ip>:8080/api/v1/ai/models -H "Authorization: Bearer <token>"`; if needed, `POST /api/v1/ai/models/<id>/load` to load it onto the NPU.

#### #9 Stuck in simulation mode (SIMULATION)

App logs show `Running in SIMULATION mode - no actual inference` and detection results are always 0. This is the SDK's graceful degradation when it can't get a real video stream — **not an app bug**. The root cause is usually camera-daemon not running:

```bash
ssh root@<device-ip> "systemctl status camera-daemon"
# If activating (auto-restart): inspect the crash reason
ssh root@<device-ip> "journalctl -u camera-daemon -n 20 --no-pager"
# Typical root cause: dlopen(/opt/aipc/lib/hal/hal-hailo15.so) failure = firmware missing the HAL library, reflash an image that includes HAL
```

On a device with a working camera, the same app outputs real detection boxes.

### 4.3 Command Quick Reference

```bash
TOKEN="Bearer <token>"
IP="<device-ip>"

# Device status
curl http://$IP:8080/api/v1/monitor/disk    -H "Authorization: $TOKEN"   # partition usage
curl http://$IP:8080/api/v1/apps            -H "Authorization: $TOKEN"   # app list and status
curl http://$IP:8080/api/v1/ai/models       -H "Authorization: $TOKEN"   # loaded models

# App logs (NDJSON)
curl "http://$IP:8080/api/v1/apps/<id>/logs?max_lines=30" -H "Authorization: $TOKEN"

# Deep device-side inspection (SSH root/root)
ssh root@$IP "systemctl status containerd app-manager camera-daemon"     # service status
ssh root@$IP "df -h / /data; du -sh /opt/aipc/* | sort -rh | head"       # disk
ssh root@$IP "journalctl -u app-manager -n 30 --no-pager"               # app-manager logs
ssh root@$IP "journalctl -u camera-daemon -n 20 --no-pager"             # camera daemon
```

## Related Documentation

- [App Reference](./1-app-reference.md) — App configuration and deployment workflow
- [Video Integration](../../2-3rd-party-integration/1-video-integration.md) — Video stream integration guide
- [Event Integration](../../2-3rd-party-integration/2-event-integration.md) — Event bus integration guide
- [Platform Troubleshooting](../../../3-software-guide/4-reference/1-troubleshooting.md) — Platform service troubleshooting
