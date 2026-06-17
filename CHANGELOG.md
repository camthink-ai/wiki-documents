[中文版](./CHANGELOG_CN.md)

# Changelog

All notable changes to the CamThink Wiki documentation will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

> This changelog reflects updates starting from **2025-12-23**. Major changes prior to this date are not recorded.

## [2026-06-16]

### Added
- **NeoMind Documentation Phase 1 — Developer Guide Expansion**: New developer-facing pages — AI-assisted development, device-type development, dashboard component development, and contributing guide — with real code patterns drawn from production extensions (full bilingual support).
- **NeoMind on Homepage**: Added NeoMind as the 4th slide in the ProductCarousel (with NEW badge), with 4 entry links (product overview / quick-start / user-guide / developer-guide) and English translations in i18n/en/code.json.

### Updated
- **NeoMind Documentation Phase 1 — Content Enrichment**: Full rewrite of the user guide sections (extensions, notifications, automation-rules, data-push, data-transforms) with real screenshots and troubleshooting steps. Refreshed examples and corrected technical details across concepts / product-overview / quick-start / use-cases — including the crash-loop threshold (50s window, 3 retries) and removal of obsolete version strings. ZH/EN parity maintained across all 24 changed docs.
- **NeoMind Image Migration**: All 102 NeoMind images moved to `https://resources.camthink.ai/NeoMind/`. The local `static/img/neomind/` folder was removed; 136 image references across 24 docs now use remote URLs (full bilingual support).

## [2026-06-17]

### Added
- **Homepage Hero Redesign**: Replaced the hero background with a new product-matrix visual showcasing the full CamThink Edge AI stack (NG4500, NE503, NE301, NE101 + NeoMind/AI ToolStack software). Hero text styling is now theme-independent — white title with dark halo, white subtitle, opaque white pill badge with orange accent, and a translucent dark GitHub Star button with backdrop blur for consistent contrast across light/dark modes.
- **First-Visit English Redirect**: Added a client-side `Root` theme override (`src/theme/Root.tsx`) that redirects first-time visitors from the Chinese default locale to `/en/...` and remembers the user's locale choice in `localStorage`. The site default locale remains `zh-Hans`, so existing Chinese URLs, external bookmarks, and SEO indexing are preserved.

### Changed
- **Architecture Diagram Interactivity**: NeoMind and AI ToolStack cards in the platform layer are now clickable links — NeoMind jumps to its product overview, AI ToolStack jumps to the NE301 AI ToolStack application guide. Removed the left accent bar; cards keep the rounded-corner elevated style with hover lift. Underlines suppressed on all link states.
- **Platform Layer Card Styling**: 14px rounded corners, title prefix dot accent, chips restyled as pill shapes with solid-theme-color hover state.
- **Footer**: Forced pure-black background (`#000`) overriding the default Docusaurus dark style in both themes; removed the redundant `Home` link from the Wiki column.
- **Homepage Copy**: "应用工具及平台" → "应用配套" (English: "Application Tools & Platform" → "Application Suite"); dropped trailing period from the hero subtitle (both locales).

### Fixed
- **Icon Set**: Replaced malformed SVG icons with standard Lucide paths — application layer (Building / Sprout / ScanLine / Shapes for 智能楼宇 / 智慧农业 / 视觉分析 / 其它领域), icon library (`Hardware` → server chassis, `Connectivity` → Wi-Fi arcs, `Overview` → file icon), and carousel resource links (`Quickstart` → rocket, `DevGuide` → code brackets `<>`).

### Updated
- **NeoEyes NE503 System Flashing**: Restructured for operator readability — added a flow overview with path selection, a DIP-switch quick-reference table, and per-subsection service-scope labels in §1; deduplicated the §3.3/§5.1 U-Boot flow and reordered §7 troubleshooting to match the actual operation sequence; promoted macOS to a first-class supported platform alongside Ubuntu in §1.2; migrated all 18 screenshots to CDN; streamlined the §2.3 SPI-flash log presentation with side-by-side screenshots (full bilingual support).

## [2026-06-08]

### Added
- **NeoEyes NE503 Complete Technical Documentation**: Full platform documentation covering software platform (architecture, app development, SDK reference, SDK examples, CLI guide, RESTful API), service reference (AI Runtime, App Manager, Event Bus, Media Streaming, Device Control, Device Discovery, Web Console), platform development (development guide, contributing, test environment, deployment, HAL porting), and advanced reference (troubleshooting, config reference, FAQ, benchmarks), with comprehensive quality review against source code and device verification (full bilingual support).

## [2026-06-02]

### Updated
- **NE301 Verified Models**: Added YOLOv8n Pose int8 quantized model (`_ui`) and YOLOv8n Seg instance segmentation model (`_ui`), new instance segmentation category with pixel-level mask output (full bilingual support).

## [2026-05-28]

### Added
- **NeoEyes NE503 Hardware Guide**: Complete hardware interface documentation covering core processing board (Hailo15H) and AI-PC interface board (STM32G0B0RET6) pin definitions, chip specifications, and hardware block diagram (full bilingual support).

