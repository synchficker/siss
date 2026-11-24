
// Gerbang client-side SAJA (bukan keamanan server). Otoritas publish sesungguhnya adalah GitHub PAT.
const KEY = 'cis-admin-pass', SES = 'cis-admin-session';
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); }
export const isAuthed = () => sessionStorage.getItem(SES) === '1';
export const hasPass = () => !!localStorage.getItem(KEY);
export async function setup(pass) { localStorage.setItem(KEY, await sha(pass)); sessionStorage.setItem(SES, '1'); }
export async function login(pass) { if (await sha(pass) === localStorage.getItem(KEY)) { sessionStorage.setItem(SES, '1'); return true; } return false; }
export function logout() { sessionStorage.removeItem(SES); }
