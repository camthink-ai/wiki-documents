---
title: 工程指南
sidebar_label: "Engineering Guide"
sidebar_position: 2
description: "人脸识别方案工程实施：设备准备与模型烧录、后端识别服务部署、通道配置、四环联调、业务使用与隐私运维。"
---

# 工程指南

本页面向实施与集成工程师，覆盖人脸识别方案从设备准备、后端部署、通道配置、联调验收到日常使用的完整工程过程。

## 1. 方案场景

本方案面向**人脸出现即识别**的近中距场景：识别距离 0.5\~3m 效果最佳，单画面建议同时识别 ≤8 人。

### 典型安装环境

| 环境 | 特点 | 方案应对 |
|---|---|---|
| 门禁 / 前台（主场景） | 人脸正对镜头、停留 2\~5 秒 | 壁装或桌面支架，距地 1.4\~1.6m |
| 办公区入口考勤 | 人流短时集中 | 跟踪确认 N 帧 + 新人脸即报，顺序无感通过 |
| 门店会员 greeting | 侧脸/走动常见 | 周期重报开启，识别后端承担姿态鲁棒性 |
| 隐私敏感演示区 | 严禁露脸输出 | 开启马赛克：视频打码，仅上报原图给受控后端 |

### 安装位置选择

- **高度**：识别距离 0.5\~3m；镜头距地 1.4\~1.6m，俯仰角 < 15°（正脸姿态识别率最高）
- **避让**：不要逆光安装（窗户/灯光直射镜头）；避免侧方强光源造成半脸阴影
- **镜头**：NE302 标准 M12 镜头（HFOV 88°/137° 可选）；覆盖宽度 2\~4m 选 88°，更宽选 137°

![安装示意：壁装高度 1.4~1.6m、识别距离 0.5~3m、俯仰角与视场覆盖](/img/solutions/face-recognition/mounting-position.svg)

**安装验证**：固定支架前，在相机 Web 实时预览中确认：目标人脸占画面高度 ≥ 1/10（过小将触发最小面积过滤）、无遮挡、无严重逆光，再锁定支架。

## 2. 方案组成（BOM）

| # | 采购项 | 型号 / 规格 | 数量 | 用途 |
|---|---|---|---|---|
| 1 | [**NE302 AI 相机**](https://www.camthink.ai/product/neoeyes-302/) | STM32N6・Wi-Fi 6・4MP | 1 台（每点位） | 人脸检测、跟踪、马赛克、裁剪上报 |
| 2 | **人脸固件** | `ne302 firmware ≥ v1.1`（含人脸 Demo) | 1 套 | 相机端人脸功能 |
| 3 | **识别后端** | 客户自有人脸识别服务，或任意可跑 Python 的电脑（演示用模拟后端） | 1 套 | 人脸特征比对，返回姓名 |
| 4 | 电源 | USB Type-C 5V | 1 套 | 相机供电 |

> 起步配置：1 台 NE302 + 1 台后端（演示可为同一局域网内的笔记本）。MQTT 通道另需一个 Broker（演示可用公共 broker，**严禁真实人脸数据**，见第 8 节）。

## 3. 组网拓扑

![组网拓扑：相机与后端同一局域网，Webhook 同步或经 Broker 的 MQTT 异步](/img/solutions/face-recognition/network-topology.svg)

通用要求：

- 相机与后端**同一局域网**（或后端有公网可达地址）；相机无公网要求
- 带宽：视频流走相机自身 Web 预览（局域网直连）；识别上报为事件式（每次几十 KB，不持续占用）
- MQTT 通道：相机与后端连接同一 Broker，上/下行 topic 各一条

## 4. 方案搭建

按以下顺序：**相机上线 → 烧录人脸固件与模型 → 部署识别后端 → 配置通道 → 四环联调**。

### 4.1 相机部署人脸功能

#### 4.1.1 相机上线

按 [NE302 快速指南](/docs/neoeyes-ne302-series/ne302-quick-start) 完成组装、上电与 Web 登录（默认 `admin / password`，首次登录后立即修改密码）。

![NE302 Web 控制台登录页面](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-login.png)

![NE302 实时画面与相机设置](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging.png)

#### 4.1.2 烧录人脸固件与模型

