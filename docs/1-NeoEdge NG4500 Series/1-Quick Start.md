# Quick Start

## 概述

本章主要帮助您快速使用NG4500系列产品。

## 硬件准备

- **硬件概述**，请参阅[硬件组件说明](http://192.168.13.9:3000/docs/Edge%20AI%20Box/NeoEdge%20NG45XX%20Series/Hardware%20Guide/Components%20Overview)

- **设备组装**
  
  拿到整机后，若非预装版本，须拆开底板后盖进行配件相关装配后才可使用。
  
  1. 拿到样机后，拆包装后确认样机外观无缺损
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart1.png)
  
  2. 拆开底部盖板
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart2.png)
  
  3. 将SSD装配 J11 的M.2 Key M PCIex4 接口（建议），或 J13 的M.2 Key M PCIex1接口
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart3.png)
  
  4. 将WiFi&BT模组固定到J19的 M.2 Key E 2230，并连接到外接天线（Optional）
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart4.png)
  
  5. 将4G/5G模组固定到J15的M.2 Key B 2242, or M.2 Key B 2252 ,并将Sim卡插到J18的Sim卡槽 ，并连接到外置天线（Optional）
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart5.png)
  
  6. 将 RTC Battery CR1220固定到 BT1的 Holder上（Optional）
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart6.png)
  
  7. 确认安装完毕后，重新锁好底部盖板
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart7.png)
  
  8. HDMI接口连接到外部显示器
  
  9. 将有线鼠标和键标连接到USB Type-A接口中任意两个
  
  10. 将网线连接到 LAN 口中任意一个
  
  11. 将USB Type-C 接口连接到调试电脑
  
  12. 确认以上操作无误后，将电源适配器连接到 DC-JACK，即可开始进行套件开发调试    
      
      > **[!WARNING]**
      > 
      > 1、请使用原装标配的适配器
      > 
      > 2、Orin Nano 4/8G 模组内部只支持5V输入， 请保证“Power Mode Switch” 在OFF状态 

## 软件部署

若设备尚未完成固件烧录，请参照下方链接进行固件烧录操作；如已完成固件烧录，可直接进行后续部署。

- **环境搭建**，软件开发环境，请参阅[开发环境搭建](http://192.168.13.9:3000/docs/Edge%20AI%20Box/NeoEdge%20NG45XX%20Series/Software%20Guide/Development%20Environment%20Setup)

- **固件烧录**，详细固件烧录步骤，请参阅[系统固件烧录](http://192.168.13.9:3000/docs/Edge%20AI%20Box/NeoEdge%20NG45XX%20Series/Software%20Guide/System%20Flashing%20and%20Initialization)

## 首次系统启动引导配置

在确认设备已完成固件烧录后，为NG4500设备通电，并根据屏幕提示，依次完成首次系统初始化配置。

### 1. 系统初始化配置

1. 勾选 `接受许可协议`，点击下一步

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Licenses.png)

2. 设置语言，点击下一步

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Language.png)

3. 设置键盘布局，点击下一步

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Keyboard.png)

4. 设置时区（例如：`Asia/Shanghai`），点击下一步

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Local.png)

5. 配置“您的姓名”和“密码”，点击下一步

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration.jpg)

6. 最后，等待系统安装，自动重启

### 2. 系统运行状态&版本确认

请按照以下步骤安装 Jtop 工具，以监控当前设备的资源使用情况：

安装并运行 Jtop 后，界面将显示如下图所示的信息。您可以通过键盘操作，实时查看当前 Jetson 设备的资源使用状况，包括 CPU、内存、GPU、磁盘、风扇等。同时，还可以确认当前系统所安装的 TensorRT、CUDA 等版本信息。

```shell
# 安装 Jtop 工具
sudo apt update
sudo apt install python3-pip
sudo pip3 install -U jetson-stats

# 重启服务
sudo systemctl restart jtop.service

#运行 Jtop
sudo jtop
```

