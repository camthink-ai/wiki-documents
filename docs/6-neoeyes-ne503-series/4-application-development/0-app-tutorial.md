---
description: NE503 容器应用从零到一开发教程，手把手教你创建、构建、部署和调试第一个 AI 推理应用。
keywords: [NE503, 应用教程, 容器应用, AI 推理, 入门, 端到端]
tags: [应用开发, NE503, 教程, 入门]
---

# 应用开发教程

本教程带你从零开始，在 NE503 平台上创建一个完整的人形检测应用。你将学会：编写推理代码、配置权限清单、打包容器镜像、部署到设备并验证结果。完成后，你将拥有一个可复用的开发模板，可以快速迭代自己的 AI 应用。

## 1 前置条件

开始之前，请确认以下条件已满足：

| 条件 | 验证方法 |
|:---|:---|
| NE503 设备已联网并运行 | 浏览器访问 `http://<设备IP>:8080`，能看到 Web 管理界面 |
| 开发机已安装 Docker | 终端执行 `docker --version`，版本 >= 20.10 |
| 开发机已安装 scp/ssh | 终端执行 `which scp`，有输出即可 |
| AI 模型已加载到设备 | Web 管理界面 > AI 模型页面，至少有一个模型处于"已加载"状态 |
| 摄像头视频流正常 | Web 管理界面 > 视频预览，能看到实时画面 |

如果开发环境尚未搭建，请先完成[开发环境](../3-platform-development/1-development-environment.md)的配置。

## 2 创建项目

在你的开发机上创建项目目录和基础文件：

```bash
# 创建项目目录
mkdir my-person-detector && cd my-person-detector

# 创建目录结构
mkdir -p sdk
```

最终项目结构如下：

```
my-person-detector/
├── app.py            # 应用主逻辑
├── app.yaml          # 应用清单（权限、资源、配置）
├── Dockerfile        # 容器构建定义
└── requirements.txt  # Python 依赖
```

### 2.1 创建 requirements.txt

```bash
cat > requirements.txt << 'EOF'
numpy>=1.21.0
EOF
```

SDK 会在 Dockerfile 中从本地目录安装，不写在 `requirements.txt` 里。

### 2.2 获取 SDK

从 NE503 源码仓库复制 Python SDK 到项目中：

```bash
# 假设 NE503 源码在 ~/ne503/
cp -r ~/ne503/sdk/python/hailo_ipc_sdk ./sdk/
cp ~/ne503/sdk/python/setup.py ./sdk/
cp ~/ne503/sdk/python/README.md ./sdk/
```

> 如果没有源码仓库，可以从已部署设备的 `/opt/aipc/sdk/python/` 目录获取，或联系技术支持获取 SDK 分发包。

## 3 编写推理代码

创建 `app.py`，实现实时人形检测。代码分为三个部分：初始化 SDK 客户端、订阅推理结果、处理检测结果。

