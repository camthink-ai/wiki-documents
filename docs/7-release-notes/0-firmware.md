---
id: firmware
slug: /7-release-notes/firmware
description: CamThink 产品固件版本发布历史、下载资源及用户开发案例源码下载。涵盖 NeoEyes NE301、NE101、NeoEdge NG4500 等产品线。
keywords: [Release Notes, 固件更新, 固件下载, 开发案例, NE301, NE101, NG4500, CamThink]
tags: [Release Notes, 固件, 下载, 开发案例]
sidebar_position: 1
---

# Firmware

本页面汇总 CamThink 各产品线的版本发布历史、下载资源及社区开发案例。

<!-- 下载规则：所有下载链接统一指向对应版本的 GitHub Release 页面，不区分子变体（CE/FCC 等）。格式：[⬇️](GitHub Release URL) -->

## NeoEyes NE101

| 固件版本 | 更新内容 | 发布日期 | 下载 |
|:-----|:---------|:---------|:----:|
| v1.8 | <ul style={{margin:0}}><li>新增 Webhook 推送通知</li><li>新增设备配置导入/导出功能</li><li>新增定时锚点拍摄（Interval Anchor Time），支持基于锚点的间隔调度</li><li>新增 Ping API 网络连通测试、Debug 调试模块（含 Web 调试日志和控制台命令）及 ISP 选择</li><li>新增 Verizon 运营商 Context 3 支持</li><li>升级 esp_modem 至 v2.0.1，修复 Verizon PPP 连接问题</li><li>优化定时拍摄为滚动 24h 窗口（不再以午夜重置，避免跨午夜调度跳跃）</li><li>扩展 MQTT/平台凭据字段长度（64→128），Web UI 输入限制同步更新</li><li>扩展澳大利亚 S1G WiFi 频段支持</li><li>修复 Wi-Fi AP 模式下站点连接/断开时的 LED 副作用（避免与其他 LED 逻辑冲突）</li><li>修复相机 JPEG 队列内存及闪光灯/预热时序问题</li><li>修复 HaLow WiFi CE 模块信号差问题</li><li>修复电池 ADC 采样和上报频率异常</li><li>修复按钮拍照不稳定问题（增加 1s 延迟避免按键状态不稳）</li></ul> | 2026-05-07 | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.8(hw-v1.2)) |
| v1.8<br />（hw-v2.0） | <ul style={{margin:0}}><li>新增 Webhook 推送通知</li><li>新增设备配置导入/导出功能</li><li>新增定时锚点拍摄（Interval Anchor Time），支持基于锚点的间隔调度</li><li>新增 Ping API 网络连通测试、Debug 调试模块（含 Web 调试日志和控制台命令）及 ISP 选择</li><li>新增 Verizon 运营商 Context 3 支持</li><li>升级 esp_modem 至 v2.0.1，修复 Verizon PPP 连接问题</li><li>优化定时拍摄为滚动 24h 窗口（不再以午夜重置，避免跨午夜调度跳跃）</li><li>扩展 MQTT/平台凭据字段长度（64→128），Web UI 输入限制同步更新</li><li>扩展澳大利亚 S1G WiFi 频段支持</li><li>修复 Wi-Fi AP 模式下站点连接/断开时的 LED 副作用（避免与其他 LED 逻辑冲突）</li><li>修复相机 JPEG 队列内存及闪光灯/预热时序问题</li><li>修复 HaLow WiFi CE 模块信号差问题</li><li>修复电池 ADC 采样和上报频率异常</li><li>修复按钮拍照不稳定问题（增加 1s 延迟避免按键状态不稳）</li></ul> | 2026-06-04 | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.8(hw-v2.0)) |
| v1.7 | <ul style={{margin:0}}><li>新增 UVC 相机 HDR 设置</li><li>合并 PIR 与 Alarm 为同一固件（通过 Web 配置切换）</li><li>修复高分辨率切换异常</li><li>修复 PIR/Alarm 多次误唤醒</li><li>修复 HaLow WiFi 区域配置选择问题</li><li>Web UI 优化</li></ul> | 2026-01-27 | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.7) |
| v1.6 | <ul style={{margin:0}}><li>Web UI 新增相机分辨率配置</li><li>修复 OTA 升级失败问题</li></ul> | 2025-11-25 | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.6) |
| v1.5 | <ul style={{margin:0}}><li>初始发布版本，支持 PIR / ALARMIN 模式</li><li>提供 FCC（915MHz）和 CE（868MHz）版本</li></ul> | 2025-11-18 | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.5) |

