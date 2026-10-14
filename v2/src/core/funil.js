/* core/funil.js — funil da página no lead tracker (pedido do dono, 14/10/2026): quantos visitam, clicam nos botões
   que levam ao preço (#preco, por origem: hero, menu, barra, dock…), veem o preço e clicam para o checkout.
   Só lead tracker (tabela lp_eventos, o mesmo canal da roleta e do funil do checkout). NÃO toca Pixel, gtag, Clarity
   nem o track.js: escuta os cliques depois deles (fase de bolha) e nunca impede nada.
   Cada evento conta 1 vez por visita (sessionStorage); clique conta 1 vez por visita e por origem.
   Só no domínio da Upward (prévias, localhost e clones não contam). */
const WDF = window.WDF, w = window, d = document;

const LT_EVENT = 'https://lead-tracker-three-xi.vercel.app/api/cart-capture/lp-event';
const KEY_V = 'upw_roleta_v1';   // mesmo código de visitante da roleta (liga as duas medições)
const KEY_S = 'upw_funil_v1';    // o que já foi contado nesta visita

const ativo = /(^|\.)upwardacademy\.com\.br$/.test(String(w.location.hostname || ''));

function visitante() {
  try {
    const s = JSON.parse(w.localStorage.getItem(KEY_V) || 'null') || {};
    if (!s.v) { s.v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); w.localStorage.setItem(KEY_V, JSON.stringify(s)); }
    return s.v;
  } catch (_) { return ''; }
}

const contado = (() => { try { return JSON.parse(w.sessionStorage.getItem(KEY_S) || '{}') || {}; } catch (_) { return {}; } })();

function registra(evento, motivo, extra) {
  if (!ativo) return;
  if (d.documentElement.style.visibility === 'hidden') return;   // trava de domínio escondeu a página
  const chave = evento + ':' + (motivo || '');
  if (contado[chave]) return;
  contado[chave] = 1;
  try { w.sessionStorage.setItem(KEY_S, JSON.stringify(contado)); } catch (_) { /* sem storage: conta de novo */ }
  try {
    let acq = {}; try { acq = JSON.parse(w.localStorage.getItem('upw_acquisition_v1') || '{}') || {}; } catch (_) { /* sem storage */ }
    const body = JSON.stringify(Object.assign({ evento, visitante: visitante(), lp: w.location.pathname, motivo: motivo || '',
      utm_content: acq.utm_content || '', utm_campaign: acq.utm_campaign || '' }, extra));
    w.fetch(LT_EVENT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {});
  } catch (_) { /* medição nunca atrapalha a página */ }
}

/* de onde veio o clique: barra do topo, menu, dock (botão fixo do celular) ou a seção do botão (hero, showcase, final…) */
function origem(a) {
  if (a.classList.contains('promo-bar')) return 'barra';
  if (a.classList.contains('dock-cta')) return 'dock';
  if (a.hasAttribute('data-nav-link') || a.classList.contains('nav-cta') || a.classList.contains('menu-cta')) return 'menu';
  const sec = a.closest('section[class*="s-"]');
  const cls = sec ? Array.from(sec.classList).find((c) => c.indexOf('s-') === 0) : '';
  return cls ? cls.slice(2) : 'outro';
}

registra('lp_visita');

/* "viu o preço": o offer.js já marca quando o bloco de preço fica ≥50% visível (offer:seen), por clique ou rolando */
if (WDF.state && WDF.state.offerSeen) registra('lp_preco_visto');
WDF.bus.on('offer:seen', () => registra('lp_preco_visto'));

d.addEventListener('click', (e) => {
  try {
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (a.hasAttribute('data-checkout')) {
      // o track.js (fase de captura) já pôs o client_reference_id no link: liga este clique à jornada do checkout
      let jornada = '';
      try { jornada = new URL(a.href, w.location.href).searchParams.get('client_reference_id') || ''; } catch (_) { /* link estranho */ }
      registra('lp_checkout_clique', a.getAttribute('data-checkout') || origem(a), jornada ? { journey_id: jornada } : undefined);
      return;
    }
    const href = a.getAttribute('href') || '';
    if (href === '#preco' || /#preco$/.test(href)) registra('lp_ir_preco', origem(a));
  } catch (_) { /* nunca atrapalha o clique */ }
});
