---
description: NE503 AIPC 平台测试环境搭建完整指南，涵盖四层测试架构（单元测试、集成测试、MVP 验证、E2E）、Stub 模式硬件模拟、HAL/Web/SDK 各模块测试方法、CI/CD 流水线配置及测试报告规范，帮助开发者构建高效可靠的自动化测试体系。
keywords: [NE503 测试环境, Stub模式, 单元测试, 集成测试, MVP验证, CI/CD, 代码覆盖率, HAL测试, Web测试, Python SDK测试]
tags: [测试环境, NE503, 自动化测试, CI/CD]
---

# Test Environment Setup

AIPC 平台采用四层测试架构，从毫秒级单元测试到端到端全链路验证逐层递进。本文档说明各层测试的目标、运行方式及环境配置。

## 1 测试层级架构

```mermaid
graph TB
    subgraph "测试层级"
        A[单元测试]
        B[集成测试]
        C[MVP 验证]
        D[E2E 测试]
    end

    subgraph "测试范围"
        A -->|纯逻辑验证| E1[功能模块]
        A -->|独立运行| E2[无外部依赖]
        A -->|毫秒级执行| E3[快速反馈]

        B -->|接口验证| F1[服务间通信]
        B -->|数据流| F2[gRPC API]
        B -->|配置加载| F3[文件/数据库]
        B -->|秒级执行| F4[服务启动]

        C -->|核心功能| G1[服务可用性]
        C -->|数据交互| G2[AI 推理]
        C -->|事件总线| G3[消息传递]
        C -->|分钟级执行| G4[完整工作流]

        D -->|完整用户流程| H1[Web UI]
        D -->|真实场景| H2[硬件交互]
        D -->|15-30 分钟| H3[全链路]
    end

    E1 -->|覆盖| F1
    F1 -->|验证| G1
    G1 -->|端到端| H1

    style E1 fill:#f9f,stroke:#333,stroke-width:1px
    style B fill:#9cf,stroke:#333,stroke-width:1px
    style C fill:#9fc,stroke:#333,stroke-width:1px
    style D fill:#c9f,stroke:#333,stroke-width:1px
```

### 1.1 各层说明

| 层级 | 目标 | 依赖 | 执行耗时 | 覆盖率要求 |
|------|------|------|---------|-----------|
| 单元测试 | 测试独立函数和模块，使用 Mock 隔离外部依赖 | 无 | 毫秒级 | 80%+ |
| 集成测试 | 验证模块间接口与数据流，包括服务启动和通信 | 服务运行 | 秒~分钟 | -- |
| MVP 验证 | 使用 HAL Stub 模拟硬件，验证核心功能与服务可用性 | Stub HAL | 分钟级 | -- |
| E2E 测试 | 完整用户工作流，包含 Web UI 和真实硬件交互 | 全栈 + 硬件 | 15-30 分钟 | -- |

## 2 环境准备

### 2.1 Ubuntu 22.04

```bash
# 基础依赖
sudo apt update
sudo apt install -y \
    build-essential \
    cmake \
    golang-go \
    nodejs \
    npm \
    protobuf-compiler \
    protobuf-compiler-grpc \
    libgrpc++-dev \
    libprotobuf-dev \
    python3-pip \
    python3-venv \
    git

# Go 依赖
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Python 依赖
python3 -m pip install --user -r sdk/python/requirements.txt

# Node.js 依赖
cd web/console && npm install
```

### 2.2 macOS

```bash
# 使用 Homebrew 安装依赖
brew install go node protobuf cmake grpc

# Go 依赖
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Python 依赖
python3 -m venv venv
source venv/bin/activate
pip install -r sdk/python/requirements.txt
```

### 2.3 Hailo-15 交叉编译工具链

```bash
# 下载 Hailo SDK 4.0.23
wget -O hailo-sdk.tar.gz <SDK_DOWNLOAD_URL>
sudo mkdir -p /opt/poky
sudo tar -xzf hailo-sdk.tar.gz -C /opt/poky/

# 加载环境
source /opt/poky/4.0.23/environment-setup-aarch64-poky-linux

# 验证
echo $CC  # 应输出：aarch64-poky-linux-gcc
```

### 2.4 环境检查

```bash
# 检查构建环境
./scripts/check_build.sh

# 验证依赖版本
go version          # Go 1.25+
node --version      # v20+
protoc --version    # 3.12+
cmake --version     # 3.16+
```

## 3 Stub 模式测试

### 3.1 Stub 模式概述

HAL Stub 是 HAL 的纯软件实现，提供模拟硬件功能，使测试无需依赖真实硬件即可运行：

