---
description: "NeoMind 扩展管理指南：安装/卸载扩展（.nep）、官方扩展市场、扩展详情页（总览/配置/命令/指标/日志）、扩展能力（指标/命令/组件）、进程隔离与崩溃保护、CLI 与 REST API。"
keywords: [NeoMind, 扩展, extension, 安装, 市场, 进程隔离, 崩溃保护]
tags: [NeoMind, 用户指南]
sidebar_label: "Extension Management"
---

# 扩展管理

扩展（Extension）是 NeoMind 的**可插拔能力模块**——视觉 AI、OCR、天气预报、自定义数据源等，都以扩展形式接入。扩展运行在**独立进程**中，通过 FFI 通信，单个扩展崩溃不会影响主服务，实现了真正的故障隔离。

## 什么是扩展？

扩展为 NeoMind 提供三类能力：

| 能力 | 说明 | 数据形态 | 典型示例 |
|------|------|----------|----------|
| **指标（Metric）** | 扩展产出的时序数据，写入 `telemetry.redb`，可在仪表板展示 | 按时间序列存储 | 天气扩展的 `temperature` 指标 |
| **命令（Command）** | 可被 AI Agent / API / 规则调用的操作，支持参数与返回值 | 输入参数 → 执行 → 返回 JSON | YOLO 扩展的 `detect` 命令 |
| **组件（Component）** | 仪表板自定义可视化组件（由扩展附带的前端 bundle 提供） | 在仪表板编辑器中拖入 | 视频流扩展的实时画面组件 |

一个扩展可以同时声明多种能力。例如 `yolo-video-v2` 同时提供指标（检测统计）、命令（单帧检测）和组件（实时画框画面）。

## 官方扩展

