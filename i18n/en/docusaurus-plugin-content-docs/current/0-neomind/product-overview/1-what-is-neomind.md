---
description: NeoMind is an edge-deployed AI platform for IoT that runs LLM-powered agents directly on your hardware, connects to devices via MQTT/BLE/Webhook, automates responses through a rule engine, and visualizes everything on real-time dashboards.
keywords: [NeoMind, edge AI, IoT platform, AI agent, device management, automation]
tags: [NeoMind, Product Overview]
---

# What is NeoMind?

NeoMind is an **edge-deployed AI platform** that brings intelligence to IoT. It runs LLM-powered agents directly on your hardware, connects to devices via MQTT / BLE / Webhook, automates responses through a rule engine, and visualizes everything on real-time dashboards — all without relying on cloud services.

**Key idea**: Talk to your devices in natural language. The AI understands your intent, queries device states, creates automation rules, and takes action autonomously.

## Product at a Glance

Three core surfaces of NeoMind — manage your devices, visualize your data, and drive everything through natural language.

<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

<img src="https://resources.camthink.ai/NeoMind/v1021b/devices-overview.png" alt="Device management — unified MQTT/BLE/Webhook devices" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

<img src="https://resources.camthink.ai/NeoMind/v1021b/dashboard-overview.png" alt="Real-time dashboard — drag-and-drop builder, WebSocket live updates" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

<img src="https://resources.camthink.ai/NeoMind/v1021b/chat-overview.png" alt="AI Chat — query devices and create automations in natural language" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

</div>

---

## Product Architecture

NeoMind uses a **single-process, multi-layer** architecture — all core capabilities are packaged in one process, with no external database or message broker required. The built-in model is downloaded on demand with its inference server spawned automatically by the platform, and extensions run in mutually isolated processes.

```mermaid
flowchart TB
    CLIENT["Web · Desktop · CLI · Mobile-adaptive"]
    IM["IM Bridges<br/>Telegram · Feishu"]
    CHAT["AI Chat<br/>conversational · tool calls"]
    AGENT["AI Agent<br/>scheduled · event · structured"]
    LLM["LLM Backends<br/>Built-in (incl. vision) · Ollama · Cloud"]
    MEM["Memory & Skills"]
    DASH["Dashboards · Data Visualization"]

    API["REST API :9375"]
    MQTT["MQTT Broker :1883"]
    STORE[("Telemetry & Device Storage<br/>redb")]
    AUTO["Rule Engine · Transforms<br/>Data Push · Notifications"]

    EXT["Extensions — Process Isolated<br/>Vision AI · OCR · Voice · Industrial Protocols"]
    DEV["IoT Devices<br/>Cameras · Sensors · Controllers"]

    CLIENT --> CHAT
    CLIENT --> AGENT
    CLIENT --> DASH
    IM <--> CHAT
    CHAT --> LLM
    AGENT --> LLM
    AGENT --> MEM
    CHAT -->|tool calls| API
    AGENT -->|structured output| STORE

    DEV -->|MQTT| MQTT
    DEV -.->|Webhook / BLE| API

    MQTT --> STORE
    API --> STORE
    API --> AUTO
    API --> DASH
    STORE --> DASH

    API -.->|isolated process · FFI| EXT

    classDef clientNode fill:#dae8fc,stroke:#6c8ebf,color:#1a3d6b
    classDef aiNode fill:#e1d5e7,stroke:#9673a6,color:#3d1a4b
    classDef coreNode fill:#d5e8d4,stroke:#82b366,stroke-width:2.5px,color:#1f4d1f
    classDef autoNode fill:#fff2cc,stroke:#d6b656,color:#7d6400
    classDef extNode fill:#f5f5f5,stroke:#666,stroke-dasharray:6 3,color:#333
    classDef devNode fill:#f8cecc,stroke:#b85450,color:#6b1a1a

    class CLIENT clientNode
    class IM,CHAT,AGENT,LLM,MEM aiNode
    class API,MQTT,STORE coreNode
    class AUTO,DASH autoNode
    class EXT extNode
    class DEV devNode
```

:::tip Four Design Philosophies

