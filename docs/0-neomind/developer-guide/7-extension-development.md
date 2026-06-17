---
description: "用 neomind-extension-sdk 从零开发一个 NeoMind 扩展的实战指南：脚手架、Cargo.toml 配置、Extension trait 实现、neomind_export! 导出、跨平台编译、打包 .nep、安装与调试。"
keywords: [NeoMind, 扩展开发, extension, 实战, FFI, 打包]
tags: [NeoMind, 开发指南]
sidebar_label: "Extension Development"
---

# 扩展开发实战

本文是端到端的扩展开发教程——从空目录到一个能被 NeoMind 加载、能被 Agent 调用的扩展。读完你能写出自己的扩展。

> **前置**：先读 [Extension SDK](./3-extension-sdk.md) 理解 trait、宏、capability、ML 模型生命周期的概念。本文是 hands-on 流程。

## 目标

我们做一个 **Counter 扩展**：维护一个计数器，对外提供一个 `increment` 命令（让 AI Agent 能调用）和一个 `counter` 指标（让仪表板能展示）。麻雀虽小，覆盖完整的 metric / command / FFI 流程。

## Step 1：建项目

```bash
cargo new --lib counter-extension
cd counter-extension
```

## Step 2：配置 Cargo.toml

```toml
[package]
name = "counter-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_counter"        # 前缀必须是 neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"     # 必须！runner 靠 unwind 捕获 panic
opt-level = 3
lto = "thin"
```

**两个关键点**：

- lib 名前缀 `neomind_extension_` —— runner 按此约定查找
- `panic = "unwind"` —— 让扩展崩溃可被捕获而非拖垮 runner

## Step 3：实现 Extension

`src/lib.rs`：

```rust
use async_trait::async_trait;
use neomind_extension_sdk::prelude::*;
use std::sync::atomic::{AtomicI64, Ordering};

pub struct CounterExtension {
    counter: AtomicI64,
}

impl CounterExtension {
    pub fn new() -> Self {
        Self { counter: AtomicI64::new(0) }
    }
}

#[async_trait]
impl Extension for CounterExtension {
    fn metadata(&self) -> &ExtensionMetadata {
        static META: std::sync::OnceLock<ExtensionMetadata> = std::sync::OnceLock::new();
        META.get_or_init(|| ExtensionMetadata {
            id: "counter".into(),
            name: "Counter".into(),
            version: semver::Version::parse("1.0.0").unwrap(),
            description: Some("A minimal counter extension".into()),
            author: Some("You".into()),
            license: Some("MIT".into()),
            ..Default::default()
        })
    }

    fn metrics(&self) -> &[MetricDescriptor] {
        static METRICS: std::sync::OnceLock<Vec<MetricDescriptor>> = std::sync::OnceLock::new();
        METRICS.get_or_init(|| vec![
            MetricDescriptor {
                name: "counter".into(),
                display_name: "Counter".into(),
                data_type: MetricDataType::Integer,
                unit: String::new(),
                min: None, max: None, required: false,
            },
        ])
    }

    fn commands(&self) -> &[ExtensionCommand] {
        static COMMANDS: std::sync::OnceLock<Vec<ExtensionCommand>> = std::sync::OnceLock::new();
        COMMANDS.get_or_init(|| vec![
            ExtensionCommand {
                name: "increment".into(),
                display_name: "Increment".into(),
                description: "Increment the counter".into(),
                parameters: vec![/* amount: Integer, default 1 */],
                llm_hints: "Increment the counter value".into(),
                ..Default::default()
            },
        ])
    }

    async fn execute_command(
        &self,
        command: &str,
        args: &serde_json::Value,
    ) -> Result<serde_json::Value> {
        match command {
            "increment" => {
                let amount = args.get("amount").and_then(|v| v.as_i64()).unwrap_or(1);
                let new_value = self.counter.fetch_add(amount, Ordering::SeqCst) + amount;
                Ok(serde_json::json!({ "counter": new_value }))
            }
            _ => Err(ExtensionError::CommandNotFound(command.into())),
        }
    }

    fn produce_metrics(&self) -> Result<Vec<ExtensionMetricValue>> {
        Ok(vec![ExtensionMetricValue::new(
            "counter",
            ParamMetricValue::Integer(self.counter.load(Ordering::SeqCst)),
        )])
    }

    fn as_any(&self) -> &dyn std::any::Any { self }
}

// 关键的一行 —— FFI 导出
neomind_extension_sdk::neomind_export!(CounterExtension);
```

