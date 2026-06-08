---
description: NE503 aipc-cli 命令行工具完整参考，涵盖 12 个命令分组：应用管理、模型管理、设备控制、码流管理、事件总线、媒体配置、系统管理、文件管理、日志查看、资源监控、插件管理、事件日志、进程管理和 Shell 补全。
keywords: [aipc-cli, CLI工具, NE503命令行, 应用管理, 设备控制, 模型管理, 事件总线, 系统管理]
tags: [CLI参考, NE503, 命令行工具, 系统管理, 设备控制]
---

# CLI Tool Reference

aipc-cli 是 NE503 平台的命令行管理工具（当前版本 0.3.0），提供应用管理、模型管理、设备控制、码流管理、事件总线、系统管理等 12 个命令分组。通过 SSH 登录设备后即可使用。

## 1. 全局参数

所有 aipc-cli 命令支持以下全局参数：

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--api` | | API 服务器地址 | `http://localhost:8080` |
| `--output` | `-o` | 输出格式（table / json / yaml） | `table` |
| `--verbose` | `-v` | 显示详细输出 | `false` |
| `--app-manager` | | App Manager gRPC 地址 | `unix:///run/aipc/app-manager.sock` |
| `--event-bus` | | Event Bus gRPC 地址 | `unix:///run/aipc/event-bus.sock` |

```bash
aipc-cli app list -o json       # JSON 格式输出
aipc-cli system info -o yaml    # YAML 格式输出
```

---

## 2. app — 应用管理

```bash
aipc-cli app list                                    # 列出所有应用
aipc-cli app info <app-id>                           # 查看应用详情
aipc-cli app install <manifest> <image>              # 安装应用
aipc-cli app start <app-id>                          # 启动应用
aipc-cli app stop <app-id>                           # 停止应用
aipc-cli app restart <app-id>                        # 重启应用
aipc-cli app remove <app-id>                         # 卸载应用
aipc-cli app update <app-id> <manifest> <image>      # 更新应用（保留数据）
aipc-cli app dev <app-id>                            # 开发模式（热重载）
aipc-cli app stats <app-id>                          # 查看资源统计
aipc-cli app logs <app-id> [-f] [--tail N]           # 查看应用日志
aipc-cli app exec <app-id> -- <command> [args...]    # 在容器内执行命令
```

**exec 示例**：

```bash
aipc-cli app exec myapp -- /bin/sh                  # 进入容器 Shell
aipc-cli app exec myapp -- ls -la /app              # 查看应用目录
aipc-cli app exec myapp -u root -- cat /etc/os-release  # 以 root 身份执行
```

**update 示例**：

```bash
aipc-cli app update my-app app.yaml new-image.tar   # 热更新，保留卷数据
```

**dev 模式示例**：

```bash
aipc-cli app dev my-app    # 绑定挂载宿主机源码，文件变更自动重载
```

---

## 3. model — 模型管理

```bash
aipc-cli model list                                  # 列出所有模型
aipc-cli model info <model-id>                       # 查看模型详情
aipc-cli model register <model-path> [--id ID]       # 注册模型
aipc-cli model unregister <model-id>                 # 注销模型
aipc-cli model stats                                 # AI 运行时统计
```

---

## 4. device — 设备控制

```bash
aipc-cli device status                               # 查看设备状态
aipc-cli device light <level>                        # 白光补光灯（0-100）
aipc-cli device ir <on|off>                          # IR 红外灯开关
aipc-cli device ircut <auto|day|night>               # IR-Cut 滤镜模式
aipc-cli device ptz <action> [speed]                 # PTZ 云台控制
aipc-cli device zoom <in|out|stop> [speed]           # 变焦控制
aipc-cli device focus <near|far|auto|manual|stop>    # 对焦控制
aipc-cli device gpio <read|write> <pin> [value]      # GPIO 读写
```

**PTZ 动作列表**：`left`、`right`、`up`、`down`、`stop`、`preset`、`save`

**focus 子命令**（5 个）：

| 子命令 | 说明 |
|--------|------|
| `near` | 近焦 |
| `far` | 远焦 |
| `auto` | 自动对焦 |
| `manual` | 手动对焦 |
| `stop` | 停止对焦 |

**示例**：

```bash
aipc-cli device ptz left 50          # 向左旋转，速度 50
aipc-cli device ptz preset 1         # 调用预置位 1

> `ptz preset <id>` 中的 `<id>` 是预置位编号（1-16），不是速度参数。

aipc-cli device ptz save 1           # 保存预置位 1
aipc-cli device zoom in 30           # 放大，速度 30
aipc-cli device focus auto           # 自动对焦
aipc-cli device gpio read 12         # 读取 GPIO 12
aipc-cli device gpio write 21 1      # GPIO 21 输出高电平
```

---

## 5. stream — 视频码流

```bash
aipc-cli stream list                                 # 列出所有码流
aipc-cli stream info <stream-id>                     # 查看码流详情
aipc-cli stream url <stream-id> [--format rtsp|hls]  # 获取码流 URL
```

