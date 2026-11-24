
import { working, original, bases, dirtyFiles, clearDraft, log } from './json-manager.js';
// TOKEN HANYA DI MEMORI SESI — tidak pernah ke localStorage/sessionStorage/JSON/source.
let token = null, owner = '', repo = '', branch = 'main', connected = false, remote = {};
const enc = (s) => btoa(unescape(encodeURIComponent(s)));
const dec = (b) => decodeURIComponent(escape(atob(String(b).replace(/\n/g, ''))));
const api = (path, opts) => fetch('https://api.github.com' + path, Object.assign({ headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }, opts || {}));
export const isConnected = () => connected;
export const connInfo = () => ({ owner, repo, branch });
export function connect(cfg) { token = cfg.token; owner = cfg.owner; repo = cfg.repo; branch = cfg.branch || 'main'; }
export function disconnect() { token = null; connected = false; remote = {}; log('GitHub disconnect'); }
export async function test() {
  if (!token) throw new Error('Token belum dimasukkan.');
  const r = await api('/repos/' + owner + '/' + repo);
  if (!r.ok) throw new Error('Repo tidak dapat diakses (HTTP ' + r.status + '). Periksa token, owner, repo, dan izin Contents.');
  connected = true; log('GitHub terhubung: ' + owner + '/' + repo); return await r.json();
}
export async function listRepos() { const r = await api('/user/repos?per_page=100'); if (!r.ok) return []; return await r.json(); }
async function getRemote(path) {
  const r = await api('/repos/' + owner + '/' + repo + '/contents/' + path + '?ref=' + branch);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('Gagal membaca ' + path + ' (HTTP ' + r.status + ')');
  return await r.json();
}
export async function loadLatest() {
  const out = [];
  for (const name of dirtyFiles()) {
    const path = 'data/' + name + '.json'; const rem = await getRemote(path); remote[name] = rem;
    const base = bases()[name]; const conflict = rem && base !== undefined && dec(rem.content) !== base;
    out.push({ name, conflict, exists: !!rem });
  }
  return out;
}
export async function preview() {
  const rows = [];
  for (const name of dirtyFiles()) {
    const draft = await working(name); const orig = await original(name).catch(() => null);
    const a = JSON.stringify(orig, null, 1).split('\n'), b = JSON.stringify(draft, null, 1).split('\n');
    let changed = 0; const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) if (a[i] !== b[i]) changed++;
    rows.push({ name, changed, lines: b.length });
  }
  return rows;
}
export async function publish(opts) {
  if (!connected) throw new Error('Belum terhubung ke GitHub.');
  const force = opts && opts.force; const results = [];
  for (const name of dirtyFiles()) {
    const path = 'data/' + name + '.json'; const rem = await getRemote(path); const base = bases()[name];
    if (rem && base !== undefined && dec(rem.content) !== base && !force) { results.push({ name, status: 'conflict' }); continue; }
    const data = await working(name);
    const body = { message: 'CMS: update ' + path, content: enc(JSON.stringify(data, null, 1)), branch };
    if (rem) body.sha = rem.sha;
    const r = await api('/repos/' + owner + '/' + repo + '/contents/' + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 409 || r.status === 422) { results.push({ name, status: 'conflict' }); continue; }
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error('Gagal publish ' + name + ': ' + (e.message || r.status)); }
    clearDraft(name); log('Publish ' + path); results.push({ name, status: 'ok' });
  }
  return results;
}
export async function publishMedia(item) {
  if (!connected) throw new Error('Belum terhubung ke GitHub.');
  const path = 'assets/images/' + item.folder + '/' + item.name;
  const b64 = String(item.dataUrl).split(',')[1];
  const rem = await getRemote(path);
  const body = { message: 'CMS: media ' + path, content: b64, branch }; if (rem) body.sha = rem.sha;
  const r = await api('/repos/' + owner + '/' + repo + '/contents/' + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('Gagal unggah media (HTTP ' + r.status + ')');
  log('Publish media ' + path); return true;
}
