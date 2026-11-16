---
description: Step-by-step guide for NE301 system flashing. Learn to flash apps, web interfaces, and AI models to STM32N6 and STM32U0 using ST-Link and CLI tools.
keywords: [NE301 Flashing, STM32N6, STM32U0, System Initialization, ST-Link V2, Firmware Download, STM32CubeProgrammer, WakeCore, AI Model Flashing]
tags: [NE301, System Flashing, Firmware Update, ST-Link, STM32N6]
---

## Hardware Connections

### Prerequisites

- NE301 main board × 1
- ST-Link V2 × 1
- **4-pin 1.25 mm JST (male) → 2.54 mm Dupont (female)** cable for STM32N6 flashing
- **3-pin 2.54 mm Dupont (female-female)** cable for STM32U0 flashing
- USB Type-C cable compatible with your PC port (Type-A host requires a C→A cable)

---
The mainboard contains two MCUs： **stm32n6** and **stm32u0**
#### Ready for Flashing `apps`, `web`, or `models` to **stm32n6**

1. Toggle DIP switch **#2** to ON to enter flashing mode. After flashing, switch it back and power-cycle (or press **Reset**) to boot into runtime mode.

   <p align="center">
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/system-flashing-and-initialization/flash-mode.png" alt="DIP switch for flashing" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
   </p>
2. Use the **4-pin adapter cable** to connect the **ST-Link** to the board's **DEBUG** header, then plug ST-Link into the PC.

   <p align="center">
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/system-flashing-and-initialization/st-link.png" alt="ST-Link wiring" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
   </p>
3. Connect the board to the PC or a power adapter via USB Type-C.

   <p align="center">
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/system-flashing-and-initialization/type-c.png" alt="Type-C power" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
   </p>

   The on-board **DEBUG LED stays solid** to indicate flashing mode.

---

#### Ready for Flashing `wakecore` to **stm32u0**

1. Use the **3-pin Dupont cable** to connect the **ST-Link** directly to the **STM32U0** header, then attach ST-Link to the PC.

   <p align="center">
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/system-flashing-and-initialization/u0.png" alt="STM32U0 wiring" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
   </p>
2. Connect the board to the PC or power adapter via USB Type-C.

   <p align="center">
     <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/software-guide/system-flashing-and-initialization/connect.png" alt="Power connection" style={{width:'100%', maxWidth:'520px', borderRadius:'8px'}} />
   </p>

### Download Firmwares

1. Fetech firmwares from [Github](https://github.com/camthink-ai/ne301/tree/main/bin)

2. Files List
```bash
  ne301_FSBL_signed.bin       --> use for stm32n6 FSBL        --> flash addr 0x70000000
  ne301_App_signed_pkg.bin    --> use for stm32n6 App         --> flash addr 0x70100000
  ne301_Web_pkg.bin           --> use for web gui             --> flash addr 0x70400000
  ne301_Model_pkg.bin         --> use for AI model            --> flash addr 0x70900000
  ne301_WakeCore.bin          --> use for stm32u0 wakecore    --> flash addr 0x08000000
```

### Flashing
**Flash tools supported**
- STM32CubeProgrammer
![GUI](https://www.st.com/content/ccc/fragment/product_related/rpn_information/product_circuit_diagram/group3/0c/26/bb/21/a5/eb/4a/c7/stm32cubeprog_image/files/stm32cubeprog_image.jpg/jcr:content/translations/en.stm32cubeprog_image.jpg)

> **Note**: Use STM32CubeProgrammer v2.19.0; the latest version may cause flashing failures.

or CLI
```bash
export DKEL="<STM32CubeProgrammer_N6 Install Folder>/bin/ExternalLoader/MX66UW1G45G_STM32N6570-DK.stldr"
STM32_Programmer_CLI -c port=SWD mode=HOTPLUG -el $DKEL -hardRst -w <bin-name>  <flash-addr>
```

- Script/maker.sh

```bash
Script/maker.sh flash <bin-name> <flash-addr>
```
- make

```bash
# Flash all components
make flash
# Flash specific component
make flash-fsbl
make flash-app
make flash-web
make flash-model
make flash-wakecore
```

## Troubleshooting

If you cannot find the NE301 WiFi AP after successful flashing, it might be due to missing WiFi firmware. Please refer to [WiFi Firmware Flashing Guide](3-wifi-firmware-flashing.md) for details.
