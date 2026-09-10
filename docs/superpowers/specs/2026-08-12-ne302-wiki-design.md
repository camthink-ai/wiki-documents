# NE302 Wiki 信息架构与文档建设 Spec

> 日期：2026-08-12  
> 状态：待用户审阅  
> 范围：为 NeoEyes NE302 建立独立的产品 Wiki 文档体系，明确 Quick Start、User Guide、Hardware Guide 的边界和后续软件文档路线。

本文件是 `docs/superpowers/specs/` 下的内部设计 spec，不属于 NE302 的公开 Wiki 导航；实际 Wiki 页面必须按仓库规范添加 `description`、`keywords` 和 `tags`，并通过构建与路由检查确认公开入口。

## 1. 目标

将 NE302 作为 NeoEyes 产品线中的独立产品加入 Wiki，同时保留它与 NE301 之间的 STM32N6 平台关系。

本 Spec 解决以下问题：

1. NE302 是否与 NE301 共用产品导航。
2. Quick Start 与 User Guide 如何拆分。
3. 当前 datasheet、硬件设计稿、图片素材和 GitHub 源码能够支撑哪些页面。
4. 哪些内容可以直接写入，哪些内容必须经过 NE302 实机核查后才能承诺。
5. 如何保证中英文、图片、导航和后续软件文档可持续维护。

## 2. 产品定位与边界

### 2.1 产品关系

NE302 与 NE301 共享 STM32N6 视觉 AI 平台和 STM32U0 低功耗控制思路，但不作为 NE301 的一个硬件变体挂在 NE301 Series 下。

导航层采用独立产品系列：

```text
NeoEyes NE301 Series
NeoEyes NE302 Series
NeoEyes NE503 Series
```

NE302 的产品定位是：

> NeoEyes NE301 同平台的 Mini AI Vision Camera，面向室内持续供电设备，提供连续 4MP 图像采集、本地 INT8 推理和结构化结果输出。

### 2.2 与 NE301 的差异边界

| 维度 | NE301 | NE302 |
|---|---|---|
| 产品形态 | 模块化低功耗 AI 相机 | 紧凑型 Mini AI Vision Camera |
| 典型供电 | 电池、太阳能、Type-C、PoE 等 | USB Type-C 持续供电 |
| 典型部署 | 户外、低频抓拍、事件触发 | 室内、连续视觉、设备集成 |
| 结构 | 可换镜头/通信/供电模块 | 38×38 mm PCBA，42×42×20 mm 外壳 |
| 视觉能力 | 低功耗事件型视觉 | 连续 4MP 采集，最高 30 fps |
| 安装 | NeoEyes 模块化安装结构 | 后置磁吸或 3M 胶固定 |

共享平台只用于解释技术关系、复用经过核实的通用开发概念和交叉链接；不复制 NE301 的电池续航、低功耗部署、模块化相机等产品描述。

## 3. 证据与写作规则

### 3.1 资料来源优先级

1. `camthink_neoeyes_ne302_datasheet.pdf`：公开产品定位和公开规格的第一来源。
2. `/Users/harryhua/Downloads/NE302-硬件设计-markdown/NE302.md`：硬件方案、主板/接口板差异、结构设计和工程备注来源。
3. `/Users/harryhua/Movies/0-Materials/NE302 Camera mini主板接口板/`：产品外观、主板、接口板和标注图片来源。
4. `https://github.com/camthink-ai/ne302`：软件能力、工程结构、编译/烧录流程和开发资源来源。
5. NE301 Wiki：仅作为同平台 UI 和文档组织的参考，不作为 NE302 参数或功能的直接来源。
6. 用户提供的设备访问信息：作为 Quick Start 的候选输入，必须通过 NE302 实机和固件版本核验后才能进入公开文案。

### 3.2 公开规格口径

以 NE302 datasheet 的当前版本为公开规格基线。当前核验记录为：文件 `camthink_neoeyes_ne302_datasheet.pdf`，5 页，SHA-256 为 `6f805a7fb83842cdc29bbe8ca85953de760d836ce076c1bb7897a731bc8bbab6`，核验日期为 2026-08-12。该 PDF 未提供独立的产品版本号，因此后续发布前仍需由产品/研发确认其是否为当前量产版本。

| 分类 | 公开口径 |
|---|---|
| 主控 | STM32N6，Cortex-M55，800 MHz，Arm Helium |
| AI 加速 | Neural-ART，1 GHz，最高 0.6 TOPS INT8 |
| 内存 | 4.2 MB 片上 SRAM/NPU RAM；32 MB PSRAM |
| Flash | 128 MB SPI Flash |
| 图像 | 4 MP CMOS，2688×1520，最高 30 fps |
| 编码 | H.264、JPEG 硬件编码 |
| 镜头 | 标准 M12，HFOV 88°/137° |
| 无线 | Wi-Fi 6，2.4 GHz；BLE 5.3 |
| 天线 | 外置 SMA，3–4 dBi |
| 存储与控制 | MicroSD、Trigger/Reset 按键、双色指示灯 |
| 供电 | USB Type-C 持续供电 |
| 尺寸 | 38×38 mm PCBA；42×42×20 mm 外壳 |
| 设备 | 白色补光灯、环境温湿度传感器 |
| 部署 | 室内；后置磁吸或 3M 胶安装 |
| 工作温度 | -20 °C 至 +50 °C |

设计稿中出现的 V1.0/V1.1 差异、不同电源采样范围、BLE 兼容备注和接口复用信息属于工程版本信息。除非与当前量产版本确认一致，否则不直接放入产品概述的公开规格表；必要时放入 Hardware Guide 的“版本说明”并标注适用版本。

