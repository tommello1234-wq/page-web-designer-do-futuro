/* depoimentos.js — §4.5 · assinatura "Marquee reativo" (ctx.tick + ctx.velocity, só em is-motion).
   O HTML já é o estado final: prints originais e transcrições acessíveis, contador em 100% (o core anima data-count e devolve o texto original),
   marquee parado quebrando linha no estático / sem JS / init falho (CSS). */
const WDF = window.WDF;

WDF.register('depoimentos', {
  init(ctx, root) {
    /* Ampliar o print usando o diálogo existente; sem JS, o link abre a imagem original. */
    root.querySelectorAll('.dp-print').forEach((link) => {
      ctx.on(link, 'click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const source = link.querySelector('img');
        if (!source || !WDF.core.dialog) return;
        const image = source.cloneNode();
        image.loading = 'eager';
        if (WDF.core.dialog.open({ node: image, label: link.getAttribute('aria-label') })) event.preventDefault();
      });
    });

    /* ---- modo estático: faixa parada (CSS); nada de loop ---- */
    if (!ctx.flags.motion) return;

    const box = root.querySelector('.dp-marquee'), track = root.querySelector('.mq-track');
    const set = track && track.querySelector('.mq-set');
    if (!box || !set) return;

    let mx = 0, half = 0, last = '';
    const measure = () => { half = track.scrollWidth / 2; if (half && mx <= -half) mx %= half; };
    measure();
    ctx.onRefresh(measure);

    /* mx -= (1.2 + |v|·.25) · sign  (px por quadro a 60 fps; sign = -1 rolando para cima) — wrap em metade do scrollWidth */
    ctx.tick(box, (t, dt) => {
      const v = ctx.velocity() || 0;
      mx -= (1.2 + Math.abs(v) * .25) * (v < 0 ? -1 : 1) * dt * 60;
      if (half) { while (mx <= -half) mx += half; while (mx > 0) mx -= half; }
      const skew = Math.max(-12, Math.min(12, -v * .4));
      const s = 'translate3d(' + mx.toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      if (s !== last) { last = s; track.style.transform = s; }
    }, .5);

    return () => { track.style.transform = ''; };
  },
});
