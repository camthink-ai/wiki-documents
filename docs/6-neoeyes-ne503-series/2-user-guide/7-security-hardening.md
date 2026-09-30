---
description: NE503 生产环境安全基线：凭据改密、网络端口限制、API Token 和应用权限配置。
keywords: [NE503 安全, 默认密码, RTSP, SSH, Token, 应用权限]
tags: [用户指南, NE503, 安全]
---

# Security Hardening

生产交付前完成：修改默认凭据、限制网络访问、核对应用权限。

## 1. 凭据与 Token

### 1.1 Web 改密

1. 进入 **Settings → Device Info → Change Password**。
2. 填写旧密码、新密码和确认密码。
3. 点击 **Confirm**。
4. 服务恢复后使用新密码重新登录。

![Change System Password 对话框](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-settings-change-password.png)

改密后旧 Web 会话和 Token 失效。当前固件不会强制首次改密；忘记 Web 密码无法通过设备恢复，只能联系支持重新刷机。

### 1.2 SSH

~~~bash
ssh root@<设备IP>
passwd
~~~

生产环境优先使用密钥登录。

### 1.3 API Token

生产环境更换 API 静态密钥并同步对接系统。Token 按密码保管，不写入日志或仓库；API 字段、认证方式和集成密钥配置见 [neoruntime OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml)。

## 2. 网络限制

| 端口 | 用途 | 建议 |
|:--|:--|:--|
| `:443` | Web / REST API | 仅允许运维网段 |
| `:8554` | RTSP | 仅允许视频消费端；无认证 |
| `:8081` TCP / `:3702` UDP | ONVIF（默认关闭，启用 onvif-device 后暴露） | 使用 ONVIF 对接时仅允许 NVR / VMS 网段 |
| `:22` | SSH | 限制来源 IP，不使用时封禁 |

设备放在内网或 VLAN，禁止直接映射公网。需要远程访问时使用 VPN 或经过认证的内网代理。

<a id="4-app-permissions"></a>
## 3. 应用权限

安装应用时只授予实际需要的权限：

路径：**Applications → Import** 向导。模型访问权限在向导的 **Models** 区配置，码流、事件和网络权限在 **Permissions** 区配置。

![应用向导权限配置](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/app-wizard-permissions.png)

| 配置区 | 权限 | 原则 |
|:--|:--|:--|
| Models | Model Dependencies | 只声明应用实际调用的模型别名；设置 Max Inference QPS / Max Concurrent Inference 上限；非必要时关闭 Allow Dynamic Model Registration |
| Permissions | Video Stream Permissions | 只选实际读取的码流 |
| Permissions | Event Permissions | 只选需要发布或订阅的主题 |
| Permissions | Network Mode | 默认 **Isolated Mode**；确需访问外部服务时再评估 **Host** |

> 设备控制权限配置在 v1.1.0 的导入向导中暂时隐藏。

只安装自建镜像或官方 [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) 发布的包，并核对来源和版本。
