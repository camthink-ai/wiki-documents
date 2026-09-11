/**
 * 为外链附加 CamThink Wiki 来源标识（UTM）。
 *
 * - 已带 utm_source 的链接不重复添加；
 * - 非 http(s) 链接（mailto 等）原样返回；
 * - placement 写入 utm_content，用于区分入口位置（footer / navbar / home-*）。
 *
 * 使用位置：Footer、首页社区区、导航栏。文档正文中的外链不做改写。
 */

/** 无 placement 时的兜底参数 */
const WIKI_UTM_SOURCE = 'CamThink Wiki';
const WIKI_UTM_MEDIUM = 'referral';

function withWikiUtm(url, placement) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
    if (!u.searchParams.has('utm_source')) {
      u.searchParams.set('utm_source', WIKI_UTM_SOURCE);
      u.searchParams.set('utm_medium', WIKI_UTM_MEDIUM);
    }
    if (placement && !u.searchParams.has('utm_content')) {
      u.searchParams.set('utm_content', placement);
    }
    return u.toString();
  } catch {
    return url;
  }
}

module.exports = { withWikiUtm, WIKI_UTM_SOURCE, WIKI_UTM_MEDIUM };
