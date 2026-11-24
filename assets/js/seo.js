
import { L } from './i18n.js';
function setMeta(sel, attr, val) {
  let n = document.head.querySelector(sel);
  if (!n) { n = document.createElement('meta'); const m = sel.match(/\[(name|property)="([^"]+)"\]/); if (m) n.setAttribute(m[1], m[2]); document.head.appendChild(n); }
  n.setAttribute(attr, val);
}
export function updateSEO(page, cfg, trail) {
  const title = (page.seo && page.seo.title) || L(page.title);
  const desc = (page.seo && page.seo.description) || L(page.hero && page.hero.description) || '';
  const base = (cfg.siteUrl || '').replace(/\/*$/, '/');
  const canonical = base + (page.slug ? page.slug + '/' : '');
  document.title = title + ' — ' + cfg.siteName;
  setMeta('meta[name="description"]', 'content', desc);
  setMeta('meta[property="og:title"]', 'content', document.title);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:url"]', 'content', canonical);
  if (page.hero && page.hero.image) setMeta('meta[property="og:image"]', 'content', base + page.hero.image);
  let c = document.head.querySelector('link[rel="canonical"]');
  if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c); }
  c.href = canonical;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', name: title, url: canonical, description: desc },
    { '@type': 'BreadcrumbList', itemListElement: (trail || []).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.title, item: base + (x.slug ? x.slug + '/' : '') })) }
  ] };
  let s = document.getElementById('ld-page');
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-page'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(ld);
}
