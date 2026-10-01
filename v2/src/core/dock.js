/* core/dock.js — dock de conversão mobile + WhatsApp flutuante desktop (§5.6).
   Visível depois do palco do hero; some quando o CTA da oferta está ≥50% visível, quando o rodapé aparece e dentro de
   #preco antes de o preço ter sido visto. Estado honesto: 'pre' → #preco; 'post' (offerSeen) → checkout. */
const WDF = window.WDF, d = document;
WDF.layer('dock', {
  setup(sc) {
    const dock = d.querySelector('.dock'), wa = d.querySelector('.wa-float');
    if (!dock && !wa) return;
    const cta = dock && dock.querySelector('.dock-cta'), lab = dock && dock.querySelector('.dock-l'), sub = dock && dock.querySelector('.dock-s');
    const heroTrack = d.querySelector('#inicio .hero-track');
    const offerCta = d.querySelector('#preco a[data-checkout="oferta"]');
    const preco = d.querySelector('#preco'), bar = d.querySelector('.s-footer .ft-bar');
    const vis = { cta: false, preco: false, bar: false };

    const toPost = (animate) => {
      if (!dock || dock.dataset.state === 'post') return;
      dock.dataset.state = 'post';
      const apply = () => {
        lab.textContent = 'GARANTIR MEU ACESSO';
        if (sub) { sub.textContent = WDF.offer.installments.n + 'x R$ ' + WDF.fmt.num(WDF.offer.installments.value, 2); sub.hidden = false; }
        cta.href = WDF.offer.checkoutUrl;
        cta.setAttribute('data-checkout', 'dock');
      };
      if (animate && sc.flags.motion && sc.gsap) {
        sc.gsap.to(lab, { yPercent: -100, duration: .22, ease: 'power2.in', onComplete: () => { apply(); sc.gsap.fromTo(lab, { yPercent: 100 }, { yPercent: 0, duration: .23, ease: 'wdf.out' }); } });
      } else apply();
    };
    if (WDF.state.offerSeen) toPost(false);
    const offSeen = WDF.bus.on('offer:seen', () => { toPost(true); update(); });
    sc.cleanup(offSeen);

    let shown = null;
    function update() {
      const past = heroTrack ? heroTrack.getBoundingClientRect().bottom <= 1 : scrollY > innerHeight;
      const show = past && !vis.cta && !vis.bar && !(vis.preco && !WDF.state.offerSeen);
      if (show === shown) return;
      shown = show;
      if (dock) { if (show) dock.hidden = false; dock.classList.toggle('is-in', show); }
      if (wa) wa.classList.toggle('is-in', show);
      d.body.classList.toggle('has-dock', show && !!dock && sc.flags.mobile);
    }
    if ('IntersectionObserver' in window) {
      const watch = (el, key, thr) => {
        if (!el) return;
        const io = new IntersectionObserver((es) => { const e = es[es.length - 1]; vis[key] = thr ? e.intersectionRatio >= thr : e.isIntersecting; update(); }, { threshold: thr ? [0, thr, 1] : 0 });
        io.observe(el); sc.cleanup(() => io.disconnect());
      };
      watch(offerCta, 'cta', .5);
      watch(preco, 'preco', 0);
      watch(bar, 'bar', 0);
    }
    const onScroll = () => update();
    window.addEventListener('scroll', onScroll, { passive: true });
    sc.cleanup(() => { window.removeEventListener('scroll', onScroll); d.body.classList.remove('has-dock'); });
    update();
  },
});
