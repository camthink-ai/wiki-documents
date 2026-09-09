---
description: 基于 NG4500（NVIDIA Jetson Orin）与 deepstream 扩展的多路 RTSP 视频分析方案——通过 NVIDIA DeepStream 7.1 在单台 NG4500 上对 2–32 路 RTSP 相机做硬件加速推理与跟踪，产出越线、区域入侵、计数等业务事件并回推标注视频流到 NeoMind。NeoMind 运行在 Mac/PC，DeepStream sidecar 运行在 NG4500 上，经远程桥接通信。
keywords: [NeoMind, DeepStream, NG4500, Jetson Orin, RTSP, 多路视频分析, 越线, 区域入侵, 计数]
tags: [NeoMind, DeepStream, NG4500, 视频分析]
sidebar_label: "DeepStream Video Analytics"
---

# DeepStream Multi-Stream Video Analytics on NG4500

> NeoEdge NG4500（Jetson Orin）上的多路 RTSP 视频分析——单台可同时处理 2–32 路相机，硬解码 + 推理 + 跟踪，产出业务事件并重发布标注 RTSP 流。

---

## 1. 方案概述

deepstream 扩展封装了 **NVIDIA DeepStream 7.1 SDK**（基于 GStreamer 的视频分析流水线），在 Jetson 上提供多路 RTSP 推理。典型部署形态：**NeoMind 在 Mac/PC，sidecar 在 NG4500**，通过 TCP 远程桥接。

**核心能力**：

- **多路 RTSP**：单台 Jetson Orin NX 8G 可并发 2–32 路 720p/1080p。
- **硬件流水线**：NVDEC → TensorRT → 跟踪（NvDCF/NvSORT）→ nvdsanalytics → OSD → NVENC，零拷贝。
- **业务分析**：越线、区域入侵、双向计数、停留时长。
- **标注输出**：带检测框 / 跟踪 ID / 分析叠加的 RTSP 流，浏览器可看的 MJPEG 缩略图与 JPEG 截图。
- **事件驱动**：Detection / LineCross / ROIIntrusion / AnalyticsSnapshot 推送到 NeoMind EventBus，可触发仪表板与自动化。

**数据流向**：

```mermaid
flowchart LR
    CAM["RTSP 相机 ×2–32"] --> JETSON["NG4500 (Jetson Orin)<br/>DeepStream sidecar"]
    JETSON -->|"标注 RTSP 输出<br/>rtsp://host:8554/ds/ID"| VIEW["预览 / 录像"]
    JETSON -->|"业务事件<br/>越线/入侵/计数"| NM["NeoMind<br/>仪表板 + 自动化"]
    NM -.->|"TCP 桥接 :9556<br/>add_stream / 配置"| JETSON
```

**效果演示**（多路 RTSP 实时推理 + 跟踪 + 业务事件叠加）：

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/video/deepstream-demo.mp4" type="video/mp4" />
</video>

---

## 2. 物料清单（BOM）

| 物料 | 规格 | 用途 | 必需 |
|------|------|------|------|
| **NeoMind 平台** | v0.9.0+ | 运行在 Mac/PC，托管扩展 | ✅ |
| **deepstream 扩展** | v2.8.0+ | 远程桥接 + 事件路由 | ✅ |
| **NG4500** | Jetson Orin NX/Nano/AGX，JetPack 6.x，DeepStream 7.1 | 跑 DeepStream sidecar | ✅ |
| **RTSP 相机** | 2–32 路 720p/1080p | 视频源 | ✅ |
| **网络** | NeoMind 与 NG4500 可互通（TCP 9556 等） | 远程桥接 | ✅ |

---

## 3. 部署 DeepStream 运行环境（NG4500）

