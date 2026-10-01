/* FOOTER — "FUTURO invertido": letras sobem em máscara, os olhos acendem e o protocolo "desliga". Uma vez. */
WDF.register('footer', {
  init(ctx, root) {
    const { gsap, flags } = ctx;
    ctx.on(root.querySelector('.ft-top-link'), 'click', (e) => { e.preventDefault(); ctx.goTo(0, { duration: 1.6 }); });
    if (!flags.motion) return;                          // estático: letras paradas, olhos apagados
    const letters = [...root.querySelectorAll('.ft-word > span > span')], eyes = root.querySelectorAll('.ft-eye');
    gsap.set(letters, { yPercent: 100 });
    ctx.st({
      trigger: root.querySelector('.ft-word'), start: 'top 75%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to(letters, { yPercent: 0, duration: 1.15, ease: 'wdf.out', stagger: .06 })
          .to(eyes, { opacity: 1, duration: .4, ease: 'none' })
          .to(eyes, { opacity: 0, duration: .8, ease: 'none' }, '+=1.2');
      },
    });
  },
});
