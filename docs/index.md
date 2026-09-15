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
    <div className="build-step">
      <span className="step-num">1</span>
      <h3>明确你的场景</h3>
      <p>要检测或识别什么？部署在哪、供电与网络条件如何？先从现成方案里找参考。</p>
      <Link to="#solutions">浏览解决方案 →</Link>
    </div>
    <div className="build-step">
      <span className="step-num">2</span>
      <h3>设备快速上手</h3>
      <p>开箱、激活与首次启动，各产品系列的 Quick Start 十分钟跑通第一帧画面。</p>
      <Link to="#products">查看产品入口 →</Link>
    </div>
    <div className="build-step">
      <span className="step-num">3</span>
      <h3>跑通现成示例</h3>
      <p>GitHub 开源示例与 Cookbook：从目标检测到 OCR 识别，clone 即用。</p>
      <Link to="https://github.com/camthink-ai">访问 GitHub →</Link>
    </div>
    <div className="build-step">
      <span className="step-num">4</span>
      <h3>接入平台规模化</h3>
      <p>用 NeoMind 管理设备、运行本地推理、把数据推送到你的业务系统。</p>
      <Link to="/docs/neomind/quick-start/five-minute-guide">NeoMind 五分钟入门 →</Link>
    </div>
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
    <Link to="/docs/edge-ai-solutions/smart-gym" className="solution-card is-placeholder">
      <img src="/img/home/hw/ne503.webp" alt="" style={{objectFit: 'contain', background: '#fff', padding: '20px 40px', boxSizing: 'border-box', height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">智慧健身房</div>
        <div className="sol-desc">基于 NE503 的健身房方案。</div>
        <div className="sol-soon">敬请期待</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/smart-retail" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">智慧零售</div>
        <div className="sol-desc">零售场景的视觉识别方案。</div>
        <div className="sol-soon">敬请期待</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/people-counting" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">人数统计</div>
        <div className="sol-desc">客流检测与统计分析方案。</div>
        <div className="sol-soon">敬请期待</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/face-recognition" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">人脸识别</div>
        <div className="sol-desc">人脸检测与识别应用方案。</div>
        <div className="sol-soon">敬请期待</div>
      </div>
    </Link>
    <Link to="/docs/edge-ai-solutions/label-detection" className="solution-card is-placeholder">
      <img src="/img/solutions/case-placeholder.svg" alt="" style={{height: '140px', width: '100%'}} />
      <div className="sol-body">
        <div className="sol-title">标签检测</div>
        <div className="sol-desc">商品标签与铭牌识别方案。</div>
        <div className="sol-soon">敬请期待</div>
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

  {/* ================= Community ================= */}
  <h2 className="docs-section-title">加入社区</h2>
  <div className="community-grid">
    <a href="https://discord.gg/a8NbPGAJw9" target="_blank" rel="noopener noreferrer" className="community-card">
      <h3>Discord</h3>
      <p>与开发者实时交流，获取第一手支持。</p>
    </a>
    <a href="https://github.com/camthink-ai" target="_blank" rel="noopener noreferrer" className="community-card">
      <h3>GitHub</h3>
      <p>开源固件、示例代码与问题反馈。</p>
    </a>
    <a href="https://www.hackster.io/camthink" target="_blank" rel="noopener noreferrer" className="community-card">
      <h3>Hackster.io</h3>
      <p>社区项目与创意玩法展示。</p>
    </a>
    <a href="https://www.camthink.ai/blog" target="_blank" rel="noopener noreferrer" className="community-card">
      <h3>官方 Blog</h3>
      <p>产品动态、技术解析与应用案例。</p>
    </a>
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

  <p className="brand-line">CamThink —— Milesight（星纵科技）旗下边缘 AI 品牌，让边缘智能更具想象力。</p>

</div>
