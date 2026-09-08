---
description: Shared engineering standards — centralized reference for metadata/capability/version/build/test/release/security, referenced by all case studies
keywords: [NeoMind, engineering standards, metadata, capability, build]
tags: [NeoMind, developer-guide, standards]
sidebar_label: Engineering Standards
---

# Shared Engineering Standards Appendix

This appendix is the **centralized reference** for the engineering standards that all 7 case studies in this series follow. Each case study document repeats only the minimum necessary context — **full field tables, capability lists, release checklists, etc. all point here**, avoiding duplication that would drift out of sync.

> Reading order tip: new readers should skim this appendix first to build global mental model, then dive into specific cases. Experienced readers can jump in as needed.

## metadata.json / manifest.json Schema

The NeoMind ecosystem has two types of publishable artifacts — **extensions** (Rust cdylib + optional React frontend) and **dashboard components** (pure React, distributed as `bundle.js`). The two metadata filenames differ:

- Extension → `metadata.json` (source: `extensions/<id>/metadata.json`, auto-generated from `Cargo.toml` by build scripts)
- Component → `manifest.json` (source: `components/<id>/manifest.json`, hand-maintained)

The two schemas overlap heavily, but **extensions uniquely have `builds` / `frontend` / `type`** and **components uniquely have `size_constraints` / `has_*` family / `default_config`**. The tables below merge them, grouped by purpose, with each field annotated by source.

### Basic Information

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | yes | Unique artifact identifier, globally unique. **Extensions use kebab-case** (hyphens, e.g. `weather-forecast`); **components use snake_case** (underscores, e.g. `ne101_camera`) | `weather-forecast` / `ne101_camera` |
| `name` | string \| object | yes | Display name. Components support `{ "en": "...", "zh": "..." }` i18n object | `"weather forecast"` / `{ "en": "NE101 Camera Panel", "zh": "NE101 感知摄像头面板" }` |
| `version` | string (semver) | yes | Three-segment semantic version. Extensions read automatically from `Cargo.toml`; components hand-written | `"2.7.6"` / `"2.14.9"` |
| `description` | string \| object | yes | One-line description; components support i18n | `"Real-time weather forecast..."` |
| `author` | string | yes | Author or team name | `"NeoMind Team"` / `"CamThink Team"` |
| `license` | string | ext required | SPDX license identifier | `"Apache-2.0"` / `"MIT"` |
| `homepage` | string (URL) | no | Source code or documentation URL | `"https://github.com/camthink-ai/NeoMind-Extensions/tree/main/extensions/weather-forecast"` |
| `icon` | string | no (common in components) | Icon identifier, maps to NeoMind icon library | `"Camera"` |

### Type & Categorization

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `type` | string | ext required | Artifact type. Currently fixed at `"native"` (Rust cdylib); WASM type will be added in the future | `"native"` |
| `categories` | string[] | ext optional | Marketplace category tags array | `["weather"]` |
| `category` | string | component optional | Single category, used by components | `"device"` |

### Build Artifacts (Extension-only)

