---
description: "neomind-extension-sdk 参考：Extension trait、ExtensionMetadata、MetricDescriptor、neomind_export! FFI 宏、capability 声明、ML 模型生命周期（lazy-load + keep-loaded）、跨平台打包（cdylib + panic=unwind）。"
keywords: [NeoMind, Extension SDK, neomind_export, FFI, capability, ML 模型, 打包]
tags: [NeoMind, 开发指南]
---

# Extension SDK

`neomind-extension-sdk`（最新 v0.6.3）是写 NeoMind 扩展的核心 crate。它定义了 `Extension` trait、metadata / metric / command 类型，并提供 `neomind_export!` 宏把你的实现自动导出为 FFI 入口，让主进程的 `neomind-extension-runner` 能加载。

> 本文聚焦 SDK 本身。端到端的实战流程见 [扩展开发实战](./7-extension-development.md)。

## 工作原理

```
┌────────────────────────┐         ┌──────────────────────────┐
│  你的扩展 crate          │         │  neomind-extension-runner │
│  (cdylib)               │         │  (主进程的子模块)         │
│                         │  FFI    │                          │
│  impl Extension ──┐     │ ◀─────▶ │  ExtensionProxy          │
│  neomind_export! ─┤     │  C ABI  │   - spawn 进程            │
│   生成 extern "C" │     │         │   - capability 校验       │
│   入口函数        │     │         │   - metric/command 转发   │
└────────────────────┴────┘         └──────────────────────────┘
```

- 你只写 Rust trait impl + 一行 `neomind_export!`
- SDK 宏生成约定的 C ABI 入口（`extern "C"` 函数）
- runner 加载你的 `.so` / `.dylib` / `.dll`，调用入口，包装为 `ExtensionProxy` 注册到主进程
- 跨 FFI 边界的数据用 serde JSON 序列化（metric 值、命令参数、配置）

## Cargo.toml 模板

```toml
[package]
name = "my-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_my_extension"   # 前缀必须是 neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.3"   # 或 path 指向本地 SDK
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"    # 必须！扩展进程 panic 必须能 unwind 才能被 runner 捕获
opt-level = 3
lto = "thin"
```

**关键点**：

- `crate-type = ["cdylib"]` —— 产出动态库
- lib 名前缀 `neomind_extension_` —— runner 按命名约定查找
- `panic = "unwind"` —— 让 panic 被 runner 接住而非终止进程

## Extension Trait

所有扩展必须实现 `Extension` trait。完整签名在 `neomind-extension-sdk::prelude` 中导出。

```rust
use async_trait::async_trait;
use neomind_extension_sdk::prelude::*;

#[async_trait]
pub trait Extension: Send + Sync + 'static {
    // ===== 必填 =====
    fn metadata(&self) -> &ExtensionMetadata;
    async fn execute_command(&self, command: &str, args: &serde_json::Value)
        -> Result<serde_json::Value>;

    // ===== 选填：声明与生命周期 =====
    fn metrics(&self) -> &[MetricDescriptor] { &[] }
    fn commands(&self) -> &[ExtensionCommand] { &[] }
    fn produce_metrics(&self) -> Result<Vec<ExtensionMetricValue>> { Ok(vec![]) }
    fn get_stats(&self) -> ExtensionStats { ExtensionStats::default() }
    async fn health_check(&self) -> Result<bool> { Ok(true) }
    async fn configure(&mut self, _config: &serde_json::Value) -> Result<()> { Ok(()) }

    // ===== 选填：事件订阅 =====
    fn event_subscriptions(&self) -> &[&str] { &[] }
    fn handle_event(&self, _ty: &str, _payload: &serde_json::Value) -> Result<()> { Ok(()) }

    // ===== 选填：流式处理（视频等）=====
    fn stream_capability(&self) -> Option<StreamCapability> { None }
    async fn process_chunk(&self, _chunk: DataChunk) -> Result<StreamResult> { /* ... */ }
    async fn init_session(&self, _session: &StreamSession) -> Result<()> { /* ... */ }
    async fn process_session_chunk(&self, _sid: &str, _chunk: DataChunk) -> Result<StreamResult> { /* ... */ }
    async fn close_session(&self, _sid: &str) -> Result<SessionStats> { /* ... */ }

    // ===== 选填：推送模式（传感器等）=====
    fn set_output_sender(&self, _sender: Arc<mpsc::Sender<PushOutputMessage>>) { }
    async fn start_push(&self, _session_id: &str) -> Result<()> { /* ... */ }
    async fn stop_push(&self, _session_id: &str) -> Result<()> { Ok(()) }

    // ===== 必填：类型擦除支持 =====
    fn as_any(&self) -> &dyn std::any::Any;
}
```

### ABI 版本

SDK 使用 **ABI Version 3**。runner 加载扩展时会检查 ABI 版本号——版本不匹配会拒绝加载。升级 SDK 大版本后必须重新编译扩展。

