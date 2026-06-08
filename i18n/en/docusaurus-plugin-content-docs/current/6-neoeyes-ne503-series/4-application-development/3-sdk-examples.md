---
description: NE503 Python SDK practical example collection, including AI inference, event handling, device control, and multi-scenario integration as complete mini-apps.
keywords: [NE503, SDK examples, Python, AI inference, event handling, container application]
tags: [application development, NE503, SDK, examples]
---

# SDK Examples

This document demonstrates typical usage of `hailo_ipc_sdk` through 4 progressively complex complete mini-apps. Each example can be deployed and run directly. For SDK API details, see [Python SDK Reference](./2-sdk-reference.md). For project structure and build/deploy workflows, see [Application Development Guide](./1-app-reference.md).

## 1. Real-time Object Detection Counter

**Scenario**: Subscribe to the AI inference stream, count detected objects per label in each frame, and print a summary at fixed intervals.

**Core API**: `InferenceClient.subscribe()` iterator, `InferenceResult.count_by_label()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("object-counter")

# -- Configuration ----------------------------------------------------------
STREAM = "cam0_main"          # Video stream ID
MODEL = "yolov8n"             # Inference model
FPS = 10                      # Subscription frame rate
REPORT_INTERVAL = 5.0         # Summary print interval (seconds)

# -- Main logic -------------------------------------------------------------
def main():
    inference = InferenceClient()
    last_report = time.monotonic()
    frame_count = 0

    logger.info("Connecting to inference service...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        frame_count += 1

        # Print a summary every REPORT_INTERVAL seconds
        now = time.monotonic()
        if now - last_report >= REPORT_INTERVAL:
            labels = {obj.label for obj in result.objects}
            counts = {label: result.count_by_label(label) for label in labels}
            infer_ms = result.infer_time_us / 1000
            logger.info(
                "seq=%d | frames=%d | objects=%d | counts=%s | infer=%.1fms",
                frame_seq, frame_count, len(result.objects), counts, infer_ms,
            )
            last_report = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: object_counter
  name: Object Counter
  version: 1.0.0
  description: Subscribe to inference stream and count detected objects

spec:
  image: aipc/object_counter:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    inference:
      models: [yolov8n]
```

**Run**:

```bash
aipc-cli app install app.yaml object_counter.tar
aipc-cli app start object_counter
aipc-cli app logs object_counter --follow
```

**Expected output**:

```
2026-06-01 10:00:05 [object-counter] Connecting to inference service...
2026-06-01 10:00:10 [object-counter] seq=50 | frames=50 | objects=3 | counts={'person': 2, 'car': 1} | infer=4.2ms
2026-06-01 10:00:15 [object-counter] seq=100 | frames=100 | objects=1 | counts={'person': 1} | infer=3.8ms
```

---

## 2. Smart Event Integration — Person Detection Triggered Alert

**Scenario**: When a person is detected in the inference results, publish an alert via the event bus; simultaneously subscribe to acknowledgment events from other apps to enable cross-app integration.

**Core API**: `InferenceClient.subscribe()` + `EventClient.publish()` / `EventClient.on_event()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, EventClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("person-alert")

APP_ID = "person_alert"

# -- Configuration ----------------------------------------------------------
STREAM = "cam0_main"
MODEL = "person_v1"
FPS = 15
SCORE_THRESHOLD = 0.8        # Confidence threshold
COOLDOWN_SECONDS = 5.0       # Alert cooldown time

# -- Callback: listen for acknowledgment events ----------------------------
def on_ack(event):
    ack_source = event.payload.get("source", "unknown")
    logger.info("Received ACK from %s for alert %s", ack_source, event.payload.get("alert_id"))

# -- Main logic -------------------------------------------------------------
def main():
    inference = InferenceClient()
    events = EventClient()

    # Listen for acknowledgment events in the background
    events.on_event(f"app/{APP_ID}/alert_ack", on_ack)

    last_alert_time = 0.0
    alert_count = 0

    logger.info("Starting person alert app...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        persons = result.get_objects_by_label("person")
        high_conf = [p for p in persons if p.score >= SCORE_THRESHOLD]

        if not high_conf:
            continue

        now = time.time()
        if now - last_alert_time < COOLDOWN_SECONDS:
            continue

        alert_count += 1
        alert_id = f"alert-{alert_count:04d}"

        events.publish(f"app/{APP_ID}/person_detected", {
            "alert_id": alert_id,
            "frame_sequence": frame_seq,
            "person_count": len(high_conf),
            "scores": [round(p.score, 3) for p in high_conf],
            "bboxes": [p.bbox.to_xywh() for p in high_conf],
        }, persistent=True)

        logger.info(
            "Alert %s: %d person(s) at frame %d",
            alert_id, len(high_conf), frame_seq,
        )
        last_alert_time = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: person_alert
  name: Person Alert
  version: 1.0.0
  description: Publish persistent alert events when a person is detected

spec:
  image: aipc/person_alert:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    inference:
      models: [person_v1]
    events:
      publish: [app/person_alert/*]
      subscribe: [app/person_alert/*]
```

