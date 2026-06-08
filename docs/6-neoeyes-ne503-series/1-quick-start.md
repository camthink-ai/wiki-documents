---
description: NeoEyes NE503 快速入门指南，涵盖设备安装、首次连接与初始配置、摄像头验证、AI 应用部署、系统集成、设备管理及设备维护，帮助用户从开箱到完成基础部署。
keywords: [NE503快速入门, NeoEyes配置, Web控制台, RTSP流, 容器应用, aipc-cli, 边缘AI相机, PTZ控制, 系统集成]
tags: [快速入门, NE503, 使用教程, Web配置, 应用部署]
---

# Quick Start

本指南按实际操作流程引导您完成 NE503 的首次部署：开箱安装 → 连接配置 → 验证画面 → 部署应用 → 系统集成 → 设备管理 → 设备维护。全部操作约 30 分钟可完成。

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-main.png" alt="NeoEyes NE503" width="100%" />
</div>

## 概述

### 套件内容

| 组件 | 数量 | 说明 |
|------|------|------|
| NE503 主机 | 1 | 含核心处理板与接口板，IP67 防护 |
| 壁挂螺丝包 | 1 | 含固定螺丝与安装件 |

### 使用前准备

以下物品需用户自备：

- **PoE 交换机**（802.3AT，推荐）+ 网线：一根网线同时完成供电和网络连接，无需额外电源
- **或** DC 12V 电源适配器 + 普通交换机 + 网线：适用于无 PoE 交换机的环境
- **电脑**：配备以太网口，运行 Windows / macOS / Linux，使用现代浏览器（Chrome / Edge / Firefox / Safari）

---

## 设备安装与上电

### 1. 选择安装位置

NE503 兼具智能 IPC 和边缘计算平台的功能，安装时需兼顾监控视野和 AI 推理效果：

- **监控场景**：选择能覆盖目标区域的位置，注意镜头视场角（广角端水平 45.1°，长焦端 14.7°）
- **环境要求**：IP67 防护，支持 -40°C ~ +60°C 工作温度，可户外安装
- **线缆规划**：网线需从 PoE 交换机或路由器引出至安装位置，确保长度足够

### 2. 壁挂安装

1. 将壁挂支架固定到安装面（墙面 / 立杆 / 吊装），使用随附螺丝包
2. 将 NE503 对准支架卡口旋紧固定螺丝

> 立杆、吊装等场景需要额外购买对应的安装支架配件。

### 3. 供电与上电

NE503 支持两种供电方式，功耗 5–6W（典型负载）：

| 方式 | 连接方法 | 适用场景 |
|------|----------|----------|
| PoE 供电（推荐） | 网线接入 PoE 交换机（802.3AT），一线完成供电和网络 | 大多数部署场景 |
| DC 适配器供电 | 电源适配器接 DC 12V 接口，网线接普通交换机 | 无 PoE 交换机时 |

上电后设备指示灯闪烁表示启动中，常亮后即可访问（约 30-60 秒）。

---

## 首次连接与初始配置

NE503 出厂默认 IP 为 `10.0.0.1`。本章节引导您完成首次登录、修改密码、配置网络和校时。

### 1. 配置电脑 IP

首次访问需将电脑以太网 IP 设为 `10.0.0.x` 网段（如 `10.0.0.100`，子网掩码 `255.255.255.0`），然后 `ping 10.0.0.1` 确认连通。

### 2. 登录 Web 控制台

浏览器访问 `http://10.0.0.1:8080`：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-login.png)

输入默认凭据登录：用户名 `admin`，密码 `password`。

登录后进入 Dashboard 仪表盘，页面从上到下分为以下区域：

- **Device Status**：设备运行时间、各芯片温度（SoC / MCU / CPU / Board）、补光灯亮度、IR LED 开关、IR-CUT 滤光片模式
- **Resource Monitoring**：CPU / NPU / 内存 / 存储四项实时使用率仪表盘
- **Stream Preview**：摄像头实时画面预览
- **Applications**：已安装应用列表及运行状态、资源占用
- **AI Models**：已加载模型概览
- **Monitor**：系统资源趋势图
- **Device Info**：设备名称、IP 地址、MAC 地址、固件版本、构建日期

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-dashboard.png)

