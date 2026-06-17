---
description: 基于 NeoMind 平台的 OCR 通用文字识别方案，通过 OCR 扩展实现图像文字提取，支持仪表板展示、历史记录查看和 AI Chat 自然语言查询，适用于 NE101/NE301 智能相机。
keywords: [NeoMind, OCR, 文字识别, NE101, NE301, OCR 扩展, 仪表板, AI Chat]
tags: [NeoMind, OCR, 文字识别, 扩展]
---

# OCR Solution

---

## 1. 方案概述

NeoMind 的 **OCR 扩展** 可对设备采集的图像进行通用文字识别，提取图片中的文字内容并在仪表板中展示。识别结果还可通过 **AI Chat** 以自然语言方式查询。

**典型应用场景**：

| 场景 | 说明 |
|------|------|
| 铭牌读取 | 识别设备铭牌上的型号、序列号、参数等信息 |
| 标签识别 | 读取产品标签、条码旁的文字说明 |
| 文档数字化 | 将纸质文档、告示牌等内容转为可检索的文字 |
| 仪表读数 | 识别数字仪表盘上的读数（如电表、水表） |

**数据流向**：

```
NE101/NE301 图像采集 → NeoMind 平台 → OCR 扩展识别 → 仪表板展示 + AI Chat 查询
```

| 环节 | 说明 |
|------|------|
| 图像采集 | NE101/NE301 通过定时抓拍或事件触发获取图像 |
| OCR 识别 | OCR 扩展自动对图像进行文字提取 |
| 结果展示 | 仪表板实时展示识别结果，支持查看历史记录 |
| AI Chat 查询 | 通过自然语言查询已识别的文字内容 |

---

## 2. 物料清单（BOM）

| 物料 | 型号/规格 | 数量 | 用途 | 必需 |
|------|----------|------|------|------|
| **智能相机** | NE101 或 NE301 | 1+ | 图像采集 | ✅ |
| **NeoMind 平台** | v0.8.0+ | 1 | 边缘 AI 管理 | [下载](https://github.com/camthink-ai/NeoMind/releases/latest) ✅ |

---

## 3. 前置准备

### 3.1 NeoMind 安装与配置

请先完成 NeoMind 的安装、注册和基本配置，详细步骤请参考 [NeoMind 快速入门](../user-guide/1-install-setup.md)。

### 3.2 设备接入

将 NE101 或 NE301 注册到 NeoMind 平台：

1. 在 NeoMind 中进入 **设备管理** 页面
2. 点击 **添加设备**，选择对应的设备类型（NE101 或 NE301）
3. 填写设备 ID 和 MQTT 主题
4. 保存并等待设备上线

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-0.png)

> 详细的设备接入步骤请参考 [NeoMind 快速入门 - 设备管理](../user-guide/3-onboard-device.md)。

---

## 4. 安装 OCR 扩展

**步骤 1**：进入 **Extensions（扩展）** 管理页面，找到 **OCR** 扩展
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-2.png)

**步骤 2**：点击安装
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-3.png)

**步骤 3**：安装完成后，启用扩展
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/extensions-1.png)

---

## 5. 仪表板配置与设备绑定

### 5.1 创建仪表板

进入 **Dashboard（仪表板）** 管理页面，点击 **创建仪表板**。

### 5.2 添加 OCR 面板并绑定设备

在仪表板中点击 **添加面板**，选择 **OCR** 扩展类型，并绑定目标设备：

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-1.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-2.png" style={{width: '50%'}} />
</div>

绑定完成后，OCR 面板将自动接收并处理该设备采集的图像：

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-3.png)
用户可在 Dashboard 页面添加其他所需的组件，提供更多的数据和内容展示。

---

## 6. 触发测试与查看结果

### 6.1 触发抓拍测试

设备绑定后，可通过手动触发抓拍来验证 OCR 识别效果。设备采集到图像后，OCR 扩展会自动进行文字识别。

### 6.2 查看识别结果

在仪表板的 OCR 面板中可以查看实时识别结果，包括原始图像和提取的文字内容：

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/dashboard-4.png)

### 6.3 查看历史识别记录

在设备详情中可以查看所有历史 OCR 识别记录，包括每次识别的原始图片和提取结果：
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-0.png)

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/device-3.png" style={{width: '50%'}} />
</div>

---

## 7. AI Chat 查询

OCR 识别结果存储后，可以在 **AI Chat** 中通过自然语言查询已识别的文字内容。例如：

```
Hello, what's the OCR result of my device ne301-new? Reply in English.
```

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/ocr-solution/ai-chat-test.png)

> **提示**：AI Chat 功能需要配置 LLM 后端（如 Ollama），配置方法请参考 [NeoMind 快速入门](../user-guide/1-install-setup.md) 或 [配置 LLM 后端](../user-guide/2-configure-llm.md)。

---

*最后更新: 2026-06-15*