**Run**:

```bash
aipc-cli app install app.yaml person_alert.tar
aipc-cli app start person_alert
aipc-cli app logs person_alert --follow
```

**Expected output**:

```
2026-06-01 10:00:05 [person-alert] Starting person alert app...
2026-06-01 10:00:12 [person-alert] Alert alert-0001: 2 person(s) at frame 105
2026-06-01 10:00:18 [person-alert] Received ACK from dashboard for alert alert-0001
2026-06-01 10:00:22 [person-alert] Alert alert-0002: 1 person(s) at frame 315
```

---

## 3. Day/Night Adaptive Control — Switch Devices Based on Detection Results

**Scenario**: When a person is detected, automatically turn on the fill light and switch to day mode (IR-CUT); when no one is present, turn off the fill light and switch to night mode (IR LED). Hardware integration is achieved through `DeviceClient`.

**Core API**: `InferenceClient.subscribe()` + `DeviceClient` light/IR-CUT control + `DeviceClient.get_device_status()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, DeviceClient, DeviceStatus, IrCutMode

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("daynight-control")

# -- Configuration ----------------------------------------------------------
STREAM = "cam0_main"
MODEL = "person_v1"
FPS = 5
LIGHT_LEVEL_DAY = 80          # Day fill light brightness (0-255)
NO_PERSON_TIMEOUT = 30.0      # No-person timeout before switching to night (seconds)

# -- Main logic -------------------------------------------------------------
def main():
    inference = InferenceClient()
    device = DeviceClient()

    is_day_mode = False
    last_person_time = 0.0

    # Read initial state
    status = device.get_device_status()
    logger.info(
        "Device init: soc_temp=%.1fC, ircut=%s, light=%d",
        status.soc_temp_c, status.ircut_mode.name, status.white_light_level,
    )

    logger.info("Starting day/night adaptive control...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        has_person = result.has_person()

        # Update the time of last person detection
        if has_person:
            last_person_time = now

        # -- Switch to day mode --
        if has_person and not is_day_mode:
            device.set_ircut(IrCutMode.DAY)
            device.set_white_light(LIGHT_LEVEL_DAY)
            device.set_ir_led(False)
            is_day_mode = True
            logger.info("Switched to DAY mode (person detected at frame %d)", frame_seq)

        # -- Switch to night mode after timeout --
        elif not has_person and is_day_mode and (now - last_person_time) >= NO_PERSON_TIMEOUT:
            device.set_ircut(IrCutMode.NIGHT)
            device.set_white_light(0)
            device.set_ir_led(True)
            is_day_mode = False
            logger.info("Switched to NIGHT mode (no person for %.0fs)", NO_PERSON_TIMEOUT)

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: daynight_control
  name: Day/Night Adaptive Control
  version: 1.0.0
  description: Automatically switch between day and night modes based on person detection results

spec:
  image: aipc/daynight_control:1.0.0
  resources:
    cpu: "20%"
    memory: "128Mi"

  permissions:
    inference:
      models: [person_v1]
    device:
      light: true
      ir_cut: true
```

**Run**:

```bash
aipc-cli app install app.yaml daynight_control.tar
aipc-cli app start daynight_control
aipc-cli app logs daynight_control --follow
```

**Expected output**:

```
2026-06-01 10:00:05 [daynight-control] Device init: soc_temp=42.3C, ircut=NIGHT, light=0
2026-06-01 10:00:05 [daynight-control] Starting day/night adaptive control...
2026-06-01 10:00:15 [daynight-control] Switched to DAY mode (person detected at frame 50)
2026-06-01 10:01:20 [daynight-control] Switched to NIGHT mode (no person for 30s)
```

---

## 4. Multi-Stream Frame Capture — Save Corresponding Inference Frames

**Scenario**: When specific labels are detected in the inference results, use `FdMediaClient` to retrieve the corresponding raw frame image and save it to a file. Demonstrates collaboration between inference streams and video streams.

