# System Flashing

## Flash the firmware

Download Firmware from：[lowpower_camera.zip](https://github.com/camthink-ai/lowpower_camera/tree/main/bin)

### Info

- Main controller chip：ESP32-S3
- Development framework：ESP-IDF v5.1.6

Official reference documentation：[ESP-IDF v5.1 Programming Guide](https://docs.espressif.com/projects/esp-idf/en/release-v5.1/esp32s3/get-started/windows-setup.html)

### Recommended Flashing Methods

#### 1. Flashing with VSCode Plugin (Recommended)

- Provides integrated code editing, compilation, and flashing features
- For environment setup, please refer to：[Development Environment Setup Guide](./Development%20Environment%20Setup)

#### 2. Flashing Tool

You can download the flashing tool here：[flash_download_tool_3.9.3_0.zip](https://github.com/camthink-ai/lowpower_camera/blob/main/tools/flash_download_tool_3.9.3_0.zip)

Serial driver download from：[CH341SER.EXE](https://github.com/camthink-ai/lowpower_camera/tree/main/tools/CH341SER.EXE)

##### Flashing Steps：

1. Install the serial driver and launch the flashing tool.
   
   ![flash_tool](/img/NE101_flash_tool.png)

2. Configure Flashing Parameters：
   
   - Select firmware files
   - Set the flash addresses
   - Choose the COM port

3. Execute Flashing：
   
    - Click ERASE to wipe the chip at first
    - Then, click START to flash
    - Press the reset button or reconnect the USB power to reboot the device
   
   ![flashing tool interface](/img/NE101_flash_tool1.png)

## OTA Firmware Updates Guide

### Getting Start

1. **Enter Configuration Mode**
   
   - Press and hold the device button to enter configuration mode.
   - Connect to the device Wi-Fi hotspot（SSID：`NE101_XXXXXX`）

2. **Upgrade the Firmware Package**
   
   - Access the device web interface at（http://192.168.1.1）
   - Navigate to Device Maintenance → Firmware Upgrade
   - After clicking the `Browse` to select the firmware package, click `Upgrade` to upload it.
   
   ![OTA Upgrade](/img/NE101_ota.png)

3. **Wait for the Upgrade to Complete**
   
   - The system will automatically verify and install the new firmware
   - After the upgrade is completed, the Wi-Fi will reconnect automatically
   
   ![upgrade interface](/img/NE101_ota2.png)

4. **Verify Version Information**
   
   - Check the new firmware version on the Device Maintenance page
   - Confirm that all functional modules are operating correctly
   
   ![Device information](/img/NE101_ota3.png)

### Notes

1. Ensure stable power supply during the upgrade process
2. It is recommended to back up important configurations before upgrading
3. If the upgrade fails, the device will automatically roll back to the last available version
4. The complete upgrade log can be viewed through the serial monitor