### 3.3 资料冲突清单

| 项目 | 资料 A | 资料 B | 当前处理 |
|---|---|---|---|
| Flash | datasheet：128 MB | 设计稿：V1.0 128 MB、V1.1 64 MB；GitHub README：512 Mbit（64 MB） | 产品概述暂按 datasheet；Hardware Guide 必须记录硬件版本，量产版本未确认前不写成统一规格 |
| BLE | datasheet：BLE 5.3 | GitHub README：Bluetooth LE 5.4 | 公开页面暂按 datasheet，并在发布前向研发确认；不得同时宣称两个版本 |
| 外壳尺寸 | datasheet：42×42×20 mm | 设计稿：45×50×10 或 50×50×10 等结构候选尺寸 | 42×42×20 mm 仅作为 datasheet 公开口径；设计稿尺寸保留为版本/结构确认项 |
| 电源输入 | datasheet：USB Type-C 持续供电 | GitHub README：USB-C 5 V；设计稿：DC Input 4.5–8 V；对比表另写 5–10 V | 产品页面只写 USB Type-C 持续供电；USB-C 标称 5 V 与工程输入范围不是同一口径，工程范围必须按硬件版本确认，未确认前不写入接线或安全建议 |
| 镜头与视场角 | datasheet：标准 M12；HFOV 88°/137° | 设计稿：M12/M8、HFOV >90、TTL 10–15 mm | Product Overview 暂按 datasheet；Hardware Guide 必须按镜头/硬件版本标注，不能把两套规格合并 |
| 天线 | datasheet：标准外置 SMA，3–4 dBi | 设计稿：外置 SMA 或内置 FPC 软板天线 | 公开配置暂按外置 SMA；内置 FPC 作为可选工程方案，须确认 SKU 和结构版本后再写 |
| 接口板调试接口 | GitHub README：N6-STLINK、U0-STLINK、U6-UART、N6-BOOT、U0-BOOT | 设计稿 V1.1：BOOT0/UART 有取消或改留测试点的备注 | Hardware Guide 改为版本化接口矩阵，当前量产板未确认前不列为固定接口清单 |
| 默认网络与登录 | 用户提供：`192.168.10.10`、管理员登录信息 | NE302 datasheet、设计稿和 README 未声明 | 作为实机核查候选，不进入公开文案，直到记录 NE302 固件版本并验证成功 |

### 3.4 证据标签

文档内部编辑时使用以下判断：

- **官方规格**：datasheet 明确给出的产品参数。
- **源码已声明**：GitHub README、工程目录或构建脚本明确声明的能力。
- **硬件设计资料**：原理图、结构设计稿、BOM 或标注图片中的信息。
- **实机已验证**：在 NE302 真实设备上操作并记录的功能。
- **待确认**：只有设计备注、推断或未完成实测的内容。

对外文档不展示“待确认”字样作为产品能力；没有足够证据的内容暂不写入承诺性描述。

## 4. 总体信息架构

目录建议为：

```text
docs/8-neoeyes-ne302-series/
├── 0-overview.md
├── 1-quick-start.md
├── 2-user-guide/
│   ├── _category_.json
│   └── （页面分类与文件命名：完成 NE302 UI 实机核查后确定）
├── 3-hardware-guide/
│   ├── _category_.json
│   ├── 0-components-overview.md
│   ├── 1-main-board.md
│   ├── 2-interface-board.md
│   └── 3-hardware-resources.md
└── 4-software-guide/
    ├── _category_.json
    ├── 0-development-environment.md
    ├── 1-build-and-flash.md
    ├── 2-software-architecture.md
    └── 3-model-and-ota.md
```

英文目录保持完全相同的相对路径：

```text
i18n/en/docusaurus-plugin-content-docs/current/8-neoeyes-ne302-series/
```

中文和英文侧边栏都将 NE302 作为显式产品系列放在 NE301 之后、NE503 之前；实现时移除英文 `i18n/en/.../sidebars.js` 的自动生成写法，并将两种语言的顺序核验结果保存到 `docs/superpowers/specs/2026-08-12-ne302-sidebar-order.md`。核验命令至少检查 `NE301 → NE302 → NE503` 的相对顺序。使用 `8-` 目录前缀是为了避免改动现有 `7-release-notes/` 路径。

## 5. 页面设计

### 5.1 Product Overview

文件：`0-overview.md`

结构：

1. 产品简介
2. NE302 与 NE301 平台关系
3. 核心能力
4. 产品规格
5. 连续视觉处理流程
6. 硬件平台与两种板卡
7. 镜头、天线、存储和安装方式
8. 典型室内应用场景
9. 产品资料、源码和开发入口
10. 技术支持

职责：回答“NE302 是什么、适合什么场景、主要参数是什么”。不写详细 UI 操作和烧录步骤。

### 5.2 Quick Guide

文件：`1-quick-start.md`

结构 DNA 是“一条线”，目标是让第一次接触设备的读者完成首次成功体验。当前文件仍为 `1-quick-start.md`，对外页面标题统一为 Quick Guide：

1. 套件与工具准备
2. 主板与接口板确认
3. 天线、MicroSD、Type-C 和板间连接
4. 设备上电与指示灯确认
5. 访问 `192.168.10.10`
6. 使用默认管理员账号首次登录并修改密码
7. 查看实时画面
8. 完成一次基础 AI 结果验证：使用设备当前已安装模型和一张固定测试图片，记录模型名称/版本、输入文件、页面或接口结果、预期现象和截图/日志；不在 Spec 中预设 NE302 工厂模型名称
9. 下一步链接：User Guide、Hardware Guide；Software Guide 仅在 Phase 3 页面实际发布后显示，之前不得生成指向不存在页面的链接

