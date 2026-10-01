/* sections/garantia — §4.11 assinatura "Anel de 7 dias".
   O HTML/CSS já é o estado FINAL (anel cheio, texto parado). Só em is-motion o JS esvazia os 7 arcos
   (dasharray = dashoffset = L) e os enche pelo scroll: o segmento i ocupa o trecho [i/7,(i+1)/7] de p.
   Sem loop: tudo é scrub (responde nos dois sentidos) e é revertido pelo contexto da seção. */
const WDF = window.WDF;

WDF.register('garantia', {
  init(ctx, root) {
    if (!ctx.flags.motion) return;                                    // estático / reduced / FX off: anel cheio

    const gsap = ctx.gsap;
    const ring = root.querySelector('.gt-ring');
    const fills = [...root.querySelectorAll('.seg-fill')];
    const tip = root.querySelector('.gt-tip');
    const txts = [...root.querySelectorAll('.gt-txt')];
    if (!ring || fills.length !== 7) return;

    /* o GSAP reescreve o atributo transform dos elementos SVG; no revert devolvemos o original */
    const svgEls = [tip, ...txts];
    const origT = svgEls.map((el) => el.getAttribute('transform'));
    ctx.cleanup(() => svgEls.forEach((el, i) => {
      if (origT[i] == null) el.removeAttribute('transform'); else el.setAttribute('transform', origT[i]);
    }));

    const N = 7, STEP = 360 / N, SPAN = STEP - 4, TIP_END = (N - 1) * STEP + SPAN;   // 356°
    const inOut = gsap.parseEase('power1.inOut');
    /* p linear → posição da ponta: anda 47,43° por dia com a mesma curva do arco e pula o vão de 4° */
    const tipEase = (t) => {
      if (t >= 1) return 1;
      const i = Math.min(N - 1, Math.floor(t * N));
      return (i * STEP + inOut(t * N - i) * SPAN) / TIP_END;
    };

    /* estado inicial só em motion; se o gatilho já passou, o scrub renderiza p=1 no refresh (anel cheio) */
    fills.forEach((p) => {
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L + ' ' + L, strokeDashoffset: L });
    });

    const tl = ctx.scrubTl({ trigger: ring, start: 'top 70%', end: 'center center' });
    fills.forEach((p, i) => { tl.to(p, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 1 / N }, i / N); });
    tl.fromTo(tip, { rotation: 0, svgOrigin: '220 220' }, { rotation: TIP_END, svgOrigin: '220 220', ease: tipEase, duration: 1 }, 0);
    tl.fromTo(txts, { rotation: 0, svgOrigin: '220 220' }, { rotation: 90, svgOrigin: '220 220', duration: 1 }, 0);
  },
});
