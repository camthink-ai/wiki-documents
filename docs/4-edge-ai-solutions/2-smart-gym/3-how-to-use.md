---
sidebar_label: "How to Use"
description: "从采购到跑通:准备、安装、设备配置、应用部署、方案组合与结果验证。"
---
# How to Use

## 3.1 Requirements

**Hardware**
- NE503 相机(入口 1 + 器械区 1~2 起步)
- PoE 交换机(端口 = 相机数 + 1)

**Software**
- NE503 出厂固件(容器化应用管理)
- Verified App 包:Occupancy Monitor、Person Detection(`app.yaml` + `image.tar`)

## 3.2 Hardware Setup

**Step 1 — 安装**:入口顶装(AF 44.5° 正对通道);器械区吊装(110° 覆盖 4~6 台器械);避开逆光与遮挡。

**Step 2 — 供电入网**:PoE 线接入交换机,相机自动上线。

**Step 3 — 访问控制台**:浏览器进入 NE503 Web 控制台(地址见 [快速开始](/docs/neoeyes-ne503-series/quick-start))。

## 3.3 Device Setup

**Step 1 — 登录控制台**,确认相机在线、画面正常。

**Step 2 — 设定检测区域**:在应用参数中框定器械区/通道 ROI。

**Step 3 — 检查状态**:推理就绪 / 事件总线可发布 / 存储可用。

## 3.4 Install / Configure AI Model(应用部署)

## 部署三步

1. **上电入网**:PoE 线接交换机,相机自动上线;Web 控制台默认地址见 [快速开始](/docs/neoeyes-ne503-series/quick-start)
2. **装应用**:Web 控制台 → Applications,上传 Verified App 的 `app.yaml` + `image.tar`([部署方法](/docs/neoeyes-ne503-series/application-guide/verified-apps#部署方法))
3. **配事件**:应用内置 Event Bus 输出,配置接收端(大屏/平台/业务系统),见 [7.4 API Integration](./customization) 与 [7.5 NeoMind Integration](./customization#75-neomind-integration)

## 隐私合规

- 张贴监控提示,会员协议说明影像用途与保留期
- 方案默认**只输出计数/事件**,不做人脸识别、不存个体轨迹
- 事件截图保留期在相机/平台设置中控制,建议 ≤ 7 天

## 3.5 Configure the Solution

```text
NE503(入口)Person Detection → 进/出事件
NE503(器械区)Occupancy Monitor → zone_occupancy 周期值
        ↓ Event Bus / Webhook
大屏(实时在场 = 累计进−出)/ 通知(超员/安全)
```

多店/多机汇聚时接入 NeoMind,见 [7.5 NeoMind Integration](./customization#75-neomind-integration)。

## 3.6 Verify the Result

```text
走进入口 → Person Detection 事件 → 在场人数 +1(大屏 3s 内更新)
站上器械区 → Occupancy Monitor 上报 zone_occupancy=2
触发检测(挥手模拟)→ 告警通道收到通知 + 截图
```