Quick Start 只保留完成动作所需的信息，不展开：

- 每个 UI 字段的详细含义
- 模型生命周期管理
- MQTT/存储策略的全部参数
- 硬件版本差异
- CLI、源码编译和故障排查

Quick Start 中的网络地址、默认账号和首次登录步骤属于“候选流程”，只有完成 NE302 实机核查后才可写成确定步骤；如果核查尚未完成，页面先保留硬件连接和资料入口，不发布未经验证的登录承诺。基础 AI 验证的最小成功证据是：设备已上电、当前模型可识别、输入图片已记录、页面/接口返回结果可复现，且证据归档在 `docs/superpowers/evidence/ne302/ai-validation/<hardware>-<firmware>-<date>/`，目录内包含模型名称/版本、输入文件、预期现象、截图或日志。

### 5.3 User Guide：按设备管理职责组织

目录：`2-user-guide/`

User Guide 已在访问 `192.168.10.10` 的 NE302 实机 UI 后确定为 4 个设备管理板块。页面不再保留单独的 Console Overview，也不按 8 个菜单机械拆分，而是按设备职责组织：抓拍与存储、数据发送、AI 模型验证、系统维护。

核查顺序：

1. 记录硬件版本、固件版本、UI 版本、访问时间和核查人员。
2. 登录 NE302，记录实际入口、导航栏、页面路径和页面之间的依赖。
3. 逐页记录字段、按钮、默认值、保存/生效行为、错误提示和硬件联动。
4. 按设备管理职责组织内容，并同步确定英文文件名和中文/英文标题。
5. 采用以下正式页面结构：

   - `0-capture-storage.md` — Capture and Storage：Hardware Management + Capture Settings，管理抓拍、录制、保存策略和 Records。
   - `1-data-transmission.md` — Data Transmission：Application Management + Stream Settings，管理数据和媒体流发送目标。
   - `2-ai-model-validation.md` — AI Model Validation：Feature Debugging + Model Validation，管理模型上传、AI 验证和触发测试。
   - `3-system-maintenance.md` — System Maintenance：System Settings + Storage Management + Device Information，管理设备配置、资源和版本维护。

页面分组以用户任务和跨页依赖为准；菜单名称仍保留在各篇文章的字段和操作章节中。若实机 UI 的实际导航发生变化，先更新核查记录，再调整能力域文章，不回到“一菜单一篇”的碎片化结构。

“NE302 UI 基本跟 NE301 一致”是用户提供的待验证假设，不是当前已核实事实；NE301 只能作为核查对照，不能直接决定 NE302 的页面分类和命名。

### 5.4 Hardware Guide：参考 NE301 架构，填充 NE302 内容

目录：`3-hardware-guide/`

Hardware Guide 可以参考 NE301 的硬件文档架构和页面组织方式，但不复制 NE301 的参数、接口、图片或操作步骤。参考入口包括：

- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/1-hardware-guide/0-components-overview.md`
- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/1-hardware-guide/1-hardware-connection.md`

NE302 页面实际填充内容来自 NE302 主板、接口板、设计稿、datasheet、批准图片和版本矩阵。计划保留 `0-components-overview.md`、`1-main-board.md`、`2-interface-board.md`、`3-hardware-resources.md` 这组架构，但实施时可根据 NE302 硬件资料调整标题；不把 NE301 的开发板名称带入 NE302。

#### `0-components-overview.md`

- NE302 整机/外壳
- 38×38 mm 主板
- 接口板
- 摄像头与 M12 镜头
- SMA 天线
- Type-C、MicroSD 和安装部件

#### `1-main-board.md`

- STM32N6、STM32U0、PSRAM、Flash、Wi-Fi 芯片和摄像头
- 主板尺寸与固定孔
- 主板接口位置
- 主板标注图
- 设计稿中确认过的接口与器件说明

#### `2-interface-board.md`

- Type-C 供电
- 调试、串口、Boot 和 MicroSD 接口的版本化说明
- 接口板标注图和连接注意事项
- V1.0/V1.1/当前量产板接口矩阵；未确认的接口不写成固定清单

#### `3-hardware-resources.md`

- 主板原理图下载
- 接口板原理图下载
- 可选 Ethernet、Cat.1、Wi-Fi HaLow 接口板资料（必须按 SKU/硬件版本矩阵标注，不能暗示为标准配置）
- GitHub Hardware/Docs 资源
- 版本适用范围和资源使用说明

扩展板矩阵保存为 `docs/superpowers/specs/2026-08-12-ne302-hardware-matrix.md`，至少包含：配置类型（标准/可选/未确认）、SKU、主板/接口板硬件版本、扩展板型号、接口、对应资源文件、适用固件和审核状态。没有矩阵记录的扩展板不能进入公开页面。

## 6. UI 核查方案

### 6.1 核查目标

验证“NE302 UI 基本跟 NE301 一致”是否足以复用页面结构，而不是直接假设所有字段完全相同。

### 6.2 核查范围

至少核查：

1. 登录页、默认入口和首次登录行为。
2. 顶部导航的模块数量和名称。
3. 实时预览、抓拍、AI 推理和视频输出。
4. 模型验证、模型导入和模型切换。
5. MQTT/结果输出与 MicroSD 保存。
6. 补光灯、温湿度、Trigger/Reset 和指示灯相关设置。
7. 网络、无线、存储、系统信息和固件升级。

