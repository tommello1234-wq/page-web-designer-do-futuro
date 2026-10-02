/* showcase.js — §4.6 "Galeria que liga ao chegar".
   Modos (ramificados só por ctx.flags):
   · 'h'    desktop com pin (motion && pin && desk): palco pinado (≤ 2,2 telas), trilho horizontal por scrub, parallax interno,
            card ativo = centro na faixa 35–65% (histerese 30–70%), build-line com a máscara-miniatura;
   · 'snap' mobile: scroll-snap nativo (zero pins), ativo = IO root=trilho threshold .6, autoplay só do ativo e só com flags.autoplay
            (rendition -m.mp4 via data-src-m), build-line acompanha scrollLeft;
   · 'grid' desktop sem pin (estático / janela baixa): grade 2 colunas; com movimento, ativo = card no meio da tela.
   Máx. 1 vídeo tocando na seção (grupo 'showcase' + pausa do anterior antes de tocar o próximo).
   HTML = estado final; tudo que o JS muda é desfeito no cleanup (rebuild / ?wdf-fail). */
const WDF = window.WDF;

WDF.register('showcase', {
  init(ctx, root) {
    const F = ctx.flags, d = document, w = window;
    const $ = (s) => root.querySelector(s);
    const stage = $('.sc-stage'), track = $('.sc-track'), intro = $('.sc-intro'), outro = $('.sc-outro'), line = $('.sc-line');
    const rail = $('.sc-rail'), fill = $('.sc-fill'), mask = $('.sc-mask'), lblA = $('.sc-l-a'), lblB = $('.sc-l-b');
    if (!stage || !track) return undefined;
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const orig = { a: lblA.textContent, b: lblB.textContent };

    const cards = [...root.querySelectorAll('.sc-card')].map((el, i) => ({
      el, i, n: String(i + 1).padStart(2, '0'),
      media: el.querySelector('.sc-media'), v: el.querySelector('video'), live: el.querySelector('.sc-live'),
      open: el.querySelector('.sc-open'), toggle: el.querySelector('.vid-toggle'), ctl: null,
    }));
    const total = String(cards.length).padStart(2, '0');

    const mode = F.motion && F.pin ? 'h' : F.mobile ? 'snap' : 'grid';   // celular também trava e anda na horizontal (pedido do dono)
    const armed = F.motion;                       // assinatura visual (cinza → cor, rótulos)
    const auto = F.motion && F.autoplay;          // tocar sozinho ao chegar

    /* ---------- restauração do estado final (registrada ANTES dos lazyVideo: roda DEPOIS do destroy deles) ---------- */
    ctx.cleanup(() => {
      cards.forEach((c) => {
        c.el.classList.remove('is-live', 'is-on');
        c.live.textContent = ''; delete c.live.dataset.state;
        c.media.classList.remove('is-playing');
        c.media.style.removeProperty('--px');
        c.open.hidden = true;
        if (c.toggle) {
          c.toggle.hidden = true; c.toggle.classList.remove('is-on');
          c.toggle.setAttribute('aria-label', 'Reproduzir vídeo');
          const u = c.toggle.querySelector('use'); if (u) u.setAttribute('href', '#i-play');
        }
        if (c.v.getAttribute('src')) {
          try { c.v.pause(); } catch (e) { /* noop */ }
          c.v.removeAttribute('src'); c.v.preload = 'none';
          try { c.v.load(); } catch (e) { /* noop */ }
        }
      });
      root.classList.remove('is-armed', 'is-h');
      lblA.textContent = orig.a; lblB.textContent = orig.b;
      fill.style.transform = ''; mask.style.transform = ''; track.style.transform = '';
      if (intro.parentNode !== stage || outro.parentNode !== stage) {
        stage.insertBefore(intro, track);
        stage.insertBefore(outro, line);
      }
    });
    if (armed) root.classList.add('is-armed');

    /* ---------- vídeos ---------- */
    let cur = -1, dlgOpen = false;
    const setLabel = (c, state) => {
      if (!armed && state === 'wait') return;
      if (state === 'on') { c.live.textContent = 'EM EXIBIÇÃO'; c.live.dataset.state = 'on'; }
      else if (state === 'wait') { c.live.textContent = 'LIGANDO…'; c.live.dataset.state = 'wait'; }
      else { c.live.textContent = ''; delete c.live.dataset.state; }
    };
    cards.forEach((c) => {
      c.ctl = ctx.media.lazyVideo(c.v, {
        group: 'showcase',
        auto: mode !== 'snap',                     // mobile: nada carrega por proximidade (só o ativo, no play)
        margin: mode === 'h' ? '100% 50%' : '100% 0px',
      });
      ctx.on(c.v, 'playing', () => { setLabel(c, 'on'); c.el.classList.add('is-on'); });
      ctx.on(c.v, 'pause', () => { setLabel(c, ''); c.el.classList.remove('is-on'); });
    });

    function activate(c) {
      if (armed) c.el.classList.add('is-live');
      if (!auto || dlgOpen || c.ctl.userPaused) return;
      if (!c.v.paused) { setLabel(c, 'on'); return; }
      setLabel(c, 'wait');
      c.ctl.play().then((ok) => { if (!ok && c.v.paused) setLabel(c, ''); });
    }
    function deactivate(c) {
      c.el.classList.remove('is-live');
      if (!c.v.paused) c.ctl.pause();
      else if (c.live.dataset.state === 'wait') setLabel(c, '');
    }
    // celular com pin: os cards andam em pares empilhados (0-1, 2-3…) e o par visível toca junto
    const pair = (i) => (mode === 'h' && F.mobile && i >= 0 ? (i % 2 ? i - 1 : (i + 1 < cards.length ? i + 1 : -1)) : -1);
    function setActive(i) {
      if (i === cur) return;
      const prev = [cur, pair(cur)].filter((k) => k >= 0 && k !== i && k !== pair(i));
      cur = i;
      prev.forEach((k) => deactivate(cards[k]));   // pausa ANTES de tocar o próximo
      if (i >= 0) {
        activate(cards[i]);
        if (pair(i) >= 0) activate(cards[pair(i)]);
        lblA.textContent = 'PROJETO ' + cards[i].n;
        lblB.textContent = cards[i].n + ' / ' + total;
      }
    }
    /* um salto (goTo com cortina) suspende o play: retoma no fim */
    const offJump = ctx.bus.on('jump:end', () => { const c = cards[cur]; if (c && auto && c.v.paused && !c.ctl.userPaused && !dlgOpen) activate(c); });
    ctx.cleanup(offJump);
    ctx.cleanup(() => { cur = -1; });

    /* ---------- lightbox (clique/Enter no card) ---------- */
    cards.forEach((c) => {
      c.open.hidden = false;
      ctx.on(c.open, 'click', () => {
        const v = d.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.autoplay = true;
        v.setAttribute('playsinline', ''); v.width = 1280; v.height = 720;
        v.setAttribute('aria-label', c.v.getAttribute('aria-label') || ('Projeto ' + c.n));
        v.src = (F.mobile && c.v.getAttribute('data-src-m')) || c.v.getAttribute('data-src');
        dlgOpen = true;
        cards.forEach((k) => { if (!k.v.paused) k.ctl.pause(); });
        ctx.dialog.open({
          node: v, label: 'Projeto ' + c.n,
          onClose: () => { dlgOpen = false; const a = cards[cur]; if (a) { a.el.classList.remove('is-live'); const i = cur; cur = -1; setActive(i); } },
        });
      });
    });
    ctx.cleanup(() => { if (dlgOpen) { dlgOpen = false; ctx.dialog.close(); } });

    /* ---------- build-line: escrita direta (transform) ---------- */
    let railW = 0;
    const measureRail = () => { railW = rail.clientWidth; };
    const drawLine = (p) => {
      const half = F.mobile ? 18 : 24;
      fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      /* o capacete acompanha a ponta do preenchimento, sem invadir os rótulos das pontas */
      const mx = Math.max(-half * 0.4, Math.min(railW - half * 1.6, p * railW - half));
      mask.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,0,0)';
    };

    /* =============================== modo H: galeria horizontal pinada =============================== */
    if (mode === 'h') {
      root.classList.add('is-h');
      // a intro (título e subtítulo) fica FIXA no topo do palco e só as páginas andam: ao chegar a pessoa já vê
      // o texto e as primeiras páginas inteiras (pedido do dono — antes a intro era o 1º painel do trilho)
      track.appendChild(outro);
      /* celular: posição explícita na grade de 2 linhas (o auto-placement do Safari empilhava abertura e fechamento na 1ª coluna) */
      const placed = [outro, ...cards.map((c) => c.el)];
      if (F.mobile) {
        cards.forEach((c, i) => { c.el.style.gridArea = (1 + (i % 2)) + ' / ' + (1 + Math.floor(i / 2)); });
        const oc = 1 + Math.ceil(cards.length / 2);
        outro.style.gridArea = '1 / ' + oc + ' / 3 / ' + (oc + 1);
      }
      ctx.cleanup(() => { placed.forEach((el) => el.style.removeProperty('grid-area')); stage.style.removeProperty('--sc-intro-h'); });

      const geo = { D: 0, W: w.innerWidth, centers: [], lefts: [], outroL: 0 };
      const S = { p: 0, lastP: -1 };
      const measure = () => {
        // o tamanho das páginas depende da altura que sobra abaixo da intro (CSS: --sc-intro-h)
        stage.style.setProperty('--sc-intro-h', intro.offsetHeight + 'px');
        geo.W = stage.clientWidth || w.innerWidth;
        geo.D = Math.max(1, track.offsetWidth - geo.W);
        geo.centers = cards.map((c) => c.el.offsetLeft + c.el.offsetWidth / 2);
        geo.lefts = cards.map((c) => c.el.offsetLeft);
        geo.outroL = outro.offsetLeft;
        measureRail();
        S.lastP = -1;
      };
      measure();
      const pinLen = () => Math.max(1, Math.round(Math.min(geo.D * 0.75, w.innerHeight * 2.2)));   // teto 2,2 telas
      const st = ctx.st({
        trigger: root, start: 'top top', end: () => { measure(); return '+=' + pinLen(); },
        pin: stage, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => { S.p = s.progress; },
      });
      S.p = st.progress || 0;
      ctx.onRefresh(() => { measure(); S.p = st.progress || 0; });

      /* outro chega pela lateral: o reveal do texto dispara quando ele passa de 80% da largura (não pela posição vertical) */
      const outP = outro.querySelector('[data-reveal]');
      if (outP) ctx.reveal.lines(outP, { start: () => st.start + clamp01((geo.outroL - geo.W * 0.8) / geo.D) * (st.end - st.start) });

      ctx.tick(stage, () => {
        const p = S.p;
        const x = -p * geo.D;
        if (p !== S.lastP) {
          S.lastP = p;
          track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
          drawLine(p);
          for (let i = 0; i < cards.length; i++) {
            const off = (geo.centers[i] + x) / geo.W - 0.5;
            if (off > -1.2 && off < 1.2) cards[i].media.style.setProperty('--px', (Math.max(-0.85, Math.min(0.85, off)) * -6).toFixed(2));
          }
        }
        /* portão vertical: a galeria só "liga" com o palco praticamente na tela */
        const y = w.scrollY, H = w.innerHeight;
        const inView = y >= st.start - H * 0.3 && y <= st.end + H * 0.3;
        let best = -1;
        if (inView) {
          let bd = 1;
          for (let i = 0; i < cards.length; i++) {
            const dd = Math.abs((geo.centers[i] + x) / geo.W - 0.5);
            if (dd <= 0.15 && dd < bd) { bd = dd; best = i; }
          }
          if (best < 0 && cur >= 0 && Math.abs((geo.centers[cur] + x) / geo.W - 0.5) <= 0.2) best = cur;   // histerese
          /* pré-carga (metadados) do próximo card que chega pela direita: a ≤ meia tela */
          for (let i = 0; i < cards.length; i++) {
            const l = geo.lefts[i] + x;
            if (!cards[i].ctl.loaded && l < geo.W * 1.5 && l > -geo.W) cards[i].ctl.load('metadata');
          }
        }
        setActive(best);
      }, 0.5);

      /* foco: o palco é overflow:clip (o navegador não rola sozinho) → a página rola até o card focado ficar centrado */
      ctx.on(track, 'focusin', (e) => {
        const card = e.target.closest && e.target.closest('.sc-card');
        let p;
        if (card) { const i = cards.findIndex((c) => c.el === card); p = clamp01((geo.centers[i] - geo.W / 2) / geo.D); }
        else if (outro.contains(e.target)) p = 1;
        else return;
        const target = Math.round(st.start + p * (st.end - st.start));
        if (Math.abs(w.scrollY - target) > 2) ctx.goTo(target, { focus: false, duration: 0.9 });
      });

      return () => { setActive(-1); };
    }

    /* =============================== modo SNAP (mobile) =============================== */
    if (mode === 'snap') {
      cards.forEach((c) => c.ctl.showToggle());   // sem hover no toque: ❚❚/▶ sempre à mão (WCAG 2.2.2)
      measureRail();
      ctx.on(w, 'resize', measureRail, { passive: true });
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const max = track.scrollWidth - track.clientWidth;
          drawLine(max > 0 ? clamp01(track.scrollLeft / max) : 0);
        });
      };
      ctx.on(track, 'scroll', onScroll, { passive: true });
      ctx.cleanup(() => cancelAnimationFrame(raf));
      onScroll();

      if ('IntersectionObserver' in w) {
        const ratios = new Map();
        let trackVis = false;
        const pick = () => {
          let best = -1, br = 0.6 - 1e-3;
          cards.forEach((c, i) => { const r = ratios.get(c.el) || 0; if (r >= br) { br = r; best = i; } });
          if (best >= 0) { lblA.textContent = 'PROJETO ' + cards[best].n; lblB.textContent = cards[best].n + ' / ' + total; }
          setActive(trackVis ? best : -1);
        };
        const io = new IntersectionObserver((es) => { es.forEach((e) => ratios.set(e.target, e.intersectionRatio)); pick(); },
          { root: track, threshold: [0, 0.3, 0.6, 0.8, 1] });
        cards.forEach((c) => io.observe(c.el));
        const vis = new IntersectionObserver((es) => { trackVis = es[es.length - 1].isIntersecting; pick(); }, { threshold: 0.5 });
        vis.observe(track);
        ctx.cleanup(() => { io.disconnect(); vis.disconnect(); });
      }
      return () => { setActive(-1); };
    }

    /* =============================== modo GRID (desktop sem pin) =============================== */
    if (F.motion) {
      cards.forEach((c, i) => {
        ctx.st({
          trigger: c.el, start: 'top 62%', end: 'bottom 38%',
          onToggle: (s) => { if (s.isActive) setActive(i); else if (cur === i) setActive(-1); },
        });
      });
    }
    return () => { setActive(-1); };
  },
});
