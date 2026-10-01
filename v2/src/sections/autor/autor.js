/* autor · §4.8 · assinatura "Sem máscara".
   ctx.st({trigger:.au-card, start:'top 75%', end:'center 50%', scrub}) → --c 100% → 0% no trecho p .35 → .75 (easeInOutCubic):
   a armadura (frame 135, sobre ink) dá lugar ao rosto; reversível. O HTML/CSS já é o estado final (--c:0%);
   estático / sem JS / init falho = foto inteira. Escrita por frame com style.setProperty + restauração no cleanup. */
const WDF = window.WDF;

WDF.register('autor', {
  init(ctx, root) {
    if (!ctx.flags.motion) return;                                   // modo estático: nada a fazer (CSS = foto inteira)

    const card = root.querySelector('.au-card');
    const photo = root.querySelector('.au-photo');
    if (!card || !photo) return;

    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // easeInOutCubic
    const clamp01 = ctx.gsap.utils.clamp(0, 1);
    let lastC = -1, lastScan = -1;

    const apply = (p) => {
      const c = 100 * (1 - ease(clamp01((p - .35) / .4)));          // p .35 → .75 : 100% → 0%
      const cr = Math.round(c * 100) / 100;
      if (cr !== lastC) { lastC = cr; photo.style.setProperty('--c', cr + '%'); }
      const scan = cr > .2 && cr < 99.8 ? 1 : 0;                     // borda da cortina só no meio do caminho
      if (scan !== lastScan) { lastScan = scan; photo.style.setProperty('--scan', String(scan)); }
    };

    const st = ctx.st({
      trigger: card, start: 'top 75%', end: 'center 50%', scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => apply(s.progress),
      onRefresh: (s) => apply(s.progress),
    });
    apply(st ? st.progress : 1);                                      // estado inicial coerente com a posição atual

    return () => {
      photo.style.removeProperty('--c');
      photo.style.removeProperty('--scan');
    };
  },
});
