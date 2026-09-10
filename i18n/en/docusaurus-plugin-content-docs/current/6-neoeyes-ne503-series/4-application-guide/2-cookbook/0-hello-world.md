---
id: hello-world
title: Hello World
sidebar_position: 1
description: Build an ARM64 Hello World container app for NE503, deploy it through the Web Console or SSH, verify it, and clean it up.
keywords: [NE503, Hello World, container app, app deployment]
tags: [Application Development, NE503, Tutorial]
---

# Hello World

Build, deploy, and verify the Hello World container app on NE503.

## 1. Prepare

- NE503 is online and reachable at `https://<device-ip>`.
- The host has Docker 20.10 or later and can build `linux/arm64` images.
- Use the [example source](https://github.com/camthink-ai/neoruntime-apps/tree/main/examples/hello-world) or download the [prebuilt package](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/hello-world.tar).

For the source flow:

```bash
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

The example directory is `neoruntime-apps/examples/hello-world/`:

```text
app.py          # Application code
Dockerfile      # Image build file
app.yaml        # Application manifest
entrypoint.sh   # Debug entrypoint
```

The prebuilt package extracts to `app.yaml` and `image.tar`; go directly to Section 3.

## 2. Build the Image

Run from the application directory:

```bash
cd neoruntime-apps/examples/hello-world
docker buildx build --platform linux/arm64 --load -t aipc/hello-world:1.0.0 .
docker save aipc/hello-world:1.0.0 -o image.tar
```

Check the image architecture and exported file:

```bash
docker image inspect aipc/hello-world:1.0.0 --format '{{.Os}}/{{.Architecture}}'
test -s image.tar
```

The expected output includes `linux/arm64`, and the current directory contains a non-empty `image.tar`. Deploy with the `app.yaml` from the same directory; its `spec.image` must match the image tag `aipc/hello-world:1.0.0`.

## 3. Deploy to the Device

### 3.1 Web Console

1. Sign in at `https://<device-ip>`.
2. Open **App Management → Import → Upload Package**.
3. Select `app.yaml` and `image.tar`, then click **Install**.

![Upload app package: select app.yaml and image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/web-import-upload-package.png)

### 3.2 SSH

```bash
DEVICE_IP="<device-ip>"
scp app.yaml image.tar root@"$DEVICE_IP":/tmp/
ssh root@"$DEVICE_IP" 'cd /tmp && aipc-cli app install app.yaml image.tar'
```

After either method, the app state should be **Stopped**. Continue with Section 4 to start it.

## 4. Start and Verify

Click **Start** on the app card and confirm the state changes to **Running**.

View the state and logs over SSH:

```bash
DEVICE_IP="<device-ip>"
ssh root@"$DEVICE_IP" 'aipc-cli app list'
ssh root@"$DEVICE_IP" 'aipc-cli app logs hello-world -f'
```

Press `Ctrl+C` to stop following the logs. **Success:** the app is **Running** and the log prints a new counter every second.

![App list with Hello World Running](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/03-apps-list.png)

## 5. Clean Up

After verification, click **Stop**, then **Uninstall** on the app card.
