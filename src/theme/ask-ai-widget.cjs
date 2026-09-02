const ASK_AI_WIDGET_CSS_URL =
  'https://wiki-data.camthink.ai/widget/ask-ai-widget.css';
const ASK_AI_WIDGET_SCRIPT_URL =
  'https://wiki-data.camthink.ai/widget/widget.js';

const PRODUCT_ROUTE_CONTEXT = [
  ['neoedge-ng4500-series', 'NG4500'],
  ['neoeyes-ne101-series', 'NE101'],
  ['neoeyes-ne301-series', 'NE301'],
  ['neoeyes-ne302-series', 'NE302'],
  ['neoeyes-ne503-series', 'NE503'],
  ['neomind', 'NeoMind'],
];

function getAskAiLanguage(locale) {
  if (locale === 'en') return 'en';
  if (locale === 'zh-Hans') return 'zh';
  return undefined;
}

function getAskAiPageContext(pathname) {
  const path = String(pathname || '');
  const isDocumentation = /(?:^|\/)docs(?:\/|$)/.test(path);

  if (!isDocumentation) return { page_type: 'home' };

  const context = { page_type: 'documentation' };
  const product = PRODUCT_ROUTE_CONTEXT.find(([route]) =>
    path.includes(`/docs/${route}/`),
  )?.[1];

  return product ? { ...context, product } : context;
}

function updateAskAiPageContext(targetWindow, pageContext) {
  targetWindow.AskAIConfig = {
    ...(targetWindow.AskAIConfig || {}),
    pageContext,
  };
}

function installAskAiWidget(targetWindow, targetDocument, enabled, options) {
  if (!enabled || !targetWindow || !targetDocument) return false;

  targetWindow.AskAIConfig = {
    ...(targetWindow.AskAIConfig || {}),
    ...options,
  };

  if (!targetDocument.querySelector('[data-ask-ai-widget-style]')) {
    const style = targetDocument.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', ASK_AI_WIDGET_CSS_URL);
    style.setAttribute('data-ask-ai-widget-style', '');
    targetDocument.head.appendChild(style);
  }

  if (!targetDocument.querySelector('[data-ask-ai-widget-script]')) {
    const script = targetDocument.createElement('script');
    script.setAttribute('src', ASK_AI_WIDGET_SCRIPT_URL);
    script.setAttribute('data-ask-ai-widget-script', '');
    script.async = true;
    targetDocument.head.appendChild(script);
  }

  return true;
}

module.exports = {
  getAskAiLanguage,
  getAskAiPageContext,
  installAskAiWidget,
  updateAskAiPageContext,
};
