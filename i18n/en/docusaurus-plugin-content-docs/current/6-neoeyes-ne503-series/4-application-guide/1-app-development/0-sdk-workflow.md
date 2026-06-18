---
description: Overview of the NE503 Python SDK (hailo_ipc_sdk) workflow — what it is, where the source lives, how to embed it into your container image, and the client calling pattern. Read this before the hands-on tutorials.
keywords: [NE503, Python SDK, hailo_ipc_sdk, SDK embedding, container application, InferenceClient]
tags: [application development, NE503, SDK, getting started]
---

# SDK Workflow

This page covers exactly one thing: **how to get the NE503 Python SDK (`hailo_ipc_sdk`) up and running** — what it is, where the source lives, how to embed it into your container image, and the client calling pattern. Once you understand this, the [Hello World](./1-hello-world.md) tutorial (deployment closed loop) and the [Person Detection](./2-person-detection.md) tutorial (real AI app) focus on their own business logic, with no need to revisit how the SDK plugs in.

:::info Reading order
**SDK Workflow (this page) → [Hello World](./1-hello-world.md) (deployment loop, no SDK) → [Person Detection](./2-person-detection.md) (real AI app, uses the SDK)**
:::

## 1. What the SDK Is

`hailo_ipc_sdk` is the Python SDK that exposes NE503 platform capabilities. It runs **inside your application container** and talks to the platform's background services over Unix Sockets. Your application code never touches hardware or the inference engine directly — it calls SDK clients, which forward to the corresponding services. The table below lists the four core clients you'll use most when building an AI inference app:

| Client | Responsibility | Typical call |
|:---|:---|:---|
| `InferenceClient` | Subscribe to AI inference results (the platform runs the model frame by frame and pushes results to the app) | `subscribe(stream=, model=, fps=)` |
| `FdMediaClient` | Video frame retrieval (get the raw frame corresponding to an inference result) | `get_frame(stream)` |
| `EventClient` | Event bus publish/subscribe (cross-app, cross-module integration) | `publish(topic, payload)` / `on_event(topic, cb)` |
| `DeviceClient` | Hardware control and status (fill light, IR-CUT, PTZ, temperature, etc.) | `set_white_light(n)` / `get_device_status()` |

Beyond these core clients, the SDK also covers: `AppClient` (app/container management), `OverlayClient` (overlay detection boxes onto the RTSP/Web view), `EncodedStreamClient` (H.264/H.265 encoded streams), audio streams, and camera ISP/encoder control. `Config` is a utility class for reading the `APP_ID`, per-service socket paths, and debug flags (e.g. `Config.get_app_id()`, `Config.is_debug()`). For the full set of classes and methods, see [SDK Reference](./reference/2-sdk-reference.md).

:::note Not on PyPI
The SDK is **not published to PyPI**. The source lives in the `ne503` source repository under `sdk/python/hailo_ipc_sdk/` and must be bundled into your application image — the device's container runtime has **no outbound network for pip**, so you cannot install it at runtime.
:::

## 2. Where the SDK Comes From and How to Embed It

:::info Get the ne503 source repo first
The SDK is not on PyPI — its source lives in the **ne503 source repository** under `sdk/python/hailo_ipc_sdk/`, and every sample app in this tutorial series also lives in that repo under `apps/`. Clone it before you start:

```bash
git clone https://github.com/camthink-ai/ne503.git
cd ne503
```

Directories relevant to this tutorial series:

```
ne503/
├── sdk/python/
│   ├── hailo_ipc_sdk/   # Python SDK source (includes protobuf stubs, works out of the box)
│   ├── setup.py         # SDK install script (build.sh copies it into the app image)
│   └── README.md
└── apps/
    ├── hello-world/       # Minimal closed-loop example (no SDK)
    ├── person-detection/  # Person-detection AI app (uses SDK)
    ├── template/          # App scaffold (cp -r when starting a new app)
    └── ...                # object-detection / people-counting / parking-lot, etc. (10+ samples)
```
:::

There are three ways to get the SDK into your image, depending on your project layout.

**Option A: `build.sh` auto-copy (recommended; used by all repo sample apps)**

Every sample app's `build.sh` automatically copies `sdk/python/hailo_ipc_sdk/` into the app directory before `docker buildx` bakes it into the image. You only need:

```bash
cd apps/<your-app>
bash build.sh arm64     # auto: copy SDK → buildx → save; produces image.tar + app.yaml
```

