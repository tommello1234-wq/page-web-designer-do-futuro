/* core/wdf.js — cria window.WDF antes de tudo (§6.4).
   Namespace global, estado, barramento de eventos, registro de seções e de camadas do core,
   família de easings. Todo arquivo do bundle é embrulhado em IIFE pelo build: comunicação só por window.WDF. */
const w = window, d = document, html = d.documentElement;
const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /\.(localhost|test)$/.test(location.hostname);
const QS = location.search || '';

/* ganchos de teste — honrados SÓ em localhost (§6.4 ciclo de vida 1) */
if (LOCAL && /[?&]wdf-noric=1(?:&|$)/.test(QS)) {
  try { w.requestIdleCallback = undefined; delete w.requestIdleCallback; } catch (e) { /* noop */ }
}
const failTest = LOCAL ? ((/[?&]wdf-fail=([^&]+)/.exec(QS) || [])[1] || null) : null;

/* WDF.ric: requestIdleCallback com fallback (Safari/iOS não tem rIC). Ninguém chama requestIdleCallback direto. */
const ric = typeof w.requestIdleCallback === 'function'
  ? w.requestIdleCallback.bind(w)
  : (fn) => setTimeout(() => fn({ timeRemaining: () => 0, didTimeout: true }), 200);

/* storage tolerante (modo privado / bloqueado) */
const store = {
  get(kind, key) { try { return (kind === 'local' ? w.localStorage : w.sessionStorage).getItem(key); } catch (e) { return null; } },
  set(kind, key, val) { try { (kind === 'local' ? w.localStorage : w.sessionStorage).setItem(key, val); } catch (e) { /* noop */ } },
};
const mq = (q) => !!(w.matchMedia && w.matchMedia(q).matches);

/* ---------- barramento ---------- */
const listeners = new Map();
const bus = {
  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => { const s = listeners.get(evt); s && s.delete(fn); };
  },
  emit(evt, detail) {
    const s = listeners.get(evt); if (!s) return;
    [...s].forEach((fn) => { try { fn(detail); } catch (e) { console.error('[WDF] evento ' + evt, e); } });
  },
};

/* ---------- estado (sobrevive a rebuilds) ---------- */
const fxStored = store.get('local', 'wdf-fx');
const state = {
  elite: store.get('session', 'wdf-elite') === '1',
  fx: fxStored === '1' ? true : fxStored === '0' ? false : !mq('(prefers-reduced-motion: reduce)'),
  offerSeen: store.get('session', 'wdf-seen') === '1',
  offerRevealed: false,
  jumping: false,
  preloader: 'pending',          // 'running' | 'done' | 'skipped'
};

/* ---------- registros ---------- */
const sections = [];              // { name, def }
const layers = [];                // { name, def }  (camadas globais do core: tema, rail, nav, dock…)
function register(name, def) {
  if (!def || typeof def.init !== 'function') { console.error('[WDF] register(' + name + '): def.init ausente'); return; }
  if (sections.some((s) => s.name === name)) { console.error('[WDF] seção registrada duas vezes: ' + name); return; }
  sections.push({ name, def });
}
function layer(name, def) {
  const i = layers.findIndex((l) => l.name === name);
  const rec = { name, def: def || {} };
  if (i >= 0) layers[i] = rec; else layers.push(rec);
  WDF.layers[name] = rec.def;
}

/* ---------- tempos (ms desde navigationStart) ---------- */
const T = { boot: null, preloaderDone: null, preloaderRemoved: null, ready: null };
const now = () => Math.round(performance.now());

let resolveReady;
const ready = new Promise((r) => { resolveReady = r; });

/* ---------- GSAP: plugins + família de easings (registrada UMA vez, §3.1) ---------- */
const G = w.gsap, ST = w.ScrollTrigger;
const OK = !!(G && ST && w.SplitText && w.CustomEase);
if (OK) {
  G.registerPlugin(ST, w.SplitText, w.CustomEase);
  w.CustomEase.create('wdf.out', '.19,1,.22,1');     // toda ENTRADA
  w.CustomEase.create('wdf.inout', '.77,0,.18,1');   // grandes transições de ESTADO
  G.defaults({ ease: 'wdf.out', duration: 1.15 });
}
const DUR = Object.freeze({ xs: .15, s: .3, m: .45, l: .9, xl: 1.15 });   // espelha --d-*
const EXPO = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));             // easing do Lenis nas âncoras

const WDF = w.WDF = {
  version: '2.0.0',
  register, layer, ready, ric, bus, state,
  ctx: null, lenis: null,
  layers: {},                     // defs das camadas por nome (ex.: WDF.layers.rail.set)
  DUR,
  rebuild() { /* definido em boot.js */ },
  refresh() { if (OK) { ST.sort(); ST.refresh(); } },
  debug: {
    frames: () => ({ blobs: 0, decoded: 0, mode: 'off' }),
    rail: (y) => { const L = WDF.layers.rail; return L && typeof L.at === 'function' ? L.at(y) : null; },
    pins: () => (OK ? ST.getAll().filter((t) => t.pin).map((t) => ({ id: idOf(t.trigger), start: Math.round(t.start), end: Math.round(t.end) })) : []),
    sensors: () => [],
    timings: () => ({ ...T }),
    rebuilds: () => WDF._.rebuilds,
    forward: (s) => WDF.core.forward(s),
    failed: () => [...WDF._.failed],
    restore: () => WDF._.restore || null,     // restauração inicial: {kind:'hash'|'checkout'|'gesture'|'none', y}
  },
  /* API interna para as camadas do core (inclusive as do F0b). Seções usam só o ctx. */
  core: {
    OK, LOCAL, failTest, store, mq, now, EXPO, G, ST,
    mark(name) { if (T[name] == null) T[name] = now(); },
  },
  _: { sections, layers, T, failed: new Set(), rebuilds: 0, resolveReady, listeners },
};

function idOf(el) {
  if (!el || !el.closest) return '';
  const s = el.closest('main > section, footer, section');
  return (s && s.id) || el.id || '';
}
WDF.core.idOf = idOf;

if (!OK) {
  /* vendors ausentes: a página fica no estado final (HTML/CSS), sem movimento; o checkout continua rastreado */
  html.classList.remove('is-motion'); html.classList.add('is-static');
}