deepstream 扩展的 Python sidecar 只能在 Jetson 上运行（DeepStream SDK 仅 Jetson 可用）。下面在 NG4500 上从零部署一次，分六步。DeepStream SDK 本体的安装细节见 [NG4500 DeepStream 指南](../../1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/3-deepstream.md)，扩展自带最全步骤见 [INSTALL.md](https://github.com/camthink-ai/NeoMind-Extensions/tree/main/extensions/deepstream/INSTALL.md)。

> 全程在 NG4500 上以普通用户操作；Docker 命令依赖 `nvidia-container-runtime`（JetPack 自带）。

### 3.1 核对系统环境

| 项目 | 要求 | 核对命令 |
|------|------|----------|
| JetPack / L4T | R36.4.3（JetPack 6.1 GA）| `cat /etc/nv_tegra_release` |
| 内核 | `5.15.x-tegra` | `uname -r` |
| 可用磁盘 | ≥ 20 GB | `df -h /var/lib` |
| 内存 | ≥ 8 GB（验证于 Orin NX 8GB）| `free -h` |

### 3.2 安装 DeepStream SDK 7.1

推荐用官方 Debian 包（最省事）。先装依赖：

```bash
sudo apt update
sudo apt install -y libssl1.1 libgstreamer1.0-0 gstreamer1.0-tools \
  gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav libgstrtspserver-1.0-0 libjansson4 libyaml-cpp-dev
```

从 [NGC](https://catalog.ngc.nvidia.com/orgs/nvidia/resources/deepstream) 下载 `deepstream-7.1_7.1.0-1_arm64.deb` 后安装：

```bash
sudo apt-get install ./deepstream-7.1_7.1.0-1_arm64.deb
sudo ldconfig
```

验证：

```bash
deepstream-app --version-all
# deepstream-app version 7.1.0 / DeepStreamSDK 7.1.0 / CUDA 12.6 / TensorRT 10.3
```

> tar 包、SDK Manager 等其它安装方式见 NG4500 DeepStream 指南第 3 节。

### 3.3 配置 Docker

Orin NX 内核有两个坑必须先处理，否则容器会无限重试或网络不通。

**① 存储驱动改 `vfs`**——内核 overlayfs 处理容器内 whiteout 文件会失败，导致 Docker 反复重试塞满磁盘：

```bash
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "storage-driver": "vfs",
  "default-runtime": "nvidia",
  "runtimes": {
    "nvidia": { "path": "nvidia-container-runtime", "runtimeArgs": [] }
  }
}
EOF
sudo systemctl restart docker
```

**② 全部用 `--network=host`**——内核缺少 `iptable_raw` 模块，Docker 桥接网络不可用；本文所有 `docker run` 都走 host 网络。

**③ 登录 NGC**（拉基础镜像要用）。在 [NGC](https://org.ngc.nvidia.com/setup/api-key) 建 API Key 后：

```bash
echo "$YOUR_NGC_KEY" | docker login nvcr.io -u '$oauthtoken' --password-stdin
```

> `$oauthtoken` 是字面量，必须带 `$` 且用单引号防 shell 展开。`vfs` 不做层去重，定期 `docker image prune -f` 清理。

### 3.4 构建 sidecar 镜像 `ds:7.1-pyds-gi`

拉 Jetson 专用基础镜像（**不要**用 `:7.1` 数据中心版，缺 Jetson 库）：

```bash
docker pull nvcr.io/nvidia/deepstream:7.1-samples-multiarch
docker tag nvcr.io/nvidia/deepstream:7.1-samples-multiarch ds:7.1-base
```

准备 pyds 1.2.0 wheel（对应 DS 7.1 / Python 3.10）：

```bash
wget https://github.com/NVIDIA-AI-IOT/deepstream_python_apps/releases/download/v1.2.0/pyds-1.2.0-cp310-cp310-linux_aarch64.whl
# 若文件名只有一次 cp310（NGC 直下常见），补成两次 ABI 标签，否则 pip 按 PEP 427 拒收：
# cp pyds-1.2.0-cp310-linux_aarch64.whl pyds-1.2.0-cp310-cp310-linux_aarch64.whl
```

在同目录放 `Dockerfile.sidecar`（在 pyds 之上叠 Python GI 绑定）：

```dockerfile
FROM nvcr.io/nvidia/deepstream:7.1-samples-multiarch

RUN apt-get update && apt-get install -y --no-install-recommends \
        python3-gi python3-gst-1.0 libpython3.10 python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY pyds-1.2.0-cp310-cp310-linux_aarch64.whl /tmp/
RUN pip3 install --no-cache-dir /tmp/pyds-1.2.0-cp310-cp310-linux_aarch64.whl \
    && rm /tmp/*.whl

WORKDIR /srv/sidecar
```

构建并验证 pyds 可加载：

```bash
docker build --network=host -t ds:7.1-pyds-gi -f Dockerfile.sidecar .
docker run --rm --runtime=nvidia --network=host ds:7.1-pyds-gi \
    python3 -c "import pyds; print('pyds', pyds.__version__)"
```

### 3.5 预构建 TensorRT FP16 引擎

> Orin NX 8GB 上让 `nvinfer` 启动时现编 INT8 引擎会在 tactic 选择阶段 OOM；务必**事先**用 `trtexec` 编出 FP16 引擎，运行时只反序列化。

```bash
mkdir -p ~/ds-engines
docker run --rm --runtime=nvidia --network=host \
    -v ~/ds-engines:/engines ds:7.1-pyds-gi \
    trtexec \
        --onnx=/opt/nvidia/deepstream/deepstream/samples/models/Primary_Detector/resnet18_trafficcamnet_pruned.onnx \
        --saveEngine=/engines/trafficcam_fp16.engine \
        --fp16 --memPoolSize=workspace:1024
```

约 3 秒生成 ~4 MB 引擎。TensorRT 10.3+ 已弃用 `--workspace`，用 `--memPoolSize`。

> `trtexec` 默认 `batch-size=1`；sidecar 的 `pipeline_builder.py` 强制 nvinfer `batch-size=1` 对齐。**自定义配置务必保持 batch 一致**，否则 nvinfer 触发重编又掉回 OOM。

### 3.6 准备 RTSP 测试源（mediamtx + ffmpeg）

无真实相机时，用样例视频循环推 RTSP 测试。装 mediamtx（ARM64v8，从 [releases](https://github.com/bluenviron/mediamtx/releases) 下载）：

```bash
tar xf mediamtx_v*.linux_arm64v8.tar.gz
./mediamtx &          # 监听 8554
```

推 4 路测试流：

```bash
for i in 1 2 3 4; do
    ffmpeg -re -stream_loop -1 -i sample.mp4 -c copy \
        -f rtsp rtsp://localhost:8554/in/stream$i &
done
```

> RTSP **必须走 TCP**（`protocols=tcp`）。UDP 会因内核 `multiudpsink` 无法解析 IPv6 的 localhost 而报 `Invalid address family (got 10)` 失败。

---

## 4. 在 NG4500 上启动 sidecar

NG4500 上需常驻四个服务：

| 服务 | 端口 | 作用 |
|------|------|------|
| `mediamtx` | 8554 (RTSP) | RTSP 中继，接收输入流与 DeepStream 标注输出，向客户端分发 |
| `ffmpeg` 测试源 | — | 把样例视频循环推成 RTSP（测试用；正式换成真实相机 URL）|
| `mjpeg_server.py` | 8090 (HTTP) | 把 RTSP 输出转 MJPEG，供浏览器缩略图预览 |
| `sidecar_bridge.py` | 9556 (TCP) | NeoMind 与 Docker sidecar 之间的桥接守护 |

### 4.1 一键启动（推荐）

扩展提供 `start_all.sh`，按顺序拉起 mediamtx、测试源、MJPEG 服务与桥接守护，再由桥接守护拉起容器：

```bash
./start_all.sh
```

桥接守护以 `--runtime=nvidia --network=host` 启动 `ds:7.1-pyds-gi` 容器，运行 `deepstream_runner.py`。

### 4.2 手动启动 sidecar 容器（调试用）

把 sidecar 源码放到设备（生产环境由 `.nep` 包安装到 `~/.neomind/extensions/deepstream/sidecar/`，经 `NEOMIND_EXTENSION_DIR` 定位）：

```bash
scp -r extensions/deepstream/sidecar box@<jetson-ip>:~/ds-deps/
```

准备 JSONL 控制输入（`hello` 注册 + `add_stream` 加一路测试流）：

```bash
cat > ~/ds-deps/data-plane.jsonl <<'EOF'
{"id":"0","type":"hello","version":"1.0","capabilities":["streams","events"],"pid":12345,"rtsp_port":8554,"snapshot_port":8555,"log_level":"info","models_dir":"/opt/nvidia/deepstream/deepstream/samples/models","max_streams":4,"snapshot_bind_addr":"0.0.0.0"}
{"id":"1","type":"add_stream","config":{"stream_id":"test-1","source":{"type":"rtsp","url":"rtsp://localhost:8554/in/stream1","rtsp_transport":"tcp","latency_ms":200},"model":"Primary_Detector"}}
EOF
```

启动容器（喂入 JSONL，60 秒后发 shutdown 便于观察）：

```bash
docker run --rm -i --runtime=nvidia --network=host \
    -v ~/ds-deps/sidecar:/srv/sidecar:ro \
    -v ~/ds-deps/data-plane.jsonl:/srv/data-plane.jsonl:ro \
    -v ~/ds-engines:/engines:ro \
    ds:7.1-pyds-gi \
    bash -c "(cat /srv/data-plane.jsonl; sleep 60; echo '{\"id\":\"2\",\"type\":\"shutdown\",\"graceful_secs\":3}') | timeout 90 python3 /srv/sidecar/deepstream_runner.py"
```

> `models_dir` **不能以 `/` 结尾**——尾斜杠会破坏 `os.path.dirname()` 的路径解析。

### 4.3 验证

sidecar 在 stdout 输出 JSONL，依次应看到：

1. `hello_ack`——注册成功，带 `max_streams` 与 RTSP 前缀 `rtsp://0.0.0.0:8554/ds/`；
2. `stream_added`——流就绪，给出完整 RTSP URL（如 `rtsp://0.0.0.0:8554/ds/test-1`）；
3. `Detection`——逐帧推理结果。

测试源连通性：

```bash
ffprobe -v error rtsp://127.0.0.1:8554/sample   # 期望输出 h264
```

四服务就绪后，回到 NeoMind 配置远程 sidecar（见下节）。

---

## 5. 配置 NeoMind 扩展（远程模式）

NeoMind 端安装 **deepstream** 扩展后，在 **Configuration** 切到远程模式并指向 NG4500：

| 配置项 | 取值 | 说明 |
|--------|------|------|
| `sidecar_mode` | `remote` | sidecar 在远端 NG4500（非本地子进程）|
| `sidecar_host` | NG4500 的 IP | 远程桥接地址 |
| `sidecar_port` | `9556` | 桥接 TCP 端口 |
| `server_host` | 同 NG4500 IP | 前端拼预览 / RTSP URL 用 |
| `rtsp_port` | `8554` | 标注 RTSP 输出端口 |
| `snapshot_port` | `8555` | 截图 HTTP 端口 |
| `max_streams` | `32` | 并发流上限（1–64）|
| `models_dir` | DeepStream 样例模型目录 | 模型文件位置 |

保存后扩展经 TCP 连上 sidecar。

安装与配置过程（打开扩展市场 → 安装扩展 → 切远程模式）：

![打开扩展市场](https://resources.camthink.ai/wiki/img/neomind/use-cases/deepstream-ng4500/01-open-market.png)

![安装 deepstream 扩展](https://resources.camthink.ai/wiki/img/neomind/use-cases/deepstream-ng4500/02-install.png)

![远程模式配置](https://resources.camthink.ai/wiki/img/neomind/use-cases/deepstream-ng4500/03-config.png)

---

## 6. 添加视频流

在 Dashboard 添加 **deepstream** 扩展的 **DeepStreamManagerCard** 卡片（即 DeepStream 面板），点 **Add** 添加流，每个流提供：

| 字段 | 示例 | 说明 |
|------|------|------|
| `stream_id` | `cam1` | 流标识，用于输出 URL 与事件 |
| `source.url` | `rtsp://admin:pass@10.0.0.10/Streaming/Channels/101` | RTSP 源（Jetson 建议 TCP 传输）|
| `model` | `Primary_Detector` | 预置 TrafficCam / YOLOv8，可用 `register_model` 换 etlt/onnx |
| `tracker` | `NvDCF` / `NvSORT` | NvDCF 弱光、NvSORT 高精度 |
| `analytics` | 越线 / ROI 多边形 | 定义业务分析区域 |

保存后 sidecar 建流水线，开始推理与事件上报。

添加 DeepStream 面板与视频流：

![添加 DeepStream 面板](https://resources.camthink.ai/wiki/img/neomind/use-cases/deepstream-ng4500/04-add-card.png)

![添加 RTSP 视频流](https://resources.camthink.ai/wiki/img/neomind/use-cases/deepstream-ng4500/05-add-stream.png)

---

## 7. 查看结果

- **面板状态栏**：顶部显示服务状态、GPU 占用、FPS 与流数量，可刷新或重启服务。
- **MJPEG 缩略图**：面板里实时多路预览（带检测框）；点击缩略图打开详情抽屉，看 HLS 实时视频、各类计数（对象 / 元数据 / 类别）与事件日志，可复制 RTSP 地址或删除流。
- **标注 RTSP**：`rtsp://<server_host>:8554/ds/<stream_id>`，可用任意播放器或录像。
- **JPEG 截图**：`http://<server_host>:8555/snapshot/<stream_id>.jpg`。
- **业务事件**：Detection / LineCross / ROIIntrusion / AnalyticsSnapshot 进入 NeoMind，可在仪表板展示、用 [自动化规则](../user-guide/7-automation-rules.md) 触发告警 / 推送。

---

## 8. 典型场景

### 场景一：园区周界入侵检测

- **人流 / 车流统计**：多路出入口相机，实时计数与时段分布。
- **越线计数**：在闸机 / 门口画越线，双向计数（进 / 出）。
- **区域入侵告警**：ROI 圈定禁入区，目标进入即事件 → 自动化推送。
- **停留分析**：跟踪 ID 跨帧，统计目标在区域内的停留时长，用于服务区 / 展位热度。

---

## 9. 故障排查

### 故障排查速查

部署与运行中最常踩的坑（均来自实战）：

| 现象 | 原因 | 解决 |
|------|------|------|
| `nvinfer` 启动即 OOM | Orin 上运行时现编 INT8 引擎，tactic 选择阶段内存爆 | 用 `trtexec` **事先**编好 FP16 引擎，运行时只反序列化 |
| sidecar 配置不生效 | `models_dir` 以 `/` 结尾，破坏 `os.path.dirname()` 解析 | 去掉尾斜杠 |
| RTSP 拉流 UDP 花屏/无流 | 网络不允许 UDP | 强制 RTSP over TCP（`rtsp_transport: tcp`） |
| sidecar 起不来 | iptable_raw 模块缺失 | 加载模块或按发行版说明启用 |
| 扩展连不上 sidecar | WS 地址/端口不对 | 用 `hello` 握手报文确认 `rtsp_port`/`snapshot_port` |


## 10. 附录

### 相关文档

- [NG4500 系列总览](../../1-neoedge-ng4500-series/0-overview.md)
- [NG4500 上的 DeepStream SDK](../../1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/3-deepstream.md)
- [目标检测应用案例](./1-object-detection.md)
- [扩展管理](../user-guide/9-extensions.md)
- [自动化规则](../user-guide/7-automation-rules.md)
- [deepstream 扩展 INSTALL.md](https://github.com/camthink-ai/NeoMind-Extensions/tree/main/extensions/deepstream/INSTALL.md)

---

*最后更新: 2026-09-09*
