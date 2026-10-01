/* core/theme.js — tema da UI (body[data-ui]) e <meta name="theme-color"> por sensores de seção,
   com override ESCOPADO à seção que o pediu (§5.5). Sensores com refreshPriority:-1 (medem depois dos pins). */
const WDF = window.WDF, core = WDF.core, w = window, d = document;

const COLORS = { ink: '#0A0A0A', paper: '#EEEAE3', flame: '#FF5A1F' };
const overrides = new Map();          // root da seção → 'ink' | 'paper' | 'flame'
let sensors = [];                     // { el, st }
let active = null;
const meta = d.querySelector('meta[name="theme-color"]');

const norm = (t) => (t === 'paper-2' ? 'paper' : (t === 'ink' || t === 'paper' || t === 'flame') ? t : null);
const baseTheme = (el) => norm(el.getAttribute('data-ui-theme')) || norm(el.getAttribute('data-theme')) || 'ink';

function apply() {
  if (!active) return;
  const ov = overrides.get(active) || null;
  const t = ov || baseTheme(active);
  if (d.body.dataset.ui !== t) {
    d.body.dataset.ui = t;
    WDF.bus.emit('theme', { theme: t, section: active.id || '' });
  }
  if (meta) {
    const c = ov ? COLORS[ov] : (active.getAttribute('data-theme-color') || COLORS[t]);
    if (meta.getAttribute('content') !== c) meta.setAttribute('content', c);
  }
}

/* sensor ativo pela posição atual (após refresh/salto); fora de qualquer sensor, o mais próximo */
function sync() {
  if (!sensors.length) return;
  const y = w.scrollY;
  let hit = null;
  for (const s of sensors) if (y >= s.st.start && y < s.st.end) { hit = s; break; }
  if (!hit) hit = y < sensors[0].st.start ? sensors[0] : sensors[sensors.length - 1];
  active = hit.el; apply();
}

core.theme = {
  override(root, t) {
    const v = t == null ? null : norm(t);
    if (v) overrides.set(root, v); else overrides.delete(root);
    apply();
  },
  sync,
  active: () => active,
};

WDF.layer('theme', {
  setup(lc) {
    sensors = [];
    d.querySelectorAll('main > section[data-theme], footer[data-theme]').forEach((el) => {
      const st = lc.st({
        trigger: el, start: 'top 60px', end: 'bottom 60px',
        onToggle: (self) => { if (self.isActive) { active = el; apply(); } },
      });
      sensors.push({ el, st });
    });
    lc.onRefresh(sync);
    return () => { sensors = []; };
  },
  after: sync,
});

WDF.debug.sensors = () => sensors.map((s) => ({ id: s.el.id || s.el.className, start: Math.round(s.st.start), end: Math.round(s.st.end) }));
