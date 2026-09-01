[中文版](./CHANGELOG_CN.md)

# Changelog

All notable changes to the CamThink Wiki documentation will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

> This changelog reflects updates starting from **2025-12-23**. Major changes prior to this date are not recorded.

## [2026-09-01]

### Changed
- **NeoEyes NE101 Hardware Connection**: Consolidated version-specific wiring guidance into the affected interface tables. The power-control, PIR, and V2.0 RTC tables now identify their applicable board revisions and GPIO assignments, including the V2.0 TF-card/module-power sharing constraint and RTC I2C sharing with the camera (full bilingual support).
- **NeoEyes NE301 Hardware Documentation**: Added revision-aware wiring for V1.0–V1.3 across the product overview, component overview, and hardware connection guide. The update distinguishes Wi-Fi/J12 SPI mappings, battery and Wi-Fi power-control GPIOs, U0 availability, UART VCC_IN compatibility, PIR/ISP wiring, and the V1.3 IR-CUT header (full bilingual support).

## [2026-08-26]

### Added
- **NE503 Resources**: Added an Application Guide entry page linking to the NeoRuntime platform, SDKs, sample apps, APIs, Event Bus protocol, and prebuilt application bundles on GitHub.

### Changed
- **NE503 Application Guide structure adjusted**: Removed the `1-app-development/` subdirectory and moved the Hello World, AI-assisted development, and HEF model compilation pages to the Application Guide root.

### Removed
- **NE503 Application Guide Reference documents**: Removed the former App, SDK, examples, REST API, and event-integration references under `4-application-guide/3-reference/`; use the Resources entry for those materials.
- **NE503 SDK Workflow**: Removed the SDK Workflow page under app development; use the Resources entry for SDK, API, sample, and event-protocol material.
- **NE503 Version Matrix**: Removed the Software Guide version-baseline and compatibility-matrix page; use the corresponding GitHub repositories and release records for current versions and compatibility material.

## [2026-08-19]

### Changed
- **NeoEyes NE503 Application Guide restructured**: `4-application-guide/` reorganized into three sections: `1-app-development` (teaches how to develop apps; person-detection moved out), `2-cookbook` (real-world app project recipes with a seven-element template), `3-reference` (lookup-style reference merging the former `reference/` App/SDK/examples trio and the former `2-3rd-party-integration` REST/video/event trio). The `2-3rd-party-integration/` and `1-app-development/reference/` directories were removed; person-detection was rewritten from a tutorial into the Cookbook seven-element recipe style (goal/model & data flow/config/core code/deploy/verify/common errors, with a verification record block); parking-lot renamed to `0-` and last-updated date fixed. The documentation guide (0.5) integrator/developer role paths updated accordingly. Batch-① Cookbook entries (region intrusion / people counting / helmet detection / RTSP→NVR / event→cloud) are reserved in plan only — no empty files created.

### Added
- **NeoEyes NE503 Troubleshooting FAQ**: New product-root page merging the previous three troubleshooting docs (the software-guide Troubleshooting Guide at 379 lines, the app-development guide at 224 lines, and the user-guide CLI & troubleshooting page at 92 lines) into a **single symptom-oriented entry** — 8 symptom domains (device & network / video & streams / AI & models / apps & containers / events & integrations / storage & disk / flashing & peripherals / system & services), each entry starting with "symptom → cause → quick fix" followed by deep-dive diagnostic commands; flashing faults are entry items linking to System Flashing §8 anchors (no content duplication); appendices include the error code table (with the high-risk note that DELETE model also deletes the file) and a diagnostic command reference. The aipc-cli command reference moved into the Platform Services Overview CLI section (full CN/EN support).

### Changed
- **NE503 aipc-cli command reference relocated**: The Platform Services Overview (software-guide) CLI section expanded from a one-line summary to a full command reference (system / app / device / stream / model modules + output formats) as the single source of truth; the Deployment & Operations page (user-guide) keeps a one-line navigation link.


