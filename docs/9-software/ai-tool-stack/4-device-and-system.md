---
sidebar_label: "Device & System"
sidebar_position: 4
description: "NE101/NE301 设备管理、设备-项目绑定，以及多 MQTT Broker、MQTTS 与证书管理。"
---
# 设备管理与系统设置

## 设备管理

- **NE101/NE301 设备支持**：设备可连接 AIToolStack，实时检测在线/离线状态，进行基本信息与状态管理
- **设备-项目绑定**：设备可绑定到 AI 模型项目，设备采集的图像自动分类推送到对应项目空间，便于批量训练与数据集整理
- **设备信息与溯源**：管理设备名称，查询设备历史采集与上报数据，便于数据追溯与检索

![设备管理](/img/aitoolstack/devicemanage.webp)

## 系统设置

- **多 MQTT Broker 管理**：支持同时订阅和管理多个外部 MQTT Broker，满足多场景数据协作需求
- **MQTTS 加密协议**：内置 MQTT Broker 支持 MQTTS 协议，可在界面配置 Broker 参数（证书、端口、权限等）
- **MQTT 证书管理**：证书管理模块支持多套证书的导入、生成与一键切换，保障设备与服务端之间的安全访问

![系统设置](/img/aitoolstack/systemsettings.webp)
