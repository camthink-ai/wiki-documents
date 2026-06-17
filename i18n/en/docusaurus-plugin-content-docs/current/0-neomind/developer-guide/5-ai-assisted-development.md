---
description: "Build NeoMind extensions, dashboard components, and contribute to the main project efficiently using Claude Code and AI-assisted development: project context setup, extension workflow, component workflow, prompt patterns, and real-world examples."
keywords: [NeoMind, Claude Code, AI coding, extension development, component development, copilot]
tags: [NeoMind, Developer Guide]
sidebar_label: "AI-Assisted Development"
---

# AI-Assisted Development Guide

The NeoMind codebase is designed for **AI-assisted development** from day one — clean crate layering, a project-level `CLAUDE.md` context file, a 33-section frontend design spec, and a dedicated extension development skill. This guide shows you how to use **Claude Code** (or any AI coding tool with project context support) to maximize your development velocity.

> **Core idea**: You don't need to read all the source code before starting. Clone the repo, open it with an AI tool, describe what you want to build in natural language — the AI explores the code, generates the implementation, and runs tests for you.

## Why NeoMind is AI-friendly

| Design decision | Benefit for AI |
|-----------------|----------------|
| **Project-level `CLAUDE.md`** | AI reads tech stack, commands, architecture rules, and code conventions automatically on project open — zero config |
| **`web/DESIGN_SPEC.md` (33 sections)** | When building frontend, AI automatically follows the color system, component standards, and accessibility rules |
| **Crate-based layering** | `neomind-devices`, `neomind-rules`, `neomind-extension-sdk`… AI can precisely locate the target module |
| **Real extension codebase** | 16 official extensions serve as ready-made reference implementations — AI can read the code and learn patterns directly |
| **CLI-first architecture** | `neomind widget create`, `neomind extension install`… AI can complete the build-test-install loop via CLI |
| **Strongly typed Rust + TypeScript** | The compiler is AI's instant verification — generate code, compile, and immediately know if it's correct |

## Quick Start (5 minutes)

### Step 1: Install Claude Code

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

### Step 2: Clone the repo you want to develop

```bash
# Extension development → clone the extensions repo
git clone https://github.com/camthink-ai/NeoMind-Extensions.git
cd NeoMind-Extensions

# Or component development → clone the components repo
git clone https://github.com/camthink-ai/NeoMind-Dashboard-Components.git
cd NeoMind-Dashboard-Components

# Or main project development → clone the main repo
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind
```

### Step 3: Open the project with Claude Code

```bash
claude
```

Claude Code automatically reads the `CLAUDE.md` file in the project root (if present), acquiring context about the tech stack, build commands, and code conventions. The NeoMind main repo ships with `CLAUDE.md` — it works out of the box.

### Step 4: Start the conversation

```
> Help me create a Modbus extension that reads holding registers and exposes them as metrics
```

Claude Code will: explore existing extension code → reference similar implementations → generate code → run compilation checks.

## Project Context: CLAUDE.md

`CLAUDE.md` is the project instruction file in the NeoMind main repo root. Claude Code **automatically loads** it when opening the project — no manual action needed.

It contains the key information AI needs:

| Section | Content | What AI uses it for |
|---------|---------|---------------------|
| **Tech Stack** | Rust / React 18 / Tauri 2.x | Choose the correct language and framework |
| **Development Commands** | `cargo build`, `npm run dev`, `npm run tauri:dev` | Know how to compile, test, and run |
| **Project Structure** | Module responsibilities under crates/ | Locate target code positions |
| **Key Rules** | Ollama uses `/api/chat`, DataSourceId format, Tauri API base | Avoid common pitfalls |
| **Code Conventions** | Rust fmt/clippy, Zustand slices pattern, DESIGN_SPEC.md | Follow project coding standards |
| **Frontend Design Standards** | 33-section design spec index | Generate frontend code that matches the design system |

> **Extension and component repos** currently don't have a `CLAUDE.md`. Before developing, ask AI to read `docs/guides/en/extension-system.md` or the relevant technical docs to establish context:
> ```
> > First read docs/guides/en/extension-system.md to understand the extension architecture, then help me create...
> ```

