
import { url, reducedMotion } from './config.js';
import { fetchJSON } from './data-service.js';
import { L, t, getLang } from './i18n.js';
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon = (n, cls) => '<i data-lucide="' + n + '"' + (cls ? ' class="' + cls + '"' : '') + '></i>';
export function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
export function toast(msg) {
  const r = document.getElementById('toast-root'); if (!r) return;
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; r.appendChild(d);
  setTimeout(() => d.remove(), 3400);
}
export function sanitize(html) {
  const tp = document.createElement('template'); tp.innerHTML = String(html || '');
  tp.content.querySelectorAll('script,iframe,object,embed,link,meta,style').forEach(n => n.remove());
  tp.content.querySelectorAll('*').forEach(n => { Array.from(n.attributes).forEach(a => {
    if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
  }); });
  return tp.innerHTML;
}
export const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(getLang() === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const btn = (text, href, style) => '<a class="btn btn-' + (style || 'primary') + '" href="' + esc(href) + '">' + esc(text) + '</a>';
const img = (src, alt, cls) => '<img src="' + url(src) + '" alt="' + esc(alt || '') + '"' + (cls ? ' class="' + cls + '"' : '') + ' loading="lazy">';
const head = (s) => (s.kicker ? '<span class="kicker">' + esc(L(s.kicker)) + '</span>' : '') +
  (s.heading ? '<h2 class="mt-3 mb-3">' + esc(L(s.heading)) + '</h2>' : '') +
  (s.description ? '<p class="lede mb-8">' + esc(L(s.description)) + '</p>' : '');
const paras = (b) => (Array.isArray(b) ? b : [b]).filter(Boolean).map(p => '<p>' + esc(L(p)) + '</p>').join('');
const grid = (n) => 'grid gap-6 md:grid-cols-' + n;
const empty = (msg) => '<div class="empty-state">' + icon('inbox') + '<p>' + esc(msg || t('noContent')) + '</p></div>';

export async function renderSection(s, ctx, idx) {
  const cfg = ctx.cfg; let inner = '';
  switch (s.type) {
    case 'text': inner = head(s) + '<div class="prose">' + paras(s.body) + '</div>'; break;
    case 'points': inner = head(s) + '<div class="' + grid(s.cols || 2) + '">' +
      (s.items || []).map(p => '<div class="point">' + icon(s.icon || 'check-circle-2') + '<span>' + esc(L(p)) + '</span></div>').join('') + '</div>'; break;
    case 'split': inner = '<div class="split' + (s.reverse ? ' rev' : '') + '"><div class="split-media">' + img(s.image, s.heading) + '</div><div>' +
      head(s) + '<div class="prose">' + paras(s.body) + '</div>' +
      (s.points ? s.points.map(p => '<div class="point">' + icon('check-circle-2') + '<span>' + esc(L(p)) + '</span></div>').join('') : '') +
      (s.ctaText ? '<div class="mt-6">' + btn(L(s.ctaText), url(s.ctaUrl || ''), s.ctaStyle || 'outline') + '</div>' : '') + '</div></div>'; break;
    case 'cards': inner = head(s) + '<div class="' + grid(s.cols || 3) + '">' + (s.items || []).map(c =>
      s.style === 'icon'
      ? '<div class="icon-card rv"><div class="icon-chip">' + icon(c.icon || 'sparkles') + '</div><h3>' + esc(L(c.title)) + '</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(L(c.text)) + '</p>' + (c.url ? '<a class="link-arrow mt-3" href="' + url(c.url) + '">' + t('learnMore') + icon('arrow-right') + '</a>' : '') + '</div>'
      : '<article class="card rv">' + (c.image ? '<a class="card-img" href="' + url(c.url || '') + '">' + img(c.image, c.title) + '</a>' : '') +
        '<div class="card-body"><h3>' + esc(L(c.title)) + '</h3><p>' + esc(L(c.text)) + '</p>' +
        (c.url ? '<a class="link-arrow" href="' + url(c.url) + '">' + esc(L(c.linkText) || t('learnMore')) + icon('arrow-right') + '</a>' : '') + '</div></article>').join('') + '</div>'; break;
    case 'stats': inner = head(s) + '<div class="' + grid(s.cols || 4) + '">' + (s.items || []).map(x =>
      '<div class="stat rv"><b>' + esc(x.value) + '</b><span>' + esc(L(x.label)) + '</span></div>').join('') + '</div>'; break;
    case 'steps': inner = head(s) + '<div class="steps">' + (s.items || []).map(x =>
      '<div class="step rv"><div><h3 class="mb-1">' + esc(L(x.title)) + '</h3><p class="text-sm m-0" style="color:var(--c-muted)">' + esc(L(x.text)) + '</p></div></div>').join('') + '</div>'; break;
    case 'faq': {
      let items = s.items || [];
      if (s.ref) items = (await fetchJSON('faqs')).filter(f => f.group === s.ref);
      inner = head(s) + (items.length ? items.map(f =>
        '<div class="acc"><button class="acc-head" data-acc aria-expanded="false"><span>' + esc(L(f.q)) + '</span>' + icon('chevron-down') + '</button><div class="acc-body">' + paras(f.a) + '</div></div>').join('') : empty()); break;
    }
    case 'gallery': inner = head(s) + '<div class="gal">' + (s.images || []).map(g =>
      '<a href="' + url(g.src) + '" class="glightbox" data-gallery="g' + idx + '" data-description="' + esc(L(g.alt)) + '">' + img(g.src, g.alt) + '</a>').join('') + '</div>'; break;
    case 'quote': inner = '<div class="quote-card rv"><blockquote>&ldquo;' + esc(L(s.text)) + '&rdquo;</blockquote><div class="who">' + esc(s.name) + '</div><div class="role">' + esc(L(s.role)) + '</div></div>'; break;
    case 'cta': inner = '<div class="cta-band rv"><span class="kicker" style="color:var(--c-accent)">' + esc(L(s.kicker) || t('nextStep')) + '</span><h2 class="mt-3 mb-3">' + esc(L(s.heading)) + '</h2><p class="mb-6">' + esc(L(s.description)) + '</p><div class="flex flex-wrap gap-3">' +
      (s.buttons || []).map(b => btn(L(b.text), url(b.url), b.style || 'gold')).join('') + '</div></div>'; break;
    case 'table': inner = head(s) + '<div class="tbl-scroll"><table class="tbl"><thead><tr>' + (s.head || []).map(h => '<th>' + esc(L(h)) + '</th>').join('') + '</tr></thead><tbody>' +
      (s.rows || []).map(r => '<tr>' + r.map(c => '<td>' + esc(L(c)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' + (s.note ? '<p class="form-note">' + esc(L(s.note)) + '</p>' : ''); break;
    case 'people': {
      const items = s.ref ? await fetchJSON(s.ref) : (s.items || []);
      inner = head(s) + '<div class="' + grid(s.cols || 3) + '">' + items.map(p =>
        '<div class="person rv">' + img(p.image, p.name) + '<h3 class="mb-1">' + esc(p.name) + '</h3><div class="role mb-2">' + esc(L(p.role)) + '</div><p>' + esc(L(p.bio)) + '</p></div>').join('') + '</div>'; break;
    }
    case 'tabs': {
      const gid = 'tabs-' + idx;
      inner = head(s) + '<div class="tabs-nav" role="tablist">' + (s.items || []).map((x, i) =>
        '<button class="tab-btn" role="tab" data-tab="' + gid + ':' + i + '" aria-selected="' + (i === 0) + '">' + esc(L(x.label)) + '</button>').join('') + '</div>' +
        (s.items || []).map((x, i) => '<div class="tab-panel prose' + (i === 0 ? ' active' : '') + '" id="' + gid + ':' + i + '" role="tabpanel">' + paras(x.body) + '</div>').join(''); break;
    }
    case 'form': { const { renderForm } = await import('./forms.js'); inner = head(s) + '<div class="max-w-2xl">' + await renderForm(s.formId) + '</div>'; break; }
    case 'posts': {
      const blogs = (await fetchJSON('blogs')).filter(b => b.status === 'published').sort((a, b) => b.date.localeCompare(a.date)).slice(0, s.limit || 3);
      inner = head(s) + (blogs.length ? '<div class="' + grid(3) + '">' + blogs.map(b => postCard(b)).join('') + '</div>' : empty()) +
        '<div class="mt-8"><a class="link-arrow" href="' + url('news/blog/') + '">' + t('allPosts') + icon('arrow-right') + '</a></div>'; break;
    }
    case 'events': {
      const ev = (await fetchJSON('events')).sort((a, b) => a.date.localeCompare(b.date)).slice(0, s.limit || 3);
      inner = head(s) + (ev.length ? '<div class="' + grid(3) + '">' + ev.map(e => eventCard(e)).join('') + '</div>' : empty()); break;
    }
    case 'fees': {
      const rows = await fetchJSON('tuition-fees'); const f = (n) => 'IDR ' + Number(n).toLocaleString('id-ID');
      inner = head(s) + '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>' + t('division') + '</th><th>' + t('grades') + '</th><th>' + t('applicationFee') + '</th><th>' + t('annualTuition') + '</th><th>' + t('capitalFee') + '</th></tr></thead><tbody>' +
        rows.map(r => '<tr><td><b>' + esc(r.division) + '</b></td><td>' + esc(r.grades) + '</td><td>' + f(r.application) + '</td><td>' + f(r.annual) + '</td><td>' + f(r.capital) + '</td></tr>').join('') + '</tbody></table></div>' +
        '<p class="form-note">' + t('feesNote') + '</p>'; break;
    }
    case 'calendar': {
      const rows = await fetchJSON('school-calendar');
      inner = head(s) + '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>' + t('term') + '</th><th>' + t('event') + '</th><th>' + t('dates') + '</th></tr></thead><tbody>' +
        rows.map(r => '<tr><td>' + esc(r.term) + '</td><td><b>' + esc(L(r.label)) + '</b></td><td>' + fmtDate(r.start) + (r.end && r.end !== r.start ? ' – ' + fmtDate(r.end) : '') + '</td></tr>').join('') + '</tbody></table></div>'; break;
    }
    case 'acceptances': {
      const rows = await fetchJSON('university-acceptances');
      inner = head(s) + '<div class="uni-marquee">' + rows.map(u => '<span class="uni-pill">' + esc(u.university) + ' <small style="color:var(--c-muted)">· ' + esc(u.country) + '</small></span>').join('') + '</div>' +
        '<div class="mt-8"><a class="link-arrow" href="' + url('university-acceptances/') + '">' + t('fullList') + icon('arrow-right') + '</a></div>'; break;
    }
    case 'contact': inner = head(s) + '<div class="' + grid(3) + '">' +
      '<div class="icon-card"><div class="icon-chip">' + icon('map-pin') + '</div><h3>' + t('address') + '</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(cfg.contact.address) + '</p><a class="link-arrow mt-3" target="_blank" rel="noopener" href="' + esc(cfg.contact.mapUrl) + '">' + t('openMap') + icon('external-link') + '</a></div>' +
      '<div class="icon-card"><div class="icon-chip">' + icon('phone') + '</div><h3>' + t('phone') + '</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(cfg.contact.phone) + '</p><a class="link-arrow mt-3" href="tel:' + esc(cfg.contact.phone.replace(/\s/g, '')) + '">' + t('callUs') + icon('arrow-right') + '</a></div>' +
      '<div class="icon-card"><div class="icon-chip">' + icon('mail') + '</div><h3>Email</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(cfg.contact.email) + '</p><a class="link-arrow mt-3" href="mailto:' + esc(cfg.contact.email) + '">' + t('writeUs') + icon('arrow-right') + '</a></div></div>'; break;
    case 'links': inner = head(s) + '<div class="' + grid(s.cols || 3) + '">' + (s.items || []).map(c =>
      '<a class="icon-card rv" href="' + url(c.url) + '" style="text-decoration:none"><div class="icon-chip">' + icon(c.icon || 'arrow-up-right') + '</div><h3>' + esc(L(c.title)) + '</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(L(c.text)) + '</p></a>').join('') + '</div>'; break;
    case 'video': inner = head(s) + '<div class="split-media" style="position:relative;aspect-ratio:16/9">' + img(s.poster, s.heading) +
      '<button class="btn btn-gold" data-modal-open="video-' + idx + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">' + icon('play') + esc(L(s.ctaText) || t('watchVideo')) + '</button></div>' +
      '<template id="video-' + idx + '">' + (s.src ? '<video controls style="width:100%;border-radius:12px" src="' + esc(s.src) + '"></video>' : '<p>' + t('videoPlaceholder') + '</p>') + '</template>'; break;
    case 'programFacts': {
      const p = (await fetchJSON('academic-programs')).find(x => x.slug === s.ref);
      if (!p) { inner = empty(); break; }
      inner = '<div class="' + grid(4) + '">' + [['users', t('ages'), p.ages], ['graduation-cap', t('grades'), p.grades], ['school', t('classSize'), p.classSize], ['book-open', t('curriculum'), p.curriculum]].map(x =>
        '<div class="icon-card"><div class="icon-chip">' + icon(x[0]) + '</div><div class="text-xs font-bold uppercase tracking-wider" style="color:var(--c-accent-2)">' + x[1] + '</div><div class="font-display text-lg mt-1" style="color:var(--c-primary)">' + esc(x[2]) + '</div></div>').join('') + '</div>'; break;
    }
    case 'sportFacts': {
      const p = (await fetchJSON('sports')).find(x => x.slug === s.ref);
      if (!p) { inner = empty(); break; }
      inner = '<div class="' + grid(3) + '">' + [['users', t('ages'), p.ages], ['calendar', t('season'), L(p.season)], ['map-pin', t('venue'), p.venue], ['user', t('coach'), p.coach], ['tag', t('programFee'), p.fee], ['backpack', t('bring'), L(p.bring)]].map(x =>
        '<div class="icon-card"><div class="icon-chip">' + icon(x[0]) + '</div><div class="text-xs font-bold uppercase tracking-wider" style="color:var(--c-accent-2)">' + x[1] + '</div><div class="mt-1 text-sm">' + esc(x[2]) + '</div></div>').join('') + '</div>'; break;
    }
    case 'campaign': {
      const pct = Math.min(100, Math.round((s.raised / s.goal) * 100));
      inner = head(s) + '<div class="max-w-3xl"><div class="flex justify-between text-sm font-semibold mb-2"><span>' + t('raised') + ': IDR ' + Number(s.raised).toLocaleString('id-ID') + '</span><span>' + t('goal') + ': IDR ' + Number(s.goal).toLocaleString('id-ID') + '</span></div>' +
        '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + pct + '%"></div></div>' +
        '<p class="text-sm mt-2" style="color:var(--c-muted)">' + pct + '% ' + t('ofGoal') + ' · ' + t('campaignSample') + '</p>' +
        '<div class="mt-6 flex gap-3 flex-wrap">' + btn(t('donateNow'), url('giving/donate/'), 'gold') + btn(t('seeImpact'), url('giving/impact/'), 'outline') + '</div></div>'; break;
    }
    default: inner = head(s) + paras(s.body || '');
  }
  const bg = s.background === 'dark' ? ' dark' : s.background === 'alt' ? ' alt' : (idx % 2 ? ' alt' : '');
  return '<section class="section' + bg + '" id="s-' + idx + '"><div class="wrap">' + inner + '</div></section>';
}
export function postCard(b) {
  return '<article class="card rv"><a class="card-img" href="' + url('news/blog/detail.html?slug=' + b.slug) + '">' + img(b.image, b.title) + '</a><div class="card-body">' +
    '<div class="post-meta"><span class="chip">' + esc(b.category) + '</span><span>' + fmtDate(b.date) + '</span></div>' +
    '<h3>' + esc(L(b.title)) + '</h3><p>' + esc(L(b.excerpt)) + '</p>' +
    '<a class="link-arrow" href="' + url('news/blog/detail.html?slug=' + b.slug) + '">' + t('readMore') + icon('arrow-right') + '</a></div></article>';
}
export function eventCard(e) {
  return '<article class="card rv"><a class="card-img" href="' + url('community/events/detail.html?id=' + e.id) + '">' + img(e.image, e.title) + '</a><div class="card-body">' +
    '<div class="post-meta"><span class="chip">' + esc(L(e.category)) + '</span><span>' + fmtDate(e.date) + '</span></div>' +
    '<h3>' + esc(L(e.title)) + '</h3><p>' + esc(L(e.excerpt)) + '</p>' +
    '<a class="link-arrow" href="' + url('community/events/detail.html?id=' + e.id) + '">' + t('eventDetails') + icon('arrow-right') + '</a></div></article>';
}
export function renderRelated(items) {
  if (!items || !items.length) return '';
  return '<section class="section alt"><div class="wrap"><span class="kicker">' + t('keepExploring') + '</span><h2 class="mt-3 mb-8">' + t('relatedPages') + '</h2><div class="' + grid(3) + '">' +
    items.map(p => '<a class="icon-card rv" style="text-decoration:none" href="' + url(p.slug + '/') + '"><div class="icon-chip">' + icon('arrow-up-right') + '</div><h3>' + esc(L(p.title)) + '</h3><p class="text-sm mt-2" style="color:var(--c-muted)">' + esc(L(p.hero && p.hero.description)) + '</p></a>').join('') + '</div></div></section>';
}
// Satu delegated handler global → tidak ada duplikasi listener saat re-render.
export function delegate(e) {
  const acc = e.target.closest('[data-acc]');
  if (acc) { const p = acc.closest('.acc'); const open = p.classList.toggle('open'); acc.setAttribute('aria-expanded', open); return; }
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    const parts = tab.dataset.tab.split(':'); const gid = parts[0], i = parts[1];
    tab.closest('.tabs-nav').querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b === tab));
    document.querySelectorAll('[id^="' + gid + ':"]').forEach(p => p.classList.toggle('active', p.id === gid + ':' + i));
    return;
  }
  const mo = e.target.closest('[data-modal-open]');
  if (mo) { openModal(document.getElementById(mo.dataset.modalOpen)); return; }
  if (e.target.closest('[data-modal-close]') || e.target.classList.contains('overlay')) { closeModal(); return; }
  const cp = e.target.closest('[data-copy]');
  if (cp) { navigator.clipboard.writeText(cp.dataset.copy).then(() => toast(t('copied'))); return; }
}
export function openModal(tplOrHtml) {
  const r = document.getElementById('modal-root'); if (!r) return;
  const content = tplOrHtml instanceof HTMLTemplateElement ? tplOrHtml.innerHTML : tplOrHtml;
  r.innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="modal-card"><button class="modal-x" data-modal-close aria-label="' + t('close') + '">' + icon('x') + '</button>' + content + '</div></div>';
  refreshIcons();
  const x = r.querySelector('.modal-x'); if (x) x.focus();
}
export function closeModal() { const r = document.getElementById('modal-root'); if (r) r.innerHTML = ''; }
export function reveal(scope) {
  const els = (scope || document).querySelectorAll('.rv');
  if (reducedMotion || !('IntersectionObserver' in window)) { els.forEach(x => x.classList.add('in')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.12 });
  els.forEach(x => io.observe(x));
}
