---
description: NE100-MB01 开发板硬件连接指南,详细介绍主板接口定义、GPIO 引脚配置、外设电源控制、PIR 传感器连接、16Pin 扩展接口及通信模块引脚定义。
keywords: [NE100-MB01, 硬件连接, GPIO, 引脚定义, 接口说明, PIR 传感器, 扩展接口, UART, I2C, SPI]
tags: [硬件指南, NE100-MB01, 接口定义, GPIO 配置, 传感器连接]
---

# Hardware Connection

> 接线前请以 PCBA 标注确认硬件版本。下表中标有适用版本的引脚只可按对应版本使用。

## **主板接口概览**

### 顶层接口:

- Type-C 接口(用于 UART 和供电)
- MicroSD 卡槽
- Reset 按键
- 无线模块连接器
- Snap 按键
- 调试用 UART 接口
- USB 摄像头接口
- LED 板连接器
- FPC摄像头模块接口  
![NE10X_Top_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Top_IO_Marker.png)

### 底层接口:

- 电源输入接口
- 报警输入接口
- PIR 输入接口
- 扩展 GPIO 接口(包括 UART、I2C、SPI、电源输出)
- Boot 按键  
![NE10X_Bot_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Bot_IO_Marker.png)

## **开发套件快速入门指南**

- 开箱后,检查主板和配件确保完好无损。
- 将摄像头模块(OV5640 模块或 USB 模块)连接到主板。
- 将通信模块(Cat-1 或 WiFi-Halow)安装到主板(可选)。
- 通过 Type-C 或 4Pin Wafer 连接器连接调试 UART 接口。
- 通过 Type-C 接口或电源连接器供电。
- 完成以上步骤后,即可开始相关调试工作。

 **程序下载和调试请参考**:[AI Camera 系统烧录](../2-software-guide/1-system-flashing-and-initialization.md)

## **接口说明**

### 外设电源控制

在使用相机、ISP、补光灯、光传感器或电池电量检测前，先按主板版本置高对应的供电控制 GPIO。使用 TF 卡前也必须先开启 TF 卡供电。V2.0 的 TF 卡供电与 Cat-1/HaLow 模组供电使能共用 GPIO48，不能只按旧版的 TF 卡逻辑处理。

| 用途 | GPIO | 适用硬件版本 | 接线或软件控制注意事项 |
| --- | --- | --- | --- |
| 相机、补光和电池检测的供电控制 | CAM_PWR / GPIO3 | V1.0、V1.1、V1.2 | V2.0 不使用此 GPIO 供电控制。 |
| 相机、补光和电池检测的供电控制 | CAM_PWR / GPIO42 | V2.0 | 替代 V1.x 的 GPIO3 控制。 |
| TF 卡供电控制 | TF_PWR / GPIO42 | V1.0、V1.1、V1.2 | V2.0 不使用此 GPIO 作为 TF 卡供电控制。 |
| TF 卡供电控制 | TF_PWR_ON / GPIO48 | V2.0 | 与 Cat-1/HaLow 模组供电使能共用；启用 TF 卡时需同时评估模组供电状态。 |


### USB 摄像头接口
| 引脚号 | 引脚名称 | 功能             | 说明                  |
| --- | ---- | -------------- | ------------------- |
| 1   | VDD  | 电源供电           | 最大电流 500mA          |
| 2   | GND  | 地              | 与信号地共用              |
| 3   | DM   | USB 差分信号(-)    | 需符合 USB2.0 规范      |
| 4   | DP   | USB 差分信号(+)    | 需符合 USB2.0 规范      |

### PIR GPIO 定义

PIR 接口仅在 V1.1、V1.2 和 V2.0 支持。V1.0 没有该接口。J21 的针脚定义以原理图网络名为准：


| 引脚号 | 引脚名称 | 功能 | 引脚类型 | 上拉/下拉 | 复用功能 | 适用硬件版本 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 3V3_PIR | PIR 3.3V 供电 | S | | — | V1.1、V1.2、V2.0 |
| 2 | GND | 地 | S | | — | V1.1、V1.2、V2.0 |
| 3 | SDIO_IRQ(INT) | 中断/复用信号 | I/O | | GPIO41；与 TF/HaLow 使用冲突 | V1.1、V1.2、V2.0 |
| 4 | ALA_IN | 报警输入 | I | | GPIO2 | V1.1、V1.2、V2.0 |

### RTC（仅 V2.0）

V1.0、V1.1 和 V1.2 没有板载 RTC。V2.0 的 RTC 与摄像头共用 I2C 总线；若软件同时访问两者，须按同一总线配置处理。

| RTC 信号 | GPIO | 适用硬件版本 | 说明 |
| --- | --- | --- | --- |
| RTC 中断 | GPIO3 | V2.0 | V2.0 中 GPIO3 不再用于相机、补光或电池检测的供电控制。 |
| I2C_SDA | GPIO4 | V2.0 | 与 FPC 摄像头模块的 I2C_SDA 共用。 |
| I2C_SCL | GPIO5 | V2.0 | 与 FPC 摄像头模块的 I2C_SCL 共用。 |


