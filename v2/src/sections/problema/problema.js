/* problema.js — assinatura "10 segundos" (§4.2).
   O HTML é o estado FINAL (site montado, 10,0 s, 4 ✓). Com movimento + pin o JS monta o palco:
     desktop  → pin +=140% no .p10-stage (ctx.scrubTl) + zoom-through para paper + override de tema escopado
     mobile   → sticky nativo da máquina (.p10-track 110svh) + sensor alinhado ao sticky; sem zoom
     estático → (reduced / FX off / sem pin) só gera a grade de 24 cópias da composição estática.
   Todo o trabalho por frame é função pura de p, num ctx.tick, com escritas mínimas (cache) e restauração no cleanup.
   Cortes secos = visibility por limiar (sem easing); trechos contínuos com easeInOutCubic calculado. */
const WDF = window.WDF;

WDF.register('problema', {
  init(ctx, root) {
    const $ = (s) => root.querySelector(s);
    const p10 = $('.p10'), stage = $('.p10-stage'), track = $('.p10-track'), machine = $('.p10-machine');
    const timer = $('.p10-timer'), browser = $('.p10-browser'), cursor = $('.p10-cursor');
    const grid = $('.p10-grid'), count = $('.p10-count'), sel = $('.p10-select'), zoom = $('.p10-zoom');
    const blocks = ['.g-head', '.g-hero', '.g-cards', '.g-foot'].map($);
    const status = [...root.querySelectorAll('.p10-status li')];
    if (!p10 || !stage || !machine || !grid) return undefined;

    const F = ctx.flags;
    const mode = F.motion && F.pin ? (F.desk ? 'pin' : 'sticky') : 'static';
    const N = mode === 'sticky' ? 16 : 24;

    /* grade de cópias (DOM gerado → removido no cleanup; o init é idempotente) */
    const frag = document.createDocumentFragment();
    const cells = Array.from({ length: N }, () => {
      const c = document.createElement('i');
      c.className = 'p10-mini';
      frag.appendChild(c);
      return c;
    });
    grid.appendChild(frag);
    ctx.cleanup(() => cells.forEach((c) => c.remove()));

    if (mode === 'static') return undefined;          // composição estática: grade visível, sem seleção/zoom

    const timerNode = timer.firstChild;
    const orig = { timer: timerNode.nodeValue, count: count.innerHTML };
    root.classList.add(mode === 'pin' ? 'is-pinned' : 'is-sticky');

    /* ---------- parâmetros da timeline (§4.2) ---------- */
    const BUILT = [.12, .24, .36, .48];                  // header · hero · 3 cards · footer (corte seco)
    const FLIP = [.48, .035];                            // browser encolhe para a célula 1
    const COPY0 = .48, COPY_STEP = .10 / (N - 1);        // células 2..N em corte seco
    const EVAP0 = .58, EVAP_W = .04, EVAP_END = .70;     // 23 (ou 15) células evaporam, ordem fixa seed 7
    const SEL = [.70, .03];                              // moldura --ai da sobrevivente
    const live = root.querySelector('.p10-live');        // a página real em ação (vídeo 07), só depois de renderizar
    const liveCtl = live ? ctx.media.lazyVideo(live, { group: 'problema', auto: false }) : null;
    let liveOn = false, livePre = false;
    const REAL = [.75, .13];                             // a sobrevivente vira a PÁGINA REAL (AERIS X); .88 → 1 segura
    const SURV = mode === 'pin' ? 13 : 9;                // célula 14 (6×4) · célula 10 (4×4)

    const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    /* ordem de evaporação: embaralhamento determinístico (mulberry32, seed 7) */
    const rand = (() => { let a = 7; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
    const order = cells.map((_, i) => i).filter((i) => i !== SURV);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const evStart = new Array(N).fill(2);
    const evStep = (EVAP_END - EVAP_W - EVAP0) / Math.max(1, order.length - 1);
    order.forEach((cell, rank) => { evStart[cell] = EVAP0 + rank * evStep; });

    /* ---------- geometria (medida no refresh; offset* ignora transforms já aplicados) ---------- */
    const geo = { dx: 0, dy: 0, sx: 1, sy: 1, cur: [], sel: null, tx: 0, ty: 0, S: 1 };
    function offIn(el, anc) {
      let x = 0, y = 0;
      for (let n = el; n && n !== anc; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x, y };
    }
    function measure() {
      const b = offIn(browser, machine), bw = browser.offsetWidth, bh = browser.offsetHeight;
      const c0 = cells[0], c0p = offIn(c0, machine);
      geo.dx = c0p.x - b.x; geo.dy = c0p.y - b.y;
      geo.sx = bw ? c0.offsetWidth / bw : 1; geo.sy = bh ? c0.offsetHeight / bh : 1;
      /* cursor: centro de cada bloco (em % do browser) */
      geo.cur = blocks.map((el) => {
        const o = offIn(el, browser);
        return [((o.x + el.offsetWidth * .5) / bw * 100).toFixed(2) + '%', ((o.y + el.offsetHeight * .5) / bh * 100).toFixed(2) + '%'];
      });
      const s = cells[SURV], sp = offIn(s, machine);
      geo.sel = { x: sp.x, y: sp.y, w: s.offsetWidth, h: s.offsetHeight };
      sel.style.width = geo.sel.w + 'px'; sel.style.height = geo.sel.h + 'px';
      /* página real: plano no rect do browser; parte do rect da sobrevivente (transform-origin 0 0) */
      zoom.style.left = b.x + 'px'; zoom.style.top = b.y + 'px';
      zoom.style.width = bw + 'px'; zoom.style.height = bh + 'px';
      geo.r0 = { tx: sp.x - b.x, ty: sp.y - b.y, sx: bw ? geo.sel.w / bw : 1, sy: bh ? geo.sel.h / bh : 1 };
      L = {};                                           // força reescrita completa
      S.dirty = true;
    }

    /* ---------- render(p): escritas mínimas com cache ---------- */
    let L = {};
    const cellL = cells.map(() => ({ v: null, t: -1 }));
    const pad2 = (n) => (n < 10 ? '0' : '') + n;
    /* explícito nos dois sentidos: células, moldura e zoom nascem ocultos pelo CSS do modo palco */
    function vis(el, on) { el.style.visibility = on ? 'visible' : 'hidden'; }

    function render(p) {
      /* 0 → .60: cronômetro (vírgula decimal pt-BR) */
      const secs = Math.min(10, (p / BUILT[3]) * 10);
      const t = secs.toFixed(1).replace('.', ',').padStart(4, '0');
      if (t !== L.t) { L.t = t; timerNode.nodeValue = t; }

      /* blocos e status em corte seco */
      let built = 0; for (const th of BUILT) if (p >= th) built++;
      if (built !== L.built) {
        L.built = built;
        blocks.forEach((el, i) => vis(el, i < built));
        status.forEach((li, i) => li.classList.toggle('is-off', i >= built));
      }
      /* cursor salta para o bloco que está "montando"; some quando o site fica pronto */
      const cur = p >= BUILT[3] ? -1 : built;
      if (cur !== L.cur) {
        L.cur = cur;
        vis(cursor, cur >= 0);
        if (cur >= 0 && geo.cur[cur]) { cursor.style.left = geo.cur[cur][0]; cursor.style.top = geo.cur[cur][1]; }
      }

      /* .60 → .635: FLIP do browser para a célula 1 */
      const e = ease(clamp01((p - FLIP[0]) / FLIP[1]));
      if (e !== L.e) {
        L.e = e;
        browser.style.transform = e <= 0 ? '' : 'translate(' + (geo.dx * e).toFixed(2) + 'px,' + (geo.dy * e).toFixed(2) + 'px) scale('
          + (1 + (geo.sx - 1) * e).toFixed(4) + ',' + (1 + (geo.sy - 1) * e).toFixed(4) + ')';
        vis(browser, e < 1);
        browser.style.opacity = e < 1 ? '' : '0';     // os blocos têm visibility explícita: a opacidade esconde o conteúdo junto
      }

      /* cópias (corte seco) e evaporação (.74 → .88) */
      let shown = 0;
      for (let i = 0; i < N; i++) {
        const on = i === 0 ? p >= FLIP[0] + FLIP[1] : p >= COPY0 + i * COPY_STEP;
        if (on) shown++;
        const c = cellL[i], el = cells[i];
        if (on !== c.v) { c.v = on; vis(el, on); }
        const k = i === SURV ? 0 : ease(clamp01((p - evStart[i]) / EVAP_W));
        if (k !== c.t) {
          c.t = k;
          if (k <= 0) { el.style.opacity = ''; el.style.transform = ''; }
          else { el.style.opacity = (1 - k).toFixed(3); el.style.transform = 'translateY(' + (-12 * k).toFixed(2) + 'px) scale(' + (1 - .04 * k).toFixed(4) + ')'; }
        }
      }
      if (e < 1) shown++;                               // o próprio browser (ainda encolhendo) é a cópia 01

      /* legenda: contagem → EVAPORANDO → some (a etiqueta 1 DE 1 fala) */
      const phase = p < COPY0 ? 0 : p < EVAP0 ? 1 : p < SEL[0] ? 2 : 3;
      const label = phase === 1 ? 'CÓPIAS IDÊNTICAS <b>' + pad2(Math.max(1, shown)) + '</b> → ' + N : phase === 2 ? 'EVAPORANDO' : '';
      if (label !== L.label) { L.label = label; if (label) count.innerHTML = label; vis(count, !!label); }

      /* .88 → .94: moldura da sobrevivente (entra encolhendo, easeOut) */
      const s = p >= SEL[0] ? easeOut(clamp01((p - SEL[0]) / SEL[1])) : -1;
      const selOn = s >= 0 && p < REAL[0];
      if ((s !== L.s || selOn !== L.selOn) && geo.sel) {
        L.s = s; L.selOn = selOn;
        vis(sel, selOn);
        sel.style.transform = 'translate(' + geo.sel.x + 'px,' + geo.sel.y + 'px) scale(' + (1 + .35 * (1 - Math.max(0, s))).toFixed(4) + ')';
      }

      /* baixa o vídeo da página real cedo (20% da sequência): na 1ª visita ele só começava a baixar na hora de tocar e engasgava */
      if (liveCtl && !livePre && p >= .2) { livePre = true; liveCtl.load('auto'); }
      /* .75 → .88: a sobrevivente cresce até o browser e a página real renderiza de cima para baixo */
      const r = p >= REAL[0] ? clamp01((p - REAL[0]) / REAL[1]) : -1;
      if (r !== L.r && geo.r0) {
        L.r = r;
        vis(zoom, r >= 0);
        if (r >= 0) {
          const g = ease(clamp01(r / .6)), w = easeOut(clamp01((r - .25) / .75)), R0 = geo.r0;
          zoom.style.transform = 'translate(' + (R0.tx * (1 - g)).toFixed(2) + 'px,' + (R0.ty * (1 - g)).toFixed(2) + 'px) scale('
            + (R0.sx + (1 - R0.sx) * g).toFixed(4) + ',' + (R0.sy + (1 - R0.sy) * g).toFixed(4) + ')';
          zoom.style.setProperty('--wipe', ((1 - w) * 100).toFixed(2) + '%');
          zoom.style.setProperty('--scan-o', w > 0 && w < 1 ? '1' : '0');
        }
        const wantLive = r >= 1;
        if (liveCtl && wantLive !== liveOn) {
          liveOn = wantLive;
          if (wantLive) { liveCtl.load(); liveCtl.play(); } else liveCtl.pause();
        }
      }
    }

    /* ---------- trigger (pin síncrono no desktop; sensor alinhado ao sticky no mobile) ---------- */
    const S = { p: 0, dirty: true };
    let theme = null;
    const setTheme = (p) => {
      const th = null;                                  // termina na página real (sem zoom-through para paper)
      if (th !== theme) { theme = th; ctx.theme.override(th); }
    };
    const onUpdate = (self) => { S.p = self.progress; S.dirty = true; setTheme(S.p); };

    let tl;
    if (mode === 'pin') {
      tl = ctx.scrubTl({ trigger: p10, start: 'top top', end: '+=170%', pin: stage, anticipatePin: 1, invalidateOnRefresh: true, onUpdate });
    } else {
      const sticky = { top: 0, h: 0 };
      const m = () => { sticky.top = parseFloat(getComputedStyle(machine).top) || 0; sticky.h = machine.offsetHeight; };
      tl = ctx.scrubTl({
        trigger: track, invalidateOnRefresh: true, onUpdate,
        start: () => { m(); return 'top top+=' + sticky.top; },
        end: () => 'bottom top+=' + (sticky.top + sticky.h),
      });
    }

    measure();
    ctx.onRefresh(measure);
    S.p = tl && tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
    setTheme(S.p);
    render(S.p); S.dirty = false;

    ctx.tick(mode === 'pin' ? stage : machine, () => {
      if (!S.dirty) return;
      S.dirty = false;
      render(S.p);
    }, .5);

    /* cleanup: a raiz volta exatamente ao HTML (estado final) */
    return () => {
      root.classList.remove('is-pinned', 'is-sticky');
      timerNode.nodeValue = orig.timer;
      count.innerHTML = orig.count; count.style.visibility = '';
      blocks.forEach((el) => { el.style.visibility = ''; });
      status.forEach((li) => li.classList.remove('is-off'));
      ['visibility', 'left', 'top'].forEach((k) => cursor.style.removeProperty(k));
      browser.style.transform = ''; browser.style.visibility = ''; browser.style.opacity = '';
      ['visibility', 'transform', 'width', 'height'].forEach((k) => sel.style.removeProperty(k));
      ['visibility', 'transform', 'width', 'height', 'left', 'top', '--wipe', '--scan-o'].forEach((k) => zoom.style.removeProperty(k));
    };
  },
});
