---
description: NE503 Applications 和 Models 页的应用安装、权限配置、模型导入、加载与推理验证。
keywords: [NE503 应用管理, 安装向导, 模型管理, HEF, 权限配置, AI 推理]
tags: [用户指南, NE503, 应用, 模型, AI]
---

# AI Apps and Models

NE503 通过 **Applications** 管理应用，通过 **Models** 管理模型。AI 应用启动前必须获得所需模型、码流和设备控制权限。

## 应用管理

进入 **Applications** 页面。点击 **Import** 安装应用。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png" />

### 应用操作

| 按钮 | 作用 |
|------|------|
| **Stop / Restart** | 停止 / 重启应用 |
| **Logs** | 查看运行日志 |
| **Console** | 进入容器终端（调试用） |
| **Visit App** | 打开应用 Web 界面 |
| **Uninstall** | 卸载应用 |

可用状态筛选 **All / Installed / Running / Stopped / Failed** 定位应用。

### 安装新应用（6 步向导）

点击 **Import**，按 **Application Setup Wizard** 完成 6 步配置。下图为来源页和确认页：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step1-source.png" alt="向导 Step 1 Source" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step6-review.png" alt="向导 Review 确认" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

| 步骤 | 配置 |
|------|------|
| 1. Source | 选择 **Registry Image**、**Upload Archive** 或 **Upload Package** |
| 2. Basic Info | 填写 **Application ID**、名称和版本；ID 创建后不可修改 |
| 3. Resources | 按需设置 CPU、内存、开机自启和重启策略 |
| 4. Permissions | 只授予应用实际需要的模型、码流、事件主题、网络和设备控制权限 |
| 5. Advanced | 按需添加环境变量和存储卷 |
| 6. Review | 确认配置后点击 **Install** |

安装完成后，应用出现在列表中。点击启动按钮，状态应变为 **Running**。

## 模型管理

进入 **Models** 页面管理推理模型。模型列表以设备实际显示为准。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-models.png" />

### 模型操作

模型卡支持 **Scan Models**（扫描 `/data/aipc/models/`）、**Import**（上传 `.hef` 并填写 Model ID、Model Type、Threshold）以及 **Load / Unload / Detail / Delete**。推理前确认模型为 **Loaded**；应用声明模型权限后启动时会自动加载。确认模型输入与实际码流配置匹配，按需调整 Threshold，最后确认应用为 **Running** 并产生预期结果。
