---
description: 基于 NeoMind 平台实现人物与目标识别及通知推送的完整方案，提供 YOLO Inference 扩展（边缘推理）和 AI Agent（LLM 智能分析）两种实现路径，支持 NE101/NE301 智能相机。
keywords: [NeoMind, YOLO, AI Agent, 人物识别, 目标检测, 通知推送, NE101, NE301, Ollama, Qwen]
tags: [NeoMind, 人物识别, YOLO, AI Agent, 通知推送]
---

# AI Agent and Extensions Solutions

---

## 1. 方案概述

NeoMind 支持强大的 AI Agent 和丰富的扩展功能。本次案例将使用 **YOLO Inference 扩展** 和 **AI Agent** 两种功能来实现目标检测与分析，并推送通知。

### 方案架构

**数据流向**：

```
NE101/NE301 图像采集 → NeoMind 平台（含 MQTT Broker）→ 推理/分析 → 仪表板展示 + 通知推送
```

| 环节 | 说明 |
|------|------|
| 图像采集 | NE101/NE301 通过定时抓拍或事件触发获取图像 |
| MQTT 传输 | 设备通过 MQTT 协议将图像数据上报至 NeoMind 内置 Broker |
| 推理/分析 | YOLO 扩展进行 ONNX 推理，或 AI Agent 通过 LLM 进行智能分析 |
| 结果展示 | 仪表板实时展示检测结果和统计数据 |
| 通知推送 | 检测到目标后自动推送通知 |

### 两种方案介绍

NeoMind 提供两种途径实现目标检测与通知推送，可根据场景需求选择或组合使用：

| | 方案 A：YOLO Inference 扩展 | 方案 B：AI Agent |
|------|---------------------------|------------------|
| **工作原理** | 在本地运行 ONNX 模型进行目标检测，默认使用 YOLOv8n（COCO 80 类），支持替换自训练模型 | 接入 LLM（示例：Ollama + Qwen3.5-4B），通过自然语言提示词定义检测逻辑与通知行为 |
| **通知机制** | 需在消息页面单独配置通知规则 | 提示词中直接定义通知触发条件与内容 |
| **适合场景** | 固定目标检测、对响应速度有要求、批量部署 | 检测逻辑灵活多变、需要上下文理解、快速原型验证 |

详细的性能对比与选型建议，请参见 [第 8 节](#8-方案对比与选型建议)。

---

## 2. 物料清单（BOM）

| 物料 | 型号/规格 | 数量 | 用途 | 必需 |
|------|----------|------|------|------|
| **智能相机** | NE101 或 NE301 | 1+ | 图像采集 | ✅ |
| **NeoMind 平台** | v0.8.0+ | 1 | 边缘 AI 管理 | [下载](https://github.com/camthink-ai/NeoMind/releases/latest) ✅ |
| **LLM 推理环境** | Ollama / OpenAI / Anthropic 等 | 1 | AI Agent 后端 | 方案 B |
| **太阳能供电套件** | 10W 光伏板 + 7AH 可充电电池 | 1 | 户外长期部署 | 可选 |

> 方案 A 仅需前两项；方案 B 额外需要 LLM 推理环境。

---

## 3. 前置准备

### 3.1 NeoMind 安装与配置

请先完成 NeoMind 的安装、注册和基本配置，详细步骤请参考 [NeoMind 快速入门](../user-guide/1-install-setup.md)。

### 3.2 LLM 后端配置（方案 B 必需）

如果选择方案 B（AI Agent），需要配置 LLM 后端。支持以下两种方式：

**方式一：本地部署 Ollama（推荐）**

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取 Qwen3.5-4B 模型
ollama pull qwen3.5:4b
```

**验证模型安装**：

```bash
ollama list
# 确认输出中包含 qwen3.5:4b
```

然后在 NeoMind 的 **Settings → LLM 配置** 中添加 Ollama 后端，端点地址为 `http://localhost:11434`，选择 `qwen3.5:4b` 模型。

**方式二：调用云端 LLM API**

在 NeoMind 的 **Settings → LLM 配置** 中添加对应的 LLM 后端：

- **OpenAI**：填写 API Key，选择模型（如 `gpt-4`）
- **Anthropic**：填写 API Key，选择模型（如 `claude-sonnet-4-6`）
- 其他兼容 OpenAI 接口的服务

### 3.3 设备接入

将 NE101 或 NE301 注册到 NeoMind 平台：

**步骤**：

1. 在 NeoMind 中进入 **设备管理** 页面
2. 点击 **添加设备**，选择对应的设备类型（NE101 或 NE301）
3. 填写设备 ID（与设备端一致）和 MQTT 主题（需要提前配置好 MQTT Broker）
4. 保存并等待设备上线

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/device-1.png)

> 详细的设备接入步骤请参考 [NeoMind 快速入门 - 设备管理](../user-guide/3-onboard-device.md)。

---

## 4. 方案 A：YOLO Inference 扩展

YOLO Inference 扩展使用 ONNX 模型在本地进行目标检测推理，响应速度快，支持 COCO 预训练类别和自定义模型替换。

### 4.1 安装 YOLO 扩展

**步骤 1**：进入 **Extensions（扩展）** 管理页面

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/1-extensions-page.png)

