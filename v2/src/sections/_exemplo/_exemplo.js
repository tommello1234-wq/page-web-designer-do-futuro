/* _exemplo.js — referência do contrato de seção (§6.4). Cada arquivo de seção roda numa IIFE; só window.WDF é global.
   Regras demonstradas: DOM gerado → desfeito no cleanup; estado inicial só em is-motion (o HTML é o estado final);
   pin síncrono no init (desktop) / sticky nativo (mobile); trabalho por frame num ctx.tick; escritas de estilo por
   frame com style.setProperty + ctx.cleanup (gsap.set a cada frame encheria o contexto); override de tema escopado;
   frames do motor compartilhado; vídeo preguiçoso; diálogo; listeners só via ctx.on. */
const WDF = window.WDF;

/* ---------------- A · flame ---------------- */
WDF.register('_exemplo', {
  init(ctx, root) {
    const $ = (s) => root.querySelector(s);
    const track = $('.ex-track'), stage = $('.ex-stage'), canvas = $('.ex-canvas'), still = $('.ex-still');
    const nEl = $('.ex-n'), val = $('.ex-val'), hint = $('.ex-hint');
    const eyes = [...root.querySelectorAll('.ex-eye')];
    const orig = { n: nEl.textContent, val: val.textContent };

    /* (1) DOM gerado por JS é desfeito no cleanup (o init precisa ser idempotente após revert) */
    const slots = [0, 1, 2, 3].map(() => $('.ex-slots').appendChild(document.createElement('i')));
    ctx.cleanup(() => slots.forEach((s) => s.remove()));

    /* (2) modo estático (reduced/FX off) ou sem pin (celular deitado): o HTML/CSS já é o estado final */
    if (!ctx.flags.motion || !ctx.flags.pin) return;

    const clamp01 = ctx.gsap.utils.clamp(0, 1);
    const S = { p: 0, dirty: true };
    const onUpdate = (s) => { S.p = s.progress; S.dirty = true; };

    /* (3) pin SÍNCRONO no init no desktop; no mobile, sticky nativo + sensor (zero pins < 900px) */
    if (ctx.flags.desk) {
      ctx.st({ trigger: track, start: 'top top', end: '+=150%', pin: stage, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate });
    } else {
      root.classList.add('is-sticky');
      ctx.cleanup(() => root.classList.remove('is-sticky'));
      ctx.st({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true, onUpdate });
    }

    /* (3b) timeline scrubada: ctx.scrubTl = ease 'none' + scrub:true (curva do trecho aplicada no próprio tween).
       A figura sai no fim (.86 → 1) como no hero; transform do GSAP compõe com o translate individual do CSS. */
    const fig = $('.ex-fig');
    ctx.scrubTl(ctx.flags.desk ? { trigger: track, start: 'top top', end: '+=150%' } : { trigger: track, start: 'top top', end: 'bottom bottom' })
      .to(fig, { yPercent: -4, scale: .97, ease: 'power1.in', duration: .14 }, .86)
      .set({}, {}, 1);

    /* (4) frames: renderer do motor compartilhado (destruído sozinho no revert) */
    const r = ctx.frames.renderer(canvas, { anchor: 'bottom' });

    /* (5) geometria medida no refresh (olhos no frame-space → px do palco) */
    const geo = { rmax: 0, thr: 0, hud: 0 };
    function measure() {
      const sr = stage.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
      const c = r.point(452, 354);
      const ex = cr.left - sr.left + c.x, ey = cr.top - sr.top + c.y;
      const W = stage.clientWidth, H = stage.clientHeight;
      geo.rmax = Math.hypot(Math.max(ex, W - ex), Math.max(ey, H - ey)) * 1.02;
      geo.thr = Math.hypot(W / 2 - ex, 60 - ey);                      // raio que alcança a linha da nav
      geo.hud = Math.max(Math.hypot(ex, H - ey), Math.hypot(W - ex, H - ey));   // HUD só vira branco com os cantos de baixo já em ink
      stage.style.setProperty('--ex', ex.toFixed(1) + 'px');
      stage.style.setProperty('--ey', ey.toFixed(1) + 'px');
      [[385, 352], [520, 352]].forEach(([fx, fy], i) => {
        const pt = r.point(fx, fy);
        eyes[i].style.setProperty('--x', pt.x.toFixed(1) + 'px');
        eyes[i].style.setProperty('--y', pt.y.toFixed(1) + 'px');
      });
      S.dirty = true;
    }
    measure();
    ctx.onRefresh(measure);

    /* (6) todo o trabalho por frame num ctx.tick (só roda com o palco a ≤ .25 viewport) */
    let lastN = -1, lastPhase = '', ink = null, hudInk = null;
    const PHASES = ['DESIGNER · MODO ESTÁTICO', 'ACOPLANDO AGENTES DE IA', 'EXPERIÊNCIA IMERSIVA · ONLINE', 'PROTOCOLO FUTURO · ATIVO'];
    ctx.tick(stage, () => {
      if (!S.dirty) return;
      S.dirty = false;
      const p = S.p;
      const f = 42 + clamp01(p / .7) * 93;
      const exact = r.draw(f);
      if (!exact) S.dirty = true;                                      // ainda decodificando: tenta de novo no próximo frame
      still.style.visibility = Math.round(f) !== 42 && r.current != null && r.current !== 42 ? 'hidden' : '';
      hint.style.opacity = (1 - clamp01(p / .05)).toFixed(3);

      const n = [.15, .3, .45, .6].filter((t) => p >= t).length;
      if (n !== lastN) {
        lastN = n;
        nEl.textContent = n + '/4';
        slots.forEach((s, i) => { s.classList.toggle('is-on', i < n); s.classList.toggle('is-active', i === n && n > 0 && n < 4); });
      }
      const phase = PHASES[p < .15 ? 0 : p < .45 ? 1 : p < .6 ? 2 : 3];
      if (phase !== lastPhase) { lastPhase = phase; val.textContent = phase; }

      const rad = Math.pow(clamp01((p - .45) / .4), 3) * geo.rmax;   // easeInCubic calculado (timeline scrubada é linear)
      stage.style.setProperty('--r', rad.toFixed(1) + 'px');
      const isInk = rad > 0 && rad >= geo.thr;
      if (isInk !== ink) {
        ink = isInk;
        ctx.theme.override(isInk ? 'ink' : null);                      // escopado: só vale enquanto esta seção é a ativa
      }
      const h = rad > 0 && rad >= geo.hud;
      if (h !== hudInk) { hudInk = h; stage.classList.toggle('is-ink', h); }   // UI 11px nunca branca sobre flame
      const e = clamp01((p - .38) / .08);
      eyes.forEach((el) => { el.style.opacity = (e * .8).toFixed(3); });
    }, .25);

    /* (7) cleanup das escritas por frame (revert/isolamento deixam a raiz sem estilo residual) */
    return () => {
      ['--r', '--ex', '--ey'].forEach((k) => stage.style.removeProperty(k));
      stage.classList.remove('is-ink');
      still.style.visibility = ''; hint.style.opacity = '';
      eyes.forEach((el) => { el.style.opacity = ''; el.style.removeProperty('--x'); el.style.removeProperty('--y'); });
      nEl.textContent = orig.n; val.textContent = orig.val;
    };
  },
});

