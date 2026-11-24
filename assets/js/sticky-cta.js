
import { url } from './config.js';
import { t } from './i18n.js';
import { icon, refreshIcons } from './components.js';
export function renderSticky(cfg) {
  const r = document.getElementById('sticky-root'); if (!r || sessionStorage.getItem('cis-sticky-hide')) return;
  r.innerHTML = '<div class="sticky-cta" role="navigation" aria-label="' + t('quickActions') + '">' +
    '<a class="btn btn-gold" href="' + url(cfg.ctas.inquire) + '">' + t('inquire') + '</a>' +
    '<a class="btn btn-light" href="' + url(cfg.ctas.apply) + '">' + t('apply') + '</a>' +
    '<a class="btn btn-light" href="' + url(cfg.ctas.visit) + '">' + t('visit') + '</a>' +
    '<button class="sticky-x" data-sticky-dismiss aria-label="' + t('dismiss') + '">' + icon('x', 'w-4 h-4') + '</button></div>';
  r.addEventListener('click', (e) => { if (e.target.closest('[data-sticky-dismiss]')) { sessionStorage.setItem('cis-sticky-hide', '1'); r.innerHTML = ''; } });
  refreshIcons();
}
