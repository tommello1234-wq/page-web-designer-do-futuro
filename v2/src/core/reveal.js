/* core/reveal.js — revelações por atributo e programáticas (§3.2).
   Regras: só em is-motion; ScrollTrigger criado no init, estado inicial (split + gsap.set) só quando o elemento chega a
   ≤ 1,5 viewport (IO); gatilho já passado ⇒ fica no estado final sem animar; nunca reverte ao subir; SplitText com
   máscara de folga (.rl-mask/.rw-mask) e split.revert() no fim; durante salto longo termina instantaneamente. */
const WDF = window.WDF, core = WDF.core, w = window;
const G = core.G;

const START = { lines: 'top 85%', words: 'top 85%', up: 'top 88%', media: 'top 80%', rule: 'top 90%', strike: 'top 85%', count: 'top 90%' };
const SELF = /^(P|H[1-6]|BLOCKQUOTE|A|BUTTON|SPAN|IMG|PICTURE|VIDEO|CANVAS|SVG|DEL|B|STRONG|EM|SMALL|TIME|LABEL|FIGCAPTION)$/;

function upTargets(el) { return SELF.test(el.tagName) || !el.children.length ? [el] : [...el.children]; }
function fmtCount(v, dec) { return WDF.fmt.num(dec ? v : Math.round(v), dec); }

