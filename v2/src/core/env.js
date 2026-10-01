/* core/env.js — flags de ambiente (§6.4 Ctx.flags), ponteiro e velocidade. */
const WDF = window.WDF, core = WDF.core, w = window, d = document;

/* conditions = contexto do gsap.matchMedia ({desk, mob, rm, short}); sem ele, lê as media queries direto */
core.readFlags = function readFlags(c) {
  const mq = core.mq;
  const reduced = c ? !!c.rm : mq('(prefers-reduced-motion: reduce)');
  const mobile = c ? !!c.mob : mq('(max-width:899px)');
  const short = c ? !!c.short : mq('(orientation:landscape) and (max-height:560px)');
  const stored = core.store.get('local', 'wdf-fx');
  const fx = core.fxExplicit ? WDF.state.fx : stored === '1' ? true : stored === '0' ? false : !reduced;
  WDF.state.fx = fx;
  let conn = null; try { conn = navigator.connection || null; } catch (e) { conn = null; }
  const et = (conn && conn.effectiveType) || '';
  const saveData = !!(conn && conn.saveData === true);
  const lowNet = et === 'slow-2g' || et === '2g';
  return Object.freeze({
    reduced, fx, motion: fx,
    fine: mq('(hover:hover) and (pointer:fine)'),
    touch: mq('(hover:none)') || mq('(pointer:coarse)'),
    mobile, desk: !mobile, short,
    pin: fx && !short,
    saveData, lowNet,
    autoplay: !saveData && !/^(slow-2g|2g|3g)$/.test(et),   // sem navigator.connection (Safari) ⇒ true
    effectiveType: et,
  });
};

/* ponteiro compartilhado (só ponteiro fino atualiza; toque não move parallax) */
const pointer = { x: w.innerWidth / 2, y: w.innerHeight / 2, nx: 0, ny: 0, active: false };
w.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  pointer.x = e.clientX; pointer.y = e.clientY;
  pointer.nx = Math.max(-1, Math.min(1, (e.clientX / w.innerWidth) * 2 - 1));
  pointer.ny = Math.max(-1, Math.min(1, (e.clientY / w.innerHeight) * 2 - 1));
  pointer.active = true;
}, { passive: true });
d.addEventListener('mouseout', (e) => { if (!e.relatedTarget) pointer.active = false; }, { passive: true });
w.addEventListener('blur', () => { pointer.active = false; });
core.pointer = pointer;
core.velocity = () => (WDF.lenis ? WDF.lenis.velocity || 0 : 0);
