## **Jetson Modules Brief**
The core modules supported by NG4500-CB01 include Orin Nano/NX, and the corresponding Super version. Jetson Orin series modules have different performance due to different configurations.
![Orin_Parameters_Comparation](/img/Orin_Parameters_Comparation.png)
The main differences between the modules are as follows:  

- Performance differentiations caused by different numbers of Cores.
- The variation of the CPU/GPU main frequency will has impact on the performance. 
- The capacity of DRAM and it's bandwidth will has impact on the data processing performance.
- DLA/PVA function modules: supports Orin NX 8G/16G, Orin Nano 4/8G(not supported).
- Power supply requirements: for example, Orin Nano only supports 5V power supply, and corresponding differences in power consumption and heat dissipation.
## Carrier Board Overview 
**Key features**:
- DC-Jack 12-36 V input
- 100M/1000M Ethernet ports x 2
- Type-A x 4 USB3.1+; Type-C x 1  USB3.2
- HDMI x 1
- Audio Input/Output 
- DI x 4  DO x 4 with isolation, RS232 x 1, RS485 x 1, 5V output
- M.2 Key M  x 2 for storage, Key B for Cellular, Key E for Wi-Fi/BLE
- Support RTC
- Camera Input Interfaces x 2 （4 Lanes MIPI）
- 14Pins FFC extendable I/Os    
 ## **Support Accessories Overview**
 ### Camera modules 
  Compatible with Raspberry Pi camera module, “Camera Module V2” and "HQ Camera" optional
- Camera Module V2: IMX219 4K resolution with fixed Lens

  - More Information: [Raspberry Pi Camera Module 2](https://www.raspberrypi.com/products/camera-module-v2/)

- HQ Camera:   MX477 12Mp resolution with CS-Mount Lens
  Sensor modules

  - More information: [Raspberry Pi High Quality Camera](https://www.raspberrypi.com/products/raspberry-pi-high-quality-camera/)

- It can connect to various external sensors through DI/DO, RS485, RS232, and GPIO.

  
 ### Expansion Modules
- 4G module：[4G Module](../../../Hardware%20Dev%20Resources/3-4G%20Module)
- 5G module：[5G Module](../../../Hardware%20Dev%20Resources/4-5G%20Module)
- Wi-Fi/BT module
 ### Mounts and Enclosures

  Users can customize own housing or fixing bracket based on the fixing holes of the Carrier Board.
