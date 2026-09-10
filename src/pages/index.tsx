import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import ProductMatrix from '@site/src/components/ProductMatrix';
import { Icon } from '@site/src/components/icons';
import '../css/welcome.css';

/** 按场景快速开始 —— 全部链接已对照构建产物核实 */
const USE_CASES = [
    {
        id: 'detection',
        title: <Translate id="homepage.usecase.detection.title">目标检测</Translate>,
        desc: <Translate id="homepage.usecase.detection.desc">YOLO 系列模型训练与相机端部署推理</Translate>,
        url: '/docs/neomind/use-cases/object-detection',
        icon: (
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v2M12 17v2M5 12h2M17 12h2M7.7 7.7l1.4 1.4M14.9 14.9l1.4 1.4M7.7 16.3l1.4-1.4M14.9 9.1l1.4-1.4" /><circle cx="12" cy="12" r="3" /></svg>
        ),
    },
    {
        id: 'ocr',
        title: <Translate id="homepage.usecase.ocr.title">OCR 文字识别</Translate>,
        desc: <Translate id="homepage.usecase.ocr.desc">相机抓拍图片的文字提取与结构化</Translate>,
        url: '/docs/neomind/use-cases/ocr-text-extraction',
        icon: (
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
        ),
    },
    {
        id: 'voice',
        title: <Translate id="homepage.usecase.voice.title">语音交互</Translate>,
        desc: <Translate id="homepage.usecase.voice.desc">ASR → LLM → TTS 全链路语音方案</Translate>,
        url: '/docs/neomind/use-cases/voice',
        icon: (
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3" /></svg>
        ),
    },
    {
        id: 'onboard',
        title: <Translate id="homepage.usecase.onboard.title">设备接入</Translate>,
        desc: <Translate id="homepage.usecase.onboard.desc">MQTT/BLE/Webhook 设备接入 NeoMind 平台</Translate>,
        url: '/docs/neomind/user-guide/onboard-device',
        icon: (
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>
        ),
    },
];

/** 最新文档 —— 与 docs/index.md「最新文档」保持同一批条目，更新时两处同步 */
const LATEST_DOCS = [
    {
        badge: 'NEW',
        title: <Translate id="latest.ne302.title">NeoEyes NE302 系列文档上线</Translate>,
        date: '2026-09-05',
        url: '/docs/neoeyes-ne302-series/ne302-overview',
    },
    {
        badge: 'NEW',
        title: <Translate id="latest.hef.title">NE503 模型训练与 HEF 转换</Translate>,
        date: '2026-07-21',
        url: '/docs/neoeyes-ne503-series/application-guide/model-training-and-hef',
    },
    {
        title: <Translate id="latest.verified.title">NE503 Verified Apps</Translate>,
        date: '2026-07-16',
        url: '/docs/neoeyes-ne503-series/application-guide/verified-apps',
    },
    {
        title: <Translate id="latest.market.title">NeoMind 扩展市场源切换</Translate>,
        date: '2026-07-10',
        url: '/docs/neomind/user-guide/extensions',
    },
];

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Welcome to ${siteConfig.title}`}
            description="Edge AI Platform Wiki - Build Intelligent Devices for the Real World">

            <div className="welcome-page-container">

                {/* ================= HERO ================= */}
                <div className="hero-section hero-platform">
                    {/* LCP 背景图：真实 <img> + fetchpriority，避免 CSS 背景被 webpack 重写哈希导致双重下载 */}
                    <img
                        className="hero-bg-image"
                        src="/img/hero-platform.webp"
                        alt=""
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                    />
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
                                <Translate id="homepage.hero.cta.docs">文档中心</Translate>
                                <Icon.ArrowRight size={16} className="btn-arrow" />
                            </Link>
                            <Link href="#products" className="btn-hero-ghost">
                                <Translate id="homepage.hero.cta.products">选硬件产品</Translate>
                            </Link>
                            <Link to="https://github.com/camthink-ai" className="btn-github">
                                <Icon.Github size={18} className="btn-github-icon" />
                                <Translate id="homepage.hero.cta.github">GitHub Star</Translate>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ================= 产品矩阵 ================= */}
                <div className="section-container" id="products">
                    <div className="section-header">
                        <span className="section-label">PRODUCTS</span>
                        <h2 className="section-title"><Translate id="homepage.matrix.title">产品与平台</Translate></h2>
                        <p className="section-desc">
                            <Translate id="homepage.matrix.desc">五条硬件产品线与 NeoMind 平台，全部文档入口一屏直达</Translate>
                        </p>
                    </div>

                    <ProductMatrix />
                </div>

                {/* ================= 按场景快速开始 ================= */}
                <div className="section-container usecase-section">
                    <div className="section-header">
                        <span className="section-label">QUICK STARTS</span>
                        <h2 className="section-title"><Translate id="homepage.usecase.title">按场景快速开始</Translate></h2>
                        <p className="section-desc">
                            <Translate id="homepage.usecase.desc">带着任务来？从这里直接进入对应方案文档</Translate>
                        </p>
                    </div>

                    <div className="usecase-grid">
                        {USE_CASES.map((u) => (
                            <Link key={u.id} to={u.url} className="usecase-card">
                                <span className="usecase-icon">{u.icon}</span>
                                <span className="usecase-title">{u.title}</span>
                                <span className="usecase-desc">{u.desc}</span>
                                <span className="usecase-arrow"><Icon.ArrowRight size={15} /></span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ================= 平台与工具 ================= */}
                <div className="tech-stack-section">
                    <div className="tech-stack-header">
                        <div className="section-label">PLATFORM & TOOLS</div>
                        <h2><Translate id="homepage.platform.title">平台与工具</Translate></h2>
                        <p className="tech-stack-subtitle"><Translate id="homepage.platform.desc">软件平台与模型工具链，覆盖从设备到应用的完整链路</Translate></p>
                    </div>

                    <div className="neomind-layer-grid">
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

                {/* ================= 最新文档 ================= */}
                <div className="section-container latest-section">
                    <div className="section-header">
                        <span className="section-label">WHAT'S NEW</span>
                        <h2 className="section-title"><Translate id="homepage.latest.title">最新文档</Translate></h2>
                    </div>

                    <div className="latest-grid">
                        {LATEST_DOCS.map((d) => (
                            <Link key={d.url} to={d.url} className="latest-card">
                                <div className="latest-meta">
                                    {d.badge && <span className="latest-badge">{d.badge}</span>}
                                    <span className="latest-date">{d.date}</span>
                                </div>
                                <div className="latest-title">{d.title}</div>
                                <span className="latest-arrow"><Icon.ArrowRight size={15} /></span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ================= COMMUNITY ================= */}
                <div className="community-section">
                    <div className="community-bg-image"></div>

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
