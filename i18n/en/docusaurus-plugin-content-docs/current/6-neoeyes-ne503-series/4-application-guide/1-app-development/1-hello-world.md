---
description: Build, deploy, and run your first container application on NE503 from scratch — the complete closed loop from writing code to Web Console verification.
keywords: [NE503, Hello World, application tutorial, container application, application deployment, getting started, minimal closed loop]
tags: [application development, NE503, tutorial, getting started]
---

# Hello World

This tutorial walks you through a minimal Hello World application, covering the **complete lifecycle** of an NE503 container application: write application → build ARM64 image → upload and deploy → start → verify in Web Console → view logs → clean up. Once you master this minimal closed loop, you can rapidly iterate on any AI application.

Hello World does not depend on the AI SDK — it simply prints a counter in a loop, making it ideal for verifying that the development environment and deployment pipeline are working end to end.

## 1. Prerequisites

| Condition | Verification |
|:---|:---|
| NE503 device is online and running | Visit `http://<device-ip>:8080` in a browser; the Web login page should appear |
| Docker is installed on the development machine | Run `docker --version` in a terminal; version >= 20.10 |
| Development machine can ping the device | `curl -o /dev/null -w "%{http_code}" http://<device-ip>:8080` returns `200` |
| Know the device login credentials | Web Console default is `admin` / `password` (change after first login) |

:::tip Architecture Notes
The NE503 device is ARM64 architecture. If your development machine is Apple Silicon (M-series), it is also ARM64, so you can **build natively** at full speed. On an x86 machine, Docker buildx will automatically use QEMU emulation — slightly slower but fully functional.
:::

:::note Dev-machine Docker vs device container runtime
- Docker on the **development machine** is only used for `docker buildx` cross-arch image builds (see §3) — a one-time action on your dev machine.
- The **device** runs containers via **containerd**; apps run on the device **without depending on Docker** (the device OS ships with docker, but container orchestration is handled entirely by containerd — nothing for you to install or configure).
:::

## 2. Application Structure

The Hello World application consists of three files (full source in the repository at `apps/hello-world/`):

```
hello-world/
├── app.py          # Application main logic
├── app.yaml        # Application manifest (resources / permissions / configuration)
└── Dockerfile      # Container build definition
```

**`app.py`** -- Pure Python, prints a counter in a loop and responds to SIGTERM for graceful shutdown (the platform sends SIGTERM when stopping an application):

```python
import os, time, signal

class HelloWorldApp:
    def __init__(self):
        self.running = True
        self.app_id = os.environ.get("APP_ID", "hello_world")  # platform injects
        self.counter = 0
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        self.running = False

    def run(self):
        while self.running:
            self.counter += 1
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] #{self.counter:06d} - Hello World from AIPC!")
            time.sleep(1)

if __name__ == "__main__":
    HelloWorldApp().run()
```

**`app.yaml`** -- Application manifest, declaring the image, resource limits, and startup policy (Hello World does not require any permissions):

```yaml
apiVersion: v1
kind: Application
metadata:
  id: hello-world
  name: Hello World
  version: 1.0.0
  description: A simple hello world application that prints continuously
spec:
  image: aipc/hello-world:1.0.0      # must match the tag from docker build -t
  resources:
    cpu: "10%"
    memory: "32Mi"
  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3
```

**`Dockerfile`** -- Based on `python:3.11-alpine`, lightweight:

```dockerfile
FROM python:3.11-alpine3.19
WORKDIR /app
COPY app.py /app/app.py
ENV PYTHONUNBUFFERED=1
ENV APP_ID=hello_world
CMD ["python3", "/app/app.py"]
```

## 3. Building the Image

Build the ARM64 image in the application directory, export it as a tar, then package it into a `.aipc` installation package:

```bash
cd apps/hello-world

# 1. Build ARM64 image (--load imports into local Docker)
docker buildx build --platform linux/arm64 --load -t aipc/hello-world:1.0.0 .

# 2. Export image as tar
docker save aipc/hello-world:1.0.0 -o image.tar

# 3. Package into .aipc (zip of app.yaml + image.tar)
zip hello-world.aipc app.yaml image.tar
```

Build artifacts (actual):

