// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/* -------------------------------------------------- */
/* 1️⃣  环境检测 / 动态变量                             */
/* -------------------------------------------------- */
const IS_GITHUB = process.env.GITHUB_ACTIONS === 'true';
const BASE_URL  = process.env.BASE_URL  // 手动覆盖优先
  ?? (IS_GITHUB ? '/wiki-documents/' : '/');

const SITE_URL  = process.env.SITE_URL  // 手动覆盖优先
  ?? (IS_GITHUB ? 'https://camthink-ai.github.io' : 'https://docs.camthink.ai');

/** @type {import('@docusaurus/types').Config} */
const config = {
  /* -------------------------------------------------- */
  /* 2️⃣  站点信息                                       */
  /* -------------------------------------------------- */
  title: 'CamThink',
  tagline:
    'Through detailed documentation, practical tutorials, and active community support, we help developers leverage open hardware for AI project development and innovation.',
  favicon: 'img/favicon.ico',

  /* GitHub / Cloudflare 共用（由上方动态注入） */
  url: SITE_URL,
  baseUrl: BASE_URL,

  /* GitHub Pages 部署 (org/user & repo) — 不在 GitHub 可忽略 */
  organizationName: 'camthink-ai',
  projectName: 'wiki-documents',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  /* -------------------------------------------------- */
  /* 3️⃣  国际化                                         */
  /* -------------------------------------------------- */
  i18n: {
    defaultLocale: 'en',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': { htmlLang: 'zh-Hans', label: '中文' },
      en:        { htmlLang: 'en-US',   label: 'English' },
    },
  },

  /* -------------------------------------------------- */
  /* 4️⃣  插件 / 主题                                     */
  /* -------------------------------------------------- */
  plugins: [
    'docusaurus-plugin-image-zoom',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/docs',
        indexDocs: true,
        indexBlog: false,
        docsDir: 'docs',
      },
    ],
  ],
  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: undefined,  // 关闭 “编辑此页”
          routeBasePath: '/',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],

  /* -------------------------------------------------- */
  /* 5️⃣  主题配置 (Navbar / Footer / Prism …)           */
  /* -------------------------------------------------- */
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/Camthink-logo.png',
      navbar: {
        title: '',
        logo: {
          alt: 'CamThink',
          src: 'img/logo.svg',
          srcDark: 'img/logo_dark.svg',
        },
        items: [
          // { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
          { href: 'https://github.com/camthink-ai',            position: 'right', label: 'GitHub' },
          { type: 'localeDropdown',                            position: 'right' },
        ],
      },
      zoom: {
        selector: '.markdown img:not(.no-zoom), article img:not(.no-zoom), .theme-doc-markdown img:not(.no-zoom)',
        background: { light: 'rgba(255, 255, 255, 0.9)', dark: 'rgba(0, 0, 0, 0.8)' },
        config: { margin: 24, scrollOffset: 0 },
      },
      mermaid: { theme: { light: 'neutral', dark: 'forest' } },
      colorMode: { defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true },
      footer: {
        style: 'dark',
        links: [
          { title: 'Wiki',      items: [{ label: 'Wiki', to: '/docs/Welcome' }] },
          { title: 'Community', items: [
              { label: 'Discord', href: 'https://discord.com/invite/6TZb2Y8WKx' },
              { label: 'X',       href: 'https://x.com/CamThinkAI' },
            ],
          },
          { title: 'More',      items: [{ label: 'GitHub', href: 'https://github.com/camthink-ai' }] },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CamThink.ai All rights reserved.`,
      },
      prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
    }),
};

export default config;
