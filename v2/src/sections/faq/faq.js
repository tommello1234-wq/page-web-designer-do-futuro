/* sections/faq — §4.12. O acordeão é nativo (<details name="faq">) e não depende de JS.
   O JS só (1) garante "1 aberto por vez" onde o atributo name ainda não é suportado e
   (2) re-mede os ScrollTriggers abaixo (CTA final, footer, sensores de tema) quando a altura muda.
   Vale também no modo estático: os sensores de tema existem nos dois modos. */
const WDF = window.WDF;

WDF.register('faq', {
  init(ctx, root) {
    const items = [...root.querySelectorAll('details.fq')];
    const nativeName = 'name' in HTMLDetailsElement.prototype;
    let tm = 0;
    const refresh = () => { clearTimeout(tm); tm = setTimeout(() => WDF.refresh(), 600); };   // após a transição (.5s)

    items.forEach((dt) => ctx.on(dt, 'toggle', () => {
      if (!nativeName && dt.open) items.forEach((o) => { if (o !== dt && o.open) o.open = false; });
      refresh();
    }));
    ctx.cleanup(() => clearTimeout(tm));
  },
});
