
import { url, qs } from './config.js';
import { fetchJSON, getBlogs, getBlogBySlug } from './data-service.js';
import { L, t } from './i18n.js';
import { esc, icon, postCard, sanitize, fmtDate, refreshIcons, reveal } from './components.js';
let state = { cat: '', q: '', n: 6 };
export async function initBlogList(root) {
  const cats = await fetchJSON('categories');
  root.innerHTML = '<section class="section"><div class="wrap">' +
    '<div class="flex flex-wrap gap-2 items-center mb-6" id="blog-cats">' +
    '<button class="chip on" data-cat="">' + t('all') + '</button>' +
    cats.map(c => '<button class="chip" data-cat="' + esc(c.name) + '">' + esc(L(c.name)) + '</button>').join('') +
    '<input type="search" id="blog-q" class="ml-auto" style="padding:.5rem .9rem;border:1.5px solid var(--c-line);border-radius:999px;font:inherit;font-size:.85rem" placeholder="' + t('searchPosts') + '" aria-label="' + t('searchPosts') + '"></div>' +
    '<div id="blog-grid" class="grid gap-6 md:grid-cols-3"></div>' +
    '<div class="text-center mt-10"><button class="btn btn-outline" id="blog-more">' + t('loadMore') + '</button></div></div></section>';
  const draw = async () => {
    let blogs = await getBlogs();
    if (state.cat) blogs = blogs.filter(b => b.category === state.cat);
    if (state.q) blogs = blogs.filter(b => (L(b.title) + ' ' + L(b.excerpt)).toLowerCase().includes(state.q));
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = blogs.length ? blogs.slice(0, state.n).map(postCard).join('') : '<div class="empty-state" style="grid-column:1/-1">' + t('noResults') + '</div>';
    document.getElementById('blog-more').style.display = blogs.length > state.n ? '' : 'none';
    refreshIcons(); reveal(grid);
  };
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]');
    if (c) { state.cat = c.dataset.cat; state.n = 6; root.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('on', x === c)); draw(); }
    if (e.target.closest('#blog-more')) { state.n += 6; draw(); }
  });
  root.addEventListener('input', (e) => { if (e.target.id === 'blog-q') { state.q = e.target.value.trim().toLowerCase(); state.n = 6; draw(); } });
  await draw();
}
export async function renderBlogDetail(main, cfg) {
  const slug = qs('slug');
  const b = slug ? await getBlogBySlug(slug) : null;
  if (!b) { main.innerHTML = '<div class="wrap section"><div class="empty-state"><h2>' + t('postNotFound') + '</h2><p><a class="btn btn-primary mt-4" href="' + url('news/blog/') + '">' + t('backToBlog') + '</a></p></div></div>'; return null; }
  const all = await getBlogs();
  const rel = all.filter(x => x.slug !== b.slug && (b.related || []).includes(x.slug)).concat(all.filter(x => x.slug !== b.slug && x.category === b.category && !(b.related || []).includes(x.slug))).slice(0, 3);
  const tags = (b.tags || []).map(tg => '<span class="chip">' + esc(tg) + '</span>').join('');
  main.innerHTML = '<nav class="wrap crumbs" aria-label="Breadcrumb"><a href="' + url('') + '">' + t('home') + '</a><span class="sep">/</span><a href="' + url('news/blog/') + '">Blog</a><span class="sep">/</span><span aria-current="page">' + esc(L(b.title)) + '</span></nav>' +
    '<article><header class="section" style="padding-bottom:2rem"><div class="wrap" style="max-width:860px">' +
    '<div class="post-meta mb-4"><span class="chip">' + esc(b.category) + '</span><span>' + fmtDate(b.date) + '</span><span>· ' + esc(b.author) + '</span></div>' +
    '<h1 style="font-size:clamp(1.9rem,4vw,3rem)">' + esc(L(b.title)) + '</h1><p class="lede mt-4">' + esc(L(b.excerpt)) + '</p></div></header>' +
    '<div class="wrap" style="max-width:860px"><img src="' + url(b.image) + '" alt="' + esc(L(b.title)) + '" style="border-radius:var(--radius);aspect-ratio:16/9;object-fit:cover;width:100%"></div>' +
    '<div class="wrap section" style="max-width:860px"><div class="prose">' + sanitize(b.body) + '</div>' +
    '<div class="flex gap-2 flex-wrap mt-8">' + tags + '</div>' +
    '<div class="flex gap-3 items-center mt-8 p-4" style="background:#fff;border:1px solid var(--c-line);border-radius:var(--radius)">' +
    '<img src="' + url(b.authorImage) + '" alt="" style="width:52px;height:52px;border-radius:50%">' +
    '<div><b>' + esc(b.author) + '</b><div class="text-sm" style="color:var(--c-muted)">' + esc(L(b.authorRole)) + '</div></div>' +
    '<button class="btn btn-outline btn-sm ml-auto" data-copy="' + esc(location.href) + '">' + icon('link') + t('copyLink') + '</button></div></div></article>' +
    (rel.length ? '<section class="section alt"><div class="wrap"><h2 class="mb-8">' + t('relatedPosts') + '</h2><div class="grid gap-6 md:grid-cols-3">' + rel.map(postCard).join('') + '</div></div></section>' : '');
  return { slug: 'news/blog', title: L(b.title), hero: { description: L(b.excerpt), image: b.image }, seo: { title: L(b.title), description: L(b.excerpt) } };
}