**模式要点**：

- `OnceLock<T>` 让 metadata / metrics / commands 是进程级单例（避免每次调用分配）
- `execute_command` 是 Agent 触发的入口 —— LLM 会按 `commands()` 的 schema 拼参数
- `produce_metrics` 是轮询入口 —— runner 定期调用，把返回值写入 `telemetry.redb`
- **最后一行** `neomind_export!` 把整个 impl 暴露为 FFI 入口

## Step 4：编译

```bash
cargo build --release
```

产物路径：

- macOS：`target/release/libneomind_extension_counter.dylib`
- Linux：`target/release/libneomind_extension_counter.so`
- Windows：`target/release/neomind_extension_counter.dll`

## Step 5：安装到 NeoMind

把产物放到 NeoMind 的扩展目录（默认 `~/.neomind/extensions/<id>/` 或服务器部署的 `/var/lib/neomind/extensions/<id>/`）：

```bash
mkdir -p ~/.neomind/extensions/counter
cp target/release/libneomind_extension_counter.* ~/.neomind/extensions/counter/

# 触发扫描
curl -X POST http://localhost:9375/api/extensions/discover
```

或者更简单 —— 在 Web UI 的 **Extensions** 页点 **Install from file**，上传 `.dylib` / `.so` / `.dll`。

## Step 6：验证

```bash
# 列出扩展，应能看到 counter
curl http://localhost:9375/api/extensions

# 调用命令
curl -X POST http://localhost:9375/api/extensions/counter/commands/increment \
  -H 'Content-Type: application/json' \
  -d '{"amount": 5}'
# → {"success": true, "data": {"counter": 5}}
```

或者在 **AI Chat** 里说「调用 counter 扩展的 increment 命令，加 3」—— LLM 会自动找到 `increment` 命令并调用（因为 `commands()` 已经声明给了 Agent 工具系统）。

在仪表板里加一个数值卡，数据源选 `extension:counter:counter`，即可看到实时数值。

## Step 7：跨平台打包 `.nep`

单平台 `.dylib` 只能在 macOS 跑。要分发，需多平台编译并打包：

```bash
# 用 cross 或 GitHub Actions 矩阵编译全部目标
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
cross build --release --target x86_64-pc-windows-msvc
# Apple Silicon macOS（arm64）
cross build --release --target aarch64-apple-darwin

# 打包成 .nep（一个 zip 归档）
mkdir -p nep/{linux-x64,linux-arm64,windows-x64,darwin-arm64}
cp target/x86_64-unknown-linux-gnu/release/libneomind_extension_counter.so nep/linux-x64/
# ... 其他平台
cat > nep/metadata.json <<EOF
{ "id": "counter", "version": "1.0.0", "platforms": { ... } }
EOF
cd nep && zip -r ../counter-1.0.0.nep .
```

`.nep` 是约定俗成的归档格式（参考 NeoMind-Extensions 仓库的 CI 脚本）。用户在 Web UI 一键安装时，runner 会挑当前平台对应的二进制加载。

## 进阶模式

以下覆盖真实扩展开发中最常见的几种模式。

### 模式 1：网络扩展（天气 API）

天气扩展是最典型的网络扩展——拉取外部 API 数据，产出指标。

