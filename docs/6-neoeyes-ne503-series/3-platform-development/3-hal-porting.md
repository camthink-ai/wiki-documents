---
description: NE503 HAL 移植完整指南，详解四大 HAL 接口（Video、ML、Codec、IO）的实现流程、HAL v1 与 v2 架构差异、V4L2/RKNN/MPP 等平台适配代码示例、CMake 构建配置、测试验证及常见问题，帮助开发者将 AIPC 平台移植到新的 SoC 硬件。
keywords: [NE503 HAL移植, 硬件抽象层, V4L2, RKNN, MPP, Hailo-15, RK3588, CMake构建, DMA-BUF, 边缘AI]
tags: [HAL移植, NE503, 平台开发, 硬件适配]
---

# HAL Porting Guide

本文档指导你将 AIPC 平台移植到新的 SoC 平台。移植的核心工作是实现 HAL（硬件抽象层）接口，使上层平台服务能够无差别地运行在不同硬件上。

## 1 概述

移植主要涉及实现四个 HAL 层接口：

- `hal_video.h` — 摄像头与 ISP
- `hal_ml.h` — AI 加速器
- `hal_codec.h` — 硬件编码/解码器
- `hal_io.h` — MCU 与外设控制

## 2 HAL v1 与 HAL v2 架构差异

HAL v2（`hal_v2/`）是硬件抽象层的第二代实现，采用模块化架构，支持媒体管线、AI 推理、DSP 处理和外设控制。它与 HAL v1（`hal/`）共存，是面向新特性的推荐实现。

### 2.1 目录结构

```
hal_v2/
├── include/               # 公共头文件（按模块组织）
│   ├── common/            # 通用类型、日志、缓冲区
│   ├── media/             # 媒体管线接口（hal_media.h）
│   ├── model/             # AI 模型接口（推理、后处理、GenAI）
│   ├── dsp/               # DSP 操作接口
│   └── peripheral/        # 外设接口（MCU、设备）
├── platforms/             # 平台实现
│   ├── hailo15/           # Hailo-15 实现
│   └── stub/              # 测试桩实现
├── common/                # 通用源码
├── examples/              # 示例程序
├── third_party/           # 第三方依赖
└── scripts/               # 构建脚本
```

### 2.2 HAL v1 与 HAL v2 对比

| 特性 | HAL v1（`hal/`） | HAL v2（`hal_v2/`） |
|------|-------------------|----------------------|
| 结构 | 扁平，按功能文件组织 | 模块化，按组件目录组织 |
| 接口 | 直接函数调用 | 操作表（Ops 结构体） |
| 媒体 | 基础视频采集/编码 | 完整管线（配置、隐私遮罩、数字变焦、防抖） |
| AI | 基础推理 | 推理 + 后处理 + GenAI（LLM/VLM） |
| DSP | 无 | 图像处理、格式转换、隐私遮罩 |
| 构建 | CMake 单目标 | CMake 支持单库/模块化构建 |

### 2.3 HAL v2 核心接口

**媒体管线（`hal_media.h`）**

统一视频管线生命周期管理，支持：
- Profile 切换
- 动态图像参数（旋转、翻转、变焦、防抖）
- 隐私遮罩（多边形）
- 运行时流的添加/移除
- 前端到编码器的自动转发控制

**AI 推理与 GenAI**
- `hal_model.h` — 模型推理和后处理
- `hal_genai.h` — LLM/VLM 流式生成，支持自定义停止词和上下文管理

**DSP（`hal_dsp.h`）**

图像处理操作：裁剪、缩放、格式转换、隐私遮罩、防抖。

**外设（`hal_mcu.h`）**

通用 MCU 通信接口，用于标准化设备控制。

## 3 移植流程

### 3.1 准备工作

1. 确认 SoC 具备以下能力：
   - 摄像头接口（MIPI CSI / DVP）
   - AI 加速器（NPU / DSP）
   - 硬件编码器（H.264/H.265）
   - UART/I2C（用于 MCU 通信）

2. 准备开发环境：
   - SoC 厂商提供的 SDK
   - 交叉编译工具链
   - 开发板与调试工具

### 3.2 实现 HAL Video

