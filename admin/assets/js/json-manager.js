
import { fetchJSON, validate } from '../../../assets/js/data-service.js';
const DRAFT = 'cis-drafts', BASE = 'cis-base', LOG = 'cis-activity';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export function drafts() { return read(DRAFT); }
export function dirtyFiles() { return Object.keys(drafts()); }
export function bases() { return read(BASE); }
export async function working(name) { const d = drafts(); return d[name] !== undefined ? d[name] : await fetchJSON(name); }
export async function original(name) { return await fetchJSON(name); }
export function saveDraft(name, data) {
  validate(name, data);
  const d = drafts();
  if (bases()[name] === undefined) { const b = bases(); original(name).then(o => { b[name] = JSON.stringify(o); write(BASE, b); }).catch(() => {}); }
  d[name] = data; write(DRAFT, d); log('Menyimpan draft ' + name + '.json'); document.dispatchEvent(new CustomEvent('cis-dirty'));
}
export function resetDraft(name) { const d = drafts(); delete d[name]; write(DRAFT, d); const b = bases(); delete b[name]; write(BASE, b); log('Reset draft ' + name); document.dispatchEvent(new CustomEvent('cis-dirty')); }
export function clearDraft(name) { const d = drafts(); delete d[name]; write(DRAFT, d); document.dispatchEvent(new CustomEvent('cis-dirty')); }
export function log(msg) { const l = read(LOG); const arr = Array.isArray(l.items) ? l.items : []; arr.unshift({ at: new Date().toISOString(), msg }); write(LOG, { items: arr.slice(0, 60) }); }
export function activity() { const l = read(LOG); return Array.isArray(l.items) ? l.items : []; }
export function download(filename, content, mime) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime || 'application/json' })); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
export async function exportFile(name) { const data = await working(name); download(name + '.json', JSON.stringify(data, null, 1)); log('Ekspor ' + name + '.json'); }
export async function exportAll() {
  const names = dirtyFiles(); if (!names.length) { alert('Tidak ada draft untuk diekspor.'); return; }
  for (const n of names) await exportFile(n);
  const bundle = {}; for (const n of names) bundle[n] = await working(n);
  download('cakrawala-bundle.json', JSON.stringify(bundle, null, 1));
}
export async function importFile(name, file) {
  const text = await file.text(); let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('JSON tidak valid: ' + e.message); }
  validate(name, data); saveDraft(name, data); return data;
}
export async function importBundle(file) {
  const bundle = JSON.parse(await file.text()); let n = 0;
  for (const k of Object.keys(bundle)) { validate(k, bundle[k]); saveDraft(k, bundle[k]); n++; }
  return n;
}
