---
description: "NeoMind 系统设置指南：LLM 后端、设备连接、IM 渠道、偏好设置（语言时区、Agent 默认参数、数据保留与清理、备份计划、记忆上限、自动接入、扩展市场源）与关于页（版本、自升级）逐项说明。"
keywords: [NeoMind, 系统设置, 偏好设置, 数据保留, 备份, 市场源, 用户管理]
tags: [NeoMind, 设置]
sidebar_label: "Settings"
---

# 系统设置

点击侧边栏底部的 **Settings（设置）** 打开设置面板，共五个分区：**LLM Backends**、**Device Connections**、**IM Channels**、**Preferences**、**About**。LLM 后端见[配置 LLM 后端](./2-configure-llm.md)，设备连接见[设备接入](./3-onboard-device.md)，IM 渠道见 [AI Chat — IM 桥接](./5-ai-chat.md#从-telegram--飞书对话im-桥接)，本页讲其余部分。

## 偏好设置（Preferences）

<img src="/img/neomind/settings-preferences.png" alt="系统设置 — 偏好设置页" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

### 语言与地区

| 设置 | 说明 |
|------|------|
| **Language** | 界面语言（简体中文 / English），即时生效 |
| **Time Format** | 12 小时 / 24 小时制 |
| **System Timezone** | 系统时区——**cron 调度和时间计算都用它**，改时区会影响规则触发时间 |

### AI Agent 默认参数

新建 Agent 与 AI Chat 的全局默认（单个 Agent 可在编辑器里覆盖）：

| 设置 | 默认 | 说明 |
|------|------|------|
| Max Rounds | 30 | 每次 Agent 执行的最多工具调用轮数 |
| Execution Timeout | 300 秒 | 单次执行的超时上限 |
| Default Temperature / Top-P / Thinking | 按模型 | 采样默认值；Thinking 设为 auto 表示跟随模型能力 |
| Tool Concurrency | 6 | 工具调用的并发数 |
| Chat History Depth | — | 对话历史携带轮数 |

### 设备默认值与数据保留

| 设置 | 说明 |
|------|------|
| Default Offline Timeout | 设备多久无数据判为离线（新设备的默认值） |
| Default Retention | 遥测数据保留时长：never（永久）/ 12h / 1d / 3d / 7d / 30d / 90d |
| **Auto Cleanup + Cleanup Now** | 开启后按保留策略自动清理过期数据；**Cleanup Now** 立即执行一次 |

:::warning 保留即删除
保留时长一经生效，超出时长的历史遥测会被**物理删除**且不可恢复。重要数据请配合[自动备份](./10-troubleshooting.md#如何备份)使用。
:::

### 备份计划


| 设置 | 说明 |
|------|------|
| Backup Enabled | 开关自动备份 |
| Interval | 6 小时 / 12 小时 / 1 天 / 2 天 / 7 天 |
| Keep | 保留份数（1 / 2 / 3 / 5 / 7 / 14） |
| Back up now | 立即执行一次备份 |

备份内容、存放位置与恢复方法见 [故障排查 — 如何备份](./10-troubleshooting.md#如何备份)。

### 记忆配置

USER.md / KNOWLEDGE.md 两个记忆文件的字符上限（默认 2000 / 3000）。超出后自动淘汰最旧条目；文件本身在 [AI Agent → Memory](./6-ai-agent.md) 页签中查看和编辑。

### 自动接入（Auto-Onboard）

开启后，未知设备发来的数据会自动进入**待审批列表**并预生成设备类型建议（默认最多采集 10 条样本）。关闭后未知设备数据直接丢弃。配套流程见 [设备接入 — 待审批](./3-onboard-device.md)。

### 扩展市场源


默认从 GitHub 拉取扩展市场索引。国内网络可在此切换镜像地址（或用环境变量 `NEOMIND_EXTENSION_MARKET_URL`），保存后下一次市场请求即生效，无需重启。切换后扩展完整性按镜像的文件校验。

## About（关于）

- **版本与自升级**：显示当前版本；浏览器部署时可直接在线升级（下载 → 校验 → 备份 → 重启全自动），详见[安装 — 升级](./1-install-setup.md#升级)
- **资源面板**：CPU / 内存 / 磁盘用量一览
- **下载日志**：打包运行日志用于排查

## 下一步

- [故障排查](./10-troubleshooting.md) — 出问题时先来这里
- [CLI 与 API Key](./11-cli-api-keys.md) — 脚本化访问同一套能力

---

*最后更新: 2026-09-09*