/* ---------------- B · paper (#preco): vídeo preguiçoso + diálogo ---------------- */
WDF.register('_exemplo-b', {
  init(ctx, root) {
    const fig = root.querySelector('.exb-media'), v = root.querySelector('video'), live = root.querySelector('.exb-live');
    /* auto:false = sem pré-carga por proximidade (src só no play). O padrão (auto) seta src + preload=metadata a ≤ 1 viewport
       (§7.2 T4); o Chrome então CANCELA o resto do range após ler os metadados, e o shoot.mjs lista isso como
       "net::ERR_ABORTED …mp4" em failedRequests — é esperado, não é erro. */
    const ctl = ctx.media.lazyVideo(v, { group: 'exemplo', auto: false });
    const setLive = (t, on) => { live.textContent = t; fig.classList.toggle('is-live', !!on); };
    ctx.on(v, 'playing', () => setLive('EM EXIBIÇÃO ●', true));
    ctx.on(v, 'pause', () => setLive('', false));
    ctx.cleanup(() => setLive('', false));
    if (ctx.flags.motion && ctx.flags.autoplay) {
      ctx.st({
        trigger: fig, start: 'top 70%', end: 'bottom 30%',
        onToggle: (s) => {
          if (s.isActive && !ctl.userPaused) { setLive('LIGANDO…', false); ctl.play().then((ok) => { if (!ok) setLive('', false); }); }
          else if (!s.isActive) ctl.pause();
        },
      });
    }
    const btn = root.querySelector('.exb-print');
    ctx.on(btn, 'click', () => {
      const img = new Image();
      img.width = +btn.dataset.w; img.height = +btn.dataset.h; img.decoding = 'async';
      img.alt = 'Print original da conversa 01 no WhatsApp';
      img.src = btn.dataset.print;                                     // só carrega no clique
      ctx.dialog.open({ node: img, label: 'Print original da conversa 01' });
    });
  },
});

/* ---------------- C · ink: marquee reativo à velocidade (ctx.tick + ctx.velocity) ---------------- */
WDF.register('_exemplo-c', {
  init(ctx, root) {
    /* altura muda ao abrir/fechar → refresh com debounce (vale também no estático: sensores de tema) */
    let tm = 0;
    root.querySelectorAll('details').forEach((dt) => ctx.on(dt, 'toggle', () => { clearTimeout(tm); tm = setTimeout(() => WDF.refresh(), 600); }));
    ctx.cleanup(() => clearTimeout(tm));

    if (!ctx.flags.motion) return;                                     // estático: faixa parada quebrando linha (CSS)
    const box = root.querySelector('.exc-marquee'), track = root.querySelector('.exc-track');
    let x = 0, half = 0;
    const measure = () => { half = track.scrollWidth / 2; };
    measure(); ctx.onRefresh(measure);
    ctx.tick(box, (t, dt) => {
      const v = ctx.velocity();
      x -= (1.2 + Math.abs(v) * .25) * (v < 0 ? -1 : 1) * dt * 60;
      if (half) { if (x <= -half) x += half; else if (x > 0) x -= half; }
      const skew = Math.max(-12, Math.min(12, -v * .4));
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
    }, .5);
    ctx.cleanup(() => { track.style.transform = ''; });
  },
});
