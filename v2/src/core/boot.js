/* core/boot.js — ciclo de vida (§6.4): flags → frames → preloader → fonts (teto 1,5s) → gsap.matchMedia → build.
   build(): classes is-motion/is-static, Lenis, camadas do core (refreshPriority:-1), seções em ordem do DOM, cada uma
   com gsap.context + ctx PRÓPRIO e isolamento de erro; depois sort()+refresh(), restauração (hash/checkout/âncora) e ready.
   O mesmo caminho serve à troca de breakpoint, reduced-motion, 'short' e ao switch FX (WDF.rebuild). */
const WDF = window.WDF, core = WDF.core, w = window, d = document, html = d.documentElement;
const G = core.G, ST = core.ST, _ = WDF._;
const QUERIES = {
  desk: '(min-width:900px)', mob: '(max-width:899px)',
  rm: '(prefers-reduced-motion: reduce)', short: '(orientation:landscape) and (max-height:560px)',
};

let mm = null, first = true, pendingAnchor = null, reason = 'init';

/* ---------- ticks: 1 laço global no gsap.ticker; cada fn só roda com o elemento a ≤ margin viewports ---------- */
const ticks = new Set();
let tickOn = false;
function tickLoop(time, deltaMs) {
  const dt = Math.min(deltaMs || 16, 100) / 1000;
  ticks.forEach((t) => {
    if (!t.active) return;
    try { t.fn(time, dt); } catch (e) { console.error('[WDF] tick ' + t.name, e); ticks.delete(t); }
  });
}
function addTick(el, fn, margin, name) {
  const t = { fn, name: name || '', active: !el };
  let io = null;
  if (el && 'IntersectionObserver' in w) {
    const m = Math.max(0, margin == null ? 1 : +margin) * 100;
    io = new IntersectionObserver((es) => { t.active = es[es.length - 1].isIntersecting; }, { rootMargin: m + '% 0px' });
    io.observe(el);
  } else t.active = true;
  ticks.add(t);
  if (!tickOn && G) { G.ticker.add(tickLoop); tickOn = true; }
  return () => { if (io) io.disconnect(); ticks.delete(t); };
}

/* ---------- ctx global (WDF.ctx) ---------- */
const noop = () => {};
const ctx = {
  gsap: G, ScrollTrigger: ST, SplitText: w.SplitText, CustomEase: w.CustomEase,
  lenis: null, mm: null, flags: core.readFlags(null), bus: WDF.bus, DUR: WDF.DUR,
  st: (v) => ST.create(v),
  scrubTl: (v) => G.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...v, scrub: true } }),
  tick: (el, fn, m) => addTick(el, fn, m, 'global'),
  on: (t, ty, fn, o) => t && t.addEventListener(ty, fn, o),
  later: (fn) => fn(),
  cleanup: noop,
  onRefresh: (fn) => ST.addEventListener('refresh', fn),
  goTo: (t, o) => core.goTo(t, o),
  theme: { override: noop },
  pointer: core.pointer,
  velocity: () => core.velocity(),
  media: core.makeMedia(null),
  frames: WDF.frames,
  offer: WDF.offer, fmt: WDF.fmt, track: WDF.track,
  rail: { set(p, label) { const L = WDF.layers.rail; if (L && typeof L.set === 'function') L.set(p, label); } },
  reveal: { lines: noop, words: noop, up: noop, media: noop, rule: noop, strike: noop, count: noop },
  toast: (m, ms) => core.toast(m, ms),
  dialog: core.dialog,
};

