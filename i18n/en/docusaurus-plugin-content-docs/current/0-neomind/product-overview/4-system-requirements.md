---
description: Hardware, operating system, network port, and runtime requirements for NeoMind desktop and server deployment, including recommended local LLM (Ollama) configurations.
keywords: [NeoMind, system requirements, deployment, hardware, Ollama]
tags: [NeoMind, Product Overview]
---

# System Requirements

NeoMind runs on desktop (macOS / Windows / Linux) or servers. Below are the requirements for each deployment mode.

## Package Sizes & Resource Footprint

### Download Sizes (GitHub Releases)

| Artifact | Size | Notes |
|----------|------|-------|
| **Server binary** (tar.gz) | ~23–26 MB | `neomind` + `neomind-extension-runner` bundled; per-platform |
| **Web frontend** (tar.gz) | ~5.4 MB | Static assets (HTML/JS/CSS), served by the backend |
| **macOS Desktop** (.dmg) | ~39 MB | Tauri app — bundles backend + frontend + system WebView |
| **Windows Desktop** (.msi) | ~39 MB | |
| **Linux Desktop** (.deb) | ~43 MB | |
| **Linux AppImage** | ~112 MB | Fully self-contained — includes all system libraries |

> **Total server footprint**: ~30 MB on disk (binary + web assets). No Docker layers, no pip/npm runtime — a single statically compiled binary plus static files.

### Runtime Resource Usage

The main process embeds the API server, MQTT broker, redb storage, and rule engine in one binary. Extensions run in separate processes.

| Component | RAM (typical) | Notes |
|-----------|---------------|-------|
| **Main process** | 50–150 MB | Axum + MQTT broker + redb. Scales with device count and telemetry volume. |
| **Extension runner** | 10–50 MB per extension | ML models are lazy-loaded (first command → load → stay resident). A YOLOv8n model adds ~50 MB when active. |
| **Telemetry storage** | grows with data | redb file at `data/telemetry.redb`. ~1 KB per data point. Retention is configurable. |

:::tip No external dependencies
NeoMind does **not** require PostgreSQL, Mosquitto, Redis, or any other external service. The only optional external dependency is an LLM — either [Ollama](https://ollama.ai) running locally, or a cloud API key.
:::

## Desktop App (Recommended for Getting Started)

Download the installer from [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest).

| OS | Architecture | Format |
|----|--------------|--------|
| macOS | Apple Silicon (arm64) | `.dmg` |
| Windows | x86_64 | `.msi` / `.exe` |
| Linux | x86_64 / arm64 | `.AppImage` / `.deb` |

> Official pre-built packages cover only the architectures above. For other platforms (e.g. macOS Intel / Windows ARM), [build from source](../user-guide/1-install-setup.md#build-from-source-development).

**Minimum hardware**:

- CPU: 2 cores (4 recommended)
- RAM: **4 GB** baseline; **8 GB+** recommended when running a local LLM
- Disk: 1 GB install + data storage (see below)

## Server Deployment

### Supported Operating Systems

- **Linux**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / other mainstream distros (x86_64 / arm64)
- **macOS**: 12 Monterey+ (development or small-scale deployment)
- **Windows**: Windows 10 / Server 2019+ (via WSL2 or native)

### Hardware Recommendations

| Scenario | CPU | RAM | Disk | Notes |
|----------|-----|-----|------|-------|
| Light (rules only / cloud LLM) | 2 cores | 2 GB | 10 GB | No local model |
| **Recommended (local LLM)** | 4 cores | **8 GB** | 20 GB+ SSD | Runs `qwen3.5:4b` and similar small models |
| Multi-device / vision pipeline | 8 cores | 16 GB | 50 GB+ SSD | Multi-stream video + YOLO/OCR extensions |

> **GPU**: Not required. Local LLM and vision inference run via Ollama (CPU mode); when a GPU is present, Ollama auto-accelerates.

### Network Ports

| Port | Protocol | Purpose | Configurable |
|------|----------|---------|--------------|
| **9375** | HTTP | Backend API + Web UI (default `neomind-cli serve` port) | `--port` / `PORT` env var |
| **1883** | MQTT | Embedded MQTT broker (device onboarding) | Config file |
| 80 / 443 | HTTP(S) | Reverse proxy (optional, nginx) | nginx config |

> For production, use an nginx reverse proxy and expose only 80/443 externally; keep 9375 / 1883 on the internal network.

### Runtime Dependencies

Server deployment **requires no manual dependency installation** — the install script downloads statically compiled binaries. Optional components:

- **Ollama** (recommended): local LLM inference. Install at [ollama.com](https://ollama.com). Pull a model the first time you configure an LLM backend, e.g. `ollama pull qwen3.5:4b`
- **Docker** (optional): one-line deploy via `docker compose up -d`
- **nginx** (optional): production reverse proxy + static frontend hosting

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
| **Ollama** | any | Local LLM (or connect a cloud model) |

```bash
# Backend
cargo build && cargo test && cargo run -p neomind-cli -- serve

# Desktop / frontend
cd web && npm install && npm run tauri:dev
```

See [Developer Guide](../developer-guide/1-overview.md) for details.

## LLM Backend Requirements

NeoMind supports multiple LLM backends in two deployment modes:

- **Local**: Ollama (recommended, `qwen3.5:4b` model). The host needs enough RAM to load the model.
- **Cloud**: OpenAI / Anthropic / Google / xAI / Qwen / DeepSeek / GLM / MiniMax and other OpenAI-compatible endpoints. Requires an API key and outbound network access.

See [Configure LLM Backend](../user-guide/2-configure-llm.md) for setup.

---

*Last updated: 2026-06-15*
