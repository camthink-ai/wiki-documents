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

On first launch, NeoMind runs a **setup wizard** — just two steps:

1. **Create an admin account** — set username and password; timezone is auto-detected
2. **Done** — you're in the main UI, with a quick-start guide (Chat, configure LLM, explore features)

> LLM backend configuration is **deferred** — when you first use AI Chat or create an Agent, the system guides you to the Settings page. See [Configure LLM Backend](./2-configure-llm.md).

You'll land in the main UI when the wizard completes.

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
| `VERSION` | latest | Specific version, e.g. `0.8.0` |
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
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | VERSION=0.8.0 sh

# Custom directories
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | INSTALL_DIR=~/.local/bin DATA_DIR=~/.neomind sh

# Enable nginx reverse proxy (port 80)
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | USE_NGINX=true sh
```

## Docker

```bash
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind
docker compose up -d
```

Single-container deployment — backend API, MQTT broker, and Web UI all run in one image. Data persists via the `neomind-data` volume.

| Port | Purpose |
|------|---------|
| `9375` | HTTP API + Web UI + WebSocket |
| `1883` | MQTT broker (device connections) |

Customize ports and other parameters via `.env` (copy from `.env.example`):

```bash
cp .env.example .env
# Edit NEOMIND_HTTP_PORT / NEOMIND_MQTT_PORT / RUST_LOG / TZ, etc.
docker compose up -d
```

Visit `http://host:9375` after deploy.

## Manual Installation

For environments where the one-line script can't run (air-gapped servers, custom directory layouts):

```bash
VERSION=0.8.0  # Replace with your target version

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

You're then in the main UI. LLM backend configuration and device onboarding are deferred — set them up whenever you need:

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

## CLI API Key Setup

NeoMind Server **auto-generates a default API Key** (format `nmk_xxx`) on first start. It's used for CLI authentication and external integrations. All `neomind` CLI commands require a valid key to call the Server API.

:::tip Local Development: Zero Config Needed
When running CLI commands from the **project root** (the directory containing `data/`), the CLI auto-reads the key from `data/api_keys.redb` (auto-auth) — no manual setup required.

```bash
cd /path/to/neomind    # cd to project root
neomind device list     # just works
```

> Note: auto-auth resolves the path `data/api_keys.redb` **relative to the current working directory**. You must be in the project root. The `NEOMIND_DATA_DIR` env var does **not** affect auto-auth path resolution.
:::

### When You Need a Manual Key

| Scenario | Manual Key Needed? |
|----------|-------------------|
| Local dev, running CLI from project root | No (auto-auth) |
| Running CLI from `web/`, `/tmp`, etc. | Yes |
| Connecting to a remote server | Yes |
| Desktop app's embedded CLI | No (auto-configured) |

### Getting Your Real API Key

:::warning Documentation Keys Are Placeholders
All `nmk_xxx` values in this documentation are **placeholders** — they will not work. Your real key is printed to **stdout** (terminal output) at server startup and is **not written to log files**. `neomind api-key list` only shows masked values (`nmk_****`) and cannot recover the full key.
:::

The server prints a banner with the key at startup:

```
╔═══════════════════════════════════════════════╗
║ ⚠ DEFAULT API KEY GENERATED                    ║
╠═══════════════════════════════════════════════╣
║ Key: nmk_a1b2c3d4....（your real key）        ║
║ Name: Default API Key                          ║
╚═══════════════════════════════════════════════╝
```

Missed the startup output? Find it by deployment type:

| Deployment | How to Find |
|------------|-------------|
| **Dev mode** (`neomind serve`) | Scroll up in the terminal where you started the server |
| **Linux systemd** | `journalctl -u neomind.service \| grep 'nmk_'` |
| **Docker** | `docker logs neomind 2>&1 \| grep 'nmk_'` |
| **Manual / nohup** | `grep 'nmk_' /path/to/neomind.log` (only if stdout was redirected) |
| **Can't find it** | Restart the server and watch the output: `neomind serve 2>&1 \| head -30` |

### Set the Environment Variable

Once you have the real key, set it as an environment variable for cross-directory or remote use:

```bash
# Temporary (current session)
export NEOMIND_API_KEY=nmk_YOUR_REAL_KEY

# Permanent (add to shell config)
echo 'export NEOMIND_API_KEY=nmk_YOUR_REAL_KEY' >> ~/.zshrc   # macOS
source ~/.zshrc
```

:::warning Wrong Key Is Worse Than No Key
Once `NEOMIND_API_KEY` is set (even to a wrong value), the CLI **stops trying auto-auth**. If you previously set a wrong value, clear it first:

```bash
unset NEOMIND_API_KEY    # after clearing, cd to project root to restore auto-auth
```
:::

### Verify

```bash
# Local: from project root, no key needed
neomind device list

# Cross-directory: after setting correct NEOMIND_API_KEY
neomind dashboard list
```

If you get 401, see [Troubleshooting → CLI 401](./10-troubleshooting.md#cli-401-unauthorized).

## Next Steps

NeoMind is running? Here's the recommended order:

1. **[Configure LLM Backend](./2-configure-llm.md)** — Connect Ollama or a cloud model to enable AI features
2. **[Onboard a Device](./3-onboard-device.md)** — Use the onboarding wizard to connect your first device
3. **[Use Dashboard](./4-use-dashboard.md)** — Visualize telemetry data
4. **[AI Chat](./5-ai-chat.md)** — Control the system with natural language

---

*Last updated: 2026-06-15*
