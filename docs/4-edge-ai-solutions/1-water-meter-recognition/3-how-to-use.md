---
sidebar_label: "How to Use"
description: "从采购到跑通:准备、硬件安装、设备配置、模型配置、方案组合与结果验证。"
---
# How to Use

## 3.1 Requirements

**Hardware**
- NE101 相机 × 表数(含官方水表支架)
- 运行 NeoMind 的 Linux 主机(或 NG4500)
- PoE 不适用(电池相机);主机侧常规网络

**Software**
- NeoMind(安装见[安装与升级](/docs/neomind/user-guide/install-setup))
- NE101 出厂固件(定时拍摄/MQTT/补光内置)
- paddle-ocr-v6 扩展 + ne101_camera 组件(市场安装)

## 3.2 Hardware Setup

**Step 1 — 安装相机**:使用官方水表支架固定,镜头正对字轮区域,避免斜角;表井注意防冷凝(镜头朝下或加罩)。

**Step 2 — 供电**:装入 7.2V 高能电池;续航与采集频率线性相关(日 5 拍 Wi-Fi 模式 2.4~6.2 年,理论值)。

**Step 3 — 网络**:按现场选择 Wi-Fi / Cat.1 / HaLow 模组并配置接入;确保相机可达 NeoMind 主机。

## 3.3 Device Setup

**Step 1 — 访问设备**:长按拍照键 2s 开启 NE101 WiFi AP,浏览器进入设备 Web 页。

**Step 2 — 配置相机**:设定定时拍摄周期、补光、上行地址(固件开箱即用,详见 [NE101 开发指南](/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide))。

**Step 3 — 检查状态**:确认 相机在线 / 抓拍正常 / 图像可达平台。

## 3.4 Install / Configure AI Model

**Step 1 — 选择模型**:paddle-ocr-v6(仪表读数场景,默认 tiny 档)。

**Step 2 — 安装**:NeoMind 扩展市场一键安装;ne101_camera 组件同步安装。

**Step 3 — 配置**:仪表板添加摄像头组件绑定设备,AI 处理流水线选择 paddle-ocr-v6,框选字轮 ROI。

**Step 4 — 测试**:手动触发一次抓拍,确认识别结果回显。完整步骤(含水表示例截图):[OCR 用例](/docs/neomind/use-cases/camera-ocr)。

## 3.5 Configure the Solution

组合流水线:

```text
NE101 定时抓拍
   ↓ Webhook/MQTT
ne101_camera 组件(ROI)
   ↓ processingExtensionId
paddle-ocr-v6 OCR
   ↓ Transform 解析+校验
meter_reading 虚拟指标
   ↓ 规则/仪表板/Data Push
业务系统
```

规则与告警建议(读数异常/漏水/低电量/离线)见 [自动化规则](/docs/neomind/user-guide/automation-rules)。

## 3.6 Verify the Result

成功的判定链:

```text
抓拍原图 → 表盘识别 → 字轮 ROI 命中 → 读数(如 00123.8)
   → meter_reading=123.8 入库 → 仪表板曲线更新 → 业务端收到推送
```

任一环缺失:按 [8. Troubleshooting](./troubleshooting) 排查。