人脸 Demo 需要两样东西：**应用固件**（人脸功能本体）与**人脸检测模型**(YuNet）。两者均从开源工程的 `feature/face-detection-demo` 分支构建。

**获取代码**（已克隆过则 `git checkout feature/face-detection-demo && git pull` 即可）：

```bash
git clone https://github.com/camthink-ai/ne302.git
cd ne302
git checkout feature/face-detection-demo
```

> 不使用 git 时，可在 GitHub 页面 **Branch → feature/face-detection-demo → Code → Download ZIP** 下载分支压缩包解压。

**部署（推荐全量烧录 + 分区重置）**——设备可能 OTA 过旧固件或上传过用户自己的模型，增量烧录会留下旧配置与旧模型：

```bash
make erase-nvs       # 重置配置分区：人脸开关/参数回到默认，模型槽位选择回退到 AI_1
make flash           # 编译并全量烧录：FSBL/固件/Web/模型（YuNet 写入 AI_1)/Wi-Fi，自动擦除 OTA 分区
```

烧录后重启，Web 导航栏出现**人脸检测**页即部署成功（人脸检测功能默认开启）。

> 增量烧录（仅用于开发迭代，前提是设备从未 OTA/换过模型）：`make flash-app && make flash-model && make flash-web`。

![烧录执行过程：make erase-nvs 重置配置分区，make flash 全量烧录并自动擦除 OTA 分区](/img/solutions/face-recognition/flash-terminal.webp)

**成功标志**：`Partition 'nvs' erased.` 与 `Flash all to device Complete!` 相继出现即烧录完成；若提示连接失败，检查 ST-Link 连接与驱动后重试。

**通过 Web 升级（替代方式）**：相机已上线的现场，固件与模型包可在 Web **系统升级**页上传（模型包选 AI 类型），无需拆机接线，见[系统维护](/docs/neoeyes-ne302-series/user-guide/ne302-system-maintenance）。

#### 4.1.3 开启人脸功能

Web → **人脸检测** 页：

![人脸检测页面全貌：实时视频（识别状态叠加）、统计角标、跟踪识别列表与分组配置面板](/img/solutions/face-recognition/page-overview.webp)

1. 打开**功能**分组 → 开启"人脸检测功能"——画面出现人脸框与 `#ID 置信度` 标签（设备端推理即已工作）
2. 观察：正脸靠近镜头 1m 内，框稳定、ID 不跳变——检测/跟踪环节正常

### 4.2 部署识别后端

#### 4.2.1 使用模拟后端（演示 / 联调 / 效果评估）

开源工程自带 `Script/face_demo_backend.py`，内置 ArcFace 真识别（insightface），三级自动降级（face → aHash → md5):

```bash
# 安装依赖（Python 3.8+;首次运行自动下载 ~330MB 模型包）
pip install insightface onnxruntime

# Webhook 模式（与设备默认通道对应，监听 http://0.0.0.0:8080/face）
python Script/face_demo_backend.py --gallery ./face_gallery --out ./face_captures

# MQTT 模式（参数按设备 MQTT 配置填写，见 4.3.2）
python Script/face_demo_backend.py --mode mqtt --mqtt-host <broker> --mqtt-port 1883 \
  --topic-report <设备·数据上报主题> --topic-result <设备·数据接收主题> \
  --gallery ./face_gallery --out ./face_captures
```

启动日志出现 `recognition: ArcFace embeddings (N enrolled)` 即真识别就绪。

![模拟后端启动：ArcFace 模型加载、gallery 加载与 Webhook 监听地址](/img/solutions/face-recognition/backend-startup.webp)

*模拟后端启动输出：mode=webhook、21 个注册特征、监听 http://0.0.0.0:8080/face*

#### 4.2.2 注册人脸（建立 gallery）

> **顺序说明**：gallery 在后端**启动时**加载——推荐先注册再启动；启动后注册了新人脸，重启服务即可生效（特征有缓存，重启只需数秒）。

```bash
mkdir -p face_gallery/zhangsan        # 目录名 = 识别后显示的姓名
# 放入 2~4 张该人的照片（正脸最佳；多张提升姿态鲁棒性）
```

照片来源：现场对镜头露脸触发上报，从 `--out` 目录挑清晰的改名放入（推荐，与设备成像一致）；或任意正脸照。**特征按文件缓存，重复启动秒级就绪**；新增/修改文件自动重提特征。

> 人脸照片属于**生物特征敏感数据**：`face_gallery/`、`face_captures/` 已在开源工程 .gitignore 中，严禁提交或分享；演示结束请删除。

#### 4.2.3 接入客户自有识别服务（生产）

设备侧协议为两条 JSON（见开源工程 `Docs/Face_Detection_Demo.md` 第五节）：上报 `face_report`（含人脸裁剪图）与回传 `face_recognition_result`（按 `request_id` 回显）。后端只需实现：**接收上报 → 识别 → 按 request_id 原样回传姓名与置信度**。Webhook 模式即"收到 multipart POST，响应 JSON"。

### 4.3 配置通道（二选一）

设备 Web → **人脸检测** 页 → **上报** 分组：开启"上报"，选择通道。

#### 4.3.1 Webhook（推荐：同步、零额外组件）

1. 在 [应用管理 → Webhook](/docs/neoeyes-ne302-series/user-guide/ne302-data-transmission) 填入后端地址：`http://<后端IP>:8080/face` 并启用（Enable Push 开启、Push Status 显示 Enabled);可点 **Test Push** 先验证连通
2. 人脸检测页开启"上报"，通道选 **Webhook**

