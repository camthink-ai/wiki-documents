---
description: Complete install flow for NeoMind on desktop (macOS/Windows/Linux) or server, covering one-line script, Docker, manual install, nginx reverse proxy, and development setup.
keywords: [NeoMind, install, deploy, Docker, one-line script, first-run setup]
tags: [NeoMind, User Guide]
---

# Install & Setup

NeoMind ships in three deployment modes: **Desktop App** (recommended for getting started), **Server one-line install**, and **Build from source**. None require an external database or message broker.

> For hardware requirements, package sizes, and runtime resource usage, see [System Requirements](../product-overview/4-system-requirements.md).

## Desktop App

### Download

Grab the installer for your platform from [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest):

| Platform | Architecture | Format |
|----------|-------------|--------|
| macOS | Apple Silicon (arm64) | `.dmg` |
| Windows | x86_64 | `.msi` / `.exe` |
| Linux | x86_64 / arm64 | `.AppImage` / `.deb` |

> Official pre-built packages cover only the architectures above. For other platforms (e.g. macOS Intel / Windows ARM), [build from source](#build-from-source-development).

:::note macOS First Launch
NeoMind is not distributed via the Mac App Store, so Gatekeeper may block the first launch ("cannot be opened" or "from an unidentified developer"). Choose one of these methods to bypass:

```bash
# Option 1: Remove quarantine attribute via Terminal (recommended, fastest)
xattr -cr /Applications/NeoMind.app
```

```bash
# Option 2: System Settings → Privacy & Security → Open Anyway
# Double-click the app to trigger the block, then go to
# "System Settings → Privacy & Security" and click "Open Anyway"
```
:::

### First-Launch Wizard

On first launch, NeoMind runs a **setup wizard** with four steps (skippable at any point — you can finish the setup later in Settings):

1. **Welcome** — platform introduction and documentation links
2. **LLM Backend** — configure the AI model: **one-click download of built-in models** (no API key needed), connect a custom backend (OpenAI/Ollama, etc.), or quick setup via the CLI
3. **Devices** — connect/approve devices
4. **Done** — enter the main UI

> Skipping LLM configuration is fine — the first time you use AI Chat or create an Agent, the system guides you through it again. For details on built-in local models, see [Configure LLM Backend](./2-configure-llm.md).

## Server One-Line Install (Linux / macOS)

The fastest server install:

```bash
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | sh
```

The install script:

- Downloads statically compiled `neomind` and `neomind-extension-runner` binaries to `/usr/local/bin`
- Deploys frontend static assets to `/var/www/neomind`
- Registers a systemd service (`neomind.service`) for auto-start on boot
- Listens on `http://your-server:9375` by default

After install, open `http://your-server:9375` in a browser and complete the first-run setup.

### Install Options (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `VERSION` | latest | Specific version, e.g. `0.9.23` |
| `INSTALL_DIR` | `/usr/local/bin` | Binary install directory |
| `DATA_DIR` | `/var/lib/neomind` | Data directory (redb files, logs) |
| `WEB_DIR` | `/var/www/neomind` | Frontend static files |
| `PORT` | `9375` | Backend API port |
| `NO_WEB` | `false` | `true` = backend only, skip frontend |
| `NO_SERVICE` | `false` | `true` = skip systemd registration |
| `USE_NGINX` | `false` | `true` = auto-configure nginx reverse proxy on port 80 |

Examples:

```bash
# Pin a version
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | VERSION=0.9.23 sh

# Custom directories
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | INSTALL_DIR=~/.local/bin DATA_DIR=~/.neomind sh

# Enable nginx reverse proxy (port 80)
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | USE_NGINX=true sh
```

### Upgrade

- **In-browser upgrade (recommended)**: `Settings → About` automatically checks for new versions (every 24 hours; an update icon appears in the top-right corner when an update is available). Click to upgrade online — the system automatically downloads, verifies, backs up, and restarts, with no SSH needed at any point (this relies on helper systemd units deployed by install.sh; older installs can get them by rerunning the install script once).
- **Rerun the install script**: `VERSION=0.9.23 sh install.sh` reinstalls a pinned version.
- **Docker**: `docker compose pull && docker compose up -d`.

For automatic data-directory backups, see [Troubleshooting](./10-troubleshooting.md).

## Docker

The official multi-arch build image (amd64 + arm64, rebuilt on every release) is published on Docker Hub — **no repo clone, no Rust toolchain needed**:

```bash
docker run -d --name neomind \
  -p 9375:9375 -p 1883:1883 \
  -v neomind-data:/app/data \
  camthink/neomind:latest
```

Or use Docker Compose (pulls `camthink/neomind:latest` automatically):

```bash
mkdir neomind && cd neomind
curl -fsSLO https://raw.githubusercontent.com/camthink-ai/NeoMind/main/docker-compose.yml
docker compose up -d
```

Single-container deployment — backend API, MQTT broker, and Web UI all run in one image. Data persists via the `neomind-data` volume. The image ships with the llama.cpp runtime and curated models — download a local LLM with one click in the setup wizard.

| Image | Purpose |
|------|------|
| `camthink/neomind:latest` | Follows the latest release |
| `camthink/neomind:<version>` | Pin a version, e.g. `camthink/neomind:0.9.22` |

| Port | Purpose |
|------|---------|
| `9375` | HTTP API + Web UI + WebSocket |
| `1883` | MQTT broker (device connections) |

Customize ports and other parameters via `.env` ([`.env.example`](https://github.com/camthink-ai/NeoMind/blob/main/.env.example)):

```bash
cp .env.example .env
# Edit NEOMIND_HTTP_PORT / NEOMIND_MQTT_PORT / RUST_LOG / TZ, etc.
docker compose up -d
```

Visit `http://host:9375` after deploy.

## Manual Installation

For environments where the one-line script can't run (air-gapped servers, custom directory layouts):

```bash
VERSION=0.9.23  # Replace with your target version

# Pick your platform (amd64 or arm64)
ARCH=amd64  # Linux x86_64; use arm64 for ARM devices

# Download
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-server-linux-${ARCH}.tar.gz
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-web-${VERSION}.tar.gz

# Install binaries
tar xzf neomind-server-linux-${ARCH}.tar.gz
sudo install -m 755 neomind /usr/local/bin/
sudo install -m 755 neomind-extension-runner /usr/local/bin/

# Deploy frontend
sudo mkdir -p /var/www/neomind
sudo tar xzf neomind-web-${VERSION}.tar.gz -C /var/www/neomind

# Start
./neomind serve
```

### With nginx Reverse Proxy

Expose only port 80 externally; keep 9375 loopback-only:

```nginx
server {
    listen 80;
    root /var/www/neomind;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9375/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Build from Source (Development)

For contributors or custom builds.

**Prerequisites**: Rust 1.85+ (toolchain pinned to 1.92.0), Node.js 20+, Ollama (or a cloud LLM API key).

```bash
# Clone
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind

# Start backend (port 9375 by default)
cargo run -p neomind-cli -- serve

# Start frontend dev server (port 5173, hot reload)
cd web && npm install && npm run dev

# Build desktop app
cd web && npm run tauri:build
```

See [Developer Guide](../developer-guide/1-overview.md) for build/contribution details.

## First-Run Setup (All Modes)

Regardless of install path, first visit to the Web UI requires just one step:

1. **Create an admin account** — the first registered user becomes admin; timezone is auto-detected

After creation you land in the main UI, then walk through the **four-step setup wizard** described earlier (Welcome → LLM Backend → Device Connection → Done; every step can be skipped). Anything you skip can be configured later at any time:

- **[Configure LLM Backend](./2-configure-llm.md)** — required before using AI Chat
- **[Onboard a Device](./3-onboard-device.md)** — connect cameras or sensors via the onboarding wizard

Once done, you can chat with devices in [AI Chat](./5-ai-chat.md), build [Dashboards](./4-use-dashboard.md), or create automation rules.

## Verify the Install

```bash
# Probe backend health
curl http://localhost:9375/api/health

# Open API docs (Swagger)
# Visit http://localhost:9375/api/docs in a browser

# systemd status (one-line install)
systemctl status neomind.service
```

For common issues (port conflicts, LLM connection failures, MQTT unreachable), see [Troubleshooting](./10-troubleshooting.md).

## CLI & API Key

`neomind` CLI and external integrations authenticate to the Server API with an **API key** (auto-generated on first start, format `nmk_xxx`). When run from the project root, the CLI auto-authenticates with no setup.

For the full retrieval, configuration, and verification walkthrough see **[CLI & API Keys](./11-cli-api-keys.md)**.

## Next Steps

NeoMind is running? Here's the recommended order:

1. **[Configure LLM Backend](./2-configure-llm.md)** — Connect Ollama or a cloud model to enable AI features
2. **[Onboard a Device](./3-onboard-device.md)** — Use the onboarding wizard to connect your first device
3. **[Use Dashboard](./4-use-dashboard.md)** — Visualize telemetry data
4. **[AI Chat](./5-ai-chat.md)** — Control the system with natural language

---

*Last updated: 2026-09-08*
