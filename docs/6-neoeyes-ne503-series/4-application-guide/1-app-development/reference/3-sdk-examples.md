---
description: NE503 Python SDK 实战示例集，包含 AI 推理、事件处理、设备控制和多场景联动等完整 mini-app。
keywords: [NE503, SDK 示例, Python, AI 推理, 事件处理, 容器应用]
tags: [应用开发, NE503, SDK, 示例]
---

# SDK 示例

本文通过 4 个由浅入深的完整 mini-app，演示 `hailo_ipc_sdk` 的典型用法。SDK API 详情请参阅 [SDK 参考](./2-sdk-reference.md)，项目结构与构建部署流程请参阅 [应用参考](./1-app-reference.md)。

:::warning 替换为你设备的真实流名与模型名
下文示例中的 `STREAM`、`MODEL` 为占位常量。部署前**必须**先在设备上查出真实值再填入 `app.py` 与 `app.yaml`，否则推理订阅会因流/模型不匹配而永久挂起或报 `NOT_FOUND`：

```python
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())   # 如 ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())    # 如 ['main', 'sub']
```

关键约定（推理须用 `sub` 流；模型名与权限须与设备一致并和 `app.py`/`app.yaml` 对应）详见 [Person Detection 教程 §4](../2-person-detection.md#4-发现并配置模型与视频流)。
:::

## 1. 实时目标检测计数器

:::note 完整真机版
本例是最简的推理订阅范式。完整真机版（含模型/流发现、健康检查、优雅退出、Web 验收）见 [Person Detection 教程](../2-person-detection.md)。
:::

**场景**：订阅 AI 推理流，统计每帧中各标签的检测数量，并以固定间隔打印汇总。

**核心 API**：`InferenceClient.subscribe()` 迭代器、`InferenceResult.count_by_label()`

**代码** (`app.py`)：

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("object-counter")

# ── 配置 ──────────────────────────────────────────────────────────────
STREAM = "sub"                  # 视频流 ID（推理必须用 sub；先 list_streams() 确认）
MODEL = "hailo_yolov8n_384_640"  # 推理模型（先 list_models() 查设备真实名）
FPS = 10                        # 订阅帧率
REPORT_INTERVAL = 5.0           # 汇总打印间隔（秒）

# ── 主逻辑 ────────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    last_report = time.monotonic()
    frame_count = 0

    logger.info("Connecting to inference service...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        frame_count += 1

        # 每 REPORT_INTERVAL 秒输出一次汇总
        now = time.monotonic()
        if now - last_report >= REPORT_INTERVAL:
            labels = {obj.label for obj in result.objects}
            counts = {label: result.count_by_label(label) for label in labels}
            infer_ms = result.infer_time_us / 1000
            logger.info(
                "seq=%d | frames=%d | objects=%d | counts=%s | infer=%.1fms",
                frame_seq, frame_count, len(result.objects), counts, infer_ms,
            )
            last_report = now

if __name__ == "__main__":
    main()
```

**app.yaml**：

```yaml
apiVersion: v1
kind: Application

metadata:
  id: object_counter
  name: Object Counter
  version: 1.0.0
  description: 订阅推理流并统计目标数量

spec:
  image: aipc/object_counter:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                 # 推理订阅必须声明原始流（sub 发布 NV12 帧）
    inference:
      models: [hailo_yolov8n_384_640]
```

**运行**：

```bash
aipc-cli app install app.yaml object_counter.tar
aipc-cli app start object_counter
aipc-cli app logs object_counter --follow
```

**运行效果**：

应用连接推理服务后，每 `REPORT_INTERVAL` 秒输出一次汇总，形如：

```
[object-counter] seq=50 | frames=50 | objects=3 | counts={'person': 2, 'car': 1} | infer=4.2ms
```

其中 `counts` 是当前帧各标签的检测计数，`infer` 为单帧推理耗时；画面无人时 `objects=0`。

---

## 2. 智能事件联动 — 人员出现触发告警

**场景**：推理结果中检测到人员时，通过事件总线发布告警；同时订阅其他应用的确认事件，实现跨应用联动。

**核心 API**：`InferenceClient.subscribe()` + `EventClient.publish()` / `EventClient.on_event()`

**代码** (`app.py`)：

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, EventClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("person-alert")

APP_ID = "person_alert"

# ── 配置 ──────────────────────────────────────────────────────────────
STREAM = "sub"                    # 推理必须用 sub
MODEL = "hailo_yolov8n_384_640"   # 先 list_models() 查设备真实名
FPS = 15
SCORE_THRESHOLD = 0.8        # 置信度阈值
COOLDOWN_SECONDS = 5.0       # 告警冷却时间

# ── 回调：监听确认事件 ─────────────────────────────────────────────────
def on_ack(event):
    ack_source = event.payload.get("source", "unknown")
    logger.info("Received ACK from %s for alert %s", ack_source, event.payload.get("alert_id"))

# ── 主逻辑 ────────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    events = EventClient()

    # 后台监听确认事件
    events.on_event(f"app/{APP_ID}/alert_ack", on_ack)

    last_alert_time = 0.0
    alert_count = 0

    logger.info("Starting person alert app...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        persons = result.get_objects_by_label("person")
        high_conf = [p for p in persons if p.score >= SCORE_THRESHOLD]

        if not high_conf:
            continue

        now = time.time()
        if now - last_alert_time < COOLDOWN_SECONDS:
            continue

        alert_count += 1
        alert_id = f"alert-{alert_count:04d}"

        events.publish(f"app/{APP_ID}/person_detected", {
            "alert_id": alert_id,
            "frame_sequence": frame_seq,
            "person_count": len(high_conf),
            "scores": [round(p.score, 3) for p in high_conf],
            "bboxes": [p.bbox.to_xywh() for p in high_conf],
        }, persistent=True)

        logger.info(
            "Alert %s: %d person(s) at frame %d",
            alert_id, len(high_conf), frame_seq,
        )
        last_alert_time = now

if __name__ == "__main__":
    main()
```

**app.yaml**：

```yaml
apiVersion: v1
kind: Application

metadata:
  id: person_alert
  name: Person Alert
  version: 1.0.0
  description: 检测到人员时发布持久化告警事件

spec:
  image: aipc/person_alert:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                   # 推理订阅必须声明原始流
    inference:
      models: [hailo_yolov8n_384_640]
    events:
      publish: [app/person_alert/*]
      subscribe: [app/person_alert/*]
```

**运行**：

```bash
aipc-cli app install app.yaml person_alert.tar
aipc-cli app start person_alert
aipc-cli app logs person_alert --follow
```

**运行效果**：

应用启动后订阅推理流；检测到置信度 ≥ `SCORE_THRESHOLD` 的人员时发布持久化告警事件，并在 `COOLDOWN_SECONDS` 冷却窗口内不重复告警。日志形如：

```
[person-alert] Alert alert-0001: 2 person(s) at frame 105
[person-alert] Received ACK from dashboard for alert alert-0001
```

第二行说明其他应用（如 dashboard）订阅了 `app/person_alert/alert_ack` 并回执确认，跨应用联动生效。

---

## 3. 日夜自适应控制 — 根据检测结果切换设备

**场景**：检测到人员时自动开启补光灯并切换到日间模式（IR-CUT）；无人时关闭补光灯并切换到夜间模式（IR LED）。通过 `DeviceClient` 实现硬件联动。

**核心 API**：`InferenceClient.subscribe()` + `DeviceClient` 灯光/IR-CUT 控制 + `DeviceClient.get_device_status()`

**代码** (`app.py`)：

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, DeviceClient, DeviceStatus, IrCutMode

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("daynight-control")

# ── 配置 ──────────────────────────────────────────────────────────────
STREAM = "sub"                    # 推理必须用 sub
MODEL = "hailo_yolov8n_384_640"   # 先 list_models() 查设备真实名
FPS = 5
LIGHT_LEVEL_DAY = 80          # 日间补光灯亮度 (0-255)
NO_PERSON_TIMEOUT = 30.0      # 无人超时切换夜间（秒）

# ── 主逻辑 ────────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    device = DeviceClient()

    is_day_mode = False
    last_person_time = 0.0

    # 读取初始状态
    status = device.get_device_status()
    logger.info(
        "Device init: soc_temp=%.1fC, ircut=%s, light=%d",
        status.soc_temp_c, status.ircut_mode.name, status.white_light_level,
    )

    logger.info("Starting day/night adaptive control...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        has_person = result.has_person()

        # 更新最后一次检测到人员的时间
        if has_person:
            last_person_time = now

        # ── 切换到日间模式 ──
        if has_person and not is_day_mode:
            device.set_ircut(IrCutMode.DAY)
            device.set_white_light(LIGHT_LEVEL_DAY)
            device.set_ir_led(False)
            is_day_mode = True
            logger.info("Switched to DAY mode (person detected at frame %d)", frame_seq)

        # ── 超时后切换到夜间模式 ──
        elif not has_person and is_day_mode and (now - last_person_time) >= NO_PERSON_TIMEOUT:
            device.set_ircut(IrCutMode.NIGHT)
            device.set_white_light(0)
            device.set_ir_led(True)
            is_day_mode = False
            logger.info("Switched to NIGHT mode (no person for %.0fs)", NO_PERSON_TIMEOUT)

if __name__ == "__main__":
    main()
```

**app.yaml**：

```yaml
apiVersion: v1
kind: Application

metadata:
  id: daynight_control
  name: Day/Night Adaptive Control
  version: 1.0.0
  description: 根据人员检测结果自动切换日夜模式

spec:
  image: aipc/daynight_control:1.0.0
  resources:
    cpu: "20%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                   # 推理订阅必须声明原始流
    inference:
      models: [hailo_yolov8n_384_640]
    device:
      light: true
      ir_cut: true
```

**运行**：

```bash
aipc-cli app install app.yaml daynight_control.tar
aipc-cli app start daynight_control
aipc-cli app logs daynight_control --follow
```

**运行效果**：

应用启动时读取并打印设备初始状态（SoC 温度、IR-CUT 模式、补光灯亮度）。检测到人员时切换到日间模式（IR-CUT DAY + 补光灯），连续 `NO_PERSON_TIMEOUT` 秒无人时切回夜间模式（IR-CUT NIGHT + IR LED）。日志形如：

```
[daynight-control] Device init: soc_temp=42.3C, ircut=NIGHT, light=0
[daynight-control] Switched to DAY mode (person detected at frame 50)
[daynight-control] Switched to NIGHT mode (no person for 30s)
```

---

## 4. 多码流帧捕获 — 保存推理对应帧

**场景**：当推理结果中检测到特定标签时，通过 `FdMediaClient` 获取对应帧的原始图像并保存到文件。演示推理流与视频流的协同工作。

**核心 API**：`InferenceClient.subscribe()` + `FdMediaClient.get_frame()` + `Frame.save()`

**代码** (`app.py`)：

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, FdMediaClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("frame-capture")

# ── 配置 ──────────────────────────────────────────────────────────────
STREAM = "sub"                    # 推理与 get_frame() 都用该原始流
MODEL = "hailo_yolov8n_384_640"   # 先 list_models() 查设备真实名
FPS = 10
TARGET_LABELS = {"person", "car"}    # 触发保存的目标标签
CAPTURE_DIR = "/app/data/captures"   # 保存目录（需在 app.yaml 中挂载卷）
CAPTURE_COOLDOWN = 10.0              # 同标签最小保存间隔（秒）

# ── 主逻辑 ────────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    media = FdMediaClient()

    last_capture = {}     # label -> timestamp
    capture_count = 0

    logger.info("Starting frame capture for labels: %s", TARGET_LABELS)
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        matched_labels = {obj.label for obj in result.objects if obj.label in TARGET_LABELS}

        for label in matched_labels:
            # 冷却检查
            if now - last_capture.get(label, 0) < CAPTURE_COOLDOWN:
                continue

            # 获取当前帧
            frame = media.get_frame(STREAM, timeout_ms=2000)
            if frame is None:
                logger.warning("Failed to get frame for seq=%d", frame_seq)
                continue

            # 保存到文件
            capture_count += 1
            filename = f"{CAPTURE_DIR}/{label}_{frame_seq}_{int(now)}.png"
            frame.save(filename)

            logger.info(
                "Captured %s: seq=%d, %dx%d %s -> %s",
                label, frame_seq, frame.width, frame.height, frame.format, filename,
            )
            last_capture[label] = now

if __name__ == "__main__":
    main()
```

**app.yaml**：

```yaml
apiVersion: v1
kind: Application

metadata:
  id: frame_capture
  name: Frame Capture
  version: 1.0.0
  description: 检测到特定目标时保存对应帧图像

spec:
  image: aipc/frame_capture:1.0.0
  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    video:
      - sub.raw                       # FdMediaClient.get_frame() 访问原始流
    inference:
      models: [hailo_yolov8n_384_640]

  volumes:
    - host: /opt/aipc/data/frame_capture
      container: /app/data/captures
      readonly: false
```

**运行**：

```bash
aipc-cli app install app.yaml frame_capture.tar
aipc-cli app start frame_capture
aipc-cli app logs frame_capture --follow
```

**运行效果**：

应用订阅推理流，当结果中出现 `TARGET_LABELS` 中的标签时，用 `FdMediaClient.get_frame()` 取对应原始帧并保存为 PNG 到 `CAPTURE_DIR`（须在 `app.yaml` 挂载卷）。同一标签在 `CAPTURE_COOLDOWN` 秒内只保存一次。日志形如：

```
[frame-capture] Captured person: seq=70, 1920x1080 RGB -> /app/data/captures/person_70_<ts>.png
```

文件名含标签、帧序号与时间戳，便于事后排查。

---

## 5. 运行与调试

### 5.1 通用部署流程

所有 mini-app 的构建与部署流程与教程一致：用仓库自带的 `build.sh` 一键完成「复制 SDK → ARM64 buildx → save → 打包 `.aipc`」，再按 Web 控制台 / aipc-cli / HTTP 三种方式之一部署到设备。完整步骤见 [Hello World §3 构建镜像](../1-hello-world.md#3-构建镜像) 与 [§4 部署到设备](../1-hello-world.md#4-部署到设备)；构建部署报错见 [故障排查](./troubleshooting.md)。

### 5.2 日志、常见问题与调试

- **日志查看与启动验收**：见 [Hello World §5 启动与验收](../1-hello-world.md#5-启动与验收)；
- **常见报错排查**（推理失败、权限拒绝、OOM 等）：见 [故障排查](./troubleshooting.md)；
- **调试环境变量**（`DEBUG`、`LOG_LEVEL`）：见 [应用参考 §7 环境变量参考](./1-app-reference.md#7-环境变量参考)。

---

## 6. 相关文档

- [应用参考](./1-app-reference.md) -- 项目创建、app.yaml 配置、构建部署完整流程
- [SDK 参考](./2-sdk-reference.md) -- SDK 全部模块的 API 详细参考
- [平台架构](../../../3-software-guide/0-system-architecture.md) -- NE503 软件平台整体架构与服务拓扑
