---
id: sdk-workflow
title: SDK 工作流
sidebar_position: 0
description: NE503 Python SDK（hailo_ipc_sdk）的工作流总览——它是什么、源码在哪、如何嵌入容器、以及客户端调用范式。读完即具备跑通具体应用案例的 SDK 基础。
keywords: [NE503, Python SDK, hailo_ipc_sdk, SDK 嵌入, 容器应用, InferenceClient]
tags: [应用开发, NE503, SDK, 入门]
---

# SDK 工作流

本篇只讲一件事：**NE503 Python SDK（`hailo_ipc_sdk`）怎么用起来**——它是什么、源码在哪、怎么嵌进你的容器镜像、以及客户端的调用范式。掌握这些后，再看 [Hello World](./1-hello-world.md) 跑部署闭环、看 [Person Detection](./2-person-detection.md) 跑真实 AI 应用，就只需关注各自业务细节，不用再回头查 SDK 怎么接。

:::info 阅读顺序
**SDK 工作流（本篇）→ [Hello World](./1-hello-world.md)（部署闭环，不用 SDK）→ [Person Detection](./2-person-detection.md)（真实 AI 应用，用 SDK）**
:::

## 1. SDK 是什么

`hailo_ipc_sdk` 是 NE503 平台对外暴露能力的 Python SDK，运行在**应用容器内**，通过 Unix Socket 与平台各后台服务通信。应用代码不直接碰硬件或推理引擎，而是调用 SDK 客户端，由 SDK 转发到对应服务。下表是跑 AI 推理应用最常用的四个核心客户端：

| 客户端 | 职责 | 典型调用 |
|:---|:---|:---|
| `InferenceClient` | 订阅 AI 推理结果（平台逐帧跑模型，把结果推给应用） | `subscribe(stream=, model=, fps=)` |
| `FdMediaClient` | 视频帧获取（取推理对应帧的原始图像） | `get_frame(stream)` |
| `EventClient` | 事件总线发布/订阅（跨应用、跨模块联动） | `publish(topic, payload)` / `on_event(topic, cb)` |
| `DeviceClient` | 硬件控制与状态（补光灯、IR-CUT、PTZ、温度等） | `set_white_light(n)` / `get_device_status()` |

除上述核心客户端外，SDK 还覆盖：`AppClient`（应用/容器管理）、`OverlayClient`（把检测框叠加到 RTSP/Web 画面）、`EncodedStreamClient`（H.264/H.265 编码流）、音频流与摄像头 ISP/编码控制等；`Config` 则是读取 `APP_ID`、各服务 socket 路径与调试开关的工具类（如 `Config.get_app_id()`、`Config.is_debug()`）。完整类与方法见 [SDK 参考](./reference/2-sdk-reference.md)。

:::note 不发布到 PyPI
SDK **不在 PyPI 上**，源码在 `ne503` 源码仓库的 `sdk/python/hailo_ipc_sdk/` 目录内，必须随应用镜像一起带进设备——设备容器运行时**没有外网 pip**，不能指望运行时再装。
:::

## 2. SDK 从哪来、怎么嵌进容器

:::info 先获取 ne503 源码仓库
SDK 不在 PyPI，源码在 **ne503 源码仓库**的 `sdk/python/hailo_ipc_sdk/`；本系列所有示例应用（hello-world、person-detection 等）也都在该仓库的 `apps/` 下。开始前先 clone：

```bash
git clone https://github.com/camthink-ai/ne503.git
cd ne503
```

与本系列教程相关的目录：

```
ne503/
├── sdk/python/
│   ├── hailo_ipc_sdk/   # Python SDK 源码（含 protobuf 桩，开箱即用）
│   ├── setup.py         # SDK 安装脚本（build.sh 构建时会一并复制进应用镜像）
│   └── README.md
└── apps/
    ├── hello-world/       # 最小闭环示例（不用 SDK）
    ├── person-detection/  # 人形检测 AI 应用（用 SDK）
    ├── template/          # 应用脚手架（新建应用时 cp -r 复制）
    └── ...                # object-detection / people-counting / parking-lot 等 10+ 示例
```
:::

把 SDK 装进镜像有三条路，按你的项目结构选其一。

**方式 A：`build.sh` 自动复制（推荐，仓库示例应用都用这种）**

仓库里每个示例应用目录下的 `build.sh` 会自动把 `sdk/python/hailo_ipc_sdk/` 复制进应用目录，再由 `docker buildx` 打进镜像。你只需：

```bash
cd apps/<your-app>
bash build.sh arm64     # 自动：复制 SDK → buildx → save，产物 image.tar + app.yaml
```

