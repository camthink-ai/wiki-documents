---
id: ek410-power-management
title: Power Management
sidebar_position: 2
description: 常开 / 定时刷新 / 休眠的操作步骤、wakeSec 与唤醒方式、指示灯含义。
keywords: [EK410, 电源管理, 定时刷新, 休眠, wakeSec, 状态灯]
tags: [EK410, 用户指南, 电源]
---

# Power Management

电源相关都在 **系统** 页的 **工作模式** 卡片（同一页还有偏好、OTA，见截图）。也可用 API `getPowerParam` / `setPowerParam` 或 MQTT `set_power`。设置写入 NVS，重启仍有效。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/system.png" alt="系统页含工作模式" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

---

## 三种模式怎么选

| 模式 | 什么时候用 | 行为摘要 |
| :--- | :--- | :--- |
| **常开**（默认） | 要随时推屏、MQTT 常在线 | 不深睡；Wi‑Fi/MQTT 保持 |
| **定时刷新** | 看板每隔 N 分钟更新一次 | 醒 →（可选拉唤醒图）→ 在线 `wakeSec` 秒 → 睡 `sleepMin` 分钟 → 循环 |
| **休眠** | 长期不更新、极度省电 | 深睡到按键唤醒；画面保持 |

没有「半在线保活」档：MQTT keepalive 只在设备醒着时有效。

---

## 操作步骤：改成常开

1. 打开 **系统**。
2. 在工作模式中点选 **常开**。
3. 点 **保存工作模式**。
4. 概览页「休眠」应显示为常开。

需要临时睡一下：点 **立即休眠**（SoftAP 开着时会拒绝，先关热点）。

---

## 操作步骤：改成定时刷新（看板）

1. 打开 **系统** → 点选 **定时刷新**。
2. 填写：
   - **周期（分）** `sleepMin`：睡多久再醒，范围约 1～525600；
   - **在线窗（秒）** `wakeSec`：醒着联网多久，**30～600，默认 120**；
   - **唤醒图**（可选）：每次醒来要拉的图片 URL（平台可做成每次不同图）。
3. 点 **保存工作模式**。
4. 设备会按新周期武装休眠；若当前 SoftAP 开着或还没联网，可能推迟入睡（关热点 / 拿到 IP 后再睡）。

:::tip
开机后一直连不上路由器时，也会在最长在线窗（600 秒）后休眠，避免「永远醒着耗光电」。
:::

---

## 操作步骤：改成休眠

1. 点选 **休眠**。
2. 点 **保存工作模式**。
3. 行为：
   - 非 SoftAP：通常很快进入深睡；
   - **在 SoftAP 下保存**：界面会按「关机」语义提示，但**真正入睡要等热点关闭**（避免配网中途睡死）。

唤醒见下一节。

---

## 深睡后如何唤醒

| 操作 | 结果 |
| :--- | :--- |
| 短按 / 长按 **MAIN** | 唤醒并进入 SoftAP（蓝灯） |
| 短按 / 长按 **PAGE** | 唤醒并进入 BLE（青灯） |
| 定时器（仅定时刷新） | 到点自动醒，可拉唤醒图 |
| 硬件 **RESET** | 退出配网 handoff，恢复上次画面 |

:::note 醒着时短按 MAIN / PAGE
**不会**开关 SoftAP / BLE（灯色也不变），但会取消当前休眠计时并在松开后**重新布防**在线窗（定时刷新模式下尤其明显：短按等于「再醒一会儿」）。若需要开配网，仍须**长按约 2.5 秒**。
:::

---

## 偏好：URL 图片画质

同一「系统」页上方 **偏好 → URL 图片**：

| 选项 | 影响 |
| :--- | :--- |
| **效果优先**（默认） | 设备侧 URL/唤醒图解码更细、更慢 |
| **速度优先** | 更快；颗粒感更强；超大 JPEG 可能下采样 |

只影响设备自己拉 URL 的路径；浏览器「图片模式」推屏不受影响。

语言切换（中文 / English）也在偏好里，仅改本机网页语言。

---

## 状态灯速查

| 颜色 | 含义 |
| :--- | :--- |
| 蓝闪 | SoftAP |
| 橙闪 | 连 / 重连 Wi‑Fi |
| 青闪 | BLE |
| 绿常亮 | 运行中（已联网）或未配网待机 |
| 红短闪 | 故障（配网 / OTA / 面板） |
| 紫快闪 | OTA 中 |
| 灭 | 深睡（灯与面板供电关） |

MQTT 连没连**不会**单独改灯色，请看概览徽章。

---

## API / MQTT 提示

- `setPowerParam`：**请求体里出现的字段才改**；既无 `mode` 也无 `sleepMin` 时不改休眠排程（可只改 `wakeSec` / `wakeUrl` / `imageQuality`）。
- 可能返回 `sleepDeferred: "softap"` 或 `"no_sta"`。
- SoftAP 开启时 `sleepNow` 拒绝。

详见 [HTTP API](../4-software-guide/1-http-api.md)、[MQTT 协议](../4-software-guide/2-mqtt-protocol.md)。

## 相关资料

- [系统维护](./3-system-maintenance.md)
- [快速入门](../1-quick-start.md)