> 点击左上角的展开图标可以显示导航栏文字，方便定位各功能页面。

### 3. 修改默认密码

首次登录后请立即修改默认密码，防止未授权访问。展开导航栏进入 **Settings → Device Info**，找到密码修改区域，输入当前密码和新密码后保存。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png)

### 4. 配置网络

出厂 IP `10.0.0.1` 仅用于首次配置。将设备接入实际局域网后，需要切换到 DHCP 或指定静态 IP，否则其他设备无法访问。

进入 **Settings → Network**：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-network.png)

| 模式 | 适用场景 | 操作 |
|------|----------|------|
| DHCP | 接入路由器自动获取 IP | 直接启用即可，建议在路由器绑定 MAC 地址防 IP 变动 |
| 静态 IP | 需要固定 IP 的生产环境 | 手动填写 IP、子网掩码、网关和 DNS |

### 5. 设置时区

进入 **Settings → Time Settings**，选择正确的时区并配置 NTP 服务器。时区设置直接影响视频流 OSD 时间戳和录像文件的命名时间，请务必与部署地一致。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-time-settings.png)

---

## 验证摄像头工作

完成初始配置后，先确认摄像头画面和视频流输出正常，再进行后续的应用部署。

### 1. 查看实时画面与镜头控制

进入 **Media** 页面，页面分为四个标签页：**Media**、**Control**、**Image** 和 **Audio**。

**Media 标签页**：显示摄像头实时画面预览，下方提供码流设置（编码格式、分辨率、帧率、码率、GOP）和 RTSP 开关及地址显示。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-media.png)

**Control 标签页**：提供镜头控制面板，包括光学变焦（4x）、手动/自动对焦、IR-CUT 滤光片切换（auto/day/night）和补光灯控制。变焦后点击自动对焦确保画面清晰。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-media-control.png)

> 广角端（8mm）用于全景监控，长焦端（32mm）用于远距离识别（如车牌、人脸）。

### 2. 通过 RTSP 拉流验证

RTSP 是 NE503 与外部系统对接的主要视频协议。设备提供三路码流：

| 码流 | 地址 | 用途 |
|------|------|------|
| 主码流 | `rtsp://<设备IP>:8554/main` | 4K 高清录像（3840×2160） |
| 子码流 | `rtsp://<设备IP>:8554/sub` | 低带宽预览 |
| 三码流 | `rtsp://<设备IP>:8554/third` | AI 分析 / 移动端 |

**使用 VLC 验证：**

1. 打开 VLC → 媒体 → 打开网络串流，输入 RTSP 地址

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/vlc-add-network.png" alt="VLC 打开网络串流" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/vlc-add-network-2.png" alt="VLC 输入 RTSP 地址" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

2. 点击播放，确认画面流畅、无花屏

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/vlc-play-1.png" alt="VLC 播放验证" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/vlc-play-2.png" alt="VLC 播放成功" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

> RTSP 端口默认 8554。如果无法拉流，通过 `aipc-cli stream list` 确认码流状态。

---

## 部署第一个 AI 应用

NE503 通过容器运行时部署第三方 AI 应用，用户可以自行开发和安装所需的应用来满足各种业务需求。本节以安装 NX Witness 视频管理系统为例，演示完整的安装向导流程。

### 1. 进入应用管理

导航栏选择 **App Management**，进入应用管理页面。页面顶部有 **Import** 卡片，点击即可启动安装向导。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-app-management.png)

### 2. 安装向导

点击 Import 卡片后弹出 **Application Setup Wizard**，共 6 步：

**Step 1 · Source** — 选择镜像来源并输入地址。支持 **Registry Image**（从 Docker Hub 或私有仓库拉取）、**Upload Archive**（上传本地 `.tar` / `.tar.gz` 文件）和 **Upload Package**（上传 app.yaml 清单 + 镜像文件的完整配置包）。以 NX Witness 为例，选择 Registry Image，输入 `ptr727/nxwitness:6.1.1.42624`，点击 Continue。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step1-source.png)