## NeoEyes NE301

| 固件基线版本 | 组件版本 | 更新内容 | 适配硬件 | 发布日期 | 下载 |
|:-----|:---------|:---------|:---------|:---------|:----:|
| v20260604 | APP v2.1.0.80 ↑<br />WEB v1.3.4.7 ↑<br />MODEL v2.0.0.0<br />WAKECORE v0.2.7.5 ↑ | <ul style={{margin:0}}><li>新增 RTSP 流媒体服务（H.264 RTP 推流，支持多种认证模式，与 RTMP 互斥切换）</li><li>新增流媒体标签页偏好设置（支持 RTMP/RTSP 默认标签页选择）</li><li>新增 Webhook 推送通知服务（支持自定义 CA 证书管理）</li><li>新增 I2S6 音频接口和 SPI6 TFT 显示屏驱动（NAU88C10 编解码器、ST7789VW 屏幕，DMA 加速）</li><li>新增 SensorExt 传感器扩展驱动库（LTR31X、SHT3X、VL53L1X、LSM6DSR、MLX90642、DTS6012M、NAU881X）</li><li>新增快速启动与抓拍功能（Quick Bootstrap，加速启动并降低功耗，支持独立配置分辨率和 JPEG 质量）</li><li>新增 ISP 参数持久化与模式选择（户外/室内/自定义，支持调优配置文件，含 AWB/CCM 和校准参数）</li><li>新增 4G 蜂窝数据漫游开关及运营商自动检测（支持中国移动/联通/电信及 Verizon）</li><li>新增定时拍摄间隔模式（Scheduled Interval Timer，支持按固定时间间隔自动拍摄）</li><li>移除旧版 USB CDC 和 UVCL 驱动（替换为 USBX 方案）</li><li>优化 PSRAM 支持 32MB/64MB 双配置（条件链接脚本自动切换）</li><li>修复 OTA 升级因 XSPI I-cache 驱逐和服务冲突导致的系统挂起</li><li>修复多线程 Socket 分配竞态条件及 RTSP 端口绑定失败</li><li>修复 MQTT 抓拍 JPEG 和 SD 卡 AI 叠加层在检测到目标时的异常</li><li>修复 Webhook 推送服务唤醒竞态条件</li><li>修复 TLS SNI 缺失导致的 HTTPS 连接失败</li><li>修复 WakeCore 待机唤醒标志检查和 Stop2 模式异常</li><li>修复 PIR 触发拍摄延迟过长问题</li></ul> | V1.3（完全适配）<br />V1.2（完全适配）<br />V1.1（部分适配） | 2026-06-04 | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260604_main) |
| v20260213 | APP v2.0.1 ↑<br />WEB v1.3.4.4 ↑<br />MODEL v2.0.0.0 ↑<br />WAKECORE v0.2.7.3 ↑ | <ul style={{margin:0}}><li>新增 AWS HTTP 上传支持（含 SigV4 签名认证）</li><li>新增 EG912U GL Cat.1 模组网络接口</li><li>升级 ST EdgeAI 运行时至 v2.2</li><li>新增 YuNet 人脸检测、YOLO D、YOLO11n 和 SSD MobileNet V2 模型支持</li><li>新增 AI 处理工具，SDK 支持 tflite/onnx/karse 多模型</li><li>新增模型升级与回退功能（V2.2↔V3.0）</li><li>新增 PIR 配置重试机制</li><li>优化 RTMP 视频流前端展示</li><li>OTA 升级模块优化</li><li>修复远程唤醒与休眠冲突、视频流展示卡顿</li></ul> | V1.2（完全适配）<br />V1.1（部分适配） | 2026-02-13 | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_main) |
| v20260213<br />（EdgeAI 分支） | APP v1.0.1<br />WEB v1.3.1.0<br />MODEL v1.0.0.0<br />WAKECORE v0.2.7.3 | <ul style={{margin:0}}><li>新增 YOLO11n 模型支持</li><li>支持 PSRAM 64Mb</li></ul> | V1.2（完全适配）<br />V1.1（部分适配） | 2026-02-13 | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_stedgeai-v2.2) |
| V20260120 | APP v1.0.1<br />WEB v1.3.0.0<br />MODEL v1.0.0.0<br />WAKECORE v0.2.7.1 | <ul style={{margin:0}}><li>首个公开发布版本</li><li>支持目标检测（YOLOv2/v5/v8、SSD、YOLOX）、人脸检测（BlazeFace）、人体骨骼关键点（MoveNet）、语义分割（DeepLab v3）等 AI 模型</li><li>支持 WiFi / Cat.1 / PoE 通信</li><li>支持 RTMP / MQTT 推流</li><li>支持 PIR 触发拍摄（灵敏度/触发时间/抗干扰参数可配置）</li><li>支持远程唤醒与控制指令</li><li>支持 OTA 固件升级与配置导入导出</li><li>支持出厂配置串口命令与 CAT1 AT 指令输入</li><li>Web UI 设备管理（登录、设备信息、应用管理、硬件管理、功能调试）</li></ul> | V1.2（完全适配）<br />V1.1（部分适配） | 2026-01-20 | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/V20260120) |

