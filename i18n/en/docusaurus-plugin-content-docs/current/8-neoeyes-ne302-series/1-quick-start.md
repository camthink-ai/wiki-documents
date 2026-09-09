---
id: ne302-quick-start
title: Quick Guide
sidebar_position: 1
description: Assemble NE302, power it on, sign in, validate a model and confirm one trigger record.
keywords: [NE302, Quick Guide, Web console, Feature Debugging, Model Validation]
tags: [NE302, quick-guide, neoeyes]
---

# Quick Guide

Complete this first-use path: assemble and power the device → sign in to the Web console → confirm the preview → upload a model and validate an image → run one trigger and confirm a Records entry. Field explanations and troubleshooting are in the User Guide.

## 1. Prepare the hardware

Prepare the NE302 Main Board, Interface Board, camera assembly, the antenna for the delivered SKU, and either a continuous USB Type-C (5 V) supply or a delivery-compatible external battery pack that powers the device through USB Type-C. Add a MicroSD card when capture records must be saved, and use a computer that can reach the device network.

This procedure applies to the complete NE302 device (Main Board + Interface Board). The Main Board can also be used for a custom Main-Board-only integration and uses DC power according to the delivery record; MicroSD steps for the Interface Board do not apply.

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', margin: '24px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-product-render-cropped.png" alt="NE302 white finished product with external antenna" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-board-connection-tight-v2.png" alt="NE302 main board and interface board assembly" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
</div>

The left image shows the finished product; the right image shows the board assembly. Follow the delivery hardware record for power, antenna and board revision.

## 2. Assemble and power the device

1. With power disconnected, mate the Main Board and Interface Board in the keyed connector direction. Do not force or angle the connector.
2. Attach the antenna for the delivered SKU. Insert a MicroSD card when local storage is required.
3. Mount the device for the site field of view. The standard enclosure supports a rear magnetic mount or double-sided adhesive; use the method below.
4. Connect USB Type-C to a continuous power supply or compatible external battery pack according to the delivery record, then wait for startup.

### Mounting methods

This section applies to the standard two-board device with its enclosure. Mount with power disconnected, and leave a clear lens view plus access for power, antenna and maintenance. A Main Board-only configuration must use the delivered information for DC power and mechanical integration; the standard enclosure mounting methods may not apply.

**Rear magnetic mount**

1. Choose a flat mounting surface that the magnet can hold, and confirm that the position covers the intended field of view.
2. Bring the rear magnetic surface fully into contact with the mounting surface.
3. Gently push the device to confirm that it does not slide or detach. Connect the antenna and power cable afterwards, without allowing either cable to pull on the device.

**Rear double-sided adhesive**

1. Choose a flat, dry mounting surface and clean both it and the rear of the device.
2. Remove the adhesive liner, align the device with the target position, then press the rear evenly into place.
3. Confirm that the device is fixed before connecting the antenna and power cable, without allowing either cable to pull on the device.

After mounting, confirm that the lens view is unobstructed and that the external antenna is fitted and clear of large metal obstructions. Power on, then confirm under **Feature Debugging** that the preview orientation and coverage match the site target. If the image is unsuitable, disconnect power, adjust the mounting position, then check the preview again.

If the device does not start, disconnect power, check the board connection, camera connection and power, then power it on again.

## 3. Sign in to the Web console

1. Connect the computer to the network specified by the delivery record.
2. Open the device address in a browser. Some test devices use `http://192.168.10.10/`; the actual address follows the device configuration.
3. Sign in with the credentials delivered with the device. If the page requires a login-password change, complete it and sign in again with the new password.

![NE302 Web console login page](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-login.png)

The access check passes when the console opens and displays the function navigation.

## 4. Confirm the live preview

1. Open **Feature Debugging**.
2. Wait for the preview area and Camera Settings to finish loading.
3. Confirm that the preview continuously shows an image and that its orientation matches the installation.

![NE302 Feature Debugging live preview and Camera Settings](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging.png)

If there is no image, check the camera connection and power first, then see [Capture and Storage](./2-user-guide/0-capture-storage.md).

## 5. Upload a model and validate an image

1. Download a `.bin` model package compatible with the device from [CamThink Developer Center → Models](https://www.camthink.ai/developer-center/models/).
2. In **Feature Debugging → Camera Settings**, select **upload** in the Current Model area and wait for the model to load.
3. Open **Model Validation** and upload one fixed test image.
4. Wait for the result area to update and confirm that the page returned an inference result.

![NE302 Model Validation page](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-model-validation.png)

See [AI Model Validation](./2-user-guide/2-ai-model-validation.md) for model formats, parameters and result interpretation.

## 6. Run one trigger and confirm Records

1. In **Feature Debugging → Wakeup Source Configuration**, enable one test source only and save the setting.
2. Use that source to trigger the device once.
3. Open **Capture Settings → Records** and find the matching entry by trigger time.

![NE302 Wakeup Source Configuration](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging-stream-wakeup.png)

![NE302 Capture Settings → Records](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-capture-records.png)

The first capture check passes when Records contains the entry with the matching time.

## 7. Next steps

- [Capture and Storage](./2-user-guide/0-capture-storage.md): configure capture, storage and triggers.
- [Data Transmission](./2-user-guide/1-data-transmission.md): configure MQTT/MQTTS, Webhook and media-stream delivery.
- [AI Model Validation](./2-user-guide/2-ai-model-validation.md): manage models and inference validation.
- [System Maintenance](./2-user-guide/3-system-maintenance.md): manage network, firmware, storage and device information.
- [Hardware Guide](./3-hardware-guide/0-components-overview.md): identify boards, interfaces and hardware revision.
- [Software Guide](./4-software-guide/0-development-environment.md): build, flash and maintain the source project.
