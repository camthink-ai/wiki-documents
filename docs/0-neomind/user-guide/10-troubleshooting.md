---
description: "NeoMind 常见问题排查：服务启动失败、端口占用、Ollama 连接、MQTT 不通、多模态 400 错误、扩展崩溃、数据目录权限、日志位置等。"
keywords: [NeoMind, 故障排查, FAQ, Ollama, MQTT, 端口, 日志]
tags: [NeoMind, 用户指南]
sidebar_label: "Troubleshooting"
---

# 故障排查

本文汇总 NeoMind 常见问题的诊断与解决方法。按症状分类，每条给出排查命令与修复步骤。

## 诊断起点

遇到任何问题，先跑这三条命令收集信息：

```bash
# 1. 系统全貌（MQTT 状态、网络、webhook、设备数）
neomind system info

# 2. 服务健康
curl http://localhost:9375/api/health

# 3. systemd 状态（一键部署）
systemctl status neomind.service
```

## CLI / API Key

### CLI 命令报 `401 Unauthorized`

**原因**：CLI 无法向 Server 提供有效的 API Key。

**排查**：

```bash
# 1. 是否设了环境变量？（设了错误值也会导致 401——auto-auth 被完全跳过）
echo $NEOMIND_API_KEY

# 2. 当前目录是否在项目根？（auto-auth 需要相对路径 data/api_keys.redb）
ls data/api_keys.redb
```

**按场景修复**：

| 场景 | 修复 |
|------|------|
| 设了错误的 `NEOMIND_API_KEY`（如文档占位符） | `unset NEOMIND_API_KEY`，然后在项目根目录运行 |
| 不在项目根目录 | `cd /path/to/neomind && neomind device list` |
| 需要跨目录使用 | 从 Server 启动输出获取真实 Key，`export NEOMIND_API_KEY=nmk_真实Key` |
| 远程连接另一台 Server | 从那台 Server 的启动输出取 Key |
| auto-auth 之前能用，突然 401 | **重启 Server**：CLI 直接操作 `api_keys.redb` 可能导致 redb 锁冲突 |

> ⚠ **关键**：
> - `NEOMIND_API_KEY` 一旦设置（即使是占位符），auto-auth 就被完全跳过。先 `unset` 再试。
> - 不要在 Server 运行时执行 `neomind api-key create`——会与 Server 的 redb 锁冲突。如需重建 Key，先停 Server，再创建，再启动。

> 完整 API Key 配置流程见 [安装与配置 → CLI API Key 配置](./1-install-setup.md#cli-api-key-配置)。

## 服务启动

### `neomind serve` 启动报 "address already in use"

**原因**：9375 端口被占用。

**排查**：

```bash
# 看谁占了 9375
lsof -i :9375        # macOS / Linux
netstat -ano | findstr 9375   # Windows
```

**修复**：
- 杀掉占用进程：`kill <PID>`
- 或换端口启动：`neomind serve --port 9376`
- 或修改 systemd 服务的 `PORT` 环境变量后 `systemctl restart neomind`

### 启动报 "permission denied" 写 `data/`

**原因**：数据目录权限不对（常见于手动安装或换了 `DATA_DIR`）。

**修复**：

```bash
# 把数据目录 owner 改成运行 neomind 的用户
sudo chown -R $USER:$USER /var/lib/neomind
# 或放宽权限
sudo chmod -R u+rwX /var/lib/neomind
```

## LLM / Ollama

### AI Chat 不响应 / 一直转圈

**原因**：LLM 后端没配好或连不上。

**排查**：

```bash
# 1. Ollama 是否在跑
ollama list               # 应列出已拉取模型
curl http://localhost:11434/api/tags   # 应返回 JSON

# 2. 模型名是否一致
# Settings → LLM Backends 里的模型名必须和 `ollama list` 完全一致（含 tag）

# 3. 在 NeoMind 里看后端能力
# 后端列表会显示是否探测成功（Tools / Multimodal / Context）
```

**修复**：
- 启动 Ollama：`ollama serve`
- 拉取模型：`ollama pull qwen3.5:4b`
- 模型名拼写错误 → 在 Settings 里改成与 `ollama list` 一致

### 调用 Ollama 返回 404 / `not found`

**原因**：调用了错误的 API 端点。NeoMind 必须用 **`/api/chat`**（Ollama 原生），不是 `/v1/chat/completions`（OpenAI 兼容）。

**说明**：NeoMind 内部已正确写死 `/api/chat`，你不需要手动改。如果你在用 `curl` 自测或写第三方集成，请用：

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5:4b",
  "messages": [{"role":"user","content":"hi"}],
  "stream": false
}'
```

### 上传图片后 AI 回复"我看不到图"或报 `unknown variant image_url`

**原因**：当前 LLM 后端**不支持多模态**，或 NeoMind 误判了能力。

**修复**：
1. 确认模型本身支持视觉（如 `qwen3.5:4b-vl` / `llava`，不是纯文本的 `qwen3.5:4b`）
2. `ollama pull` 视觉模型
3. Settings → LLM Backends → 该后端详情页，手动打开 **Multimodal** 开关（覆盖自动探测）
4. 重新发起对话

### 云端后端报 `unknown variant image_url, expected text`

**原因**：用纯文本云端模型（如 DeepSeek-V3、Qwen 文本版）发图。NeoMind 会按能力开关决定是否发图，但若自动探测误判，仍可能出错。

**修复**：在后端详情页**关闭** Multimodal 开关，或换用支持视觉的云端模型（`gpt-4o` / `claude-3-5-sonnet` / `qwen-vl` / `glm-4v`）。

## 设备 / MQTT

### 设备发送了数据，但 NeoMind 里看不到

**排查步骤**：

```bash
# 1. MQTT broker 是否连上
neomind system info | grep -A3 mqtt
# 关注 mqtt.connected 是否 true