**Step 2 · Basic Info** — 填写 Application ID（`nx`，创建后不可修改）、名称（`NX Witness`）、版本号和描述（可选）。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step2-basic-info.png)

**Step 3 · Resources** — 配置资源限制和运行策略。CPU Limit 和 Memory Limit 按实际需求调整（默认 50% / 256Mi），建议开启 Auto-start on boot 和 Restart on Failure。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step3-resources.png)

**Step 4 · Permissions** — 配置应用访问权限：选择可使用的 AI 模型和视频码流（main / sub / third），设置 Event Bus 发布 / 订阅主题。Network 默认 Isolated Mode（隔离网络），NX Witness 需关闭以使用 Host 网络。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step4-permissions.png)

**Step 5 · Advanced** — 添加环境变量和存储卷挂载（可选）。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step5-advanced.png)

**Step 6 · Review** — 确认配置后点击 **Install**，等待镜像下载完成。

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step6-review.png" alt="Review 配置确认" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/wizard-step7-installing.png" alt="安装下载进度" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

### 3. 验证与运行

安装完成后，应用出现在 App Management 列表中。点击应用卡片可查看运行状态、资源占用，以及执行启动 / 停止 / 重启 / 卸载操作。

NX Witness 验证：

| 服务 | 地址 |
|------|------|
| NX Witness 管理界面 | `https://<设备IP>:7001` |
| RTSP 流 | `rtsp://<设备IP>:554/`（具体流路径以 NX Witness 配置为准） |

> 表中端口 554 是 NX Witness 自身的 RTSP 服务端口，与 NE503 的 8554 端口是不同的服务。

浏览器访问 `https://<设备IP>:7001`，首次打开进入 NX Witness 设置向导。选择 **Setup New Site**，按向导创建管理员账号，添加 NE503 的 RTSP 码流（`rtsp://<设备IP>:8554/main`）即可开始使用。

**NX Witness 常见问题**：

| 现象 | 原因 | 解决方案 |
|------|------|----------|
| 容器 STOPPED，日志有 `no new privileges` | 安全策略阻止提权 | 确认该应用的容器安全设置允许提权 |
| Web 界面无法访问 | 网络模式不是 Host | 安装时关闭 Isolated Mode |
| 镜像下载失败或缓慢 | 无外网连接或 DNS 异常 | 检查设备网络连接 |
| 容器反复重启 | 内存不足 | Memory Limit 建议不低于 `1GB` |

### 4. AI 模型管理

进入 **AI Models** 页面，可查看已加载模型的运行状态和推理帧率，点击模型卡片可查看详细信息（ID、版本、加载时间、模型路径、关联应用）。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-ai-models.png)

NE503 预置行人检测模型（YOLOv8n），开箱即可使用。如需加载自定义模型，点击页面顶部 **Import** 卡片，上传 `.hef` 文件并填写 Model ID、Model Type、Threshold 等参数：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-ai-model-import.png)

导入后模型自动加载，推理结果通过 Event Bus 输出。也可通过 `aipc-cli model register <.hef>` 命令行注册模型。

---

## 系统集成

### 1. 视频流对接

NE503 的 RTSP 码流遵循标准协议，可直接接入主流 NVR / VMS 平台（NX Witness / Milestone / Genetec）或使用 FFmpeg / GStreamer 拉流。建议：主码流用于录像存储，子码流用于实时预览，三码流用于 AI 分析。

### 2. API 对接

NE503 提供 RESTful API，支持程序化管理和数据获取。所有接口需 Bearer Token 认证：

```bash
# 登录获取 Token
curl -X POST http://<设备IP>:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<你的密码>"}'

# 查询设备信息
curl http://<设备IP>:8080/api/v1/system/info \
  -H "Authorization: Bearer <token>"
```

