---
description: NeoMind 语音能力方案——voice-assistant 实时语音助手（浏览器麦克风 → VAD → ASR → LLM → TTS → 扬声器）配合 sensevoice-asr 语音识别与 cosyvoice-3 / voice-edge-tts / moss-tts-nano 三个可互换的 TTS 扩展，覆盖语音助手、语音输入、语音播报与克隆等场景。
keywords: [NeoMind, 语音助手, ASR, TTS, sensevoice, cosyvoice, voice-assistant, 语音克隆]
tags: [NeoMind, 语音, ASR, TTS]
sidebar_label: "Voice & Speech"
---

# Voice Assistant & Speech Capabilities

> NeoMind 的语音能力——**voice-assistant** 实时助手 + 可互换的 ASR / TTS 扩展，覆盖语音助手、语音输入、播报与音色克隆。

> ⚠️ voice-assistant 当前为 **PoC（概念验证）** 版本，回复合逻辑仍是 echo（原样回显），后续将切换为 NeoMind Agent 调用。ASR / TTS 扩展本身已是可用版本。

---

## 1. 方案概述

NeoMind 的语音能力由一个编排扩展和若干能力扩展组成：

| 角色 | 扩展 | 能力 |
|---|---|---|
| 语音助手编排 | **voice-assistant**（PoC）| 实时 pipeline：VAD → ASR → 回显（将切 Agent）→ TTS |
| 语音识别（ASR） | sensevoice-asr | SenseVoice-Small，5 语种（中英日韩粤），CPU ONNX |
| 文字转语音（TTS） | cosyvoice-3 / voice-edge-tts / moss-tts-nano | 三者接口相同（`/tts/stream` NDJSON），可互换 |

**voice-assistant 数据流**：

```mermaid
flowchart LR
    MIC["浏览器麦克风<br/>16kHz mono PCM"] -->|"WebSocket"| EXT["voice-assistant 扩展"]
    EXT -->|"WebSocket"| ORCH["Python 编排服务<br/>VAD → ASR → 回显（→Agent）→ TTS"]
    ORCH -->|"PCM 回推"| SPK["浏览器扬声器"]
    ORCH -.->|"ws://127.0.0.1:9375"| LLM["NeoMind LLM 端点"]
```

ASR 与 TTS 既能被 voice-assistant 编排，也能单独调用（语音输入、语音播报）。

---

## 2. 物料清单（BOM）

| 物料 | 规格 | 用途 | 必需 |
|------|------|------|------|
| **NeoMind 平台** | v0.9.0+ | 扩展宿主 | ✅ |
| **voice-assistant**（语音助手）或 sensevoice-asr / TTS 扩展 | — | 按场景选 | ✅ |
| **LLM 端点** | NeoMind 内置（ws://127.0.0.1:9375）| 语音助手回复合成 | 语音助手 |
| **麦克风 / 扬声器** | 浏览器或主机音频 | 录音 / 播放 | 语音助手 |
| **GPU（可选）** | NVIDIA | cosyvoice-3 高质量 TTS | 可选 |

---

## 3. 安装扩展

按场景从 **Extensions（扩展）** 页的扩展市场安装对应扩展（market 2.7.x 均可）：