#### 3.2.1 V4L2 方式（推荐）

如果 SoC 支持标准 V4L2 接口：

```c
// hal/media/v4l2_impl.c

#include "hal_video.h"
#include <linux/videodev2.h>
#include <sys/ioctl.h>
#include <fcntl.h>

typedef struct {
    int fd;
    struct v4l2_format format;
    struct v4l2_buffer* buffers;
    int num_buffers;
} V4l2Stream;

static int v4l2_init(void) {
    // Initialize V4L2 subsystem
    return HAL_VIDEO_SUCCESS;
}

static int v4l2_open_stream(const char* stream_id, HalVideoStream* out) {
    V4l2Stream* stream = malloc(sizeof(V4l2Stream));

    // Open device
    stream->fd = open("/dev/video0", O_RDWR);
    if (stream->fd < 0) {
        return HAL_VIDEO_ERROR_NO_DEVICE;
    }

    *out = stream;
    return HAL_VIDEO_SUCCESS;
}

static int v4l2_set_config(HalVideoStream s, const HalStreamConfig* config) {
    V4l2Stream* stream = (V4l2Stream*)s;

    // Set format
    struct v4l2_format fmt = {0};
    fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
    fmt.fmt.pix.width = config->width;
    fmt.fmt.pix.height = config->height;
    fmt.fmt.pix.pixelformat = V4L2_PIX_FMT_NV12;

    if (ioctl(stream->fd, VIDIOC_S_FMT, &fmt) < 0) {
        return HAL_VIDEO_ERROR_INVALID_ARG;
    }

    return HAL_VIDEO_SUCCESS;
}

// ... Implement other interfaces

// Export operations table
HalVideoOps HAL_VIDEO_OPS = {
    .init = v4l2_init,
    .deinit = v4l2_deinit,
    .open_stream = v4l2_open_stream,
    .close_stream = v4l2_close_stream,
    .set_config = v4l2_set_config,
    .start = v4l2_start,
    .stop = v4l2_stop,
    .read_frame = v4l2_read_frame,
    .release_frame = v4l2_release_frame,
};
```

#### 3.2.2 厂商私有接口方式

以 RK3588 使用 rkaiq 为例：

```c
// hal/media/rk3588_impl.c

#include "hal_video.h"
#include <rk_aiq_user_api.h>

static int rk_init(void) {
    rk_aiq_working_mode_t mode = RK_AIQ_WORKING_MODE_NORMAL;
    rk_aiq_init(0, mode);
    return HAL_VIDEO_SUCCESS;
}

// ... Implement other interfaces
```

### 3.3 实现 HAL ML

#### 3.3.1 Hailo-15 示例

```c
// hal/accel/hailo15_impl.c

#include "hal_ml.h"
#include <hailo/hailort.h>

typedef struct {
    hailo_device device;
    hailo_hef hef;
    hailo_configured_network_group network_group;
} HailoModel;

static int hailo_init(void) {
    // Initialize HailoRT
    return HAL_ML_SUCCESS;
}

static int hailo_load_model(const char* path, HalModel* out) {
    HailoModel* model = malloc(sizeof(HailoModel));

    // Load HEF file
    hailo_status status = hailo_create_device(NULL, &model->device);
    if (status != HAILO_SUCCESS) {
        return HAL_ML_ERROR_NO_DEVICE;
    }

    status = hailo_create_hef_file(&model->hef, path);
    if (status != HAILO_SUCCESS) {
        return HAL_ML_ERROR_MODEL_LOAD;
    }

    // Configure network
    hailo_configure_params_t config_params = {0};
    status = hailo_configure_device(model->device, model->hef, &config_params,
                                     &model->network_group);

    *out = model;
    return HAL_ML_SUCCESS;
}

static int hailo_infer(HalModel m,
                       const HalTensor* inputs, int num_inputs,
                       HalTensor* outputs, int num_outputs,
                       const HalInferConfig* config) {
    HailoModel* model = (HailoModel*)m;

    // Execute inference
    hailo_status status = hailo_run_async(model->network_group,
                                          inputs, outputs,
                                          NULL, NULL);

    return (status == HAILO_SUCCESS) ? HAL_ML_SUCCESS : HAL_ML_ERROR_GENERIC;
}

// Export operations table
HalMLOps HAL_ML_OPS = {
    .init = hailo_init,
    .load_model = hailo_load_model,
    .infer = hailo_infer,
    // ...
};
```