/* ---------- unidade (seção ou camada): contexto gsap + ctx derivado + cleanups ---------- */
function makeUnit(name, root, isLayer) {
  const u = { name, root, isLayer, alive: true, inInit: true, cleanups: [] };
  u.sctx = root ? G.context(noop, root) : G.context(noop);
  const inCtx = (fn) => {
    let err = null, res;
    u.sctx.add(() => { try { res = fn(); } catch (e) { err = e; } });
    if (err) throw err;
    return res;
  };
  const prio = (v) => ((isLayer || !u.inInit) && v && !('refreshPriority' in v) ? { ...v, refreshPriority: -1 } : v);
  const sc = Object.create(ctx);
  sc.name = name; sc.root = root || null;
  sc.st = (vars) => (u.alive ? inCtx(() => ST.create(prio(vars))) : null);
  sc.scrubTl = (vars) => (u.alive ? inCtx(() => G.timeline({ defaults: { ease: 'none' }, scrollTrigger: prio({ ...vars, scrub: true }) })) : null);
  sc.later = (fn) => {
    if (!u.alive || typeof fn !== 'function') return undefined;
    try { return inCtx(fn); } catch (e) { console.error('[WDF] ' + name + ' (later)', e); return undefined; }
  };
  sc.cleanup = (fn) => { if (typeof fn === 'function') u.cleanups.push(fn); };
  sc.on = (t, type, fn, o) => { if (!t) return; t.addEventListener(type, fn, o); u.cleanups.push(() => t.removeEventListener(type, fn, o)); };
  sc.tick = (el, fn, m) => { const off = addTick(el, fn, m, name); u.cleanups.push(off); return off; };
  sc.onRefresh = (fn) => { ST.addEventListener('refresh', fn); u.cleanups.push(() => ST.removeEventListener('refresh', fn)); };
  sc.theme = { override: (t) => { if (root && u.alive) core.theme.override(root, t); } };
  if (root) u.cleanups.push(() => core.theme.override(root, null));
  sc.media = core.makeMedia(sc);
  sc.frames = core.makeFrames(sc);
  sc.reveal = core.makeReveal(sc);
  u.sc = sc;
  u.dispose = () => {
    if (!u.alive) return;
    u.alive = false;
    try { u.sctx.revert(); } catch (e) { console.error('[WDF] revert ' + name, e); }
    for (let i = u.cleanups.length - 1; i >= 0; i--) {
      try { u.cleanups[i](); } catch (e) { console.error('[WDF] cleanup ' + name, e); }
    }
    u.cleanups.length = 0;
  };
  return u;
}

function runLayer(L) {
  const u = makeUnit(L.name, null, true);
  let err = null;
  u.sctx.add(() => {
    try { const ret = L.def.setup(u.sc); if (typeof ret === 'function') u.cleanups.push(ret); } catch (e) { err = e; }
  });
  u.inInit = false;
  if (err) { console.error('[WDF] camada ' + L.name, err); u.dispose(); }
  return u;
}

function runSection(s) {
  const u = makeUnit(s.name, s.root, false);
  s.root.removeAttribute('data-failed');
  let err = null;
  u.sctx.add(() => {
    try {
      const ret = s.def.init(u.sc, s.root);
      if (typeof ret === 'function') u.cleanups.push(ret);
      core.applyAttrReveals(s.root, u.sc);
      if (core.failTest && core.failTest === s.name) throw new Error('wdf-fail: init de "' + s.name + '" forçado a falhar (teste de isolamento)');
    } catch (e) { err = e; }
  });
  u.inInit = false;
  if (err) {
    /* isolamento: desfaz só esta seção (gsap.set, splits, STs, pins) + cleanups; o HTML já é o estado final */
    console.error('[WDF] ' + s.name, err);
    u.dispose();
    s.root.setAttribute('data-failed', '');
    _.failed.add(s.name);
  }
  return u;
}