**步骤 2**：找到 **YOLO Device Inference** 扩展，点击安装

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/extension-page-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/extension-page-3.png" style={{width: '50%'}} />
</div>

**步骤 3**：安装完成后，启用扩展

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/extension-page-4.png)

### 4.2 验证推理结果

扩展启用并绑定设备后，当设备采集到图像时，YOLO 扩展会自动进行推理。在仪表板中添加 YOLO Device Inference 面板并绑定设备，即可在设备详情中查看推理的历史结果和历史图片：

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/device-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/device-3.png" style={{width: '50%'}} />
</div>

### 4.3 自定义模型替换

本次案例使用的是官方 YOLOv8 预训练模型（yolov8n.onnx），可检测 COCO 80 类常见目标（人、车、动物等）。

如果用户需要识别特定场景的目标（如工业缺陷、特定商品、安全帽佩戴等），可以自行训练模型后替换：

**模型文件路径**：

```
~/Library/Application Support/com.neomind.neomind/data/extensions/yolo-device-inference/models/yolov8n.onnx
```

**替换步骤**：

1. 使用 YOLOv8 框架训练自定义模型，导出为 ONNX 格式
2. 将训练好的 ONNX 模型文件替换上述路径中的 `yolov8n.onnx`
3. 重启 NeoMind 应用

> **注意**：替换的模型必须是 ONNX 格式，且输入输出格式需与 YOLOv8 兼容。

---

## 5. 方案 B：AI Agent

AI Agent 通过 LLM 大语言模型对图像进行智能分析，使用自然语言提示词定义检测逻辑和通知行为，适合复杂灵活的分析场景。

### 5.1 创建 AI Agent

**步骤 1**：进入 **AI Agent** 管理页面

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/ai-agent-1.png)

**步骤 2**：点击 **创建 Agent**，填写基本信息：

- **名称**：例如 "人物识别与通知智能体"
- **描述**：检测图像中的人物并提供通知

### 5.2 配置提示词与执行规则

AI Agent 的核心是提示词（Prompt）和执行规则。通过配置提示词定义分析逻辑，通过执行规则定义触发条件。

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/ai-agent-3.png)
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/ai-agent-4.png)
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/ai-agent-5.png)

**配置步骤**：

1. **输入提示词**：定义 Agent 的分析逻辑和通知行为

**提示词示例**：

```
Detect objects in images, identify people and their characteristics,
count total people. When detected, notify user with:
1) detection results,
2) total person count,
3) each person's characteristics
```

2. **选择执行规则**：定义何时触发 Agent。本次案例使用 **Event 触发**，选择指定设备，当 Image Data 到达时自动触发 Agent 调用 LLM 进行分析

3. **用户可灵活配置**：根据业务需求调整提示词内容、触发条件和关联设备

**提示词编写要点**：

| 要素 | 说明 | 示例 |
|------|------|------|
| **检测目标** | 明确要检测的对象 | "identify people and their characteristics" |
| **数量统计** | 要求计数 | "count total people" |
| **通知条件** | 何时触发通知 | "When detected, notify user" |
| **通知内容** | 通知包含哪些信息 | "detection results, person count, characteristics" |