```rust
use neomind_extension_sdk::prelude::*;
use neomind_extension_sdk::capability::CapabilityContext;

pub struct WeatherExtension {
    config: std::sync::Mutex<WeatherConfig>,
}

struct WeatherConfig {
    api_key: String,
    city: String,
}

#[async_trait]
impl Extension for WeatherExtension {
    fn metadata(&self) -> &ExtensionMetadata {
        static META: OnceLock<ExtensionMetadata> = OnceLock::new();
        META.get_or_init(|| ExtensionMetadata {
            id: "weather".into(),
            name: "Weather".into(),
            version: Version::parse("1.0.0").unwrap(),
            config_parameters: Some(vec![
                ParameterDefinition {
                    name: "api_key".into(),
                    display_name: "API Key".into(),
                    description: "OpenWeatherMap API key".into(),
                    param_type: MetricDataType::String,
                    required: true,
                    ..Default::default()
                },
            ]),
            ..Default::default()
        })
    }

    fn metrics(&self) -> &[MetricDescriptor] {
        // 温度、湿度、气压
        // DataSourceId: extension:weather:temperature 等
    }

    async fn configure(&mut self, config: &Value) -> Result<()> {
        let cfg = self.config.lock().unwrap();
        // 从 config JSON 更新 api_key / city
    }

    async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
        match cmd {
            "fetch" => {
                let ctx = CapabilityContext::default();
                // 通过 network capability 发起 HTTP 请求
                let resp = ctx.invoke_capability("network", &json!({
                    "method": "GET",
                    "url": format!("https://api.openweathermap.org/data/2.5/weather?q={}&appid={}",
                        cfg.city, cfg.api_key)
                }));
                // 解析响应，写入虚拟设备指标
                ctx.invoke_capability("device_metrics_write", &json!({
                    "device_id": "virtual-weather",
                    "metric": "temperature",
                    "value": resp["main"]["temp"]
                }));
                Ok(json!({"status": "ok"}))
            }
            _ => Err(ExtensionError::CommandNotFound(cmd.into())),
        }
    }

    fn as_any(&self) -> &dyn std::any::Any { self }
}

neomind_export!(WeatherExtension);
```

### 模式 2：流式处理（视频帧）

视频分析扩展使用流式 API——每帧进入 `process_chunk()`，返回检测结果。

```rust
pub struct YoloVideoExtension {
    model: OnceLock<YoloModel>,
}

#[async_trait]
impl Extension for YoloVideoExtension {
    fn stream_capability(&self) -> Option<StreamCapability> {
        Some(StreamCapability {
            mode: StreamMode::Stateless, // 无状态：每帧独立处理
            input_format: "image/jpeg".into(),
            output_format: "application/json".into(),
        })
    }

    async fn process_chunk(&self, chunk: DataChunk) -> Result<StreamResult> {
        let model = self.model.get_or_try_init(|| YoloModel::load("yolov8n.onnx"))?;
        let detections = model.infer(&chunk.data)?;

        Ok(StreamResult {
            output: serde_json::to_value(&detections)?,
            metadata: Some(json!({"frame_id": chunk.sequence})),
        })
    }

    // ... 其他方法
}
```

### 模式 3：推送模式（传感器）

推送模式适用于扩展主动产出数据的场景（如串口传感器）。扩展通过 `output_sender` 主动推送。

```rust
use tokio::sync::mpsc;
use std::sync::Arc;

pub struct SensorPushExtension {
    sender: std::sync::Mutex<Option<Arc<mpsc::Sender<PushOutputMessage>>>>,
}

#[async_trait]
impl Extension for SensorPushExtension {
    fn set_output_sender(&self, sender: Arc<mpsc::Sender<PushOutputMessage>>) {
        *self.sender.lock().unwrap() = Some(sender);
    }

    async fn start_push(&self, _session_id: &str) -> Result<()> {
        let sender = self.sender.lock().unwrap().clone()
            .ok_or(ExtensionError::ExecutionFailed("no sender".into()))?;

        // 启动后台采集任务
        tokio::spawn(async move {
            loop {
                let value = read_sensor(); // 你的采集逻辑
                let msg = PushOutputMessage {
                    metric: "temperature".into(),
                    value: json!(value),
                    timestamp: chrono::Utc::now().timestamp(),
                };
                if sender.send(msg).await.is_err() { break; }
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        });

        Ok(())
    }

    async fn stop_push(&self, _session_id: &str) -> Result<()> {
        // 停止后台任务（通过 channel 关闭或 cancel token）
        Ok(())
    }
}
```

### 模式 4：事件订阅