### Changed (cont'd)
- **NE503 model lifecycle packaging/subscription split**: The model training page adds a "where your HEF comes from" three-source table (preloaded / custom / third-party) with the 384×640 matching constraint, a HEF naming convention (the filename is the registered model_id), the §7 API deployment path (scp → `POST /ai/models/scan` → `POST /ai/models/{id}/load`), and an appendix section on pruning classes via torch surgery (multi-class to single-class without retraining, device-verified); the SDK Reference `subscribe` gains a `raw_output_only` and custom-trained models section (B-path rationale + minimal NMS self-decode example); the two duplicated raw_output_only explanations in the training page collapse into links (full CN/EN support).
- **NE503 System Management / Deployment & Operations dedup**: Production advice for timezone / static IP / MAC binding / post-IP-change updates now has its single home in Deployment & Operations; the System Management page compresses those spots to one-line links (operation warnings stay in place).

### Removed
- **NE503 legacy troubleshooting docs retired**: `3-software-guide/4-reference/1-troubleshooting.md`, `4-application-guide/1-app-development/reference/troubleshooting.md`, and `2-user-guide/5-cli-and-troubleshooting.md` were deleted; all content (deduplicated) merged into the new Troubleshooting FAQ; all inbound links (quick-start / developer-guide / video-integration / sdk-workflow / sdk-examples / parking-lot / deployment-and-ops / platform-services, 8 spots in CN and EN) now point to the new page anchors.

## [2026-08-17]

### Added
- **NeoEyes NE503 Cookbook: Parking Lot**: New Cookbook page — a reproducible multi-model application walkthrough built on the `neoruntime-apps` parking-lot showcase: four-model manifest (`yolov5m_vehicles` / `scdepthv3` / `license_plate_det` / `plate_recognition`) with dynamic model registration (`allow_register_model`), the `sub.raw` video permission and video-to-event data flow, core SDK code for model registration and event publishing, bundle install/start steps, three-way validation (live MJPEG page, Event Bus WebSocket, app logs), and a symptom→cause→fix table. Includes the required `HD_PREVIEW_ENABLED=0` mitigation for the HD-preview black screen on shipping firmware (platform-api loopback-only). Verified live on device 2026-08: vehicles detected at ~22 FPS with 4 models registered; plate recognition honestly marked as not triggered in the test scene (full bilingual support).
- **NeoEyes NE503 Version Compatibility Matrix**: New reference page in the software guide — component version table (OS 1.12.0 / platform services v1.0.0 / SDK 0.3.0 / MCU 0.1.7.0 / board_tools 1.10.1, verified against a live device on the 2026-08 firmware), the six OS-upgrade compatibility gates (machine / product / hardware-compatibility / aipc-compat-level / data-schema / min-recovery-version), the factory preload list of 14 models plus the preinstalled model-showcase app (VLM not bundled by default), and DFC/HEF compatibility notes (full bilingual support).
- **NeoEyes NE503 Deployment & Operations Guide**: New user-guide page — a 10-item first-deployment checklist, static IP and NTP planning, three-channel log collection (Web / API / SSH) with measured disk-space planning (root 3.3G / data 54G / model library / app images / log cleanup), and dual-layer firmware upgrade with rollback and recovery (deploy.sh --rollback, A/B double-copy, MCU OTA; no one-click factory reset in the current firmware — reflash to fully reset) (full bilingual support).
- **NeoEyes NE503 Security Hardening Guide**: New user-guide page — factory default credential checklist (Web/API, SSH, unauthenticated RTSP, static token) with first-change actions, the three-surface port exposure and protection principles, credential management, container least privilege and trusted images, and relayed remote-access patterns; grounded in live-device testing on 2026-08 firmware (unauthenticated RTSP and no forced password change are documented as measured facts) (full bilingual support).
- **NeoEyes NE503 Product Wiring & Power Guide**: New user-guide page — PoE vs DC power selection criteria, alarm input (1 channel) with Wiegand / RS-485 expansion interfaces, audio interfaces, and debug-port entry points (UART recovery DIP switch, ST-LINK / SWD, serial console, linking to System Flashing photos); real wiring photos to follow in a later batch (full bilingual support).

### Changed
- **NE503 Quick Start adds role-based reading paths**: §7 rebuilt into a role→path matrix (evaluator / app developer / integrator / model engineer / platform developer); the platform-developer path bridges to the open-source neoruntime design docs for the first time.
- **NE503 System Architecture adds an end-to-end data path**: New §2 — a sensor→ISP→three-stream pipeline diagram covering encoding/RTSP and AI inference, the three-stream role table, how detections stay aligned with frames/events/overlay (frame_sequence + stream_map), and a five-layer sandbox isolation overview; subsequent sections renumbered.

