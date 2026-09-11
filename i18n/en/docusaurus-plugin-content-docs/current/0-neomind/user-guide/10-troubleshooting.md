---
description: "NeoMind troubleshooting: service startup failures, port conflicts, Ollama connection, MQTT issues, multimodal 400 errors, extension crashes, data directory permissions, and log locations."
keywords: [NeoMind, troubleshooting, FAQ, Ollama, MQTT, port, logs]
tags: [NeoMind, User Guide]
---

# Troubleshooting

This page collects diagnostics and fixes for common NeoMind issues, grouped by symptom. Each entry gives you the probe commands and the fix.

## Diagnostic Starting Point

For any issue, run these three commands first to gather context:

```bash
# 1. System overview (MQTT status, network, webhook, device count)
neomind system info

# 2. Service health
curl http://localhost:9375/api/health

# 3. systemd status (one-line install)
systemctl status neomind.service
```

## CLI / API Key

### CLI commands return `401 Unauthorized`

**Cause**: The CLI can't provide a valid API key to the server.

**Diagnose**:

```bash
# 1. Is the env var set? (a WRONG value also causes 401 — auto-auth is completely skipped)
echo $NEOMIND_API_KEY

# 2. Can the CLI locate the data directory?
#    auto-auth tries, in order: NEOMIND_DATA_DIR → platform user data dir
#    (when it contains api_keys.redb) → ./data under the current directory (project-root fallback)
ls data/api_keys.redb
```

**Fix by scenario**:

| Scenario | Fix |
|----------|-----|
| Set a wrong `NEOMIND_API_KEY` (e.g. doc placeholder) | `unset NEOMIND_API_KEY`, then run from project root |
| Not in project root | `cd /path/to/neomind && neomind device list`, or set `NEOMIND_DATA_DIR` to the data dir, or run `neomind login` first to save a credential |
| Need cross-directory access | Get real key from server startup output, `export NEOMIND_API_KEY=nmk_REAL_KEY` |
| Connecting to remote server | Get the key from that server's startup output |
| Auto-auth worked before, suddenly 401 | **Restart the server**: CLI operations on `api_keys.redb` can cause redb lock conflicts |

> ⚠ **Key points**:
> - Once `NEOMIND_API_KEY` is set (even to a placeholder), auto-auth is completely skipped. Always `unset` first.
> - Do NOT run `neomind api-key create` while the server is running — it conflicts with the server's redb lock. To regenerate a key: stop the server, create the key, then restart.

> Full API key setup walkthrough: [CLI & API Keys](./11-cli-api-keys.md).

## Service Startup

### `neomind serve` fails with "address already in use"

**Cause**: port 9375 is occupied.

**Probe**:

```bash
# Who's holding 9375
lsof -i :9375        # macOS / Linux
netstat -ano | findstr 9375   # Windows
```