> **提示**：提示词支持自然语言描述，可以根据业务需求灵活调整。例如加入 "wearing safety helmet" 可以检测是否佩戴安全帽，加入 "entering restricted area" 可以检测闯入禁区。

### 5.3 验证 Agent 运行

Agent 创建并启用后，当关联设备有新的图像数据时，Agent 会自动触发 LLM 进行分析，并通过内部通知推送结果。在聊天界面中可以查看 Agent 的分析结果和通知记录。

---

## 6. 仪表板配置

在仪表板中可以同时展示两种方案的推理结果，直观对比 YOLO 扩展和 AI Agent 的检测效果。

### 6.1 创建仪表板

进入 **Dashboard（仪表板）** 管理页面，点击 **创建仪表板**：



### 6.2 添加 YOLO Inference 面板

在仪表板中点击 **添加面板**，选择 **YOLO Device Inference** 扩展类型，并绑定设备：

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-12.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-13.png" style={{width: '50%'}} />
</div>

绑定设备后，当设备采集到图像时，YOLO 扩展会自动推理并在面板中展示检测结果，包括标注后的图像和检测到的目标类型、数量：
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-3.png)

### 6.3 添加 AI Agent 面板

在仪表板中添加 **AI Agent** 面板，选择已创建的 AI Agent。当图片到达 NeoMind 时，会自动触发 LLM 根据提示词要求进行分析，并返回结果：
<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-8.png" style={{width: '33%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-9.png" style={{width: '33%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-10.png" style={{width: '33%'}} />
</div>

### 6.4 查看综合结果
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-1.png)

完成后的仪表板可以同时展示 YOLO 扩展和 AI Agent 两种方案的检测结果，方便对比：
<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-6.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/dashboard-3.png" style={{width: '50%'}} />
</div>

---

## 7. 通知推送

### 7.1 应用内通知

根据 AI Agent 的提示词配置，当检测到目标时，NeoMind 会自动在 App 上显示通知。点击通知标签，可以查看具体的通知细节，关联检测图片。

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/notification-1.png)

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ai-agent-and-extension-solutions/notification-2.png)

### 7.2 邮件通知（可选）

如果用户需要通过邮件接收通知，可以进行以下配置：

**步骤 1**：在 **Settings** 中添加 Email Channel，配置 SMTP 服务器信息（服务器地址、端口、用户名、密码等）

**步骤 2**：进入 **Messages（消息）** 页面，创建通知规则，设置触发条件（如检测到人物时触发），选择邮件通知渠道，保存规则即可

---

## 8. 方案对比与选型建议

### 详细对比

| 维度 | 方案 A：YOLO Inference 扩展 | 方案 B：AI Agent |
|------|---------------------------|------------------|
| **检测精度** | 高（专业检测模型） | 中（依赖 LLM 图像理解能力） |
| **响应速度** | 毫秒级 | 秒级 |
| **部署难度** | 低（一键安装扩展） | 中（需配置 LLM 后端） |
| **硬件要求** | 低 | 较高（需要 GPU 或大内存支持 LLM） |
| **灵活度** | 参数可调，支持替换自定义模型 | 提示词可自由定义检测逻辑 |
| **通知方式** | 需额外配置通知规则 | 提示词直接驱动 |
| **可扩展性** | 支持替换 ONNX 模型 | 支持修改提示词和切换 LLM |

### 选型建议

**选择方案 A（YOLO 扩展）**：

- **固定目标检测**：支持 COCO 80 类常见目标（人、车、动物等），也可替换自训练模型检测特定目标
- **实时性要求高**：毫秒级响应，适合对延迟敏感的场景
- **资源有限**：不需要 LLM 环境，资源占用低
- **批量部署**：多台设备统一检测逻辑，配置简单

**选择方案 B（AI Agent）**：

- **灵活的分析需求**：检测逻辑经常变化，通过修改提示词即可调整
- **复杂场景描述**：需要理解图像中的上下文关系（如人员行为、场景描述）
- **自定义通知内容**：通知内容需要包含丰富的分析信息
- **快速原型验证**：无需训练模型，通过提示词快速验证检测方案

**组合使用**：两种方案可以同时运行。例如，YOLO 扩展负责实时快速检测，AI Agent 负责深度分析和异常行为理解，两者互为补充。

---

*最后更新: 2026-06-15*
