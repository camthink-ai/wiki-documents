# 2-Client-data-display
## 概述

本章用于帮助您将NE101设备接入网络，并通过MQTT协议，实现与 MQTT 客户端的可靠连接，为后续的数据传输、设备控制等功能奠定基础。

## 前期准备

* **硬件设备：NE101**
* **MQTT服务器**：broker.emqx.io（EMQ 提供的公共 MQTT 服务器地址）
* **MQTT客户端**：MQTTX
* **其他设备**：PC或者移动端设备（用于访问设备Web配置页）
* **网络环境**：可连接到远程服务器的有效且较为稳定的网络环境

## 具体操作

### 配置NE101设备

1. 设备配置详情参见[Quick Start](https://camthink-ai.github.io/wiki-documents/docs/NeoEyes%20NE101%20Series/Quick%20Start)。

2. **配置页面

	* Host（可以是公共MQTT服务器域名【如`broker.emqx.io` 】，也可以是部署MQTT服务器的IP 地址【如`192.168.1.100` 】，注：公用服务器不要上传敏感数据）。
	* MQTT Port（默认端口1883）。
	* Topic（根据NE101上报数据自定义主题）。
	* 配置完成后点击save，若status显示connected，则物联网设备和MQTT服务器连接成功。
		
		![跳转页面](/img/NE101-data/NE101-data-01.png)
		

### 配置MQTT客户端


1. PC端下载 MQTTX客户端（[mqttx.app/](https://mqttx.app/)）。

2. 打开下载的MQTTX，点击创建连接 。
	
	![跳转页面](/img/NE101-data/NE101-data-02.png)
	
3. 填写连接基本信息，包括，Name（自定义）、Host（**和物联网设备配置页面的 MQTT 服务器地址保持一致**）、以及Port （**和物联网设备配置页面端口号保持一致，默认1883**）。
	
	![跳转页面](/img/NE101-data/NE101-data-03.png)
	
4. 点击右上角connect，创建连接。
	
	![跳转页面](/img/NE101-data/NE101-data-04.png)
	
5. 若出现右上角开关键，则连接成功，发起MQTT主题订阅请求（点击new subscription）。
	
	![跳转页面](/img/NE101-data/NE101-data-05.png)
	
6. 复制设备的主题，粘贴至MQTT主题框(**确保与NE101设备端主题一致**)，然后点击确认 。
	
	![跳转页面](/img/NE101-data/NE101-data-06.png)
	
### 验证连接是否成功

1. 启动NE101，按压拍摄按键进行抓拍。

2. 查看MQTT客户端是否有上传数据。
	
	![跳转页面](/img/NE101-data/NE101-data-07.png)
	
3. 若出现上述数据，则说明NE101成功通过 MQTT 服务器实现与MQTT 客户端的数据交互。
### 图像预览

1. 在MQTT客户端获取到MQTT数据后，截取image的字段，打开base在线工具，如Base64.Guru[官网](https://base64.guru/converter/decode/image)，填写截取的image的字段。
	
	![跳转页面](/img/NE101-data/NE101-data-08.png)
	
2. 点击"decode Base64 to Image "预览图片。
	
	![跳转页面](/img/NE101-data/NE101-data-09.png)
	
3. 查看信息、下载图片等。
	
	![跳转页面](/img/NE101-data/NE101-data-10.png)
	
### 问题汇总

1. MQTT客户端和MQTT服务端连接反复掉线
	* 原因：网络不稳定
		* 解决方案：切换到外部较稳定的网络
2. MQTT客户端获取不到NE101设备数据
	* 可能的原因①：网络不稳定导致设备掉线
		* 解决方案：设备掉线后会重复七次再次连接网络，期间观察MQTT客户端，看是否收到设备上传的运行数据，若未能收到上传数据，手动在设备的web配置页连接网络
	* 可能的原因②：MQTT客户端订阅主题未复制粘贴，手动键入可能导致细微差别
		* 解决方案：重新执行配置MQTT客户端的步骤5和步骤6