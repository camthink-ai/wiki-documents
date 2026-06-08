---
description: A from-scratch tutorial for developing container applications on NE503, guiding you through creating, building, deploying, and debugging your first AI inference application.
keywords: [NE503, application tutorial, container application, AI inference, getting started, end-to-end]
tags: [application development, NE503, tutorial, getting started]
---

# Application Development Tutorial

This tutorial walks you through building a person detection application from scratch on the NE503 platform. You will learn how to write inference code, configure the permission manifest, package a container image, deploy to the device, and verify the results. Once complete, you will have a reusable development template for rapidly iterating on your own AI applications.

## 1 Prerequisites

Before you begin, make sure the following conditions are met:

| Condition | Verification |
|:---|:---|
| NE503 device is online and running | Open `http://<device-ip>:8080` in a browser — the Web management interface should be visible |
| Docker is installed on the development machine | Run `docker --version` in the terminal — version >= 20.10 |
| scp/ssh is installed on the development machine | Run `which scp` in the terminal — any output is sufficient |
| An AI model is loaded on the device | Web management interface > AI Models page — at least one model should be in the "Loaded" state |
| Camera video stream is working | Web management interface > Video Preview — live video should be visible |

If your development environment is not yet set up, please complete the [Development Environment](../3-platform-development/1-development-environment.md) configuration first.

## 2 Create the Project

On your development machine, create the project directory and base files:

```bash
# Create project directory
mkdir my-person-detector && cd my-person-detector

# Create directory structure
mkdir -p sdk
```

The final project structure should look like this:

```
my-person-detector/
├── app.py            # Main application logic
├── app.yaml          # Application manifest (permissions, resources, configuration)
├── Dockerfile        # Container build definition
└── requirements.txt  # Python dependencies
```

### 2.1 Create requirements.txt

```bash
cat > requirements.txt << 'EOF'
numpy>=1.21.0
EOF
```

The SDK is installed from a local directory in the Dockerfile, so it is not listed in `requirements.txt`.

### 2.2 Obtain the SDK

Copy the Python SDK from the NE503 source repository into your project:

```bash
# Assuming NE503 source is at ~/ne503/
cp -r ~/ne503/sdk/python/hailo_ipc_sdk ./sdk/
cp ~/ne503/sdk/python/setup.py ./sdk/
cp ~/ne503/sdk/python/README.md ./sdk/
```

> If you do not have the source repository, you can obtain the SDK from the `/opt/aipc/sdk/python/` directory on a deployed device, or contact technical support for the SDK distribution package.

## 3 Write Inference Code

Create `app.py` to implement real-time person detection. The code is divided into three parts: initializing the SDK client, subscribing to inference results, and processing detection results.