```bash
cat > app.py << 'PYEOF'
#!/usr/bin/env python3
"""
人形检测应用 - NE503 平台入门教程
功能：订阅摄像头视频流，执行 AI 人形检测，发布检测事件
"""

import os
import sys
import time
import signal
import logging
from datetime import datetime

from hailo_ipc_sdk import (
    InferenceClient,
    EventClient,
    Config,
    InferenceResult,
)

# ── 日志配置 ────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, os.environ.get("LOG_LEVEL", "INFO")),
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class PersonDetector:
    """人形检测应用主类"""

    def __init__(self):
        self.running = True
        self.app_id = Config.get_app_id()
        self.threshold = float(os.environ.get("DETECTION_THRESHOLD", "0.5"))
        self.frame_count = 0

        # 注册信号处理，支持优雅退出
        signal.signal(signal.SIGINT, self._on_signal)
        signal.signal(signal.SIGTERM, self._on_signal)

        logger.info(f"应用启动: id={self.app_id}, 阈值={self.threshold}")

    def _on_signal(self, signum, frame):
        logger.info(f"收到信号 {signum}，正在关闭...")
        self.running = False

    def run(self) -> int:
        """主循环：订阅推理流并处理结果"""
        inference = InferenceClient()
        events = EventClient()

        try:
            # 检查可用模型
            models = inference.list_models()
            model_ids = [m.model_id for m in models]
            logger.info(f"可用模型: {model_ids}")

            # 订阅视频流推理结果
            # stream="third" 对应主摄像头原始流
            # model="person-detection" 对应人形检测模型
            logger.info("正在订阅推理流...")
            for seq, result in inference.subscribe(
                stream="third",
                model="person-detection",
                fps=10,
            ):
                if not self.running:
                    break
                self._handle_result(seq, result, events)

        except KeyboardInterrupt:
            logger.info("用户中断")
        except Exception as e:
            logger.error(f"运行错误: {e}")
            return 1
        finally:
            inference.close()
            events.close()
            logger.info(f"应用退出，共处理 {self.frame_count} 帧")

        return 0

    def _handle_result(
        self, seq: int, result: InferenceResult, events: EventClient
    ):
        """处理单帧推理结果"""
        self.frame_count += 1

        # 过滤低于阈值的人形检测结果
        persons = [
            obj
            for obj in result.objects
            if obj.label == "person" and obj.score >= self.threshold
        ]

        if persons:
            logger.info(f"[帧 {seq}] 检测到 {len(persons)} 个人")
            for i, p in enumerate(persons):
                logger.debug(
                    f"  #{i+1}: 置信度={p.score:.2f}, "
                    f"位置=({p.bbox.x:.2f}, {p.bbox.y:.2f}), "
                    f"大小=({p.bbox.width:.2f}x{p.bbox.height:.2f})"
                )

            # 发布检测事件
            self._publish_event(seq, result, persons, events)

        # 每 100 帧打印一次统计
        if self.frame_count % 100 == 0:
            logger.info(f"已处理 {self.frame_count} 帧")

    def _publish_event(
        self, seq: int, result: InferenceResult, persons: list, events: EventClient
    ):
        """向事件总线发布检测结果"""
        try:
            events.publish(
                f"app/{self.app_id}/detection",
                {
                    "frame_sequence": seq,
                    "timestamp": datetime.now().isoformat(),
                    "person_count": len(persons),
                    "objects": [
                        {
                            "label": p.label,
                            "confidence": round(p.score, 3),
                            "bbox": {
                                "x": round(p.bbox.x, 3),
                                "y": round(p.bbox.y, 3),
                                "width": round(p.bbox.width, 3),
                                "height": round(p.bbox.height, 3),
                            },
                        }
                        for p in persons
                    ],
                },
            )
        except Exception as e:
            logger.warning(f"事件发布失败: {e}")


if __name__ == "__main__":
    sys.exit(PersonDetector().run())
PYEOF
```

### 3.1 代码要点解析

**InferenceClient.subscribe** 是核心方法，签名如下：

```python
def subscribe(
    stream: str,       # 视频流 ID，如 "third"、"cam0_main"
    model: str,        # 模型 ID，如 "person-detection"
    fps: int = 10,     # 推理帧率上限
) -> Iterator[Tuple[int, InferenceResult]]
```

每次迭代返回一个 `(frame_sequence, InferenceResult)` 元组。`InferenceResult` 包含：

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `objects` | `List[DetectedObject]` | 检测到的目标列表 |
| `classifications` | `List[Classification]` | 分类结果 |
| `landmarks` | `List[LandmarkSet]` | 关键点（如人脸关键点） |
| `masks` | `List[SegmentationMask]` | 分割掩码 |
| `infer_time_us` | `int` | 推理耗时（微秒） |

每个 `DetectedObject` 包含 `label`（类别）、`score`（置信度）、`bbox`（边界框）和可选的 `track_id`（追踪 ID）。

## 4 添加事件驱动逻辑

现在扩展应用，让它既能发布事件，也能响应其他应用的事件。

### 4.1 事件发布

你已经在上面的代码中看到了 `events.publish()` 的基本用法。它接受主题（支持通配符）和 JSON 兼容的字典载荷：

```python
events.publish(
    "app/my_detector/alert",      # 主题
    {"type": "person_detected"},  # 载荷（任意 dict）
)
```

### 4.2 事件订阅

添加一个事件监听器，当收到系统级配置变更事件时，动态调整检测阈值。在 `app.py` 的 `PersonDetector.run()` 方法中，在订阅推理流之前加入：

