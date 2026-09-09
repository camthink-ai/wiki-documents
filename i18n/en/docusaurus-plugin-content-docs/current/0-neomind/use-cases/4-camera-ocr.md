---
description: Demonstrates the AI processing pipeline (processingExtensionId) of the NeoMind ne101_camera smart-camera component, with a full paddle-ocr-v6 OCR walkthrough — automatically feeding NE101/NE301 captured frames into a local OCR engine, with ROI overlay, virtual-metric write-back, history, and AI Chat queries. The same pipeline also supports object detection, open-vocabulary grounding, and other extensions. Uses water-meter reading and product-label recognition as worked scenarios.
keywords: [NeoMind, OCR, water meter reading, product label recognition, paddle-ocr-v6, ne101_camera, NE101, NE301, ROI, real-time OCR]
tags: [NeoMind, OCR, water meter reading, product label recognition, camera component]
sidebar_label: "NE101 Camera AI Vision"
---

# NE101 Camera AI Vision

> One component, many AI vision capabilities — this guide walks the pluggable pipeline end-to-end with OCR (meter reads, product labels); swap `processingExtensionId` for the others.

---

## 1. Solution Overview

The NeoMind **NE101 camera component (`ne101_camera`)** is more than a display widget — it ships with a built-in **AI processing pipeline**. The component itself does not run AI; instead, through the `processingExtensionId` contract it hands every captured frame to an extension of your choice for inference, then renders the results back onto the image as overlays and virtual metrics.

The pipeline is **pluggable** — swap in a different extension and the same component performs a different kind of AI vision task:

| AI capability | Extension | Typical scenarios |
|------|------|------|
| **OCR / text recognition** | paddle-ocr-v6 / paddle-ocr-vl | Meter readings (water/electricity/gas), product and price labels, digital instruments, nameplates and serial numbers, documents and forms |
| **Object detection** | yolo-device-inference / image-analyzer | People counting, vehicle detection, zone intrusion alerts |
| **Open-vocabulary grounding** | locate-anything | Find or count arbitrary objects by natural language, defect localization, zero-shot counting |

> Beyond the structured pipeline, you can also use an **AI Agent + vision LLM** for open-ended scene understanding (description, reasoning, alerts) — see Section 7.

This guide uses **OCR / text recognition** (with `paddle-ocr-v6`) as a full walkthrough of the pipeline, from install to results; other capabilities follow the exact same configuration, only swapping `processingExtensionId` in step 5.3. The walkthrough uses **water-meter reading** and **product labels** as the OCR examples.

**Data Flow**:

```mermaid
flowchart LR
    CAM["NE101/NE301 capture"] --> COMP["ne101_camera component<br/>processingExtensionId"]
    COMP -->|"Transform automation<br/>inject image_base64"| EXT["Pluggable AI extension<br/>OCR / detection / grounding"]
    EXT -->|"results + coords"| VM["Virtual metrics<br/>virtual.{extension}.*"]
    VM --> OVERLAY["Detection / text-box overlay<br/>+ ROI highlight"]
    VM --> CHAT["Dashboard, AI Chat<br/>history & queries"]
```

Inference results are written to virtual metrics `virtual.<extension>.*`; the component overlays detection or text boxes on the image (optionally with ROI highlight) from them, and they are available to dashboards and AI Chat.

---

## 2. Bill of Materials (BOM)

All inference in this pipeline runs locally on the NeoMind host: the paddle-ocr-v6 `tiny` tier ships bundled with the extension — no GPU and no Internet needed (`small` / `medium` tiers only require connectivity the first time they are switched to).

| Item | Model / Spec | Purpose | Required |
|------|------|------|------|
| **Smart camera** | NE101 or NE301 | Image capture | ✅ |
| **NeoMind platform** | v0.9.0+ | Edge AI management | ✅ |
| **paddle-ocr-v6 extension** | v2.7.8+ | Local OCR inference engine | ✅ |
| **ne101_camera component** | v2.14.10+ | Camera panel + AI processing pipeline | ✅ (from the component marketplace) |
| **Local LLM** | Ollama, etc. | AI Chat backend | Optional |

---

## 3. Prerequisites

### 3.1 Install and configure NeoMind

