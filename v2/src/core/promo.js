/* core/promo.js — relógio da faixa de promoção (chrome-top .promo-bar).
   Conta até a próxima meia-noite de Brasília (UTC−3, sem horário de verão) e recomeça; igual para todos
   os visitantes, em qualquer fuso (pedido do dono, 03/10 — antes eram 24h a partir da 1ª visita). */
const el = document.querySelector('[data-promo-timer]');
if (el) {
  const DAY = 24 * 60 * 60 * 1000, BRT = -3 * 60 * 60 * 1000;
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const sp = Date.now() + BRT;                          // "agora" em Brasília, como se fosse UTC
    const left = (DAY - (((sp % DAY) + DAY) % DAY)) % DAY;  // até a próxima 00:00 de Brasília (00:00:00 na virada)
    const s = Math.max(0, Math.floor(left / 1000));
    el.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}
