---
description: Hardware, operating system, network port, and runtime requirements for NeoMind desktop and server deployment, including recommended local LLM setups (built-in model, Ollama).
keywords: [NeoMind, system requirements, deployment, hardware, built-in model, Ollama]
tags: [NeoMind, Product Overview]
---

# System Requirements

NeoMind runs on desktop (macOS / Windows / Linux) or servers. Below are the requirements for each deployment mode.

## Package Sizes & Resource Footprint

### Download Sizes (GitHub Releases)

| Artifact | Size | Notes |
|----------|------|-------|
| **Server binary** (tar.gz) | ~27–30 MB | `neomind` + `neomind-extension-runner` bundled; per-platform |
| **Web frontend** (tar.gz) | ~4.4 MB | Static assets (HTML/JS/CSS), served by the backend |
| **macOS Desktop** (.dmg) | ~41 MB | Tauri app — bundles backend + frontend + system WebView |
| **Windows Desktop** (.msi) | ~42 MB | |
| **Linux Desktop** (.deb) | ~48 MB | |
| **Linux AppImage** | ~117 MB | Fully self-contained — includes all system libraries |

> **Total server footprint**: ~35 MB on disk (binary + web assets). No Docker layers, no pip/npm runtime — a single statically compiled binary plus static files.

### Runtime Resource Usage

The main process embeds the API server, MQTT broker, redb storage, and rule engine in one binary. Extensions run in separate processes.

| Component | RAM (typical) | Notes |
|-----------|---------------|-------|
| **Main process** | 50–150 MB | Axum + MQTT broker + redb. Scales with device count and telemetry volume. |
| **Extension runner** | 10–50 MB per extension | ML models are lazy-loaded (first command → load → stay resident). A YOLOv8n model adds ~50 MB when active. |
| **Telemetry storage** | grows with data | redb file at `data/telemetry.redb`. ~1 KB per data point. Retention is configurable. |

