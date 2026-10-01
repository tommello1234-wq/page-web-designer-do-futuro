/* core/nav.js — nav fixa (pills ativas por sensor) + menu overlay (§5.2).
   As âncoras (href="#…" → goTo com alias #preco, cortina e foco) já são delegadas em core/scroll.js: aqui só se fecha o
   menu antes que o clique chegue ao document. Menu: aria-expanded/aria-controls, MENU ↔ FECHAR, ESC, focus trap,
   inert no restante da página e Lenis travado (core.lock('menu')). Estado do menu é do módulo (sobrevive a rebuilds). */
const WDF = window.WDF, core = WDF.core, w = window, d = document, html = d.documentElement;

const nav = d.querySelector('.nav');
const menu = d.getElementById('menu');
const btn = nav && nav.querySelector('.nav-menu');
const btnLabel = btn && btn.querySelector('.nav-menu-l');
let open = false, anim = null;

const motion = () => !!(WDF.ctx && WDF.ctx.flags.motion && core.G);
const outside = () => [d.getElementById('main'), d.querySelector('body > footer'), d.querySelector('.dock'), d.querySelector('.wa-float'), d.querySelector('.skip')];
function setInert(on) { outside().forEach((el) => { if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } }); }
function focusables() {
  const list = [...menu.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.getClientRects().length);
  return btn ? [btn, ...list] : list;
}

function openMenu() {
  if (open || !menu || !btn) return;
  open = true;
  if (anim) { anim.kill(); anim = null; }
  menu.hidden = false;
  html.classList.add('menu-open');
  btn.setAttribute('aria-expanded', 'true');
  if (btnLabel) btnLabel.textContent = 'FECHAR';
  core.lock('menu', true);
  setInert(true);
  if (motion()) {
    const G = core.G;
    const words = menu.querySelectorAll('.menu-t > span');
    const rest = menu.querySelectorAll('.menu-i, .menu-foot');
    anim = G.timeline({ onComplete: () => { anim = null; } })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: 'wdf.inout', clearProps: 'clipPath' }, 0)
      .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: .9, ease: 'wdf.out', stagger: .06, clearProps: 'transform' }, .22)
      .fromTo(rest, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .9, ease: 'wdf.out', stagger: .06, clearProps: 'opacity,transform' }, .32);
  }
  const first = menu.querySelector('.menu-links a');
  if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
}

function closeMenu(restoreFocus) {
  if (!open) return;
  open = false;
  if (anim) { anim.kill(); anim = null; }
  btn.setAttribute('aria-expanded', 'false');
  if (btnLabel) btnLabel.textContent = 'MENU';
  core.lock('menu', false);
  setInert(false);
  const done = () => {
    anim = null;
    if (open) return;
    menu.hidden = true;
    html.classList.remove('menu-open');
    if (core.G) core.G.set([menu, ...menu.querySelectorAll('.menu-t > span, .menu-i, .menu-foot')], { clearProps: 'clipPath,opacity,transform' });
  };
  if (motion()) anim = core.G.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: .45, ease: 'wdf.inout', onComplete: done });
  else done();
  if (restoreFocus && btn) { try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); } }
}

if (nav && menu && btn) {
  btn.addEventListener('click', () => (open ? closeMenu(true) : openMenu()));
  /* qualquer âncora do menu (ou o logo da nav) fecha ANTES da delegação de scroll.js (que roda no document) */
  const onAnchor = (e) => {
    if (!open) return;
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' || a.hasAttribute('data-checkout')) closeMenu(false);
  };
  menu.addEventListener('click', onAnchor);
  nav.addEventListener('click', onAnchor);
  d.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    const list = focusables(); if (!list.length) return;
    const i = list.indexOf(d.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === list.length - 1)) { e.preventDefault(); list[0].focus(); }
  });
  /* o menu só existe até 1099px: ao crescer a janela, fecha */
  const wide = w.matchMedia('(min-width:1100px)');
  const onWide = () => { if (wide.matches) closeMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
}

WDF.layer('nav', {
  /* pills ativas: sensores por [data-nav] (top center → bottom center), medidos depois dos pins (refreshPriority:-1) */
  setup(lc) {
    const links = [...d.querySelectorAll('[data-nav-link]')];
    let current;
    const set = (key) => {
      if (key === current) return;
      current = key;
      links.forEach((a) => {
        const on = key != null && a.getAttribute('data-nav-link') === key;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    const sts = [];
    d.querySelectorAll('main > section[data-nav], footer[data-nav]').forEach((sec) => {
      const st = lc.st({ trigger: sec, start: 'top center', end: 'bottom center', onToggle: (s) => { if (s.isActive) set(sec.getAttribute('data-nav')); } });
      if (st) sts.push(st);
    });
    const sync = () => {
      if (!sts.length) return set(null);
      const y = w.scrollY;
      let hit = sts.find((s) => y >= s.start && y < s.end);
      if (!hit) hit = y < sts[0].start ? sts[0] : sts[sts.length - 1];
      set(hit.trigger.getAttribute('data-nav'));
    };
    lc.onRefresh(sync);
    return () => { current = undefined; };
  },
  open: openMenu,
  close: () => closeMenu(true),
  isOpen: () => open,
});