![设备 Webhook 配置：Enable Push、推送地址指向后端 /face 端点](/img/solutions/face-recognition/webhook-config.webp)

*设备 Webhook 配置：地址即模拟后端的监听地址，Authentication 按后端要求选择（演示可 None）*

设备 POST 人脸图 → 后端**同步响应**识别结果 → 画面即时刷新。适合有 HTTP 服务的后端。

#### 4.3.2 MQTT（适合消息架构）

1. 在 [应用管理 → MQTT/MQTTS](/docs/neoeyes-ne302-series/user-guide/ne302-data-transmission) 配置 Broker 并**连接**（状态须为"已连接"）
2. 人脸检测页开启"上报"，通道选 **MQTT**

设备向**数据上报主题**发布人脸图（base64），后端识别后向**数据接收主题**回传结果，设备在该通道上识别 `face_recognition_result` 报文并关联到人脸。

> **公共 Broker（如 broker.emqx.io）仅限演示假数据**——上报图对任何订阅者可见。真实人脸必须自建 Broker + MQTTS + 账号鉴权。

### 4.4 联调（四环验证）

按顺序逐环验证，任一环不通先排查该环：

| 环 | 验证方法 | 通过标准 |
|---|---|---|
| 1. 检测/跟踪 | 人脸检测页开功能，看画面 | 人脸框 + 稳定 `#ID 置信度`，无框时 ID 不乱跳 |
| 2. 上报 | 触发"手动上报"，看后端终端 | 后端打印收到图并落盘（`face_captures/`) |
| 3. 识别 | 注册过的脸对镜头 | 画面 1 秒内框变绿 + 显示姓名；后端日志 `status=ok` |
| 4. 边界 | 关掉后端再触发 | 5 秒（默认超时）后框变红显示 `timeout`;后端恢复后自动回绿 |

辅助环：**识别验证**（人脸检测页"识别验证"卡片上传一张人脸照片）——不站镜头前即可验证 2/3 环。

![四环验证：检测跟踪 → 上报 → 识别 → 边界，辅助环为照片识别验证](/img/solutions/face-recognition/four-checks.svg)

![上报与识别流转：青色"识别中" → 绿色姓名上屏；未注册人脸显示 unknown](/img/solutions/face-recognition/four-checks.webp)

四环全过 = 系统交付验收通过。

## 5. 业务使用

### 5.1 实时画面与识别状态

视频流内叠加（所有观看端一致）：人脸框颜色 = 识别状态（白=识别中 / 青=已上报等待 / 绿=识别成功 / 黄=未知 / 红=超时或错误），单行标签 `#ID 检测置信度 姓名 识别置信度`。Web 页面另有：右上角统计角标（当前/累计/识别成功/未知/超时/上报）、跟踪识别列表（完整姓名）、手动上报与重置按钮。

![识别状态四态：白=识别中、青=已上报等待、绿=识别成功、红=超时/错误，标签单行显示](/img/solutions/face-recognition/states-four.svg)

**贴边自适应**：人脸贴近画面边缘时标签自动移入框内/换侧，不截断；框出画自动钳制在画面内。

### 5.2 配置面板（按需调整）

