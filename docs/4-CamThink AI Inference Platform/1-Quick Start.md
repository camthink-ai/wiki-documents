## 概述

本章主要帮助您快速使用AI推理服务处理物联网设备数据。
## 前期准备

* **硬件设备**：能够上报 MQTT 数据的物联网设备，如：NE101。
* **Beaver-IoT平台**：安装说明参见[官网](https://www.milesight.com/beaver-iot/zh-Hans/docs/user-guides/introduction/)。
* **CamThink平台**：[官网](https://infer.camthink.ai/)。
* **其他设备**：PC或者移动端设备（用于访问设备Web配置页）。
* **网络环境**：可连接到远程服务器的有效且较为稳定的网络环境。
## 具体操作

## 整体思路

![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-021.png)
### 配置MQTT Device Integrated

1. 登录Beaver-IoT，点击'Integration'按钮，进入平台集成页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-001.png)
2. 点击'MQTT Device Integrated'图标，进入MQTT设备集成页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-002.png)
3. 查看MQTT设备集成页面的MQTT Broker信息。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-003.png) 
4. 点击MQTT设备集成页面的'Device template management'，进入设备模板管理页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-004.png)
5. 点击'+Add'，添加设备。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-005.png)
6. 编辑'Add device template'页面，包括：Device template name(根据设备信息自定义)，Device Topic(用于设备订阅主题，上传数据)，Device entity definition(查看右侧View Document链接后填写)，Remark（备注），编辑结束后，点击'Confirm'保存。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-006.png)
7. 保存后，跳转到设备管理模板的设备管理页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-007.png)
### 配置物联网设备

1. 此处以NE101为例，设备配置详情参见[Quick Start](https://camthink-ai.github.io/wiki-documents/docs/NeoEyes%20NE101%20Series/Quick%20Start)，配置页面内容根据下面步骤2填写。
2. 配置页面（点击步骤3中的MQTT Broker信息和步骤6中的Device Topic后面的复制粘贴按钮，复制相关信息，注：必须通过点击复制粘贴按钮进行复制粘贴）。
	* 主机（粘贴MQTT sever address框的IP地址，若IP地址显示localhost，则此处填写本机IP地址）。
	* MQTT端口号（粘贴MQTT Broker Port框的端口号）。
	* 主题（粘贴Device Topic框的主题）。
	* 用户名（粘贴username框的用户名）。
	* 密码（粘贴Password框的密码）。
	* 配置完成后点击保存，并刷新页面，查看设备连接状态。
		 ![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-008.png)
3. 若设备连接状态显示已连接，且检查Beaver-IoT平台的设备管理页面，设备数量加1，则NE-101和MQTT服务器连接成功。
	 ![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-009.png)
### 配置CamThink平台 Token

1. 登录CamThink [官网](http://192.168.13.9:3000)（测试账号：Admin，密码：123456Ab）,点击'Token管理'，进入设备页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-010.png)
2. 点击设备页面左上角'添加'按钮，进入添加Token页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-011.png)
3. 编辑Token内容，包括：名称（自定义），模型权限（根据需求在下拉框里面选择需要的模型权限），请求频率限制（自定义，默认60）请求数量限制（自定义，默认1000），IP白名单（根据需求填写），备注（粘贴步骤3中的Password框的密码），编辑结束后，点击保存。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-012.png)
4. 在保存后跳转的弹窗页面点击'复制'，复制token值。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-013.png)
### 部署CamThink AI Inference Service

1. 登录Beaver-IoT平台主页，点击'Integration'按钮，进入平台集成页面，点击'CamThink AI Interference Service'图标，进入CamThink AI Interference Service设备集成页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-014.png)
2. 编辑Integration Configuration,包括：Service IP address（粘贴CamThink Web网址），Token（粘贴配置CamThink平台 Token过程中复制的token值），编辑结束后，点击'save'保存，若连接状态变为'connected'，则Beaver-IoT调用CamThink AI推理服务成功。
3. 点击'Binding devices',进入设备绑定页面。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-016.png)
4. 点击设备绑定页面左上角'+ Bind Device',添加需要连接AI推理的物联网设备。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-017.png)
5. 编辑设备绑定页面，包括：设备名称（在下拉框里面选择），实体（在下拉框里面选择），AI模型（在下拉框里面选择），选择完成后，点击页面右上角'Save'。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-018.png)
6. 保存之后，跳转到设备绑定页面，出现绑定的设备信息。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-019.png)
### 验证AI推理部署结果

1. 按压NE101设备按键进行拍摄，刷新设备绑定页面，查看当前设备Origin Image和推理状态，若Origin Image为拍摄图像，推理状态显示'Normal',则AI推理部署成功。
	![image](/img/AI-Inference-data/AI-Inference-quick-start/beaver-iot-020.png)