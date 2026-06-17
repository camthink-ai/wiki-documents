---
description: "End-to-end guide for building a NeoMind extension from scratch with neomind-extension-sdk: scaffolding, Cargo.toml, Extension trait implementation, neomind_export!, cross-platform compile, .nep packaging, install & debug."
keywords: [NeoMind, extension development, hands-on, FFI, packaging]
tags: [NeoMind, Developer Guide]
---

# Extension Development Hands-On

This is an end-to-end extension tutorial — from an empty directory to an extension that NeoMind can load and the Agent can call. By the end you'll be able to write your own extensions.

> **Prerequisite**: read [Extension SDK](./3-extension-sdk.md) first for the trait, macros, capability, and ML-model lifecycle concepts. This page is the hands-on build flow.

## Goal

We'll build a **Counter extension**: maintains a counter, exposes an `increment` command (callable by the AI Agent) and a `counter` metric (displayable on the dashboard). Small but covers the complete metric / command / FFI flow.

## Step 1: Scaffold the Project

```bash
cargo new --lib counter-extension
cd counter-extension
```

## Step 2: Configure Cargo.toml

```toml
[package]
name = "counter-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_counter"        # prefix MUST be neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"     # REQUIRED — runner catches panics via unwind
opt-level = 3
lto = "thin"
```

**Two critical settings**:

- lib name prefix `neomind_extension_` — runner looks up extensions by this convention
- `panic = "unwind"` — so an extension panic is caught rather than crashing the runner

## Step 3: Implement the Extension

`src/lib.rs`:

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

// The crucial line — FFI export
neomind_extension_sdk::neomind_export!(CounterExtension);
```

**Pattern highlights**:

- `OnceLock<T>` makes metadata / metrics / commands process-level singletons (avoids per-call allocation)
- `execute_command` is the Agent's entry point — the LLM fills arguments per the schema declared in `commands()`
- `produce_metrics` is the polling entry — runner calls it periodically and writes the values into `telemetry.redb`
- **The last line** `neomind_export!` turns the entire impl into an FFI entry point

## Step 4: Build

```bash
cargo build --release
```

Artifact path:

- macOS: `target/release/libneomind_extension_counter.dylib`
- Linux: `target/release/libneomind_extension_counter.so`
- Windows: `target/release/neomind_extension_counter.dll`

## Step 5: Install into NeoMind

Copy the artifact into NeoMind's extension directory (default `~/.neomind/extensions/<id>/`, or `/var/lib/neomind/extensions/<id>/` for server deployments):

```bash
mkdir -p ~/.neomind/extensions/counter
cp target/release/libneomind_extension_counter.* ~/.neomind/extensions/counter/

# Trigger scan
curl -X POST http://localhost:9375/api/extensions/discover
```

Or even simpler — in the Web UI **Extensions** page click **Install from file** and upload the `.dylib` / `.so` / `.dll`.

## Step 6: Verify

```bash
# List extensions — counter should appear
curl http://localhost:9375/api/extensions

# Call the command
curl -X POST http://localhost:9375/api/extensions/counter/commands/increment \
  -H 'Content-Type: application/json' \
  -d '{"amount": 5}'
# → {"success": true, "data": {"counter": 5}}
```

Or in **AI Chat** say: "Call the counter extension's increment command, add 3" — the LLM will auto-locate the `increment` command and invoke it (because `commands()` already declared it to the Agent tool system).

On the dashboard, add a value card widget, pick data source `extension:counter:counter`, and the live value shows up.

## Step 7: Cross-Platform `.nep` Packaging

A single-platform `.dylib` only runs on macOS. To distribute you must compile all targets and package:

```bash
# Use cross or a GitHub Actions matrix to build every target
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
cross build --release --target x86_64-pc-windows-msvc
# Apple Silicon macOS (arm64)
cross build --release --target aarch64-apple-darwin

