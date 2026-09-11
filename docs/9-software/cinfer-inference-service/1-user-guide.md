---
description: 学习如何使用 Cinfer 进行 AI 模型管理、Token 授权及标准 API 请求。本文提供完整的软件操作指南，涵盖 Dashboard 监控、模型发布及访问控制。
keywords: [Cinfer 使用指南, AI 推理服务, 模型管理, Token 授权, OpenAPI, 流程控制, 软件操作, 权限管理, 接口调用]
tags: [Cinfer, 用户指南, 模型管理, 软件操作, 教程]
---

# User Guide

## 软件安装
软件安装说明详见[「Quick Start」](./0-quick-start.md)

## 登录
可以输入所设置的管理员账户名和密码点击「Login」按钮进行登录，登录页顶部右侧可以下拉选择切换语言，登录后默认进入Dashboard。

![cinfer-login](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/login.png)

## Dashboard
Dashboard中可浏览当前服务所处环境的基本信息，资源占用以及模型等相关信息，主要包含信息有以下内容。
 - **Device Info**：提供部署设备或服务器的基本信息，包括系统版本、软件名称、推理所用资源（CPU/GPU等）、版本号等信息以及当前模型数量、分配数量的统计信息
 - **CPU Usage**：监听当前服务占用系统资源的CPU使用率，提供近24小时的资源占用情况
 - **GPU Usage**：监听当前服务占用系统资源的GPU使用率，提供近24小时的资源占用情况
 - **Memory Usage**：监听当前服务占用系统资源的内容使用率，提供近24小时的资源占用情况
 - **Model Operating Status**：统计当前模型管理中有多少发布模型和未发布模型

![cinfer-login](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/dashboard.png)

## 模型管理
Model Management中可以上传、发布、下架各种AI模型，并设置模型的输入输出参数，发布的模型可以对外提供统一的OpenAPI来对外部应用提供标准的AI推理调用。

![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/model-management.png)

### 添加模型
Cinfer支持用户上传自己训练的ONNX模型，并对模型进行管理，在页面中可以点击「Add」按钮填写表单上传模型，表单填写的参数说明如下
 - **Name**：模型名称
 - **Infer Engine Type**：模型类型，当前仅支持ONNX
 - **Model File**：模型源文件，必须上传与模型类型相同的模型
 - **Model Parameter**：模型参数，用于定义模型的输出参数、输出参数，在应用集成时可以进行自定义，需要模型推理层进行适配，Model Parameter填写说明详见[「Dev Guide」](./2-dev-guide.md#model-parameter说明)。
 - **Remark**：备注信息
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/add-model-btn.png)
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/add-model.png)

### 模型管理
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/model-manage.png)
#### 编辑模型
模型在未发布的时候，可以点击「编辑」按钮，重新唤起表单修改模型相关信息。
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/edit-model.png)
#### 删除模型
模型在未发布的时候，可以点击「删除」按钮，提示框中点击「Delete」按钮，删除此模型。
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/del-model.png)
#### 发布模型
模型新增表单填写完成后，点击「Save」模型会生成唯一的Model ID并出现在列表中，你可以见一步通过「编辑」、「发布」、删除来操作模型，点击中间的按钮，可以发布添加的模型，在操作的弹窗提示中，点击「Confirm」可确认发布模型，发布后可在Token管理中授权客户使用此模型，若是Token已经配置所有模型权限，则此发布模型则自动分配权限。
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/model-push.png)
#### 下架模型
模型发布后，可以对模型进行下架处理，**请注意此操作会导致已经在使用模型服务的应用或客户受到影响，无法正常使用模型服务，因此操作要格外小心。**
![model-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/unpush-model.png)

## Token管理
此模块用于定义可访问请求Cinfer服务部署的客户端，通过分配Token的方式来进行可访问客户端控制，Token管理提供了包括Token添加以及Token管理、请求白名单、请求API限制等功能。
![token-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/token-account.png)
### 添加Token
可点击菜单中的「Add」按钮新增Token，可以Token的表单配置项如下：
 - **Name**：Token名称，可以自定义
 - **Model Permissions**：此Token可调用的模型范围，当前支持全部模型以及自定勾选已发布的模型，如果选择的是全部模型，那么后续新发布的模型权限会默认分配给所有选择此选项的Token
 - **Request Frequency Limit**：每分钟接口调用次数限制，用于防攻击，超出此数量的调用会被禁止，适用于所有API请求次数累计
 - **Request Quantity Limit**：每月接口调用次数限制，用于控制推理服务使用量，超出此数量的调用会被禁止，适用于所有API请求次数累计
 - **IP Whitelist**：IP白名单，支持设置多个，支持使用，或者;分隔多个IP地址，仅次设置的IP可通过Token访问服务接口
 - **Remark**：备注信息
设置完成信息后，可以点击「Save」按钮保存Token.
![token-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/add-token.png)
保存完成后，弹出显示Token信息，可以点击「Copy」按钮，复制Token，切记需要安全管理此Token，之后可使用此Token范围对应接口来请求AI服务。
![token-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/add-token-message.png)
### 管理Token
![token-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/token-manage.png)
Token支持删除、编辑、禁用管理操作，对应操作控制逻辑如下。
 - **禁用**：点击列表状态开关，可以启用或禁用Token，被禁用的Token会被拒绝访问，请谨慎操作。
 - **编辑**：点击列表操作栏中的「编辑」按钮，可以重新编辑Token的模型权限范围、请求限制、IP白名单等信息，不会影响当前已对接的客户端正常使用。
 - **删除**：点击列表操作栏中的「删除」按钮，可以删除Token，此操作极度危险，会影响已经使用此Token的客户端，因此不要轻易操作，若明确删除，则在弹窗中确定点击「Delete」按钮进行删除。
![token-management](https://resources.camthink.ai/wiki/img/ai-application/cinfer-ai-Inference-service/user-guide/del-token.png)
