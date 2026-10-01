/* core/frames.js — motor de frames 42→135 compartilhado (hero + oferta), §6.5.
   Carga grossa→fina (bit-reversal) com 1º lote no boot (12 desktop / 8 mobile, priority low) e o resto após load + WDF.ric;
   guarda blobs; decodifica em janela deslizante (±12 full / ±8 half, + 42 e 135 fixos, teto 27, ≤3 simultâneas);
   frames fora da janela recebem close(). Com state.jumping as decodificações esperam. */
const WDF = window.WDF, core = WDF.core, w = window, d = document;

const FIRST = 42, LAST = 135, FW = 900, FH = 864;
const EYES = Object.freeze({ c: Object.freeze([452, 354]), l: Object.freeze([385, 352]), r: Object.freeze([520, 352]) });
const url = (f) => '/ASSETS/FRAMES/frame_' + String(f).padStart(4, '0') + '.webp';

let mode = null, list = [], order = [], batchN = 12, win = 12, conc = 4, optsFail = false;
let started = false, restQueued = false, want = FIRST, requested = 0, maxRequested = 0;
const blobs = new Map(), bitmaps = new Map(), decoding = new Set(), fetching = new Set();
const queue = [];
const renderers = new Set();
let heroImg = null;
let firstResolve; const firstP = new Promise((r) => { firstResolve = r; });

function computeMode() {
  if (mode) return mode;
  const f = core.readFlags(null);
  mode = (f.saveData || f.lowNet) ? 'stills' : (f.mobile || f.effectiveType === '3g') ? 'half' : 'full';
  batchN = f.mobile ? 8 : 12;
  win = mode === 'half' ? 8 : 12;
  conc = mode === 'half' ? 3 : 4;
  list = [];
  if (mode === 'half') { for (let f2 = FIRST; f2 < LAST; f2 += 2) list.push(f2); list.push(LAST); }
  else for (let f2 = FIRST; f2 <= LAST; f2++) list.push(f2);
  order = coarseToFine(list.length).map((i) => list[i]);
  return mode;
}

/* ordem grossa→fina: extremos, meio, quartos, oitavos… */
function coarseToFine(n) {
  const out = [], seen = new Uint8Array(n);
  const push = (i) => { if (i >= 0 && i < n && !seen[i]) { seen[i] = 1; out.push(i); } };
  push(0); push(n - 1);
  let segs = [[0, n - 1]];
  while (segs.length) {
    const next = [];
    for (const [a, b] of segs) { if (b - a < 2) continue; const m = (a + b) >> 1; push(m); next.push([a, m], [m, b]); }
    segs = next;
  }
  for (let i = 0; i < n; i++) push(i);
  return out;
}

const idxOf = (f) => { let best = 0, bd = 1e9; for (let i = 0; i < list.length; i++) { const dd = Math.abs(list[i] - f); if (dd < bd) { bd = dd; best = i; } } return best; };
const nearestInList = (f) => list[idxOf(f)];

/* ---------- download ---------- */
function enqueue(frames) { frames.forEach((f) => { if (!blobs.has(f) && !fetching.has(f) && !queue.includes(f) && !(f === FIRST && heroImg)) queue.push(f); }); pump(); }
function pump() {
  while (fetching.size < conc && queue.length) {
    const f = queue.shift();
    if (f < FIRST || f > LAST) continue;
    fetching.add(f); requested++; maxRequested = Math.max(maxRequested, f);
    let p;
    try { p = fetch(url(f), { priority: 'low' }); } catch (e) { p = fetch(url(f)); }
    p.then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
      .then((b) => { blobs.set(f, b); schedule(); })
      .catch(() => { /* frame ausente: o renderer usa o vizinho decodificado */ })
      .finally(() => { fetching.delete(f); pump(); });
  }
}
function queueRest() {
  if (restQueued) return; restQueued = true;
  const go = () => WDF.ric(() => enqueue(order), { timeout: 1500 });
  if (d.readyState === 'complete') go(); else w.addEventListener('load', go, { once: true });
}

