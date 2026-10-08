/* core/rail.js — rail SINC (desktop ≥900) + barra de 2px (mobile) (§5.3).
   Mapeamento NÃO linear por marcos medidos no refresh (depois de todos os pins). Y(el) = scroll em que o FIM do elemento
   encosta no fim da viewport. SINC fica plano em 10% no Problema e bate 100% em yReveal (topo do bloco de preço cruzando
   70% da viewport) ou no evento 'offer:revealed'. Seções ausentes: o marco é ignorado; sem #preco, 100% = fim da página.
   Escrita só por transform/textContent, 1 vez por mudança de scroll (lc.tick). */
const WDF = window.WDF, core = WDF.core, w = window, d = document;

const rail = d.querySelector('.rail');
const fill = rail && rail.querySelector('.rail-fill');
const label = rail && rail.querySelector('.rail-label');
const barM = d.querySelector('.rail-m > i');

// "Quem sou eu" fica depois do preço e a seção de bônus saiu (pedido do dono): o último marco antes do preço é Módulos
const MARKS = [['#solution-section', 22], ['#power-section', 36], ['#depoimentos', 46], ['#conteudo', 60],
  ['#modulos', 80]];

let pts = [[0, 0]];            // [y, %] monotônicos
let yReveal = null;            // scroll do 100%
let pause = null;              // {a, b}: faixa do Problema (centro da viewport dentro dele)
let railH = 0;
let manual = null;             // {p, label} (ctx.rail.set)
let revealed = !!WDF.state.offerRevealed;
let dirty = true, lastY = -1, lastTxt = '', lastP = -1, wasPaused = false;
/* ler scrollY força recálculo de estilo no frame; parado, o draw() não toca no layout */
let scrolled = true;
w.addEventListener('scroll', () => { scrolled = true; }, { passive: true });
WDF.bus.on('jump:end', () => { scrolled = true; });

const maxScroll = () => Math.max(0, (d.scrollingElement || d.documentElement).scrollHeight - w.innerHeight);
const top = (el) => el.getBoundingClientRect().top + w.scrollY;
const endY = (el) => { const r = el.getBoundingClientRect(); return r.top + w.scrollY + r.height - w.innerHeight; };

function measure() {
  const ih = w.innerHeight, max = maxScroll();
  const raw = [];
  const add = (y, p) => { if (y != null && isFinite(y)) raw.push([Math.max(0, Math.min(max, y)), p]); };
  const hero = d.querySelector('#inicio .hero-track') || d.getElementById('inicio');
  if (hero) add(endY(hero), 10);
  const pr = d.getElementById('problema');
  pause = null;
  if (pr) {
    add(top(pr) - ih, 10);                        // plano: não avança no Problema
    add(endY(pr), 10);
    const r = pr.getBoundingClientRect();
    pause = { a: r.top + w.scrollY - ih / 2, b: r.top + w.scrollY + r.height - ih / 2 };
  }
  MARKS.forEach(([sel, p]) => { const el = d.querySelector(sel); if (el) add(endY(el), p); });
  const price = d.querySelector('#preco [data-offer-block="price"]');
  yReveal = price ? Math.min(max, top(price) - .7 * ih) : max;
  add(yReveal, 100);
  raw.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = [[0, 0]];
  raw.forEach(([y, p]) => {
    const last = out[out.length - 1];
    if (p < last[1]) return;                      // nunca volta
    if (y <= last[0]) { last[1] = Math.max(last[1], p); return; }
    out.push([y, p]);
  });
  pts = out;
  railH = rail ? rail.getBoundingClientRect().height : 0;
  dirty = true;
}

function at(y) {
  if (y == null) y = w.scrollY;
  if (revealed && yReveal != null && y >= yReveal - w.innerHeight) return 100;
  if (y <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [y1, p1] = pts[i];
    if (y <= y1) {
      const [y0, p0] = pts[i - 1];
      return +(p0 + (p1 - p0) * (y - y0) / Math.max(1e-6, y1 - y0)).toFixed(2);
    }
  }
  return pts[pts.length - 1][1];
}

function draw() {
  if (!dirty && !scrolled && !(WDF.lenis && WDF.lenis.isScrolling)) return;
  scrolled = false;
  const y = Math.round(w.scrollY);
  if (!dirty && y === lastY) return;
  dirty = false; lastY = y;
  let p, txt;
  const paused = !!(pause && y >= pause.a && y < pause.b);
  if (manual) {
    p = Math.max(0, Math.min(100, manual.p));
    txt = manual.label || 'SINC ' + String(Math.round(p)).padStart(3, '0') + '%';
  } else {
    p = at(y);
    const n = Math.round(p);
    txt = n >= 100 ? 'SINC 100% · PRONTO' : paused ? 'SINC ' + String(n).padStart(3, '0') + '% · PAUSADA' : 'SINC ' + String(n).padStart(3, '0') + '%';
  }
  const k = p / 100;
  if (Math.abs(p - lastP) > .01) {
    lastP = p;
    if (fill) fill.style.transform = 'scaleY(' + k.toFixed(4) + ')';
    if (label) label.style.transform = 'translate3d(0,' + (k * railH).toFixed(1) + 'px,0) translateY(-50%)';
    if (barM) barM.style.transform = 'scaleX(' + k.toFixed(4) + ')';
  }
  if (label && txt !== lastTxt) { lastTxt = txt; label.textContent = txt; }
  if (label && paused && !wasPaused && !manual) {
    label.classList.remove('is-blink');
    void label.offsetWidth;                         // reinicia a animação (2× 300ms, só em is-motion)
    label.classList.add('is-blink');
  }
  wasPaused = paused;
}
if (label) label.addEventListener('animationend', () => label.classList.remove('is-blink'));

WDF.bus.on('offer:revealed', () => { revealed = true; dirty = true; });

WDF.layer('rail', {
  setup(lc) {
    if (!rail && !barM) return undefined;
    measure();
    lc.onRefresh(measure);
    lc.tick(null, draw);
    return () => { dirty = true; };
  },
  after() { measure(); draw(); },
  set(p, lbl) { manual = p == null ? null : { p: +p || 0, label: lbl || '' }; dirty = true; lastP = -1; },
  at(y) { return at(y); },
  marks: () => pts.map((m) => m.slice()),
});
