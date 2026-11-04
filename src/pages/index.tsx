import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import { Icon } from '@site/src/components/icons';
// 站内文档链接统一取自数据文件，目录重构后只改 siteLinks.cjs
// @ts-ignore — CommonJS 数据文件，无类型声明（构建时由 webpack 解析）
import LINKS from '@site/src/data/siteLinks.cjs';
// @ts-ignore — CommonJS 工具，无类型声明
import { withWikiUtm } from '@site/src/utils/utm.cjs';
import '../css/welcome.css';

/**
 * 独立首页 —— 参照 camthink-homepage-reference.html 重设计：
 * Hero（标题 + 全站搜索 + 产品图）→ 产品网格 → 软件平台 → 任务入口 → 最新文档 / 帮助。
 * Navbar 与 Footer 沿用全站组件，本页不重复实现。
 */

/** 产品网格 —— 顺序与参考稿一致；small = 方形小图，medium = 竖版长图略缩 */
const PRODUCTS = [
    { id: 'ne302', name: 'NE302', image: '/img/home/hw/ne302.webp', medium: true },
    { id: 'ne301', name: 'NE301', image: '/img/home/hw/ne301.webp', small: true },
    { id: 'ne503', name: 'NE503', image: '/img/home/hw/ne503.webp' },
    { id: 'ne101', name: 'NE101', image: '/img/home/hw/ne101.webp', small: true },
    { id: 'ng4500', name: 'NG4500', image: '/img/home/hw/ng4500.webp' },
] as const;

/** 「你想构建什么」—— 引用 Edge AI 解决方案，路径与 Footer 同源（siteLinks.solutionCases），缩略图取自各方案文档 */
const SOLUTION_PATHS = Object.fromEntries(
    LINKS.solutionCases.map((s) => [s.id, s.path]),
) as Record<string, string>;

const SOLUTIONS = [
    {
        id: 'waterMeter',
        title: <Translate id="home.tasks.water.title">水表自动抄读</Translate>,
        desc: <Translate id="home.tasks.water.desc">相机本地 OCR：旧表不改，读数自动入库，全量留痕可回溯。</Translate>,
        image: '/img/home/solutions/water-meter.webp',
    },
    {
        id: 'smartGym',
        title: <Translate id="home.tasks.gym.title">智慧健身房</Translate>,
        desc: <Translate id="home.tasks.gym.desc">无感识别 + 本地分析：器械占用、训练报告，数据不出场馆。</Translate>,
        image: '/img/home/solutions/smart-gym.webp',
    },
    {
        id: 'visionScene',
        title: <Translate id="home.tasks.scene.title">视觉场景理解</Translate>,
        desc: <Translate id="home.tasks.scene.desc">提示词定义任务，画面变结构化指标，数据不出场。</Translate>,
        image: '/img/home/solutions/vision-scene.webp',
    },
    {
        id: 'peopleCounting',
        title: <Translate id="home.tasks.people.title">客流统计</Translate>,
        desc: <Translate id="home.tasks.people.desc">画线即统计：越线客流双向计数，MQTT/Webhook 直推业务系统。</Translate>,
        image: '/img/home/solutions/people-counting.webp',
    },
];

/** 最新文档 —— 与参考稿一致的三条入门路径（指南 / 平台 / 模型） */
const LATEST_DOCS = [
    {
        badge: <Translate id="home.latest.badge.guide">指南</Translate>,
        title: <Translate id="home.latest.ne302">NE302：开箱与首次连接</Translate>,
        url: LINKS.products.ne302.quickStart,
    },
    {
        badge: <Translate id="home.latest.badge.platform">平台</Translate>,
        title: <Translate id="home.latest.neomind">NeoMind：安装部署指南</Translate>,
        url: LINKS.neomind.userGuide,
    },
    {
        badge: <Translate id="home.latest.badge.models">模型</Translate>,
        title: <Translate id="home.latest.toolstack">AI ToolStack：模型部署</Translate>,
        url: LINKS.software.aiToolStack,
    },
];

