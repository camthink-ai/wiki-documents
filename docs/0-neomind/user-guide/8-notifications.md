---
description: "NeoMind 通知与消息完整指南：配置 9 个消息渠道（含 Webhook、邮件、Telegram、企业微信、钉钉、Slack、飞书），渠道过滤器、消息生命周期、CLI 与 REST API。"
keywords: [NeoMind, 通知, 消息, 消息渠道, webhook, 邮件, telegram, 钉钉, 飞书, 企业微信, slack, 渠道过滤]
tags: [NeoMind, 用户指南]
sidebar_label: "Notifications & Messages"
sidebar_position: 8
---

# 通知与消息

NeoMind 通过**消息系统**把设备告警、规则触发、AI Agent 分析结果、系统事件统一推送到你配置的渠道。支持 **9 个消息渠道**（2 个内置 + 7 个外部），可同时多渠道分发，并对每个渠道单独配置消息过滤规则。

> 消息系统位于左侧导航的 **Messages**（铃铛图标）。两个页签：**Messages**（消息中心，浏览历史告警）和 **Channels**（渠道配置）。

## 支持的渠道

| 渠道 | 类型 | 用途 | 鉴权方式 | 可禁用 |
|------|------|------|---------|--------|
| **Console（控制台）** | 内置 | 打印到服务端日志，调试用 | 无 | 否（内置） |
| **Memory（记忆）** | 内置 | 写入 AI Agent 长期记忆，让 Agent 学习告警 | 无 | 否（内置） |
| **Webhook** | 通用 HTTP | 转发到任意 HTTP 端点（自建系统、IFTTT、n8n、AlertManager） | URL + 5 种鉴权 | 是 |
| **Email（邮件）** | SMTP | 标准邮件通知 | SMTP 用户名 / 密码 | 是 |
| **Telegram** | Bot API | 海外团队即时通知 | Bot Token | 是 |
| **企业微信（WeCom）** | 群机器人 | 国内企业协作 | 群机器人 Webhook Key | 是 |
| **钉钉（DingTalk）** | 自定义机器人 | 国内企业协作 | Access Token + 加签 | 是 |
| **Slack** | Incoming Webhook | 国际团队协作 | Webhook URL | 是 |
| **飞书（Feishu）** | 自定义机器人 | 国内企业协作 | Hook ID + 加签 | 是 |

> NeoMind **不支持短信（SMS）**。需要短信告警请用 Webhook 渠道对接第三方短信网关（如 Twilio、阿里云短信）。

## 界面概览

### Messages 页签（消息中心）

进入 **Messages** 页面，默认显示消息中心：

<img src="https://resources.camthink.ai/NeoMind/messages-list.png" alt="消息中心列表 — 严重度、状态、分类、来源、操作" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

每条消息包含：

| 字段 | 说明 |
|------|------|
| **严重度（Severity）** | `info` / `warning` / `critical` / `emergency`（颜色由浅到深） |
| **标题** | 消息标题 |
| **正文** | 消息内容（点击行展开查看完整内容） |
| **分类（Category）** | `alert`（告警）/ `system`（系统）/ `business`（业务）/ `notification`（通知）+ 后端可扩展任意分类 |
| **来源（Source）** | 触发来源：`device` / `rule` / `telemetry` / `schedule` / `llm` / `system` |
| **状态（Status）** | `active` / `acknowledged` / `resolved` / `archived` / `false_positive` |
| **时间** | 创建时间与最后更新时间 |
| **操作** | Acknowledge / Resolve / Archive / Delete |

**筛选**：点击右上角 **Filter** 按钮打开筛选 Popover，可按严重度（多选）、状态（多选）、分类（多选）筛选，已激活的筛选以 chip 形式显示在工具栏。

### Channels 页签（渠道管理）

切换到 **Channels** 页签查看所有渠道：

<img src="https://resources.camthink.ai/NeoMind/messages-channels.png" alt="渠道列表 — 渠道名、类型、状态、统计、操作" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

页面顶部显示统计卡片（总渠道数 / 启用数 / 渠道类型数），下方是渠道列表。每个渠道卡片显示：

- **渠道名 + 类型图标**：标识渠道
- **启用开关**：一键启用 / 禁用渠道
- **测试按钮**：内联显示测试结果（成功 / 失败 + 原因）
- **操作菜单**：View（查看详情）/ Edit（编辑）/ Configure Filter（配置过滤）/ Manage Recipients（管理收件人，仅 Email）/ Enable | Disable / Delete