```mermaid
graph TB
    subgraph "HAL Stub 实现架构"
        A[hal_v2/platforms/stub/] --> B[模拟硬件响应]
        A --> C[固定数据生成]
        A --> D[API 兼容性]

        B --> E[视频帧模拟]
        C --> F[推理结果模拟]
        D --> G[接口一致性]

        E --> H[视频帧生成]
        F --> I[检测结果生成]
        G --> J[单元测试]
    end

    subgraph "Stub 特性"
        K[零硬件依赖]
        L[快速执行]
        M[结果可预测]
        N[调试友好]
        O[跨平台支持]
    end

    J --> K
    J --> L
    J --> M
    J --> N
    J --> O
```

### 3.2 Stub 构建

```bash
# 构建 HAL Stub
make hal-v2 PLATFORM=stub

# 验证构建产物
ls -la build/output/hal/stub/libhal*

# 使用 Stub 运行 MVP 测试
./scripts/test_mvp.sh
```

### 3.3 Stub 配置示例

```yaml
# configs/hal/stub_config.yaml
stub_config:
  video:
    resolution: [1920, 1080]
    fps: 30
    format: "NV12"
    pattern: "test_pattern"  # test_pattern | noise | static

  inference:
    models:
      - name: "person_detection"
        input_size: [640, 640]
        output_count: 100
        confidence: 0.8

    delay_ms: 10  # 模拟推理延迟

  codec:
    bitrate: 2000000
    gop_size: 30

  device:
    gpio_state: [false, false, false]  # GPIO 模拟状态
    uart_response: "OK"  # UART 模拟响应
```

## 4 单元测试

### 4.1 运行单元测试

```bash
# 全部单元测试
make test-unit

# 指定服务
make test-unit-device-control
make test-unit-event-bus
make test-unit-app-manager

# 直接使用 Go test
go test -v ./platform/device-control/...
go test -v ./platform/event-bus/...
go test -v ./platform/app-manager/...
```

### 4.2 测试目录结构

```
platform/
├── device-control/
│   ├── device-control_test.go    # 主服务测试
│   ├── handlers/
│   │   └── device_test.go       # Handler 测试
│   └── grpc/
│       └── device_test.go       # gRPC 服务测试
├── event-bus/
│   ├── event-bus_test.go        # 事件总线测试
│   └── handlers/
│       └── event_test.go         # 事件处理器测试
└── app-manager/
    ├── app-manager_test.go      # 应用管理测试
    └── handlers/
        └── app_test.go          # 应用 Handler 测试
```

### 4.3 单元测试示例

```go
// platform/device-control/device-control_test.go
package devicecontrol

import (
    "testing"
    "context"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"

    "github.com/aipc/platform/device-control/pb"
)

func TestDeviceControl_GetStatus(t *testing.T) {
    srv := setupTestServer()
    client := pb.NewDeviceControlClient(srv.conn)

    resp, err := client.GetStatus(context.Background(), &pb.GetStatusRequest{})

    assert.NoError(t, err)
    assert.NotNil(t, resp)
    assert.Equal(t, pb.DeviceStatus_DEVICE_STATUS_RUNNING, resp.Status)
}

func TestDeviceControl_ControlLight(t *testing.T) {
    tests := []struct {
        name    string
        request *pb.ControlLightRequest
        want    *pb.ControlLightResponse
        wantErr bool
    }{
        {
            name: "valid control",
            request: &pb.ControlLightRequest{
                Light: pb.Light_LIGHT_WHITE,
                Value: 80,
            },
            want:    &pb.ControlLightResponse{Success: true},
            wantErr: false,
        },
        {
            name: "invalid value",
            request: &pb.ControlLightRequest{
                Light: pb.Light_LIGHT_WHITE,
                Value: 256, // 超出范围
            },
            want:    nil,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            srv := setupTestServer()
            client := pb.NewDeviceControlClient(srv.conn)

            resp, err := client.ControlLight(context.Background(), tt.request)

            if tt.wantErr {
                assert.Error(t, err)
                return
            }

            assert.NoError(t, err)
            assert.Equal(t, tt.want.Success, resp.Success)
        })
    }
}
```

## 5 集成测试

### 5.1 运行集成测试

```bash
# 全部集成测试
make test-integration

# 指定服务集成测试
make test-integration-device-control
make test-integration-ai-runtime

# 使用测试脚本
./scripts/test_all.sh
```

### 5.2 集成测试场景

```mermaid
graph TB
    subgraph "集成测试场景"
        A[服务启动测试]
        B[gRPC 通信测试]
        C[配置加载测试]
        D[数据流测试]

        A --> A1[Event Bus 启动]
        A --> A2[Device Control 启动]
        A --> A3[AI Runtime 启动]

        B --> B1[服务间调用]
        B --> B2[超时处理]
        B --> B3[错误传播]

        C --> C1[YAML 解析]
        C --> C2[配置校验]
        C --> C3[热重载]

        D --> D1[事件发布/订阅]
        D --> D2[AI 推理流]
        D --> D3[设备状态同步]
    end

    style A fill:#f9f,stroke:#333,stroke-width:1px
    style B fill:#9cf,stroke:#333,stroke-width:1px
    style C fill:#9fc,stroke:#333,stroke-width:1px
    style D fill:#c9f,stroke:#333,stroke-width:1px
```