Complete NeoMind installation, registration, and basic configuration — see [NeoMind Quick Start](../user-guide/1-install-setup.md).

### 3.2 Onboard the device

Register the NE101 or NE301 with the NeoMind platform (device type `ne101_camera`) — see [NeoMind Quick Start - Device Management](../user-guide/3-onboard-device.md).

![Device management - add an NE101/NE301 device](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/01-device-onboard.png)

---

## 4. Install the Extension and Component

### 4.1 Install the paddle-ocr-v6 extension

Go to the **Extensions** page, open the marketplace, search for **paddle-ocr-v6**, and download/install it; after installation, confirm the status is **Running**.

![Open the extension marketplace](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/02-extension-market.png)

![Download and install the paddle-ocr-v6 package](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/03-install-extension.png)

paddle-ocr-v6 offers four inference tiers, switchable in the extension config or the component panel (they map to the `tier` parameter of the extension's `switch_tier` command: `tiny` / `small` / `medium` / `auto`, default `auto`):

| Tier | Size | Use case |
|------|------|------|
| `tiny` | ~6MB (bundled) | Lightweight CPU, offline (no Japanese) |
| `small` | ~18MB (lazy download) | CoreML or CUDA available, higher accuracy |
| `medium` | ~132MB (lazy download) | CUDA with ≥16GB RAM, highest accuracy |
| `auto` | — | Default; auto-selects by host capability |

> Switching tiers means calling the `switch_tier` command (or changing the extension config); the `small` / `medium` models are downloaded on first switch and work offline afterwards. Run the `health` command to see the currently active tier.

### 4.2 Confirm the ne101_camera component is available

`ne101_camera` is an official component in the dashboard component marketplace. If it does not appear in the component library, install it from the marketplace (see [Extension Management](../user-guide/9-extensions.md)).

---

## 5. Dashboard Configuration: Camera + OCR Pipeline

### 5.1 Add the NE101 camera component

Go to **Dashboard**, create a dashboard, click **Add Panel**, and select the **NE101 Camera Panel** component. The first time you use it, you need to download the component package.

![Add the NE101 camera component](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/04-add-component.png)

![Download the NE101 AI inference component package](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/05-download-component.png)

### 5.2 Configure the component and bind a device

After adding the component, bind an onboarded NE101 or NE301 device in the config panel; once bound, the panel shows the live feed, online status, and battery level.

![Configure the NE101 component](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/06-configure-component.png)

![Bind the NE101 device](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/07-bind-device.png)

### 5.3 Enable AI inference and select the extension

In the **Advanced** section of the component config, turn on **AI Inference**, and select **paddle-ocr-v6** from the extension dropdown (the extension must be installed first to appear in the list). The template is then auto-set to `text_detection`, which calls the extension's `recognize` command. This walkthrough uses OCR; for object detection, grounding, and other capabilities, see the extensions, templates, and parameters in Section 6.

![Turn on the AI inference feature](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/08-enable-ai.png)

![Select the paddle-ocr-v6 AI inference extension](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/09-select-extension.png)

### 5.4 Set a Region of Interest (optional)

Often only part of the frame is the content to read, such as a meter's digit wheels or the text area of a label. Enabling **ROI** highlights regions of interest on the image and lets you choose a counting strategy via `processingRoiAction` — `count`, `filter` (inside only), or `filter_outside` (outside only) — and tune the detection-box-vs-ROI overlap threshold via `processingRoiOverlap` (default `0.6`). ROIs support polygons, so you can draw one or more regions of interest directly on the image in the config panel.

![Set the ROI area for the AI task](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/10-set-roi.png)

### 5.5 Auto-generated data transform task

Once AI inference is enabled, NeoMind automatically creates a **data capture / transform task** (the Transform automation, named like `ne101-{deviceId}-paddle_ocr_v6-text_detection`): whenever the device uploads a new frame, it injects the image into paddle-ocr-v6's `recognize`, and the returned `text_blocks` are written to virtual metrics.

![The system auto-generates a data capture/transform task](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/11-transform-task.png)

```
virtual.paddle_ocr_v6.texts             // ["00238", "m³"]   recognized text
virtual.paddle_ocr_v6.detections        // [{bbox, polygon, label, confidence}, ...]
virtual.paddle_ocr_v6.inference_time_ms // per-frame inference time (ms)
```

The task's transform rules are editable, so you can define richer post-processing logic — for example, parsing a reading string into a number, or filtering out noisy text.

![Transform rules are editable](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/12-transform-rules.png)

The component reads these virtual metrics, overlays text boxes on the image by their normalized coordinates, and shows the extracted text, detection count, and inference time in the bottom info bar.

---

## 6. Application Scenarios

This section lists typical scenarios by AI capability. Device onboarding, component setup, binding, and ROI config are identical across all scenarios (Sections 3–5); the only difference is **the extension, template, and parameters chosen in step 5.3**:

| AI capability | Extension | Template | Key parameter |
|---|---|---|---|
| OCR / text recognition | paddle-ocr-v6 / paddle-ocr-vl | `text_detection` | — |
| Object detection | yolo-device-inference / image-analyzer / locate-anything | `object_detection` | `processingCategories` (e.g. `person,car`) |
| Open-vocabulary grounding | locate-anything | `grounding` | `processingPhrase` (natural-language description) |

### 6.1 OCR / text recognition

**Water-meter reading**: face the camera at the meter, draw the ROI over the reading area, and set `processingRoiAction = filter` to discard the logo, model, and other irrelevant text. After capture, recognized digits and units (e.g. `00238`, `m³`) are overlaid; the reading can be parsed into a number via [Data Transform](../user-guide/7b-data-transforms.md) to plot consumption trends.

![After the device uploads an image, inference runs automatically with overlays](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/13-inference-result.png)

**Product labels**: aim the camera at shelf price tags or conveyor labels, draw the ROI over the main text area (name, SKU, price, batch), and use multiple ROIs for multiple labels. The returned text can be pushed to ERP or reconciliation systems, or aggregated in the dashboard as "SKUs recognized this round".

> For complex layouts (tables, invoices, warped documents), switch to [`paddle-ocr-vl`](./5-paddle-ocr-vl.md) (VLM; requires a GPU service).

### 6.2 Object detection

Select `yolo-device-inference` (or `image-analyzer`); the template auto-switches to `object_detection`, and you fill `processingCategories` with the classes of interest (e.g. `person,car`). After capture, detection boxes with class labels are overlaid, and results are written to virtual metrics for counting, statistics, and alerts.

- **People counting / vehicle detection**: `processingCategories = person` or `car`, combined with ROI `count` to tally targets in a region.
- **Zone intrusion alerts**: define a forbidden ROI, set `processingRoiAction = filter`, and trigger when a target appears inside it — pair with [Automation Rules](../user-guide/7-automation-rules.md) to push alerts.
- **Custom targets**: for targets outside the stock COCO 80 classes (uniforms, helmets, proprietary products), replace the extension's ONNX model with a custom-trained one.

### 6.3 Open-vocabulary grounding

Select `locate-anything`; the template switches to `grounding`, and you describe the object to find in `processingPhrase`. The model locates it zero-shot, overlays grounding boxes, and counts matches — ideal for classes a fixed detector doesn't know or ad-hoc needs.

- **Natural-language counting**: `processingPhrase = people in red vests`, `red products on the shelf`, `trash on the floor` — returns all matching locations and a count.
- **Defect / foreign-object localization**: describe the anomaly (e.g. `scratch`, `leftover tool`) to aid localization, then combine with ROI or manual review.

> [`locate-anything`](./6-locate-anything-v2.md) also supports `text_detection` (text localization) and `point` (pointing) templates — switch as needed.

---

## 7. LLM Scene Understanding: AI Agent Visual Analysis

The OCR, detection, and grounding capabilities above are a **structured pipeline** that returns deterministic text / boxes / classes. When you need more open-ended understanding — describing a scene, judging anomalies, giving recommendations, or reviewing history in natural language — use an **AI Agent + vision LLM** instead: the Agent binds to the camera device, analyzes each new frame with a vision LLM, and stores results in long-term memory for later queries. This path bypasses the `processingExtensionId` pipeline — the Agent consumes device images directly.

> A vision-capable LLM backend is required (e.g. a multimodal Ollama model or a cloud vision model) — see [Configure the LLM backend](../user-guide/2-configure-llm.md) and [AI Agent](../user-guide/6-ai-agent.md).

**Steps**:

1. **Create an AI Agent**: on the AI Agent page, create an Agent, bind the target camera device, and define what to analyze with a prompt (e.g. "describe on-site personnel activity and device status; alert on anomalies").

![Create an AI Agent](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/llm-create-agent.png)

2. **Continuous capture + LLM analysis**: the Agent is event-triggered — each time the device uploads a frame, it calls the vision LLM to analyze the image.

![Continuously capture images and analyze them with the LLM](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/llm-continuous-analysis.png)

3. **View analysis results**: each analysis's description, judgment, and recommendations are recorded in the Agent's run history.

![The results of each analysis](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/llm-analysis-results.png)

4. **Long-term memory**: the Agent can write key information to long-term memory, accumulating context across runs (site baseline, past events, etc.).

![Long-term memory read/write updates](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/llm-memory.png)

5. **Review the site in natural language**: with memory and analysis history, ask the Agent to recap the device's deployment and on-site situation in natural language.

![Use the LLM to monitor the device's historical on-site situation](https://resources.camthink.ai/wiki/img/ai-application/neomind/camera-ocr/llm-history-review.png)

---

## 8. AI Chat Queries

Once results from any capability land in time-series data, you can query them in **AI Chat** using natural language, for example:

```
What's the reading trend of my-water-meter over the last 7 days?
How many people did the entrance camera count today? Which hours peaked?
List the product-label SKUs recognized today.
```

> AI Chat requires an LLM backend — see [Configure the LLM backend](../user-guide/2-configure-llm.md).

---

## 9. Tuning

### 9.1 Accuracy tuning

- **OCR**: the default `auto` tier covers most scenarios; for missed recognition, upgrade to `small` / `medium` or lower the detection threshold, and for false recognition, narrow the focus with ROI `filter`.
- **Object detection**: tune the confidence and NMS thresholds and tighten `processingCategories`; for proprietary targets, swap in a custom ONNX model.
- **Open-vocabulary grounding**: refine the `processingPhrase` wording and the NMS threshold to improve recall.

### 9.2 OCR Extension Selection Cheat Sheet

NeoMind ships three OCR extensions, and all of them plug into the same `processingExtensionId` pipeline from this guide (just change the drop-down in step 5.3). Choose by deployment constraints and document complexity:

| Extension | Deployment | Best at | See |
|------|------|------|------|
| `ocr-device-inference` | Local SVTR ONNX, tens of MB, CPU-friendly | General text-line recognition (single Chinese/English) | [General OCR Solution](./2-ocr-text-extraction.md) |
| `paddle-ocr-v6` (this guide) | Local ONNX, four tiers, edge-runnable | Simple printed text, meter readings, low-latency offline | This guide |
| `paddle-ocr-vl` | Remote GPU inference service | Complex layouts, table reconstruction, key-information extraction | [PaddleOCR-VL Document Understanding](./5-paddle-ocr-vl.md) |

The [General OCR Solution](./2-ocr-text-extraction.md)'s basic OCR panel suits the manual "snap one, read one" scenario; this guide is the continuous-recognition setup — always-on camera, automated pipeline, ROI overlay. When unsure: get it running at the edge with v6 first, then switch to paddle-ocr-vl for tables / receipts / warped documents.

---

## 10. Appendix

### Related docs

- [General OCR Solution](./2-ocr-text-extraction.md)
- [Object Detection Use Case](./1-object-detection.md)
- [Face Recognition Solution](./3-face-recognition.md)
- [PaddleOCR-VL Document Understanding](./5-paddle-ocr-vl.md)
- [LocateAnything Visual Grounding](./6-locate-anything-v2.md)
- [DeepStream Video Analytics (NG4500)](./7-deepstream-ng4500.md)
- [Extension Management](../user-guide/9-extensions.md)
- [Automation Rules](../user-guide/7-automation-rules.md)
- [AI Agent](../user-guide/6-ai-agent.md)
- [Data Transforms](../user-guide/7b-data-transforms.md)
- [Data Push](../user-guide/7c-data-push.md)
- [NE101 Camera Component Flagship Case Study](../developer-guide/case-studies/7-ne101-camera-component/index.md)

---

*Last updated: 2026-09-08*
