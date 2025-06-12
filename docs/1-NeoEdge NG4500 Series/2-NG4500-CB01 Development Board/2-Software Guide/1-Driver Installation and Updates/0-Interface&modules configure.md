# Interface

本节介绍 NG4500系列设备常用接口（GPIO/I2C/SPI/CAN/USB/UART）的驱动与控制方法，重点说明硬件资源分配、典型应用场景及基础操作指令。

## GPIO

详细引脚分配参考官方文档：：[Jetson Orin NX Series and Jetson Orin Nano Series Pinmux](https://developer.nvidia.com/downloads/jetson-orin-nx-and-orin-nano-series-pinmux-config-template)

- IO 扩展面板接口分配如下：

| Pin # | Signal Name    | Description                                       | Direction | Pin Type    |
| ----- | -------------- | ------------------------------------------------- | --------- | ----------- |
| 218   | GPIO12         | GPIO=Low/high when IN1=high（Open）/low(Short)      | Input     | dry contact |
|       |                | IN1_COM: COM pin                                  |           |             |
| 216   | GPIO11         | IN2: GPIO=Low/high when IN1=high（Open）/low(Short) | Input     | dry contact |
|       |                | IN2_COM: COM pin                                  |           |             |
| 206   | GPIO07         | IN3: GPIO=Low/high when IN1=high（Open）/low(Short) | Input     | dry contact |
|       |                | IN3_COM: COM pin                                  |           |             |
| 228   | GPIO13         | IN4: GPIO=Low/high when IN1=high（Open）/low(Short) | Input     | dry contact |
|       |                | IN4_COM: COM pin                                  |           |             |
| 199   | I2S0_SCLK_1V8  | OUT1: GPIO=Low for short, high for open           | Output    | dry contact |
|       |                | OUT1_COM: COM pin                                 |           |             |
| 197   | I2S0_LRCK_1V8  | OUT2: GPIO=Low for short, high for open           | Output    | dry contact |
|       |                | OUT2_COM: COM pin                                 |           |             |
| 195   | I2S0_SDIN_1V8  | OUT3: GPIO=Low for shor, high for open.           | Output    | dry contact |
|       |                | OUT3_COM: COM pin                                 |           |             |
| 193   | I2S0_SDOUT_1V8 | OUT4: GPIO=Low for short, high for open.          | Output    | dry contact |
|       |                | OUT4_COM: COM pin                                 |           |             |

**软件操作方法**

- 使用 `gpioinfo` 查询 GPIO 映射关系和状态：

![](/img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png)

- 使用 `gpioset` 控制 GPIO 输出：

```shell
# To set GPIO12 to HIGH
sudo gpioset --mode=wait gpiochip0 144=1
# To set GPIO12 to LOW
sudo gpioset --mode=wait gpiochip0 144=0 
```

## UART

**UART 实例与资源分配**

| Usage on Orin nano/NX | UART Instance | Base Address | Ball Name | Bus Name | DTS status | DTS alias |
| --------------------- | ------------- | ------------ | --------- | -------- | ---------- | --------- |
| Debug                 | UARTC         | 0x0c280000   | UART2     | ttyTCU0  | OK         | serial0   |
| RS485                 | UARTA         | 0x03100000   | UART1     | ttyTHS1  | OK         | serial1   |
| RS232                 | UARTB         | 0x03110000   | UART0     | ttyTHS3  | OK         | serial3   |

- Debug 串口（ttyTCU0）
  
  - **硬件连接**：将 Debug 线连接至 PC。
  
  - **串口参数**：波特率 115200，数据位 8，停止位 1，无奇偶校验，无流控。
  
  - **常用终端工具**：Windows 下可用 PuTTY、Xshell，Linux 下可用 minicom、screen。

- RS232 接口（ttyTHS3）
  
  - 硬件接口定义
  
  | Pin | Signal Name | Description                                    | Direction | Pin Type    |
  | --- | ----------- | ---------------------------------------------- | --------- | ----------- |
  | 99  | UART0_TXD   | Use for uart Ransmit (with 3.3 level shifter)  | Output    | CMOS – 1.8V |
  | 101 | UART0_RXD   | Use for uart  Receive (with 3.3 level shifter) | Input     | CMOS – 1.8V |
  
  - 连接说明
    
    - 使用接头1连接 PC，接头2连接 Jetson RS232 的 TX/RX。
    - 确保电平转换正确，避免损坏硬件。
  
  ![](/img/NG45XX_SOFTWARE/Driver/NG45XX_RS232.png)

- RS485 接口（ttyTHS1）
  
  - 硬件接口定义
  
  | Pin | Signal Name | Description       | Direction | Pin Type     |
  | --- | ----------- | ----------------- | --------- | ------------ |
  | 203 | UART1_TXD   | Use for RS_485    | Output    | CMOS    1.8V |
  | 205 | UART1_RXD   | Use for RS_485    | Input     | CMOS    1.8V |
  | 207 | UART1_RTS*  | RS_485 enable pin | Output    | CMOS    1.8V |
  
  - 依赖安装
  
  ```shell
  sudo apt-get update
  sudo apt-get install gpiod libgpiod-dev
  ```
  
  - 编译测试程序
  
  ```shell
  gcc -o rs485_test rs485_test.c -lgpiod
  ```
  
  - 运行示例
  
  ```shell
  sudo ./rs485_test [TTY_DIR] [DE_CHIP] [DE_LINE]
  # 运行
  sudo ./rs485_test /dev/ttyTHS1 /dev/gpiochip0 112
  ```
  
  - 功能说明
    - 启动后输入 `send` 切换到发送模式，输入内容后回车发送。
    - 输入 `recv` 切换到接收模式，显示串口接收内容。
    - 输入 `quit` 退出程序。

- 参考代码

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include <termios.h>
#include <gpiod.h>
#include <linux/serial.h>

#define BUFFER_SIZE 256
#define RS485_CONSUMER "RS485_program"

struct gpiod_chip *chip;
struct gpiod_line *rts_line;

void setup_gpio(char *gpio_chip, int gpio_line)
{
    int ret;

    chip = gpiod_chip_open(gpio_chip);
    if (!chip) {
        fprintf(stderr, "gpiod_chip_open");
        exit(EXIT_FAILURE);
    }

    rts_line = gpiod_chip_get_line(chip, gpio_line);
    if (!rts_line) {
        fprintf(stderr, "Failed to get GPIO line %d\n", gpio_line);
        gpiod_chip_close(chip);
        exit(EXIT_FAILURE);
    }

    ret = gpiod_line_request_output(rts_line, RS485_CONSUMER, 0);
    if (ret < 0) {
        fprintf(stderr, "Failed to request GPIO line as output: %s\n", strerror(-ret));
        gpiod_chip_close(chip);
        exit(EXIT_FAILURE);
    }
}

void set_rts_high() {
    gpiod_line_set_value(rts_line, 1);
    int value = gpiod_line_get_value(rts_line);
    printf("RTS set to HIGH, actual value: %d\n", value);
}

void set_rts_low() {
    gpiod_line_set_value(rts_line, 0);
    int value = gpiod_line_get_value(rts_line);
    printf("RTS set to LOW, actual value: %d\n", value);
}

int main(int argc, char* argv[]) {
    int tty_fd;
    char *tty_name;
    struct termios tty;
    char buffer[BUFFER_SIZE];
    ssize_t n;
    int ready;
    fd_set readfds;
    int rts_line_num;
    char *gpio_chip;
    int mode = 0;

    if (argc < 4) {
        printf("Usage: %s /dev/ttyTHS1 GPIO_CHIP(/dev/gpiochip*) RTS_LINE\n", argv[0]);
        return 1;
    }

    tty_name = argv[1];
    gpio_chip = argv[2];
    rts_line_num = atoi(argv[3]);

    setup_gpio(gpio_chip, rts_line_num);

    tty_fd = open(tty_name, O_RDWR | O_NOCTTY | O_NDELAY);
    if (tty_fd < 0) {
        perror("Unable to open serial port");
        return 1;
    }

    tcgetattr(tty_fd, &tty);
    cfmakeraw(&tty);
    cfsetispeed(&tty, B9600);
    cfsetospeed(&tty, B9600);
    tcsetattr(tty_fd, TCSANOW, &tty);

    printf("Serial port %s opened successfully, fd: %d\n", tty_name, tty_fd);

    while (1) {
        FD_ZERO(&readfds);
        FD_SET(tty_fd, &readfds);
        FD_SET(STDIN_FILENO, &readfds);

        ready = select(tty_fd + 1, &readfds, NULL, NULL, NULL);
        if (ready == -1) {
            perror("select");
            break;
        }

        if (FD_ISSET(tty_fd, &readfds)) {
            set_rts_low();
            n = read(tty_fd, buffer, BUFFER_SIZE - 1);
            if (n > 0) {
                buffer[n] = '\0';
                printf("Received: %s\n", buffer);
            }
        }

        if (FD_ISSET(STDIN_FILENO, &readfds)) {
            if (fgets(buffer, BUFFER_SIZE, stdin) != NULL) {
                buffer[strcspn(buffer, "\n")] = '\0';

                if (strcmp(buffer, "send") == 0) {
                    mode = 1;
                    printf("Switched to SEND mode\n");
                    continue;
                } else if (strcmp(buffer, "recv") == 0) {
                    mode = 0;
                    printf("Switched to RECEIVE mode\n");
                    continue;
                } else if (strcmp(buffer, "quit") == 0) {
                    break;
                }

                if (mode == 1) {
                    set_rts_high();
                    usleep(10000);
                    write(tty_fd, buffer, strlen(buffer));
                    tcdrain(tty_fd);
                    set_rts_low();
                } else {
                    printf("Invalid command in RECEIVE mode\n");
                }
            }
        }
    }

    close(tty_fd);
    gpiod_line_release(rts_line);
    gpiod_chip_close(chip);

    return 0;
}
```

## SPI

- 硬件接口分配

| Pin | Signal Name | Description                 | Direction | Pin Type    |
| --- | ----------- | --------------------------- | --------- | ----------- |
| 106 | SPI1_SCK    | SPI 1 Clock                 | Bidir     | CMOS – 3.3V |
| 108 | SPI1_MISO   | SPI 1 Master In / Slave Out | Bidir     | CMOS – 3.3V |
| 104 | SPI1_MOSI   | SPI 1 Master Out / Slave In | Bidir     | CMOS – 3.3V |
| 110 | SPI1_CS0*   | SPI 1 Chip Select 0         | Bidir     | CMOS – 3.3V |
| 112 | SPI1_CS1*   | SPI 1 Chip Select 1         | Bidir     | CMOS – 3.3V |

- **硬件连接**：短接 `MOSI` 和 `MISO`，用于回环测试。

- **SPI 使能与配置**
  
  - 运行指令，启动配置工具：` sudo python /opt/nvidia/jetson-io/jetson-io.py`
      ![](/img/NG45XX_SOFTWARE/NG45XX_40PIN_SPI1.png)
  
  - 选择 `Configure Jetson 40pin Header`
      ![](/img/NG45XX_SOFTWARE/NG45XX_40PIN_SPI2.png)
  
  - 选择 `Configure header pins manually`  
      ![](/img/NG45XX_SOFTWARE/NG45XX_40PIN_SPI3.png)
  
  - 按空格选择 SPI1 和 SPI3，启用 SPI
    
      ![](/img/NG45XX_SOFTWARE/NG45XX_40PIN_SPI4.png)
  
  - 返回并选择 `Save and reboot to reconfigure pins`，重启后生效
      ![](/img/NG45XX_SOFTWARE/NG45XX_40PIN_SPI5.png)

- 测试方法，参考如下：

```shell
# 获取spi源码
git clone https://github.com/rm-hull/spidev-test
cd spidev-test/
gcc spidev_test.c -o spidev_test

# 测试
./spidev_test -v -D /dev/spidev0.0 -p "Test"
```

## CAN

- 硬件接口分配

| Pin | Signal Name | Description     | Direction | Pin Type    |
| --- | ----------- | --------------- | --------- | ----------- |
| 145 | CAN_TX      | FD CAN Transmit | Output    | CMOS – 3.3V |
| 143 | CAN_RX      | FD CAN Receive  | Input     | CMOS – 3.3V |

- **硬件连接**：两台设备 CAN 的 D+ 对 D+，D- 对 D-。

**软件安装与测试**

- 安装`can-utils`工具

```shell
sudo apt update
sudo apt-get install can-utils
```

- 测试方法，参考如下：

```shell
# 查看接口状态
ip link show can0

# 配置接口，设置波特率为 100kbps
sudo ip link set can0 up type can bitrate 100000

# 监听数据
candump can0

# 发送数据
cansend can0 123#11.22.33.44
```

## RTC

基本使用操作

- 设置 RTC 时间

```shell
sudo hwclock --set --date="2000-01-01 12:00:00"
```

- 查询RTC时间

```shell
sudo hwclock -r
```

- 系统时间与 RTC 同步

```shell
# 系统时间 → RTC
sudo hwclock --systohc

# RTC → 系统时间
sudo hwclock --hctosys
```

- 查询系统时间

```shell
date
```

- 网络时钟同步

```shell
# 如无法设置RTC，需要确认是否打开了NTP服务
# 禁用NTP服务
sudo systemctl stop systemd-timesyncd.service
sudo timedatectl set-ntp false
```

## Camera

- 启动和配置摄像头模块的方法，以`imx219`为例，硬件连接如下：
  
  ![](/img/NG45XX_SOFTWARE/NG45XX_IMX219.png)

- 通过config-by-hardware.py软件启动摄像头，重启后生效

```shell
# 列出当前支持的硬件模块
sudo python /opt/nvidia/jetson-io/config-by-hardware.py -l
#输出如下：
Header 1 [default]: Jetson 40pin Header
  Available hardware modules:
  1. Adafruit SPH0645LM4H
  2. Adafruit UDA1334A
  3. FE-PI Audio V1 and Z V2
  4. ReSpeaker 4 Mic Array
  5. ReSpeaker 4 Mic Linear Array
Header 2: Jetson 24pin CSI Connector
  Available hardware modules:
  1. Camera IMX219 Dual
  2. Camera IMX219 Dual CamThink
  3. Camera IMX219-A
  4. Camera IMX219-A and IMX477-C
  5. Camera IMX219-C
  6. Camera IMX477 Dual
  7. Camera IMX477 Dual 4 lane
  8. Camera IMX477-A
  9. Camera IMX477-A and IMX219-C
  10. Camera IMX477-C
Header 3: Jetson M.2 Key E Slot
  No hardware configurations found!

# 选择并配置 IMX219 Dual CamThink 摄像头模块。 
# -n 选择Header编号，Camera IMX219 Dual CamThink 是dtbo的overlay-name
sudo python /opt/nvidia/jetson-io/config-by-hardware.py -n 2='Camera IMX219 Dual CamThink'
```

- 接入鼠标键盘，启动终端，运行以下指令：

```shell
sudo apt update
sudo apt install -y nvidia-l4t-gstreamer nvidia-l4t-jetson-multimedia-api

# 启动摄像头
nvgstcapture-1.0    
```