### Fixed
- **NE503 external access protocol corrections across the board**: `http://<device-ip>:8080` → `https://<device-ip>` (nginx exposes only 443 externally; 8080 is loopback-only), `ws://` → `wss://`, curl examples now carry `-k` (self-signed device certificate), wscat gains `--no-check` — 10 documents updated in both languages.
- **NE503 source repo migration and install-path corrections**: The dead `camthink-ai/ne503` repo replaced by side-by-side clones of `neoruntime-sdks` + `neoruntime-apps`, with the unified `scripts/build_app.sh` as the sample build entry; `/opt/aipc` normalized to the actual deployment root `/data/aipc` (compatibility note kept for the auto-remapped legacy prefix); flashing tool version 1.9.0 → 1.10.1.
- **NE503 main-stream resolution corrected**: The main stream is corrected to 3840x2160@30 (4K) per factory configuration, in both the System Architecture and Video Integration pages (the repo-default 1080p does not match factory firmware).
- **NE503 Wiegand and alarm-input facts corrected (user-guide review)**: Verified against source (neoruntime + MCU firmware) — Wiegand CH0/CH1 are pure output channels (relay + level); the wrong "connect card readers / swipe data to Event Bus" description removed. Alarm-input signal reporting (event bus / API) is not yet available in the current firmware and the trigger-level option is not yet effective — both now stated honestly. "AI detection → alarm output" clarified as not a built-in linkage.
- **NE503 API authentication model corrected**: The login token is now documented as a session credential (randomly issued per login; invalidated on password change or service restart — scripts must handle 401 and re-login). A separate built-in static integration key (accepted via X-API-Key / Bearer) is unaffected by password changes and its factory default is public in the open-source repo — must be rotated before production. Password change requires only a valid session, no old password. REST API Reference and Security Hardening updated (verified live on device).
- **NE503 user-guide stale-claim cleanup**: Removed "clean up recordings / recording file names" wording that conflicts with the verified "no local recording" conclusion (Dashboard / System Management / Troubleshooting); main-stream advice aligned to factory 4K (Video and Imaging); forgot-password guidance corrected to real, available paths (aipc-cli has no password-reset command); Product Wiring tags corrected to User Guide after its section move.
- **NE503 user-guide link hygiene**: Removed the fully duplicated "Related Documentation" sections in Deployment & Operations and Product Wiring plus one duplicate entry in Security Hardening; added a missing Troubleshooting link; the 80% storage-cleanup advice now converges on the disk-planning section of Deployment & Operations.

## [2026-08-14]

### Added
- **NeoEyes NE302 Documentation**: A new 10-page documentation section for the compact STM32N6 AI camera, covering product information, quick start, capture and storage, data transmission, AI model validation, system maintenance, hardware components and connections, development environment setup, and build/flash workflows. Images are served from CDN and the full section is available in English and Simplified Chinese.

## [2026-08-12]

### Added
- **NeoEyes NE503 User Guide**: A new 6-page Web UI user guide section under NE503 — Dashboard (overview & navigation), Video and Imaging (live view, image quality, overlay & image control, VLC RTSP verification), AI Apps and Models (app management, AI Model Showcase, install wizard), Peripherals, System Management (device info, time, network, storage, logs, file manager, terminal, process manager), and Troubleshooting (CLI reference & diagnostics). Every page is grounded in real-device screenshots served from CDN, covering the full NE503 web console surface (full bilingual support).

## [2026-07-21]

### Added
- **NeoEyes NE503 Model Training and HEF Conversion Tutorial**: A new entry in the app-development series — a complete tutorial for training a YOLOv8n detection model from scratch on NVIDIA CUDA and compiling it into a Hailo HEF for NE503 deployment. Covers Roboflow dataset preparation, Hailo-15H reverse constraints (640×384 lock / NMS-baked / calibration set ≥1024), ultralytics rectangular training, static-shape ONNX export, the three-step Hailo DFC compilation (parser/optimize/compiler), and FineTune fixing NMS all-zero, using safety-helmet detection as the carrier, val mAP50 ≈ 0.93 (full bilingual support).
- **NeoEyes NE503 Verified Apps — Safety Helmet Detection added**: The "Verified Apps" page in the application guide gains a Safety Helmet Detection row — built on a custom-trained `safety_helmet_yolov8n_384_640` (2-class Helmet / No Helmet) HEF, it detects helmeted / unhelmeted persons in real time and alerts on violations, verified on real hardware (9 persons = 6 helmet + 3 no-helmet). The model-preload note was rewritten to distinguish the preinstalled yolov8n from a user-imported custom HEF, with two new on-device preview images added (full bilingual support).