```bash
cat > app.py << 'PYEOF'
#!/usr/bin/env python3
"""
Person Detection Application - NE503 Platform Getting Started Tutorial
Functionality: Subscribe to camera video stream, perform AI person detection, publish detection events
"""

import os
import sys
import time
import signal
import logging
from datetime import datetime

from hailo_ipc_sdk import (
    InferenceClient,
    EventClient,
    Config,
    InferenceResult,
)

# -- Logging configuration -------------------------------
logging.basicConfig(
    level=getattr(logging, os.environ.get("LOG_LEVEL", "INFO")),
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class PersonDetector:
    """Person detection application main class"""

    def __init__(self):
        self.running = True
        self.app_id = Config.get_app_id()
        self.threshold = float(os.environ.get("DETECTION_THRESHOLD", "0.5"))
        self.frame_count = 0

        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._on_signal)
        signal.signal(signal.SIGTERM, self._on_signal)

        logger.info(f"Application started: id={self.app_id}, threshold={self.threshold}")

    def _on_signal(self, signum, frame):
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False

    def run(self) -> int:
        """Main loop: subscribe to inference stream and process results"""
        inference = InferenceClient()
        events = EventClient()

        try:
            # Check available models
            models = inference.list_models()
            model_ids = [m.model_id for m in models]
            logger.info(f"Available models: {model_ids}")

            # Subscribe to video stream inference results
            # stream="third" corresponds to the main camera raw stream
            # model="person-detection" corresponds to the person detection model
            logger.info("Subscribing to inference stream...")
            for seq, result in inference.subscribe(
                stream="third",
                model="person-detection",
                fps=10,
            ):
                if not self.running:
                    break
                self._handle_result(seq, result, events)

        except KeyboardInterrupt:
            logger.info("User interrupted")
        except Exception as e:
            logger.error(f"Runtime error: {e}")
            return 1
        finally:
            inference.close()
            events.close()
            logger.info(f"Application exited, processed {self.frame_count} frames total")

        return 0

    def _handle_result(
        self, seq: int, result: InferenceResult, events: EventClient
    ):
        """Process a single frame's inference result"""
        self.frame_count += 1

        # Filter person detection results below the threshold
        persons = [
            obj
            for obj in result.objects
            if obj.label == "person" and obj.score >= self.threshold
        ]

        if persons:
            logger.info(f"[Frame {seq}] Detected {len(persons)} person(s)")
            for i, p in enumerate(persons):
                logger.debug(
                    f"  #{i+1}: confidence={p.score:.2f}, "
                    f"position=({p.bbox.x:.2f}, {p.bbox.y:.2f}), "
                    f"size=({p.bbox.width:.2f}x{p.bbox.height:.2f})"
                )

            # Publish detection event
            self._publish_event(seq, result, persons, events)

        # Print statistics every 100 frames
        if self.frame_count % 100 == 0:
            logger.info(f"Processed {self.frame_count} frames")

    def _publish_event(
        self, seq: int, result: InferenceResult, persons: list, events: EventClient
    ):
        """Publish detection results to the event bus"""
        try:
            events.publish(
                f"app/{self.app_id}/detection",
                {
                    "frame_sequence": seq,
                    "timestamp": datetime.now().isoformat(),
                    "person_count": len(persons),
                    "objects": [
                        {
                            "label": p.label,
                            "confidence": round(p.score, 3),
                            "bbox": {
                                "x": round(p.bbox.x, 3),
                                "y": round(p.bbox.y, 3),
                                "width": round(p.bbox.width, 3),
                                "height": round(p.bbox.height, 3),
                            },
                        }
                        for p in persons
                    ],
                },
            )
        except Exception as e:
            logger.warning(f"Event publish failed: {e}")


if __name__ == "__main__":
    sys.exit(PersonDetector().run())
PYEOF
```

### 3.1 Code Walkthrough

**InferenceClient.subscribe** is the core method with the following signature:

```python
def subscribe(
    stream: str,       # Video stream ID, e.g. "third", "cam0_main"
    model: str,        # Model ID, e.g. "person-detection"
    fps: int = 10,     # Inference frame rate cap
) -> Iterator[Tuple[int, InferenceResult]]
```

Each iteration returns a `(frame_sequence, InferenceResult)` tuple. `InferenceResult` contains:

| Field | Type | Description |
|:---|:---|:---|
| `objects` | `List[DetectedObject]` | List of detected objects |
| `classifications` | `List[Classification]` | Classification results |
| `landmarks` | `List[LandmarkSet]` | Keypoints (e.g. facial keypoints) |
| `masks` | `List[SegmentationMask]` | Segmentation masks |
| `infer_time_us` | `int` | Inference latency (microseconds) |

Each `DetectedObject` contains `label` (class), `score` (confidence), `bbox` (bounding box), and an optional `track_id` (tracking ID).

## 4 Add Event-Driven Logic

Now extend the application so it can both publish events and respond to events from other applications.

### 4.1 Event Publishing

You have already seen the basic usage of `events.publish()` in the code above. It accepts a topic (wildcards supported) and a JSON-compatible dictionary payload:

```python
events.publish(
    "app/my_detector/alert",      # Topic
    {"type": "person_detected"},  # Payload (any dict)
)
```

### 4.2 Event Subscription

Add an event listener that dynamically adjusts the detection threshold when a system-level configuration change event is received. In the `PersonDetector.run()` method of `app.py`, add the following before subscribing to the inference stream:

