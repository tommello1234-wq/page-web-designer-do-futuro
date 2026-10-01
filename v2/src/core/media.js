/* core/media.js — vídeos preguiçosos (§6.4 media, §7.2).
   lazyVideo: src só por proximidade (IO) ou por load()/play(); data-src-m no mobile; .is-playing no pai no 1º 'playing'
   (esconde o .vid-poster); nada carrega/toca durante saltos (state.jumping); play() sempre com catch → mostra .vid-toggle;
   pausa sozinho ao sair da viewport; ≤ 1 por grupo (exclusive) e ≤ 2 na página. */
const WDF = window.WDF, core = WDF.core, d = document;

const all = new Set();
const groups = new Map();
const pending = new Set();          // pedidos de load durante um salto
const playing = [];                 // ordem de início (para o teto global de 2)
const PLAY = '#i-play', PAUSE = '#i-pause';

function setToggle(ctl) {
  const t = ctl.toggle; if (!t) return;
  const paused = ctl.el.paused;
  t.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  const use = t.querySelector('use');
  if (use) use.setAttribute('href', paused ? PLAY : PAUSE);
}

function exclusive(group, ctl) {
  const set = groups.get(group); if (!set) return;
  set.forEach((c) => { if (c !== ctl && !c.el.paused) c.pause(); });
}

function lazyVideo(v, o = {}) {
  const flags = WDF.ctx ? WDF.ctx.flags : core.readFlags(null);
  const src = (flags.mobile && v.getAttribute('data-src-m')) || v.getAttribute('data-src') || '';
  const host = v.parentElement;
  const toggle = host ? host.querySelector(':scope > .vid-toggle') : null;
  const offs = [];
  const on = (t, ty, fn, opt) => { t.addEventListener(ty, fn, opt); offs.push(() => t.removeEventListener(ty, fn, opt)); };

  const ctl = {
    el: v, group: o.group || null, toggle,
    loaded: !!v.getAttribute('src'),
    userPaused: false,
    load(pre) {
      if (ctl.loaded || !src) return;
      if (WDF.state.jumping) { pending.add(ctl); return; }
      v.preload = pre || 'auto';
      v.src = src;
      ctl.loaded = true;
    },
    play() {
      if (WDF.state.jumping) return Promise.resolve(false);
      ctl.load('auto');
      if (ctl.group) exclusive(ctl.group, ctl);
      let p; try { p = v.play(); } catch (e) { p = Promise.reject(e); }
      return Promise.resolve(p).then(() => true, () => { ctl.showToggle(); return false; });
    },
    pause() { try { v.pause(); } catch (e) { /* noop */ } },
    showToggle() { if (toggle) { toggle.hidden = false; toggle.classList.add('is-on'); } },
    destroy() {
      offs.forEach((f) => f()); offs.length = 0;
      ctl.pause(); all.delete(ctl); pending.delete(ctl);
      const g = ctl.group && groups.get(ctl.group); g && g.delete(ctl);
      const i = playing.indexOf(ctl); if (i >= 0) playing.splice(i, 1);
    },
  };
  all.add(ctl);
  if (ctl.group) { if (!groups.has(ctl.group)) groups.set(ctl.group, new Set()); groups.get(ctl.group).add(ctl); }

  /* eventos */
  on(v, 'playing', () => {
    if (host) host.classList.add('is-playing');
    const i = playing.indexOf(ctl); if (i >= 0) playing.splice(i, 1);
    playing.push(ctl);
    while (playing.length > 2) { const old = playing.shift(); if (old !== ctl) old.pause(); }
    setToggle(ctl);
  });
  on(v, 'pause', () => { const i = playing.indexOf(ctl); if (i >= 0) playing.splice(i, 1); setToggle(ctl); });
  on(v, 'play', () => setToggle(ctl));

  if (toggle) {
    toggle.hidden = false;
    on(toggle, 'click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (v.paused) { ctl.userPaused = false; ctl.play(); } else { ctl.userPaused = true; ctl.pause(); }
    });
    if (!flags.motion || !flags.autoplay) ctl.showToggle();   // estático / política: ▶ visível
    setToggle(ctl);
  }

  if ('IntersectionObserver' in window) {
    /* proximidade: só em movimento e se a seção não desligou (auto:false = nunca carrega sozinho) */
    if (o.auto !== false && flags.motion) {
      const near = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { near.disconnect(); ctl.load('metadata'); }
      }, { rootMargin: o.margin || '100% 0px' });
      near.observe(v); offs.push(() => near.disconnect());
    }
    /* nunca tocar fora da viewport */
    const vis = new IntersectionObserver((es) => {
      const e = es[es.length - 1];
      if (!e.isIntersecting && !v.paused) ctl.pause();
    }, { threshold: 0 });
    vis.observe(v); offs.push(() => vis.disconnect());
  }
  return ctl;
}

/* ao fim de um salto, carrega o que foi pedido durante ele (se ainda perto da tela) */
WDF.bus.on('jump:end', () => {
  if (!pending.size) return;
  const list = [...pending]; pending.clear();
  requestAnimationFrame(() => list.forEach((c) => {
    if (!all.has(c)) return;
    const r = c.el.getBoundingClientRect();
    if (r.bottom > -innerHeight && r.top < innerHeight * 2) c.load('metadata');
  }));
});

core.media = { lazyVideo, exclusive };
core.makeMedia = function makeMedia(sc) {
  return {
    lazyVideo(v, o) { const c = lazyVideo(v, o); if (sc) sc.cleanup(() => c.destroy()); return c; },
    exclusive,
  };
};
