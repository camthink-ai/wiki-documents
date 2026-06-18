---
id: troubleshooting
title: 应用故障排查
sidebar_position: 4
description: NE503 应用开发故障排查，涵盖容器应用安装/启动/健康检查、视频流 WebSocket 集成、事件总线发布/订阅问题，帮助应用开发者快速定位常见问题。
keywords: [NE503 应用排查, 容器启动失败, 健康检查, WebSocket 断连, 事件总线, SDK 排错]
tags: [应用开发, NE503, 故障排查, 容器, 事件总线]
---

# Troubleshooting

本页聚焦应用开发者在使用 NE503 平台 SDK 和 API 时遇到的常见问题。平台服务本身的排查请参考 [Troubleshooting Guide](../../../3-software-guide/4-reference/1-troubleshooting.md)。

## 1. 容器应用排查

### 1.1 应用安装失败

安装失败常见三类：镜像拉取（网络/镜像源）、清单解析（`app.yaml` 语法）、权限（运行用户须属于 aipc 组）。

**诊断命令：**

```bash
# 查看安装日志（清单字段错误、镜像导入失败均会在此报具体原因）
journalctl -u app-manager -f

# 本地预检 app.yaml 语法
yamllint app.yaml
```

### 1.2 容器启动失败

启动失败多见于资源不足（见 `resources` 配额）或依赖的上游服务未就绪；容器沙箱有安全限制（drop capabilities 等）。真机最常见的 `parent snapshot`/`no space` 见 §4 #5。

**诊断命令：**

```bash
# 查看容器日志
journalctl -u app-manager | grep -i "container"

# 检查系统资源
free -h
df -h
systemd-cgtop

# 检查 containerd 状态
systemctl status containerd
```

### 1.3 健康检查失败

`app.yaml` 支持 HTTP / 执行命令 / TCP 三种健康探针；失败时按探针类型手动复现（curl / `aipc-cli app exec` / netstat）。

**诊断命令：**

```bash
# 查看健康检查日志
journalctl -u app-manager | grep -i "healthcheck"

# 手动在应用容器内执行健康检查命令
aipc-cli app exec <app-id> -- /path/to/healthcheck.sh

# 查看应用状态
aipc-cli app info <app-id>
```

## 2. 视频流集成排查

### 2.1 WebSocket 断连

WebSocket 断连常见于客户端超时、服务端报错或网络波动；接入侧（含推荐的重连策略）见 [视频集成](../../2-3rd-party-integration/1-video-integration.md)。

**诊断命令：**

```bash
# 查看 WebSocket 连接日志
journalctl -u platform-api | grep -i "websocket\|h264"

# 测试 WebSocket 连接
wscat -c ws://localhost:8080/api/v1/h264/main
```

## 3. 事件总线排查

### 3.1 事件发布失败

发布失败先确认 event-bus 运行中；Topic 须用 `app/<app_id>/<event>` 格式（如 `app/person_alert/person_detected`）。

**诊断命令：**

```bash
# 检查 event-bus 状态
systemctl status event-bus

# 查看事件日志
journalctl -u event-bus -f

# 测试事件发布
aipc-cli event publish app/demo/started '{"message": "test"}'
```

### 3.2 订阅失败

订阅失败多为 Topic 权限未声明（`app.yaml` 的 `permissions.events.subscribe`）或客户端断连后未重连。

**诊断命令：**

```bash
# 确认 event-bus 运行
systemctl status event-bus

# 订阅测试，验证 Topic 权限
aipc-cli event subscribe "app/<your_app>/*"
```

## 4. 实战部署排查清单（真实验证）

以下是真实部署 NE503 容器应用时验证过的常见问题，按「现象 → 根因 → 修复」组织。前 3 节是通用快速排查，本节是实战中反复出现、需要具体操作的硬核问题。

### 4.1 速查表

| # | 现象 | 根因 | 修复 |
|:--|:-----|:-----|:-----|
| 1 | 构建时 `apk add ... I/O error` | Docker Desktop + buildx + alpine 偶发 | 重新执行一次构建命令 |
| 2 | 启动返回 `DeadlineExceeded` | 首次载入镜像进 containerd 超 10s gRPC 超时 | 再调用一次启动接口 |
| 3 | 日志用 `json.tool` 解析报错 | 返回 NDJSON（每行一个 JSON，非数组） | 逐行 `json.loads` |
| 4 | `curl -F app=@.aipc` 报 JSON 解析错 | 旧的单文件上传 API 已失效 | 改两步上传：upload-image + upload-manifest + install-package |
| 5 | 启动报 `parent snapshot` 或 `no space` | containerd 数据在小根分区（3.3GB）铺不开 | 把 containerd root 迁到 /data 分区（见 4.2） |
| 6 | 启动报 `mount ... no such file` | app.yaml 声明的卷 host 目录不存在 | 手动 `mkdir -p` 创建（见 4.2） |
| 7 | upload-image 返回 `no space left` | 根分区被陈旧日志/core dump 占满 | 清理大日志与 core dump（见 4.2） |
| 8 | 推理报 `NOT_FOUND: Model not found` | 模型/流名写死，与设备实际不符 | `list_models()`/`list_streams()` 查真实名（见 4.2） |
| 9 | 一直 `SIMULATION mode` 无检测 | camera-daemon 未运行（HAL 缺失等） | 见 4.2 |

