---
description: 本教程详细介绍 CamThink AI Tool Stack 的使用方法，涵盖从数据采集、标注、YOLO 模型训练到 NE301 边缘设备量化部署的完整流程，帮助开发者快速构建 AI 应用。
keywords: [AI Tool Stack, 模型训练, 数据标注, 模型量化, NE301, YOLO, 边缘部署, Docker, 深度学习, CamThink]
tags: [开发工具, 模型训练, NE301, 量化部署, 教程]
---

# 使用 AI Tool Stack 训练和部署 AI 模型

![Automated AI model training process](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/work.png)

## 主要工具与产品

本教程主要会使用AI Tool Stack来与NeoEyes NE301结合完成模型数据采集到部署的过程，AI Tool Stack是CamThink为NeoEyes NE301构建的端到端边缘AI工具，涵盖数据采集、标注、训练、量化和部署，它支持用户自行部署和管理，AI Tool Stack的训练和量化的底层支撑来自于[Ultralytics](https://www.ultralytics.com)项目库，感谢Ultralytics团队的出色贡献。

### AI Tool Stack

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/an.png)

AI Tool Stack 提供以下核心功能模块：

- **AI模型项目**：项目创建和数据管理
- **标注工作台**：数据标注工具
- **模型训练**：模型训练和测试
- **量化与部署**：模型量化和一键导出 NE301 模型包
- **模型管理**：简单的模型管理和测试  
AI Tool Stack完全开源，托管在GitHub上，你可以在这里找到代码仓库 [AI Tool Stack](https://github.com/camthink-ai/AIToolStack)

### NeoEyes NE301

![NE301](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/ne301-2.png)  
CamThink AI Camera NeoEyes NE301支持AI模型的动态部署，因此在本教程中训练完成的模型可以导出NE301可用资源包，在设备的WebUI上进行模型更新，来实现模型的边缘部署，让NeoEyes NE301具备我们我们训练的模型检测能力，来实现边缘AI的持续工作，点击可查看 [NE301](../../0-overview.md)的硬件相关特性

### 服务器或个人电脑

AI Tool Stack是开源的并且如果需要训练模型，你需要一台性能较为强劲的个人电脑或服务器，它最好带有NVIDIA GPU或Mac的M系列芯片，即使我们不会使用超大的数据集来训练模型，但是为了保证效率，最好选择一台性能合适的设备来完成这项工作，或者使用GPU服务器来部署。

## 拓扑说明

> **保证NE301与部署AI Tool Stack的服务器或PC处于同一个网络下，例如他们都连接同一台路由器，或者服务器有开放的IP和域名**

为了实现NE301相机与AI Tool Stack应用的连接，因为AI Tool Stack内置了MQTT服务，我们将通过NE301内置的MQTT功能与AI Tool Stack的MQTT服务进行连接，来实现NE301数据采集的上传，后续将支持模型的远程更新，因此在开始之前你需要保证NE301可访问到AI Tool Stack服务，AI Tool Stack服务内的MQTT服务要可被外部访问，网络拓扑如下：

![Topological](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Topological.png)

## 安装说明

### 必要条件

**Docker & docker-compose**：请参考 [Docker 官方安装指南](https://docs.docker.com/get-docker/) 和 [docker-compose 安装文档](https://docs.docker.com/compose/install/) 进行安装，保证部署AI Tool Stack的服务器或计算机有Docker的基本环境。

### AI Tool Stack安装

**1. 克隆仓库**

```sh
git clone https://github.com/camthink-ai/AIToolStack.git
cd AIToolStack
```

**2. 使用 Docker 部署**

> **注意**：要修改 `MQTT_BROKER_HOST` 等参数，请编辑 `docker-compose.yml` 中的环境变量。确保MQTT服务地址可被 NE301 设备访问，通常使用主机的实际可访问IP地址，而不是localhost。

```sh
docker-compose build
docker-compose up
```

### NE301编译环境安装

AI Tool Stack为了生成NE301可用的量化模型包，必须引用NE301工程编译环境来做到这一点，请提前拉取镜像：

```sh
docker pull camthink/ne301-dev:latest
```

### 安装验证

#### AI Tool Stack安装验证

安装完成后，可以通过以下方式验证AI Tool Stack服务是否成功启动

**查看服务状态**

通过下方命令行确保能看到 `camthink/aitoolstack:latest`等相关服务正在运行。

```sh
docker ps
```

**访问前端网页**

浏览器中输入部署服务器的IP地址和对应端口，默认为 `http://<your_server_ip>:8000` 或 `http://localhost:8000`，若能访问到AI Tool Stack的Web界面，则部署成功。

#### NE301编译环境安装验证

**查看服务状态**

通过下方命令行确保能看到 `camthink/ne301-dev:latest`相关服务正在运行。

```sh
docker ps
```

## 你的需求

在开始工作前，你可以先评估当前你是否有可用模型，如果你考虑的是现有模型部署到NE301中，那么可跳转到此位置阅读「[部署现有模型到NE301](#现有模型量化和部署)」

如果你没有训练过任何模型，想要从头开始完成模型训练和模型部署，请从这里开始阅读「[从训练到部署](#完整工作流指南)」

## 完整工作流指南

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Home.png)

### 创建项目

进入Web页后，点击「Start Creating Project」按钮或「Al Model Projects」菜单，进入项目管理页面，根据你的需要来构建一个项目用来标注数据和训练模型，进入Al Model Projects页面后，点击「Create New AI Model Project」按钮来创建一个项目，输入你的项目名称和项目描述，点击保存后创建项目，项目创建成功后点击卡片进入项目工作台。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/aiproject.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/projectmodal.png)

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

你需要有一台NE301设备，并且在设备内按照下方顺序进行配置，NE301的操作指南详见「[Quick-Start](../../1-quick-start.md)」

a.NE301通电，长按2s拍照键开启设备WiFi AP，使用个人电脑或手机连接NE301的WiFi AP，使用192.168.10.10进入NE301 Web UI页面，进入「**System Settings**」页面在「**Communications**」菜单中中选择当前设备可连接的路由WiFi AP，确保NE301设备使用此WiFi可正常访问到部署AI Tool Stack服务，例如路由可范围外部网络及通过IP与本地部署的AI Tool Stack服务连接。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/wakeup2.jpg)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/communications.png)

