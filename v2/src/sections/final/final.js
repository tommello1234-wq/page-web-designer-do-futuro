/* CTA FINAL — "A janela": abre de uma fenda, fica aberta e fecha devagar (sem countdown). */
WDF.register('final', {
  init(ctx, root) {
    if (!ctx.flags.motion) return;                      // estático: janela aberta
    const win = root.querySelector('.fn-window');
    const eio = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let p = 0, focused = false;
    const paint = () => {
      let ins;
      if (focused || (p >= .35 && p <= .65)) ins = 0;
      else if (p < .35) ins = 49.9 * (1 - eio(p / .35));
      else ins = 10 * ((p - .65) / .35);
      win.style.clipPath = `inset(${ins.toFixed(2)}% 0 ${ins.toFixed(2)}% 0)`;
    };
    ctx.st({ trigger: win, start: 'top 85%', end: 'bottom 15%', scrub: true, onUpdate: (s) => { p = s.progress; paint(); }, onRefresh: (s) => { p = s.progress; paint(); } });
    ctx.on(win, 'focusin', () => { focused = true; paint(); });
    ctx.on(win, 'focusout', () => { focused = false; paint(); });
    return () => { win.style.clipPath = ''; };
  },
});
