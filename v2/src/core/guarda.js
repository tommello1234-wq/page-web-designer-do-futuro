/* core/guarda.js — trava de domínio contra cópia da página (pedido do dono, 11/10). Primeiro arquivo do bundle.
   Fora dos endereços do projeto (upwardacademy.com.br e subdomínios, prévias *.vercel.app do projeto, localhost,
   tradutor do Google) ou aberta como arquivo salvo: esconde a página, avisa o lead tracker (evento clone_detectado,
   fora do rastreio de vendas) e manda a pessoa para a página original com utm_source=clone.
   No domínio certo não faz nada. Não toca em Pixel/gtag/Clarity. Os nomes ficam embaralhados de propósito para não
   aparecerem numa busca simples no arquivo copiado. */
const w = window, L = w.location;
const r = (s) => s.split('').reverse().join('');
const base = r('rb.moc.ymedacadrawpu');
const site = 'lp.' + base;
const h = String(L.hostname || '').toLowerCase();
const ok = L.protocol !== 'file:' && (
  h === base || h.endsWith('.' + base)
  || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(h) || /\.(localhost|test)$/.test(h)
  || (h.indexOf(r('orutuf-od-rengised-bew')) === 0 && h.endsWith('.vercel.app'))
  || h === site.replace(/\./g, '-') + '.translate.goog'
);

if (!ok) {
  try { document.documentElement.style.visibility = 'hidden'; } catch (e) { /* noop */ }
  const onde = (h || 'arquivo-local') + (L.pathname || '');
  try {
    const url = 'https://lead-tracker-three-xi.vercel.app/api/cart-capture/lp-event';
    const body = JSON.stringify({ evento: r('odatceted_enolc'), lp: onde.slice(0, 120), motivo: 'clone' });
    if (navigator.sendBeacon) navigator.sendBeacon(url, body);
    else fetch(url, { method: 'POST', body, keepalive: true, mode: 'no-cors' });
  } catch (e) { /* noop */ }
  const caminho = /promo/.test(L.pathname || '') ? '/promo' : '/';
  const alvo = 'https://' + site + caminho + '?utm_source=clone&utm_medium=redirect&utm_content=' + encodeURIComponent((h || 'arquivo-local').slice(0, 80));
  try { (w.top || w).location.replace(alvo); } catch (e) { try { L.replace(alvo); } catch (e2) { /* noop */ } }
}