```python
# 在 run() 方法中，inference.subscribe() 之前添加：
import threading

def on_config_event(event):
    """收到配置变更事件时更新阈值"""
    new_threshold = event.payload.get("detection_threshold")
    if new_threshold is not None:
        self.threshold = float(new_threshold)
        logger.info(f"阈值已更新为 {self.threshold}")

# 启动事件监听线程
events.on_event(
    "app/my_detector/config",
    callback=on_config_event,
)
logger.info("事件监听已启动")
```

`on_event` 返回一个后台线程，自动接收匹配的事件并调用回调函数。回调函数接收 `Event` 对象，包含 `topic`、`payload`、`source` 等字段。

### 4.3 事件主题规范

建议使用以下命名规范：

```
app/<应用ID>/<动作>      # 应用级事件
alerts/<类型>            # 告警事件
system/<事件>            # 系统事件
model/<模型ID>/状态      # 模型状态事件
```

主题支持通配符订阅：`app/*` 匹配一级，`app/#` 匹配多级。

## 5 容器打包

### 5.1 创建 app.yaml

`app.yaml` 是应用的清单文件，定义了权限、资源限制和运行配置：

```bash
cat > app.yaml << 'EOF'
apiVersion: v1
kind: Application

metadata:
  id: my-person-detector
  name: My Person Detector
  version: 1.0.0
  description: 实时人形检测应用 - 入门教程示例
  author: Developer

spec:
  image: aipc/my-person-detector:1.0.0

  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    # AI 推理权限：声明需要使用的模型
    inference:
      models:
        - person-detection
      max_qps: 30
      max_concurrent: 2

    # 事件总线权限：声明可发布/订阅的主题
    events:
      publish:
        - app/my-person-detector/*
        - alerts/detection
      subscribe:
        - app/my-person-detector/config
        - system/*

    # 网络模式：isolated 表示仅允许平台内部通信
    network:
      mode: isolated

  env:
    - name: DETECTION_THRESHOLD
      value: "0.5"
    - name: LOG_LEVEL
      value: "INFO"

  # 数据持久化卷
  volumes:
    - host: /opt/aipc/data/my-person-detector
      container: /app/data
      readonly: false

  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3

  healthcheck:
    enabled: true
    interval: 30s
    timeout: 5s
    retries: 3
EOF
```

**权限配置是应用安全的核心**。只有显式声明的权限才会被授予：

| 权限类别 | 关键字段 | 说明 |
|:---|:---|:---|
| `inference` | `models` | 允许使用的模型 ID 列表 |
| `events` | `publish` / `subscribe` | 可发布/订阅的事件主题（支持通配符） |
| `video` | 流 ID 列表 | 可访问的视频流（本教程不需要，推理流由平台自动提供） |
| `device` | `light`, `ptz` 等 | 设备控制权限（本教程不需要） |
| `network` | `mode` | `isolated`（默认）或 `host` |

### 5.2 创建 Dockerfile

```bash
cat > Dockerfile << 'EOF'
# NE503 容器应用 - 人形检测
# 目标架构：linux/arm64（Hailo 平台）

FROM python:3.11-slim-bookworm

# 系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl procps libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 安装 SDK（本地包）
COPY sdk/hailo_ipc_sdk/ /app/hailo_ipc_sdk/
COPY sdk/setup.py sdk/README.md /app/
RUN pip install --no-cache-dir -e .

# 安装应用依赖
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app.py /app/

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 平台会自动注入以下环境变量：
# APP_ID, AI_RUNTIME_ENDPOINT, EVENT_BUS_ENDPOINT 等
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python3 -c "from hailo_ipc_sdk import Config; print(Config.get_app_id())" || exit 1

CMD ["python3", "/app/app.py"]
EOF
```

### 5.3 关键说明

**SDK 安装方式**：SDK 以本地包形式复制到容器中安装。`pip install -e .` 会以可编辑模式安装，方便调试。`setup.py` 声明了 SDK 的依赖（`grpcio`、`numpy`、`protobuf` 等），会自动安装。

**环境变量注入**：平台在容器启动时自动注入以下环境变量，你的代码无需手动配置：