/* ---------- decodificação ---------- */
function decodeWidth() {
  let cssW = 0; renderers.forEach((r) => { cssW = Math.max(cssW, r.rect().w); });
  const dpr = Math.min(w.devicePixelRatio || 1, 1.5);
  return cssW ? Math.min(FW, Math.round(cssW * dpr)) : FW;
}
function schedule() {
  if (!mode || mode === 'stills' || WDF.state.jumping) return;
  const wi = idxOf(want);
  const desired = [FIRST, LAST];
  for (let k = 0; k <= win; k++) {
    if (wi + k < list.length) desired.push(list[wi + k]);
    if (k && wi - k >= 0) desired.push(list[wi - k]);
  }
  const keep = new Set(desired);
  bitmaps.forEach((bmp, f) => { if (!keep.has(f)) { try { bmp.close(); } catch (e) { /* noop */ } bitmaps.delete(f); } });
  for (const f of desired) {
    if (decoding.size >= 3) break;
    if (bitmaps.has(f) || decoding.has(f)) continue;
    if (f === FIRST && heroImg && !blobs.has(FIRST)) { decodeImg(); continue; }
    if (blobs.has(f)) decode(f);
  }
}
function make(src) {
  const opts = mode === 'half' && !optsFail ? { resizeWidth: decodeWidth(), resizeQuality: 'high' } : undefined;
  return (opts ? createImageBitmap(src, opts) : createImageBitmap(src)).catch((e) => {
    if (!opts) throw e;
    optsFail = true; win = 6;                         // sem suporte a opções: tamanho nativo e janela ±6
    return createImageBitmap(src);
  });
}
function done(f, bmp) {
  decoding.delete(f);
  const wi = idxOf(want), fi = list.indexOf(f);
  if (f !== FIRST && f !== LAST && (fi < 0 || Math.abs(fi - wi) > win)) { try { bmp.close(); } catch (e) { /* noop */ } }
  else { bitmaps.set(f, bmp); if (f === FIRST) firstResolve(); renderers.forEach((r) => r._onDecoded()); }
  schedule();
}
function decode(f) {
  decoding.add(f);
  make(blobs.get(f)).then((bmp) => done(f, bmp), () => { decoding.delete(f); schedule(); });
}
function decodeImg() {
  decoding.add(FIRST);
  const img = heroImg;
  const ready = img.complete && img.naturalWidth ? Promise.resolve() : new Promise((res, rej) => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', rej, { once: true }); });
  ready.then(() => (img.decode ? img.decode().catch(() => {}) : null)).then(() => make(img))
    .then((bmp) => done(FIRST, bmp), () => { decoding.delete(FIRST); heroImg = null; enqueue([FIRST]); });
}

WDF.bus.on('jump:end', () => schedule());

/* ---------- API ---------- */
function start() {
  if (started) return; started = true;
  computeMode();
  if (mode === 'stills') { firstResolve(); return; }
  heroImg = [...d.querySelectorAll('img')].find((im) => /\/ASSETS\/FRAMES\/frame_0042\.webp(?:[?#]|$)/.test(im.getAttribute('src') || '')) || null;
  /* Os frames só servem quando a pessoa rola: não competem com a 1ª pintura (LCP). Começam na 1ª interação ou
     ~1,2s após o load, o que vier primeiro. Com o preloader do desktop rodando (sem pre-skip), começam já. */
  let going = false;
  const EVS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
  const go = () => {
    if (going) return; going = true;
    EVS.forEach((e) => w.removeEventListener(e, go, { passive: true }));
    enqueue(order.slice(0, batchN));
    schedule();
    queueRest();
  };
  if (!d.documentElement.classList.contains('pre-skip') || (w.scrollY || 0) > 10) { go(); return; }
  EVS.forEach((e) => w.addEventListener(e, go, { passive: true }));
  const idle = () => setTimeout(() => (WDF.ric || ((f) => setTimeout(f, 0)))(go), 1200);
  if (d.readyState === 'complete') idle(); else w.addEventListener('load', idle, { once: true });
}

function loadedCount(n) {
  computeMode();
  const first = order.slice(0, n == null ? batchN : n);
  return first.filter((f) => blobs.has(f) || bitmaps.has(f) || (f === FIRST && heroImg && heroImg.complete && heroImg.naturalWidth > 0)).length;
}

function renderer(canvas, o = {}) {
  start();
  const anchor = o.anchor === 'center' ? 'center' : 'bottom';
  const r = {
    canvas, current: null, want: null, cssW: 0, cssH: 0, dpr: 1, dirty: true, imgs: null,
    draw(f) {
      const t = nearestInList(Math.max(FIRST, Math.min(LAST, Math.round(+f || FIRST))));
      r.want = t;
      if (mode === 'stills') return stillsDraw(t);
      if (t !== want) { want = t; schedule(); }
      const best = nearestDecoded(t);
      if (best == null) return false;
      if (best !== r.current || r.dirty) paint(best);
      return best === t;
    },
    resize, rect, point,
    destroy() {
      if (ro) ro.disconnect();
      renderers.delete(r);
      if (r.imgs) { r.imgs.forEach((im) => im && im.remove()); r.imgs = null; canvas.style.visibility = ''; }
    },
    _onDecoded() {
      if (r.want == null) return;
      const best = nearestDecoded(r.want);
      if (best != null && (r.current == null || Math.abs(best - r.want) < Math.abs(r.current - r.want))) paint(best);
    },
  };
  const c2d = mode === 'stills' ? null : canvas.getContext('2d');
  function resize() {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (!cw || !ch) return;
    const dprMax = o.dprMax || (w.matchMedia && w.matchMedia('(max-width:899px)').matches ? 1.5 : 2);
    const dpr = Math.min(w.devicePixelRatio || 1, dprMax);
    r.cssW = cw; r.cssH = ch; r.dpr = dpr;
    if (!c2d) return;
    const W = Math.round(cw * dpr), H = Math.round(ch * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    c2d.imageSmoothingEnabled = true; c2d.imageSmoothingQuality = 'high';
    r.dirty = true;
    const t = r.want != null ? r.want : r.current;
    if (t != null) { const b = nearestDecoded(t); if (b != null) paint(b); }
  }
  function rect() {
    const cw = r.cssW || canvas.clientWidth, ch = r.cssH || canvas.clientHeight;
    const s = Math.min(cw / FW, ch / FH) || 0;
    const rw = FW * s, rh = FH * s;
    return { x: (cw - rw) / 2, y: anchor === 'bottom' ? ch - rh : (ch - rh) / 2, w: rw, h: rh };
  }
  function point(fx, fy) { const rc = rect(); const s = rc.w / FW; return { x: rc.x + fx * s, y: rc.y + fy * s }; }
  function paint(f) {
    const bmp = bitmaps.get(f); if (!bmp || !c2d) return;
    const rc = rect(), dpr = r.dpr;
    c2d.clearRect(0, 0, canvas.width, canvas.height);
    c2d.drawImage(bmp, rc.x * dpr, rc.y * dpr, rc.w * dpr, rc.h * dpr);
    r.current = f; r.dirty = false;
  }
  function stillsDraw(t) {
    if (!r.imgs) {
      canvas.style.visibility = 'hidden';
      const mk = (f) => {
        const im = new Image(); im.alt = ''; im.decoding = 'async'; im.setAttribute('aria-hidden', 'true'); im.src = url(f);
        im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;object-position:50% ' + (anchor === 'bottom' ? '100%' : '50%');
        canvas.after(im); return im;
      };
      r.imgs = [mk(FIRST), null]; r._mk = mk;
    }
    const k = Math.max(0, Math.min(1, (t - 72) / 33));
    if (k > 0 && !r.imgs[1]) r.imgs[1] = r._mk(LAST);
    r.imgs[0].style.opacity = String(1 - k);
    if (r.imgs[1]) r.imgs[1].style.opacity = String(k);
    r.current = k < .5 ? FIRST : LAST;
    return true;
  }
  let ro = null;
  if (mode !== 'stills') {
    renderers.add(r);
    if ('ResizeObserver' in w) { ro = new ResizeObserver(() => resize()); ro.observe(canvas); }
    resize();
  }
  return r;
}
function nearestDecoded(t) {
  let best = null, bd = 1e9;
  bitmaps.forEach((_, f) => { const dd = Math.abs(f - t); if (dd < bd || (dd === bd && f < best)) { bd = dd; best = f; } });
  return best;
}

const frames = {
  first: FIRST, last: LAST, EYES,
  get mode() { return computeMode(); },
  start, loadedCount, renderer,
  whenFirst: () => firstP,
};
WDF.frames = frames;
WDF.debug.frames = () => ({ blobs: blobs.size, decoded: bitmaps.size, mode: mode || 'off', batch: batchN, requested, maxRequested, renderers: renderers.size });
core.makeFrames = function makeFrames(sc) {
  const o = Object.create(frames);
  o.renderer = (canvas, opts) => { const r = renderer(canvas, opts); sc.cleanup(() => r.destroy()); return r; };
  return o;
};
