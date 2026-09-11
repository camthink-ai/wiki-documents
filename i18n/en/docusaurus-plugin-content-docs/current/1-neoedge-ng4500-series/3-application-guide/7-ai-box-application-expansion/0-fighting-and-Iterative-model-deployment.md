---
description: Deploy "Fighting & Falling" AI models using NeoEdge AI BOX, VMS, and IPC. Learn system architecture, firmware installation, and VMS event configuration for edge safety.
keywords: [Fighting Detection, Fall Detection, AI BOX, VMS Configuration, IPC Deployment, Edge AI Safety, NG4500 AI, Behavioral Analytics]
tags: [AI Application, Safety Monitoring, Edge AI, Behavioral Analytics, NG4500]
---

# Fighting And Iterative Model Deployment

## Overview

This guide walks through deploying the “Fighting & Falling” AI model with an **AI BOX + VMS + IPC** setup.
The IPC captures the video stream, the AI BOX performs inference, and the VMS displays the results.

> AI BOX refers to the NG4500 series device, VMS is the video management system, and IPC is the front-end camera device.

Below are real photos of the IPC and AI BOX:

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc.png" alt="ipc" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/box.png" alt="box" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## System Architecture

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/Interactive-diagram.png" alt="Architecture" style={{ maxWidth: '720px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

The figure above shows the complete workflow. The IPC collects video on the edge and connects to the network through a switch. The IPC stream is ingested by the VMS. As the VMS itself has no AI capability, the VMS server forwards the data to the AI BOX for inference. The AI BOX delivers high performance at low power and offers rich I/O expansion for IoT scenarios—something traditional servers struggle with on the edge. Once the AI BOX finishes processing, the results are returned to the VMS server and presented in the VMS client.

## Deploying the AI Model on AI BOX

> Make sure the NG4500 Series device has been initialized. If not, refer to the [NG4500 Series Quick Start](../../1-neoedge-ng4500-series/1-quick-start.md).

### Step 1. Launch WinSCP

> Any file-transfer tool works if WinSCP is unavailable.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/winscp.png" alt="winscp" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 2. Log In and Verify

After logging in, check the AI BOX directory structure.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/winscp2.png" alt="winscp" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 3. Import the Firmware Package

Copy the firmware from your computer to any folder on the AI BOX. This example uses the `aibox2` directory (you will locate the firmware in this folder when logging in with PuTTY).

Download the AI BOX firmware package: [msaibox_arm64_1.0.0.1-r1-c1.deb](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/wiki/ai-app/fight-fall-model-deploy/msaibox_arm64_1.0.0.1-r1-c1.deb?x-oss-credential=LTAI5tNEE8YCDoztSbpntwqZ%2F20251106%2Fcn-hongkong%2Foss%2Faliyun_v4_request&x-oss-date=20251106T094938Z&x-oss-expires=32400&x-oss-signature-version=OSS4-HMAC-SHA256&x-oss-signature=66daaa60590da506cfbfba76866a276b8916cfd82000a0a0545f1a41caacbdc0).

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/deb.png" alt="deb" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 4. Open an SSH Tool

> PuTTY is used in this example, but you can use Xshell, OpenSSH, or any other SSH client.

Launch PuTTY and enter the device IP.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/putty.png" alt="putty" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 5. Log In to the Box

Enter the AI BOX username and password that were set during initialization.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/login.png" alt="login" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/login2.png" alt="login" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 6. Navigate to the Firmware Directory

Switch to the `root` user and move to the directory that stores the AI BOX package.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/directory.png" alt="directory" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 7. Install the Firmware

Run `ls` to confirm the firmware file, locate the folder, and install it with `dpkg -i your-package.deb` (format: `dpkg -i + filename`). The deployment completes once the command finishes.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/dpkg.png" alt="dpkg" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/systemctl.png" alt="systemctl" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Configure the VMS and Connect to the AI BOX

### Step 1. Install and Log In to the VMS (Windows)

The VMS adopts a C/S architecture. For installation details, refer to *Chapter 2. Installation* in the VMS User Manual.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/vms-install.png" alt="vms-install" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> Milesight VMS download

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/download-vms.png" alt="download-vms" style={{ flex: '1 1 220px', maxWidth: '320px', width: 'auto', maxHeight: '320px', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/download-vms2.png" alt="download-vms" style={{ flex: '1 1 220px', maxWidth: '320px', width: 'auto', maxHeight: '320px', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)', objectFit: 'contain' }} />
</div>

### Step 2. Add the AI BOX in VMS

Navigate to **System & Service Settings → Comprehensive Configuration** and add the intelligent box. Use the IP configured earlier. In this version the username and password are fixed: `admin` / `password`. After saving, click **Apply** and verify the connection.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/vms-add-box.png" alt="vms-add-box" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 3. Configure the Camera Parameters

- Choose which cameras require AI analytics, and draw regions of interest—only events inside the region are detected.
- Configure algorithm parameters such as sensitivity (higher sensitivity triggers more easily but may increase false alarms) and fall duration thresholds.
- After tuning, click **Apply** to save. You can batch apply the same configuration to other cameras.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/parameter-configuration.png" alt="parameter-configuration" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 4. Configure Events and Alarms

Define which actions should be triggered when the AI detects an event, how the actions run, and how the alarms are displayed in the UI.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/action-setting.png" alt="action-setting" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/action-setting.png" alt="action-setting" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Step 5. Live View Verification

Use the **LIVE** page to validate the live video. When the rule is triggered, the live view executes the actions configured in the previous step.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/live.png" alt="live" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Deploying IPC Devices

- Configure the IPC IP address, username, and password.
- Visit the IPC IP through the H5 page to check the feed.
- Add the local IPC device inside the VMS.
- Third-party IPCs are also supported; you are not limited to CamThink devices.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc-front-end-deployment.png" alt="ipc-front-end-deployment" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc-front-end-deployment2.png" alt="ipc-front-end-deployment" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Demo Videos

**Video 1 (Fighting Detection):** Shows the on-site workflow where fighting is detected, alarms are reported, and devices are linked.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <iframe
    src="https://www.youtube.com/embed/WSauLvZZXfg"
    title="AI Box Demo 1"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    style={{ maxWidth: '640px', width: '100%', height: '360px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}
  />
</div>

**Video 2 (Fall Detection):** Demonstrates fall event recognition with multi-scene monitoring and coordinated warnings.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <iframe
    src="https://www.youtube.com/embed/zYwYpczTPU8"
    title="AI Box Demo 2"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    style={{ maxWidth: '640px', width: '100%', height: '360px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}
  />
</div>

## FAQ

1. After adding the BOX IP in the VMS, the username and password are fixed as `admin` / `password`; they are different from the BOX SSH credentials.
2. VMS releases are tightly coupled with firmware versions. For example, the r1 BOX firmware must be used with the r1 VMS.
3. False alarms can result from the installation location or camera angle; adjust the deployment accordingly.
4. The VMS license starts with a trial code. Contact us when it expires if you need ongoing access.
5. To obtain the VMS installer, [contact us](https://www.camthink.ai/company/contact-us/).