| 变量 | 默认值 | 说明 |
|:---|:---|:---|
| `APP_ID` | `unknown` | 来自 `app.yaml` 的 `metadata.id` |
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` | 推理服务端点 |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` | 事件总线端点 |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` | 设备控制端点 |

**`app.yaml` 中 `env` 字段定义的变量**（如 `DETECTION_THRESHOLD`）会作为额外环境变量注入容器。

## 6 部署到设备

### 6.1 构建 Docker 镜像

NE503 设备基于 ARM64 架构。如果开发机是 x86_64，需要使用 `docker buildx` 进行交叉构建：

```bash
# ARM64 交叉构建（推荐）
docker buildx build --platform linux/arm64 --load \
    -t aipc/my-person-detector:1.0.0 .

# 如果开发机本身就是 ARM64（如 Apple Silicon Mac）
docker build -t aipc/my-person-detector:1.0.0 .
```

### 6.2 打包为 .aipc 安装包

NE503 使用 `.aipc` 格式的安装包，本质上是 `app.yaml` + `image.tar` 的 zip 压缩包：

```bash
# 导出镜像为 tar 文件
docker save aipc/my-person-detector:1.0.0 -o image.tar

# 打包为 .aipc 文件
zip my-person-detector.aipc app.yaml image.tar

# 清理临时文件
rm image.tar

# 查看包大小
du -h my-person-detector.aipc
```

### 6.3 安装到设备

有两种安装方式：

**方式一：通过 Web 管理界面（推荐新手使用）**

1. 浏览器打开 `http://<设备IP>:8080`
2. 进入 **应用管理** 页面
3. 点击 **安装应用** 按钮
4. 上传 `my-person-detector.aipc` 文件
5. 等待安装完成

**方式二：通过命令行**

```bash
# 上传安装包到设备
scp my-person-detector.aipc root@<设备IP>:/tmp/

# SSH 登录设备，执行安装
ssh root@<设备IP> "cd /tmp && aipc-cli app install my-person-detector.aipc"

# 启动应用
ssh root@<设备IP> "aipc-cli app start my-person-detector"
```

**方式三：通过 REST API**

```bash
# 直接调用平台 API 安装
curl -X POST "http://<设备IP>:8080/api/v1/apps" \
    -F "app=@my-person-detector.aipc"

# 启动应用
curl -X POST "http://<设备IP>:8080/api/v1/apps/my-person-detector/start"
```

## 7 验证和调试

### 7.1 查看应用状态

```bash
# 列出所有应用
curl -s "http://<设备IP>:8080/api/v1/apps" | python3 -m json.tool

# 查看特定应用状态
curl -s "http://<设备IP>:8080/api/v1/apps/my-person-detector" | python3 -m json.tool
```

应用状态说明：

| 状态 | 含义 |
|:---|:---|
| `installed` | 已安装，未启动 |
| `running` | 正在运行 |
| `stopped` | 已停止 |
| `error` | 运行出错 |

### 7.2 查看应用日志

```bash
# 方式一：通过 API（获取最近 100 行）
curl -s "http://<设备IP>:8080/api/v1/apps/my-person-detector/logs?max_lines=100"

# 方式二：通过 aipc-cli（持续跟踪）
ssh root@<设备IP> "aipc-cli app logs my-person-detector --follow"
```

正常运行的日志应类似：

```
[2026-06-08 10:00:01] [INFO] 应用启动: id=my-person-detector, 阈值=0.5
[2026-06-08 10:00:01] [INFO] 可用模型: ['person-detection', 'vehicle-detection']
[2026-06-08 10:00:01] [INFO] 正在订阅推理流...
[2026-06-08 10:00:02] [INFO] [帧 1] 检测到 1 个人
[2026-06-08 10:00:12] [INFO] [帧 100] 检测到 2 个人
[2026-06-08 10:00:12] [INFO] 已处理 100 帧
```

### 7.3 验证事件输出

使用另一个客户端订阅事件，确认事件发布正常：

```python
# 在开发机上运行（需要能访问设备的事件总线）
from hailo_ipc_sdk import EventClient

events = EventClient(endpoint="unix:///run/aipc/event-bus.sock")
for event in events.subscribe("app/my-person-detector/*"):
    print(f"事件: {event.topic} -> {event.payload}")
```

### 7.4 常见错误排查

