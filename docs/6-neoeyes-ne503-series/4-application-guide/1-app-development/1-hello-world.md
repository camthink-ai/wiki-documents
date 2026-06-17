---
id: hello-world
title: Hello World
sidebar_position: 1
description: 从零在 NE503 上构建、部署并运行第一个容器应用 Hello World，覆盖构建镜像、Web 控制台部署、启动与验收的完整闭环。
keywords: [NE503, Hello World, 应用教程, 容器应用, 应用部署, 入门, 最小闭环]
tags: [应用开发, NE503, 教程, 入门]
---

# Hello World

本教程带你用一个最简单的 Hello World 应用，跑通 NE503 容器应用的**完整生命周期**：编写应用 → 构建 ARM64 镜像 → 上传部署 → 启动 → 在 Web 控制台验收 → 查看日志 → 清理。掌握这个最小闭环后，你就能快速迭代任何 AI 应用。

Hello World 不依赖 AI SDK，只在一个循环里持续打印计数，适合用来验证开发环境与部署流程是否打通。

## 1. 前置条件

| 条件 | 验证方法 |
|:---|:---|
| NE503 设备已联网并运行 | 浏览器访问 `http://<设备IP>:8080`，能看到 Web 登录页 |
| 开发机已安装 Docker | 终端执行 `docker --version`，版本 >= 20.10 |
| 开发机能 ping 通设备 | `curl -o /dev/null -w "%{http_code}" http://<设备IP>:8080` 返回 `200` |
| 知道设备登录凭据 | Web 控制台默认 `admin` / `password`（首次登录后请修改） |

:::tip 架构说明
NE503 设备是 ARM64 架构。如果你的开发机是 Apple Silicon（M 系列芯片），同样是 ARM64，可以**原生构建**，速度快；如果是 x86 机器，Docker buildx 会自动用 QEMU 模拟，稍慢但同样可用。
:::

## 2. 应用结构

Hello World 应用由三个文件组成（完整源码在仓库 `apps/hello-world/`）：

```
hello-world/
├── app.py          # 应用主逻辑
├── app.yaml        # 应用清单（资源/权限/配置）
└── Dockerfile      # 容器构建定义
```

**`app.py`** —— 纯 Python，循环打印带计数的信息，并响应 SIGTERM 优雅退出（平台停止应用时会发 SIGTERM）：

```python
import os, time, signal

class HelloWorldApp:
    def __init__(self):
        self.running = True
        self.app_id = os.environ.get("APP_ID", "hello_world")  # 平台注入
        self.counter = 0
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        self.running = False

    def run(self):
        while self.running:
            self.counter += 1
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] #{self.counter:06d} - Hello World from AIPC!")
            time.sleep(1)

if __name__ == "__main__":
    HelloWorldApp().run()
```

**`app.yaml`** —— 应用清单，声明镜像、资源限制与启动策略（Hello World 不需要任何权限）：

```yaml
apiVersion: v1
kind: Application
metadata:
  id: hello-world
  name: Hello World
  version: 1.0.0
  description: A simple hello world application that prints continuously
spec:
  image: aipc/hello-world:1.0.0      # 必须与 docker build -t 的 tag 一致
  resources:
    cpu: "10%"
    memory: "32Mi"
  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3
```

**`Dockerfile`** —— 基于 `python:3.11-alpine`，体积小：

```dockerfile
FROM python:3.11-alpine3.19
WORKDIR /app
COPY app.py /app/app.py
ENV PYTHONUNBUFFERED=1
ENV APP_ID=hello_world
CMD ["python3", "/app/app.py"]
```

## 3. 构建镜像

在应用目录下构建 ARM64 镜像，导出为 tar，再打包成 `.aipc` 安装包：

```bash
cd apps/hello-world

# 1. 构建 ARM64 镜像（--load 载入本地 Docker）
docker buildx build --platform linux/arm64 --load -t aipc/hello-world:1.0.0 .

# 2. 导出镜像为 tar
docker save aipc/hello-world:1.0.0 -o image.tar

# 3. 打包成 .aipc（app.yaml + image.tar 的 zip）
zip hello-world.aipc app.yaml image.tar
```

构建产物（真实）：

| 产物 | 大小 |
|:---|:---|
| Docker 镜像 | 26.5 MB（磁盘占用 113 MB） |
| `image.tar` | 25 MB |
| `hello-world.aipc` | 25 MB |