## [2026-07-16]

### Added
- **NeoEyes NE503 Verified Apps**: A new "Verified Apps" page in the application guide, showcasing container app use cases verified on actual hardware (Hello World, Person Detection, Lingering Detection). Each app includes an effect preview, verification details (firmware version, inference model, detection threshold, test results), and a direct download link to a precompiled package ready for deployment — letting users preview results before downloading and get the app package deployed to the device in one step (full bilingual support).

## [2026-07-13]

### Added
- **NeoEyes NE503 Third-Party Integration Guide**: A new "Third-Party Integration" sub-section under the application guide, with 3 developer-facing docs for integrating external systems — a complete RESTful API reference (145 endpoints, rebuilt from the device's live OpenAPI spec), practical RTSP video stream integration (FFmpeg / GStreamer / NVR), and Event Bus integration (topic protocol, MQTT bridging, real-time WebSocket subscription). All content was verified end-to-end against a real device (curl on every endpoint + ffprobe on the three streams + SSH event-frame capture + the pulled OpenAPI spec), correcting divergences in the default auth setting, the error response shape, the device-event enum, and stream parameters (full bilingual support).

## [2026-06-22]

### Added
- **NeoEyes NE503 AI-Assisted Development Tutorial**: A new entry in the app-development series — describe the app you want in one sentence, and Claude (via the `ne503-dev` skill) writes the code (logic + manifest), builds the image, deploys to the device, and verifies end-to-end, with no commands typed. Full on-device demo with a brand-new app, a "loitering alert" (fires when someone stays in frame 10 s straight, resets when they leave) — covers the dwell state machine, tunable env vars, event-bus output, and live console logs (full bilingual support).

## [2026-06-16]

### Added
- **NeoMind Documentation Phase 1 — Developer Guide Expansion**: New developer-facing pages — AI-assisted development, device-type development, dashboard component development, and contributing guide — with real code patterns drawn from production extensions (full bilingual support).
- **NeoMind on Homepage**: Added NeoMind as the 4th slide in the ProductCarousel (with NEW badge), with 4 entry links (product overview / quick-start / user-guide / developer-guide) and English translations in i18n/en/code.json.

### Updated
- **NeoMind Documentation Phase 1 — Content Enrichment**: Full rewrite of the user guide sections (extensions, notifications, automation-rules, data-push, data-transforms) with real screenshots and troubleshooting steps. Refreshed examples and corrected technical details across concepts / product-overview / quick-start / use-cases — including the crash-loop threshold (50s window, 3 retries) and removal of obsolete version strings. ZH/EN parity maintained across all 24 changed docs.
- **NeoMind Image Migration**: All 102 NeoMind images moved to `https://resources.camthink.ai/NeoMind/`. The local `static/img/neomind/` folder was removed; 136 image references across 24 docs now use remote URLs (full bilingual support).

## [2026-06-17]

### Added
- **NeoEyes NE503 Application Development Guide**: New app-dev tutorial series — SDK Workflow (hailo_ipc_sdk embedding and calling patterns), Hello World (build → Web deploy → start → verify minimal closed loop), Person Detection (real AI inference app: SDK subscription, model/stream discovery, permission configuration, event publishing and light-control integration), with Python SDK reference, examples, and troubleshooting (full bilingual support).
- **Homepage Hero Redesign**: Replaced the hero background with a new product-matrix visual showcasing the full CamThink Edge AI stack (NG4500, NE503, NE301, NE101 + NeoMind/AI ToolStack software). Hero text styling is now theme-independent — white title with dark halo, white subtitle, opaque white pill badge with orange accent, and a translucent dark GitHub Star button with backdrop blur for consistent contrast across light/dark modes.

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
