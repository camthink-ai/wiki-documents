---
title: 工程指南
sidebar_label: "Engineering Guide"
sidebar_position: 2
description: "智慧健身房方案工程实施:场景与安装、BOM、组网拓扑、NeoMind 搭建、相机安装、联调验证、业务使用与数据对接。"
---

# 工程指南

本页面向实施与集成工程师,覆盖智慧健身房方案从选型、部署、联调到业务使用与数据对接的完整工程过程。

## 1. 方案场景

本方案的现场以**中型健身房、私教工作室、酒店/公寓健身房**为代表——人员 10~20 人同时训练、器械密集、灯光混合自然光。一台 NE503 相机覆盖全场,分析与数据全部在本地完成。

### 典型安装环境

| 环境 | 特点 | 方案应对 |
|---|---|---|
| 中型健身房(主场景) | 器械区 + 自由训练区,层高 2.8\~4m | 单相机顶装覆盖 10\~20 人;2×2 切图兼顾远近场 |
| 私教工作室 | 面积小、目标近、动作幅度大 | 安装高度取下限,近场姿态由切图覆盖 |
| 酒店 / 公寓健身房 | 使用时段集中,人员流动大 | 自动建档 + 访客模式;时段客流统计 |
| 大型场馆 | 单相机无法覆盖 | 分区部署多相机(每区一台),平台侧聚合 |

### 安装位置选择

- **高度**:推荐 2.5\~3.5m 顶装,俯角 15\~30°
- **朝向**:推荐**斜对角顶装**,画面斜穿全场,同时覆盖**主要器械区 + 入口**——入口保证会员进场即识别,器械区保证占用统计
- **镜头定制**:标准镜头覆盖不全时(大进深 / 需要更宽视野),NE503 支持**定制更大视场角镜头**,可联系 CamThink 评估现场适配
- **避让**:不要正对强逆光窗户;避免立柱、吊灯遮挡主要器械区
- **夜间**:确认现场灯光常亮;NE503 支持红外模式,但人脸识别建议保持可见光照明

![安装位置示意:单台 NE503 顶装,视野覆盖入口与主要器械区](/img/solutions/smart-gym/mounting-position.svg)

**安装验证**:支架固定前,在相机 Web 界面实时预览中确认:远端会员可辨(骨架能画全)、入口在画面内、无明显遮挡,再锁定支架。

## 2. 方案组成(BOM)

