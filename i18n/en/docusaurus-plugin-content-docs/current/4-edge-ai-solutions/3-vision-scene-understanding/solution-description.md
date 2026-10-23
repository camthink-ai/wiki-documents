---
title: Solution Description
sidebar_label: "Solution Description"
sidebar_position: 1
description: "Vision LLM scene understanding built on NeoEyes cameras and the NeoMind AI Agent: define vision tasks with prompts, let a multimodal model turn site imagery into structured JSON metrics — fully local networking, live dashboards."
---

<img src="https://resources.camthink.ai/NeoMind/llm-image-solution/site-demo-v2.gif" alt="Live demo: a capture arrives, the Site Safety Patrol Agent runs the vision LLM automatically, and people-count cards, the trend chart, the image stream and execution records refresh in real time" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

*Live demo: a capture arrives → the Agent runs the vision LLM automatically → people-count cards, trend chart, image stream and execution records refresh in real time (3× speed).*

## Background

The most common way to deploy vision AI on site is to pair each recognition target with a **fixed model**: OCR for meter dials, YOLO for hard hats, face recognition for staff. These models deliver high accuracy and low latency, but they carry two inherent limitations:

- **One target, one model**: every new recognition requirement — say, moving from "detect hard hats" to "judge whether they are worn correctly" — means a new round of data collection, labeling, training, quantization and deployment. The iteration cost of long-tail scenarios never comes down.
- **Recognizes but never understands**: fixed models output classes and bounding boxes. They cannot answer open questions like "what is happening on site right now", "is there any risk", or "what should be done next".

Cloud vision APIs solve the "understanding" problem, but images leave the intranet. In factories, farms and warehouses, sending raw footage to a third party often fails security review — on top of per-call billing and the operational risk of external dependencies.

## Solution Overview

The idea behind this solution: **define the vision task in a prompt, and let a multimodal large model on-premises "read" the scene into structured data.**

Deploy a CamThink **NeoEyes** camera at each point of interest — the low-power battery **NE101** (4×AA batteries, years of runtime), the modular edge-AI **NE301** (0.6 TOPS, runs on-device detection to filter before upload), or the mini integration **NE302** (magnetic mount). Cameras capture images on a schedule or by event and send them over Wi-Fi / Cat.1 / PoE to a local **NG4500 AI Box**. Inside the box, the **NeoMind platform** hands every incoming frame to an AI Agent, which calls a vision LLM (e.g. local Ollama MiniCPM-V, or a cloud vision API) to interpret the image according to your prompt, and lands the result as **schema-validated structured JSON fields** — people counts, violation types, fill levels, readings — virtual metrics written into the time-series store and rendered live on dashboards.

The whole pipeline is a three-step loop: **camera captures → LLM interprets per prompt → structured fields land in the store and on dashboards.** All model interaction happens on the NG4500: with a local vision model, **images and results never leave the premises**. When stronger reasoning is needed, an Agent can bind a cloud vision backend individually — a hybrid deployment on demand.

```mermaid
flowchart LR
  subgraph Site
    A[NE101 / NE301 / NE302<br/>scheduled or event-triggered capture]
  end
  A -->|Wi-Fi / HaLow / Cat.1 / PoE| B
  subgraph Local NG4500 AI Box
    B[NeoMind platform<br/>device ingestion - image storage]
    B --> C[AI Agent<br/>event / cron / manual trigger]
    C --> D[Vision LLM analysis<br/>local VLM or cloud API]
    D --> E[Structured JSON fields<br/>schema-validated]
    E --> F[Virtual metrics - time-series store]
  end
  F --> G[Live dashboards]
  F --> H[Data Push / OpenAPI / alerting]
```

The prompt is the task: hard-hat inspection, shelf compliance checks, bin overflow monitoring, meter reading verification, workstation presence detection… One platform, one pipeline — **change a prompt and a few output fields, and you have a new vision application**, with no model retraining involved.

## Solution Composition (BOM)

