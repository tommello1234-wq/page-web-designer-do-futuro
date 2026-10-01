/* core/scroll.js — Lenis, travas de rolagem, goTo (alias #preco, saltos longos com cortina, foco),
   âncoras delegadas, hash no load, volta do checkout e âncora de rebuild (§3.3, §5.2, §5.8). */
const WDF = window.WDF, core = WDF.core, w = window, d = document, html = d.documentElement;
const G = core.G, ST = core.ST;

let lenis = null, rafFn = null;
const locks = new Set();

core.ensureLenis = function ensureLenis(motion) {
  if (motion && !lenis && typeof w.Lenis === 'function') {
    lenis = new w.Lenis({ lerp: .09, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: false, respectReducedMotion: false });
    lenis.on('scroll', ST.update);
    rafFn = (t) => lenis.raf(t * 1000);
    G.ticker.add(rafFn);
    if (locks.size) lenis.stop();
  } else if (!motion && lenis) {
    G.ticker.remove(rafFn); rafFn = null;
    try { lenis.destroy(); } catch (e) { /* noop */ }
    lenis = null;
  }
  WDF.lenis = lenis;
  html.classList.toggle('is-locked', !lenis && locks.size > 0 && !locks.has('preloader'));
  return lenis;
};

/* trava por motivo ('preloader' | 'menu' | 'dialog' …): Lenis parado enquanto houver algum motivo */
core.lock = function lock(key, on) {
  if (on) locks.add(key); else locks.delete(key);
  if (lenis) { if (locks.size) lenis.stop(); else lenis.start(); }
  else html.classList.toggle('is-locked', locks.size > 0 && !locks.has('preloader'));
};
core.locked = () => locks.size > 0;

/* ---------- utilitários ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const maxScroll = () => Math.max(0, (d.scrollingElement || html).scrollHeight - w.innerHeight);
const navH = () => parseFloat(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
function byHash(h) {
  if (!h || h === '#') return null;
  let id = h.charAt(0) === '#' ? h.slice(1) : h;
  try { id = decodeURIComponent(id); } catch (e) { /* noop */ }
  return d.getElementById(id);
}
function toEl(t) {
  if (!t) return null;
  if (typeof t === 'string') { if (t.charAt(0) === '#') return byHash(t); try { return d.querySelector(t); } catch (e) { return null; } }
  return t.nodeType === 1 ? t : null;
}
core.byHash = byHash;

/* destino = {y, el}; alias de pouso #preco → .of-card (§5.2) */
function resolve(target, o) {
  if (typeof target === 'number') return { y: target, el: null };
  let el = toEl(target); if (!el) return null;
  let off = null;
  if (el.id === 'preco') {
    const card = el.querySelector('.of-card');
    if (card) {
      el = card;
      const mob = WDF.ctx ? WDF.ctx.flags.mobile : core.mq('(max-width:899px)');
      off = mob ? navH() + 12 : Math.max(navH() + 24, w.innerHeight * .12);
    }
  }
  if (o && typeof o.offset === 'number') off = o.offset;
  if (off == null) off = navH();
  return { y: el.getBoundingClientRect().top + w.scrollY - off, el };
}

function focusTarget(el) {
  if (!el || !el.focus) return;
  if (!el.matches('a[href],button,input,select,textarea,summary,[tabindex]')) el.setAttribute('tabindex', '-1');
  try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
}

/* salto imediato: suspende vídeos/decodificações (state.jumping) durante as atualizações síncronas */
function jumpTo(y) {
  WDF.state.jumping = true;
  try {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else w.scrollTo(0, y);
    ST.update();
  } finally {
    WDF.state.jumping = false;
    WDF.bus.emit('jump:end', { y });
  }
}
core.jumpTo = jumpTo;

function curtainJump(y) {
  const main = d.getElementById('main') || d.body;
  return new Promise((res) => {
    G.to(main, {
      opacity: 0, duration: .18, ease: 'wdf.inout', overwrite: true,
      onComplete() {
        jumpTo(y);
        requestAnimationFrame(() => G.to(main, { opacity: 1, duration: .18, ease: 'wdf.inout', clearProps: 'opacity', onComplete: () => res(true) }));
      },
    });
  });
}

