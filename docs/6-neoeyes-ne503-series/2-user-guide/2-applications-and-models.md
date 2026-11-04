---
description: NE503 Applications 和 Models 页的应用安装、权限配置、模型导入、加载与推理验证。
keywords: [NE503 应用管理, 安装向导, 模型管理, HEF, 权限配置, AI 推理]
tags: [用户指南, NE503, 应用, 模型, AI]
---

# AI Apps and Models

NE503 通过 **Applications** 管理应用，通过 **Models** 管理模型。AI 应用启动前需要在向导中声明所需的模型依赖、码流和事件权限。

## 应用管理

进入 **Applications** 页面。点击 **Import** 安装应用。

![应用管理页面](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png)

### 应用操作

| 按钮 | 作用 |
|------|------|
| **Stop / Restart** | 停止 / 重启应用 |
| **Logs** | 查看运行日志 |
| **Console** | 进入容器终端（调试用） |
| **Visit App** | 打开应用 Web 界面 |
| **Uninstall** | 卸载应用 |

可用状态筛选 **All / Installed / Running / Stopped / Failed** 定位应用。

> 设备 OS 升级后，应用声明的 OS 版本范围与设备不匹配时，平台会停用该应用的业务功能并显示兼容性提示页，列出应用版本、支持的 OS 范围和设备当前 OS。按提示完成应用或固件升级后自动恢复。

### 安装新应用

点击 **Import** 卡片打开安装向导 **Application Setup Wizard**。向导按配置区组织，左侧在 **Registry Image / Basic Info / Resources / Models / Permissions / Advanced** 之间切换，右上角可在 **Form** 表单和 **YAML** 视图间切换。

**来源（首屏）**

- **Local Upload**：上传 `.neoapp` 应用包或镜像 tar（最大 2GB）。`.neoapp` 包自动解出清单和镜像；裸镜像 tar 由表单补充清单信息。
- **Registry Image**：填写镜像地址从 Docker Hub 或私有仓库拉取，要求设备可访问外网；离线设备使用 Local Upload。

![向导来源选择](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-source.png)

**配置区**

| 配置区 | 内容 |
|--------|------|
| Basic Info | **Application ID**（创建后不可修改）、名称、版本和描述 |
| Resources | **CPU Limit**（支持 `0.5` 或 `50%` 两种输入格式）和 **Memory Limit** |
| Models | 模型依赖：**Add Dependency** 声明模型别名（运行时注入为 `AIPC_MODEL_<别名>` 环境变量）并选择模型；设置 **Max Inference QPS**、**Max Concurrent Inference**；**Allow Dynamic Model Registration** 允许应用运行时发现并注册模型，非必要时关闭 |
| Permissions | **Video Stream Permissions** 按需勾选码流；**Event Permissions** 填写发布/订阅主题；**Network Mode** 默认 Isolated Mode |
| Advanced | 环境变量、存储卷、**Auto-start on boot** 和 **Restart Policy** |

![向导基本信息与配置区导航](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-basic-info.png)

配置完成后点击 **Install** 安装。安装完成后，应用出现在列表中。点击启动按钮，状态应变为 **Running**。

## 模型管理

进入 **Models** 页面管理推理模型。顶部提供按 Model ID 搜索、状态筛选、加载顺序排序和模型类型筛选（检测、分类、分割、OCR 等）；模型列表以设备实际显示为准。

![模型列表](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/models-list.png)

### 导入模型

点击 **Import** 打开导入向导，按 **Upload → Parse → Configure**（上传、解析、配置）三步完成：

1. **上传**：上传裸 `.hef` 文件（后续手动配置），或 `.bin` 格式的 AMPK 模型包（解析结果自动预填表单）。
2. **解析**：平台在服务端解析模型文件，给出输入与后处理建议，并估算算力占用（TOPS）和内存占用。
3. **配置**：核对模型 ID、类型、输入/输出与后处理配置（含 threshold、NMS 等参数），确认后提交注册。表单项附悬停提示；解析结果会自动匹配解码变体，无特殊需求不改动高级配置。

![模型导入向导](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/model-import-wizard.png)

后处理配置错误在注册阶段显式报错，不会被静默忽略；注册失败自动回滚。使用自定义后处理或 vendor 插件的模型，升级前先核对插件路径、后处理名称和参数配置。

### 模型操作

模型卡支持 **Scan Models**（扫描 `/data/aipc/models/`）以及 **Load / Unload / Detail / Delete**。推理前确认模型为 **Loaded**；应用在向导 Models 区声明模型依赖后，启动时会自动加载。确认模型输入与实际码流配置匹配，最后确认应用为 **Running** 并产生预期结果。

## 事件中心

**Events** 页面用于调试应用的事件通信，左侧为主题列表、订阅管理和事件发布，右侧为实时事件流。

- **主题列表（Topics）**：显示当前活跃的事件主题及订阅者数量。
- **订阅（Subscribe）**：添加订阅主题，支持通配符（如 `app/*`）；未添加订阅时接收全部事件。
- **发布事件（Publish Event）**：指定主题并填写 JSON 载荷，向系统注入测试事件。
- **实时事件流（Live Event Stream）**：连接后按时间顺序展示事件的时间、主题和载荷，可断开或清空。

事件主题和载荷格式由应用定义，见对应应用的文档。