## Workflow 1: Building Extensions with AI

Extensions are the most common direction for growing the NeoMind ecosystem. The standard AI-assisted workflow:

### 1. Describe the requirement

```
> I want to build an OPC UA bridge extension.
> Function: connect to an OPC UA server, subscribe to specified node value changes,
> and expose the values as metrics for the NeoMind dashboard.
> Reference the existing modbus-bridge extension's code structure.
```

### 2. AI explores and generates

Claude Code will:
- Read the `modbus-bridge` code as a reference pattern
- Create the project structure (`Cargo.toml` + `src/lib.rs` + `manifest.json`)
- Implement the `Extension` trait (`new`, `metadata`, `start`, `stop`, metric publishing)
- Export the FFI entry point with the `neomind_export!()` macro
- Run `cargo build --release` to verify compilation

### 3. Debug and iterate

```
> There's a compilation error — check what's wrong
> Add a connect command so an Agent can trigger the connection
> The metric unit is wrong — it should be Celsius, not Fahrenheit
```

### 4. Package and install

```
> Help me package this as a .nep and install it to local NeoMind for testing
```

AI will run the cross-platform build script, generate the `.nep` package, then install it via `neomind extension install`.

### Reference implementations

The NeoMind-Extensions repo has **16 official extensions** to reference directly:

| Extension | Good reference for |
|-----------|-------------------|
| `weather-forecast-v2` | HTTP API calls + metric publishing |
| `yolo-device-inference` | ML model loading + inference commands |
| `modbus-bridge` | Industrial protocol bridging |
| `opcua-bridge` | OPC UA protocol integration |
| `image-analyzer-v2` | Image processing + analysis commands |
| `yolo-video-v2` | Video stream processing + streaming inference |
| `homeassistant-bridge` | Third-party platform integration |
| `face-recognition` | Computer vision + components |

> **Prompt tip**: Ask AI to reference the existing extension **closest to your needs**. For example, for a BACnet bridge, reference `modbus-bridge`; for license plate recognition, reference `yolo-device-inference`.

### Extension development skill

NeoMind includes a built-in extension development skill file (`crates/neomind-agent/src/skills/builtins/extension-development.md`) containing:
- Complete Rust code template (all trait methods)
- State management patterns (Atomic / RwLock / Mutex)
- HTTP request patterns (`ureq` sync library)
- Extension type classification (tool / connector / processor / analyzer / bridge)
- Common errors and solutions

Ask AI to read this file to get up to speed quickly:

```
> Read crates/neomind-agent/src/skills/builtins/extension-development.md,
> then create the extension using the template inside
```

## Workflow 2: Building Dashboard Components with AI

Dashboard components are React components implementing the Dashboard Component Registry protocol.

### 1. Scaffold with CLI

```bash
# Create the skeleton with the NeoMind CLI first
neomind widget create "Temperature Heatmap" --widget-type custom
```

### 2. Implement the component with Claude Code

```
> Help me implement this dashboard component.
> Function: receive temperature data from dataSource and render it as a heatmap.
> Must follow web/DESIGN_SPEC.md's color system (use design tokens only).
> Use ECharts' heatmap chart type.
```

Claude Code will:
- Read `DESIGN_SPEC.md` Section 1 (Color System) and Section 30 (Data Visualization)
- Generate `manifest.json` (component declaration + config schema)
- Generate `bundle.js` (IIFE-format React component)
- Use CSS variables (`var(--color-*)`) instead of hardcoded colors

### 3. Local development and preview

```bash
# Vite dev server with hot reload
npm run dev
```

### 4. Install to NeoMind

```bash
neomind widget install ./dist
```

> **Key**: Always have AI read `DESIGN_SPEC.md`. This 33-section spec covers the color system, dialogs, loading states, forms, accessibility, and all other frontend standards. Code generated after reading it naturally matches the project's design language.

## Workflow 3: Contributing to the Main Project with AI

### Scenario A: Fix a bug

```
> The device list doesn't show status icons on mobile.
> Find the relevant component, locate the issue, and fix it.
```

Claude Code will search `web/src/components/` for the DeviceList component, analyze the rendering logic, pinpoint the CSS/logic issue, fix it, and verify.