### 6.3 核查输出

核查完成后形成内部差异表：`docs/superpowers/specs/2026-08-12-ne302-ui-diff.md`。该文件记录设备硬件版本、固件版本、核查日期、操作步骤、字段级差异、截图文件名、保存/生效行为、异常结果和审核人，不进入公开 Wiki。

| 项目 | NE301 | NE302 | 处理 |
|---|---|---|---|
| 页面路径 |  |  | 复用/改写 |
| 页面字段 |  |  | 保留/删除/新增 |
| 默认值 |  |  | 以实机为准 |
| 截图 |  |  | 重新截图/复用 |
| 跨页依赖 |  |  | 更新交叉链接 |

核查通过条件：登录入口、导航、页面路径、字段、默认值、保存/生效行为和关键错误路径均有记录；每个拟写入 User Guide 的字段至少有实机记录或明确的“暂不写入”结论。只有通过核查的字段才能进入 User Guide 的最终正文。

## 7. 图片与资源策略

### 7.1 图片目录

```text
static/img/neoeyes-ne302-series/
├── overview/
├── quick-start/
├── user-guide/
└── hardware-guide/
```

图片在进入文档前形成素材清单：`docs/superpowers/specs/2026-08-12-ne302-image-manifest.md`，至少记录原始文件、目标文件名、用途、页面、像素尺寸、硬件/软件版本、审核状态和 CDN 地址。审核状态固定使用 `candidate`、`approved`、`rejected`、`superseded`；同一用途只能有一个 `approved` 文件，旧版和黑色非主推素材不得仅凭目录名进入公开页面。它与公开 Wiki 一样属于内部项目资料，并由 `docusaurus.config.js` 的 `exclude: ['superpowers/**']` 排除在公开构建之外。

Hardware Guide 资源页必须先区分标准配置、可选硬件和未确认版本：默认主板/接口板按硬件版本列为标准，Ethernet、Cat.1 和 Wi-Fi HaLow 只能在有对应 SKU、硬件版本和资源文件时列为可选项；没有矩阵证据的扩展板只进入内部待确认清单。

### 7.2 图片使用原则

- 产品概述优先使用最终外观渲染图和整机图。
- Hardware Guide 优先使用主板、接口板和标注图。
- User Guide 使用英文 UI 截图；如果 NE302 UI 与 NE301 不完全一致，重新截图。
- 原理图和其他非图片资源作为下载文件，不强制嵌入页面。
- 文件名统一使用小写字母、数字和连字符；不直接使用中文原始文件名。
- 图片先使用 `/img/neoeyes-ne302-series/...` 本地路径，质量检查后再通过 `upload-images.sh` 上传 CDN。

## 8. 分阶段交付

### Phase 1：产品与硬件入口

负责人：文档维护者；输入：datasheet、硬件设计稿、批准素材和至少一台可访问的 NE302 样机。若样机核查未完成，Quick Start 的登录步骤只能以“待验证”状态进入草稿，不能发布。

交付：

- Product Overview
- Quick Start
- Hardware Guide 4 页
- 中英文镜像
- 图片整理和本地引用
- 侧边栏入口

目标：用户可以理解产品、完成基本连接、查看硬件结构并取得硬件资源。

出口条件：规格冲突清单得到产品/研发确认并记录在 `docs/superpowers/specs/2026-08-12-ne302-source-conflicts.md`；主板、接口板和扩展板矩阵完成并记录在 `docs/superpowers/specs/2026-08-12-ne302-hardware-matrix.md`；中英文页面、图片清单和本地资源检查通过。

### Phase 2：UI User Guide（实机核查后定稿）

负责人：文档维护者 + NE302 研发/测试；输入：当前硬件版本、当前固件版本和 UI 差异记录。

前置条件：完成 NE302 实机 UI 差异核查。

交付：

- User Guide 4 个设备管理板块；页面分类和文件名以 NE302 实机 UI 核查结果及产品方确认的职责划分为准
- NE302 专属 UI 截图
- 页面字段、依赖和保存/生效行为
- 中英文同步

目标：用户可以按能力域查找和配置设备，而不是依赖 Quick Start 猜测页面用途。

出口条件：先完成 `192.168.10.10` NE302 实机 UI 核查；UI 差异表完成并审核；据此冻结页面分类、文件名和侧边栏顺序；每个公开字段有实机证据；英文截图与中文页面位置对应；构建和双语结构检查通过。

### Phase 3：Software Guide：参考 NE301 架构，填充 NE302 内容

目录：`4-software-guide/`。页面架构可以参考 NE301 的开发板 Software Guide：

- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/2-software-guide/0-development-environment-setup.md`
- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/2-software-guide/1-system-flashing-and-initialization.md`
- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/2-software-guide/2-windows-wsl-source-build-and-flash.md`
- `docs/5-neoeyes-ne301-series/2-NE300-MB01-development-board/2-software-guide/3-wifi-firmware-flashing.md`

NE302 的计划页面先沿用 `0-development-environment.md`、`1-build-and-flash.md`、`2-software-architecture.md`、`3-model-and-ota.md` 作为架构占位；实际内容必须来自 NE302 仓库、SETUP、Makefile、工具版本和 NE302 实机烧录记录，可根据 NE302 工程真实流程调整页面命名。不得复制 NE301 的 N6/U0 流程、工具版本或固件结论。

负责人：文档维护者 + 软件研发；输入：GitHub 固定 commit、SETUP、Makefile、工具版本和实机烧录记录。实现开始时必须把 `camthink-ai/ne302` 的 README URL、抓取日期、branch、commit SHA、README/SETUP/Makefile 对应关系记录到 `docs/superpowers/specs/2026-08-12-ne302-software-provenance.md`；当前 Spec 不预先声称某个 SHA。

基于 GitHub README、SETUP、Makefile 和实际烧录验证补充：

- 开发环境搭建
- 编译、签名、打包和烧录
- N6/U0 启动与 Boot 开关
- 软件工程结构
- 模型转换与部署
- OTA 和恢复流程

没有实机验证的内容只作为开发参考，不写成已验证的操作承诺。

出口条件：固定源码 commit 和工具版本可追溯；至少完成一次 N6 和 U0 的目标流程验证；烧录、启动、回滚或失败路径均有日志或明确的未验证边界。

Software Guide 中的 N6/U0 Boot 流程必须引用 Hardware Guide 的版本矩阵，不得把设计稿 V1.1 可能取消或改为测试点的接口写成所有版本通用步骤。

## 9. 非目标

本 Spec 不包含：

- 修改 NE301 现有产品定义。
- 将 NE302 改名为 NE301 的某个版本。
- 重构整个 wiki 的产品目录。
- 在未核查实机前复制 NE301 全部 UI 文案。
- 根据设计稿推断未确认的量产参数。
- 直接发布性能、功耗、兼容性或稳定性 benchmark。
- 在没有 NE302 实机证据前，公开承诺 `192.168.10.10`、默认账号、默认密码、SSID、UI 路由或字段与 NE301 完全一致。

## 10. 验收标准

### 信息架构

- NE302 在侧边栏中作为独立产品系列出现。
- Quick Start 和 User Guide 分开。
- User Guide 在完成 NE302 UI 实机核查后按真实能力域组织，不按预设页面名或 Quick Start 的线性步骤重复。
- NE301 与 NE302 的共享平台关系有说明，但产品边界清晰。

### 内容

- 产品公开规格全部来自 datasheet 或已核实的官方源码资料。
- 所有 UI 字段和截图经过 NE302 实机核查，或明确留在待验证清单中。
- 不把设计稿中的版本备注直接写成当前量产规格。
- 中英文标题层级、表格、参数和图片位置一致。
- 默认网络和登录信息只有在 UI 差异记录完成后才进入公开 Quick Start。

### 工程质量

- 每个实际 Wiki 页面使用 `python3 /Users/harryhua/Documents/GitHub/camthink/skills/ct-wiki/scripts/validate-frontmatter.py <file>` 校验；本内部 spec 不参与该校验。
- 图片引用对应的 `static/` 文件全部存在。
- 中英文文件路径和文件名完全一致。
- 对中英文页面执行标题层级、标题清单、表格结构和图片引用 diff 检查。
- `yarn build` 通过；由于当前 Docusaurus 配置允许 warning，必须保存构建日志并证明没有新增 broken links、broken anchors 或其他 warning。
- 只修改 NE302 相关文件，不覆盖现有 NE503 未提交改动。

实现时先保存当前 `git status --short` 作为基线；所有变更使用 NE302 路径和明确文件清单，禁止使用 `git add .`。完成后用 `git diff --name-only` 对照基线，确认未新增 NE503 文件变更。

验收命令和产物必须可复现：

```bash
# 对每个实际 Wiki 页面执行；<file> 替换为实际 Markdown 路径
python3 /Users/harryhua/Documents/GitHub/camthink/skills/ct-wiki/scripts/validate-frontmatter.py <file>

# 对每个中英文对应页执行标题层级、标题清单、表格结构和图片引用检查
rg -c '^#{1,3} ' <zh-file> <en-file>
diff -u <(sed -n -E 's/^(#{1,3}) .*/\1/p' <zh-file>) \
        <(sed -n -E 's/^(#{1,3}) .*/\1/p' <en-file>)
rg -n '^#{1,3} ' <zh-file> <en-file>
diff -u <(rg -n '^\|' <zh-file> | sed -E 's/^[0-9]+://; s/[^|]+/X/g') \
        <(rg -n '^\|' <en-file> | sed -E 's/^[0-9]+://; s/[^|]+/X/g')
diff -u <(rg -o '!\[[^]]*\]\([^)]*\)' <zh-file> | sort) \
        <(rg -o '!\[[^]]*\]\([^)]*\)' <en-file> | sort)

# 首次实施前保存不含 NE302 变更的基线日志；后续验收使用同一命令生成当前日志
set -o pipefail
DEPLOY_ENV=local yarn build 2>&1 | tee /private/tmp/ne302-wiki-build-baseline.log
DEPLOY_ENV=local yarn build 2>&1 | tee /private/tmp/ne302-wiki-build.log
rg -i 'warning|broken link|broken anchor' /private/tmp/ne302-wiki-build-baseline.log | sort > /private/tmp/ne302-wiki-warnings-baseline.txt
rg -i 'warning|broken link|broken anchor' /private/tmp/ne302-wiki-build.log | sort > /private/tmp/ne302-wiki-warnings-current.txt
diff -u /private/tmp/ne302-wiki-warnings-baseline.txt /private/tmp/ne302-wiki-warnings-current.txt

