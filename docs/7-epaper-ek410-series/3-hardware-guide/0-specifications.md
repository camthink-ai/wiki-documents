---
id: ek410-specifications
title: Specifications and Interfaces
sidebar_position: 0
description: EK410 的硬件规格总表、按键与状态灯定义、Flash 分区表和主控引脚分配。
keywords: [EK410, 硬件规格, 引脚, 分区表, ESP32-C61]
tags: [EK410, 硬件指南, 规格]
---

# Specifications and Interfaces

本页汇总 EK410 的硬件规格、用户可操作的按键与指示灯、固件 Flash 分区和主控引脚分配。引脚信息来源于 [固件仓库](https://github.com/camthink-ai/EK410) `main/pindefine.h`，供二次开发与硬件排查参考。

## 规格总表

整机规格对齐产品画册；GPIO / 分区等固件细节见下文。

| 项目 | 规格 |
| :--- | :--- |
| 产品 | EK410 · CamThink 7.09″ 六色电子纸标牌 |
| 主控 | ESP32-C61HR2（RISC-V，160 MHz） |
| Flash / PSRAM | 16 MB / 2 MB（QUAD） |
| 面板 | E Ink Spectra 6，7.09″，有效区 108 × 144 mm，1200 × 1600（282 PPI） |
| 固件画布 | 逻辑 1600 × 1200（原生 1200 × 1600，双驱动 IC） |
| 全刷 | 约 25–35 s |
| 帧格式 | 960000 字节原生 4bpp（双片选半帧），每字节 2 像素 |
| 外形 / 重量 | 185 × 149 × 14 mm / 0.28 kg |
| 安装 | 桌面支架杆或壁挂 |
| 电池 | 内置 5000 mAh 可充电锂聚合物；续航最长约 6 个月（每天 1 次刷新估算） |
| 充电 | USB Type-C |
| 无线 | Wi-Fi 6（802.11ax）；BLE 5.0（固件 SoftAP/STA 为 2.4 GHz） |
| 存储卡 | MicroSD（TF） |
| USB 转串口 | CH340（开发调试） |
| 按键 | MAIN / PAGE / BOOT / RESET（画册称 Power / Reset / Switch） |
| 状态灯 | RGB（AW9523B 经 I2C 驱动） |
| 屏幕接口 | SPI，双片选；SPI 总线可切换至 TF 卡 |
| 工作温度 | 0–50 °C |

## 按键

| 按键 | GPIO | 行为 |
| :--- | :--- | :--- |
| MAIN | GPIO2 | 长按约 2.5 秒开启 SoftAP；深睡唤醒 → SoftAP |
| PAGE | GPIO3 | 长按约 2.5 秒进入 / 退出 BLE CT-Prov；深睡唤醒 → BLE |
| MAIN + PAGE | — | 同时持续按住约 6 秒 → 恢复出厂（保留 `deviceId`） |
| BOOT | GPIO9 | 开机约 50 ms 读到低电平 → 恢复出厂（检修）。复位全程按住会进入 ROM 下载模式 |
| RESET | EN | 硬件复位；退出 SoftAP / BLE handoff 并恢复上次画面 |

## 状态灯

RGB 状态灯由 AW9523B（I2C 0x59，SDA GPIO22 / SCL GPIO28）驱动：

| 颜色 | 含义 |
| :--- | :--- |
| 蓝色闪烁 | SoftAP 配网 |
| 橙色闪烁 | 正在连接 / 重连 Wi‑Fi |
| 青色闪烁 | BLE CT-Prov |
| 绿色常亮 | 正常运行（STA 已连接）或未配网待机 |
| 红色短闪 | 故障（配网 / OTA / 面板），不会常亮 |
| 紫色快闪 | OTA 升级中 |
| 深睡灭灯 | LED 与面板供电已关闭 |

## Flash 分区表

分区定义见仓库 `partitions.csv`：

| 分区 | 大小 | 用途 |
| :--- | :--- | :--- |
| `nvs` | 24 KB | 配置存储（Wi-Fi、MQTT、电源等） |
| `phy_init` | 4 KB | RF 校准数据 |
| `otadata` | 8 KB | OTA 分区选择 |
| `ota_0` | 4 MB | 应用分区 A |
| `ota_1` | 4 MB | 应用分区 B（OTA 双分区回滚；与 `ota_0` 为同一二进制） |
| `lastfrm` | 1 MB | 最后一次成功刷屏的帧快照（原生 4bpp + 头部；画面未变时跳过擦写） |
| `evtlog` | 64 KB | 事件日志分区（应用层软上限约 48 KB / 7 天） |

## 引脚分配（`main/pindefine.h`）

| 功能 | GPIO |
| :--- | :--- |
| SPI CS0 / CS1（墨水屏双片选） | 23 / 24 |
| SPI CLK / MOSI / MISO | 25 / 26 / 27 |
| EPD BUSY / RST | 29 / 12 |
| SPI 切换（墨水屏 ↔ TF 卡） | 8 |
| I2C SDA / SCL（AW9523B） | 22 / 28 |
| MAIN / PAGE 按键 | 2 / 3 |
| 电池 ADC | 4 |

## 相关资料

- [屏幕与显示特性](./1-display-panel.md)：面板驱动与帧格式细节。
- [OTA 固件升级](../2-user-guide/3-system-maintenance.md)：双分区回滚机制。
- [开发环境](../4-software-guide/0-development-environment.md)：编译与烧录。
