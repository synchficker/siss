
import { url } from './config.js';
const cache = new Map(), overrides = new Map();
export function setOverride(name, data) { overrides.set(name, data); cache.delete(name); }
export function clearCache() { cache.clear(); }
const ARRAY_FILES = ['pages','blogs','events','campuses','academic-programs','activities','sports','community','giving','testimonials','faqs','tuition-fees','school-calendar','leadership','university-acceptances','categories','tags','forms'];
export function validate(name, j) {
  if (j === null || typeof j !== 'object') throw new Error('Data "' + name + '" bukan objek/array JSON yang valid.');
  if (ARRAY_FILES.includes(name) && !Array.isArray(j)) throw new Error('Data "' + name + '" harus berupa array.');
  if (name === 'pages') {
    const ids = new Set();
    for (const p of j) {
      if (!p.id || p.slug === undefined || !p.title) throw new Error('Halaman tanpa id/slug/title ditemukan.');
      if (ids.has(p.id)) throw new Error('ID halaman duplikat: ' + p.id);
      ids.add(p.id);
    }
  }
  return true;
}
export async function fetchJSON(name) {
  if (overrides.has(name)) return overrides.get(name);
  if (cache.has(name)) return cache.get(name);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url('data/' + name + '.json'), { signal: ctl.signal });
    if (!r.ok) throw new Error('Gagal memuat ' + name + '.json (HTTP ' + r.status + ')');
    let j = await r.json();
    if (j && j.$ref) return fetchJSON(j.$ref.replace(/^data\//, '').replace(/\.json$/, ''));
    validate(name, j);
    cache.set(name, j);
    return j;
  } finally { clearTimeout(t); }
}
export const getSettings = () => fetchJSON('config');
export const getNavigation = () => fetchJSON('navigation');
export const getPages = () => fetchJSON('pages');
export const getPageBySlug = async (slug) => (await getPages()).find(p => p.slug === slug && p.status === 'published') || null;
export const getBlogs = async () => (await fetchJSON('blogs')).filter(b => b.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
export const getBlogBySlug = async (slug) => (await fetchJSON('blogs')).find(b => b.slug === slug) || null;
export const getEvents = () => fetchJSON('events');
export const getPrograms = () => fetchJSON('academic-programs');
export const getCampus = async (slug) => (await fetchJSON('campuses')).find(c => c.slug === slug) || null;
export const getHomepage = () => fetchJSON('homepage');
