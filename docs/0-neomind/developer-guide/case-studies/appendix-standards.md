---
description: 共享工程标准 — metadata/capability/版本/构建/测试/发布/安全的集中参考，被所有案例引用
keywords: [NeoMind, 工程标准, metadata, capability, 构建]
tags: [NeoMind, 开发指南, 标准]
sidebar_label: Engineering Standards
---

# 共享工程标准附录

本附录是案例集所有 7 个案例共同遵循的工程标准的**集中参考**。每个案例文档只在必要处做最小重复，**完整字段表 / capability 列表 / 发布 checklist 等都指向本附录**，避免在多处复制粘贴导致失同步。

> 阅读顺序提示：新读者建议先浏览本附录建立全局认知，再进入具体案例。已经有经验的读者可以按需跳转。

## metadata.json / manifest.json Schema

NeoMind 生态有两类可发布工件——**扩展**（Rust cdylib + 可选 React 前端）与**仪表板组件**（纯 React，以 `bundle.js` 形式分发）。两类工件的元数据文件名不同：

- 扩展 → `metadata.json`（源仓库 `extensions/<id>/metadata.json`，构建脚本从 `Cargo.toml` 自动生成）
- 组件 → `manifest.json`（源仓库 `components/<id>/manifest.json`，手写维护）

两份 schema 字段重合度很高，但**扩展独有 `builds` / `frontend` / `type`**，**组件独有 `size_constraints` / `has_*` 系列 / `default_config`**。下表合并展示，分组说明，每个字段标注来源。

### 基础信息

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | string | 是 | 工件唯一标识，全生态唯一。**扩展用 kebab-case**（中划线，如 `weather-forecast`），**组件用 snake_case**（下划线，如 `ne101_camera`） | `weather-forecast` / `ne101_camera` |
| `name` | string \| object | 是 | 展示名。组件支持 `{ "en": "...", "zh": "..." }` 多语言对象 | `"weather forecast"` / `{ "en": "NE101 Camera Panel", "zh": "NE101 感知摄像头面板" }` |
| `version` | string (semver) | 是 | 三段语义化版本。扩展从 `Cargo.toml` 自动读取；组件手写 | `"2.7.6"` / `"2.14.9"` |
| `description` | string \| object | 是 | 一句话描述，组件支持多语言 | `"Real-time weather forecast..."` |
| `author` | string | 是 | 作者或团队名 | `"NeoMind Team"` / `"CamThink Team"` |
| `license` | string | 扩展必填 | SPDX 许可证标识 | `"Apache-2.0"` / `"MIT"` |
| `homepage` | string (URL) | 否 | 源码或文档地址 | `"https://github.com/camthink-ai/NeoMind-Extensions/tree/main/extensions/weather-forecast"` |
| `icon` | string | 否（组件常用） | 图标标识，对应 NeoMind 图标库 | `"Camera"` |

### 类型与分类

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `type` | string | 扩展必填 | 工件类型。当前固定为 `"native"`（Rust cdylib）；未来 WASM 类型会扩展 | `"native"` |
| `categories` | string[] | 扩展可选 | 市场分类标签数组 | `["weather"]` |
| `category` | string | 组件可选 | 单一分类，组件用 | `"device"` |

### 构建产物（扩展独有）

