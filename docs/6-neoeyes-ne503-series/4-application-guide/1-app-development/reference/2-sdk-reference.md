---
description: NE503 Python SDK (hailo_ipc_sdk) API 完整参考，涵盖 8 个核心模块：AI 推理、视频流、事件总线、设备控制、应用管理、插件发现、AI 叠加、配置管理，包含所有数据类定义和方法签名。
keywords: [NE503 SDK, Python SDK, hailo_ipc_sdk, InferenceClient, EventClient, DeviceClient, AI推理, 视频流, 事件总线, 插件系统]
tags: [SDK参考, NE503, Python, API文档, 开发者]
---

# SDK 参考

`hailo_ipc_sdk` 是 NE503 容器应用的 Python SDK，提供 8 个核心模块。安装方式参见[应用参考](./1-app-reference.md#3-dockerfile-模式)。

## 快速开始

```python
from hailo_ipc_sdk import InferenceClient

# 订阅式推理：stream 用 sub（发原始 NV12 帧），model 用设备真实名
inf = InferenceClient()
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    print(f"Detected {len(result.objects)} objects")
```

三类调用范式（推理订阅 / 事件发布订阅 / 设备控制）与「名字不能写死、订阅是阻塞迭代器、优雅退出」要点见 [SDK 工作流 §3 调用范式](../0-sdk-workflow.md#3-调用范式)；各模块完整 API 见下文 §1–§8。

---

## 1. inference — AI 推理

### 数据类

#### BoundingBox

```python
@dataclass
class BoundingBox:
    x: float
    y: float
    width: float
    height: float
    def to_xyxy(self) -> Tuple[float, float, float, float]
    def to_xywh(self) -> Tuple[float, float, float, float]
```

#### DetectedObject

```python
@dataclass
class DetectedObject:
    label: str
    score: float
    bbox: BoundingBox
    class_id: int = 0
    track_id: Optional[int] = None
```

#### LandmarkPoint / LandmarkSet

```python
@dataclass
class LandmarkPoint:
    x: float
    y: float
    confidence: float = 1.0

@dataclass
class LandmarkSet:
    type: str
    points: List[LandmarkPoint]
```

#### Classification

```python
@dataclass
class Classification:
    type: str       # age, gender, clip 等
    class_id: int
    label: str
    confidence: float
```

#### SegmentationMask

```python
@dataclass
class SegmentationMask:
    class_id: int
    label: str
    confidence: float
    bbox: BoundingBox
    mask_rle: bytes
    mask_width: int
    mask_height: int
    def to_numpy_mask() -> np.ndarray
```

#### OcrLine / Embedding / DepthMap

```python
@dataclass
class OcrLine:
    text: str
    confidence: float
    bbox: BoundingBox

@dataclass
class Embedding:
    dim: int
    data: List[float]

@dataclass
class DepthMap:
    width: int
    height: int
    data: np.ndarray    # float32 (H, W)
```

#### InferenceResult

```python
@dataclass
class InferenceResult:
    frame_sequence: int
    timestamp_ns: int
    objects: List[DetectedObject]
    classifications: List[Classification]
    landmarks: List[LandmarkSet]
    masks: List[SegmentationMask]
    ocr_lines: List[OcrLine]
    embeddings: List[Embedding]
    depth_maps: List[DepthMap]
    raw_outputs: Optional[List[np.ndarray]]
    infer_time_us: int = 0
    queue_time_us: int = 0
    hw_infer_time_us: int = 0       # 纯 NPU 硬件推理耗时（μs），不可用时为 0
    status_message: str = ""        # 诊断信息；"simulation" 表示无真实帧源（降级模式）

    def has_person() -> bool
    def count_by_label(label: str) -> int
    def get_objects_by_label(label: str) -> List[DetectedObject]
```

#### ModelInfo

```python
@dataclass
class ModelInfo:
    model_id: str
    model_path: str
    version: str = ""
    inputs: List[Dict]
    outputs: List[Dict]
    estimated_tops: float = 0.0
    estimated_memory: int = 0
    load_timestamp: int = 0
```

### InferenceClient

```python
class InferenceClient:
    def __init__(self, endpoint: Optional[str] = None)
    def connect() -> None
    def close() -> None
```

**推理操作**：

| 方法 | 签名 | 说明 |
|:---|:---|:---|
| `infer` | `infer(image: np.ndarray, model_id: str, timeout_ms: int = 5000, priority: int = 4) -> InferenceResult` | 单帧推理 |
| `infer_with_tensors` | `infer_with_tensors(model_id: str, inputs: List[np.ndarray], timeout_ms: int = 5000) -> List[np.ndarray]` | 多输入推理 |
| `subscribe` | `subscribe(stream: str, model: str, fps: int = 10, raw_output_only: bool = False) -> Iterator[Tuple[int, InferenceResult]]` | 流式推理 |

**模型管理**：

| 方法 | 签名 | 说明 |
|:---|:---|:---|
| `register_model` | `register_model(model_path: str, model_id: Optional[str] = None, ...) -> str` | 注册模型 |
| `unregister_model` | `unregister_model(model_id: str) -> None` | 注销模型 |
| `list_models` | `list_models() -> List[ModelInfo]` | 列出模型 |
| `get_model_info` | `get_model_info(model_id: str) -> Optional[ModelInfo]` | 模型详情 |

**会话管理**：

| 方法 | 签名 | 说明 |
|:---|:---|:---|
| `create_session` | `create_session(session_id: str, max_qps: int = 0, max_concurrent: int = 0, priority: int = 4) -> str` | 创建会话 |
| `destroy_session` | `destroy_session(session_id: str) -> None` | 销毁会话 |

**GenAI**：

| 方法 | 签名 | 说明 |
|:---|:---|:---|
| `genai_create_session` | `genai_create_session(hef_path: str, kind: str = "llm") -> str` | 创建 GenAI 会话 |
| `genai_destroy_session` | `genai_destroy_session(session_id: str) -> None` | 销毁会话 |
| `genai_generate` | `genai_generate(session_id: str, messages: List[str], max_tokens: int = 512, ...) -> Iterator[str]` | 流式生成 |
| `genai_abort` | `genai_abort(session_id: str) -> None` | 中止生成 |

**其他**：

| 方法 | 说明 |
|:---|:---|
| `get_stats() -> Dict` | 系统统计 |
| `encode_text(text: str) -> List[float]` | CLIP 文本编码 |
| `update_postprocess_config(model_id: str, config_json: str) -> bool` | 更新后处理配置 |

---

## 2. media — 视频流

### PixelFormat

```python
class PixelFormat(IntEnum):
    NV12 = 0; NV21 = 1; RGB = 2; BGR = 3
    RGBA = 4; BGRA = 5; GRAY8 = 6; YUYV = 7
```

### Frame

```python
@dataclass
class Frame:
    sequence: int
    timestamp_ns: int
    width: int
    height: int
    format: str
    image: np.ndarray
    def to_rgb() -> np.ndarray
    def save(path: str) -> None
```

### StreamInfo

```python
@dataclass
class StreamInfo:
    stream_id: str
    width: int; height: int
    format: str; fps: float
    buffer_count: int
```

### FdMediaClient

零拷贝视频帧获取（Unix Socket + DMA-BUF）：

```python
class FdMediaClient:
    def __init__(self, socket_path: str | None = None)
    def get_frame(stream_id: str, timeout_ms: int = 5000) -> Frame | None
    def subscribe_raw(stream_id: str, skip_frames: bool = True) -> Iterator[Frame]
    def on_frame(stream_id: str, callback: Callable) -> threading.Thread
    def list_streams() -> List[str]          # 如 ['main', 'sub']；推理用 sub
    def close() -> None
```

### EncodedStreamClient

读取编码视频流（H.264/H.265 NAL 单元），用于 RTSP 转推、录像等不需要原始帧的场景。Socket 路径形如 `/run/aipc/encoded/main.sock`。

```python
@dataclass
class EncodedFrame:
    codec: int            # 0=h264, 1=h265
    flags: int            # bit0 = 关键帧
    pts_ns: int           # 显示时间戳（纳秒）
    width: int
    height: int
    dts_ns: int           # 解码时间戳（纳秒）
    data: bytes           # 编码 NAL 负载
    @property
    def is_keyframe() -> bool
    @property
    def codec_name() -> str       # "h264" / "h265"

class EncodedStreamClient:
    def __init__(self, socket_path: str)
    def get_frame(timeout_ms: int = 5000) -> EncodedFrame | None
    def subscribe(reconnect: bool = True) -> Iterator[EncodedFrame]
    def on_frame(callback: Callable) -> threading.Thread
    def close() -> None
```

`FdMediaClient.get_encoded_stream(stream_id="main")` 可便捷返回一个已连接的 `EncodedStreamClient`。视频流接入（RTSP/WebSocket）详见 [Video Integration](../../2-3rd-party-integration/1-video-integration.md)。

---

## 3. events — 事件总线

### Event / TopicInfo

```python
@dataclass
class Event:
    topic: str
    payload: Dict[str, Any]
    source: str = ""
    event_id: str = ""
    timestamp_ns: int = 0
    metadata: Dict[str, str]
    def to_json() -> str

@dataclass
class TopicInfo:
    topic: str
    subscriber_count: int
    total_messages: int
    last_message_ts: int
```

### EventClient

```python
class EventClient:
    def __init__(self, endpoint: Optional[str] = None)
```

| 方法 | 说明 |
|:---|:---|
| `publish(topic, payload, persistent=False, ttl_ms=None, metadata=None) -> str` | 发布事件 |
| `publish_batch(events, persistent=False) -> None` | 批量发布 |
| `subscribe(topic, filters=None, queue_size=100) -> Iterator[Event]` | 订阅（支持通配符） |
| `on_event(topic, callback, filters=None) -> Thread` | 回调订阅 |
| `unsubscribe(topic) -> None` | 取消订阅 |
| `list_topics() -> List[TopicInfo]` | 列出主题 |
| `get_topic_info(topic) -> Optional[TopicInfo]` | 主题详情 |
| `get_stats() -> Dict` | 系统统计 |
| `get_topic_stats(topic) -> Dict` | 主题统计 |

---

## 4. device — 设备控制

### IrCutMode / DeviceStatus / DeviceEvent

```python
class IrCutMode(Enum):
    AUTO = 0; DAY = 1; NIGHT = 2

@dataclass
class DeviceStatus:
    soc_temp_c: float; mcu_temp_c: float
    light_sensor: int; zoom_pos: int; focus_pos: int
    autofocus_enabled: bool; ircut_mode: IrCutMode
    white_light_level: int; ir_led_on: bool
    mcu_version: str

@dataclass
class DeviceEvent:
    type: EventType    # GPIO_CHANGE, TEMPERATURE_ALERT, ...
    timestamp_ns: int
```

### DeviceClient

```python
class DeviceClient:
    def __init__(self, endpoint: Optional[str] = None)
```

**灯光**：`set_white_light(level: int)`、`set_ir_led(on: bool)`、`set_ircut(mode: IrCutMode)`

**云台**：`pan_left/right(speed)`、`tilt_up/down(speed)`、`ptz_stop()`、`save_preset(id)`、`call_preset(id)`

**镜头**：`zoom(speed)`、`set_zoom_level(level)`、`focus(speed)`、`focus_auto(enable)`、`set_focus_level(level)`、`get_lens_status()`、`lens_init()`、`lens_goto_ratio_distance(zoom_ratio, focus_distance_m)`、`control_iris(open)`、`set_iris_target(target)`、`lens_reset_zero(zoom, focus)`

**GPIO**：`gpio_set(pin, value)`、`gpio_get(pin) -> bool`

**状态**：`get_device_status() -> DeviceStatus`、`subscribe_events() -> Iterator[DeviceEvent]`

---

## 5. app — 应用管理

### AppInfo / AppStats / LogLine

```python
@dataclass
class AppInfo:
    id: str; name: str; version: str; state: str
    container_id: str; pid: int
    installed_at: int; started_at: int; restart_count: int

@dataclass
class AppStats:
    cpu_usage_percent: float; memory_usage_bytes: int
    memory_limit_bytes: int; thread_count: int

@dataclass
class LogLine:
    timestamp: int; level: str; message: str
```

### AppClient

```python
class AppClient:
    def __init__(self, endpoint: Optional[str] = None)
```

| 方法 | 说明 |
|:---|:---|
| `install_app(manifest_path, image_path) -> str` | 安装应用 |
| `start_app(app_id)` | 启动 |
| `stop_app(app_id, timeout_seconds=30)` | 停止 |
| `uninstall_app(app_id, keep_logs=True)` | 卸载 |
| `list_apps() -> List[AppInfo]` | 列出应用 |
| `get_app(app_id) -> AppInfo` | 应用详情 |
| `get_app_stats(app_id) -> AppStats` | 资源统计 |
| `get_logs(app_id, max_lines=100, follow=False) -> Iterator[LogLine]` | 获取日志 |
| `get_logs_text(app_id, max_lines=100, follow=False) -> Iterator[str]` | 文本日志 |

---

## 6. plugin — 插件发现

### PluginEndpoint

```python
@dataclass
class PluginEndpoint:
    app_id: str; capability_id: str; version: str
    transport: str; socket_path: Optional[str]; state: str
    def connect(**kwargs) -> grpc.Channel
    @property
    def is_available() -> bool
```

### PluginDiscovery

| 方法 | 说明 |
|:---|:---|
| `get(capability_id: str) -> Optional[PluginEndpoint]` | 查找插件 |
| `require(capability_id: str, timeout: float = 30.0) -> PluginEndpoint` | 等待插件可用 |
| `list_plugins() -> Dict[str, dict]` | 列出所有插件 |
| `list_capabilities() -> List[str]` | 列出所有能力 |
| `reload() -> None` | 重新加载 |
| `watch(callback: Callable) -> None` | 监听变化 |
| `close() -> None` | 关闭并释放资源 |

### PluginServer

```python
class PluginServer:
    def __init__(self, plugin_id: str, socket_dir: str = DISCOVERY_DIR)
    def create_server(max_workers: int = 4) -> grpc.Server
    def start() -> None
    def stop(grace: float = 5.0) -> None
```

---

## 7. overlay — AI 结果叠加

```python
@dataclass
class OverlayConfig:
    enabled: bool = True
    show_label: bool = True
    show_confidence: bool = True
    line_thickness: int = 2
    box_color: int = 0
    label_color: int = 0
    font_size: int = 0

class OverlayClient:
    def enable(show_label=True, show_confidence=True, line_thickness=2)
    def disable()
    def configure(enabled=True, show_label=True, ...)
    def apply(config: OverlayConfig)
```

---

## 8. config — 配置管理

```python
class Config:
    @staticmethod
    def get_app_id() -> str
    @staticmethod
    def get_inference_endpoint() -> str
    @staticmethod
    def get_event_bus_endpoint() -> str
    @staticmethod
    def get_device_control_endpoint() -> str
    @staticmethod
    def get_camera_control_endpoint() -> str
    @staticmethod
    def translate_path_to_host(container_path: str) -> str
    @staticmethod
    def is_debug() -> bool
```

### 环境变量

`Config` 读取的连接端点（`AI_RUNTIME_ENDPOINT`、`EVENT_BUS_ENDPOINT`、`DEVICE_CONTROL_ENDPOINT`、`CAMERA_CONTROL_ENDPOINT`）及平台自动注入的容器环境变量（`APP_ID`、`AIPC_HOST_PREFIX`、`SHM_BASE_PATH`、`LOG_LEVEL` 等）完整列表，见 [应用参考 §7 环境变量参考](./1-app-reference.md#7-环境变量参考)。

---

## 相关文档

- [SDK 示例](./3-sdk-examples.md) — 完整应用示例和开发指南
- [应用参考](./1-app-reference.md) — 项目创建、app.yaml 配置、部署流程
- [平台服务总览](../../../3-software-guide/4-reference/0-platform-services.md) — AI Runtime、Event Bus 等服务职责与源码指针
