---
title: 文档中心
sidebar_label: "Documentation Hub"
description: CamThink 技术文档中心：边缘 AI 相机与网关的快速上手指南、NeoMind 边缘 AI 平台、AI Tool Stack 工具链与开箱即用的 Edge AI 解决方案。
keywords: [CamThink, 边缘智能, AIoT, 开发者社区, 边缘计算, 技术文档, 视觉感知, 边缘 AI]
tags: [产品入门, 边缘 AI, 硬件指南, 开发者资源]
hide_table_of_contents: true
pagination_next: null
pagination_prev: null
slug: /
---

import Link from '@docusaurus/Link';

import '@site/src/css/docs-home.css';
import VideoModal from '@site/src/components/VideoModal';
import VideoCarousel from '@site/src/components/VideoCarousel';

<div className="docs-home-container">

  {/* ================= Hero ================= */}
  <div className="docs-hero">
    <h1>CamThink Wiki 中心</h1>
    <p>从设备快速上手到 Edge AI 方案落地——文档、示例与工具都在这里。</p>
  </div>

  {/* ================= Build Path ================= */}
  <h2 className="docs-section-title">从开箱到首次部署</h2>
  <div className="build-path-grid">
    <Link to="#solutions" className="build-step">
      <h3>解决方案</h3>
      <p>按场景找完整参考：架构、清单与搭建步骤，照着做即可落地。</p>
      <span className="step-link">浏览解决方案 →</span>
    </Link>
    <Link to="#products" className="build-step">
      <h3>硬件</h3>
      <p>五款 AI 相机与边缘计算主机的选型、规格与快速入门。</p>
      <span className="step-link">查看产品入口 →</span>
    </Link>
    <Link to="#oss" className="build-step">
      <h3>固件与 SDK</h3>
      <p>开源固件、SDK、原理图与数据表，按产品直接下载。</p>
      <span className="step-link">获取开源资源 →</span>
    </Link>
    <Link to="/docs/neomind/quick-start/five-minute-guide" className="build-step">
      <h3>NeoMind</h3>
      <p>安装平台、接入设备、本地识别，并把数据对接到业务系统。</p>
      <span className="step-link">NeoMind 五分钟入门 →</span>
    </Link>
  </div>

  {/* ================= Edge AI Solutions ================= */}
  <h2 className="docs-section-title" id="solutions">Edge AI 解决方案</h2>
  <div className="solution-grid">
    <Link to="/docs/edge-ai-solutions/water-meter-recognition/solution-description" className="solution-card">
      <img src="https://resources.camthink.ai/wiki/img/edge-ai-solutions/water-meter-recognition/index/water-meter-demo.webp" alt="水表自动抄读方案" />
      <div className="sol-body">
        <div className="sol-title">水表自动抄读 <span className="update-badge">NEW</span></div>
        <div className="sol-desc">NE101 + NeoMind 本地 OCR：旧表不改，读数自动入库，全量留痕可回溯。</div>
      </div>
    </Link>
  </div>

  {/* ================= Products ================= */}
  <h2 className="docs-section-title" id="products">产品快速入口</h2>
  <div className="doc-categories-grid">
    {/* NE101 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne101-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/official-site/dev-center/neoeyes-ne101.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE101" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE101</div>
        <div className="cat-desc">低功耗 AI 相机：电池供电、定时抓拍，专为无电源的离线点位设计。</div>
        <div className="chip-row">
          <span className="chip">ESP32-S3</span>
          <span className="chip">IP67</span>
          <span className="chip">电池供电</span>
          <span className="chip">开源固件</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne101-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne101-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide" className="cat-link-item">开发指南</Link>
          <Link to="/docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition" className="cat-link-item">低功耗应用</Link>
        </div>
      </div>
    </div>

    {/* NE301 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne301-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/official-site/dev-center/neoeyes-ne301.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE301" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE301</div>
        <div className="cat-desc">STM32N6 边缘 AI 相机，Cortex-M55 + NPU 高效推理，工业级防护。</div>
        <div className="chip-row">
          <span className="chip">板载 NPU</span>
          <span className="chip">RTSP / ONVIF</span>
          <span className="chip">IP67</span>
          <span className="chip">可选 PoE</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne301-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne301-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide" className="cat-link-item">开发指南</Link>
          <Link to="/docs/neoeyes-ne301-series/application-guide/model-training" className="cat-link-item">模型训练</Link>
        </div>
      </div>
    </div>

    {/* NE302 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne302-series/ne302-overview" className="cat-header">
        <img src="/img/home/hw/ne302.webp" style={{height: '80px', pointerEvents: 'none'}} alt="NE302" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE302</div>
        <div className="cat-desc">迷你 AI 视觉相机，STM32N6 + 4 MP，面向设备集成。</div>
        <div className="chip-row">
          <span className="chip">STM32N6</span>
          <span className="chip">4 MP</span>
          <span className="chip">38×38 mm</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne302-series/ne302-overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne302-series/ne302-quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne302-series/hardware-guide/ne302-components-overview" className="cat-link-item">硬件指南</Link>
          <Link to="/docs/neoeyes-ne302-series/software-guide/ne302-development-environment" className="cat-link-item">软件指南</Link>
        </div>
      </div>
    </div>

    {/* NE503 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne503-series/overview" className="cat-header">
        <img src="/img/home/hw/ne503.webp" style={{height: '80px', padding: '18px', boxSizing: 'border-box', pointerEvents: 'none'}} alt="NE503" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE503</div>
        <div className="cat-desc">Hailo-15H AI 相机，4K 影像与高性能本地推理。</div>
        <div className="chip-row">
          <span className="chip">Hailo-15H</span>
          <span className="chip">20 TOPS</span>
          <span className="chip">4K</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne503-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne503-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="cat-link-item">硬件指南</Link>
          <Link to="/docs/neoeyes-ne503-series/software-guide/system-architecture" className="cat-link-item">软件指南</Link>
        </div>
      </div>
    </div>

    {/* NG4500 */}
    <div className="category-card">
      <Link to="/docs/neoedge-ng4500-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/official-site/dev-center/neoedge-ai-box.png" style={{height: '80px', pointerEvents: 'none'}} alt="NG4500" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEdge NG4500</div>
        <div className="cat-desc">NVIDIA Jetson 边缘计算主机，多路视频接入，21~100 TOPS。</div>
        <div className="chip-row">
          <span className="chip">JetPack</span>
          <span className="chip">Docker</span>
          <span className="chip">CUDA</span>
          <span className="chip">无风扇</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoedge-ng4500-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoedge-ng4500-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="cat-link-item">硬件指南</Link>
          <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="cat-link-item">LLM 部署</Link>
        </div>
      </div>
    </div>
  </div>

  {/* ================= Open-Source Resources ================= */}
  <h2 className="docs-section-title" id="oss">开源资源（固件与 SDK）</h2>
  <div className="oss-grid">
    <div className="oss-card">
      <h3>NE101 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/lowpower_camera" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">lowpower_camera</span><span className="repo-desc">相机固件</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NE301 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/ne301" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">ne301</span><span className="repo-desc">相机固件</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NE302 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/ne302" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">ne302</span><span className="repo-desc">嵌入式固件</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NE503 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/meta-hailo-os" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">meta-hailo-os</span><span className="repo-desc">系统构建层</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NG4500 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/jetson-containers" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">jetson-containers</span><span className="repo-desc">ML 容器</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NeoRuntime · 推理平台 <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/neoruntime-sdks" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">neoruntime-sdks</span><span className="repo-desc">NE503 平台 SDK</span></a>
      </div>
    </div>
    <div className="oss-card">
      <h3>NeoMind <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></h3>
      <div className="oss-links">
      <a href="https://github.com/camthink-ai/NeoMind-Extensions" target="_blank" rel="noopener noreferrer" className="oss-link"><span className="repo">NeoMind-Extensions</span><span className="repo-desc">官方扩展</span></a>
      </div>
    </div>
  </div>

  {/* ================= Software Platforms ================= */}
  <h2 className="docs-section-title">软件平台</h2>
  <div className="platform-grid">
    <Link to="/docs/neomind/product-overview/what-is-neomind" className="platform-card">
      <img src="https://resources.camthink.ai/official-site/dev-center/neomind-edge-ai-agent.png" alt="NeoMind" />
      <div>
        <h3>NeoMind 边缘 AI 平台</h3>
        <p>设备接入、本地推理（OCR / 目标检测）、仪表板、规则引擎与 AI Agent，全程本地离线运行。</p>
        <div className="chip-row">
          <span className="chip">MQTT 接入</span>
          <span className="chip">本地 OCR</span>
          <span className="chip">Data Push</span>
          <span className="chip">AI Agent</span>
        </div>
      </div>
    </Link>
    <Link to="/docs/software/ai-tool-stack/overview" className="platform-card">
      <img src="https://resources.camthink.ai/official-site/dev-center/ai-tool-stack-model-training.png" alt="AI Tool Stack" />
      <div>
        <h3>AI Tool Stack</h3>
        <p>从数据标注、模型训练（YOLOv8）、量化转换到端侧部署的一站式模型工具链。</p>
        <div className="chip-row">
          <span className="chip">数据标注</span>
          <span className="chip">YOLOv8</span>
          <span className="chip">量化转换</span>
          <span className="chip">端侧部署</span>
        </div>
      </div>
    </Link>
  </div>

  {/* ================= Latest Updates ================= */}
  <h2 className="docs-section-title">最新文档</h2>
  <div className="latest-docs-grid">
    <Link to="/docs/edge-ai-solutions/water-meter-recognition/solution-description" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">水表自动抄读方案</div>
      <div className="update-meta"><span>解决方案</span></div>
    </Link>
    <Link to="/docs/software/ai-tool-stack/overview" className="update-card">
      <div className="update-title">AI Tool Stack 工具链</div>
      <div className="update-meta"><span>软件平台</span></div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/troubleshooting" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">NE503 故障排查 FAQ</div>
      <div className="update-meta"><span>新增文档</span></div>
    </Link>
    <Link to="/docs/neomind/product-overview/release-notes" className="update-card">
      <div className="update-title">NeoMind Release Notes</div>
      <div className="update-meta"><span>持续更新</span></div>
    </Link>
  </div>

  {/* ================= Videos ================= */}
  <h2 className="docs-section-title">视频演示</h2>
  <div className="videos-grid">
    <VideoModal
      videoId="GH0RVLQjGeY"
      title="NeoEyes NE101 固件烧录与初体验"
      description="全方位展示烧录细节与功能"
      coverImage="https://img.youtube.com/vi/GH0RVLQjGeY/maxresdefault.jpg"
    />
    <VideoModal
      videoId="OsPkVlqArXs"
      title="NeoEyes NE301 组装演示"
      description="从开发板到成品相机"
      coverImage="https://img.youtube.com/vi/OsPkVlqArXs/maxresdefault.jpg"
    />
  </div>

  <h2 className="docs-section-title" style={{marginTop: '3rem'}}>精选短视频</h2>
  <VideoCarousel videos={[
    { videoId: 'mLg4TQ-i5KU', title: 'Start Exploring' },
    { videoId: 'n8zZIutqi3Q', title: 'AI Camera' },
    { videoId: 'a9JdVw-2k4o', title: 'Firmware Update' },
    { videoId: '4XtHxtbsD-0', title: 'Cat-1 Module' },
    { videoId: 'aaZQw551gAE', title: 'Unboxing' },
  ]} />

  {/* ================= Community ================= */}
  <h2 className="docs-section-title" style={{marginTop: '4rem'}}>资源与社区</h2>
  <div className="community-grid">
    <a href="https://www.camthink.ai/developer-center/" target="_blank" rel="noopener noreferrer" className="hub-community-card">
      <span className="cc-icon" style={{background: 'rgba(13,148,136,0.10)', color: '#0D9488'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6"/></svg></span>
      <h3>开发者中心</h3>
      <p>固件、原理图、数据表与开发者资源的一站式入口。</p>
    </a>
    <a href="https://discord.gg/a8NbPGAJw9" target="_blank" rel="noopener noreferrer" className="hub-community-card">
      <span className="cc-icon" style={{background: 'rgba(88,101,242,0.12)', color: '#5865F2'}}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z"/><circle cx="9" cy="10.5" r="1.4" fill="#fff"/><circle cx="15" cy="10.5" r="1.4" fill="#fff"/></svg></span>
      <h3>Discord</h3>
      <p>与开发者实时交流，获取技术支持。</p>
    </a>
    <a href="https://github.com/camthink-ai" target="_blank" rel="noopener noreferrer" className="hub-community-card">
      <span className="cc-icon" style={{background: 'rgba(24,23,23,0.08)', color: '#24292f'}}><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></span>
      <h3>GitHub</h3>
      <p>开源固件、示例代码与问题反馈。</p>
    </a>
    <a href="https://www.camthink.ai/developer-center/models/" target="_blank" rel="noopener noreferrer" className="hub-community-card">
      <span className="cc-icon" style={{background: 'rgba(124,58,237,0.10)', color: '#7C3AED'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/><path d="M12 22V12M3.5 7.2 12 12l8.5-4.8"/></svg></span>
      <h3>AI Model Zoo</h3>
      <p>官方模型库：128+ 个场景调优的视觉模型，PT / ONNX / TFLite 开箱即用。</p>
    </a>
    <a href="https://qm.qq.com/q/8kDj7SpZ84" target="_blank" rel="noopener noreferrer" className="hub-community-card">
      <span className="cc-icon" style={{background: 'rgba(18,183,245,0.12)', color: '#12B7F5'}}><strong style={{fontSize: '0.8rem', fontWeight: 800, letterSpacing: '-0.02em'}}>QQ</strong></span>
      <h3>QQ 开发者群</h3>
      <p>加入 CamThink 开发者交流群，获取中文社区支持。</p>
    </a>
  </div>


</div>
