/* SUPERPODER #power-section (§4.4): (A) comparador antes/depois, (B) switch do modo elite, (C) vista explodida. */
WDF.register('superpoder', {
  init(ctx, root) {
    const { gsap, flags } = ctx;
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const clamp = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v));

    /* ───────── (A) comparador ───────── */
    const cmp = $('.cmp'), knob = $('.cmp-handle'), mode = $('.sp-mode'), video = $('.cmp-after video');
    const tagL = $('.cmp-tag--l'), tagR = $('.cmp-tag--r');
    const vid = ctx.media.lazyVideo(video, { group: 'superpoder', auto: false });   // só carrega com interação
    let x = 70, touched = false, activated = false;
    const setX = (v) => {
      x = clamp(v);
      cmp.style.setProperty('--x', x.toFixed(2) + '%');
      const after = Math.round(100 - x);
      knob.setAttribute('aria-valuenow', String(after));
      knob.setAttribute('aria-valuetext', 'Depois: ' + after + '%');
      mode.textContent = x >= 50 ? 'MODO: ESTÁTICO' : 'MODO: ELITE';
      root.classList.toggle('is-view-elite', x < 50);
      tagL.classList.toggle('is-off', x < 14);
      tagR.classList.toggle('is-off', x > 86);
    };
    const activate = () => { touched = true; if (!activated) { activated = true; vid.load(); } vid.play(); };
    const tweenX = (to, dur = .9) => {
      const o = { v: x };
      return gsap.to(o, { v: to, duration: flags.motion ? dur : .2, ease: 'wdf.inout', onUpdate: () => setX(o.v) });
    };
    const fromEvent = (e) => { const r = cmp.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };

    let drag = null;
    ctx.on(cmp, 'pointerdown', (e) => {
      if (e.button > 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), touch: e.pointerType === 'touch', live: false };
      if (!drag.touch) { drag.live = true; cmp.setPointerCapture(e.pointerId); cmp.classList.add('is-dragging'); activate(); setX(fromEvent(e)); }
    });
    ctx.on(cmp, 'pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.live) {                                   // toque: só vira arraste se for claramente horizontal
        const dx = Math.abs(e.clientX - drag.x0), dy = Math.abs(e.clientY - drag.y0);
        if (dx > 10 && dx > dy) { drag.live = true; try { cmp.setPointerCapture(e.pointerId); } catch (_) { /* noop */ } cmp.classList.add('is-dragging'); activate(); }
        else if (dy > 10) { drag = null; return; }
        else return;
      }
      setX(fromEvent(e));
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.touch && !drag.live && e.type === 'pointerup') {      // tap: move o knob e toca
        const moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
        if (moved < 10 && performance.now() - drag.t0 < 300) { activate(); tweenX(fromEvent(e), .5); }
      }
      cmp.classList.remove('is-dragging');
      drag = null;
    };
    ctx.on(cmp, 'pointerup', end);
    ctx.on(cmp, 'pointercancel', end);
    ctx.on(knob, 'keydown', (e) => {
      const step = { ArrowLeft: 5, ArrowRight: -5, PageUp: -10, PageDown: 10 }[e.key];
      let to = null;
      if (step != null) to = x + step;                    // → aumenta "% de depois" (x diminui)
      else if (e.key === 'Home') to = 100;
      else if (e.key === 'End') to = 0;
      if (to == null) return;
      e.preventDefault(); activate(); setX(to);
    });
    if (flags.fine) { ctx.on(cmp, 'pointerenter', () => { if (!activated) { activated = true; vid.load(); } }); }
    ctx.on(knob, 'focus', () => { if (flags.fine && !activated) { activated = true; vid.load(); } });
    setX(70);

    // nudge único (nunca liga o switch nem carrega o vídeo)
    if (flags.motion) {
      ctx.st({ trigger: cmp, start: 'top 60%', once: true, onEnter: () => {
        if (touched) return;
        const o = { v: 70 };
        gsap.timeline().to(o, { v: 62, duration: .45, ease: 'wdf.inout', onUpdate: () => !touched && setX(o.v) })
          .to(o, { v: 70, duration: .45, ease: 'wdf.inout', onUpdate: () => !touched && setX(o.v) });
      } });
    }

    /* ───────── (B) switch do modo elite ───────── */
    const sw = $('#elite-toggle'), stOff = $('.st-off'), stOn = $('.st-on');
    const paint = (on, animate) => {
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      root.classList.toggle('is-on', on);
      const show = on ? stOn : stOff, hide = on ? stOff : stOn;
      if (animate && flags.motion) {
        show.hidden = false;
        gsap.fromTo(show, { yPercent: 100 }, { yPercent: 0, duration: .6, ease: 'wdf.out' });
        gsap.fromTo(hide, { yPercent: 0 }, { yPercent: -100, duration: .6, ease: 'wdf.out', onComplete: () => { hide.hidden = true; gsap.set(hide, { clearProps: 'transform' }); } });
      } else { show.hidden = false; hide.hidden = true; }
    };
    const set = (on, animate) => {
      paint(on, animate);
      if (on) { touched = true; if (!activated) { activated = true; vid.load(); } vid.play(); tweenX(0); }
      else { vid.pause(); tweenX(100); }
      if (animate) ctx.bus.emit('elite', { on });
    };
    ctx.on(sw, 'click', () => set(sw.getAttribute('aria-checked') !== 'true', true));
    if (WDF.state.elite) { paint(true, false); setX(0); }     // volta à página: reflete o estado sem animar

    /* ───────── (C) vista explodida ───────── */
    const xs = $('.sp-x'), xStage = $('.sp-x-stage'), page = $('.sp-page'), layers = $$('.sp-page .L');
    const lis = $$('.sp-callouts li'), svg = $('.sp-lines'), meterN = $('.sp-x-meter b'), meterBar = $('.sp-x-meter i');
    if (!(flags.pin && flags.desk)) return;                 // mobile / estático: layout 2D do CSS
    root.classList.add('is-3d');
    ctx.cleanup(() => root.classList.remove('is-3d'));

    const NS = 'http://www.w3.org/2000/svg';
    const lines = lis.map(() => {
      const g = document.createElementNS(NS, 'g');
      const path = document.createElementNS(NS, 'path'), dot = document.createElementNS(NS, 'circle'), ring = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', '4'); ring.setAttribute('r', '9'); ring.setAttribute('class', 'ring');
      g.append(path, dot, ring); svg.appendChild(g);
      return { g, path, dot, ring };
    });
    ctx.cleanup(() => { svg.textContent = ''; });

    let p = 0;
    ctx.st({ trigger: xs, start: 'top top', end: '+=140%', pin: xStage, scrub: true, onUpdate: (s) => { p = s.progress; } });
    const eio = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let lastP = -1;
    ctx.tick(xStage, () => {
      if (p === lastP) return;
      lastP = p;
      // lê as âncoras (pose do frame anterior) antes de escrever
      const sr = xStage.getBoundingClientRect();
      const anchors = layers.map((L) => L.querySelector('.anc').getBoundingClientRect());
      const boxes = lis.map((li) => li.getBoundingClientRect());

      const e = p < .12 ? 0 : p < .42 ? eio((p - .12) / .30) : p < .78 ? 1 : 1 - eio((p - .78) / .22);
      const rot = e;
      page.style.transform = `rotateX(${(58 * rot).toFixed(2)}deg) rotateZ(${(-38 * rot).toFixed(2)}deg)`;
      layers.forEach((L, i) => { L.style.transform = `translateZ(${(i * 70 * e).toFixed(1)}px)`; });
      meterN.textContent = String(Math.round(e * 100)).padStart(3, '0');
      meterBar.style.transform = `scaleX(${e.toFixed(3)})`;

      lis.forEach((li, i) => {
        const on = e > .35 + i * .08;
        li.classList.toggle('is-in', on);
        const ln = lines[i];
        [ln.path, ln.dot, ln.ring].forEach((n) => n.classList.toggle('is-in', on));
        if (!on) return;
        const b = boxes[i], a = anchors[i];
        const left = li.dataset.side === 'left';
        const sx = (left ? b.right + 12 : b.left - 12) - sr.left, sy = b.top + 12 - sr.top;
        const mx = sx + (left ? 40 : -40);
        const ax = a.left - sr.left, ay = a.top - sr.top;
        ln.path.setAttribute('d', `M${sx.toFixed(1)} ${sy.toFixed(1)}L${mx.toFixed(1)} ${sy.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}`);
        ln.dot.setAttribute('cx', ax.toFixed(1)); ln.dot.setAttribute('cy', ay.toFixed(1));
        ln.ring.setAttribute('cx', ax.toFixed(1)); ln.ring.setAttribute('cy', ay.toFixed(1));
      });
    });
    return () => { page.style.transform = ''; layers.forEach((L) => { L.style.transform = ''; }); lis.forEach((li) => li.classList.remove('is-in')); };
  },
});
