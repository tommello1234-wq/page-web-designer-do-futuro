/* intl/en (27/11/2026): cópia de core/offer.js com a oferta em dólar e o checkout da Hotmart */
/* core/offer.js — OFFER (fonte única dos valores; o offer-lock do build lê o JSON entre os marcadores),
   formatação pt-BR, repasse de parâmetros (desligado) e o estado offerSeen/offerRevealed (§5.6, §6.6). */
const WDF = window.WDF, core = WDF.core, d = document;

const OFFER = /*OFFER*/{
  "checkoutUrl": "https://pay.hotmart.com/R108694918C",
  "currency": "USD",
  "currencySymbol": "$",
  "installments": null,
  "cash": {
    "value": 47
  },
  "anchor": 408,
  "from": null,
  "items": [
    {
      "key": "item-0",
      "label": "Archive-01 // Core",
      "title": "The Complete Method",
      "value": 197
    },
    {
      "key": "item-1",
      "label": "Archive-02 // Exclusive Bonus",
      "title": "Assets Library",
      "value": 57
    },
    {
      "key": "item-2",
      "label": "Archive-03 // Exclusive Bonus",
      "title": "Design System Templates",
      "value": 97
    },
    {
      "key": "item-3",
      "label": "Archive-04 // Bonus Class",
      "title": "My Top Skills",
      "value": 57
    }
  ],
  "bonus": [
    {
      "key": "bonus-0",
      "title": "PREMIUM ASSETS LIBRARY",
      "value": 57
    },
    {
      "key": "bonus-1",
      "title": "DESIGN SYSTEM: THE MASTER TEMPLATE",
      "value": 97
    },
    {
      "key": "bonus-2",
      "title": "ACCESS TO MY TOP SKILLS",
      "value": 57
    }
  ],
  "whatsapp": null,
  "forwardParams": true,
  "lpCheckoutEvent": "CliqueCheckout"
}/*/OFFER*/;

function deepFreeze(o) { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); }
deepFreeze(OFFER);

/* formatação pt-BR sem Intl (sem NBSP, idêntica ao HTML): 2088 → '2.088'; 61.74 → '61,74' */
function num(n, dec = 0) {
  const neg = n < 0; const fixed = Math.abs(+n).toFixed(dec);
  const [int, frac] = fixed.split('.');
  const s = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + frac : '');   // intl: 2,088 · 47.00
  return neg ? '-' + s : s;
}
const brl = (n, dec = 0) => OFFER.currencySymbol + num(n, dec);   // intl: em dólar
const fmt = Object.freeze({ brl, num });

/* valor esperado de cada [data-offer="k"] (mesma regra do offer-lock do build) */
function offerText(k) {
  let m;
  if ((m = /^item-(\d+)$/.exec(k)) && OFFER.items[+m[1]]) return brl(OFFER.items[+m[1]].value, 0);
  if ((m = /^bonus-(\d+)$/.exec(k)) && OFFER.bonus[+m[1]]) return brl(OFFER.bonus[+m[1]].value, 0);
  if (k === 'anchor') return brl(OFFER.anchor, 0);
  if (k === 'installment') return OFFER.installments ? num(OFFER.installments.value, 2) : null;
  if (k === 'cash') return num(OFFER.cash.value, 2);
  if (k === 'from') return OFFER.from ? brl(OFFER.from, 2) : null;                                   // âncora do card, igual ao checkout: R$ 997,00
  if (k === 'price') return num(OFFER.cash.value, OFFER.cash.value % 1 ? 2 : 0);   // preço à vista em destaque: 97
  return null;
}

/* soma honesta (assert no boot) */
const sum = OFFER.items.reduce((a, it) => a + it.value, 0);
if (sum !== OFFER.anchor) console.error('[WDF] OFFER: soma dos itens (' + sum + ') ≠ anchor (' + OFFER.anchor + ')');

/* repasse de parâmetros ao checkout — função pura (WDF.debug.forward); só é APLICADA com OFFER.forwardParams */
const FWD = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'src', 'sck'];
function forward(search) {
  let q; try { q = new URLSearchParams(search || ''); } catch (e) { return OFFER.checkoutUrl; }
  const out = new URLSearchParams();
  q.forEach((v, k) => {
    if (!FWD.includes(k) || out.has(k) || !v) return;
    if (v.length <= (k === 'fbclid' ? 500 : 200)) out.set(k, v);
  });
  const s = out.toString();
  return s ? OFFER.checkoutUrl + '?' + s : OFFER.checkoutUrl;
}

WDF.offer = OFFER;
WDF.fmt = fmt;
core.forward = forward;
core.offerText = offerText;
core.offerSum = sum;

/* offerSeen: bloco de preço ≥50% visível UMA vez (§5.6). offerRevealed: emitido pela seção da oferta. */
function markSeen() {
  if (WDF.state.offerSeen) return;
  WDF.state.offerSeen = true;
  core.store.set('session', 'wdf-seen', '1');
  WDF.bus.emit('offer:seen');
}
WDF.bus.on('offer:revealed', () => { WDF.state.offerRevealed = true; });
WDF.layer('offer', {
  setup(lc) {
    const price = d.querySelector('#preco [data-offer-block="price"]');
    if (!price || WDF.state.offerSeen || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting && e.intersectionRatio >= .5)) { io.disconnect(); markSeen(); }
    }, { threshold: [0, .5, 1] });
    io.observe(price);
    return () => io.disconnect();
  },
});
