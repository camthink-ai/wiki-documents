---
description: Cinfer 开发指南，详细解析 ONNX 模型参数配置（Model Parameter）。涵盖输入输出定义、数据类型规范及 YOLO 实例分割、目标识别等模型配置示例。
keywords: [Cinfer 开发指南, 模型参数, ONNX 配置, YAML 规范, 输入输出定义, YOLOv8, 实例分割, 目标识别]
tags: [Cinfer, 开发指南, 模型配置, ONNX, API参考]
---

# Dev Guide
## Model Parameter说明
Model Parameter在Cinfer中是模型管理的重要定义，对于ONNX模型的对外提供的出入参定义有着重要作用，此文件是定义模型如何与外界交互的核心配置文件。它详细描述了模型的配置、所需的输入数据格式以及推理后输出数据的结构。该文件采用 YAML 格式，遵循类似 JSON Schema 的规范，主要包含三个顶级字段：config、inputs 和 outputs，下方是相关信息说明

### config (对象, 可选)
config字段用于定义模型的通用配置和行为。
| 键 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `processing_strategy` | 字符串 | 定义模型的预处理和后处理策略。`generic` 表示使用通用的处理流程。 | `processing_strategy: generic` |
| `labels` | 字典 | 标签映射 | ```labels:<br>  0: "person"<br>  1: 'bicycle'<br>  2: 'car'``` |
| `type` | 字符串 | 模型类型：目标识别、姿态识别、实例分割、语义分割 | `type: "目标识别"` |
| `shapes` | 列表 | 模型输入维度 | `shapes: [1, 3, 640, 640]` |
| `post_format` | 列表 | 内置后处理输出算法 | `concatLabels` |
| `...` | `...` | 未来可根据需求扩展其他配置项。 | |

### inputs (数组, 必需)
inputs 字段是一个数组，定义了模型推理所需的一个或多个输入参数。数组中的每个元素都是一个描述单个输入参数的对象。

### outputs (数组, 必需)
outputs 字段是一个数组，定义了模型推理完成后的输出数据结构。数组中的每个元素都是一个描述单个输出参数的对象。

### inputs和outputs定义说明
inputs 和 outputs 数组中的每个元素都是一个参数定义对象，用于详细描述一个输入或输出参数的属性。
#### 通用属性
| 属性 | 类型 | 必需? | 描述 |
|------|------|-------|------|
| name | 字符串 | 是 | 参数的唯一名称，用于在代码中引用。 |
| description | 字符串 | 是 | 对参数的详细描述。 |
| type | 字符串 | 是 | 参数的数据类型。支持 string, float, integer, boolean, array, object。 |
| required | 布尔值 | 否 | 指示该参数是否为必需。如果未提供，默认为 false (可选)。 |

#### `string` 类型

| 属性 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `format` | 字符串 | 字符串的特定格式。可以使用 `\|` 分隔多个可接受的格式。常见值包括 `uri` (URL)、`base64` (Base64编码的字符串)等。 | `uri \| base64` |
| `minLength` | 整数 | 字符串的最小长度。 | `minLength: 1` |
| `maxLength` | 整数 | 字符串的最大长度。 | `maxLength: 1024` |
| `pattern` | 字符串 | 字符串必须匹配的正则表达式。 | `pattern: "^[a-zA-Z0-9_-]+$"` |

#### `float` 和 `integer` 类型

| 属性 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `default` | float 或 integer | 如果 `required` 为 `false` 且未提供该参数时的默认值。 | `default: 0.25` |
| `minimum` | float 或 integer | 允许的最小值（包含）。 | `minimum: 0.0` |
| `maximum` | float 或 integer | 允许的最大值（包含）。 | `maximum: 1.0` |

#### `array` 类型

| 属性 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `items` | 对象 | **必需**。一个参数定义对象，用于描述数组中每个元素的结构和类型。 | 见下方嵌套示例 |
| `minItems` | 整数 | 数组的最少元素数量。 | `minItems: 1` |
| `maxItems` | 整数 | 数组的最多元素数量。 | `maxItems: 100` |

#### `object` 类型

| 属性 | 类型 | 描述 | 示例 |
| :--- | :--- | :--- | :--- |
| `properties` | 对象 | **必需**。一个对象，其键是属性名称，值是描述该属性的参数定义对象。 | 见下方嵌套示例 |

