
import { url, qs } from './config.js';
import { fetchJSON } from './data-service.js';
import { L, t } from './i18n.js';
import { esc, icon, eventCard, fmtDate, refreshIcons, reveal } from './components.js';
const today = () => new Date().toISOString().slice(0, 10);
export async function initEventList(root) {
  const events = (await fetchJSON('events')).sort((a, b) => a.date.localeCompare(b.date));
  const up = events.filter(e => e.date >= today()), past = events.filter(e => e.date < today()).reverse();
  const list = (arr) => arr.length ? '<div class="grid gap-6 md:grid-cols-3">' + arr.map(eventCard).join('') + '</div>' : '<div class="empty-state">' + t('noEvents') + '</div>';
  root.innerHTML = '<section class="section"><div class="wrap">' +
    '<div class="tabs-nav" role="tablist"><button class="tab-btn" role="tab" data-tab="ev:0" aria-selected="true">' + t('upcoming') + ' (' + up.length + ')</button><button class="tab-btn" role="tab" data-tab="ev:1" aria-selected="false">' + t('past') + ' (' + past.length + ')</button></div>' +
    '<div class="tab-panel active" id="ev:0" role="tabpanel">' + list(up) + '</div>' +
    '<div class="tab-panel" id="ev:1" role="tabpanel">' + list(past) + '</div></div></section>';
  refreshIcons(); reveal(root);
}
export async function renderEventDetail(main) {
  const id = qs('id');
  const events = await fetchJSON('events');
  const e = events.find(x => x.id === id);
  if (!e) { main.innerHTML = '<div class="wrap section"><div class="empty-state"><h2>' + t('eventNotFound') + '</h2><p><a class="btn btn-primary mt-4" href="' + url('community/events/') + '">' + t('backToEvents') + '</a></p></div></div>'; return null; }
  const { renderForm } = await import('./forms.js');
  const others = events.filter(x => x.id !== e.id && x.date >= today()).slice(0, 3);
  main.innerHTML = '<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="' + url('') + '">' + t('home') + '</a><span class="sep">/</span><a href="' + url('community/events/') + '">' + t('events') + '</a><span class="sep">/</span><span aria-current="page">' + esc(L(e.title)) + '</span></nav>' +
    '<div class="page-hero"><img class="bg" src="' + url(e.image) + '" alt=""><div class="wrap"><span class="kicker" style="color:var(--c-accent)">' + esc(L(e.category)) + '</span><h1 class="mt-3">' + esc(L(e.title)) + '</h1><p class="mt-3">' + esc(L(e.excerpt)) + '</p></div></div>' +
    '<section class="section"><div class="wrap"><div class="grid gap-6 md:grid-cols-4 mb-10">' +
    [['calendar', t('date'), fmtDate(e.date)], ['clock', t('time'), e.time], ['map-pin', t('location'), L(e.location)], ['users', t('audience'), L(e.audience)]].map(x =>
      '<div class="icon-card"><div class="icon-chip">' + icon(x[0]) + '</div><div class="text-xs font-bold uppercase tracking-wider" style="color:var(--c-accent-2)">' + x[1] + '</div><div class="mt-1 text-sm">' + esc(x[2]) + '</div></div>').join('') + '</div>' +
    '<div class="prose">' + (Array.isArray(e.body) ? e.body : [e.body]).map(p => '<p>' + esc(L(p)) + '</p>').join('') + '</div>' +
    (e.date >= today() ? '<div class="mt-10 max-w-2xl" id="ev-reg"><h2 class="mb-4">' + t('registerEvent') + '</h2>' + await renderForm('event-registration') + '</div>' : '<p class="form-note mt-8">' + t('eventEnded') + '</p>') + '</div></section>' +
    (others.length ? '<section class="section alt"><div class="wrap"><h2 class="mb-8">' + t('moreEvents') + '</h2><div class="grid gap-6 md:grid-cols-3">' + others.map(eventCard).join('') + '</div></div></section>' : '');
  return { slug: 'community/events', title: L(e.title), hero: { description: L(e.excerpt), image: e.image }, seo: { title: L(e.title), description: L(e.excerpt) } };
}
