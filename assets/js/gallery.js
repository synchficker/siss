
let inst = null;
export function initGallery() {
  if (!window.GLightbox) return;
  if (inst) { inst.destroy(); inst = null; }
  if (document.querySelector('.glightbox')) inst = window.GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
}