### 5.3 集成测试示例

```go
// integration_test.go
package integration

import (
    "context"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"

    "github.com/aipc/platform/device-control/pb"
    aipb "github.com/aipc/platform/ai-runtime/pb"
)

func TestDeviceControlAndAIRuntimeIntegration(t *testing.T) {
    // 1. 启动服务
    deviceCtrl := startDeviceControlService()
    aiRuntime := startAIRuntimeService()

    // 2. 测试设备控制
    client := pb.NewDeviceControlClient(deviceCtrl.conn)
    status, err := client.GetStatus(context.Background(), &pb.GetStatusRequest{})
    require.NoError(t, err)
    assert.Equal(t, pb.DeviceStatus_DEVICE_STATUS_RUNNING, status.Status)

    // 3. 测试 AI Runtime
    aiClient := aipb.NewAIRuntimeClient(aiRuntime.conn)
    models, err := aiClient.ListModels(context.Background(), &aipb.ListModelsRequest{})
    require.NoError(t, err)
    assert.Greater(t, len(models.Models), 0)

    // 4. 测试交互：设备状态影响 AI 推理
    lightResp, err := client.ControlLight(context.Background(), &pb.ControlLightRequest{
        Light: pb.Light_LIGHT_WHITE,
        Value: 100,
    })
    require.NoError(t, err)
    assert.True(t, lightResp.Success)

    // 5. 验证 AI 推理可获取设备状态
    inferenceReq := &aipb.InferenceRequest{
        ModelName: "environment_monitoring",
        InputData: []byte("test_data"),
    }

    infResp, err := aiClient.Infer(context.Background(), inferenceReq)
    require.NoError(t, err)
    assert.Contains(t, infResp.Metadata, "device_status")
}

func TestEventBusIntegration(t *testing.T) {
    eb := startEventBusService()
    pub := pb.NewEventBusClient(eb.conn)
    sub := pb.NewEventBusClient(eb.conn)

    // 发布事件
    event := &pb.PublishEventRequest{
        Topic: "device/light/control",
        Event: &pb.Event{
            Timestamp: time.Now().UnixNano(),
            Source:    "integration_test",
            Payload:   []byte(`{"light": "white", "value": 80}`),
        },
    }

    _, err := pub.PublishEvent(context.Background(), event)
    require.NoError(t, err)

    // 订阅事件
    stream, err := sub.SubscribeEvent(context.Background(), &pb.SubscribeEventRequest{
        Topic: "device/light/control",
    })
    require.NoError(t, err)

    // 接收事件
    received, err := stream.Recv()
    require.NoError(t, err)
    assert.Equal(t, event.Event.Timestamp, received.Event.Timestamp)
}
```

## 6 MVP 验证测试

### 6.1 MVP 测试流程

MVP（最小可行产品）测试验证核心功能与服务可用性：

```mermaid
graph TB
    subgraph "MVP 测试流程"
        A[启动全部服务] --> B[检查服务状态]
        B --> C[测试 API 调用]
        C --> D[测试功能集成]
        D --> E[生成测试报告]

        A --> A1[Event Bus]
        A1 --> A2[Device Control]
        A2 --> A3[AI Runtime]
        A3 --> A4[App Manager]

        B --> B1[检查 Unix Socket]
        B1 --> B2[检查服务日志]
        B2 --> B3[健康检查]

        C --> C1[列出模型]
        C1 --> C2[控制设备]
        C2 --> C3[发布事件]
        C3 --> C4[列出应用]

        D --> D1[事件驱动流]
        D1 --> D2[AI 推理流]
        D2 --> D3[应用生命周期]
    end

    subgraph "测试关注点"
        F[服务可用性]
        G[API 一致性]
        H[错误处理]
        I[性能指标]

        F --> F1[服务启动时间]
        G --> G1[响应延迟]
        H --> H1[错误码正确性]
        I --> I1[吞吐量]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#c9f,stroke:#333,stroke-width:2px
```

### 6.2 运行 MVP 测试

```bash
# 启动 MVP 服务
./scripts/start_mvp.sh

# 运行验证脚本
./scripts/test_mvp.sh

# 停止服务
./scripts/stop_mvp.sh
```

### 6.3 MVP 测试脚本详解

以下脚本的完整流程分为四步：检查服务、测试事件总线、测试设备控制、测试 AI Runtime。