### 4.2 关键问题详解

#### #5 containerd 分区错配（大镜像铺不开的根因）

设备有两个分区：根 `/`（约 3.3GB，存放 `/opt/aipc` 平台与容器数据）与 `/data`（约 53GB，设计上用于存放 apps/models/logs）。如果 `containerd` 的 `root` 配在了小根分区，几十 MB 以上的镜像解包时会撑满根分区，启动报 `Failed to create container: parent snapshot sha256:...`。

```bash
# 诊断：看分区占用
curl http://<设备IP>:8080/api/v1/monitor/disk -H "Authorization: Bearer <token>"
ssh root@<设备IP> "df -h / /data"

# 确认 containerd root 位置（应为 /data/containerd）
ssh root@<设备IP> "grep '^root' /etc/containerd/config.toml"

# 修复：迁到 /data（恢复设计意图）
ssh root@<设备IP> << 'EOF'
  cp /etc/containerd/config.toml /etc/containerd/config.toml.bak
  sed -i 's|^root = "/opt/aipc/containerd"|root = "/data/containerd"|' /etc/containerd/config.toml
  mkdir -p /data/containerd
  systemctl restart containerd && systemctl restart app-manager
  rm -rf /opt/aipc/containerd   # 清理已迁走的孤儿目录
EOF
```

#### #6 应用卷目录不存在

`app.yaml` 的 `volumes` 声明 `host:/opt/aipc/data/<id> → container:/app/data`，但 app-manager **不自动创建 host 目录**。若目录不存在，runc 挂载失败：`error mounting "/opt/aipc/data/<id>" ... no such file or directory`。

```bash
ssh root@<设备IP> "mkdir -p /opt/aipc/data/<app-id> /opt/aipc/logs/<app-id>"
```

#### #7 根分区磁盘满

排查根分区占用元凶，清理陈旧文件：

```bash
ssh root@<设备IP> "du -sh /opt/aipc/* /home/root/* | sort -rh | head"
# 常见可清理项：陈旧日志(/opt/aipc/logs/*.log)、崩溃 core dump(/home/root/*.core)、冗余安装包
ssh root@<设备IP> "truncate -s 0 /opt/aipc/logs/<大日志>; rm -f /home/root/*.core"
```

#### #8 模型/流名不匹配

推理订阅报 `StatusCode.NOT_FOUND: Model not found`，或 app-manager 日志 `requires model X, but not found`。原因是 `app.py` / `app.yaml` 里的模型名、流名写死，与设备实际不符。

```python
# 先查真实名字，再填进 app.py 和 app.yaml
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())              # 如 ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())               # 如 ['main', 'sub']
```

也可通过 API 确认模型：`curl http://<设备IP>:8080/api/v1/ai/models -H "Authorization: Bearer <token>"`，必要时 `POST /api/v1/ai/models/<id>/load` 加载到 NPU。

#### #9 一直处于仿真模式（SIMULATION）

应用日志出现 `Running in SIMULATION mode - no actual inference`，检测结果始终为 0。这是 SDK 在拿不到真实视频流时的优雅降级，**不是应用 Bug**。根因通常是 camera-daemon 未运行：

```bash
ssh root@<设备IP> "systemctl status camera-daemon"
# 若 activating(auto-restart)：看崩溃原因
ssh root@<设备IP> "journalctl -u camera-daemon -n 20 --no-pager"
# 典型根因：dlopen(/opt/aipc/lib/hal/hal-hailo15.so) 失败 = 固件缺 HAL 库，需重刷含 HAL 的镜像
```

在摄像头正常的设备上，同一应用会输出真实检测框。

### 4.3 排查命令速查

```bash
TOKEN="Bearer <token>"
IP="<设备IP>"

# 设备状态
curl http://$IP:8080/api/v1/monitor/disk    -H "Authorization: $TOKEN"   # 分区占用
curl http://$IP:8080/api/v1/apps            -H "Authorization: $TOKEN"   # 应用列表与状态
curl http://$IP:8080/api/v1/ai/models       -H "Authorization: $TOKEN"   # 已加载模型

# 应用日志（NDJSON）
curl "http://$IP:8080/api/v1/apps/<id>/logs?max_lines=30" -H "Authorization: $TOKEN"

# 设备侧深入排查（SSH root/root）
ssh root@$IP "systemctl status containerd app-manager camera-daemon"     # 服务状态
ssh root@$IP "df -h / /data; du -sh /opt/aipc/* | sort -rh | head"       # 磁盘
ssh root@$IP "journalctl -u app-manager -n 30 --no-pager"               # app-manager 日志
ssh root@$IP "journalctl -u camera-daemon -n 20 --no-pager"             # 摄像头守护进程
```

## 相关文档

- [应用参考](./1-app-reference.md) — 应用配置和部署流程
- [Video Integration](../../2-3rd-party-integration/1-video-integration.md) — 视频流接入指南
- [Event Integration](../../2-3rd-party-integration/2-event-integration.md) — 事件总线接入指南
- [Platform Troubleshooting](../../../3-software-guide/4-reference/1-troubleshooting.md) — 平台服务故障排查
