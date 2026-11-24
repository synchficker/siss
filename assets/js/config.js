
// Base path otomatis: berfungsi di root domain, subfolder GitHub Pages, maupun lokal.
const HERE = new URL('.', import.meta.url);
export const BASE = new URL('../../', HERE).pathname;
export const url = (p = '') => BASE + String(p).replace(/^\/+/, '');
export const qs = (k) => new URLSearchParams(location.search).get(k);
export const LANG_KEY = 'cis-lang';
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