### 扩展 GPIO 接口(16Pin)

16 针扩展排针提供 uart、I2C、SPI 和 GPIO 等通信接口。开发者可以使用这些接口扩展传感器模块,如 PIR 传感器、OLED 模块等。

> 该表仅描述物理针脚与信号网络。针脚是否可用取决于硬件版本以及 TF、Cat-1、HaLow 和 USB 的当前配置；不得将表中任一复用 GPIO 视为所有版本均可用。


| 引脚号 | 引脚名称     | 功能       | 引脚类型  | 上拉/下拉  | 复用功能            |
| --- | -------- | -------- | ----- | ------ | --------------- |
| 1   | TXD0     | Uart0 TX | I/O/T | PU 10K | GPIO43          |
| 2   | GND      | 地        | S     |        |                 |
| 3   | RXD0     | Uart0 RX | I/O/T | PU 10K | GPIO44          |
| 4   | GND      | 地        | S     |        |                 |
| 5   | GPIO     | GPIO41   | I/O/T |        |                 |
| 6   | 5V0      | 5V0 输入   | S     |        |                 |
| 7   | SPI_MISO | SPI_MISO | I/O/T |        | GPIO40          |
| 8   | 3V3      | 3V3 输出   | S     |        |                 |
| 9   | SPI_CLK  | SPI_CLK  | I/O/T |        | GPIO39          |
| 10  | Alarm_IN | 报警输入     | I     |        | GPIO2,ADC1_CH1  |
| 11  | SPI_MOSI | SPI_MOSI | I/O/T |        | GPIO38          |
| 12  | SPI_CS   | SPI_CS   | I/O/T |        | GPIO45          |
| 13  | GPIO     | GPIO19   | I/O/T |        | USB_D-,ADC2_CH8 |
| 14  | GPIO     | GPIO48   | I/O/T |        |                 |
| 15  | GPIO     | GPIO20   | I/O/T |        | USB_D+,ADC2_CH9 |
| 16  | GPIO     | GPIO46   | I/O/T |        |                 |


### FPC摄像头模块接口

摄像头模块 OV5640 支持 8 位并行输入接口。主板 IO 配置如下:


| 引脚号 | 引脚名称      | 功能     | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | --------- | ------ | ---- | ------ | ----------- |
| 1   | Null      |        |      |        |             |
| 2   | GND       | 地      | S    |        |             |
| 3   | I2C_SDA   | I2C_数据 | I/O  | PU 4K7 | GPIO4       |
| 4   | AVDD      | 2.8V   | S    |        |             |
| 5   | I2C_SCL   | I2C_时钟 | O    | PU 4K7 | GPIO5       |
| 6   | CAM_RST   | 复位#低   |      |        | RC 电路       |
| 7   | CSI_VSYNC | V同步    | I    |        | GPIO6       |
| 8   | CSI_PWDN  |        |      | PD 1K  |             |
| 9   | CSI_HSYNC | H同步    | I    |        | GPIO7       |
| 10  | DVDD      | 1V2    | S    |        |             |
| 11  | DOVDD     | 2V8    | S    |        |             |
| 12  | CSI_D7    | 数据位7   | I    |        | GPIO16      |
| 13  | CSI_MCLK  | 时钟输出   | O    |        | GPIO15      |
| 14  | CSI_D6    | 数据位6   | I    |        | GPIO17      |
| 15  | GND       | 地      | S    |        |             |
| 16  | CSI_D5    | 数据位5   | I    |        | GPIO18      |
| 17  | CSI_PCLK  | 像素时钟   | I    |        | GPIO13      |
| 18  | CSI_D4    | 数据位4   | I    |        | GPIO12      |
| 19  | CSI_D0    | 数据位0   | I    |        | GPIO11      |
| 20  | CSI_D3    | 数据位3   | I    |        | GPIO10      |
| 21  | CSI_D1    | 数据位1   | I    |        | GPIO9       |
| 22  | CSI_D2    | 数据位2   | I    |        | GPIO8       |
| 23  | Null      |        |      |        |             |
| 24  | Null      |        |      |        |             |


> 注意: 使用前请按本页的外设电源控制表置高对应版本的相机供电控制 GPIO。

### 闪光灯和光传感器 IO


| 引脚号 | 引脚名称           | 功能       | 引脚类型 | 上拉/下拉   | ESP32-S3 引脚 |
| --- | -------------- | -------- | ---- | ------- | ----------- |
| 24  | FLASH_LED      | LEDC_PWM | O    | PD 100K | GPIO47      |
| 39  | LIGHT_RESISTOR | ADC      | A    |         | GPIO1       |


> 注意: 1. 使用前请按本页的外设电源控制表置高对应版本的相机/补光供电控制 GPIO；2. 光照强度 0% 到 100% 对应输出电压 0 到 2.5V。

