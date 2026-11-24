
import { reducedMotion } from './config.js';
let inst = null;
export function initHero() {
  const el = document.querySelector('.hero-swiper');
  if (!el || !window.Swiper) return;
  if (inst) { inst.destroy(true, true); inst = null; }
  inst = new window.Swiper(el, {
    loop: true, speed: 900, effect: 'fade', fadeEffect: { crossFade: true },
    autoplay: reducedMotion ? false : { delay: 6000, disableOnInteraction: false },
    pagination: { el: '.hero-pagination', clickable: true },
    navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
    a11y: { enabled: true }
  });
}
