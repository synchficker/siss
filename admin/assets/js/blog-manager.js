
import { working, saveDraft, exportFile } from './json-manager.js';
import { esc, icons, toast } from './admin.js';
import { url } from '../../../assets/js/config.js';
export async function blogManager(root) {
  let blogs = await working('blogs');
  const draw = () => {
    root.innerHTML = '<div class="card"><div class="row" style="margin-bottom:.8rem"><a class="btn btn-p btn-sm" href="blog-editor.html?new=1"><i data-lucide="plus"></i>Artikel baru</a><button class="btn btn-o btn-sm" id="exp">Ekspor blogs.json</button><div class="sp"></div><span class="small muted">' + blogs.length + ' artikel</span></div>' +
     '<table><thead><tr><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>' +
     blogs.map((b, i) => '<tr><td>' + esc(b.title.en || b.title) + '</td><td>' + esc(b.category) + '</td><td class="small">' + esc(b.date) + '</td><td><span class="badge ' + (b.status === 'published' ? 'pub' : 'draft') + '">' + b.status + '</span></td><td class="row"><a class="btn btn-o btn-sm" href="blog-editor.html?slug=' + encodeURIComponent(b.slug) + '">Edit</a><a class="btn btn-o btn-sm" target="_blank" href="' + url('news/blog/detail.html?slug=' + b.slug) + '">Lihat</a><button class="btn btn-d btn-sm" data-del="' + i + '">Hapus</button></td></tr>').join('') + '</tbody></table></div>';
    icons();
    root.querySelector('#exp').onclick = () => exportFile('blogs');
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('Hapus artikel?')) { blogs.splice(Number(b.dataset.del), 1); saveDraft('blogs', blogs); draw(); } });
  };
  draw();
}
export async function blogEditor(root) {
  const blogs = await working('blogs');
  const cats = await working('categories');
  const params = new URLSearchParams(location.search);
  const isNew = params.get('new') === '1';
  let post = isNew ? { id: 'post-' + Date.now().toString(36), slug: 'new-post', title: { en: 'New Post', id: '' }, excerpt: { en: '', id: '' }, category: 'Learning', tags: [], author: '', authorRole: { en: '', id: '' }, authorImage: 'assets/images/blog/author-1.svg', date: new Date().toISOString().slice(0, 10), status: 'draft', image: 'assets/images/blog/blog-1.svg', related: [], body: '<p>Write here…</p>' } : blogs.find(b => b.slug === params.get('slug'));
  if (!post) { root.innerHTML = '<div class="alert bad">Artikel tidak ditemukan.</div>'; return; }
  root.innerHTML = '<div class="card"><h2>' + (isNew ? 'Artikel baru' : 'Edit artikel') + '</h2>' +
   '<div class="grid g2"><div class="field"><label>Judul EN</label><input id="b-ten" value="' + esc(post.title.en || '') + '"></div><div class="field"><label>Judul ID</label><input id="b-tid" value="' + esc(post.title.id || '') + '"></div>' +
   '<div class="field"><label>Slug</label><input id="b-slug" value="' + esc(post.slug) + '"></div><div class="field"><label>Kategori</label><select id="b-cat">' + cats.map(c => '<option ' + (c.name === post.category ? 'selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></div>' +
   '<div class="field"><label>Author</label><input id="b-auth" value="' + esc(post.author) + '"></div><div class="field"><label>Tanggal</label><input type="date" id="b-date" value="' + esc(post.date) + '"></div>' +
   '<div class="field"><label>Tags (koma)</label><input id="b-tags" value="' + esc((post.tags || []).join(', ')) + '"></div><div class="field"><label>Status</label><select id="b-status"><option ' + (post.status === 'published' ? 'selected' : '') + '>published</option><option ' + (post.status === 'draft' ? 'selected' : '') + '>draft</option></select></div>' +
   '<div class="field"><label>Featured image</label><input id="b-img" value="' + esc(post.image) + '"></div><div class="field"><label>Related slugs (koma)</label><input id="b-rel" value="' + esc((post.related || []).join(', ')) + '"></div></div>' +
   '<div class="field"><label>Excerpt EN</label><textarea id="b-een">' + esc(post.excerpt.en || '') + '</textarea></div><div class="field"><label>Excerpt ID</label><textarea id="b-eid">' + esc(post.excerpt.id || '') + '</textarea></div>' +
   '<div class="field"><label>Isi (rich text)</label><div class="rte-bar"><button data-cmd="bold"><b>B</b></button><button data-cmd="italic"><i>I</i></button><button data-cmd="formatBlock" data-val="h2">H2</button><button data-cmd="formatBlock" data-val="h3">H3</button><button data-cmd="formatBlock" data-val="p">P</button><button data-cmd="insertUnorderedList">• List</button><button data-cmd="insertOrderedList">1. List</button><button data-cmd="formatBlock" data-val="blockquote">Quote</button><button data-cmd="createLink">Link</button></div><div class="rte" id="b-body" contenteditable="true">' + post.body + '</div></div>' +
   '<div class="row"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button><button class="btn btn-g" id="prev"><i data-lucide="eye"></i>Preview</button><a class="btn btn-o" href="blog.html">Kembali</a></div></div>';
  icons();
  root.querySelectorAll('[data-cmd]').forEach(b => b.onclick = (e) => { e.preventDefault(); const cmd = b.dataset.cmd; let val = b.dataset.val || null; if (cmd === 'createLink') val = prompt('URL:', 'https://'); if (cmd === 'formatBlock') val = '<' + val + '>'; document.execCommand(cmd, false, val); root.querySelector('#b-body').focus(); });
  const gather = () => {
    post.title = { en: root.querySelector('#b-ten').value, id: root.querySelector('#b-tid').value };
    post.slug = root.querySelector('#b-slug').value.trim(); post.category = root.querySelector('#b-cat').value;
    post.author = root.querySelector('#b-auth').value; post.date = root.querySelector('#b-date').value;
    post.tags = root.querySelector('#b-tags').value.split(',').map(s => s.trim()).filter(Boolean);
    post.status = root.querySelector('#b-status').value; post.image = root.querySelector('#b-img').value;
    post.related = root.querySelector('#b-rel').value.split(',').map(s => s.trim()).filter(Boolean);
    post.excerpt = { en: root.querySelector('#b-een').value, id: root.querySelector('#b-eid').value };
    post.body = root.querySelector('#b-body').innerHTML;
    return post;
  };
  root.querySelector('#save').onclick = () => { gather(); if (isNew && !blogs.includes(post)) blogs.push(post); saveDraft('blogs', blogs); toast('Artikel tersimpan sebagai draft.'); };
  root.querySelector('#prev').onclick = () => { gather(); sessionStorage.setItem('cis-preview', JSON.stringify({ blogs })); window.open(url('news/blog/detail.html?slug=' + post.slug) + '&preview=1', '_blank'); };
}
