/* core/offer.js — OFFER (fonte única dos valores; o offer-lock do build lê o JSON entre os marcadores),
   formatação pt-BR, repasse de parâmetros (desligado) e o estado offerSeen/offerRevealed (§5.6, §6.6). */
const WDF = window.WDF, core = WDF.core, d = document;

const OFFER = /*OFFER*/{
  "checkoutUrl": "https://app.upwardacademy.com.br/checkout/3069031d-d8a8-4252-84ae-e7dbb7c358a5/559b0f6c-066c-4388-87bb-05aab29add08",
  "currency": "BRL",
  "installments": { "n": 12, "value": 10.58 },
  "cash": { "value": 97.00 },
  "anchor": 2088,
  "from": 997.00,
  "items": [
    { "key": "item-0", "label": "Archive-01 // Core", "title": "O Método Completo", "value": 997 },
    { "key": "item-1", "label": "Archive-02 // Bônus Exclusivo", "title": "Biblioteca Premium Assets", "value": 297 },
    { "key": "item-2", "label": "Archive-03 // Bônus Exclusivo", "title": "Templates Design System", "value": 497 },
    { "key": "item-3", "label": "Archive-04 // Aula Bônus", "title": "Minhas Principais Skills", "value": 297 }
  ],
  "bonus": [
    { "key": "bonus-0", "title": "BIBLIOTECA PREMIUM DE ASSETS", "value": 297 },
    { "key": "bonus-1", "title": "DESIGN SYSTEM: O MODELO MESTRE", "value": 497 },
    { "key": "bonus-2", "title": "ACESSO ÀS MINHAS PRINCIPAIS SKILLS", "value": 297 }
  ],
  "whatsapp": "https://api.whatsapp.com/send?phone=5588992089323&text=Olá,%20gostaria%20de%20tirar%20dúvidas%20sobre%20o%20Web%20Designer%20do%20futuro",
  "forwardParams": true,
  "lpCheckoutEvent": "CliqueCheckout"
}/*/OFFER*/;

function deepFreeze(o) { Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); }
deepFreeze(OFFER);

/* formatação pt-BR sem Intl (sem NBSP, idêntica ao HTML): 2088 → '2.088'; 61.74 → '61,74' */
function num(n, dec = 0) {
  const neg = n < 0; const fixed = Math.abs(+n).toFixed(dec);
  const [int, frac] = fixed.split('.');
  const s = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec ? ',' + frac : '');
  return neg ? '-' + s : s;
}
const brl = (n, dec = 0) => 'R$ ' + num(n, dec);
const fmt = Object.freeze({ brl, num });

/* valor esperado de cada [data-offer="k"] (mesma regra do offer-lock do build) */
function offerText(k) {
  let m;
  if ((m = /^item-(\d+)$/.exec(k)) && OFFER.items[+m[1]]) return brl(OFFER.items[+m[1]].value, 0);
  if ((m = /^bonus-(\d+)$/.exec(k)) && OFFER.bonus[+m[1]]) return brl(OFFER.bonus[+m[1]].value, 0);
  if (k === 'anchor') return brl(OFFER.anchor, 0);
  if (k === 'installment') return OFFER.installments ? num(OFFER.installments.value, 2) : null;
  if (k === 'cash') return num(OFFER.cash.value, 2);
  if (k === 'from') return brl(OFFER.from, 2);                                   // âncora do card, igual ao checkout: R$ 997,00
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
