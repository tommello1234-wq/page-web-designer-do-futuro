/* core/preloader.js — "CHECAGEM DE SISTEMA" (§5.1). Só no desktop orgânico (html.pre-skip nos demais casos).
   Progresso REAL: alvo = .3·fontes + .4·frame 42 decodificado + .3·(1º lote de frames baixado / N); o número persegue o
   alvo (v += (alvo·100 − v)·.18 por tick), sem piso. A fase de conteúdo termina com alvo ≥ 1, 800ms após o boot ou no
   último instante que ainda cabe no teto. Saída: SISTEMA PRONTO → 100ms → conteúdo some (.25s) + pálpebra (.6s wdf.inout);
   'preloader:done' no INÍCIO da pálpebra (o core destrava o Lenis); no fim remove o nó. Teto: nó removido ≤ 1500ms desde
   navigationStart (setTimeout próprio em try/finally, que também emite 'preloader:done' se ainda não emitiu). */
const WDF = window.WDF, core = WDF.core, w = window, d = document, html = d.documentElement;

const CAP = 1470;            // ms desde navigationStart: nó removido até aqui
const HOLD = 100;            // SISTEMA PRONTO parado antes da pálpebra
const LID = 600;             // pálpebra (ms)
const CONTENT_MAX = 800;     // fase de conteúdo desde o boot

WDF.layer('preloader', {
  boot() {
    const pre = d.querySelector('.preloader');
    if (!pre) return;
    if (!core.claimPreloader()) {
      /* pre-skip: o CSS já o esconde (display:none). Sem GSAP (vendors falharam): some agora, nunca espera o fail-safe. */
      if (!html.classList.contains('pre-skip')) pre.remove();
      return;
    }
    pre.style.animation = 'none';                  // o JS assume: zera o fail-safe CSS e arma o próprio teto
    const G = core.G;
    const $ = (s) => pre.querySelector(s);
    const num = $('.pre-num'), bar = $('.pre-bar i'), status = $('.pre-status'), content = $('.pre-content');
    const items = [...pre.querySelectorAll('.pre-checks li')];
    const lids = [$('.pre-lid--t'), $('.pre-lid--b')];
    const t0 = core.now();

    /* ---------- fontes do progresso ---------- */
    const P = { fonts: 0, f42: 0 };
    const fr = WDF.debug.frames();
    const framesOn = fr.mode !== 'off' && fr.mode !== 'stills';
    const N = framesOn ? (fr.batch || 12) : 1;
    const fontsP = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    fontsP.then(() => { P.fonts = 1; }, () => { P.fonts = 1; });
    if (framesOn) WDF.frames.whenFirst().then(() => { P.f42 = 1; }, () => { P.f42 = 1; });
    else {
      const still = [...d.querySelectorAll('img')].find((im) => /frame_0042\.webp/.test(im.getAttribute('src') || ''));
      if (still && typeof still.decode === 'function') still.decode().then(() => { P.f42 = 1; }, () => { P.f42 = 1; });
      else P.f42 = 1;
    }
    const target = () => .3 * P.fonts + .4 * P.f42 + .3 * (framesOn ? Math.min(1, WDF.frames.loadedCount(N) / N) : 1);

    /* ---------- sem rolar por baixo do overlay (Lenis ainda não existe antes do 1º build) ---------- */
    const KEYS = /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/;
    const block = (e) => { if (e.type !== 'keydown' || KEYS.test(e.key)) e.preventDefault(); };
    const blockOpts = { passive: false, capture: true };
    ['wheel', 'touchmove', 'keydown'].forEach((t) => w.addEventListener(t, block, blockOpts));
    const unblock = () => ['wheel', 'touchmove', 'keydown'].forEach((t) => w.removeEventListener(t, block, blockOpts));

    /* ---------- desenho ---------- */
    let v = 0, shown = -1, phase = 'content', emitted = false, removed = false, lit = 0;
    function paint(val) {
      const n = Math.max(0, Math.min(100, Math.round(val)));
      if (n === shown) return;
      shown = n;
      num.textContent = String(n).padStart(3, '0');
      bar.style.transform = 'scaleX(' + (n / 100).toFixed(3) + ')';
      const on = items.filter((_, i) => val > (i + 1) * 18).length;
      if (on !== lit) { lit = on; items.forEach((li, i) => li.classList.toggle('is-on', i < on)); }
    }
    function emitDone() {
      if (emitted) return;
      emitted = true;
      unblock();
      WDF.bus.emit('preloader:done', { skipped: false });
    }
    function finish() {
      if (removed) return;
      removed = true;
      try {
        G && G.ticker.remove(tick);
        clearTimeout(capTimer);
        if (anim) anim.kill();
        pre.remove();
        core.mark('preloaderRemoved');
        core.store.set('session', 'wdf-pre', '1');
      } finally {
        emitDone();                                // nunca: overlay escondido com o Lenis parado
        if (WDF.lenis && !core.locked()) WDF.lenis.start();
        WDF.refresh();
      }
    }
    let anim = null;
    function exit() {
      if (phase !== 'content') return;
      phase = 'exit';
      v = 100; paint(100);
      items.forEach((li) => li.classList.add('is-on'));
      status.textContent = 'SISTEMA PRONTO';
      status.classList.add('is-ready');
      /* a pálpebra encolhe se o boot atrasou, para caber no teto */
      const left = CAP - core.now() - HOLD - 40;
      const lid = Math.max(.3, Math.min(LID, left)) / 1000;
      anim = G.timeline({ delay: HOLD / 1000, onStart: emitDone, onComplete: finish })
        .to(content, { opacity: 0, duration: .25, ease: 'none' }, 0)
        .to(lids[0], { yPercent: -100, duration: lid, ease: 'wdf.inout' }, 0)
        .to(lids[1], { yPercent: 100, duration: lid, ease: 'wdf.inout' }, 0);
    }
    function tick() {
      if (phase !== 'content') return;
      const a = target();
      v += (a * 100 - v) * .18;
      paint(v);
      const now = core.now();
      if (a >= 1 || now - t0 >= CONTENT_MAX || now >= CAP - LID - HOLD - 60) exit();
    }
    const capTimer = setTimeout(finish, Math.max(0, CAP - core.now()));
    G.ticker.add(tick);
  },
});