/* goTo(target, {offset, duration, immediate, focus}) → Promise<boolean> */
core.goTo = function goTo(target, o = {}) {
  const r = resolve(target, o);
  if (!r) return Promise.resolve(false);
  const y = clamp(Math.round(r.y), 0, maxScroll());
  const focusEl = o.focus === false ? null : r.el;
  const done = () => { if (focusEl) focusTarget(focusEl); return true; };
  const smooth = !!(lenis && WDF.ctx && WDF.ctx.flags.motion);
  if (o.immediate || !smooth) { jumpTo(y); return Promise.resolve(done()); }
  if (Math.abs(y - w.scrollY) > 2 * w.innerHeight) return curtainJump(y).then(done);
  return new Promise((res) => {
    lenis.scrollTo(y, { duration: typeof o.duration === 'number' ? o.duration : 1.4, easing: core.EXPO, force: true, onComplete: () => res(done()) });
  });
};

/* âncoras delegadas: lê o href NO CLIQUE (o dock troca o href em tempo de execução) */
d.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target && e.target.closest && e.target.closest('a[href]');
  if (!a || a.hasAttribute('data-checkout')) return;
  const href = a.getAttribute('href') || '';
  if (href.charAt(0) !== '#') return;
  if (href === '#') { e.preventDefault(); return; }           // href="#" puro: no-op
  const el = byHash(href);
  if (!el) return;                                             // alvo inexistente (preview isolado): o navegador segue
  e.preventDefault();
  if (!WDF.ctx) { el.scrollIntoView(); focusTarget(el); return; }
  core.goTo(el);
});

/* gesto do usuário antes do 1º build (hash no load nunca "puxa de volta") */
let gestured = false;
const onGesture = (e) => {
  if (e.type === 'keydown' && !/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/.test(e.key)) return;
  gestured = true;
};
['wheel', 'touchstart', 'keydown'].forEach((t) => w.addEventListener(t, onGesture, { passive: true, capture: true }));

/* restauração inicial (após o 1º sort()+refresh()): volta do checkout → card; senão hash → alvo */
core.restoreInitial = function restoreInitial() {
  ['wheel', 'touchstart', 'keydown'].forEach((t) => w.removeEventListener(t, onGesture, { capture: true }));
  const rec = (kind) => { WDF._.restore = { kind, y: Math.round(w.scrollY) }; };
  if (gestured) return rec('gesture');
  let navType = '';
  try { const n = performance.getEntriesByType('navigation')[0]; navType = (n && n.type) || ''; } catch (e) { /* noop */ }
  if (navType === 'back_forward' && WDF.state.offerSeen && byHash('#preco')) { core.goTo('#preco', { immediate: true, focus: false }); return rec('checkout'); }
  if (location.hash.length > 1) { const el = byHash(location.hash); if (el) { core.goTo(el, { immediate: true, focus: false }); return rec('hash'); } }
  rec('none');
};

/* âncora de rebuild (FX / troca de breakpoint): seção no centro da viewport + fração percorrida */
core.captureAnchor = function captureAnchor() {
  const mid = w.innerHeight / 2;
  const list = d.querySelectorAll('main > section, main > div, footer');
  for (const s of list) {
    const r = s.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid && r.height > 0) return { el: s, frac: (mid - r.top) / r.height };
  }
  return { y: w.scrollY };
};
core.restoreAnchor = function restoreAnchor(a) {
  if (!a) return;
  if (a.el && a.el.isConnected) {
    const r = a.el.getBoundingClientRect();
    jumpTo(clamp(Math.round(r.top + w.scrollY + a.frac * r.height - w.innerHeight / 2), 0, maxScroll()));
  } else if (typeof a.y === 'number') jumpTo(clamp(a.y, 0, maxScroll()));
};