无需在 Dockerfile 里手动 `pip install`，也不需要联网。

**方式 B：自定义项目里手动 `COPY`**

如果你的应用不在仓库示例结构内（自建项目），在 Dockerfile 里把 SDK 目录拷进去并本地安装：

```dockerfile
COPY hailo_ipc_sdk /app/hailo_ipc_sdk
RUN pip install --no-cache-dir /app/hailo_ipc_sdk
```

**方式 C：预先打成 wheel 再 `pip install`（最干净，适合分发与复用）**

先把 SDK 打成一个 wheel 文件，再像普通依赖一样装进镜像——镜像里只带产物、不带整个源码树，且同一个 whl 可跨应用复用。仓库 `apps/model-showcase` 就是这种集成方式。

1. 在开发机生成 wheel（一次性，产物名随 `setup.py` 的版本号变化）：

```bash
cd sdk/python
pip wheel . --no-deps -w dist/
# 产出 dist/hailo_ipc_sdk-0.2.1-py3-none-any.whl
```

SDK 是纯 Python，产出的是通用 wheel（`py3-none-any`），与设备 ARM64 架构无关。

2. 把 whl 拷进应用目录，Dockerfile 里直接装：

```dockerfile
COPY hailo_ipc_sdk-0.2.1-py3-none-any.whl /tmp/
RUN pip install --no-cache-dir /tmp/hailo_ipc_sdk-0.2.1-py3-none-any.whl && rm /tmp/hailo_ipc_sdk-0.2.1-py3-none-any.whl
```

关键是 **SDK 必须随镜像带入**，不能依赖运行时联网安装。

:::note Protobuf 桩已自带
SDK 已随仓库附带生成好的 protobuf 桩（`sdk/python/hailo_ipc_sdk/proto/*_pb2.py`），构建时随 SDK 一起打进镜像，**无需手动生成**，`import hailo_ipc_sdk` 开箱即用。
:::

## 3. 调用范式

各客户端的实例化与调用模式高度一致——实例化时无需传参（SDK 自动从平台注入的环境变量读取 socket 路径），然后按"订阅/发布/控制"三类模式调用：

```python
from hailo_ipc_sdk import InferenceClient, EventClient, DeviceClient

infer  = InferenceClient()
events = EventClient()
device = DeviceClient()

# 1. 订阅式迭代器：逐帧拿推理结果（平台在后台跑模型）
#    stream 必须填发布原始 NV12 帧的流（sub 或 third）；
#    main 只发编码 H264（RTSP 用），subscribe("main") 会永久挂起
for frame_seq, result in infer.subscribe(stream="sub", model="<模型名>", fps=10):
    persons = [o for o in result.objects if o.label == "person"]

# 2. 事件发布/订阅：跨应用联动
events.publish("app/<app-id>/detection", {"count": len(persons)})
events.on_event("system/*", lambda ev: ...)

# 3. 设备控制：联动硬件
device.set_white_light(50)
status = device.get_device_status()
```

三个要点：

1. **名字不能写死**——`stream`、`model` 必须用设备上的真实值，先 `infer.list_models()` / `FdMediaClient().list_streams()` 查出来再填，否则会 `StatusCode.NOT_FOUND`；
2. **订阅是阻塞迭代器**——`for ... in subscribe(...)` 会持续产出帧，应用主循环就架在它上面；
3. **优雅退出**——监听 `SIGTERM`，平台停止应用时会发，收到后跳出循环、关闭客户端。

完整的真实例子（含模型/流发现、权限声明、事件发布、灯控联动）见 [Person Detection 教程](./2-person-detection.md)。

## 4. 权限即契约

SDK 能调什么，**由 `app.yaml` 的 `permissions` 决定**，不是代码里写啥就能调啥。平台按清单做沙箱隔离：未声明的视频流、模型、事件主题或设备控制，SDK 调用时会被平台直接拒绝。所以写 SDK 应用时，`app.py` 里的调用必须与 `app.yaml` 声明一一对应。

各权限字段的含义见 [Person Detection 教程的权限清单字段表](./2-person-detection.md#22-权限清单-appyaml)。

## 5. 下一步

- [Hello World](./1-hello-world.md) —— 不用 SDK，先跑通"构建→部署→启动→验收"的完整闭环；
- [Person Detection](./2-person-detection.md) —— 用 SDK 的真实 AI 应用，含完整代码与设备实测；
- SDK 各客户端的 API 逐条说明见 [SDK 参考](./reference/2-sdk-reference.md)；
- 构建部署报错看 [应用故障排查](./reference/troubleshooting.md)。