b.配置NE301的MQTT服务，实现NE301通过MQTT上报当前采集的图像数据到AI Tool Stack的项目中，进入NE301的「**Application Management**」的菜单，输入Data Reporting Topic与Server Address信息与AI Tool Stack内置的MQTT服务进行连接，AI Tool Stack可以在项目工作台中顶部的MQTT中获取，如下图所示，确认信息无误后可以点击「**connect**」让NE301连接到AI Tool Stack的指定模型训练项目中

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MQTT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MQTT.png)

c.现在你只需要手动操作NE301侧面的拍摄按键进行图像的抓取，抓取后的图像会自动上传到项目空间中你可以手动拿着NE301在网络允许的范围内采集数据，或者固定NE301后进行数据采集，采集完成图像后你可以对图像进行下一步标注工作。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Capture.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/repimage.png)

### 数据标注

> 当前NE301主要适配目标检测模型，我们推荐先以目标检测数据集进行数据集构建。  
> 在开始标注数据之前需要在右侧类的输入框内添加你所需要的标注类文本、选择此类的标注框颜色，点击保存创建标注类，标注快捷键同常规标注工具，详情可见标注工具台中的快捷键提示，点击底部的「Shortcuts」即可展开说明，其他功能例如删除类、删除标注数据、删除图像、更换功能等按照界面指示操作即可

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/CreateClass.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/Annotation.png)

### 模型训练

完成所有数据标注后点击「Train Model」开始训练模型，进入训练界面后，你需要针对当前项目数据集构建新的训练任务，点击「New Training」，配置训练信息，如果你对训练参数不完全了解，我们建议你直接使用默认配置设置即可，高级部分参数无需调整，它们都将以默认值运行，点击「Start Training」开启训练任务，任务启动查看训练过程日志，等待训练结束即可。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/train.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/trainfrom.png) ![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/trainlog.png)

在完成模型训练后，你可以在训练详情中查看日志，以及训练模型的精度表现，并且你可以操作下方几项功能，所有模型文件可以在Model Space中的列表中找到

