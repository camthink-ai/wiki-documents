---
description: Developer guide for Cinfer model parameter specifications. Learn how to define YAML schemas for model inputs, outputs, and processing strategies for ONNX models.
keywords: [Cinfer Dev Guide, Model Parameter Specification, ONNX Schema, YAML Config, Input Output Definition, AI Inference API, Postprocessing Strategy]
tags: [Cinfer, Development Guide, AI Inference, YAML, API Specification]
---

# Dev Guide
## Model Parameter Specification
Model Parameter is a critical definition in Cinfer’s model management. It governs the external input/output schema for ONNX models and serves as the core configuration file defining how a model interacts with the outside world. It describes model configuration, required input data formats, and the structure of inference outputs. The file uses YAML and follows a JSON-Schema-like convention with three top-level fields: config, inputs, and outputs. Details are below.

### config (object, optional)
The config field defines general model configuration and behavior.
| Key | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `processing_strategy` | string | Defines preprocessing and postprocessing strategy. `generic` uses a common pipeline. | `processing_strategy: generic` |
| `labels` | map | Label mapping | ```labels:<br>  0: "person"<br>  1: 'bicycle'<br>  2: 'car'``` |
| `type` | string | Model type: object detection, pose estimation, instance segmentation, semantic segmentation | `type: "object detection"` |
| `shapes` | array | Model input shape | `shapes: [1, 3, 640, 640]` |
| `post_format` | array | Built-in postprocessing output helpers | `concatLabels` |
| `...` | `...` | Future extensible configs as needed. | |

### inputs (array, required)
An array defining one or more input parameters required for inference. Each element is an object describing a single input parameter.

### outputs (array, required)
An array defining the output data structure after inference. Each element is an object describing a single output parameter.

### inputs and outputs element definition
Each element of inputs and outputs is a parameter definition object describing a single input or output parameter.
#### Common properties
| Property | Type | Required? | Description |
|------|------|-------|------|
| name | string | yes | Unique parameter name used in code. |
| description | string | yes | Detailed description of the parameter. |
| type | string | yes | Data type. Supports string, float, integer, boolean, array, object. |
| required | boolean | no | Whether this parameter is required. Defaults to false if omitted. |

#### `string` type

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `format` | string | Specific string formats. Use `\|` to separate multiple acceptable formats. Common values: `uri` (URL), `base64` (Base64-encoded string). | `uri \| base64` |
| `minLength` | integer | Minimum string length. | `minLength: 1` |
| `maxLength` | integer | Maximum string length. | `maxLength: 1024` |
| `pattern` | string | Regex pattern the string must match. | `pattern: "^[a-zA-Z0-9_-]+$"` |

#### `float` and `integer` types

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `default` | float or integer | Default value if `required` is false and the parameter is missing. | `default: 0.25` |
| `minimum` | float or integer | Minimum allowed value (inclusive). | `minimum: 0.0` |
| `maximum` | float or integer | Maximum allowed value (inclusive). | `maximum: 1.0` |

#### `array` type

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `items` | object | **Required**. A parameter definition object describing each array element. | See nested example below |
| `minItems` | integer | Minimum number of elements. | `minItems: 1` |
| `maxItems` | integer | Maximum number of elements. | `maxItems: 100` |

#### `object` type

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `properties` | object | **Required**. Keys are property names and values are parameter definition objects for those properties. | See nested example below |

### Definition examples
#### yolov8-seg (instance segmentation)
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
  type: "instance segmentation"
  shapes: [1, 3, 640, 640]

inputs:
  - name: "image"
    description: "The image can be a valid URL or a Base64 string in data URI format"
    type: "string"
    format: "uri | base64"
    required: true

  - name: "conf_threshold"
    description: "Optional. Confidence threshold (keep detections with confidence ≥ this)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "Optional. NMS threshold (suppress boxes with IoU > this value)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "Detection results for one or multiple images; each element corresponds to one image and its objects"
    type: "array"
    required: true
    items:
      description: "Describes a single image and its detection results"
      type: "object"
      required: true
      properties:
        file_name:
          description: "Recognized file index or name"
          type: "string"
          required: true
        detections:
          description: "All detected objects in the image"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "Bounding box [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "Confidence score (0.0 to 1.0)"
                type: "float"
                required: true
              cls:
                description: "Predicted class label (e.g., '0', 'person', 'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "Optional: segmentation polygon points; each sub-array is a vertex [x, y]"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "Pixel coordinate, non-negative"
                    minimum: 0
              points:
                type: "array"
                description: "Optional: pose keypoints; each is [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x/y are pixel coordinates (float), id is keypoint index (int), conf is confidence (float)"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "Skeleton edges; each item is a pair of keypoint indices [idx1, idx2]; returned with points"
                items:
                  type: "array"
                  description: "Each edge consists of two keypoint indices"
                  items:
                    type: "integer"
                    description: "Keypoint index"
                  minItems: 2
                  maxItems: 2
```
#### Pointer gauge reading example (instance segmentation)
```yaml
config:
  processing_strategy: pointer
  labels: 
      0: "0"
      1: "1"
  type: "instance segmentation"
  shapes: [1, 3, 640, 640]