[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库提供官方扩展：

| 扩展 | 类型 | 能力 | 说明 |
|------|------|------|------|
| **Weather Forecast** | 数据源 | 指标 + 命令 | 天气预报与实时气象数据（OpenWeather / 和风天气） |
| **YOLO Detection** | 视觉 AI | 指标 + 命令 | 目标检测（YOLO 模型），支持图片和视频流 |
| **OCR** | 视觉 AI | 命令 | 图片文字提取（PaddleOCR） |
| **Face Recognition** | 视觉 AI | 命令 + 组件 | 人脸检测与识别 |
| **Video Stream** | 流处理 | 指标 + 命令 + 组件 | RTSP/RTMP 视频流接入与推理 |
| **Device Inference** | 设备推理 | 指标 | 边缘 AI 相机（NE101/NE301）推理结果接入 |

详细的端到端示例见 [应用案例](../use-cases/1-object-detection.md)。

## 界面总览

进入左侧导航的 **Extensions** 页签，可以看到当前已安装的全部扩展：

<img src="https://resources.camthink.ai/NeoMind/extensions-list.png" alt="扩展管理列表页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

页面顶部工具栏提供三个操作：

| 按钮 | 图标 | 作用 |
|------|------|------|
| **刷新** | RefreshCw（旋转箭头） | 重新拉取扩展列表，查看最新状态 |
| **上传安装** | Upload | 打开本地 `.nep` 包安装对话框 |
| **扩展市场** | Globe（地球） | 打开官方扩展市场，一键下载安装 |

扩展卡片本身展示：扩展名称、版本号、当前状态（Running / Stopped / Error）、提供的能力图标（指标 / 命令 / 组件）。**点击卡片任意区域**即可进入扩展详情页。

## 安装扩展

NeoMind 提供四种安装方式，按推荐度排序：

### 方式一：扩展市场（推荐）

点击工具栏的 **地球图标** 打开扩展市场对话框，NeoMind 会从官方仓库拉取可用的扩展列表：

<img src="https://resources.camthink.ai/NeoMind/extensions-marketplace.png" alt="扩展市场对话框" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

在市场对话框中：

1. 浏览可用的官方扩展（含名称、版本、简介、大小）
2. 点击 **Install** 一键下载并安装
3. 安装完成后扩展自动出现在列表中并启动

市场安装会自动选择与当前主服务 ABI 版本匹配的扩展包，无需手动选平台。

### 方式二：Web UI 上传

如果你已有 `.nep` 包（自己开发或从 [Releases](https://github.com/camthink-ai/NeoMind-Extensions/releases) 下载），可以使用上传安装：

<img src="https://resources.camthink.ai/NeoMind/extensions-upload.png" alt="上传安装对话框" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

1. 点击工具栏的 **Upload 按钮**
2. 在弹出的对话框中拖入或选择 `.nep` 文件
3. NeoMind 自动校验包完整性、ABI 版本、签名
4. 校验通过后解包、加载、启动

:::tip
`.nep` 包内含多平台二进制（Linux `.so` / macOS `.dylib` / Windows `.dll`），NeoMind 会自动选择当前平台的二进制加载。跨平台分发的扩展无需重新打包。
:::

### 方式三：CLI

```bash
# 安装本地 .nep 包
neomind extension install /path/to/weather-forecast.nep

# 从 URL 安装（适合自动化部署）
neomind extension install https://github.com/camthink-ai/NeoMind-Extensions/releases/download/v0.6.1/weather-forecast-v0.6.1.nep

# 列出已安装扩展
neomind extension list

# 查看扩展详情（指标、命令、配置参数）
neomind extension info <extension_id>

# 卸载
neomind extension uninstall <extension_id>
```

### 方式四：AI Chat

直接对 [AI Chat](./5-ai-chat.md) 说：

> 「帮我安装天气扩展」

LLM 会引导你上传 `.nep` 包或提供下载链接，并自动调用 `extension install` 命令完成安装。

## 扩展详情与配置

**点击任意扩展卡片**进入详情页。详情页采用左右布局：左侧是五个功能区的导航，右侧是对应内容。下面分别介绍每个标签页。

### 1. Overview（总览）

<img src="https://resources.camthink.ai/NeoMind/extensions-details-overview.png" alt="扩展详情 - 总览页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

总览页展示扩展的基本信息：

- **扩展 ID**：唯一标识（如 `yolo-device-inference`），用于 API 调用、数据源绑定
- **名称与版本**：人类可读名称 + SemVer 版本号
- **状态**：当前运行状态（Running / Stopped / Error / Crash Loop）
- **能力声明**：扩展提供的能力类型（指标数 / 命令数 / 组件数）
- **描述**：扩展的功能说明
- **ABI 版本**：扩展编译时对应的 ABI 版本（必须与主服务匹配）

### 2. Configuration（配置）

部分扩展需要配置参数才能运行（如天气扩展需要 API Key）。切换到 **Configuration** 标签页进行配置：

<img src="https://resources.camthink.ai/NeoMind/extensions-details-config.png" alt="扩展详情 - 配置页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

配置参数按类型自动渲染为合适的输入控件：

| 参数类型 | 控件 | 校验规则 |
|----------|------|----------|
| `string` | 文本输入框 | 必填校验、最大长度 |
| `string` + `password: true` | 密码输入框（掩码） | 必填校验 |
| `string` + `enum` | 下拉选择 | 只能选预定义值 |
| `integer` / `number` | 数字输入框 | 最小值 / 最大值范围 |
| `boolean` | 开关（Switch） | true / false |

填写完成后点击 **Save**，扩展会自动重启以加载新配置。错误的值（如越界的数字、必填项留空）会在保存时报错，不会写入。

:::tip
配置参数变更后会触发扩展进程重启，**正在执行的命令会被中断**。生产环境请在维护时间窗内修改配置。
:::

### 3. Commands（命令）

命令是扩展暴露的可调用操作。切换到 **Commands** 标签页查看所有命令：

<img src="https://resources.camthink.ai/NeoMind/extensions-details-commands.png" alt="扩展详情 - 命令页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

每个命令卡片展示：

- **命令名称**：如 `detect`、`ocr_recognize`
- **描述**：命令功能说明
- **参数表单**：点击 **展开按钮** 后显示该命令的参数输入表单
- **Execute 按钮**：填写参数后点击执行，结果以 JSON 形式返回并显示在下方

:::tip
命令执行支持手动测试，也支持被 AI Agent / REST API / 自动化规则调用。手动测试是验证扩展是否正常工作的最快方式。
:::

### 4. Metrics（指标）

指标是扩展产出的时序数据。切换到 **Metrics** 标签页查看历史数据：

<img src="https://resources.camthink.ai/NeoMind/extensions-details-metrics.png" alt="扩展详情 - 指标页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

指标页提供：

- **时间范围选择**：1 小时 / 24 小时 / 7 天 / 30 天
- **指标列表**：扩展产出的所有指标（如 `detection_count`、`avg_confidence`）
- **趋势图**：选中指标后展示历史曲线
- **最新值**：当前指标的实时数值

指标数据源格式：`extension:<extension_id>:<metric_name>`，可在 [仪表板](./4-use-dashboard.md) 中作为组件数据源使用。

### 5. Logs（日志）

日志页实时展示扩展进程的标准输出与错误输出：

<img src="https://resources.camthink.ai/NeoMind/extensions-details-logs.png" alt="扩展详情 - 日志页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

特点：

- **自动刷新**：每 3 秒拉取一次新日志
- **滚动到底部**：新日志自动滚动到视图底部
- **错误高亮**：`ERROR` / `WARN` 级别日志会用红色 / 黄色高亮显示
- **保留行数**：默认保留最近 500 行

排查扩展问题时，日志页是第一现场。如果扩展状态为 **Error** 或 **Crash Loop**，日志通常能直接看到 panic 堆栈或初始化失败原因。

## 扩展状态与生命周期

| 状态 | 图标 | 说明 | 触发条件 |
|------|------|------|----------|
| **Running** | 绿色圆点 | 扩展正常运行中 | 安装完成 / 手动启动 / 自动恢复 |
| **Stopped** | 灰色圆点 | 扩展已停止 | 手动停止 / 配置变更重启中 |
| **Error** | 红色圆点 | 扩展崩溃或加载失败 | 进程异常退出 / 初始化失败 |
| **Crash Loop** | 黄色圆点 | 崩溃循环检测触发，已停止自动重启 | 50 秒内连续崩溃 ≥ 3 次 |

### 重启 / 重载扩展

```bash
# 重启扩展
neomind extension reload <extension_id>

# 查看扩展状态
neomind extension status <extension_id>

# 启动 / 停止
neomind extension start <extension_id>
neomind extension stop <extension_id>
```

也可以在扩展详情页通过 **操作菜单** 进行启动 / 停止 / 重启 / 卸载。

## 崩溃保护

扩展运行在独立进程中，NeoMind 通过多层机制保障主服务稳定性：

1. **进程隔离** — 扩展崩溃不影响 API、MQTT、仪表板、其他扩展
2. **自动重启** — 扩展进程异常退出后自动重启，最多重试 **3 次**，每次间隔 **5 秒**
3. **崩溃循环检测** — 如果 **50 秒内连续崩溃 ≥ 3 次**，扩展进入 **Crash Loop** 状态，**停止自动重启**，防止资源耗尽
4. **应用内通知** — 崩溃事件写入 [消息中心](./8-notifications.md)，运维人员会收到告警

崩溃循环状态需要**人工介入排查**：

```bash
# 查看扩展崩溃日志
ls data/logs/extensions/

# 修复后手动重启
neomind extension start <extension_id>
```

常见崩溃原因：模型文件缺失、API Key 无效、端口被占用、ABI 版本不匹配。

## 使用扩展数据

### 在仪表板中

扩展指标和设备指标使用方式完全一致。在 [仪表板编辑器](./4-use-dashboard.md) 中添加组件时，数据源选择扩展指标：

- DataSourceId 格式：`extension:<extension_id>:<metric_name>`
- 示例：`extension:weather:temperature`
- 组件型扩展会出现在组件库的 **Extension Components** 分类下，直接拖入即可

### 在 AI Chat 中

直接对 [AI Chat](./5-ai-chat.md) 说：

> 「调用天气扩展，查一下上海明天会下雨吗？」

LLM 会自动识别扩展命令、填充参数、调用并解读返回结果。

### 在 AI Agent 中

[Agent](./6-ai-agent.md) Focused 模式可绑定：

- **扩展指标** 作为数据源（用于周期性分析）
- **扩展命令** 作为工具（用于 LLM tool calling）

Agent 在执行时会自动调用扩展命令完成推理-执行闭环。

### 在自动化规则中

[自动化规则](./7-automation-rules.md) 可用扩展指标做条件，或调用扩展命令做动作：

```yaml
# 当天气扩展的明日预测温度 > 35°C 时触发高温预警
name: "高温预警"
trigger:
  schedule: "0 18 * * *"  # 每天 18:00 检查
condition:
  comparison:
    left: "extension:weather:tomorrow_temp"
    op: ">"
    right: 35
actions:
  - type: notify
    message: "明日高温预警，请做好防暑准备"
```

## 扩展包格式（.nep）

`.nep` 是 NeoMind 扩展的标准打包格式，本质是一个 ZIP 包：

```
weather-forecast.nep
├── manifest.json      # 扩展元数据（ID、名称、版本、ABI 版本、能力声明、配置参数定义）
├── extension.so       # Linux 动态库
├── extension.dylib    # macOS 动态库
├── extension.dll      # Windows 动态库
├── frontend/          # 可选：仪表板组件 bundle（manifest.json + bundle.js）
└── assets/            # 可选：模型文件、配置模板
    └── model.onnx
```

:::note
扩展需匹配主服务的 **ABI 版本**（当前 v3）。不匹配的扩展会被拒绝加载，并在详情页显示 "ABI version mismatch" 错误。
:::

详细的 `.nep` 结构与开发流程见 [开发指南 - 扩展开发](../developer-guide/7-extension-development.md)。

## CLI 参考

```bash
# 列表
neomind extension list                              # 列出所有已安装扩展
neomind extension list --json                       # JSON 格式输出（脚本集成）

# 安装 / 卸载
neomind extension install <path-or-url>             # 安装
neomind extension uninstall <extension_id>          # 卸载

# 详情与状态
neomind extension info <extension_id>               # 查看元数据、指标、命令、配置参数
neomind extension status <extension_id>             # 查看运行状态

# 生命周期控制
neomind extension start <extension_id>              # 启动
neomind extension stop <extension_id>               # 停止
neomind extension reload <extension_id>             # 重载（重启进程）

# 配置
neomind extension config <extension_id>             # 查看当前配置
neomind extension config <extension_id> --set key=value  # 修改配置项
```

所有命令支持 `--json` 输出，便于在脚本中解析。CLI 通过 `NEOMIND_API_KEY` 环境变量或 `--api-key` 参数认证。

## REST API

扩展管理也提供 REST API，方便集成到外部系统：

```bash
# 列出所有扩展
curl -H "X-API-Key: $NEOMIND_API_KEY" http://localhost:9375/api/extensions

# 查询单个扩展详情
curl -H "X-API-Key: $NEOMIND_API_KEY" http://localhost:9375/api/extensions/<extension_id>

# 启动 / 停止 / 重启
curl -X POST -H "X-API-Key: $NEOMIND_API_KEY" \
     http://localhost:9375/api/extensions/<extension_id>/start

curl -X POST -H "X-API-Key: $NEOMIND_API_KEY" \
     http://localhost:9375/api/extensions/<extension_id>/stop

curl -X POST -H "X-API-Key: $NEOMIND_API_KEY" \
     http://localhost:9375/api/extensions/<extension_id>/reload

# 调用扩展命令
curl -X POST -H "X-API-Key: $NEOMIND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"image_url":"https://example.com/test.jpg"}' \
     http://localhost:9375/api/extensions/<extension_id>/commands/<command_name>
```

完整 API 文档见 Swagger UI：`http://localhost:9375/api/docs`。

## 故障排查

### 快速诊断

遇到扩展问题时，先运行以下命令收集信息：

```bash
# 查看所有扩展状态
neomind extension list

# 查看具体扩展的元数据和最近错误
neomind extension info <extension_id>

# 查看扩展进程日志文件
ls data/logs/extensions/

# 查看主服务日志中的扩展相关条目
journalctl -u neomind.service | grep -i extension
```

也可以直接打开扩展详情页的 **Logs** 标签页实时查看进程输出。

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 安装后扩展显示 **Error** | ABI 版本不匹配 / 二进制加载失败 | 升级扩展或主服务到匹配的 ABI 版本（当前 v3）；查看详情页 Logs 确认具体错误 |
| 安装报 `Unsupported platform` | `.nep` 包不含当前平台的二进制 | 确认包内含对应平台目录（如 macOS arm64 需 `darwin_arm64/`）；从官方源重新下载完整包 |
| 安装报 `Extension already registered` | 扩展 ID 已存在 | 先 `neomind extension uninstall <id>` 卸载旧版，再安装新版 |
| 扩展启动超时（120s 后 Error） | 模型文件过大 / 初始化逻辑阻塞 | 查看详情页 Logs 确认卡在哪一步；如果是模型加载慢，耐心等待或减小模型 |
| 扩展进入 **Crash Loop** | 初始化失败 / 模型缺失 / 端口冲突 | 50 秒内崩溃 3 次会触发。查看 Logs 找根因，修复后 `neomind extension start <id>` |
| 扩展指标在仪表板不显示 | 扩展未配置 / DataSourceId 拼写错误 | 确认格式为 `extension:<id>:<metric>`；打开详情页 → Metrics 查看实际指标名 |
| AI 无法调用扩展命令 | 扩展已停止 | 在 Extensions 页签启动扩展，确认状态为 Running |
| 命令执行超时 | 推理耗时过长 / 输入过大 | 默认超时 300 秒；压缩输入图片、减小 batch size，或检查网络连接 |
| 扩展安装后无可视化组件 | 该扩展未提供 Component 能力 | 只有声明了 frontend bundle 的扩展才有仪表板组件；在详情页 Overview 查看能力声明 |
| 配置保存后扩展不重启 | 仅在值真正变化时触发重启 | 确认新值与旧值不同；查看 Logs 确认 reload 日志 |
| 市场安装失败 / `Checksum failed` | 网络中断 / 包损坏 | 重新点击 Install；检查网络代理设置；或改用 CLI 从 GitHub Releases 下载安装 |

更多通用排查技巧见 [故障排查](./10-troubleshooting.md)。

## 自己开发扩展？

扩展开发完整教程见 [开发指南 - 扩展开发](../developer-guide/7-extension-development.md)，包含：

- 从零创建 Rust 扩展项目
- `ExtensionMetadata::new()` 构建器用法
- `neomind_export!()` 宏导出 FFI 入口
- 三种能力（指标 / 命令 / 组件）的实现模式
- 跨平台打包（6 平台矩阵）
- ML 模型生命周期管理（懒加载、会话内保活）

## 下一步

- **[应用案例](../use-cases/1-object-detection.md)** — 看扩展在实际场景中怎么用（目标检测 / OCR / 人脸识别）
- **[仪表板](./4-use-dashboard.md)** — 扩展提供的可视化组件怎么在仪表板上展示
- **[AI Agent](./6-ai-agent.md)** — 让 Agent 调用扩展命令，实现自动化巡检
- **[自动化规则](./7-automation-rules.md)** — 用扩展指标做条件触发告警与动作

---

*最后更新: 2026-06-16*
