# Quick Start

## Overview

This chapter mainly helps you to use NG4500 series products quickly.

## Hardware Preparation

- **Hardware Guide**, please reference to [Hardware Component Overview](NG4500-CB01%20Development%20Board/Hardware%20Guide/Components%20Overview)

- **Assembly** 
  
  After receiving the NG4500 edge AI box, users should dismantle the back cover of the device and add the corresponding accessories before use, if it is not a pre-installed version.
  
  1. Unbox it and confirm that there is no defect in the appearance of the device;
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart1.png)
  
  2. Remove the back cover;
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart2.png)
  
  3. Mount the SSD in the M.2 Key M PCIex4 interface of J11 (recommended), or the M.2 Key M PCIex1 interface of J13;
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart3.png)
  
  4. Mount the Wi-Fi & BT module to the M.2 Key E 2230 of J19 and connect it to the external antenna (Optional);
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart4.png)
  
  5. Mount the 4G/5G module to the M.2 Key B 2242 of J15, insert the SIM card into the SIM card slot of J18, and connect it to the external antenna (Optional);
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart5.png)
  
  6. Fix RTC Battery CR1220 to the Holder of BT1 (Optional);
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart6.png)
  
  7. After confirming that the installation is complete, re-lock the back cover;
  
  ![](/img/NG45XX_SOFTWARE/Quickstart/NG4500_QucikStart7.png)
  
  8. Use the HDMI interface to connect to an external monitor;
  
  9. Connect the wired mouse and keypad to any two of the USB Type-A interfaces;
  
  10. Connect the network cable to any one of the LAN ports;
  
  11. Connect the USB Type-C interface to the debugging computer;
  
  12. After confirming that the above operations are correct, connect the power adapter to DC-JACK and start kit development and debugging.       
      
      > [!WARNING]
      > 
      > 1、Please use the original standard adapter;
      > 
      > 2、Orin Nano 4/8G only supports 5V voltage input, please make sure that the “Power Mode Switch” remains OFF. 

## Software Deployment

If the device has not yet flashed firmware, please refer to the following link to complete the firmware flashing steps; if you have completed firmware flashing, you can deploy it directly.

- **Environment Setup**, software development environment, please refer to [Development Environment Setup](NG4500-CB01%20Development%20Board/Software%20Guide/Development%20Environment%20Setup)

- **Firmware Flashing**,, for detailed firmware flashing steps, please refer to [System Firmware Flashing](NG4500-CB01%20Development%20Board/Software%20Guide/System%20Flashing%20and%20Initialization)

## First-time System Boot Configuration

After confirming that the device has completed firmware flashing, power on the NG4500 device and follow the on-screen prompts to complete the first-time system initialization configuration.

### 1. System Initialization Configuration

1. Click `Accept License Agreement`, then click next step;

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Licenses_1.png)

2. Select language, then click next step;

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Language_1.png)

3. Set up the keyboard layout, then click next step;

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Keyboard_1.png)

4. Set up time zone（for example：`Asia/Shanghai`）, then click next step;

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_Local_1.png)

5. Set up “your name” and “password”, then click next step;

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_System_Configuration_1.png)

6. Finally, wait for the system installation and restart.

### 2. System Operation Status & Version Confirmation

Please follow the steps below to install the Jtop tool to monitor the current device resource usage:

After installing and running Jtop, the interface will display the information shown in the screenshot below. Users can use the keyboard to view the current resource usage of the Jetson device in real-time, including CPU, memory, GPU, disk, fan, etc. At the same time, users can also confirm the current version of TensorRT, CUDA installed on the current system.

```shell
# Install Jtop tool
sudo apt update
sudo apt install python3-pip
sudo pip3 install -U jetson-stats

# Reboot
sudo systemctl restart jtop.service

#Run Jtop
sudo jtop
```

After running, as shown in the screenshot below, use the keyboard to check the resource usages of the current Jetson device, including CPU, memory, GPU, disk, fan, etc., and confirm the versions of TensorRT, CUDA, etc. currently installed on the system.

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_JTOP.png)

## Model Deployment

The introduction of how to deploy and run the NanoOWL real-time visual reasoning model on CamThink NeoEdge NG4500 Edge AI Box is shown below. Take NG4511 as an example and use the imx219 camera.

### Hardware Requirements

| Components   | Requirements                     |
| ---- | ---------------------- |
| Device   | Jetson Orin（Nano / NX） |
| Memory   | ≥ 8GB（Larger models demand for high-capacity memory）       |
| Storage  | ≥ 10GB（Depends on the model size）        |
| GPU  | NVIDIA GPU supports CUDA  |

### Software Environment

- **Supported ​​JetPack versions**​​：
  - [JetPack 5 (L4T r35.x)](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack/tags)
  - [JetPack 6 (L4T r36.x)](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-jetpack/tags) （by default）

### Environment Preparation

1. Connect the IMX219 camera to the device (Note: Please ensure that the metal piece of the camera cable is facing upwards).
   
   ![](/img/NG45XX_SOFTWARE/NG45XX_IMX219.png)

2. Please follow the steps below to install the required dependencies to ensure the model runs properly.

```shell
sudo apt update
sudo apt-get install -y docker.io
sudo apt-get install -y nvidia-container-toolkit
sudo apt-get install nvidia-jetpack
```

2. Install jetson-containers

```shell
# Access the source code
git clone https://github.com/dusty-nv/jetson-containers

# Install dependencies
bash jetson-containers/install.sh
```

3. Start deployment and automatically pull/build nanoowl containers. (Note: After the container is downloaded or built, the system will automatically start the container.)

```shell
cd jetson-containers/
jetson-containers run --workdir /opt/nanoowl $(autotag nanoowl)
```

This command will automatically detect your hardware configuration and pull or build the appropriate container image.

### Run the Sample

1. Check the camera
   
   Please make sure that the camera is connected to the device correctly and can be recognized by the system. Users can check the currently connected camera devices using the following command:

```shell
ls /dev/video*
```

2. Run NanoOWL container and finish the following configuration.
   
   - Start Docker container and enter the sample test directory
   
   ```shell
   cd jetson-containers/
   jetson-containers run --workdir /opt/nanoowl $(autotag nanoowl)
   
   # Enter the test case route
   cd /opt/nanoowl/examples/tree_demo
   ```
   
   - Install dependencies
   
   ```shell
   apt update
   apt-get install vim
   pip install aiohttp
   ```
   
   - Modify`/opt/nanoowl/examples/tree_demo`document
   
   ```shell
   # Open the file, after modification, use crtl+0 and press Enter to save, crtl+X to exit.
   $ nano tree_demo.py
   
   # Block the following code
   camera = cv2.VideoCapture(CAMERA_DEVICE)
   
   # And replace with the following description
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

3. Start the device and run the test case
   
   ```shell
    python3 tree_demo.py --camera 0 --resolution 1920x1080 --port 8080 ../../data/owl_image_encoder_patch32.engine
   ```

4. Check the recognition performance
   
   - Enter the IP address and port number of the current NG4511 device in the browser address bar (for example: `http://<ip address>:8080`) to access the NanoOWL web interface.
   - Enter the content you wish to identify in the input box, for example:
     - [a face [a nose, an eye, a mouth]]
     - [a table [a keyboard, a pen, a mouse]]

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_Quickstart_NanoOWL.png)
