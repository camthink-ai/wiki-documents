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

安装后首次启动，NeoMind 会进入**配置向导**，仅需两步：

1. **创建管理员账号** — 设置用户名与密码，时区自动检测
2. **完成** — 进入主界面，页面上会给出快速上手指引（聊天、配置 LLM、浏览功能）

> LLM 后端配置已**延后**——当你首次使用 AI Chat 或创建 Agent 时，系统会引导你前往「设置」页面配置。详见 [配置 LLM 后端](./2-configure-llm.md)。

向导完成后即进入主界面。

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
| `VERSION` | 最新版 | 指定版本，如 `0.8.0` |
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
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | VERSION=0.8.0 sh

# 自定义目录
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | INSTALL_DIR=~/.local/bin DATA_DIR=~/.neomind sh

# 启用 nginx 反向代理（端口 80）
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | USE_NGINX=true sh
```

## Docker 部署

```bash
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind
docker compose up -d
```

单容器部署——后端 API、MQTT Broker、Web UI 全部在同一个镜像中，数据通过 `neomind-data` volume 持久化。

| 端口 | 用途 |
|------|------|
| `9375` | HTTP API + Web UI + WebSocket |
| `1883` | MQTT Broker（设备接入） |

可通过 `.env` 自定义端口与其他参数（复制 `.env.example` 开始）：

```bash
cp .env.example .env
# 编辑 NEOMIND_HTTP_PORT / NEOMIND_MQTT_PORT / RUST_LOG / TZ 等
docker compose up -d
```

部署后访问 `http://host:9375`。

## 手动安装

适用于无法运行一键脚本的环境（如离线服务器、特殊目录结构）：

```bash
VERSION=0.8.0  # 替换为目标版本号

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

创建完成后即进入主界面。LLM 后端配置和设备接入已延后——你可以在需要时随时进行：

- **[配置 LLM 后端](./2-configure-llm.md)** — 使用 AI Chat 前需配置
- **[接入设备](./3-onboard-device.md)** — 通过 onboarding 向导连接相机或传感器

完成后即可使用 [AI Chat](./5-ai-chat.md) 与设备对话、搭建 [仪表板](./4-use-dashboard.md) 或创建自动化规则。

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

## CLI API Key 配置

NeoMind Server 首次启动时会**自动生成一个默认 API Key**（格式 `nmk_xxx`），用于 CLI 和外部系统认证。所有 `neomind` CLI 命令都需要有效 Key 才能调用 Server API。

:::tip 本地开发：无需任何配置
在**项目根目录**（即 `data/` 所在目录）运行 CLI 时，CLI 会自动从 `data/api_keys.redb` 读取 Key（auto-auth），无需手动获取或设置任何变量。

```bash
cd /path/to/neomind    # 切到项目根目录
neomind device list     # 直接可用
```

> 注意：auto-auth 读取的是**相对路径** `data/api_keys.redb`，因此必须在项目根目录执行。`NEOMIND_DATA_DIR` 环境变量**不影响** auto-auth 的路径解析。
:::

### 何时需要手动配置 Key

| 场景 | 是否需要手动 Key |
|------|-----------------|
| 本地开发，从项目根运行 CLI | ❌ 不需要（auto-auth） |
| 从 `web/`、`/tmp` 等其他目录运行 CLI | ✅ 需要 |
| 远程连接另一台机器上的 Server | ✅ 需要 |
| 桌面应用内嵌 CLI | ❌ 不需要（自动配置） |

### 获取真实 API Key

:::warning 文档中的 Key 是占位符
本文所有 `nmk_xxx` 均为**示例占位符**，不可直接使用。你的真实 Key **仅在 Server 启动时输出到 stdout（终端标准输出）**，不会写入日志文件。`neomind api-key list` 只显示遮蔽值（`nmk_****`），无法获取完整 Key。
:::

Server 启动时在终端打印包含 Key 的 banner：

```
╔═══════════════════════════════════════════════╗
║ ⚠ DEFAULT API KEY GENERATED                    ║
╠═══════════════════════════════════════════════╣
║ Key: nmk_a1b2c3d4....（你的真实 Key）         ║
║ Name: Default API Key                          ║
╚═══════════════════════════════════════════════╝
```

错过了启动输出？按部署方式找回：

| 部署方式 | 查找方法 |
|---------|---------|
| **开发模式**（`neomind serve`） | 在启动 Server 的终端窗口往上滚动 |
| **Linux systemd** | `journalctl -u neomind.service \| grep 'nmk_'` |
| **Docker** | `docker logs neomind 2>&1 \| grep 'nmk_'` |
| **手动 / nohup** | `grep 'nmk_' /path/to/neomind.log`（需启动时重定向了 stdout） |
| **找不到** | 重启 Server 并观察终端输出：`neomind serve 2>&1 \| head -30` |

### 设置环境变量

获取真实 Key 后，设为环境变量即可在任意目录使用 CLI：

```bash
# 临时（当前终端会话）
export NEOMIND_API_KEY=nmk_你的真实Key

# 永久（写入 shell 配置）
echo 'export NEOMIND_API_KEY=nmk_你的真实Key' >> ~/.zshrc   # macOS
source ~/.zshrc
```

:::warning 设错比不设更糟
`NEOMIND_API_KEY` 一旦设置（即使是错误值），CLI 就**不再尝试 auto-auth**。如果之前设了错误的值，必须先清除：

```bash
unset NEOMIND_API_KEY    # 清除后，回到项目根目录即可恢复 auto-auth
```
:::

### 验证

```bash
# 本地：在项目根目录直接运行
neomind device list

# 跨目录：设了正确的 NEOMIND_API_KEY 后
neomind dashboard list
```

如果报 401，见 [故障排查 → CLI 报 401](./10-troubleshooting.md#cli-命令报-401-unauthorized)。

## 下一步

NeoMind 已跑起来了？接下来按顺序：

1. **[配置 LLM 后端](./2-configure-llm.md)** — 接入 Ollama 或云端模型，解锁 AI 能力
2. **[接入设备](./3-onboard-device.md)** — 用 onboarding 向导把第一个设备连进来
3. **[使用仪表板](./4-use-dashboard.md)** — 可视化遥测数据
4. **[AI Chat](./5-ai-chat.md)** — 用自然语言操作系统

---

*最后更新: 2026-06-15*