```rust
// 宏自动生成的入口函数之一
#[no_mangle]
pub extern "C" fn neomind_extension_abi_version() -> u32 { 3 }
```

**核心方法的语义**：

| 方法 | 何时被调用 | 你的职责 |
|------|-----------|---------|
| `metadata()` | 加载时 | 返回静态 ID / 名称 / 版本 |
| `metrics()` | 加载时 + UI 查询 | 声明本扩展产出的指标（让仪表板能选） |
| `commands()` | 加载时 + UI 查询 | 声明本扩展支持的命令（让 AI Agent 能调用） |
| `produce_metrics()` | runner 定期轮询 | 返回当前指标值（轮询模式） |
| `execute_command()` | 用户 / Agent 触发命令 | 执行并返回 JSON 结果 |
| `configure()` | 用户改配置 | 应用新配置（热更新） |
| `health_check()` | runner 心跳 | 返回 false 会被标记 unhealthy |
| `handle_event()` | 订阅的事件发生 | 自定义事件响应 |
| `event_subscriptions()` | 加载时 | 声明关心哪些事件类型 |
| `stream_capability()` | 加载时 | 声明流式处理能力（有状态/无状态） |
| `process_chunk()` | 流式数据到达 | 处理单个数据块（如视频帧） |
| `init_session()` / `close_session()` | 会话开始/结束 | 初始化/清理有状态流处理 |
| `set_output_sender()` | 推送模式启动 | 保存输出通道，后续主动推送数据 |
| `start_push()` / `stop_push()` | 推送开始/停止 | 启动/停止后台推送任务 |

## Metadata / Metric / Command

**ExtensionMetadata** 完整结构（在 `metadata()` 返回）：

```rust
pub struct ExtensionMetadata {
    pub id: String,                              // 全局唯一 ID
    pub name: String,                            // 显示名
    pub version: semver::Version,                // 语义版本
    pub description: Option<String>,             // 描述
    pub author: Option<String>,                  // 作者
    pub homepage: Option<String>,                // 主页 URL
    pub license: Option<String>,                 // 许可证
    pub config_parameters: Option<Vec<ParameterDefinition>>, // 用户可配置参数
    #[serde(skip)]
    pub file_path: Option<PathBuf>,              // 内部使用（运行时填充）
}
```

### ParameterDefinition（配置参数定义）

`config_parameters` 定义用户在 Web UI 可配置的参数。用户修改后通过 `configure()` 方法热更新：

```rust
pub struct ParameterDefinition {
    pub name: String,           // 参数名（如 "api_key"）
    pub display_name: String,   // UI 显示名（如 "API Key"）
    pub description: String,    // 说明文字
    pub param_type: MetricDataType, // 类型：String / Float / Integer / Boolean / Enum
    pub required: bool,         // 是否必填
    pub default_value: Option<MetricValue>, // 默认值
    pub min: Option<f64>,       // 数值范围（可选）
    pub max: Option<f64>,
    pub options: Vec<String>,   // Enum 类型的选项列表
}
```

**使用示例**：天气扩展声明 API Key 和城市参数：

```rust
config_parameters: Some(vec![
    ParameterDefinition {
        name: "api_key".into(),
        display_name: "API Key".into(),
        description: "OpenWeatherMap API key".into(),
        param_type: MetricDataType::String,
        required: true,
        ..Default::default()
    },
    ParameterDefinition {
        name: "units".into(),
        display_name: "Units".into(),
        description: "metric or imperial".into(),
        param_type: MetricDataType::Enum { options: vec!["metric".into(), "imperial".into()] },
        default_value: Some(MetricValue::String("metric".into())),
        ..Default::default()
    },
]),
```

**MetricDescriptor**（在 `metrics()` 返回）：声明一个数据流。仪表板的「数据源选择器」会列出这里声明的所有 metric，DataSourceId 格式为 `extension:{id}:{metric_name}`。

**ExtensionCommand**（在 `commands()` 返回）：声明一个可调用命令。Agent 的 tool 系统会自动把这些命令暴露给 LLM，用户在 AI Chat 里就能触发。

> 用 SDK 提供的 builder（`MetricBuilder`、`CommandBuilder`、`ParamBuilder`）链式构造，比手写字面量更安全。

## neomind_export! 宏

trait 实现完之后，**只需一行**：

```rust
neomind_extension_sdk::neomind_export!(MyExtension);
```

宏会展开为约定的 `extern "C"` 入口函数（构造实例、调用 metadata / metrics / commands / execute_command 等）。runner 按符号名约定加载这些入口。

> 不要手写 FFI 函数 —— 让宏处理。如果需要自定义构造逻辑（例如从环境变量读初始配置），可以实现 `Extension::default()` 让宏用 `Default::default()` 构造。

## Capability 系统