1. **Single-Process, Self-Contained** — API, MQTT broker, storage, rule engine, and data push all live in one main process; the built-in model's inference server (llama-server) is spawned on demand as a child process, and vision models automatically get a vision companion. A single `cargo run` and everything is ready. No Docker compose, no external dependencies.

2. **Edge-First, Cloud-Optional** — The default local LLM is the built-in model (one-click download, ready out of the box; Ollama / llama.cpp / cloud backends also supported) for 100% offline operation — data never leaves your LAN. When you need more power, switch to cloud models (OpenAI / Claude / GLM) with one click.

3. **Small Models, Reliable Execution** — The platform wraps local small models (4B-class) in a full set of execution guardrails: the three agent execution shapes share one runtime, outputs are schema-validated into verifiable structured data, narration guards prevent "said but not done", and failure circuit breakers with self-healing keep unattended agents from running degraded. Runnable at the edge — and reliable.

4. **Crash-Isolated, Capability-Authorized Extensions** — Extensions are loaded by a dedicated extension-runner process (FFI), talk to the main service over an event stream, and are granted system interfaces by capability. A YOLO extension crashes? The main service and other extensions are completely unaffected.
   :::

> Want to go deeper into each layer's design? Read [Core Concepts](../concepts/2-core-concepts.md) — full breakdown of the data lifecycle, extension model, and agent execution loop.

---

## Why NeoMind?

| Feature | Description |
|---------|-------------|
| **Fully self-contained** | Embedded MQTT broker, redb storage, no external database or broker to install |
| **Type-safe end-to-end** | Rust backend with compile-time guarantees; agent CLI commands dispatch in-process with structured data, no fragile string parsing |
| **Crash-proof extensions** | Extensions run in isolated processes with capability-based permissions; a misbehaving extension never takes down the server |
| **Cloud-optional** | The default local LLM is the built-in model (one-click download, ready out of the box; Ollama / llama.cpp also supported) for 100% offline operation, or connect cloud models when you need more power |

## Core Capabilities

### AI Intelligence
- **Built-in local AI, zero setup** — one-click catalog model download on the backend card (LFM2.5 / MiniCPM5 / Qwen3.5, 8 models incl. the 0.7GB vision variant MiniCPM-V), no API key, no Ollama; GGUF import supported
- **Natural Language Chat** — Conversational interface to query and control all connected devices
- **Autonomous Agents** — Three execution shapes (scheduled / event / structured): the first two monitor, analyze, and act on device data independently; the structured shape schema-validates its output into `ai:{agent_id}:{field}` virtual metrics
- **10+ LLM Backends** — Built-in model (local, one-click download), Ollama, OpenAI, Anthropic, Google, xAI, Qwen, DeepSeek, GLM, MiniMax, and any OpenAI-compatible endpoint
- **Memory System** — Cross-session memory (user profile / knowledge base / procedures + execution journals), auto-extracted and persisted after each conversation
- **Skill System** — YAML + Markdown skill files that guide agent behavior for specific scenarios
- **Multimodal** — Image upload and visual analysis (built-in vision model MiniCPM-V, or Ollama / cloud vision models)

### Device Management
- **MQTT Protocol** — Primary device integration with embedded broker, mTLS, and CA certificate support
- **BLE Provisioning** — Zero-touch device setup via Bluetooth (Tauri native + Web Bluetooth)
- **HTTP / Webhook** — Flexible REST-based device adapter
- **Auto-Discovery** — Automatic device detection, type registration, and AI-assisted onboarding
- **Command Queue** — Send control commands to devices with parameter validation and tracking
- **Custom Device Types** — Define device metrics and commands via JSON type definitions

### Automation
- **JSON Rule Engine** — Structured rule definitions: `{"condition": {"condition_type": "comparison", "source": "device:sensor:temperature", "operator": "greater_than", "threshold": 30}}`
- **Data Transforms** — JavaScript-based data transformation for creating virtual metrics
- **AI agent execution** — Three shapes: scheduled, event-driven, or structured; ties into the rule engine (rules can trigger agents)
- **Event Bus** — Pub/sub architecture for decoupled component communication

