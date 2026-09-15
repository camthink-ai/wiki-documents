---
title: Documentation Hub
sidebar_label: "Documentation Hub"
description: "The CamThink Wiki documentation hub: quick starts for AI cameras and gateways, the NeoMind edge AI platform, the AI Tool Stack and ready-to-deploy Edge AI solution cases."
keywords: [CamThink, edge intelligence, AIoT, developer community, edge computing, technical documentation, visual perception, edge AI]
tags: [Getting Started, Edge AI, Hardware Guide, Developer Resources]
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
    <h1>CamThink Wiki Center</h1>
    <p>From device quick starts to shipping Edge AI solutions — docs, examples and tools, all in one place.</p>
  </div>

  {/* ================= Build Path ================= */}
  <h2 className="docs-section-title">From Unboxing to First Deployment</h2>
  <div className="build-path-grid">
    <Link to="#solutions" className="build-step">
      <h3>Define your scenario</h3>
      <p>What do you need to detect or recognize? Where will it run, with what power and network? Start from a ready-made reference.</p>
      <span className="step-link">Browse solutions →</span>
    </Link>
    <Link to="#products" className="build-step">
      <h3>Quick-start your device</h3>
      <p>Unbox, activate and boot — each product series' Quick Start gets your first frame running in minutes.</p>
      <span className="step-link">See products →</span>
    </Link>
    <Link to="https://github.com/camthink-ai" className="build-step">
      <h3>Run working code</h3>
      <p>Open-source examples and cookbooks on GitHub — from object detection to OCR, clone and run.</p>
      <span className="step-link">Visit GitHub →</span>
    </Link>
    <Link to="/docs/neomind/quick-start/five-minute-guide" className="build-step">
      <h3>Deploy at scale</h3>
      <p>Use NeoMind to manage devices, run local inference and push data into your business systems.</p>
      <span className="step-link">NeoMind in 5 minutes →</span>
    </Link>
  </div>

  {/* ================= Edge AI Solutions ================= */}
  <h2 className="docs-section-title" id="solutions">Edge AI Solutions</h2>
  <div className="solution-grid">
    <Link to="/docs/edge-ai-solutions/water-meter-recognition/solution-description" className="solution-card">
      <img src="https://resources.camthink.ai/wiki/img/edge-ai-solutions/water-meter-recognition/index/water-meter-demo.webp" alt="Automated water meter reading" />
      <div className="sol-body">
        <div className="sol-title">Water Meter Reading <span className="update-badge">NEW</span></div>
        <div className="sol-desc">NE101 + NeoMind local OCR: keep existing meters, auto-ingest readings, full photo audit trail.</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/smart-gym" className="solution-card is-placeholder">
      <img src="/img/home/hw/ne503.webp" alt="" style={{objectFit: 'contain', background: '#fff', padding: '20px 40px', boxSizing: 'border-box', height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">Smart Gym</div>
        <div className="sol-desc">A gym solution built on NE503.</div>
        <div className="sol-soon">Coming soon</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/smart-retail" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">Smart Retail</div>
        <div className="sol-desc">Visual recognition for retail scenarios.</div>
        <div className="sol-soon">Coming soon</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/people-counting" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">People Counting</div>
        <div className="sol-desc">Footfall detection and analytics.</div>
        <div className="sol-soon">Coming soon</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/face-recognition" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">Face Recognition</div>
        <div className="sol-desc">Face detection and recognition applications.</div>
        <div className="sol-soon">Coming soon</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/label-detection" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">Label Detection</div>
        <div className="sol-desc">Product label and nameplate recognition.</div>
        <div className="sol-soon">Coming soon</div>
      </div>
    </Link>
  </div>

  {/* ================= Products ================= */}
  <h2 className="docs-section-title" id="products">Product Quick Access</h2>
  <div className="doc-categories-grid">
    {/* NE101 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne101-series/overview" className="cat-header">
        <img src="https://resources.camthink.ai/official-site/dev-center/neoeyes-ne101.png" style={{height: '80px', pointerEvents: 'none'}} alt="NE101" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE101</div>
        <div className="cat-desc">Low-power AI camera: battery powered with scheduled capture, built for offline spots without mains power.</div>
        <div className="chip-row">
          <span className="chip">ESP32-S3</span>
          <span className="chip">IP67</span>
          <span className="chip">Battery powered</span>
          <span className="chip">Open-source firmware</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne101-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne101-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition" className="cat-link-item">Low-power Apps</Link>
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
        <div className="cat-desc">STM32N6 edge AI camera with Cortex-M55 + NPU for efficient inference; industrial-grade housing.</div>
        <div className="chip-row">
          <span className="chip">Onboard NPU</span>
          <span className="chip">RTSP / ONVIF</span>
          <span className="chip">IP67</span>
          <span className="chip">PoE option</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne301-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne301-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne301-series/application-guide/model-training" className="cat-link-item">Model Training</Link>
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
        <div className="cat-desc">Miniature AI vision camera, STM32N6 + 4 MP, made for device integration.</div>
        <div className="chip-row">
          <span className="chip">STM32N6</span>
          <span className="chip">4 MP</span>
          <span className="chip">38×38 mm</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne302-series/ne302-overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne302-series/ne302-quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne302-series/hardware-guide/ne302-components-overview" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoeyes-ne302-series/software-guide/ne302-development-environment" className="cat-link-item">Software Guide</Link>
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
        <div className="cat-desc">Hailo-15H AI camera with 4K imaging and high-performance local inference.</div>
        <div className="chip-row">
          <span className="chip">Hailo-15H</span>
          <span className="chip">20 TOPS</span>
          <span className="chip">4K</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne503-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne503-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne503-series/hardware-guide/specifications" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoeyes-ne503-series/software-guide/system-architecture" className="cat-link-item">Software Guide</Link>
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
        <div className="cat-desc">NVIDIA Jetson edge computing host with multi-stream video, 21–100 TOPS.</div>
        <div className="chip-row">
          <span className="chip">JetPack</span>
          <span className="chip">Docker</span>
          <span className="chip">CUDA</span>
          <span className="chip">Fanless</span>
        </div>
        <div className="cat-links">
          <Link to="/docs/neoedge-ng4500-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoedge-ng4500-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="cat-link-item">LLM Deployment</Link>
        </div>
      </div>
    </div>
  </div>

  {/* ================= Software Platforms ================= */}
  <h2 className="docs-section-title">Software Platforms</h2>
  <div className="platform-grid">
    <Link to="/docs/neomind/product-overview/what-is-neomind" className="platform-card">
      <img src="https://resources.camthink.ai/official-site/dev-center/neomind-edge-ai-agent.png" alt="NeoMind" />
      <div>
        <h3>NeoMind Edge AI Platform</h3>
        <p>Device onboarding, local inference (OCR / object detection), dashboards, rules engine and AI Agent — fully offline.</p>
        <div className="chip-row">
          <span className="chip">MQTT</span>
          <span className="chip">Local OCR</span>
          <span className="chip">Data Push</span>
          <span className="chip">AI Agent</span>
        </div>
      </div>
    </Link>
    <Link to="/docs/software/ai-tool-stack/overview" className="platform-card">
      <img src="https://resources.camthink.ai/official-site/dev-center/ai-tool-stack-model-training.png" alt="AI Tool Stack" />
      <div>
        <h3>AI Tool Stack</h3>
        <p>A one-stop model toolchain: annotate data, train models (YOLOv8), quantize and deploy to the edge.</p>
        <div className="chip-row">
          <span className="chip">Annotation</span>
          <span className="chip">YOLOv8</span>
          <span className="chip">Quantization</span>
          <span className="chip">Edge deployment</span>
        </div>
      </div>
    </Link>
  </div>

  {/* ================= Latest Updates ================= */}
  <h2 className="docs-section-title">Latest Docs</h2>
  <div className="latest-docs-grid">
    <Link to="/docs/edge-ai-solutions/water-meter-recognition/solution-description" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">Water Meter Reading Solution</div>
      <div className="update-meta"><span>Solution</span></div>
    </Link>
    <Link to="/docs/software/ai-tool-stack/overview" className="update-card">
      <div className="update-title">AI Tool Stack</div>
      <div className="update-meta"><span>Software Platform</span></div>
    </Link>
    <Link to="/docs/neoeyes-ne503-series/troubleshooting" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">NE503 Troubleshooting FAQ</div>
      <div className="update-meta"><span>New docs</span></div>
    </Link>
    <Link to="/docs/neomind/product-overview/release-notes" className="update-card">
      <div className="update-title">NeoMind Release Notes</div>
      <div className="update-meta"><span>Continuously updated</span></div>
    </Link>
  </div>

  {/* ================= Videos ================= */}
  <h2 className="docs-section-title">Video Demos</h2>
  <div className="videos-grid">
    <VideoModal
      videoId="GH0RVLQjGeY"
      title="NeoEyes NE101 Firmware Flash & First Run"
      description="A full walkthrough of flashing and features"
      coverImage="https://img.youtube.com/vi/GH0RVLQjGeY/maxresdefault.jpg"
    />
    <VideoModal
      videoId="OsPkVlqArXs"
      title="NeoEyes NE301 Assembly"
      description="From dev board to finished camera"
      coverImage="https://img.youtube.com/vi/OsPkVlqArXs/maxresdefault.jpg"
    />
  </div>

  <h2 className="docs-section-title" style={{marginTop: '3rem'}}>Featured Shorts</h2>
  <VideoCarousel videos={[
    { videoId: 'mLg4TQ-i5KU', title: 'Start Exploring' },
    { videoId: 'n8zZIutqi3Q', title: 'AI Camera' },
    { videoId: 'a9JdVw-2k4o', title: 'Firmware Update' },
    { videoId: '4XtHxtbsD-0', title: 'Cat-1 Module' },
    { videoId: 'aaZQw551gAE', title: 'Unboxing' },
  ]} />

  {/* ================= Community ================= */}
  <h2 className="docs-section-title" style={{marginTop: '4rem'}}>Join the Community</h2>
  <div className="community-grid">
    <a href="https://discord.gg/a8NbPGAJw9" target="_blank" rel="noopener noreferrer" className="community-card">
      <span className="cc-icon" style={{background: 'rgba(88,101,242,0.12)', color: '#5865F2'}}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2z"/><circle cx="9" cy="10.5" r="1.4" fill="#fff"/><circle cx="15" cy="10.5" r="1.4" fill="#fff"/></svg></span>
      <h3>Discord</h3>
      <p>Chat with developers and get first-line support.</p>
    </a>
    <a href="https://github.com/camthink-ai" target="_blank" rel="noopener noreferrer" className="community-card">
      <span className="cc-icon" style={{background: 'rgba(24,23,23,0.08)', color: '#24292f'}}><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></span>
      <h3>GitHub</h3>
      <p>Open-source firmware, sample code and issue tracking.</p>
    </a>
    <a href="https://www.camthink.ai/blog" target="_blank" rel="noopener noreferrer" className="community-card">
      <span className="cc-icon" style={{background: 'rgba(255,160,66,0.16)', color: '#E8790A'}}><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="19" r="2.4"/><path d="M3 10.5A10.5 10.5 0 0 1 13.5 21h-3.2A7.3 7.3 0 0 0 3 13.7v-3.2z"/><path d="M3 3a18 18 0 0 1 18 18h-3.2A14.8 14.8 0 0 0 3 6.2V3z"/></svg></span>
      <h3>Official Blog</h3>
      <p>Product news, technical deep-dives and use cases.</p>
    </a>
  </div>


</div>