```bash
#!/bin/bash
# scripts/test_mvp.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

RUN_DIR="/run/aipc"

echo "=========================================="
echo "AIPC Platform - MVP Test"
echo "=========================================="

# 检查服务状态
check_service() {
    local name=$1
    local sock=$2

    if [ -S "$sock" ]; then
        echo -e "${GREEN}OK${NC} $name is running"
        return 0
    else
        echo -e "${RED}FAIL${NC} $name is not running (socket: $sock)"
        return 1
    fi
}

# 测试事件总线
test_event_bus() {
    echo -e "\n${BLUE}[2/4] Testing Event Bus...${NC}"

    check_service "Event Bus" "$RUN_DIR/event-bus.sock"

    python3 -c "
from hailo_ipc_sdk import EventClient

try:
    eb = EventClient()
    test_topic = 'test/topic'
    test_data = {'message': 'Hello from MVP test'}
    eb.publish(test_topic, test_data)
    print('Event published successfully')
    print('Event bus test passed')
except Exception as e:
    print(f'Event bus test failed: {e}')
    exit(1)
"
}

# 测试设备控制
test_device_control() {
    echo -e "\n${BLUE}[3/4] Testing Device Control...${NC}"

    check_service "Device Control" "$RUN_DIR/device-control.sock"

    python3 -c "
from hailo_ipc_sdk import DeviceClient

try:
    dc = DeviceClient()
    status = dc.get_device_status()
    print(f'Device status: {status}')
    devices = dc.list_devices()
    print(f'Device count: {len(devices)}')
    print('Device control test passed')
except Exception as e:
    print(f'Device control test failed: {e}')
    exit(1)
"
}

# 测试 AI Runtime
test_ai_runtime() {
    echo -e "\n${BLUE}[4/4] Testing AI Runtime...${NC}"

    check_service "AI Runtime" "$RUN_DIR/ai-runtime.sock"

    python3 -c "
from hailo_ipc_sdk import InferenceClient

try:
    ai = InferenceClient()
    models = ai.list_models()
    print(f'Available models: {len(models)}')
    for model in models:
        info = ai.get_model_info(model)
        print(f'Model: {model}, Input: {info.input_shape}')
    print('AI Runtime test passed')
except Exception as e:
    print(f'AI Runtime test failed: {e}')
    exit(1)
"
}

# 主流程
echo -e "${BLUE}[1/4] Checking services...${NC}"

SERVICES_OK=0
SERVICES=(
    "Event Bus|/run/aipc/event-bus.sock"
    "Device Control|/run/aipc/device-control.sock"
    "AI Runtime|/run/aipc/ai-runtime.sock"
    "App Manager|/run/aipc/app-manager.sock"
)

for service in "${SERVICES[@]}"; do
    IFS='|' read -r name sock <<< "$service"
    check_service "$name" "$sock" && SERVICES_OK=$((SERVICES_OK + 1))
done

if [ $SERVICES_OK -lt 2 ]; then
    echo -e "\n${RED}Error: Not enough services running${NC}"
    echo "Start services with: ./scripts/start_mvp.sh"
    exit 1
fi

# 执行功能测试
test_event_bus
test_device_control
test_ai_runtime

# 汇总
echo -e "\n=========================================="
echo -e "${GREEN}MVP Test Complete!${NC}"
echo "=========================================="

# 日志位置
echo "Logs:"
echo "  - Event Bus: /tmp/event-bus.log"
echo "  - Device Control: /tmp/device-control.log"
echo "  - AI Runtime: /tmp/ai-runtime.log"
echo "  - App Manager: /tmp/app-manager.log"
```

## 7 HAL 测试

### 7.1 HAL 测试分层

```mermaid
graph TB
    subgraph "HAL 测试层级"
        A["单元测试<br/>模块内部"]
        B["功能测试<br/>接口验证"]
        C["性能测试<br/>基准测试"]
        D["兼容性测试<br/>跨平台"]
    end

    subgraph "测试内容"
        A --> A1[内存管理]
        A --> A2[错误处理]
        A --> A3[边界条件]

        B --> B1[API 调用]
        B --> B2[数据流验证]
        B --> B3[生命周期管理]

        C --> C1[吞吐量测试]
        C --> C2[延迟测试]
        C --> C3[资源占用]

        D --> D1[多平台兼容]
        D --> D2[版本兼容]
        D --> D3[ABI 兼容]
    end
```

### 7.2 运行 HAL 测试

```bash
# 构建 HAL 测试
make hal-test

# 运行 HAL 单元测试
cd hal/build-stub && make test

# 运行 HAL 示例程序
cd hal/build-stub && ./hello_world
cd hal/build-stub && ./video_test

# 性能测试
./scripts/test_hal_performance.sh
```

### 7.3 HAL 测试示例

