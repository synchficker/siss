
import { url, qs } from './config.js';
import { fetchJSON, getSettings, getNavigation, getPages, getPageBySlug, getHomepage, setOverride } from './data-service.js';
import { loadI18n, applyI18n, t, L, setLang } from './i18n.js';
import { renderHeader, renderFooter, breadcrumbs, openMnav } from './navigation.js';
import { renderSection, renderRelated, delegate, refreshIcons, reveal, esc, icon } from './components.js';
import { openSearch } from './search.js';
import { renderSticky } from './sticky-cta.js';
import { initHero } from './hero-slider.js';
import { initGallery } from './gallery.js';
import { initForms } from './forms.js';
import { updateSEO } from './seo.js';
function applyBrand(cfg) {
  const r = document.documentElement.style;
  const c = cfg.colors || {};
  if (c.primary) r.setProperty('--c-primary', c.primary);
  if (c.primary2) r.setProperty('--c-primary-2', c.primary2);
  if (c.accent) r.setProperty('--c-accent', c.accent);
  if (c.paper) r.setProperty('--c-paper', c.paper);
  if (c.ink) r.setProperty('--c-ink', c.ink);
  if (cfg.fonts && cfg.fonts.display) r.setProperty('--font-display', cfg.fonts.display);
  if (cfg.fonts && cfg.fonts.body) r.setProperty('--font-body', cfg.fonts.body);
}
function errPanel(main, err) {
  main.innerHTML = '<div class="err-panel"><h2>' + t('loadError') + '</h2><p class="lede" style="margin:1rem auto">' + esc(err.message || String(err)) + '</p><button class="btn btn-primary" onclick="location.reload()">' + t('retry') + '</button></div>';
}
function pageHero(page) {
  const h = page.hero || {};
  return '<div class="page-hero"><img class="bg" src="' + url(h.image || 'assets/images/about/about.svg') + '" alt=""><div class="wrap">' +
    '<span class="kicker" style="color:var(--c-accent)">' + esc(L(h.kicker) || L(page.title)) + '</span>' +
    '<h1 class="mt-3">' + esc(L(h.title) || L(page.title)) + '</h1>' +
    (h.description ? '<p class="mt-4">' + esc(L(h.description)) + '</p>' : '') +
    (h.ctaText ? '<div class="mt-6"><a class="btn btn-gold" href="' + url(h.ctaUrl || '') + '">' + esc(L(h.ctaText)) + '</a></div>' : '') + '</div></div>';
}
async function renderHome(main, cfg) {
  const home = await getHomepage();
  const secs = home.sections.filter(s => s.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  let html = '';
  for (let i = 0; i < secs.length; i++) {
    const s = secs[i];
    if (s.type === 'hero') {
      html += '<div class="hero"><div class="swiper hero-swiper"><div class="swiper-wrapper">' +
        s.slides.map(sl => '<div class="swiper-slide"><div class="hero-media"><img src="' + url(sl.image) + '" alt="' + esc(L(sl.title)) + '"></div><div class="hero-inner"><div class="wrap">' +
          '<span class="kicker">' + esc(L(sl.kicker)) + '</span><h1 class="mt-4 mb-4">' + esc(L(sl.title)) + '</h1><p class="mb-7">' + esc(L(sl.text)) + '</p>' +
          '<a class="btn btn-gold" href="' + url(sl.ctaUrl) + '">' + esc(L(sl.ctaText)) + '</a></div></div></div>').join('') +
        '</div><div class="swiper-pagination hero-pagination"></div></div>' +
        '<div class="hero-nav"><button class="hero-prev" aria-label="' + t('prevSlide') + '">' + icon('arrow-left') + '</button><button class="hero-next" aria-label="' + t('nextSlide') + '">' + icon('arrow-right') + '</button></div></div>';
    } else if (s.type === 'testimonials') {
      const ts = await fetchJSON('testimonials');
      html += '<section class="section dark"><div class="wrap"><span class="kicker" style="color:var(--c-accent)">' + esc(L(s.kicker)) + '</span><h2 class="mt-3 mb-8">' + esc(L(s.heading)) + '</h2>' +
        '<div class="swiper testi-swiper"><div class="swiper-wrapper">' + ts.map(x =>
          '<div class="swiper-slide" style="height:auto"><div class="quote-card"><blockquote>&ldquo;' + esc(L(x.quote)) + '&rdquo;</blockquote><div class="who">' + esc(x.name) + '</div><div class="role">' + esc(L(x.role)) + '</div></div></div>').join('') +
        '</div><div class="swiper-pagination testi-pag" style="position:static;margin-top:1.5rem"></div></div></div></section>';
    } else {
      html += await renderSection(s, { cfg }, i);
    }
  }
  main.innerHTML = html;
  initHero();
  if (window.Swiper && document.querySelector('.testi-swiper')) {
    new window.Swiper('.testi-swiper', { slidesPerView: 1, spaceBetween: 20, pagination: { el: '.testi-pag', clickable: true }, breakpoints: { 768: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } } });
  }
  return { slug: '', title: cfg.siteName, hero: { description: L(cfg.tagline) }, seo: home.seo || {} };
}
async function renderPage(main, cfg, slug, template) {
  const pages = await getPages();
  const page = pages.find(p => p.slug === slug);
  if (!page || page.status !== 'published') {
    main.innerHTML = '<div class="err-panel"><h2>' + t('pageNotFound') + '</h2><p class="lede" style="margin:1rem auto">' + t('pageNotFoundHint') + '</p><a class="btn btn-primary" href="' + url('') + '">' + t('goHome') + '</a></div>';
    return null;
  }
  const cr = breadcrumbs(slug, pages);
  let html = cr.html + pageHero(page);
  const secs = (page.sections || []).filter(s => s.enabled !== false);
  for (let i = 0; i < secs.length; i++) html += await renderSection(secs[i], { cfg, page }, i);
  if (template === 'blog-list') html += '<div id="blog-app"></div>';
  if (template === 'event-list') html += '<div id="event-app"></div>';
  const rel = (page.related || []).map(s => pages.find(p => p.slug === s)).filter(Boolean).slice(0, 3);
  html += renderRelated(rel);
  if (page.cta !== false) {
    html += await renderSection({ type: 'cta', kicker: { en: 'Take the next step', id: 'Ambil langkah berikutnya' }, heading: L(page.ctaHeading) || t('ctaDefaultHeading'), description: t('ctaDefaultText'), buttons: [{ text: t('inquire'), url: cfg.ctas.inquire, style: 'gold' }, { text: t('visit'), url: cfg.ctas.visit, style: 'light' }, { text: t('apply'), url: cfg.ctas.apply, style: 'light' }] }, { cfg }, secs.length + 9);
  }
  main.innerHTML = html;
  if (template === 'blog-list') { const { initBlogList } = await import('./blog.js'); await initBlogList(document.getElementById('blog-app')); }
  if (template === 'event-list') { const { initEventList } = await import('./events.js'); await initEventList(document.getElementById('event-app')); }
  return { page, trail: cr.trail };
}
async function boot() {
  const main = document.getElementById('main');
  const body = document.body;
  const slug = body.dataset.page || '';
  const template = body.dataset.template || 'standard';
  try {
    if (qs('preview') === '1') {
      try { const pv = JSON.parse(sessionStorage.getItem('cis-preview') || '{}'); Object.keys(pv).forEach(k => setOverride(k, pv[k])); } catch (e) { console.warn('preview payload invalid', e); }
    }
    await loadI18n();
    const [cfg, nav] = await Promise.all([getSettings(), getNavigation()]);
    applyBrand(cfg);
    renderHeader(cfg, nav, slug);
    await renderFooter(cfg, nav);
    renderSticky(cfg);
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-search-open]')) { openSearch(); return; }
      if (e.target.closest('[data-mnav-open]')) { openMnav(); return; }
      const lb = e.target.closest('[data-lang]');
      if (lb) { setLang(lb.dataset.lang); return; }
      delegate(e);
    });
    initForms();
    let seoPage = null, trail = null;
    if (template === 'home') seoPage = await renderHome(main, cfg);
    else if (template === 'blog-detail') { const { renderBlogDetail } = await import('./blog.js'); seoPage = await renderBlogDetail(main, cfg); }
    else if (template === 'event-detail') { const { renderEventDetail } = await import('./events.js'); seoPage = await renderEventDetail(main); }
    else { const r = await renderPage(main, cfg, slug, template); if (r) { seoPage = r.page; trail = r.trail; } }
    if (seoPage) updateSEO(seoPage, cfg, trail);
    applyI18n(); refreshIcons(); reveal(); initGallery();
  } catch (err) { console.error(err); errPanel(main, err); refreshIcons(); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
