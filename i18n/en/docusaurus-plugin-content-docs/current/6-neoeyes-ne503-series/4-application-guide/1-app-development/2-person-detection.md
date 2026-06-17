---
description: Deploy a real AI inference application Person Detection on NE503, mastering Python SDK calls, model and video stream discovery, permission configuration, and Web console verification.
keywords: [NE503, Person Detection, application tutorial, AI inference, Python SDK, human detection, container application]
tags: [application development, NE503, tutorial, AI inference, SDK]
---

# Person Detection

This tutorial builds on the [Hello World tutorial](./1-hello-world.md) and deploys a **real AI inference application** Person Detection. You will learn to: call the Python SDK to subscribe to video stream inference results, discover models and streams on the device, configure application permissions, and verify a complete application that publishes detection events and triggers the device light control.

:::info Prerequisites
Please complete the [Hello World Application Tutorial](./1-hello-world.md) first to master the basic workflow of building images, two-step upload, asynchronous installation, and startup verification. This tutorial omits those repeated steps and focuses on the SDK and AI inference parts.
:::

## 1. What It Does

Person Detection subscribes to the camera video stream and runs AI detection model inference frame by frame. When a person appears in the frame:

1. Counts the number of people and confidence scores;
2. Publishes `app/person-detection/detection` and `alerts/detection` events to the event bus (with debounce cooldown);
3. Triggers the device fill light (`device.set_white_light`).

:::info Prerequisite: get the sample project
This tutorial is built on the complete sample project in the ne503 source repo. Clone the repo and enter the app directory first:

```bash
git clone https://github.com/camthink-ai/ne503.git
cd ne503/apps/person-detection
```

The directory already contains every file this tutorial needs:

```
person-detection/
├── app.py             # App logic (SDK subscribe + detection + events + light)
├── app.yaml           # Manifest (permissions/resources/env/thresholds)
├── build.sh           # Build script (copy SDK → buildx → save → .aipc)
├── Dockerfile         # Container build definition
└── requirements.txt   # Python dependencies
```

The following sections walk through the key parts of each file, and what you need to verify or change (stream name, model name, detection threshold).
:::

## 2. Application Structure and SDK Usage

### 2.1 Application Source app.py