```cpp
// hal/test/test_buffer.cpp
#include <gtest/gtest.h>
#include "hal_buffer.h"

class HalBufferTest : public ::testing::Test {
protected:
    void SetUp() override {
        // 测试初始化
    }

    void TearDown() override {
        // 测试清理
    }
};

TEST_F(HalBufferTest, CreateFrameBuffer) {
    HalFrameBufferRequest req = {
        .width = 1920,
        .height = 1080,
        .format = HAL_PIX_FMT_NV12,
        .pool_max_buffers = 4,
        .mem_type = HAL_MEM_DMABUF,
        .zero_initialize = false,
        .priv = nullptr
    };

    HalFrameBuffer *frame = nullptr;
    int ret = HAL_FRAME_BUFFER_OPS.request_frame_buffer(&req, &frame);

    EXPECT_EQ(ret, HAL_OK);
    ASSERT_NE(frame, nullptr);
    EXPECT_EQ(frame->width, 1920);
    EXPECT_EQ(frame->height, 1080);
    EXPECT_EQ(frame->format, HAL_PIX_FMT_NV12);

    HAL_FRAME_BUFFER_OPS.release_frame_buffer(frame);
}

TEST_F(HalBufferTest, PixelFormatConversion) {
    EXPECT_EQ(hal_pixel_format_plane_count(HAL_PIX_FMT_NV12), 2);
    EXPECT_EQ(hal_pixel_format_plane_count(HAL_PIX_FMT_YUV420P), 3);
    EXPECT_EQ(hal_pixel_format_plane_count(HAL_PIX_FMT_RGB24), 1);

    EXPECT_STREQ(hal_pixel_format_to_string(HAL_PIX_FMT_NV12), "NV12");
    EXPECT_STREQ(hal_pixel_format_to_string(HAL_PIX_FMT_YUV420P), "YUV420P");
    EXPECT_STREQ(hal_pixel_format_to_string(HAL_PIX_FMT_RGB24), "RGB24");
}

TEST_F(HalBufferTest, BufferPool) {
    const int pool_size = 4;
    HalFrameBuffer *frames[pool_size];

    HalFrameBufferRequest req = {
        .width = 640,
        .height = 480,
        .format = HAL_PIX_FMT_GRAY8,
        .pool_max_buffers = pool_size,
        .mem_type = HAL_MEM_MALLOC,
        .zero_initialize = true,
        .priv = nullptr
    };

    // 分配多个缓冲区
    for (int i = 0; i < pool_size; i++) {
        int ret = HAL_FRAME_BUFFER_OPS.request_frame_buffer(&req, &frames[i]);
        EXPECT_EQ(ret, HAL_OK);
        ASSERT_NE(frames[i], nullptr);
    }

    // 释放所有缓冲区
    for (int i = 0; i < pool_size; i++) {
        HAL_FRAME_BUFFER_OPS.release_frame_buffer(frames[i]);
    }
}

TEST_F(HalBufferTest, ErrorHandling) {
    // 无效格式
    HalFrameBufferRequest req_invalid = {
        .width = 1920,
        .height = 1080,
        .format = (HalPixelFormat)999,
        .pool_max_buffers = 4,
        .mem_type = HAL_MEM_DMABUF,
        .zero_initialize = false,
        .priv = nullptr
    };

    HalFrameBuffer *frame = nullptr;
    int ret = HAL_FRAME_BUFFER_OPS.request_frame_buffer(&req_invalid, &frame);
    EXPECT_EQ(ret, HAL_ERR_INVALID_FMT);
    EXPECT_EQ(frame, nullptr);

    // 零尺寸
    HalFrameBufferRequest req_zero = {
        .width = 0,
        .height = 1080,
        .format = HAL_PIX_FMT_NV12,
        .pool_max_buffers = 4,
        .mem_type = HAL_MEM_DMABUF,
        .zero_initialize = false,
        .priv = nullptr
    };

    ret = HAL_FRAME_BUFFER_OPS.request_frame_buffer(&req_zero, &frame);
    EXPECT_EQ(ret, HAL_ERR_INVALID_SIZE);
    EXPECT_EQ(frame, nullptr);
}
```

## 8 Web 前端测试

### 8.1 Web 测试架构

```mermaid
graph TB
    subgraph "Web 测试类型"
        A["单元测试<br/>组件测试"]
        B["集成测试<br/>服务交互"]
        C["端到端测试<br/>用户工作流"]
        D["视觉回归测试<br/>UI 对比"]
    end

    subgraph "测试工具"
        A --> A1[Vitest]
        A --> A2[React Testing Library]

        B --> B1[Playwright]
        B --> B2[MSW Mock Service Worker]

        C --> C1[Playwright E2E]
        C --> C2[Cypress]

        D --> D1[Percy]
        D --> D2[Playwright Visual]
    end
```

### 8.2 运行 Web 测试

```bash
cd web/console

# 安装依赖
npm install

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e

# 全部测试
npm run test
```

### 8.3 Web 测试示例

```typescript
// web/console/src/__tests__/device-control.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeviceControl } from '../components/DeviceControl'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

// Mock 服务端
const server = setupServer(
  rest.get('/api/devices', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Camera 1', status: 'online' },
        { id: '2', name: 'Camera 2', status: 'offline' }
      ])
    )
  }),

  rest.post('/api/devices/control', (req, res, ctx) => {
    return res(ctx.status(200))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('DeviceControl Component', () => {
  it('renders device list', async () => {
    render(<DeviceControl />)

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument()
      expect(screen.getByText('Camera 2')).toBeInTheDocument()
    })
  })

  it('controls device light', async () => {
    render(<DeviceControl />)

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument()
    })

    const lightControl = screen.getByText('Control Light')
    fireEvent.click(lightControl)

    await waitFor(() => {
      expect(screen.getByText('Light controlled')).toBeInTheDocument()
    })
  })
})
```

