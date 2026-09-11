---
sidebar_label: "Hardware & Deployment"
description: "CamThink 智慧健身房解决方案——全部基于 NeoEyes NE503 端到端 AI 相机:客流统计、器械利用率与安全告警。"
---
# 硬件选型与部署

## 为什么只选 NE503

| 需求 | NE503 对应能力 |
|---|---|
| 单机端到端 | 采集→20 TOPS NPU 推理→事件输出,设备内闭环([产品概述](/docs/neoeyes-ne503-series/overview)) |
| 室内/潮湿环境 | IP67 防护 |
| 简化布线 | PoE 802.3AT 单线供电组网 |
| 夜间/暗光营业 | Sony IMX678 + AI-ISP,&lt;0.01 Lux 全彩夜视 |
| 应用更新 | 容器化应用管理,Web 控制台在线部署/升级 |

## 镜头与点位

| 点位 | 镜头建议 | 安装 | 承担应用 |
|---|---|---|---|
| 出入口 | AF Lens(44.5°,定焦) | 顶装正对通道 | 客流计数(进/出) |
| 器械区 | Motorized Zoom(110°,广角) | 吊装覆盖 4~6 台器械 | 区域占用率(Occupancy Monitor) |
| 走道/大门口(可选) | 广角 | 过道顶装 | 人员检测(Person Detection)兜底告警 |

- 计数点位选通道最窄处,画面内避免闸机/旋转门遮挡
- 器械区按"遮挡最少"原则选择吊点,梁柱密集区可两台互补
- 玻璃门逆光会拉低精度,优先调机位避开直射

## 部署三步

1. **上电入网**:PoE 线接交换机,相机自动上线;Web 控制台默认地址见 [快速开始](/docs/neoeyes-ne503-series/quick-start)
2. **装应用**:Web 控制台 → Applications,上传 Verified App 的 `app.yaml` + `image.tar`([部署方法](/docs/neoeyes-ne503-series/application-guide/verified-apps#部署方法))
3. **配事件**:应用内置 Event Bus 输出,配置接收端(大屏/平台/业务系统),详见本 case [平台配置](./platform-configuration)

## 隐私合规

- 张贴监控提示,会员协议说明影像用途与保留期
- 方案默认**只输出计数/事件**,不做人脸识别、不存个体轨迹
- 事件截图保留期在相机/平台设置中控制,建议 ≤ 7 天
