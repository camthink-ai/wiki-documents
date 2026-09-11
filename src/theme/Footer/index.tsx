import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import { Icon } from '@site/src/components/icons';
// @ts-ignore — CommonJS 数据文件，无类型声明（构建时由 webpack 解析）
import LINKS from '@site/src/data/siteLinks.cjs';
import '@site/src/css/footer.css';

/**
 * 全站自定义 Footer（eject 覆盖 @theme/Footer）。
 *
 * 布局：左侧品牌块（logo / 一句话定位 / 社交入口）+ 右侧四列链接，
 * 四列与侧边栏 IA 对齐：硬件产品 / 软件平台 / 解决方案 / 资源与支持。
 * 所有文档链接取自 src/data/siteLinks.cjs（目录重构后只需改那一处）。
 */

interface FooterLink {
  key: string;
  label: React.ReactNode;
  to?: string;
  href?: string;
}

interface FooterColumn {
  key: string;
  title: React.ReactNode;
  items: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    key: 'hardware',
    title: <Translate id="footer.col.hardware">硬件产品</Translate>,
    items: [
      { key: 'ng4500', label: 'NeoEdge NG4500', to: LINKS.products.ng4500.overview },
      { key: 'ne503', label: 'NeoEyes NE503', to: LINKS.products.ne503.overview },
      { key: 'ne301', label: 'NeoEyes NE301', to: LINKS.products.ne301.overview },
      { key: 'ne302', label: 'NeoEyes NE302', to: LINKS.products.ne302.overview },
      { key: 'ne101', label: 'NeoEyes NE101', to: LINKS.products.ne101.overview },
    ],
  },
  {
    key: 'software',
    title: <Translate id="footer.col.software">软件平台</Translate>,
    items: [
      { key: 'neomind', label: <Translate id="footer.item.neomind">NeoMind 平台</Translate>, to: LINKS.neomind.overview },
      { key: 'quickstart', label: <Translate id="footer.item.quickstart">快速入门</Translate>, to: LINKS.neomind.quickStart },
      { key: 'devguide', label: <Translate id="footer.item.devguide">开发指南</Translate>, to: LINKS.neomind.devGuide },
      { key: 'toolstack', label: 'AI ToolStack', to: LINKS.software.aiToolStack },
    ],
  },
  {
    key: 'solutions',
    title: <Translate id="footer.col.solutions">解决方案</Translate>,
    items: [
      { key: 'waterMeter', label: <Translate id="footer.item.waterMeter">水表识别方案</Translate>, to: LINKS.solutions.waterMeter },
      { key: 'smartGym', label: <Translate id="footer.item.smartGym">智慧健身房方案</Translate>, to: LINKS.solutions.smartGym },
    ],
  },
  {
    key: 'resources',
    title: <Translate id="footer.col.resources">资源与支持</Translate>,
    items: [
      { key: 'docsHome', label: <Translate id="footer.item.docsHome">文档中心</Translate>, to: LINKS.docsHome },
      { key: 'ne503Faq', label: <Translate id="footer.item.ne503Faq">NE503 故障排查</Translate>, to: LINKS.resources.ne503Troubleshooting },
      { key: 'website', label: <Translate id="footer.item.website">官方网站</Translate>, href: LINKS.community.website },
      { key: 'store', label: <Translate id="footer.item.store">在线商店</Translate>, href: LINKS.community.store },
      { key: 'contact', label: <Translate id="footer.item.contact">联系我们</Translate>, href: LINKS.community.contact },
    ],
  },
];

const SOCIALS = [
  { key: 'discord', label: 'Discord', href: LINKS.community.discord, icon: <Icon.Discord size={18} /> },
  { key: 'x', label: 'X (Twitter)', href: LINKS.community.x, icon: <Icon.X size={15} /> },
  { key: 'youtube', label: 'YouTube', href: LINKS.community.youtube, icon: <Icon.Youtube size={18} /> },
  { key: 'github', label: 'GitHub', href: LINKS.community.github, icon: <Icon.Github size={17} /> },
];

export default function Footer(): JSX.Element {
  return (
    <footer className="ct-footer">
      <div className="ct-footer__inner">
        <div className="ct-footer__brand">
          <Link to="/" className="ct-footer__logo-link" aria-label="CamThink Wiki">
            <img
              src={useBaseUrl('/img/logo_dark.svg')}
              alt="CamThink"
              className="ct-footer__logo"
              loading="lazy"
            />
          </Link>
          <p className="ct-footer__tagline">
            <Translate id="footer.tagline">开放硬件 × 开源软件，一站式构建你的边缘 AI 应用</Translate>
          </p>
          <div className="ct-footer__socials">
            {SOCIALS.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="ct-footer__social"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.key} className="ct-footer__col">
            <h3 className="ct-footer__col-title">{col.title}</h3>
            <ul className="ct-footer__list">
              {col.items.map((item) => (
                <li key={item.key}>
                  <Link to={item.to} href={item.href} className="ct-footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ct-footer__bottom">
        <span>
          Copyright © {new Date().getFullYear()} CamThink Technology Co., Ltd. All
          Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