**Core API**: `InferenceClient.subscribe()` + `FdMediaClient.get_frame()` + `Frame.save()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, FdMediaClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("frame-capture")

# -- Configuration ----------------------------------------------------------
STREAM = "cam0_main"
MODEL = "yolov8n"
FPS = 10
TARGET_LABELS = {"person", "car"}    # Target labels that trigger a save
CAPTURE_DIR = "/app/data/captures"   # Save directory (volume must be mounted in app.yaml)
CAPTURE_COOLDOWN = 10.0              # Minimum save interval for the same label (seconds)

# -- Main logic -------------------------------------------------------------
def main():
    inference = InferenceClient()
    media = FdMediaClient()

    last_capture = {}     # label -> timestamp
    capture_count = 0

    logger.info("Starting frame capture for labels: %s", TARGET_LABELS)
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        matched_labels = {obj.label for obj in result.objects if obj.label in TARGET_LABELS}

        for label in matched_labels:
            # Cooldown check
            if now - last_capture.get(label, 0) < CAPTURE_COOLDOWN:
                continue

            # Get current frame
            frame = media.get_frame(STREAM, timeout_ms=2000)
            if frame is None:
                logger.warning("Failed to get frame for seq=%d", frame_seq)
                continue

            # Save to file
            capture_count += 1
            filename = f"{CAPTURE_DIR}/{label}_{frame_seq}_{int(now)}.png"
            frame.save(filename)

            logger.info(
                "Captured %s: seq=%d, %dx%d %s -> %s",
                label, frame_seq, frame.width, frame.height, frame.format, filename,
            )
            last_capture[label] = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: frame_capture
  name: Frame Capture
  version: 1.0.0
  description: Save corresponding frame images when specific targets are detected

spec:
  image: aipc/frame_capture:1.0.0
  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    video:
      - cam0_main                     # FdMediaClient accesses video stream
    inference:
      models: [yolov8n]

  volumes:
    - host: /opt/aipc/data/frame_capture
      container: /app/data/captures
      readonly: false
```

**Run**:

```bash
aipc-cli app install app.yaml frame_capture.tar
aipc-cli app start frame_capture
aipc-cli app logs frame_capture --follow
```

**Expected output**:

```
2026-06-01 10:00:05 [frame-capture] Starting frame capture for labels: {'person', 'car'}
2026-06-01 10:00:12 [frame-capture] Captured person: seq=70, 1920x1080 RGB -> /app/data/captures/person_70_1748763612.png
2026-06-01 10:00:25 [frame-capture] Captured car: seq=200, 1920x1080 RGB -> /app/data/captures/car_200_1748763625.png
```

---

## 5. Running and Debugging

### 5.1 General Deployment Process

All mini-apps follow the same deployment steps:

```bash
# 1. Build Docker image
docker build -t aipc/<app_id>:1.0.0 .

# 2. Export image
docker save aipc/<app_id>:1.0.0 | gzip > <app_id>.tar.gz

# 3. Transfer to device
scp app.yaml <app_id>.tar.gz root@<device-ip>:/tmp/

# 4. Install and start on device
ssh root@<device-ip> "cd /tmp && gunzip <app_id>.tar.gz && \
  aipc-cli app install app.yaml <app_id>.tar && \
  aipc-cli app start <app_id>"
```

### 5.2 Viewing Logs

```bash
# View last 100 log lines
aipc-cli app logs <app_id>

# Follow logs in real time
aipc-cli app logs <app_id> --follow

# View application status
aipc-cli app list
aipc-cli app stats <app_id>
```

### 5.3 Common Issues

| Issue | Cause | Solution |
|:---|:---|:---|
| `RuntimeError: Inference failed` | Model not loaded or ID mismatch | Run `aipc-cli model list` to confirm the model name |
| `Connection refused` on Socket | Permissions not declared or service not running | Check `app.yaml` `permissions` configuration |
| `Permission denied` writing file | Volume not mounted or read-only | Check `volumes` configuration, ensure `readonly: false` |
| Frame rate is 0 / no inference results | Video stream not enabled | Confirm `stream` parameter matches the actual stream ID |
| Out of memory (OOM) | `resources.memory` set too low | Increase memory limit; image processing apps should use >= 256Mi |

### 5.4 Development Debug Mode

Enable debug environment variables in `app.yaml`:

```yaml
spec:
  env:
    - name: DEBUG
      value: "1"
    - name: LOG_LEVEL
      value: DEBUG
```

`hailo_ipc_sdk`'s `Config.is_debug()` and `Config.get_log_level()` will automatically read these variables.

---

## 6. Related Documentation

- [Application Development Guide](./1-app-reference.md) -- Project creation, app.yaml configuration, and complete build/deploy workflow
- [Python SDK Reference](./2-sdk-reference.md) -- Detailed API reference for all SDK modules
- [Platform Architecture](../3-platform-development/0-platform-architecture.md) -- NE503 software platform overall architecture and service topology
