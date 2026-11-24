
import { working, saveDraft, exportFile } from './json-manager.js';
import { esc, icons, toast } from './admin.js';
export async function settingsManager(root) {
  const cfg = await working('config');
  const c = cfg.colors || {};
  root.innerHTML = '<div class="card"><h2>Identitas & Brand</h2><div class="grid g2">' +
   '<div class="field"><label>Nama situs</label><input id="c-name" value="' + esc(cfg.siteName) + '"></div><div class="field"><label>Nama pendek</label><input id="c-short" value="' + esc(cfg.shortName) + '"></div>' +
   '<div class="field"><label>Site URL (untuk canonical/sitemap)</label><input id="c-url" value="' + esc(cfg.siteUrl) + '"></div><div class="field"><label>Bahasa default</label><select id="c-lang"><option ' + (cfg.defaultLanguage === 'en' ? 'selected' : '') + '>en</option><option ' + (cfg.defaultLanguage === 'id' ? 'selected' : '') + '>id</option></select></div>' +
   '<div class="field"><label>Warna primary</label><input type="color" id="c-pri" value="' + esc(c.primary || '#0E3B33') + '"></div><div class="field"><label>Warna accent</label><input type="color" id="c-acc" value="' + esc(c.accent || '#C89B3C') + '"></div>' +
   '<div class="field"><label>Font display</label><input id="c-fd" value="' + esc((cfg.fonts && cfg.fonts.display) || '') + '"></div><div class="field"><label>Font body</label><input id="c-fb" value="' + esc((cfg.fonts && cfg.fonts.body) || '') + '"></div></div>' +
   '<div class="field"><label>Tagline EN</label><input id="c-ten" value="' + esc(cfg.tagline.en || '') + '"></div><div class="field"><label>Tagline ID</label><input id="c-tid" value="' + esc(cfg.tagline.id || '') + '"></div></div>' +
   '<div class="card"><h2>Kontak & Sosial</h2><div class="grid g2"><div class="field"><label>Alamat</label><input id="c-addr" value="' + esc(cfg.contact.address) + '"></div><div class="field"><label>Telepon</label><input id="c-phone" value="' + esc(cfg.contact.phone) + '"></div><div class="field"><label>Email</label><input id="c-email" value="' + esc(cfg.contact.email) + '"></div><div class="field"><label>Map URL</label><input id="c-map" value="' + esc(cfg.contact.mapUrl) + '"></div></div>' +
   '<div class="field"><label>Socials (JSON [{name,icon,url}])</label><textarea id="c-soc" style="min-height:110px">' + esc(JSON.stringify(cfg.socials, null, 1)) + '</textarea></div></div>' +
   '<div class="card"><h2>CTA & GitHub Publisher</h2><div class="grid g3"><div class="field"><label>CTA Inquire</label><input id="c-inq" value="' + esc(cfg.ctas.inquire) + '"></div><div class="field"><label>CTA Apply</label><input id="c-app" value="' + esc(cfg.ctas.apply) + '"></div><div class="field"><label>CTA Visit</label><input id="c-vis" value="' + esc(cfg.ctas.visit) + '"></div>' +
   '<div class="field"><label>GitHub owner</label><input id="c-own" value="' + esc(cfg.publisher.owner) + '"></div><div class="field"><label>GitHub repo</label><input id="c-repo" value="' + esc(cfg.publisher.repo) + '"></div><div class="field"><label>Branch</label><input id="c-br" value="' + esc(cfg.publisher.branch) + '"></div></div>' +
   '<p class="small muted">Token TIDAK disimpan di sini — hanya di memori sesi lewat tombol Connect GitHub.</p></div>' +
   '<div class="row"><button class="btn btn-p" id="save"><i data-lucide="save"></i>Simpan draft</button><button class="btn btn-o" id="exp">Ekspor config.json</button></div>';
  icons();
  root.querySelector('#save').onclick = () => {
    try {
      cfg.siteName = root.querySelector('#c-name').value; cfg.shortName = root.querySelector('#c-short').value; cfg.siteUrl = root.querySelector('#c-url').value; cfg.defaultLanguage = root.querySelector('#c-lang').value;
      cfg.colors = Object.assign({}, cfg.colors, { primary: root.querySelector('#c-pri').value, accent: root.querySelector('#c-acc').value });
      cfg.fonts = { display: root.querySelector('#c-fd').value, body: root.querySelector('#c-fb').value };
      cfg.tagline = { en: root.querySelector('#c-ten').value, id: root.querySelector('#c-tid').value };
      cfg.contact = { address: root.querySelector('#c-addr').value, phone: root.querySelector('#c-phone').value, email: root.querySelector('#c-email').value, mapUrl: root.querySelector('#c-map').value };
      cfg.socials = JSON.parse(root.querySelector('#c-soc').value);
      cfg.ctas = { inquire: root.querySelector('#c-inq').value, apply: root.querySelector('#c-app').value, visit: root.querySelector('#c-vis').value };
      cfg.publisher = { owner: root.querySelector('#c-own').value, repo: root.querySelector('#c-repo').value, branch: root.querySelector('#c-br').value };
      saveDraft('config', cfg); toast('Pengaturan tersimpan sebagai draft.');
    } catch (e) { alert('Data tidak valid: ' + e.message); }
  };
  root.querySelector('#exp').onclick = () => exportFile('config');
}