| 模块 | 路径前缀 | 用途 |
|------|----------|------|
| 系统 | `/api/v1/system` | 设备信息、重启、OTA 升级 |
| 媒体 | `/api/v1/media` | 视频参数、OSD、AI 叠加 |
| 设备 | `/api/v1/device` | PTZ、镜头、GPIO 控制 |
| 应用 | `/api/v1/apps` | 应用生命周期管理 |
| 存储 | `/api/v1/storage` | 磁盘管理 |

### 3. 事件总线对接

AI 推理结果和设备告警通过 Event Bus 以结构化事件输出，支持 MQTT 订阅和发布/订阅模式，可与业务系统实时联动。

---

## 设备管理

### 1. 设备信息与固件升级

进入 **Settings → Device Info**，可查看硬件型号、固件版本和系统运行时间。如需升级固件，点击 Firmware Version 旁的 **Update** 上传固件包，系统自动解析校验后开始写入，完成后设备自动重启。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png)

> 升级全程约 2-5 分钟，期间请勿断电或操作设备。建议在业务低峰期执行升级。

### 2. 存储管理

进入 **Settings → Storage**：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-storage.png)

NE503 内置 64GB eMMC 用于系统和应用数据。如需扩展存储，可通过 TF 卡（支持 UHS-I）扩展。M.2 KEY M（SoC 原生支持 PCIe Gen4，具体速率以硬件文档为准）接口暂未支持，后续通过固件升级启用。建议在存储使用率超过 80% 时及时清理或扩展。

---

## 设备维护

导航栏选择 **Maintenance**，提供四个运维工具：

### 1. 日志查看

日志页面提供三种视图：**Operation Logs**（操作日志）、**System Logs**（系统日志）和 **Developer Logs**（开发者日志）。支持按时间范围和级别筛选，可查看用户登录、应用启停、系统事件等操作记录。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-maint-logs.png)

### 2. 文件管理

文件管理器提供 Web 端文件浏览能力，可查看设备文件系统目录结构，支持文件预览、下载和删除操作。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-maint-file-manager.png)

### 3. Web 终端

内置 Web SSH 终端，无需额外工具即可直接在浏览器中访问设备命令行。点击 SSH Settings 可配置终端参数。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-maint-terminal.png)

### 4. 进程管理

进程管理器列出设备上所有运行中的进程，显示 PID、名称、用户、CPU / 内存占用和启动命令。支持查看进程详情和终止异常进程。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-maint-process-manager.png)

---

## 参考卡片

### 快速参考

| 项目 | 值 | 项目 | 值 |
|------|-----|------|-----|
| Web 控制台 | `http://<设备IP>:8080` | Web 登录 | `admin` / `password` |
| SSH 登录 | `root` / `root` | 默认 IP | `10.0.0.1` |
| RTSP 主码流 | `rtsp://<设备IP>:8554/main` | RTSP 子码流 | `rtsp://<设备IP>:8554/sub` |
| RTSP 三码流 | `rtsp://<设备IP>:8554/third` | 供电 | PoE 802.3AT 或 DC 12V，5–6W |

### aipc-cli 命令速查

```bash
aipc-cli system info / health          # 系统信息 / 健康检查
aipc-cli app list / start / stop <id>  # 应用管理
aipc-cli app logs <id> -f              # 实时查看应用日志
aipc-cli device zoom in 5              # 变焦（in/out/stop，速度 1-10）
aipc-cli device focus auto             # 自动对焦
aipc-cli stream list / url <id>        # 码流管理
aipc-cli model list / register <.hef>  # AI 模型管理
```

输出格式：`-o table`（默认）/ `-o json` / `-o yaml`

### 常见问题

| 问题 | 排查步骤 |
|------|----------|
| 无法访问 Web 控制台 | 确认电脑 IP 在 10.0.0.x 网段 → `ping 10.0.0.1` → DHCP 模式下通过路由器查 IP |
| RTSP 流无法播放 | 确认同网段 → 检查 IP 是否变更 → `aipc-cli stream list` 确认码流状态 |
| 容器启动失败 | `aipc-cli app logs <id>` 查日志 → 检查内存和外网连接 |
| 忘记 Web 密码 | SSH 登录（`root`/`root`）→ `aipc-cli` 重置密码 |