#### 3.3.2 RKNN 示例

```c
// hal/accel/rknn_impl.c

#include "hal_ml.h"
#include <rknn_api.h>

typedef struct {
    rknn_context ctx;
} RKNNModel;

static int rknn_load_model(const char* path, HalModel* out) {
    RKNNModel* model = malloc(sizeof(RKNNModel));

    // Read model file
    FILE* fp = fopen(path, "rb");
    fseek(fp, 0, SEEK_END);
    size_t size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    void* data = malloc(size);
    fread(data, 1, size, fp);
    fclose(fp);

    // Load model
    int ret = rknn_init(&model->ctx, data, size, 0);
    free(data);

    if (ret != RKNN_SUCC) {
        return HAL_ML_ERROR_MODEL_LOAD;
    }

    *out = model;
    return HAL_ML_SUCCESS;
}
```

### 3.4 实现 HAL Codec

#### 3.4.1 RK MPP 示例

```c
// hal/codec/mpp_impl.c

#include "hal_codec.h"
#include <rockchip/rk_mpi.h>

typedef struct {
    MppCtx ctx;
    MppApi* mpi;
} MPPEncoder;

static int mpp_create_encoder(const HalCodecConfig* config, HalCodec* out) {
    MPPEncoder* enc = malloc(sizeof(MPPEncoder));

    // Create MPP context
    mpp_create(&enc->ctx, &enc->mpi);
    mpp_init(enc->ctx, MPP_CTX_ENC, MPP_VIDEO_CodingAVC);

    // Configure encoding parameters
    MppEncCfg cfg;
    mpp_enc_cfg_init(&cfg);
    mpp_enc_cfg_set_s32(cfg, "prep:width", config->width);
    mpp_enc_cfg_set_s32(cfg, "prep:height", config->height);
    mpp_enc_cfg_set_s32(cfg, "rc:bps", config->bitrate);

    enc->mpi->control(enc->ctx, MPP_ENC_SET_CFG, cfg);

    *out = enc;
    return HAL_CODEC_SUCCESS;
}
```

### 3.5 实现 HAL IO

MCU 通信通常通过 UART 进行：

```c
// hal/board/uart_impl.c

#include "hal_io.h"
#include <termios.h>
#include <fcntl.h>

static int uart_fd = -1;

static int uart_init(void) {
    uart_fd = open("/dev/ttyS1", O_RDWR | O_NOCTTY);
    if (uart_fd < 0) {
        return HAL_IO_ERROR_NO_DEVICE;
    }

    // Configure serial port parameters
    struct termios options;
    tcgetattr(uart_fd, &options);
    cfsetispeed(&options, B115200);
    cfsetospeed(&options, B115200);
    options.c_cflag |= (CLOCAL | CREAD);
    options.c_cflag &= ~PARENB;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS8;
    tcsetattr(uart_fd, TCSANOW, &options);

    return HAL_IO_SUCCESS;
}

static int uart_send_command(const HalIORequest* req) {
    // Build protocol frame
    uint8_t frame[256];
    int len = 0;

    frame[len++] = 0xAA;  // Header
    frame[len++] = 0x55;
    frame[len++] = req->cmd;
    frame[len++] = req->payload_len;
    memcpy(&frame[len], req->payload, req->payload_len);
    len += req->payload_len;

    // Checksum
    uint8_t checksum = 0;
    for (int i = 0; i < len; i++) {
        checksum ^= frame[i];
    }
    frame[len++] = checksum;

    // Send
    write(uart_fd, frame, len);

    // Receive response
    if (req->resp_buf) {
        int n = read(uart_fd, req->resp_buf, req->resp_buf_size);
        req->resp_len = n;
    }

    return HAL_IO_SUCCESS;
}
```

## 4 构建与安装

### 4.1 CMakeLists.txt 示例

