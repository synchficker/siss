
import { working, saveDraft, download } from './json-manager.js';
import { esc, icons, toast, modal } from './admin.js';
import { isConnected, publishMedia } from './github-publisher.js';
export async function mediaManager(root) {
  let media = await working('media');
  const draw = () => {
    const folders = Array.from(new Set(media.items.map(i => i.folder)));
    root.innerHTML = '<div class="card"><div class="row" style="margin-bottom:.8rem"><select id="folder"><option value="">Semua folder</option>' + folders.map(f => '<option>' + esc(f) + '</option>').join('') + '</select><button class="btn btn-o btn-sm" id="exp">Ekspor media.json</button><div class="sp"></div><span class="small muted">' + media.items.length + ' aset</span></div>' +
     '<div class="drop" id="drop"><i data-lucide="upload-cloud"></i><p>Letakkan gambar/video/dokumen di sini atau klik untuk unggah.<br><span class="small">File disimpan sebagai dataURL di draft lokal; publish ke repo via GitHub atau unduh manual.</span></p><input type="file" id="file" hidden multiple accept="image/*,video/*,.pdf"></div>' +
     '<div class="media-grid" id="grid" style="margin-top:1rem"></div></div>';
    icons();
    const grid = root.querySelector('#grid');
    const filt = root.querySelector('#folder').value;
    const items = media.items.filter(i => !filt || i.folder === filt);
    grid.innerHTML = items.map(i => { const idx = media.items.indexOf(i); return '<div class="media-it">' + (i.dataUrl && i.type.startsWith('image') ? '<img src="' + i.dataUrl + '" alt="' + esc(i.alt) + '">' : i.src ? '<img src="../' + esc(i.src) + '" alt="' + esc(i.alt) + '">' : '<div style="aspect-ratio:4/3;display:grid;place-items:center;background:#eee">📄</div>') + '<div class="m"><b>' + esc(i.name) + '</b><div class="muted">' + esc(i.folder) + ' · ' + esc(i.type) + '</div><div class="row" style="margin-top:.3rem"><button class="btn btn-o btn-sm" data-ed="' + idx + '">Edit</button>' + (i.dataUrl ? '<button class="btn btn-o btn-sm" data-dl="' + idx + '">Unduh</button>' : '') + (i.dataUrl && isConnected() ? '<button class="btn btn-g btn-sm" data-pub="' + idx + '">Publish</button>' : '') + '<button class="btn btn-d btn-sm" data-rm="' + idx + '">✕</button></div></div></div>'; }).join('');
    icons();
    root.querySelector('#folder').onchange = draw;
    root.querySelector('#exp').onclick = () => download('media.json', JSON.stringify(media, null, 1));
    const drop = root.querySelector('#drop'), file = root.querySelector('#file');
    drop.onclick = () => file.click();
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); handle(e.dataTransfer.files); };
    file.onchange = () => handle(file.files);
    const handle = (files) => {
      Array.from(files).forEach(f => {
        if (f.size > 1500000) { alert(f.name + ' > 1.5MB — kompres dulu agar muat di JSON/localStorage.'); return; }
        const rd = new FileReader();
        rd.onload = () => { media.items.push({ id: 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: f.name, folder: 'uploads', alt: f.name, type: f.type, size: f.size, dataUrl: rd.result }); saveDraft('media', media); draw(); toast(f.name + ' ditambahkan ke draft.'); };
        rd.readAsDataURL(f);
      });
    };
    grid.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { media.items.splice(Number(b.dataset.rm), 1); saveDraft('media', media); draw(); });
    grid.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { const i = media.items[Number(b.dataset.dl)]; const a = document.createElement('a'); a.href = i.dataUrl; a.download = i.name; a.click(); });
    grid.querySelectorAll('[data-pub]').forEach(b => b.onclick = async () => { try { await publishMedia(media.items[Number(b.dataset.pub)]); toast('Media dipublish ke repo.'); } catch (e) { alert(e.message); } });
    grid.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => {
      const i = media.items[Number(b.dataset.ed)];
      const m = modal('<h2>Edit aset</h2><div class="field"><label>Nama file</label><input id="m-name" value="' + esc(i.name) + '"></div><div class="field"><label>Folder</label><input id="m-folder" value="' + esc(i.folder) + '"></div><div class="field"><label>Alt text</label><input id="m-alt" value="' + esc(i.alt) + '"></div><div class="field"><label>Ganti file</label><input type="file" id="m-replace" accept="image/*"></div><button class="btn btn-p" id="m-save">Simpan</button>');
      m.querySelector('#m-save').onclick = () => { i.name = m.querySelector('#m-name').value; i.folder = m.querySelector('#m-folder').value; i.alt = m.querySelector('#m-alt').value; const rf = m.querySelector('#m-replace').files[0]; if (rf) { const rd = new FileReader(); rd.onload = () => { i.dataUrl = rd.result; i.type = rf.type; i.size = rf.size; saveDraft('media', media); document.getElementById('modal-root').innerHTML = ''; draw(); }; rd.readAsDataURL(rf); } else { saveDraft('media', media); document.getElementById('modal-root').innerHTML = ''; draw(); } };
    });
  };
  draw();
}