运行后界面如下图所示。您可以通过键盘操作，查看当前 Jetson 设备的各项资源使用情况，包括 CPU、内存、GPU、磁盘、风扇等，同时还可确认系统已安装的 TensorRT、CUDA 等版本信息。

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_JTOP.png)

## 模型部署

本小节将介绍如何在 AIBOX 上部署并运行 NanoOWL 实时视觉推理模型。以 NG4511 设备为例，使用 imx219 摄像头进行演示。

### 硬件需求

| 组件   | 要求                     |
| ---- | ---------------------- |
| 设备   | Jetson Orin（Nano / NX） |
| 内存   | ≥ 8GB（更大模型需更高内存）       |
| 存储空间 | ≥ 10GB（取决于模型大小）        |
| GPU  | 支持 CUDA 的 NVIDIA GPU   |

### 软件环境

- **支持​​JetPack版本**​​：
  - [JetPack 5 (L4T r35.x)](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack/tags)
  - [JetPack 6 (L4T r36.x)](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack/tags) （系统默认版本）

### 环境准备

1. 将 IMX219 摄像头连接至设备（注意：请确保摄像头排线的金属片朝上）。
   
   ![](/img/NG45XX_SOFTWARE/NG45XX_IMX219.png)

2. 请按照以下步骤安装所需依赖项，以确保模型能够正常运行。

```shell
sudo apt update
sudo apt-get install -y docker.io
sudo apt-get install -y nvidia-container-toolkit
sudo apt-get install nvidia-jetpack
```

2. 安装jetson-containers

```shell
# 获取源码
git clone https://github.com/dusty-nv/jetson-containers

# 安装依赖
bash jetson-containers/install.sh
```

3. 开始部署，自动拉取/构建nanoowl容器。（注：容器下载或构建完成后，系统会自动启动该容器。）

```shell
cd jetson-containers/
jetson-containers run --workdir /opt/nanoowl $(autotag nanoowl)
```

该命令将自动检测您的硬件配置，并拉取或构建适配的容器镜像。

### 运行示例

1. 检查摄像头设备
   
   请确认摄像头已正确连接至设备，并可被系统识别。您可以使用以下命令检查当前已连接的摄像头设备：

```shell
ls /dev/video*
```

2. 运行 NanoOWL 容器并完成以下配置
   
   - 启动 Docker 容器，并进入测试用例目录：
   
   ```shell
   cd jetson-containers/
   jetson-containers run --workdir /opt/nanoowl $(autotag nanoowl)
   
   # 进入测试案例路径
   cd /opt/nanoowl/examples/tree_demo
   ```
   
   - 安装依赖
   
   ```shell
   apt update
   apt-get install vim
   pip install aiohttp
   ```
   
   - 修改`/opt/nanoowl/examples/tree_demo`文件
   
   ```shell
   # 屏蔽下面这句代码
   camera = cv2.VideoCapture(CAMERA_DEVICE)
   
   # 修改替换为下述内容
   gst_pipeline = (
       "nvarguscamerasrc ! "
       "video/x-raw(memory:NVMM), width=(int)1280, height=(int)720, format=(string)NV12, framerate=(fraction)30/1 ! "
       "nvvidconv ! "
       "video/x-raw, format=(string)BGRx ! "
       "videoconvert ! "
       "video/x-raw, format=(string)BGR ! "
       "appsink"
   )
   camera = cv2.VideoCapture(gst_pipeline, cv2.CAP_GSTREAMER)
   ```

3. 启动终端，运行测试案例
   
   ```shell
   python3 tree_demo.py --camera 0 --resolution 1920x1080 ../../data/owl_image_encoder_patch32.engine
   ```

4. 查看识别结果
   
   - 在浏览器地址栏输入当前 NG4511 设备的 IP 地址和端口号（例如：`http://<ip address>:7860`），访问 NanoOWL 的 Web 界面。
   - 在输入框中输入你希望识别的内容，例如：
     - [a face [a nose, an eye, a mouth]]
     - [a table [a keyboard, a pen, a mouse]]

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_Quickstart_NanoOWL.png)
