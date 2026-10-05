/* solucao.js — §4.3 assinatura "A edição".
   Sensor ctx.st({trigger:.so-body, start:'top 65%', end:'bottom 45%'}); limiares UMA vez, por classe + transição CSS:
     p > .15 → .is-struck (risco) · p > .28 → .is-selected (caixa de seleção) · p > .45 → .is-checked (checks) · p > .55 → .is-paid (notificações de Pix).
   O HTML já traz as três classes (estado final): sem JS, em modo estático e com o init falho tudo aparece pronto.
   Em is-motion o init remove só as que ainda não foram alcançadas (sem transição) e o cleanup devolve as três.
   Uma vez aplicada, a classe nunca sai (nem ao rolar para cima, nem num rebuild: `shown` sobrevive ao revert). */
const WDF = window.WDF;
const STEPS = [['is-struck', .15], ['is-selected', .28], ['is-checked', .45], ['is-paid', .55]];
const GAP = .22;              // respiro mínimo entre dois atos quando um salto cruza vários limiares de uma vez
const shown = new Set();      // classes já exibidas nesta visita (sobrevive a rebuilds: FX, breakpoint, reduced)

WDF.register('solucao', {
  init(ctx, root) {
    const body = root.querySelector('.so-body');
    if (!body) return undefined;
    const final = () => { body.classList.remove('is-quiet'); STEPS.forEach(([c]) => body.classList.add(c)); };
    ctx.cleanup(final);
    if (!ctx.flags.motion) { final(); return undefined; }          // estático: estado final, sem sensor

    /* progresso atual medido na geometria (independe de o ScrollTrigger já ter feito refresh) */
    const progressNow = () => {
      const r = body.getBoundingClientRect(), vh = window.innerHeight || 1;
      return (vh * .65 - r.top) / Math.max(1, r.height + vh * .2);
    };

    /* estado inicial: some só o que ainda não foi alcançado nem exibido; sem transição (nada se "desfaz" à vista) */
    const p0 = progressNow();
    body.classList.add('is-quiet');
    STEPS.forEach(([c, t]) => {
      if (p0 > t) shown.add(c);
      if (!shown.has(c)) body.classList.remove(c);
    });
    void body.offsetWidth;                                            // confirma o estado sem transição antes de religá-las
    body.classList.remove('is-quiet');

    /* atos em sequência: se um salto cruza vários limiares no mesmo quadro, cada ato espera GAP pelo anterior */
    let nextAt = 0, calls = [];
    const G = ctx.gsap;
    function apply(p) {
      STEPS.forEach(([c, t]) => {
        if (p <= t || shown.has(c)) return;
        shown.add(c);
        const now = G.ticker.time, at = Math.max(now, nextAt);
        nextAt = at + GAP;
        if (at - now < .01 || WDF.state.jumping) { body.classList.add(c); return; }
        ctx.later(() => { calls.push(G.delayedCall(at - now, () => body.classList.add(c))); });
      });
    }

    ctx.st({
      trigger: body, start: 'top 65%', end: 'bottom 45%',
      onUpdate: (s) => apply(s.progress),
      onLeave: () => apply(1),
      onRefresh: (s) => { if (s.progress > 0) apply(s.progress); },
    });
    return () => { calls.forEach((dc) => dc.kill()); calls = []; };
  },
});
