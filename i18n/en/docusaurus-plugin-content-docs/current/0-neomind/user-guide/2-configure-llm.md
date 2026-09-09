---
description: "Configure LLM backends in NeoMind: local Ollama (recommended qwen3.5:4b) and cloud models (OpenAI/Anthropic/Qwen/DeepSeek/GLM etc.) — setup steps, CLI commands, model selection, and multimodal capability."
keywords: [NeoMind, LLM, Ollama, qwen3.5, model config, multimodal, CLI]
tags: [NeoMind, User Guide]
sidebar_label: "Configure LLM Backend"
---

# Configure LLM Backend

NeoMind's AI Agent and AI Chat rely on an LLM backend to understand natural language and execute instructions. This guide covers configuring local or cloud LLMs via **Web UI** or **CLI**.


## Backend Overview

NeoMind supports 10+ LLM backends in two deployment modes:

| Category | Backend | Default Model | Notes |
|----------|---------|---------------|-------|
| **Local (zero config)** | Built-in llama.cpp | Curated platform models (Qwen 3.5 / Gemma 4 / Ling-3.0-tiny / LFM2.5, etc.) | Runtime bundled in the Docker image, one-click download in the wizard, see [section below](#built-in-local-models-zero-config) |
| **Local** | Ollama | `qwen3.5:4b` | Fully offline |
| Local | llama.cpp (self-hosted) | Loaded at startup | Run llama-server yourself |
| **Cloud** | OpenAI | `gpt-4.1-mini` | API Key required |
| Cloud | Anthropic | `claude-sonnet-4-5` | API Key required |
| Cloud | Google | `gemini-2.5-flash` | API Key required |
| Cloud | xAI | `grok-3-mini` | API Key required |
| Cloud | Qwen (Alibaba) | `qwen-plus` | DashScope Key required |
| Cloud | DeepSeek | `deepseek-chat` | API Key required |
| Cloud | GLM (Zhipu) | `glm-4.5-flash` | API Key required |
| Cloud | MiniMax | `MiniMax-M2` | API Key required |
| Cloud | Custom gateway | Any | OpenAI-compatible endpoint (type OpenAI with a custom endpoint) |

> **Recommended**: the built-in **MiniCPM5-2B** first (Q4_K_M, 1.5GB — 81% tool accuracy on the 2026-09 corrected eval, same tier as cloud deepseek-v4-flash; Apache-2.0 redistributable). On the Ollama path use `qwen3.5:4b` (4B, the balanced pick). Add cloud backends when you need more power or multimodal.


## Built-in Local Models (Zero Config)

Since 0.9.16, the Docker image ships with the llama.cpp runtime plus officially curated models. In the **LLM Backend** step of the first-run wizard (or via the built-in model card under **Settings → LLM Backends**), you can download and use them directly:

- **One-click download** — The model list comes from a remote model catalog (`models/catalog.json` in [camthink-ai/NeoMind-Runtimes](https://github.com/camthink-ai/NeoMind-Runtimes), so new models keep arriving without upgrading the platform); when offline, it automatically falls back to the built-in curated list
- **Hardware-based recommendations** — The download page lists each model's VRAM/RAM requirements (e.g. Ling-3.0-tiny: 4.8GB Q4_K_M, 128K context, minimum 6GB RAM)
- **Import your own GGUF** — The built-in model wizard offers an "Import Local Model" card: drop in a `.gguf` file (streamed upload, no extra memory usage) or enter a server path; the platform auto-parses the name/context/quantization info, verifies and stores it with SHA-256, and imported models participate in backend switching just like curated ones (context capped at 128K)
- **Works out of the box** — Once the first download completes, the model is automatically registered as a local backend and runs with the model's own optimal sampling parameters (temperature / top-p / top-k)

## Option 1: Web UI Setup (Recommended)

### Step 1: Install Ollama and Pull a Model (Local Backend)

Install from [ollama.com](https://ollama.com). After install, Ollama listens on `http://localhost:11434` by default.

```bash
# Install Ollama (macOS / Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Recommended model (Chinese + tool calling + 128K context)
ollama pull qwen3.5:4b

# For vision capability (image input), also pull a vision model
ollama pull qwen3.5:4b-vl   # or llava / minicpm-v etc.
```

> **Note**: Use `qwen3.5:4b`. Earlier docs mentioned `ministral-3:3b` / `deepseek-r1:7b` — these are no longer recommended (unstable tool calling / too large for edge hardware).

> Skip this step if using a cloud backend (OpenAI / Anthropic / GLM, etc.).

### Step 2: Open LLM Backend Settings

Navigate to **Settings → LLM Backends**:

<img src="https://resources.camthink.ai/NeoMind/v0923/settings-llm-list.png" alt="LLM backend list — click Add Backend" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

Backends are presented as cards (built-in model / Ollama / llama.cpp / Cloud AI). Click **Add Instance** on the corresponding card to open the configuration form.

### Step 3: Fill in Backend Details

#### Ollama (Local)

| Field | Value |
|-------|-------|
| Type | Ollama |
| Endpoint | `http://localhost:11434` (default; use the host IP for remote) |
| Model | `qwen3.5:4b` (must match the `ollama pull` name) |
| Stream | Enabled (recommended for better UX) |

#### Cloud (OpenAI example)

| Field | Value |
|-------|-------|
| Type | OpenAI-compatible protocol (or Anthropic protocol) |
| API Key | Your API Key (e.g. `sk-...`) |
| Base URL | Leave empty for official; fill in for custom gateway |
| Model | `gpt-4.1-mini` (or `gpt-4o` / `gpt-4-turbo`, etc.) |

**Chinese providers**: Qwen / DeepSeek / GLM / MiniMax all use OpenAI-compatible protocols. NeoMind has built-in default endpoints — just fill in the API Key and model name.

#### Custom Gateway (OpenAI-Compatible Endpoint)

If you use vLLM, Together AI, OpenRouter, or another self-hosted/third-party gateway, pick the **OpenAI-compatible** protocol on the **Cloud AI** card and fill in:

- `base_url`: Gateway URL (e.g. `https://api.openrouter.ai/v1`)
- `api_key`: Gateway key
- `model`: Model name exposed by the gateway

<img src="https://resources.camthink.ai/NeoMind/llm-backend-edit.png" alt="LLM backend configuration form" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

After saving, NeoMind probes the backend's capabilities (tool calling, multimodal, context window) and writes capability tags automatically.

### Step 4: Set Default and Verify

Select the backend in the **model picker at the top of AI Chat** to make it the system default (the current default carries an "Active" badge), or activate it with `neomind llm activate <ID>`.

Then open **AI Chat** and send a greeting to verify:

<img src="https://resources.camthink.ai/NeoMind/chat-typing.png" alt="AI Chat verifying LLM connection" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

> If AI Chat doesn't respond, check:
> - Is Ollama running? `ollama list` should show pulled models
> - Cloud backend: Is the API Key valid? Is the network reachable?
> - More in [Troubleshooting](./10-troubleshooting.md)


## Option 2: CLI Setup

Prefer the terminal? These commands cover the full workflow from creation to activation.

### 1. List Existing Backends

```bash
neomind llm list
```

### 2. List Available Models (Ollama)

```bash
# List models pulled in Ollama
neomind llm models

# Or specify a remote Ollama
neomind llm models --endpoint http://192.168.1.100:11434
```

### 3. Create a Backend

```bash
# Ollama local
neomind llm create --name local --type ollama \
  --endpoint http://localhost:11434 --model qwen3.5:4b

# OpenAI cloud
neomind llm create --name openai --type openai \
  --endpoint https://api.openai.com/v1 \
  --model gpt-4.1-mini --api-key sk-xxxx

# GLM cloud (OpenAI-compatible)
neomind llm create --name glm --type openai \
  --endpoint https://open.bigmodel.cn/api/paas/v4 \
  --model glm-4-flash --api-key xxx.xxx.xxx

# Custom gateway (OpenRouter etc., via the OpenAI-compatible protocol)
neomind llm create --name router --type openai \
  --endpoint https://openrouter.ai/api/v1 \
  --model anthropic/claude-3.5-sonnet --api-key sk-or-xxxx
```

A backend ID is returned on success (e.g. `local` or a random ID).

### 4. Test the Connection

```bash
neomind llm test local
```

Returns model info and response status = connection OK.

### 5. Activate as Default

```bash
neomind llm activate local
```

### 6. Other Common Commands

```bash
# View backend details (with capability tags)
neomind llm get local

# Update model or parameters
neomind llm update local --model qwen3.5:8b --temperature 0.5

# Delete a backend
neomind llm delete local
```

<details>
<summary>📖 CLI Command Reference</summary>

| Command | Description | Key Flags |
|---------|-------------|-----------|
| `llm list` | List all backends | — |
| `llm get <id>` | View details | — |
| `llm models` | List available Ollama models | `--endpoint <url>` |
| `llm create` | Create a backend | `--name` `--type` `--endpoint` `--model` `--api-key` `--temperature` |
| `llm update <id>` | Update config | `--model` `--endpoint` `--api-key` `--temperature` |
| `llm test <id>` | Test connection | — |
| `llm activate <id>` | Set as default | — |
| `llm delete <id>` | Delete | — |

</details>


## Thinking Effort

For models that support reasoning, you can control the thinking effort uniformly in the backend capability panel: **none / low / medium / high** (some backends offer finer levels). NeoMind abstracts this into a single switch and maps it automatically to each backend's native parameters — Ollama's `think` levels, `reasoning_effort` for OpenAI / custom / GLM / Google, `thinking` for DeepSeek / Anthropic, and `enable_thinking` for Qwen. Backends that don't support reasoning show a read-only badge instead.


:::note Ollama endpoint
NeoMind calls Ollama's **native `/api/chat` endpoint** (not `/v1/chat/completions`) — which is why thinking chains (`thinking`), native multimodality, and Ollama's native streaming/tool-call protocol all work. For curl examples during self-testing and the common 404 troubleshoot, see [Troubleshooting — LLM / Ollama](./10-troubleshooting.md#llm--ollama).

## Multimodal (Vision) Capability

NeoMind supports image input and visual analysis. Vision capability depends on the model:

- **Ollama**: After pulling a vision model (e.g. `qwen3.5:4b-vl` / `llava` / `minicpm-v`), you can upload images in [AI Chat](./5-ai-chat.md).
- **Cloud**: `gpt-4o` / `gpt-4o-mini` / `claude-sonnet-4-5` / `gemini-2.5-flash` / `qwen-vl` / `glm-4v` natively support vision.

NeoMind auto-detects multimodal capability (via LiteLLM registry + `/api/show` runtime probe + name heuristic matching). If auto-detection is inaccurate, manually toggle **Multimodal** in the backend detail page.


## Setting the Default Backend

A NeoMind instance can have **multiple LLM backends**, but only one is marked as **default**. The default backend is used for:

- Initial AI Chat conversations
- Scheduled Agent executions
- LLM analysis in the rule engine

:::tip Switching the default
- **Web UI**: model picker at the top of AI Chat → click the backend to set as default
- **CLI**:

```bash
# List all backends and see which is default
neomind llm list

# Set a backend as default
neomind llm activate local
```
:::


## Next Steps

- [Onboard a Device](./3-onboard-device.md) — Start receiving telemetry data
- [Use Dashboard](./4-use-dashboard.md) — Visualize your device data
- [AI Chat](./5-ai-chat.md) — Query device status in natural language

---

*Last updated: 2026-09-08*
