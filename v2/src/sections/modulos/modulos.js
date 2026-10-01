/* modulos.js — §4.7 "Sumário vivo" (sem pin).
   Desktop + motion: cada card liga a linha correspondente do sumário (.is-on) enquanto atravessa o meio da tela.
   Ponteiro fino + motion: tilt ±6deg + glare por CSS vars, realce cruzado card ↔ sumário, clique no sumário leva ao card.
   Mobile (qualquer modo): contador 0N / 06 pelo card mais visível do trilho (IO root = trilho, threshold .6).
   Estático: nada disso além do contador; HTML/CSS já é o estado final. Reveal das capas = data-reveal="media" (core). */
const WDF = window.WDF;

WDF.register('modulos', {
  init(ctx, root) {
    const grid = root.querySelector('.md-grid');
    const cards = [...root.querySelectorAll('.md-card')];
    const lines = [...root.querySelectorAll('.md-index li')];
    const dots = root.querySelector('.md-dots');
    const lineOf = (card) => lines.find((li) => li.dataset.i === card.dataset.i) || null;
    const dotsText = dots ? dots.textContent : '';

    ctx.cleanup(() => {
      if (dots) dots.textContent = dotsText;
      lines.forEach((li) => li.classList.remove('is-on', 'is-hot'));
      cards.forEach((c) => c.classList.remove('is-hot'));
      grid.classList.remove('is-dim');
    });

    /* ---- mobile com movimento: a seção trava e a rolagem vertical anda com as capas na horizontal (pedido do dono) ---- */
    const wrap = root.querySelector('.md-wrap');
    if (ctx.flags.mobile && ctx.flags.motion && ctx.flags.pin && wrap) {
      root.classList.add('is-hm');
      ctx.cleanup(() => { root.classList.remove('is-hm'); grid.style.transform = ''; });
      let D = 0, p = 0, lastP = -1, shown = '';
      const measure = () => { D = Math.max(0, grid.scrollWidth - wrap.clientWidth); lastP = -1; };
      measure();
      ctx.st({
        trigger: wrap, start: 'top top', end: () => { measure(); return '+=' + Math.max(1, Math.round(D * 1.1)); },
        pin: wrap, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (st) => { p = st.progress; },
      });
      ctx.onRefresh(measure);
      ctx.tick(wrap, () => {
        if (p === lastP) return;
        lastP = p;
        grid.style.transform = 'translate3d(' + (-p * D).toFixed(1) + 'px,0,0)';
        if (dots) {
          const t = String(Math.min(cards.length, Math.round(p * (cards.length - 1)) + 1)).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
          if (t !== shown) { shown = t; dots.textContent = t; }
        }
      });
      return;
    }

    /* ---- mobile: contador do trilho (informação de posição, vale também no modo estático) ---- */
    if (ctx.flags.mobile && dots && 'IntersectionObserver' in window) {
      const ratio = new Map();
      let shown = '';
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => ratio.set(e.target, e.isIntersecting && e.intersectionRatio >= .6 ? e.intersectionRatio : 0));
        let best = null, br = 0;
        ratio.forEach((r, el) => { if (r > br) { br = r; best = el; } });
        if (!best) return;
        const t = String(best.dataset.i).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
        if (t !== shown) { shown = t; dots.textContent = t; }
      }, { root: grid, threshold: [0, .6, 1] });
      cards.forEach((c) => io.observe(c));
      ctx.cleanup(() => io.disconnect());
    }

    if (!ctx.flags.motion || ctx.flags.mobile) return;   // estático: sumário sem .is-on, sem tilt; mobile: sumário oculto

    /* ---- assinatura: sumário vivo ---- */
    cards.forEach((card) => {
      const li = lineOf(card);
      if (!li) return;
      ctx.st({ trigger: card, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => li.classList.toggle('is-on', s.isActive) });
    });

    if (!ctx.flags.fine) return;

    /* ---- tilt + glare + realce cruzado (ponteiro fino) ---- */
    root.classList.add('is-tilt');
    ctx.cleanup(() => root.classList.remove('is-tilt'));

    const MAX = 6;
    cards.forEach((card) => {
      const cover = card.querySelector('.md-cover');
      const li = lineOf(card);
      let rect = null;
      const reset = () => { ['--rx', '--ry', '--gx'].forEach((k) => cover.style.removeProperty(k)); };
      ctx.cleanup(reset);

      ctx.on(cover, 'pointerenter', () => { rect = cover.getBoundingClientRect(); });
      ctx.on(cover, 'pointermove', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        if (!rect) rect = cover.getBoundingClientRect();
        const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        cover.style.setProperty('--ry', ((nx - .5) * 2 * MAX).toFixed(2) + 'deg');
        cover.style.setProperty('--rx', ((.5 - ny) * 2 * MAX).toFixed(2) + 'deg');
        cover.style.setProperty('--gx', (nx * 100).toFixed(1) + '%');
      });
      ctx.on(cover, 'pointerleave', () => { rect = null; reset(); });

      ctx.on(card, 'pointerenter', () => { card.classList.add('is-hot'); if (li) li.classList.add('is-hot'); });
      ctx.on(card, 'pointerleave', () => { card.classList.remove('is-hot'); if (li) li.classList.remove('is-hot'); });

      if (!li) return;
      ctx.on(li, 'pointerenter', () => { grid.classList.add('is-dim'); card.classList.add('is-hot'); li.classList.add('is-hot'); });
      ctx.on(li, 'pointerleave', () => { grid.classList.remove('is-dim'); card.classList.remove('is-hot'); li.classList.remove('is-hot'); });
      ctx.on(li, 'click', () => {
        const h = card.getBoundingClientRect().height;
        ctx.goTo(card, { focus: false, offset: Math.max(0, (innerHeight - h) / 2) });
      });
    });
  },
});