扩展可以订阅平台事件（如设备上线、规则触发），在 `handle_event()` 中响应。

```rust
fn event_subscriptions(&self) -> &[&str] {
    &["device.online", "rule.triggered"]
}

fn handle_event(&self, event_type: &str, payload: &Value) -> Result<()> {
    match event_type {
        "device.online" => {
            let device_id = payload["device_id"].as_str().unwrap();
            // 设备上线时做初始化...
        }
        "rule.triggered" => {
            // 规则触发时的联动逻辑...
        }
        _ => {}
    }
    Ok(())
}
```

### 模式 5：配置参数热更新

用户在 Web UI 修改配置后，`configure()` 被调用。建议用 `Mutex` 保护配置状态：

```rust
pub struct MyExtension {
    config: std::sync::Mutex<MyConfig>,
}

async fn configure(&mut self, config: &Value) -> Result<()> {
    let new_cfg = MyConfig {
        api_key: config["api_key"].as_str().unwrap_or("").to_string(),
        interval: config["interval"].as_u64().unwrap_or(60),
    };
    // 校验
    if new_cfg.api_key.is_empty() {
        return Err(ExtensionError::InvalidArguments("api_key required".into()));
    }
    *self.config.lock().unwrap() = new_cfg;
    Ok(())
}
```

### .nep 包结构

完整的 `.nep` 包是一个 ZIP 归档，包含多平台二进制 + metadata：

```
my-extension-1.0.0.nep (ZIP)
├── metadata.json               ← 扩展元数据 + 平台映射
├── darwin-arm64/
│   └── libneomind_extension_my_extension.dylib
├── darwin-x86_64/
│   └── libneomind_extension_my_extension.dylib
├── linux-x86_64/
│   └── libneomind_extension_my_extension.so
├── linux-arm64/
│   └── libneomind_extension_my_extension.so
├── windows-x86_64/
│   └── neomind_extension_my_extension.dll
└── models/                     ← （可选）ML 模型文件
    └── yolov8n.onnx
```

**metadata.json** 示例：

```json
{
  "id": "my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "sdk_version": "0.6.3",
  "abi_version": 3,
  "platforms": {
    "darwin-arm64": "darwin-arm64/libneomind_extension_my_extension.dylib",
    "linux-x86_64": "linux-x86_64/libneomind_extension_my_extension.so",
    "windows-x86_64": "windows-x86_64/neomind_extension_my_extension.dll"
  }
}
```

runner 加载时会根据当前平台自动选择对应的二进制路径。

## 参考实现

[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库的每个扩展都是完整范本：

- `weather-forecast-v2` —— 简单网络扩展（无 ML 模型）
- `image-analyzer-v2` —— ML 模型 lazy-load 范本（YOLOv11）
- `yolo-video-v2` —— 流式视频处理
- `yolo-device-inference` —— 与 NE301/NE101 相机集成
- `home-assistant-bridge` —— 第三方系统集成

读其中一个的源码，比任何文档都直观。

## 常见坑

| 现象 | 原因 |
|------|------|
| 加载报 "symbol not found" | lib 名前缀不是 `neomind_extension_` |
| 扩展 panic 后被永久禁用 | `panic = "abort"`（必须 `unwind`） |
| 命令调用报 "permission denied" | 缺少对应 capability 声明 |
| Agent 看不到我的命令 | `commands()` 没实现，或 `llm_hints` 字段为空（影响 LLM 发现） |
| 仪表板选不到我的 metric | `metrics()` 没实现，或 name 拼写与 DataSourceId 不一致 |
| 跨平台分发报错 | 漏了某个目标平台的二进制；`.nep` 里 metadata.json 的 platforms 字段不全 |

## 下一步

- 把你的扩展提 PR 到 [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)，让社区用上
- 涉及 HTTP API 的扩展命令调用细节 → [REST API 参考](./4-rest-api.md)
- Dashboard 组件开发（如果想让扩展带可视化）→ [Dashboard 组件开发](./8-dashboard-component-dev.md)
- 设备指标作为扩展数据源 → [设备类型开发](./6-device-type-development.md)

---

*最后更新: 2026-06-15*