# 图片引用存在性检查；<file> 替换为实际 Markdown 页面
file="<file>"
while IFS= read -r ref; do
  case "$ref" in
    /img/*) test -f "static$ref" ;;
    ./*) test -f "$(dirname "$file")/${ref#./}" ;;
    *) test -f "$(dirname "$file")/$ref" ;;
  esac || { echo "missing image: $ref"; exit 1; }
done < <({
  rg --pcre2 -o '!\[[^]]*\]\(\K[^)]+' "$file"
  rg --pcre2 -o 'src="[^"]+"' "$file" | sed -E 's/^src="([^"]+)"/\1/'
  rg --pcre2 -o "src='[^']+'" "$file" | sed -E "s/^src='([^']+)'/\1/"
})

# 双语 sidebar 顺序检查结果保存到内部记录
rg -n 'neoeyes-ne301|neoeyes-ne302|neoeyes-ne503' sidebars.js i18n/en/docusaurus-plugin-content-docs/current/sidebars.js
python3 -c 'import sys; t=open(sys.argv[1]).read(); p=[t.find(x) for x in sys.argv[2:]]; assert all(x >= 0 for x in p) and p == sorted(p), (sys.argv[1], p)' <sidebar-file> 5-neoeyes-ne301-series 8-neoeyes-ne302-series 6-neoeyes-ne503-series

# 对动态 JSX 图片引用逐项确认；表达式形式不能只依赖正则，必须回填 image manifest
rg -n 'ZoomableImage|<img|src=' <file>
```

warning 验收先保存同一基线下的完整构建日志，再对当前日志提取 warning 行并执行 `diff -u`；已知基线 warning 必须逐条记录，新增 warning、broken link 或 broken anchor 均使验收失败。验收记录至少包含：页面清单、frontmatter 输出、双语标题/表格/图片 diff 输出、标准配置/可选硬件矩阵、构建基线与当前日志路径、warning 比较、broken link/anchor 检查结果，以及与基线比较后的 `git diff --name-only`。所有 diff 命令使用 `diff -u`；非零退出必须阻断验收，不得用 `|| true` 吞掉差异。

## 11. 当前结论

NE302 应独立成为一个产品系列；它与 NE301 的关系应表达为“同平台、不同产品定位”。

首期文档体系按 Product Overview + Quick Start + User Guide + Hardware Guide 设计，并预留 Software Guide。现有资料可以支撑产品和硬件入口；User Guide 的页面分类和命名必须在访问 `192.168.10.10`、熟悉 NE302 UI 后再确定。Hardware Guide 和 Software Guide 可以复用 NE301 的信息架构作为模板，但页面内容、参数、图片、工具链和操作结论必须重新以 NE302 资料、源码和实机验证为准。

<!-- 以上为文档正文，以下为审核修复记录 -->

---

## 🔍 Dual Review Log

### Round 1 — 2026-08-12 · 串行退化

| # | 级别 | 阶段 | 标准性质 | 位置 | 问题 | 修复动作 |
|---|---|---|---|---|---|---|
| 1 | HIGH | P1 | 事实核查 | Quick Start 登录步骤 | NE301 的地址和默认登录行为未被 NE302 专属资料核实。 | 改为用户提供的候选流程；增加实机/固件核验门槛，并列入非目标和验收条件。 |
| 2 | HIGH | P1 | 事实核查 | Hardware Guide 接口板 | GitHub README 与设计稿 V1.1 对 BOOT/UART 接口存在冲突。 | 增加资料冲突清单；接口板改为版本化矩阵，不再固化接口清单。 |
| 3 | MEDIUM | P1 | 事实核查 | 公开规格 BLE | datasheet 为 BLE 5.3，README 为 BLE 5.4。 | 增加冲突记录，暂以 datasheet 为公开基线，发布前要求研发确认。 |
| 4 | MEDIUM | P1 | 事实核查 | 产品尺寸 | datasheet 与设计稿存在不同外壳候选尺寸。 | 增加尺寸冲突记录，区分公开口径和结构确认项。 |
| 5 | MEDIUM | P1 | 事实核查 | UI 复用假设 | “NE302 UI 基本跟 NE301 一致”无法由现有资料核实。 | 改为用户提供的待验证假设，并要求实机差异核查。 |
| 6 | MEDIUM | P2 | 机械检测 | Software Guide 链接 | Quick Start 引用 Software Guide，但目录未定义。 | 增加 `4-software-guide/` 及四个计划页面。 |
| 7 | MEDIUM | P1 | 事实核查 | Frontmatter 验收 | 仓库内没有所称 frontmatter 验证命令。 | 指定 ct-wiki 的实际验证脚本路径；内部 spec 明确不参与 Wiki 构建。 |
| 8 | MEDIUM | P2 | 机械检测 | UI 差异表 | 空表没有产物、版本和审核要求。 | 指定差异表路径、记录字段和通过条件。 |
| 9 | MEDIUM | P2 | 机械检测 | 双语/构建验收 | 没有 diff 检查，且构建允许 warning。 | 增加标题/表格/图片 diff、日志留存和“无新增 warning”要求。 |
| 10 | MEDIUM | P2 | 机械检测 | Spec frontmatter | 内部 spec 位于 docs 下，容易被误认为 Docusaurus 页面。 | 明确该目录为内部 spec，不参与 Docusaurus 构建；实际 Wiki 页面仍需 frontmatter。 |
| 11 | MEDIUM | P2 | 主观意见 | User Guide 能力范围 | 硬件存在不等于 UI 可配置。 | 将补光、温湿度和联动能力改为硬件事实 + UI 实机验证项。 |
| 12 | LOW | P2 | 主观意见 | 分阶段交付 | 缺少负责人、输入、输出和出口条件。 | 为三阶段增加负责人、输入、证据产物和出口条件。 |
| 13 | LOW | P2 | 主观意见 | 图片策略 | 缺少素材清单和批准状态。 | 增加 image manifest 路径和字段要求。 |
| 14 | LOW | P2 | 主观意见 | 目标与结论 | 首次成功体验和资料支撑判断缺少边界。 | 增加 Quick Start 的候选流程、实机证据和发布门槛。 |

**本轮修复**：14 个 | **累计修复**：14 个

审核员报告称当前运行时按串行退化规则执行；下一轮重新派发独立审核 agent。

### Round 2 — 2026-08-12 · 串行退化

| # | 级别 | 阶段 | 标准性质 | 位置 | 问题 | 修复动作 |
|---|---|---|---|---|---|---|
| 1 | HIGH | P1 | 事实核查 | Flash 冲突 | 冲突清单漏列 GitHub README 的 512 Mbit（64 MB）口径。 | 补入冲突表，并继续要求按硬件版本确认后再发布统一容量。 |
| 2 | HIGH | P1 | 事实核查 | 电源冲突 | 设计稿的 4.5–8 V 与 5–10 V 两组工程范围未显式记录。 | 补入冲突表；公开页面暂只写 USB Type-C，工程范围须按版本确认。 |
| 3 | HIGH | P1 | 事实核查 | 镜头与视场角 | 设计稿的 M12/M8、HFOV >90 与 datasheet 的 M12、88°/137° 未形成明确冲突记录。 | 补入镜头/视场角冲突项，要求 Hardware Guide 按镜头和硬件版本标注。 |
| 4 | MEDIUM | P1 | 事实核查 | 天线 | 设计稿的内置 FPC 天线方案没有进入资料冲突清单。 | 增加天线冲突项，外置 SMA 作为公开基线，FPC 作为待确认工程 SKU。 |
| 5 | MEDIUM | P1 | 事实核查 | 英文侧边栏 | 英文侧边栏当前自动生成，无法仅凭现有配置保证 NE302 产品顺序。 | 明确实现时改为显式产品顺序，或保存构建后的顺序核验结果。 |
| 6 | MEDIUM | P1 | 可追溯性 | datasheet 来源 | 只写文件名不足以让后续实施者定位本地证据。 | 在来源规则中保留完整用户提供路径、页数、SHA-256 和核验日期，并要求发布前确认版本。 |
| 7 | MEDIUM | P3 | 可追溯性 | GitHub 来源 | 当前无法取得源码 commit SHA，软件来源存在漂移风险。 | 不预先声称 SHA；Phase 3 明确记录 branch、commit、README/SETUP/Makefile 关系。 |
| 8 | MEDIUM | P2 | 机械检测 | 目录树 | Hardware Guide 子树的连接符不完整，容易误读页面层级。 | 修正为可复制的完整树形结构。 |
| 9 | MEDIUM | P1 | 依赖关系 | Quick Start | Quick Start 链接 Software Guide，但该阶段尚未交付。 | 将 Software Guide 标记为后续入口，实施时在页面发布顺序中设置阶段门槛。 |
| 10 | MEDIUM | P2 | 机械检测 | 双语/构建验收 | 只说要 diff 和存日志，未给出可复现命令或产物字段。 | 增加 frontmatter、标题/图片 diff、`yarn build`、pipefail 和验收记录要求。 |
| 11 | MEDIUM | P1 | 事实核查 | Boot 流程 | 未来 Software Guide 可能把设计稿接口备注误写成通用步骤。 | 要求 Boot 流程引用 Hardware Guide 版本矩阵，并保留未验证边界。 |
| 12 | MEDIUM | P2 | 事实核查 | AI 结果验证 | “完成一次 AI 验证”缺少模型、输入、结果和预期证据定义。 | 定义当前安装模型、固定测试图片、结果、预期现象和截图/日志为最小证据。 |
| 13 | LOW | P2 | 资源治理 | 图片 manifest | 图片状态和主图选择规则不够明确。 | 定义 `candidate/approved/rejected/superseded` 状态，并要求每个用途只有一个 approved 素材。 |
| 14 | LOW | P1 | 交付门槛 | Phase 1 | 冲突确认和版本矩阵缺少明确产物路径。 | 将冲突记录路径和版本矩阵作为 Phase 1 出口条件。 |

**本轮修复**：14 个 | **累计修复**：28 个

审核员报告称当前运行时按串行退化规则执行；将继续派发新一轮审核确认是否还有 HIGH/CRITICAL。

### Round 3 — 2026-08-12 · 串行退化

| # | 级别 | 阶段 | 标准性质 | 位置 | 问题 | 修复动作 |
|---|---|---|---|---|---|---|
| 1 | HIGH | P1 | 事实核查 | 内部 spec 构建边界 | `docs/superpowers/` 位于 Docusaurus 的 `docs` 路径下，默认会被扫描；spec 原先声称其天然不参与构建。 | 在 `docusaurus.config.js` 的 docs 配置中显式加入 `exclude: ['superpowers/**']`，并在 spec 中要求未来配置变更保留该规则、用构建产物验证。 |
| 2 | HIGH | P2 | 机械检测 | 图片引用 diff 命令 | 图片正则实际写成双反斜杠，可能造成真实图片引用为空匹配而误通过。 | 改为单反斜杠正则，并统一使用 `diff -u`，差异必须阻断验收。 |
| 3 | MEDIUM | P1 | 事实核查 | 电源冲突 | GitHub README 的 USB-C 5 V 口径仍未列入电源冲突表。 | 增加 README 5 V，并明确标称供电与工程输入范围的区别。 |
| 4 | MEDIUM | P1 | 事实核查 | 扩展板资源 | Ethernet、Cat.1、Wi-Fi HaLow 是需对应模块的扩展能力，原计划容易暗示为标准配置。 | 增加标准配置/可选硬件/未确认版本矩阵和 SKU 门槛。 |
| 5 | MEDIUM | P2 | 机械检测 | Quick Start 阶段链接 | Phase 1 尚未交付 Software Guide，提前链接可能产生 broken link。 | 规定 Software Guide 仅在 Phase 3 页面发布后显示。 |
| 6 | MEDIUM | P2 | 机械检测 | 英文侧边栏 | “显式或保存核验结果”仍是二选一，验收不够确定。 | 选定中英文均使用显式产品顺序，并要求保存双语顺序核验结果。 |
| 7 | MEDIUM | P2 | 机械检测 | 双语验收 | 原命令只比较标题数量和图片，未比较标题层级、标题清单和表格结构。 | 增加标题层级/清单、表格结构、图片引用的 `diff -u` 命令。 |
| 8 | MEDIUM | P2 | 验收可执行性 | 本地图片 | 只写 `static/` 图片必须存在，没有逐项文件存在性检查。 | 增加逐项 `test -f` 检查，并将缺失图片作为失败。 |
| 9 | MEDIUM | P2 | 验收可执行性 | warning 基线 | 只保存当前 build 日志，未定义“新增 warning”的基线比较。 | 要求保存基线日志、记录已知 warning，并对当前与基线 warning 执行 `diff -u`。 |
| 10 | MEDIUM | P1 | 软件可追溯性 | GitHub provenance | README 信息没有抓取日期和 commit 绑定。 | provenance 文件必须记录 URL、抓取日期、branch 和 commit SHA。 |
| 11 | MEDIUM | P2 | UI 证据闭环 | AI 首次验证 | 截图/日志没有固定证据目录和硬件/固件关联字段。 | 增加固定证据目录、命名规则，以及模型/输入/预期/版本字段要求。 |

**本轮修复**：11 个 | **累计修复**：39 个

审核员报告称当前运行时按串行退化规则执行；修复后继续派发复核轮次。

### Round 4 — 2026-08-12 · 串行退化

| # | 级别 | 阶段 | 标准性质 | 位置 | 问题 | 修复动作 |
|---|---|---|---|---|---|---|
| 1 | MEDIUM | P2 | 机械检测 | 双语标题/表格命令 | macOS `sed` 的 BRE 写法和未转义的 `|` 可能导致标题、表格 diff 误通过。 | 改用 `sed -E`、转义表格行起始竖线，并保留 `diff -u` 非零失败语义。 |
| 2 | MEDIUM | P2 | 验收可执行性 | 图片存在性 | 原检查只覆盖 `./` Markdown 图片，漏掉 `/img/`、HTML/JSX `src` 和 `ZoomableImage`。 | 增加 Markdown、双引号/单引号 `src` 提取；分别检查相对路径和 `static/img` 绝对路径。 |
| 3 | MEDIUM | P2 | 验收可执行性 | warning 基线 | 没有固定基线日志、warning 提取和比较命令。 | 固定 baseline/current 日志及 warning 文件路径，并加入 `diff -u`。 |
| 4 | MEDIUM | P1 | 交付产物 | 扩展板矩阵 | 标准/可选/未确认矩阵没有文件位置和字段定义。 | 定义 `ne302-hardware-matrix.md` 路径、SKU/硬件版本/资源/固件/状态字段，并纳入 Phase 1 出口。 |
| 5 | MEDIUM | P2 | 机械检测 | 双语侧边栏 | 显式 sidebar 的顺序核验没有固定产物路径和命令。 | 定义 `ne302-sidebar-order.md` 及 `NE301 → NE302 → NE503` 顺序核验命令。 |

**本轮修复**：5 个 | **累计修复**：44 个

### 收敛结论

第四轮审核结果：CRITICAL 0，HIGH 0。剩余 MEDIUM/LOW 已完成最后修补。前四轮审核均由审核员报告为“串行退化”模式，未获得运行时独立 sub-agent；以上记录不把该运行时状态表述为真正独立审查。

### Round 5 — 2026-08-12 · 串行退化

| # | 级别 | 阶段 | 标准性质 | 位置 | 问题 | 修复动作 |
|---|---|---|---|---|---|---|
| 1 | MEDIUM | P2 | 机械检测 | 标题 diff 命令 | `sed -E` 未使用 `-n`，可能把未匹配文本混入比较结果，且无法稳定表达标题层级检查。 | 改为 `sed -n -E`；标题文本清单仍由 `rg -n '^#{1,3} '` 输出供人工核对。 |
| 2 | MEDIUM | P2 | 验收闭环 | JSX 图片 | 正则检查不能覆盖所有动态 JSX 表达式。 | 增加 `ZoomableImage`/`<img`/`src=` 检索；动态表达式必须回填 image manifest 后逐项确认。 |
| 3 | MEDIUM | P2 | 验收闭环 | sidebar 顺序 | 只检索名称不足以断言 NE301 → NE302 → NE503 顺序。 | 增加 Python 位置断言，要求两种 sidebar 都通过顺序检查并保存结果。 |

**本轮修复**：3 个 | **累计修复**：47 个

### 最终收敛结论

第五轮结果：CRITICAL 0，HIGH 0，MEDIUM 1 个已修补。User Guide 已明确为“先访问 `192.168.10.10` 熟悉 NE302 UI，再决定分类和命名”；Hardware Guide、Software Guide 已明确“参考 NE301 架构，实际填充 NE302 内容”。达到 dual-review 最大五轮，停止继续派发审核。