Below is the complete source of Person Detection (the repo's `apps/person-detection/app.py`). It does five things: initialize the SDK clients → subscribe to the `sub` stream's inference results → filter persons by `DETECTION_THRESHOLD` → publish structured detection results to the event bus → trigger the fill light when a person is detected; it also listens for SIGTERM to shut down gracefully.

```python
#!/usr/bin/env python3
"""
Person Detection Application for AIPC Platform

Features:
- Subscribe to video stream inference results
- Detect persons using AI model
- Publish detection events to event bus
- Control device (light) on detection
"""

import os
import sys
import time
import signal
import logging
from datetime import datetime
from typing import Optional

# AIPC SDK
from hailo_ipc_sdk import (
    InferenceClient,
    EventClient,
    DeviceClient,
    FdMediaClient as MediaClient,
    Config,
    InferenceResult,
    DetectedObject,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.environ.get('LOG_LEVEL', 'INFO')),
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class PersonDetectionApp:
    """Person Detection Application"""

    def __init__(self):
        self.running = True
        self.app_id = Config.get_app_id()
        self.debug = Config.is_debug()

        # Configuration from environment
        self.detection_threshold = float(os.environ.get('DETECTION_THRESHOLD', '0.2'))
        self.alert_cooldown = int(os.environ.get('ALERT_COOLDOWN_SECONDS', '5'))

        # SDK Clients
        self.inference: Optional[InferenceClient] = None
        self.events: Optional[EventClient] = None
        self.device: Optional[DeviceClient] = None
        self.media: Optional[MediaClient] = None

        # State tracking
        self.frame_count = 0
        self.total_detections = 0
        self.last_alert_time = 0
        self.person_count_history = []

        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        logger.info("=" * 60)
        logger.info(f"  Person Detection Application v1.0.0")
        logger.info(f"  App ID: {self.app_id}")
        logger.info(f"  Platform: {os.uname().machine}")
        logger.info(f"  Detection Threshold: {self.detection_threshold}")
        logger.info("=" * 60)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False

    def initialize(self) -> bool:
        """Initialize SDK clients"""
        try:
            # Initialize Inference Client
            logger.info("Initializing AI Inference client...")
            self.inference = InferenceClient()

            # List available models
            models = self.inference.list_models()
            logger.info(f"Available models: {[m.model_id for m in models]}")

            # Check if required model is available
            required_model = "hailo_yolov8n_384_640"
            model_available = any(m.model_id == required_model for m in models)
            if model_available:
                logger.info(f"[OK] Model '{required_model}' is available for inference")
            else:
                logger.warning(f"[WARN] Model '{required_model}' NOT found - inference may fail")

            # Initialize Event Bus Client
            logger.info("Initializing Event Bus client...")
            self.events = EventClient()

            # Initialize Device Control Client (optional)
            try:
                logger.info("Initializing Device Control client...")
                self.device = DeviceClient()
            except Exception as e:
                logger.warning(f"Device control not available: {e}")
                self.device = None

            # Initialize Media Client (for raw video stream access)
            try:
                logger.info("Initializing Media client...")
                self.media = MediaClient()

                # List available video streams
                available_streams = self.media.list_streams()
                logger.info(f"Available video streams: {available_streams}")

                # Check if required stream is available
                # NOTE: must use a stream that publishes raw NV12 frames (sub or third).
                # "main" only publishes encoded H264 for RTSP — subscribe() on it hangs.
                required_stream = "sub"
                if hasattr(self.media, "get_stream_info"):
                    stream_info = self.media.get_stream_info(required_stream)
                    if stream_info:
                        logger.info(f"[OK] Video stream '{required_stream}' is available: "
                                   f"{stream_info.width}x{stream_info.height} @ {stream_info.fps}fps, format={stream_info.format}")
                else:
                    shm_path = f"/run/aipc/shm/{required_stream}.raw"
                    if os.path.exists(shm_path):
                        logger.info(f"[OK] Video stream '{required_stream}' SHM file exists at {shm_path}")
                    else:
                        logger.warning(f"[WARN] Video stream '{required_stream}' SHM not found - inference may fall back to simulation")
            except Exception as e:
                logger.warning(f"Media client not available: {e}")
                self.media = None

            logger.info("All clients initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize clients: {e}")
            if self.debug:
                import traceback
                traceback.print_exc()
            return False

    def run(self):
        """Main application loop"""
        if not self.initialize():
            logger.error("Initialization failed, exiting")
            return 1

        logger.info("Starting person detection loop...")
        logger.info(f"Subscribing to stream 'sub' with model 'hailo_yolov8n_384_640'")
        logger.info("Waiting for inference results... (this may take a moment if stream is initializing)")

        first_frame_received = False

        try:
            # Subscribe to video stream inference results
            # The platform will run inference on each frame and send results
            for frame_seq, result in self.inference.subscribe(
                stream="sub",
                model="hailo_yolov8n_384_640",
                fps=10  # Process at 10 FPS
            ):
                if not self.running:
                    break

                # Log when first frame is received
                if not first_frame_received:
                    first_frame_received = True
                    logger.info(f"[OK] Received first inference result - stream and model are working!")
                    logger.info(f"  Frame sequence: {frame_seq}, timestamp: {result.timestamp_ns}")
                    # Check if running in simulation mode (no actual inference)
                    if result.status_message == "simulation":
                        logger.warning("  WARNING: Running in SIMULATION mode - no actual inference!")
                        logger.warning("  This means FdReceiver cannot subscribe to video stream.")
                        logger.warning("  Check: 1) camera-daemon is running, 2) /run/aipc/camera.sock exists")

                self._process_frame(frame_seq, result)

        except KeyboardInterrupt:
            logger.info("Interrupted by user")
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            if self.debug:
                import traceback
                traceback.print_exc()
            return 1
        finally:
            if not first_frame_received:
                logger.warning("No inference results received - check if video stream 'sub' is active and model 'hailo_yolov8n_384_640' is loaded")
            self._cleanup()

        return 0

    def _process_frame(self, frame_seq: int, result: InferenceResult):
        """Process a single frame's inference result"""
        self.frame_count += 1

        # Count persons with confidence above threshold
        persons = [
            obj for obj in result.objects
            if obj.label == "person" and obj.score >= self.detection_threshold
        ]
        person_count = len(persons)

        # Track history for analytics
        self.person_count_history.append(person_count)
        if len(self.person_count_history) > 100:
            self.person_count_history.pop(0)

        # Log detection
        if person_count > 0:
            self.total_detections += 1
            logger.info(f"[Frame {frame_seq}] Detected {person_count} person(s)")

            for i, obj in enumerate(persons):
                bbox = obj.bbox
                logger.debug(
                    f"  Person {i+1}: confidence={obj.score:.2f}, "
                    f"position=({bbox.x:.2f}, {bbox.y:.2f}), "
                    f"size=({bbox.width:.2f}x{bbox.height:.2f})"
                )

        # Publish detection event
        self._publish_detection_event(frame_seq, result, persons)

        # Device control: turn on light when person detected
        if person_count > 0 and self.device:
            self._trigger_light()

        # Print statistics every 100 frames
        if self.frame_count % 100 == 0:
            self._print_statistics()

    def _publish_detection_event(self, frame_seq: int, result: InferenceResult, persons: list):
        """Publish detection event to event bus"""
        try:
            event_data = {
                "app_id": self.app_id,
                "frame_sequence": frame_seq,
                "timestamp_ns": result.timestamp_ns,
                "timestamp_iso": datetime.now().isoformat(),
                "person_count": len(persons),
                "total_frames_processed": self.frame_count,
                "total_detections": self.total_detections,
                "objects": [
                    {
                        "label": obj.label,
                        "confidence": round(obj.score, 3),
                        "bbox": {
                            "x": round(obj.bbox.x, 3),
                            "y": round(obj.bbox.y, 3),
                            "width": round(obj.bbox.width, 3),
                            "height": round(obj.bbox.height, 3)
                        }
                    }
                    for obj in persons
                ]
            }

            # Publish to app-specific topic
            self.events.publish(f"app/{self.app_id}/detection", event_data)

            # Publish alert if cooldown expired
            current_time = time.time()
            if len(persons) > 0 and (current_time - self.last_alert_time) >= self.alert_cooldown:
                self.events.publish("alerts/detection", {
                    "type": "person_detected",
                    "app_id": self.app_id,
                    "person_count": len(persons),
                    "timestamp": datetime.now().isoformat()
                })
                self.last_alert_time = current_time
                logger.debug("Alert event published")

        except Exception as e:
            logger.error(f"Failed to publish event: {e}")

    def _trigger_light(self):
        """Trigger white light when person detected"""
        try:
            # Set white light to 50% brightness
            self.device.set_white_light(50)
            logger.debug("Light triggered")
        except Exception as e:
            logger.debug(f"Light control failed: {e}")

    def _print_statistics(self):
        """Print processing statistics"""
        avg_persons = sum(self.person_count_history) / len(self.person_count_history) if self.person_count_history else 0
        logger.info(
            f"Statistics: frames={self.frame_count}, "
            f"detections={self.total_detections}, "
            f"avg_persons={avg_persons:.2f}"
        )

    def _cleanup(self):
        """Cleanup resources before exit"""
        logger.info("Cleaning up resources...")

        logger.info(f"Total frames processed: {self.frame_count}")
        logger.info(f"Total detections: {self.total_detections}")

        # Close SDK clients
        if self.inference:
            self.inference.close()
        if self.events:
            self.events.close()
        if self.device:
            self.device.close()
        if self.media:
            self.media.close()

        logger.info("Cleanup complete. Goodbye!")


def main():
    """Main entry point"""
    app = PersonDetectionApp()
    sys.exit(app.run())


if __name__ == "__main__":
    main()
```

Key logic reference (these are the spots to edit when changing the model/stream/threshold):

| Module | Location | Description |
|:---|:---|:---|
| Config | `__init__` | Reads `DETECTION_THRESHOLD` and `ALERT_COOLDOWN_SECONDS` from env (defaults 0.2 / 5); actual values are injected by `app.yaml`'s `env`, see §2.2 |
| Model/stream discovery | `initialize` | `list_models()` / `list_streams()` print the device's real values and verify `hailo_yolov8n_384_640` and `sub` are available |
| Subscribe to inference | `run` | `infer.subscribe(stream="sub", model="hailo_yolov8n_384_640", fps=10)` — **stream must be sub**; main only sends H264 and hangs forever |
| Detection filter | `_process_frame` | Keeps only targets with `label == "person"` and `score >= threshold` |
| Event publishing | `_publish_detection_event` | Publishes `app/person-detection/detection` every frame; `alerts/detection` at most once per cooldown window |
| Light control | `_trigger_light` | `device.set_white_light(50)` (50% brightness) when a person is detected |
| Graceful shutdown | `_signal_handler` / `_cleanup` | SIGTERM sets `running=False`; after the loop breaks, all clients are closed |

### 2.2 Permission Manifest app.yaml

The application must declare required permissions in `app.yaml`, which the platform uses for container isolation and sandboxing. Person Detection declares: video stream `sub.raw` (sub publishes raw NV12 frames for inference; main is only for RTSP pulling), model `hailo_yolov8n_384_640`, event publish/subscribe topics, and device light control.

```yaml
# AIPC Platform Application Manifest
apiVersion: v1
kind: Application

metadata:
  id: person-detection
  name: Person Detection
  version: 1.0.0
  description: Real-time person detection with AI inference and event publishing
  author: AIPC Team

spec:
  image: aipc/person-detection:1.0.0

  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    video:
      - sub.raw                       # Stream publishing raw NV12 frames (main only sends H264, cannot subscribe for inference)
    inference:
      models:
        - hailo_yolov8n_384_640        # Must match a model loaded on the device
      max_qps: 30
      max_concurrent: 2
      allow_register_model: false
    events:
      publish:
        - app/person-detection/*
        - alerts/detection
      subscribe:
        - system/*
        - model/*/detections
    device:
      light: true                     # Fill light control
      ir_cut: true
    network:
      mode: isolated                  # Container network isolation (no outbound)

  # Environment variables: app.py reads them via os.environ
  env:
    - name: DETECTION_THRESHOLD
      value: "0.3"                    # Person confidence floor; targets below this score are ignored
    - name: ALERT_COOLDOWN_SECONDS
      value: "5"                      # Minimum interval (seconds) between alerts/detection events
    - name: LOG_LEVEL
      value: "INFO"                   # Log level: DEBUG / INFO / WARNING / ERROR

  volumes:
    - host: /opt/aipc/data/person-detection
      container: /app/data
      readonly: false
    - host: /opt/aipc/logs/person-detection
      container: /app/logs
      readonly: false

  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3

  healthcheck:
    enabled: true
    interval: 30s
    timeout: 5s
    retries: 3
```

Field reference:

| Field | Description |
|-------|-------------|
| `spec.image` | Container image address; must match the image name produced by `build.sh` (e.g. `aipc/person-detection:1.0.0`). |
| `spec.resources.cpu` | Container CPU quota; may be a percentage (`"50%"`) or a core count. |
| `spec.resources.memory` | Container memory limit (`"256Mi"`); exceeding it triggers an OOM kill. |
| `spec.permissions.video` | Allowlist of video streams the app may access; the stream name must match an actual device stream (e.g. `sub`). To subscribe to inference results you must use a stream that publishes raw NV12 frames (sub or third); main is only for RTSP pulling. |
| `spec.permissions.inference.models` | Allowlist of AI models the app may call; the model name must match a model loaded on the device (i.e. the value from `list_models()`). |
| `spec.permissions.inference.max_qps` | Per-model cap on inference requests per second. |
| `spec.permissions.inference.max_concurrent` | Cap on the number of concurrent inference sessions the app may hold. |
| `spec.permissions.events.publish` | Event topics the app may publish to the event bus; supports `*` wildcards. |
| `spec.permissions.events.subscribe` | Event topics the app may subscribe to; supports `*` wildcards. |
| `spec.permissions.device.light` | Whether the app may trigger the device fill light (`device.set_white_light`). |
| `spec.permissions.device.ir_cut` | Whether the app may control the IR-CUT filter (day/night switching). |
| `spec.permissions.network.mode` | Container network mode; `isolated` means no outbound network (default). |
| `spec.env` | Environment variables injected into the container; app.py reads them via `os.environ`. `DETECTION_THRESHOLD` is the person confidence floor (raise = stricter, fewer false positives; lower = more sensitive, possibly more detections); `ALERT_COOLDOWN_SECONDS` is the alert debounce interval. |
| `spec.volumes` | Host directories mounted into the container for persistent data/logs (host paths must match the actual device). |
| `spec.autostart` | Whether the platform auto-starts this app on boot. |
| `spec.restart_policy` | Crash restart policy (`on-failure` with `restart_max_retries`). |
| `spec.healthcheck` | Container health check; failing `retries` times in a row marks it unhealthy and triggers a restart. |

> The declarative permission model means: **inside the sandbox, the app can only access the resources listed here.** Any stream, model, event topic, or device control not declared will be rejected by the platform at call time. See [System Architecture](../../3-software-guide/0-system-architecture.md) for details.

## 3. Building the Image

### 3.1 Build Files

**`Dockerfile`** — based on `python:3.11-slim-bookworm`; installs system deps, bakes the SDK into the image locally, installs app deps, and runs as a non-root user:

```dockerfile
FROM python:3.11-slim-bookworm

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl procps libglib2.0-0 libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# SDK installed locally (copied in by build.sh before the build)
COPY hailo_ipc_sdk/ /app/hailo_ipc_sdk/
COPY setup.py README.md /app/
RUN pip install --no-cache-dir -e .

# App code and dependencies
COPY app.py /app/app.py
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
RUN mkdir -p /app/data /app/logs && chown -R appuser:appuser /app/data /app/logs

ENV APP_ID=person-detection
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "from hailo_ipc_sdk import InferenceClient; c = InferenceClient(); c.close()" || exit 1

USER appuser
CMD ["python3", "/app/app.py"]
```

**`requirements.txt`** — only numpy (the SDK already bundles protobuf/grpc, no need to redeclare):

```text
numpy>=1.21.0
```

:::note Why does the Dockerfile `pip install` a local SDK?
The device's container runtime has no outbound network, so the SDK must be carried into the image. `build.sh` copies `sdk/python/hailo_ipc_sdk/` into the app directory before building; the Dockerfile's `COPY hailo_ipc_sdk/` bakes it into the image, then `pip install -e .` installs it locally. See [SDK Workflow §2](./0-sdk-workflow.md#2-where-the-sdk-comes-from-and-how-to-embed-it) for the rationale.
:::

### 3.2 Build and Package

The repo's bundled `build.sh` is a one-shot script for the entire "build image → export → package" flow — no need to run multiple docker commands manually.

```bash
cd apps/person-detection
# Must use arm64: the device is aarch64; an x86_64 image cannot be imported onto the device
bash build.sh arm64
```

`build.sh` runs 5 steps internally:

| Step | Action | Description |
|:-----|:-------|:------------|
| 1 | Copy SDK | Copies `hailo_ipc_sdk/`, `setup.py`, `README.md` from `sdk/python/` into the app directory (the Dockerfile needs them) |
| 2 | Build image | `docker buildx build --platform linux/arm64` produces `aipc/person-detection:1.0.0` |
| 3 | Export image | `docker save` exports it to `image.tar` |
| 4 | Package | `zip` bundles `app.yaml` + `image.tar` into `person-detection.aipc` |
| 5 | Cleanup | Deletes the SDK files copied in step 1 and the intermediate `image.tar`, **keeping only `person-detection.aipc`** |

Build artifacts:

| Artifact | Size | Description |
|:---------|:-----|:------------|
| Docker image `aipc/person-detection:1.0.0` | ~434 MB | `python:3.11-slim` + grpcio/numpy/protobuf; stays in local Docker |
| `person-detection.aipc` | ~97 MB | The deliverable package (a zip of `app.yaml` + `image.tar`) |

:::warning Unzip before deploying
Step 5 of `build.sh` deletes `image.tar`, but deploying to the device requires the two separate files `app.yaml` and `image.tar`. Unzip the `.aipc` to recover them before deploying:

```bash
unzip -o person-detection.aipc   # recovers app.yaml + image.tar
```

See [§5 Deploying to the Device](#5-deploying-to-the-device).
:::

## 4. Discovering and Configuring Models and Video Streams

The model name in `subscribe(model=...)` (app.py) and the stream name in `permissions.video` (app.yaml) **must use the actual values on your device** — do not copy example code verbatim. Names differ across devices and firmware versions; a wrong name fails with `StatusCode.NOT_FOUND`.

Three steps: query models → query streams → fill the correct values into your app.

### 4.1 Query models on the device

Device model files live in `/opt/aipc/models/`. Before first use, scan and load them onto the NPU:

```bash
TOKEN="Bearer <token>"   # get it by calling /api/login with admin/password

# 1. Scan the model directory and register .hef files with the platform
curl -X POST http://<device-ip>:8080/api/v1/ai/models/scan -H "Authorization: $TOKEN"

# 2. Load a specific model onto the NPU (required before inference)
curl -X POST http://<device-ip>:8080/api/v1/ai/models/hailo_yolov8n_384_640/load -H "Authorization: $TOKEN"

# 3. List currently available models and confirm the model_id
curl http://<device-ip>:8080/api/v1/ai/models -H "Authorization: $TOKEN"
```

NE503 ships with the detection model `hailo_yolov8n_384_640` (YOLOv8n, COCO 80 classes including person). Note the real `model_id` returned by `list` — you'll put it into app.py next.

### 4.2 Query video streams on the device

Stream names are easiest to query via the SDK (there's no dedicated curl endpoint for streams). Call this during app.py initialization:

```python
from hailo_ipc_sdk import FdMediaClient as MediaClient
print(MediaClient().list_streams())   # → ['main', 'sub']
```

NE503 usually has two streams with very different purposes — this is the key to the next step.

### 4.3 Key: inference must use the sub stream

The two streams carry different frame formats, which determines whether they can be used for inference:

| Stream | Resolution | Frame format | Inference |
|:-------|:-----------|:-------------|:----------|
| `sub` | 720p | **raw NV12** | ✅ The platform auto-resizes to the model input (e.g. 640×384) and feeds the NPU |
| `main` | 4K | **encoded H264** | ❌ Only for RTSP playback |

`subscribe(stream="main")` gets no frames at all and **hangs indefinitely with no error and no timeout**. If your app is stuck at "Waiting for inference results", this is almost certainly the cause — change `main` to `sub`.

Where to fill the values:

| File | Field | Value |
|:-----|:------|:------|
| `app.py` | `subscribe(stream=...)` | `sub` |
| `app.yaml` | `permissions.video` | `[sub.raw]` |
| `app.py` | `subscribe(model=...)` | the `model_id` from §4.1 (e.g. `hailo_yolov8n_384_640`) |
| `app.yaml` | `permissions.inference.models` | the same `model_id` |

## 5. Deploying to the Device

The `build.sh` output is `person-detection.aipc` (a zip of `app.yaml` + `image.tar`), and it deletes the intermediate `image.tar` at the end. Unzip it into two separate files before deploying:

```bash
cd apps/person-detection
unzip -o person-detection.aipc      # extracts app.yaml + image.tar into the current directory
```

You now have `app.yaml` and `image.tar`. Pick any of the three deployment options (full steps in [Hello World §4](./1-hello-world.md#4-deploying-to-the-device)):

- **Web Console upload (recommended)**: open the Web Console in a browser → **App Management** → **Import** → choose **Upload Package** → upload `app.yaml` and `image.tar` separately → click **Install**. Graphical UI, no SSH needed.
- **aipc-cli (alternative)**: after SSH'ing into the device and copying `app.yaml` and `image.tar` over, run `aipc-cli app install app.yaml image.tar`.
- **HTTP two-step upload (alternative)**: from the dev machine, log in for a token → `upload-image` (`image.tar`) → `upload-manifest` (`app.yaml`) → `install-package` (JSON: `manifest_path` + `image_path` + `force`) → poll `install-progress/<task_id>` until `phase=complete`.

## 6. Startup and Verification

### 6.1 Start the Application

After deployment the app is in the Stopped state — you need to start it once manually. Pick either of the two options below.

**Option 1: Start via the Web Console (recommended)**

Go to **App Management**, find the Person Detection card (status shown as Stopped), and click the **Start** button on the card. Normally within a few seconds the status badge switches from Stopped to Running, and CPU and memory usage appear beneath the card.

**Option 2: Start via the HTTP API**

```bash
curl -X POST http://<deviceIP>:8080/api/v1/apps/person-detection/start -H "Authorization: Bearer <token>"
```

:::tip First start times out?
The first time you start a newly deployed app, the platform needs to load the image into the container runtime, which may exceed the 10-second API timeout and return `code:6002 DeadlineExceeded`. This is **not an error** — just call start once more (or click Start again on the Web UI) and it will succeed.
:::

### 6.2 Web Console Verification

Open the Web console → **Applications**. You should see Person Detection in the **Running** state, using approximately 33 MB of memory:

![Application management page (Person Detection running)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png)

Click **Person Detection** to open the details page. Besides APP INFO (ID, version, uptime), the **Permissions & Resources** area shows the permissions injected by the platform according to `app.yaml` — video stream sub.raw (the raw NV12 stream for inference subscription), model hailo_yolov8n_384_640 (QPS 30), event publish/subscribe topics, and device light control. This confirms that the application **only has the permissions it declared** within the sandbox:

![Person Detection details and permissions](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-02-app-detail.png)

### 6.3 Viewing Runtime Logs and Detection Output

After the app starts, there are three ways to view real-time inference results.

**Option 1: Web Console Logs Live Stream**

Find Person Detection in the **Applications** list and click the **Logs** button on the app to open the **Live Stream** panel. It scrolls the container stdout/stderr in real time, including per-frame detection logs and statistics printed every 100 frames:

![Web Logs live detection output](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-04-web-logs-live.png)

When a person is in frame, you will see `[Frame N] Detected M person(s)` lines refresh continuously, and the Statistics `detections` and `avg_persons` grow accordingly. This is the most intuitive way to confirm the app is actually running inference.

**Option 2: HTTP API to Fetch Recent Logs**

```bash
curl "http://<deviceIP>:8080/api/v1/apps/person-detection/logs?max_lines=15" -H "Authorization: Bearer <token>"
```

```
[INFO] Available models: ['hailo_yolov8n_384_640']
[INFO] [OK] Model 'hailo_yolov8n_384_640' is available for inference
[INFO] Available video streams: ['main', 'sub']
[INFO] [OK] Received first inference result - stream and model are working!
[INFO]   Frame sequence: 1, timestamp: 1781520081057461280
[INFO] [Frame 142] Detected 1 person(s)
[INFO] Statistics: frames=200, detections=198, avg_persons=1.00
```

`detections` growing with frames and `avg_persons` near 1.0 means the inference pipeline is running for real.

**Option 3: Subscribe to Structured Detection Results on the Event Bus**

The app packs each detection's confidence, bbox, and person count into a structured JSON published to the event bus. Subscribe via CLI on the device:

```bash
aipc-cli event subscribe 'app/person-detection/*'
```

```json
{"app_id":"person-detection","frame_sequence":142,"person_count":1,
 "confidence":0.879,"bbox":{"x":0.31,"y":0.22,"width":0.27,"height":0.61},
 "total_detections":1118}
```

Any of the three options scrolling normally confirms that all SDK clients initialized successfully, the model and sub stream are available, and the subscription is active and inferring continuously.

:::warning Container logs not writing? Check the root partition
If Web Logs reports `no log file found for container aipc-person-detection`, the device root partition is most likely full — the container log file cannot be written. After SSH-ing in, confirm with `df -h /`; as a temporary fix, clear oversized platform logs (e.g. `truncate -s 0 /opt/aipc/logs/event-bus.log /opt/aipc/logs/platform-api.log`), then reinstall the app once so the new container lands its log file properly. For long-term stability, consider moving instances_path to the /data partition.
:::

## 7. Summary

You have completed the end-to-end deployment of a real AI inference application:

1. **SDK Calls** — `InferenceClient.subscribe` for streaming inference subscriptions, `EventClient.publish` for event publishing, `DeviceClient` for hardware interaction
2. **Resource Discovery** — `list_models()` / `list_streams()` to find actual names, and fill them into `app.py` and `app.yaml`
3. **Permission Declaration** — The `permissions` section in `app.yaml` determines sandbox capabilities; the platform strictly enforces isolation based on this
4. **Deployment Verification** — Web console confirms Running status + permission injection + logs confirm the inference pipeline

Next steps: explore other examples under the `apps/` directory in the repo (people-counting, object-detection, parking-lot, etc.) to develop your own application; or read [Application Troubleshooting](./reference/troubleshooting.md) to resolve common deployment issues.
