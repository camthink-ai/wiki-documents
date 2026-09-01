import React from 'react';
import { useLocation } from '@docusaurus/router';
import { hasConsent } from '../analytics/consent';
import { track, flushQueue } from '../analytics/track';

const TRACKER_SCRIPT_URL = 'https://analytics.camthink.ai/sdk/tracker.umd.js';
const TRACKER_CONFIG = {
  endpoint: 'https://analytics.camthink.ai/collect/v1/events',
  project_key: 'pk_4fdf4e86fe5631cbf0a54cda15008c8b',
  auto_track: {
    page_view: true,
    element_click: true,
    scroll: true,
  },
  cross_project: {
    enabled: true,
    scope_key: 'camthink',
    cookie_domain: '.camthink.ai',
  },
};
const isProd = process.env.NODE_ENV === 'production';

const KNOWN_LOCALES = ['zh-Hans', 'en'];

// CamthinkTracker SDK 动态注入（consent-gated，仅 production）。
// SDK 的 page_view 只在 init() 触发一次，不 hook history ——
// SPA 路由切换的 page_view 由下方 location effect 手动补（CamthinkTracker.page()）。
function injectTracker() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[data-camthink-tracker]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.src = TRACKER_SCRIPT_URL;
  s.setAttribute('data-camthink-tracker', '');
  s.onload = () => {
    if (!window.CamthinkTracker) return;
    window.CamthinkTracker.init(TRACKER_CONFIG); // 幂等：内部 f || ... guard
    flushQueue(); // init 完成后清空缓冲事件，切换到直发模式
  };
  document.head.appendChild(s);
}

if (isProd && typeof window !== 'undefined') {
  if (hasConsent()) injectTracker();
  // consent 变化时注入（横幅未来接入点）
  window.addEventListener('consent-change', () => {
    if (hasConsent()) injectTracker();
  });
}

export default function Root({ children }) {
  const location = useLocation();

  // --- B3：核心事件埋点（external_link_click / code_copy / search）---
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;

    // 处理器 1：external_link_click —— 捕获阶段监听站外 <a> 点击
    const onExternalLinkClick = (e) => {
      const a = e.target.closest('a[href^="http"]');
      if (!a) return;
      let url;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      // 排除站点自身域名及采集域名
      if (url.hostname === window.location.hostname || url.hostname === 'analytics.camthink.ai') return;
      // --- B4 download：外链子集（特定后缀），附加捕获（不 short-circuit，
      // 让 external_link_click 与 download 同时记录 —— 二者维度不同）。
      if (/\.(pdf|zip|bin|hex|tar\.gz|dmg|exe)$/i.test(url.pathname)) {
        track('download', {
          file: url.pathname.split('/').pop(),
          doc_path: window.location.pathname,
        });
      }
      track('external_link_click', {
        url: a.href,
        text: (a.textContent || '').trim().slice(0, 80),
        location: a.closest('header, footer, nav') ? 'navbar/footer' : 'content',
      });
    };

    // 处理器 2：code_copy —— 点击代码块复制按钮。
    // DOM 结构（已核实 theme-classic 3.6.1 源码）：
    //   .theme-code-block > .codeBlockContent > pre + .buttonGroup > button.clean-btn
    // 复制按钮是 <pre> 的兄弟节点（非子节点），故用 .theme-code-block
    // （ThemeClassNames.common.codeBlock 的非 hash 全局类）定位代码块容器。
    const onCodeCopyClick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const codeBlock = btn.closest('.theme-code-block');
      if (!codeBlock) return; // 不在代码块内
      const buttonGroup = btn.parentElement;
      const isCopyButton =
        buttonGroup?.previousElementSibling?.matches('pre') &&
        btn === buttonGroup.lastElementChild;
      if (!isCopyButton) return;
      const langMatch = codeBlock.className.match(/language-([\w-]+)/);
      track('code_copy', {
        code_language: langMatch ? langMatch[1] : 'unknown',
        doc_path: window.location.pathname,
      });
    };

    // 处理器 3：search —— 在搜索输入框中按回车键。
    // @easyops-cn/docusaurus-search-local 异步渲染结果，Enter 触发时 DOM 尚未更新，
    // 延迟 300ms 等结果渲染后再读 results_count（query 同步捕获保证可靠）。
    const onSearchKey = (e) => {
      if (e.key !== 'Enter') return;
      const input = e.target.closest(
        'input[class*="search" i], input[aria-label*="search" i]',
      );
      if (!input) return;
      const query = (input.value || '').trim().slice(0, 100);
      setTimeout(() => {
        track('search', {
          query,
          results_count: document.querySelectorAll(
            '[class*="search-result-item" i]',
          ).length,
        });
      }, 300);
    };

    document.addEventListener('click', onExternalLinkClick, true);
    document.addEventListener('click', onCodeCopyClick, true);
    document.addEventListener('keydown', onSearchKey, true);

    return () => {
      document.removeEventListener('click', onExternalLinkClick, true);
      document.removeEventListener('click', onCodeCopyClick, true);
      document.removeEventListener('keydown', onSearchKey, true);
    };
  }, []);

  // --- B4 scroll_depth：滚动到 25/50/75/100% 各报一次，换页重置 lastDepth。
  const lastDepthRef = React.useRef(0);
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docH =
          document.documentElement.scrollHeight - window.innerHeight;
        const depth = docH > 0 ? Math.round((scrollTop / docH) * 100) : 100;
        const marks = [25, 50, 75, 100];
        const hit = marks.find((m) => depth >= m && lastDepthRef.current < m);
        if (hit !== undefined) {
          lastDepthRef.current = hit;
          track('scroll_depth', {
            depth: hit,
            doc_path: window.location.pathname,
          });
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // location 变化时重置 lastDepth（否则换页后不再报 25/50/75/100）。
  React.useEffect(() => {
    lastDepthRef.current = 0;
  }, [location]);

  // --- CamthinkTracker SPA page_view：SDK 只在 init() 报首次 page_view，
  // 不 hook history，故路由切换需手动补。首屏若 SDK 未就绪则跳过（init 已报首次）。
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;
    try {
      window.CamthinkTracker?.page?.();
    } catch (e) {
      // SDK 未 init —— 静默跳过（init 时已报首次 page_view）
    }
  }, [location]);

  // --- B4 language_switch：locale 前缀变化检测。
  // Docusaurus 默认 locale（en）无 URL 前缀；非默认（zh-Hans）以 /zh-Hans/ 前缀。
  // 用已知 locale 列表做显式判断，避免把 /docs 误判为 locale。
  const lastLocaleRef = React.useRef(null);
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;
    const seg = window.location.pathname.split('/')[1];
    const cur = KNOWN_LOCALES.includes(seg) ? seg : 'en';
    if (lastLocaleRef.current && lastLocaleRef.current !== cur) {
      track('language_switch', {
        from: lastLocaleRef.current,
        to: cur,
      });
    }
    lastLocaleRef.current = cur;
  }, [location]);

  return <>{children}</>;
}
