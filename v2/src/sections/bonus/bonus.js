/* bonus.js — §4.9 BÔNUS "Inclusão sequencial".
   Assinatura: ao entrar (top 70%, once) os cards abrem por clip (stagger .12) e o fio de cada card
   (01 ──── ✓ INCLUÍDO) enche um após o outro (.9s wdf.inout, intervalo de 250ms); ao completar cada fio,
   CARREGANDO… → ✓ INCLUÍDO (máscara .45s) e o riscado do valor desenha (--strike 0→1, .8s wdf.inout).
   O HTML é o estado FINAL; o estado inicial só é setado em is-motion e só se o gatilho ainda não passou.
   Vídeos: no máximo 1 tocando na seção. Desktop: o card sob o ponteiro; sem hover, o 01 enquanto a grade
   está ≥ 50% visível (src só a ≤ 1 viewport). Mobile: sem autoplay e sem pré-carga — poster + ▶, toca só no toque. */
const WDF = window.WDF;

WDF.register('bonus', {
  init(ctx, root) {
    const G = ctx.gsap, F = ctx.flags;
    const DUR = ctx.DUR || { m: .45, l: .9 };
    const grid = root.querySelector('.bn-grid');
    const parts = [...root.querySelectorAll('.bn-card')].map((card) => ({
      card,
      media: card.querySelector('.bn-media'),
      v: card.querySelector('video'),
      toggle: card.querySelector('.vid-toggle'),
      bar: card.querySelector('.bn-bar > i'),
      load: card.querySelector('.s-load'),
      ok: card.querySelector('.s-ok'),
      del: card.querySelector('.bn-value del'),
    }));
    if (!grid || !parts.length) return undefined;

    /* ---------------- vídeos ---------------- */
    const autoplay = F.desk && F.motion && F.autoplay;
    const ctls = parts.map((p) => ctx.media.lazyVideo(p.v, { group: 'bonus', auto: F.desk, margin: '100% 0px' }));
    const pauseOthers = (i) => ctls.forEach((c, j) => { if (j !== i && !c.el.paused) c.pause(); });

    parts.forEach((p, i) => {
      ctx.on(p.v, 'play', () => pauseOthers(i));                       // nunca 2 na seção, nem por um instante
      ctx.on(p.v, 'playing', () => { pauseOthers(i); p.card.classList.add('is-live'); });
      ctx.on(p.v, 'pause', () => p.card.classList.remove('is-live'));
      ctx.on(p.v, 'ended', () => p.card.classList.remove('is-live'));
      /* toque/clique na mídia = mesmo gesto do ▶ (o botão do core para a propagação) */
      ctx.on(p.media, 'click', () => {
        const c = ctls[i];
        if (c.el.paused) { c.userPaused = false; c.play(); } else { c.userPaused = true; c.pause(); }
      });
    });

    if (!autoplay) {
      ctls.forEach((c) => c.showToggle());                             // mobile / estático / política: poster + ▶
    } else {
      let hovered = -1, gridVis = false;
      const apply = () => {
        const t = hovered >= 0 ? hovered : (gridVis ? 0 : -1);
        ctls.forEach((c, i) => { if (i !== t && !c.el.paused) c.pause(); });
        const c = ctls[t];
        if (c && c.el.paused && !c.userPaused) c.play();
      };
      parts.forEach((p, i) => {
        ctx.on(p.card, 'pointerenter', (e) => { if (e.pointerType === 'mouse') { hovered = i; apply(); } });
        ctx.on(p.card, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && hovered === i) { hovered = -1; apply(); } });
      });
      /* "grade ≥ 50% visível" = metade da grade ou metade da tela, o que for menor */
      const th = Array.from({ length: 21 }, (_, k) => k / 20);
      const vis = new IntersectionObserver((es) => {
        const e = es[es.length - 1];
        const need = .5 * Math.min(e.boundingClientRect.height, window.innerHeight);
        const on = e.isIntersecting && e.intersectionRect.height >= need - 1;
        if (on !== gridVis) { gridVis = on; apply(); }
      }, { threshold: th });
      vis.observe(grid);
      ctx.cleanup(() => vis.disconnect());
    }

    /* ---------------- assinatura: inclusão sequencial ---------------- */
    if (F.motion) {
      let armed = false, done = false, st = null;
      const cards = parts.map((p) => p.card);

      function arm() {
        if (done || armed) return;
        let passed = true;
        try { passed = st.scroll() >= st.start - 1; } catch (e) { /* sem trigger: estado final */ }
        if (passed) { done = true; return; }                          // gatilho já passado: estado final, sem animar
        armed = true;
        parts.forEach((p) => { p.load.hidden = false; });
        G.set(cards, { clipPath: 'inset(0% -40px 100% -40px)' });
        parts.forEach((p) => {
          G.set(p.bar, { scaleX: 0 });
          G.set(p.load, { yPercent: 0 });
          G.set(p.ok, { yPercent: 110 });
          G.set(p.del, { '--strike': 0 });
        });
      }
      function build() {
        const tl = G.timeline();
        tl.to(cards, { clipPath: 'inset(0% -40px 0% -40px)', duration: DUR.l, ease: 'wdf.inout', stagger: .12, clearProps: 'clipPath' }, 0);
        parts.forEach((p, i) => {
          const t0 = i * (DUR.l + .25), t1 = t0 + DUR.l;
          tl.to(p.bar, { scaleX: 1, duration: DUR.l, ease: 'wdf.inout', clearProps: 'transform' }, t0)
            .to(p.load, { yPercent: -110, duration: DUR.m, ease: 'wdf.inout' }, t1)
            .to(p.ok, { yPercent: 0, duration: DUR.m, ease: 'wdf.inout', clearProps: 'transform' }, t1)
            .to(p.del, { '--strike': 1, duration: .8, ease: 'wdf.inout' }, t1);
        });
        return tl;
      }
      function play() {
        if (done) return;
        done = true; io.disconnect();
        if (!armed) return;
        ctx.later(() => { const tl = build(); if (WDF.state.jumping) tl.progress(1); });
      }

      /* split do trabalho: o estado inicial só é aplicado perto da tela (IO 150%), como os reveals do core */
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        ctx.later(arm);
      }, { rootMargin: '150% 0px' });
      ctx.cleanup(() => io.disconnect());
      st = ctx.st({ trigger: grid, start: 'top 70%', once: true, onEnter: () => play() });
      if (!done) io.observe(grid);
    }

    /* volta ao HTML (estado final): rebuild, isolamento de erro */
    return () => {
      parts.forEach((p) => {
        p.load.hidden = true;
        p.card.classList.remove('is-live');
        if (p.toggle) { p.toggle.hidden = true; p.toggle.classList.remove('is-on'); }
      });
    };
  },
});
