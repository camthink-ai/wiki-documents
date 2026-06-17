---
description: "为 NeoMind 主项目贡献代码：开发环境搭建、代码规范（Rust clippy / 前端 ESLint）、提交信息约定、CI 流水线、PR 流程与测试要求。"
keywords: [NeoMind, 贡献, CI, PR, 代码规范, Conventional Commits]
tags: [NeoMind, 开发指南]
sidebar_label: "Contributing"
---

# 贡献指南

欢迎为 NeoMind 贡献代码！本文覆盖开发环境、代码规范、提交约定、CI 流水线和 PR 流程。

> **推荐用 AI 辅助**：贡献前先读 [AI 辅助开发指南](./5-ai-assisted-development.md)，用 Claude Code 探索代码、生成实现、跑测试，效率翻倍。

## 开发环境

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/NeoMind.git
cd NeoMind

# 2. 安装依赖
cargo build                    # Rust 后端
cd web && npm install          # 前端

# 3. 启动开发环境
cargo run -p neomind-cli -- serve   # 后端（端口 9375）
npm run dev                         # 前端（端口 5173）
```

**工具链要求**：
- Rust 1.92.0+（edition 2021）
- Node.js 18+
- 系统依赖：protobuf 编译器（`protoc`）

## 代码规范

### Rust

项目使用默认 `rustfmt` 和 `clippy` 配置（无自定义 `.rustfmt.toml`）。

```bash
# 提交前必跑
cargo fmt --all              # 格式化
cargo clippy --all-targets   # 代码检查（必须无 warning）
cargo test                   # 单元测试
```

关键约定：
- 公开类型必须有文档注释（`///`）
- 错误处理用 `Result<T, E>`，不要 `unwrap()` / `expect()`（测试代码除外）
- 异步代码用 Tokio runtime
- 重新导出（`pub use`）只保留实际被外部使用的——项目定期清理 dead re-exports

### 前端

```bash
cd web
npm run lint           # ESLint + TypeScript 检查
npm run build:check    # 类型检查 + 循环依赖检测
npm run test           # Vitest 单元测试
```

关键约定（详见 `web/DESIGN_SPEC.md`）：
- **颜色**：只用 design token 类名（`text-success`、`bg-error-light`），**禁止**硬编码 Tailwind 调色板（`bg-blue-500`）
- **图标**：只用 `lucide-react`，通过 `@/design-system/icons` 统一导入
- **加载状态**：页面级用骨架屏（`LoadingState variant="page"`），按钮级用 Spinner
- **对话框**：用 `UnifiedFormDialog`（表单）或 `FullScreenDialog`（构建器），不要用原生 `Dialog`
- **i18n**：所有用户可见文本必须通过 `t()` 函数，不要硬编码字符串

## 提交信息约定

项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>
```

| type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(web): redesign About page with hero card` |
| `fix` | Bug 修复 | `fix(devices): 4-state connection model with per-device offline timeout` |
| `ci` | CI/CD 变更 | `ci: auto-cleanup old releases after publish` |
| `chore` | 杂项（依赖升级、重构） | `chore: bump neomind-extension-sdk to 0.6.3` |
| `docs` | 文档 | `docs: enrich extension management user guide` |
| `refactor` | 重构（不改行为） | `refactor(web): unify data source config factories` |
| `release` | 发布 | `release: bump version to 0.8.13` |

常用 scope：`web`（前端）、`devices`、`agent`、`extension`、`rules`、`api`、`cli`、`messages`、`storage`。

```bash
# 提交示例
git commit -m "feat(agent): add event trigger context section to tool system prompt"
```

## PR 流程

1. **创建分支**：从 `main` 拉分支，命名 `feat/<short-description>` 或 `fix/<issue-id>`
2. **开发**：小步提交，每个 commit 遵循 Conventional Commits
3. **本地验证**：

```bash
cargo fmt --all && cargo clippy --all-targets && cargo test
cd web && npm run lint && npm run build:check
```

4. **推送 & 开 PR**：PR 标题用 Conventional Commits 格式，描述包含：
   - **Summary**：1-3 条变更要点
   - **Test plan**：你测了什么、怎么测的
5. **CI 通过**：所有 CI 检查必须绿色（见下节）
6. **Code Review**：至少一位 maintainer 批准
7. **合并**：Squash merge 到 `main`

## CI 流水线

项目使用 GitHub Actions（`.github/workflows/build.yml`），触发条件：tag 创建 / release 发布 / 手动触发。

**4 个并行 Job**：

| Job | 内容 | 产物 |
|-----|------|------|
| **Frontend** | `npm run lint` → `npm run build` | Web 前端静态文件 |
| **Desktop** | Tauri 构建（macOS arm64 / Windows x86_64 / Linux x86_64 / Linux arm64） | 4 平台桌面安装包 |
| **Server** | `cargo build --release`（Linux amd64 / Linux arm64 / Darwin arm64） | 3 平台服务端二进制 |
| **Release** | 上传产物到 GitHub Release + 自动清理旧 release（保留最新 3 个） | GitHub Release 资产 |

> **本地预检**：CI 不跑 `cargo test`——请务必在本地跑 `cargo test` 后再推 PR。

## 测试要求

| 测试类型 | 命令 | 何时跑 |
|----------|------|--------|
| Rust 单元测试 | `cargo test` | 每次改 Rust 代码后 |
| Rust 集成测试 | `cargo test -- --ignored` | 涉及真实 LLM 调用时（需 `--ignored` 标志） |
| 前端单元测试 | `cd web && npm run test` | 每次改前端代码后 |
| 前端 E2E | `cd web && npm run test:e2e` | 改用户交互流程时 |

集成测试使用真实模型 `qwen3.5:4b`，需要本地 Ollama 运行。

## 贡献扩展 / 组件 / 设备类型

主仓库只接受**核心平台**的代码贡献。如果你要贡献的是：

- **扩展** → PR 到 [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)
- **设备类型** → PR 到 [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)
- **仪表板组件** → PR 到 [NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)

各仓库有自己的 README 和贡献指南。

## 行为准则

- 尊重所有贡献者，保持专业和友善
- Issue 和 PR 中提供足够的信息（版本、复现步骤、日志）
- 不引入已知安全漏洞（依赖更新走 Dependabot）
- 遵守项目的 `CLAUDE.md` 和 `DESIGN_SPEC.md` 约定

---

*最后更新: 2026-06-16*
