---
description: "Contributing to the NeoMind main project: development setup, code standards (Rust clippy / frontend ESLint), commit conventions, CI pipeline, PR workflow, and testing requirements."
keywords: [NeoMind, contributing, CI, PR, code standards, Conventional Commits]
tags: [NeoMind, Developer Guide]
sidebar_label: "Contributing"
---

# Contributing Guide

Welcome to contributing to NeoMind! This guide covers development setup, code standards, commit conventions, CI pipeline, and PR workflow.

> **Recommended: AI-assisted development**: Before contributing, read the [AI-Assisted Development Guide](./5-ai-assisted-development.md) — use Claude Code to explore the codebase, generate implementations, and run tests at double the speed.

## Development Setup

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/NeoMind.git
cd NeoMind

# 2. Install dependencies
cargo build                    # Rust backend
cd web && npm install          # Frontend

# 3. Start the dev environment
cargo run -p neomind-cli -- serve   # Backend (port 9375)
npm run dev                         # Frontend (port 5173)
```

**Toolchain requirements**:
- Rust 1.92.0+ (edition 2021)
- Node.js 18+
- System dependency: protobuf compiler (`protoc`)

## Code Standards

### Rust

The project uses default `rustfmt` and `clippy` configuration (no custom `.rustfmt.toml`).

```bash
# Must run before committing
cargo fmt --all              # Format
cargo clippy --all-targets   # Lint (must be warning-free)
cargo test                   # Unit tests
```

Key conventions:
- Public types must have doc comments (`///`)
- Use `Result<T, E>` for error handling — no `unwrap()` / `expect()` (except in tests)
- Async code uses the Tokio runtime
- Re-exports (`pub use`) should only include types actually used externally — the project regularly cleans dead re-exports

### Frontend

```bash
cd web
npm run lint           # ESLint + TypeScript checks
npm run build:check    # Type checking + circular dependency detection
npm run test           # Vitest unit tests
```

Key conventions (see `web/DESIGN_SPEC.md` for full details):
- **Colors**: Use only design token class names (`text-success`, `bg-error-light`). **Never** hardcode Tailwind palette colors (`bg-blue-500`)
- **Icons**: Use only `lucide-react`, imported via `@/design-system/icons`
- **Loading states**: Page-level uses skeleton screens (`LoadingState variant="page"`), button-level uses Spinners
- **Dialogs**: Use `UnifiedFormDialog` (forms) or `FullScreenDialog` (builders). Don't use raw `Dialog`
- **i18n**: All user-visible text must go through the `t()` function — no hardcoded strings

## Commit Conventions

The project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

| type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(web): redesign About page with hero card` |
| `fix` | Bug fix | `fix(devices): 4-state connection model with per-device offline timeout` |
| `ci` | CI/CD changes | `ci: auto-cleanup old releases after publish` |
| `chore` | Misc (deps, refactoring) | `chore: bump neomind-extension-sdk to 0.6.3` |
| `docs` | Documentation | `docs: enrich extension management user guide` |
| `refactor` | Refactoring (no behavior change) | `refactor(web): unify data source config factories` |
| `release` | Release | `release: bump version to 0.8.13` |

Common scopes: `web` (frontend), `devices`, `agent`, `extension`, `rules`, `api`, `cli`, `messages`, `storage`.

```bash
# Commit example
git commit -m "feat(agent): add event trigger context section to tool system prompt"
```

## PR Workflow

1. **Create a branch**: Branch off `main`, name it `feat/<short-description>` or `fix/<issue-id>`
2. **Develop**: Commit in small steps, each following Conventional Commits
3. **Local verification**:

```bash
cargo fmt --all && cargo clippy --all-targets && cargo test
cd web && npm run lint && npm run build:check
```

4. **Push & open PR**: PR title uses Conventional Commits format. Description includes:
   - **Summary**: 1-3 bullet points of changes
   - **Test plan**: What you tested and how
5. **CI passes**: All CI checks must be green (see next section)
6. **Code Review**: At least one maintainer approval
7. **Merge**: Squash merge into `main`

## CI Pipeline

The project uses GitHub Actions (`.github/workflows/build.yml`). Triggers: tag creation / release publishing / manual.

**4 parallel jobs**:

| Job | Content | Artifacts |
|-----|---------|-----------|
| **Frontend** | `npm run lint` → `npm run build` | Web frontend static files |
| **Desktop** | Tauri build (macOS arm64 / Windows x86_64 / Linux x86_64 / Linux arm64) | 4 platform desktop installers |
| **Server** | `cargo build --release` (Linux amd64 / Linux arm64 / Darwin arm64) | 3 platform server binaries |
| **Release** | Upload artifacts to GitHub Release + auto-cleanup old releases (keep latest 3) | GitHub Release assets |

> **Local pre-check**: CI doesn't run `cargo test` — make sure to run `cargo test` locally before pushing a PR.

## Testing Requirements

| Test type | Command | When to run |
|-----------|---------|-------------|
| Rust unit tests | `cargo test` | After every Rust code change |
| Rust integration tests | `cargo test -- --ignored` | When touching real LLM calls (requires `--ignored` flag) |
| Frontend unit tests | `cd web && npm run test` | After every frontend code change |
| Frontend E2E | `cd web && npm run test:e2e` | When changing user interaction flows |

Integration tests use the real model `qwen3.5:4b` and require a local Ollama instance.

## Contributing Extensions / Components / Device Types

The main repo only accepts **core platform** code contributions. If you're contributing:

- **Extensions** → PR to [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)
- **Device types** → PR to [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)
- **Dashboard components** → PR to [NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)

Each repo has its own README and contribution guide.

## Code of Conduct

- Respect all contributors; stay professional and friendly
- Provide sufficient information in issues and PRs (version, reproduction steps, logs)
- Don't introduce known security vulnerabilities (dependency updates via Dependabot)
- Follow the project's `CLAUDE.md` and `DESIGN_SPEC.md` conventions

---

*Last updated: 2026-06-16*
