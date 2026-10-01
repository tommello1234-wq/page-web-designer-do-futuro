/* HERO #inicio — "Ativação + Íris" (§4.1). Um tick escreve tudo a partir de p (progresso do scrub). */
WDF.register('hero', {
  init(ctx, root) {
    const { gsap, flags } = ctx;
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const stage = $('.hero-stage'), track = $('.hero-track'), fig = $('.hero-fig');
    const canvas = $('.hero-canvas'), still = $('.hero-still'), arcs = $('.hero-arcs');
    const typeB = $('.hero-type--b'), eyes = $$('.hero-eye');
    const hud = $('.hero-hud'), hudVal = $('.hud-val'), hudN = $('.hud-n'), slots = $$('.hud-slots i'), hint = $('.hud-hint');
    const left = $('.hero-left'), right = $('.hero-right'), slot = $('.hero-more-slot');
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (p, a, b) => clamp((p - a) / (b - a));

    /* ── layout side | stack (só desktop) ── */
    function layout() {
      if (flags.mobile) { root.dataset.layout = 'mobile'; return; }
      const W = innerWidth, H = innerHeight;
      const padX = clamp(W * .03, 20, 44), figH = Math.min(H * .84, 800), figW = figH * 1.0417;
      const sideW = Math.min(380, W / 2 - padX - .42 * figW - 24);
      root.dataset.layout = sideW < 260 || W / H <= 1.45 ? 'stack' : 'side';
    }
    layout();

    /* ── FUTURO em gradiente contínuo (v1): cada letra recorta a mesma faixa do gradiente da palavra ── */
    const fut = $('.hero-type--a .hero-futuro');
    const paintGrad = () => {
      if (!fut) return;
      fut.style.setProperty('--fw', fut.offsetWidth + 'px');
      fut.style.setProperty('--fh', fut.offsetHeight + 'px');
      [...fut.children].forEach((s) => s.style.setProperty('--fx', (s.offsetLeft - fut.offsetLeft) + 'px'));
    };
    paintGrad();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintGrad);
    ctx.on(window, 'resize', paintGrad);
    ctx.cleanup(() => { if (fut) { ['--fw', '--fh'].forEach((k) => fut.style.removeProperty(k)); [...fut.children].forEach((s) => s.style.removeProperty('--fx')); } });

    /* ── partículas da v1 (mesma configuração do tsParticles original, em canvas próprio e leve):
       pontos laranja/roxo/rosa, ligações roxas até 150px, linhas laranja até o cursor (200px),
       paralaxe leve e 4 pontos novos a cada clique ── */
    const pcv = $('.hero-particles');
    const PT = pcv && pcv.getContext ? (() => {
      const c2 = pcv.getContext('2d');
      const COLORS = ['#FF6600', '#6100B7', '#CB3395'];
      const rnd = (a, b) => a + Math.random() * (b - a);
      let W = 0, H = 0, dpr = 1, mx = -1e4, my = -1e4, ox = 0, oy = 0;
      const list = [];
      const mk = (x, y) => ({ x: x == null ? rnd(0, W) : x, y: y == null ? rnd(0, H) : y, vx: rnd(-.8, .8), vy: rnd(-.8, .8),
        r: rnd(1, 3), c: COLORS[(Math.random() * 3) | 0], o: rnd(.1, .5), od: (Math.random() < .5 ? -1 : 1) * rnd(.004, .01) });
      const size = () => {
        W = stage.clientWidth; H = stage.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 2);
        pcv.width = Math.round(W * dpr); pcv.height = Math.round(H * dpr);
        const n = Math.round(Math.min(90, Math.max(28, (W * H) / 14000)));
        while (list.length < n) list.push(mk());
        if (list.length > n + 40) list.length = n + 40;
      };
      const draw = (dt, still) => {
        const k = still ? 0 : Math.min(3, dt * 60);
        if (!still) { ox += (((mx > -1e3 ? mx / W : .5) - .5) * -60 - ox) / 10; oy += (((my > -1e3 ? my / H : .5) - .5) * -60 - oy) / 10; }
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        c2.clearRect(0, 0, W, H);
        for (const q of list) {
          q.x += q.vx * k; q.y += q.vy * k;
          if (q.x < 0 || q.x > W) { q.vx *= -1; q.x = Math.max(0, Math.min(W, q.x)); }
          if (q.y < 0 || q.y > H) { q.vy *= -1; q.y = Math.max(0, Math.min(H, q.y)); }
          q.o += q.od * k; if (q.o > .5 || q.o < .1) { q.od *= -1; q.o = Math.max(.1, Math.min(.5, q.o)); }
          q.dx = q.x + ox * q.r / 3; q.dy = q.y + oy * q.r / 3;
        }
        c2.lineWidth = 1;
        for (let i = 0; i < list.length; i++) {
          const a = list[i];
          for (let j = i + 1; j < list.length; j++) {
            const b = list[j], dx = a.dx - b.dx, dy = a.dy - b.dy, d2 = dx * dx + dy * dy;
            if (d2 < 22500) { c2.strokeStyle = 'rgba(97,0,183,' + (.2 * (1 - Math.sqrt(d2) / 150)).toFixed(3) + ')'; c2.beginPath(); c2.moveTo(a.dx, a.dy); c2.lineTo(b.dx, b.dy); c2.stroke(); }
          }
          if (mx > -1e3) {
            const dx = a.dx - mx, dy = a.dy - my, d2 = dx * dx + dy * dy;
            if (d2 < 40000) { c2.strokeStyle = 'rgba(255,102,0,' + (.5 * (1 - Math.sqrt(d2) / 200)).toFixed(3) + ')'; c2.beginPath(); c2.moveTo(a.dx, a.dy); c2.lineTo(mx, my); c2.stroke(); }
          }
        }
        for (const q of list) { c2.globalAlpha = q.o; c2.fillStyle = q.c; c2.beginPath(); c2.arc(q.dx, q.dy, q.r, 0, 6.2832); c2.fill(); }
        c2.globalAlpha = 1;
      };
      return {
        size, draw,
        push(x, y) { for (let i = 0; i < 4; i++) list.push(mk(x + rnd(-6, 6), y + rnd(-6, 6))); if (list.length > 170) list.splice(0, list.length - 170); },
        pointer(x, y) { mx = x; my = y; },
      };
    })() : null;
    if (PT) {
      PT.size();
      const rel = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      ctx.on(window, 'resize', () => { PT.size(); if (!flags.motion) PT.draw(0, true); });
      if (flags.motion) {
        if (flags.fine) {
          ctx.on(stage, 'pointermove', (e) => { const [x, y] = rel(e); PT.pointer(x, y); }, { passive: true });
          ctx.on(stage, 'pointerleave', () => PT.pointer(-1e4, -1e4));
        }
        ctx.on(stage, 'click', (e) => { if (e.target.closest('a,button')) return; const [x, y] = rel(e); PT.push(x, y); });
      } else PT.draw(0, true);                                         // estático: o campo aparece parado
    }

    const PHASES =['DESIGNER · MODO ESTÁTICO', 'ACOPLANDO AGENTES DE IA', 'EXPERIÊNCIA IMERSIVA · ONLINE', 'PROTOCOLO FUTURO · ATIVO'];
    const setPhase = (i, animate) => {
      if (root.dataset.phase === String(i)) return;
      root.dataset.phase = String(i);
      const span = document.createElement('span'); span.textContent = PHASES[i];
      const old = hudVal.firstElementChild;
      hudVal.appendChild(span);
      if (animate && old) {
        gsap.fromTo(span, { yPercent: 100 }, { yPercent: 0, duration: .45, ease: 'wdf.out' });
        gsap.to(old, { yPercent: -100, duration: .45, ease: 'wdf.out', onComplete: () => old.remove() });
      } else if (old) old.remove();
    };

    if (!flags.motion) {                               // modo estático: composição completa, frame 0042
      setPhase(0, false); hudN.textContent = '0/4';
      return;
    }

    /* ── entrada pós-preloader (só quando o preloader realmente rodou) ── */
    const preRunning = WDF.state.preloader === 'running' && !document.documentElement.classList.contains('pre-skip');
    if (preRunning) {
      const letters = $$('.hero-type--a .hero-line-in, .hero-type--a .hero-futuro > span');
      const ui = [...left.children, ...(right ? right.children : []), ...hud.children];
      gsap.set(letters, { yPercent: 110 });
      gsap.set(ui, { y: 24, opacity: 0 });
      const off = ctx.bus.on('preloader:done', () => {
        off();
        gsap.to(letters, { yPercent: 0, duration: 1.15, ease: 'wdf.out', stagger: .06 });
        gsap.to(ui, { y: 0, opacity: 1, duration: 1, ease: 'wdf.out', stagger: .06, delay: .2, clearProps: 'transform,opacity' });
      });
      ctx.cleanup(off);
    }

    /* ── frames ── */
    const R = canvas && ctx.frames.mode !== 'off' ? ctx.frames.renderer(canvas, { anchor: 'bottom' }) : null;

    /* ── geometria: olho, raio máximo, limiar da nav ── */
    let W = 0, H = 0, ex = 0, ey = 0, Rmax = 0, thr = 0;
    const PTS = [[230, 640], [670, 640], [452, 354], [452, 230]];
    function measure() {
      layout();
      W = stage.clientWidth; H = stage.clientHeight;
      if (flags.mobile) {
        // mobile (disposição da v1): a cabeça (≈11% do frame) começa logo abaixo do botão
        const textBottom = left.offsetTop + left.offsetHeight;
        const short = matchMedia('(orientation:landscape) and (max-height:560px)').matches;
        if (!short) {
          const fh = Math.max(H * .34, Math.min(H * .62, (H - textBottom - 6) / .89));
          root.style.setProperty('--fig-h', Math.round(fh) + 'px');
        } else root.style.removeProperty('--fig-h');
      }
      const fw = fig.offsetWidth, fh = fig.offsetHeight;
      const fx0 = fig.offsetLeft - fw / 2, fy0 = fig.offsetTop;
      const s = fw / 900;
      ex = fx0 + 452 * s; ey = fy0 + 354 * s;
      Rmax = Math.hypot(Math.max(ex, W - ex), Math.max(ey, H - ey)) * 1.02;
      thr = Math.hypot(ex - W / 2, ey - 36);
      stage.style.setProperty('--ex', ex.toFixed(1) + 'px');
      stage.style.setProperty('--ey', ey.toFixed(1) + 'px');
      measure.fx0 = fx0; measure.fy0 = fy0; measure.s = s;
      dirty = true;
    }
    let dirty = true;

    /* ── desktop com pin: .hero-right vai para o palco ── */
    const placeRight = () => {
      const inStage = flags.desk && flags.pin && root.dataset.layout === 'side';
      if (inStage && right.parentNode !== stage) stage.appendChild(right);
      if (!inStage && right.parentNode !== slot) slot.prepend(right);
    };
    placeRight();
    ctx.cleanup(() => { if (right.parentNode !== slot) slot.prepend(right); });

    /* ── scroll: pin (desktop) ou sticky nativo (mobile) ── */
    let p = 0;
    const onUpdate = (self) => { p = self.progress; };
    if (flags.pin && flags.desk) {
      ctx.st({ trigger: track, start: 'top top', end: '+=150%', pin: stage, scrub: true, anticipatePin: 1, onUpdate, invalidateOnRefresh: true });
    } else if (flags.pin) {
      root.classList.add('is-sticky');
      ctx.cleanup(() => root.classList.remove('is-sticky'));
      ctx.st({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate });
    }
    ctx.onRefresh(() => { measure(); placeRight(); });
    measure();

    /* ── foco dentro do palco depois da saída da UI → volta ao topo ── */
    ctx.on(stage, 'focusin', () => { if (p > .14) ctx.goTo(0); });

    /* ── parallax (ponteiro fino, desktop) ── */
    let nx = 0, sx = 0;
    if (flags.fine && flags.desk) ctx.on(window, 'pointermove', (e) => { nx = (e.clientX / innerWidth) * 2 - 1; }, { passive: true });

    /* ── agentes: ping no ponto da peça, só ao avançar ── */
    let agents = -1;
    const TH = [.12, .27, .33, .53];
    function ping(i) {
      const [fx, fy] = PTS[i];
      const d = document.createElement('i');
      d.className = 'hud-ping';
      d.style.left = (measure.fx0 + fx * measure.s) + 'px';
      d.style.top = (measure.fy0 + fy * measure.s) + 'px';
      hud.appendChild(d);
      setTimeout(() => d.remove(), 600);
    }
    function setAgents(n, fwd) {
      if (n === agents) return;
      if (fwd && agents >= 0) for (let i = agents; i < n; i++) ping(i);
      agents = n;
      root.dataset.agents = String(n);
      hudN.textContent = n + '/4';
      slots.forEach((s, i) => { s.classList.toggle('is-on', i < n); s.classList.toggle('is-act', i === n && n < 4 && p >= .12); });
    }

    // saem: .hero-left e, só quando está no palco (desktop com pin), .hero-right
    let exits = [];
    // subheadline e botão ficam na tela durante toda a ativação (pedido do dono); só o selo e o texto lateral saem
    const stays = (el) => el.matches('.hero-sub, .cta');
    const setExits = () => { exits = [...left.children, ...(right && right.parentNode === stage ? right.children : [])].filter((el) => !stays(el)); };
    setExits();
    ctx.onRefresh(setExits);
    let lastP = -1, lastF = -1, override = null;
    const easeInCubic = (t) => t * t * t;

    ctx.tick(stage, (time, dt) => {
      if (PT && (!Rmax || parseFloat(stage.style.getPropertyValue('--r') || 0) < Rmax * .98)) PT.draw(dt, false);
      sx += (nx - sx) * (1 - Math.exp(-dt * 7));
      const moving = Math.abs(nx - sx) > .001;
      if (p === lastP && !dirty && !moving && !(p >= .70 && p <= .86)) return;
      const fwd = p > lastP; lastP = p; dirty = false;

      // dica
      hint.style.opacity = String(1 - seg(p, 0, .05));

      // frames 42→135
      const f = 42 + seg(p, 0, .62) * 93;
      if (R) {
        const rf = Math.round(f);
        if (rf !== lastF) { lastF = rf; const ok = R.draw(f); if (rf !== 42 && (ok || R.current)) still.style.visibility = 'hidden'; }
        if (rf === 42) still.style.visibility = '';
      }

      // agentes e fase do HUD
      setAgents(TH.filter((t) => p >= t).length, fwd);
      setPhase(p < .12 ? 0 : p < .33 ? 1 : p < .53 ? 2 : 3, true);

      // saída da UI (.14 → .30), stagger .04
      const step = exits.length > 1 ? .08 / (exits.length - 1) : 0;
      exits.forEach((el, i) => {
        const k = seg(p, .14 + i * step, .22 + i * step);     // cada item leva .08; o último termina em .30
        if (!k && !el._wdfExit) return;                // não interfere na entrada pós-preloader
        el._wdfExit = k > 0;
        el.style.transform = k ? `translateY(${(-110 * k).toFixed(2)}%)` : '';
        el.style.opacity = k ? String(1 - k) : '';
        el.style.visibility = k >= 1 ? 'hidden' : '';
      });

      // olhos: ignição .30 → .37, respiração .70 → .86
      const k = seg(p, .30, .37);
      let eo = k < .5 ? k * 2 : 1 - .3 * ((k - .5) / .5), es = k < .5 ? 1.3 * (k / .5) : 1.3 - .3 * ((k - .5) / .5);
      if (p >= .70 && p <= .86) eo = .7 + .3 * (.5 + .5 * Math.sin(time * Math.PI * 2 / 2.4));
      eyes.forEach((el) => { el.style.opacity = eo.toFixed(3); el.style.transform = `scale(${es.toFixed(3)})`; });

      // íris .34 → .70
      const r = easeInCubic(seg(p, .34, .70)) * Rmax;
      stage.style.setProperty('--r', r.toFixed(1) + 'px');
      const ov = r >= thr ? 'flame' : null;           // íris laranja cobre a nav
      if (ov !== override) { override = ov; ctx.theme.override(ov); }

      // saída .86 → 1 + parallax
      const q = seg(p, .86, 1);
      const par = sx * (1 - seg(p, 0, .2));
      const y = -q * H * .04, sc = 1 - .03 * q;
      // a figura nunca sobe: o recorte da jaqueta tem base reta e descolaria do pé da dobra (só escala a partir da base)
      fig.style.transform = `perspective(1200px) translate3d(${(par * 1.2).toFixed(3)}%, 0, 0) rotateY(${(par * 2).toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      typeB.style.transform = q ? `translate3d(0, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})` : '';
      arcs.style.transform = par ? `translate3d(${(par * .6).toFixed(3)}%, 0, 0)` : '';
      hud.style.opacity = q ? String(1 - q) : '';
    });

    return () => {
      [fig, typeB, arcs, hud, hint, still, ...left.children, ...(right ? right.children : []), ...eyes].forEach((el) => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
      stage.style.removeProperty('--r');
      root.style.removeProperty('--fig-h');
    };
  },
});
