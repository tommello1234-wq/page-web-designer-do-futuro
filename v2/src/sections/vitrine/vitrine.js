/* vitrine.js · carrossel automático e contínuo (pedido do dono).
   Com movimento: liga .is-loop (CSS anima o trilho -50%, a 2ª metade é a cópia), calcula a duração pela largura (velocidade fixa),
   pausa a animação fora da tela e só carrega/toca o vídeo do card que está visível (versão -m). Sem movimento: faixa estática. */
const WDF = window.WDF;
const SPEED = 60;              // px por segundo

WDF.register('vitrine', {
  init(ctx, root) {
    const track = root.querySelector('.vt-track');
    if (!track) return undefined;
    const vids = [...root.querySelectorAll('.vt-media video')];
    if (!ctx.flags.motion) return undefined;

    root.classList.add('is-loop');
    const setDur = () => root.style.setProperty('--vt-dur', Math.max(20, (track.scrollWidth / 2) / SPEED).toFixed(1) + 's');
    setDur();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(setDur) : null;
    if (ro) ro.observe(track);

    let onScreen = false;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.target === root) { onScreen = e.isIntersecting; root.classList.toggle('is-off', !onScreen); if (!onScreen) vids.forEach((v) => v.pause()); return; }
        const v = e.target;
        if (e.isIntersecting && onScreen && ctx.flags.autoplay !== false) {
          if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
          const p = v.play(); if (p && p.catch) p.catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.35 });
    io.observe(root);
    vids.forEach((v) => {
      io.observe(v);
      const on = () => v.parentElement.classList.add('is-playing');
      v.addEventListener('playing', on);
      ctx.cleanup(() => v.removeEventListener('playing', on));
    });

    return () => {
      io.disconnect(); if (ro) ro.disconnect();
      vids.forEach((v) => { v.pause(); v.parentElement.classList.remove('is-playing'); });
      root.classList.remove('is-loop', 'is-off'); root.style.removeProperty('--vt-dur');
    };
  },
});
