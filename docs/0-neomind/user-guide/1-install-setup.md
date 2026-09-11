---
description: 在桌面（macOS/Windows/Linux）或服务器上安装 NeoMind 的完整流程，含一键脚本、Docker、手动安装、nginx 反向代理与开发环境配置。
keywords: [NeoMind, 安装, 部署, Docker, 一键脚本, 首次配置]
tags: [NeoMind, 用户指南]
sidebar_label: "Install & Setup"
---

# 安装与配置

NeoMind 提供三种部署形态：**桌面应用**（推荐入门）、**服务器一键部署**、**从源码构建**。所有方式均无需安装外部数据库或消息代理。

> 硬件要求、包大小与运行时资源占用详见 [系统要求](../product-overview/4-system-requirements.md)。

## 桌面应用

### 下载

从 [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest) 下载对应平台的安装包：

| 平台 | 架构 | 格式 |
|------|------|------|
| macOS | Apple Silicon（arm64） | `.dmg` |
| Windows | x86_64 | `.msi` / `.exe` |
| Linux | x86_64 / arm64 | `.AppImage` / `.deb` |

> 官方仅提供上述架构的预编译包。如需其他平台（如 macOS Intel / Windows ARM），可[从源码构建](#从源码构建开发)。

:::note macOS 首次打开
NeoMind 未通过 Mac App Store 分发，首次打开可能被 Gatekeeper 拦截（提示"无法打开"或"来自身份不明的开发者"）。任选一种方式解除：

```bash
# 方式一：终端移除隔离属性（推荐，最快）
xattr -cr /Applications/NeoMind.app
```

```bash
# 方式二：系统设置 → 隐私与安全性 → 仍要打开
# 或先双击 app 触发拦截，再在"系统设置 → 隐私与安全性"点击"仍要打开"
```
:::

### 首次启动向导

安装后首次启动，NeoMind 会进入**配置向导**，共四步（可随时跳过，稍后在设置中补配）：

1. **欢迎** — 平台简介与文档入口
2. **LLM 后端** — 配置 AI 模型：支持**内置模型一键下载**（无需自备 API Key）、接入自定义后端（OpenAI/Ollama 等）或 CLI 快速配置
3. **设备连接** — 连接/审批设备
4. **完成** — 进入主界面

> 跳过 LLM 配置也没关系——首次使用 AI Chat 或创建 Agent 时，系统会再次引导。内置本地模型的详细说明见 [配置 LLM 后端](./2-configure-llm.md)。

## 服务器一键部署（Linux / macOS）

最快捷的服务器安装方式：

```bash
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | sh
```

安装脚本会：

- 下载静态编译的 `neomind` 与 `neomind-extension-runner` 二进制到 `/usr/local/bin`
- 部署前端静态资源到 `/var/www/neomind`
- 注册 systemd 服务（`neomind.service`），开机自启
- 默认监听 `http://your-server:9375`

安装完成后，浏览器访问 `http://your-server:9375` 进入 Web UI 并完成首次配置。

### 安装选项（环境变量）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VERSION` | 最新版 | 指定版本，如 `0.9.23` |
| `INSTALL_DIR` | `/usr/local/bin` | 二进制安装目录 |
| `DATA_DIR` | `/var/lib/neomind` | 数据目录（redb 文件、日志等） |
| `WEB_DIR` | `/var/www/neomind` | 前端静态文件目录 |
| `PORT` | `9375` | 后端 API 端口 |
| `NO_WEB` | `false` | 设为 `true` 仅装后端，不部署前端 |
| `NO_SERVICE` | `false` | 设为 `true` 跳过 systemd 服务注册 |
| `USE_NGINX` | `false` | 设为 `true` 自动配置 nginx 反向代理（监听 80） |

示例：

```bash
# 指定版本
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | VERSION=0.9.23 sh

# 自定义目录
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | INSTALL_DIR=~/.local/bin DATA_DIR=~/.neomind sh

# 启用 nginx 反向代理（端口 80）
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | USE_NGINX=true sh
```

### 升级

- **在线升级（推荐）**：`设置 → 关于` 会自动检查新版本（每 24 小时一次，有更新时右上角出现提示图标），点击即可在线升级——系统自动下载、校验、备份并重启，全程无需 SSH（需要 install.sh 部署的辅助 systemd 单元，老安装重新运行一次安装脚本即可获得）。
- **重新运行安装脚本**：`VERSION=0.9.23 sh install.sh` 指定版本重装。
- **Docker**：`docker compose pull && docker compose up -d`。

数据目录自动备份见 [故障排查](./10-troubleshooting.md)。

## Docker 部署

官方发布多架构编译镜像（amd64 + arm64，每次发版自动构建），**无需克隆仓库、无需 Rust 工具链**：

```bash
docker run -d --name neomind \
  -p 9375:9375 -p 1883:1883 \
  -v neomind-data:/app/data \
  camthink/neomind:latest
```

或使用 Docker Compose（自动拉取 `camthink/neomind:latest`）：

```bash
mkdir neomind && cd neomind
curl -fsSLO https://raw.githubusercontent.com/camthink-ai/NeoMind/main/docker-compose.yml
docker compose up -d
```

单容器部署——后端 API、MQTT Broker、Web UI 全部在同一个镜像中，数据通过 `neomind-data` volume 持久化。镜像内置 llama.cpp 运行时与官方精选模型，向导内一键下载即可获得本地 LLM。

| 镜像 | 说明 |
|------|------|
| `camthink/neomind:latest` | 跟随最新发布 |
| `camthink/neomind:<版本>` | 锁定版本，如 `camthink/neomind:0.9.22` |

| 端口 | 用途 |
|------|------|
| `9375` | HTTP API + Web UI + WebSocket |
| `1883` | MQTT Broker（设备接入） |

可通过 `.env` 自定义端口与其他参数（从[仓库](https://github.com/camthink-ai/NeoMind/blob/main/.env.example)复制 `.env.example` 开始）：

```bash
cp .env.example .env
# 编辑 NEOMIND_HTTP_PORT / NEOMIND_MQTT_PORT / RUST_LOG / TZ 等
docker compose up -d
```

部署后访问 `http://host:9375`。

## 手动安装

适用于无法运行一键脚本的环境（如离线服务器、特殊目录结构）：

```bash
VERSION=0.9.23  # 替换为目标版本号

# 按平台选择（amd64 或 arm64）
ARCH=amd64  # Linux x86_64；arm64 设备改为 arm64

# 下载
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-server-linux-${ARCH}.tar.gz
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-web.tar.gz

# 安装二进制
tar xzf neomind-server-linux-${ARCH}.tar.gz
sudo install -m 755 neomind /usr/local/bin/
sudo install -m 755 neomind-extension-runner /usr/local/bin/

# 部署前端
sudo mkdir -p /var/www/neomind
sudo tar xzf neomind-web.tar.gz -C /var/www/neomind

# 启动
./neomind serve
```

:::note 调试符号包（可选，仅 Linux）
主包为了控制下载体积只含二进制（不带 DWARF 调试信息），但保留了函数符号表，日常运维与日志排查不需要任何额外文件。需要**源码行号**级的崩溃分析（core dump）或性能剖析（perf 火焰图）时，另行下载同版本的 `neomind-server-linux-${ARCH}-debug-symbols.tar.gz`，解压到二进制所在目录即可被工具自动识别，详见[故障排查 · 崩溃与性能分析](/docs/neomind/user-guide/troubleshooting)。
:::

### 配合 nginx 反向代理

对外只暴露 80 端口，9375 限定本机访问：

```nginx
server {
    listen 80;
    root /var/www/neomind;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9375/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 从源码构建（开发）

适用于贡献者或需要自定义编译的场景。

**前置依赖**：Rust 1.85+（工具链锁定 1.92.0）、Node.js 20+、Ollama（或云端 LLM Key）。

```bash
# 克隆
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind

# 启动后端（默认端口 9375）
cargo run -p neomind-cli -- serve

# 启动前端开发服务器（端口 5173，热重载）
cd web && npm install && npm run dev

# 构建桌面应用
cd web && npm run tauri:build
```

更多编译与贡献细节见 [开发指南](../developer-guide/1-overview.md)。

## 首次配置（所有部署方式）

无论哪种安装方式，首次访问 Web UI 的流程一致：**创建管理员账号**（首个用户自动成为管理员，时区自动检测）→ 进入[四步配置向导](#首次启动向导)（欢迎 → LLM 后端 → 设备连接 → 完成，每一步都可跳过）。

跳过的项目随时补配：[配置 LLM 后端](./2-configure-llm.md)、[接入设备](./3-onboard-device.md)。完成后即可用 [AI Chat](./5-ai-chat.md) 对话、搭 [仪表板](./4-use-dashboard.md)、建自动化规则。

:::note 自助注册默认关闭
`POST /api/auth/register` 出于安全考虑默认关闭（服务器默认监听 `0.0.0.0`，开放的注册意味着局域网内任何设备都能创建账号）。添加用户请由管理员在 **Settings → Users** 中创建（或调用 `POST /api/users`）；如确需开放自助注册，管理员可调用 `PUT /api/settings/registration` 开启。
:::

## 用户与角色

- **首个管理员**来自首次启动向导，拥有全部权限
- **自注册默认关闭**（安全设计）：新用户由管理员通过 API 创建（`POST /api/users`，仅管理员可调用）；如需开放自助注册，可调用 `PUT /api/settings/registration` 开启
- **角色**：admin（全部权限）/ user（日常操作）/ viewer（只读）
- **离线修复**：管理员账号角色异常时，可在服务器上执行 `neomind user set-role <用户名> admin` 恢复（无需 API 在线）
- 改密码 / 删除用户会**立即吊销**该用户的所有会话

## 验证安装

```bash
# 检查后端进程与端口
curl http://localhost:9375/api/health

# 验证 API 可达
# 浏览器打开 http://localhost:9375 可看到 Web UI

# systemd 状态（一键部署）
systemctl status neomind.service
```

常见问题（端口占用、LLM 连接失败、MQTT 不通）见 [故障排查](./10-troubleshooting.md)。

## 数据备份与恢复

NeoMind 内置定时备份：**Settings → Preferences → 数据备份** 可开关定时备份、调整备份间隔（6 小时～每周）与保留份数（默认 3 份），并显示最近一次备份的时间与大小；管理员还可点击 **立即备份** 手动触发。

- 备份内容：数据目录下全部数据库（设备、Agent、仪表板、遥测等）与密钥文件
- 备份位置：`data/backups/backup-<时间戳>/`，每个备份都经过可恢复性验证，验证失败会整体丢弃不留半成品
- 也可用环境变量做初始默认：`NEOMIND_BACKUP_INTERVAL_SECS`（`0` 关闭）、`NEOMIND_BACKUP_KEEP`

**恢复**（刻意设计为手动操作，避免自动回滚到过期数据）：停止服务 → 将备份目录内的文件拷回数据目录 → 启动服务。

## 扩展市场源

默认扩展市场托管在 GitHub(`raw.githubusercontent.com`),部分网络无法直连。管理员可在 **Settings → Preferences → 扩展市场源** 切换为镜像地址(例如 `https://ghfast.top/https://raw.githubusercontent.com/camthink-ai/NeoMind-Extensions`),保存后下一次市场请求即生效,无需重启;也可用环境变量 `NEOMIND_EXTENSION_MARKET_URL` 作为初始默认。**注意**:切换后安装包的完整性校验(SHA256)针对镜像源的产物生效。

## CLI API Key 配置

`neomind` CLI 与外部系统调用 Server API 需要有效的 API Key（首次启动自动生成，格式 `nmk_xxx`）。本地开发在项目根目录运行 CLI 可免配置（auto-auth）。

完整的获取、配置与验证流程见 **[CLI 与 API Key](./11-cli-api-keys.md)**。

## 环境变量参考

运行时常用环境变量（按用途分组，全部经源码核实）：

**核心路径与服务**

| 变量 | 说明 |
|------|------|
| `NEOMIND_DATA_DIR` | 数据目录（redb、扩展、备份等；默认 `./data` 或平台数据目录） |
| `NEOMIND_PORT` / `--port` | HTTP API 端口（默认 9375） |
| `NEOMIND_HOST` | 监听地址（默认 0.0.0.0） |
| `NEOMIND_WEB_DIR` | 前端静态文件目录（默认 `/var/www/neomind`） |
| `NEOMIND_LOG_JSON` / `RUST_LOG` | 日志格式与级别 |

**HTTPS 内置加密代理（0.9.21+）**

不部署 nginx 时，可让 NeoMind 自带 rustls TLS 前置代理（转发到明文监听）：

| 变量 | 说明 |
|------|------|
| `NEOMIND_TLS_PORT` | HTTPS 监听端口（默认 9376） |
| `NEOMIND_TLS_CERT` / `NEOMIND_TLS_KEY` | PEM 证书与私钥路径 |

:::note 与 nginx 的取舍
内置代理适合单机快速启用 HTTPS；但所有客户端共享同一个限流桶，且上游假设默认端口。生产环境多客户端建议仍用 nginx 并做按客户端限流。
:::

**LLM 与模型**

| 变量 | 说明 |
|------|------|
| `NEOMIND_BUILTIN_LLM` / `NEOMIND_BUILTIN_MODEL_PATH` / `NEOMIND_BUILTIN_MODEL_NGL` | 内置 llama.cpp 运行时与模型控制 |
| `NEOMIND_BUILTIN_LLM_CTX` / `NEOMIND_BUILTIN_LLM_PORT` | 上下文长度与监听端口 |
| `NEOMIND_CATALOG_URL` | 内置模型目录地址（默认 camthink-ai/NeoMind-Runtimes） |
| `NEOMIND_MAX_CONTEXT` | 覆盖默认上下文长度 |
| `NEOMIND_TOOL_CONCURRENCY` | 工具调用并发数 |

**扩展与安全**

| 变量 | 说明 |
|------|------|
| `NEOMIND_EXTENSION_MARKET_URL` / `NEOMIND_MARKET_URL` | 扩展市场源覆盖 |
| `NEOMIND_STRICT_PACKAGE_SHA256` | 设为 1 时拒绝无校验和的扩展包 |
| `NEOMIND_RUNNER_WORKERS` / `NEOMIND_FFI_TIMEOUT_SECS` | 扩展进程工作线程与 FFI 超时 |
| `NEOMIND_JWT_SECRET` / `NEOMIND_ENCRYPTION_KEY` | 会话签名与静态加密密钥（默认自动生成于 data/） |
| `NEOMIND_BACKUP_INTERVAL_SECS` / `NEOMIND_BACKUP_KEEP` | 备份计划初始值（设置页保存后以设置为准） |

> 完整清单以源码为准（`grep -r 'env::var' crates/`）；上表为部署运维常用子集。

## 生产部署检查清单

从试用走向生产时，按此清单逐项确认：

- **[备份](./10-troubleshooting.md#如何备份)** — 开启自动备份计划（设置 → Preferences），确认保留份数
- **[数据保留](./12-settings.md#设备默认值与数据保留)** — 按业务需要设置遥测保留时长（默认永久，磁盘会持续增长）
- **[用户与角色](#用户与角色)** — 自注册保持关闭，为运维/业务人员分别创建 user / viewer 账号
- **HTTPS** — 前置 nginx 反向代理，只对外暴露 80/443（9375/1883 留在内网）
- **[扩展市场源](./9-extensions.md)** — 国内网络切换镜像地址
- **[在线升级](#升级)** — 确认 install.sh 的辅助 systemd 单元已安装（老安装重跑一次脚本）
- **时区** — 确认系统时区正确，规则 cron 与数据时间戳都依赖它（设置 → Preferences）
- **监控** — 接入 Prometheus 抓取 `http://your-server:9375/metrics`（HTTP 请求计数、uptime、事件总线丢弃计数），别等出事才看日志

## 下一步

NeoMind 已跑起来了？接下来按顺序：

1. **[配置 LLM 后端](./2-configure-llm.md)** — 接入 Ollama 或云端模型，解锁 AI 能力
2. **[接入设备](./3-onboard-device.md)** — 用 onboarding 向导把第一个设备连进来
3. **[使用仪表板](./4-use-dashboard.md)** — 可视化遥测数据
4. **[AI Chat](./5-ai-chat.md)** — 用自然语言操作系统

---

*最后更新: 2026-09-11*
