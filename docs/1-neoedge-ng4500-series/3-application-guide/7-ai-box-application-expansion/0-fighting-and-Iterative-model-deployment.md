---
description: 本指南介绍如何利用 NeoEdge AI 边缘计算盒（NG4500 系列）部署“打架与跌倒” AI 模型。涵盖系统整体架构、固件安装及 VMS 视频管理系统的配置流程。
keywords: [AI 边缘计算盒, NG4500, 打架检测, 跌倒检测, VMS 配置, IPC 部署, 行为识别, 边缘 AI 应用, 智能监控, 安全防护]
tags: [AI应用, 行为分析, 边缘计算, 安全监控, NG4500]
---

# Fighting And Iterative Model Deployment

## 基本介绍

本篇教程以“AI BOX + VMS + IPC”为框架，以部署“打架与跌倒”AI模型为题介绍如何在实际应用AI BOX。
通过前端设备IPC进行视频采集，将视频流传输到AI BOX进行处理，最后将处理结果传输到VMS进行显示。

> AI BOX即NG4500系列设备，VMS即视频管理系统，IPC即前端摄像头类的采集设备。  

以下是IPC与AI Box的实拍图：

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc.png" alt="ipc" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/box.png" alt="box" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 整体架构

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/Interactive-diagram.png" alt="交互图" style={{ maxWidth: '720px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

上图为整体的架构展示，IPC作为前端采集设备，通过交换机接入网口实现局域网通信，IPC前端采集到的实时视频流接入到VMS中，VMS本身不具备AI推理能力，VMS的Server端将数据转给AI BOX 进行处理，AI BOX作为边缘端设备，保持低功耗的前提还具备高算力性能，同时具备适配IOT等多类场景下的多种硬件接口及其扩展性，这是传统服务器所不具备的。AI BOX处理并分析好数据后会将分析结果传回给VMS Server，VMS Server最终将数据显示到我们VMS Client上进行显示。

## AI BOX 端算法部署

> 请确保已经完成NG4500Series 设备初始化，如果不了解设备初始化，可查阅[NG4500Series-快速开始](../../1-neoedge-ng4500-series/1-quick-start.md)

### 步骤一：打开 WinSCP

> 如果没有WinSCP，其它的文件传输工具也可以。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/winscp.png" alt="winscp" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤二：登录校验

登录成功后，查看AIBOX的目录

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/winscp2.png" alt="winscp" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤三：固件包导入

将固件从你的电脑复制到 AI BOX 的任意文件夹。这里我们把固件放到 aibox2 文件夹中（登录 putty 时需要在该文件夹下找到 AI BOX 固件）。

