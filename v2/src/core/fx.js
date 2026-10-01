/* core/fx.js — switch FX ([data-fx-toggle] na nav desktop e no menu mobile) (§5.8).
   Alternar = WDF.core.setFx(on) (grava localStorage, reconstrói as seções com a rolagem preservada). */
const WDF = window.WDF, d = document;
let pendingToast = null;
WDF.layer('fx', {
  setup(sc) {
    const sws = [...d.querySelectorAll('[data-fx-toggle]')];
    const on = !!WDF.state.fx;
    sws.forEach((b) => b.setAttribute('aria-checked', on ? 'true' : 'false'));
    if (pendingToast) { const m = pendingToast; pendingToast = null; setTimeout(() => sc.toast(m), 60); }
    const click = (e) => {
      const next = e.currentTarget.getAttribute('aria-checked') !== 'true';
      pendingToast = next ? 'EFEITOS LIGADOS' : 'EFEITOS DESLIGADOS';
      WDF.core.setFx(next);
    };
    sws.forEach((b) => sc.on(b, 'click', click));
  },
});
