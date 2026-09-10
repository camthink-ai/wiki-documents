---
description: NE503 故障排查：按现象执行最小检查并确定下一步。
keywords: [NE503 故障排查, 排障, RTSP, AI 模型, 容器, 事件总线, 烧录]
tags: [NE503, 故障排查, FAQ]
---

# Troubleshooting

按“现象 → 检查 → 结果 → 下一步”处理。升级、重刷、删除模型或清理文件前先备份。

## 快速定位

| 现象 | 入口 |
|:--|:--|
| Web 打不开 | [设备与网络](#1-设备与网络) |
| Web/RTSP 无画面 | [视频与流](#2-视频与流) |
| 模型无结果 | [AI 与模型](#3-ai-与模型) |
| 应用退出或安装失败 | [应用与容器](#4-应用与容器) |
| 事件收不到 | [事件与集成](#5-事件与集成) |
| 磁盘满或上传失败 | [存储与磁盘](#6-存储与磁盘) |
| 烧录或外设异常 | [烧录与外设](#7-烧录与外设) |
| 服务或 Socket 异常 | [系统与服务](#8-系统与服务) |

## 1. 设备与网络

### 1.1 Web 控制台打不开

**检查：**

~~~bash
ping <设备IP>
curl -k -I https://<设备IP>
ssh root@<设备IP>
aipc-cli system health
systemctl status platform-api
~~~

**结果：**

- ping 不通：检查供电、网线、电脑网段和防火墙；DHCP 地址到路由器查询。
- ping 通但 HTTPS 不通：检查 platform-api 日志。
- 页面可打开但无法登录：转到“忘记密码”。

### 1.2 忘记密码

Web 密码无法本地重置。仍能登录时，在 **Settings → Device Info → Change Password** 改密；已遗忘时联系支持重新刷机。

### 1.3 镜头或 RS-485 无响应

先检查接线、供电、A/B 极性、共地、波特率、地址和协议帧。镜头问题执行：

~~~bash
systemctl status camera-daemon
~~~

/dev/ttyS0 是核心板与 MCU 的内部链路，不是外部 RS-485 接口。应用初始化外部 RS-485 后再发送协议帧。

## 2. 视频与流

### 2.1 RTSP 无画面

**检查：**

~~~bash
aipc-cli stream list
systemctl status camera-daemon
ffmpeg -rtsp_transport tcp -i rtsp://<设备IP>:8554/main -t 10 -f null -
~~~

**结果：**

- 码流未启用：在 **Media** 开启 RTSP 并保存。
- 网络失败：检查设备地址和 8554 防火墙。
- FFmpeg 能读到帧：播放器或客户端参数有问题。
- 仍失败：查看 camera-daemon 日志。

RTSP 当前无认证，生产环境只允许 NVR 等指定主机访问。

### 2.2 Web 预览黑屏或断连

确认 HTTPS/WebSocket 可访问、Token 未过期，再检查：

~~~bash
systemctl status platform-api
journalctl -u platform-api -n 50 --no-pager
~~~

黑屏时在应用中保持 HD_PREVIEW_ENABLED=0，使用 MJPEG 回退；仍无画面则转到 2.1。

### 2.3 应用处于 SIMULATION

日志出现 SIMULATION 时，应用没有拿到真实视频。检查：

~~~bash
systemctl status camera-daemon
journalctl -u camera-daemon -n 50 --no-pager
~~~

若缺少 HAL 库，重新刷入包含对应 HAL 的系统镜像。

## 3. AI 与模型

### 3.1 模型已加载但无结果

**检查：**

~~~bash
aipc-cli model list
aipc-cli app logs <app-id>
~~~

确认：

1. 模型状态为 **Loaded**；
2. 应用权限包含实际模型和原始码流；
3. 模型输入与实际码流配置匹配；
4. 阈值没有过高；
5. 推理使用 third 或 sub，不要使用只提供 H.264 的 main。

模型导入和自定义 HEF 流程见[模型训练与 HEF](./4-application-guide/4-model-training-and-hef.md)。

### 3.2 Model not found 或输入尺寸错误

模型 ID 必须与设备实际注册名一致。byte_size mismatch 表示 HEF 输入与实际码流配置不匹配。先用 aipc-cli model list 和应用日志确认实际名称和输入，再修改 app.yaml 或重新编译 HEF。

## 4. 应用与容器

### 4.1 安装失败

**检查：**

~~~bash
yamllint app.yaml
journalctl -u app-manager -n 100 --no-pager
~~~

**结果：**

- YAML 报错：修正清单字段；
- 镜像导入失败：检查磁盘、网络和包架构；
- 权限报错：检查安装向导的 Permissions；
- 旧的单文件上传失败：使用 Upload Image → Upload Manifest → Install Package。

### 4.2 启动后退出或反复重启

~~~bash
aipc-cli app logs <app-id>
df -h / /data
free -h
systemctl status containerd
~~~

确认资源、镜像和权限。日志若显示模型或码流不可用，回到第 3 节；若显示存储错误，回到第 6 节。

### 4.3 健康检查失败

查看应用清单中的探针地址、命令或端口：

~~~bash
aipc-cli app info <app-id>
aipc-cli app logs <app-id>
~~~

在容器内按同一种方式复现探针，修正后重新启动。

## 5. 事件与集成

### 5.1 事件发布或订阅失败

~~~bash
systemctl status event-bus
journalctl -u event-bus -n 50 --no-pager
aipc-cli event subscribe "app/<app-id>/*"
~~~

确认 Topic 拼写、publish/subscribe 权限和订阅端连接。先修复 Event Bus，再检查应用。

### 5.2 接口返回 401/403/404/5xx

| 状态 | 检查 |
|:--|:--|
| 401 | 重新登录获取 Token |
| 403 | 检查用户或应用权限 |
| 404 | 核对路径和资源 ID |
| 5xx | 查看 platform-api 及依赖服务日志 |

API 定义以 [neoruntime OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) 为准。

## 6. 存储与磁盘

### 6.1 磁盘满、上传失败

~~~bash
df -h / /data
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

优先在 **Maintenance → File Manager** 清理旧日志、闲置应用、模型和安装包。删除 containerd 数据前确认路径和备份。

### 6.2 应用数据目录不存在

确认 app ID 后创建声明的目录：

~~~bash
mkdir -p /data/aipc/data/<app-id> /data/aipc/logs/<app-id>
~~~

### 6.3 日志或 core dump 占满根分区

先导出支持所需日志，再清理已确认无用的日志或 core 文件。不要直接删除用途不明的文件。

## 7. 烧录与外设

### 7.1 烧录失败或升级中断

确认供电、串口、波特率、TFTP 网络和固件版本，然后按[系统烧录](./3-software-guide/2-system-flashing.md)的引导链恢复和系统烧录步骤重试。

### 7.2 报警、Wiegand、RS-485 异常

先检查物理层，再检查应用配置和服务日志：

- 报警输入当前固件未上报 Event Bus/API；
- Alarm Input Level 当前固件未生效；
- Wiegand 当前为输出接口，不接收读卡器；
- RS-485 需要正确初始化、接线和协议帧。

## 8. 系统与服务

### 8.1 服务启动失败

~~~bash
systemctl --failed
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api
journalctl -u <service-name> -b --no-pager
~~~

**结果：**

- 服务不在 active：先看启动日志和依赖；
- Socket 不存在：修复对应服务；
- 权限被拒绝：检查 /run/aipc 的用户和组；
- 资源不足：回到第 6 节。

### 8.2 Socket 或性能异常

~~~bash
ls -la /run/aipc/*.sock
free -h
df -h / /data
top -p $(pgrep -f ai-runtime)
~~~

记录服务名、时间、错误日志和设备版本后，再提交支持。

## 相关文档

- [系统架构](./3-software-guide/0-system-architecture.md)
- [系统烧录](./3-software-guide/2-system-flashing.md)
- [Resources](./4-application-guide/3-resources.md)