## 配置渠道

点击 **Create** 按钮打开全屏渠道编辑器：

<img src="https://resources.camthink.ai/NeoMind/messages-channel-create.png" alt="渠道编辑器 — 左侧类型选择，右侧配置表单（默认选中 Webhook）" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

编辑器采用**左右分栏**布局：
- **左侧边栏**：列出 7 种外部渠道类型，点击切换
- **右侧表单**：显示当前选中类型的配置字段

> 内置渠道（Console、Memory）无需配置，也不支持禁用 / 删除。

### 通用字段

所有外部渠道都需要：

| 字段 | 说明 |
|------|------|
| **Name（渠道名）** | 唯一标识，用于规则 / Agent 引用。建议用小写连字符（如 `ops-feishu`） |
| **Enabled（启用）** | 是否启用。禁用的渠道不会收到任何消息 |

### Webhook 渠道

最灵活的渠道，可对接任意 HTTP 端点。

<img src="https://resources.camthink.ai/NeoMind/messages-channel-create-webhook.png" alt="Webhook 渠道配置 — URL、方法、鉴权类型、超时" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

| 字段 | 说明 | 示例 |
|------|------|------|
| **URL** | 接收消息的 HTTP(S) 端点 | `https://api.example.com/alerts` |
| **Method** | HTTP 方法（默认 `POST`） | `POST` / `PUT` |
| **Authentication** | 鉴权类型：`none` / `bearer` / `basic` / `apikey` / `custom` | 见下表 |
| **Headers** | 自定义请求头（`custom` 鉴权下使用） | `{"X-Tenant": "factory1"}` |
| **Timeout（secs）** | HTTP 超时，默认 30，最大 300 | `30` |

**鉴权类型详解**：

| 类型 | 附加字段 | 适用场景 |
|------|---------|---------|
| **none** | 无 | 公开端点、内网无鉴权 |
| **bearer** | `Bearer Token` | OAuth 2.0、JWT |
| **basic** | `Username` + `Password` | HTTP Basic Auth |
| **apikey** | `API Key` + `Header Name`（默认 `X-API-Key`） | 第三方 API 网关 |
| **custom** | 自定义 Headers 表（键值对） | 自定义签名、多 Header 组合 |

### Email 渠道

<img src="https://resources.camthink.ai/NeoMind/messages-channel-create-email.png" alt="邮件渠道配置 — SMTP 主机、端口、发件人、认证" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

| 字段 | 说明 | 示例 |
|------|------|------|
| **SMTP Server** | SMTP 服务器地址 | `smtp.gmail.com` |
| **SMTP Port** | 端口（默认 587，STARTTLS） | `465`（SSL）/ `587`（STARTTLS） |
| **Username** | SMTP 登录用户名 | `alert@example.com` |
| **Password** | SMTP 登录密码或应用专用密码 | `••••••••` |
| **From Address** | 发件人地址（一般同 Username） | `alert@example.com` |

> **收件人（Recipients）单独管理**：Email 渠道保存后，在渠道操作菜单点 **Manage Recipients** 添加收件人列表。这样无需重新打开渠道编辑器即可增删收件人。

### Telegram 渠道

