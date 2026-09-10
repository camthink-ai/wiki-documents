---
description: "NeoMind system settings guide: LLM backends, device connections, IM channels, preferences (language & timezone, agent defaults, data retention & cleanup, backup schedule, memory limits, auto-onboarding, marketplace source) and the About page (version, self-upgrade), item by item."
keywords: [NeoMind, settings, preferences, data retention, backup, marketplace source, user management]
tags: [NeoMind, Settings]
sidebar_label: "Settings"
---

# System Settings

Click **Settings** at the bottom of the sidebar to open the settings panel — five sections: **LLM Backends**, **Device Connections**, **IM Channels**, **Preferences**, and **About**. LLM backends are covered in [Configure LLM Backend](./2-configure-llm.md), device connections in [Device Onboarding](./3-onboard-device.md), IM channels in [AI Chat — IM Bridges](./5-ai-chat.md#chat-from-telegram--feishu-im-bridges). This page covers the rest.

## Preferences

<img src="/img/neomind/settings-preferences.png" alt="System Settings — Preferences page" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

### Language & Region

| Setting | Description |
|------|------|
| **Language** | UI language (简体中文 / English), applies immediately |
| **Time Format** | 12-hour / 24-hour |
| **System Timezone** | Used for **cron scheduling and all time calculations** — changing it shifts rule trigger times |

### AI Agent Defaults

Global defaults for new agents and AI Chat (individual agents can override in the editor):

| Setting | Default | Description |
|------|------|------|
| Max Rounds | 30 | Maximum tool-call rounds per agent execution |
| Execution Timeout | 300 s | Timeout for a single execution |
| Default Temperature / Top-P / Thinking | per model | Sampling defaults; Thinking = auto follows model capability |
| Tool Concurrency | 6 | Concurrent tool calls |
| Chat History Depth | — | Conversation turns carried as context |

### Device Defaults & Data Retention

| Setting | Description |
|------|------|
| Default Offline Timeout | How long a device goes silent before marked offline (default for new devices) |
| Default Retention | Telemetry retention: never (forever) / 12h / 1d / 3d / 7d / 30d / 90d |
| **Auto Cleanup + Cleanup Now** | When enabled, expired data is purged automatically; **Cleanup Now** runs a pass immediately |

:::warning Retention means deletion
Once a retention period applies, telemetry older than it is **physically deleted** and unrecoverable. Pair it with [automatic backups](./10-troubleshooting.md#data--storage) for anything important.
:::

### Backup Schedule


| Setting | Description |
|------|------|
| Backup Enabled | Toggle automatic backups |
| Interval | 6 h / 12 h / 1 d / 2 d / 7 d |
| Keep | Retention count (1 / 2 / 3 / 5 / 7 / 14) |
| Back up now | Run a backup immediately |

What gets backed up, where it is stored, and how to restore: [Troubleshooting — How do I back up?](./10-troubleshooting.md#data--storage).

### Memory Limits

Character limits for the USER.md / KNOWLEDGE.md memory files (defaults 2000 / 3000). Oldest entries are pruned automatically; the files themselves are viewable and editable in [AI Agent → Memory](./6-ai-agent.md).

### Auto-Onboarding

When enabled, data from unknown devices lands in the **pending list** with a suggested device type (up to 10 samples collected by default). When disabled, unknown-device data is discarded. The full flow: [Device Onboarding — Pending](./3-onboard-device.md).

### Extension Marketplace Source


The marketplace index is fetched from GitHub by default. For restricted networks, switch the mirror here (or via the `NEOMIND_EXTENSION_MARKET_URL` env var) — the next marketplace request uses it, no restart needed. Package integrity is verified against the mirror's artifacts.

## About

- **Version & self-upgrade**: shows the current version; browser deployments can upgrade in place (download → verify → backup → restart, fully automatic) — see [Install — Upgrade](./1-install-setup.md#upgrade)
- **Resource panel**: CPU / memory / disk usage at a glance
- **Download logs**: bundle run logs for troubleshooting

## Next Steps

- [Troubleshooting](./10-troubleshooting.md) — start here when something breaks
- [CLI & API Keys](./11-cli-api-keys.md) — script the same capabilities

---

*Last updated: 2026-09-09*
