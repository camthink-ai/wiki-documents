---
description: "NE503 Applications and Models pages: app installation, permission setup, model import, loading, and inference verification."
keywords: [NE503 app management, install wizard, model management, HEF, permissions, AI inference]
tags: [User Guide, NE503, Applications, Models, AI]
---

# AI Apps and Models

NE503 manages apps on **Applications** and models on **Models**. An AI app must have access to the models, streams, and device controls it needs before it starts.

## Applications

Open the **Applications** page. Click **Import** to install an app.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png" />

### App Actions

| Button | Action |
|--------|--------|
| **Stop / Restart** | Stop / restart the app |
| **Logs** | View runtime logs |
| **Console** | Open a shell inside the container (for debugging) |
| **Visit App** | Open the app's Web UI |
| **Uninstall** | Remove the app |

Use **All / Installed / Running / Stopped / Failed** to filter the list.

### Install a New App (6-Step Wizard)

Click **Import** and complete the 6-step **Application Setup Wizard**. The images show the Source and Review pages:

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step1-source.png" alt="Wizard Step 1 Source" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step6-review.png" alt="Wizard Review Confirmation" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

| Step | Configuration |
|------|--------------|
| 1. Source | Select **Registry Image**, **Upload Archive**, or **Upload Package** |
| 2. Basic Info | Enter **Application ID**, name, and version; the ID cannot be changed later |
| 3. Resources | Set CPU, memory, auto-start, and restart policy as needed |
| 4. Permissions | Grant only the required models, streams, event topics, network, and device controls |
| 5. Advanced | Add environment variables and volumes when required |
| 6. Review | Confirm the settings and click **Install** |

After installation, the app appears in the list. Start it and confirm the status changes to **Running**.

## Models

Open the **Models** page to manage inference models. The list depends on the device.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-models.png" />

### Model Actions

Each model card supports **Scan Models** (scan `/data/aipc/models/`), **Import** (upload a `.hef` file and enter Model ID, Model Type, and Threshold), and **Load / Unload / Detail / Delete**. Confirm that the model is **Loaded** before inference; models declared in app permissions load automatically at startup. Confirm that the model input matches the active stream configuration, adjust the Threshold as needed, and verify that the app is **Running** and produces the expected result.
