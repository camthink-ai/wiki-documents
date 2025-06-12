import AccessoriesTable from '@site/src/components/AccessoriesTable';

# Quick Start

## 概述

本教程将详细描述NE101的使用说明，涵盖内容，包括设备基本使用、设备配置、以及设备安装。

## 产品准备

在开始前请准备NE101设备、5号AA电池*4、十字螺丝刀*1、以及NE101的相关选配件，例如:Cat-1通讯模块、WiFi-Halow通讯模块，如果你还没有NE101设备，可以通过我们的商城进行获取，请点击[「NE101购买地址」](https://www.camthink.ai)。

![NE101](/img/QuickStart/NE101/ne101_1.png)

## 产品使用

### 设备开机

使用螺丝刀拆卸NE101后盖，按照电池仓分布安装电池，等待相机前部的**灯光闪烁亮起**后，表示相机已经**系统启动**，将后盖重新安装回设备，到这里你将完成设备的基本启动，完成后我们可以进行下一步，对设备进行配置。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_2.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_3.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_4.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_5.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### 设备配置

对于设备配置，NE101内置WiFi AP提供了一个配置Web供用户对设备的参数和功能进行修改，WiFi AP的SSID名称规则为 **NE101_ABC123**，请保证身边有手机或电脑可以连接NE101提供的WiFi AP来访问Web网页进行配置修改，连接若成功连接WiFi AP可通过**192.168.1.1**访问配置Web页，接下来将详细说明相关操作步骤。

#### 1、保证NE101处于开机状态

你可以手指轻按相机右侧的拍照按钮，查看闪光灯是否亮起，如果亮起说明当前机器处于开机状态，如果你是在调试设备，点击拍照按键NE101将会抓取当前页面图像，并通过你配置的MQTT地址上传图像，如果一切配置正常的话，详细配置修改见下方说明。

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_6.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
</div>

#### 2、开启NE101 WiFi AP 并在手机或电脑上寻找到它

NE101系统正常启动后，你可以在电脑或手机的WiFi AP列表寻找对应SSID规则为 **NE101_ABC123**的WiFi AP，点击连接它，你无需输入密码，当你正常链接后，即可通过**192.168.1.1**地址在浏览器中访问到NE101的配置Web页，如果你成功了将看到浏览器上的Web页面。

> **在新的固件版本中为了进一步降低NE101的使用功耗，WiFi AP的唤醒逻辑为长按拍照键3s（逻辑改：长按3-5S，且等灯闪2次），直到灯光闪烁亮起，可以参考下方的操作录屏**

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_7.gif" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_9.png" alt="bracket" style={{ height: '200px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_10.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>

#### 3、进行设备配置

如果你进入了设备的配置页面，我们来看看如何修改配置，下方将会根据配置类别和主要作用来分别说明。

**图像设置**

> 如果你使用的是OV5640相机模组，你可以根据实际的场景需求来更改设备的图像设置，可设置的内容为所有，**USB相机模组仅支持补光灯设置**

- 默认按钮：点击后会重置OV5640相机模组的参数为出厂设置，请谨慎使用。
- 补光灯模式：支持自动模式、自定义、常开、长开4种模式，请根据你的实际使用场景设置此配置。
  - 自动模式
    - 选择自动模式需要额外设置“光照阈值”，“光照阈值”文本右侧数值为当前环境的光照数值，你可通过数值右侧的按钮刷新数据，右侧可拖拽设置阈值，阈值作用为当光照强度低于设置值时自动开启设备补光灯。
    - 光照强度为补光灯强度，1-100可调整。
  - 自定义模式
    - 支持设置时间范围，指的是时间在什么区间内设备会启用补光灯，通常是具有周期性的场景下定期开始补光灯保证图像质量时使用此模式
    - 光照强度为补光灯强度，1-100可调整。
  - 常开模式
    - 补光灯常开，无论什么时候，补光灯均开启，不支持设置光照强度
  - 常关模式
    - 补光灯常关，无论什么时候，补光灯均不开启
- 图像调整功能
  - 明亮度：0-2可调节
  - 对比度：0-2可调节
  - 饱和度：0-2可调节
  - 水平翻转：画面水平翻转，用于设备实际安装后成像需要水平翻转时使用
  - 垂直翻转：画面垂直翻转，用于设备实际安装后成像需要垂直翻转时使用
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
    <img src="/img/QuickStart/NE101/ne101_11.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
    </div>

**抓图设置**

> 用于设置NE101设备的抓图功能设置，用户可以根据硬件执行扩展PIR传感器等硬件出发设备抓图，详情可见开发文档

- 启用排程抓图：开启功能后支持设置设备周期性进行图像抓拍的相关功能设置。
  - 定时抓图模式：支持设置每天定时抓图或周一至周日具体时间点抓图，时间可以设置00:00 - 23:59，最多支持设置8个抓拍时间用于定时图像抓取。
  - 间隔抓图模式：支持设置抓图的时间间隔，用于按照时间间隔进行图像抓取，支持按照分钟、小时、天的时间纬度进行设置，最多仅支持1个规则设置。
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
    <img src="/img/QuickStart/NE101/ne101_12.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    <img src="/img/QuickStart/NE101/ne101_13.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    </div>
- Alarm-In抓图：开启功能后支持，硬件主板背部的Alarm-In座子输入信号用于图像抓拍。
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_18.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  </div>
- 启用按键抓图：开启抓图按键，**此功能建议不要关闭**，用于设备外部右侧的开关按键可操作抓取当前图像使用。
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_19.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  </div>

**数据上报**

> 用于设置NE101的数据上报的MQTT信息，完善下方信息后，点击**Save**按钮即可保存配置

- Host：用于填写MQTT服务端的域名或IP。
- MQTT Port：用于填写MQTT订阅端口号，默认为1883。
- Topic：用于设置此设备上报数据的Topic。
- Client ID：用于明确此在MQTT服务中的客户端唯一标识。
- QoS：MQTT QoS设置，支持QoS 0、QoS 1、QoS 2可选。
- Username：用于设置连接MQTT服务所需校验的用户名。
- Password：用于设置连接MQTT服务所需校验的用户名对应的密码，需要与上方相同。
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_15.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  </div>

**设备管理**

> 用于查看NE101当前的设备信息，以及支持导入固件包进行镜像更新

- 设备名称：支持修改NE101的设备名称，设备名称在设备采集图像数据后跟随图像上报数据进行上传，在JSON数据中的devName信息种显示此名称。
- MAC地址：设备的MAC地址。
- SN：设备的唯一标识，通常用于唯一身份判断以及售后服务时提供。
- 电池：设备当前的电池剩余电量。
- 硬件版本：当前硬件版本。
- 固件版本：当前硬件装载的固件版本。
- 固件更新：点击下方的Browse按钮，可以选择电脑或手机的文件，选取需要升级的镜像文件后，可以点击Upgrade按钮上传进行镜像更新，需要注意**设备更新完成后需要刷新Web页，少数情况需要重新连接NE101的WiFi AP**
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_14.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  </div>

**网络连接**

> NE101的网络连接设置，根据所选的通讯方案设置内容有所差异，主要有**WiFi、Cat-1、WiFi-Halow**3种通讯方案可设置，下方详细说明这些通讯方案的设置与使用。

- **WiFi设置**：NE101标准版本自带WiFi，WiFi版本下，可在配置界面中查看当前范围内可检索到的WiFi信号，你可以根据所需连接的WiFi进行选择设置，设备会自动记录WiFi的SSID和密码，如果重复设置NE101连接的WiFi则设备存储的SSID和密码始终是最近一次的。
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_13.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
  </div>
- **Cat-1网络设置**：NE101 Cat-1版本支持进行网络的设置，你有一些必要的前提条件，分别是所在地区的sim卡，当前NE101 Cat-1版本支持除北美地区以外的其他地区使用，请按照当前地区的所在运营商购置对应的sim卡，下方将会说明如何进行Cat-1网络设置，如何获取Cat-1版本的NE101，可以考虑。
  - 使用螺丝刀打开NE101的设备前盖。
  - 拆卸完成后可以看到设备前面的sim卡槽，在sim卡槽内插入sim卡。
  - 重新安装设备前盖。
  - 打开浏览器，进入设备的配置Web页，在浏览器内输入**192.168.1.1**。
  - 到下方的Cellular配置，按照运营商提供的sim卡信息按照需求输入APN、Username、Password、PIN Code、Authentication Type、AT Commands，你可以点击「Send」按钮测试蜂窝网络，如果正常Cellular Status
    会变为connect状态，说明网络正常，然后点击save保存信息。
  - 你可以通过Details按钮来查看网络的详细信息，显示信息可以参考下方图像。
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
    <img src="/img/QuickStart/NE101/ne101_21.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    <img src="/img/QuickStart/NE101/ne101_20.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    <img src="/img/QuickStart/NE101/ne101_23.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    <img src="/img/QuickStart/NE101/ne101_22.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
    </div>

- **WiFi Halow网络设置**：NE101 WiFi-Halow版本支持进行网络设置，可以通过Refresh按钮刷新当前的WiFi-Halow网关信号，Region下拉选择对应的区域频段，找对所需要的WiFi-Halow SSID进行连接。
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/QuickStart/NE101/ne101_24.png" alt="bracket" style={{ height: '200px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_25.png" alt="bracket" style={{ height: '200px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_26.png" alt="bracket" style={{ height: '200px', objectFit: 'contain', margin: '0 auto' }} />
  </div>

### 设备调试

在明确设备的**网络设置**与**数据上报**的配置是正常的情况下，NE101即可进行图像抓拍与传输，进行调试的方式为，点击NE101的拍照按键进行图像采集，通过检查MQTT服务是否接收到设备数据为准查看设备数据来调试设备是否可以正常采集和传输数据到MQTT服务端。

#### MQTTX接收MQTT数据

为了验证设备的数据上报功能是否正常，可以使用 MQTT 客户端工具（如 [MQTTX](https://mqttx.app/)）进行数据接收测试。

##### 步骤说明

> 需要保证MQTTX服务端可被NE101连接

1. 打开 MQTTX，点击 `新建连接`。
2. 设置以下连接参数：
   - **Host**：`192.168.44.80`
   - **Port**：`1884`
   - **Client ID**：任意字符串，例如 `mqttx-client-01`
   - **Topic**：`left`
   - **Username / Password**：留空
3. 点击连接后，订阅 Topic `left`。
4. 可点击设备右侧的拍照按钮进行图像采集。
5. 设备采集到图像数据后，将通过 MQTT 向该 Topic 发布消息。

##### 数据格式说明

设备发送的 MQTT 消息 payload 内容为 JSON 格式，如下所示：

```json
{
  "ts": 1740640441620,
  "values": {
    "devName": "NE101 Sensing Camera",
    "devMac": "D8:3B:DA:4D:10:2C",
    "battery": 84,
    "snapType": "Button",
    "localtime": "2025-02-27 15:14:01",
    "imageSize": 74371,
    "image": "data:image/jpeg;base64,..."
  }
}
```

##### 字段说明

- `ts`：时间戳（毫秒）
- `devName`：设备名称
- `devMac`：设备 MAC 地址
- `battery`：电池电量（百分比）
- `snapType`：图像采集类型（如 `Button`, `Scheduled`, `PIR` 等）
- `localtime`：本地时间（字符串格式）
- `imageSize`：图像大小（单位：字节）
- `image`：Base64 编码的 JPEG 图像数据，前缀为 `data:image/jpeg;base64,`

##### 可视化建议

使用 Base64 图像数据可在网页或工具中快速预览图像：

```html
<img src="data:image/jpeg;base64,...">
```

也可以将 Base64 数据粘贴至 [Base64图像查看器](https://base64.guru/converter/decode/image) 进行在线预览。

## 产品安装

> NE101的产品安装有多种选择，可以选择CamThink提供的丰富支架来进行设备安装，下方将会说明主要的几个可选支架如何进行简单的使用和安装。

### 底部支架扩展件

找到NE101侧面的螺丝孔，将支架与设备对齐，对齐后使用螺丝进行固定，固定完成后可以旋转支架调整角度，将支架底部与需要固定安装的位置进行螺丝打孔固定。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/Overview/NE101/Bracket/1.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
   <img src="/img/QuickStart/NE101/ne101_27.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>

### 背部支架扩展件

找到NE101侧面的螺丝孔，将支架与设备对齐，对齐后使用螺丝进行固定，找到需要壁挂安装的位置，将支架左右两侧的螺丝孔进行螺丝固定安装。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="/img/Overview/NE101/Bracket/3.png" alt="bracket" style={{ height: '300px', objectFit: 'contain', margin: '0 auto' }} />
  <img src="/img/QuickStart/NE101/ne101_28.png" alt="bracket" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>
