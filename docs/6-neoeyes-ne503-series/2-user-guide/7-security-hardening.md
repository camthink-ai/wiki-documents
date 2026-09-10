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
| `:22` | SSH | 限制来源 IP，不使用时封禁 |

设备放在内网或 VLAN，禁止直接映射公网。需要远程访问时使用 VPN 或经过认证的内网代理。

<a id="4-app-permissions"></a>
## 3. 应用权限

安装应用时只授予实际需要的权限：

路径：**Applications → Import → Permissions**。

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-top.png" alt="Application Setup Wizard 的 Permissions 页面上部" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-bottom.png" alt="Application Setup Wizard 的 Permissions 页面下部" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

| 权限 | 原则 |
|:--|:--|
| AI Models Access | 只选实际调用的模型，并设置 QPS / 并发上限 |
| Video Stream Permissions | 只选实际读取的码流 |
| Event Permissions | 只选需要发布或订阅的主题 |
| Network Mode | 默认 **Isolated Mode**；确需访问外部服务时再评估 **Host** |
| Device controls | 按需授予灯光、IR Cut、PTZ、镜头控制 |

只安装自建镜像或官方 [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) 发布的包，并核对来源和版本。
