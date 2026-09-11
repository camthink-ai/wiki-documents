/**
 * 全站文档链接单一来源（single source of truth）。
 *
 * 首页 (src/pages/index.tsx)、产品矩阵 (src/components/ProductMatrix.tsx)、
 * 自定义 Footer (src/theme/Footer) 的站内文档链接全部从这里取，
 * 目录结构调整时只需更新本文件。
 *
 * 约定：
 *  - 只放链接路径，展示文案（标题/图标）留在各组件里；
 *  - 路径是构建后的路由（目录/文件名的数字前缀会被 Docusaurus 剥离）；
 *  - softwareSections / solutionCases 镜像 docs/ 的二级目录（_category_.json），
 *    新增二级目录或方案案例时在此追加一项，Footer 自动跟进；
 *  - 修改后运行 `yarn check:links`，脚本会把每个路径与 docs/ 生成的真实路由比对。
 */
module.exports = {
  docsHome: '/docs/',

  products: {
    ng4500: {
      overview: '/docs/neoedge-ng4500-series/overview',
      quickStart: '/docs/neoedge-ng4500-series/quick-start',
    },
    ne503: {
      overview: '/docs/neoeyes-ne503-series/overview',
      quickStart: '/docs/neoeyes-ne503-series/quick-start',
    },
    ne301: {
      overview: '/docs/neoeyes-ne301-series/overview',
      quickStart: '/docs/neoeyes-ne301-series/quick-start',
    },
    ne302: {
      overview: '/docs/neoeyes-ne302-series/ne302-overview',
      quickStart: '/docs/neoeyes-ne302-series/ne302-quick-start',
    },
    ne101: {
      overview: '/docs/neoeyes-ne101-series/overview',
      quickStart: '/docs/neoeyes-ne101-series/quick-start',
    },
  },

  neomind: {
    overview: '/docs/neomind/product-overview/what-is-neomind',
    quickStart: '/docs/neomind/quick-start/five-minute-guide',
    userGuide: '/docs/neomind/user-guide/install-setup',
    devGuide: '/docs/neomind/developer-guide/overview',
    onboardDevice: '/docs/neomind/user-guide/onboard-device',
  },

  software: {
    aiToolStack: '/docs/software/ai-tool-stack/overview',
  },

  /**
   * Footer「软件平台」列 —— 只列 Software Platform 组的大类
   * （NeoMind 平台与 AI ToolStack，与侧边栏二级一致）。
   */
  softwareSections: [
    { id: 'neomind', path: '/docs/neomind/product-overview/what-is-neomind' },
    { id: 'aiToolStack', path: '/docs/software/ai-tool-stack/overview' },
  ],

  useCases: {
    detection: '/docs/neomind/use-cases/object-detection',
    ocr: '/docs/neomind/use-cases/ocr-text-extraction',
    voice: '/docs/neomind/use-cases/voice',
  },

  /**
   * Footer「解决方案」列 —— 镜像 docs/4-edge-ai-solutions/ 的二级目录（案例）。
   * 案例页结构尚在规划（团队手写中），暂指向各案例根页；
   * 正式方案页定稿后改回 solution-overview 之类的内容页。
   */
  solutionCases: [
    { id: 'waterMeter', path: '/docs/edge-ai-solutions/water-meter-recognition' },
    { id: 'smartGym', path: '/docs/edge-ai-solutions/smart-gym' },
  ],

  /** 「最新文档」栏目条目 —— 两处（首页/文档中心）共用，更新时同步日期 */
  latest: {
    // 该页 slug 即 /docs/neoeyes-ne503-series/application-guide/，充当应用指南落地页
    ne503Resources: '/docs/neoeyes-ne503-series/application-guide/',
    ne503Faq: '/docs/neoeyes-ne503-series/troubleshooting',
    ne302Docs: '/docs/neoeyes-ne302-series/ne302-overview',
    ne503Hef: '/docs/neoeyes-ne503-series/application-guide/model-training-and-hef',
  },

  community: {
    website: 'https://www.camthink.ai',
    store: 'https://www.camthink.ai/store/',
    contact: 'https://www.camthink.ai/company/contact-us/',
    github: 'https://github.com/camthink-ai',
    discussions: 'https://github.com/camthink-ai/community/discussions',
    discord: 'https://discord.gg/a8NbPGAJw9',
    x: 'https://x.com/CamThinkAI',
    youtube: 'https://www.youtube.com/@CamThink',
  },
};