```python
# Add in the run() method, before inference.subscribe():
import threading

def on_config_event(event):
    """Update threshold when a config change event is received"""
    new_threshold = event.payload.get("detection_threshold")
    if new_threshold is not None:
        self.threshold = float(new_threshold)
        logger.info(f"Threshold updated to {self.threshold}")

# Start event listener thread
events.on_event(
    "app/my_detector/config",
    callback=on_config_event,
)
logger.info("Event listener started")
```

`on_event` returns a background thread that automatically receives matching events and invokes the callback function. The callback receives an `Event` object containing `topic`, `payload`, `source`, and other fields.

### 4.3 Event Topic Conventions

We recommend the following naming conventions:

```
app/<app-id>/<action>       # Application-level events
alerts/<type>               # Alert events
system/<event>              # System events
model/<model-id>/status     # Model status events
```

Topics support wildcard subscriptions: `app/*` matches a single level, `app/#` matches multiple levels.

## 5 Container Packaging

### 5.1 Create app.yaml

`app.yaml` is the application manifest file that defines permissions, resource limits, and runtime configuration:

```bash
cat > app.yaml << 'EOF'
apiVersion: v1
kind: Application

metadata:
  id: my-person-detector
  name: My Person Detector
  version: 1.0.0
  description: Real-time person detection application - getting started tutorial example
  author: Developer

spec:
  image: aipc/my-person-detector:1.0.0

  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    # AI inference permission: declare models to be used
    inference:
      models:
        - person-detection
      max_qps: 30
      max_concurrent: 2

    # Event bus permission: declare publishable/subscribable topics
    events:
      publish:
        - app/my-person-detector/*
        - alerts/detection
      subscribe:
        - app/my-person-detector/config
        - system/*

    # Network mode: isolated allows only platform internal communication
    network:
      mode: isolated

  env:
    - name: DETECTION_THRESHOLD
      value: "0.5"
    - name: LOG_LEVEL
      value: "INFO"

  # Data persistence volumes
  volumes:
    - host: /opt/aipc/data/my-person-detector
      container: /app/data
      readonly: false

  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3

  healthcheck:
    enabled: true
    interval: 30s
    timeout: 5s
    retries: 3
EOF
```

**Permission configuration is the core of application security.** Only explicitly declared permissions are granted:

| Permission Category | Key Fields | Description |
|:---|:---|:---|
| `inference` | `models` | List of allowed model IDs |
| `events` | `publish` / `subscribe` | Publishable/subscribable event topics (wildcards supported) |
| `video` | Stream ID list | Accessible video streams (not needed for this tutorial — inference streams are provided automatically by the platform) |
| `device` | `light`, `ptz`, etc. | Device control permissions (not needed for this tutorial) |
| `network` | `mode` | `isolated` (default) or `host` |

### 5.2 Create Dockerfile

```bash
cat > Dockerfile << 'EOF'
# NE503 Container Application - Person Detection
# Target architecture: linux/arm64 (Hailo platform)

FROM python:3.11-slim-bookworm

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl procps libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install SDK (local package)
COPY sdk/hailo_ipc_sdk/ /app/hailo_ipc_sdk/
COPY sdk/setup.py sdk/README.md /app/
RUN pip install --no-cache-dir -e .

# Install application dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py /app/

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# The platform automatically injects the following environment variables:
# APP_ID, AI_RUNTIME_ENDPOINT, EVENT_BUS_ENDPOINT, etc.
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python3 -c "from hailo_ipc_sdk import Config; print(Config.get_app_id())" || exit 1

CMD ["python3", "/app/app.py"]
EOF
```

### 5.3 Key Notes

**SDK Installation**: The SDK is copied into the container as a local package and installed there. `pip install -e .` installs it in editable mode for easier debugging. `setup.py` declares the SDK dependencies (`grpcio`, `numpy`, `protobuf`, etc.), which are installed automatically.

**Environment Variable Injection**: The platform automatically injects the following environment variables when the container starts. Your code does not need to configure them manually:

