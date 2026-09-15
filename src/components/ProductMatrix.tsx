import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import { Icon } from '@site/src/components/icons';
// 站内文档链接统一取自数据文件，目录重构后只改 siteLinks.cjs
// @ts-ignore — CommonJS 数据文件，无类型声明（构建时由 webpack 解析）
import LINKS from '@site/src/data/siteLinks.cjs';

/**
 * 产品矩阵 —— 替代原自动轮播：
 * NeoMind 平台宽卡（置顶）+ 5 张硬件卡一屏平铺，全部入口可见、无自动播放。
 */

interface HardwareCard {
    id: string; // 与 siteLinks.cjs 的 products 键一一对应
    badge?: string;
    name: string;
    type: string;
    chips: [string, string];
    image: string; // 相对 baseUrl 的本地 WebP
}

const HW_CARDS: HardwareCard[] = [
    {
        id: 'ne302',
        badge: 'NEW',
        name: 'NeoEyes NE302',
        type: 'Mini AI Vision',
        chips: ['STM32N6', '4 MP · 38×38 mm'],
        image: 'img/home/hw/ne302.webp',
    },
    {
        id: 'ne301',
        name: 'NeoEyes NE301',
        type: 'Intelligent Vision',
        chips: ['STM32N6 (Cortex-M55)', 'NPU Integrated'],
        image: 'img/home/hw/ne301.webp',
    },
    {
        id: 'ne503',
        name: 'NeoEyes NE503',
        type: 'AI Camera Pro',
        chips: ['Hailo-15H SoC', '20 TOPS · 4K'],
        image: 'img/home/hw/ne503.webp',
    },
    {
        id: 'ne101',
        name: 'NeoEyes NE101',
        type: 'Low Power IoT',
        chips: ['ESP32-S3', 'Ultra-low Power'],
        image: 'img/home/hw/ne101.webp',
    },
    {
        id: 'ng4500',
        name: 'NeoEdge NG4500',
        type: 'High Performance Edge',
        chips: ['NVIDIA Jetson', '21~100+ TOPS'],
        image: 'img/home/hw/ng4500.webp',
    },
];

const ProductMatrix = () => {
    const base = useBaseUrl('/');

    return (
        <div className="product-matrix">
            {/* NeoMind 平台宽卡 */}
            <Link to={LINKS.neomind.overview} className="matrix-platform-card">
                <div className="matrix-platform-content">
                    <div className="matrix-platform-head">
                        <span className="matrix-badge"><Translate id="matrix.badge.platform">平台</Translate></span>
                        <h3 className="matrix-platform-title"><Translate id="carousel.neomind.title">NeoMind (Edge AI Platform)</Translate></h3>
                    </div>
                    <p className="matrix-platform-desc">
                        <Translate id="homepage.matrix.neomind.desc">设备管理、实时仪表板、规则引擎、AI Agent、扩展生态、消息通知一应俱全，支持 MQTT/Webhook/BLE 多协议接入。</Translate>
                    </p>
                    <div className="matrix-links">
                        <Link to={LINKS.neomind.overview} className="matrix-link">
                            <Translate id="carousel.link.overview">产品概述</Translate>
                            <Icon.ArrowRight size={14} />
                        </Link>
                        <Link to={LINKS.neomind.quickStart} className="matrix-link">
                            <Translate id="carousel.link.quickstart">快速入门</Translate>
                            <Icon.ArrowRight size={14} />
                        </Link>
                        <Link to={LINKS.neomind.userGuide} className="matrix-link">
                            <Translate id="carousel.link.userguide">用户指南</Translate>
                            <Icon.ArrowRight size={14} />
                        </Link>
                        <Link to={LINKS.neomind.devGuide} className="matrix-link">
                            <Translate id="carousel.link.devguide">开发指南</Translate>
                            <Icon.ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
                <div className="matrix-platform-visual">
                    <img src={`${base}img/home/carousel/neomind.webp`} alt="NeoMind Edge AI Platform" loading="eager" decoding="async" />
                </div>
            </Link>

            {/* 硬件卡片矩阵 */}
            <div className="matrix-grid">
                {HW_CARDS.map((card) => {
                    const links = LINKS.products[card.id];
                    return (
                        <div key={card.id} className={`matrix-card matrix-${card.id}`}>
                            <Link to={links.overview} className="matrix-card-visual" aria-label={card.name}>
                                <img src={`${base}${card.image}`} alt={card.name} loading="lazy" decoding="async" />
                                {card.badge && <span className="matrix-card-badge">{card.badge}</span>}
                            </Link>
                            <div className="matrix-card-body">
                                <div className="matrix-card-type">{card.type}</div>
                                <Link to={links.overview} className="matrix-card-name">{card.name}</Link>
                                <div className="matrix-card-chips">
                                    {card.chips.map((c) => <span key={c} className="matrix-chip">{c}</span>)}
                                </div>
                                <div className="matrix-card-links">
                                    <Link to={links.overview} className="matrix-link">
                                        <Translate id="carousel.link.overview">产品概述</Translate>
                                    </Link>
                                    <span className="matrix-link-divider" />
                                    <Link to={links.quickStart} className="matrix-link">
                                        <Translate id="carousel.link.quickstart">快速入门</Translate>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductMatrix;