| # | Component | Model / Spec | Qty | Role |
|---|---|---|---|---|
| 1 | Edge AI camera | NeoEyes **NE101** (battery, long runtime) / **NE301** (edge AI, modular) / **NE302** (mini integration) | 1 per point | Scheduled or event-triggered capture, images uplinked over MQTT |
| 2 | Edge compute host | **NG4500 AI Box** | 1 per site | Runs the NeoMind platform: device ingestion, image storage, Agent orchestration, time-series store, dashboards |
| 3 | Vision LLM | Local Ollama (**MiniCPM-V** etc.) or cloud VLM API (GPT-5 / Claude / Gemini / Qwen3-VL) | 1 set | Interprets images per prompt; local keeps data on-prem, cloud is stronger — mix per Agent |
| 4 | NeoMind platform | Bundled in NG4500 | — | Device onboarding, AI Agents, virtual metrics, automation rules, Data Push / OpenAPI |
| 5 | Power & network accessories | Batteries / mounts / PoE switch / SIM cards | as needed | Camera deployment kit |

Starter configuration: **3–5 cameras + 1 NG4500 + one local vision model** runs the full pipeline; adding points only means adding cameras. Full selection comparison, network topology and deployment steps in the [Engineering Guide](./engineering-guide).

## How It Works

1. **Capture & uplink** — NeoEyes cameras capture on schedule / sensor trigger / remote command and report images to NeoMind over MQTT
2. **Agent trigger** — a new frame fires the event-triggered Agent (cron and manual execution also available); the image is injected into the analysis context automatically
3. **Vision understanding** — the multimodal LLM analyzes the frame per the prompt: describe the scene, identify targets, judge states, conclude and recommend
4. **Structured ingestion** — output fields pass schema validation (Number / Text / Boolean / Enum) and land as `ai:{agent_id}:{field}` virtual metrics in the time-series store; the full reasoning chain (collect → reason → decide → conclude) is archived as JSON
5. **Visualize & integrate** — dashboards show the latest conclusions and trends; anomalies trigger alert notifications, and data reaches business systems via Data Push / OpenAPI

## Key Features

- **Prompt is the task**: no code, no retraining — switch analysis targets by editing the prompt and output fields; new scenarios go live the same day
- **Open-ended understanding**: more than detection — describes the scene, judges anomalies, explains causes, recommends actions; from "recognizing" to "understanding"
- **Data stays local**: vision models can run fully on-premises (Ollama); images, results and memory all remain on the NG4500 — intranet-only deployment with zero egress
- **Results become metrics**: LLM output passes schema validation and lands directly as time-series virtual metrics — trends, comparisons, alert rules and dashboards all work out of the box
- **Full audit trail**: every analysis binds the original capture with its complete reasoning JSON — conclusions are traceable and auditable
- **One platform, three cameras**: NE101 (battery, years of life), NE301 (edge AI + modularity), NE302 (mini integration) onboarded uniformly; pick per site conditions

## Outcomes

- Vision requirements move from "a model development cycle" to "writing a prompt" — pilot and switch costs for long-tail scenarios drop dramatically
- Conclusions land automatically and appear on dashboards in real time; inspection shifts from watching footage to watching trends
- Imagery and results stay inside the local network, meeting compliance requirements in factories, agriculture and warehousing
- Recognition quality depends on prompt quality, image clarity and model capability — validate on site before go-live; LLM judgments are probabilistic, so keep a human review channel for business-critical decisions

The following are live results from the NeoMind demo environment (construction-site PPE inspection): a structured Agent outputs people count, compliance count and violation type for every captured frame — fields become time-series metrics directly, shown alongside the capture stream.

<img src="https://resources.camthink.ai/NeoMind/llm-image-solution/dash-site-v3.png" alt="Site Safety Patrol dashboard: people/helmet status cards, trend chart, live agent execution monitor and capture history" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

The same pipeline with a different prompt and output fields yields the retail shelf audit and waste-container monitoring dashboards:

<img src="https://resources.camthink.ai/NeoMind/llm-image-solution/dash-shelf-v3.png" alt="Shelf Audit dashboard: empty-slot/facing cards, stockout trend, live agent execution monitor and shelf captures" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

<img src="https://resources.camthink.ai/NeoMind/llm-image-solution/dash-bin-v3.png" alt="Bin Fill Check dashboard: fill-score card, overflow trend, live agent execution monitor and bin captures" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

## Learn More

- [Engineering Guide: selection / networking / setup / integration / operations](engineering-guide)
- [NeoMind use case: camera AI pipeline and Agent vision analysis](../../neomind/use-cases/camera-ocr)
- [NeoMind platform documentation](../../neomind/product-overview/what-is-neomind)
- [NeoEyes NE101 overview](../../neoeyes-ne101-series/overview) · [NE301](../../neoeyes-ne301-series/overview) · [NE302](/docs/neoeyes-ne302-series/ne302-overview)
