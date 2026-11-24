
import { fetchJSON } from './data-service.js';
import { LANG_KEY } from './config.js';
let dict = { en: {}, id: {} };
export const getLang = () => localStorage.getItem(LANG_KEY) || 'en';
export function setLang(l) { localStorage.setItem(LANG_KEY, l); location.reload(); }
export async function loadI18n() { try { dict = await fetchJSON('translations'); } catch (e) { console.warn('i18n fallback', e); } }
export const t = (key) => (dict[getLang()] && dict[getLang()][key]) || (dict.en && dict.en[key]) || key;
export const L = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[getLang()] || v.en || '') : (v || '');
export function applyI18n(scope) {
  (scope || document).querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  document.documentElement.lang = getLang();
}
