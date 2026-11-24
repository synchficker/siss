
import { url } from '../../../assets/js/config.js';
import { fetchJSON } from '../../../assets/js/data-service.js';
import * as auth from './auth.js';
import * as jm from './json-manager.js';
import * as gh from './github-publisher.js';
import { dashboard } from './dashboard.js';
import { pageManager } from './page-manager.js';
import { pageBuilder } from './page-builder.js';
import { navManager } from './navigation-manager.js';
import { blogManager, blogEditor } from './blog-manager.js';
import { mediaManager } from './media-manager.js';
import { settingsManager } from './settings-manager.js';
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icons = () => { if (window.lucide) window.lucide.createIcons(); };
export function toast(m) { const r = document.getElementById('toast-root'); const d = document.createElement('div'); d.className = 'toast'; d.textContent = m; r.appendChild(d); setTimeout(() => d.remove(), 3200); }
export function modal(html) { const r = document.getElementById('modal-root'); r.innerHTML = '<div class="overlay"><div class="modal"><button class="modal-x" data-close aria-label="Tutup">✕</button>' + html + '</div></div>'; icons(); return r.querySelector('.modal'); }
export function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
document.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target.classList.contains('overlay')) closeModal(); });
const NAV = [
 { g: 'Utama' }, { v: 'dashboard', href: 'dashboard.html', icon: 'layout-dashboard', label: 'Dashboard' },
 { g: 'Konten' }, { v: 'pages', href: 'pages.html', icon: 'files', label: 'Halaman' }, { v: 'homepage', href: 'homepage.html', icon: 'home', label: 'Homepage' }, { v: 'navigation', href: 'navigation.html', icon: 'menu', label: 'Navigasi' }, { v: 'blog', href: 'blog.html', icon: 'pen-line', label: 'Blog' }, { v: 'events', href: 'events.html', icon: 'calendar-days', label: 'Acara' },
 { g: 'Data Sekolah' }, { v: 'campuses', href: 'campuses.html', icon: 'map-pin', label: 'Kampus' }, { v: 'academics', href: 'academics.html', icon: 'book-open', label: 'Akademik' }, { v: 'activities', href: 'activities.html', icon: 'puzzle', label: 'Kegiatan & Olahraga' }, { v: 'community', href: 'community.html', icon: 'users', label: 'Komunitas' }, { v: 'giving', href: 'giving.html', icon: 'hand-heart', label: 'Donasi' }, { v: 'testimonials', href: 'testimonials.html', icon: 'quote', label: 'Testimoni' }, { v: 'faqs', href: 'faqs.html', icon: 'help-circle', label: 'FAQ' },
 { g: 'Sistem' }, { v: 'media', href: 'media.html', icon: 'image', label: 'Media' }, { v: 'forms', href: 'forms.html', icon: 'clipboard-list', label: 'Formulir' }, { v: 'seo', href: 'seo.html', icon: 'search', label: 'SEO' }, { v: 'settings', href: 'settings.html', icon: 'settings', label: 'Pengaturan' }
];
function layout(view, title) {
  const side = NAV.map(n => n.g ? '<div class="grp">' + n.g + '</div>' : '<a href="' + n.href + '" class="' + (n.v === view ? 'on' : '') + '"><i data-lucide="' + n.icon + '"></i>' + n.label + '</a>').join('');
  document.getElementById('admin').innerHTML =
   '<div class="a-shell"><aside class="a-side"><div class="a-brand"><i data-lucide="sunrise"></i>Cakrawala CMS</div><nav class="a-nav">' + side + '</nav>' +
   '<div style="margin-top:1.5rem;padding:.6rem"><a href="' + url('') + '" target="_blank" class="btn btn-o btn-sm" style="width:100%;justify-content:center"><i data-lucide="external-link"></i>Lihat situs</a>' +
   '<button class="btn btn-o btn-sm" id="logout" style="width:100%;justify-content:center;margin-top:.4rem"><i data-lucide="log-out"></i>Keluar</button></div></aside>' +
   '<main class="a-main"><div class="a-top"><h1>' + title + '</h1><div class="sp"></div>' +
   '<span class="badge draft" id="dirty-badge">0 draft</span>' +
   '<button class="btn btn-o btn-sm" id="btn-import"><i data-lucide="upload"></i>Impor</button>' +
   '<button class="btn btn-o btn-sm" id="btn-export"><i data-lucide="download"></i>Ekspor semua</button>' +
   '<button class="btn btn-o btn-sm" id="btn-modes"><i data-lucide="info"></i>Mode</button>' +
   '<button class="btn btn-p btn-sm" id="btn-gh"><i data-lucide="github"></i><span id="gh-label">Connect GitHub</span></button>' +
   '<button class="btn btn-g btn-sm" id="btn-publish"><i data-lucide="rocket"></i>Publish</button></div>' +
   '<div id="view"></div></main></div><input type="file" id="import-file" accept=".json" hidden>';
  document.getElementById('logout').onclick = () => { auth.logout(); location.href = 'index.html'; };
  document.getElementById('btn-export').onclick = () => jm.exportAll();
  document.getElementById('btn-import').onclick = () => document.getElementById('import-file').click();
  document.getElementById('import-file').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      if (f.name.includes('bundle')) { const n = await jm.importBundle(f); toast(n + ' file diimpor sebagai draft.'); }
      else { const name = f.name.replace(/\.json$/, ''); await jm.importFile(name, f); toast(name + '.json diimpor sebagai draft.'); }
      refreshDirty(); route(view, true);
    } catch (err) { alert('Impor gagal: ' + err.message); }
    e.target.value = '';
  };
  document.getElementById('btn-modes').onclick = modesDocs;
  document.getElementById('btn-gh').onclick = ghModal;
  document.getElementById('btn-publish').onclick = publishModal;
  document.addEventListener('cis-dirty', refreshDirty);
  refreshDirty(); icons();
  return document.getElementById('view');
}
function refreshDirty() { const n = jm.dirtyFiles().length; const b = document.getElementById('dirty-badge'); if (b) { b.textContent = n + ' draft'; b.className = 'badge ' + (n ? 'draft' : 'pub'); } const l = document.getElementById('gh-label'); if (l) l.textContent = gh.isConnected() ? 'GitHub ✓' : 'Connect GitHub'; }
function modesDocs() {
  modal('<h2>Tiga mode penyimpanan</h2>' +
   '<div class="alert warn">GitHub Pages tidak punya backend. Perubahan CMS tidak otomatis mengubah situs publik sampai Anda memublikasikannya.</div>' +
   '<h3>Mode 1 — Lokal / Offline</h3><p class="small">Edit disimpan sebagai draft di localStorage browser ini. Ekspor JSON lalu ganti file di repository. Draft lokal TIDAK mengubah situs publik.</p>' +
   '<h3>Mode 2 — GitHub Publisher</h3><p class="small">Masukkan fine-grained Personal Access Token (izin Contents: Read & write, hanya repo tujuan). Token hanya di memori sesi. CMS membuat commit ke branch; GitHub Pages men-deploy otomatis.</p>' +
   '<div class="alert bad">Keamanan: token di browser dapat diakses oleh kode apa pun yang berjalan di origin ini selama sesi aktif. Jangan gunakan token di perangkat bersama; disconnect setelah selesai.</div>' +
   '<h3>Mode 3 — Publish manual</h3><p class="small">Ekspor JSON → ganti file di repo → commit & push → tunggu deployment GitHub Pages.</p>');
}
function ghModal() {
  const c = gh.connInfo();
  const m = modal('<h2>GitHub Publisher</h2>' +
   '<div class="alert warn">Token hanya disimpan di memori sesi browser — tidak pernah di localStorage, sessionStorage, JSON, atau source code. Kode di origin ini dapat mengaksesnya selama sesi aktif.</div>' +
   '<div class="field"><label>Fine-grained PAT (Contents: Read & write)</label><input type="password" id="gh-token" placeholder="github_pat_…" autocomplete="off"></div>' +
   '<div class="grid g3"><div class="field"><label>Owner</label><input id="gh-owner" value="' + esc(c.owner) + '"></div><div class="field"><label>Repository</label><input id="gh-repo" value="' + esc(c.repo) + '"></div><div class="field"><label>Branch</label><input id="gh-branch" value="' + esc(c.branch || 'main') + '"></div></div>' +
   '<div class="row"><button class="btn btn-p" id="gh-connect"><i data-lucide="plug"></i>Connect</button><button class="btn btn-o" id="gh-test"><i data-lucide="check"></i>Test Connection</button><button class="btn btn-o" id="gh-repos"><i data-lucide="list"></i>Select Repository</button><button class="btn btn-o" id="gh-load"><i data-lucide="refresh-cw"></i>Load Latest Data</button><button class="btn btn-d" id="gh-disc"><i data-lucide="unplug"></i>Disconnect</button></div>' +
   '<div id="gh-out" class="small muted" style="margin-top:1rem"></div><div id="gh-repo-list"></div>');
  const out = m.querySelector('#gh-out');
  const cfg = () => ({ token: m.querySelector('#gh-token').value.trim(), owner: m.querySelector('#gh-owner').value.trim(), repo: m.querySelector('#gh-repo').value.trim(), branch: m.querySelector('#gh-branch').value.trim() || 'main' });
  m.querySelector('#gh-connect').onclick = () => { const c2 = cfg(); if (!c2.token) { out.textContent = 'Masukkan token.'; return; } gh.connect(c2); out.textContent = 'Token disimpan di memori. Klik Test Connection.'; refreshDirty(); };
  m.querySelector('#gh-test').onclick = async () => { try { if (!gh.isConnected()) gh.connect(cfg()); const r = await gh.test(); out.innerHTML = '<span class="badge pub">Terhubung</span> ' + esc(r.full_name) + ' (branch default: ' + esc(r.default_branch) + ')'; refreshDirty(); } catch (e) { out.innerHTML = '<span class="badge draft">Gagal</span> ' + esc(e.message); } };
  m.querySelector('#gh-repos').onclick = async () => { try { if (!gh.isConnected()) gh.connect(cfg()); const rs = await gh.listRepos(); m.querySelector('#gh-repo-list').innerHTML = rs.length ? '<div class="field"><label>Pilih repo</label><select id="gh-pick">' + rs.map(r => '<option value="' + esc(r.full_name) + '">' + esc(r.full_name) + '</option>').join('') + '</select></div>' : '<p class="small muted">Token fine-grained mungkin tidak dapat mendaftar repo; isi manual.</p>'; const pick = m.querySelector('#gh-pick'); if (pick) pick.onchange = () => { const p = pick.value.split('/'); m.querySelector('#gh-owner').value = p[0]; m.querySelector('#gh-repo').value = p[1]; }; } catch (e) { out.textContent = e.message; } };
  m.querySelector('#gh-load').onclick = async () => { try { const rows = await gh.loadLatest(); out.innerHTML = rows.length ? rows.map(r => '<div>' + esc(r.name) + '.json — ' + (r.conflict ? '<span class="badge draft">KONFLIK: file remote berubah</span>' : r.exists ? 'remote dimuat' : 'file baru') + '</div>').join('') : 'Tidak ada draft.'; } catch (e) { out.textContent = e.message; } };
  m.querySelector('#gh-disc').onclick = () => { gh.disconnect(); out.textContent = 'Terputus. Token dihapus dari memori.'; refreshDirty(); };
}
async function publishModal() {
  if (!gh.isConnected()) { ghModal(); return; }
  const rows = await gh.preview();
  const m = modal('<h2>Preview & Publish</h2><p class="small muted">Perubahan draft vs data asli (baris berbeda):</p>' +
   (rows.length ? '<table><thead><tr><th>File</th><th>Baris berubah</th><th>Total baris</th></tr></thead><tbody>' + rows.map(r => '<tr><td>data/' + esc(r.name) + '.json</td><td>' + r.changed + '</td><td>' + r.lines + '</td></tr>').join('') + '</tbody></table>' : '<div class="alert info">Tidak ada draft untuk dipublikasikan.</div>') +
   '<div class="alert warn" style="margin-top:1rem">Publish membuat commit ke <b>' + esc(gh.connInfo().owner + '/' + gh.connInfo().repo) + '</b> branch <b>' + esc(gh.connInfo().branch) + '</b>. GitHub Pages akan men-deploy otomatis (~1 menit). Conflict detection aktif: file yang berubah di remote tidak akan ditimpa tanpa konfirmasi.</div>' +
   '<div class="row"><button class="btn btn-g" id="do-publish" ' + (rows.length ? '' : 'disabled') + '><i data-lucide="rocket"></i>Publish Changes</button><label class="small row" style="gap:.3rem"><input type="checkbox" id="force"> Timpa konflik (force)</label></div><div id="pub-out" style="margin-top:1rem"></div>');
  m.querySelector('#do-publish').onclick = async () => {
    const out = m.querySelector('#pub-out'); out.innerHTML = '<span class="spinner"></span> Memublikasikan…';
    try {
      const res = await gh.publish({ force: m.querySelector('#force').checked });
      out.innerHTML = res.map(r => '<div>' + esc(r.name) + '.json — ' + (r.status === 'ok' ? '<span class="badge pub">tercommit</span>' : '<span class="badge draft">KONFLIK — muat ulang data atau force</span>') + '</div>').join('') + '<p class="small muted">Tunggu deployment GitHub Pages selesai, lalu muat ulang situs publik.</p>';
      refreshDirty();
    } catch (e) { out.innerHTML = '<div class="alert bad">' + esc(e.message) + '</div>'; }
  };
}
// ---------- Generic collection editor ----------
const SCHEMAS = {
  campuses: { file: 'campuses', title: 'Kampus', idp: 'campus', cols: [['name', 'Nama'], ['division', 'Divisi'], ['ages', 'Usia']], fields: [['name', 'Nama', 'text'], ['slug', 'Slug', 'text'], ['division', 'Divisi', 'text'], ['address', 'Alamat', 'text'], ['ages', 'Usia', 'text'], ['established', 'Berdiri', 'number'], ['image', 'Gambar', 'text'], ['facilities', 'Fasilitas (per baris)', 'list']] },
  academics: { file: 'academic-programs', title: 'Program Akademik', idp: 'prog', cols: [['name', 'Nama'], ['grades', 'Kelas'], ['curriculum', 'Kurikulum']], fields: [['name', 'Nama', 'text'], ['slug', 'Slug', 'text'], ['ages', 'Usia', 'text'], ['grades', 'Kelas', 'text'], ['classSize', 'Ukuran kelas', 'text'], ['curriculum', 'Kurikulum', 'text'], ['campus', 'Kampus', 'text'], ['overview', 'Ringkasan', 'text']] },
  community: { file: 'community', title: 'Komunitas', idp: 'com', cols: [['name', 'Nama'], ['type', 'Tipe']], fields: [['name', 'Nama', 'text'], ['type', 'Tipe', 'text'], ['description', 'Deskripsi', 'text'], ['url', 'URL', 'text']] },
  giving: { file: 'giving', title: 'Dana Donasi', idp: 'fund', cols: [['name', 'Nama'], ['goal', 'Target'], ['raised', 'Terkumpul']], fields: [['name', 'Nama', 'text'], ['goal', 'Target (IDR)', 'number'], ['raised', 'Terkumpul (IDR)', 'number'], ['description', 'Deskripsi', 'text'], ['url', 'URL', 'text']] },
  events: { file: 'events', title: 'Acara', idp: 'ev', cols: [['title', 'Judul'], ['date', 'Tanggal'], ['category', 'Kategori']], fields: [['title', 'Judul', 'bi'], ['excerpt', 'Ringkasan', 'bi'], ['category', 'Kategori', 'bi'], ['date', 'Tanggal', 'text'], ['time', 'Waktu', 'text'], ['location', 'Lokasi', 'bi'], ['audience', 'Peserta', 'bi'], ['image', 'Gambar', 'text'], ['body', 'Isi', 'bijson']] },
  testimonials: { file: 'testimonials', title: 'Testimoni', idp: 't', cols: [['name', 'Nama'], ['role', 'Peran']], fields: [['name', 'Nama', 'text'], ['role', 'Peran', 'bi'], ['quote', 'Kutipan', 'bi']] },
  faqs: { file: 'faqs', title: 'FAQ', idp: 'faq', cols: [['q', 'Pertanyaan'], ['group', 'Grup']], fields: [['group', 'Grup', 'text'], ['q', 'Pertanyaan', 'bi'], ['a', 'Jawaban', 'bijson']] },
  forms: { file: 'forms', title: 'Formulir', idp: 'form', cols: [['id', 'ID'], ['title', 'Judul'], ['mode', 'Mode']], fields: [['id', 'ID', 'text'], ['title', 'Judul', 'bi'], ['mode', 'Mode (manual/mailto/endpoint)', 'text'], ['email', 'Email tujuan', 'text'], ['endpoint', 'Endpoint URL', 'text'], ['submitLabel', 'Label tombol', 'bi'], ['successMessage', 'Pesan sukses', 'bi'], ['fields', 'Fields (JSON array)', 'json']] }
};
function fieldInput(f, val) {
  const [key, label, type] = f;
  if (type === 'bi') { const v = val || {}; return '<div class="field"><label>' + label + ' (EN / ID)</label><div class="row"><input data-k="' + key + '.en" value="' + esc(v.en || '') + '" placeholder="EN"><input data-k="' + key + '.id" value="' + esc(v.id || '') + '" placeholder="ID"></div></div>'; }
  if (type === 'bijson') { const v = val || {}; return '<div class="field"><label>' + label + ' (EN / ID, paragraf per baris)</label><div class="row" style="align-items:stretch"><textarea data-k="' + key + '.en" placeholder="EN">' + esc(Array.isArray(v.en) ? v.en.join('\n') : (v.en || '')) + '</textarea><textarea data-k="' + key + '.id" placeholder="ID">' + esc(Array.isArray(v.id) ? v.id.join('\n') : (v.id || '')) + '</textarea></div></div>'; }
  if (type === 'list') return '<div class="field"><label>' + label + '</label><textarea data-k="' + key + '" data-type="list">' + esc((val || []).join('\n')) + '</textarea></div>';
  if (type === 'json') return '<div class="field"><label>' + label + '</label><textarea data-k="' + key + '" data-type="json" style="min-height:160px">' + esc(JSON.stringify(val || [], null, 1)) + '</textarea></div>';
  if (type === 'number') return '<div class="field"><label>' + label + '</label><input type="number" data-k="' + key + '" value="' + esc(val || 0) + '"></div>';
  return '<div class="field"><label>' + label + '</label><input data-k="' + key + '" value="' + esc(val || '') + '"></div>';
}
function collectFields(m) {
  const obj = {};
  m.querySelectorAll('[data-k]').forEach(el => {
    const path = el.dataset.k.split('.'); let v = el.value;
    if (el.dataset.type === 'list') v = v.split('\n').map(s => s.trim()).filter(Boolean);
    else if (el.dataset.type === 'json') v = JSON.parse(v || '[]');
    else if (el.tagName === 'TEXTAREA' && path.length === 2) v = v.split('\n').map(s => s.trim()).filter(Boolean);
    else if (el.type === 'number') v = Number(v);
    if (path.length === 2) { obj[path[0]] = obj[path[0]] || {}; obj[path[0]][path[1]] = v; } else obj[path[0]] = v;
  });
  return obj;
}
export async function collectionView(view, key) {
  const s = SCHEMAS[key]; const root = layout(view, s.title);
  let items = await jm.working(s.file);
  const draw = () => {
    root.innerHTML = '<div class="card"><div class="row" style="margin-bottom:.8rem"><button class="btn btn-p btn-sm" id="add"><i data-lucide="plus"></i>Tambah</button><button class="btn btn-o btn-sm" id="exp"><i data-lucide="download"></i>Ekspor JSON</button><button class="btn btn-o btn-sm" id="imp"><i data-lucide="upload"></i>Impor JSON</button><button class="btn btn-d btn-sm" id="reset"><i data-lucide="undo-2"></i>Reset draft</button><input type="file" id="fimp" accept=".json" hidden><div class="sp"></div><span class="small muted">' + items.length + ' item · sumber: data/' + s.file + '.json</span></div>' +
     '<table><thead><tr>' + s.cols.map(c => '<th>' + c[1] + '</th>').join('') + '<th></th></tr></thead><tbody>' +
     items.map((it, i) => '<tr>' + s.cols.map(c => { let v = it[c[0]]; if (v && typeof v === 'object') v = v.en; return '<td>' + esc(v) + '</td>'; }).join('') + '<td class="row"><button class="btn btn-o btn-sm" data-edit="' + i + '">Edit</button><button class="btn btn-d btn-sm" data-del="' + i + '">Hapus</button></td></tr>').join('') + '</tbody></table></div>';
    icons();
    root.querySelector('#add').onclick = () => edit(-1);
    root.querySelector('#exp').onclick = () => jm.exportFile(s.file);
    root.querySelector('#imp').onclick = () => root.querySelector('#fimp').click();
    root.querySelector('#fimp').onchange = async (e) => { try { items = await jm.importFile(s.file, e.target.files[0]); draw(); toast('Diimpor.'); } catch (err) { alert(err.message); } };
    root.querySelector('#reset').onclick = async () => { jm.resetDraft(s.file); items = await jm.working(s.file); draw(); toast('Draft direset.'); };
    root.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => edit(Number(b.dataset.edit)));
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('Hapus item ini?')) { items.splice(Number(b.dataset.del), 1); jm.saveDraft(s.file, items); draw(); } });
  };
  const edit = (i) => {
    const it = i >= 0 ? items[i] : {};
    const m = modal('<h2>' + (i >= 0 ? 'Edit' : 'Tambah') + ' ' + s.title + '</h2>' + s.fields.map(f => fieldInput(f, it[f[0]])).join('') + '<div class="row"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button></div>');
    m.querySelector('#save').onclick = () => {
      try {
        const obj = collectFields(m);
        if (!obj.id) obj.id = s.idp + '-' + Date.now().toString(36);
        if (i >= 0) items[i] = Object.assign({}, items[i], obj); else items.push(obj);
        jm.saveDraft(s.file, items); closeModal(); draw(); toast('Tersimpan sebagai draft.');
      } catch (e) { alert('Data tidak valid: ' + e.message); }
    };
  };
  draw();
}
// ---------- Section editor (dipakai page-builder & homepage) ----------
export const SECTION_TYPES = ['text', 'points', 'split', 'cards', 'stats', 'steps', 'faq', 'gallery', 'quote', 'cta', 'table', 'people', 'tabs', 'form', 'posts', 'events', 'fees', 'calendar', 'acceptances', 'contact', 'links', 'video', 'programFacts', 'sportFacts', 'campaign', 'testimonials', 'hero'];
const NEW_SEC = { text: { type: 'text', heading: 'New section', body: ['Write here.'] }, points: { type: 'points', heading: 'Highlights', items: ['Point one', 'Point two'] }, cards: { type: 'cards', heading: 'Cards', items: [{ icon: 'sparkles', title: 'Card', text: 'Description', url: '' }] }, stats: { type: 'stats', heading: 'Numbers', items: [{ value: '10', label: 'Label' }] }, cta: { type: 'cta', heading: 'Call to action', description: 'Supporting text', buttons: [{ text: 'Learn more', url: '', style: 'gold' }] }, faq: { type: 'faq', heading: 'FAQ', ref: 'admissions' }, form: { type: 'form', heading: 'Form', formId: 'inquiry' } };
export function sectionsList(container, sections, onChange) {
  const draw = () => {
    container.innerHTML = sections.map((s, i) => '<div class="sec-row" draggable="true" data-i="' + i + '"><span class="h"><i data-lucide="grip-vertical"></i></span><span class="t">' + esc(s.type) + (s.heading ? ' — ' + esc(typeof s.heading === 'object' ? s.heading.en : s.heading) : '') + '</span>' +
      '<label class="small row" style="gap:.25rem"><input type="checkbox" data-en="' + i + '" ' + (s.enabled === false ? '' : 'checked') + '> aktif</label>' +
      '<button class="btn btn-o btn-sm" data-up="' + i + '">↑</button><button class="btn btn-o btn-sm" data-down="' + i + '">↓</button><button class="btn btn-o btn-sm" data-es="' + i + '">Edit</button><button class="btn btn-d btn-sm" data-rm="' + i + '">✕</button></div>').join('') +
      '<div class="row" style="margin-top:.6rem"><select id="new-type">' + SECTION_TYPES.map(t => '<option>' + t + '</option>').join('') + '</select><button class="btn btn-p btn-sm" id="add-sec"><i data-lucide="plus"></i>Tambah section</button></div>';
    icons();
    container.querySelectorAll('[data-en]').forEach(c => c.onchange = () => { sections[Number(c.dataset.en)].enabled = c.checked; onChange(); });
    container.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = Number(b.dataset.up); if (i > 0) { const t = sections[i - 1]; sections[i - 1] = sections[i]; sections[i] = t; onChange(); draw(); } });
    container.querySelectorAll('[data-down]').forEach(b => b.onclick = () => { const i = Number(b.dataset.down); if (i < sections.length - 1) { const t = sections[i + 1]; sections[i + 1] = sections[i]; sections[i] = t; onChange(); draw(); } });
    container.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { sections.splice(Number(b.dataset.rm), 1); onChange(); draw(); });
    container.querySelectorAll('[data-es]').forEach(b => b.onclick = () => editSec(Number(b.dataset.es)));
    container.querySelector('#add-sec').onclick = () => { const t = container.querySelector('#new-type').value; sections.push(JSON.parse(JSON.stringify(NEW_SEC[t] || { type: t, heading: 'New ' + t }))); onChange(); draw(); };
    let dragI = null;
    container.querySelectorAll('.sec-row').forEach(row => {
      row.addEventListener('dragstart', () => { dragI = Number(row.dataset.i); row.classList.add('drag'); });
      row.addEventListener('dragend', () => row.classList.remove('drag'));
      row.addEventListener('dragover', (e) => e.preventDefault());
      row.addEventListener('drop', (e) => { e.preventDefault(); const to = Number(row.dataset.i); if (dragI === null || dragI === to) return; const it = sections.splice(dragI, 1)[0]; sections.splice(to, 0, it); onChange(); draw(); });
    });
  };
  const editSec = (i) => {
    const s = sections[i];
    const m = modal('<h2>Edit section</h2><div class="field"><label>Tipe</label><select id="s-type">' + SECTION_TYPES.map(t => '<option ' + (t === s.type ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>JSON section (heading, body, items, dll.)</label><textarea id="s-json" style="min-height:260px">' + esc(JSON.stringify(s, null, 1)) + '</textarea></div>' +
      '<div class="row"><button class="btn btn-p" id="s-save">Simpan</button><span class="small muted">Ubah tipe lalu sesuaikan JSON. Lihat komponen di assets/js/components.js.</span></div>');
    m.querySelector('#s-save').onclick = () => {
      try { const obj = JSON.parse(m.querySelector('#s-json').value); obj.type = m.querySelector('#s-type').value; sections[i] = obj; onChange(); closeModal(); draw(); } catch (e) { alert('JSON tidak valid: ' + e.message); }
    };
  };
  draw();
}
// ---------- Views ----------
async function seoView(root) {
  const seo = await jm.working('seo'); const cfg = await jm.working('config');
  root.innerHTML = '<div class="card"><h2>SEO default</h2><div class="field"><label>Title suffix</label><input id="seo-suffix" value="' + esc(seo.titleSuffix || '') + '"></div><div class="field"><label>Default OG image</label><input id="seo-img" value="' + esc(seo.defaultImage || '') + '"></div><div class="field"><label>Twitter handle</label><input id="seo-tw" value="' + esc(seo.twitter || '') + '"></div><div class="row"><button class="btn btn-p btn-sm" id="seo-save">Simpan draft</button><button class="btn btn-g btn-sm" id="seo-sitemap"><i data-lucide="map"></i>Buat sitemap.xml</button><button class="btn btn-o btn-sm" id="seo-robots">Buat robots.txt</button></div><p class="small muted" style="margin-top:.6rem">Sitemap dibuat dari config.siteUrl + semua halaman published. Unduh lalu commit ke root repo (atau publish via GitHub).</p></div>';
  icons();
  root.querySelector('#seo-save').onclick = () => { seo.titleSuffix = root.querySelector('#seo-suffix').value; seo.defaultImage = root.querySelector('#seo-img').value; seo.twitter = root.querySelector('#seo-tw').value; jm.saveDraft('seo', seo); toast('SEO tersimpan.'); };
  root.querySelector('#seo-sitemap').onclick = async () => {
    const pages = await jm.working('pages'); const base = (cfg.siteUrl || '').replace(/\/*$/, '/');
    const urls = pages.filter(p => p.status === 'published' && !['blog-detail', 'event-detail'].includes(p.template)).map(p => '  <url><loc>' + base + (p.slug ? p.slug + '/' : '') + '</loc><lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod></url>').join('\n');
    jm.download('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>', 'application/xml');
  };
  root.querySelector('#seo-robots').onclick = () => jm.download('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ' + (cfg.siteUrl || '') + 'sitemap.xml\n', 'text/plain');
}
async function activitiesView(root) {
  const acts = await jm.working('activities'); const sports = await jm.working('sports');
  root.innerHTML = '<div class="tabs"><button class="on" data-t="a">Kegiatan (' + acts.length + ')</button><button data-t="s">Olahraga (' + sports.length + ')</button></div><div id="act-body"></div>';
  const body = root.querySelector('#act-body');
  const simple = async (file, items, cols) => {
    body.innerHTML = '<div class="card"><div class="row" style="margin-bottom:.6rem"><button class="btn btn-o btn-sm" id="ex">Ekspor JSON</button><button class="btn btn-o btn-sm" id="im">Impor JSON</button><input type="file" id="fi" hidden accept=".json"><span class="small muted">data/' + file + '.json — edit cepat via JSON, atau kelola halaman terkait di Halaman.</span></div><table><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' + items.map(it => '<tr>' + cols.map(c => '<td>' + esc(it[c.toLowerCase()] || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table><div class="field" style="margin-top:.8rem"><label>JSON lengkap</label><textarea id="jj" style="min-height:220px">' + esc(JSON.stringify(items, null, 1)) + '</textarea></div><button class="btn btn-p btn-sm" id="sv">Simpan draft</button></div>';
    icons();
    body.querySelector('#ex').onclick = () => jm.exportFile(file);
    body.querySelector('#im').onclick = () => body.querySelector('#fi').click();
    body.querySelector('#fi').onchange = async (e) => { try { const d = await jm.importFile(file, e.target.files[0]); body.querySelector('#jj').value = JSON.stringify(d, null, 1); toast('Diimpor.'); } catch (err) { alert(err.message); } };
    body.querySelector('#sv').onclick = () => { try { jm.saveDraft(file, JSON.parse(body.querySelector('#jj').value)); toast('Tersimpan.'); } catch (e) { alert(e.message); } };
  };
  root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { root.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('on', x === b)); if (b.dataset.t === 'a') simple('activities', acts, ['Name', 'Category', 'Ages', 'Day']); else simple('sports', sports, ['Name', 'Ages', 'Venue', 'Coach']); });
  simple('activities', acts, ['Name', 'Category', 'Ages', 'Day']);
}
const VIEWS = { dashboard, pages: pageManager, 'page-editor': pageBuilder, homepage: pageBuilder, navigation: navManager, blog: blogManager, 'blog-editor': blogEditor, media: mediaManager, settings: settingsManager, seo: seoView, activities: activitiesView, campuses: (r) => collectionView('campuses', 'campuses'), academics: (r) => collectionView('academics', 'academics'), community: (r) => collectionView('community', 'community'), giving: (r) => collectionView('giving', 'giving'), events: (r) => collectionView('events', 'events'), testimonials: (r) => collectionView('testimonials', 'testimonials'), faqs: (r) => collectionView('faqs', 'faqs'), forms: (r) => collectionView('forms', 'forms') };
const TITLES = { dashboard: 'Dashboard', pages: 'Halaman', 'page-editor': 'Page Builder', homepage: 'Homepage Builder', navigation: 'Navigasi', blog: 'Blog', 'blog-editor': 'Editor Artikel', media: 'Media', settings: 'Pengaturan', seo: 'SEO', activities: 'Kegiatan & Olahraga', campuses: 'Kampus', academics: 'Akademik', community: 'Komunitas', giving: 'Donasi', events: 'Acara', testimonials: 'Testimoni', faqs: 'FAQ', forms: 'Formulir' };
function route(view, keep) { const fn = VIEWS[view]; const root = keep ? document.getElementById('view') : layout(view, TITLES[view] || view); if (fn) Promise.resolve(fn(root, view)).catch(e => { root.innerHTML = '<div class="alert bad">' + esc(e.message) + '</div>'; }); }
async function loginView() {
  const a = document.getElementById('admin');
  const first = !auth.hasPass();
  a.innerHTML = '<div class="login-wrap"><div class="login-card"><h1>Cakrawala CMS</h1><p class="small muted">' + (first ? 'Buat passphrase admin untuk perangkat ini.' : 'Masukkan passphrase admin.') + '</p>' +
   '<div class="alert warn small">Gerbang ini hanya client-side (bukan keamanan server). Otoritas publish sesungguhnya adalah GitHub PAT Anda. Siapa pun dengan akses perangkat ini dapat membuka CMS.</div>' +
   '<div class="field"><label>Passphrase</label><input type="password" id="pass"></div><button class="btn btn-p" id="go" style="width:100%;justify-content:center">' + (first ? 'Buat & masuk' : 'Masuk') + '</button></div></div>';
  document.getElementById('go').onclick = async () => {
    const p = document.getElementById('pass').value; if (p.length < 6) { alert('Minimal 6 karakter.'); return; }
    if (first) { await auth.setup(p); location.href = 'dashboard.html'; }
    else { if (await auth.login(p)) location.href = 'dashboard.html'; else alert('Passphrase salah.'); }
  };
}
function boot() {
  const view = document.body.dataset.view || 'entry';
  if (view === 'entry') { if (auth.isAuthed()) location.href = 'dashboard.html'; else loginView(); return; }
  if (!auth.isAuthed()) { location.href = 'index.html'; return; }
  route(view);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
