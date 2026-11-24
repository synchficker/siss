
import { working, dirtyFiles, activity } from './json-manager.js';
import { isConnected, connInfo } from './github-publisher.js';
import { esc, icons } from './admin.js';
export async function dashboard(root) {
  const [pages, blogs, progs, events] = await Promise.all([working('pages'), working('blogs'), working('academic-programs'), working('events')]);
  const pub = pages.filter(p => p.status === 'published').length;
  const acts = activity().slice(0, 12);
  const stat = (v, l) => '<div class="stat-c"><b>' + v + '</b><span>' + l + '</span></div>';
  root.innerHTML = '<div class="grid g4">' + stat(pages.length, 'Halaman') + stat(blogs.length, 'Artikel') + stat(progs.length, 'Program') + stat(events.length, 'Acara') + '</div>' +
   '<div class="grid g2" style="margin-top:1rem"><div class="card"><h2>Status konten</h2><p class="small"><span class="badge pub">' + pub + ' published</span> <span class="badge draft">' + (pages.length - pub) + ' draft</span> · <span class="badge draft">' + dirtyFiles().length + ' file draft belum dipublish</span></p>' +
   '<p class="small muted">GitHub: ' + (isConnected() ? '<span class="badge pub">terhubung ' + esc(connInfo().owner + '/' + connInfo().repo) + '</span>' : 'belum terhubung') + '</p>' +
   '<div class="row" style="margin-top:.6rem"><a class="btn btn-p btn-sm" href="pages.html">Kelola halaman</a><a class="btn btn-o btn-sm" href="blog.html">Kelola blog</a><a class="btn btn-o btn-sm" href="settings.html">Pengaturan</a></div></div>' +
   '<div class="card"><h2>Aktivitas pengelolaan</h2>' + (acts.length ? '<ul class="small" style="margin:0;padding-left:1.1rem">' + acts.map(a => '<li>' + esc(a.msg) + ' <span class="muted">· ' + new Date(a.at).toLocaleString('id-ID') + '</span></li>').join('') + '</ul>' : '<p class="small muted">Belum ada aktivitas.</p>') + '</div></div>' +
   '<div class="alert info">Alur: edit → draft lokal → preview → <b>Publish</b> (GitHub) atau <b>Ekspor</b> (manual). Perubahan tidak live sampai dipublikasikan.</div>';
  icons();
}
