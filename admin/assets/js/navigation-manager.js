
import { working, saveDraft, exportFile } from './json-manager.js';
import { esc, icons, toast, modal } from './admin.js';
export async function navManager(root) {
  const nav = await working('navigation');
  const draw = () => {
    root.innerHTML = '<div class="card"><h2>Menu utama (mega menu)</h2><div id="main-menu"></div><div class="row" style="margin-top:.8rem"><button class="btn btn-p btn-sm" id="add-main"><i data-lucide="plus"></i>Tambah menu</button></div></div>' +
     '<div class="card"><h2>Utility, Footer & Legal (JSON)</h2><p class="small muted">Struktur: utility[], footer[{heading,links[]}], legal[]. Label bilingual {en,id}.</p><div class="field"><textarea id="nav-rest" style="min-height:240px">' + esc(JSON.stringify({ utility: nav.utility, footer: nav.footer, legal: nav.legal }, null, 1)) + '</textarea></div></div>' +
     '<div class="row"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button><button class="btn btn-o" id="exp">Ekspor navigation.json</button></div>';
    const mm = root.querySelector('#main-menu');
    mm.innerHTML = nav.main.map((m, i) => '<div class="sec-row"><span class="t">' + esc(m.label.en) + ' <span class="muted small">→ ' + esc(m.url) + '</span></span><button class="btn btn-o btn-sm" data-up="' + i + '">↑</button><button class="btn btn-o btn-sm" data-down="' + i + '">↓</button><button class="btn btn-o btn-sm" data-ed="' + i + '">Edit</button><button class="btn btn-d btn-sm" data-rm="' + i + '">✕</button></div>').join('');
    icons();
    mm.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = Number(b.dataset.up); if (i > 0) { const t = nav.main[i - 1]; nav.main[i - 1] = nav.main[i]; nav.main[i] = t; draw(); } });
    mm.querySelectorAll('[data-down]').forEach(b => b.onclick = () => { const i = Number(b.dataset.down); if (i < nav.main.length - 1) { const t = nav.main[i + 1]; nav.main[i + 1] = nav.main[i]; nav.main[i] = t; draw(); } });
    mm.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { nav.main.splice(Number(b.dataset.rm), 1); draw(); });
    mm.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => editMain(Number(b.dataset.ed)));
    root.querySelector('#add-main').onclick = () => { nav.main.push({ label: { en: 'New Menu', id: 'Menu Baru' }, url: '', blurb: { en: '', id: '' }, columns: [] }); draw(); };
    root.querySelector('#save').onclick = () => {
      try { const rest = JSON.parse(root.querySelector('#nav-rest').value); nav.utility = rest.utility; nav.footer = rest.footer; nav.legal = rest.legal; saveDraft('navigation', nav); toast('Navigasi tersimpan sebagai draft.'); } catch (e) { alert('JSON tidak valid: ' + e.message); }
    };
    root.querySelector('#exp').onclick = () => exportFile('navigation');
  };
  const editMain = (i) => {
    const m = nav.main[i];
    const mo = modal('<h2>Edit menu</h2><div class="grid g2"><div class="field"><label>Label EN</label><input id="m-en" value="' + esc(m.label.en) + '"></div><div class="field"><label>Label ID</label><input id="m-id" value="' + esc(m.label.id) + '"></div><div class="field"><label>URL</label><input id="m-url" value="' + esc(m.url) + '"></div></div>' +
     '<div class="field"><label>Kolom & link (JSON) — [{heading:{en,id}, links:[{label:{en,id},url,external?}]}]</label><textarea id="m-cols" style="min-height:240px">' + esc(JSON.stringify(m.columns || [], null, 1)) + '</textarea></div>' +
     '<div class="field"><label>Blurb EN / ID</label><div class="row"><input id="m-ben" value="' + esc((m.blurb && m.blurb.en) || '') + '"><input id="m-bid" value="' + esc((m.blurb && m.blurb.id) || '') + '"></div></div>' +
     '<button class="btn btn-p" id="m-save">Simpan</button>');
    mo.querySelector('#m-save').onclick = () => {
      try { m.label = { en: mo.querySelector('#m-en').value, id: mo.querySelector('#m-id').value }; m.url = mo.querySelector('#m-url').value; m.columns = JSON.parse(mo.querySelector('#m-cols').value); m.blurb = { en: mo.querySelector('#m-ben').value, id: mo.querySelector('#m-bid').value }; document.getElementById('modal-root').innerHTML = ''; draw(); } catch (e) { alert('JSON kolom tidak valid: ' + e.message); }
    };
  };
  draw();
}