<img src="https://resources.camthink.ai/NeoMind/messages-channel-create-telegram.png" alt="Telegram 渠道配置 — Bot Token、Chat ID" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| **Bot Token** | Telegram Bot 的访问令牌 | 在 Telegram 里 [@BotFather](https://t.me/BotFather) 创建 Bot 后获得，格式 `123456:ABC-DEF...` |
| **Chat ID** | 接收消息的会话 ID（群组或私聊） | 把 Bot 加入群组后访问 `https://api.telegram.org/bot<TOKEN>/getUpdates` 查看 |

> 私聊 Chat ID 是你的用户 ID（纯数字）。群组 Chat ID 通常以 `-` 开头（如 `-1001234567890`）。

### 企业微信（WeCom）渠道

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| **Key** | 群机器人 Webhook URL 的 Key 部分（**不是完整 URL**） | 群设置 → 添加群机器人 → 复制 Webhook URL，取 `key=` 后的参数值 |

> NeoMind 内部拼接为 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<KEY>`，所以**只填 Key 即可**。

### 钉钉（DingTalk）渠道

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| **Access Token** | 群机器人 Webhook URL 的 access_token | 群设置 → 智能群助手 → 添加自定义机器人 → 复制 Webhook URL，取 `access_token=` 后的值 |
| **Secret**（可选） | 加签密钥 | 机器人安全设置选「加签」，复制 Secret 填入。**强烈建议启用加签**，否则机器人可能被恶意调用 |

> 启用加签后，NeoMind 使用 HMAC-SHA256 计算签名，按钉钉协议追加 `timestamp` 和 `sign` 到 URL。

### Slack 渠道

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| **Webhook URL** | Slack Incoming Webhook 完整 URL | https://api.slack.com/apps → Create New App → Incoming Webhooks → 启用 → 复制 URL |

> URL 形如 `https://hooks.slack.com/services/T000/B000/XXXX`。

### 飞书（Feishu）渠道

| 字段 | 说明 | 获取方式 |
|------|------|---------|
| **Hook ID** | 群机器人 Webhook URL 的 hook_id 部分（**不是完整 URL**） | 群设置 → 群机器人 → 添加自定义机器人 → 复制 Webhook URL，取 `open.feishu.cn/open-apis/bot/v2/hook/` 之后的 UUID |
| **Secret**（可选） | 加签密钥 | 机器人安全设置选「签名校验」，复制 Secret |

> 启用签名后，NeoMind 按飞书协议计算 `timestamp` 和 `sign` 字段并加入请求体。

### 测试渠道

保存后，在渠道列表点 **Test** 按钮，NeoMind 发送一条测试消息并内联显示结果：

- ✅ 成功：显示 HTTP 状态码或渠道返回的响应
- ❌ 失败：显示错误原因（连接超时、鉴权失败、Chat ID 不存在等）

建议**先 Test 再启用**，避免配置错误导致后续告警静默失败。

## 渠道过滤器

每个渠道可单独配置**消息过滤规则**，决定哪些消息会发到该渠道。在渠道操作菜单点 **Configure Filter** 打开过滤配置对话框：

<img src="https://resources.camthink.ai/NeoMind/messages-channel-filter.png" alt="渠道过滤器配置 — 来源类型、分类、最低严重度" style={{width: '100%', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)'}} />

过滤器分三组：

### 1. Source Types（来源类型）

多选，决定哪些来源触发的消息会被转发：

| 来源 | 说明 |
|------|------|
| `device` | 设备相关（上线 / 离线 / 数据异常） |
| `rule` | 规则引擎触发 |
| `telemetry` | 遥测数据阈值告警 |
| `schedule` | 计划任务触发 |
| `llm` | AI Agent / Chat 触发 |
| `system` | 系统级事件（扩展崩溃、存储告警） |

> **空 = 接收所有来源**（默认）。

### 2. Categories（分类）

多选消息分类：

- `alert` — 告警类（设备异常、阈值越限）
- `system` — 系统类（服务状态、扩展事件）
- `business` — 业务类（订单、流程）
- `notification` — 通用通知

> **空 = 接收所有分类**（默认）。后端可扩展自定义分类，自定义分类也会出现在列表中。

### 3. Minimum Severity（最低严重度）

下拉单选，过滤掉低于该级别的消息：

| 值 | 接收的严重度 |
|----|------------|
| *(空)* | 全部（info / warning / critical / emergency） |
| `info` | 全部 |
| `warning` | warning / critical / emergency |
| `critical` | critical / emergency |
| `emergency` | 仅 emergency |

**典型用法**：
- 邮件渠道：最低 `warning`（过滤掉 info 噪声）
- 飞书 / 钉钉群：最低 `critical`（只接收重要告警）
- Webhook → 监控大盘：全部（保留完整数据）

> **未配置过滤器 = 接收所有消息**。新创建的规则通知默认会进所有启用渠道，需要用过滤器做分级路由。

## 触发通知的方式

消息不会孤立产生，它由其他模块触发：

### 1. 规则引擎触发（最常用）

在 [自动化规则](./7-automation-rules.md) 中配置 `notify` 动作：

```json
{
  "name": "AlertHighTemp",
  "condition": {
    "type": "comparison",
    "source": "device:sensor-01:temperature",
    "operator": ">",
    "value": 30
  },
  "actions": [
    {
      "type": "notify",
      "config": {
        "title": "高温告警",
        "message": "sensor-01 温度 {{value}}°C 已超过阈值 30°C",
        "severity": "critical",
        "category": "alert"
      }
    }
  ],
  "trigger": "state_change",
  "cooldown": 60
}
```

`notify` 动作生成的消息**会进所有启用渠道**，由每个渠道的过滤器决定是否转发。所以创建规则后，记得配置关键渠道的过滤器。

### 2. AI Agent 触发

让 [AI Agent](./6-ai-agent.md) 在分析后决定是否发通知：

- **Free 模式 Agent**：在 prompt 里写「检测到异常时通过邮件通知运维组」，Agent 调用 `message` 工具
- **Focused 模式 Agent**：自动判断数据异常并触发告警

### 3. AI Chat 手动触发

直接在 Chat 里说「发一条飞书消息告诉组里 3 号机离线了」，LLM 会调用消息工具。

### 4. 系统事件

部分系统级事件（设备掉线、扩展崩溃、存储空间不足）会自动进消息中心。可在 Settings 中开关是否转发到外部渠道。

## 消息生命周期

消息有 5 个状态，构成完整的处置工作流：

```
active → acknowledged → resolved → archived
   ↓            ↓            ↓
   └──────── false_positive ────┘
```

| 状态 | 说明 | 操作 |
|------|------|------|
| **Active（活动）** | 新消息，待处理 | 自动进入 |
| **Acknowledged（已确认）** | 运维人员已知悉，正在处理 | 点 **Acknowledge** |
| **Resolved（已解决）** | 问题已修复 | 点 **Resolve** |
| **Archived（已归档）** | 归档保留，不再活跃 | 点 **Archive** |
| **False Positive（误报）** | 标记为误报，用于训练规则 / Agent | 点 **Mark as False Positive** |

**操作**：
- 单条：在消息行直接点对应按钮
- 批量：用筛选器过滤出一批消息后批量操作
- 删除：Delete 会从数据库移除（不可恢复，归档更安全）

> **误报标记的价值**：归档为 false_positive 的消息会被规则引擎和 Agent 学习参考，有助于减少未来同类误报。

## CLI 管理

NeoMind CLI 提供 `message` 子命令管理消息和渠道：

```bash
# 列出最近 20 条消息
neomind message list --limit 20

# 创建一条消息（用于测试渠道）
neomind message create --json '{
  "title": "测试告警",
  "content": "手动创建的测试消息",
  "severity": "warning",
  "category": "alert",
  "source_type": "system"
}'

# 列出所有渠道
neomind message channels

# 创建渠道
neomind message channel create --json '{
  "name": "ops-feishu",
  "channel_type": "feishu",
  "config": {
    "hook_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "secret": "secxxxxxxxx"
  },
  "enabled": true
}'

# 启用 / 禁用渠道
neomind message channel enable ops-feishu
neomind message channel disable ops-feishu

# 测试渠道（发送测试消息）
neomind message channel test ops-feishu

# 配置渠道过滤器
neomind message channel filter ops-feishu --json '{
  "source_types": ["rule", "device"],
  "categories": ["alert"],
  "min_severity": "critical"
}'

# 管理邮件收件人
neomind message channel recipients ops-email --add "ops@example.com,oncall@example.com"
neomind message channel recipients ops-email --list
neomind message channel recipients ops-email --remove "ops@example.com"

# 确认 / 解决 / 归档消息
neomind message acknowledge <message_id>
neomind message resolve <message_id>
neomind message archive <message_id>

# 删除渠道
neomind message channel delete ops-feishu
```

## REST API

所有功能均可通过 HTTP API 调用（默认端口 9375）：

```bash
# 列出消息
curl http://localhost:9375/api/messages?limit=20 \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 创建消息
curl -X POST http://localhost:9375/api/messages \
  -H "X-API-Key: $NEOMIND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "高温告警",
    "content": "sensor-01 温度 35°C 超阈值",
    "severity": "critical",
    "category": "alert",
    "source_type": "rule"
  }'

# 列出渠道
curl http://localhost:9375/api/messages/channels \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 创建渠道
curl -X POST http://localhost:9375/api/messages/channels \
  -H "X-API-Key: $NEOMIND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ops-webhook",
    "channel_type": "webhook",
    "config": {
      "url": "https://api.example.com/alerts",
      "method": "POST",
      "_authType": "bearer",
      "bearer_token": "xxx"
    },
    "enabled": true
  }'

# 更新渠道
curl -X PUT http://localhost:9375/api/messages/channels/ops-webhook \
  -H "X-API-Key: $NEOMIND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# 测试渠道
curl -X POST http://localhost:9375/api/messages/channels/ops-webhook/test \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 启用 / 禁用
curl -X POST http://localhost:9375/api/messages/channels/ops-webhook/enable \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 配置过滤器
curl -X PUT http://localhost:9375/api/messages/channels/ops-webhook/filter \
  -H "X-API-Key: $NEOMIND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_types": ["rule"],
    "categories": ["alert"],
    "min_severity": "warning"
  }'

# 查看过滤器
curl http://localhost:9375/api/messages/channels/ops-webhook/filter \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 邮件收件人管理
curl -X POST http://localhost:9375/api/messages/channels/ops-email/recipients \
  -H "X-API-Key: $NEOMIND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["ops@example.com", "oncall@example.com"]}'

curl http://localhost:9375/api/messages/channels/ops-email/recipients \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 消息状态变更
curl -X POST http://localhost:9375/api/messages/<message_id>/acknowledge \
  -H "X-API-Key: $NEOMIND_API_KEY"

# 删除渠道
curl -X DELETE http://localhost:9375/api/messages/channels/ops-webhook \
  -H "X-API-Key: $NEOMIND_API_KEY"
```

## 投递跟踪与重试

NeoMind 记录每条消息在每个渠道的投递状态：

- **Pending（待发）**：进入队列
- **Sent（已发送）**：渠道已接收
- **Delivered（已投递）**：渠道返回成功
- **Failed（失败）**：渠道返回错误或超时

**重试与去重**：
- **指数退避重试**：失败自动重试，最多 5 次（间隔 1s → 2s → 4s → 8s → 16s）
- **去重窗口**：同一 (channel, title, content) 在默认 60 秒内只发一次，防止规则高频触发引发通知风暴
- **批量合并**：多条同质告警可合并为摘要（高级配置）

## 典型场景

### 场景 1：关键告警多渠道冗余

- **邮件渠道**：过滤器 min_severity = `critical`，收件人 `oncall@example.com`
- **飞书渠道**：过滤器 min_severity = `critical`，加签启用
- **Webhook 渠道**：转发到 AlertManager 做二次路由

规则触发 critical 告警时，三个渠道同时接收，单点失败不漏报。

### 场景 2：分级通知

| 渠道 | 过滤器 | 用途 |
|------|--------|------|
| 邮件 | min_severity = `warning` | 运维邮件列表 |
| 飞书 | min_severity = `critical` | 24/7 运维群 |
| Slack | source_types = `["llm"]` | Agent 分析结果频道 |
| Webhook | categories = `["alert"]` | 转发到监控大盘 |

### 场景 3：仅应用内通知（不打扰）

- 不创建任何外部渠道，所有消息默认进应用内消息中心
- 用 Web UI 右上角铃铛查看历史
- 适合开发 / 测试环境

## 最佳实践

- **先 Test 再启用**：新建渠道后先测试，避免配置错误导致后续告警静默失败
- **关键告警多渠道冗余**：同时配邮件 + 飞书 / 钉钉，避免单点失败
- **分级过滤**：用渠道过滤器做严重度路由，Info 只进应用内，Critical 才发邮件 / 群通知
- **启用加签**：钉钉、飞书机器人务必启用加签，防止机器人 URL 泄露被恶意调用
- **合理去重**：规则里设置 `cooldown` 防止传感器抖动刷屏；高优先级告警可缩短去重窗口
- **标记误报**：将误报消息标为 `false_positive`，帮助规则引擎和 Agent 学习
- **收件人独立管理**：Email 渠道用 Manage Recipients 增删收件人，无需重新打开渠道编辑器
- **Webhook 对接统一告警平台**：用 Webhook 渠道对接 AlertManager、Home Assistant、n8n 等平台，由平台负责二次路由和静默规则

## 与其他模块联动

| 模块 | 说明 |
|------|------|
| [自动化规则](./7-automation-rules.md) | `notify` 动作触发消息，按渠道过滤器路由 |
| [AI Agent](./6-ai-agent.md) | Agent 分析后调用 `message` 工具发通知 |
| [设备管理](./3-onboard-device.md) | 设备上线 / 离线 / 数据异常自动触发消息 |
| [扩展管理](./9-extensions.md) | 扩展崩溃等系统事件进消息中心 |
| [数据推送](./7c-data-push.md) | 数据推送负责数据流；消息系统负责告警流 |

## 下一步

- [自动化规则](./7-automation-rules.md) — 规则触发 `notify` 动作路由到通知渠道
- [AI Agent](./6-ai-agent.md) — Agent 分析后决定是否发通知
- [数据推送](./7c-data-push.md) — 推送数据到外部系统（与消息系统的区别）
- [扩展管理](./9-extensions.md) — 用 Webhook 渠道对接外部系统

---

*最后更新: 2026-06-16*
