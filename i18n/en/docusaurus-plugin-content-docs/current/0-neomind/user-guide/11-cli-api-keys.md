---
description: "NeoMind CLI and API key configuration: default key auto-generation and auto-auth, three ways to obtain a real API key, NEOMIND_API_KEY setup, cross-directory calls, and verification."
keywords: [NeoMind, CLI, API Key, NEOMIND_API_KEY, authentication]
tags: [NeoMind, CLI, API Key]
sidebar_label: "CLI & API Keys"
---

# CLI & API Keys

Every `neomind` CLI command calls the NeoMind Server REST API and authenticates with an **API key** (format `nmk_xxx`). This page covers obtaining, configuring, and verifying the key.

NeoMind Server **auto-generates a default API Key** (format `nmk_xxx`) on first start. It's used for CLI authentication and external integrations. All `neomind` CLI commands require a valid key to call the Server API.

:::tip Local Development: Zero Config Needed
When running CLI commands from the **project root** (the directory containing `data/`), the CLI auto-reads the key from `data/api_keys.redb` (auto-auth) — no manual setup required.

```bash
cd /path/to/neomind    # cd to project root
neomind device list     # just works
```

> Auto-auth resolves the data directory in this order: the `NEOMIND_DATA_DIR` env var → the platform user data dir (when it contains `api_keys.redb`) → the relative `data/` path (project-root fallback). A credential saved by `neomind login` takes top priority and works from any directory.
:::

## When You Need a Manual Key

| Scenario | Manual Key Needed? |
|----------|-------------------|
| Local dev, running CLI from project root | No (auto-auth) |
| `NEOMIND_DATA_DIR` set, or `neomind login` already done | No (auto-auth can locate the data) |
| Running CLI from `web/`, `/tmp`, etc. (none of the above) | Yes |
| Connecting to a remote server | Yes |
| Desktop app's embedded CLI | No (auto-configured) |

## Getting Your Real API Key

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

## Set the Environment Variable

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

## Verify

```bash
# Local: from project root, no key needed
neomind device list

# Cross-directory: after setting correct NEOMIND_API_KEY
neomind dashboard list
```

If you get 401, see [Troubleshooting → CLI 401](./10-troubleshooting.md#cli-commands-return-401-unauthorized).

---

*Last updated: 2026-09-08*