| 分组 | 关键项 | 说明 |
|---|---|---|
| 功能 | 人脸检测功能 | 总开关 |
| 画面显示 | 框/ID/置信度/关键点/识别结果 | 叠加元素独立开关 |
| 人脸马赛克 | 开关、块大小、外扩比例 | 仅影响视频流；上报原图不受影响 |
| 上报 | 开关、通道、上报置信度阈值、周期重报、冷却、结果超时/保留 | 阈值低于检测阈值时"显示不报" |
| 裁剪与图像 | 外扩比例（四边同比例、越界截断）、最小边长、固定尺寸（letterbox 不拉伸）、JPEG 质量 | 识别后端对尺寸有要求时用固定尺寸 |
| 跟踪与检测 | 检测置信度阈值、最小面积、IoU 阈值、丢失帧数、确认帧数、防闪烁保持、位置外推 | 误检多→升高检测阈值；框滞留→减小丢失帧数/保持时长 |

![人脸检测配置面板：功能/画面显示/人脸马赛克/上报/裁剪与图像/跟踪与检测六个分组，开关即时生效，数值项保存后生效](/img/solutions/face-recognition/config-panel.webp)

开关即时生效；数值项修改后点"保存"。所有配置掉电不丢（NVS 持久化）。

### 5.3 隐私控制（马赛克）

开启马赛克后：

- **视频侧**（预览/RTSP/RTMP/录像）：人脸区域实时打码，不可逆
- **上报侧**：后端仍收到**未打码**原图（识别需要）；裁剪在打码前执行是设计行为
- **记录侧**：每张上报成功的人脸在抓拍记录页归档（trigger=face，仅本地存储不上传），可下载/删除

### 5.4 抓拍记录

上报成功的人脸自动进入 [抓拍记录](/docs/neoeyes-ne302-series/user-guide/ne302-capture-storage）（触发源显示 `face`），用于事后复核与注册取材；记录生命周期（容量上限/清理）与普通抓拍一致。

## 6. 日常运维

| 现象 | 处置 |
|---|---|
| 画面无框 | 确认功能开关开启；人脸过小/过远 → 调小最小面积；光照不足 |
| 有框无姓名，后端无日志 | 通道断：Webhook 检查 URL 可达；MQTT 检查"已连接"状态 |
| 有框无姓名，后端有日志 | 识别未命中：确认已注册；调整后端匹配阈值 |
| 姓名显示慢 | 网络往返延迟；Webhook 模式确认后端同网段 |
| 误检多 | 升高"检测置信度阈值"(0.5→0.6~0.7) |
| 框消失慢 | 减小"最大丢失帧数"与"防闪烁保持" |
| 上报编码失败（日志 `JPEG encode failed`) | 偶发硬件竞争，内置重试与看门狗自愈；频发收集日志联系支持 |

**自愈能力（内置）**：后端超时/不可达不影响检测与马赛克（识别状态自动流转超时→恢复）；上报工作线程异常自愈重建；识别后端恢复后无需人工干预。

## 7. 性能与规格

| 指标 | 数值 |
|---|---|
| 检测推理 | YuNet 320×320，约 7ms/帧（NPU） |
| 识别响应 | Webhook 同网段 < 1 秒；MQTT 视 Broker 链路 |
| 同时跟踪 | ≤16 人（建议画面内 ≤8 人保证识别率） |
| 单次上报载荷 | 裁剪图 JPEG 数十 KB（尺寸/质量可配） |
| 状态超时 | 默认 5 秒（可配 0.1\~60 秒） |

识别精度受光照、角度与距离影响，部署时以现场实测为准。

## 8. 隐私与数据安全

- **视频打码**不可逆；**上报原图**仅发给配置的后端——公网/公共 Broker 场景必须使用 MQTTS/HTTPS + 鉴权，且仅限演示假数据
- 后端侧 gallery（注册照/特征）与 captures（收到的人脸）按敏感数据管理：本地保存、访问控制、演示后删除
- 设备抓拍记录页的 face 归档仅为本地存储；交付前清空记录
- 法域合规（如《个人信息保护法》/GDPR）要求：人脸采集需明示告知与单独同意——部署现场应有提示标识

## 9. 技术支持

- **社区支持**：[Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions）
- **方案定制 / 协议对接 / 批量部署**：[联系我们](https://www.camthink.ai/company/contact-us/），由 CamThink 技术支持团队对接

## 了解更多

- [方案说明](/docs/edge-ai-solutions/face-recognition/solution-description）
- [NeoEyes NE302 概述](/docs/neoeyes-ne302-series/ne302-overview）
- [NE302 数据传输（MQTT / Webhook)](/docs/neoeyes-ne302-series/user-guide/ne302-data-transmission）
- 开源工程（固件 / Web / 模型 / 模拟后端 / 协议文档）：[github.com/camthink-ai/ne302](https://github.com/camthink-ai/ne302）