- Export Model：可导出训练好的.pt模型到本地文件夹
- Test Model：可上传图像测试当前训练模型的整体检测效果如何，来评估训练成果
- **Quantize （TFLite & CamThink NE301）：可量化为tflite模型及NE301可用的模型文件包，如果需要部署到NE301设备中，此步骤是必要的**  
![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/modoltest.png)

### 模型量化

若要部署模型到NE301设备中，此动作是必要的，量化需要依赖NE301的开发环境Docker，请保证你已经安装了「[NE301 Dev Docker](#ne301编译环境安装)」

在你测试模型效果后可以开始量化工作并准备将量化后的模型进行NE301部署

模型训练完成后你可以点击「Quantize （TFLite & CamThink NE301）」来构建模型量化任务,在任务弹窗中你可以设置一些量化参数，除了input size参数，其他的我们不建议进行任何改动，**input size参数的设置值我们建议设置 256、416、640中的一个，此参数代表量化后的模型支持的图像输入大小，如果你不想调整，使用默认值即可，我们推荐你设置256，如果你要更好的精度表现请设置416，640下推理性能吃紧，谨慎设置**，点击「Start Quantization」就行，模型会启动量化流程，你仅需要等待量化完成，此过程需要漫长等待，请不要关闭任务窗口，大约需要5-10分钟的时间，待模型量化完成后，你可以看到量化后的NE301模型资源包，点击「Download Model Package」下载它（或者关闭后在模型空间菜单中找到此资源去下载），下一步就可以将模型更新至NE301设备本地。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/QT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/startQT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/QTMdown.png)

### 模型部署

现在我们已经训练好模型并导出NE301设备可部署的模型资源文件了，现在可以在NE301的设备中进行模型部署，当前模型部署还需要进入NE301设备的WebUI中上传更新设备模型文件，未来AI Tool Stack会支持远程模型更新，下方将会说明你如何在NE301上更新训练好的模型文件。

使用下载模型的手机或电脑连接NE301的WiFi，进入NE301 Web UI页面，在Current Model中点击「upload」选取下载的NE301模型文件进行模型更新，等待模型更新后，测试设备模型检测效果，你可以通过NE301管理页面携带的「Model Validation」功能进行测试，或者直接在NE301中预览目标类的检测效果，可以调整Conf和NMS来验证效果如何。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/inference-setting.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/loding.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/modolval.png)

## 现有模型量化和部署

如果你已经拥有训练好的Ultralytics YOLOv8模型，恰好它是Ultralytics YOLOv8n模型，为什么是Ultralytics YOLOv8n，因为在NE301上部署中的模型n尺寸下的模型性能和表现比较合适，未来还会支持Ultralytics YOLO11 和Ultralytics YOLO26 等模型，如果你需要将现有模型部署在NE301中，你可以在AI Tool Stack的「Model Space」菜单中找到「Upload Model for Quantization」按钮，点击它在表单中填写信息

- Model Name：定义一个名称
- Model Type：默认Ultralytics YOLOv8n
- Input Size：默认640，根据你的模型输入图像大小调整
- Number of Classes：根据你的模型检测类数量调整
- Class Names：填写你的模型类型  
点击「Upload」上传你的模型，在列表中找到你上传的模型，你可以点击测试来测试此模型的表现。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSU.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSUfrom.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSUtest.png)

模型验证完成后，我们开始对模型进行量化，让模型量化成NE301可部署的模型资源，点击列表的量化按钮，在弹窗中填写Input Size（256、416、640），点击「Start Quantization」按钮，等待量化工作的完成，此过程需要较久，请耐心等待，在完成模型量化后，列表会出现NE301可用的模型资源，可下载此文件并在NE301设备上进行部署，模型部署细节可见[模型部署](#模型部署)

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSUQT.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSUQTfrom.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/MSUdown.png)

## 训练到模型量化部署效果一览

下方是我们通过此工具从NE301设备上采集31张图像使用MQTT推送到项目中，并且完成标注，此模型是识别镊子和螺丝刀的检测模型，下方是经过训练和量化后部署到NE301的检测效果，此过程仅花费不到2个小时的时间。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/modolrun.png)