| Artifact | Size |
|:---|:---|
| Docker image | 26.5 MB (113 MB disk usage) |
| `image.tar` | 25 MB |
| `hello-world.aipc` | 25 MB |

> The `.aipc` file is simply a zip archive of `app.yaml` + `image.tar`, convenient for storage and distribution. Deployment to the device uses the two files inside it (`image.tar` and `app.yaml`, see the next section); the `.aipc` itself is not uploaded via the API.

:::warning Build fails occasionally?
On macOS + Docker Desktop, `apk add` may occasionally report `Failed to create ...: I/O error`. This is a known intermittent issue with buildx -- **simply run the build command again and it should succeed**.
:::

## 4. Deploying to the Device

After building, you have two files: `app.yaml` (application manifest) and `image.tar` (container image). Three deployment options are provided below — **the Web Console is recommended** (graphical UI, no SSH required).

:::note Prerequisite
All three options require the two separate files `app.yaml` and `image.tar`. After following the manual steps in §3, both files are in the app directory. If you used the repo's `apps/<app>/build.sh` (which deletes the intermediate `image.tar` after packaging `.aipc`), unzip it first: `unzip -o <app>.aipc`.
:::

### 4.1 Upload via the Web Console (Recommended)

Done entirely in the browser, no SSH login required.

1. Open the Web Console at `http://<device-ip>:8080` in a browser and log in with the default credentials `admin` / `password`.

2. Click **App Management** in the left sidebar to reach the app list. In the top-right corner there is an **Import** card — click it.

3. The **Application Setup Wizard** dialog opens. In the first step, **Source**, pick the third option, **Upload Package** — this accepts both the `app.yaml` manifest and the image file.

4. Under **App Manifest (app.yaml)** click **Choose File** and select your local `app.yaml`; under **Container Image** select `image.tar`.

![Upload Package: select app.yaml + image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/web-import-upload-package.png)

5. Click the **Install** button in the bottom-right corner. The wizard runs the remaining steps automatically (parse manifest → import image → register app), usually within 10–15 seconds. Back in the app list, Hello World appears (initially in Stopped state — you start it in the next section).

### 4.2 Deploy via aipc-cli (Alternative)

If you have already SSH'd into the device, install in one command with the platform's built-in `aipc-cli`. First copy `app.yaml` and `image.tar` to the device:

```bash
scp app.yaml image.tar root@<device-ip>:/tmp/
ssh root@<device-ip>
```

Then on the device run:

```bash
aipc-cli app install app.yaml image.tar
```

### 4.3 Deploy via HTTP API (Alternative)

For scripting / CI automation. This is the same installation as above broken into explicit HTTP calls: **two-step upload + async install** — upload the image and manifest separately, then trigger a background install task and poll for progress.

:::note Legacy single-file upload is deprecated
`curl -F 'app=@xxx.aipc' /api/v1/apps` (uploading the whole `.aipc` at once) **no longer works** (the endpoint returns a JSON parse error). Use the two-step flow below.
:::

#### Login to Obtain a Token

```bash
curl -X POST http://<device-ip>:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Response (note the token value includes the `Bearer ` prefix):

```json
{"code":0,"data":{"token":"Bearer aipc-secure-token-secret","username":"admin"}}
```

All subsequent API calls must include the `Authorization: <the entire token string from above>` header.

#### Upload Image and Manifest

```bash
# Upload image (field name is file)
curl -X POST http://<device-ip>:8080/api/v1/apps/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.tar"
# → {"data":{"path":"/opt/aipc/images/1781509627_image.tar", "image":"aipc/hello-world:1.0.0", ...}}

# Upload manifest
curl -X POST http://<device-ip>:8080/api/v1/apps/upload-manifest \
  -H "Authorization: Bearer <token>" \
  -F "file=@app.yaml"
# → {"data":{"path":"/opt/aipc/apps/manifests/hello-world/app.yaml", ...}}
```

#### Trigger Installation and Poll Progress

```bash
# Trigger async install (JSON body, passing both paths from above)
curl -X POST http://<device-ip>:8080/api/v1/apps/install-package \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"manifest_path":"/opt/aipc/apps/manifests/hello-world/app.yaml",
       "image_path":"/opt/aipc/images/1781509627_image.tar","force":true}'
