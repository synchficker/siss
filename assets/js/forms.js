
import { fetchJSON } from './data-service.js';
import { L, t } from './i18n.js';
import { esc, icon, toast, refreshIcons } from './components.js';
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^[+]?[0-9\s()-]{7,18}$/;
export async function renderForm(id, opts) {
  const forms = await fetchJSON('forms');
  const f = forms.find(x => x.id === id);
  if (!f) return '<div class="empty-state">' + t('formMissing') + '</div>';
  const fields = f.fields.map(fd => {
    const req = fd.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
    const common = ' id="f-' + f.id + '-' + fd.name + '" name="' + fd.name + '"' + (fd.required ? ' required aria-required="true"' : '');
    let input;
    if (fd.type === 'select') input = '<select' + common + '><option value="">' + t('choose') + '</option>' + (fd.options || []).map(o => '<option>' + esc(L(o)) + '</option>').join('') + '</select>';
    else if (fd.type === 'textarea') input = '<textarea rows="4"' + common + ' placeholder="' + esc(L(fd.placeholder) || '') + '"></textarea>';
    else if (fd.type === 'checkbox') return '<div class="field consent"><input type="checkbox" id="f-' + f.id + '-' + fd.name + '" name="' + fd.name + '"' + (fd.required ? ' required' : '') + '><label for="f-' + f.id + '-' + fd.name + '" style="font-weight:400">' + esc(L(fd.label)) + req + '</label><div class="err">' + t('requiredMsg') + '</div></div>';
    else input = '<input type="' + (fd.type || 'text') + '"' + common + ' placeholder="' + esc(L(fd.placeholder) || '') + '">';
    return '<div class="field"><label for="f-' + f.id + '-' + fd.name + '">' + esc(L(fd.label)) + req + '</label>' + input + '<div class="err"></div></div>';
  }).join('');
  const modeNote = f.mode === 'mailto' ? t('formNoteMailto') : f.mode === 'endpoint' ? t('formNoteEndpoint') : t('formNoteManual');
  return '<form data-form="' + f.id + '" novalidate>' +
    (opts && opts.compact ? '' : '<h3 class="mb-4">' + esc(L(f.title)) + '</h3>') +
    '<div class="hp-field" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
    '<input type="hidden" name="_ts" value="' + Date.now() + '">' + fields +
    '<button class="btn btn-primary" type="submit">' + icon('send') + esc(L(f.submitLabel) || t('submit')) + '</button>' +
    '<div class="form-msg" role="status"></div>' +
    '<div class="form-actions flex gap-2 flex-wrap mt-3" hidden>' +
    '<button type="button" class="btn btn-outline btn-sm" data-dl="json">' + icon('download') + 'JSON</button>' +
    '<button type="button" class="btn btn-outline btn-sm" data-dl="csv">' + icon('download') + 'CSV</button>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-copy-form>' + icon('copy') + t('copyData') + '</button></div>' +
    '<p class="form-note">' + modeNote + ' ' + t('privacyNote') + '</p></form>';
}
function setErr(form, name, msg) {
  const el = form.querySelector('[name="' + name + '"]'); if (!el) return;
  const field = el.closest('.field'); field.classList.toggle('invalid', !!msg);
  const err = field.querySelector('.err'); if (err && msg) err.textContent = msg;
}
function validate(form, f) {
  let ok = true; const data = {};
  for (const fd of f.fields) {
    const el = form.querySelector('[name="' + fd.name + '"]'); if (!el) continue;
    const v = fd.type === 'checkbox' ? el.checked : el.value.trim();
    data[fd.name] = v; let msg = '';
    if (fd.required && (fd.type === 'checkbox' ? !v : !v)) msg = t('requiredMsg');
    else if (v && fd.type === 'email' && !emailRe.test(v)) msg = t('emailMsg');
    else if (v && fd.type === 'tel' && !phoneRe.test(v)) msg = t('phoneMsg');
    setErr(form, fd.name, msg); if (msg) ok = false;
  }
  return { ok, data };
}
export function initForms() {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-form]'); if (!form) return;
    e.preventDefault();
    const forms = await fetchJSON('forms');
    const f = forms.find(x => x.id === form.dataset.form); if (!f) return;
    const msg = form.querySelector('.form-msg'); const actions = form.querySelector('.form-actions');
    msg.className = 'form-msg';
    if (form.querySelector('[name="website"]').value || Date.now() - Number(form.querySelector('[name="_ts"]').value) < 3000) {
      msg.className = 'form-msg bad'; msg.textContent = t('spamMsg'); return;
    }
    const { ok, data } = validate(form, f);
    if (!ok) { msg.className = 'form-msg bad'; msg.textContent = t('fixErrors'); return; }
    data._form = f.id; data._at = new Date().toISOString();
    form._submission = data;
    const submitBtn = form.querySelector('[type="submit"]');
    if (f.mode === 'mailto') {
      const body = Object.entries(data).map(([k, v]) => k + ': ' + v).join('\n');
      location.href = 'mailto:' + f.email + '?subject=' + encodeURIComponent(L(f.title) + ' — ' + (data.name || data.email || '')) + '&body=' + encodeURIComponent(body);
      msg.className = 'form-msg warn'; msg.textContent = t('mailtoOpened');
    } else if (f.mode === 'endpoint' && f.endpoint) {
      submitBtn.disabled = true;
      try {
        const r = await fetch(f.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        msg.className = 'form-msg ok'; msg.textContent = L(f.successMessage) || t('sentOk'); form.reset();
      } catch (err) { msg.className = 'form-msg bad'; msg.textContent = t('sendFail') + ' (' + err.message + ')'; }
      submitBtn.disabled = false;
    } else {
      msg.className = 'form-msg warn'; msg.textContent = t('manualSaved');
      if (actions) actions.hidden = false;
    }
    refreshIcons();
  });
  document.addEventListener('click', (e) => {
    const dl = e.target.closest('[data-dl]'); const cp = e.target.closest('[data-copy-form]');
    if (!dl && !cp) return;
    const form = e.target.closest('form[data-form]'); if (!form || !form._submission) return;
    const d = form._submission;
    if (cp) { navigator.clipboard.writeText(JSON.stringify(d, null, 2)).then(() => toast(t('copied'))); return; }
    let content, mime, ext;
    if (dl.dataset.dl === 'csv') {
      const escCsv = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      content = Object.keys(d).map(escCsv).join(',') + '\n' + Object.values(d).map(escCsv).join(','); mime = 'text/csv'; ext = 'csv';
    } else { content = JSON.stringify(d, null, 2); mime = 'application/json'; ext = 'json'; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = d._form + '-submission.' + ext; a.click(); URL.revokeObjectURL(a.href);
  });
}
