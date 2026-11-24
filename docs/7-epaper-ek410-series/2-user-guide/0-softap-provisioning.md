---
id: ek410-softap-provisioning
title: Provisioning and Connectivity
sidebar_position: 0
description: SoftAP / BLE 配网、Wi-Fi 试连保存、MQTT / MQTTS 字段说明与常见故障排查。
keywords: [EK410, SoftAP, BLE, NeoLinker, CT-Prov, 配网, Wi-Fi, MQTT]
tags: [EK410, 用户指南, 配网]
---

# Provisioning and Connectivity

本页按「你要点哪里、每个字段做什么」说明配网与联网。首次走 SoftAP 的完整路径见[快速入门](../1-quick-start.md)。

SoftAP（网页）与 BLE（NeoLinker）**同一固件、运行时互斥**：开一个会关另一个。

## 操作入口：网络页

左侧点 **网络**。页面分三块：**Wi‑Fi**、**MQTT**、**配网方式**。

默认附近网络列表是**收起**的（只见 **Show networks** / **Refresh**）：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network.png" alt="网络页默认（列表收起）" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

点 **Show networks**（或 **Refresh** 扫描成功后）展开列表，**点选一行即可填入 SSID**：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network-scan-expanded.png" alt="Show networks 展开后的附近网络列表" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

---

## SoftAP 热点（网页配网）

### 怎么开 / 关

| 方式 | 具体操作 |
| :--- | :--- |
| 按键 | **长按 MAIN 约 2.5 秒** → 蓝灯闪；屏幕出引导页 |
| 网页 | 「网络」→ 配网方式 → **开启 SoftAP** |
| 关热点 | 配网方式 / SoftAP 横幅上的关闭；或空闲超时自动关 |
| API | `POST /api/v1/network/openSoftAp` / `closeSoftAp`（切换完成前可能先返回，请轮询 `getDevInfo.softapUp`） |

### 连接参数（给手机 / 电脑）

| 项目 | 值 |
| :--- | :--- |
| 热点名 | `EK410_<MAC6>`（**SoftAP 接口 MAC** 末 3 字节，大写十六进制；与屏上引导页一致） |
| 密码 | `12345678` |
| 浏览器地址 | `http://192.168.4.1`（不要用 https） |
| 空闲关闭 | 约 **2 分钟**无操作（有 HTTP 访问会续期） |
| 硬上限 | 约 **15 分钟**，有客户端也会关 |

:::note SSID 与 `devMac` 可能不一致
`getDevInfo.devMac` 是 **STA MAC**；热点名用的是 **SoftAP MAC**。在 ESP32 上 SoftAP 末字节通常为 STA+1，例如 STA `…:3C` → 热点 `EK410_…3D`。请以屏上 / `softApSsid` 为准，不要用 STA 末 3 字节去搜网。
:::

配网时设备为 **APSTA**：热点与家里 Wi‑Fi 可同时存在，所以你能在网页上直接看到「保存并连接」的试连结果。

### 关热点后屏幕会怎样

- 若还没有用户推过图：恢复 CamThink logo；
- 若已有 `lastfrm`：恢复上次用户画面；
- 按硬件 **RESET**：退出 SoftAP / BLE handoff，并恢复上次画面。

---

## BLE CT-Prov（NeoLinker）

适合不想连 SoftAP、用手机 App 配网的场景。