E2E 测试示例：

```typescript
// web/console/tests/e2e/device-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Device Control Flow', () => {
  test('user can control device lights', async ({ page }) => {
    // 登录
    await page.goto('/')
    await page.fill('#username', 'admin')
    await page.fill('#password', 'password')
    await page.click('button[type="submit"]')

    // 导航到设备控制
    await page.click('text=Devices')

    // 等待设备加载
    await page.waitForSelector('text=Camera 1')

    // 控制灯光
    await page.click('text=Camera 1')
    await page.click('text=Control Light')

    // 设置亮度
    await page.fill('input[type="range"]', '80')
    await page.click('button=Apply')

    // 验证成功消息
    await expect(page.locator('text=Light controlled')).toBeVisible()
  })
})
```

## 9 Python SDK 测试

### 9.1 SDK 测试分层

```mermaid
graph TB
    subgraph "SDK 测试层级"
        A["单元测试<br/>模块级"]
        B["集成测试<br/>客户端交互"]
        C["示例测试<br/>真实使用场景"]
        D["性能测试<br/>并发与负载"]
    end

    subgraph "测试覆盖"
        A --> A1[客户端类]
        A --> A2[协议序列化]
        A --> A3[错误处理]

        B --> B1[服务连接]
        B --> B2[API 调用]
        B --> B3[流处理]

        C --> C1[event_subscriber]
        C --> C2[perimeter_guard]
        C --> C3[person_detection]
        C --> C4[video_processor]

        D --> D1[并发连接]
        D --> D2[消息吞吐量]
        D --> D3[内存占用]
    end
```

### 9.2 运行 SDK 测试

```bash
cd sdk/python

# 安装测试依赖
pip install -r requirements-test.txt

# 运行测试
python -m pytest tests/ -v

# 带覆盖率
python -m pytest tests/ --cov=src --cov-report=html

# 指定测试文件
python -m pytest tests/test_event_client.py -v

# 运行示例测试
python examples/event_subscriber.py &
python examples/perimeter_guard.py &

# 清理后台进程
trap "kill %1 %2 2>/dev/null" EXIT
```

### 9.3 SDK 测试示例

```python
# sdk/python/tests/test_event_client.py
import pytest
from unittest.mock import Mock, patch
from hailo_ipc_sdk import EventClient

@pytest.fixture
def event_client():
    with patch('socket.socket') as mock_socket:
        mock_socket.return_value.connect.return_value = None
        mock_socket.return_value.recv.return_value = b'\x00\x00\x00\x00'

        client = EventClient()
        yield client

def test_event_client_connect(event_client):
    """测试事件客户端连接"""
    with patch.object(event_client, '_connect') as mock_connect:
        mock_connect.return_value = True

        result = event_client.connect()

        assert result is True
        mock_connect.assert_called_once()

def test_event_client_subscribe(event_client):
    """测试事件订阅"""
    with patch.object(event_client, 'subscribe') as mock_subscribe:
        mock_subscribe.return_value = Mock()

        thread = event_client.subscribe('test/topic', lambda e: None)

        assert thread is not None
        mock_subscribe.assert_called_once_with('test/topic', Mock())

def test_event_client_publish(event_client):
    """测试事件发布"""
    with patch.object(event_client, 'publish') as mock_publish:
        mock_publish.return_value = True

        result = event_client.publish('test/topic', {'message': 'hello'})

        assert result is True
        mock_publish.assert_called_once_with('test/topic', {'message': 'hello'})

def test_event_client_error_handling(event_client):
    """测试错误处理"""
    with patch.object(event_client, 'publish') as mock_publish:
        mock_publish.side_effect = Exception("Connection failed")

        with pytest.raises(Exception) as exc_info:
            event_client.publish('test/topic', {'message': 'hello'})

        assert str(exc_info.value) == "Connection failed"

def test_perimeter_guard_integration():
    """测试周界防护示例集成"""
    with patch('hailo_ipc_sdk.InferenceClient') as mock_inference, \
         patch('hailo_ipc_sdk.EventClient') as mock_events, \
         patch('hailo_ipc_sdk.DeviceClient') as mock_device:

        mock_inference.return_value.subscribe.return_value = iter([(1, Mock())])
        mock_events.return_value.publish.return_value = True
        mock_device.return_value.set_white_light.return_value = None

        from examples.perimeter_guard import PerimeterGuardApp

        app = PerimeterGuardApp()
        app.running = False
        app._process_frame(1, Mock())

        mock_device.return_value.set_white_light.assert_called_with(100)

def test_event_subscriber_scenario():
    """测试事件订阅者场景"""
    with patch('hailo_ipc_sdk.EventClient') as mock_events, \
         patch('hailo_ipc_sdk.DeviceClient') as mock_device:

        mock_event = Mock()
        mock_event.topic = 'model/cam0/detections'
        mock_event.payload = '{"objects": [{"label": "person", "score": 0.9}]}'
        mock_event.event_id = '123'

        mock_events.return_value.on_event.return_value = Mock()
        mock_device.return_value.set_white_light.return_value = None

        from examples.event_subscriber import EventSubscriberApp

        app = EventSubscriberApp()
        app.running = False
        app._on_detection(mock_event)

        mock_device.return_value.set_white_light.assert_called_with(80)
```