> `.aipc` 只是 `app.yaml` + `image.tar` 的 zip 归档包，便于保存和分发。部署到设备时用的是里面的 `image.tar` 和 `app.yaml` 两个文件（见下节），`.aipc` 本身不参与 API 上传。

:::warning 构建偶发失败？
在 macOS + Docker Desktop 上，`apk add` 偶尔报 `Failed to create ...: I/O error`。这是 buildx 的已知偶发问题，**重新执行一次构建命令即可成功**。
:::

## 4. 部署到设备

应用构建完成后，手上有 `app.yaml`（应用清单）和 `image.tar`（容器镜像）两个文件。下面提供三种部署方式，**推荐用 Web 控制台**——图形界面、所见即所得，无需 SSH。

:::note 提前准备
下面三种方式都需要 `app.yaml` 和 `image.tar` 两个独立文件。按本教程 §3 的手动步骤构建后，这两个文件都在应用目录里。如果你用的是仓库 `apps/<app>/build.sh`（它会在打包 `.aipc` 后删掉中间的 `image.tar`），请先解压：`unzip -o <app>.aipc`。
:::

### 4.1 通过 Web 控制台上传（推荐）

全程在浏览器里完成，无需 SSH 登录设备。

1. 浏览器打开 Web 控制台 `http://<设备IP>:8080`，用默认凭据 `admin` / `password` 登录。

2. 在左侧导航点击 **App Management**（应用管理），进入应用列表页。页面右上角有一张 **Import**（导入）卡片，点击它。

3. 弹出 **Application Setup Wizard**（应用安装向导）。在第一步 **Source**（来源）中选择第三种 **Upload Package**（上传应用包）——这个选项同时接收 `app.yaml` 清单和镜像文件。

4. 在 **App Manifest (app.yaml)** 一栏点击 **Choose File**，选择本地的 `app.yaml`；在 **Container Image** 一栏选择 `image.tar`。

![上传应用包：选择 app.yaml + image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/web-import-upload-package.png)

5. 点击右下角的 **Install**。向导会自动完成后面的步骤（解析清单 → 导入镜像 → 注册应用），通常 10–15 秒。回到应用列表就能看到 Hello World 已经出现（初始为 Stopped 状态，下一节启动）。

### 4.2 通过 aipc-cli 命令行部署（备选）

已 SSH 登录设备时，用平台自带的 `aipc-cli` 一条命令装好。先把 `app.yaml` 和 `image.tar` 传到设备：

```bash
scp app.yaml image.tar root@<设备IP>:/tmp/
ssh root@<设备IP>
```

然后在设备上执行：

```bash
aipc-cli app install app.yaml image.tar
```

### 4.3 通过 HTTP API 部署（备选）

适合脚本化 / CI 自动化场景。本质是把上面的安装步骤拆成显式的 HTTP 调用：**两步上传 + 异步安装**——先把镜像和清单分别上传，再触发后台安装任务并轮询进度。

:::note 旧的单文件上传已失效
`curl -F 'app=@xxx.aipc' /api/v1/apps` 这种一次性上传 `.aipc` 的方式**已失效**（接口返回 JSON 解析错误）。必须用下面的两步流程。
:::

#### 登录获取 Token

```bash
curl -X POST http://<设备IP>:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

返回（注意 token 值自带 `Bearer ` 前缀）：

```json
{"code":0,"data":{"token":"Bearer aipc-secure-token-secret","username":"admin"}}
```

后续所有接口都要带 `Authorization: <上面返回的 token 整串>` 头。

#### 上传镜像与清单

```bash
# 上传镜像（字段名是 file）
curl -X POST http://<设备IP>:8080/api/v1/apps/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.tar"
# → {"data":{"path":"/opt/aipc/images/1781509627_image.tar", "image":"aipc/hello-world:1.0.0", ...}}

# 上传清单
curl -X POST http://<设备IP>:8080/api/v1/apps/upload-manifest \
  -H "Authorization: Bearer <token>" \
  -F "file=@app.yaml"
# → {"data":{"path":"/opt/aipc/apps/manifests/hello-world/app.yaml", ...}}
```

#### 触发安装并轮询进度

```bash
# 触发异步安装（JSON body，传上面两个 path）
curl -X POST http://<设备IP>:8080/api/v1/apps/install-package \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"manifest_path":"/opt/aipc/apps/manifests/hello-world/app.yaml",
       "image_path":"/opt/aipc/images/1781509627_image.tar","force":true}'