AIBOX 算法固件包下载地址：[msaibox_arm64_1.0.0.1-r1-c1.deb](https://resource-cam-think.oss-cn-hongkong.aliyuncs.com/wiki/ai-app/fight-fall-model-deploy/msaibox_arm64_1.0.0.1-r1-c1.deb?x-oss-credential=LTAI5tNEE8YCDoztSbpntwqZ%2F20251106%2Fcn-hongkong%2Foss%2Faliyun_v4_request&x-oss-date=20251106T094938Z&x-oss-expires=32400&x-oss-signature-version=OSS4-HMAC-SHA256&x-oss-signature=66daaa60590da506cfbfba76866a276b8916cfd82000a0a0545f1a41caacbdc0)。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/deb.png" alt="deb" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤四：SSH工具

> 如无Putty，可用其它工具替代，如Xshell、OpenSSH等。

打开Putty，输入IP地址

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/putty.png" alt="putty" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>  

### 步骤五：登入Box

输入AI BOX 用户名和密码,是初始化BOX设备时设置的.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/login.png" alt="login" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/login2.png" alt="login" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤六：进入文件目录

切换到 root 用户并进入 AI BOX 的文件目录。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/directory.png" alt="directory" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>  

### 步骤七：安装固件

输入 ls 查看 AI BOX 的文件目录，打开存放固件的文件夹，输入 ls 查找固件文件输入：dpkg -i deb固件文件名（命令格式：dpkg -i + 固件文件名）,最后即可安装部署成功

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/dpkg.png" alt="dpkg" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/systemctl.png" alt="systemctl" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## VMS端应用配置与BOX连接

### 步骤一：安装VMS(Window系统),并登录

采用C/S架构软件设计,安装细节参考VMS用户手册：Chapter 2. Installation

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/vms-install.png" alt="vms-install" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>  

> Milesight VMS 下载链接

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/download-vms.png" alt="download-vms" style={{ flex: '1 1 220px', maxWidth: '320px', width: 'auto', maxHeight: '320px', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/download-vms2.png" alt="download-vms" style={{ flex: '1 1 220px', maxWidth: '320px', width: 'auto', maxHeight: '320px', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)', objectFit: 'contain' }} />
</div>  

### 步骤二：在VMS中添加智能盒子

在 `综合配置-系统&服务设置` 添加MS智能盒，盒子地址即前置配置的IP地址，目前这个版本下的盒子用户名和密码是通过VMS这边固定的：admin password
配置好后点击应用，校验是否配置成功

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/vms-add-box.png" alt="vms-install" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>  

### 步骤三：摄像机配置-后端参数配置

* 在摄影机配置中需确定哪台、哪些台设备需要进行AI分析。本步骤需要进行区域划线，只会检测在区域内行为。
* 本页面是对算法/模型的参数配置，其中的灵敏度越高越容易被触发识别到、同时误判率也会增高；摔倒持续时间长短来判定报警的延时时间。
* 依据场景需要对参数配置好后，可通过应用进行保存并生效，同时可批量并执行应用到其他摄像机。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/parameter-configuration.png" alt="vms-install" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤四：事件&报警

本步骤用于配置触发算法识别了会执行什么动作、动作执行具体是怎么样的以及执行后的报警显示配置，是基于UI显示上的触发动作。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/action-setting.png" alt="action-setting" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/action-setting.png" alt="action-setting" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div> 

### 步骤五：LIVE 显示实时验证

通过LIVE页面即可实时验证效果，如有触发会执行上一步骤中设定的规则动作。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/live.png" alt="live" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## IPC前端部署

* 配置IPC的IP、用户名、密码
* 访问配置的IP，通过H5进行访问，查看效果
* 通过VMS添加本地下IPC设备
* IPC设备不局限于我们内部的产品，其它IPC也会支持

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc-front-end-deployment.png" alt="ipc-front-end-deployment" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/ai-application/ai-box-appliction-expansion/fighting-and-Iterative-model-deployment/ipc-front-end-deployment2.png" alt="ipc-front-end-deployment" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 效果展示

**视频1（斗殴检测）：** 展示园区场景中识别斗殴行为、上报告警并联动设备的全流程。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <iframe
    src="https://www.youtube.com/embed/WSauLvZZXfg"
    title="AI Box Demo 1"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    style={{ maxWidth: '640px', width: '100%', height: '360px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}
  />
</div>

**视频2（跌倒检测）：** 展示跌倒事件识别及多场景联动预警的实时效果。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <iframe
    src="https://www.youtube.com/embed/zYwYpczTPU8"
    title="AI Box Demo 2"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    style={{ maxWidth: '640px', width: '100%', height: '360px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}
  />
</div>

## FAQ

1. VMS添加BOX的IP地址后的用户名和密码是固定的：admin与password，并不是BOX的ssh密码。
2. VMS版本和算法固件包有强绑定的关联，r1版本盒子匹配r1版本的VMS。
3. 误告警问题：部署位置与角度都会影响准确度。
4. VMS许可证，初次安装有试用码期限，到期会过期，后续如需使用可联系我们。
5. 如需使用VMS，可[联系我们](https://www.camthink.ai/company/contact-us/)获取。