## NeoMind

| 版本 | 更新内容 | 发布日期 | 下载 |
|:-----|:---------|:---------|:----:|
| v0.6.9 | <ul style={{margin:0}}><li>新增数据转换聚合工具（Transform Aggregated Tool）</li><li>修复 Agent 缓存失效、上下文压缩及工具结果格式问题</li><li>修复工具结果反幻觉处理</li></ul> | 2026-04-16 | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.9) |
| v0.6.8 | <ul style={{margin:0}}><li>简化 LLM 思维控制，统一多轮对话中的思考内容展示</li><li>新增虚拟指标暴露及 write_metric 动作</li><li>加固 OTA 更新流程（修复完成状态、双重对话框、版本同步）</li><li>修复规则构建器的扩展支持</li><li>优化会话级工具结果缓存复用</li></ul> | 2026-04-15 | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.8) |
| v0.6.7 | <ul style={{margin:0}}><li>大幅性能优化：存储层分页查询、并发查询限制、前端批量状态更新</li><li>修复更新器下载进度卡住及 Windows URL 错误</li><li>改进 LLM 视觉检测和 Agent 思考面板体验</li></ul> | 2026-04-14 | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.7) |

## 用户案例

| 案例名称 | 适用产品 | 说明 | 源码下载 |
|:---------|:---------|:-----|:-------:|
| AWS S3 图片上传 | NeoEyes NE301 | <ul style={{margin:0}}><li>基于 HTTP Client 实现 HTTPS 连接</li><li>集成 AWS SigV4 签名认证，生成预签名 URL</li><li>通过 shell 命令初始化（region/bucket/AK/SK）并上传拍摄图片到 S3</li><li>自动生成带时间戳的文件名（capture_YYYYMMDD_HHMMSS.jpg）</li><li>内置 ISRG X1 / GlobalSign R3 / DigiCert G2 CA 证书</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/aws_capture.zip) |
| Arduino Camera Web Server | NeoEyes NE101 | <ul style={{margin:0}}><li>基于 ESP32 Arduino 框架，使用 esp_camera 与 esp_http_server 库</li><li>适配 NE101 的 OV5640 摄像头引脚配置</li><li>内置 WiFi HTTP 服务器，支持远程拍照与 MJPEG 视频流</li><li>浏览器端 Web UI，支持摄像头预览与参数调节</li><li>自动检测 PSRAM 以优化图像质量与帧缓冲</li><li>支持 ESP32 / ESP32-S2 / ESP32-S3 平台</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip) |