### Updated
- **NE301 Verified Models**: Updated verified model list with new test results, added meter reading detection model, fixed table formatting, and revised deployment instructions (full bilingual support).

## [2026-05-08]

### Added
- **NeoEyes NE503 Quick Start Guide**: Step-by-step deployment guide covering device installation, first-time connection and configuration, camera verification, AI application deployment (NX Witness example), AI model management, system integration, device management, and maintenance (full bilingual support).

## [2026-05-07]

### Added
- **NeoEyes NE503 Product Overview**: Edge AI smart camera documentation based on Hailo-15H SoC with 20 TOPS NPU, covering specifications, AI inference pipeline, imaging system, hardware architecture, software stack, and application scenarios for smart security, industrial inspection, and AIoT (full bilingual support).

## [2026-04-23]

### Added
- **Face Recognition Solution**: NeoMind Face Recognition plugin for face detection and identity recognition, covering plugin installation, dashboard configuration, face registration, recognition testing, history review, and AI Chat natural language queries, supporting NE101/NE301 smart cameras (full bilingual support).

## [2026-04-22]

### Added
- **NE101 WiFi HaLow Solution**: HaLowLink gateway setup, WiFi HaLow network configuration, MQTT image data integration, and platform verification (full bilingual support).

## [2026-04-21]

### Added
- **Hardware Revision History**: Main board PCB revision records for NE101 (V1.0–V2.0), NE301 (V1.0–V1.3), and NG4500 (V1.0–V1.1) (full bilingual support).

### Changed
- **Firmware Release Notes**: Restructured page, added Arduino Camera Web Server user case for NE101, corrected AWS S3 case product mapping (full bilingual support).

## [2026-04-20]

### Added
- **Release Notes**: New "What's new" page consolidating firmware release history, download resources, and user development cases across all CamThink product lines (NE101, NE301, NeoMind), with links to GitHub Release pages and source code downloads (full bilingual support).

### Improved
- **4G Cat.1 Module**: Upgraded communication interface from UART to USB, transfer rate improved from 0.5 Mbps to 2.5-3.17 Mbps for video transmission support, with legacy UART pinout preserved (full bilingual support).

## [2026-04-17]

### Added
- **OCR Solution**: NeoMind OCR plugin for general text recognition from images, covering plugin installation, dashboard configuration, trigger testing, and AI Chat natural language queries, supporting NE101/NE301 (full bilingual support).

## [2026-04-16]

### Added
- **AI Agent and Extensions Solutions**: YOLO Inference plugin (edge ONNX detection) and AI Agent (LLM-powered analysis) for person/object detection with notification push on NeoMind, supporting NE101/NE301 smart cameras (full bilingual support).

## [2026-04-13]

### Added
- **NE101/NE301 Solar Power Solution**: Solar panel + 7AH battery kit for unlimited 24/7 continuous capture, covering BOM, hardware connection, power consumption analysis, and high-frequency capture scenarios (full bilingual support).

## [2026-04-10]

### Changed
- **NE301 Product Overview**: Restructured document, streamlined intro, refined 8 core capabilities, merged installation & deployment sections, optimized image layout, fixed broken image paths (bilingual).

## [2026-04-08]

### Added
- **NE301 PoE Quick Start Guide**: Added a quick start guide for the NE301 PoE version, covering PoE module hardware introduction and core interfaces (PoE/Type-C/Alarm/RS485), power requirements, hardware connection, Web UI login, PoE network management (status check, IP configuration), typical application scenarios, and troubleshooting (full bilingual support).
- **Hardware Dev Resources — 9 Sensor/Component Docs**: Added PIR sensor, mmWave radar, ToF laser, thermal array, temperature-humidity sensor, accelerometer-gyroscope, microphone, display screen, and speaker documentation with product overview, specifications, pin definitions, and NE301 application scenarios (full bilingual support).

### Changed
- **Hardware Dev Resources**: Renumbered all 21 documents for logical sidebar ordering and updated English translations to match.

### Fixed
- **Display Screen**: Fixed third image URL missing `display-screen/` path segment causing 404.
- **NG4500 Components Overview**: Fixed broken 4G/5G module links after document renumbering.
- **AI Tool Stack Guide**: Fixed broken anchor link (case-sensitive heading ID).
- **ToF Laser / Temperature-Humidity Sensor**: Escaped `<` and `>` characters in MDX tables.
- **Serial Communication Module**: Fixed CP2101→CP2102 typo in keywords.

## [2026-04-07]

### Added
- **Battery Selection Guide**: Added a comprehensive battery selection guide for NE101/NE301, covering battery fundamentals (types, parameters, internal resistance), device compatibility, discharge requirements across communication modes (WiFi, Cat-1, WiFi HaLow), and selection recommendations by use case and environment (full bilingual support).

## [2026-04-02]

### Added
- **NE301 PIR Sensor Integration Guide**: Added a PIR motion sensor integration guide for NE301, covering hardware connection, PIR parameter configuration, MQTT data forwarding, NeoMind platform integration, and troubleshooting (full bilingual support).

