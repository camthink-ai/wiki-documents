---
description: "NeoMind CLI 与 API Key 配置指南：默认 Key 的自动生成与 auto-auth 机制、获取真实 API Key 的三种方式、NEOMIND_API_KEY 环境变量配置、跨目录调用与验证。"
keywords: [NeoMind, CLI, API Key, NEOMIND_API_KEY, 认证]
tags: [NeoMind, CLI, API Key]
sidebar_label: "CLI & API Keys"
---

# CLI 与 API Key

`neomind` CLI 的所有命令都需要调用 NeoMind Server 的 REST API，认证使用 **API Key**（格式 `nmk_xxx`）。本页覆盖 Key 的获取、配置与验证。

:::tip 本地开发：无需任何配置
在**项目根目录**（即 `data/` 所在目录）运行 CLI 时，CLI 会自动从 `data/api_keys.redb` 读取 Key（auto-auth），无需手动获取或设置任何变量。

```bash
cd /path/to/neomind    # 切到项目根目录
neomind device list     # 直接可用
```

> auto-auth 的数据目录解析顺序：`NEOMIND_DATA_DIR` 环境变量 → 平台用户数据目录（存在 `api_keys.redb` 时）→ 相对路径 `data/`（项目根兜底）。此外 `neomind login` 保存的凭据文件优先级最高，任意目录均可用。
:::

## 何时需要手动配置 Key

| 场景 | 是否需要手动 Key |
|------|-----------------|
| 本地开发，从项目根运行 CLI | ❌ 不需要（auto-auth） |
| 设置了 `NEOMIND_DATA_DIR` 或已 `neomind login` | ❌ 不需要（auto-auth 可定位） |
| 从 `web/`、`/tmp` 等其他目录运行 CLI（无上述条件） | ✅ 需要 |
| 远程连接另一台机器上的 Server | ✅ 需要 |
| 桌面应用内嵌 CLI | ❌ 不需要（自动配置） |

## 获取真实 API Key

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

## 设置环境变量

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

## 验证

```bash
# 本地：在项目根目录直接运行
neomind device list

# 跨目录：设了正确的 NEOMIND_API_KEY 后
neomind dashboard list
```

如果报 401，见 [故障排查 → CLI 报 401](./10-troubleshooting.md#cli-命令报-401-unauthorized)。

---

*最后更新: 2026-09-08*
