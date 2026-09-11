#!/usr/bin/env node
/**
 * 校验 src/data/siteLinks.cjs 里的站内文档链接是否都能落到 docs/ 的真实路由。
 *
 * 用法: yarn check:links   (即 node tests/check-doc-links.cjs)
 *
 * 路由推导规则与 Docusaurus 默认行为对齐：
 *  - routeBasePath 为 /docs；
 *  - 目录与文件名的数字前缀会被剥离（numberPrefixParser）；
 *  - frontmatter `slug` 覆盖 URL（绝对 / 相对均可）；
 *  - frontmatter `id` 覆盖末段 id（NE302 系列在用）；
 *  - index.md 指向所在目录。
 * 退出码：存在失效链接时为 1，可接 CI。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const LINKS_FILE = path.join(ROOT, 'src', 'data', 'siteLinks.cjs');

// 与 Docusaurus numberPrefixParser 的默认正则一致
const NUM_PREFIX = /^\d+[-_.\s]+/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** 只提取 frontmatter 里的 slug / id，够用且无需引入 YAML 依赖 */
function parseFrontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const slug = /^slug:\s*(.+?)\s*$/.exec(line);
    if (slug) fm.slug = slug[1].replace(/^['"]|['"]$/g, '');
    const id = /^id:\s*(.+?)\s*$/.exec(line);
    if (id) fm.id = id[1].replace(/^['"]|['"]$/g, '');
  }
  return fm;
}

const normalize = (p) => p.replace(/\/+$/, '') || '/';

function collectDocRoutes() {
  const routes = new Set();
  for (const file of walk(DOCS_DIR)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/');
    const segments = rel
      .replace(/\.(md|mdx)$/, '')
      .split('/')
      .map((s) => s.replace(NUM_PREFIX, ''));
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));

    let route;
    if (fm.slug !== undefined) {
      if (fm.slug.startsWith('/')) {
        route = '/docs' + fm.slug;
      } else {
        const parent = '/docs/' + segments.slice(0, -1).join('/');
        route = `${parent.replace(/\/+$/, '')}/${fm.slug}`;
      }
    } else {
      if (fm.id !== undefined) segments[segments.length - 1] = fm.id;
      route = '/docs/' + segments.join('/');
      if (segments[segments.length - 1] === 'index') {
        route = route.replace(/\/index$/, '/');
      }
    }
    routes.add(normalize(route));
  }
  return routes;
}

/** 递归收集数据文件里所有以 / 开头的站内链接 */
function collectInternalLinks(node, out = []) {
  if (typeof node === 'string') {
    if (node.startsWith('/') && !node.startsWith('//')) out.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((n) => collectInternalLinks(n, out));
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach((n) => collectInternalLinks(n, out));
  }
  return out;
}

const routes = collectDocRoutes();
const links = collectInternalLinks(require(LINKS_FILE));

const broken = links.filter((l) => !routes.has(normalize(l)));

console.log(
  `[check-doc-links] docs/ 解析出 ${routes.size} 个路由，` +
    `siteLinks.cjs 共 ${links.length} 个站内链接。`,
);

if (broken.length > 0) {
  console.error(`\n[check-doc-links] 发现 ${broken.length} 个失效链接:`);
  for (const l of new Set(broken)) {
    const firstSeg = l.split('/')[2] ?? '';
    const hints = [...routes].filter((r) => r.includes(firstSeg)).slice(0, 5);
    console.error(`  ✗ ${l}`);
    if (hints.length) console.error(`    相近路由: ${hints.join(', ')}`);
  }
  process.exit(1);
}

console.log('[check-doc-links] 全部通过 ✓');
