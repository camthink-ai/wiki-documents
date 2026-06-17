---
description: "NeoMind 仪表板使用指南：创建与编辑仪表板、组件库（数值卡/图表/开关/图像/视频/地图等）、实时数据、数据源绑定、分享公开链接与移动端适配。"
keywords: [NeoMind, 仪表板, dashboard, 组件, widget, 实时数据, 分享]
tags: [NeoMind, 用户指南]
sidebar_label: "Use Dashboards"
---

# 使用仪表板

仪表板（Dashboard）是 NeoMind 的核心可视化界面。你把各种组件拖拽到画布上，绑定设备数据源，即可实时观察遥测数据、AI 推理结果与设备状态。

## 总览

每个仪表板是一个**响应式网格**，可承载多个组件：

- **实时更新**：通过 WebSocket / SSE 推送，数据变化秒级反映到组件
- **响应式布局**：桌面端拖拽编辑；移动端自动堆叠为单列
- **可分享**：生成带过期时间的公开链接，免登录查看
- **多后端**：一个仪表板可同时展示来自多个 NeoMind 实例的数据

## 创建仪表板

1. 点击左侧导航栏的 **Dashboards（仪表板）** 图标进入仪表板列表
2. 点击列表中的 **+（New Dashboard）** 按钮

<img src="https://resources.camthink.ai/NeoMind/dashboard-create-dialog.png" alt="创建仪表板对话框 — 输入名称与描述" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

3. 输入**名称**（必填）与**描述**（可选），点击创建
4. 新仪表板自动进入编辑模式，此时画布为空

> 仪表板列表页会展示所有已创建的仪表板，点击名称即可进入查看：

<img src="https://resources.camthink.ai/NeoMind/dashboard-list.png" alt="仪表板列表 — 所有已创建的仪表板" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

## 查看模式 vs 编辑模式

仪表板有两种模式，通过工具栏左侧的 **齿轮/✓ 图标** 切换：

| 模式 | 说明 | 图标 |
|------|------|------|
| **查看模式**（默认） | 锁定布局，仅展示实时数据。普通用户和分享链接访客看到的就是这个模式 | 齿轮图标（Settings2） |
| **编辑模式** | 可拖拽组件位置与大小、添加/删除组件、修改配置。网格支持磁吸对齐 | ✓ 图标（Check） |

<img src="https://resources.camthink.ai/NeoMind/dashboard-view-empty.png" alt="仪表板查看模式 — 空状态提示进入编辑" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

> 空仪表板在查看模式下会提示「Click Edit Layout to add components」。点击齿轮图标进入编辑模式后，会出现 **Add Component** 按钮。

<img src="https://resources.camthink.ai/NeoMind/dashboard-edit-mode.png" alt="仪表板编辑模式 — 空状态与 Add Component 按钮" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

## 添加组件

### 组件库

在编辑模式下点击 **Add Component**，打开组件库面板。组件按类别分组：

<img src="https://resources.camthink.ai/NeoMind/dashboard-widget-library.png" alt="组件库 — 按类别分组的内置组件" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

#### 指标与指示器（Indicators & Metrics）

| 组件 | 用途 | 典型场景 |
|------|------|---------|
| **Value Card**（数值卡） | 大字号展示单个数值，支持单位、阈值变色 | 温度、湿度、计数器 |
| **LED Indicator**（LED 指示灯） | 开/关状态指示灯 | 设备在线状态、阀门开关 |
| **Sparkline**（迷你折线图） | 小型趋势线，嵌入紧凑布局 | 实时趋势预览 |
| **Progress Bar**（进度条） | 水平/垂直进度条 | CPU 占用、存储使用率 |

#### 图表（Charts）