inputs:
  - name: "image"
    description: "The image can be a valid URL or a Base64 string in data URI format"
    type: "string"
    format: "uri | base64"
    required: true
    
  - name: "conf_threshold"
    description: "Optional. Confidence threshold (keep detections with confidence ≥ this)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "Optional. NMS threshold (suppress boxes with IoU > this value)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0
    
  - name: "scale_min"
    description: "Scale start value"
    type: "float"
    required: true
    default: 0.0
    minLength: 4
    maxLength: 4

  - name: "scale_max"
    description: "Scale end value"
    type: "float"
    required: true
    default: 60.0
    minLength: 4
    maxLength: 4

outputs:
  - name: "data"
    description: "Detection results for one or multiple images; each element corresponds to one image and its objects"
    type: "array"
    required: true
    items:
      description: "Describes a single image and its detection results"
      type: "object"
      required: true
      properties:
        file_name:
          description: "Recognized file index or name"
          type: "string"
          required: true
        detections:
          description: "All detected objects in the image"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "Bounding box [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "Confidence score (0.0 to 1.0)"
                type: "float"
                required: true
              cls:
                description: "Predicted class label (e.g., '0', 'person', 'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "Optional: segmentation polygon points; each sub-array is a vertex [x, y]"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "Pixel coordinate, non-negative"
                    minimum: 0
              points:
                type: "array"
                description: "Optional: pose keypoints; each is [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x/y are pixel coordinates (float), id is keypoint index (int), conf is confidence (float)"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "Skeleton edges; each item is a pair of keypoint indices [idx1, idx2]; returned with points"
                items:
                  type: "array"
                  description: "Each edge consists of two keypoint indices"
                  items:
                    type: "integer"
                    description: "Keypoint index"
                  minItems: 2
                  maxItems: 2
```
#### Water meter reading example (object detection)
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
  type: "object detection"
  shapes: [1, 3, 640, 640]
  post_format:
    - "concatLabels"

inputs:
  - name: "image"
    description: "The image can be a valid URL or a Base64 string in data URI format"
    type: "string"
    format: "uri | base64"
    required: true
    
  - name: "conf_threshold"
    description: "Optional. Confidence threshold (keep detections with confidence ≥ this)"
    type: "float"
    required: false
    default: 0.25
    minimum: 0.0
    maximum: 1.0

  - name: "nms_threshold"
    description: "Optional. NMS threshold (suppress boxes with IoU > this value)"
    type: "float"
    required: false
    default: 0.45
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "Detection results for one or multiple images; each element corresponds to one image and its objects"
    type: "array"
    required: true
    items:
      description: "Describes a single image and its detection results"
      type: "object"
      required: true
      properties:
        file_name:
          description: "Recognized file index or name"
          type: "string"
          required: true
        detections:
          description: "All detected objects in the image"
          type: "array"
          items:
            type: "object"
            properties:
              boxes:
                type: "array"
                description: "Bounding box [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "Confidence score (0.0 to 1.0)"
                type: "float"
                required: true
              cls:
                description: "Predicted class label (e.g., '0', 'person', 'dog')"
                type: "string"
                required: true
              masks:
                type: "array"
                description: "Optional: segmentation polygon points; each sub-array is a vertex [x, y]"
                items:
                  type: "array"
                  minItems: 2
                  maxItems: 2
                  items:
                    type: "integer"
                    description: "Pixel coordinate, non-negative"
                    minimum: 0
              points:
                type: "array"
                description: "Optional: pose keypoints; each is [x, y, id, conf]"
                items:
                  type: "array"
                  description: "x/y are pixel coordinates (float), id is keypoint index (int), conf is confidence (float)"
                  minItems: 4
                  maxItems: 4
              skeleton:
                type: "array"
                description: "Skeleton edges; each item is a pair of keypoint indices [idx1, idx2]; returned with points"
                items:
                  type: "array"
                  description: "Each edge consists of two keypoint indices"
                  items:
                    type: "integer"
                    description: "Keypoint index"
                  minItems: 2
                  maxItems: 2
```
#### Built-in OCR model definition example
```yaml
config:
  
inputs:
  - name: "image"
    description: "The image can be a valid URL or a Base64 string in data URI format"
    type: "string"
    format: "uri | base64"
    required: true

  - name: "conf_threshold"
    description: "Optional. Confidence threshold (keep detections with confidence ≥ this)"
    type: "float"
    required: false
    default: 0.5
    minimum: 0.0
    maximum: 1.0

outputs:
  - name: "data"
    description: "Detection results for one or multiple images; each element corresponds to one image and its detections"
    type: "array"
    required: true
    items:
      description: "Describes a single image and its detection results"
      type: "object"
      required: true
      properties:
        file_name:
          description: "Recognized file index or name"
          type: "string"
          required: true
        detections:
          description: "All detected objects in the image"
          type: "array"
          items:
            type: "object"
            properties:
              box:
                type: "array"
                description: "Bounding box [x, y, w, h]"
                items:
                  type: "integer"
                minLength: 4
                maxLength: 4
              conf:
                description: "Confidence score (0.0 to 1.0)"
                type: "float"
                required: true
              cls:
                description: "Recognized text, e.g., '(Thirty-Six Stratagems Full Interpretation)'"
                type: "string"
                required: true
```