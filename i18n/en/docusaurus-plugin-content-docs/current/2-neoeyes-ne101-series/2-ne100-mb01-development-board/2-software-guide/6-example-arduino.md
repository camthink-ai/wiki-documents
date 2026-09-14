---
description: Guide to developing for NeoEyes NE101 using the Arduino IDE. Includes pin definitions, hardware configuration, and CameraWebServer example.
keywords: [NeoEyes NE101, Arduino IDE, ESP32-S3, Arduino Development, CameraWebServer, PSRAM Config, Dev Guide]
tags: [NeoEyes NE101, Arduino IDE, ESP32-S3 Arduino, Rapid Prototyping, Dev Guide]
---

# NE101 Arduino Development Guide

This document guides you on how to use the Arduino IDE to develop applications adapted for the NE101 camera, using the `CameraWebServer` example as a reference.

## 0. Why Choose Arduino?

Developing for NE101 using the Arduino platform offers the following advantages:

*   **Rapid Prototyping**: Arduino greatly simplifies low-level hardware configuration, allowing developers to light up screens, drive cameras, or connect to WiFi in minutes. It is very suitable for quickly validating product ideas.
*   **Rich Ecosystem**: It has a massive amount of libraries. Whether connecting sensors, displays, or accessing various IoT cloud platforms (such as AWS, MQTT, Home Assistant), you can usually find ready-made libraries to call with one click, without reinventing the wheel.
*   **Ease of Use**: Compared to the professional ESP-IDF, Arduino shields complex build systems and operating system details. The syntax is simple and intuitive, making it suitable mainly for beginners but also significantly improving development efficiency for professional developers.
*   **Cross-platform Compatibility**: The same code usually requires only minor adjustments to be ported between different hardware, making it convenient to utilize existing ESP32 community resources.

## 1. Environment Preparation

