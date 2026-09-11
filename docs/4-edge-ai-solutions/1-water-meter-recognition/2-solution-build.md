---
sidebar_label: "方案搭建"
description: "从采购到上线:商品组合、搭建步骤、业务对接与适用条件。"
---
# 方案搭建

## 采购清单(商品组合)

| # | 采购项 | 型号/规格 | 数量 | 用途 |
|---|---|---|---|---|
| 1 | **NE101 AI 相机** | 电池供电・定时抓拍・Wi-Fi/Cat.1/HaLow 可选 | 每表 1 台 | 表盘抓拍 |
| 2 | 水表支架 | NE101 官方配件 | 每表 1 套 | 固定镜头与表盘相对位置 |
| 3 | 平台主机 | Linux 主机 / NG4500(运行 NeoMind) | 1 台 | 接收、OCR、规则、数据出口 |
| 4 | 电池 | 7.2V 高能电池 | 每相机 1 块 | 供电(日 5 拍 Wi-Fi 续航 2.4~6.2 年,理论值) |

> 起步配置(≤10 表):**每表 1 台 NE101(含支架)+ 1 台运行 NeoMind 的 Linux 主机**;表数增长时只增加相机,平台不变。

## 搭建步骤

### ① 硬件安装

- 官方水表支架固定相机,镜头正对字轮区域(偏角 < 10°)
- 装入电池;表井注意防冷凝(镜头朝下或加罩)
- 配置网络(Wi-Fi / Cat.1 / HaLow),确保相机可达 NeoMind 主机

### ② 设备接入

- NE101 长按拍照键 2s 开启 WiFi AP,Web 页配置定时拍摄、补光与上行地址(固件开箱即用,详见 [NE101 开发指南](/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide))
- 平台侧设备接入见 [设备接入指南](/docs/neomind/user-guide/onboard-device)

### ③ 识别配置

- NeoMind 安装 **paddle-ocr-v6** 扩展与 **ne101_camera** 组件(市场一键安装,tiny 档模型内置、无需 GPU/外网)
- 仪表板添加摄像头组件绑定设备,AI 处理流水线选择 paddle-ocr-v6,框选字轮 ROI

### ④ 结果验证

```text
抓拍原图 → 表盘识别 → 字轮 ROI 命中 → 读数(如 00123.8)
   → meter_reading=123.8 入库 → 仪表板曲线更新 → 业务端收到推送
```

完整走查(含水表示例截图)见 [OCR 用例](/docs/neomind/use-cases/camera-ocr)。

## 业务对接

**方式一:业务系统拉取(OpenAPI)**

```bash
curl -H "Authorization: Bearer <API_KEY>" \
     "https://<neomind-host>:9375/api/devices/<id>/telemetry/latest?metric=meter_reading"
```

**方式二:平台实时推送(Data Push / Webhook)**:订阅读数指标转发到业务端点,见 [数据推送](/docs/neomind/user-guide/7c-data-push);异常类事件走 [消息通知](/docs/neomind/user-guide/notifications) Webhook。

**告警规则建议**:读数异常(倒退/超量程/低置信度)、漏水(小时差分超阈值)、低电量、设备离线——见 [自动化规则](/docs/neomind/user-guide/automation-rules)。

**字段映射**:表号 ↔ 设备 ID;读数 ↔ `meter_reading`;抄表时间 ↔ 时间戳;凭证 ↔ 原图 URL;异常标记 ↔ 规则记录。

## 适用条件与边界

**环境要求**: + lim_env.replace('## 5.1 Environmental Conditions','').strip() + 

**AI 边界**: + lim_ai.replace('## 5.2 AI Limitations','').strip() + 

## 5.4 Recommended Deployment Conditions

| Parameter | Recommended |
|---|---|
| 镜头-表盘距离 | 官方支架标称范围 |
| 安装角度 | 正对字轮,偏角 < 10° |
| 光照 | 均匀环境光或开启补光 |
| 抓拍分辨率 | 字轮区域占画面 ≥ 1/3 |
| 采集频率 | 日 1~4 次(结算需求) |

**Not Recommended**
- 指针式/滚码混合老表(识别路线不同)
- 长期强反光且无法调整机位的表位
- 分钟级高频监测需求(需另选持续供电方案)

**不建议使用**:指针式/滚码混合老表;长期强反光且无法调机位;分钟级高频监测需求。