The `builds` field is **extension-only** and lists download URLs for 5 cross-platform build artifacts. Each key corresponds to a [Rust target triple](https://doc.rust-lang.org/rustc/platform-support.html), and the URL points to a GitHub Release asset.

```json
{
  "builds": {
    "darwin-aarch64": { "url": "https://github.com/camthink-ai/NeoMind-Extensions/releases/download/v2.7.6/weather-forecast-2.7.6-darwin_aarch64.nep" },
    "darwin-x86_64":  { "url": ".../weather-forecast-2.7.6-darwin_x86_64.nep" },
    "linux-x86_64":   { "url": ".../weather-forecast-2.7.6-linux_amd64.nep" },
    "linux-aarch64":  { "url": ".../weather-forecast-2.7.6-linux_arm64.nep" },
    "windows-x86_64": { "url": ".../weather-forecast-2.7.6-windows_amd64.nep" }
  }
}
```

The full list of platform targets is described in [Cross-Platform Build Target Matrix](#cross-platform-build-target-matrix).

### Frontend Declaration (Extension-only)

Extensions with React frontend must declare the `frontend` object:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `frontend.components` | string[] | yes | Component name array, **plain strings** not objects | `["WeatherCard"]` |
| `frontend.entrypoint` | string | yes | UMD entry filename, must match `frontend.json`'s `entrypoint` | `"weather-forecast-components.umd.cjs"` |

> Common mistake: writing `components` as an object array `[{ "name": "WeatherCard", ... }]`. The marketplace parser will reject it.

### Component-only Fields (manifest.json exclusive)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `size_constraints` | object | yes | Grid size constraints (unit: grid cells) | `{ "min_w": 2, "min_h": 2, "default_w": 3, "default_h": 3, "max_w": 6, "max_h": 6 }` |
| `has_data_source` | boolean | yes | Whether Data Source tab is supported | `false` |
| `has_device_binding` | boolean | no (recommended) | Whether device binding is supported (affects `deviceContext` prop injection; omitted means `false` — 3 of the 6 official components omit it) | `true` |
| `device_type_filter` | string[] | no | Restricts bindable device types; empty means unrestricted | `["ne101_camera"]` |
| `has_display_config` | boolean | yes | Whether Display Config tab is shown | `false` |
| `has_actions` | boolean | yes | Whether Actions tab is shown (buttons, commands) | `false` |
| `default_config` | object | yes | Default config object used when user has not customized | see code block below |
| `global_name` | string | yes | Global variable name that `bundle.js` mounts onto `window` | `"NE101CameraPanel"` |
| `export_name` | string | yes | IIFE export name (resolution order: `global[export_name]` → `global.default` → the global itself if it's a function); usually the component function name (e.g. `MetricCard`), not necessarily the same as `global_name` | `"NE101CameraPanel"` |
| `max_data_sources` | integer | Optional | Limits the number of bindable data sources when has_data_source is true | 12 |

`default_config` example (excerpted from `ne101_camera`):

```json
{
  "default_config": {
    "showMetrics": true,
    "showCommands": true,
    "location": "",
    "displayTitle": "",
    "processingEnabled": false,
    "processingExtensionId": "",
    "processingTemplate": "object_detection"
  }
}
```

## Capability Categories

NeoMind implements fine-grained access control for extensions to platform features through **explicit capability declaration**. Extensions call platform capabilities via `CapabilityContext::invoke_capability(name, params)` in code; the runtime validates whether the called capability is within the extension's declared whitelist — undeclared direct calls will panic (not degrade gracefully, forcing developers to explicitly request permissions).

### Complete Capability Enumeration

The table below lists all variants of SDK `ExtensionCapability` — **20 named variants + `Custom`** (source: the `define_capabilities!` macro in `neomind-extension-sdk`'s `host.rs`):

| Capability Identifier | Meaning | Typical Extensions |
|-----------------------|---------|---------------------|
| `device_metrics_read` | Read device metrics | Dashboard-type extensions |
| `device_metrics_write` | Write device metrics (including virtual metrics) | weather-forecast, all bridge extensions |
| `device_control` | Send commands to devices | homeassistant-bridge, modbus-bridge |
| `storage_query` | Query time-series storage | Data analysis extensions |
| `event_publish` | Publish events | Automation trigger extensions |
| `event_subscribe` | Subscribe to events | Linkage extensions |
| `telemetry_history` | Query device telemetry history | Trend / history extensions |
| `metrics_aggregate` | Aggregate device metrics | Reporting extensions |
| `extension_call` | Call other extensions | Orchestration extensions |
| `agent_trigger` | Trigger AI Agent | LLM-linked extensions |
| `chat_stream` | Streaming AI chat (SessionManager, token-level events) | Chat integration extensions |
| `chat_stream_cancel` | Cancel an in-flight streaming chat | Chat integration extensions |
| `chat_session_open` | Open a persistent chat session subscription | Multi-turn chat extensions |
| `chat_session_send` | Send a message to an open chat session | Multi-turn chat extensions |
| `chat_session_close` | Close a chat session subscription | Multi-turn chat extensions |
| `chat_stream_cancel_turn` | Cancel a single turn within a session | Multi-turn chat extensions |
| `rule_trigger` | Trigger automation rules | Automation extensions |
| `device_template_register` | Register device type templates | lorawan-bridge, modbus-bridge, onvif-bridge, bacnet-bridge, opcua-bridge, uink-rms-bridge |
| `device_register` | Register device instances | All bridge extensions |
| `device_unregister` | Unregister device instances | Bridge extension cleanup logic |
| `Custom(String)` | Custom capability (any string not matching a named variant becomes Custom) | Project-specific scenarios |

### Real-world Usage Patterns

Based on grepping the repository source code, the most commonly used capabilities are `device_metrics_write` (used by nearly all bridge extensions to report telemetry) and `device_register` / `device_template_register` (bridge extensions registering external devices into the NeoMind device model). Typical invocation pattern:

```rust
use neomind_extension_sdk::capabilities::CapabilityContext;
use serde_json::json;

// Write virtual metric (most common)
let _ = ctx.invoke_capability("device_metrics_write", &json!({
    "device_id": "virtual-sensor-1",
    "metric": "temperature",
    "value": 25.5
}));

// Register device type template (at bridge startup)
let result = ctx.invoke_capability("device_template_register", &template_json);

// Register device instance
let result = ctx.invoke_capability("device_register", &device_json);
```

### Invocation: a Synchronous API

`CapabilityContext::invoke_capability(name, params)` is a **synchronous method** that returns `serde_json::Value` directly (internally bridging to async providers via `block_on_sync`, or via the native capability bridge FFI). The return value is always a JSON object shaped like `{"success": ..., "error"?...}`. So it is called the same way from `execute_command`, `produce_metrics`, `handle_event`, and any other context:

```rust
let result = ctx.invoke_capability("device_metrics_write", &json!({ ... }));
if result["success"].as_bool() != Some(true) {
    // handle result["error"]
}
```

Some extensions (e.g. yolo-device-inference, face-recognition) wrap an internal `invoke_capability_sync()` helper for error handling — same pattern.

## Three-Segment Version Consistency

The NeoMind-Extensions repository has **three tiers of version numbers** that **must all agree** at release time (unless there is an explicit reason to differ):

| File | Version Meaning | Example |
|------|-----------------|---------|
| `VERSION` | Marketplace release version (repo-level single version) | `2.7.0` |
| `extensions/index.json` → `version` | Marketplace release version (synced with VERSION) | `2.7.0` |
| `extensions/*/Cargo.toml` → `version` | Per-extension version (affects package filename) | `2.7.0` |
| `extensions/*/metadata.json` → `version` | Auto-read from `Cargo.toml`, never hand-written | `2.7.0` |

### Common Mistake

**Only updating `VERSION` and `index.json`, but forgetting to update each extension's `Cargo.toml`.** Consequences:

- Package filename uses old version: `weather-forecast-2.6.0-darwin_aarch64.nep`
- GitHub Release title says v2.7.0, but the packages inside are 2.6.0
- `index.json` `builds` URLs point to `2.7.0` asset names, but actual filenames are `2.6.0` → 404
- User experience confusion, marketplace install failure

### Correct Workflow

Use `./scripts/update-versions.sh` to sync in one step:

```bash
# Full update: sync Cargo.toml + VERSION + generate JSON (recommended)
./scripts/update-versions.sh 2.7.0 --bump-extensions

# Verify version consistency (must pass!)
./scripts/update-versions.sh 2.7.0 --check
```

## Cross-Platform Build Target Matrix

The extensions CI (`build-nep-packages.yml` / `build-extension.yml`) and `build.sh` together support **6** platform targets (there is no `windows-aarch64`):

| Platform Identifier (`.nep` filename / in-package dir, underscores) | Rust Target Triple | Artifact Suffix | Use Case |
|------------|-------------------|-----------------|----------|
| `darwin_aarch64` | `aarch64-apple-darwin` | `.dylib` | Apple Silicon macOS (M1/M2/M3/M4) |
| `darwin_x86_64` | `x86_64-apple-darwin` | `.dylib` | Intel macOS |
| `linux_amd64` | `x86_64-unknown-linux-gnu` | `.so` | General-purpose Linux servers |
| `linux_arm64` | `aarch64-unknown-linux-gnu` | `.so` | ARM Linux (Raspberry Pi 4/5, ARM servers; jetson/cuda hardware variants also exist) |
| `windows_amd64` | `x86_64-pc-windows-msvc` | `.dll` | Windows 10/11 (64-bit) |
| `windows_x86` | `i686-pc-windows-msvc` | `.dll` | Windows (32-bit) |

> Note the two naming schemes: the `builds` download map in `metadata.json` uses **hyphenated** keys (`darwin-aarch64` etc., see above) and usually lists only the 5 main targets (32-bit `windows_x86` excluded); `.nep` filenames and the in-package `binaries/` directories use **underscored** platform names (`darwin_aarch64`).

### Build Command

```bash
# Build .nep packages for all platform targets in one shot
./build.sh --release 2.7.0

# Build a single extension only
./build.sh --single weather-forecast --release 2.7.0
```

`build.sh` internally uses [cross](https://github.com/cross-rs/cross) (Docker-based) or the local toolchain for cross-compilation. Developers who have the corresponding Rust target toolchains installed locally can skip Docker and compile directly.

### .nep Package Structure

```
weather-forecast-2.7.6-darwin_aarch64.nep   (ZIP format)
├── manifest.json           # Install manifest (generated from metadata.json at build time)
├── frontend.json           # Present when a frontend exists: component declarations (entrypoint, export_name, etc.)
├── binaries/
│   └── darwin_aarch64/
│       └── extension.dylib # Fixed name (extension.dll on Windows, extension.so on Linux)
├── frontend/
│   └── weather-forecast-components.umd.cjs
└── models/                 # Optional: ONNX models
    └── model.onnx
```

## Test Coverage & Quality Requirements

The NeoMind ecosystem has explicit testing requirements — **extensions that fail are not released**.

### Extension Tests (Rust)

| Test Type | Location | Requirement | Reference |
|-----------|----------|-------------|-----------|
| Unit tests | `src/lib.rs` inside `#[cfg(test)] mod tests` | At least cover happy path of core commands | `weather-forecast/src/lib.rs` |
| Integration tests | `tests/` directory | At least 1 integration test file | `weather-forecast/tests/` |

Minimal example:

```rust
// src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_increment_command() {
        let ext = MyExtension::new();
        let result = ext.execute_command("increment", &json!({"amount": 5}))
            .await
            .unwrap();
        assert_eq!(result["counter"], 5);
    }
}
```

### Component Tests (JavaScript)

NeoMind-Dashboard-Components uses hand-written IIFE as the distribution format; tests verify the IIFE export by mocking the `window` global:

| Test Type | Location | Requirement | Reference |
|-----------|----------|-------------|-----------|
| Bundle test | `<component>/test_bundle.js` | Mocks the `window` global to verify the IIFE export; `ne101_camera/test_bundle.js` is the reference implementation | `ne101_camera/test_bundle.js` |

Typical `test_bundle.js` structure:

```javascript
// 1. Mock window globals
global.window = {
  React: require('react'),
  jsxRuntime: { jsx: () => null, jsxs: () => null },
};

// 2. Load bundle.js (IIFE mounts onto window.<global_name>)
require('./bundle.js');

// 3. Verify export
const Component = window.NE101CameraPanel;
if (typeof Component !== 'function') {
  throw new Error('NE101CameraPanel not exported correctly');
}

console.log('✓ bundle.js export test passed');
```

### CI Requirements

- Extensions repo: CI (GitHub Actions) builds the `.nep` packages on push to main and runs `cargo test` for some extensions during the build; make sure `cargo test --workspace` is green locally before releasing
- Components repo: currently has no GitHub Actions; component tests are the in-repo `test_bundle.js` scripts (run directly with `node`)

## Release Checklist

Before releasing a new version, **confirm each item**:

- [ ] All `Cargo.toml` version numbers agree (`./scripts/update-versions.sh $VERSION --check` passes)
- [ ] `extensions/index.json` version field updated
- [ ] `VERSION` file updated
- [ ] `cargo test --workspace` is green
- [ ] `./build.sh --release $VERSION` produces `.nep` packages for all platform targets
- [ ] Verify `dist/*.nep` filenames have consistent version (`ls dist/*.nep`)
- [ ] Components: `bundle.js` + `manifest.json` synced to NeoMind-Dashboard-Components repo
- [ ] GitHub Release created, all `.nep` files uploaded to release assets
- [ ] Case studies `0-overview.md` [version alignment table](./0-overview.md#version-alignment-table) audit date updated

### Full Release Workflow

```bash
VERSION=2.7.0

# Step 1: Sync versions + generate JSON
./scripts/update-versions.sh $VERSION --bump-extensions

# Step 2: Verify consistency
./scripts/update-versions.sh $VERSION --check

# Step 3: Commit version bump
git add . && git commit -m "chore: bump to v$VERSION"

# Step 4: Build and package
./build.sh --release $VERSION

# Step 5: Verify package filenames have consistent version
ls dist/*.nep

# Step 6: Tag and release
git tag v$VERSION
git push origin main --tags
gh release create v$VERSION ./dist/*.nep --title "v$VERSION"
```

## Security Requirements

NeoMind enforces strict security constraints on extensions and components. Violating any item will be rejected in code review.

### unsafe Rust

- **Avoid** `unsafe` blocks whenever possible
- If unavoidable (e.g., FFI bindings, performance-critical paths), the PR description must explicitly state:
  - Why unsafe is required
  - How memory safety is guaranteed
  - Whether a safe wrapper is provided

### Explicit Capability Declaration

Extensions declare required capabilities in `metadata.json`; runtime enforces validation:

- Calling `device_metrics_write` without declaring it → **panic** (not graceful degradation)
- This is intentional: forces developers to explicitly request permissions, avoiding "silent failure"
- Bridge extensions need `device_template_register` + `device_register` + `device_metrics_write` at startup

### Process Isolation

All extensions run in **separate processes**:

```
┌─────────────────────────────────┐
│      NeoMind Main Process       │
│  ┌───────────────────────────┐  │
│  │  UnifiedExtensionService  │  │
│  │  IPC via stdin/stdout     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ FFI / IPC
              ▼
┌─────────────────────────────────┐
│  Extension Runner Process       │
│  (one per extension, isolated)  │
│  - Native: .dylib / .so / .dll  │
│  - WASM: wasmtime runtime       │
│  - Crashes do not affect main   │
└─────────────────────────────────┘
```

Benefits:

- **Crash isolation**: extension panics cannot take down the main process
- **Memory isolation**: each extension has its own address space
- **Resource limits**: CPU / memory can be capped per extension
- **Independent lifecycle**: extensions can be restarted individually

### Frontend Component Sandbox

A dashboard component's `bundle.js` gets runtime dependencies injected via `window` and **does not directly access**:

- File system
- Network (`fetch` / `XMLHttpRequest` are wrapped by Host)
- Native APIs

```javascript
// Inside bundle.js, dependencies are injected via window (not bundled)
var React = window.React;
var jsx = window.jsxRuntime.jsx;
var jsxs = window.jsxRuntime.jsxs;
```

This ensures components can run on any Host environment (Tauri desktop, web browser, embedded WebView), with the Host deciding which capabilities to expose.

### Panic Configuration

Extension `Cargo.toml` **must** set:

```toml
[profile.release]
panic = "unwind"  # REQUIRED! "abort" will crash the host process on any panic
opt-level = 3
lto = "thin"
```

## Further Reading

- [Case Studies Overview](./0-overview.md) — index and reading paths for all 7 cases
- [Extension API Reference](../7-extension-development.md) — extension trait, macros, capability API docs
- [Component API Reference](../8-dashboard-component-dev.md) — dashboard component schema, data source binding API docs

---

*Last updated: 2026-06-22*
