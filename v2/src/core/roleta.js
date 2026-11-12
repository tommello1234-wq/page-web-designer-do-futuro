/* core/roleta.js — roleta de desconto (pedido do dono, 03/10).
   Aparece uma vez por visitante e SÓ PARA QUEM JÁ VIU O PREÇO (nesta visita ou numa anterior) e não clicou para o
   checkout (dono, 12/11/2026: 61% viam a roleta antes de chegar ao preço). Depois de ver o preço: após 45s com a aba
   visível ("tempo_preco"), na intenção de saída (mouse indo para o topo, computador) ou ao voltar para a aba (celular).
   O gatilho "parado" (25s sem mexer) saiu em 12/11: disparava ~30s depois de chegar e só 17% tinham visto o preço.
   Nunca aparece para quem já clicou para o checkout. Sempre cai em 20% OFF (cupom DESCONTO20OFF; era R$ 30 até 07/10).
   O relógio de 5 min é só urgência (pedido do dono): o cupom continua indo no link depois dele.
   RASTREIO: o botão é um a[data-checkout] comum, então o track.js faz tudo igual aos outros CTAs.
   O cupom entra no link DEPOIS (listener em bolha), sem tocar no código da visita. */
const WDF = window.WDF, core = WDF.core, OFFER = WDF.offer, w = window, d = document;

const CODE = 'DESCONTO20OFF', PRIZE = '20% OFF', CLOCK_MS = 5 * 60 * 1000;
const KEY = 'upw_roleta_v1';
const SLICES = ['10% OFF', '✕', '15% OFF', '✕', 'BÔNUS SECRETO', '✕', '20% OFF', '✕'];
const WIN = SLICES.indexOf(PRIZE);

const store = {
  get() { try { return JSON.parse(w.localStorage.getItem(KEY) || 'null') || {}; } catch (_) { return {}; } },
  set(v) { try { w.localStorage.setItem(KEY, JSON.stringify(Object.assign(store.get(), v))); } catch (_) { /* sem storage */ } },
};
const clarity = (name) => { try { if (typeof w.clarity === 'function') { w.clarity('event', name); w.clarity('set', 'roleta', name); } } catch (_) { /* noop */ } };

/* mesmo evento no lead tracker (tabela lp_eventos): é o que liga a roleta à venda pelo código da visita */
const LT_EVENT = 'https://lead-tracker-three-xi.vercel.app/api/cart-capture/lp-event';
function visitor() {
  let v = store.get().v;
  if (!v) { v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); store.set({ v }); }
  return v;
}
function report(evento, extra) {
  clarity(evento);
  try {
    let acq = {}; try { acq = JSON.parse(w.localStorage.getItem('upw_acquisition_v1') || '{}') || {}; } catch (_) { /* sem storage */ }
    const body = JSON.stringify(Object.assign({ evento, visitante: visitor(), lp: location.pathname,
      utm_content: acq.utm_content || '', utm_campaign: acq.utm_campaign || '' }, extra));
    fetch(LT_EVENT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {});
  } catch (_) { /* medição nunca atrapalha a página */ }
}

/* ---------- cupom no link do checkout (qualquer CTA, depois de ganhar) ---------- */
d.addEventListener('click', (e) => {
  const a = e.target && e.target.closest && e.target.closest('a[data-checkout]');
  if (!a) return;
  if (!store.get().won) return;
  try {
    const url = new URL(a.getAttribute('href'), location.href);
    url.searchParams.set('cupom', CODE);
    a.setAttribute('href', url.toString());
    report('roleta_checkout', { journey_id: url.searchParams.get('client_reference_id') || '', motivo: a.getAttribute('data-checkout') || '' });
  } catch (_) { /* o checkout abre sem cupom */ }
});

/* ---------- gatilhos ---------- */
const PRICE_WAIT_MS = 45 * 1000;   // tempo com a aba visível depois de ver o preço, sem clicar para o checkout
let armed = !store.get().shown, lastTick = Date.now(), leftAt = 0;
const started = Date.now();
WDF.bus.on('checkout', () => { if (armed) { armed = false; store.set({ shown: 1, skipped: 'checkout' }); } });

/* viu o preço: o mesmo sinal do funil (offer:seen, bloco de preço ≥50% visível). Fica guardado para a próxima visita. */
let priceSeen = !!(store.get().preco || (WDF.state && WDF.state.offerSeen)), visibleSincePrice = 0;
if (priceSeen) store.set({ preco: 1 });
WDF.bus.on('offer:seen', () => { if (priceSeen) return; priceSeen = true; visibleSincePrice = 0; store.set({ preco: 1 }); });

function canShow() {
  if (!armed || !priceSeen || d.querySelector('dialog[open]') || (core.locked && core.locked())) return false;
  return true;
}
function maybe(reason) { if (canShow()) { armed = false; open(reason); } }

setInterval(() => {
  const now = Date.now();
  if (d.visibilityState === 'visible' && priceSeen) visibleSincePrice += now - lastTick;
  lastTick = now;
  if (!armed) return;
  if (priceSeen && visibleSincePrice >= PRICE_WAIT_MS) maybe('tempo_preco');
}, 1000);
d.addEventListener('mouseout', (e) => {
  if (!e.relatedTarget && e.clientY <= 0 && Date.now() - started >= 15 * 1000) maybe('saida');
});
d.addEventListener('visibilitychange', () => {
  if (d.visibilityState === 'hidden') { leftAt = Date.now(); return; }
  if (leftAt && Date.now() - started >= 15 * 1000 && w.matchMedia('(pointer:coarse)').matches) maybe('voltou');
});

