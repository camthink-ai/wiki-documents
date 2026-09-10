---
description: "NE503 production security baseline: credentials, network exposure, tokens, and app permissions."
keywords: [NE503 security, default password, RTSP, SSH, token, app permissions]
tags: [User Guide, NE503, Security]
---

# Security Hardening

Before production handover: change default credentials, restrict network access, and review app permissions.

## 1. Credentials and Tokens

### 1.1 Change the Web Password

1. Open **Settings → Device Info → Change Password**.
2. Enter the old password, new password, and confirmation.
3. Click **Confirm**.
4. Sign in again after the service returns.

![Change System Password dialog](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-settings-change-password.png)

The old Web session and token become invalid after the change. Current firmware does not force a first-login password change; a forgotten Web password cannot be recovered on the device, so contact support for reflashing.

### 1.2 SSH

~~~bash
ssh root@<device-ip>
passwd
~~~

Prefer key-based login in production.

### 1.3 API Tokens

Rotate the static API key in production and update integrations. Treat tokens like passwords; do not put them in logs or repositories. For API fields, authentication, and integration-key configuration, see the [neoruntime OpenAPI](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml).

## 2. Restrict the Network

| Port | Use | Recommendation |
|:--|:--|:--|
| `:443` | Web / REST API | Operations subnet only |
| `:8554` | RTSP | Video consumers only; no authentication |
| `:22` | SSH | Restrict source IPs; block when unused |

Keep the device on an intranet or VLAN; never port-forward it directly to the internet. For remote access, use a VPN or an authenticated internal proxy.

<a id="4-app-permissions"></a>
## 3. App Permissions

Grant only permissions required by the app:

Path: **Applications → Import → Permissions**.

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-top.png" alt="Upper part of the Application Setup Wizard Permissions page" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-bottom.png" alt="Lower part of the Application Setup Wizard Permissions page" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

| Permission | Principle |
|:--|:--|
| AI Models Access | Select required models; set QPS / concurrency limits |
| Video Stream Permissions | Select required streams only |
| Event Permissions | Select required publish / subscribe topics only |
| Network Mode | Keep **Isolated Mode** unless **Host** is required |
| Device controls | Grant light, IR Cut, PTZ, and lens control individually |

Install only self-built images or packages released by the official [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) repository, and verify the source and version.
