---
description: 在 NeoMind 中配置 LLM 后端：内置模型（Built-in Model，一键下载、完全离线、含视觉款）、Ollama 与云端模型（OpenAI/Anthropic/Qwen/DeepSeek/GLM 等）的接入步骤、CLI 命令、模型选择与多模态能力说明。
keywords: [NeoMind, LLM, Ollama, qwen3.5, 模型配置, 多模态, CLI]
tags: [NeoMind, 用户指南]
sidebar_label: "Configure LLM Backend"
---

# 配置 LLM 后端

NeoMind 的 AI Agent 与 AI Chat 依赖 LLM 后端理解自然语言并执行指令。本文介绍如何通过 **Web UI** 或 **CLI** 配置本地或云端 LLM。


## 后端总览

NeoMind 支持 10+ 种 LLM 后端，按部署形态分两类：

| 类别 | 后端 | 默认模型 | 备注 |
|------|------|---------|------|
| **本地（零配置）** | 内置模型（Built-in Model） | 平台精选目录（LFM2.5-2.6B / MiniCPM5-2B / Qwen3.5-4B 等 8 款） | 无需 API Key、完全离线，卡片内一键下载，见[下节](#内置模型built-in-model零配置) |
| **本地** | Ollama | `qwen3.5:4b` | 完全离线 |
| 本地 | llama.cpp（自托管） | 启动时加载 | 自行运行 llama-server |
| **云端** | OpenAI | `gpt-4.1-mini` | 需 API Key |
| 云端 | Anthropic | `claude-sonnet-4-5` | 需 API Key |
| 云端 | Google | `gemini-2.5-flash` | 需 API Key |
| 云端 | xAI | `grok-3-mini` | 需 API Key |
| 云端 | Qwen（阿里） | `qwen-plus` | 需 DashScope Key |
| 云端 | DeepSeek | `deepseek-chat` | 需 API Key |
| 云端 | GLM（智谱） | `glm-4.5-flash` | 需 API Key |
| 云端 | MiniMax | `MiniMax-M2` | 需 API Key |
| 云端 | 自定义网关 | 任意 | OpenAI 兼容端点（类型选 OpenAI，填自定义 endpoint） |

> **推荐**：本地首选内置模型 **MiniCPM5-2B**（Q4_K_M，1.5GB，最低 3GB 内存，默认 128K 窗口并按可用内存自动封顶，长会话建议保持 ≥32K——2026-09 修正版评测工具命中率 81%，与云端 deepseek-v4-flash 同档；Apache-2.0 可分发）。内存充裕（4GB+）且需要最强 agent 时选 **Qwen3.5-4B**（默认 128K 并按内存封顶；8K 下会大幅退化）。Ollama 路线用 `qwen3.5:4b`。


## 内置模型（Built-in Model，零配置）

**设置 → LLM 后端** 顶部的 **Built-in Model** 卡片就是内置模型：平台自带 llama.cpp 运行时，模型从官方目录按需下载——**无需 API Key、无外部依赖、完全离线**，下载完成即可作为系统默认后端使用。

<img src="https://resources.camthink.ai/NeoMind/v1021b/builtin-model-downloading.png" alt="内置模型卡片 — 一键下载推荐模型并显示实时进度" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

### 模型目录

目录来自远程模型清单（[camthink-ai/NeoMind-Runtimes](https://github.com/camthink-ai/NeoMind-Runtimes) 的 `models/catalog.json`，可持续上新、无需升级平台；离线时自动回退内置列表，可用 `NEOMIND_CATALOG_URL` 覆盖）。当前目录（2026-10）：

| 模型 | 量化 | 体积 | 最低内存 | 上下文 | 说明 |
|------|------|------|---------|--------|------|
| **MiniCPM5-2B** | q4_k_m | 1.6GB | 3GB | 128K | **文档推荐**——Apache-2.0 开放许可，商用友好；评测工具命中率 81%，与云端 deepseek-v4-flash 同档 |
| **LFM2.5-2.6B** | qad_q4_0 | 1.5GB | 3GB | 128K | 平台默认下载（LFM 自定义许可，商用需评估条款） |
| Qwen3.5-4B | q4_k_m | 2.7GB | 4.8GB | 128K | 内存充裕（4GB+）时 agent 能力最强 |
| Gemma4-E2B | qat_q4_0 | 3.1GB | 5.6GB | 128K | Google QAT 量化 |
| Nanbeige4.2-3B | q4_k_m | 2.6GB | 4GB | 128K | — |
| Ling-3.0-tiny | q4_k_m | 4.8GB | 6GB | 128K | 过 8K 上下文质量陡降，建议短会话 |
| Spark-X2.6-4B | q4_k_m | 3.5GB | 6GB | 128K | XHToken 出品（Apache-2.0，zh+en），原生 1M 上下文（按内存封顶），三档可控思考 |
| **MiniCPM-V-4.7-1B** | q4_k_m | 0.7GB | 2.4GB | 32K | **视觉模型**——附带 mmproj 投影文件，支持图像理解 |

所有模型默认 128K 窗口并按可用内存自动封顶（MiniCPM-V 为 32K）；长会话建议保持 ≥32K。

### 下载与激活（Web UI）

1. **Download（一键下载）** — 内置卡片未安装时只显示 **Download** 按钮，点击即下载当前推荐模型，进度实时显示（WS 推送）；下载支持断点续传，取消会保留半截文件
2. **切换模型（Switch Model）** — 已安装后卡片出现此按钮，打开向导并直接定位到**模型选择器**：可换目录中任意模型，或用「导入本地模型」卡片导入自己的 GGUF（拖入文件流式上传、或填服务器上的绝对路径；平台解析名称 / 量化 / 上下文并做 SHA-256 校验，导入模型与目录模型同等参与切换）
3. **Activate（设为默认）** — 内置服务运行中（卡片状态 **Running**）时可点击，激活即设为系统默认后端——AI Chat、计划型 Agent、规则引擎的 LLM 分析全部切换到内置模型，再次点击可确认当前激活状态

<img src="https://resources.camthink.ai/NeoMind/v1021b/builtin-model-ready.png" alt="内置模型就绪状态 — Main engine Running,可切换模型或设为默认" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

> 下载完成后卡片会显示引擎状态（如 `Main engine · LFM2.5-2.6B · ctx 8K · Running`）。上下文按可用内存自动封顶——空闲内存不足目录标注值时，顶部会出现黄色预警条提示推理可能变慢，可换轻量模型、清理内存或改用云端后端。

内置模型以 LlamaCpp 后端形态注册，与 Ollama / 云端后端平等参与默认切换；不需要时可停用，模型文件保留在数据目录可随时重新启用。

### 视觉理解（VLM）

目录中的 **MiniCPM-V-4.7-1B** 是视觉模型：选择它时平台会额外下载 mmproj 投影文件并拉起一个 vision companion 实例——此后 [AI Chat](./5-ai-chat.md) 可直接上传图片提问，AI Agent 也能分析相机画面（参见 [视觉大模型场景理解方案](../../edge-ai-solutions/vision-scene-understanding/solution-description)）。0.7GB 的体积让它成为边缘设备上成本最低的视觉方案。

## 方式一：Web UI 配置（推荐）

### Step 1：安装 Ollama 并拉取模型（本地后端）

按 [ollama.com](https://ollama.com) 指引安装。安装后 Ollama 默认监听 `http://localhost:11434`。

```bash
# 安装 Ollama（macOS / Linux）
curl -fsSL https://ollama.com/install.sh | sh

# 平衡之选（4B；建议配 16K 以上上下文）
ollama pull qwen3.5:4b

# 如需视觉能力（可读图），额外拉取视觉模型
ollama pull minicpm-v   # 或 llava 等
```

> **注意**：请使用 `qwen3.5:4b`。文档历史版本提到的 `ministral-3:3b` / `deepseek-r1:7b` 已不再推荐——前者工具调用不稳定，后者体积过大且在边缘硬件上速度欠佳。

> 跳过此步如果使用云端后端（OpenAI / Anthropic / GLM 等）。

### Step 2：进入 LLM 后端设置

打开 **Settings（设置） → LLM Backends（LLM 后端）**：

<img src="https://resources.camthink.ai/NeoMind/v1021b/settings-llm-list.png" alt="LLM 后端列表 — 点击 Add Backend 添加" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

后端以卡片形式呈现（内置模型 / Ollama / llama.cpp / Cloud AI），点击对应卡片中的 **添加实例（Add Instance）** 进入配置表单。

### Step 3：填写后端信息

#### Ollama（本地）

| 字段 | 值 |
|------|-----|
| 类型 | Ollama |
| Endpoint | `http://localhost:11434`（默认；远程主机替换为对应 IP） |
| 模型 | `qwen3.5:4b`（与 `ollama pull` 的名称一致） |
| Stream | 开启（推荐，流式输出体验更好） |

#### 云端（以 OpenAI 为例）

| 字段 | 值 |
|------|-----|
| 类型 | OpenAI 兼容协议（或 Anthropic 协议） |
| API Key | 你的 API Key（如 `sk-...`） |
| Base URL | 留空用官方；自建网关时填自定义端点 |
| 模型 | `gpt-4.1-mini`（或 `gpt-4o` / `gpt-4-turbo` 等） |

**国内厂商**：Qwen / DeepSeek / GLM / MiniMax 均使用 OpenAI 兼容协议，NeoMind 内置各厂商的默认 endpoint，只需填 API Key 与模型名即可。

#### 自定义网关（OpenAI 兼容端点）

如果你用的是 vLLM、Together AI、OpenRouter 等自建或第三方网关，在 **Cloud AI** 卡片中选择 **OpenAI 兼容（OpenAI-compatible）** 协议，填入：

- `base_url`：网关地址（如 `https://api.openrouter.ai/v1`）
- `api_key`：网关 Key
- `model`：网关暴露的模型名

<img src="https://resources.camthink.ai/NeoMind/v1021b/llm-backend-edit.png" alt="LLM 后端配置表单" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

保存后 NeoMind 会探测后端能力（工具调用、多模态、上下文窗口），自动写入能力标签。

### Step 4：设为默认并验证

在 **AI Chat** 顶部的模型选择器中选择该后端，即设为系统默认后端（当前默认后端带「活跃」标记），也可以用 CLI `neomind llm activate <ID>` 激活。

然后进入 **AI Chat** 发送一句问候验证：

<img src="https://resources.camthink.ai/NeoMind/v1021b/chat-typing.png" alt="AI Chat 验证 LLM 连接" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

> 如果 AI Chat 无响应，检查：
> - Ollama 是否在运行：`ollama list` 应能看到已拉取的模型
> - 云端后端：API Key 是否有效、网络是否通
> - 更多见 [故障排查](./10-troubleshooting.md)


## 方式二：CLI 配置

不想点界面？以下命令完成从创建到激活的全流程。

### 1. 查看现有后端

```bash
neomind llm list
```

### 2. 查看可用模型（Ollama）

```bash
# 列出 Ollama 已拉取的模型
neomind llm models

# 或指定远程 Ollama
neomind llm models --endpoint http://192.168.1.100:11434
```

### 3. 创建后端

```bash
# Ollama 本地
neomind llm create --name local --type ollama \
  --endpoint http://localhost:11434 --model qwen3.5:4b

# OpenAI 云端
neomind llm create --name openai --type openai \
  --endpoint https://api.openai.com/v1 \
  --model gpt-4.1-mini --api-key sk-xxxx

# GLM 云端（OpenAI 兼容）
neomind llm create --name glm --type openai \
  --endpoint https://open.bigmodel.cn/api/paas/v4 \
  --model glm-4-flash --api-key xxx.xxx.xxx

# 自定义网关（OpenRouter 等，走 OpenAI 兼容协议）
neomind llm create --name router --type openai \
  --endpoint https://openrouter.ai/api/v1 \
  --model anthropic/claude-3.5-sonnet --api-key sk-or-xxxx
```

创建成功会返回后端 ID（如 `local` 或随机 ID）。

### 4. 测试连接

```bash
neomind llm test local
```

返回模型信息和响应状态 = 连接正常。

### 5. 设为默认

```bash
neomind llm activate local
```

### 6. 其他常用命令

```bash
# 查看后端详情（含能力标签）
neomind llm get local

# 更新模型或参数
neomind llm update local --model qwen3.5:8b --temperature 0.5

# 删除后端
neomind llm delete local
```

<details>
<summary>📖 CLI 参数速查</summary>

| 命令 | 说明 | 关键参数 |
|------|------|---------|
| `llm list` | 列出所有后端 | — |
| `llm get <id>` | 查看详情 | — |
| `llm models` | 列出 Ollama 可用模型 | `--endpoint <url>` |
| `llm create` | 创建后端 | `--name` `--type` `--endpoint` `--model` `--api-key` `--temperature` |
| `llm update <id>` | 更新配置 | `--model` `--endpoint` `--api-key` `--temperature` |
| `llm test <id>` | 测试连接 | — |
| `llm activate <id>` | 设为默认 | — |
| `llm delete <id>` | 删除 | — |

</details>


## 思考力度（Thinking Effort）

对支持推理的模型，可在后端能力面板统一控制思考力度：**none / low / medium / high**（部分后端支持更细档位）。NeoMind 把这一控制抽象为单一开关并自动映射到各后端的原生参数——Ollama 的 `think` 级别、OpenAI / 自定义 / GLM / Google 的 `reasoning_effort`、DeepSeek / Anthropic 的 `thinking`、Qwen 的 `enable_thinking`；不支持推理的后端会显示为只读徽标。

---

---

:::note Ollama 端点
NeoMind 调用 Ollama 的**原生 `/api/chat` 端点**（不是 `/v1/chat/completions`）——因此支持思维链（`thinking`）、原生多模态与 Ollama 原生流式/工具调用协议。自测时的 curl 示例与常见 404 排查见 [故障排查 — LLM / Ollama](./10-troubleshooting.md#llm--ollama)。
:::


## 多模态（视觉）能力

NeoMind 支持图像输入与视觉分析。视觉能力的启用取决于模型：

- **内置模型**：选择视觉款 **MiniCPM-V-4.7-1B**（0.7GB）即可，平台自动附带视觉投影并拉起 companion 实例，见[内置模型](#内置模型built-in-model零配置)
- **Ollama**：拉取视觉模型（如 `llava` / `minicpm-v`）后，在 [AI Chat](./5-ai-chat.md) 中可直接上传图片提问。
- **云端**：`gpt-4o` / `gpt-4o-mini` / `claude-sonnet-4-5` / `gemini-2.5-flash` / `qwen-vl` / `glm-4v` 等天然支持视觉。

NeoMind 会自动探测模型的多模态能力（通过 LiteLLM 注册表 + `/api/show` 运行时探测 + 名称启发式匹配）。如果自动探测不准，可在后端详情页手动覆盖 **Multimodal** 开关。


## 设置默认后端

一个 NeoMind 实例可配置**多个 LLM 后端**，但只有一个被标记为**默认**。默认后端用于：

- AI Chat 的初始对话
- 计划型 Agent 的执行
- 规则引擎中的 LLM 分析

:::tip 切换默认
- **Web UI**：AI Chat 顶部模型选择器 → 点选要设为默认的后端
- **CLI**：

```bash
# 查看所有后端及当前默认
neomind llm list

# 将指定后端设为默认
neomind llm activate local
```
:::


## 下一步

- [接入设备](./3-onboard-device.md) — 让 NeoMind 开始接收遥测数据
- [使用仪表板](./4-use-dashboard.md) — 可视化你的设备数据
- [AI Chat](./5-ai-chat.md) — 用自然语言查询设备状态

---


## 运行时升级与管理（llama.cpp Runtime）

内置模型的推理引擎是 llama.cpp。它现在可以**独立于平台版本升级**：内置卡片引擎列表下方有一行 **llama.cpp 运行时**，显示当前变体（CPU / CUDA / Jetson / Vulkan）与版本号，有可用更新时出现「可更新」徽章。

### 升级与回退

1. 点击「可更新」徽章或行尾的设置图标，打开运行时对话框（需管理员）
2. 对话框显示 `当前版本 → 推荐版本`；点击 **升级到 xxx** 即下载安装（进度实时显示），完成后自动重启内置 LLM 服务
3. **回退**：删除最近一次升级的运行时，回落到上一版或随平台安装的捆绑版本
4. **变体覆盖**：自动（按硬件检测：Jetson / 合格 NVIDIA GPU → CUDA，其余 CPU）/ CPU / CUDA / Vulkan / Jetson，排障时使用，下次引擎重启生效

推荐版本来自我们的更新通道（[camthink-ai/NeoMind-Runtimes](https://github.com/camthink-ai/NeoMind-Runtimes) 的 `runtimes.json`）——我们在验证过 Ubuntu 22.04 / glibc 2.35 兼容地板后才会推荐新版本；自托管的 Jetson / T4(CUDA) 构建带 SHA-256 校验。通道不可达时显示「无法检查更新」，现有功能不受影响。

升级只写入数据目录的版本化缓存（`data/llama-server/<版本>/`），不需要 root、不改安装目录，systemd / Docker / 裸 `neomind serve` / 桌面版行为一致。平台会自动选择**最新有效**的运行时（平台升级带来更新的捆绑版本时则用捆绑版本）；损坏的缓存会在启动时被自动剔除并回退。

## 受限网络（镜像与离线安装）

部分网络环境无法直连 huggingface.co / github.com。三个下载源都支持镜像覆盖（**设置 → LLM 后端 → 内置卡片 → 运行时 → 下载源**，或环境变量）：

| 源 | 设置键 | 环境变量 | 镜像示例 |
|----|--------|----------|----------|
| 模型下载（HuggingFace） | `llm_hf_base_url` | `NEOMIND_HF_BASE_URL` | `https://hf-mirror.com` |
| 模型目录 | `llm_catalog_url` | `NEOMIND_CATALOG_URL` | 任意可达的 catalog.json 副本 |
| 运行时更新通道 | `llm_runtime_channel_url` | `NEOMIND_RUNTIME_CHANNEL_URL` | 任意可达的 runtimes.json 副本 |

优先级：设置 > 环境变量 > 默认；留空恢复默认。模型下载仍会做 SHA-256 校验，镜像不会削弱完整性。目录不可达时模型列表显示「内置目录」徽章（回退到编译期列表）。

**完全离线**时，模型向导提供两条离线安装路径：**导入服务器上的模型文件**（填 GGUF 绝对路径）或**上传模型文件**（流式上传，上限 12GB）——平台解析 GGUF 头、校验并在失败时自动回滚，导入的模型与目录模型同等参与切换。`HTTP(S)_PROXY` 环境变量亦被下载链路支持。

---

*最后更新: 2026-10-21*