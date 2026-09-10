---
description: "NE503 troubleshooting: run the minimum check for each symptom and identify the next step."
keywords: [NE503 troubleshooting, RTSP, AI model, container, Event Bus, flashing]
tags: [NE503, Troubleshooting, FAQ]
---

# Troubleshooting

Use “symptom → check → result → next step.” Back up before upgrading, reflashing, deleting models, or cleaning files.

## Quick Triage

| Symptom | Entry |
|:--|:--|
| Web console unavailable | [Device and Network](#1-device-and-network) |
| Web/RTSP has no video | [Video and Streams](#2-video-and-streams) |
| Model has no result | [AI and Models](#3-ai-and-models) |
| App exits or install fails | [Apps and Containers](#4-apps-and-containers) |
| Events are missing | [Events and Integration](#5-events-and-integration) |
| Disk full or upload fails | [Storage and Disk](#6-storage-and-disk) |
| Flashing or peripheral failure | [Flashing and Peripherals](#7-flashing-and-peripherals) |
| Service or socket failure | [System and Services](#8-system-and-services) |

## 1. Device and Network

### 1.1 Web console unavailable

**Check:**

~~~bash
ping <device-ip>
curl -k -I https://<device-ip>
ssh root@<device-ip>
aipc-cli system health
systemctl status platform-api
~~~

**Result:**

- Ping fails: check power, cable, computer subnet, and firewall; look up a DHCP address in the router.
- Ping works but HTTPS fails: check platform-api logs.
- The page opens but login fails: go to “Forgot password.”

### 1.2 Forgot password

The Web password cannot be reset locally. If you can still log in, use **Settings → Device Info → Change Password**. If it is lost, contact support for reflashing.

### 1.3 Lens or RS-485 has no response

Check wiring, power, A/B polarity, ground, baud rate, address, and protocol frame first. For the lens:

~~~bash
systemctl status camera-daemon
~~~

/dev/ttyS0 is the internal core-board-to-MCU link, not the external RS-485 interface. Initialize external RS-485 in the app before sending frames.

## 2. Video and Streams

### 2.1 RTSP has no video

**Check:**

~~~bash
aipc-cli stream list
systemctl status camera-daemon
ffmpeg -rtsp_transport tcp -i rtsp://<device-ip>:8554/main -t 10 -f null -
~~~

**Result:**

- Stream disabled: enable RTSP on **Media** and save.
- Network failure: check the device address and firewall port 8554.
- FFmpeg receives frames: the player or client is the problem.
- Still failing: inspect camera-daemon logs.

RTSP currently has no authentication. In production, allow only selected hosts such as the NVR.

### 2.2 Web preview is black or disconnects

Confirm that HTTPS/WebSocket is reachable and the token is valid, then check:

~~~bash
systemctl status platform-api
journalctl -u platform-api -n 50 --no-pager
~~~

For a black preview, keep HD_PREVIEW_ENABLED=0 in the app to use the MJPEG fallback. If it still fails, return to 2.1.

### 2.3 App is in SIMULATION

A SIMULATION log means the app has no real video. Check:

~~~bash
systemctl status camera-daemon
journalctl -u camera-daemon -n 50 --no-pager
~~~

If a HAL library is missing, reflash a system image that contains the required HAL.

## 3. AI and Models

### 3.1 Model loaded but no result

**Check:**

~~~bash
aipc-cli model list
aipc-cli app logs <app-id>
~~~

Confirm:

1. Model state is **Loaded**;
2. app permissions include the model and raw stream;
3. the model input matches the active stream configuration;
4. the threshold is not too high;
5. inference uses third or sub, not main, which provides H.264 only.

See [Model Training and HEF](./4-application-guide/4-model-training-and-hef.md) for model import and custom HEF flow.

### 3.2 Model not found or input-size error

The model ID must match the registered device name. byte_size mismatch means the HEF input does not match the active stream configuration. Confirm the actual model name and input in aipc-cli model list and app logs, then update app.yaml or recompile the HEF.

## 4. Apps and Containers

### 4.1 Install fails

**Check:**

~~~bash
yamllint app.yaml
journalctl -u app-manager -n 100 --no-pager
~~~

**Result:**

- YAML error: fix the manifest;
- image import failure: check disk, network, and package architecture;
- permission error: check install-wizard Permissions;
- old single-file upload failure: use Upload Image → Upload Manifest → Install Package.

### 4.2 App exits or restarts

~~~bash
aipc-cli app logs <app-id>
df -h / /data
free -h
systemctl status containerd
~~~

Check resources, image import, and permissions. If the log shows an unavailable model or stream, return to section 3; for storage errors, return to section 6.

### 4.3 Health check fails

Check the probe address, command, or port in the manifest:

~~~bash
aipc-cli app info <app-id>
aipc-cli app logs <app-id>
~~~

Reproduce the probe in the container using the same method, fix it, and restart the app.

## 5. Events and Integration

### 5.1 Publish or subscribe fails

~~~bash
systemctl status event-bus
journalctl -u event-bus -n 50 --no-pager
aipc-cli event subscribe "app/<app-id>/*"
~~~

Check the topic spelling, publish/subscribe permissions, and subscriber connection. Fix Event Bus before checking the app.

### 5.2 API returns 401/403/404/5xx

| Status | Check |
|:--|:--|
| 401 | Sign in again and obtain a new token |
| 403 | Check user or app permissions |
| 404 | Check the path and resource ID |
| 5xx | Inspect platform-api and dependency logs |

Use the [neoruntime OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) as the API source of truth.

## 6. Storage and Disk

### 6.1 Disk full or upload fails

~~~bash
df -h / /data
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

Use **Maintenance → File Manager** to remove old logs, unused apps, models, and packages. Confirm the containerd path and backup before deleting containerd data.

### 6.2 App data directory missing

After confirming the app ID, create the declared directories:

~~~bash
mkdir -p /data/aipc/data/<app-id> /data/aipc/logs/<app-id>
~~~

### 6.3 Logs or core dumps fill the root partition

Export logs needed by support first. Then remove only confirmed obsolete logs or core files; do not delete files of unknown purpose.

## 7. Flashing and Peripherals

### 7.1 Flashing fails or an upgrade is interrupted

Check power, serial connection, baud rate, TFTP network, and firmware version. Retry the boot-chain recovery and system-flashing steps in [System Flashing](./3-software-guide/2-system-flashing.md).

### 7.2 Alarm, Wiegand, or RS-485 failure

Check the physical layer, then app configuration and service logs:

- Alarm input is not reported to Event Bus/API in the current firmware;
- Alarm Input Level is not effective in the current firmware;
- Wiegand is currently an output interface and does not accept card readers;
- RS-485 requires correct initialization, wiring, and protocol frames.

## 8. System and Services

### 8.1 Service startup failure

~~~bash
systemctl --failed
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api
journalctl -u <service-name> -b --no-pager
~~~

**Result:**

- service is not active: check its startup log and dependencies;
- socket is missing: repair the corresponding service;
- permission denied: check /run/aipc ownership;
- resources are exhausted: return to section 6.

### 8.2 Socket or performance issue

~~~bash
ls -la /run/aipc/*.sock
free -h
df -h / /data
top -p $(pgrep -f ai-runtime)
~~~

Record the service, time, error log, and device version before contacting support.

## Related Documentation

- [System Architecture](./3-software-guide/0-system-architecture.md)
- [System Flashing](./3-software-guide/2-system-flashing.md)
- [Resources](./4-application-guide/3-resources.md)