No manual `pip install` in the Dockerfile, no network needed.

**Option B: Manual `COPY` for custom projects**

If your app lives outside the repo's sample structure (a standalone project), copy the SDK directory into the image and install it locally in the Dockerfile:

```dockerfile
COPY hailo_ipc_sdk /app/hailo_ipc_sdk
RUN pip install --no-cache-dir /app/hailo_ipc_sdk
```

**Option C: Pre-build a wheel and `pip install` it (cleanest; best for distribution and reuse)**

Build the SDK into a single wheel file first, then install it into the image like any other dependency — the image carries only the artifact, not the entire source tree, and the same wheel can be reused across apps. The repo's `apps/model-showcase` uses this approach.

1. Build the wheel on your dev machine (one-time; the artifact name follows the version in `setup.py`):

```bash
cd sdk/python
pip wheel . --no-deps -w dist/
# produces dist/hailo_ipc_sdk-0.2.1-py3-none-any.whl
```

The SDK is pure Python, so this yields a universal wheel (`py3-none-any`) that is independent of the device's ARM64 architecture.

2. Copy the wheel into your app directory and install it directly in the Dockerfile:

```dockerfile
COPY hailo_ipc_sdk-0.2.1-py3-none-any.whl /app/
RUN pip install --no-cache-dir /app/hailo_ipc_sdk-0.2.1-py3-none-any.whl
```

The key point: **the SDK must be carried into the image** — never depend on runtime network installation.

:::note Protobuf stubs are included
The SDK ships with pre-generated protobuf stubs (`sdk/python/hailo_ipc_sdk/proto/*_pb2.py`). They are baked into the image together with the SDK at build time — **no manual generation is needed**; `import hailo_ipc_sdk` works out of the box.
:::

## 3. Calling Pattern

All clients share the same shape — instantiation takes no arguments (the SDK reads the socket path from environment variables injected by the platform), then you call subscribe/publish/control methods:

```python
from hailo_ipc_sdk import InferenceClient, EventClient, DeviceClient

infer  = InferenceClient()
events = EventClient()
device = DeviceClient()

# 1. Subscription iterator: get inference results frame by frame (the platform runs the model in the background)
#    stream must be a stream that publishes raw NV12 frames (sub or third);
#    main only publishes encoded H264 (for RTSP), subscribe("main") hangs forever
for frame_seq, result in infer.subscribe(stream="sub", model="<model-name>", fps=10):
    persons = [o for o in result.objects if o.label == "person"]

# 2. Event publish/subscribe: cross-app integration
events.publish("app/<app-id>/detection", {"count": len(persons)})
events.on_event("system/*", lambda ev: ...)

# 3. Device control: drive hardware
device.set_white_light(50)
status = device.get_device_status()
```

Three things to keep in mind:

1. **Don't hardcode names** — `stream` and `model` must match real values on the device. Call `infer.list_models()` / `FdMediaClient().list_streams()` first to discover them, otherwise you get `StatusCode.NOT_FOUND`;
2. **Subscription is a blocking iterator** — `for ... in subscribe(...)` yields frames continuously; build your app's main loop on top of it;
3. **Shut down gracefully** — listen for `SIGTERM` (the platform sends it when stopping your app), then break the loop and close the clients.

For a complete real-world example (model/stream discovery, permission declaration, event publishing, light control), see the [Person Detection tutorial](./2-person-detection.md).

## 4. Permissions Are a Contract

What the SDK can call is **dictated by the `permissions` section of `app.yaml`**, not by what you write in code. The platform enforces sandboxing against this list: any video stream, model, event topic, or device control not declared here is rejected by the platform at call time. So when writing an SDK app, the calls in `app.py` must correspond one-to-one with what `app.yaml` declares.

For the meaning of each permission field, see the [permission manifest field table in the Person Detection tutorial](./2-person-detection.md#22-permission-manifest-appyaml).

## 5. Next Steps

- [Hello World](./1-hello-world.md) — no SDK; run the full "build → deploy → start → verify" closed loop first;
- [Person Detection](./2-person-detection.md) — a real AI app using the SDK, with complete code and on-device testing;
- For a field-by-field API reference of each SDK client, see [SDK Reference](./reference/2-sdk-reference.md);
- For build/deploy errors, see [Application Troubleshooting](./reference/troubleshooting.md).
