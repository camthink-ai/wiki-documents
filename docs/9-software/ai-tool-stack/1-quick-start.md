---
sidebar_label: "Quick Start"
sidebar_position: 1
description: "AIToolStack 的环境要求、Docker 部署步骤与常用环境变量。"
---
# 快速上手（Docker）

### 必要条件

**Docker & docker-compose**：请参考 [Docker 官方安装指南](https://docs.docker.com/get-docker/) 和 [docker-compose 安装文档](https://docs.docker.com/compose/install/) 进行安装，保证部署AI Tool Stack的服务器或计算机有Docker的基本环境。

### AI Tool Stack安装

**1. 克隆仓库**

```sh
git clone https://github.com/camthink-ai/AIToolStack.git
cd AIToolStack
```

**2. 使用 Docker 部署**

> **注意**：要修改 `MQTT_BROKER_HOST` 等参数，请编辑 `docker-compose.yml` 中的环境变量。确保MQTT服务地址可被 NE301 设备访问，通常使用主机的实际可访问IP地址，而不是localhost。

```sh
docker-compose build
docker-compose up
```

### NE301编译环境安装

AI Tool Stack为了生成NE301可用的量化模型包，必须引用NE301工程编译环境来做到这一点，请提前拉取镜像：

```sh
docker pull camthink/ne301-dev:latest
```

### 安装验证

#### AI Tool Stack安装验证

安装完成后，可以通过以下方式验证AI Tool Stack服务是否成功启动

**查看服务状态**

通过下方命令行确保能看到 `camthink/aitoolstack:latest`等相关服务正在运行。

```sh
docker ps
```

**访问前端网页**

浏览器中输入部署服务器的IP地址和对应端口，默认为 `http://<your_server_ip>:8000` 或 `http://localhost:8000`，若能访问到AI Tool Stack的Web界面，则部署成功。

#### NE301编译环境安装验证

**查看服务状态**

通过下方命令行确保能看到 `camthink/ne301-dev:latest`相关服务正在运行。

```sh
docker ps
```

## 本地开发体验（可选）

如需分离开发调试（推荐熟悉前后端开发的用户），可分别运行前端与后端：

```bash
cd frontend  && npm install && npm start
cd backend   && pip install -r requirements.txt && uvicorn main:app --reload
```

## 常用环境变量

完整列表见仓库 `docs/ENV.md`；常用项：

| 变量 | 默认 | 说明 |
|------|------|------|
| `MQTT_USE_BUILTIN_BROKER` | true | 是否使用内置 MQTT Broker（false 时需配置外部 Broker） |
| `MQTT_BROKER` | - | 外部 Broker 主机名（内置关闭时必填） |
| `MQTT_BROKER_HOST` | - | 供设备访问的外部 Broker IP（建议填服务器实际 IP） |
| `MQTT_PORT` / `MQTT_BUILTIN_PORT` | 1883 | MQTT 端口 |
| `DATASETS_ROOT` | /app/datasets | 数据集存储路径 |
| `MAX_IMAGE_SIZE_MB` | 10 | 单张图片上传上限（MB） |