:::tip No external dependencies
NeoMind does **not** require PostgreSQL, Mosquitto, Redis, or any other external service. The only optional external dependency is an LLM — the built-in model downloads locally with one click (fully offline); you can also use [Ollama](https://ollama.ai) or a cloud API key.
:::

## Desktop App (Recommended for Getting Started)

Download the installer from [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest).

| OS | Architecture | Format |
|----|--------------|--------|
| macOS | Apple Silicon (arm64) | `.dmg` |
| Windows | x86_64 | `.msi` / `.exe` |
| Linux | x86_64 / arm64 | `.AppImage` / `.deb` / `.rpm` |

> Official pre-built packages cover only the architectures above. For other platforms (e.g. macOS Intel / Windows ARM), [build from source](../user-guide/1-install-setup.md#build-from-source-development).

**Minimum hardware**:

- CPU: 2 cores (4 recommended)
- RAM: **4 GB** baseline; **8 GB+** recommended when running a local LLM
- Disk: 1 GB install + data storage (see below)

## Server Deployment

### Supported Operating Systems

- **Linux** (x86_64 / arm64): requires glibc ≥ 2.35 — Ubuntu 22.04+, Debian 12+, openEuler 24.03+, Deepin 23+, UOS V25+; for older or unlisted distros (CentOS 7/8, Kylin V10, UOS V20, Alpine, etc.) use [Docker deployment](../user-guide/1-install-setup.md#docker)
- **Edge devices (arm64)**: NVIDIA Jetson (Orin series, with the CUDA runtime auto-bootstrapped), RK3576, and other aarch64 SBCs — arm64 builds are available for both the server and extensions
- **macOS**: 12 Monterey+ (development or small-scale deployment)
- **Windows**: Windows 10 / Server 2019+ (via WSL2 or native)

### Hardware Recommendations

| Scenario | CPU | RAM | Disk | Notes |
|----------|-----|-----|------|-------|
| Light (rules only / cloud LLM) | 2 cores | 2 GB | 10 GB | No local model |
| **Recommended (local LLM)** | 4 cores | **8 GB** | 20 GB+ SSD | Runs 4B models like Qwen3.5-4B; **the doc-recommended MiniCPM5-2B (1.5GB, Apache-2.0 open license) runs from 3 GB** — LFM2.5-2.6B (the platform-default download) is an alternative at the same tier, but note its custom LFM license: review the terms for commercial use |
| Multi-device / vision pipeline | 8 cores | 16 GB | 50 GB+ SSD | Multi-stream video + YOLO/OCR extensions |

> **GPU**: Not required. Local LLM and vision inference run primarily on the **built-in model (llama.cpp runtime)** — pure CPU works, and a GPU (CUDA / Metal / Vulkan) accelerates automatically. The optional Ollama route behaves the same way (CPU works, GPU auto-accelerates). See [Local LLM and Vision Inference Requirements](#local-llm-and-vision-inference-requirements) for model and memory details.

### Network Ports

| Port | Protocol | Purpose | Configurable |
|------|----------|---------|--------------|
| **9375** | HTTP | Backend API + Web UI (default `neomind-cli serve` port) | `--port` / `PORT` env var |
| **1883** | MQTT | Embedded MQTT broker (device onboarding) | Config file |
| 29375 | HTTP | Built-in model inference server (llama-server, localhost 127.0.0.1 only) | Config file |
| 80 / 443 | HTTP(S) | Reverse proxy (optional, nginx) | nginx config |

> For production, use an nginx reverse proxy and expose only 80/443 externally; keep 9375 / 1883 on the internal network.

### Docker Deployment Requirements

| Item | Requirement |
|------|-------------|
| Image | `camthink/neomind:latest` (multi-arch amd64 + arm64, built per release) |
| Ports | `9375` (HTTP API + Web UI), `1883` (MQTT) |
| Data persistence | volume `neomind-data` (mounted at `/app/data`) |
| Local LLM | the image is built with the llama.cpp runtime and a default curated model **LFM2.5-2.6B** pre-downloaded (from the official HuggingFace repo, SHA-256 verified; build arg switches to Qwen3.5-4B / Gemma4-E2B or `none` to skip); the catalog's default download is also LFM2.5-2.6B (custom LFM license — review terms for commercial use), and **the doc-recommended model is MiniCPM5-2B (Apache-2.0)** — switching in the wizard is one click (reserve 4-8 GB disk + RAM). Note: the volume initializes from image content on first run; a bind-mounted `/app/data` skips the pre-bundled model — use the download API instead |

See [Install & Setup — Docker](../user-guide/1-install-setup.md#docker).

### Edge Devices

- **NG4500 AI Box**: the officially recommended edge host — deploy NeoMind and local models out of the box, see the [NG4500 series docs](../../neoedge-ng4500-series/overview)
- **NVIDIA Jetson** (Orin series): CUDA runtime auto-bootstrapped; budget 8 GB+ VRAM for vision pipelines (YOLO / DeepStream)
- **aarch64 SBCs like RK3576 / Raspberry Pi 5**: server and extensions ship arm64 builds (Ubuntu / Debian family, glibc ≥ 2.35). **The main gate is memory**: 3 GB runs MiniCPM5-2B / LFM2.5-2.6B (CPU-only), 8 GB boards can step up to Qwen3.5-4B; for vision inference prefer the small model tier
- Memory-constrained boxes: use a 2-3B local model and run vision inference on a separate machine

### Runtime Dependencies

Server deployment **requires no manual dependency installation** — the install script downloads statically compiled binaries. Optional components:

- **None (default)**: The Docker deployment image ships the llama.cpp runtime and the default model LFM2.5-2.6B (in place on first volume run, no download needed) — see Docker requirements below
- **Ollama** (optional, if you already have it): for local LLM inference. Install at [ollama.com](https://ollama.com). Pull a model the first time you configure an LLM backend, e.g. `ollama pull qwen3.5:4b`
- **Docker** (optional): one-line deploy via `docker compose up -d`
- **nginx** (optional): production reverse proxy + static frontend hosting

## Local LLM and Vision Inference Requirements

Local inference in NeoMind runs on the **built-in model**: the platform ships a llama.cpp runtime, models are downloaded on demand from the catalog, and the inference server spawns automatically — **CPU-only works, and a GPU (CUDA / Metal / Vulkan) accelerates automatically**.

**LLM (text inference)**

| Model | Size | Min RAM | Context | Notes |
|---|---|---|---|---|
| **MiniCPM5-2B** (doc-recommended) | 1.6GB | 3GB | 128K | Apache-2.0 open license, commercial-friendly |
| LFM2.5-2.6B (platform default download) | 1.5GB | 3GB | 128K | Custom LFM license — review terms for commercial use |
| Qwen3.5-4B | 2.7GB | 4.8GB | 128K | Strongest agent capabilities with 4GB+ RAM |
| 3 more | — | — | 128K | Gemma4-E2B / Nanbeige4.2-3B / Ling-3.0-tiny — see the backend card catalog |

- Reserve 4-8 GB of disk (model + KV cache); context defaults to 128K, auto-capped to available RAM — keep ≥32K for long sessions
- Switch models anytime on the LLM backend card, or import your own GGUF (context capped at 128K)

**Vision inference (VLM, separate model)**

- **MiniCPM-V-4.7-1B**: 0.7GB, minimum 2.4GB RAM, 32K context — **independent of the text model and downloaded separately**, fetched automatically the first time you use vision features (image upload in AI Chat / camera-frame analysis by Agents)
- Beyond the main weights it also fetches an mmproj projection file and spawns a separate vision companion instance; when vision is unused it consumes nothing
- Coexists with the text model: text on MiniCPM5-2B / LFM2.5-2.6B, vision on MiniCPM-V

> The optional Ollama route behaves the same way: CPU-only works, GPUs accelerate automatically; a broader model ecosystem, but installation and licensing are self-managed.

## Data Storage

NeoMind uses embedded storage — **no external database** is needed. The data directory defaults to `data/` and contains:

| File / Dir | Purpose |
|------------|---------|
| `telemetry.redb` | Time-series telemetry (all device metrics) |
| `sessions.redb` | User sessions |
| `devices.redb` / `dashboards.redb` / `rules.redb` / `agents.redb` | Per-domain primary data |
| `messages.redb` | Notification delivery records |
| `memory/` | Agent memory files (Markdown) |
| `skills/` | Skill definitions (YAML + Markdown) |
| `extensions/` | Extension binaries and config |
| `logs/` | Runtime logs |

The data directory can be customized via env vars or install script params (see [Install & Setup](../user-guide/1-install-setup.md)).

## Development Environment

Building from source requires:

| Tool | Version | Purpose |
|------|---------|---------|
| **Rust** | 1.85+ (toolchain pinned to 1.92.0) | Backend |
| **Node.js** | 20+ | Frontend |
| **Ollama** (optional) | any | Local LLM (or use built-in models / connect a cloud model) |

```bash
# Backend
cargo build && cargo test && cargo run -p neomind-cli -- serve

# Desktop / frontend
cd web && npm install && npm run tauri:dev
```

See [Developer Guide](../developer-guide/1-overview.md) for details.

## LLM Backend Requirements

NeoMind supports four LLM backend categories — pick by deployment shape:

- **Built-in models (recommended)**: no Ollama or Docker install needed — one-click download in the setup wizard. For model selection, memory and disk requirements see [Local LLM and Vision Inference Requirements](#local-llm-and-vision-inference-requirements).
- **Ollama** (optional): if you already run Ollama (default model `qwen3.5:4b`). The host needs enough RAM to load the model.
- **llama.cpp** (optional): bring your own llama.cpp server or use the built-in runtime — a good fit if you have your own GGUF models.
- **Cloud**: OpenAI / Anthropic / Google / xAI / Qwen / DeepSeek / GLM / MiniMax and other OpenAI-compatible endpoints. Requires an API key and outbound network access.

See [Configure LLM Backend](../user-guide/2-configure-llm.md) for setup.

---

*Last updated: 2026-10-21*