core.makeReveal = function makeReveal(sc) {
  const seen = new WeakSet();

  function one(kind, el, o = {}) {
    if (!sc || !el || !sc.flags.motion || seen.has(el)) return;
    seen.add(el);
    const delay = (+o.delay || 0) + (parseFloat(el.getAttribute('data-reveal-delay')) || 0);
    const trigger = o.trigger || el;
    let armed = false, done = false, anim = null, split = null, st = null;
    let targets = null, ops = null, child = null, original = null;

    /* IO criado ANTES do ScrollTrigger: um trigger criado com a página já rolada dispara onEnter dentro do create */
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      sc.later(arm);
    }, { rootMargin: '150% 0px' });
    sc.cleanup(() => io.disconnect());

    const vars = { trigger, start: o.start || START[kind], once: true, onEnter: () => play() };
    const spacer = trigger.closest && trigger.closest('.pin-spacer');
    if (spacer && spacer.firstElementChild && spacer.firstElementChild !== trigger) vars.pinnedContainer = spacer.firstElementChild;
    if (vars.pinnedContainer && sc.stAfterRefresh) sc.stAfterRefresh(vars, (t) => { st = t; });
    else st = sc.st(vars);
    if (!done) io.observe(el);

    const passed = () => { if (!st) return true; try { return st.scroll() >= st.start - 1; } catch (e) { return true; } };

    function arm() {
      if (done || armed) return;
      if (passed()) { done = true; return; }            // gatilho já passado: estado final, sem animar
      armed = true;
      setInitial();
    }
    function play() {
      if (done) return;
      done = true; io.disconnect();
      if (!armed) return;
      sc.later(() => { anim = animate(); if (anim && WDF.state.jumping) anim.progress(1); });
    }

    /* ---- por tipo ---- */
    function splitTween(t) {
      return G.fromTo(t, { yPercent: 110 }, {
        yPercent: 0, duration: 1.15, ease: 'wdf.out', stagger: kind === 'lines' ? (o.stagger ?? .08) : (o.stagger ?? .05), delay,
        onComplete: () => { if (split) { split.revert(); split = null; } },
      });
    }
    function setInitial() {
      if (kind === 'lines' || kind === 'words') {
        split = w.SplitText.create(el, {
          type: kind, mask: kind, linesClass: 'rl', wordsClass: 'rw', autoSplit: true,
          onSplit(self) {
            const t = self[kind];
            if (anim) { const p = anim.progress(); anim.kill(); anim = splitTween(t); anim.progress(p); }
            else G.set(t, { yPercent: 110 });
          },
        });
      } else if (kind === 'up') {
        targets = o.targets || upTargets(el);
        ops = targets.map((t) => getComputedStyle(t).opacity);
        G.set(targets, { y: '+=' + (o.y ?? 24), opacity: 0 });
      } else if (kind === 'media') {
        child = el.querySelector('img,video,canvas,picture');
        G.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
        if (child) G.set(child, { scale: 1.12 });
      } else if (kind === 'rule') {
        G.set(el, { scaleX: 0, transformOrigin: '0% 50%' });
      } else if (kind === 'strike') {
        G.set(el, { '--strike': 0 });
      } else if (kind === 'count') {
        original = el.textContent;
        sc.cleanup(() => { if (original != null) el.textContent = original; });
        el.textContent = (o.prefix || '') + fmtCount(o.from || 0, o.decimals || 0) + (o.suffix || '');
      }
    }
    function animate() {
      if (kind === 'lines' || kind === 'words') return split ? splitTween(split[kind]) : null;
      if (kind === 'up') {
        return G.to(targets, { y: '-=' + (o.y ?? 24), opacity: (i) => ops[i], duration: .9, ease: 'wdf.out', stagger: o.stagger ?? .06, delay, clearProps: 'transform,opacity' });
      }
      if (kind === 'media') {
        const tl = G.timeline({ delay });
        tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'wdf.inout', clearProps: 'clipPath' }, 0);
        if (child) tl.to(child, { scale: 1, duration: 1.15, ease: 'wdf.out', clearProps: 'transform' }, 0);
        return tl;
      }
      if (kind === 'rule') return G.to(el, { scaleX: 1, duration: 1.1, ease: 'wdf.inout', delay, clearProps: 'transform,transformOrigin' });
      if (kind === 'strike') return G.to(el, { '--strike': 1, duration: .8, ease: 'wdf.inout', delay: .3 + delay, clearProps: '--strike' });
      if (kind === 'count') {
        const obj = { v: o.from || 0 };
        return G.to(obj, {
          v: o.to, duration: o.dur ?? 1.6, ease: 'power3.out', delay,
          onUpdate: () => { el.textContent = (o.prefix || '') + fmtCount(obj.v, o.decimals || 0) + (o.suffix || ''); },
          onComplete: () => { el.textContent = original; },
        });
      }
      return null;
    }
  }

  const api = {
    lines: (el, o) => one('lines', el, o),
    words: (el, o) => one('words', el, o),
    up: (els, o = {}) => {
      if (Array.isArray(els) || (els && typeof els.length === 'number' && !els.nodeType)) {
        const arr = [...els]; if (!arr.length) return;
        one('up', arr[0], { ...o, targets: arr, trigger: o.trigger || arr[0] });
      } else one('up', els, o);
    },
    media: (el, o) => one('media', el, o),
    rule: (el, o) => one('rule', el, o),
    strike: (el, o) => one('strike', el, o),
    count: (el, o = {}) => {
      if (!el) return;
      const to = o.to ?? parseFloat(el.getAttribute('data-count'));
      if (!isFinite(to)) return;
      one('count', el, {
        ...o, to,
        decimals: o.decimals ?? (parseInt(el.getAttribute('data-count-decimals'), 10) || 0),
        suffix: o.suffix ?? (el.getAttribute('data-count-suffix') || ''),
        prefix: o.prefix ?? (el.getAttribute('data-count-prefix') || ''),
      });
    },
  };
  return api;
};

/* aplica os reveals por atributo da raiz da seção (chamado pelo boot dentro do contexto da seção) */
core.applyAttrReveals = function applyAttrReveals(root, sc) {
  if (!sc.flags.motion) return;
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    const k = el.getAttribute('data-reveal');
    if (k && k !== 'count' && sc.reveal[k]) sc.reveal[k](el);
  });
  root.querySelectorAll('[data-count]').forEach((el) => sc.reveal.count(el));
};
