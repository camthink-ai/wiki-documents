---
description: 基于 NeoMind 平台的人脸识别方案，通过 Face Recognition 扩展实现人脸检测与身份识别，支持仪表板实时展示、历史记录查看和 AI Chat 自然语言查询，适用于 NE101/NE301 智能相机。
keywords: [NeoMind, 人脸识别, 人脸检测, Face Recognition, NE101, NE301, 身份识别, 仪表板, AI Chat]
tags: [NeoMind, 人脸识别, 扩展, 身份识别]
---

# Face Recognition Solution

---

## 1. 方案概述

NeoMind 的 **Face Recognition 扩展** 可对设备采集的图像进行人脸检测与身份识别，并在仪表板中实时展示识别结果，也可通过 **AI Chat** 以自然语言方式查询。

**典型应用场景**：

| 场景 | 说明 |
|------|------|
| 门禁管理 | 识别进出人员身份，实现智能门禁控制 |
| 考勤打卡 | 自动识别员工面部特征，记录考勤信息 |
| 访客登记 | 对比访客与已注册人员，区分陌生人与已知人员 |
| 安全监控 | 在监控画面中实时检测和识别人员身份 |

**数据流向**：

```
NE101/NE301 图像采集 → NeoMind 平台 → Face Recognition 扩展（检测 + 识别）→ 仪表板展示 + AI Chat 查询
```

---

## 2. 物料清单（BOM）

| 物料 | 型号/规格 | 数量 | 用途 | 必需 |
|------|----------|------|------|------|
| **智能相机** | NE101 或 NE301 | 1+ | 图像采集 | ✅ |
| **NeoMind 平台** | v0.8.0+ | 1 | 边缘 AI 管理 | [下载](https://github.com/camthink-ai/NeoMind/releases/latest) ✅ |
| **本地 LLM** | Ollama | 1 | AI Chat 后端 | 可选 |

---

## 3. 前置准备

### 3.1 NeoMind 安装与配置

请先完成 NeoMind 的安装、注册和基本配置，详细步骤请参考 [NeoMind 快速入门](../user-guide/1-install-setup.md)。

### 3.2 设备接入

将 NE101 或 NE301 注册到 NeoMind 平台，详细步骤请参考 [NeoMind 快速入门 - 设备管理](../user-guide/3-onboard-device.md)。

---

## 4. 安装 Face Recognition 扩展

**步骤 1**：进入 **Extensions（扩展）** 管理页面，找到 **Face Recognition** 扩展

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/extension-1.png)

**步骤 2**：点击进入扩展详情页，查看扩展说明后点击安装。安装完成后，确认扩展状态为已启用

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/extension-2.png)

---

## 5. 仪表板配置与使用

### 5.1 创建仪表板并添加 Face Recognition 组件

进入 **Dashboard（仪表板）** 管理页面，点击 **创建仪表板**，然后添加 **Face Recognition** 组件：

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-1.png)
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-2.png)

### 5.2 绑定设备

在 Face Recognition 组件中绑定目标设备（NE101 或 NE301），绑定完成后组件将自动接收并处理该设备采集的图像：
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-3.png)



### 5.3 注册人脸

在使用身份识别功能前，需要先注册人脸到人脸库中。在 Face Recognition 组件中点击 **注册人脸**，上传人员面部照片并填写对应的身份信息：


![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-4.png)
![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-5.png)

> 注册的人脸照片建议正面清晰、光线充足，以提高识别准确率。

### 5.4 测试识别效果

人脸注册完成后，设备采集到图像时，扩展会自动进行人脸检测和身份识别。在仪表板中可以查看实时识别结果：

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/dashboard-6.png)

识别结果包括：

| 信息 | 说明 |
|------|------|
| 人脸框 | 图像中标注检测到的人脸位置 |
| 身份标签 | 已识别人员显示对应的身份信息 |
| 置信度 | 识别结果的置信度分数 |

### 5.5 查看历史识别记录

在设备详情中可以查看所有历史人脸识别记录，包括每次识别的原始图片和识别结果：

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/history-1.png)

<div style={{display: 'flex', gap: '8px'}}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/history-2.png" style={{width: '50%'}} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/history-3.png" style={{width: '50%'}} />
</div>

---

## 6. AI Chat 查询

人脸识别结果存储后，可以在 **AI Chat** 中通过自然语言查询已识别的人脸数据。例如：

```
hello, please analyse the history data and result of ‘face recognition’ , reply in english
```

![](https://resources.camthink.ai/wiki/img/ai-application/neomind/face-recognition/chat-box.png)


---

## 7. 附录

### 相关文档

- [NeoMind 快速入门](../user-guide/1-install-setup.md)
- [目标检测应用案例](./1-object-detection.md)
- [NE101 Quick Start](../../2-neoeyes-ne101-series/1-quick-start.md)
- [NE301 Quick Start](../../5-neoeyes-ne301-series/1-quick-start.md)

---

*最后更新: 2026-06-15*
