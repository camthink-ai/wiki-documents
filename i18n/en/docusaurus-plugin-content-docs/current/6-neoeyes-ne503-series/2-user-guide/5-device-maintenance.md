---
description: "NE503 device maintenance: network and time, logs and storage, device-management tools, and maintenance tools."
keywords: [NE503 device maintenance, network configuration, NTP, logs, storage, ct-disc, aipc-cli]
tags: [User Guide, NE503, Device Maintenance, Operations]
---

# Device Maintenance

This page covers routine maintenance after the device is online: network and time configuration, logs, storage, and device-management tools.

## 1. Network and Time

Configure a fixed device IP when required and synchronize its time.

### 1.1 Static IP Configuration

Go to **Settings → Network**, **IPv4 Settings** (interface eth0):

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-network.png" />

1. Switch **Mode** to **Static Address**.
2. Fill in the IP address, subnet mask, and gateway per the site network plan; set DNS as appropriate for the environment.
3. After saving, the device serves at the new IP; access the console via the new address.

**Success:** the IP remains unchanged after reboot and the Web console is reachable at the new address.

In a DHCP environment, bind the device MAC address to an IP in the router.

### 1.2 Timezone and NTP Configuration

Go to **Settings → Time**:

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-time-settings.png" />

1. Select the site timezone under **Timezone**.
2. Set **Sync Mode** to **NTP Sync** and enter an NTP server reachable from the site.
3. Click **Sync Now** to synchronize immediately.

**Success:** synchronization completes without an error and the OSD time matches site time.

## 2. Logs and Storage

### 2.1 Log Viewing and Collection

Open **Maintenance → Logs** and filter by time or keyword.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-logs.png" />

For command-line diagnosis, use `journalctl -u <service>`; platform logs are in `/data/aipc/logs/`.

### 2.2 Storage Cleanup

**Settings → Storage** shows built-in storage usage, split into **System** (system partition, not modifiable) and **Data** (data partition).

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-storage.png" />

Open **Settings → Storage** to check **System** and **Data** usage. If Data usage is high, export required logs first, then clean logs, remove unused apps, or delete unused models.

```bash
truncate -s 0 /data/aipc/logs/*.log
```

Recording is saved by an external NVR / VMS, not locally on the device.

## 3. Maintenance Tools

**Maintenance** provides File Manager, Terminal, and Process Manager:

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-file-manager.png" />

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-terminal.png" />

Stopping platform-critical processes can break the device. Avoid **Kill** unless necessary.

## 4. Device Management Tools

### 4.1 CT-Disc

Run on a computer on the same LAN as the device:

~~~bash
ct-disc scan
~~~

The output should include the device MAC, SN, IP, and firmware information. Common commands:

~~~bash
ct-disc scan --timeout 3
ct-disc list --product NE503 --timeout 5
ct-disc watch
~~~

See the [neoruntime/tools/ct-disc](https://github.com/camthink-ai/neoruntime/tree/main/tools/ct-disc) source for the CLI, GUI, packet definitions, and options.

### 4.2 aipc-cli

Run in **Maintenance → Terminal** or over SSH:

~~~bash
ssh root@<device-ip>
aipc-cli system health
aipc-cli app list
aipc-cli app logs <id> -f
aipc-cli stream list
aipc-cli model list
~~~

Run `aipc-cli --help` for the complete command tree.
