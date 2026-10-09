/* depoimentos.js — §4.5 · assinatura "Marquee reativo" (ctx.tick + ctx.velocity, só em is-motion).
   O HTML já é o estado final: prints originais e transcrições acessíveis, contador em 100% (o core anima data-count e devolve o texto original),
   marquee parado quebrando linha no estático / sem JS / init falho (CSS).
   Prints: com movimento e pin (desktop e celular) viram uma fileira que anda na horizontal com o palco pinado — mesmo efeito da galeria
   de projetos (showcase.js, modo 'h'), pedido do dono 09/10. Sem isso ficam em duas colunas (uma no celular). */
const WDF = window.WDF;

/* fileira horizontal pinada: trilho por scrub, linha de progresso com a máscara-miniatura e contador "DEPOIMENTO 0n" */
function gallery(ctx, root) {
  const w = window, F = ctx.flags;
  const $ = (s) => root.querySelector(s);
  const stage = $('.dp-threads'), track = $('.dp-track'), rail = $('.dp-rail'), fill = $('.dp-fill'), mask = $('.dp-mask');
  const lblA = $('.dp-l-a'), lblB = $('.dp-l-b');
  const cards = track ? [...track.querySelectorAll('.dp-testimonial')] : [];
  if (!stage || !rail || !cards.length) return;
  const orig = { a: lblA.textContent, b: lblB.textContent };
  const total = String(cards.length).padStart(2, '0');

  root.classList.add('is-h');
  ctx.cleanup(() => {
    root.classList.remove('is-h');
    track.style.transform = ''; fill.style.transform = ''; mask.style.transform = '';
    lblA.textContent = orig.a; lblB.textContent = orig.b;
  });

  /* os prints da direita ficam fora da tela (trilho deslocado) e o lazy nativo pode não vê-los: carrega todos quando a seção chega perto */
  const eager = () => cards.forEach((c) => { const img = c.querySelector('img'); if (img && img.loading !== 'eager') img.loading = 'eager'; });
  ctx.st({ trigger: root, start: () => 'top bottom+=' + w.innerHeight, end: 'bottom top', onToggle: eager });

  const geo = { W: w.innerWidth, D: 1, centers: [], railW: 0 };
  const S = { p: 0, last: -1, cur: 0 };
  const measure = () => {
    geo.W = stage.clientWidth || w.innerWidth;
    geo.D = Math.max(1, track.offsetWidth - geo.W);
    geo.centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
    geo.railW = rail.clientWidth;
    S.last = -1;
  };
  measure();
  const pinLen = () => Math.max(1, Math.round(Math.min(geo.D * 0.75, w.innerHeight * 2.2)));   // teto 2,2 telas (como os projetos)
  const st = ctx.st({
    trigger: stage, start: 'top top', end: () => { measure(); return '+=' + pinLen(); },
    pin: stage, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate: (s) => { S.p = s.progress; },
  });
  S.p = st.progress || 0;
  ctx.onRefresh(() => { measure(); S.p = st.progress || 0; });

  const half = F.mobile ? 18 : 24;
  ctx.tick(stage, () => {
    const p = S.p;
    if (p === S.last) return;
    S.last = p;
    track.style.transform = 'translate3d(' + (-p * geo.D).toFixed(1) + 'px,0,0)';
    fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    /* o capacete acompanha a ponta do preenchimento, sem invadir os rótulos das pontas */
    const mx = Math.max(-half * 0.4, Math.min(geo.railW - half * 1.6, p * geo.railW - half));
    mask.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,0,0)';
    /* contador: o print mais perto do ponto de foco, que anda do 1º ao último junto com a rolagem */
    const last = cards.length - 1;
    const focus = geo.centers[0] + p * (geo.centers[last] - geo.centers[0]);
    let best = 0, bd = Infinity;
    for (let i = 0; i < cards.length; i++) { const dd = Math.abs(geo.centers[i] - focus); if (dd < bd) { bd = dd; best = i; } }
    if (best !== S.cur) {
      S.cur = best;
      const n = String(best + 1).padStart(2, '0');
      lblA.textContent = 'DEPOIMENTO ' + n; lblB.textContent = n + ' / ' + total;
    }
  }, 0.5);

  /* foco pelo teclado: o palco corta o que sai da tela (o navegador não rola sozinho) → a página rola até o print focado ficar no meio */
  ctx.on(track, 'focusin', (e) => {
    const i = cards.indexOf(e.target.closest && e.target.closest('.dp-testimonial'));
    if (i < 0) return;
    const p = Math.max(0, Math.min(1, (geo.centers[i] - geo.W / 2) / geo.D));
    const target = Math.round(st.start + p * (st.end - st.start));
    if (Math.abs(w.scrollY - target) > 2) ctx.goTo(target, { focus: false, duration: 0.9 });
  });
}

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

    /* ---- prints na horizontal (só com movimento e pin; sem isso ficam nas colunas do CSS) ---- */
    if (ctx.flags.motion && ctx.flags.pin) gallery(ctx, root);

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
