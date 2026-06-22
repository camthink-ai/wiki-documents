---
title: Welcome
hide_table_of_contents: true
pagination_next: null
pagination_prev: null
slug: /
description: Welcome to the official CamThink Wiki. Explore open hardware designs, system software, and AI model deployment for NeoEdge and NeoEyes series.
keywords: [CamThink, Edge AI Wiki, Open Hardware, AI Model Deployment, NeoEdge, NeoEyes, NVIDIA Jetson, STM32N6, ESP32-S3]
tags: [CamThink, Documentation Hub, Edge AI Products, Hardware Platform, Developer Resources]
---

import Link from '@docusaurus/Link';

import '@site/src/css/docs-home.css';
import VideoModal from '@site/src/components/VideoModal';
import VideoCarousel from '@site/src/components/VideoCarousel';

<div className="docs-home-container">

  {/* Hero Search Area */}
  <div className="docs-hero">
    <h1>CamThink Wiki Center</h1>
    <p>Explore Edge Intelligence, start here. Build your AIoT applications.</p>
  </div>

  <div className="docs-intro">
    <p><strong>Welcome to CamThink Wiki Center!</strong></p>
    <p>We are excited to have you join our community, the best place to learn about and explore Edge AI technology. Whether you are a beginner or an experienced developer, you will find useful resources and support here.</p>
    <p><strong>CamThink, Fueling Imagination to Edge Intelligence</strong></p>
    <p style={{marginBottom: '0'}}>CamThink is a brand that provides developers with a variety of **open-architecture hardware** and **open-source software**. We are committed to building an **edge AI perception suite** that can be widely used in the real world. Our focus is on providing multi-dimensional perception capabilities such as visual, audio, and environmental data, aiming to allow AI to understand the world more comprehensively and promote the popularization and development of edge intelligence technology. As a sub-brand of Milesight, CamThink inherits its strong R&D capabilities and global support network, providing a strong guarantee for product reliability and continuous innovation.</p>
  </div>

  <div style={{height: '3rem'}}></div>

  {/* ================= Latest Updates ================= */}
  <h2 className="docs-section-title">Latest Docs</h2>
  <div className="latest-docs-grid">
    <Link to="/docs/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">NE503 AI-Assisted Development</div>
      <div className="update-meta">
        <span>New Doc</span>
        <span>• 2026-06-22</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/application-guide/app-development/sdk-workflow" className="update-card">
      <div className="update-title">NE503 Application Development Guide</div>
      <div className="update-meta">
        <span>New Doc</span>
        <span>• 2026-06-17</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="update-card">
      <div className="update-title">NE503 Hardware Guide</div>
      <div className="update-meta">
        <span>New Doc</span>
        <span>• 2026-05-28</span>
      </div>
    </Link>
    <Link to="/docs/neoeyes-ne301-series/application-guide/verified-models" className="update-card">
      <div className="update-title">NE301 Verified Models</div>
      <div className="update-meta">
        <span>Updated</span>
        <span>• 2026-05-28</span>
      </div>
    </Link>
  </div>

  {/* ================= Quick Access (Product Series) ================= */}
  <h2 className="docs-section-title">Quick Access</h2>
  <div className="doc-categories-grid">
    {/* NeoMind */}
    <div className="category-card">
      <Link to="/docs/neomind/product-overview/what-is-neomind" className="cat-header">
        <img src="https://resources.camthink.ai/NeoMind/dashboardDemo.png" style={{height: '80px', objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none'}} alt="NeoMind" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoMind Platform</div>
        <div className="cat-desc">Edge AI application platform — device management, real-time dashboards, rule engine, and AI Agent.</div>
        <div className="cat-links">
          <Link to="/docs/neomind/product-overview/what-is-neomind" className="cat-link-item">Overview</Link>
          <Link to="/docs/neomind/quick-start/five-minute-guide" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neomind/developer-guide/overview" className="cat-link-item">Developer Guide</Link>
          <Link to="/docs/neomind/use-cases/object-detection" className="cat-link-item">Use Cases</Link>
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
        <div className="cat-desc">NVIDIA Jetson Edge Computing Gateway, 21~100 TOPS powerful computing.</div>
        <div className="cat-links">
          <Link to="/docs/neoedge-ng4500-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoedge-ng4500-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="cat-link-item">LLM Deploy</Link>
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
        <div className="cat-desc">Hailo-15H AI Camera, 20 TOPS computing, 4K imaging and high-performance inference.</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne503-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne503-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoeyes-ne503-series/software-guide/system-architecture" className="cat-link-item">Software Guide</Link>
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
        <div className="cat-desc">STM32N6 Edge AI Camera, supporting Cortex-M55 + NPU efficient inference.</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne301-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne301-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne301-series/application-guide/model-training" className="cat-link-item">Model Training</Link>
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
        <div className="cat-desc">ESP32-S3 Low-Power Transmission Node, designed for battery-powered scenarios.</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne101-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne101-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition" className="cat-link-item">Low Power App</Link>
        </div>
      </div>
    </div>
  </div>

  <h2 className="docs-section-title">Video Demos</h2>
  <div className="videos-grid">
    <VideoModal
      videoId="GH0RVLQjGeY"
      title="NeoEyes NE101 Firmware Flashing & First Look"
      description="Comprehensive display of flashing details and functions"
      coverImage="https://img.youtube.com/vi/GH0RVLQjGeY/maxresdefault.jpg"
    />
    <VideoModal
      videoId="OsPkVlqArXs"
      title="NeoEyes NE301 Assembly Demo"
      description="From development board to finished camera"
      coverImage="https://img.youtube.com/vi/OsPkVlqArXs/maxresdefault.jpg"
    />
  </div>

  {/* ================= SHORTS SECTION ================= */}
  <h2 className="docs-section-title" style={{marginTop: '4rem'}}>Featured Shorts</h2>

  <VideoCarousel videos={[
    { videoId: 'mLg4TQ-i5KU', title: 'Start Exploring' },
    { videoId: 'n8zZIutqi3Q', title: 'AI Camera' },
    { videoId: 'a9JdVw-2k4o', title: 'Firmware Update' },
    { videoId: '4XtHxtbsD-0', title: 'Cat-1 Module' },
    { videoId: 'aaZQw551gAE', title: 'Unboxing' },
  ]} />

</div>
