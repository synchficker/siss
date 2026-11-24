
import { url } from './config.js';
import { fetchJSON } from './data-service.js';
import { L, t } from './i18n.js';
import { esc, refreshIcons } from './components.js';
let index = null, sel = -1;
async function buildIndex() {
  if (index) return index;
  const [pages, blogs, events] = await Promise.all([fetchJSON('pages'), fetchJSON('blogs'), fetchJSON('events')]);
  index = [
    ...pages.filter(p => p.status === 'published').map(p => ({ k: t('page'), title: L(p.title), text: L(p.hero.description), href: url(p.slug + '/') })),
    ...blogs.filter(b => b.status === 'published').map(b => ({ k: 'Blog', title: L(b.title), text: L(b.excerpt), href: url('news/blog/detail.html?slug=' + b.slug) })),
    ...events.map(e => ({ k: t('event'), title: L(e.title), text: L(e.excerpt), href: url('community/events/detail.html?id=' + e.id) }))
  ];
  return index;
}
export async function openSearch() {
  const r = document.getElementById('search-root'); if (!r) return;
  r.innerHTML = '<div class="overlay" data-search-close><div class="search-box" role="dialog" aria-modal="true" aria-label="' + t('search') + '">' +
    '<input type="search" id="search-input" placeholder="' + t('searchPlaceholder') + '" aria-label="' + t('search') + '" autocomplete="off">' +
    '<div class="search-results" id="search-results"><p class="text-sm p-4" style="color:var(--c-muted)">' + t('searchHint') + '</p></div></div></div>';
  const input = document.getElementById('search-input');
  const data = await buildIndex();
  input.focus();
  input.addEventListener('input', () => {
    sel = -1;
    const q = input.value.trim().toLowerCase();
    const box = document.getElementById('search-results');
    if (q.length < 2) { box.innerHTML = '<p class="text-sm p-4" style="color:var(--c-muted)">' + t('searchHint') + '</p>'; return; }
    const hits = data.filter(x => (x.title + ' ' + x.text).toLowerCase().includes(q)).slice(0, 12);
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    box.innerHTML = hits.length ? hits.map(x =>
      '<a href="' + x.href + '"><span class="sr-k">' + esc(x.k) + '</span><div class="font-semibold text-sm">' + esc(x.title).replace(re, '<mark>$1</mark>') + '</div><div class="text-xs" style="color:var(--c-muted)">' + esc(x.text).slice(0, 110).replace(re, '<mark>$1</mark>') + '…</div></a>'
    ).join('') : '<p class="text-sm p-4" style="color:var(--c-muted)">' + t('noResults') + '</p>';
  });
  input.addEventListener('keydown', (e) => {
    const links = Array.from(document.querySelectorAll('#search-results a'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!links.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((a, i) => a.classList.toggle('sel', i === sel)); links[sel].focus();
    }
    if (e.key === 'Enter' && sel >= 0 && links[sel]) location.href = links[sel].href;
  });
  r.addEventListener('click', (e) => { if (e.target.hasAttribute('data-search-close') || e.target.closest('a')) closeSearch(); });
  document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { closeSearch(); document.removeEventListener('keydown', esc2); } });
  refreshIcons();
}
export function closeSearch() { const r = document.getElementById('search-root'); if (r) r.innerHTML = ''; }
