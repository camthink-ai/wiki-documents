---
title: Welcome
description: 欢迎来到 CamThink Wiki 中心！探索边缘智能，获取 NeoEyes NE301、NE101 和 NeoEdge NG4500 系列产品的详细技术文档、快速入门指南及 AIoT 应用教程。
keywords: [CamThink, 边缘智能, AIoT, 开发者社区, 边缘计算, 技术文档, 视觉感知, 边缘 AI]
tags: [产品入门, 边缘 AI, 硬件指南, 开发者资源, 品牌介绍]
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

  {/* Hero Search Area */}
  <div className="docs-hero">
    <h1>CamThink Wiki 中心</h1>
    <p>探索边缘智能，从这里开始。构建属于你的 AIoT 应用。</p>
  </div>

  <div className="docs-intro">
    <p><strong>欢迎来到 CamThink Wiki 中心！</strong></p>
    <p>我们很高兴您能加入我们的社区，这里是您了解和探索边缘AI感知技术的最佳场所。无论您是初学者还是有经验的开发者，您都能在这里找到有用的资源和支持。</p>
    <p><strong>CamThink，让边缘智能更具想象力</strong></p>
    <p style={{marginBottom: '0'}}>CamThink 是一个专为开发者提供多种开放硬件和开源软件的品牌，我们致力于构建在现实世界中可广泛应用的边缘AI感知套件，我们的重点在于提供视觉、听觉和环境数据等多维感知能力，旨在让AI更全面地理解世界，推动边缘智能技术的普及与发展。作为 Milesight（星纵科技）的子品牌，CamThink 继承了其强大的研发能力和全球支持网络，为产品的可靠性和持续创新提供了有力保障。</p>
  </div>
  
  <div style={{height: '3rem'}}></div>

  {/* ================= Latest Updates ================= */}
  <h2 className="docs-section-title">最新文档</h2>
  <div className="latest-docs-grid">
    <Link to="/docs/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">NE503 AI 辅助开发</div>
      <div className="update-meta">
        <span>新增文档</span>
        <span>• 2026-06-22</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/application-guide/app-development/sdk-workflow" className="update-card">
      <div className="update-title">NE503 应用开发指南</div>
      <div className="update-meta">
        <span>新增文档</span>
        <span>• 2026-06-17</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="update-card">
      <div className="update-title">NE503 硬件指南</div>
      <div className="update-meta">
        <span>新增文档</span>
        <span>• 2026-05-28</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne301-series/application-guide/verified-models" className="update-card">
      <div className="update-title">NE301 Verified Models</div>
      <div className="update-meta">
        <span>更新文档</span>
        <span>• 2026-05-28</span>
      </div>
    </Link>
  </div>

  {/* ================= Quick Access (Product Series) ================= */}
  <h2 className="docs-section-title">快速入口</h2>
  <div className="doc-categories-grid">
    {/* NeoMind */}
    <div className="category-card">
      <Link to="/docs/neomind/product-overview/what-is-neomind" className="cat-header">
        <img src="https://resources.camthink.ai/NeoMind/dashboardDemo.png" style={{height: '80px', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none'}} alt="NeoMind" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoMind 平台</div>
        <div className="cat-desc">边缘 AI 应用平台 —— 设备管理、实时仪表板、规则引擎与 AI Agent。</div>
        <div className="cat-links">
          <Link to="/docs/neomind/product-overview/what-is-neomind" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neomind/quick-start/five-minute-guide" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neomind/developer-guide/overview" className="cat-link-item">开发指南</Link>
          <Link to="/docs/neomind/use-cases/object-detection" className="cat-link-item">应用案例</Link>
        </div>
      </div>
    </div>

    {/* NG4500 */}
    <div className="category-card">
      <Link to="/docs/neoedge-ng4500-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/wiki/img/Overview/NG45xx/NG45XX.png" style={{height: '80px', pointerEvents: 'none'}} alt="NG4500" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEdge NG4500</div>
        <div className="cat-desc">NVIDIA Jetson 边缘计算网关，21~100 TOPS 强劲算力。</div>
        <div className="cat-links">
          <Link to="/docs/neoedge-ng4500-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoedge-ng4500-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="cat-link-item">硬件指南</Link>
          <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="cat-link-item">LLM 部署</Link>
        </div>
      </div>
    </div>

    {/* NE503 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne503-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/official-site/menu/ne503.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE503" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE503</div>
        <div className="cat-desc">Hailo-15H AI 相机，20 TOPS 算力，4K 影像与高性能推理。</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne503-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne503-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="cat-link-item">硬件指南</Link>
          <Link to="/docs/neoeyes-ne503-series/software-guide/system-architecture" className="cat-link-item">软件指南</Link>
        </div>
      </div>
    </div>

    {/* NE301 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne301-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/wiki/img/ne301/overview/301.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE301" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE301</div>
        <div className="cat-desc">STM32N6 边缘 AI 相机，支持 Cortex-M55 + NPU 高效推理。</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne301-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne301-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide" className="cat-link-item">开发指南</Link>
          <Link to="/docs/neoeyes-ne301-series/application-guide/model-training" className="cat-link-item">模型训练</Link>
        </div>
      </div>
    </div>

    {/* NE101 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne101-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/wiki/img/Overview/NE101/NE101.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE101" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE101</div>
        <div className="cat-desc">ESP32-S3 低功耗传输节点，专为电池供电场景设计。</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne101-series/overview" className="cat-link-item">产品概述</Link>
          <Link to="/docs/neoeyes-ne101-series/quick-start" className="cat-link-item">快速入门</Link>
          <Link to="/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide" className="cat-link-item">开发指南</Link>
          <Link to="/docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition" className="cat-link-item">低功耗应用</Link>
        </div>
      </div>
    </div>
  </div>



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

  {/* ================= SHORTS SECTION ================= */}
  <h2 className="docs-section-title" style={{marginTop: '4rem'}}>精选短视频</h2>
  
  <VideoCarousel videos={[
    { videoId: 'mLg4TQ-i5KU', title: 'Start Exploring' },
    { videoId: 'n8zZIutqi3Q', title: 'AI Camera' },
    { videoId: 'a9JdVw-2k4o', title: 'Firmware Update' },
    { videoId: '4XtHxtbsD-0', title: 'Cat-1 Module' },
    { videoId: 'aaZQw551gAE', title: 'Unboxing' },
  ]} />

</div>




