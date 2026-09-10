---
description: NE503 开发环境搭建、源码获取和平台软件发布包构建步骤。
keywords: [NE503, 开发环境, 构建, Docker, Hailo SDK, 发布包]
tags: [平台开发, NE503, 环境搭建, 构建]
---

# Developer Guide

本页说明如何从 NeoRuntime 源码构建 NE503 平台软件发布包。

## 1. 获取源码

| 仓库 | 用途 |
|:---|:---|
| [neoruntime](https://github.com/camthink-ai/neoruntime) | 平台服务、HAL、部署资源、MCU 固件和 Web 控制台 |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python/C++ SDK 和 proto |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | 应用模板和示例 |

```bash
git clone https://github.com/camthink-ai/neoruntime.git
cd neoruntime
```

SDK 和应用开发请直接进入对应仓库。

## 2. 启动 Docker 构建环境

Docker 镜像已包含 Hailo/Poky SDK。

```bash
docker pull camthink/ne503-dev:v1.0

docker run --rm -it \
  --entrypoint /bin/bash \
  --user root \
  -v "$PWD:/ne503" \
  -w /ne503 \
  -e SDK_PATH=/opt/hailo-sdk \
  camthink/ne503-dev:v1.0
```

## 3. 构建发布包

进入容器后执行：

```bash
git config --global --add safe.directory /ne503
make pack-release VERSION=<version>
```

发布包写入 `build/release/`。

`pack-release` 默认会重新构建 MCU OTA 固件。已有 MCU 构建产物时，可跳过：

```bash
make pack-release VERSION=<version> BUILD_MCU_FW=0
```

## 4. 快速验证

```bash
make test-basic
```

需要完整测试时执行 `make test`。

找不到 SDK 或构建目标时报错时，先确认使用 `camthink/ne503-dev:v1.0`，再查看 [NeoRuntime 构建指南](https://github.com/camthink-ai/neoruntime/blob/main/docs/getting-started/BUILD.md)。

## 5. 相关文档

- [NeoRuntime 测试指南](https://github.com/camthink-ai/neoruntime/blob/main/tests/TESTING_GUIDE.md)
- [NE503 SDK](https://github.com/camthink-ai/neoruntime-sdks)
- [NE503 应用](https://github.com/camthink-ai/neoruntime-apps)
- 构建完成后，按[软件部署](./3-software-deployment.md)安装或升级设备。
