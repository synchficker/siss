
import { working, saveDraft, exportFile } from './json-manager.js';
import { esc, icons, toast } from './admin.js';
import { url } from '../../../assets/js/config.js';
export async function pageManager(root) {
  let pages = await working('pages');
  const draw = (filter) => {
    const q = (filter || '').toLowerCase();
    const rows = pages.filter(p => !q || (p.slug + ' ' + p.title).toLowerCase().includes(q));
    root.innerHTML = '<div class="card"><div class="row" style="margin-bottom:.8rem"><a class="btn btn-p btn-sm" href="page-editor.html?new=1"><i data-lucide="plus"></i>Halaman baru</a><button class="btn btn-o btn-sm" id="exp"><i data-lucide="download"></i>Ekspor pages.json</button><input id="q" placeholder="Cari slug / judul…" style="padding:.4rem .7rem;border:1.5px solid var(--a-line);border-radius:8px;font-size:.82rem"><div class="sp"></div><span class="small muted">' + pages.length + ' halaman</span></div>' +
     '<table><thead><tr><th>Slug</th><th>Judul</th><th>Template</th><th>Status</th><th></th></tr></thead><tbody>' +
     rows.map(p => { const i = pages.indexOf(p); return '<tr><td class="small">/' + esc(p.slug) + '</td><td>' + esc(p.title) + '</td><td class="small">' + esc(p.template) + '</td><td><span class="badge ' + (p.status === 'published' ? 'pub' : 'draft') + '">' + p.status + '</span></td><td class="row"><a class="btn btn-o btn-sm" href="page-editor.html?slug=' + encodeURIComponent(p.slug) + '">Edit</a><a class="btn btn-o btn-sm" target="_blank" href="' + url(p.slug + '/') + '">Lihat</a><button class="btn btn-o btn-sm" data-dup="' + i + '">Duplikat</button><button class="btn btn-d btn-sm" data-del="' + i + '">Hapus</button></td></tr>'; }).join('') + '</tbody></table></div>';
    icons();
    root.querySelector('#exp').onclick = () => exportFile('pages');
    root.querySelector('#q').oninput = (e) => draw(e.target.value);
    root.querySelector('#q').value = filter || '';
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const p = pages[Number(b.dataset.del)]; if (confirm('Hapus halaman "' + p.slug + '"? File HTML-nya juga perlu dihapus manual dari repo.')) { pages.splice(Number(b.dataset.del), 1); saveDraft('pages', pages); draw(filter); toast('Dihapus dari draft.'); } });
    root.querySelectorAll('[data-dup]').forEach(b => b.onclick = () => { const p = JSON.parse(JSON.stringify(pages[Number(b.dataset.dup)])); p.id = 'page-' + Date.now().toString(36); p.slug = p.slug + '-copy'; p.title = p.title + (typeof p.title === 'object' ? '' : ' (copy)'); p.status = 'draft'; pages.push(p); saveDraft('pages', pages); draw(filter); toast('Diduplikat sebagai draft.'); });
  };
  draw('');
}
