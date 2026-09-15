---
sidebar_label: "Projects & Annotation"
sidebar_position: 2
description: "AI 模型项目：MQTT 图像自动采集、数据集构建与标注工作台。"
---
# AI 模型项目与标注

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Home.png)

## 创建项目

### 创建项目

进入Web页后，点击「Start Creating Project」按钮或「Al Model Projects」菜单，进入项目管理页面，根据你的需要来构建一个项目用来标注数据和训练模型，进入Al Model Projects页面后，点击「Create New AI Model Project」按钮来创建一个项目，输入你的项目名称和项目描述，点击保存后创建项目，项目创建成功后点击卡片进入项目工作台。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/aiproject.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/projectmodal.png)

## 构建数据集

### 构建数据集

点击项目进入项目工作台，工作台分为左侧工具、底部快捷键提示、右侧为类管理、标注数据列表、数据集图片管理

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/projectinfo.png)

#### 1.上传/导入数据集

目前支持以下几种方式来构建项目的图像数据集

a.你可以通过右侧的「Upload Images」上传本地文件

b.你可以在右上角的「Import Dataset」上传数据集文件，支持COCO数据集和Ultralytics YOLO数据集格式，如果你需要详细了解支持的数据集格式可通过「Export Dataset」导出文件查看数据结构，本工具标注源数据，格式如下：

```plaintext
├── images/
├── annotations/
│   ├── *.json
└── classes.json   # id/name/color
```

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/impdata.png)

#### 2.让NE301采集图像

你需要有一台NE301设备，并且在设备内按照下方顺序进行配置，NE301的操作指南详见「[Quick-Start](/docs/neoeyes-ne301-series/quick-start)」

a.NE301通电，长按2s拍照键开启设备WiFi AP，使用个人电脑或手机连接NE301的WiFi AP，使用192.168.10.10进入NE301 Web UI页面，进入「**System Settings**」页面在「**Communications**」菜单中中选择当前设备可连接的路由WiFi AP，确保NE301设备使用此WiFi可正常访问到部署AI Tool Stack服务，例如路由可范围外部网络及通过IP与本地部署的AI Tool Stack服务连接。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/wakeup2.jpg)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/communications.png)

b.配置NE301的MQTT服务，实现NE301通过MQTT上报当前采集的图像数据到AI Tool Stack的项目中，进入NE301的「**Application Management**」的菜单，输入Data Reporting Topic与Server Address信息与AI Tool Stack内置的MQTT服务进行连接，AI Tool Stack可以在项目工作台中顶部的MQTT中获取，如下图所示，确认信息无误后可以点击「**connect**」让NE301连接到AI Tool Stack的指定模型训练项目中

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MQTT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MQTT.png)

c.现在你只需要手动操作NE301侧面的拍摄按键进行图像的抓取，抓取后的图像会自动上传到项目空间中你可以手动拿着NE301在网络允许的范围内采集数据，或者固定NE301后进行数据采集，采集完成图像后你可以对图像进行下一步标注工作。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Capture.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/repimage.png)

## 数据标注

### 数据标注

> 当前NE301主要适配目标检测模型，我们推荐先以目标检测数据集进行数据集构建。  
> 在开始标注数据之前需要在右侧类的输入框内添加你所需要的标注类文本、选择此类的标注框颜色，点击保存创建标注类，标注快捷键同常规标注工具，详情可见标注工具台中的快捷键提示，点击底部的「Shortcuts」即可展开说明，其他功能例如删除类、删除标注数据、删除图像、更换功能等按照界面指示操作即可

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/CreateClass.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Annotation.png)