| 组件 | 用途 | 典型场景 |
|------|------|---------|
| **Line Chart**（折线图） | 时序数据折线趋势 | 温度历史曲线、流量趋势 |
| **Area Chart**（面积图） | 带填充的时序图 | 累积量、库存水位 |
| **Bar Chart**（柱状图） | 离散数据对比 | 各产线产量、周统计 |
| **Pie Chart**（饼图） | 占比分布 | 设备类型分布、告警分类 |

#### 控件（Controls）

| 组件 | 用途 | 典型场景 |
|------|------|---------|
| **Toggle Switch**（开关） | 发送开/关指令到设备 | 远程控制灯光、水泵 |

#### 展示与内容（Display & Content）

| 组件 | 用途 | 典型场景 |
|------|------|---------|
| **Image Display**（图像展示） | 显示最新一帧图像 + AI 标注框 | YOLO 检测结果、抓拍画面 |
| **Image History**（图像历史） | 按时间浏览历史图像 | 安防回放、事件追溯 |
| **Web Display**（网页嵌入） | iframe 嵌入外部网页 | 第三方监控面板、文档 |
| **Markdown Display**（Markdown 文本） | 富文本说明 | 仪表板标题说明、操作指南 |

#### 空间与媒体（Spatial & Media）

| 组件 | 用途 | 典型场景 |
|------|------|---------|
| **Map Display**（地图） | GPS 坐标标注 + 轨迹 | 车辆定位、资产分布 |
| **Video Display**（视频流） | RTSP / RTMP / HLS 实时视频流 | NE301/NE101 实时画面 |
| **Custom Layer**（自定义图层） | 社区或自研组件 | 任意扩展 |

