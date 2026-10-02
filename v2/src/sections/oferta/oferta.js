/* oferta.js — "Doca de Ativação" (§4.10). Sem pin: a coluna flame é sticky por CSS (desktop).
   O HTML é o estado FINAL; aqui, só em is-motion (e com flags.pin), o init monta o estado de partida (AGUARDANDO 0/4,
   itens soltos, total oculto, régua e riscados zerados, olhos apagados) SE o gatilho correspondente ainda não passou,
   e o cleanup devolve tudo ao HTML. Gatilhos:
     desktop  frames 42→135 scrub (item 1 → item 4 a 55%) · cada item acopla a 55% (reversível) · total one-shot no 4º
     mobile   frames pela própria Doca (top 80% → bottom 40%), contador a .2/.4/.6/.8 · itens a 85% (once)
     ambos    ignição a [data-offer-block=price] top 70% (once): olhos, anéis, PRONTO, offer:revealed e odômetro.
   Salto longo/hash (WDF.state.jumping) ⇒ tudo vai direto ao estado final, sem animar. */
const WDF = window.WDF;

/* sobrevivem a rebuilds (FX, 900px, reduced): o total e a ignição são one-shot na visita */
let everTotal = false;

WDF.register('oferta', {
  init(ctx, root) {
    const G = ctx.gsap;
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const O = ctx.offer;

    const dock = $('.of-dock'), status = $('.of-status'), nEl = $('.of-n');
    const canvas = $('.of-canvas'), still = $('.of-still'), rings = $('.of-rings');
    const eyes = $$('.of-eye');
    const items = $$('.of-item');
    const itemStrikes = items.map((li) => li.querySelector('del'));
    const total = $('[data-sum]'), rule = $('.of-rule'), fromStrike = $('.of-from del');
    const price = $('[data-offer-block="price"]'), val = $('.price-val'), cta = $('a[data-checkout="oferta"]');

    /* soma honesta: Σ itens = âncora; senão o total fica no HTML estático, sem animar */
    const sums = O.items.reduce((a, it) => (a.push((a[a.length - 1] || 0) + it.value), a), []);
    const sumOk = sums[sums.length - 1] === O.anchor && items.length === O.items.length;
    if (!sumOk) console.error('[WDF] oferta: Σ itens (' + sums[sums.length - 1] + ') ≠ âncora (' + O.anchor + ')');

    /* estático (reduced/FX off) e sem pin (landscape baixo): composição final do HTML; reveals do core seguem valendo */
    if (!ctx.flags.motion || !ctx.flags.pin) return;

    const desk = ctx.flags.desk, DURS = ctx.DUR;
    let initing = true, revealPassedAtInit = false;
    const orig = { status: status.textContent, n: nEl.textContent, total: total.textContent };
    const PHASE = { wait: 'AGUARDANDO', dock: 'ACOPLANDO', ready: orig.status };
    const jumping = () => WDF.state.jumping;
    const passed = (st) => { if (!st) return false; try { return st.scroll() >= st.start - 1; } catch (e) { return false; } };

    /* ---------------- contador da âncora: do "De R$ 997" até a parcela (pedido do dono) ----------------
       Visual aria-hidden montado JÁ no valor final; o leitor de tela lê só o valor final. */
    const valText = val.textContent;
    const num = (t) => parseFloat(String(t).replace(/[^\d,]/g, '').replace(',', '.'));
    const toV = num(valText), fromV = num(fromStrike && fromStrike.textContent);
    const fmtV = (v) => v.toFixed(2).replace('.', ',');
    const odo = document.createElement('span');
    odo.className = 'of-count'; odo.setAttribute('aria-hidden', 'true'); odo.textContent = valText;
    const sr = document.createElement('span');
    sr.className = 'visually-hidden'; sr.textContent = valText;
    val.textContent = '';
    val.append(sr, odo);
    ctx.cleanup(() => { val.textContent = valText; });

    /* ---------------- estado ---------------- */
    const docked = items.map(() => true);
    let revealed = WDF.state.offerRevealed, lit = true, p = 1, dirty = true, frameN = 4;

    const count = () => (desk ? docked.filter(Boolean).length : frameN);
    function paintStatus() {
      const n = count();
      nEl.textContent = String(n);
      const ready = revealed && n === 4;
      status.textContent = ready ? PHASE.ready : n === 0 ? PHASE.wait : PHASE.dock;
      status.classList.toggle('is-ready', ready);
      setLit(ready);
    }
    function setLit(on, instant) {
      if (on === lit) return;
      lit = on;
      ctx.later(() => G.to(eyes, { opacity: on ? .75 : 0, scale: on ? 1 : .6, duration: instant || jumping() ? 0 : DURS.m, ease: on ? 'wdf.out' : 'wdf.inout', overwrite: true }));
    }

    ctx.cleanup(() => {
      status.textContent = orig.status; status.classList.add('is-ready');
      nEl.textContent = orig.n; total.textContent = orig.total;
      items.forEach((li) => li.classList.add('is-docked'));
      still.style.visibility = '';
    });

    /* ---------------- acoplamento de item ---------------- */
    function dockItem(i, on) {
      if (docked[i] === on) return;
      docked[i] = on;
      items[i].classList.toggle('is-docked', on);
      ctx.later(() => G.to(itemStrikes[i], { '--strike': on ? 1 : 0, duration: jumping() ? 0 : on ? .6 : DURS.s, ease: 'wdf.inout', delay: on && !jumping() ? .15 : 0, overwrite: true }));
      if (desk) paintStatus();
      if (on && i === items.length - 1) showTotal();
    }

    /* ---------------- total: aparece só com 4/4 e conta em degraus (one-shot) ---------------- */
    function showTotal() {
      if (everTotal) return;
      everTotal = true;
      ctx.later(() => {
        const tl = G.timeline();
        tl.to(total, { clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: 'wdf.inout' }, 0);
        if (sumOk) {
          const o = { v: 0 };
          total.textContent = ctx.fmt.brl(sums[0], 0);
          tl.to(o, {
            v: 1, duration: 1.2, ease: 'power3.out',
            onUpdate: () => { total.textContent = ctx.fmt.brl(sums[Math.min(sums.length - 1, Math.floor(o.v * sums.length))], 0); },
            onComplete: () => { total.textContent = orig.total; },
          }, 0);
        }
        tl.to(rule, { scaleX: 1, duration: 1.1, ease: 'wdf.inout' }, 1.2);
        tl.to(fromStrike, { '--strike': 1, duration: .8, ease: 'wdf.inout' }, 1.5);
        if (jumping()) tl.progress(1);
      });
    }

    /* ---------------- ignição ---------------- */
    function ignite() {
      const first = !WDF.state.offerRevealed;
      revealed = true;
      ctx.bus.emit('offer:revealed');
      const instant = jumping() || !first || initing || revealPassedAtInit;
      status.classList.add('is-ready');
      paintStatus();
      if (instant || count() !== 4) return;
      ctx.later(() => {
        G.killTweensOf(eyes);
        G.fromTo(eyes, { scale: 0, opacity: 0 }, {
          keyframes: [{ scale: 1.3, opacity: 1, duration: .5, ease: 'wdf.out' }, { scale: 1, opacity: .75, duration: .7, ease: 'wdf.inout' }],
        });
        G.fromTo(rings, { scale: 1 }, { keyframes: [{ scale: 1.04, duration: .45, ease: 'wdf.out' }, { scale: 1, duration: .75, ease: 'wdf.inout' }] });
        if (fromV > toV) {
          // começa no valor de referência e despenca até a parcela: a âncora acontece na frente da pessoa
          const o = { v: fromV };
          odo.textContent = fmtV(fromV);
          G.to(o, {
            v: toV, duration: 2, ease: 'power3.out', overwrite: true,
            onUpdate: () => { odo.textContent = fmtV(o.v); },
            onComplete: () => { odo.textContent = valText; },
          });
        }
      });
    }

    /* ---------------- gatilhos ---------------- */
    const itemSt = items.map((li, i) => ctx.st(desk
      ? { trigger: li, start: 'top 55%', onEnter: () => dockItem(i, true), onLeaveBack: () => dockItem(i, false) }
      : { trigger: li, start: 'top 85%', once: true, onEnter: () => dockItem(i, true) }));

    const onScrub = (s) => { p = s.progress; dirty = true; };
    const scrub = ctx.st(desk
      ? { trigger: items[0], start: 'top 55%', endTrigger: items[items.length - 1], end: 'top 55%', scrub: true, onUpdate: onScrub, onRefresh: onScrub }
      : { trigger: dock, start: 'top 80%', end: 'bottom 40%', scrub: true, onUpdate: onScrub, onRefresh: onScrub });

    const revealSt = ctx.st({ trigger: price, start: 'top 70%', once: true, onEnter: ignite });

    /* ---------------- estado de partida: só o que ainda não passou ---------------- */
    p = scrub.progress;
    if (desk) items.forEach((li, i) => { if (!passed(itemSt[i])) { docked[i] = false; li.classList.remove('is-docked'); G.set(itemStrikes[i], { '--strike': 0 }); } });
    else {
      items.forEach((li, i) => { if (!passed(itemSt[i])) { docked[i] = false; li.classList.remove('is-docked'); G.set(itemStrikes[i], { '--strike': 0 }); } });
      frameN = [.2, .4, .6, .8].filter((t) => p >= t).length;
    }
    const lastPassed = passed(itemSt[items.length - 1]);
    if (!everTotal && !lastPassed && sumOk) {
      G.set(total, { clipPath: 'inset(0% 100% 0% 0%)' });
      G.set(rule, { scaleX: 0, transformOrigin: '0% 50%' });
      G.set(fromStrike, { '--strike': 0 });
    } else if (lastPassed) everTotal = true;
    revealPassedAtInit = passed(revealSt);
    if (revealPassedAtInit) revealed = true;
    if (!revealed || count() !== 4) { lit = false; G.set(eyes, { opacity: 0, scale: .6 }); }
    paintStatus();

    /* ---------------- frames (motor compartilhado): desenho só com a Doca por perto ---------------- */
    const r = ctx.frames.renderer(canvas, { anchor: 'bottom' });
    const clamp01 = G.utils.clamp(0, 1);
    ctx.tick(dock, () => {
      if (!dirty) return;
      dirty = false;
      const pp = clamp01(p);
      if (!desk) {
        const n = [.2, .4, .6, .8].filter((t) => pp >= t).length;
        if (n !== frameN) { frameN = n; paintStatus(); }
      }
      const exact = r.draw(42 + pp * 93);
      if (!exact) dirty = true;                                     // ainda decodificando: tenta de novo no próximo frame
      if (r.current != null && still.style.visibility !== 'hidden') still.style.visibility = 'hidden';
    });

    /* hover no CTA (ponteiro fino): os olhos acendem um pouco mais */
    if (ctx.flags.fine && cta) {
      ctx.on(cta, 'pointerenter', () => { if (lit) ctx.later(() => G.to(eyes, { opacity: 1, duration: DURS.m, overwrite: 'auto' })); });
      ctx.on(cta, 'pointerleave', () => { if (lit) ctx.later(() => G.to(eyes, { opacity: .75, duration: DURS.m, overwrite: 'auto' })); });
    }
    initing = false;
  },
});