`--format` 参数支持 `rtsp`（默认）和 `hls` 两种格式。

---

## 6. event — 事件总线

```bash
aipc-cli event topics                                # 列出所有主题
aipc-cli event info <topic>                          # 查看主题详情
aipc-cli event stats [topic]                         # 查看统计信息
aipc-cli event publish <topic> <json> [--source S]   # 发布事件
aipc-cli event subscribe <topic> [-f] [--raw]        # 订阅事件
```

**示例**：

```bash
aipc-cli event publish app/alert '{"msg":"hello"}'       # 发布告警事件
aipc-cli event subscribe 'model/*/detections' -f         # 通配符订阅，实时跟踪
aipc-cli event subscribe app/test --raw --id my-sub      # 原始格式订阅，指定订阅 ID
```

---

## 7. media — 媒体配置

```bash
aipc-cli media config                                # 查看媒体配置
aipc-cli media image [--brightness N] [--contrast N] # ISP 图像参数
aipc-cli media encoder --stream <name> [--bitrate N] # 编码参数
aipc-cli media rtsp --enable|--disable               # RTSP 开关
aipc-cli media ai-overlay --enable [--show-label]    # AI 检测叠加层
aipc-cli media osd <json-config>                     # OSD 屏幕字符叠加
```

**encoder 编码器参数**：

| 参数 | 说明 |
|------|------|
| `--stream` | 码流名称（main / sub / third） |
| `--bitrate` | 码率 |
| `--fps` | 帧率 |
| `--gop` | GOP 组大小 |

---

## 8. system — 系统管理

```bash
aipc-cli system info                                 # 查看系统信息
aipc-cli system stats                                # 查看系统统计
aipc-cli system health                               # 系统健康检查
aipc-cli system status                               # 查看服务状态
aipc-cli system start                                # 启动所有服务
aipc-cli system stop                                 # 停止所有服务
aipc-cli system restart                              # 重启所有服务
aipc-cli system enable                               # 启用开机自启动
aipc-cli system disable                              # 禁用开机自启动
```

---

## 9. files — 文件管理

```bash
aipc-cli files list [path]                           # 列出文件
aipc-cli files get <path>                            # 读取文件内容
aipc-cli files put <path> <content>                  # 写入文件
aipc-cli files upload <local> <remote>               # 上传文件
aipc-cli files download <remote> [local]             # 下载文件
aipc-cli files delete <path>                         # 删除文件
aipc-cli files mkdir <path>                          # 创建目录
aipc-cli files rename <old> <new>                    # 重命名文件/目录
```

---

## 10. logs — 日志查看

```bash
aipc-cli logs services                               # 列出所有服务
aipc-cli logs files                                  # 列出日志文件
aipc-cli logs show [service] [--lines N] [--level L] # 查看日志
aipc-cli logs download <file>                        # 下载日志文件
```

---

## 11. monitor — 资源监控

```bash
aipc-cli monitor summary                             # 资源总览
aipc-cli monitor cpu                                 # CPU 使用率
aipc-cli monitor memory                              # 内存使用率
aipc-cli monitor disk                                # 磁盘使用率
aipc-cli monitor network                             # 网络统计
```

---

## 12. plugin — 插件管理

```bash
aipc-cli plugin list                                 # 列出所有插件
aipc-cli plugin info <app-id>                        # 查看插件详情
aipc-cli plugin capabilities                         # 列出所有能力
aipc-cli plugin check <app-id>                       # 检查插件依赖
```

---

## 13. event-log — 事件日志

```bash
aipc-cli event-log list [--category C] [--level L]   # 列出事件日志
aipc-cli event-log stats                             # 查看统计信息
aipc-cli event-log cleanup [--days N]                # 清理历史日志
```

---

## 14. process — 进程管理

```bash
aipc-cli process list [--sort cpu|mem|pid]           # 列出进程
aipc-cli process info <pid>                          # 查看进程详情
aipc-cli process kill <pid> [--signal SIGTERM]       # 终止进程
```

---

## 15. 其他功能

### Shell 补全

```bash
source <(aipc-cli completion bash)                   # Bash 补全
source <(aipc-cli completion zsh)                    # Zsh 补全
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `AIPC_API` | API 服务器地址 |
| `AIPC_OUTPUT_FORMAT` | 输出格式（table / json / yaml） |
| `AIPC_VERBOSE` | 启用详细输出 |

### 配置文件

默认配置文件路径为 `~/.aipc/config.yaml`：

```yaml
grpc:
  app_manager: unix:///run/aipc/app-manager.sock
  ai_runtime: unix:///run/aipc/ai-runtime.sock
  event_bus: unix:///run/aipc/event-bus.sock
  device_control: unix:///run/aipc/device-control.sock
  timeout: 30s
output:
  format: table
  color: true
```

---

## 16. 相关文档

- [平台架构](../3-platform-development/0-platform-architecture.md) — NE503 软件平台架构概述
- [应用开发指南](../4-application-development/1-app-reference.md) — 应用开发完整流程
- [RESTful API 参考](./1-restful-api.md) — HTTP API 接口参考
