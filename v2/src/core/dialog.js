/* core/dialog.js — diálogo (lightbox) nativo e toast (§5.7, §5.9). Markup em core/core-top.html. */
const WDF = window.WDF, core = WDF.core, d = document;

/* ---------- diálogo ---------- */
const dlg = d.querySelector('dialog.dlg');
const body = dlg && dlg.querySelector('.dlg-body');
const title = dlg && dlg.querySelector('#dlg-t');
let trigger = null, onCloseCb = null;

function open(o) {
  if (!dlg || typeof dlg.showModal !== 'function' || !o || !o.node) return false;
  if (dlg.open) dlg.close();
  const ae = d.activeElement;
  trigger = ae && ae !== d.body ? ae : null;
  onCloseCb = typeof o.onClose === 'function' ? o.onClose : null;
  if (title) title.textContent = o.label || '';
  body.replaceChildren(o.node);
  dlg.showModal();
  core.lock('dialog', true);
  return true;
}
function close() { if (dlg && dlg.open) dlg.close(); }

if (dlg) {
  dlg.addEventListener('close', () => {
    body.querySelectorAll('video').forEach((v) => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { /* noop */ } });
    body.replaceChildren();
    core.lock('dialog', false);
    const t = trigger; trigger = null;
    if (t && t.isConnected && t.focus) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
    const cb = onCloseCb; onCloseCb = null;
    if (cb) { try { cb(); } catch (e) { console.error('[WDF] dialog onClose', e); } }
  });
  /* clique fora da mídia (no próprio <dialog>, que cobre a tela) fecha */
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === body) close(); });
  const x = dlg.querySelector('.dlg-x');
  if (x) x.addEventListener('click', close);
}

/* ---------- toast ---------- */
const toastEl = d.querySelector('.toast');
let tHide = 0, tClear = 0;
function toast(msg, ms) {
  if (!toastEl || !msg) return;
  clearTimeout(tHide); clearTimeout(tClear);
  toastEl.textContent = String(msg);
  toastEl.classList.remove('is-in');
  void toastEl.offsetWidth;                       // reinicia a transição
  toastEl.classList.add('is-in');
  tHide = setTimeout(() => {
    toastEl.classList.remove('is-in');
    tClear = setTimeout(() => { toastEl.textContent = ''; }, 600);
  }, typeof ms === 'number' ? ms : 2400);
}

core.dialog = Object.freeze({ open, close });
core.toast = toast;
