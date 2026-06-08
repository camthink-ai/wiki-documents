// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/* -------------------------------------------------- */
/* 1️⃣  环境检测 / 动态变量                             */
/* -------------------------------------------------- */

const DEPLOY_ENV = process.env.DEPLOY_ENV || 'local';
const BASE_URL = process.env.BASE_URL ?? (
  DEPLOY_ENV === 'github-pages' ? '/wiki-documents/' : '/'
);
// 根据部署环境设置默认 SITE_URL
const SITE_URL = process.env.SITE_URL ?? (
  DEPLOY_ENV === 'test' ? 'http://42.194.138.11:3002' :
    DEPLOY_ENV === 'production' ? 'https://wiki.camthink.ai' :
      DEPLOY_ENV === 'github-pages' ? 'https://harryhua-ai.github.io' :
        'http://localhost:3000'
);

const configuredPlugins = [
  'docusaurus-plugin-image-zoom',
  [
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      language: ['en', 'zh'],
      highlightSearchTermsOnTargetPage: true,
      explicitSearchResultPath: true,
      docsRouteBasePath: '/',
      indexDocs: true,
      indexBlog: false,
      docsDir: 'docs',
    },
  ],
  ['@docusaurus/plugin-client-redirects',
    {
      redirects: [
        {
          from: '/',
          to: '/docs',
        },
      ],
    }
  ],
];

if (SITE_URL === 'https://wiki.camthink.ai') {
  configuredPlugins.push([
    '@docusaurus/plugin-google-tag-manager',
    {
      // @ts-ignore - Google Tag Manager plugin configuration
      containerId: 'GTM-WRP2RQPS',
    },
  ]);
}

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
      en: { htmlLang: 'en-US', label: 'English' },
    },
  },

  /* -------------------------------------------------- */
  /* 4️⃣  插件 / 主题                                     */
  /* -------------------------------------------------- */
  plugins: configuredPlugins,
  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: undefined,  // 关闭 "编辑此页"
          routeBasePath: '/docs',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['**/markdown-page/**', '**/search/**'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  /* -------------------------------------------------- */
  /* 5️⃣  主题配置 (Navbar / Footer / Prism …)           */
  /* -------------------------------------------------- */
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: DEPLOY_ENV === 'test'
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : [],
      image: 'img/Camthink-logo.png',
      navbar: {
        title: '',
        logo: {
          alt: 'CamThink',
          src: 'img/logo.svg',
          srcDark: 'img/logo_dark.svg',
          href: '/',
        },
        items: [
          {
            to: '/docs',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://www.camthink.ai/',
            position: 'right',
            label: '🏠 Home',
            className: 'home-button'
          },
          {
            href: 'https://www.camthink.ai/store/',
            position: 'right',
            label: '🛍️ Store',
            className: 'store-button'
          },
          { href: 'https://github.com/camthink-ai', position: 'right', label: 'GitHub' },
          { type: 'localeDropdown', position: 'right' },
        ],
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
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
          {
            title: 'Wiki', items: [
              { label: 'Home', to: '/docs' },
              { label: 'NG4500', to: '/docs/neoedge-ng4500-series/overview' },
              { label: 'NE101', to: '/docs/neoeyes-ne101-series/overview' },
            ]
          },
          {
            title: 'Community', items: [
              { label: 'Discord', href: 'https://discord.com/invite/6TZb2Y8WKx' },
              { label: 'X', href: 'https://x.com/CamThinkAI' },
              { label: 'Youtube', href: 'https://www.youtube.com/@CamThink' },
            ],
          },
          {
            title: 'More', items: [
              { label: 'WebSite', href: 'https://www.camthink.ai' },
              { label: 'Store', href: 'https://www.camthink.ai/store/' },
              { label: 'GitHub', href: 'https://github.com/camthink-ai' }
            ]
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CamThink.ai All rights reserved.`,
      },
      prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
    }),
};

export default config;