**Fix**:
- Kill the holder: `kill <PID>`
- Or run on a different port: `neomind serve --port 9376`
- One-click deployment: re-run the install script with `PORT=xxxx` (the port is written into the systemd unit's `--port` argument)

### Startup fails with "permission denied" writing `data/`

**Cause**: wrong ownership on the data dir (common after a manual install or a custom `DATA_DIR`).

**Fix**:

```bash
# chown to the user running neomind
sudo chown -R $USER:$USER /var/lib/neomind
# or loosen perms
sudo chmod -R u+rwX /var/lib/neomind
```

## LLM / Ollama

### AI Chat doesn't respond / spinner forever

**Cause**: the LLM backend is misconfigured or unreachable.

**Probe**:

```bash
# 1. Is Ollama running
ollama list               # should list pulled models
curl http://localhost:11434/api/tags   # should return JSON

# 2. Model name match
# Settings → LLM Backends must match `ollama list` exactly (including tag)

# 3. Backend capability in NeoMind
# The backend list shows whether the probe succeeded (Tools / Multimodal / Context)
```

**Fix**:
- Start Ollama: `ollama serve`
- Pull the model: `ollama pull qwen3.5:4b`
- Model name typo → fix in Settings to match `ollama list`

### Calling Ollama returns 404 / `not found`

**Cause**: wrong API endpoint. NeoMind must use **`/api/chat`** (Ollama native), not `/v1/chat/completions` (OpenAI-compat).

**Note**: NeoMind hard-codes `/api/chat` internally — you don't need to change this. If you're testing with `curl` or writing a 3rd-party integration, use:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5:4b",
  "messages": [{"role":"user","content":"hi"}],
  "stream": false
}'
```

### Image upload: AI says "I can't see the image" or returns `unknown variant image_url`

**Cause**: the current LLM backend **doesn't support multimodal**, or NeoMind misdetects capability.

**Fix**:
1. Confirm the model itself supports vision (e.g. `qwen3.5:4b-vl` / `llava`, not the text-only `qwen3.5:4b`)
2. `ollama pull` the vision model
3. Settings → LLM Backends → that backend's detail page → manually toggle **Multimodal** on (override auto-detect)
4. Retry the conversation

### Cloud backend returns `unknown variant image_url, expected text`

**Cause**: sending an image to a text-only cloud model (DeepSeek-V3, Qwen text tiers). NeoMind gates image sending on the capability toggle, but auto-detect mistakes can still cause this.

**Fix**: turn **off** the Multimodal toggle on that backend, or switch to a vision-capable cloud model (`gpt-4o` / `claude-sonnet-4-6` / `qwen-vl` / `glm-4v`).

## Devices / MQTT

### Device sent data but NeoMind shows nothing

**Probe**:

```bash
# 1. Is the MQTT broker connected
neomind system info | grep -A3 mqtt
# check mqtt.connected == true

# 2. Is the topic actually subscribed
neomind connector subscriptions

# 3. Did it land in "Pending" drafts (auto-discovery)
neomind device drafts list

# 4. Did the device hit the right broker IP
# the broker address in device code must be the NeoMind host's IP
```

**Common causes**:
- `mqtt.connected: false` → MQTT module down; restart the server
- Device connects to `localhost` instead of the server IP → fix device code
- Network issue → `ping <SERVER_IP>` / `telnet <SERVER_IP> 1883`

### `Connection refused` on MQTT

- Service not running → `systemctl status neomind`
- Firewall blocks 1883 → `sudo ufw allow 1883` (or cloud provider security group)
- Another process holds the port → `lsof -i :1883`

### `Auth failed / Not authorized`

**Cause**: MQTT auth is on.

**Fix**:

```bash
neomind system info
# read mqtt.auth_enabled and mqtt.credentials
```

Pass the credentials into device code: `client.connect(client_id, username, password)`.

### `TLS handshake failed` / `Received corrupt message`

**Cause**: MQTT TLS is on (`mqtts://`) but the device connected in plaintext.

**Fix**:
- Switch device to `mqtts://` + trust the CA cert (download from Settings → MQTT)
- Or turn TLS off in NeoMind (recommended only for isolated/test networks)

## Extensions

### Extension shows `Crashed` / boot-loops after install

**Note**: NeoMind has **crash-loop protection** — an extension that crashes repeatedly is auto-disabled to protect the server.

**Probe**:

```bash
# Find extension logs
ls data/logs/                # server logs; live extension logs are in the extension detail page → Logs tab
neomind extension list       # status overview
neomind extension info <ID>   # recent error for a specific extension
```

**Fix**:
- Arch mismatch (e.g. x86_64 binary on arm64) → reinstall the right platform build
- Required model not pulled → pull per the extension's docs
- Bad config → edit in the Extensions page, then restart the extension

### Extension loaded but no data

- DataSourceId typo → format must be `extension:<id>:<metric>`
- Command / metric not declared → check the extension manifest
- Process running but not publishing → check extension logs