### Dashboards & Visualization
- **Drag-and-Drop Builder** — Visual dashboard editor with responsive grid layout
- **Rich Widgets** — Value cards, line/bar/pie charts, Markdown display, image/video display and other built-in widget types; VLM vision and stream player are provided by extensions
- **Real-time Updates** — WebSocket / SSE for live data streaming to dashboards
- **Dashboard Sharing** — Public links with expiration
- **Custom Components** — Build and publish your own dashboard widgets

### Voice & Multimodal
- **Real-time voice assistant** — mic → VAD → ASR → LLM → TTS, fully local end-to-end
- **ASR / TTS** — SenseVoice 5-language ASR; three interchangeable TTS engines incl. voice cloning
- **Vision AI extensions** — object detection, OCR, face recognition, visual grounding, video VLM

### Industry & Protocol Integrations
- **Industrial protocols** — Modbus / OPC-UA / BACnet bridges for PLCs, meters, and BACnet controllers
- **LoRaWAN** — ChirpStack / TTN sensor auto-discovery with downlink control
- **Home Assistant** — two-way sync with 3000+ smart-home entities

### Notification & Data Push
- **7 Notification Channels** — Webhook, Email, Telegram, WeCom, DingTalk, Slack, Feishu, plus the in-app notification center
- **IM Bridges** — Chat with AI agents directly in Telegram / Feishu (independent from the notification channels)
- **Data Push** — Forward telemetry data to external systems via Webhook or MQTT
- **Delivery Tracking** (Data Push) — Exponential backoff retry, delivery history, and log management
- **Message Deduplication** — Prevent notification storms from high-frequency triggers

### Platform
- **Multi-Instance** — Connect to and manage multiple NeoMind backends from a single interface
- **Extension System** — Native & WASM extensions with process isolation and capability-based permissions
- **Cross-Platform Desktop** — macOS, Windows, Linux native apps via Tauri
- **Mobile-Friendly Web** — Responsive web UI optimized for phone and tablet
- **i18n** — English and Chinese
- **Dark Mode** — System-aware dark/light theme
- **API Key Auth** — Alternative to JWT for programmatic access
- **CLI Tools** — Full-featured command-line interface

## Ecosystem

NeoMind is a modular ecosystem with specialized repositories for each concern:

| Repository | Purpose |
|------------|---------|
| **[NeoMind](https://github.com/camthink-ai/NeoMind)** | Core platform — backend, frontend, desktop app |
| **[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)** | Official extension marketplace — weather, YOLO detection, OCR, face recognition, streaming |
| **[NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)** | Device type definitions — standardized metrics and commands for IoT hardware |
| **[NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)** | Dashboard widget marketplace — community-contributed React components |

## Who It's For

- **IoT integrators / solution engineers** — Need to rapidly build edge intelligent solutions connecting cameras, sensors, and controllers with automation
- **Industrial / campus / retail operators** — Want to manage devices, configure alerts, and visualize data in natural language
- **Secondary developers** — Extend the platform via the Extension SDK, custom device types, or dashboard components
- **AI application engineers** — Run multimodal LLM agents at the edge, connected to real physical devices

## Next Steps

- [5-Minute Quick Start](../quick-start/1-five-minute-guide.md) — Experience the core loop in record time
- [Core Concepts](../concepts/2-core-concepts.md) — Understand the system overview and data flow
- [Glossary](../concepts/1-glossary.md) — Central definitions for all core terminology
- [Install & Setup](../user-guide/1-install-setup.md) — Get NeoMind running on desktop or server
- [Configure LLM Backend](../user-guide/2-configure-llm.md) — Connect Ollama or cloud models
- [Onboard a Device](../user-guide/3-onboard-device.md) — Use the onboarding wizard
- [AI Agent](../user-guide/6-ai-agent.md) — Create autonomous agents
- [Automation Rules](../user-guide/7-automation-rules.md) — JSON rule engine
- [Extensions](../user-guide/9-extensions.md) — Install vision AI / OCR extensions
- [Developer Guide Overview](../developer-guide/1-overview.md) — Start from one of four dimensions: device types / extensions / dashboard components / main project
- [Use Cases](../use-cases/1-object-detection.md) — End-to-end scenario examples

---

*Applies to: v1.2.x (Oct 2026)*

*Last updated: 2026-10-21*