# → {"data":{"task_id":"0f26285a"}}

# Poll installation progress (until phase=complete)
curl http://<device-ip>:8080/api/v1/apps/install-progress/<task_id> \
  -H "Authorization: Bearer <token>"
```

Progress evolution: `phase:"pulling" percent:10 "Importing local image..."` → `phase:"complete" percent:100 "Installation complete"`, typically finishing in 10-15 seconds.

## 5. Start and Verify

### 5.1 Start the Application

After deployment the app is in the Stopped state — you need to start it once manually. Pick either of the two options below.

**Option 1: Start via the Web Console (recommended)**

Go to **App Management**, find the Hello World card (status shown as Stopped), and click the **Start** button on the card. Normally within a few seconds the status badge switches from Stopped to Running.

**Option 2: Start via the HTTP API**

```bash
curl -X POST http://<device-ip>:8080/api/v1/apps/hello-world/start \
  -H "Authorization: Bearer <token>"
```

:::tip First start times out?
The first time you start an image, the platform needs to load it into the container runtime, which may exceed the 10-second API timeout, returning `code:6002 DeadlineExceeded`. This is **not an error** — just call the start endpoint once more (or click Start again on the Web UI) and it will succeed.
:::

### 5.2 Verify in the Web Console (simulating a user's perspective)

After deployment, log into the Web Console at `http://<device-ip>:8080` with a browser and verify the application is running normally from a real user's point of view.

![Web Console login page](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/01-login.png)

Log in with the default credentials `admin` / `password` to reach the Dashboard. The top of the homepage shows device status (uptime, temperature, CPU/NPU/memory/storage usage), and the **Applications** section in the middle shows currently running applications:

![Dashboard (Hello World running)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/02-dashboard.png)

Navigate to **Applications** in the left sidebar -- you should see Hello World in **Running** status with real-time CPU and memory usage:

![Applications page (Hello World Running)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/03-apps-list.png)

Click on **Hello World** to open the detail view, showing the application ID, version, install/start time, uptime, and Stop / Restart / Uninstall action buttons -- this confirms the application is fully managed by the platform:

![Hello World application detail](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/04-app-detail.png)

### 5.3 View Runtime Logs

Application logs can also be retrieved via the API (returned in NDJSON format, one JSON object per line):

```bash
curl "http://<device-ip>:8080/api/v1/apps/hello-world/logs?max_lines=10" \
  -H "Authorization: Bearer <token>"
```

```json
{"timestamp":1781509897838838800,"level":"info","message":"[2026-06-15 07:51:23] #000011 - Hello World from AIPC!"}
{"timestamp":1781509897838892960,"level":"info","message":"[2026-06-15 07:51:24] #000012 - Hello World from AIPC!"}
{"timestamp":1781509897838901400,"level":"info","message":"[2026-06-15 07:51:25] #000013 - Hello World from AIPC!"}
```

The counter increments every second, confirming the application is running stably.

## 6. Stop and Clean Up

After verification, stop and uninstall the application:

```bash
# Stop
curl -X POST http://<device-ip>:8080/api/v1/apps/hello-world/stop -H "Authorization: Bearer <token>"
# → {"data":{"message":"App stopped successfully"}}

# Uninstall
curl -X DELETE http://<device-ip>:8080/api/v1/apps/hello-world -H "Authorization: Bearer <token>"
# → {"data":{"message":"App uninstalled successfully"}}
```

## 7. Summary

Congratulations, you have completed the full closed loop for an NE503 container application:

1. **Write** -- the `app.py` + `app.yaml` + `Dockerfile` trifecta
2. **Build** -- `docker buildx build --platform linux/arm64` → `docker save` → `zip .aipc`
3. **Deploy** -- Web Console upload (recommended) / aipc-cli / HTTP two-step upload — pick one
4. **Verify** -- confirm Running status in Web Console + check logs to confirm output
5. **Clean up** -- stop + uninstall

Next, in the [Person Detection Application Tutorial](./2-person-detection.md), you will use the same flow to deploy a real AI inference application, learning how to use the SDK, discover models and video streams, and process detection results.

:::tip Running into issues?
If you encounter errors during application deployment or startup, refer to [Application Troubleshooting](./reference/troubleshooting.md).
:::
