import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import clsx from 'clsx';
import { Icon, type IconName } from '@site/src/components/icons';
import '../css/welcome.css'; // Ensure we use the shared styles

/** Map resource link id to SVG icon component name */
const RESOURCE_ICON: Record<string, IconName> = {
    overview: 'Overview',
    quickstart: 'Quickstart',
    userguide: 'UserGuide',
    devguide: 'DevGuide',
    hwguide: 'HwGuide',
    swguide: 'SwGuide',
    appguide: 'AppGuide',
    usecases: 'UseCases',
};

const renderResourceIcon = (key: string) => {
    const Cmp = Icon[RESOURCE_ICON[key] ?? 'Overview'];
    return <Cmp size={18} />;
};

const ProductCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const products = [
        {
            id: 'neomind',
            badge: 'NEW',
            title: <Translate id="carousel.neomind.title">NeoMind (Edge AI Platform)</Translate>,
            tagline: <Translate id="carousel.neomind.tagline">Rust + React 构建的边缘 AI 平台 · 开箱即用的 IoT + AI 一体化方案</Translate>,
            description: <Translate id="carousel.neomind.desc">设备管理、实时仪表板、规则引擎、AI Agent、扩展生态、消息通知一应俱全。支持 MQTT/Webhook/BLE 多协议接入，可独立部署也可作为 CamThink 硬件的上位机软件。</Translate>,
            image: 'https://resources.camthink.ai/NeoMind/dashboardDemo.png',
            links: [
                { label: <Translate id="carousel.link.overview">产品概述</Translate>, url: 'docs/neomind/product-overview/what-is-neomind', icon: 'overview' },
                { label: <Translate id="carousel.link.quickstart">快速入门</Translate>, url: 'docs/neomind/quick-start/five-minute-guide', icon: 'quickstart' },
                { label: <Translate id="carousel.link.userguide">用户指南</Translate>, url: 'docs/neomind/user-guide/install-setup', icon: 'userguide' },
                { label: <Translate id="carousel.link.devguide">开发指南</Translate>, url: 'docs/neomind/developer-guide/overview', icon: 'devguide' },
            ]
        },
        {
            id: 'ne503',
            badge: 'NEW',
            title: <Translate id="carousel.ne503.title">NeoEyes NE503 (AI Camera Pro)</Translate>,
            tagline: <Translate id="carousel.ne503.tagline">基于 Hailo-15H 的 20 TOPS 4K 边缘 AI 智能相机</Translate>,
            description: <Translate id="carousel.ne503.desc">Hailo-15H SoC + 20 TOPS NPU + Sony IMX678 4K 成像，支持容器化应用部署、多模型并发推理与 RTSP/Event 输出。IP67 + PoE 一体化交付，面向视觉应用与边缘 AI 二次开发。</Translate>,
            image: 'https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-main.png',
            links: [
                { label: <Translate id="carousel.link.overview">产品概述</Translate>, url: 'docs/neoeyes-ne503-series/overview', icon: 'overview' },
                { label: <Translate id="carousel.link.quickstart">快速入门</Translate>, url: 'docs/neoeyes-ne503-series/quick-start', icon: 'quickstart' },
                { label: <Translate id="carousel.link.hwguide">硬件指南</Translate>, url: 'docs/neoeyes-ne503-series/hardware-guide/specifications', icon: 'hwguide' },
                { label: <Translate id="carousel.link.swguide">软件指南</Translate>, url: 'docs/neoeyes-ne503-series/software-guide/system-architecture', icon: 'swguide' },
            ]
        },
        {
            id: 'ne301',
            badge: 'HOT',
            title: <Translate id="carousel.ne301.title">NeoEyes NE301 (AI Camera)</Translate>,
            tagline: <Translate id="carousel.ne301.tagline">基于 STM32N6 的全新低功耗边缘 AI 相机</Translate>,
            description: <Translate id="carousel.ne301.desc">高性能 Cortex-M55 + NPU 架构，支持本地实时推理。模块化设计适配多种镜头与传感器，是图像视觉与AIOT节点的理想选择。</Translate>,
            image: 'img/ne301/overview/301.png',
            links: [
                { label: <Translate id="carousel.link.overview">产品概述</Translate>, url: 'docs/neoeyes-ne301-series/overview', icon: 'overview' },
                { label: <Translate id="carousel.link.quickstart">快速入门</Translate>, url: 'docs/neoeyes-ne301-series/quick-start', icon: 'quickstart' },
                { label: <Translate id="carousel.link.devguide">开发指南</Translate>, url: 'docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide', icon: 'devguide' },
                { label: <Translate id="carousel.link.appguide">应用指南</Translate>, url: 'docs/neoeyes-ne301-series/application-guide/model-training', icon: 'appguide' },
            ]
        },
        {
            id: 'ne101',
            badge: '',
            title: <Translate id="carousel.ne101.title">NeoEyes NE101 (IoT Node)</Translate>,
            tagline: <Translate id="carousel.ne101.tagline">基于 ESP32-S3 的超低功耗视觉感知节点</Translate>,
            description: <Translate id="carousel.ne101.desc">专为电池供电场景设计，支持 Wi-Fi//Cat.1/Wi-Fi HaLow 多种连接。极简架构，从深度休眠中毫秒级唤醒抓拍，适用于野外监测与抄表应用。</Translate>,
            image: 'img/Overview/NE101/NE101.png',
            links: [
                { label: <Translate id="carousel.link.overview">产品概述</Translate>, url: 'docs/neoeyes-ne101-series/overview', icon: 'overview' },
                { label: <Translate id="carousel.link.quickstart">快速入门</Translate>, url: 'docs/neoeyes-ne101-series/quick-start', icon: 'quickstart' },
                { label: <Translate id="carousel.link.devguide">开发指南</Translate>, url: 'docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide', icon: 'devguide' },
                { label: <Translate id="carousel.link.appguide">应用指南</Translate>, url: 'docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition', icon: 'appguide' },
            ]
        },
        {
            id: 'ng4500',
            badge: 'PRO',
            title: <Translate id="carousel.ng4500.title">NeoEdge NG4500 (AI Box)</Translate>,
            tagline: <Translate id="carousel.ng4500.tagline">基于 NVIDIA Jetson 的高性能边缘计算网关</Translate>,
            description: <Translate id="carousel.ng4500.desc">提供 21~100 + TOPS 算力，支持多路视频分析与大语言模型 (LLM) 边缘部署。丰富的接口资源(CAN/232/485)，赋能复杂的工业与车载 AI 应用。</Translate>,
            image: 'img/Overview/NG45xx/NG45XX.png',
            links: [
                { label: <Translate id="carousel.link.overview">产品概述</Translate>, url: 'docs/neoedge-ng4500-series/overview', icon: 'overview' },
                { label: <Translate id="carousel.link.quickstart">快速入门</Translate>, url: 'docs/neoedge-ng4500-series/quick-start', icon: 'quickstart' },
                { label: <Translate id="carousel.link.hwguide">硬件指南</Translate>, url: 'docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide', icon: 'hwguide' },
                { label: <Translate id="carousel.link.usecases">应用案例</Translate>, url: 'docs/neoedge-ng4500-series/application-guide/deepseek-r1', icon: 'usecases' },
            ]
        }
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    // Auto-play (optional, can be disabled)
    useEffect(() => {
        const timer = setInterval(nextSlide, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="product-carousel-wrapper">
            <div className="carousel-container">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={clsx('carousel-slide', { 'active': index === activeIndex })}
                    >
                        {/* Left Column: Visual */}
                        <div className="slide-visual">
                            <div className="slide-image-container">
                                <img src={useBaseUrl(product.image)} alt={typeof product.title === 'string' ? product.title : 'Product Image'} />
                                {product.badge && <span className="slide-badge">{product.badge}</span>}
                            </div>
                        </div>

                        {/* Right Column: Content */}
                        <div className="slide-content">
                            <h3 className="slide-title">{product.title}</h3>
                            <p className="slide-tagline">{product.tagline}</p>
                            <p className="slide-desc">{product.description}</p>

                            <div className="resource-grid">
                                {product.links.map((link, idx) => (
                                    <Link key={idx} to={useBaseUrl(link.url)} className="resource-card">
                                        <span className="resource-icon">{renderResourceIcon(link.icon)}</span>
                                        <span className="resource-label">{link.label}</span>
                                        <span className="resource-arrow"><Icon.ArrowRight size={16} /></span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Controls */}
                <button className="carousel-btn btn-prev" onClick={prevSlide} aria-label="Previous">‹</button>
                <button className="carousel-btn btn-next" onClick={nextSlide} aria-label="Next">›</button>

                <div className="carousel-dots">
                    {products.map((_, idx) => (
                        <button
                            key={idx}
                            className={clsx('dot', { 'active': idx === activeIndex })}
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCarousel;
