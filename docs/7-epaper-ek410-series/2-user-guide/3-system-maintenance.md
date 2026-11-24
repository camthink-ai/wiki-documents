---
id: ek410-system-maintenance
title: System Maintenance
sidebar_position: 3
description: 设备信息、改名、事件日志、OTA 升级、重启与恢复出厂的逐步操作。
keywords: [EK410, 系统维护, OTA, 固件升级, 恢复出厂]
tags: [EK410, 用户指南, 系统维护]
---

# System Maintenance

「系统」页集中：偏好、设备信息、事件日志、危险操作、工作模式、名称与升级。工作模式详见[电源管理](./2-power-management.md)。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/system.png" alt="系统页" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

---

## 查看设备信息

在 **设备信息** 卡片可读：

| 界面项 | 含义 |
| :--- | :--- |
| MAC | STA MAC |
| 固件 | 当前版本（本文档对应 **1.3.10**） |
| 分区 | 正在运行的 OTA 槽（`ota_0` / `ota_1`） |

更全的字段来自 `getDevInfo`（概览也会用）：`deviceId`、IP、Wi‑Fi/MQTT 状态、`batteryPercent`、`uptime_s`、`otaState`、`powerMode` / `sleepMin` / `wakeSec`、`softapUp` / `bleProvUp` 等。

---

## 修改设备名：步骤

1. 滚到 **名称与升级**。
2. 在 **设备名** 输入框修改（UTF‑8，**最长 32 字节**；过长会报错）。
3. 点 **保存**。
4. 概览标题与 MQTT 遥测中的 `devName` 会更新。

:::tip
输入过程中概览轮询**不会**把你正在改的名字冲掉。
:::

---

## 事件日志：步骤

1. 在 **事件日志** 看占用（例如上限约 48KB / 7 天）。
2. **下载日志**：保存为文本，便于排查配网 / Wi‑Fi / MQTT / 刷屏 / 休眠。
3. **清空**：擦除日志（失败时界面会提示）。

不要把含密码、完整 MAC 策略以外的敏感信息发到公开工单；发日志前自行脱敏。

---

## OTA 升级：两种方式

### 方式 A：上传本地固件包（推荐现场）

1. 准备发布产物 `ek410.bin`（或官方发布包）。
2. **名称与升级** → **选择文件**，选中 `.bin`。
3. 点 **上传升级**。
4. 看进度条；状态灯应为**紫色快闪**。
5. 设备重启后进新分区；若面板自检失败或设备不可达，bootloader 会回滚。

### 方式 B：HTTPS URL

1. 把固件放到可 HTTPS 访问的地址（**禁止 HTTP OTA**）。
2. 在 **OTA URL** 填入 `https://...`。
3. 点 **URL 升级**。
4. 接口可能在下载开始前就返回成功：请看页面状态或轮询 `otaState`：
   - `running`：进行中；
   - `failed`：看 `otaError`，网页会如实提示失败；
   - 成功：设备重启进新固件。

| 机制 | 说明 |
| :--- | :--- |
| 双分区 | `ota_0` / `ota_1` 各 4MB，失败不影响当前系统 |
| 确认条件 | 面板自检通过 **且** 设备可达（Web 起来或 STA 在线）后才确认 |
| MQTT | 大下载期间会暂停，结束后恢复 |

---

## 重启

1. **危险操作** → **重启设备**。
2. 配置保留；等设备重新出现在网络中再打开控制台。

---

## 恢复出厂：步骤与后果

恢复出厂会清除 Wi‑Fi、MQTT、电源等配置、**BLE 配对**与事件日志；**保留 `deviceId`**（NeoMind 身份不变），然后重启。之后需重新配网。

### 网页

1. **危险操作** → **恢复出厂**。
2. 按提示确认。
3. 等待重启后重新走 SoftAP 或 BLE。

### 按键（无法打开网页时）

| 方式 | 操作 |
| :--- | :--- |
| 双键 | **MAIN + PAGE 同时持续按住约 6 秒**（中途松开无效） |
| 开机 BOOT | 开机约 50 ms 内 BOOT（GPIO9）为低 → 出厂；检修用。**复位全程按住 BOOT 会进 ROM 下载模式**，勿与出厂混淆 |

---

## 相关资料

- [电源管理](./2-power-management.md)
- [HTTP API](../4-software-guide/1-http-api.md)
- [开发环境](../4-software-guide/0-development-environment.md)
