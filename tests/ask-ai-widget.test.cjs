const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getAskAiLanguage,
  getAskAiPageContext,
  installAskAiWidget,
  updateAskAiPageContext,
} = require('../src/theme/ask-ai-widget.cjs');

function createDocument() {
  const nodes = [];
  const head = {
    appendChild(node) {
      nodes.push(node);
    },
  };

  return {
    head,
    nodes,
    createElement(tagName) {
      return {
        tagName,
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
      };
    },
    querySelector(selector) {
      const marker = selector.match(/^\[([^\]]+)\]$/)?.[1];
      return nodes.find((node) => marker && Object.hasOwn(node.attributes, marker)) || null;
    },
  };
}

test('maps the two configured Docusaurus locales without guessing unknown locales', () => {
  assert.equal(getAskAiLanguage('en'), 'en');
  assert.equal(getAskAiLanguage('zh-Hans'), 'zh');
  assert.equal(getAskAiLanguage('ja'), undefined);
});

test('provides documentation context and only attaches products proven by Wiki routes', () => {
  assert.deepEqual(
    getAskAiPageContext('/docs/neoeyes-ne503-series/user-guide/dashboard'),
    { page_type: 'documentation', product: 'NE503' },
  );
  assert.deepEqual(
    getAskAiPageContext('/zh-Hans/docs/neoeyes-ne301-series/quick-start'),
    { page_type: 'documentation', product: 'NE301' },
  );
  assert.deepEqual(
    getAskAiPageContext('/docs/hardware-dev-resources/ssd'),
    { page_type: 'documentation' },
  );
  assert.deepEqual(getAskAiPageContext('/not-found'), { page_type: 'home' });
});

test('installs the official CSS and script once after configuring the production Wiki identity', () => {
  const fakeWindow = {};
  const fakeDocument = createDocument();
  const options = {
    apiUrl: 'https://wiki-data.camthink.ai',
    siteId: 'camthink-wiki',
    language: 'en',
    pageContext: { page_type: 'documentation', product: 'NE503' },
  };

  assert.equal(installAskAiWidget(fakeWindow, fakeDocument, false, options), false);
  assert.equal(fakeDocument.nodes.length, 0);

  assert.equal(installAskAiWidget(fakeWindow, fakeDocument, true, options), true);
  assert.deepEqual(fakeWindow.AskAIConfig, options);
  assert.equal(fakeDocument.nodes.length, 2);
  assert.equal(fakeDocument.nodes[0].tagName, 'link');
  assert.equal(fakeDocument.nodes[0].attributes.rel, 'stylesheet');
  assert.equal(
    fakeDocument.nodes[0].attributes.href,
    'https://wiki-data.camthink.ai/widget/ask-ai-widget.css',
  );
  assert.equal(fakeDocument.nodes[1].tagName, 'script');
  assert.equal(
    fakeDocument.nodes[1].attributes.src,
    'https://wiki-data.camthink.ai/widget/widget.js',
  );
  assert.equal(fakeDocument.nodes[1].async, true);

  assert.equal(installAskAiWidget(fakeWindow, fakeDocument, true, options), true);
  assert.equal(fakeDocument.nodes.length, 2);
});

test('refreshes only the dynamic page context on internal navigation', () => {
  const fakeWindow = {
    AskAIConfig: {
      apiUrl: 'https://wiki-data.camthink.ai',
      siteId: 'camthink-wiki',
      language: 'zh',
      pageContext: { page_type: 'documentation', product: 'NE503' },
    },
  };

  updateAskAiPageContext(fakeWindow, {
    page_type: 'documentation',
    product: 'NeoMind',
  });

  assert.deepEqual(fakeWindow.AskAIConfig, {
    apiUrl: 'https://wiki-data.camthink.ai',
    siteId: 'camthink-wiki',
    language: 'zh',
    pageContext: { page_type: 'documentation', product: 'NeoMind' },
  });
});
