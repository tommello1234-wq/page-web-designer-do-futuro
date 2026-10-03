/* core/cursor.js — cursor custom com label + magnético (§5.4; AERIS B.4). Só com flags.fine && flags.motion
   (html.has-cursor só nessa condição). Ponto colado ao ponteiro, anel com lerp .18; [data-cursor] → anel 86px sólido com o
   label; pointerdown → 26px. Cores por body[data-ui] (CSS). Magnético (.magnetic): x = dx·.25, y = dy·.35 com power2.out .4s,
   volta com elastic.out(1,.4) .7s — via --mx/--my + a propriedade `translate` (não briga com os transforms do GSAP). */
const WDF = window.WDF, core = WDF.core, w = window, d = document, html = d.documentElement;

const cur = d.querySelector('.cursor');
const dot = cur && cur.querySelector('.cursor-dot');
const ring = cur && cur.querySelector('.cursor-ring');
const lbl = cur && cur.querySelector('.cursor-label');
const CURSOR_OFF = false;

WDF.layer('cursor', {
  setup(lc) {
    if (!lc.flags.fine || !lc.flags.motion) return undefined;
    const G = core.G, P = core.pointer;
    // Cursor custom: some sozinho em janelas modais (chrome.css: dialog[open]) e fica acima do menu (--z-cursor).
    // O magnético dos botões é independente (html.has-magnet). Para desligar só o cursor: CURSOR_OFF = true.
    html.classList.add('has-magnet');
    const withCursor = !CURSOR_OFF && !!cur;
    if (withCursor) {
    html.classList.add('has-cursor');
    let rx = P.x, ry = P.y, lx = -1, ly = -1, lrx = -1, lry = -1, label = '';
    cur.classList.toggle('is-off', !P.active);

    lc.tick(null, (t, dt) => {
      const k = 1 - Math.pow(1 - .18, dt * 60);    // lerp .18 a 60fps, independente da taxa de quadros
      rx += (P.x - rx) * k; ry += (P.y - ry) * k;
      if (P.x !== lx || P.y !== ly) { lx = P.x; ly = P.y; dot.style.transform = 'translate3d(' + lx + 'px,' + ly + 'px,0)'; }
      const ax = Math.round(rx * 10) / 10, ay = Math.round(ry * 10) / 10;
      if (ax !== lrx || ay !== lry) { lrx = ax; lry = ay; ring.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)'; }
      const off = !P.active;
      if (off !== cur.classList.contains('is-off')) cur.classList.toggle('is-off', off);
    });

    const setLabel = (t) => {
      const el = t && t.closest ? t.closest('[data-cursor]') : null;
      const s = el ? el.getAttribute('data-cursor') || '' : '';
      if (s === label) return;
      label = s;
      if (s) lbl.textContent = s;
      cur.classList.toggle('is-label', !!s);
    };
    lc.on(d, 'pointerover', (e) => { if (e.pointerType !== 'touch') setLabel(e.target); }, { passive: true });
    lc.on(d, 'pointerdown', (e) => { if (e.pointerType !== 'touch') cur.classList.add('is-down'); }, { passive: true });
    lc.on(w, 'pointerup', () => cur.classList.remove('is-down'), { passive: true });
    lc.on(w, 'blur', () => cur.classList.remove('is-down'));
    }

    /* magnético: delegação (as seções criam/recriam .magnetic a cada build) */
    let mag = null;
    const leave = (el) => {
      G.to(el, { '--mx': '0px', '--my': '0px', duration: .7, ease: 'elastic.out(1,.4)', overwrite: true,
        onComplete: () => { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); } });
    };
    lc.on(d, 'pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const el = e.target && e.target.closest ? e.target.closest('.magnetic') : null;
      if (mag && mag !== el) { leave(mag); mag = null; }
      if (!el) return;
      mag = el;
      const r = el.getBoundingClientRect();
      const tx = el.style.getPropertyValue('--mx') ? parseFloat(el.style.getPropertyValue('--mx')) : 0;
      const ty = el.style.getPropertyValue('--my') ? parseFloat(el.style.getPropertyValue('--my')) : 0;
      /* centro sem o deslocamento atual (senão o botão "foge" do ponteiro) */
      const dx = e.clientX - (r.left - tx + r.width / 2), dy = e.clientY - (r.top - ty + r.height / 2);
      G.to(el, { '--mx': (dx * .25).toFixed(2) + 'px', '--my': (dy * .35).toFixed(2) + 'px', duration: .4, ease: 'power2.out', overwrite: true });
    }, { passive: true });
    lc.on(d.documentElement, 'pointerleave', () => { if (mag) { leave(mag); mag = null; } });

    return () => {
      html.classList.remove('has-magnet');
      if (withCursor) {
        html.classList.remove('has-cursor');
        cur.classList.remove('is-label', 'is-down', 'is-off');
        lbl.textContent = '';
        dot.style.transform = ''; ring.style.transform = '';
      }
      d.querySelectorAll('.magnetic').forEach((el) => { G.killTweensOf(el, '--mx,--my'); el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
    };
  },
});
