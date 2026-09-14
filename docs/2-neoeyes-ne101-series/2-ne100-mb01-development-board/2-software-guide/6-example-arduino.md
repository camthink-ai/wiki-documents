---
description: 本指南详细介绍了如何使用 Arduino IDE 开发适配 NE101 系列摄像头的应用程序。内容涵盖 Arduino 环境搭建、ESP32-S3 核心硬件配置（如 OPI PSRAM）、引脚定义映射、摄像头电源控制逻辑以及 CameraWebServer 经典示例的源码适配与固件烧录流程。
keywords: [NE101 开发, Arduino IDE, ESP32-S3, 摄像头开发, CameraWebServer, OPI PSRAM, 硬件配置, 固件烧录, 嵌入式开发, 乐鑫]
tags: [NE101 系列, Arduino 开发, 摄像头应用, ESP32-S3, 示例代码]
---

# NE101 Arduino Dev Guide

本文档将指导您如何使用 Arduino IDE 开发适配 NE101 摄像头的应用程序，以 `CameraWebServer` 示例为例。

## 0. 为什么选择 Arduino？

使用 Arduino 平台开发 NE101 主要有以下优势：

*   **极速原型开发 (Rapid Prototyping)**：Arduino 极大地简化了底层硬件配置，让开发者可以在几分钟内点亮屏幕、驱动摄像头或连接 WiFi，非常适合快速验证产品创意。
*   **丰富的开源生态 (Rich Ecosystem)**：拥有海量的驱动库（Library），无论是连接传感器、显示屏还是接入各种物联网云平台（如 AWS, MQTT, Home Assistant），通常都能找到现成的库一键调用，无需重复造轮子。
*   **低门槛易上手 (Ease of Use)**：相比于专业的 ESP-IDF，Arduino 屏蔽了复杂的构建系统和操作系统细节，语法简单直观，不仅适合初学者，也能大幅提升专业开发者的开发效率。
*   **跨平台兼容**：同样的代码通常只需微调即可在不同硬件间移植，方便利用现有的 ESP32 社区资源。

## 1. 环境准备

