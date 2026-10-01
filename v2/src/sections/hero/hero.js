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

    const PHASES = ['DESIGNER · MODO ESTÁTICO', 'ACOPLANDO AGENTES DE IA', 'EXPERIÊNCIA IMERSIVA · ONLINE', 'PROTOCOLO FUTURO · ATIVO'];
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
    const setExits = () => { exits = [...left.children, ...(right && right.parentNode === stage ? right.children : [])]; };
    setExits();
    ctx.onRefresh(setExits);
    let lastP = -1, lastF = -1, override = null;
    const easeInCubic = (t) => t * t * t;

    ctx.tick(stage, (time, dt) => {
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
      const ov = r >= thr ? 'ink' : null;
      if (ov !== override) { override = ov; ctx.theme.override(ov); }

      // saída .86 → 1 + parallax
      const q = seg(p, .86, 1);
      const par = sx * (1 - seg(p, 0, .2));
      const y = -q * H * .04, sc = 1 - .03 * q;
      fig.style.transform = `perspective(1200px) translate3d(${(par * 1.2).toFixed(3)}%, ${y.toFixed(1)}px, 0) rotateY(${(par * 2).toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      typeB.style.transform = q ? `translate3d(0, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})` : '';
      arcs.style.transform = par ? `translate3d(${(par * .6).toFixed(3)}%, 0, 0)` : '';
      hud.style.opacity = q ? String(1 - q) : '';
    });

    return () => {
      [fig, typeB, arcs, hud, hint, still, ...left.children, ...(right ? right.children : []), ...eyes].forEach((el) => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
      stage.style.removeProperty('--r');
    };
  },
});
