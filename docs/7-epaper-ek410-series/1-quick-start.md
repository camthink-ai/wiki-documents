---
id: ek410-quick-start
title: Quick Guide
sidebar_position: 1
description: EK410 手把手上手：开箱充电、长按 MAIN 开 SoftAP、连热点进 Web 控制台、配 Wi‑Fi、推送第一张图。
keywords: [EK410, 快速入门, SoftAP 配网, Web 控制台, 电子纸标牌]
tags: [EK410, 快速入门, 配网]
---

# Quick Guide

<div align="center">
  <img src="/img/epaper-ek410-series/quick-start/hero-effect.webp" alt="EK410 屏幕效果示意" style={{ maxWidth: '520px', width: '100%', height: 'auto' }} />
</div>

本页按**第一次开箱到屏幕上出现你的第一张图**写操作步骤。每一步都写清：按哪个键、点哪个按钮、成功时长什么样。字段细表与排障见用户指南。

也可用手机 App [NeoLinker](https://github.com/camthink-ai/NeoLinker) 走 BLE（长按 **PAGE**），广播名 **`EK410-XXXXXX`**（连字符）；见[配网与连接](./2-user-guide/0-softap-provisioning.md)。

下文截图为 Web 控制台**英文界面**（系统页可将语言切到中文）。SoftAP 下打开 `http://192.168.4.1`，与入网后用 STA IP 打开，是同一套页面。

## 你将完成什么

1. 充电 / 上电，认出状态灯；
2. 长按 **MAIN** 打开 SoftAP，手机连上热点并打开 Web 控制台；
3. 在 **Network** 页加入家里 / 办公室 **2.4 GHz** Wi‑Fi；
4. （可选）填写 NeoMind MQTT 并测试；
5. 在 **Display** 页用三个 Tab（**Image / Editor / Markdown**）之一推屏；上手先走 **Image**。

预计纯操作约 **10–15 分钟**（不含全刷等待的 25–35 秒）。

## 开箱与准备

包装内通常有：电子纸终端 ×1、桌面支架杆 ×1、USB Type-C 线 ×1、电子版说明书。

| 准备项 | 说明 |
| :--- | :--- |
| EK410 整机 | 建议先用 Type-C **充满或充一段时间**再长时间演示 |
| 桌面支架杆（可选） | 装上后可立在桌面；也可壁挂，保持 Type-C / TF 口可触及 |
| 手机或电脑 | 能连 Wi‑Fi、用 Chrome / Safari 等浏览器 |
| 2.4 GHz Wi‑Fi | 记下 **SSID** 与 **密码**（配网扫描为 2.4 GHz；画册若写 5 GHz 频段以交付硬件为准） |

### 按键与接口

先认清机身位置（顶边 / 背面 / 底边）：

<div align="center">
  <img src="/img/epaper-ek410-series/quick-start/interfaces.png" alt="EK410 按键与接口示意" style={{ maxWidth: '640px', width: '100%', height: 'auto' }} />
</div>

| 图中标注 | 位置 | 固件名 / 说明 | 上手用途 |
| :--- | :--- | :--- | :--- |
| **Button** | 顶边 | **MAIN** | 长按约 2.5 秒 → 开 SoftAP；深睡短按 → 唤醒进 SoftAP |
| **Reset** | 顶边针孔 | **RESET** | 硬件复位 |
| **Switch button** | 背面侧键 | **PAGE** | 长按约 2.5 秒 → BLE 配网（本教程可先不做） |
| **LED** | 底边 | 状态灯 | 见下方「状态灯说明」 |
| **USB-C** | 底边 | 充电 / 调试 | 充电；开发时也可作串口 |
| **Micro SD Card** | 底边 | TF 卡槽 | 可选扩展存储 |

另有 **BOOT**（检修 / 出厂恢复用），首次上手不用按。更细的 GPIO / 分区见[硬件规格](./3-hardware-guide/0-specifications.md)。

#### 按键操作

| 按键 | 怎么按 | 设备做什么 | 状态灯 |
| :--- | :--- | :--- | :--- |
| **MAIN**（图中 Button） | **长按约 2.5 秒**再松开 | 打开 SoftAP 热点与 Web 控制台；若当时在 BLE 配网，会先关掉 BLE | **蓝色闪烁** |
| **MAIN** | **短按**（醒着时） | 无配网动作；灯色不变 | 保持原状 |
| **MAIN** | 深睡时 **短按或长按** | 唤醒，并进入 SoftAP | 醒后 **蓝色闪烁** |
| **PAGE**（图中 Switch） | **长按约 2.5 秒**再松开 | 进入 BLE CT-Prov（NeoLinker）；**再长按一次**关闭 BLE | **青色闪烁**（开着时） |
| **PAGE** | **短按**（醒着时） | 当前固件无翻页业务；灯色不变 | 保持原状 |
| **PAGE** | 深睡时 **短按或长按** | 唤醒，并进入 BLE | 醒后 **青色闪烁** |
| **MAIN + PAGE** | **同时按住约 6 秒**（中途松开无效） | 恢复出厂设置（保留 `deviceId`），随后重启 | 触发时 **红色快闪**，再重启 |
| **RESET**（针孔） | 短按 / 顶针复位 | 硬件复位；退出 SoftAP / BLE，恢复上次墨水画面（无画面则 CamThink logo） | 复位过程中可能灭灯，再按开机逻辑点亮 |
| **BOOT** | 上电瞬间按住约 50 ms | 恢复出厂（检修用）；**复位全程按住**会进 ROM 下载模式 | 首次上手请勿按 |

:::tip 上手记住两句
日常配网：**长按顶边 MAIN ≈ 2.5 秒 → 看蓝灯**。换 BLE：**长按背面 PAGE ≈ 2.5 秒 → 看青灯**。SoftAP 与 BLE **不能同时开**。
:::

#### 状态灯说明

底边 **LED** 为 RGB 状态灯（由扩展芯片驱动）。**MQTT 连接状态不改灯色**——看 Overview / Network 页徽章即可。短按 MAIN / PAGE **不会**特意闪蓝或青，只有长按配网动作才抢占灯色。

| 灯色 / 形态 | 含义 | 你该怎么做 |
| :--- | :--- | :--- |
| **绿色常亮** | 正常运行：已连上家里 Wi‑Fi，或尚未配网的待机 | 未配过网 → 长按 MAIN 开 SoftAP；已配网 → 可用 STA IP 开网页 |
| **蓝色闪烁**（约 1 Hz） | SoftAP 已开启 | 手机连 `EK410_<MAC6>`（**SoftAP MAC** 后缀，常与网页里的 STA `devMac` 差末字节），打开 `http://192.168.4.1` |
| **橙色闪烁**（约 1 Hz） | 正在连接 / 重连家里 Wi‑Fi（SoftAP 未开时） | 等结果；久不成功到 Network 页改密码或靠近路由器 |
| **青色闪烁**（约 1 Hz） | BLE CT-Prov 窗口打开 | 用 NeoLinker；或再长按 PAGE 退出；也可长按 MAIN 改开 SoftAP |
| **红色短闪 / 脉冲** | 瞬时故障（SoftAP / BLE 打开失败、OTA / 面板异常等） | **不会常亮**；看完是否恢复绿 / 蓝 / 橙；反复出现查 Event log 或串口 |
| **紫色快闪**（约 4 Hz） | OTA 固件升级进行中 | **勿断电**；等升级结束自动重启 |
| **灭灯** | 深睡：灯与面板供电已关；画面仍保持在墨水屏上 | **短按 MAIN** 唤醒进 SoftAP，或短按 PAGE 唤醒进 BLE |

:::note
- SoftAP 开着时优先显示**蓝闪**（即使同时在连家里网，也不要用「有没有橙灯」判断 STA 是否成功——以网页 Connected + IP 为准）。
- BLE 空闲约 2 分钟会自动退出；退出后若已联网多为绿常亮，若仍在连网则为橙闪，**不会**一直卡在红灯。
- 开机刷屏（约数十秒）期间灯可能先灭再按状态点亮，属正常。
:::

## 1. 上电，确认设备醒着

**操作：**

1. 用包装内 Type-C 线接上充电器（或确认电池有电）。
2. 等待墨水屏出现 **CamThink** logo 开机画面（全刷会稍慢，属正常）。
3. 对照上方「状态灯说明」看底边 LED；常见起步状态：

| 灯色 | 下一步 |
| :--- | :--- |
| 绿色常亮 | 未配过网 → 做第 2 步开 SoftAP |
| 蓝色闪烁 | SoftAP 已开 → 直接做第 3 步连热点 |
| 橙色闪烁 | 正在连 / 重连 Wi‑Fi → 等结果，或稍后到 Network 页改密码 |
| 青色闪烁 | 正在 BLE → 再长按 PAGE 退出，或改用 NeoLinker |
| 灭灯 | 深睡 → **短按 MAIN** 唤醒（会进 SoftAP），再继续 |

**成功标准：** 能看到开机画面或状态灯不是一直灭着不理人。

## 2. 长按 MAIN，打开 SoftAP

**操作：**

1. 找到 **MAIN** 键，**按住约 2.5 秒**再松开（松太早不会开热点）。
2. 看灯：应变为 **蓝色闪烁**。
3. 看屏：应刷出配网引导页——大字说明 + **二维码**（扫码可打开控制台地址）。

记下引导页上的热点名，规则是：

:::info SoftAP 参数（写死，不用改）
- **SSID**：`EK410_<MAC6>`（**SoftAP 接口 MAC** 末 3 字节大写十六进制，与屏上一致；常与 Overview 里的 STA `devMac` 末字节差 1）
- **密码**：`12345678`
- **控制台**：`http://192.168.4.1`（必须 http，不要加 s）
- **超时**：空闲约 **2 分钟**无操作会关热点（有人打开网页会续期）；即使还连着手机，大约 **15 分钟**也会强制关掉 → 再长按 MAIN 即可
:::

**成功标准：** 蓝灯闪 + 屏上有配网引导 / 二维码。

## 3. 手机连热点，打开 Web 控制台

**操作：**

1. 打开手机（或电脑）**Wi‑Fi 设置**，找到 `EK410_XXXXXX`，密码输入 `12345678`，连接。
2. 若手机提示「此网络无法上网」并自动切回 4G/5G：
   - **关掉移动数据**，或
   - 在系统提示里选 **保持使用此 WLAN / 不切换**。  
   否则浏览器打不开 `192.168.4.1`。
3. 打开浏览器，地址栏输入：`http://192.168.4.1` → 回车。
4. 应进入 CamThink EK410 控制台。桌面端左侧栏、手机端底部可见：**Overview / Network / Display / System**。

### 先看一眼 Overview（概览）

点 **Overview**（默认就在这页）：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/quick-start/overview.png" alt="Overview 页" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

对照检查：

| 你看到的 | 含义 |
| :--- | :--- |
| 徽章 **Hotspot on**（或中文「热点开启」） | SoftAP 正常 |
| **WLAN** 未连接 | 正常，还没配家里网 |
| 橙色按钮 **Configure network** | 点它进 Network，下一步要用 |
| **Edit screen** | 进 Display，推图时用 |
| **Current panel** 提示尚无画面 | 正常；推屏成功后这里会出现快照 |

:::tip 入网之后怎么再打开控制台
家里 Wi‑Fi 配成功后，Overview 上会出现 **IP**（如 `192.168.31.241`）。手机改连家里 Wi‑Fi，浏览器打开 `http://该IP` 即可，**不必再连 SoftAP**。
:::

### 控制台四页怎么分

| 侧栏页 | 页面上有什么 | 本教程 |
| :--- | :--- | :--- |
| **Overview** | 状态徽章、快捷按钮、Current panel 快照 | 步骤 3 |
| **Network** | 左 **Wi‑Fi**、右 **MQTT**、底 **Provisioning** | 步骤 4–5 |
| **Display** | 顶栏三个 Tab：**Image / Editor / Markdown** + 共用预览工具 | 步骤 6 |
| **System** | Preferences、Device info、Event log、Danger zone、Work mode、Name & update | 步骤 8 |

**成功标准：** 浏览器里能稳定打开 Overview，不是超时空白页。

## 4. 配置家里 Wi‑Fi（必做）

### Network 页长什么样

点 **Network**（或 Overview 的 **Configure network**）后，桌面大致是三块：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network.png" alt="Network 页默认：列表收起，可见 Show networks" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| 区域 | 英文界面上的名字 | 作用 |
| :--- | :--- | :--- |
| 左栏 | **Wi‑Fi** | 扫附近网、填 SSID / Password、**Save & connect** |
| 右栏 | **MQTT** | 接 NeoMind（本步可先不做，见步骤 5） |
| 底栏 | **Provisioning** | 网页里开 / 关 SoftAP 与 BLE；二者互斥 |

Wi‑Fi 卡片常用控件：

| 控件 | 说明 |
| :--- | :--- |
| 顶部状态条 | 成功时绿色 **Connected · SSID · IP** |
| **Show networks** / **Hide list** | **交互开关**：收起时只显示按钮；点开后才出现附近 SSID 列表（按钮文案变成 **Hide list**） |
| **Refresh** | 重新扫描 2.4 GHz；扫描中按钮会暂时禁用 |
| **SSID** / **Password** | 可选手动输入；点列表项会自动填 SSID；**Show** 核对密码 |
| **Save & connect** | **先试连约 10–20 秒，成功才写 NVS**；失败不抹掉旧的可用密码 |

#### Show networks：展开后长这样

默认列表是**收起**的（上图）。点 **Show networks**（或先点 **Refresh**，扫描成功后列表也会展开），才会看到可点选的附近网络：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network-scan-expanded.png" alt="Show networks 展开：附近 SSID 列表，点选后填入 SSID" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| 你在展开态会看到 | 含义 |
| :--- | :--- |
| 按钮变成 **Hide list** | 列表已展开；再点可收起 |
| 每行 SSID + 锁图标 + 信号格 | 可点击；**点选一行 → SSID 框自动填入该名称**（当前已连上的项会高亮） |
| 列表可滚动 | 周围热点多时上下滑，不要以为只有首屏几条 |

**操作（请严格按顺序点）：**

1. 进入 **Network** → 看左侧 **Wi‑Fi**。
2. 点 **Refresh** 扫描；若列表仍收着，再点 **Show networks** 展开。
3. 在列表里 **点选**你的 2.4 GHz SSID（点选后会填进 SSID 框）；也可手动输入。
4. 在 **Password** 输入密码；开放网络可不填。
5. 点黑色 **Save & connect**，**等待约 10–20 秒**，不要反复猛点。
6. 成功时：卡片顶部变绿 **Connected · … · IP**；Overview 上 **WLAN** 徽章也会变已连接。

**失败时这样排：**

| 现象 | 处理 |
| :--- | :--- |
| 列表是空的 | 靠近路由器，再点 Refresh；确认路由器开了 2.4 GHz |
| 一直橙色「重连」 | 密码错或信号弱：改密码再 Save & connect |
| 手机能上网、设备连不上 | 关掉路由器「AP 隔离 / 访客网络」；不要只用 5 GHz SSID |
| 保存后蓝灯还在闪 | SoftAP 可与 STA 同在（APSTA）；以卡片是否显示 Connected + IP 为准 |

**成功标准：** Network 页显示已连接且有 IP；用该 IP 在家里网上能再次打开控制台更佳。

## 5.（可选）接 NeoMind：填 MQTT

若暂时只用本地推图，可跳过本节，直接做第 6 步。

仍在 **Network** 页右侧 **MQTT** 卡片（与 Wi‑Fi 同一屏）：

| 控件 | 说明 |
| :--- | :--- |
| **Protocol** | **MQTT** 或 **MQTTS**；**不会**根据端口自动推断 |
| **Broker** / **Port** | 平台地址；MQTT 常见 1883，MQTTS 常见 8883 |
| **Client ID** | 只读，形如 `ek410-xxxxxxxx`，不要改 |
| **QoS** | 一般保持 **QoS 1** |
| **Username** / **Password** | 平台凭据；密码再次打开页面**不会回显** |
| **MQTT topics** | 折叠条：点开后显示只读 **Uplink / Downlink**（由 deviceId 推导） |
| **Test connection** / **Save** | 需已连家里 Wi‑Fi；SoftAP 下测连可能卡几秒 |

点开 **MQTT topics** 后：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/network-mqtt-topics.png" alt="MQTT topics 展开：Uplink / Downlink 只读主题" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**操作：**

1. 选 **Protocol** → 填 **Broker**、**Port**、**Username**、**Password**。
2. 点开 **MQTT topics**，核对类似  
   `device/ek410_Eink/{deviceId}/uplink` 与 `.../downlink`。
3. 点 **Test connection**；或点 **Save**，回 Overview 看 MQTT 徽章。
4. 打开 NeoMind → 设备列表 → 找到该设备 → **审批**。

:::note
- 改了服务器或用户名必须重新填密码。  
- 徽章 **MQTT deferred (heap)**：大图下载 / OTA 时会暂停 MQTT，结束后自动恢复。  
- 底栏 **Provisioning** 也可网页开关 SoftAP / BLE；与按键效果相同，二者互斥。
:::

更细字段见[配网与连接](./2-user-guide/0-softap-provisioning.md)。

## 6. Display 页：三个模式详解 + 推第一张图

点 **Display**（或 Overview 的 **Edit screen**）。顶栏三个 Tab **互斥**，逻辑画布都是 **1600×1200**；推屏只推**当前选中 Tab** 的预览。

| Tab | 一句话 | 本教程 |
| :--- | :--- | :--- |
| **Image** | 整屏换一张 JPG / PNG / WebP | **必做**（6.1） |
| **Editor** | 文字 + 色块 + 二维码 + 局部贴图叠图层 | 建议试一次（6.2） |
| **Markdown** | 写 Markdown → 生成布局预览 → 推屏 | 建议试一次（6.3） |

### 共用顶栏（三个模式都有）

| 控件 | 作用 |
| :--- | :--- |
| **Original** | 看原色 / 设计色，**不是**墨水最终效果 |
| **E-ink 6** | Spectra 6 六色抖动预览 — **每次 Push 前都要看** |
| **Layout guides** | 安全区、中线、分辨率角标 |
| **Push to screen** | 全刷到墨水屏，约 **25–35 秒**（有的接近 40 秒） |

:::warning
全刷中接口返回忙；**不要断电、不要连点 Push**。失败看 **System → Event log**。更完整的字段表见[内容显示](./2-user-guide/1-display-content.md)。
:::

### 6.1 Image mode（整屏换图）— 必做

**适合：** 海报、照片、整屏设计稿。浏览器里量化成六色帧再上传。

准备一张 **JPG / PNG / WebP**（竖图、横图均可）。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-image.png" alt="Display · Image：Content preview + Image source" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**你会看到：**

| 区域 | 说明 |
| :--- | :--- |
| 中间 **Content preview** | 1600×1200 预览；首次可能是示例渐变（*Sample · replace by upload*），**不会自动上屏** |
| 右侧 **Image source** | 上传、URL、Fit、读回当前屏 |

**Image source 控件：**

| 控件 | 怎么用 |
| :--- | :--- |
| **Upload image**（Click or drop） | 点选或拖入本地 JPG / PNG / WebP |
| **URL** + **Load preview** | 设备经家里网代拉；SoftAP 时手机常上不了外网，**必须走设备代拉** |
| **Fit → Cover** | 铺满，可能裁边 |
| **Fit → Contain** | 完整入画，可能留边 — **第一次用这个** |
| **Fit → Stretch** | 拉满，可能变形 |
| **Load from panel** | 把设备已保存的当前屏拉回预览，再改再推 |

**操作步骤：**

1. 顶栏确认 **Image**。
2. 上传本地图，**或**填 URL → **Load preview**（URL 路径需已连家里 Wi‑Fi）。
3. 选 **Fit**（先 **Contain**）。
4. 切到 **E-ink 6**；需要时开 **Layout guides**。
5. **Push to screen** → 等全刷结束。
6. 回 **Overview**，确认 **Current panel** 有快照（可 Refresh）。

| 出问题 | 怎么办 |
| :--- | :--- |
| SoftAP 下 URL 失败 | 先配家里网，或改本地上传 |
| 上屏色差大 | 推之前是否在 **E-ink 6**？ |
| 裁切 / 留白不对 | 换 Cover / Contain / Stretch 再预览 |

### 6.2 Editor mode（画布排版）— 建议试一次

**适合：** 会议室门牌、工位牌 — 叠**文字 / 色块 / 二维码 / 小图**，不是整屏换照片（整屏换图请回 Image）。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-editor.png" alt="Display · Editor：工具 + Layers + Properties" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**页面分区：**

| 区域 | 做什么 |
| :--- | :--- |
| 画布左侧工具 / 右侧 **Quick add** | **Text**、**Image**（图层贴图）、**Box**、**QR code** |
| **Canvas → Background** | 整页底色（六色之一，如 White） |
| **Layers** | 点选；**Up / Down / Delete** 调序或删除 |
| **Properties** | 改**当前选中**层；未选中时提示 *Select a layer to edit* |
| 画布拖拽 | 选中后拖到目标位置（*Drag to place*） |

**各图层在 Properties 里改什么：**

| 类型 | 属性要点 |
| :--- | :--- |
| **Text** | **Content** 文案、**Color**、**X / Y**、**Scale**（字号倍数） |
| **Box** | **Color**、位置与尺寸 — 色条 / 分隔 |
| **QR code** | **URL**（链接或文本）、位置与大小 |
| **Image**（图层） | 上传 / **Replace image** — 只贴局部，不是 Image 模式整屏 |

**推荐走一遍（门牌）：**

1. 顶栏切 **Editor**；**Background** 选 White。
2. 用 **Text** 写标题 → 改 Color / Scale → 拖到合适位置。
3. 再加一行正文 Text；需要时加 **Box** 色条、**QR** 填链接。
4. 在 **Layers** 里确认文字不被色块挡住（用 Up / Down）。
5. 切 **E-ink 6** + **Layout guides** 检查边距。
6. **Push to screen**，等全刷。

| 限制 | 说明 |
| :--- | :--- |
| 元素 | 建议 ≤ **48**；二维码 ≤ **2** |
| 字库 | 无彩色 emoji，会换成文字符号 |
| 与 Image | 切 Tab **不会**把整屏照片变成图层；各模式独立 |

### 6.3 Markdown mode（公告文字）— 建议试一次

**适合：** 公告、日程、条目列表。左边写 Markdown，右边是**布局映射预览**，不是 Word 边写边排版。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/display-markdown.png" alt="Display · Markdown：Write Markdown + Layout preview" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

:::important
改左边**不会**自动等于最终画面。必须点 **Generate preview**，**以右侧 Layout preview 为准**，再 **Push to screen**。
:::

**控件：**

| 控件 | 说明 |
| :--- | :--- |
| **Background** / **Text** | 背景色、文字色（六色） |
| 编辑框 | 输入 Markdown；可整段替换示例文案 |
| **Open file** | 载入本地 `.md` |
| **Paste** | 粘贴示例 / 剪贴板 |
| **Generate preview** | 映射成右侧预览（H1→大字、段落→正文、列表→多行） |

**语法习惯：**

| 写法 | 预览效果 |
| :--- | :--- |
| `#` / `##` | 大标题 / 次级标题 |
| 段落、`-` / `*` 列表 | 正文、多行条目 |
| `![](url)` | 插图（设备须能拉到 URL；仅 SoftAP 未入网时易失败） |

内容过长可能**截断末尾**（提示 truncated）：缩短文字后再 Generate。

**操作步骤：**

1. 顶栏切 **Markdown**；选好 Background / Text。
2. 改写编辑框，或 **Open file** / **Paste**。
3. 点 **Generate preview** → 看右侧是否满意；不满意就改完再生成一次。
4. 切 **E-ink 6** 确认。
5. **Push to screen**，等全刷。

**成功标准：** 至少用 **Image** 成功 Push 一张图，且 Overview 有当前画面；Editor / Markdown 各走通一次更佳。完整控件与排障见[内容显示](./2-user-guide/1-display-content.md)。

## 7. 第一次上手完成检查

勾完这些就可以收工：

- [ ] SoftAP 能开，浏览器能打开 `192.168.4.1`
- [ ] 家里 2.4 GHz Wi‑Fi 显示 Connected，并有 IP
- [ ] 已成功 Push 至少一张图，屏上画面正确
- [ ] （若接云）MQTT 测试通过，NeoMind 已审批设备
- [ ] （可选）在 Display 试过 Editor 或 Markdown 其中一个 Tab

## 8. 建议接着做的设置（System 页）

点侧栏 **System**。页面自上而下是多张卡片：

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', justifyContent: 'center' }}>
  <img src="/img/epaper-ek410-series/user-guide/system.png" alt="System 页卡片总览" style={{ maxWidth: '900px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

| 卡片 | 你能改什么 |
| :--- | :--- |
| **Preferences** | 界面 **Language**（中文 / English）；**URL image：Quality / Speed**（只影响设备侧 URL 解码，本地上传仍全分辨率） |
| **Device info** | 只读：MAC、Firmware、Partition（`ota_0` / `ota_1`） |
| **Event log** | **Download log** / **Clear**（约 48KB / 7 天上限） |
| **Danger zone** | **Reboot**、**Factory reset**（保留 `deviceId`） |
| **Work mode** | **Always on** / **Timed refresh** / **Hibernate**；**Save work mode**、**Sleep now** |
| **Name & update**（继续下滚） | 改 Device name（最长 32 字节）；本地 `.bin` 上传或 HTTPS OTA URL |

| 目标 | 去哪点 |
| :--- | :--- |
| 定时醒一下刷一屏再睡（省电看板） | **Work mode** → **Timed refresh**（界面也可能写 Scheduled refresh）→ 设周期（分）与在线窗（秒，默认 **120**）→ **Save work mode** |
| 长期不更新、彻底睡 | **Hibernate**，或 **Sleep now** |
| 改设备显示名 | **Name & update** → Device name → Save |
| 升级固件 | 上传本地 `.bin` 或填 HTTPS OTA URL；升级时状态灯应为**紫色快闪** |

详见[电源管理](./2-user-guide/2-power-management.md)、[系统维护](./2-user-guide/3-system-maintenance.md)。

## 9. 相关页面

- [配网与连接](./2-user-guide/0-softap-provisioning.md)
- [内容显示](./2-user-guide/1-display-content.md)
- [电源管理](./2-user-guide/2-power-management.md)
- [系统维护](./2-user-guide/3-system-maintenance.md)
- [硬件规格](./3-hardware-guide/0-specifications.md)
- [产品信息](./0-overview.md)
