
import { url } from './config.js';
import { L, t, getLang } from './i18n.js';
import { esc, icon, refreshIcons } from './components.js';
const isActive = (slug, u) => { const s = (u || '').replace(/^\/+|\/+$/g, ''); return s && (slug === s || slug.startsWith(s + '/')); };
export function renderHeader(cfg, nav, slug) {
  const hdr = document.getElementById('hdr'); if (!hdr) return;
  const lang = getLang();
  const util = nav.utility.map(u => u.action === 'search'
    ? '<button class="nav-link" data-search-open style="color:inherit;padding:.3rem .5rem" aria-label="' + t('search') + '">' + icon('search') + '</button>'
    : u.action === 'lang'
    ? '<span class="flex gap-1 items-center"><button data-lang="en" class="btn btn-sm" style="padding:.15rem .5rem;color:' + (lang === 'en' ? '#C89B3C' : 'inherit') + '" aria-pressed="' + (lang === 'en') + '">EN</button><span aria-hidden="true">·</span><button data-lang="id" class="btn btn-sm" style="padding:.15rem .5rem;color:' + (lang === 'id' ? '#C89B3C' : 'inherit') + '" aria-pressed="' + (lang === 'id') + '">ID</button></span>'
    : '<a href="' + (u.external ? esc(u.url) : url(u.url)) + '"' + (u.external ? ' target="_blank" rel="noopener"' : '') + ' class="util-hide-sm">' + esc(L(u.label)) + (u.external ? ' ↗' : '') + '</a>').join('');
  const items = nav.main.map((m, i) => {
    const act = isActive(slug, m.url);
    const cols = (m.columns || []).map(c => '<div class="mega-col"><h4>' + esc(L(c.heading)) + '</h4>' +
      c.links.map(l => '<a href="' + (l.external ? esc(l.url) : url(l.url)) + '"' + (l.external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(L(l.label)) + (l.desc ? '<small>' + esc(L(l.desc)) + '</small>' : '') + '</a>').join('') + '</div>').join('');
    return '<div class="nav-item" data-mega="' + i + '"><button class="nav-link' + (act ? ' active' : '') + '" aria-expanded="false" aria-haspopup="true" data-mega-btn="' + i + '">' + esc(L(m.label)) + icon('chevron-down', 'w-3.5 h-3.5') + '</button>' +
      '<div class="mega" id="mega-' + i + '"><div class="wrap grid gap-8 py-9" style="grid-template-columns:repeat(' + Math.min(4, (m.columns || []).length + 1) + ',1fr)">' + cols +
      '<div class="mega-col" style="background:var(--c-paper);border-radius:12px;padding:1.2rem"><h4>' + esc(L(m.label)) + '</h4><p class="text-sm" style="color:var(--c-muted)">' + esc(L(m.blurb) || '') + '</p><a class="link-arrow" href="' + url(m.url) + '">' + t('overview') + icon('arrow-right') + '</a></div></div></div></div>';
  }).join('');
  hdr.innerHTML =
    '<div class="util-bar"><div class="wrap flex items-center justify-between py-1.5 gap-4"><div class="flex gap-4 items-center">' + util + '</div><div class="flex gap-3 items-center"><span class="util-hide-sm">' + esc(cfg.contact.phone) + '</span><button class="nav-link" data-search-open style="color:inherit;padding:.2rem .4rem" aria-label="' + t('search') + '">' + icon('search', 'w-4 h-4') + '</button></div></div></div>' +
    '<div class="wrap main-bar" style="position:relative"><a class="brand" href="' + url('') + '" aria-label="' + esc(cfg.siteName) + '"><span class="brand-mark">' + icon('sunrise', 'w-6 h-6 text-gold') + '</span><span><span class="brand-name">' + esc(cfg.shortName) + '</span><br><span class="brand-sub">International School</span></span></a>' +
    '<nav class="desk-nav flex items-center gap-0.5 ml-auto" aria-label="Main">' + items + '</nav>' +
    '<div class="desk-cta flex gap-2"><a class="btn btn-outline btn-sm" href="' + url(cfg.ctas.inquire) + '">' + t('inquire') + '</a><a class="btn btn-primary btn-sm" href="' + url(cfg.ctas.apply) + '">' + t('apply') + '</a></div>' +
    '<button class="burger btn btn-ghost ml-auto" data-mnav-open aria-label="' + t('openMenu') + '" aria-expanded="false">' + icon('menu') + '</button></div>';
  let timer = null;
  hdr.querySelectorAll('.nav-item').forEach(item => {
    const b = item.querySelector('[data-mega-btn]'), panel = item.querySelector('.mega');
    const open = (v) => { panel.classList.toggle('open', v); b.setAttribute('aria-expanded', v); };
    item.addEventListener('mouseenter', () => { clearTimeout(timer); timer = setTimeout(() => { closeAll(hdr); open(true); }, 90); });
    item.addEventListener('mouseleave', () => { clearTimeout(timer); timer = setTimeout(() => open(false), 160); });
    b.addEventListener('click', () => { const v = !panel.classList.contains('open'); closeAll(hdr); open(v); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#hdr')) closeAll(hdr); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(hdr); closeMnav(); } });
  renderMnav(cfg, nav);
  refreshIcons();
}
function closeAll(hdr) { hdr.querySelectorAll('.mega.open').forEach(p => p.classList.remove('open')); hdr.querySelectorAll('[data-mega-btn]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
function renderMnav(cfg, nav) {
  let m = document.getElementById('mnav');
  if (!m) { m = document.createElement('div'); m.id = 'mnav'; m.className = 'mnav'; document.body.appendChild(m); }
  const accs = nav.main.map((mm, i) => '<div class="mnav-acc"><button data-acc aria-expanded="false"><span>' + esc(L(mm.label)) + '</span>' + icon('chevron-down') + '</button><div class="mnav-sub">' +
    '<a href="' + url(mm.url) + '"><b>' + t('overview') + '</b></a>' +
    (mm.columns || []).map(c => '<div class="sub-h">' + esc(L(c.heading)) + '</div>' + c.links.map(l => '<a href="' + (l.external ? esc(l.url) : url(l.url)) + '"' + (l.external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(L(l.label)) + '</a>').join('')).join('') + '</div></div>').join('');
  m.innerHTML = '<div class="mnav-back" data-mnav-close></div><div class="mnav-panel" role="dialog" aria-modal="true" aria-label="' + t('menu') + '">' +
    '<div class="flex justify-between items-center mb-4"><span class="brand-name">' + esc(cfg.shortName) + '</span><button class="btn btn-ghost" data-mnav-close aria-label="' + t('close') + '">' + icon('x') + '</button></div>' + accs +
    '<div class="grid gap-2 mt-6"><a class="btn btn-primary" href="' + url(cfg.ctas.apply) + '">' + t('apply') + '</a><a class="btn btn-outline" href="' + url(cfg.ctas.inquire) + '">' + t('inquire') + '</a><a class="btn btn-ghost" href="' + url(cfg.ctas.visit) + '">' + t('visit') + '</a></div>' +
    '<div class="flex gap-2 mt-4"><button class="btn btn-ghost btn-sm" data-lang="en">English</button><button class="btn btn-ghost btn-sm" data-lang="id">Bahasa Indonesia</button></div></div>';
  m.addEventListener('click', (e) => { if (e.target.closest('a') || e.target.closest('[data-mnav-close]')) closeMnav(); });
}
export function openMnav() { const m = document.getElementById('mnav'); if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; } }
export function closeMnav() { const m = document.getElementById('mnav'); if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
export async function renderFooter(cfg, nav) {
  const f = document.getElementById('ftr'); if (!f) return;
  const { renderForm } = await import('./forms.js');
  const cols = nav.footer.map(c => '<div><h4>' + esc(L(c.heading)) + '</h4><ul>' + c.links.map(l => '<li><a href="' + (l.external ? esc(l.url) : url(l.url)) + '">' + esc(L(l.label)) + '</a></li>').join('') + '</ul></div>').join('');
  const socials = cfg.socials.map(s => '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.name) + '">' + icon(s.icon) + '</a>').join('');
  f.innerHTML = '<div class="wrap"><div class="ftr-grid">' +
    '<div><a class="brand mb-4" href="' + url('') + '"><span class="brand-mark" style="background:rgba(255,255,255,.1)">' + icon('sunrise', 'w-6 h-6 text-gold') + '</span><span><span class="brand-name" style="color:#fff">' + esc(cfg.shortName) + '</span><br><span class="brand-sub" style="color:var(--c-accent)">International School</span></span></a>' +
    '<p class="text-sm" style="max-width:34ch">' + esc(L(cfg.footerAbout)) + '</p><div class="socials mt-4">' + socials + '</div></div>' + cols +
    '<div><h4>' + t('newsletter') + '</h4><p class="text-sm mb-3">' + t('newsletterBlurb') + '</p>' + await renderForm('newsletter', { compact: true }) + '</div></div>' +
    '<div class="ftr-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(cfg.siteName) + '. ' + t('rights') + '</span><span class="flex gap-4 flex-wrap">' +
    nav.legal.map(l => '<a href="' + url(l.url) + '">' + esc(L(l.label)) + '</a>').join('') + '</span></div></div>';
  refreshIcons();
}
export function breadcrumbs(slug, pages) {
  const trail = [{ slug: '', title: t('home') }];
  if (slug) {
    const parts = slug.split('/'); let acc = '';
    for (const p of parts) {
      acc = acc ? acc + '/' + p : p;
      const pg = pages.find(x => x.slug === acc);
      trail.push({ slug: acc, title: pg ? L(pg.title) : p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    }
  }
  const html = '<nav class="wrap crumbs" aria-label="Breadcrumb">' + trail.map((x, i) =>
    (i ? '<span class="sep" aria-hidden="true">/</span>' : '') +
    (i === trail.length - 1 ? '<span aria-current="page">' + esc(x.title) + '</span>' : '<a href="' + url(x.slug ? x.slug + '/' : '') + '">' + esc(x.title) + '</a>')).join('') + '</nav>';
  return { html, trail };
}