# 2. 设备发的 topic 是否被订阅
neomind connector subscriptions

# 3. 是否进了"待审批"草稿（自动发现）
neomind device drafts list

# 4. 设备是否连对了 broker IP
# 设备代码里的 broker 地址必须是 NeoMind 所在机器的 IP
```

**常见原因**：
- `mqtt.connected: false` → 服务端 MQTT 模块未起，重启服务
- 设备连到了 `localhost` 而非服务器 IP → 改设备代码
- 网络不通 → `ping <SERVER_IP>` / `telnet <SERVER_IP> 1883` 验证

### `Connection refused` 连不上 MQTT

- 服务未运行 → `systemctl status neomind`
- 防火墙拦了 1883 → `sudo ufw allow 1883`（或对应云厂商安全组）
- 端口被别的进程占了 → `lsof -i :1883`

### `Auth failed / Not authorized`

**原因**：MQTT 启用了认证。

**修复**：

```bash
neomind system info
# 看 mqtt.auth_enabled 与 mqtt.credentials
```

把凭据配置到设备代码里：`client.connect(client_id, username, password)`。

### `TLS handshake failed` / `Received corrupt message`

**原因**：MQTT 启用了 TLS（`mqtts://`），但设备用了明文连接。

**修复**：
- 设备改用 `mqtts://` + 信任 CA 证书（从 Settings → MQTT 下载）
- 或在 NeoMind 关闭 TLS（仅内网/测试环境推荐）

## 扩展

### 扩展安装后状态显示 `Crashed` / 循环重启

**说明**：NeoMind 有**崩溃循环保护**——扩展连续崩溃会被自动禁用，避免拖垮服务端。

**排查**：

```bash
# 看扩展日志
ls data/logs/                # 扩展日志在 这里
neomind extension list       # 看扩展状态
neomind extension info <ID>   # 看具体扩展的最近错误
```

**修复**：
- 扩展二进制与平台不匹配（如 arm64 上跑了 x86_64）→ 重新安装对应平台版本
- 扩展依赖的模型未拉取 → 按扩展文档拉取
- 扩展配置错误 → 在 Extensions 页修改配置后重启扩展

### 扩展加载后没有数据

- DataSourceId 拼写不对 → 格式必须是 `extension:<id>:<metric>`
- 扩展的 command/metric 未正确声明 → 看扩展的 manifest
- 扩展进程在跑但没发布数据 → 查扩展日志

## 仪表板 / 前端

### 仪表板组件一直转圈、不显示数据

- 数据源选错了 → 编辑组件，确认 Device + Metric 正确
- 设备本身没数据 → `neomind device get <ID>` 看 latest 是否有值
- WebSocket 断了 → 刷新页面；检查反向代理是否转发 `Upgrade` / `Connection` 头

### 分享链接打不开 / 404

- 链接过期了 → 重新生成
- 反向代理没把 `/share/` 路径转发到后端 → 检查 nginx `location /` 配置（`try_files $uri $uri/ /index.html;`）

## 数据与存储

### 数据目录在哪里？

默认 `/var/lib/neomind`（一键部署）、`~/.neomind`（自定义）、项目根 `data/`（开发模式）。可用 `NEOMIND_DATA_DIR` 环境变量覆盖。

主要文件：

| 文件 | 用途 |
|------|------|
| `telemetry.redb` | 时序遥测 |
| `devices.redb` / `dashboards.redb` / `rules.redb` | 业务数据 |
| `sessions.redb` | 会话 |
| `logs/` | 运行日志 |

### 数据能否迁移？

可以。停掉服务，把整个数据目录拷到新机器相同路径，重启即可。redb 是嵌入式数据库，无需 dump/restore。

### 如何备份？

```bash
# 简单粗暴：停服 + 复制目录
sudo systemctl stop neomind
sudo tar czf neomind-backup-$(date +%F).tar.gz /var/lib/neomind
sudo systemctl start neomind
```

## 日志位置

| 部署方式 | 位置 |
|---------|------|
| 一键部署（systemd） | `journalctl -u neomind.service -f` |
| 手动 / Docker | `<DATA_DIR>/logs/` 目录 |
| 开发模式（cargo run） | 终端 stdout |

常用排查：

```bash
# 实时跟随日志
journalctl -u neomind.service -f

# 只看错误
journalctl -u neomind.service -p err

# 搜多模态 / 视觉相关
journalctl -u neomind.service | grep -i "vision\|multimodal\|image"
```

## 还没解决？

- 查 [GitHub Issues](https://github.com/camthink-ai/NeoMind/issues) 搜同款问题
- 社区求助：[Discord](https://discord.com/invite/6TZb2Y8WKx)
- 提新 issue 时附上：NeoMind 版本（`neomind --version`）、`neomind system info` 输出、相关日志片段

---

*最后更新: 2026-06-15*
