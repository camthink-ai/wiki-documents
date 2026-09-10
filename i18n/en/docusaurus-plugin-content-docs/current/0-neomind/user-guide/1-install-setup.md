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

:::note Self-registration is off by default
`POST /api/auth/register` is closed by default for security (the server binds `0.0.0.0`, and open registration would let any device on the LAN mint an account). To add users, have an admin create them in **Settings → Users** (or via `POST /api/users`); if you truly need open self-registration, an admin can enable it with `PUT /api/settings/registration`.
:::

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
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-web.tar.gz

# Install binaries
tar xzf neomind-server-linux-${ARCH}.tar.gz
sudo install -m 755 neomind /usr/local/bin/
sudo install -m 755 neomind-extension-runner /usr/local/bin/

# Deploy frontend
sudo mkdir -p /var/www/neomind
sudo tar xzf neomind-web.tar.gz -C /var/www/neomind

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

Whichever installation you chose, the first visit to the web UI is the same: **create the admin account** (the first user automatically becomes admin; timezone is auto-detected) → then the [four-step setup wizard](#first-launch-wizard) (Welcome → LLM backend → Device connection → Done; every step is skippable).

Skipped items can be completed later: [Configure LLM Backend](./2-configure-llm.md), [Device Onboarding](./3-onboard-device.md). Then chat in [AI Chat](./5-ai-chat.md), build [dashboards](./4-use-dashboard.md), and create automation rules.

## Users & Roles

- The **first admin** comes from the first-start wizard and has full permissions
- **Self-registration is closed by default** (by design): new accounts are created by an admin via the API (`POST /api/users`, admin-only); open self-registration by calling `PUT /api/settings/registration`
- **Roles**: admin (full access) / user (daily operations) / viewer (read-only)
- **Offline recovery**: if an admin account's role is wrong, run `neomind user set-role <name> admin` on the server (no API required)
- Changing a password or deleting a user **immediately revokes** all of that user's sessions

## Verify the Install

```bash
# Probe backend health
curl http://localhost:9375/api/health

# Verify the API is reachable
# Visit http://localhost:9375 in a browser to see the Web UI

# systemd status (one-line install)
systemctl status neomind.service
```

For common issues (port conflicts, LLM connection failures, MQTT unreachable), see [Troubleshooting](./10-troubleshooting.md).

## Data Backup & Restore

NeoMind includes scheduled backups: **Settings → Preferences → Data Backup** lets you toggle scheduled backups, adjust the interval (6h–weekly) and retention count (default 3), and shows the last backup's time and size; admins can also trigger one immediately with **Back up now**.

- What's backed up: every database in the data directory (devices, agents, dashboards, telemetry, …) plus the key files
- Where: `data/backups/backup-<timestamp>/` — every backup is verified as restorable; a failed verification discards the whole copy
- Env vars seed the defaults: `NEOMIND_BACKUP_INTERVAL_SECS` (`0` disables), `NEOMIND_BACKUP_KEEP`

**Restoring** (deliberately manual — an automated rollback could silently revert to stale data): stop the server → copy the files from a backup directory back into the data directory → start the server.

## Extension Marketplace Source

The default extension marketplace is hosted on GitHub (`raw.githubusercontent.com`), which some networks cannot reach directly. Admins can switch to a mirror in **Settings → Preferences → Extension Marketplace** (e.g. `https://ghfast.top/https://raw.githubusercontent.com/camthink-ai/NeoMind-Extensions`); it takes effect on the next marketplace request with no restart. `NEOMIND_EXTENSION_MARKET_URL` seeds the default. **Note**: after switching, package integrity (SHA256) is verified against the mirror's artifacts.

## CLI API Key Setup

`neomind` CLI and external integrations authenticate to the Server API with an **API key** (auto-generated on first start, format `nmk_xxx`). When run from the project root, the CLI auto-authenticates with no setup.

For the full retrieval, configuration, and verification walkthrough see **[CLI & API Keys](./11-cli-api-keys.md)**.

## Environment Variable Reference

Commonly used runtime variables (grouped by purpose, all verified against source):

**Core paths & service**

| Variable | Description |
|------|------|
| `NEOMIND_DATA_DIR` | Data directory (redb, extensions, backups; default `./data` or the platform data dir) |
| `NEOMIND_PORT` / `--port` | HTTP API port (default 9375) |
| `NEOMIND_HOST` | Bind address (default 0.0.0.0) |
| `NEOMIND_WEB_DIR` | Frontend static directory (default `/var/www/neomind`) |
| `NEOMIND_LOG_JSON` / `RUST_LOG` | Log format and level |

**Built-in HTTPS proxy (0.9.21+)**

Without nginx, NeoMind ships a rustls TLS front proxy that forwards to the plaintext listener:

| Variable | Description |
|------|------|
| `NEOMIND_TLS_PORT` | HTTPS listen port (default 9376) |
| `NEOMIND_TLS_CERT` / `NEOMIND_TLS_KEY` | PEM certificate and key paths |

:::note vs nginx
The built-in proxy suits single-box HTTPS enablement; all clients share one rate-limit bucket and the upstream assumes the default port. For multi-client production, prefer nginx with per-client limits.
:::

**LLM & models**

| Variable | Description |
|------|------|
| `NEOMIND_BUILTIN_LLM` / `NEOMIND_BUILTIN_MODEL_PATH` / `NEOMIND_BUILTIN_MODEL_NGL` | Built-in llama.cpp runtime and model control |
| `NEOMIND_BUILTIN_LLM_CTX` / `NEOMIND_BUILTIN_LLM_PORT` | Context length and listen port |
| `NEOMIND_CATALOG_URL` | Built-in model catalog URL (default camthink-ai/NeoMind-Runtimes) |
| `NEOMIND_MAX_CONTEXT` | Override the default context length |
| `NEOMIND_TOOL_CONCURRENCY` | Tool-call concurrency |

**Extensions & security**

| Variable | Description |
|------|------|
| `NEOMIND_EXTENSION_MARKET_URL` / `NEOMIND_MARKET_URL` | Marketplace source override |
| `NEOMIND_STRICT_PACKAGE_SHA256` | Set to 1 to reject packages without a checksum |
| `NEOMIND_RUNNER_WORKERS` / `NEOMIND_FFI_TIMEOUT_SECS` | Extension process workers and FFI timeout |
| `NEOMIND_JWT_SECRET` / `NEOMIND_ENCRYPTION_KEY` | Session signing and at-rest encryption keys (auto-generated under data/ by default) |
| `NEOMIND_BACKUP_INTERVAL_SECS` / `NEOMIND_BACKUP_KEEP` | Backup schedule seeds (settings win once saved) |

> The full list is authoritative in the source (`grep -r 'env::var' crates/`); the table above is the operations-relevant subset.

## Production Checklist

Before moving from trial to production, walk through:

- **[Backups](./10-troubleshooting.md#data--storage)** — enable the automatic schedule (Settings → Preferences) and confirm retention count
- **[Data retention](./12-settings.md#device-defaults--data-retention)** — set telemetry retention to match your needs (default is forever; disk grows continuously)
- **[Users & roles](#users--roles)** — keep self-registration closed; create user / viewer accounts for operators and business users
- **HTTPS** — front with an nginx reverse proxy and expose only 80/443 (keep 9375 / 1883 internal)
- **[Marketplace source](./9-extensions.md)** — switch to a mirror if your network needs it
- **[Online upgrade](#upgrade)** — make sure install.sh's helper systemd units are installed (older installs: rerun the script once)
- **Timezone** — verify the system timezone; rule cron schedules and data timestamps depend on it (Settings → Preferences)
- **Monitoring** — point Prometheus at `http://your-server:9375/metrics` (HTTP request counters, uptime, event-bus drop counters) instead of waiting for incidents

## Next Steps

NeoMind is running? Here's the recommended order:

1. **[Configure LLM Backend](./2-configure-llm.md)** — Connect Ollama or a cloud model to enable AI features
2. **[Onboard a Device](./3-onboard-device.md)** — Use the onboarding wizard to connect your first device
3. **[Use Dashboard](./4-use-dashboard.md)** — Visualize telemetry data
4. **[AI Chat](./5-ai-chat.md)** — Control the system with natural language

---

*Last updated: 2026-09-08*