## 10 CI/CD 集成

### 10.1 GitHub Actions 工作流

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Go
      uses: actions/setup-go@v3
      with:
        go-version: '1.25'

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        make env-check

    - name: Run unit tests
      run: |
        make test-unit
        cd web/console && npm run test:unit
        cd sdk/python && python -m pytest tests/unit/ -v

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: unit-tests
        name: codecov-unit

  integration-tests:
    runs-on: ubuntu-latest

    needs: unit-tests

    steps:
    - uses: actions/checkout@v3

    - name: Setup environment
      run: |
        sudo mkdir -p /run/aipc
        sudo chmod 777 /run/aipc

    - name: Build services
      run: |
        make layer1
        make hal-v2 PLATFORM=stub

    - name: Start services
      run: |
        ./scripts/start_mvp.sh
        sleep 5

    - name: Run integration tests
      run: |
        ./scripts/test_mvp.sh
        ./scripts/test_all.sh
        cd web/console && npm run test:integration

    - name: Stop services
      run: |
        ./scripts/stop_mvp.sh

  e2e-tests:
    runs-on: ubuntu-latest

    needs: integration-tests

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install dependencies
      run: |
        cd web/console && npm install

    - name: Run E2E tests
      run: |
        cd web/console && npm run test:e2e

    - name: Upload screenshots
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: e2e-screenshots
        path: web/console/test-results/screenshots/

  performance-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup
      run: |
        make layer2
        make hal-v2 PLATFORM=stub

    - name: Run performance tests
      run: |
        ./scripts/test_hal_performance.sh
        ./scripts/test_service_benchmarks.sh

    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: test-results/performance/
```

### 10.2 多阶段构建策略

CI/CD 流水线按以下阶段顺序执行：

| 阶段 | 内容 | 依赖 |
|------|------|------|
| test:unit | Go 单元测试 + Web 单元测试 + Python 单元测试 | 无 |
| test:integration | 构建 Stub HAL，启动服务，运行集成测试 | unit 通过 |
| test:e2e | Playwright E2E 测试 | integration 通过 |
| test:performance | HAL 性能基准 + 服务性能基准 | 无 |

对应的多阶段配置：

```yaml
stages:
  - test:unit
  - test:integration
  - test:e2e
  - test:performance

variables:
  GO_VERSION: "1.25"
  NODE_VERSION: "20"
  PYTHON_VERSION: "3.9"

# 单元测试阶段
unit:
  stage: test:unit
  script:
    - make env-check
    - make test-unit
    - cd web/console && npm run test:unit
    - cd sdk/python && python -m pytest tests/ -v --cov=src

# 集成测试阶段
integration:
  stage: test:integration
  dependencies:
    - unit
  before_script:
    - sudo mkdir -p /run/aipc /tmp
    - sudo chmod 777 /run/aipc /tmp
  script:
    - make layer1
    - make hal-v2 PLATFORM=stub
    - ./scripts/start_mvp.sh
    - sleep 10
    - ./scripts/test_mvp.sh
    - ./scripts/test_all.sh
  after_script:
    - ./scripts/stop_mvp.sh

