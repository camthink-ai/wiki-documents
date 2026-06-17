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

# 2. Are you in the project root? (auto-auth needs relative path data/api_keys.redb)
ls data/api_keys.redb
```

**Fix by scenario**:

| Scenario | Fix |
|----------|-----|
| Set a wrong `NEOMIND_API_KEY` (e.g. doc placeholder) | `unset NEOMIND_API_KEY`, then run from project root |
| Not in project root | `cd /path/to/neomind && neomind device list` |
| Need cross-directory access | Get real key from server startup output, `export NEOMIND_API_KEY=nmk_REAL_KEY` |
| Connecting to remote server | Get the key from that server's startup output |
| Auto-auth worked before, suddenly 401 | **Restart the server**: CLI operations on `api_keys.redb` can cause redb lock conflicts |

> ⚠ **Key points**:
> - Once `NEOMIND_API_KEY` is set (even to a placeholder), auto-auth is completely skipped. Always `unset` first.
> - Do NOT run `neomind api-key create` while the server is running — it conflicts with the server's redb lock. To regenerate a key: stop the server, create the key, then restart.

> Full API key setup walkthrough: [Install & Setup → CLI API Key Setup](./1-install-setup.md#cli-api-key-setup).

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
- Or change the systemd service's `PORT` env var and `systemctl restart neomind`

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

**Fix**: turn **off** the Multimodal toggle on that backend, or switch to a vision-capable cloud model (`gpt-4o` / `claude-3-5-sonnet` / `qwen-vl` / `glm-4v`).

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
ls data/logs/
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

Defaults: `/var/lib/neomind` (one-line install), `~/.neomind` (custom), `data/` in the project root (dev mode). Override with the `NEOMIND_DATA_DIR` env var.

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

```bash
# Simple: stop + tar
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

## Still Stuck?

- Search [GitHub Issues](https://github.com/camthink-ai/NeoMind/issues) for the same symptom
- Ask the community: [Discord](https://discord.com/invite/6TZb2Y8WKx)
- When filing a new issue, attach: NeoMind version (`neomind --version`), `neomind system info` output, relevant log snippet

---

*Last updated: 2026-06-15*
