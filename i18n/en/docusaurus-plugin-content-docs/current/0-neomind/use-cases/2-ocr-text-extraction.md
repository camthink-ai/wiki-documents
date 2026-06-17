---
description: A NeoMind-based OCR solution for general text recognition, using the OCR extension to extract text from images with dashboard display, history viewing, and AI Chat natural language queries, supporting NE101/NE301 smart cameras.
keywords: [NeoMind, OCR, text recognition, NE101, NE301, OCR extension, dashboard, AI Chat]
tags: [NeoMind, OCR, text recognition, extension]
---

# OCR Solution

---

## 1. Solution Overview

The NeoMind **OCR extension** performs general text recognition on images captured by devices, extracting text content and displaying it on the dashboard. Recognition results can also be queried via **AI Chat** using natural language.

**Typical Use Cases**:

| Scenario | Description |
|------|------|
| Nameplate Reading | Identify model, serial number, and parameters on equipment nameplates |
| Label Recognition | Read text descriptions next to product labels and barcodes |
| Document Digitization | Convert paper documents and signage into searchable text |
| Meter Reading | Recognize readings on digital meters (e.g., electricity, water) |

**Data Flow**:

```
NE101/NE301 Image Capture → NeoMind Platform → OCR Extension Recognition → Dashboard Display + AI Chat Query
```

| Stage | Description |
|------|------|
| Image Capture | NE101/NE301 captures images via timed snapshots or event triggers |
| OCR Recognition | OCR extension automatically extracts text from images |
| Result Display | Dashboard displays recognition results in real time, with history support |
| AI Chat Query | Query recognized text content using natural language |

---

## 2. Bill of Materials (BOM)

| Item | Specification | Qty | Purpose | Required |
|------|----------|------|------|------|
| **Smart Camera** | NE101 or NE301 | 1+ | Image capture | ✅ |
| **NeoMind Platform** | v0.8.0+ | 1 | Edge AI management | [Download](https://github.com/camthink-ai/NeoMind/releases/latest) ✅ |

---

## 3. Prerequisites

### 3.1 NeoMind Installation and Configuration

Complete the NeoMind installation, registration, and basic configuration first. For detailed steps, refer to [NeoMind Quick Start](../user-guide/1-install-setup.md).

### 3.2 Device Onboarding

Register your NE101 or NE301 to the NeoMind platform:

1. Navigate to the **Device Management** page in NeoMind
2. Click **Add Device** and select the device type (NE101 or NE301)
3. Enter the Device ID and MQTT topic
4. Save and wait for the device to come online

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-0.png)

> For detailed device onboarding steps, refer to [NeoMind Quick Start - Device Management](../user-guide/3-onboard-device.md).

---

## 4. Install the OCR Extension

**Step 1**: Navigate to the **Extensions** management page and find the **OCR** extension
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-2.png)

**Step 2**: Click Install
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-3.png)

**Step 3**: After installation, enable the extension
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-1.png)

---

## 5. Dashboard Configuration and Device Binding

### 5.1 Create a Dashboard

Navigate to the **Dashboard** management page and click **Create Dashboard**.

### 5.2 Add OCR Panel and Bind Device

In the dashboard, click **Add Panel**, select the **OCR** extension type, and bind the target device:

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-1.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-2.png" style={{width: '50%'}} />
</div>

Once bound, the OCR panel will automatically receive and process images captured by the device:

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-3.png)

You can add other widgets to the Dashboard page for additional data and content display.

---

## 6. Trigger Test and View Results

### 6.1 Trigger Capture Test

After binding the device, you can manually trigger a capture to verify OCR recognition. Once the device captures an image, the OCR extension will automatically perform text recognition.

### 6.2 View Recognition Results

In the OCR panel on the dashboard, you can view real-time recognition results, including the original image and extracted text:

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-4.png)

### 6.3 View Recognition History

In the device details, you can view all historical OCR recognition records, including the original image and extraction results for each recognition:
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-0.png)

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-3.png" style={{width: '50%'}} />
</div>

---

## 7. AI Chat Query

Once OCR recognition results are stored, you can query recognized text content via **AI Chat** using natural language. For example:

```
Hello, what's the OCR result of my device ne301-new? Reply in English.
```

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/ai-chat-test.png)

> **Tip**: AI Chat requires an LLM backend (e.g., Ollama). For configuration, refer to [NeoMind Quick Start](../user-guide/1-install-setup.md) or [Configure LLM Backend](../user-guide/2-configure-llm.md).

---

*Last updated: 2026-06-15*