### TF 卡 IO


| 引脚号 | 引脚名称 | 功能       | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | ---- | -------- | ---- | ------ | ----------- |
| 31  | CMD  | SDIO_CMD | O    | PU 10K | GPIO38      |
| 32  | CLK  | SDIO_CLK | O    | PU 10K | GPIO39      |
| 33  | DAT0 | SDIO_DA0 | I    | PU 10K | GPIO40      |
| 34  | CD   | SDIO_IRQ | I    | PU 1M  | GPIO41      |


> 注意: 1. 使用前请按本页的外设电源控制表置高对应版本的 TF 卡供电控制 GPIO；2. 请使用 MMC 1 位模式协议驱动；3. 由于 GPIO38–GPIO41 和 GPIO45 的复用关系，不能与冲突的 WiFi-Halow 或 4G Cat-1 配置同时使用。

### 其他 IO


| 引脚号 | 引脚名称    | 功能     | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | ------- | ------ | ---- | ------ | ----------- |
| 23  | CFG_KEY | IRQ_IN | I    | PU 10K | GPIO21      |
| 22  | BAT_DET | ADC    | A    |        | GPIO14      |


> 注意: 1. 启用电池电量检测前，请按本页的外设电源控制表置高对应版本的供电控制 GPIO；2. 电池电量 0% 到 100% 对应电压范围 1.8 到 3V。

### 通信模块排针定义

通信模块安装在 J11 和 J15 排针上。J11 16 针排针提供相关信号。J15 12 针排针仅用于物理支撑。  
请注意,由于 IO 资源不足,IO 配置与某些 IO 存在冲突

### 16 针扩展排针

详细信息请参考对照表。


| 引脚号 | 引脚名称       | 功能       | 引脚类型  | 上拉/下拉 | ESP32-S3 引脚            |
| --- | ---------- | -------- | ----- | ----- | ---------------------- |
| 1   | VCC_IN     | 电源输出     | S     |       |                        |
| 2   | 3V3        | 3V3 输出   | S     |       |                        |
| 3   | VCC_IN     | 电源输出     | S     |       |                        |
| 4   | 3V3        | 3V3 输出   | S     |       |                        |
| 5   | WIFI_PWR_H | 电源使能     | I/O/T |       | GPIO48                 |
| 6   | GND        |          | GND   |       |                        |
| 7   | SPI_MOSI   | SPI_MOSI | I/O/T |       | GPIO38                 |
| 8   | SPI_MISO   | SPI_MISO | I/O/T |       | GPIO40                 |
| 9   | SPI_CS     | SPI_CS   | I/O/T |       | GPIO45                 |
| 10  | SPI_CS     | SPI_CS   | I/O/T |       | GPIO45                 |
| 11  | WIFI_BUSY  | 状态       | I/O/T |       | GPIO20,USB_D+,ADC2_CH9 |
| 12  | IRQ        | 中断       | I/O/T |       | GPIO41                 |
| 13  | GND        |          | GND   |       |                        |
| 14  | WIFI_WAKE  | 唤醒       | I/O/T |       | GPIO19,USB_D-,ADC2_CH8 |
| 15  | SPI_CLK    | SPI_CLK  | I/O/T |       | GPIO39                 |
| 16  | WIFI_RST   | 复位#低     | I/O/T |       | GPIO46                 |


### IO 冲突表

不要在已经被当前通信模块、TF 卡、USB 或 PIR 配置占用的 GPIO 上再连接外设。下表按原理图中的配置列出占用网络；“—”只表示该配置没有给 GPIO 分配用途，不表示该 GPIO 可安全用于其他外设。

| ESP32-S3 GPIO | 仅 WiFi | WiFi + Cat-1 + UART | WiFi + Cat-1 + USB | HaLow WiFi |
| --- | --- | --- | --- | --- |
| GPIO19 | — | — | USB_D− | WIFI_WAKE |
| GPIO20 | — | — | USB_D+ | WIFI_RST |
| GPIO46 | — | Cat-1 通信（TX） | USB_VBUS | WIFI_BUSY |
| GPIO48 | — | CAT1_PWR_H | CAT1_PWR_H | WIFI_PWR_H |
| GPIO41 | TFCARD_DET | — | — | SDIO_IRQ(INT) |
| GPIO40 | SDIO_DA0（TF） | — | — | SDIO_DA0（MISO） |
| GPIO39 | SDIO_CLK（TF） | — | — | SDIO_CLK（CLK） |
| GPIO38 | SDIO_CMD（TF） | — | — | SDIO_CMD（MOSI） |
| GPIO45 | — | Cat-1 通信（RX） | — | SDIO_DA3（CS） |
| GPIO2 | 报警输入 | 报警输入 | 报警输入 | 报警输入 |
| TXD0 / RXD0 | 系统烧录串口 | 系统烧录串口 | 系统烧录串口 | 系统烧录串口 |