| 场景 | 需安装的扩展 | 额外准备 |
|------|------------|----------|
| 实时语音助手（完整听说链路）| **voice-assistant** | Python 编排服务（见 [4.1](#41-部署-python-编排服务)）|
| 仅语音输入 / 录音转写 | **sensevoice-asr** | ASR Python 推理服务（见 [5.1](#51-部署推理服务)）|
| 仅语音播报 / 音色克隆 | **moss-tts-nano** / **cosyvoice-3** / **voice-edge-tts** 三选一 | 对应 TTS Python 推理服务（见 [6.3](#63-部署与配置)）|

安装步骤：

1. 进入 **Extensions** 页，打开扩展市场，搜索扩展名（如 `voice-assistant`）并安装；
2. 安装完成后回到扩展列表，确认该扩展状态为 **Running**；
3. 这些扩展的 Rust 部分装好即用，但**各自的 Python 推理 / 编排服务是独立进程**，需要按后文步骤单独启动——扩展通过 HTTP / WebSocket 访问它们（默认端口：编排服务 9384、sensevoice-asr 9383、moss-tts-nano 9382、cosyvoice-3 9385、voice-edge-tts 9386）。

> 安装与管理扩展的通用操作见 [扩展管理](../user-guide/9-extensions.md)。

---

## 4. 语音助手（voice-assistant）

### 4.1 部署 Python 编排服务

默认 **all-in-one 模式**（`default` profile）：SenseVoice ASR + ZipVoice TTS 在 Python 编排服务内进程运行，无需单独起 ASR/TTS 服务；只需 NeoMind LLM 端点可达。

```bash
cd extensions/voice-assistant/service
python -m venv .venv
.venv/bin/pip install -r requirements.txt   # 约 700MB ONNX Runtime 依赖
./start.sh
```

首次启动下载约 400MB 模型权重到 `~/.cache/sherpa-onnx/`：

| 模型 | 体积 | 用途 |
|------|------|------|
| `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17` | ~230MB | ASR |
| `sherpa-onnx-zipvoice-distill-int8-zh-en-emilia` | ~170MB | TTS 编码器/解码器 |
| `vocos_24khz.onnx` | ~22MB | TTS vocoder |

后续启动从缓存加载（约 2–3 秒）。zero-shot TTS 的默认提示音频已随包内置（`service/assets/default_prompt.{wav,txt}`），`voice='中文女'` 开箱即用。

NeoMind API Token 可用环境变量 `export NEOMIND_TOKEN=nmk_xxx` 设置，也可在卡片配置对话框里填写（推荐——对话框会在每次会话开始前推送给编排服务）。

编排服务常用环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VOICE_ASSISTANT_PROFILE` | `neomind-capability`（start.sh 默认）| 初始 profile。`default` = 内置 SenseVoice + ZipVoice + NeoMind WS LLM 全家桶；`neomind-capability` = LLM 经宿主 ChatStream 能力调用（扩展侧免 token）|
| `VOICE_ASSISTANT_VAD_BACKEND` | `silero` | VAD 后端：`silero` / `energy` / `fsmn`（噪声环境建议 `fsmn`）|
| `VOICE_ASSISTANT_HOST` / `VOICE_ASSISTANT_PORT` | `127.0.0.1` / `9384` | 编排服务监听地址 |
| `SENSEVOICE_ASR_MODEL_DIR` | `~/.cache/sherpa-onnx` | ASR 模型缓存目录 |
| `VOICE_EDGE_TTS_MODEL_DIR` | `~/.cache/sherpa-onnx` | TTS 模型 + vocoder 缓存目录 |
| `NEOMIND_TOKEN` | （按 profile 需要）| NeoMind LLM API Token，也可经卡片配置下发 |

扩展侧环境变量：`VOICE_ASSISTANT_ORCHESTRATOR_URL`（默认 `ws://127.0.0.1:9384/ws`），指定 Rust 扩展桥接的编排服务 WS 地址。

> 其余可选 profile：`edge-arm`（RK3588 / Jetson + 本地 ollama）、`noisy-env`（高噪环境提高 VAD 阈值）、`headset`（近场耳机）、`kokoro-qwen3` 等，见扩展 README。

### 4.2 卡片配置参数（VoiceAssistantCard）

在 Dashboard 添加 **voice-assistant** 扩展的 **VoiceAssistantCard** 卡片后，配置对话框暴露以下字段（会话开始前经 HTTP `POST /config` 推送给编排服务，改完下一次开麦即生效，无需重启服务）：

| 字段 | 类型 / 取值 | 说明 |
|------|------------|------|
| `wsUrl` | string，默认 `http://127.0.0.1:9384` | 编排服务地址（http:// 或 ws://、带不带 `/ws` 均可，自动归一化）|
| `profile` | 下拉 | 运行时切换 profile，触发后端重载（进程内模型约 1–3 秒）|
| `neoMindToken` | string（密码框）| NeoMind API Token，仅存于编排服务进程内存 |
| `language` | `auto` / `zh` / `en` / `ja` / `ko` / `yue` | ASR 语言提示，即时生效 |
| `voice` | string（如 `中文女`）| TTS 音色，即时生效 |
| `showTranscripts` | boolean | 是否显示实时字幕 / 对话 |
| `showMetrics` | boolean | 是否显示延迟面板 |
| `directMode` | boolean | **Direct Python WS Mode** 复选框。默认关：前端连宿主 `/api/extensions/voice-assistant/stream` 端点，LLM 经宿主 ChatStream 能力调用（免 token）；开启后直连 `ws://127.0.0.1:9384/ws`，由编排服务持 token 调 LLM。切换后需关闭重开卡片 |

> 两种模式的取舍：默认 stream 模式下宿主能看到每次 LLM 调用（审计 / 治理），token 不出宿主进程；direct 模式用于单独调试 Python 编排服务。

### 4.3 使用步骤

1. 确认编排服务已启动：`curl http://127.0.0.1:9384/config` 应返回当前配置与可用 profile 列表；
2. 在 Dashboard 添加 **VoiceAssistantCard**；
3. 打开卡片配置对话框：核对 `wsUrl`，按需选择 `language`、`voice`（直连模式需填 `neoMindToken`），保存；
4. 点麦克风按钮并在浏览器提示中**允许麦克风权限**，Orb 进入 LISTENING；
5. 说话——默认**免提模式**持续监听，VAD 自动断句；也支持**按住说话**（push-to-talk）。转写实时出现在字幕区，随后 Orb 依次经过 THINKING → SPEAKING，回复合成语音播报；
6. 播报中直接开口即可**打断**（barge-in）：播放淡出停止，回到 LISTENING 继续听；
7. 再点一次麦克风按钮结束会话。

> 📷 待补截图｜语音助手卡片 · 建议路径 `…/neomind/voice/01-assistant-card.png`

### 4.4 验证

逐项核对：

- [ ] 卡片底部显示 **Connected**；
- [ ] 点麦克风后状态徽标从 STANDBY 变为 **LISTENING**，Orb 随说话幅度起伏；
- [ ] 说一句话后字幕区先出现用户转写，Orb 转 **THINKING** → **SPEAKING** 并播报回显（当前 PoC 为"你说的是：…"）；
- [ ] 头部延迟面板出现 **ASR / LLM / TTS / Total** 数字——PoC 实测从 ASR 完成到听到首段音频约 200ms；
- [ ] 播报中插话能立即打断（barge-in）。

---

## 5. 语音转文字（sensevoice-asr）

SenseVoice-Small（234M 参数 INT8，`sherpa-onnx` ONNX CPU 后端），支持中、英、日、韩、粤 5 语种。可单独用于语音输入转 Agent、录音转写等。

### 5.1 部署推理服务

```bash
cd extensions/sensevoice-asr/service
pip install -r requirements.txt
./start.sh        # 监听 http://127.0.0.1:9383
```

首次运行下载约 230MB ONNX 权重到 `~/.cache/sherpa-onnx/`。冒烟验证：

```bash
curl http://127.0.0.1:9383/health
```

服务端环境变量：`SENSEVOICE_ASR_SERVICE_URL`（扩展侧服务地址，默认 `http://127.0.0.1:9383`）、`SENSEVOICE_ASR_LANGUAGE`（默认语言提示，`auto`）、`SENSEVOICE_ASR_MODEL_DIR`（权重目录）、`SENSEVOICE_ASR_CPU_THREADS`（ONNX Runtime 线程数，默认 2）。

### 5.2 命令与参数

扩展共 4 个命令：

| 命令 | 说明 | 典型用途 |
|------|------|----------|
| `transcribe` | 文件路径或 base64 WAV → 返回文字 | 语音输入、转写界面 |
| `transcribe_file` | 仅按本地路径转写（便捷封装）| 预录制音频流水线 |
| `health` | 探测 Python 服务可达性 | 监控 |
| `languages` | 列出支持的语种提示 | UI 下拉框 |

**`transcribe` 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `audio_path` | string | 二选一 | 本地音频路径（wav/mp3/m4a/flac），与 `audio_base64` 互斥 |
| `audio_base64` | string | 二选一 | base64 编码的 WAV 字节（如浏览器录音），与 `audio_path` 互斥 |
| `language` | string | 否 | 语种提示：`auto`（默认，混合语可用）/ `zh` / `en` / `ja` / `ko` / `yue` |
| `use_itn` | boolean | 否 | 逆文本正则化（口语数字转写为阿拉伯数字等），默认 `true` |

**`transcribe_file` 参数**：`path`（string，必填，本地音频路径）、`language`（同上）。

### 5.3 调用示例

在扩展详情页 **Commands** 标签展开 `transcribe`、填参执行；也可经 REST API 供 AI Agent / 自动化规则调用（**没有** `neomind extension invoke` 这类 CLI）：

```bash
curl -X POST -H "X-API-Key: $NEOMIND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"command":"transcribe","args":{"audio_path":"/tmp/recording.wav","language":"auto"}}' \
     http://localhost:9375/api/extensions/sensevoice-asr/command
```

期望输出结构：

```json
{ "text": "你好，今天天气怎么样？", "language": "auto",
  "elapsed_seconds": 0.21, "duration_seconds": 12.5, "rtf": 0.017 }
```

`rtf`（实时率）约 0.017（M2 / 2 线程实测）：10 秒录音约 0.2 秒完成转写。

> 📷 待补截图｜transcribe 命令 · 建议路径 `…/neomind/voice/02-asr.png`

---

## 6. 文字转语音（TTS，三选一）

### 6.1 选型

三个 TTS 扩展共用 `/tts/stream` NDJSON 接口，voice-assistant 改一个环境变量即可换后端。按部署平台和质量选：

| 维度 | moss-tts-nano | cosyvoice-3 | voice-edge-tts |
|---|---|---|---|
| 平台 | CPU 全平台 | 需 CUDA（Linux / Jetson；Mac 仅 MPS 兜底、速度不可用）| **Mac CPU / Linux ARM CPU** |
| 中文质量 | 一般 | 优秀 | 良好 |
| 音色克隆 | 支持（MOSS）| 支持（zero-shot，需 `prompt_text`）| 支持（zero-shot）|
| 体积 | ~200MB | ~1GB（首次下载约 2GB）| ~150MB |
| 语种 | 20+ | 中英 | 中英 |
| 内置音色 | 18 个（Junhao、Ava、Saki 等）| 7 个（中文女/中文男/英文女/英文男/日语男/粤语女/韩国女）| 中文女（可换参考音频定制）|

> 选型：要最高质量且有 GPU → cosyvoice-3；Mac/ARM 边缘设备 → voice-edge-tts；要多语种 + 克隆 + 全平台 CPU → moss-tts-nano。

### 6.2 统一命令与 `/tts/stream` 契约

三者命令一致：

| 命令 | 说明 |
|------|------|
| `speak` | 合成并直接在**主机音频设备**播放 |
| `synthesize` | 合成返回 base64 WAV（不播放）|
| `stop_speaking` | 立即停止当前播放并清空缓冲 |
| `list_voices` | 列出服务端可用音色 |
| `health` | 探测 Python 服务 |

**`speak` / `synthesize` 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | ✅ | 要合成的文本 |
| `voice` | string | 否 | 内置音色名，覆盖各扩展的默认音色（MOSS 默认 `Junhao`，cosyvoice/edge 默认 `中文女`）|
| `prompt_audio_path` | string | 否 | 参考音频 wav 路径，用于音色克隆，设置后覆盖 `voice` |
| `prompt_text` | string | 仅 cosyvoice-3 | 参考音频的转写文本，zero-shot 克隆必需 |
| `sample_mode` | string | 否 | `greedy`（默认，确定性输出，Agent 播报推荐）/ `fixed` / `full` |
| `blocking` | boolean | 仅 `speak` | 默认 `true`（播完才返回）；`false` 后台播放、立即返回 |

`synthesize` 返回结构：`{ "audio_base64": "...", "format": "wav", "sample_rate": 48000, "duration_ms": 1834, "size_bytes": 351232 }`（`sample_rate` 随后端不同：cosyvoice-3 / voice-edge-tts 为 24000，moss-tts-nano 为 48000 双声道）。

`/tts/stream` NDJSON 契约（三者一致，编排服务按行解析 PCM 流）：

```
POST /tts/stream
Body: {"text": "...", "voice": "...", ...}
响应（每行一个 PCM 块）:
  {"seq": 0, "data": "<base64 int16 LE PCM>", "sample_rate": 24000, "channels": 1, "is_pause": false}
```

### 6.3 部署与配置

#### moss-tts-nano（CPU 全平台）

（CPU 全平台，0.1B，48kHz 立体声，20+ 语种）：需先克隆上游 [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano) 仓库并 `pip install -e .`（pynini 建议用 conda 装），首次运行下载 ~200MB ONNX 权重：

```bash
cd extensions/moss-tts-nano/service
MOSS_TTS_NANO_REPO=~/MOSS-TTS-Nano ./start.sh    # 监听 http://127.0.0.1:9382
```

关键配置：`MOSS_TTS_SERVICE_URL`（默认 `http://127.0.0.1:9382`）、`MOSS_TTS_VOICE`（默认 `Junhao`）、`MOSS_TTS_NANO_REPO`、`MOSS_TTS_MODEL_DIR`、`MOSS_TTS_CPU_THREADS`（默认 4）。也提供 Docker 镜像（挂载模型目录、`-p 9382:9382`）。

#### cosyvoice-3（GPU 高质量）

（0.5B，24kHz，质量最高）：Python 3.10+，首次运行从 ModelScope 下载约 2GB 模型到 `~/.cache/modelscope/`（约 5–10 分钟），目标首包不超过 200ms、30 字句子合成不超过 500ms：

```bash
cd extensions/cosyvoice-3/service
pip install -r requirements.txt
./start.sh        # 监听 http://127.0.0.1:9385
```

关键配置：`COSYVOICE_SERVICE_URL`（默认 `http://127.0.0.1:9385`）、`COSYVOICE_VOICE`（默认 `中文女`）、`COSYVOICE_MODEL_DIR`（ModelScope ID 或本地路径）、`COSYVOICE_HOST` / `COSYVOICE_PORT`、`PYTORCH_ENABLE_MPS_FALLBACK=1`。Linux / Jetson 生产环境建议 Docker + `--gpus all`。

#### voice-edge-tts（Mac / ARM 边缘）

（sherpa-onnx ZipVoice，~150MB，Mac/ARM CPU 友好）：

```bash
cd extensions/voice-edge-tts/service
pip install -r requirements.txt
./start.sh        # 监听 http://127.0.0.1:9386，首次下载 ~150MB 到 ~/.cache/sherpa-onnx
curl http://127.0.0.1:9386/health
# {"status":"ok","sample_rate":24000,"voices":["中文女"]}
```

关键配置：`VOICE_EDGE_TTS_HOST` / `VOICE_EDGE_TTS_PORT`（默认 9386）、`VOICE_EDGE_TTS_CPU_THREADS`（默认 2）、`VOICE_EDGE_TTS_MODEL_DIR`。定制音色：替换 `service/assets/default_prompt.wav` 与同名 `.txt`（**转写必须与音频一致**，建议 5–10 秒干净 16kHz 单声道人声）。

**主机音频要求**（`speak` 播放路径，经 rodio/cpal）：macOS CoreAudio 开箱即用；Linux 需 ALSA（构建时 `libasound2-dev`、运行时 `libasound2`），且主机需有可用音频输出设备、不被其他进程独占；Windows WASAPI 开箱即用。无音频后端的平台上 `speak` 会报错，可改用 `synthesize` 拿 WAV 自行播放。

**接入 voice-assistant**：改一个环境变量即可切换 TTS 后端（`VOICE_ASSISTANT_TTS_URL` 优先于 `MOSS_TTS_URL`）：

```bash
export MOSS_TTS_URL=http://127.0.0.1:9385          # 例：切到 cosyvoice-3
# 或 export VOICE_ASSISTANT_TTS_URL=http://127.0.0.1:9386   # 切到 voice-edge-tts
export VOICE_ASSISTANT_VOICE=中文女
```

---

## 7. 典型场景

- **实时语音助手**：voice-assistant 端到端对话（PoC，后续接 Agent 做设备控制 / 信息查询）。免提模式适合展厅接待 / 信息亭；嘈杂产线建议 `noisy-env` profile 或按住说话。
- **语音输入转 Agent**：sensevoice-asr 把语音转文字，喂给 [AI Agent](../user-guide/6-ai-agent.md) 或 AI Chat 执行——如现场口述工单：浏览器录音 → `transcribe(audio_base64=…)` → 文本进 Agent 生成工单。
- **语音播报**：TTS 把告警、读数、Agent 回复合成语音播报，用于展厅、产线广播、无障碍。**规则联动**：[自动化规则](../user-guide/7-automation-rules.md) 支持调用扩展命令，可在规则动作里调用 TTS 的 `speak`（`blocking: false` 后台播放）——例如温度越限规则触发 → `speak {"text":"警告：3 号仓温度超限","blocking":false}` 由边缘主机音箱播报。
- **音色克隆**：用 moss-tts / cosyvoice / voice-edge 的 zero-shot 克隆定制音色——准备目标人声参考 wav（cosyvoice 还需其转写文本 `prompt_text`），调 `speak` 时传 `prompt_audio_path` 即得以该音色播报；voice-edge 可直接替换默认提示音频打包成长期音色。

---

## 8. 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 点麦克风即报 "Microphone access denied"，Orb 转 ERROR | 浏览器 / 客户端拒绝了麦克风权限 | 在浏览器地址栏权限设置里允许麦克风；macOS 桌面客户端还需在系统设置 → 隐私与安全性 → 麦克风中授权 |
| 卡片报 "WebSocket connection failed" / "Stream connection failed"，状态 ERROR | Python 编排服务未启动或地址不对 | 在部署机上 `./start.sh` 启动编排服务，`curl http://127.0.0.1:9384/config` 验证；核对卡片 `wsUrl` |
| 编排服务首次启动很慢或失败 | 首次需下载约 400MB 模型权重（FSMN VAD 还会拉取 ~500KB 模型）| 检查网络 / 代理；权重可手动下载后放入 `~/.cache/sherpa-onnx/`，重启即从缓存加载 |
| `transcribe` / `speak` 报服务不可达，`health` 返回 `ok:false` | 对应 Python 推理服务没起 | 按各节启动服务并 `curl /health`：sensevoice 9383 / moss 9382 / cosyvoice 9385 / voice-edge 9386 |
| cosyvoice-3 合成极慢或不可用 | 无 NVIDIA GPU：Mac 仅 MPS/CPU 兜底（RTF ~2.5×，不可用），cosyvoice 面向 Linux + CUDA | 换 voice-edge-tts（Mac/ARM CPU）或 moss-tts-nano（CPU 全平台）；GPU 服务器用 Docker `--gpus all` 部署 |
| `speak` 无声或报音频设备错误 | 主机无可用音频输出设备、被独占，或 Linux 缺 ALSA 库 | 确认主机扬声器可用、无其他进程独占；Linux 安装 `libasound2`；或改用 `synthesize` 返回 WAV 自行播放 |
| 免提模式下没说话也出现"幻影转写"、播报被自己的声音打断 | 扬声器声音漏进麦克风触发 VAD（回声）| 默认 `echo_window` AEC 已抑制大部分；仍误触发可改按住说话，或配置 `webrtc` AEC（`pip install webrtc-audio-processing`）|
| stream 模式下 401 / 连接被拒或一直卡在 THINKING | 页面 JWT 过期或能力事件未路由 | 刷新页面重新获取 token；仍卡住检查编排服务日志与扩展日志 |

---

## 9. 附录

### 相关文档

- [扩展管理](../user-guide/9-extensions.md)
- [AI Agent](../user-guide/6-ai-agent.md)
- [AI Chat](../user-guide/5-ai-chat.md)
- [配置 LLM 后端](../user-guide/2-configure-llm.md)
- voice-assistant / sensevoice-asr / cosyvoice-3 / voice-edge-tts / moss-tts-nano 扩展 README

---

*最后更新: 2026-09-08*