扩展运行在隔离进程里，启动时**必须声明所需能力**。runner 按声明授权，未声明的能力调用会被拒。

扩展通过 `CapabilityContext` 调用平台能力。以下是 SDK 内置的完整 capability 常量列表：

| Capability 常量 | 含义 |
|-----------------|------|
| `device_metrics_read` | 读取设备指标 |
| `device_metrics_write` | 写入设备指标（虚拟设备） |
| `device_control` | 向设备发送命令 |
| `storage_query` | 查询时序数据库 |
| `event_publish` | 发布事件 |
| `event_subscribe` | 订阅事件 |
| `telemetry_history` | 查询遥测历史 |
| `metrics_aggregate` | 指标聚合查询 |
| `extension_call` | 调用其他扩展的命令 |
| `agent_trigger` | 触发 Agent 执行 |
| `rule_trigger` | 触发规则 |
| `network` | 出站网络访问（HTTP / MQTT 客户端等） |
| `filesystem:read` / `filesystem:write` | 文件读写（限定路径范围） |
| `ml-model` | 加载 / 运行 ML 模型 |
| `camera` | 访问相机 |
| `serial` | 串口访问 |

> Capability 是**最小权限原则**的体现：只声明你真正需要的。`network` + `ml-model` 是视觉类扩展的典型组合；只读数据扩展可能只需 `network` + `device_metrics_write`。

### 调用 Capability

```rust
use neomind_extension_sdk::capability::CapabilityContext;

async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
    let ctx = CapabilityContext::default();
    let response = ctx.invoke_capability("device_metrics_write", &json!({
        "device_id": "virtual-sensor",
        "metric": "status",
        "value": "ok",
        "is_virtual": true
    }));
    Ok(json!({ "capability_response": response }))
}
```

## ML 模型生命周期

视觉类扩展通常需要 ML 模型。SDK 提供统一的生命周期管理：

| 阶段 | 行为 |
|------|------|
| **Lazy load** | 模型不在扩展启动时加载，而是在第一次命令调用时才载入内存 |
| **Keep loaded** | 一旦加载就常驻（直到扩展进程退出），避免每次推理重新加载 |
| **显式释放** | 极少需要；若模型超大可在 `configure()` 里换 model path 后手动重载 |

**为什么 lazy load**：扩展启动时不阻塞 runner，多个扩展同时启动不会同时把所有模型载入内存（很多模型 GB 级）。

**为什么 keep loaded**：模型加载是秒级到十秒级操作，每次推理都重载会让用户觉得扩展"卡"。

实现范式：

```rust
pub struct YoloExtension {
    model: OnceLock<YoloModel>,   // 进程内只初始化一次
}

async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
    let model = self.model.get_or_try_init(|| {
        YoloModel::load("yolov8n.onnx")   // 首次调用才加载
    })?;
    let result = model.infer(/* ... */)?;
    Ok(json!({ "detections": result }))
}
```

## 跨平台打包

扩展要支持 NeoMind 全部目标平台。每个平台一份编译产物：

| 平台 | 产物 |
|------|------|
| macOS (arm64) | `libneomind_extension_<name>.dylib` |
| macOS (x86_64) | `.dylib` |
| Linux (x86_64) | `libneomind_extension_<name>.so` |
| Linux (arm64) | `.so` |
| Windows (x86_64) | `neomind_extension_<name>.dll` |

**交叉编译**建议用 `cross` 或 GitHub Actions 矩阵（NeoMind-Extensions 仓库的 CI 是参考样板）。

**打包成 `.nep`**：把多平台二进制 + metadata.json + （可选）模型文件打成单个 `.nep` 归档，用户在 NeoMind Extensions 页一键安装，runner 会自动挑匹配当前平台的二进制。

## 验证与调试

```bash
# 1. 本地编译
cargo build --release

# 2. 把产物复制到 NeoMind 扩展目录
cp target/release/libneomind_extension_my_extension.* ~/.neomind/extensions/my-extension/

# 3. 触发扫描
curl -X POST http://localhost:9375/api/extensions/discover

# 4. 看 runner 是否成功加载
# Web UI: Extensions 页看状态（Loaded / Crashed / Disabled）
# 日志: data/logs/ 或 journalctl
```

**常见加载失败原因**：

- lib 名前缀不对（必须 `neomind_extension_`）
- `panic = "abort"`（必须 `unwind`）
- 平台不匹配（arm64 跑了 x86_64 二进制）
- 缺少 capability 声明，运行时调用被拒

## 下一步

- 端到端写一个扩展 → [扩展开发实战](./7-extension-development.md)
- 看真实扩展代码 → [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库（weather / YOLO / OCR / 人脸识别 / 流媒体）
- API 层（metric / command 的 HTTP 端点）→ [REST API 参考](./4-rest-api.md)

---

*最后更新: 2026-06-15*
