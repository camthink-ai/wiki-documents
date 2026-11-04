---
description: "NE503 Applications and Models pages: app installation, permission setup, model import, loading, and inference verification."
keywords: [NE503 app management, install wizard, model management, HEF, permissions, AI inference]
tags: [User Guide, NE503, Applications, Models, AI]
---

# AI Apps and Models

NE503 manages apps on **Applications** and models on **Models**. Before an AI app starts, declare its model dependencies, streams, and event permissions in the wizard.

## Applications

Open the **Applications** page. Click **Import** to install an app.

![Applications page](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png)

### App Actions

| Button | Action |
|--------|--------|
| **Stop / Restart** | Stop / restart the app |
| **Logs** | View runtime logs |
| **Console** | Open a shell inside the container (for debugging) |
| **Visit App** | Open the app's Web UI |
| **Uninstall** | Remove the app |

Use **All / Installed / Running / Stopped / Failed** to filter the list.

> After a device OS upgrade, if the OS version range declared by an app does not match the device OS, the platform suspends the app's business functions and shows a compatibility page listing the app version, the supported OS range, and the current device OS. Access is restored automatically once the app or firmware is upgraded as instructed.

### Install a New App (Application Setup Wizard)

Click the **Import** card to open the **Application Setup Wizard**. The wizard is organized into sections; switch between **Registry Image / Basic Info / Resources / Models / Permissions / Advanced** on the left, and toggle between the **Form** view and the **YAML** view at the top.

**Source (first screen)**

- **Local Upload**: upload a `.neoapp` app package or an image tar (max 2 GB). A `.neoapp` package unpacks its manifest and image automatically; a bare image tar gets its manifest from the form.
- **Registry Image**: enter an image address to pull from Docker Hub or a private registry. The device needs internet access; use Local Upload on offline devices.

![Wizard source selection](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-source.png)

**Sections**

| Section | Contents |
|---------|----------|
| Basic Info | **Application ID** (immutable after creation), name, version, and description |
| Resources | **CPU Limit** (accepts both `0.5` and `50%` input formats) and **Memory Limit** |
| Models | Model dependencies: **Add Dependency** declares a model alias (injected at runtime as the `AIPC_MODEL_<alias>` environment variable) and selects the model; set **Max Inference QPS** and **Max Concurrent Inference**; **Allow Dynamic Model Registration** lets the app discover and register models at runtime — keep it off unless required |
| Permissions | **Video Stream Permissions** to select streams; **Event Permissions** for publish/subscribe topics; **Network Mode** defaults to Isolated Mode |
| Advanced | Environment variables, volumes, **Auto-start on boot**, and **Restart Policy** |

![Wizard Basic Info and section navigation](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-basic-info.png)

Click **Install** when the configuration is complete. After installation, the app appears in the list. Start it and confirm the status changes to **Running**.

## Models

Open the **Models** page to manage inference models. The top bar provides search by Model ID, status filtering, load-order sorting, and model-type filters (detection, classification, segmentation, OCR, etc.); the list depends on the device.

![Model list](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/models-list.png)

### Import a Model (3-Step Wizard)

Click **Import** to open the import wizard and complete **Upload → Parse → Configure**:

1. **Upload**: upload a bare `.hef` file (configure manually afterwards) or an AMPK `.bin` package whose parse result pre-fills the form.
2. **Parse**: the platform parses the model file server-side, suggests input and postprocess settings, and estimates compute (TOPS) and memory usage.
3. **Configure**: review the model ID, type, input/output and postprocess configuration (including threshold, NMS, and related parameters), then submit for registration. Form fields carry hover hints; the parse result automatically matches the decoder variant, and the advanced settings rarely need changes.

![Model import wizard](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/model-import-wizard.png)

Postprocess configuration errors are reported explicitly at registration instead of being silently ignored; failed registrations roll back automatically. For models with custom postprocess or vendor plugins, verify the plugin path, postprocess name, and parameter configuration before upgrading.

### Model Actions

Each model card supports **Scan Models** (scan `/data/aipc/models/`) and **Load / Unload / Detail / Delete**. Confirm that the model is **Loaded** before inference; models declared in the wizard's Models section load automatically at app startup. Confirm that the model input matches the active stream configuration, and verify that the app is **Running** and produces the expected result.

## Event Center

The **Events** page is used to debug app event communication. The left pane hosts the topic list, subscription management, and event publishing; the right pane shows the live event stream.

- **Topics**: shows the active event topics and their subscriber counts.
- **Subscribe**: add subscription topics with wildcard support (e.g. `app/*`); with no subscription, all events are received.
- **Publish Event**: specify a topic with a JSON payload to inject a test event into the system.
- **Live Event Stream**: after connecting, displays each event's time, topic, and payload in order; the stream can be disconnected or cleared.

Event topics and payload formats are defined by the apps; refer to the corresponding app documentation.
