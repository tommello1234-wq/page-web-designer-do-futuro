/* solucao.js — §4.3 assinatura "A edição".
   Sensor ctx.st({trigger:.so-body, start:'top 65%', end:'bottom 45%'}); limiares UMA vez, por classe + transição CSS:
     p > .15 → .is-struck (risco) · p > .28 → .is-selected (caixa de seleção) · p > .45 → .is-checked (checks) · p > .55 → .is-paid (pilha de notificações de Pix; depois ela gira sozinha, ver pixStack).
   Celular (≤899px): a pilha de Pix fica ENTRE o texto e a lista, numa coluna só. Esperar os 55% do corpo inteiro deixava um
   buraco em branco do tamanho de uma tela (a lista já com os checks, o Pix só no fim): lá o 4º ato acontece quando a própria
   pilha entra na tela (PIX_MOBILE_START). No desktop nada muda.
   O HTML já traz as três classes (estado final): sem JS, em modo estático e com o init falho tudo aparece pronto.
   Em is-motion o init remove só as que ainda não foram alcançadas (sem transição) e o cleanup devolve as três.
   Uma vez aplicada, a classe nunca sai (nem ao rolar para cima, nem num rebuild: `shown` sobrevive ao revert). */
const WDF = window.WDF;
const STEPS = [['is-struck', .15], ['is-selected', .28], ['is-checked', .45], ['is-paid', .55]];
const PIX_MOBILE_START = .82;   // celular: a pilha entra quando o topo dela cruza 82% da altura da tela (como as revelações da página: 85–88%)
const GAP = .22;              // respiro mínimo entre dois atos quando um salto cruza vários limiares de uma vez
const shown = new Set();      // classes já exibidas nesta visita (sobrevive a rebuilds: FX, breakpoint, reduced)

WDF.register('solucao', {
  init(ctx, root) {
    const body = root.querySelector('.so-body');
    if (!body) return undefined;
    const final = () => { body.classList.remove('is-quiet'); STEPS.forEach(([c]) => body.classList.add(c)); };
    ctx.cleanup(final);
    if (!ctx.flags.motion) { final(); return undefined; }          // estático: estado final, sem sensor
    pixStack(ctx, root, body);

    /* celular: o 4º ato (Pix) sai do sensor do corpo e passa a seguir a posição da própria pilha */
    const pix = ctx.flags.mobile ? root.querySelector('.so-pix') : null;
    const steps = pix ? STEPS.filter(([c]) => c !== 'is-paid') : STEPS;
    const pixAlcancado = () => !!pix && pix.getBoundingClientRect().top <= (window.innerHeight || 1) * PIX_MOBILE_START;

    /* progresso atual medido na geometria (independe de o ScrollTrigger já ter feito refresh) */
    const progressNow = () => {
      const r = body.getBoundingClientRect(), vh = window.innerHeight || 1;
      return (vh * .65 - r.top) / Math.max(1, r.height + vh * .2);
    };

    /* estado inicial: some só o que ainda não foi alcançado nem exibido; sem transição (nada se "desfaz" à vista) */
    const p0 = progressNow();
    if (pixAlcancado()) shown.add('is-paid');                          // medido antes de tirar as classes (o estado "sem Pix" desloca a pilha 16px)
    body.classList.add('is-quiet');
    steps.forEach(([c, t]) => {
      if (p0 > t) shown.add(c);
      if (!shown.has(c)) body.classList.remove(c);
    });
    if (pix && !shown.has('is-paid')) body.classList.remove('is-paid');
    void body.offsetWidth;                                            // confirma o estado sem transição antes de religá-las
    body.classList.remove('is-quiet');

    /* atos em sequência: se um salto cruza vários limiares no mesmo quadro, cada ato espera GAP pelo anterior */
    let nextAt = 0, calls = [];
    const G = ctx.gsap;
    function grant(c) {
      if (shown.has(c)) return;
      shown.add(c);
      const now = G.ticker.time, at = Math.max(now, nextAt);
      nextAt = at + GAP;
      if (at - now < .01 || WDF.state.jumping) { body.classList.add(c); return; }
      ctx.later(() => { calls.push(G.delayedCall(at - now, () => body.classList.add(c))); });
    }
    function apply(p) { steps.forEach(([c, t]) => { if (p > t) grant(c); }); }

    if (pix) {
      ctx.st({
        trigger: pix, start: 'top ' + Math.round(PIX_MOBILE_START * 100) + '%', once: true,
        onEnter: () => grant('is-paid'),
        onRefresh: (s) => { if (s.progress > 0) grant('is-paid'); },
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

/* pilha de notificações de Pix (padrão da página UGC): a cada 5,2 s a de trás vem para a frente, só com a dobra visível e já "paga" */
const PIX_TIMES = ['agora', 'há 2 min', 'há 9 min'];
function pixStack(ctx, root, body) {
  const stack = root.querySelector('.pix-stack');
  if (!stack) return;
  const items = [...stack.children];
  let order = [...items], visible = false, timer = 0;
  const size = () => stack.style.setProperty('--pix-h', Math.max(...items.map((it) => it.offsetHeight)) + 'px');
  const place = () => order.forEach((it, i) => {
    it.dataset.slot = String(i); it.style.setProperty('--slot', i);
    it.querySelector('.pix-t').textContent = PIX_TIMES[i];
  });
  const next = () => {
    if (!body.classList.contains('is-paid')) return;
    items.forEach((it) => it.classList.remove('is-arriving'));
    const arriving = order.pop(); order.unshift(arriving); place();
    void arriving.offsetWidth; arriving.classList.add('is-arriving');
  };
  const sync = () => { clearInterval(timer); timer = 0; if (visible && !document.hidden) timer = setInterval(next, 5200); };
  stack.classList.add('is-stacked'); place(); size();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null;
  if (ro) items.forEach((it) => ro.observe(it));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { visible = es[0].isIntersecting; sync(); }, { threshold: 0.2 }) : null;
  if (io) io.observe(stack); else { visible = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  ctx.cleanup(() => {
    clearInterval(timer); if (io) io.disconnect(); if (ro) ro.disconnect();
    document.removeEventListener('visibilitychange', sync);
    stack.classList.remove('is-stacked'); stack.style.removeProperty('--pix-h');
    items.forEach((it, i) => { it.classList.remove('is-arriving'); delete it.dataset.slot; it.style.removeProperty('--slot'); it.querySelector('.pix-t').textContent = PIX_TIMES[i]; });
    order = [...items];
  });
}
