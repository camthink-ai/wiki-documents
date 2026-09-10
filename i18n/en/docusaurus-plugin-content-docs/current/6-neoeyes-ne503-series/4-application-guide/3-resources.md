---
id: resources
slug: /neoeyes-ne503-series/application-guide/
title: Resources
sidebar_position: 5
description: GitHub and PyPI entry points for the NeoRuntime platform, SDKs, sample apps, APIs, event protocols, and deployment resources used to develop for NE503.
keywords: [NE503, GitHub, PyPI, NeoRuntime, SDK, app development, REST API]
tags: [NE503, Application Development, GitHub, SDK]
---

# Resources

NE503 application-development materials are primarily maintained on GitHub, and the Python SDK is also published on PyPI. Use the current repository content as the source of truth for code, configuration, examples, and releases; install the Python SDK from its PyPI package.

## Platform and Protocols

| Resource | Use it for |
| --- | --- |
| [neoruntime](https://github.com/camthink-ai/neoruntime) | Platform services, HAL, web console, build, and deployment scripts |
| [Platform documentation](https://github.com/camthink-ai/neoruntime/tree/main/docs) | Architecture, services, deployment, and reference documentation |
| [REST API OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) | REST API definition |
| [Event Bus protocol](https://github.com/camthink-ai/neoruntime/blob/main/platform/event-bus/proto/event.proto) | Event message definition |

## SDKs and Applications

| Resource | Use it for |
| --- | --- |
| [neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Python and C++ SDKs and shared protocol definitions |
| [PyPI: neoruntime-ipc-sdk](https://pypi.org/project/neoruntime-ipc-sdk/) | Install the NeoRuntime Python SDK: `pip install neoruntime-ipc-sdk` |
| [Python API documentation](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) | Python SDK API reference |
| [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | Sample apps, templates, showcases, and developer tools |
| [App examples](https://github.com/camthink-ai/neoruntime-apps/tree/main/examples) | Hello World, person detection, object detection, and people-counting examples |
| [App build script](https://github.com/camthink-ai/neoruntime-apps/blob/main/scripts/build_app.sh) | Package an app for deployment |
| [Showcase projects](https://github.com/camthink-ai/neoruntime-apps/tree/main/showcases) | Complete apps such as Model Showcase and Parking Lot |

## Prebuilt Applications

- [Model Showcase ARM64 bundle](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/model-showcase-latest-arm64.neoapp)
- [Parking Lot ARM64 bundle](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/parking-lot-latest-arm64.neoapp)
- [All Releases](https://github.com/camthink-ai/neoruntime-apps/releases)

For app builds, use `neoruntime-apps`; install the Python SDK from its [PyPI package](https://pypi.org/project/neoruntime-ipc-sdk/); for SDK APIs, use `neoruntime-sdks`; for platform APIs, event protocols, or deployment material, use `neoruntime`. If paths or artifacts change, follow the latest GitHub content.
