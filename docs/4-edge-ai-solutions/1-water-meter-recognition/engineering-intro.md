---
sidebar_label: "Engineering Introduction"
---

# 工程介绍

本页面向实施与集成工程师,覆盖水表自动抄读方案从选型、部署到业务对接的完整工程过程。

## 1. 方案场景

本方案面对的现场以**水表间、下水道、泵房、楼道表箱**为代表——潮湿、无光、无市电、信号衰减是共同特征,选型与部署围绕这些条件展开。

![水表识别场景:NE101 定时抓拍表盘](https://paddlepaddle-static.cdn.bcebos.com/paddle-wechat-image/mmbiz.qpic.cn/mmbiz_jpg/sKia1FKFiafggJl2ia9vZspq5HEUD40PZ45jncMjpzAkFTS2rGdUgKUVRbv6BEv6pVHrUxCgib0EGRGWX8ewYMZL4A/image)

### 典型安装环境

| 环境 | 特点 | NE101 应对 |
|---|---|---|
| 水表间 / 泵房 | 潮湿、常闭无光、部分有市电 | 补光灯应对无光;防护罩防冷凝;有市电时可提高采集频率 |
| 楼道表箱 | 环境较好,通常有市电 | 安装最简,注意空间与防盗 |
| 下水道 / 表井 | 潮湿、完全无光、无市电、信号衰减大 | IP67 防护;电池续航优先;Cat.1 / HaLow 回传 |
| 户外表位 | 露天、温差大、可能积水 | IP67 防护;补光应对夜间;防晒防冻 |

### 通讯方案选择

NE101 支持三种通讯模组,按现场信号与供电条件选型(续航为官方理论值,默认日 5 拍):

| 通讯方案 | 续航(默认 / 优化) | 适用场景 |
|---|---|---|
| Wi-Fi | 2.39 年 / 6.20 年 | 表井在路由器覆盖内,中近距离部署(推荐起点) |
| Wi-Fi HaLow | 1.46 年 / 4.30 年 | 偏远、障碍物多的远距离回传 |
| Cat.1 | 0.83 年 / 2.08 年 | 无局域网的蜂窝直连;高频采集建议外接供电 |

### 采集频率

- 采集频率由结算 / 业务周期决定:日结 1~4 次/天,月结可更低
- 频率与电池寿命**线性相关**(日 1 拍约为日 5 拍续航的 5 倍)
- 图像随抓拍同步上传,无需额外配置

### 高频拍摄(定制)

如需分钟级甚至持续的高频拍摄,电池模式不再适用——可联系 CamThink 定制 **Type-C 直供电版本** NE101(取消电池、Type-C 口直接供电),配合高频采集长期运行;定制需求请通过 [技术支持](#10-技术支持) 联系我们。

## 2. 表计类型与选型

![NE101 现场部署:相机对准表计安装](/img/solutions/ne101-deployment.webp)

### 镜头选型

- NE101 为定焦模组,提供两种 FOV 镜头:**60°(工作距离 15cm)** 与 **120°(工作距离 8cm)**
- 安装时镜头需**正对字轮**,距离在支架标称范围内
- 字轮较小的老式表,注意画面占比(字轮区域 ≥ 1/3 画面)

### 安装距离(60° / 120° FOV)

两种镜头的工作距离固定,安装时通过支架将镜头对准字轮,使字轮区域占画面 **1/3 以上**(推荐 1/2):

| 镜头 | 工作距离(固定) | 画面覆盖宽 | 适用 |
|---|---|---|---|
| 60° FOV | **15cm** | ≈17cm | 常规户表 / 工业表,单表特写(推荐) |
| 120° FOV | **8cm** | ≈28cm | 大表盘、多表同框概览 |

![安装距离示意图:NE101 工作距离与画面覆盖](/img/solutions/water-meter-install-distance.svg)

**原理**:画面覆盖宽 = 2 × 工作距离 × tan(FOV/2)。60° 镜头在 15cm 处覆盖约 17cm,120° 镜头在 8cm 处覆盖约 28cm;字轮占画面比例越高,OCR 像素密度越充足。

**安装验证**:支架固定前先手动抓拍一张,确认字轮清晰、无反光、占比合适,再锁定支架螺丝。

### 支架选型

- 使用**官方水表支架**:一次性固定镜头与字轮的距离、角度和视野——这是识别稳定的前提
- 免打孔、单表约 10 分钟完成安装;换电池复装不会跑偏

## 3. 方案组成(BOM)

| 示意图 | # | 采购项 | 型号/规格 | 数量 | 用途 |
|---|---|---|---|---|---|
| ![NE101](/img/Overview/NE101/NE101.png) | 1 | [**NE101 AI 相机**](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) | 电池供电(4 节 AA)・定时抓拍・Wi-Fi/Cat.1/HaLow 可选 | 每表 1 台 | 表盘抓拍 |
| ![支架](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/overview/2.png) | 2 | 水表支架 | NE101 官方配件 | 每表 1 套 | 固定镜头与表盘相对位置 |
| ![NG4500](/img/Overview/NG45xx/NG45XX.png) | 3 | [平台主机 NG4500 AI Box](https://www.camthink.ai/product/neoedge-ai-box-ng4500/)(推荐,运行 NeoMind) | Linux 主机 / NG4500 | 1 台 | 接收、OCR、规则、数据出口 |
| — | 4 | 电池 | 4 节 AA 电池 | 每相机 1 组 | 供电 |

> 起步配置(≤10 块表):**每表 1 台 NE101(含支架)+ 1 台运行 NeoMind 的 Linux 主机**;表数增长时只增加相机,平台按承载量横向扩充。

## 4. 拓扑(按通讯方案组网)

网络要求随所选通讯方案不同,部署前先确认:

| 通讯方案 | 组网方式 |
|---|---|
| **Wi-Fi** | NE101 与 NG4500(运行 NeoMind)**接入同一局域网**;主机无需公网,适合园区 / 小区内网部署 |
| **Wi-Fi HaLow** | 需部署 **HaLow 网关**:NE101 → HaLow 网关 → NeoMind 所在网络,适合远距离、障碍物多的站点 |
| **Cat.1** | NE101 经蜂窝**直连上云**,建议将 NeoMind **部署在云端**(公网可达),适合无局域网的分散表计 |

通用要求:NE101 需可路由至 NeoMind 的 MQTT 端口(内置 Broker,默认 TCP 1883,可启用 MQTTS);读数识别与入库均在主机本地完成,业务系统通过 OpenAPI / Data Push / Webhook 对接。

- NE101 与 NeoMind 主机需处于**同一网络或路由可达**,主机侧 1883(MQTT)端口对设备开放
- 读数识别与入库均在主机本地完成,业务系统只对接 NeoMind 的对外接口(整体部署拓扑见 [方案说明](./solution-description))

## 5. 设备入网设置

1. 长按 NE101 拍照键 2s 开启设备 WiFi AP,使用电脑或手机连接
2. 进入 NE101 Web UI → **System Settings → Communications**,选择现场路由 WiFi,确保设备可访问 NeoMind 主机
3. 进入 **Application Management**,填写 Data Reporting Topic 与 Server Address(取自平台侧摄像头组件顶部的 MQTT 信息),点击 **connect**
4. 之后每次按动拍照键,图像自动上传至绑定的项目中

![设备上报后进入待审核列表](https://resources.camthink.ai/NeoMind/v0923/devices-pending.png)

详细步骤与截图见 [OCR 用例 — 让 NE101 采集图像](/docs/neomind/use-cases/camera-ocr)。

## 6. NeoMind 安装与扩展安装

- **NeoMind 安装**:一键脚本 / 手动部署 / HTTPS 配置,见 [安装与升级](/docs/neomind/user-guide/install-setup)
- **扩展安装**:NeoMind 扩展市场一键安装 **paddle-ocr-v6**(OCR 识别);确认 **ne101_camera** 组件可用,见 [安装扩展与组件](/docs/neomind/use-cases/camera-ocr)

![扩展市场](https://resources.camthink.ai/NeoMind/v0923/extensions-marketplace.png)

## 7. 联调

按以下顺序逐环验证,任一环不通先排查该环:

1. **抓拍**:手动按动 NE101 拍照键,确认图像到达 NeoMind(组件图片列表可见)
2. **识别**:确认 OCR 流水线产出读数字段(仪表板组件可见识别结果)
3. **规则**:确认读数经 Transform 解析为数字并入库为 `meter_reading` 指标
4. **转发**:验证 Data Push / Webhook 已将读数推送到业务端点

## 8. 数据存储和展示

- **抓拍原图**:存储于 NeoMind 主机,保留周期在数据保留设置中控制,到期自动清理
- **读数指标**:入库为虚拟指标(如 `meter_reading`),支持历史查询
- **仪表板**:建议三块——读数卡片(最新读数 + 时间)、用水趋势曲线(日/周/月)、设备健康(电池 / 信号 / 在线);搭建见 [使用仪表板](/docs/neomind/user-guide/use-dashboard)

![仪表板示例](https://resources.camthink.ai/NeoMind/v0923/dashboard-overview.png)

## 9. 数据转发

读数与告警对外转发两种方式,按实时性要求选择:

| 方式 | 说明 | 适用 |
|---|---|---|
| **Data Push** | 平台将指定指标的新数据点实时推送到业务 HTTP 端点(含重试) | 实时联动、大屏 |
| **OpenAPI 拉取** | 业务系统按结算周期调用 REST API 拉取读数 | 日结/月结系统 |

- 配置方法:[数据转发](/docs/neomind/user-guide/7c-data-push) / [平台 API](/docs/neomind/developer-guide/rest-api)

![Data Push 配置列表](https://resources.camthink.ai/NeoMind/v0923/data-push-list.png)
- 读数异常、低电量、设备离线等**告警事件**走 [消息通知](/docs/neomind/user-guide/notifications) 的 Webhook / IM / 邮件渠道

**字段映射示例**:表号 ↔ 设备 ID;读数 ↔ `meter_reading`;抄表时间 ↔ 数据点时间戳;凭证 ↔ 抓拍原图 URL。

## 10. 技术支持

- **社区支持**:[Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **方案定制与批量部署**:[联系我们](https://www.camthink.ai/company/contact-us/),由 CamThink 技术支持团队对接
- **高频拍摄 / Type-C 直供电版本定制**:同上,请在需求中注明采集频率与部署规模