| # | 采购项 | 型号 / 规格 | 数量 | 用途 |
|---|---|---|---|---|
| 1 | [**NE503 AI 相机**](https://www.camthink.ai/product/neoeyes-503/) | Hailo-15H 20 TOPS・PoE・4K+720p 双码流 | 每区域 1 台 | 姿态/人脸/重识别端侧推理 |
| 2 | **NeoMind 平台**(部署在客户电脑或 NE503) | Docker 镜像,含 gym-tracker 扩展 | 1 套 | 设备接入、姿态/人脸识别、仪表板与训练报告 |
| 3 | 健身房安装包 | `gym-suite-<版本>.tar.gz`(向 CamThink 获取) | 1 套 | 一键安装(含应用镜像、模型、手册) |
| 4 | 网线 | Cat5e 以上 | 按需 | 相机 PoE 供电与数据回传 |

> 起步配置(单区域 ≤20 人):**1 台 NE503(PoE 供电)+ NeoMind 部署在客户电脑或 NE503**;场馆扩大时按区域增加相机,扩展配置里添加设备即可(单扩展建议 ≤4 路)。

## 3. 组网拓扑

![组网拓扑:NE503 相机 → NeoMind 客户主机 → 业务系统](/img/solutions/smart-gym/network-topology.svg)

通用要求:

- 相机与主机**同一局域网**,主机无需公网
- 带宽:每相机视频走 720p 子码流(约 2\~4Mbps),事件流低于 100KB/s;4 路相机常规局域网即可承载
- 供电:相机采用 PoE,由客户侧网络设备(PoE 交换机或注入器)供电,无需单独布电源线
- 相机自签 HTTPS,边缘侧配置 `tls_insecure: true` 即可
- 全部数据留在场馆本地;对接业务系统时才按需外发(见 4.6)

## 4. 方案搭建

按以下顺序:先完成 **NE503 相机端部署**(上线 → 安全设置 → 画面确认 → 一键安装健身房应用),再安装 NeoMind 平台与健身房扩展,最后四环联调。



### 4.1 NE503 相机部署健身房应用


<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/official-site/ne503/ne503.png" alt="NeoEyes NE503 边缘 AI 相机" style={{ maxWidth: '46%', height: 'auto' }} />
</div>

#### 4.1.1 相机上线(物理安装后)

**接口与连线**——网线从机身的 PoE 网口接入,另一端接入客户侧 PoE 交换机或注入器:

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/terminal-block-annotation.png" alt="NE503 外部端子标注(PoE 网口位置)" style={{ maxWidth: '62%', height: 'auto' }} />
</div>

**上线步骤:**

1. 网线一端插入相机 PoE 网口,听到卡扣到位声;另一端接客户侧 PoE 交换机 / 注入器
2. 等约 2 分钟完成启动(蓝色状态灯常亮)
3. 从路由器后台(或 [CamThink 发现工具](https://github.com/camthink-ai/neoruntime/releases/tag/v1.0.2),随 neoruntime 安装包发布)找到相机 IP
4. 浏览器访问 `https://<相机IP>`(自签证书,点击"继续前往")——出现相机 Web 界面即上线成功

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-login.png" alt="相机 Web 登录页" style={{ maxWidth: '55%', height: 'auto' }} />
</div>

#### 4.1.2 初始安全设置

1. 使用默认账号登录:`admin / password`
2. **右上角 → 系统设置 → 修改密码**,设置强密码并记录(后续扩展配置也要用)
3. 确认系统信息页固件版本 ≥ v1.0.2;低于则先 [联系 CamThink](https://www.camthink.ai/company/contact-us/) 获取固件包,Web **系统升级**页上传(约 10 分钟,升级后自动重启)

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png" alt="系统信息页:固件版本确认" style={{ maxWidth: '55%', height: 'auto' }} />
</div>

#### 4.1.3 画面确认

1. Web 首页**实时预览**:确认取景覆盖器械区 + 入口、无遮挡、夜间光照充足
2. 焦距/俯角需要调整的此时完成(参照第 1 节安装位置指引)

#### 4.1.4 一键安装应用

**应用包在哪里:**即 BOM 第 3 项的健身房安装包 `gym-suite-<版本>.tar.gz`——由 CamThink 随订单交付,先拷贝到任一**与相机同网段**的电脑上(需已装 curl + python3,Mac/Linux/Windows+WSL 均可),然后在该电脑的终端里执行:

**操作步骤:**解压安装包 → 进入目录 → 运行脚本(按提示输入相机 IP 与 4.1.2 设置的新密码):

```bash
tar xzf gym-suite-1.0.0.tar.gz && cd gym-suite-1.0.0
./camera-install.sh <相机IP> <4.1.2 设置的新密码>
```

脚本依次完成:

| 步骤 | 内容 | 耗时 |
|---|---|---|
| 1 | 登录相机 API | 1 秒内 |
| 2 | 检查固件版本 | 1 秒内 |
| 3 | 上传模型(姿态 S/M 双档 HEF) | ~10s |
| 4 | 上传并安装应用容器镜像 | ~15s |
| 5 | 启动应用 | ~2s |
| 6 | 健康检查(等待视频流 + 帧率统计) | ~40s |

成功标志:

```
✅ Install OK! Producer running: stats: 19.8 fps
```

脚本幂等——重复执行为覆盖升级,不影响会员数据。

#### 4.1.4a 底层原理:一键脚本做了什么(可选阅读)

`camera-install.sh` 的每一步都是调用相机原生的 REST API——无需 SSH,无需手动 Docker 命令。理解原理有助于排障或自定义:

| 步骤 | REST API | 说明 |
|---|---|---|
| 登录 | `POST /api/login` | 获取 Bearer Token |
| 检查固件 | `GET /api/v1/system/ota/status` | 确认 ≥ v1.0.2 |
| 上传模型 | `POST /api/v1/files/upload` | HEF 文件 → `/data/aipc-data/gym-hefs/` |
| 上传镜像 | `POST /api/v1/apps/upload-image` | 容器 tar → `/data/aipc/images/` |
| 上传清单 | `POST /api/v1/apps/upload-manifest` | app.yaml → `/data/aipc/apps/manifests/` |
| 安装应用 | `POST /api/v1/apps/install-package` | 镜像导入 containerd + 清单注册 |
| 启动应用 | `POST /api/v1/apps/gym-native/start` | 创建容器并运行 |

**应用是什么:** 一个 OCI 容器镜像(内含 gym-native C++ 二进制 + 启动脚本),由相机的 app-manager 服务管理生命周期(启动/停止/重启/日志)。容器通过清单声明的卷挂载访问 NPU(`/dev/h1x`)、视频流(`/run/aipc`)和模型文件。

**自愈能力(内置,无需配置):**

| 故障 | 系统行为 | 恢复时间 |
|---|---|---|
| 视频流闪断 | 自动重连 | 秒级 |
| 断流超 30 秒 | 应用自动重启(内置看门狗) | 约 2 分钟 |
| 相机断电重启 | 应用自启动,数据不丢 | 约 30 秒 |

#### 4.1.5 应用管理(Web 界面)

安装后可在相机 Web → **应用** 页管理:

- **状态**:running(运行中)/ installed(已装未启动)
- **日志**:点开 gym-native 查看实时日志,`stats: xx fps, pub ok` 为健康心跳
- **停止/启动**:一键操作,无需 SSH
- **卸载**:移除应用(模型文件保留)

### 4.2 安装 NeoMind 平台(客户电脑或 NE503)

NeoMind 可部署在**客户自有电脑**(Linux 服务器或 Mac mini,Docker 环境,4GB+ 内存),也可直接**部署在 NE503 上**。

**方式一:Docker Compose(推荐)**

```bash
# 1. 确认 Docker 已装
docker --version

# 2. 使用安装包内的编排文件(或从 NeoMind 仓库获取)
cd gym-suite-1.0.0/edge/
docker compose up -d

# 3. 等待首次拉取镜像与启动(约 1~2 分钟)
docker compose logs -f neomind    # 看到 "listening on 0.0.0.0:9375" 即就绪
```

**方式二:一键安装脚本**

```bash
curl -fsSL https://get.neomind.camthink.ai | sh
```

**首次配置:**

1. 浏览器访问 `http://<主机IP>:9375`
2. 注册管理员账号(邮箱 + 密码,务必记牢——平台数据加密密钥与此绑定)
3. 左侧导航确认"扩展"页面可正常打开

平台安装细节(手动部署 / HTTPS 反代 / 数据卷备份)见 [安装与升级](/docs/neomind/user-guide/install-setup)。

### 4.3 安装健身房扩展并绑定相机

**安装扩展(两种方式):**

- **本地导入(离线交付)**:平台 Web → **扩展管理 → 导入** → 选择安装包内 `gym-tracker-*.nep` → 导入成功后出现在扩展列表
- **市场安装(在线)**:平台 Web → **扩展市场** → 搜索 "Gym Tracker" → 点击安装(扩展已上架市场时可用)

![扩展市场:Gym Tracker 一键安装](/img/solutions/smart-gym/extension-marketplace.webp)

*扩展市场:搜索 Gym Tracker 一键安装;离线交付用 Upload Extension 导入 .nep 包*

![上传扩展:拖入 .nep 包即可安装](/img/solutions/smart-gym/extension-upload.webp)

*离线交付:Upload Extension 对话框,拖入或点选 `.nep` 包,Upload & Install 一步完成*

**配置相机连接:**

1. 扩展列表中点击 gym-tracker 的**配置**
2. 填写相机连接信息:

```yaml
device:
  host: 192.168.x.x        # 相机 IP(路由器后台查看,或用 [CamThink 发现工具](https://github.com/camthink-ai/neoruntime/releases/tag/v1.0.2))
  username: admin
  password: <相机密码>
  tls_insecure: true       # 相机自签证书,保持 true
```

3. 保存;约 5 秒后扩展状态变绿,表示已与相机事件流(WSS)建立连接
4. 若状态反复变红:检查相机 IP 是否可达(`ping <相机IP>`)、密码是否正确

![扩展详情:运行状态与健康检查](/img/solutions/smart-gym/extension-detail.webp)

*扩展详情页:Running (Isolated) 运行状态、健康检查、Config / Commands / Metrics / Logs 页签*

![扩展配置:界面语言与隐私选项](/img/solutions/smart-gym/extension-config.webp)

*扩展配置页:界面语言(默认英文)、人脸打码默认开关,Save Reload 生效*

**界面语言:** 扩展看板默认英文;在扩展配置 `ui.language: zh` 可切中文。

多相机场景:在配置中添加多个 device 条目,每台相机先各自完成 4.3 的安装。

### 4.4 联调(四环验证)

按顺序逐环验证,任一环不通先排查该环:

1. **推流**:相机 Web → 应用 → gym-native,日志出现 `stats: xx fps`(≥15)——相机端推理正常
2. **事件**:平台扩展状态绿色、无重连告警——事件流到达平台
3. **检测**:人走入画面挥动手,看板 1 秒内出现骨架 + 检测框——跟踪链路通
4. **识别**:对镜头正脸 3 秒 → 看板出现"未识别人员"→ 录入姓名 → 再次入镜显示姓名——识别链路通

四环全过 = 系统交付验收通过。

### 4.5 数据存储与展示

- **会员库 / 区域配置 / 训练记录**:存于 NeoMind 主机数据卷,每日自动备份;相机侧无持久业务数据,换相机重跑安装脚本即可
- **视频**:看板实时画面走相机 720p 子码流,平台不落盘原始视频
- **仪表板**:建议三块——在场人数与占用总览、器械区域利用率热力、会员训练报告入口;搭建见 [使用仪表板](/docs/neomind/user-guide/use-dashboard)

![健身房看板:实时监控与器械占用](/img/solutions/smart-gym/dashboard-top.webp)

*看板顶部:实时视频(骨架/检测框/分区叠加)、器械占用面板(0/15 busy)、训练概况、人流趋势*

![健身房看板完整视图](/img/solutions/smart-gym/dashboard-full.webp)

*完整看板:进出场 Door Flow、热力 Heatmap、轨迹 Trails、告警(跌倒疑似)、会员到店、在场人数*

### 4.6 数据转发(可选)

需要对接会员管理系统 / 大屏 / 小程序时,两种方式按实时性选择:

| 方式 | 说明 | 适用 |
|---|---|---|
| **Data Push** | 指定数据(到店事件、训练汇总)实时推送到业务 HTTP 端点,含重试 | 实时大屏、开门联动 |
| **OpenAPI 拉取** | 业务系统按周期调用 REST API 拉取数据 | 日报 / 周报系统 |

- 配置见 [数据转发](/docs/neomind/user-guide/7c-data-push) / [平台 API](/docs/neomind/developer-guide/rest-api)
- **字段映射示例**:会员 ↔ 成员 ID + 姓名;到离场 ↔ 进出场事件时间戳;训练明细 ↔ 动作 × 组次;器械占用 ↔ 区域名 + 时长

## 5. 业务使用(扩展卡片详解)

gym-tracker 扩展在 NeoMind 仪表板上以一组"卡片"呈现,每张卡片对应一个业务模块。以下按模块展开:它解决什么业务需求、怎么操作。所有卡片支持 `实时 / 回看` 切换,界面语言由扩展配置 `ui.language` 控制(单卡片可覆盖)。

### 5.1 实时画面与骨架叠加(Video Overlay)

**解决什么**:巡场与调优的"驾驶舱"——直观确认 AI 看到了什么:骨架是否画全、器械区是否框对、进出场是否计数,同时保护会员隐私。

**怎么操作**:

- 打开卡片即见实时画面,人体框与 17 关键点骨架实时叠加;`实时 / 回看` 切换历史时段
- **分区管理**:在画面上新建/编辑器械 ROI(矩形 / 多边形,命名如"跑步机 1""哑铃区"),闭合保存即时生效;系统对"脚点落入区域且驻留 ≥3 秒"判定为使用开始(过滤路过)
- **计数线管理**:在入口画一条计数线,会员过线即计一次进出场
- **无效区管理**:把立柱、镜子等干扰区域标为无效,避免误检
- **打码开关**:非相关人员画面自动打码,保护隐私

区域宁小勿大——相邻器械区域重叠会把站在两台器械之间的人同时计入。

![实时画面卡片:骨架与框叠加,工具栏含分区/计数线/无效区/打码](/img/solutions/smart-gym/cards/51-video.webp)

### 5.2 实时在场与人员列表(Live State)

**解决什么**:随时回答"现在馆内几个人、都是谁、在哪个区域"。

**怎么操作**:卡片顶部为实时在场人数;列表逐条显示在场人员(会员姓名 / 访客、当前所在器械区、姿态状态),点击可在 5.1 的画面中定位该人。

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/52-live.webp" alt="实时在场卡片:在场人数与人员列表" style={{ maxWidth: '70%', height: 'auto' }} />
</div>

### 5.3 器械占用看板(Equipment Grid)

**解决什么**:每台器械此刻"占用 / 使用中 / 空闲"一目了然——引导会员错峰,盘点利用率。

**怎么操作**:每台器械一个格子,颜色与状态文字实时刷新(需先在 5.1 完成器械分区并命名);顶部汇总条给出整体占用统计。

![器械占用看板:每台器械占用/使用中/空闲](/img/solutions/smart-gym/cards/53-grid.webp)

### 5.4 人流趋势与进出场(Traffic Chart / Door Flow)

**解决什么**:时段客流与进出场净流量——排课、 staffing 与运营决策的依据。

**怎么操作**:

- 人流趋势卡选择"近 N 小时"窗口查看在场人数曲线
- 进出场卡显示今日进场 / 出场 / 净在场:画好计数线后会员过线自动累计,按天留档,支持"前一天 / 后一天"翻看

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/54-traffic.webp" alt="人流趋势:近 N 小时在场人数曲线" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
  <img src="/img/solutions/smart-gym/cards/59-doorflow.webp" alt="进出场:今日进场/出场/净在场与按天统计" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
</div>

### 5.5 运动概况与器械排行(Workout Summary / Equipment Rank)

**解决什么**:当天运营速览——来了多少人、练了多久、哪些器械最受欢迎。

**怎么操作**:运动概况卡展示总时长、训练场次、到访会员、到店时间轴与器材使用时长(当日无记录会明确提示);器械排行卡以横向条形展示今日各器械使用时长排行。

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/55-summary.webp" alt="运动概况:总时长/训练场次/到店时间轴/器材使用时长" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
  <img src="/img/solutions/smart-gym/cards/56-rank.webp" alt="器械使用排行:今日各器械使用时长" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
</div>

### 5.6 会员训练报告与会员管理(Member Report)

**解决什么**:教练与会员的个人维度量化——每次训练的明细、历史趋势与训练建议,把指导从"凭感觉"变成"看数据"。

**怎么操作**:

- **会员录入(人脸)**:会员在镜头前自然走动 1\~3 秒(1\~3m,正脸最佳)→ 看板"未识别人员"卡片出现 → 填写姓名 / 手机号 → 保存;此后每次入镜自动识别(注册过正脸,侧脸 / 低头角度亦可)。批量照片导入请联系 CamThink 开通
- **查看报告**:选择会员 → 单次训练明细(器械、动作、组·次)、健身历史(按天 / 近 N 天)、动作分析、器械分布、到店记录;识别通道状态显示"人脸 + 人体 ReID 双通道"或"人体 ReID 识别中(人脸样本待采集)"
- **会员管理**:改名;同一人换装 / 重复录入用"并入"合并到店与特征;删除会员将一并移除其特征与到店历史(有二次确认)
- 隐私说明:系统仅保存人脸**特征向量**(不可逆),不存原始画面;匿名访客不计入统计

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/57-members.webp" alt="会员到访列表:最近 7 天各会员到店次数与时长" style={{ maxWidth: '85%', height: 'auto' }} />
</div>

### 5.7 实时告警(Alerts)

**解决什么**:跌倒检测、器械久占监控——安全事件与运营异常即时提醒。

**怎么操作**:有告警时逐条显示时间与信息,点击"标记已处理 / 误报"完成闭环;无告警时显示"一切正常——跌倒检测与器械久占监控运行中"。

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/58-alerts.webp" alt="实时告警:跌倒检测与器械久占提醒" style={{ maxWidth: '70%', height: 'auto' }} />
</div>

### 5.8 轨迹与热力图(Trails / Heat)

**解决什么**:会员动线与区域热度——回答"会员都在哪些区域活动、什么时段最密集",是器械布局调整、动线优化与新器材采购的数据依据。

**怎么操作**:

- **轨迹卡**:以蓝线在场馆画面上绘制会员最近动线("蓝线 = 最近轨迹");`实时 / 回看` 切换,回看模式支持"前一天 / 后一天"翻看历史动线;把时间轴拖到最右即回到实时
- **热力卡**:按样本密度呈现区域热度,色标从"低"到"高",并标注今日峰值时段;切换日期可对比不同时段的热度分布
- **数据来源**:足迹日志自扩展启用起持续累积;某时段没有足迹会明确提示"该时段没有足迹记录"

**业务用法**:高峰时段热力集中在少数器械 → 考虑增购或调整布局;自由训练区长期低热 → 优化空间利用;动线交叉密集处注意安全隐患。

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/solutions/smart-gym/cards/61-trails.webp" alt="轨迹卡片:最近动线蓝线与回看" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
  <img src="/img/solutions/smart-gym/cards/60-heat.webp" alt="热力卡片:区域热度与今日峰值" style={{ maxWidth: '48%', height: 'auto', objectFit: 'contain' }} />
</div>

### 5.9 参数微调(可选)

| 场景 | 调整 |
|---|---|
| 检测框偶发闪烁 | 应用配置 `GYM_POSE_VARIANT_JSON` 中 `confidence_threshold` 0.6 → 0.7 |
| 远端小目标漏检 | 联系 CamThink 调整切图参数(2×2 覆盖比例 / 刷新节奏) |
| 骨架延迟明显 | 检查网络带宽;确认视频用子码流 |

## 6. 日常运维

### 6.1 自愈能力(无需人工)

| 故障 | 系统行为 | 恢复时间 |
|---|---|---|
| 视频流闪断 | 自动重连 | 秒级 |
| 断流超过 30 秒 | 应用自动重启(内置看门狗) | 约 2 分钟 |
| 相机 / 主机断电重启 | 应用与平台自启动,数据不丢 | 约 30 秒 |

### 6.2 人工介入场景

| 现象 | 处置 |
|---|---|
| 看板无数据超过 10 分钟 | 相机 Web → 应用 → gym-native → 停止/启动 |
| 视频卡顿 | 检查带宽与网络;确认子码流 |
| 相机完全失联 | 检查 PoE 供电;物理重启相机 |
| 需要看日志 | 相机 Web → 日志 → gym-native |

相机所有运维操作走 HTTPS API(无需 SSH),日志关键字速查:

| 日志关键字 | 含义 | 动作 |
|---|---|---|
| `stats: xx fps, pub ok` | 正常心跳 | 无 |
| `stream watchdog — exiting(1)` | 断流自愈中 | 等 2 分钟;频发查网络 |
| `HAILO_TIMEOUT / VDevice` | NPU 异常 | 重启应用;频发联系支持 |

### 6.3 升级

- **应用升级**:拿新安装包重跑 `camera-install.sh`(覆盖式,约 2 分钟,会员数据不丢)
- **固件升级**:相机 Web → 系统升级 → 上传固件包(约 10 分钟,已装应用自动保留)

## 7. 性能与规格

| 指标 | 数值 |
|---|---|
| 检测帧率 | 约 20fps(720p 子码流,2×2 切图轮转) |
| 全场刷新周期 | 约 200ms |
| 人脸识别响应 | 1 秒内 |
| 单相机覆盖 | 10~20 人中型场馆 |
| 自愈恢复 | 断流约 2 分钟;断电约 30 秒 |
| 每相机带宽 | 视频 2~4Mbps + 事件流低于 100KB/s |

识别与统计精度受现场光照、人流密度与遮挡影响,部署时以现场实测为准。

## 8. 技术支持

- **社区支持**:[Discord](https://discord.gg/a8NbPGAJw9) / [GitHub Discussions](https://github.com/camthink-ai/community/discussions)
- **方案定制与批量部署**:[联系我们](https://www.camthink.ai/company/contact-us/),由 CamThink 技术支持团队对接
- **动作库扩展 / 多场馆聚合 / 会员系统对接**:同上,请在需求中注明场馆规模与现有会员系统

## 了解更多

- [方案说明](/docs/edge-ai-solutions/smart-gym/solution-description)
- [NeoEyes NE503 概述](/docs/neoeyes-ne503-series/overview)
- [NeoMind 平台文档](/docs/neomind/product-overview/what-is-neomind)
- gym-tracker 扩展开源仓库:[github.com/camthink-ai/NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)
