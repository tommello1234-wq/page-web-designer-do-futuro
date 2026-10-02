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

/* Atribuição no lead tracker (mesmo sistema das páginas do Gravyx). A 1ª origem
   da visita (UTMs, clique do Meta, referrer) fica guardada no navegador; no clique
   o link ganha client_reference_id=j_<uuid> e a visita é salva no lead tracker.
   O checkout do app põe esse código na cobrança do Asaas, e quando o pagamento
   cai o lead tracker liga venda → visita → anúncio. Nunca bloqueia a navegação. */
const LT_API = 'https://lead-tracker-three-xi.vercel.app/api/cart-capture/journey';
const ACQ_KEY = 'upw_acquisition_v1';
const ACQ_MAX_AGE = 90 * 24 * 60 * 60 * 1000;
const cookie = (n) => { try { const m = d.cookie.match(new RegExp('(?:^|;\\s*)' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; } catch (_) { return ''; } };
const numId = (q, names) => { for (const n of names) { const v = q.get(n) || ''; if (/^\d+$/.test(v)) return v; } return ''; };
let pageFbc = '';
function touch() {
  const url = new URL(location.href), q = url.searchParams, fbclid = q.get('fbclid') || '';
  let fbc = cookie('_fbc');
  if (fbclid && (!fbc || fbc.slice(fbc.lastIndexOf('.') + 1) !== fbclid)) fbc = pageFbc = pageFbc || 'fb.1.' + Date.now() + '.' + fbclid;
  let ref = 'direct';
  try { if (d.referrer) { const r = new URL(d.referrer); ref = r.hostname === location.hostname ? 'internal' : r.hostname.replace(/^www\./, ''); } } catch (_) { /* direct */ }
  const keep = new URL(url.origin + url.pathname);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_adset', 'utm_ad', 'campaign_id', 'adset_id', 'ad_id', 'fbclid'].forEach((k) => { if (q.get(k)) keep.searchParams.set(k, q.get(k)); });
  return {
    landing_page: location.pathname || '/', url: keep.toString(), referrer: ref, captured_at: new Date().toISOString(),
    utm_source: q.get('utm_source') || '', utm_medium: q.get('utm_medium') || '', utm_campaign: q.get('utm_campaign') || '',
    utm_content: q.get('utm_content') || '', utm_term: q.get('utm_term') || '', utm_adset: q.get('utm_adset') || '', utm_ad: q.get('utm_ad') || '',
    campaign_id: numId(q, ['campaign_id', 'utm_campaign_id']), adset_id: numId(q, ['adset_id', 'utm_adset_id']), ad_id: numId(q, ['ad_id', 'utm_ad_id']),
    fbp: cookie('_fbp'), fbc,
  };
}
let acquisition = null;
try { acquisition = JSON.parse(w.localStorage.getItem(ACQ_KEY) || 'null'); } catch (_) { /* sem storage */ }
(() => {
  const first = touch(), q = new URL(location.href).searchParams;
  const fresh = ['utm_source', 'utm_campaign', 'fbclid', 'ad_id'].some((k) => !!q.get(k)) || !['direct', 'internal'].includes(first.referrer);
  if (!acquisition || !acquisition.captured_at || Date.now() - Date.parse(acquisition.captured_at) > ACQ_MAX_AGE || fresh) acquisition = first;
  try { w.localStorage.setItem(ACQ_KEY, JSON.stringify(acquisition)); } catch (_) { /* sem storage */ }
})();
function uuid() {
  if (w.crypto && w.crypto.randomUUID) return w.crypto.randomUUID();
  const b = new Uint8Array(16); w.crypto.getRandomValues(b);
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  return Array.from(b, (x, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + x.toString(16).padStart(2, '0')).join('');
}
function attribute(a) {
  const id = uuid(), current = touch();
  if (!acquisition.fbp && current.fbp) acquisition.fbp = current.fbp; // Pixel pode criar o _fbp depois do load
  const url = new URL(a.getAttribute('href'), location.href);
  url.searchParams.set('client_reference_id', 'j_' + id);
  a.setAttribute('href', url.toString());
  const body = JSON.stringify({ journey_id: id, acquisition, checkout: Object.assign(current, { checkout_url: url.origin + url.pathname, plan: 'web-designer-do-futuro' }) });
  fetch(LT_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

d.addEventListener('click', (e) => {
  const a = e.target && e.target.closest && e.target.closest('a[data-checkout]');
  if (!a) return;
  try { forwardParams(a); } catch (_) { a.setAttribute('href', OFFER.checkoutUrl); }
  try { attribute(a); } catch (_) { /* rastreio nunca impede o checkout */ }
  WDF.track.checkout(a.getAttribute('data-checkout') || 'oferta');
}, { capture: true });

WDF.track = Object.freeze({ checkout });