| 步骤 | 操作 |
| :--- | :--- |
| 1 | **长按 PAGE 约 2.5 秒**（或网络页 → **开启 BLE（NeoLink）**） |
| 2 | 状态灯变为**青色闪烁**；SoftAP / 网页服务会停掉 |
| 3 | 打开 [NeoLinker](https://github.com/camthink-ai/NeoLinker)，在扫描列表中找广播名 **`EK410-XXXXXX`**（**连字符** `-`，后缀同 SoftAP MAC 末 3 字节；注意不是热点名里的下划线 `_`） |
| 4 | 按 App 提示完成 CT-Prov/1 绑定 |
| 5 | 退出：再长按 PAGE、空闲约 2 分钟、`session.close`，或长按 MAIN 切回 SoftAP |

`openBleProv` 可带 `{idleSec}`（CI 用）。最长窗口与 SoftAP 一样约 15 分钟。协议细节见固件仓 [`docs/ct_prov.md`](https://github.com/camthink-ai/EK410/blob/main/docs/ct_prov.md)；HTTP 侧也可对 `POST /api/v1/ctprov` 发 JSON 信封（STA IP 同样可达）。

---

## Wi‑Fi：逐步操作与字段

### 推荐操作顺序

1. 打开「网络」→ Wi‑Fi 卡片。
2. 点 **刷新**，在列表里点选目标 SSID（自动填入输入框）。
3. 输入密码；需要核对点 **显示**。
4. 点 **保存并连接**，盯住卡片顶部状态条。
5. 成功：绿色「已连接」+ SSID + IP；失败：改密码重试（不会抹掉旧的可用配置）。

### 字段说明

| 字段 / 控件 | 是否必填 | 说明 |
| :--- | :--- | :--- |
| 附近网络列表 | — | 点刷新扫描；可展开/收起 |
| SSID | 是 | 2.4 GHz；可选手动输入 |
| 密码 | 加密网络是 | **读取时永不返回密码**，只知是否已存；同一 SSID 下留空表示沿用旧密码 |
| 保存并连接 | — | **先试连约 20 秒，成功才写 NVS**；不重启设备 |

### 连接状态（概览 / `wifiState`）

| 状态 | 含义 | 建议 |
| :--- | :--- | :--- |
| 未连接 / idle | 无凭据或未在连 | 去保存 Wi‑Fi |
| 连接中 | 试连中 | 等待 |
| 已连接 | 已有 IP | 可配 MQTT、推图 |
| 重连中 | 曾连上又断了，指数退避 1s→60s | 查信号与密码，必要时重新保存 |

---

## MQTT：逐步操作与字段

### 推荐操作顺序

1. 确认 Wi‑Fi 已是「已连接」（测连接需要 STA）。
2. 选 **协议**：MQTT 或 MQTTS（与平台一致；**不会**根据端口自动切换）。
3. 填 **服务器**、**端口**（MQTT 常用 1883，MQTTS 常用 8883）。
4. 若选 MQTTS：默认 **校验证书 = 开启**（系统 CA）；实验室自签可关校验或贴自定义 CA PEM。
5. **Client ID** 只读（`ek410-{deviceId}`），不要改。
6. **QoS** 一般选 1。
7. 按平台要求填用户名 / 密码。
8. 展开 **查看 MQTT 主题**，核对 uplink / downlink。
9. 点 **测试连接** 看结果；再点 **保存**。
10. 到 NeoMind 设备列表审批该设备。

### 字段说明

| 字段 | 说明 |
| :--- | :--- |
| 协议 | `MQTT` / `MQTTS` 显式选择 |
| 校验证书 | MQTTS 默认开；关则仅建议内网调试 |
| 自定义 CA | 可选 PEM；留空用系统 CA 包 |
| 服务器 / 端口 | 必填 |
| Client ID | 只读，`ek410-{deviceId}` |
| QoS | 0 / 1 / 2 |
| 用户名 / 密码 | 可选；密码**永不回读**（`hasPassword`）。留空仅在 **host 与用户名都不变** 时沿用旧密码；改其一会清掉旧密码并可能提示 `warn` |
| 上报 / 下行主题 | 只读：`device/ek410_Eink/{deviceId}/uplink\|downlink` |

### SoftAP 下测 MQTT 的注意点

- 必须已连上家里 Wi‑Fi（APSTA）。
- 保存或测试时网页可能短暂卡住，属正常；完成后看概览 MQTT 徽章或 `mqttConnected`。
- SoftAP 下更推荐：保存后轮询概览，而不是反复猛点测试。

指令与上报格式见 [MQTT 协议](../4-software-guide/2-mqtt-protocol.md)。

---

## 常见问题

| 现象 | 检查 | 处理 |
| :--- | :--- | :--- |
| 搜不到热点 | 是否长按 MAIN≥2.5s、蓝灯？是否已满 15 分钟自动关？是否按 **STA MAC** 去搜了？ | 再长按 MAIN；以屏上 / `softApSsid` 为准（SoftAP MAC，常为 STA 末字节 +1） |
| 打开 192.168.4.1 无响应 | 是否还连着设备热点？手机是否切回 4G？ | 关移动数据；刚开过 BLE 需先退出 BLE |
| Wi‑Fi 一直重连 | 密码、2.4 GHz、信号、路由器隔离 | 重新「保存并连接」（试连约 **20 秒**） |
| MQTT 失败 | 协议/端口是否匹配、证书、密码是否因改 host 被清空 | 测连接；改 host/用户后重填密码 |
| BLE 配不上 | 是否青灯？是否同时开着 SoftAP？广播名是否找成下划线版？ | 关 SoftAP；搜 **`EK410-XXXXXX`**（连字符）；空闲超时后重新开 BLE |

---

## 相关资料

- [快速入门](../1-quick-start.md)
- [HTTP API](../4-software-guide/1-http-api.md)
- [MQTT 协议](../4-software-guide/2-mqtt-protocol.md)
- [系统维护](./3-system-maintenance.md)（恢复出厂后需重新配网）