For the extension-level troubleshooting table (install failures, Crash Loop, timeouts, etc.), see [Extension Management — Troubleshooting](./9-extensions.md#troubleshooting).

## Dashboard / Frontend

### Dashboard widget spins forever, no data

- Wrong data source → edit the widget, confirm Device + Metric
- Device has no data → `neomind device get <ID>` and check `latest`
- WebSocket dropped → refresh the page; verify the reverse proxy forwards `Upgrade` / `Connection` headers

### Share link returns 404

- Link expired → regenerate
- Reverse proxy doesn't forward `/share/` → check the nginx `location /` block (`try_files $uri $uri/ /index.html;`)

## Data & Storage

### Where is the data directory?

One-click install: `/var/lib/neomind` (data lives in its `data/` subdirectory); dev / manual mode: `data/` in the project root by default. Override with the `NEOMIND_DATA_DIR` env var to use a custom directory.

Key files:

| File | Purpose |
|------|---------|
| `telemetry.redb` | Time-series telemetry |
| `devices.redb` / `dashboards.redb` / `rules.redb` | Business data |
| `sessions.redb` | Sessions |
| `logs/` | Runtime logs |

### Can I migrate data?

Yes. Stop the service, copy the entire data dir to the new host at the same path, restart. redb is an embedded database — no dump/restore needed.

### Backup

**Built-in backup (0.9.21+, recommended) — schedule and retention are configured in [Settings → Preferences](./12-settings.md#backup-schedule);** — the platform automatically backs up all redb databases and secret files into `data/backups/backup-<timestamp>/`, and every copy is verified to be openable:

- Configure the backup schedule under **Settings → Preferences** (on/off, 6h–7d interval, retention count); you can also click "Back up now"
- API: `POST /api/settings/backup` (back up now), `GET /api/settings/backups` (list)
- Restore is a manual operation: stop the server → copy the backup files over the data files → start

```bash
# Older versions without built-in backup: stop + copy the directory
sudo systemctl stop neomind
sudo tar czf neomind-backup-$(date +%F).tar.gz /var/lib/neomind
sudo systemctl start neomind
```

## Log Locations

| Deployment | Location |
|------------|----------|
| One-line (systemd) | `journalctl -u neomind.service -f` |
| Manual / Docker | `<DATA_DIR>/logs/` |
| Dev mode (cargo run) | terminal stdout |

Useful probes:

```bash
# Tail logs live
journalctl -u neomind.service -f

# Errors only
journalctl -u neomind.service -p err

# Search multimodal / vision issues
journalctl -u neomind.service | grep -i "vision\|multimodal\|image"
```

## Crash & Performance Analysis

The Linux server tarball omits DWARF debug info to keep the download small, but retains the function symbol table — so routine triage (panic backtraces in logs, hot functions in `perf report`) needs **no extra files**. When you need **source-line** information — line-accurate perf flame graphs, gdb on a core dump, `addr2line` — download the matching optional symbols package and extract it next to the binaries:

```bash
VERSION=0.9.24   # keep this identical to the running version (check with neomind --version)
ARCH=amd64       # adjust for your platform; use arm64 on ARM devices

wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-server-linux-${ARCH}-debug-symbols.tar.gz

# Extract into the binaries' directory: each binary embeds a .gnu_debuglink,
# so perf/gdb automatically pick up the .debug file sitting next to it
sudo tar xzf neomind-server-linux-${ARCH}-debug-symbols.tar.gz -C /usr/local/bin/

# Verify: reports now show file names and line numbers
perf record -g -p $(pidof neomind) -- sleep 10
perf report
```

:::info
- The symbols package only affects **offline analysis**: DWARF is never loaded into memory — install it, delete it, whenever; the service behaves identically either way.
- Symbols for both `neomind` and `neomind-extension-runner` live in the same package.
- There is no macOS symbols package — darwin binaries never embed DWARF in the first place, so nothing extra is needed.
- If the Release assets list has no such file, your version predates the package (introduced 2026-09); upgrade to get it.
:::

## Still Stuck?

- Search [GitHub Issues](https://github.com/camthink-ai/NeoMind/issues) for the same symptom
- Ask the community: [Discord](https://discord.com/invite/6TZb2Y8WKx)
- When filing a new issue, attach: NeoMind version (`neomind --version`), `neomind system info` output, relevant log snippet

---

*Last updated: 2026-09-11*
