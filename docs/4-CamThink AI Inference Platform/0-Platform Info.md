## 概述

CamThink 人工智能推理平台能提供智能图像分析与处理能力，它通过与物联网（IoT）设备集成，可实现实时图像采集，并基于预先配置的人工智能模型进行自动推理，它支持与Beaver-IoT平台无缝对接，方便用户高效地完成设备绑定、人工智能模型选择及推理结果监控等操作。

## 工作原理

![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-101.png)

## 核心功能介绍

1. **仪表盘**：用于AI推理服务运行的全局监控，帮助用户快速掌握系统状态、资源占用、模型整体情况，包括本机信息、资源占用、以及模型运行状态三个部分。
	* 本机信息：
		* 内容：系统版本（Ubuntu 22.04）、软件名称、硬件配置（CPU/GPU 型号）、平台版本，以及模型 / Token 总数（当前 29 个模型、38 个 Token ）。
		* 作用：管理者掌握平台规模（模型 / Token 数量反映业务覆盖度 ）。
	* 资源占用：
		* 内容：实时 + 历史曲线，展示资源使用率（当前 CPU 1.7%、GPU 0%、内存 38% ）。
		* 作用：发现资源瓶颈（比如推理任务扎堆时，CPU 曲线飙升→需扩容 / 调度 ）；以及硬件配置过剩，或模型未启用 GPU 加速，成本优化。
	* 模型运行状态：
		* 内容：饼图展示已发布 vs 未发布模型数量（当前已发布 12 个 ）。
		* 作用：快速了解模型上线进度（未发布模型多→催研发 / 测试加速 ）；已发布模型数量直接对应 “可用推理能力”，比如产线要新增质检任务，看已发布模型够不够。
	![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-102.png)
	
2. **模型管理**：用于管理、维护、更新AI模型，使得模型能够稳定、高效地为推理任务服务，包括对模型的增加、删除、修改、发布等功能。
	* **添加模型**：
		* 点击模型管理页面左上角的'+添加'按钮，进入添加模型页面。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-103.png)
		* 在添加模型页面，编辑模型名称（自定义）、在推理引擎类型下拉框选择合适的推理引擎，上传模型文件，修改模型参数，填写备注（自定义），点击右下角'保存'。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-104.png)
	* **删除模型**：
		* 点击模型操作列垃圾桶图标，即可删除模型。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-105.png)
	* **修改模型**（注：仅针对未发布的模型，已发布模型暂无法修改）：
		* 点击模型操作列铅笔图标，进入编辑模型页面。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-106.png)
		* 在编辑模型页面根据修改内容，进行编辑，编辑结束后，点击右下角'保存'。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-107.png)
	* **发布模型**：
		* 点击模型操作列飞机图标，发布模型，模型发布后无法修改。
			![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-108.png)
3. **Token管理**：进行API 访问控制与资源计量，承担身份确权、权限绑定、计量依据三个作用，包括对Token的添加、修改、删除等功能。
	* **身份确权**： 通过 Token 唯一标识调用方（用户 / 系统 / 设备），替代传统账号密码，降低泄露风险。
	* **权限绑定**：Token 中嵌入Claim（声明），定义可访问的 API 范围（如仅允许调用 “测试水表模型” 接口，禁止访问 “目标检测模型” 接口 ）。
	* **计量依据**：关联配额策略（Quota Policy），记录 / 扣减 API 调用次数，实现 “用量 - 成本” 映射。
	* **具体操作**：
		* **添加 Token**：
			* 点击设备页面左上角'添加'按钮，进入添加Token页面。
				![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-109.png)
			* 编辑Token内容，包括：名称（自定义），模型权限（根据需求在下拉框里面选择需要的模型权限），请求频率限制（自定义，默认60）请求数量限制（自定义，默认1000），IP白名单（根据需求填写），备注，编辑结束后，点击保存。
				![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-110.png)
		* **删除Token**：
			* 点击模型操作列垃圾桶图标，删除Token。
				![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-111.png)
		* **修改Token**：
			* 点击模型操作列铅笔图标，进入编辑Token页面。
				![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-112.png)
			* 编辑Token内容，包括：名称（自定义），模型权限（根据需求在下拉框里面选择需要的模型权限），请求频率限制（自定义，默认60）请求数量限制（自定义，默认1000），IP白名单（根据需求填写），备注，编辑结束后，点击保存。
				![image](../../static/img/AI-Inference-data/AI-Inference-overview/beaver-iot-113.png)
## 应用场景

* 可广泛应用于智能安防、智能交通、智慧农业、工业制造等领域。