| 错误现象 | 可能原因 | 解决方法 |
|:---|:---|:---|
| `Available models: []` | AI 模型未加载 | Web 界面检查模型状态，确认模型已加载 |
| `Running in SIMULATION mode` | 视频流不可用 | 检查 `camera-daemon` 是否运行：`systemctl status camera-daemon` |
| `Permission denied` 连接失败 | 权限未在 `app.yaml` 中声明 | 检查 `permissions` 配置是否包含所需模型和事件主题 |
| 容器立即退出 | Python 代码报错 | 查看日志：`aipc-cli app logs my-person-detector` |
| 镜像拉取失败 | 架构不匹配 | 确保使用 `--platform linux/arm64` 构建 |
| `No inference results received` | 视频流 ID 不正确 | 常用流 ID：`third`（主流）、`cam0_main`、`cam0_sub` |

### 7.5 停止和卸载

```bash
# 停止应用
curl -X POST "http://<设备IP>:8080/api/v1/apps/my-person-detector/stop"

# 卸载应用（保留日志）
curl -X DELETE "http://<设备IP>:8080/api/v1/apps/my-person-detector"

# 卸载应用（不保留日志）
curl -X DELETE "http://<设备IP>:8080/api/v1/apps/my-person-detector?keep_logs=false"
```

## 8 进阶：自定义模型与设备控制

### 8.1 注册自定义模型

如果你的应用需要使用自定义 `.hef` 模型文件，可以在应用启动时动态注册：

```python
from hailo_ipc_sdk import InferenceClient, Config

inference = InferenceClient()

# 注册模型（路径相对于容器内的挂载点）
model_id = inference.register_model(
    model_path="/app/models/my_custom_model.hef",
    model_id="my-custom-model",
)

print(f"模型已注册: {model_id}")

# 使用自定义模型进行推理
for seq, result in inference.subscribe(
    stream="third",
    model=model_id,
    fps=5,
):
    print(f"检测到 {len(result.objects)} 个目标")
```

对应的 `app.yaml` 需要添加推理注册权限和卷挂载：

```yaml
spec:
  permissions:
    inference:
      models:
        - my-custom-model
      allow_register_model: true   # 允许动态注册模型
  volumes:
    - host: /opt/aipc/models/my_custom_model.hef
      container: /app/models/my_custom_model.hef
      readonly: true
```

### 8.2 设备控制

当检测到目标时联动设备硬件（如开启补光灯）：

```python
from hailo_ipc_sdk import DeviceClient

device = DeviceClient()

# 检测到人时开启补光灯
device.set_white_light(level=80)   # 亮度 0-100

# 切换红外滤光片到白天模式
from hailo_ipc_sdk import IrCutMode
device.set_ircut(IrCutMode.DAY)

# 云台控制（需要在 app.yaml 中声明 ptz: true）
device.pan_left(speed=50)
device.tilt_up(speed=50)
device.ptz_stop()
```

需要在 `app.yaml` 中声明设备权限：

```yaml
spec:
  permissions:
    device:
      light: true
      ir_cut: true
      ptz: false    # 按需开启
      lens: false
```

### 8.3 单帧推理

除了流式推理，你也可以手动获取单帧并进行推理：

```python
from hailo_ipc_sdk import FdMediaClient

media = FdMediaClient()

# 获取单帧
frame = media.get_frame("cam0_main", timeout_ms=5000)
if frame is not None:
    rgb_image = frame.to_rgb()
    result = inference.infer(rgb_image, model_id="person-detection")
    print(f"检测到 {len(result.objects)} 个目标")
```

需要在 `app.yaml` 中声明视频流权限：

```yaml
spec:
  permissions:
    video:
      - cam0_main.raw    # 原始视频流（零拷贝 SHM）
```

## 9 下一步

恭喜你完成了第一个 NE503 容器应用！接下来可以探索更多高级功能：

- **[应用开发指南](./1-app-reference.md)** — app.yaml 完整字段、多容器模式、插件系统
- **[SDK API 参考](./2-sdk-reference.md)** — 全部 8 个 SDK 模块的详细 API 文档
- **[SDK 示例代码](./3-sdk-examples.md)** — 更多完整应用示例（人数统计、目标跟踪等）
- **[视频流集成](../5-system-integration/0-video-integration.md)** — 视频流的获取、处理与 RTSP 推流