# 性能测试阶段
performance:
  stage: test:performance
  dependencies:
    - integration
  script:
    - ./scripts/test_hal_performance.sh
    - ./scripts/test_service_benchmarks.sh
    - ./scripts/test_memory_usage.sh
  artifacts:
    reports:
      performance: performance/*.json
```

## 11 测试报告与覆盖率

### 11.1 覆盖率目标

```mermaid
graph TB
    subgraph "覆盖率目标"
        A[核心模块] --> A1[90%+]
        B[业务逻辑] --> B1[85%+]
        C[错误处理] --> C1[80%+]
        D[测试用例] --> D1[必须存在]

        A1 --> E[平台服务]
        B1 --> E
        C1 --> E
        D1 --> E

        A1 --> F[HAL 模块]
        B1 --> F
        C1 --> F
        D1 --> F

        A1 --> G[Web 前端]
        B1 --> G
        C1 --> G
        D1 --> G
    end

    subgraph "覆盖类型"
        H[行覆盖率] --> I[已执行代码行]
        J[分支覆盖率] --> K[已覆盖条件分支]
        L[函数覆盖率] --> M[已覆盖函数调用]

        I --> N[核心指标]
        K --> N
        M --> N
    end
```

### 11.2 生成覆盖率报告

```bash
# Go 覆盖率
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# Python 覆盖率
cd sdk/python
python -m pytest tests/ --cov=src --cov-report=html --cov-report=xml

# 前端覆盖率
cd web/console
npm run test -- --coverage --coverage-reporters=html
```

### 11.3 覆盖率报告示例

```json
{
  "total_coverage": {
    "overall": 87.5,
    "by_module": {
      "platform/device-control": 92.3,
      "platform/event-bus": 89.1,
      "platform/app-manager": 85.7,
      "platform/ai-runtime": 83.2,
      "hal/stub": 90.5,
      "sdk/python": 86.8,
      "web/console": 88.9
    },
    "by_type": {
      "unit_tests": 89.2,
      "integration_tests": 78.5,
      "e2e_tests": 65.3
    }
  },
  "critical_functions": {
    "device_control/DeviceControl.GetStatus": {
      "coverage": 95.0,
      "branches": {
        "success": true,
        "error_handling": true
      }
    },
    "ai_runtime/AIRuntime.Infer": {
      "coverage": 88.0,
      "branches": {
        "model_loading": true,
        "inference_flow": true,
        "error_handling": false
      },
      "recommendations": [
        "Add test for model not found case",
        "Add test for timeout scenario"
      ]
    }
  },
  "areas_needing_attention": [
    {
      "module": "platform/device-control/handlers/lens.go",
      "coverage": 65.2,
      "functions": ["LensControl.Zoom", "LensControl.Focus"],
      "issue": "Missing error handling tests"
    },
    {
      "module": "web/console/src/components/DeviceList.tsx",
      "coverage": 72.8,
      "functions": ["DeviceList.render", "DeviceList.handleRefresh"],
      "issue": "Missing edge case tests"
    }
  ]
}
```

### 11.4 测试报告模板

| 测试类型 | 通过率 | 执行时间 | 主要问题 |
|---------|--------|---------|---------|
| 单元测试 | 98.5% | 3m 45s | 无 |
| 集成测试 | 95.2% | 12m 30s | 1 个超时 |
| MVP 验证 | 100% | 5m 20s | 无 |
| E2E 测试 | 92.8% | 25m 10s | 1 个 UI 故障 |
| 性能测试 | 通过 | 10m 00s | 无 |

**整体评估**：核心功能稳定，主要测试通过率 >95%。E2E 测试存在 UI 稳定性问题需要优化。

**完整报告模板：**

```markdown
# AIPC Platform Test Report

**Test Date**: 2024-01-15
**Test Version**: v1.11.0
**Test Environment**: Ubuntu 22.04, Go 1.25, Node 20, Python 3.9

## Detailed Results

### Unit Tests

    PASS: platform/device-control (45/46 tests, 97.8%)
    PASS: platform/event-bus (32/32 tests, 100%)
    PASS: platform/app-manager (28/29 tests, 96.6%)
    PASS: platform/ai-runtime (41/43 tests, 95.3%)

### Performance Tests

    HAL throughput: 30 FPS (target met)
    Service latency: <50ms (target met)
    Memory usage: Peak 256MB (target met)
    CPU usage: Average 45% (target met)

## Issue Tracking

| ID | Issue Description | Status | Priority | Assignee | Expected Fix |
|----|----------|------|--------|--------|----------|
| T-123 | E2E test: Login page occasional timeout | Fixed | High | Zhang | 2024-01-16 |
| T-124 | AI inference occasional timeout | Analyzing | Medium | Li | 2024-01-18 |
| T-125 | Python SDK connection timeout | Fixed | High | Wang | 2024-01-16 |

## Recommendations

1. **Increase stability testing**: Especially performance under concurrent scenarios
2. **Optimize UI tests**: Add retry mechanisms and wait strategies
3. **Performance monitoring**: Add continuous performance monitoring
4. **Documentation updates**: Update test instructions and best practices

## Next Steps

1. Fix discovered issues
2. Increase test coverage to 90%+
3. Establish automated testing workflow
4. Regular performance regression testing
```

### 11.5 测试最佳实践

1. **自动化优先**：所有测试应可自动运行，无需人工干预
2. **快速反馈**：单元测试应在数分钟内完成
3. **测试隔离**：测试之间相互独立，不共享状态
4. **断言明确**：每个测试用例有清晰的通过/失败标准
5. **性能基线**：建立性能基线，防止性能回归
6. **覆盖率追踪**：持续跟踪测试覆盖率，确保关键代码已测试
7. **文档同步**：为测试用例编写清晰的文档说明

## 相关文档

- [开发指南](./0-development-guide.md)
- [贡献指南](./1-contributing.md)
- [HAL 移植指南](./4-hal-porting.md)
- [故障排查](../6-advanced-reference/0-troubleshooting.md)
