---
id: resources
slug: /neoeyes-ne503-series/application-guide/
title: Resources
sidebar_position: 5
description: NE503 应用开发所需的 NeoRuntime 平台、SDK、示例应用、API、事件协议和部署资料 GitHub 与 PyPI 入口。
keywords: [NE503, GitHub, PyPI, NeoRuntime, SDK, 应用开发, REST API]
tags: [NE503, 应用开发, GitHub, SDK]
---

# Resources

NE503 应用开发资料主要维护在 GitHub；Python SDK 也已发布到 PyPI。代码、配置、示例和版本以当前仓库内容为准，Python SDK 安装使用 PyPI 包。

## 平台与协议

| 资源 | 用途 |
| --- | --- |
| [neoruntime](https://github.com/camthink-ai/neoruntime) | 平台服务、HAL、Web 控制台、构建与部署脚本 |
| [平台文档](https://github.com/camthink-ai/neoruntime/tree/main/docs) | 架构、服务、部署和参考文档 |
| [REST API OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) | REST API 定义 |
| [Event Bus 协议](https://github.com/camthink-ai/neoruntime/blob/main/platform/event-bus/proto/event.proto) | 事件消息定义 |

## SDK 与应用

| 资源 | 用途 |
| --- | --- |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python、C++ SDK 和共享协议定义 |
| [PyPI：neoruntime-ipc-sdk](https://pypi.org/project/neoruntime-ipc-sdk/) | 安装 NeoRuntime Python SDK：`pip install neoruntime-ipc-sdk` |
| [Python API 文档](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) | Python SDK 的 API 参考 |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | 示例应用、模板、Showcase 和开发工具 |
| [应用示例](https://github.com/camthink-ai/neoruntime-apps/tree/main/examples) | Hello World、人员检测、目标检测和人流统计示例 |
| [应用构建脚本](https://github.com/camthink-ai/neoruntime-apps/blob/main/scripts/build_app.sh) | 将应用打包为可部署产物 |
| [Showcase 项目](https://github.com/camthink-ai/neoruntime-apps/tree/main/showcases) | Model Showcase、Parking Lot 等完整应用 |

## 预构建应用

- [Model Showcase ARM64 安装包](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/model-showcase-latest-arm64.neoapp)
- [Parking Lot ARM64 安装包](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/parking-lot-latest-arm64.neoapp)
- [全部 Releases](https://github.com/camthink-ai/neoruntime-apps/releases)

需要构建应用时查看 `neoruntime-apps`；需要安装 Python SDK 时使用 [PyPI 包](https://pypi.org/project/neoruntime-ipc-sdk/)；需要 SDK API 时查看 `neoruntime-sdks`；需要平台接口、事件协议或部署资料时查看 `neoruntime`。仓库中的路径和产物发生变化时，以 GitHub 最新内容为准。
