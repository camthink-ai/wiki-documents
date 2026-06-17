import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import ProductCarousel from '@site/src/components/ProductCarousel';
import { Icon } from '@site/src/components/icons';
import '../css/welcome.css';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Welcome to ${siteConfig.title}`}
            description="Edge AI Platform Wiki - Build Intelligent Devices for the Real World">

            <div className="welcome-page-container">

                {/* ================= HERO ================= */}
                <div className="hero-section hero-platform">
                    <div className="hero-content">
                        <div className="hero-pill">
                            <span className="hero-pill-dot"></span>
                            <Translate id="homepage.hero.pill">开源 · 边缘 AI 生态</Translate>
                        </div>

                        <h1 className="hero-title">
                            <Translate id="homepage.hero.title.l1">开源的</Translate>{' '}
                            <span className="title-accent">
                                <Translate id="homepage.hero.title.l2">边缘 AI 生态</Translate>
                            </span>
                        </h1>

                        <p className="hero-subtitle">
                            <Translate id="homepage.hero.subtitle">开放硬件 × 开源软件 —— 从 AI 相机、边缘网关到 NeoMind，一站式构建你的 IoT + AI 应用</Translate>
                        </p>

                        <div className="hero-actions">
                            <Link to="/docs/" className="btn-primary">
                                <Translate id="homepage.hero.cta.start">浏览文档</Translate>
                                <Icon.ArrowRight size={16} className="btn-arrow" />
                            </Link>
                            <Link to="https://github.com/camthink-ai" className="btn-github">
                                <Icon.Github size={18} className="btn-github-icon" />
                                <Translate id="homepage.hero.cta.github">GitHub Star</Translate>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Stats Section Removed */}

                {/* PLATFORM capability section removed — consolidated into the
                    PLATFORM PANORAMA tech stack below to avoid redundancy. */}

                {/* ================= PRODUCTS ================= */}
                <div className="section-container" id="core-products">
                    <div className="section-header">
                        <span className="section-label">QUICK ACCESS</span>
                        <h2 className="section-title"><Translate id="homepage.products.title">快速入口</Translate></h2>
                        <p className="section-desc">
                            <Translate id="homepage.products.desc">为了帮助你快速上手 CamThink 产品，这里提供了一些重要的资源链接</Translate>
                        </p>
                    </div>

                    <ProductCarousel />
                </div>

                {/* ================= TECH STACK PANORAMA ================= */}
                <div className="tech-stack-section">
                    <div className="tech-stack-header">
                        <div className="section-label">PLATFORM PANORAMA</div>
                        <h2><Translate id="homepage.stack.title">平台技术栈全景</Translate></h2>
                        <p className="tech-stack-subtitle"><Translate id="homepage.stack.subtitle">从底层算力到上层应用，完整覆盖您的开发需求</Translate></p>
                    </div>

                    <div className="tech-stack-container">

                        {/* Layer 1: Applications */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.app">应用层</Translate></div>
                            <div className="layer-content">
                                <div className="stack-apps-grid">
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.building">智能楼宇</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.agriculture">智慧农业</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 12h10" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.vision">视觉分析</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h7v7h-7z" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.other">其它领域</Translate></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="stack-connector"></div>

                        {/* Layer 2: NeoMind Platform — NeoMind + AI ToolStack */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.neomind">应用配套</Translate></div>
                            <div className="layer-content">
                                <div className="neomind-layer-grid">

                                    {/* Block 1: NeoMind */}
                                    <Link to="/docs/neomind/product-overview/what-is-neomind" className="neomind-block">
                                        <div className="neomind-block-head">
                                            <span className="neomind-block-title"><Translate id="homepage.stack.mw.neomind">NeoMind</Translate></span>
                                            <span className="neomind-block-sub"><Translate id="homepage.stack.neomind.platformsub">Edge AI platform · device management & application runtime</Translate></span>
                                        </div>
                                        <div className="neomind-block-chips">
                                            <span className="nm-chip">Device Management</span>
                                            <span className="nm-chip">Real-time Dashboard</span>
                                            <span className="nm-chip">Rule Engine</span>
                                            <span className="nm-chip">AI Agent</span>
                                            <span className="nm-chip">Extension Ecosystem</span>
                                            <span className="nm-chip">Notifications</span>
                                        </div>
                                    </Link>

                                    {/* Block 2: AI ToolStack */}
                                    <Link to="/docs/neoeyes-ne301-series/application-guide/ai-tool-stack/" className="neomind-block">
                                        <div className="neomind-block-head">
                                            <span className="neomind-block-title"><Translate id="homepage.stack.mw.toolstack">AI ToolStack</Translate></span>
                                            <span className="neomind-block-sub"><Translate id="homepage.stack.neomind.toolsub">Full model lifecycle · training / quantization / conversion / deployment</Translate></span>
                                        </div>
                                        <div className="neomind-block-chips">
                                            <span className="nm-chip">Model Management</span>
                                            <span className="nm-chip">Model Training</span>
                                            <span className="nm-chip">Quantization</span>
                                            <span className="nm-chip">Conversion</span>
                                            <span className="nm-chip">Edge Deployment</span>
                                        </div>
                                    </Link>

                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="stack-connector"></div>

                        {/* Layer 3: Middleware - ENRICHED */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.software">软件生态</Translate></div>
                            <div className="layer-content">
                                <div className="middleware-container">
                                    <div className="stack-middleware-grid">

                                        {/* Column 1: AI & Computing */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.ai">AI 推理 & 框架</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">TensorRT</span>
                                                <span className="mw-chip">DeepStream</span>
                                                <span className="mw-chip">STM32Cube.AI</span>
                                                <span className="mw-chip">ESP-DL</span>
                                                <span className="mw-chip">TFLite Micro</span>
                                                <span className="mw-chip">Ollama</span>
                                                <span className="mw-chip">VLLM</span>
                                                <span className="mw-chip">Ultralytics</span>
                                            </div>
                                        </div>

                                        {/* Column 2: OS & Core */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.os">OS & 核心组件</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">Linux / Ubuntu</span>
                                                <span className="mw-chip">FreeRTOS</span>
                                                <span className="mw-chip">JetPack SDK</span>
                                                <span className="mw-chip">Docker</span>
                                                <span className="mw-chip">OTA Update</span>
                                            </div>
                                        </div>

                                        {/* Column 3: Connectivity */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.conn">连接与协议</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">WiFi 6 / BLE</span>
                                                <span className="mw-chip">Cat.1</span>
                                                <span className="mw-chip">WiFi HaLow</span>
                                                <span className="mw-chip">MQTT</span>
                                                <span className="mw-chip">HTTP</span>
                                                <span className="mw-chip">RTSP</span>
                                                <span className="mw-chip">REST API</span>
                                            </div>
                                        </div>

                                        {/* Column 4: Tools & Extensions */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.tools">工具与扩展</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">ESP-IDF</span>
                                                <span className="mw-chip">VS Code</span>
                                                <span className="mw-chip">Arduino</span>
                                                <span className="mw-chip">Camera Modules</span>
                                                <span className="mw-chip">SSD</span>
                                                <span className="mw-chip">Comm Modules</span>
                                                <span className="mw-chip">Sensors</span>
                                                <span className="mw-chip">UART/Debug</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="stack-connector"></div>

                        {/* Layer 3: Hardware */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.hardware">硬件生态</Translate></div>
                            <div className="layer-content">
                                <div className="stack-hw-grid">
                                    <Link to="/docs/neoedge-ng4500-series/overview" className="hw-stack-card hw-4500">
                                        <div className="hw-card-image">
                                            <img src="https://www.camthink.ai/resource/neoedge_ng4500_ai_box.png" alt="NeoEdge NG4500" loading="lazy" />
                                        </div>
                                        <div className="hw-info">
                                            <div className="hw-type">High Performance Edge</div>
                                            <h3 className="hw-name">NeoEdge NG4500</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>NVIDIA Jetson</span>
                                            <span>Up to 100+ TOPS</span>
                                        </div>
                                    </Link>
                                    <Link to="/docs/neoeyes-ne503-series/overview" className="hw-stack-card hw-503">
                                        <div className="hw-card-image">
                                            <img src="https://resources.camthink.ai/official-site/menu/ne503.png" alt="NeoEyes NE503" loading="lazy" />
                                        </div>
                                        <div className="hw-info">
                                            <div className="hw-type">AI Camera Pro</div>
                                            <h3 className="hw-name">NeoEyes NE503</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>Hailo-15H SoC</span>
                                            <span>20 TOPS · 4K</span>
                                        </div>
                                    </Link>
                                    <Link to="/docs/neoeyes-ne301-series/overview" className="hw-stack-card hw-301">
                                        <div className="hw-card-image">
                                            <img src="https://www.camthink.ai/resource/neoesye_ne301_computer_vision_camera.png" alt="NeoEyes NE301" loading="lazy" />
                                        </div>
                                        <div className="hw-info">
                                            <div className="hw-type">Intelligent Vision</div>
                                            <h3 className="hw-name">NeoEyes NE301</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>STM32N6 (Arm Cortex-M55)</span>
                                            <span>NPU Integrated</span>
                                        </div>
                                    </Link>
                                    <Link to="/docs/neoeyes-ne101-series/overview" className="hw-stack-card hw-101">
                                        <div className="hw-card-image">
                                            <img src="https://www.camthink.ai/resource/neoeyes_ne101_modular_camera.png" alt="NeoEyes NE101" loading="lazy" />
                                        </div>
                                        <div className="hw-info">
                                            <div className="hw-type">Low Power IoT</div>
                                            <h3 className="hw-name">NeoEyes NE101</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>ESP32-S3</span>
                                            <span>Low-frequency capture</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ================= COMMUNITY ================= */}
                <div className="community-section">
                    <div className="community-bg-image"></div>
                    <div className="community-overlay"></div>

                    <div className="community-content">
                        <div className="section-header">
                            <span className="section-label">COMMUNITY</span>
                            <h2 className="section-title"><Translate id="homepage.community.title">加入开发者社区</Translate></h2>
                            <p className="section-desc">
                                <Translate id="homepage.community.desc">与全球开发者一起探索、创造、分享</Translate>
                            </p>
                        </div>

                        <div className="community-grid">
                            <Link href="https://discord.gg/a8NbPGAJw9" className="community-card">
                                <div className="community-icon"><Icon.Discord /></div>
                                <h3>Discord Server</h3>
                                <p><Translate id="homepage.community.discord">加入实时讨论，获取技术支持</Translate></p>
                                <span className="community-link-text">Join Server <Icon.ArrowRight size={14} /></span>
                            </Link>

                            <Link href="https://github.com/camthink-ai/community/discussions" className="community-card">
                                <div className="community-icon"><Icon.Github /></div>
                                <h3>GitHub Discussions</h3>
                                <p><Translate id="homepage.community.github">提交 Issue，参与功能提案</Translate></p>
                                <span className="community-link-text">View Discussions <Icon.ArrowRight size={14} /></span>
                            </Link>

                            <Link href="https://www.camthink.ai/company/contact-us/" className="community-card">
                                <div className="community-icon"><Icon.Mail /></div>
                                <h3>Contact Us</h3>
                                <p><Translate id="homepage.community.contact">产品咨询与商业合作</Translate></p>
                                <span className="community-link-text">Send Email <Icon.ArrowRight size={14} /></span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