## [2026-03-31]

### Added
- **NE300-MB01 Sensor Extension Board**: Added a sensor extension board guide covering quick validation of temperature/humidity, ambient light, 6-axis IMU, ToF ranging, laser ranging, and IR thermal imaging sensors, plus TFT display data viewing.

## [2026-03-30]

### Added
- **NE301 RTMP Streaming Guide**: Added a complete RTMP video streaming tutorial for NE301, covering Nginx-RTMP server setup, NE301 stream configuration, VLC playback verification, and recording management (full bilingual support).

## [2026-03-25]

### Added
- **NeoMind Quick Start Guide**: Published NeoMind Quick Start Guide (full bilingual support), covering installation, device management, dashboard, AI chat, and plugins.


## [2026-03-23]

### Added
- **NE301 Series**: Added comprehensive "NE301 Battery Life Info" documentation with detailed power consumption analysis for WiFi and Cat-1 modes, battery life calculation formulas, temperature impact tables, and real-world application cases (full bilingual support).
- **Automation**: Implemented automated image upload script with delay functionality for batch processing and image optimization.

## [2026-03-11]

### Fixed
- **Model Support**: Fixed several known issues related to the built-in YOLO vision models.

## [2026-03-10]

### Added
- **Docs**: Added detailed operational guidelines and images for NE301 integration in the AI Tool Stack tutorial.

### Improved
- **Docs**: Updated and enhanced the model import/export section in the NE301 Quick Start guide.

## [2026-03-02]

### Improved
- **Docs**: Updated the model build command and modified the target output path to `pkg-model` in the NE301 guide.

## [2026-02-28]

### Improved
- **Docs**: Standardized and unified CamThink brand and product model naming conventions across AI Tool Stack documentation.

### Maintenance
- **Repository**: Deleted incorrectly committed local environment and cache directories such as `.vscode` and `__pycache__`.

## [2026-02-09]

### Added
- **NE301 Quick Start**: Added description for PIR, RTMP, and PoE features (Synchronized with Chinese).

### Improved
- **Case Study**: Synchronized content for Pest Control Monitoring in Chain Restaurants.

### Fixed
- **Case Study**: Fixed sidebar configuration for Pest Control Monitoring guide.


## [2026-01-30]

### Added
- **Docs**: "Urban Waste Bin Overflow Monitoring" application guide for NE301 Series.

### Changed
- **CI/CD**: Temporarily disabled deployment to the internal test server.

## [2026-01-23]

### Added
- **Docs**: NE101 Arduino Development Guide.
- **Docs**: NE301 WiFi Firmware Flashing Guide.

### Improved
- **Docs**: NE301 System Flashing Guide.

### Fixed
- **Docs**: NE101 Alarm Trigger Software Development Guide.

## [2026-01-16]

### Added
- **Homepage**: Added "Video Demos" and "Featured Shorts" interactive components.
- **Documentation**: Warehouse Rack Detection use case.

### Improved
- **i18n**: Synchronized Homepage and English Docs.

### Fixed
- **Documentation**: Fixed layout distortion in Warehouse Rack Detection guide.

## [2026-01-12]

### Fixed
- **Homepage UI**: Optimized dynamic UI.
- **i18n**: Optimized visual layout.

## [2026-01-09]

### Added
- **NE301 Series**: 
    - Added NE301 Refrigerator Inventory Monitoring application case.

- **Homepage & Welcome Page**: 
    - Content refactoring to enhance platform feature showcase.

### Fixed
- **NE301 Series**: Fixed known issues.

### Improved
- **i18n & Homepage Refactor**: Completed the initial style refactoring of "Welcome" and "Docs Home" pages for full bilingual support.
- **Documentation**:
    - Standardized formatting and images for "NE301 Refrigerator Inventory Monitoring" guide, and launched the English version.
    - Fixed broken links and metadata configuration for key docs like NE301 Model Training and NE101 Low-Power Application.

## [2025-12-29]

### Fixed
- **NE301 Series**: Fixed known issues in the Quick Start guide.
- **NE300-MB01**: Corrected camera module specifications by changing `HFOV` to the more accurate `DFOV` (59°/97°/165°).

## [2025-12-26]

### Added
- **Hardware Development Resources**: 
    - Added documentation for the Serial Communication Module.
    - Add NE301 relevant references.
- **Internationalization (i18n)**: Fully synchronized and launched the English version of "Serial Communication Module" documentation.

### Improved
- **Serial Communication Module**: Optimized image layout to display the pin definition diagram and connection example side-by-side.
- **Global**: Further optimized image spacing across pages for better display effects.

## [2025-12-23]

### Added
- **NE301 Series**: Created and launched the English version of the NE301 Dev Kit Installation Guide.

### Improved
- **NE301 Series**: 
    - Synchronized and updated the "Parts Checklist" in both Chinese and English (merged duplicate rows, corrected screw counts and notes).
    - Unified the image display style across the entire site for a more professional look.
