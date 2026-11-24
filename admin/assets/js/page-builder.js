
import { working, saveDraft } from './json-manager.js';
import { esc, icons, toast, sectionsList } from './admin.js';
import { url } from '../../../assets/js/config.js';
const TEMPLATES = ['standard', 'landing', 'program', 'campus', 'form', 'campaign', 'contact', 'blog-list', 'event-list'];
export async function pageBuilder(root, view) {
  const isHome = view === 'homepage';
  const params = new URLSearchParams(location.search);
  if (isHome) {
    const home = await working('homepage');
    root.innerHTML = '<div class="card"><h2>Homepage sections</h2><p class="small muted">Aktif/nonaktif, urutkan (drag atau ↑↓), edit, tambah, hapus. Hero & testimoni adalah section khusus homepage.</p><div id="secs"></div><div class="row" style="margin-top:1rem"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button><button class="btn btn-g" id="prev"><i data-lucide="eye"></i>Preview</button><button class="btn btn-o" id="exp">Ekspor homepage.json</button></div></div>';
    sectionsList(root.querySelector('#secs'), home.sections, () => {});
    root.querySelector('#save').onclick = () => { home.sections.forEach((s, i) => s.order = i + 1); saveDraft('homepage', home); toast('Homepage tersimpan sebagai draft.'); };
    root.querySelector('#prev').onclick = () => { sessionStorage.setItem('cis-preview', JSON.stringify({ homepage: home })); window.open(url('') + '?preview=1', '_blank'); };
    root.querySelector('#exp').onclick = async () => { const { exportFile } = await import('./json-manager.js'); exportFile('homepage'); };
    icons(); return;
  }
  const pages = await working('pages');
  const slug = params.get('slug');
  const isNew = params.get('new') === '1';
  let page = isNew ? { id: 'page-' + Date.now().toString(36), slug: 'new-page', title: 'New Page', status: 'draft', language: 'en', template: 'standard', hero: { kicker: '', title: 'New Page', description: '', image: 'assets/images/about/about.svg' }, sections: [], seo: { title: '', description: '' }, related: [], cta: true } : pages.find(p => p.slug === slug);
  if (!page) { root.innerHTML = '<div class="alert bad">Halaman tidak ditemukan.</div>'; return; }
  root.innerHTML = '<div class="card"><h2>' + (isNew ? 'Halaman baru' : 'Edit: ' + esc(page.slug)) + '</h2>' +
   '<div class="grid g2"><div class="field"><label>Judul</label><input id="p-title" value="' + esc(page.title) + '"></div><div class="field"><label>Slug (tanpa slash awal/akhir)</label><input id="p-slug" value="' + esc(page.slug) + '"></div>' +
   '<div class="field"><label>Template</label><select id="p-tpl">' + TEMPLATES.map(t => '<option ' + (t === page.template ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div><div class="field"><label>Status</label><select id="p-status"><option ' + (page.status === 'published' ? 'selected' : '') + '>published</option><option ' + (page.status === 'draft' ? 'selected' : '') + '>draft</option></select></div>' +
   '<div class="field"><label>Hero kicker</label><input id="p-kick" value="' + esc(page.hero.kicker || '') + '"></div><div class="field"><label>Hero image</label><input id="p-img" value="' + esc(page.hero.image || '') + '"></div></div>' +
   '<div class="field"><label>Hero description / intro</label><textarea id="p-desc">' + esc(page.hero.description || '') + '</textarea></div>' +
   '<div class="grid g2"><div class="field"><label>SEO title</label><input id="p-seot" value="' + esc((page.seo && page.seo.title) || '') + '"></div><div class="field"><label>SEO description</label><input id="p-seod" value="' + esc((page.seo && page.seo.description) || '') + '"></div></div>' +
   '<div class="field"><label>Related slugs (koma)</label><input id="p-rel" value="' + esc((page.related || []).join(', ')) + '"></div></div>' +
   '<div class="card"><h2>Sections</h2><div id="secs"></div></div>' +
   '<div class="row"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button><button class="btn btn-g" id="prev"><i data-lucide="eye"></i>Preview</button>' + (isNew ? '<button class="btn btn-o" id="shell"><i data-lucide="file-code"></i>Unduh file HTML</button>' : '') + '<a class="btn btn-o" href="pages.html">Kembali</a></div>' +
   (isNew ? '<div class="alert info" style="margin-top:1rem">Halaman baru butuh file HTML di path slug-nya. Klik "Unduh file HTML" lalu letakkan di <code>[slug]/index.html</code> pada repo, atau buat manual menyalin halaman lain dan mengubah <code>data-page</code>.</div>' : '');
  sectionsList(root.querySelector('#secs'), page.sections, () => {});
  const gather = () => {
    page.title = root.querySelector('#p-title').value; page.slug = root.querySelector('#p-slug').value.trim().replace(/^\/+|\/+$/g, '');
    page.template = root.querySelector('#p-tpl').value; page.status = root.querySelector('#p-status').value;
    page.hero = Object.assign({}, page.hero, { kicker: root.querySelector('#p-kick').value, description: root.querySelector('#p-desc').value, image: root.querySelector('#p-img').value, title: root.querySelector('#p-title').value });
    page.seo = { title: root.querySelector('#p-seot').value, description: root.querySelector('#p-seod').value };
    page.related = root.querySelector('#p-rel').value.split(',').map(s => s.trim()).filter(Boolean);
    return page;
  };
  root.querySelector('#save').onclick = () => { gather(); if (isNew && !pages.includes(page)) pages.push(page); saveDraft('pages', pages); toast('Tersimpan sebagai draft.'); };
  root.querySelector('#prev').onclick = () => { gather(); sessionStorage.setItem('cis-preview', JSON.stringify({ pages })); window.open(url(page.slug + '/') + '?preview=1', '_blank'); };
  const sh = root.querySelector('#shell'); if (sh) sh.onclick = () => { gather(); downloadShell(page); };
  icons();
}
function downloadShell(page) {
  const depth = page.slug ? page.slug.split('/').length : 0; const p = '../'.repeat(depth);
  const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + page.title + ' — Cakrawala International School</title>\n<meta name="description" content="' + (page.hero.description || '') + '">\n<link rel="icon" type="image/svg+xml" href="' + p + 'assets/images/logo/favicon.svg">\n<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n<link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet"><link href="https://cdn.jsdelivr.net/npm/glightbox@3.2.0/dist/css/glightbox.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script>\n<link rel="stylesheet" href="' + p + 'assets/css/style.css"><link rel="stylesheet" href="' + p + 'assets/css/responsive.css">\n</head>\n<body data-page="' + page.slug + '" data-template="' + page.template + '">\n<a class="skip-link" href="#main">Skip to main content</a>\n<header id="hdr"></header>\n<main id="main" tabindex="-1"><div class="page-loading"><span class="spinner"></span><p>Loading…</p></div></main>\n<footer id="ftr"></footer>\n<div id="search-root"></div><div id="modal-root"></div><div id="sticky-root"></div><div id="toast-root"></div>\n<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/glightbox@3.2.0/dist/js/glightbox.min.js"><\/script>\n<script type="module" src="' + p + 'assets/js/app.js"><\/script>\n</body>\n</html>';
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = 'index.html'; a.click(); URL.revokeObjectURL(a.href);
}