| Variable | Default | Description |
|:---|:---|:---|
| `APP_ID` | `unknown` | From `metadata.id` in `app.yaml` |
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` | Inference service endpoint |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` | Event bus endpoint |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` | Device control endpoint |

**Variables defined in the `env` field of `app.yaml`** (such as `DETECTION_THRESHOLD`) are injected into the container as additional environment variables.

## 6 Deploy to Device

### 6.1 Build the Docker Image

NE503 devices are based on the ARM64 architecture. If your development machine is x86_64, you need to cross-build using `docker buildx`:

```bash
# ARM64 cross-build (recommended)
docker buildx build --platform linux/arm64 --load \
    -t aipc/my-person-detector:1.0.0 .

# If the development machine is ARM64 (e.g. Apple Silicon Mac)
docker build -t aipc/my-person-detector:1.0.0 .
```

### 6.2 Package as .aipc Installation Package

NE503 uses the `.aipc` installation format, which is essentially a zip archive containing `app.yaml` + `image.tar`:

```bash
# Export image as a tar file
docker save aipc/my-person-detector:1.0.0 -o image.tar

# Package as .aipc file
zip my-person-detector.aipc app.yaml image.tar

# Clean up temporary file
rm image.tar

# Check package size
du -h my-person-detector.aipc
```

### 6.3 Install on Device

There are three installation methods:

**Method 1: Via the Web Management Interface (recommended for beginners)**

1. Open `http://<device-ip>:8080` in a browser
2. Navigate to the **App Management** page
3. Click the **Install App** button
4. Upload the `my-person-detector.aipc` file
5. Wait for installation to complete

**Method 2: Via Command Line**

```bash
# Upload the installation package to the device
scp my-person-detector.aipc root@<device-ip>:/tmp/

# SSH into the device and run the installation
ssh root@<device-ip> "cd /tmp && aipc-cli app install my-person-detector.aipc"

# Start the application
ssh root@<device-ip> "aipc-cli app start my-person-detector"
```

**Method 3: Via REST API**

```bash
# Install directly via the platform API
curl -X POST "http://<device-ip>:8080/api/v1/apps" \
    -F "app=@my-person-detector.aipc"

# Start the application
curl -X POST "http://<device-ip>:8080/api/v1/apps/my-person-detector/start"
```

## 7 Verification and Debugging

### 7.1 Check Application Status

```bash
# List all applications
curl -s "http://<device-ip>:8080/api/v1/apps" | python3 -m json.tool

# Check a specific application's status
curl -s "http://<device-ip>:8080/api/v1/apps/my-person-detector" | python3 -m json.tool
```

Application status descriptions:

| Status | Meaning |
|:---|:---|
| `installed` | Installed, not started |
| `running` | Currently running |
| `stopped` | Stopped |
| `error` | Runtime error occurred |

### 7.2 View Application Logs

```bash
# Method 1: Via API (get the latest 100 lines)
curl -s "http://<device-ip>:8080/api/v1/apps/my-person-detector/logs?max_lines=100"

# Method 2: Via aipc-cli (continuous follow)
ssh root@<device-ip> "aipc-cli app logs my-person-detector --follow"
```

Logs from a normally running application should look similar to:

```
[2026-06-08 10:00:01] [INFO] Application started: id=my-person-detector, threshold=0.5
[2026-06-08 10:00:01] [INFO] Available models: ['person-detection', 'vehicle-detection']
[2026-06-08 10:00:01] [INFO] Subscribing to inference stream...
[2026-06-08 10:00:02] [INFO] [Frame 1] Detected 1 person(s)
[2026-06-08 10:00:12] [INFO] [Frame 100] Detected 2 person(s)
[2026-06-08 10:00:12] [INFO] Processed 100 frames
```

### 7.3 Verify Event Output

Use another client to subscribe to events and confirm that event publishing is working:

```python
# Run on the development machine (requires access to the device event bus)
from hailo_ipc_sdk import EventClient

events = EventClient(endpoint="unix:///run/aipc/event-bus.sock")
for event in events.subscribe("app/my-person-detector/*"):
    print(f"Event: {event.topic} -> {event.payload}")
```

### 7.4 Common Error Troubleshooting