### 1.1 安装 Arduino IDE
如果尚未安装，请前往 [Arduino 官网](https://www.arduino.cc/en/software) 下载并安装版本的 Arduino IDE。
> **注意**：我们团队验证通过的版本是 **Arduino IDE 2.3.6**。

### 1.2 安装 ESP32 开发板支持包
1. 打开 Arduino IDE，进入 `文件` -> `首选项`。
2. 在 `附加开发板管理器网址` 中添加以下链接：
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. 点击确定，然后进入 `工具` -> `开发板` -> `开发板管理器`。
4. 搜索 `esp32`，安装由 **Espressif Systems** 发布的 `esp32` 包。
> **注意**：我们团队验证通过的版本是 **3.2.1**。



## 2. 硬件配置 (关键步骤)

NE101 基于 ESP32-S3 芯片，拥有 8MB Octal PSRAM 和 16MB Flash。在 Arduino IDE 中**必须**正确配置以下选项，否则无法启动或识别摄像头。

在 `工具` 菜单中选择：

*   **开发板**: `ESP32S3 Dev Module`
*   **USB CDC On Boot**: `Enabled` (这样可以通过 USB 查看串口打印)
*   **CPU Frequency**: `240MHz (WiFi)`
*   **Core Debug Level**: `Info` (或者 Verbose，便于调试)
*   **Erase All Flash Before Sketch Upload**: `Disabled` (初次建议 Enabled，之后 Disabled)
*   **Flash Mode**: `QIO 80MHz`
*   **Flash Size**: `16MB (128Mb)`
*   **Partition Scheme**: `Huge APP (3MB No OTA/1MB SPIFFS)` (CameraWebServer 较大，标准分区可能不够)
*   **PSRAM**: `OPI PSRAM` (**非常重要！选错会导致 PSRAM 初始化失败，摄像头无法工作**)

### 2.1 SD 卡配置说明

NE101 的 SD 卡槽具有独立的电源控制引脚，使用前必须**拉高 GPIO 42**。

*   **电源控制 (TF_PWR)**: `GPIO 42` (高电平有效)
*   **通信模式**: 必须使用 **1-bit Mode** (MMC Mode)，不支持 SPI 模式。
*   **引脚定义**:
    *   **CLK**: `GPIO 39`
    *   **CMD**: `GPIO 38`
    *   **D0**: `GPIO 40`
    *   **CD (检测)**: `GPIO 41`

> **注意**：
> 1.  **引脚冲突**：GPIO 42 同时连接了**状态指示灯 (Status LED)**。给 SD 卡上电时，状态灯会常亮，这是正常现象。
> 2.  **模块冲突**：SD 卡引脚与 Cat.1 / WiFi HaLow 模块存在复用冲突，**不可同时使用**。
> 3.  **上电时序**：务必在初始化 SD 卡对象（`SD_MMC.begin`）之前先拉高 GPIO 42 并延时，否则会初始化失败。

在初始化 SD 卡之前，请务必在 `setup()` 中添加：
```cpp
pinMode(42, OUTPUT);
digitalWrite(42, HIGH); // 上电
delay(100); // 等待电源稳定
```

### 2.2 摄像头配置说明

NE101 的摄像头电源由 `GPIO 3` 独立控制。在使用摄像头之前（即调用 `esp_camera_init` 之前），**必须**先拉高该引脚，否则摄像头无法初始化。

*   **摄像头电源 (CAM_PWR)**: `GPIO 3` (高电平有效)
*   **MCLK (CSI_MCLK)**: 当前 NE101 生产配置为 `5MHz`。OV5640 模组通用输入规格为 `6–27MHz`，典型值为 `24MHz`；传感器端逻辑域跟随 DOVDD，NE101 为 `2.8V`。`5MHz` 是针对 NE101 本板连接和信号完整性验证的板级配置，不代表通用模组的额定输入范围。


## 3. 代码适配

以我们提供的示例 [CameraWebServer](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip) 为例进行修改。

### 3.1 打开示例
在 Arduino IDE 中，点击 `文件` -> `示例` -> `ESP32` -> `Camera` -> `CameraWebServer`。

### 3.2 修改引脚定义
NE101 的摄像头引脚定义如下，请将示例代码中的 `camera_pins.h` 或主程序中的引脚配置部分替换为以下内容：

```cpp
// NE101 Camera Pins
#define PWDN_GPIO_NUM    -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM    15
#define SIOD_GPIO_NUM    4
#define SIOC_GPIO_NUM    5

#define Y9_GPIO_NUM      11  // D0
#define Y8_GPIO_NUM      9   // D1
#define Y7_GPIO_NUM      8   // D2
#define Y6_GPIO_NUM      10  // D3
#define Y5_GPIO_NUM      12  // D4
#define Y4_GPIO_NUM      18  // D5
#define Y3_GPIO_NUM      17  // D6
#define Y2_GPIO_NUM      16  // D7

#define VSYNC_GPIO_NUM   6
#define HREF_GPIO_NUM    7
#define PCLK_GPIO_NUM    13
```

### 3.3 修改主程序 `CameraWebServer.ino`

1.  找到包含 `camera_pins.h` 的地方。
2.  在宏定义选择部分，注释掉其他模型，添加 NE101：

```cpp
#include "esp_camera.h"
#include <WiFi.h>

// ===================
// Select camera model
// ===================
//#define CAMERA_MODEL_WROVER_KIT // Has PSRAM
//#define CAMERA_MODEL_ESP_EYE // Has PSRAM
//#define CAMERA_MODEL_ESP32S3_EYE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_PSRAM // Has PSRAM
//#define CAMERA_MODEL_M5STACK_V2_PSRAM // M5Camera version B Has PSRAM
//#define CAMERA_MODEL_M5STACK_WIDE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_ESP32CAM // No PSRAM
//#define CAMERA_MODEL_M5STACK_UNITCAM // No PSRAM
//#define CAMERA_MODEL_AI_THINKER // Has PSRAM
//#define CAMERA_MODEL_TTGO_T_JOURNAL // No PSRAM
//#define CAMERA_MODEL_XIAO_ESP32S3 // Has PSRAM
// **** 添加这一行 ****
#define CAMERA_MODEL_NE101 

#include "camera_pins.h"
```

3.  您还需要在 `camera_pins.h` 文件末尾添加 NE101 的定义块，或者直接将上述引脚定义复制到 `.ino` 文件中并注释掉 `#include "camera_pins.h"`。

**推荐做法：直接在 `.ino` 文件头部定义引脚（删繁就简）：**

```cpp
#include "esp_camera.h"
#include <WiFi.h>

// ===========================
// NE101 Pin Definition
// ===========================
#define PWDN_GPIO_NUM    -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM    15
#define SIOD_GPIO_NUM    4
#define SIOC_GPIO_NUM    5

#define Y9_GPIO_NUM      11
#define Y8_GPIO_NUM      9
#define Y7_GPIO_NUM      8
#define Y6_GPIO_NUM      10
#define Y5_GPIO_NUM      12
#define Y4_GPIO_NUM      18
#define Y3_GPIO_NUM      17
#define Y2_GPIO_NUM      16

#define VSYNC_GPIO_NUM   6
#define HREF_GPIO_NUM    7
#define PCLK_GPIO_NUM    13

// ===========================
// WIFI Credentials
// ===========================
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";

void startCameraServer();

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);  
  Serial.println();

  // 1. 开启摄像头电源 (非常重要！)
  pinMode(3, OUTPUT);
  digitalWrite(3, HIGH);
  delay(100);

  // 2. (可选) 开启 SD 卡电源
  // pinMode(42, OUTPUT);
  // digitalWrite(42, HIGH);
  // delay(100);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM; // 注意：esp32-camera 库的命名习惯有时与原理图不同，这里只需对应 D0-D7 即可
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 5000000; // 当前 NE101 验证配置；通用 OV5640 规格为 6–27MHz，典型值 24MHz
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG; 
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // ... (后续代码保持不变)
```

**注意**：在 `main/camera.c` 原代码中：
```c
#define CAMERA_PIN_D0 11     // D0
#define CAMERA_PIN_D1 9      // D1
#define CAMERA_PIN_D2 8      // D2
...
```
而在 Arduino 示例中通常使用 Y2-Y9 的命名。对应关系如下：
*   D0 -> Y2
*   D1 -> Y3
*   ...
*   D7 -> Y9

请务必注意这种对应关系。上面给出的代码块中已经做了映射，但在赋值时我使用了直观的 `config.pin_d0 = 11` 方式（即直接使用 GPIO 编号），这是最稳妥的。

**修正后的推荐配置代码：**

```cpp
  config.pin_d0 = 11;
  config.pin_d1 = 9;
  config.pin_d2 = 8;
  config.pin_d3 = 10;
  config.pin_d4 = 12;
  config.pin_d5 = 18;
  config.pin_d6 = 17;
  config.pin_d7 = 16;
  config.pin_xclk = 15;
  config.pin_pclk = 13;
  config.pin_vsync = 6;
  config.pin_href = 7;
  config.pin_sccb_sda = 4;
  config.pin_sccb_scl = 5;
  config.pin_pwdn = -1;
  config.pin_reset = -1;
```

## 4. 烧录

1.  使用 USB 线连接 NE101 到电脑。
2.  在 `工具` -> `端口` 中选择对应的 COM 口。
3.  点击 Arduino IDE 左上角的 `上传` 按钮（右向箭头）。
4.  等待编译完成并烧录。

## 5. 验证

1.  烧录完成后，打开 `工具` -> `串口监视器`。
2.  设置波特率为 `115200`。
3.  按一下设备上的复位键（如有）或重新插拔 USB。
4.  观察串口输出，应该能看到 WiFi 连接信息和摄像头启动信息：
    ```
    WiFi connected
    Camera Ready! Use 'http://192.168.x.x' to connect
    ```
5.  在浏览器中访问显示的 IP 地址，即可看到摄像头控制界面。

## 6. 资源

*   [NE101 GitHub](https://github.com/camthink-ai/lowpower_camera)
*   [Arduino IDE](https://www.arduino.cc/en/software)
*   [ESP32 Arduino](https://github.com/espressif/arduino-esp32)
*   [Arduino esp32-camera Demo](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip)

## FAQ

*   **串口无输出**: 检查 `USB CDC On Boot` 是否已设置为 `Enabled`。
*   **PSRAM 初始化失败**: 检查 `PSRAM` 选项是否选为 `OPI PSRAM`。
*   **摄像头初始化失败**: 检查引脚定义是否正确，或尝试降低 `xclk_freq_hz`。
