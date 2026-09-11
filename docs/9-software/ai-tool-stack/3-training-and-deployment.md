---
sidebar_label: "Training & Deployment"
sidebar_position: 3
description: "模型训练、量化与 NE301 部署，以及现有 YOLO 模型的免训练量化。"
---
# 训练、量化与部署

## 开始前：评估你的需求

在开始工作前，你可以先评估当前你是否有可用模型，如果你考虑的是现有模型部署到NE301中，那么可跳转到此位置阅读「[部署现有模型到NE301](#现有模型量化和部署)」

如果你没有训练过任何模型，想要从头开始完成模型训练和模型部署，请从这里开始阅读「[AI 模型项目与标注](./projects-and-annotation)」

## 模型训练

### 模型训练

完成所有数据标注后点击「Train Model」开始训练模型，进入训练界面后，你需要针对当前项目数据集构建新的训练任务，点击「New Training」，配置训练信息，如果你对训练参数不完全了解，我们建议你直接使用默认配置设置即可，高级部分参数无需调整，它们都将以默认值运行，点击「Start Training」开启训练任务，任务启动查看训练过程日志，等待训练结束即可。

![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/train.png)![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/trainfrom.png) ![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/trainlog.png)

在完成模型训练后，你可以在训练详情中查看日志，以及训练模型的精度表现，并且你可以操作下方几项功能，所有模型文件可以在Model Space中的列表中找到

- Export Model：可导出训练好的.pt模型到本地文件夹
- Test Model：可上传图像测试当前训练模型的整体检测效果如何，来评估训练成果
- **Quantize （TFLite & CamThink NE301）：可量化为tflite模型及NE301可用的模型文件包，如果需要部署到NE301设备中，此步骤是必要的**  
![AI Tool Stack](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/modoltest.png)

## 模型量化

### 模型量化

若要部署模型到NE301设备中，此动作是必要的，量化需要依赖NE301的开发环境Docker，请保证你已经安装了「[NE301 Dev Docker](./quick-start#ne301编译环境安装)」

在你测试模型效果后可以开始量化工作并准备将量化后的模型进行NE301部署

模型训练完成后你可以点击「Quantize （TFLite & CamThink NE301）」来构建模型量化任务,在任务弹窗中你可以设置一些量化参数，除了input size参数，其他的我们不建议进行任何改动，**input size参数的设置值我们建议设置 256、416、640中的一个，此参数代表量化后的模型支持的图像输入大小，如果你不想调整，使用默认值即可，我们推荐你设置256，如果你要更好的精度表现请设置416，640下推理性能吃紧，谨慎设置**，点击「Start Quantization」就行，模型会启动量化流程，你仅需要等待量化完成，此过程需要漫长等待，请不要关闭任务窗口，大约需要5-10分钟的时间，待模型量化完成后，你可以看到量化后的NE301模型资源包，点击「Download Model Package」下载它（或者关闭后在模型空间菜单中找到此资源去下载），下一步就可以将模型更新至NE301设备本地。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/QT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/startQT.png)![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/ai-tool-stack/ai-tool-stack/QTMdown.png)

## 模型部署

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