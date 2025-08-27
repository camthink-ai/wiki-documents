## Overview

This section is designed to help you quickly get started with using the AI inference service to process data from IoT devices.
## Preparation

* **Hardware Device**：An IoT device capable of reporting data via MQTT, such as the NE101.
* **Beaver-IoT Platform**：For installation instructions, please refer to [website](https://www.milesight.com/beaver-iot/zh-Hans/docs/user-guides/introduction/).
* **CamThink Platform**：[website](https://infer.camthink.ai/).
* **Other Devices**: A PC or mobile device (used to access the device’s web configuration page).
* **Network Environment**: A valid and relatively stable network connection capable of reaching the remote server.
## Specific Operations

## Overall Approach

![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-021.png)
### Configure MQTT Device Integration

1. Log in to Beaver-IoT, click the 'Integration' button, and enter the platform integration page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-001.png)
2. Click the 'MQTT Device Integrated' icon to enter the MQTT device integration page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-002.png)
3. View the MQTT Broker information on the MQTT device integration page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-003.png) 
4. Click 'Device Template Management' on the MQTT device integration page to enter the device template management page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-004.png)
5. Click '+Add' to add a device.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-005.png)
6. Edit the 'Add Device Template' page, including: Device Template Name (customized according to device information), Device Topic (used for device subscription and data upload), Device Entity Definition (fill in after viewing the 'View Document' link on the right), and Remark (notes). After editing, click 'Confirm' to save.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-006.png)
7. After saving, you will be redirected to the device management page of the device template.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-007.png)
### Configure IoT Devices

1. Here, NE101 is used as an example. For detailed device configuration, please refer to [Quick Start](https://camthink-ai.github.io/wiki-documents/docs/NeoEyes%20NE101%20Series/Quick%20Start),the configuration page should be filled out according to Step 2 below.
2. Configuration Page (Click the copy-paste button next to the MQTT Broker information in Step 3 and the Device Topic in Step 6 to copy the relevant information. Note: You must use the copy-paste button for copying and pasting).
	* Host: Paste the IP address from the MQTT server address field. If the IP address is shown as 'localhost', enter your local machine's IP address here.
	* MQTT Port: Paste the port number from the MQTT Broker Port field.
	* Topic: Paste the topic from the Device Topic field.
	* Username: Paste the username from the username field.
	* Password: Paste the password from the Password field.
	* After completing the configuration, click Save and refresh the page to check the device connection status.
		 ![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-008.png)
3. If the device connection status shows "Connected" and the device count on the Beaver-IoT platform’s Device Management page increases by one, it means the NE-101 has successfully connected to the MQTT server.
	 ![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-009.png)
### Configure CamThink Platform Token

1. Log in to CamThink [website](http://192.168.13.9:3000)(Test account: Admin, password: 123456Ab). Click on 'Token Management' to enter the device page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-010.png)
2. On the device page, click the 'Add' button in the upper left corner to enter the Add Token page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-011.png)
3. Edit the Token details, including: Name (customizable), Model Permissions (select required model permissions from the dropdown menu), Request Frequency Limit (customizable, default is 60), Request Quantity Limit (customizable, default is 1000), IP Whitelist (fill in as needed), and Remarks (paste the password from the Password field in Step 3). After editing, click Save.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-012.png)
4. In the pop-up window after saving, click 'Copy' to copy the token value.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-013.png)
### Deploy CamThink AI Inference Service

1. Log in to Beaver-IoT and go to the platform homepage. Click the 'Integration' button to enter the platform integration page, then click the 'CamThink AI Inference Service' icon to access the CamThink AI Inference Service device integration page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-014.png)
2. Edit the Integration Configuration, including: Service IP Address (paste the CamThink Web URL) and Token (paste the token value copied during the CamThink platform token configuration process). After editing, click 'Save'. If the connection status changes to 'Connected', Beaver-IoT has successfully invoked the CamThink AI Inference Service.
3. Click 'Binding devices' to enter the device binding page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-016.png)
4. Click '+ Bind Device' at the top left of the device binding page to add the IoT devices that need to connect to the AI inference service.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-017.png)
5. Edit the device binding page, including: Device Name (select from the dropdown menu), Entity (select from the dropdown menu), and AI Model (select from the dropdown menu). After making your selections, click 'Save' at the top right of the page.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-018.png)
6. After saving, you will be redirected to the device binding page, where the information of the bound devices will be displayed.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-019.png)
### Verify the AI inference deployment results.

1. Press the button on the NE101 device to capture an image. Refresh the device binding page and check the Origin Image and inference status of the current device. If the Origin Image displays the captured image and the inference status shows 'Normal', the AI inference deployment is successful.
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-020.png)