> 除了内置组件，还可以通过 **Marketplace** 标签页从[社区市场](https://github.com/camthink-ai/NeoMind-Dashboard-Components)安装更多组件。

### 配置组件

从组件库点击一个组件类型后，它会添加到画布上，同时弹出配置面板。核心配置项：

**① 数据源绑定（Data Source）**

每个组件需要绑定一个数据源才能显示数据。在配置面板中选择：

| 选择项 | 说明 |
|--------|------|
| **Instance**（实例） | 选择 NeoMind 后端实例（本地或远程） |
| **Device**（设备） | 选择要展示哪个设备的数据 |
| **Metric**（指标） | 选择具体指标（如 `temperature`、`humidity`） |

选择后系统自动生成 **DataSourceId**，格式为 `{type}:{id}:{field}`：

| 类型 | 示例 | 含义 |
|------|------|------|
| `device` | `device:esp32-01:temperature` | 设备的某个指标 |
| `extension` | `extension:weather:temp` | 扩展提供的指标 |
| `agent` | `agent:guard-01:last_result` | Agent 执行结果 |

> DataSourceId 自动生成，无需手写。

**② 显示选项**

根据组件类型不同，可配置：
- **标题/单位**：组件上方显示的名称和数据单位
- **颜色/阈值**：数值超过阈值时变色（如温度 > 30°C 变红）
- **时间范围**：图表类组件可选最近 1h / 24h / 7d / 自定义
- **刷新间隔**：数据拉取频率（实时推送不受此限制）

**③ 布局调整**

- **拖拽**：按住组件拖动到目标位置，网格自动对齐
- **缩放**：拖拽组件右下角调整大小
- **删除**：选中组件后按删除键或点配置面板中的删除按钮

## 实时数据流

NeoMind 通过 **WebSocket / SSE** 把设备数据推送到前端：

- 设备发布 MQTT 数据 → 后端事件总线 → 前端订阅的组件刷新
- 端到端延迟通常 < 1 秒（同机房）
- 离线时前端自动重连，重连后补齐最近数据

历史数据查询见组件的「时间范围」配置（最近 1 小时 / 24 小时 / 7 天 / 自定义）。

## 分享仪表板

可将仪表板生成**公开链接**分享给未登录用户：

1. 在仪表板工具栏点击 **Share（分享）** 图标

<img src="https://resources.camthink.ai/NeoMind/dashboard-share-dialog.png" alt="分享对话框 — 生成公开链接" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

2. 点击 **New Link** 生成新链接
3. 设置过期时间（1 小时 / 1 天 / 7 天 / 永久）
4. 复制生成的链接（形如 `https://your-host/share/<token>`）
5. 访问者无需账号即可查看（只读）

> **注意**：分享链接只暴露该仪表板的只读视图，不暴露 API Key、设备控制权或其他仪表板。过期后链接自动失效。

## 移动端适配

<img src="https://resources.camthink.ai/NeoMind/dashboard-mobile.png" alt="仪表板移动端 — 单列堆叠布局" style={{width: '50%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

- **响应式断点**：< 768px 自动切单列堆叠布局
- **编辑模式**：移动端默认禁用拖拽编辑（屏幕过小），建议在桌面端编辑
- **触摸交互**：图表支持双指缩放、滑动平移
- **移动 Web**：浏览器直接访问 `http://your-host:9375` 即可，无需安装 App

## 多实例仪表板

如果你管理多个 NeoMind 后端（如厂房的多台边缘服务器），可在 **Settings → Instances（实例）** 注册它们。注册后，在仪表板编辑组件时可以**跨实例**选择数据源——一个仪表板同时展示多个后端的设备数据。

## 社区组件与自定义组件

内置组件覆盖了常见的物联网可视化需求。如果需要更多组件，NeoMind 提供两种扩展方式：

### 方式一：从社区市场安装（Marketplace）

在组件库面板切换到 **Marketplace** 标签页，可以浏览社区组件市场：

<img src="https://resources.camthink.ai/NeoMind/dashboard-marketplace.png" alt="社区组件市场 — 浏览并一键安装社区组件" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

每个组件卡片显示：

| 信息 | 说明 |
|------|------|
| **组件名称 + 图标** | 组件的标识 |
| **版本号** | 如 `v1.1.0` |
| **作者** | 如 `NeoMind Team`、`CamThink Team` |
| **描述** | 组件功能简介 |
| **Install / Uninstall** | 一键安装或卸载 |

点击 **Install** 即可安装，安装后组件出现在 **Components** 标签页中，可以像内置组件一样使用。已安装的组件显示 **Uninstall** 按钮，随时可移除。

> 市场组件来源于 [NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components) 社区仓库，持续更新中。

### 方式二：上传 ZIP 包导入

如果你自己开发了组件，或从其他渠道获得了组件包，可以通过 **Import Component** 功能上传：

1. 在 Marketplace 标签页点击右上角的 **Import Component** 按钮

<img src="https://resources.camthink.ai/NeoMind/dashboard-widget-import.png" alt="导入组件对话框 — 上传 ZIP 组件包" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

2. 点击上传区域选择 `.zip` 文件（或拖拽文件到上传区）
3. ZIP 包内必须包含 `manifest.json`（组件元数据）和 `bundle.js`（组件代码）
4. 点击 **Install Confirm** 完成安装

> ZIP 包结构详见 [开发指南 — Dashboard 组件开发](../developer-guide/8-dashboard-component-dev.md)。

也可以用 CLI 安装：

```bash
# 列出市场可用组件
neomind widget list

# 安装市场组件
neomind widget install <组件名>

# 从本地 ZIP 安装
neomind widget install /path/to/widget.zip
```

### 自研组件

想开发自己的组件？NeoMind 组件本质是一个 ZIP 包（`manifest.json` + `bundle.js`），用 React 编写，打包为 IIFE 格式。开发完成后通过 Import Component 上传即可使用。

完整开发流程见 [开发指南 — Dashboard 组件开发](../developer-guide/8-dashboard-component-dev.md)。

## 下一步

- [AI Chat](./5-ai-chat.md) — 用自然语言查询设备数据
- [AI Agent](./6-ai-agent.md) — 定时/事件触发的自主巡检
- [自动化规则](./7-automation-rules.md) — 数据越界自动告警

---

*最后更新: 2026-06-16*