/* ---------- interface ---------- */
const el = (tag, cls, html) => { const n = d.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const pad = (n) => String(n).padStart(2, '0');

function wheelSvg() {
  const n = SLICES.length, r = 100, c = 110, step = 360 / n;
  const pt = (deg, rad) => { const a = (deg - 90) * Math.PI / 180; return [c + rad * Math.cos(a), c + rad * Math.sin(a)]; };
  let s = '';
  SLICES.forEach((label, i) => {
    const a0 = i * step, a1 = a0 + step, [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    const lose = label === '✕';
    s += `<path d="M${c} ${c}L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" class="rlt-s ${lose ? 'rlt-s--x' : i % 4 === 2 ? 'rlt-s--b' : 'rlt-s--a'}"/>`;
    const mid = a0 + step / 2, [tx, ty] = pt(mid, lose ? 70 : 62);
    const words = label.split(' ');
    const lines = lose ? [label] : label === 'BÔNUS SECRETO' ? ['BÔNUS', 'SECRETO'] : [words[0], words.slice(1).join(' ')];   // '20%' / 'OFF'
    s += `<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" transform="rotate(${mid.toFixed(1)} ${tx.toFixed(2)} ${ty.toFixed(2)})" class="rlt-t${lose ? ' rlt-t--x' : ''}">` +
      lines.map((l, k) => `<tspan x="${tx.toFixed(2)}" dy="${k === 0 ? (lines.length > 1 ? '-0.45em' : '0.35em') : '1.1em'}">${l}</tspan>`).join('') + '</text>';
  });
  return `<svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r + 6}" class="rlt-rim"/>${s}<circle cx="${c}" cy="${c}" r="16" class="rlt-hub"/></svg>`;
}

let dlg = null, timer = 0;
function open(reason) {
  store.set({ shown: 1, reason, at: Date.now() });
  report('roleta_exibida', { motivo: reason });
  dlg = el('dialog', 'rlt');
  dlg.setAttribute('aria-labelledby', 'rlt-t');
  dlg.innerHTML =
    '<button class="rlt-x" type="button" aria-label="Fechar">×</button>' +
    '<div class="rlt-step rlt-step--spin">' +
      '<p class="rlt-kick">ESPERA! PRESENTE PRA VOCÊ</p>' +
      '<h2 id="rlt-t" class="rlt-h">Gire a roleta e ganhe um desconto no seu acesso</h2>' +
      '<div class="rlt-wheel"><span class="rlt-pin" aria-hidden="true"></span><div class="rlt-rot">' + wheelSvg() + '</div></div>' +
      '<button class="rlt-go" type="button">GIRAR A ROLETA</button>' +
      '<p class="rlt-note">Você tem 1 giro.</p>' +
    '</div>';
  d.body.appendChild(dlg);
  dlg.querySelector('.rlt-x').addEventListener('click', close);
  dlg.addEventListener('close', () => { clearInterval(timer); core.lock('roleta', false); dlg.remove(); dlg = null; });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.querySelector('.rlt-go').addEventListener('click', spin, { once: true });
  dlg.showModal();
  core.lock('roleta', true);
}
function close() { if (dlg && dlg.open) dlg.close(); }

function spin(e) {
  const btn = e.currentTarget;
  btn.disabled = true; btn.textContent = 'GIRANDO…';
  report('roleta_girada');
  const step = 360 / SLICES.length, jitter = (Math.random() - 0.5) * step * 0.5;
  const target = 360 * 6 + (360 - (WIN * step + step / 2)) + jitter;
  const rot = dlg.querySelector('.rlt-rot');
  const reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  rot.style.transition = 'transform ' + (reduce ? 0.6 : 4.6) + 's cubic-bezier(.12,.62,.08,1)';
  requestAnimationFrame(() => { rot.style.transform = 'rotate(' + target + 'deg)'; });
  setTimeout(win, reduce ? 800 : 4900);
}

function win() {
  if (!dlg) return;
  const until = Date.now() + CLOCK_MS;
  store.set({ won: PRIZE });
  const step = dlg.querySelector('.rlt-step');
  step.className = 'rlt-step rlt-step--win';
  step.innerHTML =
    '<div class="rlt-gift" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg></div>' +
    '<h2 id="rlt-t" class="rlt-h">Parabéns! Você ganhou <em>' + PRIZE + '</em></h2>' +
    '<p class="rlt-sub">O cupom já vai aplicado no checkout.</p>' +
    '<div class="rlt-code"><div><span class="rlt-lbl">SEU CUPOM</span><strong>' + CODE + '</strong></div><button class="rlt-copy" type="button">Copiar</button></div>' +
    '<div class="rlt-exp"><span class="rlt-lbl">EXPIRA EM</span><strong class="rlt-clock">05:00</strong></div>' +
    '<a class="rlt-cta" data-checkout="roleta" href="' + OFFER.checkoutUrl + '">USAR CUPOM AGORA</a>';
  step.querySelector('.rlt-copy').addEventListener('click', (e) => {
    const b = e.currentTarget;
    const done = () => { b.textContent = 'Copiado!'; report('roleta_cupom_copiado'); };
    try { navigator.clipboard.writeText(CODE).then(done, done); } catch (_) { done(); }
  });
  const clock = step.querySelector('.rlt-clock');
  const tick = () => {
    const left = Math.max(0, until - Date.now()), s = Math.ceil(left / 1000);
    clock.textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
    if (left <= 0) clearInterval(timer);
  };
  tick();
  timer = setInterval(tick, 1000);
}

/* teste local: __roleta() no console abre na hora, ignorando gatilhos, o "já viu" e o preço */
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) w.__roleta = () => { armed = true; priceSeen = true; maybe('debug'); };