# → {"data":{"task_id":"0f26285a"}}

# 轮询安装进度（直到 phase=complete）
curl http://<设备IP>:8080/api/v1/apps/install-progress/<task_id> \
  -H "Authorization: Bearer <token>"
```

进度演变：`phase:"pulling" percent:10 "Importing local image..."` → `phase:"complete" percent:100 "Installation complete"`，通常 10-15 秒完成。

## 5. 启动与验收

### 5.1 启动应用

部署完成后应用处于 Stopped 状态，需要手动启动一次。两种方式任选其一。

**方式一：Web 控制台启动（推荐）**

进入 **App Management**（应用管理），找到 Hello World 卡片（状态显示 Stopped），点击卡片上的 **Start** 按钮。正常情况下几秒内状态徽章由 Stopped 切换为 Running。

**方式二：HTTP API 启动**

```bash
curl -X POST http://<设备IP>:8080/api/v1/apps/hello-world/start \
  -H "Authorization: Bearer <token>"
```

:::tip 首次启动超时？
首次启动某个镜像时，平台需要把它载入容器运行时，可能超过接口的 10 秒超时，返回 `code:6002 DeadlineExceeded`。这**不是错误**——再调用一次启动接口（或 Web 上再点一次 Start）即可成功。
:::

### 5.2 在 Web 控制台验收（模拟用户视角）

部署完成后，用浏览器登录 Web 控制台 `http://<设备IP>:8080`，按真实用户的视角验收应用是否正常运行。

![Web 控制台登录页](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/01-login.png)

输入默认凭据 `admin` / `password` 登录，进入 Dashboard。首页顶部展示设备状态（运行时长、温度、CPU/NPU/内存/存储占用），中部**Applications** 区域能看到当前运行的应用：

![Dashboard 仪表盘（Hello World 运行中）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/02-dashboard.png)

进入左侧 **Applications**（应用管理）页面，可以看到 Hello World 处于 **Running** 状态，并显示实时 CPU 与内存占用：

![应用管理页（Hello World Running）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/03-apps-list.png)

点击 **Hello World** 打开详情，可以看到应用 ID、版本、安装/启动时间、运行时长，以及 Stop / Restart / Uninstall 操作按钮——这证明应用已被平台纳管：

![Hello World 应用详情](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/04-app-detail.png)

### 5.3 查看运行日志

应用日志也可以通过接口获取（返回 NDJSON 格式，每行一个 JSON 对象）：

```bash
curl "http://<设备IP>:8080/api/v1/apps/hello-world/logs?max_lines=10" \
  -H "Authorization: Bearer <token>"
```

```json
{"timestamp":1781509897838838800,"level":"info","message":"[2026-06-15 07:51:23] #000011 - Hello World from AIPC!"}
{"timestamp":1781509897838892960,"level":"info","message":"[2026-06-15 07:51:24] #000012 - Hello World from AIPC!"}
{"timestamp":1781509897838901400,"level":"info","message":"[2026-06-15 07:51:25] #000013 - Hello World from AIPC!"}
```

计数每秒递增，说明应用正在稳定运行。

## 6. 停止与清理

验收完成后，停止并卸载应用：

```bash
# 停止
curl -X POST http://<设备IP>:8080/api/v1/apps/hello-world/stop -H "Authorization: Bearer <token>"
# → {"data":{"message":"App stopped successfully"}}

# 卸载
curl -X DELETE http://<设备IP>:8080/api/v1/apps/hello-world -H "Authorization: Bearer <token>"
# → {"data":{"message":"App uninstalled successfully"}}
```

## 7. 小结

恭喜，你已经跑通了 NE503 容器应用的完整闭环：

1. **编写** —— `app.py` + `app.yaml` + `Dockerfile` 三件套
2. **构建** —— `docker buildx build --platform linux/arm64` → `docker save` → `zip .aipc`
3. **部署** —— Web 控制台上传（推荐）/ aipc-cli / HTTP 两步上传，三选一
4. **验收** —— Web 控制台确认 Running + 查看日志确认输出
5. **清理** —— 停止 + 卸载

接下来在 [Person Detection 应用教程](./2-person-detection.md) 里，你将用同样的流程部署一个真正的 AI 推理应用，学习如何调用 SDK、发现模型与视频流、处理检测结果。

:::tip 遇到问题？
应用部署/启动过程中遇到报错，请参考[应用故障排查](./reference/troubleshooting.md)。
:::
