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
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-web-${VERSION}.tar.gz

# 安装二进制
tar xzf neomind-server-linux-${ARCH}.tar.gz
sudo install -m 755 neomind /usr/local/bin/
sudo install -m 755 neomind-extension-runner /usr/local/bin/

# 部署前端
sudo mkdir -p /var/www/neomind
sudo tar xzf neomind-web-${VERSION}.tar.gz -C /var/www/neomind

# 启动
./neomind serve
```

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

无论哪种安装方式，首次访问 Web UI 只需一步：

1. **创建管理员账号** — 首个注册的用户自动成为管理员，时区自动检测

创建完成后即进入主界面，随后进入上文介绍的**四步配置向导**（欢迎 → LLM 后端 → 设备连接 → 完成；每一步都可以跳过）。跳过的项目随时可以补配：

- **[配置 LLM 后端](./2-configure-llm.md)** — 使用 AI Chat 前需配置
- **[接入设备](./3-onboard-device.md)** — 通过 onboarding 向导连接相机或传感器

完成后即可使用 [AI Chat](./5-ai-chat.md) 与设备对话、搭建 [仪表板](./4-use-dashboard.md) 或创建自动化规则。

## 用户与角色

- **首个管理员**来自首次启动向导，拥有全部权限
- **自注册默认关闭**（安全设计）：新用户由管理员在 **设置 → 用户管理** 中手动创建；如需开放自助注册，可在设置中开启（`PUT /api/settings/registration`）
- **角色**：admin（全部权限）/ user（日常操作）/ viewer（只读）
- **离线修复**：管理员账号角色异常时，可在服务器上执行 `neomind user set-role <用户名> admin` 恢复（无需 API 在线）
- 改密码 / 删除用户会**立即吊销**该用户的所有会话

## 验证安装

```bash
# 检查后端进程与端口
curl http://localhost:9375/api/health

# 查看 API 文档（Swagger）
# 浏览器打开 http://localhost:9375/api/docs

# systemd 状态（一键部署）
systemctl status neomind.service
```

常见问题（端口占用、LLM 连接失败、MQTT 不通）见 [故障排查](./10-troubleshooting.md)。

## CLI 与 API Key

`neomind` CLI 与外部系统调用 Server API 需要有效的 API Key（首次启动自动生成，格式 `nmk_xxx`）。本地开发在项目根目录运行 CLI 可免配置（auto-auth）。

完整的获取、配置与验证流程见 **[CLI 与 API Key](./11-cli-api-keys.md)**。

## 下一步

NeoMind 已跑起来了？接下来按顺序：

1. **[配置 LLM 后端](./2-configure-llm.md)** — 接入 Ollama 或云端模型，解锁 AI 能力
2. **[接入设备](./3-onboard-device.md)** — 用 onboarding 向导把第一个设备连进来
3. **[使用仪表板](./4-use-dashboard.md)** — 可视化遥测数据
4. **[AI Chat](./5-ai-chat.md)** — 用自然语言操作系统

---

*最后更新: 2026-09-08*