### 1.1 Install Arduino IDE
If not installed yet, please visit the [Arduino Website](https://www.arduino.cc/en/software) to download and install the latest version of the Arduino IDE.
> **Note**: The version verified by our team is **Arduino IDE 2.3.6**.

### 1.2 Install ESP32 Board Support Package
1. Open Arduino IDE, go to `File` -> `Preferences`.
2. Add the following link to `Additional Board Manager URLs`:
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. Click OK, then go to `Tools` -> `Board` -> `Boards Manager`.
4. Search for `esp32` and install the `esp32` package published by **Espressif Systems**.
> **Note**: The version verified by our team is **3.2.1**.



## 2. Hardware Configuration (Critical Step)

NE101 is based on the ESP32-S3 chip, with 8MB Octal PSRAM and 16MB Flash. You **must** correctly configure the following options in the Arduino IDE, otherwise, the camera cannot start or be recognized.

Select in the `Tools` menu:

*   **Board**: `ESP32S3 Dev Module`
*   **USB CDC On Boot**: `Enabled` (This allows viewing serial print output via USB)
*   **CPU Frequency**: `240MHz (WiFi)`
*   **Core Debug Level**: `Info` (Or Verbose, for debugging)
*   **Erase All Flash Before Sketch Upload**: `Disabled` (Recommended Enabled for the first time, then Disabled)
*   **Flash Mode**: `QIO 80MHz`
*   **Flash Size**: `16MB (128Mb)`
*   **Partition Scheme**: `Huge APP (3MB No OTA/1MB SPIFFS)` (CameraWebServer is large, standard partition might not be enough)
*   **PSRAM**: `OPI PSRAM` (**Very Important! Choosing wrong will cause PSRAM initialization failure, and the camera will not work**)

### 2.1 SD Card Configuration Instructions

The NE101's SD card slot has an independent power control pin. You must **pull GPIO 42 HIGH** before using it.

*   **Power Control (TF_PWR)**: `GPIO 42` (Active High)
*   **Communication Mode**: Must use **1-bit Mode** (MMC Mode), SPI mode is not supported.
*   **Pin Definitions**:
    *   **CLK**: `GPIO 39`
    *   **CMD**: `GPIO 38`
    *   **D0**: `GPIO 40`
    *   **CD (Detect)**: `GPIO 41`

> **Note**:
> 1.  **Pin Conflict**: GPIO 42 also connects to the **Status LED**. When powering the SD card, the status light will be on, which is normal.
> 2.  **Module Conflict**: SD card pins conflict with Cat.1 / WiFi HaLow modules, **cannot be used simultaneously**.
> 3.  **Power-on Sequence**: Be sure to pull GPIO 42 high and delay before initializing the SD card object (`SD_MMC.begin`), otherwise initialization will fail.

Before initializing the SD card, be sure to add in `setup()`:
```cpp
pinMode(42, OUTPUT);
digitalWrite(42, HIGH); // Power On
delay(100); // Wait for power to stabilize
```

### 2.2 Camera Configuration Instructions

NE101's camera power is independently controlled by `GPIO 3`. Before using the camera (i.e., before calling `esp_camera_init`), you **must** pull this pin high first, otherwise the camera cannot initialize.

*   **Camera Power (CAM_PWR)**: `GPIO 3` (Active High)
*   **MCLK (CSI_MCLK)**: The current NE101 production configuration is `5MHz`. The generic OV5640 module input specification is `6–27MHz`, with `24MHz` typical; the sensor-side logic domain follows DOVDD, which is `2.8V` on NE101. `5MHz` is a board-level configuration validated for NE101's interconnect and signal integrity, not the generic module-rated input range.


## 3. Code Adaptation

We will modify the [CameraWebServer](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip) example we provided as an example.

### 3.1 Open Example
In Arduino IDE, click `File` -> `Examples` -> `ESP32` -> `Camera` -> `CameraWebServer`.

### 3.2 Modify Pin Definitions
The NE101 camera pin definitions are as follows. Please replace the `camera_pins.h` in the example code or the pin configuration part in the main program with the following content:

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

### 3.3 Modify Main Program `CameraWebServer.ino`

1.  Find where `camera_pins.h` is included.
2.  In the macro definition selection part, comment out other models and add NE101:

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
// **** Add this line ****
#define CAMERA_MODEL_NE101 

#include "camera_pins.h"
```

3.  You also need to add the NE101 definition block at the end of the `camera_pins.h` file, or directly copy the above pin definitions to the `.ino` file and comment out `#include "camera_pins.h"`.

**Recommended Practice: Define pins directly at the head of the `.ino` file (Keep it simple):**

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

  // 1. Turn on Camera Power (Very Important!)
  pinMode(3, OUTPUT);
  digitalWrite(3, HIGH);
  delay(100);

  // 2. (Optional) Turn on SD Card Power
  // pinMode(42, OUTPUT);
  // digitalWrite(42, HIGH);
  // delay(100);

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM; // Note: esp32-camera library naming sometimes differs from schematic, just match D0-D7
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
  config.xclk_freq_hz = 5000000; // Current NE101 validated setting; generic OV5640 specification: 6–27MHz, 24MHz typical
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG; 
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // ... (Subsequent code remains unchanged)
```

**Note**: In the original `main/camera.c` code:
```c
#define CAMERA_PIN_D0 11     // D0
#define CAMERA_PIN_D1 9      // D1
#define CAMERA_PIN_D2 8      // D2
...
```
While in the Arduino example, Y2-Y9 naming is usually used. The correspondence is as follows:
*   D0 -> Y2
*   D1 -> Y3
*   ...
*   D7 -> Y9

Please pay attention to this correspondence. The mapped code block above handles this, but when assigning, I used the intuitive `config.pin_d0 = 11` method (using GPIO numbers directly) in the recommended config below, which is the safest.

**Corrected Recommended Configuration Code:**

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

## 4. Flashing

1.  Connect NE101 to the computer using a USB cable.
2.  Select the corresponding COM port in `Tools` -> `Port`.
3.  Click the `Upload` button (right arrow) in the top left corner of the Arduino IDE.
4.  Wait for compilation to complete and flashing to finish.

## 5. Verification

1.  After flashing is complete, open `Tools` -> `Serial Monitor`.
2.  Set the baud rate to `115200`.
3.  Press the reset button on the device (if any) or re-plug the USB.
4.  Observe the serial output, you should see WiFi connection info and camera startup info:
    ```
    WiFi connected
    Camera Ready! Use 'http://192.168.x.x' to connect
    ```
5.  Access the displayed IP address in a browser to see the camera control interface.

## 6. Resources

*   [NE101 GitHub](https://github.com/camthink-ai/lowpower_camera)
*   [Arduino IDE](https://www.arduino.cc/en/software)
*   [ESP32 Arduino](https://github.com/espressif/arduino-esp32)
*   [Arduino esp32-camera Demo](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip)

## FAQ

*   **No Serial Output**: Check if `USB CDC On Boot` is set to `Enabled`.
*   **PSRAM Initialization Failed**: Check if `PSRAM` option is set to `OPI PSRAM`.
*   **Camera Initialization Failed**: Check if pin definitions are correct, or try reducing `xclk_freq_hz`.
