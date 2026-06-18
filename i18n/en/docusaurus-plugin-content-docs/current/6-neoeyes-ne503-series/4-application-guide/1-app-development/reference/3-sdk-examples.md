---
description: NE503 Python SDK practical example collection, including AI inference, event handling, device control, and multi-scenario integration as complete mini-apps.
keywords: [NE503, SDK examples, Python, AI inference, event handling, container application]
tags: [application development, NE503, SDK, examples]
---

# SDK Examples

This document demonstrates typical usage of `hailo_ipc_sdk` through 4 progressively complex complete mini-apps. For SDK API details, see [SDK Reference](./2-sdk-reference.md). For project structure and build/deploy workflows, see [App Reference](./1-app-reference.md).

:::warning Replace with your device's real stream and model names
The `STREAM` and `MODEL` values below are placeholders. Before deploying, you **must** query the real values on the device and fill them into `app.py` and `app.yaml`, otherwise the inference subscription will hang indefinitely or return `NOT_FOUND`:

```python
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())   # e.g. ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())    # e.g. ['main', 'sub']
```

Key conventions — inference must use the `sub` stream; model names and `permissions` must match the device and mirror each other across `app.py`/`app.yaml`. See [Person Detection tutorial §4](../2-person-detection.md#4-discovering-and-configuring-models-and-video-streams).
:::

## 1. Real-time Object Detection Counter

:::note Full real-device version
This is the minimal inference subscription pattern. For the full real-device version (model/stream discovery, health check, graceful shutdown, Web verification), see the [Person Detection tutorial](../2-person-detection.md).
:::

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
STREAM = "sub"                  # Stream ID (inference must use sub; verify via list_streams())
MODEL = "hailo_yolov8n_384_640"  # Inference model (query real name via list_models())
FPS = 10                        # Subscription frame rate
REPORT_INTERVAL = 5.0           # Summary print interval (seconds)

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
    video:
      - sub.raw                 # Inference subscription requires the raw stream (sub publishes NV12)
    inference:
      models: [hailo_yolov8n_384_640]
```

**Run**:

```bash
aipc-cli app install app.yaml object_counter.tar
aipc-cli app start object_counter
aipc-cli app logs object_counter --follow
```

**Behavior**:

After connecting to the inference service, the app prints a summary every `REPORT_INTERVAL` seconds, e.g.:

```
[object-counter] seq=50 | frames=50 | objects=3 | counts={'person': 2, 'car': 1} | infer=4.2ms
```

Here `counts` is the per-label detection count for the current frame and `infer` is the single-frame inference latency; `objects=0` when the scene is empty.

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
STREAM = "sub"                   # Inference must use sub
MODEL = "hailo_yolov8n_384_640"  # Query real model name via list_models()
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
    video:
      - sub.raw                   # Inference subscription requires the raw stream
    inference:
      models: [hailo_yolov8n_384_640]
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

**Behavior**:

The app subscribes to the inference stream; when it detects a person with confidence ≥ `SCORE_THRESHOLD`, it publishes a persistent alert event and skips duplicate alerts within the `COOLDOWN_SECONDS` window. Logs look like:

```
[person-alert] Alert alert-0001: 2 person(s) at frame 105
[person-alert] Received ACK from dashboard for alert alert-0001
```

The second line means another app (e.g. dashboard) subscribed to `app/person_alert/alert_ack` and replied with an ACK — cross-app integration is working.

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
STREAM = "sub"                   # Inference must use sub
MODEL = "hailo_yolov8n_384_640"  # Query real model name via list_models()
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
    video:
      - sub.raw                   # Inference subscription requires the raw stream
    inference:
      models: [hailo_yolov8n_384_640]
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

**Behavior**:

On startup the app reads and prints the initial device status (SoC temperature, IR-CUT mode, fill-light level). When a person is detected it switches to day mode (IR-CUT DAY + fill light); after `NO_PERSON_TIMEOUT` seconds with no person it switches back to night mode (IR-CUT NIGHT + IR LED). Logs look like:

```
[daynight-control] Device init: soc_temp=42.3C, ircut=NIGHT, light=0
[daynight-control] Switched to DAY mode (person detected at frame 50)
[daynight-control] Switched to NIGHT mode (no person for 30s)
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
STREAM = "sub"                   # Both inference and get_frame() use this raw stream
MODEL = "hailo_yolov8n_384_640"  # Query real model name via list_models()
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
      - sub.raw                       # FdMediaClient.get_frame() accesses the raw stream
    inference:
      models: [hailo_yolov8n_384_640]

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

**Behavior**:

The app subscribes to the inference stream; when a result contains a label in `TARGET_LABELS`, it uses `FdMediaClient.get_frame()` to grab the corresponding raw frame and saves it as a PNG to `CAPTURE_DIR` (must be a mounted volume in `app.yaml`). The same label is saved at most once per `CAPTURE_COOLDOWN` seconds. Logs look like:

```
[frame-capture] Captured person: seq=70, 1920x1080 RGB -> /app/data/captures/person_70_<ts>.png
```

Filenames include the label, frame sequence, and timestamp for later troubleshooting.

---

## 5. Running and Debugging

### 5.1 General Deployment Process

All mini-apps share the same build and deploy workflow as the tutorials: use the repo's bundled `build.sh` to do it in one step (copy SDK → ARM64 buildx → save → package into a `.aipc`), then deploy to the device via the Web console, aipc-cli, or HTTP. For the full steps, see [Hello World §3 Building the Image](../1-hello-world.md#3-building-the-image) and [§4 Deploying to the Device](../1-hello-world.md#4-deploying-to-the-device); for build/deploy errors, see [Troubleshooting](./troubleshooting.md).

### 5.2 Logs, Common Issues & Debugging

- **Viewing logs & startup verification**: see [Hello World §5 Start and Verify](../1-hello-world.md#5-start-and-verify);
- **Common error troubleshooting** (inference failure, permission denied, OOM, etc.): see [Troubleshooting](./troubleshooting.md);
- **Debug environment variables** (`DEBUG`, `LOG_LEVEL`): see [App Reference §7 Environment Variable Reference](./1-app-reference.md#7-environment-variable-reference).

---

## 6. Related Documentation

- [App Reference](./1-app-reference.md) -- Project creation, app.yaml configuration, and complete build/deploy workflow
- [SDK Reference](./2-sdk-reference.md) -- Detailed API reference for all SDK modules
- [Platform Architecture](../../../3-software-guide/0-system-architecture.md) -- NE503 software platform overall architecture and service topology