function presentSections() {
  return _.sections
    .map((s) => ({ name: s.name, def: s.def, root: d.querySelector('[class~="s-' + s.name + '"]') }))
    .filter((s) => s.root)
    .sort((a, b) => (a.root.compareDocumentPosition(b.root) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

/* ---------- build (chamado pelo gsap.matchMedia; revertido por ele) ---------- */
function build(mmctx) {
  _.rebuilds++;
  const why = reason; reason = 'media';
  const flags = core.readFlags(mmctx && mmctx.conditions);
  ctx.flags = flags;
  html.classList.toggle('is-motion', flags.motion);
  html.classList.toggle('is-static', !flags.motion);
  ctx.lenis = core.ensureLenis(flags.motion);
  ctx.mm = mm;
  WDF.ctx = ctx;

  const units = [];
  _.layers.forEach((L) => { if (typeof L.def.setup === 'function') units.push(runLayer(L)); });
  presentSections().forEach((s) => units.push(runSection(s)));

  ST.sort(); ST.refresh();
  _.layers.forEach((L) => {
    if (typeof L.def.after === 'function') { try { L.def.after(ctx); } catch (e) { console.error('[WDF] camada ' + L.name + ' (after)', e); } }
  });

  if (first) {
    first = false;
    core.restoreInitial();
    core.mark('ready');
    _.resolveReady(ctx);
  } else if (pendingAnchor) {
    core.restoreAnchor(pendingAnchor);
  }
  pendingAnchor = null;
  WDF.bus.emit('rebuild', { count: _.rebuilds, reason: why });

  return () => { for (let i = units.length - 1; i >= 0; i--) units[i].dispose(); };
}

/* ---------- API pública de rebuild / FX ---------- */
WDF.rebuild = function rebuild(why) {
  if (!mm) return;
  reason = why || 'manual';
  pendingAnchor = core.captureAnchor();
  mm.revert();
  mm = G.matchMedia();
  mm.add(QUERIES, build);
};
core.setFx = function setFx(on) {
  on = !!on;
  core.fxExplicit = true;
  WDF.state.fx = on;
  core.store.set('local', 'wdf-fx', on ? '1' : '0');
  WDF.bus.emit('fx', { on });
  WDF.rebuild('fx');
};
core.refresh = () => WDF.refresh();

/* ---------- preloader (camada F0b) ---------- */
core.claimPreloader = function claimPreloader() {
  if (html.classList.contains('pre-skip') || !core.OK) return false;
  WDF.state.preloader = 'running';
  core.lock('preloader', true);
  return true;
};
WDF.bus.on('preloader:done', () => {
  core.lock('preloader', false);
  core.mark('preloaderDone');
  if (WDF.state.preloader === 'running') WDF.state.preloader = 'done';
});

function whenFonts(cap) {
  const ready = d.fonts && d.fonts.ready ? d.fonts.ready.catch(() => {}) : Promise.resolve();
  return Promise.race([ready, new Promise((r) => setTimeout(r, cap))]);
}

function start() {
  core.mark('boot');
  if (!core.OK) { WDF.state.preloader = 'skipped'; _.T.preloaderDone = _.T.boot; return; }
  ST.config({ ignoreMobileResize: true });
  G.ticker.lagSmoothing(0);

  const f0 = core.readFlags(null);
  /* 1º lote de frames já no boot (o preloader mede o progresso por ele); em modo estático não há canvas: nada a baixar */
  if (f0.motion && !f0.saveData && !f0.lowNet && d.querySelector('.hero-canvas, .of-canvas, canvas[data-frames]')) WDF.frames.start();

  _.layers.forEach((L) => {
    if (typeof L.def.boot === 'function') { try { L.def.boot(WDF); } catch (e) { console.error('[WDF] camada ' + L.name + ' (boot)', e); } }
  });
  if (WDF.state.preloader !== 'running') {
    WDF.state.preloader = 'skipped';
    _.T.preloaderDone = _.T.boot;
    WDF.bus.emit('preloader:done', { skipped: true });
  }

  /* âncora de rolagem capturada ANTES do gsap reverter numa troca de media query (listeners mais antigos disparam antes) */
  Object.values(QUERIES).forEach((q) => {
    const m = w.matchMedia(q);
    const fn = () => { if (!pendingAnchor && WDF.ctx) pendingAnchor = core.captureAnchor(); };
    if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn);
  });

  whenFonts(1500).then(() => {
    mm = G.matchMedia();
    ctx.mm = mm;
    mm.add(QUERIES, build);
    /* fontes que chegam depois (fallback métrico evita saltos grandes): um refresh com debounce */
    let t = 0;
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', () => { clearTimeout(t); t = setTimeout(() => WDF.refresh(), 200); });
  });
}

if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start, { once: true });
else start();
