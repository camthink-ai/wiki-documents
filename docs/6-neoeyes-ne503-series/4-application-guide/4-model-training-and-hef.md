---
sidebar_position: 3
description: 将静态 YOLOv8 ONNX 转换为可部署到 NE503 的 Hailo HEF，包含量化和编译步骤。
keywords: [NE503, YOLOv8, 模型转换, Hailo, HEF, DFC, ONNX]
tags: [NE503, 模型转换, Hailo, HEF]
---

# HEF Model Compilation

本文只处理 **静态 YOLOv8 ONNX → NE503 HEF** 的转换，不展开数据集准备和模型训练。

## 1. 输入模型与环境

准备已训练并导出的 YOLOv8 检测模型：输入为静态 NCHW `[1, 3, 384, 640]`，输出保留 raw Conv 检测头。`safety_helmet_yolov8n_384_640.onnx` 仅为示例文件名。

在容器内设置模型基名（不含 `.onnx`、`.har` 或 `.hef`）；后续命令均使用该变量：

```bash
MODEL_NAME="<model-name>"
```

训练不在本文范围内；已有 ONNX 可直接执行第 3 节。

推荐使用 Ubuntu x86_64 + NVIDIA GPU 运行 FineTune。下载并解压 [Hailo AI Software Suite 2026-04 Docker 环境](https://resources.camthink.ai/tools/hailo_ai_sw_suite_2026-04_docker.zip)，加载镜像：

```bash
docker load -i <package-dir>/hailo_ai_sw_suite_2026-04.tar.gz
```

预期输出：`Loaded image: hailo_ai_sw_suite_2026-04:1`。启动容器并挂载转换目录：

```bash
docker run --platform linux/amd64 --rm -it --gpus all \
  -v "$PWD:/work" -w /work \
  --entrypoint /bin/bash hailo_ai_sw_suite_2026-04:1
```

以下命令均在容器内执行。

如需从 `.pt` 导出 ONNX，请在宿主机或单独的 Python 环境安装 [Ultralytics](https://docs.ultralytics.com/quickstart/)；Hailo Docker 不包含 `yolo` 命令。

## 2. ONNX 导出

如从 `best.pt` 开始，请在上述 Ultralytics 环境中导出静态 ONNX：

```bash
yolo export model=<path>/best.pt \
  format=onnx imgsz=384,640 opset=11 simplify=True dynamic=False
```

检查输入为 `[1, 3, 384, 640]`，且 shape 为静态；输出应为 raw Conv 检测头。2 类示例的输出为：

```text
Input:  name=images,  shape=[1, 3, 384, 640], dtype=float32
Output: name=output0, shape=[1, 6, 5040], dtype=float32
```

其中 `6 = 4` 个 bbox 坐标 `+ 2` 个类别分数，`5040` 是三个 stride 的网格总数。

## 3. Hailo HEF 量化编译

以下命令按 2 类模型编写。转换链路为：`ONNX → HAR → optimized HAR → HEF`。类别数变化时，必须同步修改 NMS 配置中的 `classes` 和应用侧类别映射。

### 3.1 准备校准集

准备至少 1024 张、推荐 2048 张代表性图片，生成 NHWC、float32、0–255 的 `.npy` 校准集。`--calib-set-path` 接收的是 `.npy`，不是图片目录；不要使用少于 1024 张的快速校准集，以免 DFC 默认优化等级降级。生成文件后，将 `calib_2048.npy` 放入容器的 `/work`。

```python
import glob
import os
import numpy as np
from PIL import Image

TRAIN_DIR = os.path.expanduser("~/yolo-train/datasets/<dataset>/train/images")
OUT = "calib_2048.npy"
H, W, N = 384, 640, 2048

paths = sorted(glob.glob(os.path.join(TRAIN_DIR, "*.jpg")))[:N]
if len(paths) < N:
    raise RuntimeError(f"need {N} calibration images, found {len(paths)}")
arr = np.zeros((len(paths), H, W, 3), dtype=np.float32)
for i, path in enumerate(paths):
    image = Image.open(path).convert("RGB").resize((W, H))
    arr[i] = np.asarray(image, dtype=np.float32)
np.save(OUT, arr)
print(f"saved {OUT} shape={arr.shape}")
```

### 3.2 Parser：ONNX → HAR

在 DFC 容器的 `/work` 中执行。6 个 `--end-node-names` 必须指向 YOLOv8 检测头的 raw Conv；其他模型需按实际计算图替换：

```bash
echo n | hailo parser onnx "${MODEL_NAME}.onnx" \
  --hw-arch hailo15h \
  --end-node-names /model.22/cv2.0/cv2.0.2/Conv /model.22/cv3.0/cv3.0.2/Conv \
                   /model.22/cv2.1/cv2.1.2/Conv /model.22/cv3.1/cv3.1.2/Conv \
                   /model.22/cv2.2/cv2.2.2/Conv /model.22/cv3.2/cv3.2.2/Conv
```

产物为 `${MODEL_NAME}.har`。NE503 检测后处理要求 HEF 包含 `yolov8_nms_postprocess`；`echo n` 跳过 Parser 的 NMS prompt，NMS 由下一步的 `.alls` 注入，避免重复添加。

### 3.3 Optimize：量化 + FineTune

```bash
hailo optimize "${MODEL_NAME}.har" \
  --model-script model.alls \
  --calib-set-path calib_2048.npy
```

`model.alls`：

```text
normalization1 = normalization([0.0, 0.0, 0.0], [255.0, 255.0, 255.0])
nms_postprocess("nms_config.json", meta_arch=yolov8, engine=cpu)
post_quantization_optimization(finetune, policy=enabled, learning_rate=0.0001, epochs=8, dataset_size=2048)
allocator_param(enable_partial_row_buffers=disabled)
performance_param(optimize_for_power=True)
```

`normalization`、NMS 和 FineTune 的配置需与模型类别和输入尺寸一致。成功日志应包含 `Using dataset with 2048 entries for finetune`、`Epoch 1/8` 至 `Epoch 8/8` 和 `Quantization-Aware Fine-Tuning is done`。

`nms_config.json`：

```json
{
  "nms_scores_th": 0.2,
  "nms_iou_th": 0.6,
  "image_dims": [384, 640],
  "max_proposals_per_class": 100,
  "classes": 2,
  "regression_length": 16,
  "background_removal": false,
  "bbox_decoders": [
    {"name": "bbox_decoder41", "stride": 8, "reg_layer": "conv41", "cls_layer": "conv42"},
    {"name": "bbox_decoder52", "stride": 16, "reg_layer": "conv52", "cls_layer": "conv53"},
    {"name": "bbox_decoder62", "stride": 32, "reg_layer": "conv62", "cls_layer": "conv63"}
  ]
}
```

`classes` 必须等于模型类别数；类别名称不写入 HEF，应用按 `names` 顺序映射类别 ID。使用 JSON 配置并显式填写 `bbox_decoders`，不要依赖自动检测。

### 3.4 Compiler：HAR → HEF

```bash
hailo compiler "${MODEL_NAME}_optimized.har" --hw-arch hailo15h
```

编译产物命名为 `${MODEL_NAME}.hef`。部署后文件名（去掉 `.hef`）就是 `model_id`。

### 3.5 编译产物校验

```bash
hailortcli parse-hef "${MODEL_NAME}.hef" | grep -i "nms"
# 期望包含：yolov8_nms_postprocess HAILO NMS BY CLASS, Classes: 2

md5sum "${MODEL_NAME}.hef"
```

## 4. 部署与验证

1. 打开 NE503 Web Console，进入 **AI Models → Import**。
2. 上传 `${MODEL_NAME}.hef`。
3. `Model ID` 使用文件名去掉 `.hef` 后的值；`Model Type` 选择 `hef`。
4. 导入完成后确认模型状态为 **Loaded**。

![模型导入完成](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/model-training-and-hef/import-model-4.png)

```bash
aipc-cli model list
```

验证结果：列表中存在 `${MODEL_NAME}`，状态为 **Loaded**。

## 5. 输出文件

| 文件 | 用途 |
|:---|:---|
| `<model>.har` | Parser 产物，供 Optimize 使用 |
| `<model>_optimized.har` | 量化和 FineTune 产物，供 Compiler 使用 |
| `<model>.hef` | NE503 部署文件 |