`builds` 字段是**扩展独有**的，列出 5 个跨平台构建产物的下载 URL。每个 key 对应一个 [Rust target triple](https://doc.rust-lang.org/rustc/platform-support.html)，URL 指向 GitHub Release 资产。

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

完整的平台 target 说明见 [跨平台构建目标矩阵](#跨平台构建目标矩阵)。

### 前端声明（扩展独有）

扩展如带 React 前端，必须声明 `frontend` 对象：

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `frontend.components` | string[] | 是 | 组件名数组，**纯字符串**不是对象 | `["WeatherCard"]` |
| `frontend.entrypoint` | string | 是 | UMD 入口文件名，必须与 `frontend.json` 的 `entrypoint` 一致 | `"weather-forecast-components.umd.cjs"` |

> 常见错误：把 `components` 写成对象数组 `[{ "name": "WeatherCard", ... }]`。市场解析器会拒绝。

### 组件专用字段（manifest.json 独有）

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `size_constraints` | object | 是 | 网格尺寸约束（单位：网格单元） | `{ "min_w": 2, "min_h": 2, "default_w": 3, "default_h": 3, "max_w": 6, "max_h": 6 }` |
| `has_data_source` | boolean | 是 | 是否支持数据源绑定（Data Source tab） | `false` |
| `has_device_binding` | boolean | 否（推荐声明） | 是否支持设备绑定，影响 `deviceContext` prop 注入（省略视为 `false`；官方 6 个组件中有 3 个省略了此字段） | `true` |
| `device_type_filter` | string[] | 否 | 限定可绑定的设备类型，空表示不限制 | `["ne101_camera"]` |
| `has_display_config` | boolean | 是 | 是否展示「显示配置」tab | `false` |
| `has_actions` | boolean | 是 | 是否展示「操作」tab（按钮、命令） | `false` |
| `default_config` | object | 是 | 默认配置对象，用户未自定义时使用 | 见下方代码块 |
| `global_name` | string | 是 | `bundle.js` 挂载到 `window` 的全局变量名 | `"NE101CameraPanel"` |
| `export_name` | string | 是 | IIFE 导出名（解析顺序：`global[export_name]` → `global.default` → global 本身是函数）；通常是组件函数名（如 `MetricCard`），不一定与 `global_name` 相同 | `"NE101CameraPanel"` |
| `max_data_sources` | integer | 可选 | 当 has_data_source 为 true 时生效，限制可绑定数据源数量上限 | 12 |

`default_config` 示例（节选自 `ne101_camera`）：

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

## Capability 类目

NeoMind 通过**显式 capability 申请**实现扩展对平台能力的细粒度访问控制。扩展在代码中通过 `CapabilityContext::invoke_capability(name, params)` 调用平台能力；运行时会校验调用的 capability 是否在扩展声明的白名单内，未声明直接调用会 panic（非降级，强制开发者显式申请）。

### 完整 Capability 枚举

下表为 SDK `ExtensionCapability` 全部变体——共 **20 个具名变体 + `Custom`**（来源：`neomind-extension-sdk` 的 `host.rs` `define_capabilities!` 宏）：

| Capability 标识 | 含义 | 典型使用扩展 |
|-----------------|------|--------------|
| `device_metrics_read` | 读取设备指标 | 仪表板类扩展 |
| `device_metrics_write` | 写入设备指标（含虚拟指标） | weather-forecast、所有 bridge 扩展 |
| `device_control` | 向设备下发命令 | homeassistant-bridge、modbus-bridge |
| `storage_query` | 查询时序存储 | 数据分析类扩展 |
| `event_publish` | 发布事件 | 自动化触发类扩展 |
| `event_subscribe` | 订阅事件 | 联动类扩展 |
| `telemetry_history` | 查询设备遥测历史 | 历史趋势类扩展 |
| `metrics_aggregate` | 聚合设备指标 | 报表类扩展 |
| `extension_call` | 调用其他扩展 | 编排类扩展 |
| `agent_trigger` | 触发 AI Agent | LLM 联动类扩展 |
| `chat_stream` | 流式 AI 对话（SessionManager，token 级事件推送） | 对话集成类扩展 |
| `chat_stream_cancel` | 取消进行中的流式对话 | 对话集成类扩展 |
| `chat_session_open` | 打开持久对话会话订阅 | 多轮对话类扩展 |
| `chat_session_send` | 向已打开的会话发送消息 | 多轮对话类扩展 |
| `chat_session_close` | 关闭对话会话订阅 | 多轮对话类扩展 |
| `chat_stream_cancel_turn` | 取消会话中的单个回合 | 多轮对话类扩展 |
| `rule_trigger` | 触发自动化规则 | 自动化类扩展 |
| `device_template_register` | 注册设备类型模板 | lorawan-bridge、modbus-bridge、onvif-bridge、bacnet-bridge、opcua-bridge、uink-rms-bridge |
| `device_register` | 注册设备实例 | 所有 bridge 扩展 |
| `device_unregister` | 注销设备实例 | bridge 扩展清理逻辑 |
| `Custom(String)` | 自定义 capability（未匹配具名变体的字符串都会归为 Custom） | 项目定制场景 |

### 实际代码中的使用模式

通过 grep 仓库源码统计，最常用的 capability 是 `device_metrics_write`（几乎所有 bridge 扩展都用来上报遥测）和 `device_register` / `device_template_register`（bridge 扩展注册外部设备到 NeoMind 设备模型）。典型调用模式：

```rust
use neomind_extension_sdk::capabilities::CapabilityContext;
use serde_json::json;

// 写入虚拟指标（最常用）
let _ = ctx.invoke_capability("device_metrics_write", &json!({
    "device_id": "virtual-sensor-1",
    "metric": "temperature",
    "value": 25.5
}));

// 注册设备类型模板（bridge 扩展启动时）
let result = ctx.invoke_capability("device_template_register", &template_json);

// 注册设备实例
let result = ctx.invoke_capability("device_register", &device_json);
```

### 调用方式：同步 API

`CapabilityContext::invoke_capability(name, params)` 是**同步方法**，直接返回 `serde_json::Value`（内部通过 `block_on_sync` 桥接异步 provider，或走 native capability bridge 的 FFI）。返回值统一为 `{"success": ..., "error"?...}` 形状的 JSON。因此在 `execute_command`、`produce_metrics`、`handle_event` 等任意上下文里都以同一方式调用：

```rust
let result = ctx.invoke_capability("device_metrics_write", &json!({ ... }));
if result["success"].as_bool() != Some(true) {
    // 处理 result["error"]
}
```

部分扩展（如 yolo-device-inference、face-recognition）会在内部封装 `invoke_capability_sync()` 辅助方法做错误处理，模式相同。

## 版本号三段一致性

NeoMind-Extensions 仓库有**三个层级的版本号**，发布时**必须全部一致**（除非有明确理由保持不同）：

| 文件 | 版本含义 | 示例 |
|------|---------|------|
| `VERSION` | 市场发布版本（仓库级单一版本） | `2.7.0` |
| `extensions/index.json` → `version` | 市场发布版本（与 VERSION 同步） | `2.7.0` |
| `extensions/*/Cargo.toml` → `version` | 每个扩展自身版本（影响包文件名） | `2.7.0` |
| `extensions/*/metadata.json` → `version` | 自动从 `Cargo.toml` 读取，不手写 | `2.7.0` |

### 常见错误

**只更新了 `VERSION` 和 `index.json`，但忘了更新各扩展的 `Cargo.toml`**。后果：

- 包文件名是旧版本：`weather-forecast-2.6.0-darwin_aarch64.nep`
- GitHub Release 标题是 v2.7.0，但里面的包都是 2.6.0
- `index.json` 的 `builds` URL 指向 `2.7.0` 的资产名，但实际文件名是 `2.6.0` → 404
- 用户体验混乱，市场无法安装

### 正确流程

使用 `./scripts/update-versions.sh` 一键同步：

```bash
# 完整更新：同步 Cargo.toml + VERSION + 生成 JSON（推荐）
./scripts/update-versions.sh 2.7.0 --bump-extensions

# 验证版本一致性（必须通过！）
./scripts/update-versions.sh 2.7.0 --check
```

## 跨平台构建目标矩阵

NeoMind 扩展的 CI（`build-nep-packages.yml` / `build-extension.yml`）与 `build.sh` 共支持 **6 个**平台目标（没有 `windows-aarch64`）：

| 平台标识（`.nep` 文件名 / 包内目录，下划线） | Rust Target Triple | 产物后缀 | 用途 |
|------------|-------------------|----------|------|
| `darwin_aarch64` | `aarch64-apple-darwin` | `.dylib` | Apple Silicon macOS（M1/M2/M3/M4） |
| `darwin_x86_64` | `x86_64-apple-darwin` | `.dylib` | Intel macOS |
| `linux_amd64` | `x86_64-unknown-linux-gnu` | `.so` | 通用 Linux 服务器 |
| `linux_arm64` | `aarch64-unknown-linux-gnu` | `.so` | ARM Linux（树莓派 4/5、ARM 服务器；另有 jetson/cuda 硬件变体构建） |
| `windows_amd64` | `x86_64-pc-windows-msvc` | `.dll` | Windows 10/11（64 位） |
| `windows_x86` | `i686-pc-windows-msvc` | `.dll` | Windows（32 位） |

> 注意区分两套命名：`metadata.json` 的 `builds` 下载映射用**连字符** key（`darwin-aarch64` 等，见上文），且通常只列 5 个主目标（不含 32 位 `windows_x86`）；而 `.nep` 文件名与包内 `binaries/` 目录用**下划线**平台名（`darwin_aarch64`）。

### 构建命令

```bash
# 一次性构建全部平台 target 的 .nep 包
./build.sh --release 2.7.0

# 只构建单个扩展
./build.sh --single weather-forecast --release 2.7.0
```

`build.sh` 内部使用 [cross](https://github.com/cross-rs/cross)（基于 Docker）或本地工具链交叉编译。开发者本地如已安装对应 target 的 Rust 工具链，可跳过 Docker 直接编译。

### .nep 包结构

```
weather-forecast-2.7.6-darwin_aarch64.nep   (ZIP 格式)
├── manifest.json           # 安装清单（构建时从 metadata.json 转换生成）
├── frontend.json           # 有前端时存在：组件声明（entrypoint、export_name 等）
├── binaries/
│   └── darwin_aarch64/
│       └── extension.dylib # 固定名（Windows 为 extension.dll，Linux 为 extension.so）
├── frontend/
│   └── weather-forecast-components.umd.cjs
└── models/                 # 可选：ONNX 模型
    └── model.onnx
```

## 测试覆盖率与质量要求

NeoMind 生态对测试有明确要求，**不达标的扩展不予发布**。

### 扩展测试（Rust）

| 测试类型 | 位置 | 要求 | 参考 |
|---------|------|------|------|
| 单元测试 | `src/lib.rs` 内 `#[cfg(test)] mod tests` | 至少覆盖核心命令的 happy path | `weather-forecast/src/lib.rs` |
| 集成测试 | `tests/` 目录 | 至少 1 个集成测试文件 | `weather-forecast/tests/` |

最小化示例：

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

### 组件测试（JavaScript）

NeoMind-Dashboard-Components 采用手写 IIFE 作为分发格式，测试通过 mock `window` 全局验证 IIFE 导出：

| 测试类型 | 位置 | 要求 | 参考 |
|---------|------|------|------|
| Bundle 测试 | `<component>/test_bundle.js` | mock `window` 全局验证 IIFE 导出；目前 `ne101_camera/test_bundle.js` 是参考实现 | `ne101_camera/test_bundle.js` |

`test_bundle.js` 的典型结构：

```javascript
// 1. mock window 全局
global.window = {
  React: require('react'),
  jsxRuntime: { jsx: () => null, jsxs: () => null },
};

// 2. 加载 bundle.js（IIFE 会挂载到 window.<global_name>）
require('./bundle.js');

// 3. 验证导出
const Component = window.NE101CameraPanel;
if (typeof Component !== 'function') {
  throw new Error('NE101CameraPanel 未正确导出');
}

console.log('✓ bundle.js 导出测试通过');
```

### CI 要求

- 扩展仓库：CI（GitHub Actions）在 push 到 main 时构建 `.nep` 包，构建过程中会运行部分扩展的 `cargo test`；发布前请本地保证 `cargo test --workspace` 全绿
- 组件仓库：目前没有 GitHub Actions，组件测试以仓库内 `test_bundle.js` 脚本为准（`node` 直接执行）

## 发布 Checklist

发布新版本前**必须逐项确认**：

- [ ] 所有 `Cargo.toml` 版本号一致（`./scripts/update-versions.sh $VERSION --check` 通过）
- [ ] `extensions/index.json` 版本字段更新
- [ ] `VERSION` 文件更新
- [ ] `cargo test --workspace` 全绿
- [ ] `./build.sh --release $VERSION` 产出全部平台 target 的 `.nep` 包
- [ ] 验证 `dist/*.nep` 文件名版本号一致（`ls dist/*.nep`）
- [ ] 组件：`bundle.js` + `manifest.json` 同步到 NeoMind-Dashboard-Components 仓库
- [ ] GitHub Release 创建，全部 `.nep` 上传到 release assets
- [ ] 案例集 `0-overview.md` 的 [版本对齐表](./0-overview.md#版本对齐表) audit 日期更新

### 完整发布流程

```bash
VERSION=2.7.0

# Step 1: 同步版本号 + 生成 JSON
./scripts/update-versions.sh $VERSION --bump-extensions

# Step 2: 验证一致性
./scripts/update-versions.sh $VERSION --check

# Step 3: 提交版本变更
git add . && git commit -m "chore: bump to v$VERSION"

# Step 4: 构建和打包
./build.sh --release $VERSION

# Step 5: 验证包文件名版本一致
ls dist/*.nep

# Step 6: Tag 和发布
git tag v$VERSION
git push origin main --tags
gh release create v$VERSION ./dist/*.nep --title "v$VERSION"
```

## 安全要求

NeoMind 对扩展和组件的安全有严格约束，违反任意一条都会被代码审查拒绝。

### unsafe Rust

- **尽量避免** `unsafe` 块
- 若必须使用（如 FFI 绑定、性能关键路径），需在 PR 描述中明确说明：
  - 为什么需要 unsafe
  - 如何保证内存安全
  - 是否有 safe wrapper

### Capability 显式申请

扩展在 `metadata.json` 中声明所需 capability，运行时强制校验：

- 未声明 `device_metrics_write` 直接调用 → **panic**（非降级）
- 这是有意设计：强制开发者显式申请权限，避免「静默失败」
- 桥接类扩展启动时需要 `device_template_register` + `device_register` + `device_metrics_write` 三个 capability

### 进程隔离

所有扩展运行在**独立进程**中：

```
┌─────────────────────────────────┐
│      NeoMind 主进程              │
│  ┌───────────────────────────┐  │
│  │  UnifiedExtensionService  │  │
│  │  IPC via stdin/stdout     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ FFI / IPC
              ▼
┌─────────────────────────────────┐
│   扩展运行器进程（每个扩展独立）   │
│  - Native: .dylib / .so / .dll  │
│  - WASM: wasmtime runtime       │
│  - 崩溃不影响主进程               │
└─────────────────────────────────┘
```

收益：

- **崩溃隔离**：扩展 panic 不会拖垮主进程
- **内存隔离**：每个扩展独立地址空间
- **资源限制**：可对单扩展限制 CPU / 内存
- **独立生命周期**：扩展可单独重启

### 前端组件沙箱

Dashboard 组件的 `bundle.js` 通过 `window` 注入运行时依赖，**不直接访问**：

- 文件系统
- 网络（`fetch` / `XMLHttpRequest` 由 Host 包装）
- 原生 API

```javascript
// bundle.js 内部通过 window 注入依赖（不打包）
var React = window.React;
var jsx = window.jsxRuntime.jsx;
var jsxs = window.jsxRuntime.jsxs;
```

这保证了组件可在任何 Host 环境运行（Tauri 桌面端、Web 浏览器、嵌入式 WebView），由 Host 决定暴露哪些能力。

### Panic 配置

扩展的 `Cargo.toml` **必须**设置：

```toml
[profile.release]
panic = "unwind"  # REQUIRED! "abort" 会在任何 panic 时崩溃宿主进程
opt-level = 3
lto = "thin"
```

## 延伸阅读

- [案例集总览](./0-overview.md) —— 7 个案例的索引和阅读路径
- [扩展 API 通用参考](../7-extension-development.md) —— 扩展 trait、宏、capability 的 API 文档
- [组件 API 通用参考](../8-dashboard-component-dev.md) —— Dashboard 组件 schema、数据源绑定的 API 文档

---

*最后更新: 2026-06-22*
