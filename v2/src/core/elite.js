/* core/elite.js — modo elite global (§5.7): classe/estado/storage, traço de luz único nas hairlines visíveis
   (e nas que entrarem depois, uma vez) e toast. Fonte: evento 'elite' {on} do Superpoder. */
const WDF = window.WDF, core = WDF.core, d = document;
let io = null;
function lit(el, delay) {
  if (el.dataset.lit) return;
  el.dataset.lit = '1';
  setTimeout(() => { el.classList.add('is-lit'); setTimeout(() => el.classList.remove('is-lit'), 700); }, delay || 0);
}
function watchLater() {
  if (io || !('IntersectionObserver' in window)) return;
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && WDF.state.elite) { lit(e.target, 0); io.unobserve(e.target); } }));
  d.querySelectorAll('.hairline:not([data-lit])').forEach((h) => io.observe(h));
}
function applyElite(on, animate) {
  WDF.state.elite = !!on;
  d.body.classList.toggle('is-elite', !!on);
  core.store.set('session', 'wdf-elite', on ? '1' : '0');
  if (!animate) return;
  if (on && d.documentElement.classList.contains('is-motion')) {
    const vis = [...d.querySelectorAll('.hairline')].filter((h) => { const r = h.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    vis.forEach((h, i) => lit(h, i * 80));
    watchLater();
  }
  core.toast(on ? 'A PÁGINA INTEIRA FOI LIGADA' : 'A PÁGINA VOLTOU AO MODO ESTÁTICO');
}
WDF.bus.on('elite', (e) => applyElite(!!(e && e.on), true));
WDF.layer('elite', {
  boot() { if (WDF.state.elite) d.body.classList.add('is-elite'); },
  setup() {},
});
