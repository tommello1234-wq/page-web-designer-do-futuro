/* core/promo.js — relógio da faixa de promoção (chrome-top .promo-bar).
   24h por visitante, guardadas no navegador; ao zerar, recomeça outras 24h (pedido do dono).
   Sem storage (aba anônima/bloqueio), conta 24h a partir do carregamento. */
const el = document.querySelector('[data-promo-timer]');
if (el) {
  const KEY = 'upw_promo_end_v1', DAY = 24 * 60 * 60 * 1000;
  let end = 0;
  try { end = +localStorage.getItem(KEY) || 0; } catch (e) { /* sem storage */ }
  const renew = () => { end = Date.now() + DAY; try { localStorage.setItem(KEY, String(end)); } catch (e) { /* sem storage */ } };
  if (end <= Date.now() || end > Date.now() + DAY) renew();
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    let left = end - Date.now();
    if (left <= 0) { renew(); left = DAY; }
    const s = Math.floor(left / 1000);
    el.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}