```cmake
# hal/CMakeLists.txt

cmake_minimum_required(VERSION 3.16)
project(aipc_hal)

# Select implementation based on platform
if(TARGET_SOC STREQUAL "hailo15")
    set(HAL_IMPL_SOURCES
        media/v4l2_impl.c
        accel/hailo15_impl.c
        codec/hailo_codec_impl.c
        board/uart_impl.c
    )
    find_package(HailoRT REQUIRED)
    set(HAL_LIBS ${HailoRT_LIBRARIES})

elseif(TARGET_SOC STREQUAL "rk3588")
    set(HAL_IMPL_SOURCES
        media/rk3588_impl.c
        accel/rknn_impl.c
        codec/mpp_impl.c
        board/uart_impl.c
    )
    find_library(RKNN_LIB rknn_api)
    find_library(MPP_LIB rockchip_mpp)
    set(HAL_LIBS ${RKNN_LIB} ${MPP_LIB})
endif()

# Build shared library
add_library(hal-${TARGET_SOC} SHARED ${HAL_IMPL_SOURCES})
target_include_directories(hal-${TARGET_SOC} PUBLIC include)
target_link_libraries(hal-${TARGET_SOC} ${HAL_LIBS})

# Install
install(TARGETS hal-${TARGET_SOC}
        LIBRARY DESTINATION /opt/aipc/lib/hal)
```

### 4.2 HAL v2 构建命令

```bash
# 构建 stub（本地测试）
make hal-v2

# 构建 Hailo-15（需要交叉编译 SDK）
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux
make hal-v2 PLATFORM=hailo15
```

### 4.3 HAL v1 构建命令

```bash
mkdir build && cd build
cmake .. -DTARGET_SOC=hailo15
make
sudo make install
```

## 5 测试验证

### 5.1 单元测试

```c
// hal/tests/test_video.c

#include "hal_video.h"
#include <assert.h>

void test_video_init() {
    int ret = HAL_VIDEO_OPS.init();
    assert(ret == HAL_VIDEO_SUCCESS);
}

void test_video_open() {
    HalVideoStream stream;
    int ret = HAL_VIDEO_OPS.open_stream("cam0_main", &stream);
    assert(ret == HAL_VIDEO_SUCCESS);
    assert(stream != NULL);
}

int main() {
    test_video_init();
    test_video_open();
    printf("All tests passed\n");
    return 0;
}
```

### 5.2 集成测试

配置平台使用新实现的 HAL：

```yaml
# configs/platform/camera-daemon.yaml
hal:
  library_path: /opt/aipc/lib/hal/hal-rk3588.so
```

启动平台服务并验证各项功能是否正常。

## 6 HAL v2 Hailo-15 平台实现

`platforms/hailo15/` 目录包含完整的 Hailo-15 平台实现：

- **Media** — 视频采集、编码（H.264/H.265）、ISP、OSD
- **Inference** — HailoRT 推理、后处理、GenAI
- **DSP** — 基于 Hailo DSP 的图像处理
- **Peripherals** — LED、RTC、传感器、镜头控制、GPIO

## 7 HAL v2 示例程序

`examples/` 目录包含多个完整示例：

- AI 管线（多模型推理）
- GenAI 集成
- 动态隐私遮罩
- 两阶段 OCR
- 深度估计、姿态检测

## 8 常见问题

**Q：如何处理 DMA-BUF？**

A：在 `read_frame()` 中填充 `HalFrame.dma_fds`，平台将自动处理零拷贝传输。

**Q：如何支持多摄像头？**

A：在 `open_stream()` 中根据 `stream_id` 参数打开不同的设备节点。

**Q：推理性能不足怎么办？**

A：检查 `HalMLOps.infer()` 是否使用了硬件加速路径，避免在 CPU 上进行内存拷贝。

**Q：MCU 协议不兼容怎么办？**

A：修改 `hal_io.h` 实现中的协议封装逻辑，保持接口不变。

## 相关文档

- [平台架构](../3-platform-development/0-platform-architecture.md)
- [开发指南](./1-development-environment.md)
- [部署指南](./2-build-and-deploy.md)
- [AI Runtime 服务](../6-reference/service-reference/0-ai-runtime.md)
- [Media Streaming 服务](../6-reference/service-reference/5-media-streaming.md)