# Package into .nep (a zip archive)
mkdir -p nep/{linux-x64,linux-arm64,windows-x64,darwin-arm64}
cp target/x86_64-unknown-linux-gnu/release/libneomind_extension_counter.so nep/linux-x64/
# ... other platforms
cat > nep/metadata.json <<EOF
{ "id": "counter", "version": "1.0.0", "platforms": { ... } }
EOF
cd nep && zip -r ../counter-1.0.0.nep .
```

`.nep` is the conventional archive format (see the NeoMind-Extensions repo's CI scripts for the reference). When a user installs via the Web UI one-click flow, the runner picks the binary matching the current platform.

## Advanced Patterns

The following cover the most common patterns in real-world extension development.

### Pattern 1: Network Extension (Weather API)

A weather extension is the canonical network extension — fetches an external API and produces metrics.

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
        // temperature, humidity, pressure
        // DataSourceId: extension:weather:temperature etc.
    }

    async fn configure(&mut self, config: &Value) -> Result<()> {
        let cfg = self.config.lock().unwrap();
        // update api_key / city from config JSON
    }

    async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
        match cmd {
            "fetch" => {
                let ctx = CapabilityContext::default();
                // HTTP request via network capability
                let resp = ctx.invoke_capability("network", &json!({
                    "method": "GET",
                    "url": format!("https://api.openweathermap.org/data/2.5/weather?q={}&appid={}",
                        cfg.city, cfg.api_key)
                }));
                // Parse response, write virtual device metrics
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

### Pattern 2: Streaming (Video Frames)

A video analysis extension uses the streaming API — each frame enters `process_chunk()` and returns detections.

```rust
pub struct YoloVideoExtension {
    model: OnceLock<YoloModel>,
}

#[async_trait]
impl Extension for YoloVideoExtension {
    fn stream_capability(&self) -> Option<StreamCapability> {
        Some(StreamCapability {
            mode: StreamMode::Stateless, // stateless: each frame independent
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

    // ... other methods
}
```

### Pattern 3: Push Mode (Sensors)

Push mode is for extensions that proactively produce data (e.g. serial sensors). The extension pushes via `output_sender`.

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

        // Start background collection task
        tokio::spawn(async move {
            loop {
                let value = read_sensor(); // your collection logic
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
        // Stop the background task (via channel close or cancel token)
        Ok(())
    }
}
```

### Pattern 4: Event Subscriptions

Extensions can subscribe to platform events (e.g. device online, rule triggered) and respond in `handle_event()`.

```rust
fn event_subscriptions(&self) -> &[&str] {
    &["device.online", "rule.triggered"]
}

fn handle_event(&self, event_type: &str, payload: &Value) -> Result<()> {
    match event_type {
        "device.online" => {
            let device_id = payload["device_id"].as_str().unwrap();
            // Initialize when a device comes online...
        }
        "rule.triggered" => {
            // Rule-triggered联动 logic...
        }
        _ => {}
    }
    Ok(())
}
```

### Pattern 5: Configuration Hot-Reload

When a user changes config in the Web UI, `configure()` is called. Use a `Mutex` to guard config state:

```rust
pub struct MyExtension {
    config: std::sync::Mutex<MyConfig>,
}

async fn configure(&mut self, config: &Value) -> Result<()> {
    let new_cfg = MyConfig {
        api_key: config["api_key"].as_str().unwrap_or("").to_string(),
        interval: config["interval"].as_u64().unwrap_or(60),
    };
    // Validate
    if new_cfg.api_key.is_empty() {
        return Err(ExtensionError::InvalidArguments("api_key required".into()));
    }
    *self.config.lock().unwrap() = new_cfg;
    Ok(())
}
```

### .nep Package Structure

A complete `.nep` package is a ZIP archive containing multi-platform binaries + metadata:

```
my-extension-1.0.0.nep (ZIP)
├── metadata.json               ← extension metadata + platform mapping
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
└── models/                     ← (optional) ML model files
    └── yolov8n.onnx
```

**metadata.json** example:

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

The runner automatically selects the binary matching the current platform on load.

## Reference Implementations

The [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) repo has complete working examples for every pattern:

- `weather-forecast-v2` — a simple network extension (no ML model)
- `image-analyzer-v2` — ML-model lazy-load pattern (YOLOv11)
- `yolo-video-v2` — streaming video processing
- `yolo-device-inference` — integration with NE301/NE101 cameras
- `home-assistant-bridge` — third-party system integration

Reading one of these is more illuminating than any doc.

## Common Pitfalls

| Symptom | Cause |
|---------|-------|
| Load error "symbol not found" | lib name prefix is not `neomind_extension_` |
| Extension panic permanently disables it | `panic = "abort"` (must be `unwind`) |
| Command call returns "permission denied" | Missing the matching capability declaration |
| Agent can't see your command | `commands()` not implemented, or `llm_hints` is empty (affects LLM discovery) |
| Dashboard can't find your metric | `metrics()` not implemented, or the name is misspelled vs the DataSourceId |
| Cross-platform distribution fails | Missing some target platform binary, or `metadata.json` platforms field is incomplete |

## Next Steps

- Open a PR to [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) so the community can use your extension
- Extension command HTTP invocation details → [REST API Reference](./4-rest-api.md#extensions)
- Dashboard component development (if your extension ships visualizations) → [Dashboard Component Dev](./8-dashboard-component-dev.md)
- Device metrics as extension data sources → [Device Type Development](./6-device-type-development.md)

---

*Last updated: 2026-06-15*
