/* core/track.js — eventos de checkout por DELEGAÇÃO (§6.6). Independe do GSAP: funciona mesmo se os vendors falharem.
   Um único listener em captura cobre qualquer a[data-checkout] (inclusive o dock, que recebe o href em tempo de execução).
   Nunca chama preventDefault; a navegação lê o href no fim do dispatch. */
const WDF = window.WDF, w = window, d = document;
const OFFER = WDF.offer;

function checkout(source) {
  const value = OFFER.cash.value, currency = OFFER.currency, name = 'Web Designer do Futuro';
  try {
    if (typeof w.fbq === 'function') {
      if (OFFER.lpCheckoutEvent === 'InitiateCheckout') w.fbq('track', 'InitiateCheckout', { value, currency, content_name: name });
      else w.fbq('trackCustom', 'CliqueCheckout', { value, currency });
    }
  } catch (e) { /* noop */ }
  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'begin_checkout', { value, currency, transport_type: 'beacon', items: [{ item_name: name, price: value, quantity: 1 }] });
    }
  } catch (e) { /* noop */ }
  WDF.bus.emit('checkout', { source });
}

/* no-op com OFFER.forwardParams:false (D1: checkout exato); ligado, repassa só a whitelist (WDF.debug.forward) */
function forwardParams(a) {
  if (!OFFER.forwardParams) return;
  a.setAttribute('href', WDF.core.forward(location.search));
}

d.addEventListener('click', (e) => {
  const a = e.target && e.target.closest && e.target.closest('a[data-checkout]');
  if (!a) return;
  try { forwardParams(a); } catch (_) { a.setAttribute('href', OFFER.checkoutUrl); }
  WDF.track.checkout(a.getAttribute('data-checkout') || 'oferta');
}, { capture: true });

WDF.track = Object.freeze({ checkout });