| Error Symptom | Possible Cause | Solution |
|:---|:---|:---|
| `Available models: []` | AI model not loaded | Check model status in the Web interface, confirm the model is loaded |
| `Running in SIMULATION mode` | Video stream unavailable | Check if `camera-daemon` is running: `systemctl status camera-daemon` |
| `Permission denied` connection failure | Permission not declared in `app.yaml` | Check that `permissions` configuration includes the required models and event topics |
| Container exits immediately | Python code error | Check logs: `aipc-cli app logs my-person-detector` |
| Image pull failure | Architecture mismatch | Ensure you built with `--platform linux/arm64` |
| `No inference results received` | Incorrect video stream ID | Common stream IDs: `third` (main stream), `cam0_main`, `cam0_sub` |

### 7.5 Stop and Uninstall

```bash
# Stop the application
curl -X POST "http://<device-ip>:8080/api/v1/apps/my-person-detector/stop"

# Uninstall the application (keep logs)
curl -X DELETE "http://<device-ip>:8080/api/v1/apps/my-person-detector"

# Uninstall the application (do not keep logs)
curl -X DELETE "http://<device-ip>:8080/api/v1/apps/my-person-detector?keep_logs=false"
```

## 8 Advanced: Custom Models and Device Control

### 8.1 Register Custom Models

If your application needs to use a custom `.hef` model file, you can register it dynamically at application startup:

```python
from hailo_ipc_sdk import InferenceClient, Config

inference = InferenceClient()

# Register model (path is relative to the mount point inside the container)
model_id = inference.register_model(
    model_path="/app/models/my_custom_model.hef",
    model_id="my-custom-model",
)

print(f"Model registered: {model_id}")

# Run inference with the custom model
for seq, result in inference.subscribe(
    stream="third",
    model=model_id,
    fps=5,
):
    print(f"Detected {len(result.objects)} object(s)")
```

The corresponding `app.yaml` needs inference registration permission and volume mount added:

```yaml
spec:
  permissions:
    inference:
      models:
        - my-custom-model
      allow_register_model: true   # Allow dynamic model registration
  volumes:
    - host: /opt/aipc/models/my_custom_model.hef
      container: /app/models/my_custom_model.hef
      readonly: true
```

### 8.2 Device Control

Trigger device hardware when objects are detected (e.g. turn on the fill light):

```python
from hailo_ipc_sdk import DeviceClient

device = DeviceClient()

# Turn on fill light when a person is detected
device.set_white_light(level=80)   # Brightness 0-100

# Switch IR cut filter to daytime mode
from hailo_ipc_sdk import IrCutMode
device.set_ircut(IrCutMode.DAY)

# PTZ control (requires ptz: true in app.yaml)
device.pan_left(speed=50)
device.tilt_up(speed=50)
device.ptz_stop()
```

Device permissions need to be declared in `app.yaml`:

```yaml
spec:
  permissions:
    device:
      light: true
      ir_cut: true
      ptz: false    # Enable as needed
      lens: false
```

### 8.3 Single-Frame Inference

In addition to streaming inference, you can also manually capture a single frame and run inference:

```python
from hailo_ipc_sdk import FdMediaClient

media = FdMediaClient()

# Get a single frame
frame = media.get_frame("cam0_main", timeout_ms=5000)
if frame is not None:
    rgb_image = frame.to_rgb()
    result = inference.infer(rgb_image, model_id="person-detection")
    print(f"Detected {len(result.objects)} object(s)")
```

Video stream permission needs to be declared in `app.yaml`:

```yaml
spec:
  permissions:
    video:
      - cam0_main.raw    # Raw video stream (zero-copy SHM)
```

## 9 Next Steps

Congratulations on completing your first NE503 container application! Here are some advanced topics to explore next:

- **[Application Development Guide](./1-app-reference.md)** — Complete app.yaml fields, multi-container mode, plugin system
- **[SDK API Reference](./2-sdk-reference.md)** — Detailed API documentation for all 8 SDK modules
- **[SDK Example Code](./3-sdk-examples.md)** — More complete application examples (people counting, object tracking, etc.)
- **[Video Stream Integration](../5-system-integration/0-video-integration.md)** — Video stream capture, processing, and RTSP streaming
