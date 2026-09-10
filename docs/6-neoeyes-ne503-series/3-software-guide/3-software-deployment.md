---
description: NE503 平台软件安装与升级指南，包含网页升级、SSH 部署、版本验证和回滚。
keywords: [NE503, 平台软件, 网页升级, OTA, deploy.sh, 发布包]
tags: [应用指南, NE503, 软件部署, 运维]
---

# Software Deployment

本页用于安装或升级 NE503 平台软件发布包（`.tar.gz`）。系统 OS 使用 `.swu` 包。

## 1. 准备发布包

从 [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) 下载 `aipc-hailo15-<version>.tar.gz`。

开始前确认：

- 目标设备为 NE503，Web 控制台或 SSH 可用。
- 网页升级使用管理员账号；SSH 部署需要 `root` 权限。
- `/data` 可写且空间足够：`df -h /data`。
- 记录当前 `Firmware Version`，升级期间保持供电和网络稳定。

## 2. 通过网页升级

适用于已运行且可以访问 Web 控制台的设备。

1. 打开 `https://<device-ip>`，登录管理员账号。
2. 进入 `Settings → Device Info`。
3. 在 `Firmware & Hardware` 中找到 `Firmware Version`，点击对应的 `Update`。不要点击 `System OS Version` 的 `Update`。

   ![平台软件升级窗口](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/software-deployment/software-upgrade.jpg)

4. 上传一个 `aipc-hailo15-<version>.tar.gz` 文件。
5. 确认供电稳定，勾选 `I understand and wish to continue with the upgrade`，点击 `Confirm Update`。
6. 等待上传、写入和重启完成。期间不要刷新页面、重复点击或断电。
7. 设备重新上线后重新登录，在 `Firmware Version` 中确认目标版本。

**成功：**设备重新上线，可以重新登录，且 `Firmware Version` 显示目标版本。出现 `Device offline` 时，检查供电和网络，再点击 `Re-detect`。

## 3. 通过 SSH 安装或升级

网页不可用或需要命令行部署时，执行 `deploy.sh`：

```bash
scp build/release/aipc-hailo15-<version>.tar.gz root@<device-ip>:/data/
ssh root@<device-ip>
cd /data
tar xzf aipc-hailo15-<version>.tar.gz
cd aipc-hailo15-<version>
./deploy.sh
```

出现 `Proceed with deployment? [y/N]` 时确认并输入 `y`。成功时包含：

```text
[deploy]   Deploy successful!
[deploy]   Version: <version>
```

安装路径为 `/data/aipc`。版本或兼容性不匹配时，脚本不会停止现有服务。

常用参数：

| 参数 | 作用 |
|:---|:---|
| `--no-config` | 保留设备现有配置 |
| `--status` | 查看当前版本和备份信息 |
| `--rollback` | 从最近备份恢复上一版本 |

## 4. 升级后验证与回滚

网页重新登录后，在 `Settings → Device Info` 确认 `Firmware Version` 已更新。

升级 firmware 时会自动升级 MCU。如需查询 MCU 版本，执行：

```bash
aipc-cli device status
```

在输出的 `MCU` 部分确认 `Version`：

```text
MCU:
  Version:      0.1.8.0
```

SSH 验证版本：

```bash
cat /data/aipc/VERSION
```

**成功：**输出完整 `VERSION` 内容，版本与目标版本一致。需要回退时，在发布包目录执行：

```bash
./deploy.sh --rollback
```

回滚需要设备上存在可用备份。

## 5. 相关文档

- [故障排查](../5-troubleshooting.md) — 服务、网络和存储问题
- [NeoRuntime deployment guide](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/DEPLOYMENT.md) — `deploy.sh` 说明
