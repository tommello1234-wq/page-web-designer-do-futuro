/* depoimentos.js — §4.5 · assinatura "Marquee reativo" (ctx.tick + ctx.velocity, só em is-motion).
   O HTML já é o estado final: conversas completas, contador em 100% (o core anima data-count e devolve o texto original),
   marquee parado quebrando linha no estático / sem JS / init falho (CSS). Prints só carregam no clique (diálogo do core). */
const WDF = window.WDF;

WDF.register('depoimentos', {
  init(ctx, root) {
    /* ---- VER PRINT ORIGINAL ↗ → diálogo do core (ESC, botão e fundo fecham; o foco volta ao botão) ---- */
    root.querySelectorAll('.thread-print').forEach((btn) => {
      ctx.on(btn, 'click', () => {
        const n = btn.dataset.n || '';
        const img = new Image();
        img.width = +btn.dataset.w; img.height = +btn.dataset.h; img.decoding = 'async';
        img.alt = 'Print original da conversa ' + n + ' no WhatsApp';
        img.src = btn.dataset.print;                                    // só carrega aqui
        try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); }   // Safari não foca botão no clique
        ctx.dialog.open({ node: img, label: 'Print original da conversa ' + n });
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