### Scenario B: Add an API endpoint

```
> Add an API endpoint GET /api/devices/:id/history
> that returns the last 24 hours of telemetry for the specified device.
> Reference the existing handler patterns in neomind-api/src/handlers/.
```

### Scenario C: Add an LLM backend

```
> I want to integrate a new LLM backend (the xx panel API).
> Reference the existing backend implementations in crates/neomind-agent/src/llm_backends/.
```

AI will reference the `openai.rs` or `ollama.rs` pattern, implement the trait, register with the instance manager, and add the API handler.

### Scenario D: Explore an unfamiliar module

```
> I'm not familiar with the neomind-rules code. Help me trace the rule engine's execution flow,
> from API reception to rule trigger to action execution — the complete chain.
```

Claude Code will trace the call chain file by file, giving you a flow diagram with file paths and line numbers.

## Prompt Pattern Cheat Sheet

| Scenario | Recommended prompt |
|----------|-------------------|
| **Create extension** | "Reference the `{similar-extension}` structure, create a `{feature}` extension implementing `{capability}`" |
| **Create component** | "Follow `DESIGN_SPEC.md`, use `{library}` to implement a `{visualization}` component" |
| **Fix bug** | "`{symptom description}`. Find the relevant code, locate the root cause, fix it" |
| **Add feature** | "Following the `{existing-pattern}` pattern, add a `{feature}`" |
| **Explore code** | "Help me trace the execution flow of `{module}`, from `{entry point}` to `{endpoint}`" |
| **Code review** | "Review this code for security issues, performance problems, and `CLAUDE.md` convention violations" |
| **Cross-platform build** | "Help me compile this extension for 6 platforms (linux/darwin/windows × amd64/arm64)" |

## Best Practices

### DO

- **Let AI explore before acting**: For complex changes, first say "help me understand the structure of this code", confirm AI understands correctly, then have it make changes
- **Use existing code as reference anchors**: "Reference the `modbus-bridge` structure" works 10x better than describing requirements from scratch
- **Iterate in small steps**: Change one feature at a time, compile and verify, then continue — don't generate the entire project at once
- **Use the compiler as verification**: Rust and TypeScript have strong type systems — have AI generate code then compile immediately; error messages are the best iteration feedback

### DON'T

- **Don't skip CLAUDE.md**: If the repo doesn't have one, create it first with build commands and conventions — this is the key to AI understanding the project
- **Don't let AI guess API formats**: Have AI read `docs/guides/en/14-api.md` or the Swagger docs first, then write integration code
- **Don't use hardcoded colors in frontend**: Have AI read `DESIGN_SPEC.md` Section 1, use only design token class names

## Setting up AI context for your own repos

If you're developing **your own extension or component** (not in the official repos), create a `CLAUDE.md` to help AI understand your project:

```markdown
# My Custom Extension

## Build
cargo build --release

## Test
# Install to local NeoMind for testing
neomind extension install ./target/release/my-extension.nep

## Conventions
- Use snake_case for metric names
- Use JSON for command parameters
- Follow the NeoMind-Extensions/weather-forecast-v2 code style
```

This way, Claude Code knows how to build, test, and which existing implementation to reference when opening your project.

## Tool ecosystem

| Tool | Purpose |
|------|---------|
| **Claude Code** | Project-level AI coding — supports code exploration, editing, terminal commands, multi-file changes |
| **`neomind widget create`** | Dashboard component scaffolding |
| **`neomind extension install`** | Extension installation and testing |
| **`cargo build --release`** | Rust extension compilation |
| **Swagger UI** (`/api/docs`) | API documentation — have AI read this to understand endpoint formats |

## Next Steps

- **[Extension Development](./7-extension-development.md)** — Complete tutorial for building an extension from scratch
- **[Dashboard Component Development](./8-dashboard-component-dev.md)** — Component protocol, packaging, and installation workflow
- **[Extension SDK Reference](./3-extension-sdk.md)** — Trait signatures, capability system, ML model lifecycle
- **[Architecture](./2-architecture.md)** — Crate layering, process model, event bus (must-read for main project contribution)

---

*Last updated: 2026-06-16*
