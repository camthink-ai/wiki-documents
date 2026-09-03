---
description: NE503 platform software installation and upgrade guide covering Web upgrade, SSH deployment, version verification, and rollback.
keywords: [NE503, platform software, Web upgrade, OTA, deploy.sh, release package]
tags: [application guide, NE503, software deployment, operations]
---

# Software Deployment

This page covers installation and upgrade of the NE503 platform software release package (`.tar.gz`). The system OS uses a `.swu` package.

## 1. Prepare the Release Package

Download `aipc-hailo15-<version>.tar.gz` from [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases).

Before starting, confirm that:

- The target is an NE503 device and the Web console or SSH is available.
- Web upgrade uses an administrator account; SSH deployment requires `root` privileges.
- `/data` is writable and has enough space: `df -h /data`.
- Record the current `Firmware Version`. Keep power and network connectivity stable during the upgrade.

## 2. Upgrade Through the Web Console

Use this method when the device is running and reachable through the Web console.

1. Open `https://<device-ip>` and sign in with an administrator account.
2. Open `Settings → Device Info`.
3. Under `Firmware & Hardware`, find `Firmware Version` and click its `Update` button. Do not click `Update` beside `System OS Version`.

   ![Firmware Update dialog](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/software-deployment/software-upgrade.jpg)

4. Upload one `aipc-hailo15-<version>.tar.gz` file.
5. Confirm that power is stable, select `I understand and wish to continue with the upgrade`, and click `Confirm Update`.
6. Wait for upload, writing, and reboot to finish. Do not refresh the page, click again, or cut power.
7. After the device comes back online, sign in again and verify `Firmware Version`.

**Success:** the device is online again, you can sign in, and `Firmware Version` shows the target version. If `Device offline` appears, check power and network, then click `Re-detect`.

## 3. Install or Upgrade Through SSH

Use `deploy.sh` when the Web entry is unavailable or command-line deployment is required:

```bash
scp build/release/aipc-hailo15-<version>.tar.gz root@<device-ip>:/data/
ssh root@<device-ip>
cd /data
tar xzf aipc-hailo15-<version>.tar.gz
cd aipc-hailo15-<version>
./deploy.sh
```

When `Proceed with deployment? [y/N]` appears, verify the target and enter `y`. Success includes:

```text
[deploy]   Deploy successful!
[deploy]   Version: <version>
```

The install path is `/data/aipc`. Incompatible packages do not stop the existing services.

Common options:

| Option | Effect |
|:---|:---|
| `--no-config` | Preserve the device's existing configuration |
| `--status` | Show the current version and backup information |
| `--rollback` | Restore the previous version from the latest backup |

## 4. Verify or Roll Back

After signing in again, open `Settings → Device Info` and confirm that `Firmware Version` has changed.

A firmware upgrade also updates the MCU. To query the MCU version, run:

```bash
aipc-cli device status
```

Confirm `Version` in the `MCU` section of the output:

```text
MCU:
  Version:      0.1.8.0
```

Verify the version through SSH:

```bash
cat /data/aipc/VERSION
```

**Success:** the command prints the complete `VERSION` content and the version matches the target. To roll back, run the following from the release package directory:

```bash
./deploy.sh --rollback
```

Rollback requires an available device backup.

## 5. Related Documentation

- [Troubleshooting](../5-troubleshooting.md) — Service, network, and storage issues
- [NeoRuntime deployment guide](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/DEPLOYMENT.md) — `deploy.sh` reference