export default function Home(): JSX.Element {
    const { siteConfig, i18n } = useDocusaurusContext();
    // 搜索提交到当前语言站点的 /search 页（search-local 插件读取 ?q= 自动检索）
    // 注意：locale 路径前缀保留原始大小写（如 /zh-Hans/），不要 toLowerCase
    const searchAction =
        i18n.currentLocale === i18n.defaultLocale ? '/search' : `/${i18n.currentLocale}/search`;
    const searchPlaceholder = translate({
        id: 'home.hero.searchPlaceholder',
        message: '搜索产品、指南与故障排查…',
    });

    return (
        <Layout
            title={`Welcome to ${siteConfig.title}`}
            description={translate({
                id: 'home.meta.description',
                message: '从设备开箱到模型部署，构建 CamThink 应用所需的一切都在这里。',
            })}>

            <main className="home-page">
                {/* ================= HERO ================= */}
                <section className="home-hero" aria-labelledby="home-title">
                    {/* 原 hero 产品合影铺满背景：横向渐变从右侧渐显，multiply 隐去浅灰底 */}
                    <img
                        className="hero-bg"
                        src="/img/home/hero-family.webp"
                        alt=""
                        aria-hidden="true"
                        width={1600}
                        height={744}
                        fetchpriority="high"
                    />
                    <div className="hero-inner">
                        <div>
                            <p className="hero-eyebrow">CAMTHINK WIKI</p>
                            <h1 id="home-title">
                                <Translate id="home.hero.title">你的边缘 AI 之旅，从这里开始。</Translate>
                            </h1>
                            <p className="hero-intro">
                                <Translate id="home.hero.intro">从设备开箱到模型部署，构建 CamThink 应用所需的一切都在这里。</Translate>
                            </p>

                            <form className="hero-search" action={searchAction} role="search">
                                <Icon.Search size={20} />
                                <input
                                    type="search"
                                    name="q"
                                    required
                                    aria-label={searchPlaceholder}
                                    placeholder={searchPlaceholder}
                                />
                                <button type="submit" aria-label={searchPlaceholder}>
                                    <span aria-hidden="true">→</span>
                                </button>
                            </form>

                            <div className="hero-actions">
                                <a className="btn-primary" href="#products">
                                    <Translate id="home.hero.cta.start">快速开始</Translate>
                                    <span aria-hidden="true"> →</span>
                                </a>
                                <Link to={LINKS.docsHome}>
                                    <Translate id="home.hero.cta.docs">浏览文档</Translate>
                                </Link>
                            </div>

                            <div className="hero-popular">
                                <span>
                                    <Translate id="home.hero.popular">热门链接：</Translate>
                                </span>
                                <Link to={LINKS.products.ne302.quickStart}>
                                    <Translate id="home.hero.popular.ne302">NE302 快速开始</Translate>
                                </Link>
                                <Link to={LINKS.neomind.userGuide}>
                                    <Translate id="home.hero.popular.neomind">NeoMind 安装部署</Translate>
                                </Link>
                                <Link to={LINKS.software.aiToolStack}>
                                    <Translate id="home.hero.popular.model">模型部署</Translate>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="home-content">
                    {/* ================= 产品网格 ================= */}
                    <section id="products" className="home-products" aria-labelledby="products-title">
                        <div className="section-head">
                            <h2 id="products-title">
                                <Translate id="home.products.title">找到你的产品</Translate>
                            </h2>
                            <Link to={LINKS.docsHome}>
                                <Translate id="home.products.allDocs">全部文档</Translate>
                                <span aria-hidden="true"> →</span>
                            </Link>
                        </div>

                        <div className="product-grid">
                            {PRODUCTS.map((p) => (
                                <article key={p.id} className="product-card">
                                    <Link className="product-image" to={LINKS.products[p.id].overview} aria-label={p.name}>
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            loading="lazy"
                                            className={p.small ? 'img-small' : p.medium ? 'img-medium' : undefined}
                                        />
                                    </Link>
                                    <h3>
                                        <Link to={LINKS.products[p.id].overview}>{p.name}</Link>
                                    </h3>
                                    <div className="product-actions">
                                        <Link to={LINKS.products[p.id].quickStart}>
                                            <Translate id="home.products.quickStart">快速开始</Translate>
                                            <span aria-hidden="true"> →</span>
                                        </Link>
                                        <Link to={LINKS.products[p.id].overview}>
                                            <Translate id="home.products.docs">文档</Translate>
                                        </Link>
                                        <a
                                            href={withWikiUtm(LINKS.products[p.id].store, 'home-product')}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <Translate id="home.products.buy">购买</Translate>
                                            <span aria-hidden="true"> ↗</span>
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* ================= 软件平台 ================= */}
                    <section className="software-grid" aria-label={translate({
                        id: 'home.software.ariaLabel',
                        message: '软件平台',
                    })}>
                        <article className="software-card">
                            <img
                                className="dashboard-shot"
                                src="/img/home/neomind-dashboard.webp"
                                alt="NeoMind platform dashboard"
                                loading="lazy"
                                width={1200}
                                height={596}
                            />
                            <div>
                                <h2>NeoMind</h2>
                                <p>
                                    <Translate id="home.software.neomind.desc">连接设备、管理数据，构建智能应用。</Translate>
                                </p>
                                <Link to={LINKS.neomind.overview}>
                                    <Translate id="home.software.viewDocs">查看文档</Translate>
                                    <span aria-hidden="true"> →</span>
                                </Link>
                            </div>
                        </article>

                        <article className="software-card">
                            <img
                                className="dashboard-shot"
                                src="/img/home/aitoolstack.webp"
                                alt="AI ToolStack"
                                loading="lazy"
                                width={1200}
                                height={762}
                            />
                            <div>
                                <h2>AI ToolStack</h2>
                                <p>
                                    <Translate id="home.software.toolstack.desc">训练、优化模型，并部署到边缘设备。</Translate>
                                </p>
                                <Link to={LINKS.software.aiToolStack}>
                                    <Translate id="home.software.viewDocs">查看文档</Translate>
                                    <span aria-hidden="true"> →</span>
                                </Link>
                            </div>
                        </article>
                    </section>

                    {/* ================= AI MODEL ZOO ================= */}
                    <a
                        className="zoo-banner"
                        href={withWikiUtm('https://www.camthink.ai/developer-center/models/', 'home-zoo')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <span className="zoo-icon"><Icon.AITools size={22} /></span>
                        <span className="zoo-text">
                            <strong>AI Model Zoo</strong>
                            <small>
                                <Translate id="home.zoo.desc">官方预训练模型库：128+ 个场景调优的视觉模型（YOLOv8 / YOLO11），PT / ONNX / TFLite 开箱即用。</Translate>
                            </small>
                        </span>
                        <span className="zoo-cta">
                            <Translate id="home.zoo.cta">浏览模型</Translate>
                            <span aria-hidden="true"> →</span>
                        </span>
                    </a>

                    {/* ================= 任务入口 ================= */}
                    <section aria-labelledby="tasks-title">
                        <h2 id="tasks-title">
                            <Translate id="home.tasks.title">你想构建什么？</Translate>
                        </h2>
                        <div className="task-grid">
                            {SOLUTIONS.map((t) => (
                                <Link key={t.id} className="task-card" to={SOLUTION_PATHS[t.id]}>
                                    <div className="task-thumb">
                                        <img src={t.image} alt="" loading="lazy" />
                                    </div>
                                    <div className="task-body">
                                        <h3>{t.title}</h3>
                                        <p>{t.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* ================= 最新文档 / 帮助 ================= */}
                    <div className="bottom-grid">
                        <section aria-labelledby="latest-title">
                            <h2 id="latest-title">
                                <Translate id="home.latest.title">最新文档</Translate>
                            </h2>
                            <div className="doc-list">
                                {LATEST_DOCS.map((d) => (
                                    <Link key={d.url} to={d.url}>
                                        <span className="doc-badge">{d.badge}</span>
                                        <span>{d.title}</span>
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section aria-labelledby="help-title">
                            <h2 id="help-title">
                                <Translate id="home.help.title">需要帮助？</Translate>
                            </h2>
                            <div className="doc-list">
                                <Link to={LINKS.neomind.troubleshooting}>
                                    <Icon.FileText size={24} />
                                    <span>
                                        <strong>
                                            <Translate id="home.help.troubleshooting.title">故障排查</Translate>
                                        </strong>
                                        <small>
                                            <Translate id="home.help.troubleshooting.desc">服务启动、设备接入、MQTT 等常见问题的诊断与修复。</Translate>
                                        </small>
                                    </span>
                                    <span aria-hidden="true">→</span>
                                </Link>
                                <a href={withWikiUtm(LINKS.community.github, 'home-help')} target="_blank" rel="noopener noreferrer">
                                    <Icon.Github size={24} />
                                    <span>
                                        <strong>GitHub</strong>
                                        <small>
                                            <Translate id="home.help.github.desc">开源仓库、示例代码与问题反馈。</Translate>
                                        </small>
                                    </span>
                                    <span aria-hidden="true">→</span>
                                </a>
                                <a href={withWikiUtm(LINKS.community.contact, 'home-help')} target="_blank" rel="noopener noreferrer">
                                    <Icon.Mail size={24} />
                                    <span>
                                        <strong>
                                            <Translate id="home.help.contact.title">联系支持</Translate>
                                        </strong>
                                        <small>
                                            <Translate id="home.help.contact.desc">获取产品与文档的技术支持。</Translate>
                                        </small>
                                    </span>
                                    <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