### 定义示例
#### yolov8-seg（实例分割）
```yaml
config:
  processing_strategy: generic
  labels: 
     0: 'person'
     1: 'bicycle'
     2: 'car'
     3: 'motorcycle'
     4: 'airplane'
     5: 'bus'
     6: 'train'
     7: 'truck'
     8: 'boat'
     9: 'traffic light'
     10: 'fire hydrant'
     11: 'stop sign'
     12: 'parking meter'
     13: 'bench'
     14: 'bird'
     15: 'cat'
     16: 'dog'
     17: 'horse'
     18: 'sheep'
     19: 'cow'
     20: 'elephant'
     21: 'bear'
     22: 'zebra'
     23: 'giraffe'
     24: 'backpack'
     25: 'umbrella'
     26: 'handbag'
     27: 'tie'
     28: 'suitcase'
     29: 'frisbee'
     30: 'skis'
     31: 'snowboard'
     32: 'sports ball'
     33: 'kite'
     34: 'baseball bat'
     35: 'baseball glove'
     36: 'skateboard'
     37: 'surfboard'
     38: 'tennis racket'
     39: 'bottle'
     40: 'wine glass'
     41: 'cup'
     42: 'fork'
     43: 'knife'
     44: 'spoon'
     45: 'bowl'
     46: 'banana'
     47: 'apple'
     48: 'sandwich'
     49: 'orange'
     50: 'broccoli'
     51: 'carrot'
     52: 'hot dog'
     53: 'pizza'
     54: 'donut'
     55: 'cake'
     56: 'chair'
     57: 'couch'
     58: 'potted plant'
     59: 'bed'
     60: 'dining table'
     61: 'toilet'
     62: 'tv'
     63: 'laptop'
     64: 'mouse'
     65: 'remote'
     66: 'keyboard'
     67: 'cell phone'
     68: 'microwave'
     69: 'oven'
     70: 'toaster'
     71: 'sink'
     72: 'refrigerator'
     73: 'book'
     74: 'clock'
     75: 'vase'
     76: 'scissors'
     77: 'teddy bear'
     78: 'hair drier'
     79: 'toothbrush'
  type: "实例分割"
  shapes: [1, 3, 640, 640]

inputs:
  - name: "image"
    description: "图像可以是一个有效的 URL,也可以是 data URI 形式的 Base64 编码"
    type: "string"
    format: "uri | base64"
    required: true

  - name: "conf_threshold"
    description: "可选.置信度阈值(仅保留置信度 ≥ 该值的检测结果)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "可选.NMS 非极大值抑制阈值(IoU > 该值的框将被抑制)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "单张或多张图片的检测结果列表，每个元素对应一张图片及其检测对象"
    type: "array"
    required: true
    items:
      description: "描述单张图片及其检测结果"
      type: "object"
      required: true
      properties:
        file_name:
          description: "识别文件索引或名称"
          type: "string"
          required: true
        detections:
          description: "该图片中检测到的所有对象"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "检测框坐标 [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "置信度：准确率(0.0 到 1.0)"
                type: "float"
                required: true
              cls:
                description: "识别出的类别标签 (例如: '0'、'person'、'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "可选：分割轮廓坐标列表，每个子数组为一个顶点 [x, y]，表示轮廓上的点"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "像素坐标，非负整数"
                    minimum: 0
              points:
                type: "array"
                description: "可选：姿态模型关键点列表，每个关键点为 [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x 和 y 为像素坐标（浮点数），id 为关键点索引（整数），conf 为置信度（浮点数）"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "骨架连线数据列表，每个元素为一对关键点索引 [idx1, idx2], 会与points一起返回"
                items:
                  type: "array"
                  description: "单条骨架连线由两个关键点索引组成"
                  items:
                    type: "integer"
                    description: "关键点索引"
                  minItems: 2
                  maxItems: 2
```
#### 指针表识别示例（实例分割）
```yaml
config:
  processing_strategy: pointer
  labels: 
      0: "0"
      1: "1"
  type: "实例分割"
  shapes: [1, 3, 640, 640]

inputs:
  - name: "image"
    description: "图像可以是一个有效的 URL,也可以是 data URI 形式的 Base64 编码"
    type: "string"
    format: "uri | base64"
    required: true
    
  - name: "conf_threshold"
    description: "可选.置信度阈值(仅保留置信度 ≥ 该值的检测结果)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "可选.NMS 非极大值抑制阈值(IoU > 该值的框将被抑制)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0
    
  - name: "scale_min"
    description: "量程起点信息)"
    type: "float"
    required: true
    default: 0.0
    minLength: 4
    maxLength: 4

  - name: "scale_max"
    description: "量程终点信息)"
    type: "float"
    required: true
    default: 60.0
    minLength: 4
    maxLength: 4

outputs:
  - name: "data"
    description: "单张或多张图片的检测结果列表，每个元素对应一张图片及其检测对象"
    type: "array"
    required: true
    items:
      description: "描述单张图片及其检测结果"
      type: "object"
      required: true
      properties:
        file_name:
          description: "识别文件索引或名称"
          type: "string"
          required: true
        detections:
          description: "该图片中检测到的所有对象"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "检测框坐标 [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "置信度：准确率(0.0 到 1.0)"
                type: "float"
                required: true
              cls:
                description: "识别出的类别标签 (例如: '0'、'person'、'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "可选：分割轮廓坐标列表，每个子数组为一个顶点 [x, y]，表示轮廓上的点"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "像素坐标，非负整数"
                    minimum: 0
              points:
                type: "array"
                description: "可选：姿态模型关键点列表，每个关键点为 [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x 和 y 为像素坐标（浮点数），id 为关键点索引（整数），conf 为置信度（浮点数）"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "骨架连线数据列表，每个元素为一对关键点索引 [idx1, idx2], 会与points一起返回"
                items:
                  type: "array"
                  description: "单条骨架连线由两个关键点索引组成"
                  items:
                    type: "integer"
                    description: "关键点索引"
                  minItems: 2
                  maxItems: 2
```
#### 水表读数识别示例（目标识别）
```yaml
config:
  processing_strategy: generic
  labels: 
    0: "0"
    1: "1"
    2: "2"
    3: "3"
    4: "4"
    5: "5"
    6: "6"
    7: "7"
    8: "8"
    9: "9"
  type: "目标识别"
  shapes: [1, 3, 640, 640]
  post_format:
    - "concatLabels"

inputs:
  - name: "image"
    description: "图像可以是一个有效的 URL,也可以是 data URI 形式的 Base64 编码"
    type: "string"
    format: "uri | base64"
    required: true
    
  - name: "conf_threshold"
    description: "可选.置信度阈值(仅保留置信度 ≥ 该值的检测结果)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "可选.NMS 非极大值抑制阈值(IoU > 该值的框将被抑制)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "单张或多张图片的检测结果列表，每个元素对应一张图片及其检测对象"
    type: "array"
    required: true
    items:
      description: "描述单张图片及其检测结果"
      type: "object"
      required: true
      properties:
        file_name:
          description: "识别文件索引或名称"
          type: "string"
          required: true
        detections:
          description: "该图片中检测到的所有对象"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "检测框坐标 [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "置信度：准确率(0.0 到 1.0)"
                type: "float"
                required: true
              cls:
                description: "识别出的类别标签 (例如: '0'、'person'、'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "可选：分割轮廓坐标列表，每个子数组为一个顶点 [x, y]，表示轮廓上的点"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "像素坐标，非负整数"
                    minimum: 0
              points:
                type: "array"
                description: "可选：姿态模型关键点列表，每个关键点为 [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x 和 y 为像素坐标（浮点数），id 为关键点索引（整数），conf 为置信度（浮点数）"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "骨架连线数据列表，每个元素为一对关键点索引 [idx1, idx2], 会与points一起返回"
                items:
                  type: "array"
                  description: "单条骨架连线由两个关键点索引组成"
                  items:
                    type: "integer"
                    description: "关键点索引"
                  minItems: 2
                  maxItems: 2
```
#### 内置OCR模型定义示例
```yaml
config:
  
inputs:
  - name: "image"
    description: "图像可以是一个有效的 URL,也可以是 data URI 形式的 Base64 编码"
    type: "string"
    format: "uri | base64"
    required: true

  - name: "conf_threshold"
    description: "可选.置信度阈值(仅保留置信度 ≥ 该值的检测结果)"
    type: "float"
    required: false
    default: 0.5
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "单张或多张图片的检测结果列表，每个元素对应一张图片及其检测对象"
    type: "array"
    required: true
    items:
      description: "描述单张图片及其检测结果"
      type: "object"
      required: true
      properties:
        file_name:
          description: "识别文件索引或名称"
          type: "string"
          required: true
        detections:
          description: "该图片中检测到的所有对象"
          type: "array"
          items:
            type: "object"
            properties:
              box:
                type: "array"
                description: "检测框坐标 [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "置信度：准确率(0.0 到 1.0)"
                type: "float"
                required: true
              cls:
                description: "识别出的文本如：（三十六计全解）"
                type: "string"
                required: true
```