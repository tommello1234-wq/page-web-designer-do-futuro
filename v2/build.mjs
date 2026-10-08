#!/usr/bin/env node
/* v2/build.mjs — build da WDF v2 (Node 20, zero dependências obrigatórias). Spec §6.3.
   Uso:
     node v2/build.mjs                    full: /index-v2.html + v2/dist/wdf.<hash>.css|js + manifest (só F0 e I0 rodam)
     node v2/build.mjs --section <nome>   preview isolado: v2/preview/<nome>.html|-nojs.html|.css|.js (pacotes de seção)
     node v2/build.mjs --selftest         autoteste do extrator do copy-lock (não escreve nada)
   Opções: --no-minify · --no-lock (rascunho: pula copy/offer-lock; nunca na entrega) · --indexable (remove o noindex) */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const V2 = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(V2);
const SRC = path.join(V2, 'src');
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const opt = (k) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };

const errors = [], warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
const rel = (p) => path.relative(ROOT, p) || '.';
const kb = (n) => (n / 1024).toFixed(1).replace('.', ',') + ' KB';
const gz = (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;

/* ============================================================ constantes ============================================================ */
const SECTION_IDS = {
  hero: 'inicio', problema: 'problema', solucao: 'solution-section', superpoder: 'power-section', depoimentos: 'depoimentos',
  showcase: 'conteudo', modulos: 'modulos', autor: 'author-section', bonus: 'bonus', oferta: 'preco',
  garantia: 'guarantee-section', faq: 'faq', final: 'cta-final', footer: 'rodape',
};
const JARGON = /(?<![\p{L}\p{N}_])(localhost|npm|readme|build|deploy|manifest|issue|rollback|compil\p{L}*|commit|terminal|console|script|github|bug|debug|api|código-fonte|log)(?![\p{L}\p{N}_])/giu;
const FORBIDDEN = [
  [/frame_1171275331_1x\.webp/i, 'frame_1171275331_1x.webp (print sem máscara)'],
  [/Depoimento(?: |%20)01\.webp/i, 'Depoimento 01.webp'],
  [/NeuePowerTrial/i, 'NeuePowerTrial'],
  [/style\.min\.css/i, 'style.min.css'],
  [/iconify/i, 'iconify'],
  [/tsparticles/i, 'tsparticles'],
  [/pandavideo/i, 'pandavideo'],
];
const TRACK_START = '  <!-- TRACKING SCRIPTS (deferred to avoid blocking main thread) -->';
const BUDGET = { html: [70 * 1024, 90 * 1024], cssGz: [22 * 1024, 28 * 1024], jsGz: [45 * 1024, 55 * 1024] };

/* ============================================================ HTML: tokenizador + árvore ============================================================ */
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const INLINE = new Set('a abbr b del em i mark small span strong sub sup time u s label button'.split(' '));
const DROP = new Set(['script', 'style', 'svg', 'template']);
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', copy: '©', reg: '®',
  trade: '™', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', bdquo: '„', middot: '·', times: '×', rarr: '→',
  larr: '←', uarr: '↑', darr: '↓', harr: '↔', nearr: '↗', bull: '•', deg: '°', ordm: 'º', ordf: 'ª', euro: '€', shy: '­',
  zwj: '‍', zwnj: '‌', thinsp: ' ', ensp: ' ', emsp: ' ', check: '✓', cross: '✗', plus: '+',
};
function decode(s) {
  return String(s).replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) => {
    if (e[0] === '#') { const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(cp); } catch { return m; } }
    return ENT[e] ?? ENT[e.toLowerCase()] ?? m;
  });
}
function parseHTML(src) {
  const root = { type: 'el', tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const lower = src.toLowerCase();
  const n = src.length;
  const reTag = /<([a-zA-Z][\w:-]*)/y, reEnd = /<\/([a-zA-Z][\w:-]*)\s*>/y, reAttr = /\s*([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/y;
  let i = 0;
  const text = (s) => { if (s) stack[stack.length - 1].children.push({ type: 'text', value: s }); };
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) { text(src.slice(i)); break; }
    if (lt > i) text(src.slice(i, lt));
    if (src.startsWith('<!--', lt)) { const e = src.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (src[lt + 1] === '!' || src[lt + 1] === '?') { const e = src.indexOf('>', lt); i = e < 0 ? n : e + 1; continue; }
    if (src[lt + 1] === '/') {
      reEnd.lastIndex = lt; const m = reEnd.exec(src);
      if (!m) { text('<'); i = lt + 1; continue; }
      const tag = m[1].toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) if (stack[k].tag === tag) { stack.length = k; break; }
      i = reEnd.lastIndex; continue;
    }
    reTag.lastIndex = lt; const m = reTag.exec(src);
    if (!m) { text('<'); i = lt + 1; continue; }
    const tag = m[1].toLowerCase();
    const attrs = {};
    let j = reTag.lastIndex, selfClose = false;
    for (;;) {
      while (j < n && /\s/.test(src[j])) j++;
      if (j >= n) break;
      if (src[j] === '>') { j++; break; }
      if (src[j] === '/' && src[j + 1] === '>') { j += 2; selfClose = true; break; }
      if (src[j] === '/') { j++; continue; }
      reAttr.lastIndex = j; const a = reAttr.exec(src);
      if (!a || reAttr.lastIndex === j) { j++; continue; }
      attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
      j = reAttr.lastIndex;
    }
    const el = { type: 'el', tag, attrs, children: [], start: lt };
    stack[stack.length - 1].children.push(el);
    if (RAW.has(tag) && !selfClose) {
      const c = lower.indexOf('</' + tag, j); const e = c < 0 ? n : c;
      el.children.push({ type: 'text', value: src.slice(j, e), raw: true });
      const g = src.indexOf('>', e); i = g < 0 ? n : g + 1; continue;
    }
    if (!VOID.has(tag) && !selfClose) stack.push(el);
    i = j;
  }
  return root;
}
function* walk(node) { for (const c of node.children || []) { if (c.type === 'el') { yield c; yield* walk(c); } } }
const hasAttr = (el, k) => Object.prototype.hasOwnProperty.call(el.attrs, k);
const classes = (el) => (el.attrs.class || '').split(/\s+/).filter(Boolean);
function textContent(node) {
  if (node.type === 'text') return node.raw ? '' : decode(node.value);
  if (node.tag === 'script' || node.tag === 'style') return '';
  return (node.children || []).map(textContent).join('');
}
const norm = (s) => String(s).normalize('NFC').replace(/\s+/g, ' ').trim();

/* extrator do copy-lock (§6.3-2): (a) remove script/style/svg/template/comentários e subárvores data-ui / aria-hidden="true";
   (b) aria-label de elemento cujo conteúdo foi todo removido; (c) inline junta sem espaço, bloco e <br> viram espaço;
   (d) entidades decodificadas e espaços colapsados. keepUi/keepHidden = variante do lint de jargão. */
function extract(root, o = {}) {
  function emit(nd) {
    if (nd.type === 'text') return { s: nd.raw ? '' : decode(nd.value), removed: false };
    const tag = nd.tag;
    if (DROP.has(tag)) return { s: '', removed: true };
    // body[data-ui] é o tema da UI (§5.5), não marcador de microcopy
    if (!o.keepUi && tag !== 'body' && hasAttr(nd, 'data-ui')) return { s: '', removed: true };
    if (!o.keepHidden && nd.attrs['aria-hidden'] === 'true') return { s: '', removed: true };
    if (tag === 'br') return { s: ' ', removed: false };
    let inner = '', anyRemoved = false;
    for (const c of nd.children) { const r = emit(c); if (r.removed) anyRemoved = true; inner += r.s; }
    if (hasAttr(nd, 'aria-label') && anyRemoved && !inner.trim()) inner = ' ' + nd.attrs['aria-label'] + ' ';
    if (tag === '#root') return { s: inner, removed: false };
    return { s: INLINE.has(tag) ? inner : ' ' + inner + ' ', removed: false };
  }
  return norm(emit(root).s);
}
const textOf = (html, o) => extract(parseHTML(html), o);

/* ============================================================ URLs absolutas ============================================================ */
const fixUrl = (u) => u.replace(/^(?:\.\/)?((?:ASSETS|v2)\/)/, '/$1');
function rewriteHTML(s) {
  return s.replace(/(\s(?:src|href|data-src|data-src-m|data-print|poster|srcset)\s*=\s*)(["'])([^"']*)\2/gi, (m, pre, q, val) => {
    if (/srcset/i.test(pre)) val = val.split(',').map((c) => { const t = c.trim().split(/\s+/); t[0] = fixUrl(t[0]); return (c.match(/^\s*/)[0]) + t.join(' '); }).join(',');
    else val = fixUrl(val);
    return pre + q + val + q;
  });
}
const rewriteCSS = (s) => s.replace(/url\(\s*(["']?)(?:\.\/)?((?:ASSETS|v2)\/)/gi, 'url($1/$2');

/* ============================================================ montagem ============================================================ */
const order = JSON.parse(read(path.join(SRC, 'order.json')));
const ALL_SECTIONS = [...order.main, ...order.afterMain];
const secFiles = (name) => { const dir = path.join(SRC, 'sections', name); return { dir, html: path.join(dir, name + '.html'), css: path.join(dir, name + '.css'), js: path.join(dir, name + '.js') }; };
const wrapJs = (label, code) => `/* == ${label} == */\n;(function(){'use strict';\n${code}\n})();\n`;
const wrapCss = (label, code) => `/* == ${label} == */\n${code}\n`;
function partial(p, what) {
  if (!p) return '';
  const f = path.join(SRC, p);
  if (!exists(f)) { warn(`[build] ${what}: ${p} ausente (pulado)`); return ''; }
  return read(f);
}
function sectionParts(name) {
  const f = secFiles(name);
  const out = { name, html: null, css: '', js: '' };
  if (exists(f.html)) out.html = read(f.html); else warn(`[build] seção ${name}: ${name}.html ausente (pulado)`);
  if (exists(f.css)) out.css = read(f.css); else if (out.html != null) warn(`[build] seção ${name}: ${name}.css ausente (pulado)`);
  if (exists(f.js)) out.js = read(f.js); else if (out.html != null) warn(`[build] seção ${name}: ${name}.js ausente (pulado)`);
  return out;
}
function coreCss() { return order.css.map((p) => { const f = path.join(SRC, p); if (!exists(f)) { warn(`[build] css ${p} ausente`); return ''; } return wrapCss(p.replace(/^\.\.\//, 'v2/'), rewriteCSS(read(f))); }).join(''); }
function coreJs(list) { return list.map((p) => { const f = path.join(SRC, p); if (!exists(f)) { warn(`[build] js ${p} ausente`); return ''; } return wrapJs(p, read(f)); }).join(''); }

function headFor(kind, cssHref, jsHref) {
  let h = read(path.join(SRC, order.head));
  const vendors = order.vendor.map((v) => `<script defer src="/${v.replace(/^\//, '')}"></script>`).join('\n');
  h = h.replace('<!-- @@CSS -->', `<link rel="stylesheet" href="${cssHref}">`)
    .replace('<!-- @@SCRIPTS -->', `${vendors}\n<script defer src="${jsHref}"></script>`);
  if (kind === 'preview') {
    h = h.replace(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>\n?/g, '')    // sem 404 antes dos ícones existirem
      .replace(/<link[^>]+rel="preload"[^>]*>\n?/g, '')                        // sem aviso de preload não usado no preview
      .replace('</title>', '</title>\n<link rel="icon" href="data:,">')       // evita o pedido automático de /favicon.ico (404)
      .replace(/<html([^>]*)class="([^"]*)"/, (m, a, c) => `<html${a}class="${c} pre-skip"`);
    if (!/name="robots"/.test(h)) h = h.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  } else if (has('indexable')) {
    h = h.replace(/<meta name="robots" content="noindex">\n?/, '');
  }
  if (/<base\s/i.test(h)) err('[html] <base> no head.html (proibido: href="#x" navegaria para a raiz)');
  return h;
}

/* ============================================================ verificações ============================================================ */
function loadOffer() {
  const src = read(path.join(SRC, 'core/offer.js'));
  const m = /\/\*OFFER\*\/([\s\S]*?)\/\*\/OFFER\*\//.exec(src);
  if (!m) { err('[offer-lock] JSON entre /*OFFER*/ e /*/OFFER*/ não encontrado em core/offer.js'); return null; }
  try { return JSON.parse(m[1]); } catch (e) { err('[offer-lock] JSON do OFFER inválido: ' + e.message); return null; }
}
const numBR = (n, dec = 0) => { const [i, f] = Math.abs(+n).toFixed(dec).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec ? ',' + f : ''); };
const brl = (n, dec = 0) => 'R$ ' + numBR(n, dec);
function offerExpected(O, k) {
  let m;
  if ((m = /^item-(\d+)$/.exec(k)) && O.items[+m[1]]) return brl(O.items[+m[1]].value);
  if ((m = /^bonus-(\d+)$/.exec(k)) && O.bonus[+m[1]]) return brl(O.bonus[+m[1]].value);
  if (k === 'anchor') return brl(O.anchor);
  if (k === 'installment') return O.installments ? numBR(O.installments.value, 2) : null;
  if (k === 'cash') return numBR(O.cash.value, 2);
  if (k === 'from') return brl(O.from, 2);
  if (k === 'price') return numBR(O.cash.value, O.cash.value % 1 ? 2 : 0);
  return null;
}
function checkOffer(html, tree, mode, ofertaPresent) {
  const O = loadOffer(); if (!O) return;
  const sum = O.items.reduce((a, it) => a + it.value, 0);
  if (sum !== O.anchor) err(`[offer-lock] Σ itens (${sum}) ≠ anchor (${O.anchor})`);
  for (const el of walk(tree)) {
    if (!hasAttr(el, 'data-offer')) continue;
    const k = el.attrs['data-offer'], exp = offerExpected(O, k), got = norm(textContent(el));
    if (exp == null) err(`[offer-lock] data-offer="${k}" desconhecido`);
    else if (got !== exp) err(`[offer-lock] data-offer="${k}": "${got}" ≠ "${exp}"`);
  }
  const url = O.checkoutUrl;
  const hrefs = html.split(`href="${url}"`).length - 1;
  const bare = url.replace(/^https?:\/\//, '');
  const any = html.split(bare).length - 1;
  if (mode === 'full') {
    if (ofertaPresent && hrefs !== 1) err(`[offer-lock] ${hrefs} href="${url}" no HTML (exigido: exatamente 1, o do a[data-checkout="oferta"])`);
    if (!ofertaPresent && hrefs === 0) warn('[offer-lock] seção oferta ausente: nenhum link de checkout no HTML (ok só enquanto as seções não existem)');
    if (hrefs > 1) err(`[offer-lock] ${hrefs} links de checkout no HTML (exigido: 1)`);
  } else if (hrefs > 1) err(`[offer-lock] preview com ${hrefs} hrefs de checkout (máx. 1)`);
  if (any !== hrefs) err(`[offer-lock] a URL do checkout aparece ${any - hrefs}× fora de href="…" (proibido; ex.: JSON-LD)`);
  for (const el of walk(tree)) {
    if (el.tag !== 'a' || !/ticto/i.test(el.attrs.href || '')) continue;
    if (el.attrs.href !== url) err(`[offer-lock] a[href*=ticto] com href "${el.attrs.href}" ≠ "${url}"`);
    if (mode === 'full' && ofertaPresent && el.attrs['data-checkout'] !== 'oferta') err('[offer-lock] o link de checkout do HTML-fonte deve ser o a[data-checkout="oferta"]');
  }
}

function checkCopy(tree, strings, label, asWarning) {
  const text = extract(tree);
  const miss = strings.filter((s) => !text.includes(norm(s)));
  miss.forEach((s) => (asWarning ? warn : err)(`[copy-lock] ${label}: ausente "${norm(s)}"`));
  return miss;
}
function checkJargon(tree, label) {
  const parts = [extract(tree, { keepUi: true, keepHidden: true })];
  for (const el of walk(tree)) { if (el.attrs['aria-label']) parts.push(el.attrs['aria-label']); if (el.tag === 'img' && el.attrs.alt) parts.push(el.attrs.alt); }
  const hits = new Set();
  for (const p of parts) for (const m of p.matchAll(JARGON)) hits.add(m[1].toLowerCase());
  if (hits.size) err(`[jargão] ${label}: termo(s) de programador visível(is): ${[...hits].join(', ')} (§1.3-4)`);
}
function checkIds(tree, label) {
  const seen = new Map();
  for (const el of walk(tree)) {
    const id = el.attrs.id; if (!id) continue;
    seen.set(id, (seen.get(id) || 0) + 1);
  }
  for (const [id, c] of seen) if (c > 1) err(`[ids] ${label}: id "${id}" duplicado (${c}×)`);
  for (const el of walk(tree)) if (el.tag === 'section' && hasAttr(el, 'data-kicker') && !/^\d{2}$/.test(el.attrs['data-kicker'])) err(`[ids] data-kicker="${el.attrs['data-kicker']}" precisa de 2 dígitos`);
  return seen;
}
function checkSectionRoot(name, src) {
  const tree = parseHTML(src);
  const tops = tree.children.filter((c) => c.type === 'el');
  const root = tops.find((e) => classes(e).includes('s-' + name));
  if (!root) { err(`[ids] seção ${name}: raiz com class="s-${name}" não encontrada no topo de ${name}.html`); return; }
  const want = SECTION_IDS[name];
  if (want && root.attrs.id !== want) err(`[ids] seção ${name}: id da raiz "${root.attrs.id || ''}" ≠ "${want}"`);
}
function checkForbidden(s, label) {
  for (const [re, what] of FORBIDDEN) if (re.test(s)) err(`[proibido] ${label}: referência a ${what}`);
  if (/<video\b[^>]*\sposter\s*=/i.test(s)) err(`[proibido] ${label}: atributo poster em <video> (use img.vid-poster)`);
  if (/<base\s/i.test(s)) err(`[proibido] ${label}: <base>`);
  const relUrl = s.match(/\s(?:src|href|data-src|data-src-m|data-print|srcset|poster)\s*=\s*["'](?:\.\/)?(?:ASSETS|v2)\//gi);
  if (relUrl) err(`[proibido] ${label}: ${relUrl.length} URL(s) relativa(s) ASSETS/ ou v2/ remanescente(s)`);
  if (/url\(\s*["']?(?:\.\/)?(?:ASSETS|v2)\//i.test(s) || /url\(\s*["']?\.\.\//i.test(s)) err(`[proibido] ${label}: url() relativa no CSS (use /ASSETS/… ou /v2/…)`);
  if (/\s(?:src|href|data-src|data-src-m|data-print|srcset)\s*=\s*["']\.\.\//i.test(s)) err(`[proibido] ${label}: URL relativa "../" (use /ASSETS/… ou /v2/…)`);
  /* /v2/img tem cache imutável de 1 ano (vercel.json): toda referência precisa de ?v= (trocou o arquivo ⇒ aumente o ?v=) */
  const noVer = s.match(/\/v2\/img\/[^"'\s?)]+(?=["'\s)])/g);
  if (noVer) err(`[proibido] ${label}: ${noVer.length} URL(s) de /v2/img sem ?v= (${[...new Set(noVer)].slice(0, 3).join(', ')})`);
}
function checkMediaAttrs(tree, label) {
  for (const el of walk(tree)) if ((el.tag === 'img' || el.tag === 'video') && (!hasAttr(el, 'width') || !hasAttr(el, 'height'))) warn(`[mídia] ${label}: <${el.tag}${el.attrs.class ? ' class="' + el.attrs.class + '"' : ''}> sem width/height`);
}
/* lint de CSS de seção (avisos): escopo .s-<nome>, literais de cor, !important */
function lintSectionCss(name, css) {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const scope = '.s-' + name;
  let bad = 0, colors = 0, imp = 0;
  (function block(txt, skip) {
    let i = 0;
    while (i < txt.length) {
      const o = txt.indexOf('{', i); if (o < 0) break;
      const head = txt.slice(i, o).trim();
      let depth = 1, j = o + 1; while (j < txt.length && depth) { if (txt[j] === '{') depth++; else if (txt[j] === '}') depth--; j++; }
      const body = txt.slice(o + 1, j - 1);
      if (head.startsWith('@')) {
        if (/^@(media|supports|container|layer)\b/i.test(head)) block(body, false);
      } else if (!skip) {
        head.split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean).forEach((sel) => {
          const clean = sel.replace(/^:where\(|^:is\(/, '').replace(/^(html(?:\.[\w-]+|\[[^\]]+\])*|body(?:\.[\w-]+|\[[^\]]+\])*)\s+/, '');
          if (!clean.startsWith(scope)) { bad++; if (bad <= 5) warn(`[css] seção ${name}: seletor fora do escopo ${scope}: "${sel}"`); }
        });
        if (/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(\s*\d/i.test(body)) colors++;
        if (/!important/i.test(body)) imp++;
      }
      i = j;
    }
  })(s, false);
  if (bad > 5) warn(`[css] seção ${name}: +${bad - 5} seletor(es) fora do escopo`);
  if (colors) warn(`[css] seção ${name}: ${colors} regra(s) com literal de cor (use tokens var(--x))`);
  if (imp) warn(`[css] seção ${name}: ${imp} regra(s) com !important`);
}
function extractTrackingBlock(html) {
  const a = html.indexOf(TRACK_START); if (a < 0) return null;
  const b = html.indexOf('</noscript>', a); if (b < 0) return null;
  return html.slice(a, b + '</noscript>'.length);
}
function checkTracking(finalHtml) {
  const snapP = path.join(SRC, 'tracking.v1.html');
  if (!exists(snapP)) { err('[tracking] v2/src/tracking.v1.html ausente'); return; }
  const snap = read(snapP);
  const tail = read(path.join(SRC, order.tail));
  if (!tail.includes(snap)) err('[tracking] tail.html não contém tracking.v1.html byte a byte');
  if (finalHtml && !finalHtml.includes(snap)) err('[tracking] index-v2.html não contém o bloco de tracking da v1');
  let srcName = null, srcHtml = null;
  if (exists(path.join(ROOT, 'classic.html'))) { srcName = 'classic.html'; srcHtml = read(path.join(ROOT, 'classic.html')); }
  else if (exists(path.join(ROOT, 'index.html'))) {
    const idx = read(path.join(ROOT, 'index.html'));
    if (!idx.includes('v2/dist/')) { srcName = 'index.html'; srcHtml = idx; }
  }
  if (!srcHtml) { warn('[tracking] sem fonte v1 para conferir o snapshot (classic.html ausente e index.html já é a v2)'); return; }
  const block = extractTrackingBlock(srcHtml);
  if (!block) err(`[tracking] bloco de tracking não encontrado em /${srcName}`);
  else if (block !== snap) err(`[tracking] tracking.v1.html ≠ trecho de /${srcName} (byte a byte)`);
}

/* ============================================================ minificação ============================================================ */
function minify(code, loader) {
  if (has('no-minify')) return { code, min: false };
  const r = spawnSync('npx', ['--yes', 'esbuild@0.24.0', '--minify', '--loader=' + loader, '--log-level=error'], { input: code, encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024 * 1024 });
  if (r.status === 0 && r.stdout && r.stdout.length > code.length * .2) return { code: r.stdout, min: true };
  warn(`[build] minificação ${loader} indisponível (${r.error ? r.error.code || r.error.message : (r.stderr || '').trim().split('\n')[0] || 'status ' + r.status}); usando o texto concatenado`);
  return { code, min: false };
}

/* ============================================================ copy-lock ============================================================ */
function loadCopyLock() {
  const p = path.join(SRC, 'copy-lock.json');
  if (!exists(p)) { err('[copy-lock] v2/src/copy-lock.json ausente'); return { global: [], sections: {} }; }
  try { return JSON.parse(read(p)); } catch (e) { err('[copy-lock] JSON inválido: ' + e.message); return { global: [], sections: {} }; }
}

/* ============================================================ modos ============================================================ */
function report(title) {
  warns.forEach((m) => console.log('  aviso · ' + m));
  errors.forEach((m) => console.log('  ERRO  · ' + m));
  console.log(`[build] ${title}: ${errors.length ? errors.length + ' erro(s)' : 'ok'} · ${warns.length} aviso(s)`);
  return errors.length ? 1 : 0;
}

function buildFull() {
  const lock = has('no-lock') ? null : loadCopyLock();
  const parts = ALL_SECTIONS.map(sectionParts);
  const present = parts.filter((p) => p.html != null);
  const coreTop = partial(order.coreTop, 'coreTop'), chromeTop = partial(order.chromeTop, 'chromeTop'), chromeBottom = partial(order.chromeBottom, 'chromeBottom');
  const stub = /@@F0B-STUB/.test(chromeTop);

  // CSS / JS
  let css = coreCss() + present.map((p) => (p.css ? wrapCss('sections/' + p.name + '/' + p.name + '.css', rewriteCSS(p.css)) : '')).join('');
  let js = coreJs(order.jsCore) + present.map((p) => (p.js ? wrapJs('sections/' + p.name + '/' + p.name + '.js', p.js) : '')).join('') + coreJs([order.jsBoot]);
  const mc = minify(css, 'css'), mj = minify(js, 'js');
  css = mc.code; js = mj.code;
  const hc = crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);
  const hj = crypto.createHash('sha256').update(js).digest('hex').slice(0, 10);
  const cssName = `wdf.${hc}.css`, jsName = `wdf.${hj}.js`;

  // HTML
  const mainSecs = present.filter((p) => order.main.includes(p.name)).map((p) => rewriteHTML(p.html).trim()).join('\n');
  const after = present.filter((p) => order.afterMain.includes(p.name)).map((p) => rewriteHTML(p.html).trim()).join('\n');
  // CSS embutido no <head> (24 KB gzip): elimina o único pedido que bloqueia a renderização (Lighthouse: render-blocking)
  const html = headFor('full', `/v2/dist/${cssName}`, `/v2/dist/${jsName}`).replace(`<link rel="stylesheet" href="/v2/dist/${cssName}">`, () => `<style>${css}</style>`)
    + rewriteHTML(coreTop) + rewriteHTML(chromeTop)
    + `<main id="main">\n${mainSecs}\n</main>\n` + (after ? after + '\n' : '')
    + rewriteHTML(chromeBottom) + read(path.join(SRC, order.tail));

  // verificações
  const tree = parseHTML(html);
  checkTracking(html);
  checkIds(tree, 'index-v2.html');
  present.forEach((p) => checkSectionRoot(p.name, p.html));
  ALL_SECTIONS.filter((n) => !present.some((p) => p.name === n)).forEach((n) => warn(`[ids] #${SECTION_IDS[n]} ausente (seção ${n} não montada)`));
  checkJargon(tree, 'index-v2.html');
  checkForbidden(html, 'index-v2.html'); checkForbidden(css, 'css'); checkForbidden(js, 'js');
  present.forEach((p) => { checkMediaAttrs(parseHTML(p.html), p.name); if (p.css) lintSectionCss(p.name, p.css); });
  if (lock) {
    checkCopy(tree, lock.global || [], 'global (nav/CTA)', stub);
    present.forEach((p) => checkCopy(parseHTML(p.html), (lock.sections || {})[p.name] || [], p.name, false));
    checkOffer(html, tree, 'full', present.some((p) => p.name === 'oferta'));
  } else warn('[build] --no-lock: copy-lock e offer-lock PULADOS (rascunho; nunca na entrega)');

  // orçamentos
  const sz = { html: Buffer.byteLength(html), css: Buffer.byteLength(css), js: Buffer.byteLength(js), cssGz: gz(css), jsGz: gz(js) };
  if (sz.html > BUDGET.html[1]) warn(`[orçamento] HTML ${kb(sz.html)} > limite ${kb(BUDGET.html[1])}`); else if (sz.html > BUDGET.html[0]) warn(`[orçamento] HTML ${kb(sz.html)} > alvo ${kb(BUDGET.html[0])}`);
  if (sz.cssGz > BUDGET.cssGz[1]) warn(`[orçamento] CSS gzip ${kb(sz.cssGz)} > limite ${kb(BUDGET.cssGz[1])}`); else if (sz.cssGz > BUDGET.cssGz[0]) warn(`[orçamento] CSS gzip ${kb(sz.cssGz)} > alvo`);
  if (sz.jsGz > BUDGET.jsGz[1]) warn(`[orçamento] JS gzip ${kb(sz.jsGz)} > limite ${kb(BUDGET.jsGz[1])}`); else if (sz.jsGz > BUDGET.jsGz[0]) warn(`[orçamento] JS gzip ${kb(sz.jsGz)} > alvo`);

  if (errors.length) return report('full (nada escrito)');
  const dist = path.join(V2, 'dist');
  fs.mkdirSync(dist, { recursive: true });
  for (const f of fs.readdirSync(dist)) if (/^wdf\.[0-9a-f]{10}\.(css|js)$/.test(f) && f !== cssName && f !== jsName) fs.unlinkSync(path.join(dist, f));
  fs.writeFileSync(path.join(dist, cssName), css);
  fs.writeFileSync(path.join(dist, jsName), js);
  fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify({ version: order.version, css: cssName, js: jsName, gzip: { css: sz.cssGz, js: sz.jsGz }, sections: present.map((p) => p.name), minified: mc.min && mj.min, builtAt: new Date().toISOString() }, null, 2) + '\n');
  fs.writeFileSync(path.join(ROOT, 'index-v2.html'), html);
  console.log(`[build] full · ${present.length}/${ALL_SECTIONS.length} seções montadas${present.length ? ' (' + present.map((p) => p.name).join(', ') + ')' : ''}`);
  console.log(`[build] index-v2.html ${kb(sz.html)} · ${cssName} ${kb(sz.css)} (gzip ${kb(sz.cssGz)}) · ${jsName} ${kb(sz.js)} (gzip ${kb(sz.jsGz)})${mc.min && mj.min ? '' : ' · sem minificação'}`);
  return report('full');
}

function buildSection(name) {
  const known = ALL_SECTIONS.includes(name) || name === '_exemplo';
  if (!known) { err(`[build] --section ${name}: nome desconhecido (use um de order.json ou _exemplo)`); return report('preview'); }
  const p = sectionParts(name);
  if (p.html == null) { err(`[build] --section ${name}: sections/${name}/${name}.html não existe`); return report('preview'); }
  const lock = has('no-lock') ? null : loadCopyLock();
  const coreTop = partial(order.coreTop, 'coreTop'), chromeTop = partial(order.chromeTop, 'chromeTop'), chromeBottom = partial(order.chromeBottom, 'chromeBottom');
  const css = coreCss() + (p.css ? wrapCss(`sections/${name}/${name}.css`, rewriteCSS(p.css)) : '');
  const js = coreJs(order.jsCore) + (p.js ? wrapJs(`sections/${name}/${name}.js`, p.js) : '') + coreJs([order.jsBoot]);
  const pad = `<div class="preview-pad" style="height:100svh;display:grid;place-items:center;background:#111;color:#666;font:12px monospace">PREVIEW · ${name}</div>`;
  const isFirst = order.main[0] === name;
  const isAfter = order.afterMain.includes(name);
  const secHtml = rewriteHTML(p.html).trim();
  const bodyMain = isAfter
    ? `<main id="main">\n${pad}\n</main>\n${secHtml}\n${pad}\n`
    : `<main id="main">\n${isFirst ? '' : pad + '\n'}${secHtml}\n${pad}\n</main>\n`;
  const html = headFor('preview', `/v2/preview/${name}.css`, `/v2/preview/${name}.js`)
    + rewriteHTML(coreTop) + rewriteHTML(chromeTop) + bodyMain + rewriteHTML(chromeBottom) + '</body>\n</html>\n';
  const nojs = html.replace(/<script\b[\s\S]*?<\/script>\n?/gi, '');

  const tree = parseHTML(html);
  if (name !== '_exemplo') checkSectionRoot(name, p.html);
  checkIds(tree, `preview ${name}`);
  checkJargon(parseHTML(p.html), name);
  checkForbidden(html, `preview ${name}`); checkForbidden(p.css, `${name}.css`);
  checkMediaAttrs(parseHTML(p.html), name);
  if (p.css) lintSectionCss(name, p.css);
  if (lock) {
    checkCopy(parseHTML(p.html), (lock.sections || {})[name] || [], name, false);
    checkOffer(html, parseHTML(p.html), 'preview', false);
  } else warn('[build] --no-lock: copy-lock e offer-lock PULADOS');

  const out = path.join(V2, 'preview');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, name + '.html'), html);
  fs.writeFileSync(path.join(out, name + '-nojs.html'), nojs);
  fs.writeFileSync(path.join(out, name + '.css'), css);
  fs.writeFileSync(path.join(out, name + '.js'), js);
  console.log(`[build] preview ${name}: http://localhost:8080/v2/preview/${name}.html · …/${name}-nojs.html · CSS ${kb(css.length)} · JS ${kb(js.length)}`);
  return report(`preview ${name}`);
}

/* ============================================================ autoteste ============================================================ */
function selftest() {
  let fails = 0;
  const ok = (cond, msg) => { if (cond) console.log('  ok   · ' + msg); else { fails++; console.log('  FALHA· ' + msg); } };
  const fx = path.join(SRC, 'sections', '_exemplo', 'fixtures');
  const expect = JSON.parse(read(path.join(fx, 'expect.json')));
  const lock = loadCopyLock();
  for (const [name, strings] of Object.entries(expect)) {
    const src = read(path.join(fx, name + '.html'));
    const locked = (lock.sections || {})[name] || [];
    strings.forEach((s) => ok(locked.some((l) => norm(l).includes(norm(s))), `${name}: "${norm(s).slice(0, 60)}" pertence ao copy-lock real da seção`));
    const text = textOf(src);
    const miss = strings.filter((s) => !text.includes(norm(s)));
    ok(miss.length === 0, `${name}: esqueleto verbatim do spec APROVADO pelo extrator${miss.length ? ' — faltou: ' + miss.map((x) => '"' + x + '"').join(', ') : ''}`);
    const longest = [...strings].sort((a, b) => b.length - a.length)[0];            // adultera 1 palavra da frase mais longa
    const target = norm(longest).split(' ').filter((wd) => /^[\p{L}]{5,}$/u.test(wd) && src.includes(wd)).sort((a, b) => b.length - a.length)[0];
    const tampered = src.replace(target, target.slice(0, -1) + (target.slice(-1) === 'x' ? 'y' : 'x'));   // só a 1ª ocorrência
    const tmiss = strings.filter((s) => !textOf(tampered).includes(norm(s)));
    ok(tmiss.length > 0, `${name}: cópia adulterada ("${target}" → 1 letra trocada) REPROVADA`);
  }
  // casos de fronteira do extrator (§6.3-2)
  ok(textOf('<h1 aria-label="Se torne um web designer do FUTURO"><span aria-hidden="true">x</span><span aria-hidden="true">y</span></h1>') === 'Se torne um web designer do FUTURO', 'aria-label de elemento todo oculto');
  ok(textOf('<h2>O problema brutal de ignorar os <em>agentes de IA</em>.</h2>') === 'O problema brutal de ignorar os agentes de IA.', 'inline junta sem espaço (<em>)');
  ok(textOf('<p>Aperte para sentir a diferença entre entregar <br>um site comum</p>') === 'Aperte para sentir a diferença entre entregar um site comum', '<br> vira espaço');
  ok(textOf('<p>A<span data-ui>UI</span>B<i aria-hidden="true">z</i>C</p><div>D</div>') === 'ABC D', 'data-ui/aria-hidden removidos; bloco separa');
  ok(textOf('<p>R&nbsp;$&#32;2.088 &amp; &quot;x&quot;</p>') === 'R $ 2.088 & "x"', 'entidades decodificadas');
  ok(textOf('<svg><text>no</text></svg><script>no</script><style>no</style><template>no</template><!-- no -->ok') === 'ok', 'svg/script/style/template/comentários removidos');
  // jargão
  ok([...('Sistema pronto; log in; catálogo; blog').matchAll(JARGON)].map((m) => m[1]).join() === 'log', 'jargão: palavra inteira, Unicode-aware');
  // offer
  const O = loadOffer();
  ok(O && O.items.reduce((a, i) => a + i.value, 0) === O.anchor && offerExpected(O, 'anchor') === 'R$ 2.088' && offerExpected(O, 'installment') === '10,03' && offerExpected(O, 'cash') === '97,00' && offerExpected(O, 'from') === 'R$ 997,00', 'OFFER: soma 2.088 e formatos R$ 2.088 · 10,03 · 97,00 · De R$ 997,00');
  // tracking
  const before = errors.length; checkTracking(null);
  ok(errors.length === before, 'tracking.v1.html ⊂ tail.html e idêntico ao trecho da v1');
  errors.length = before;
  console.log(`[build] selftest: ${fails ? fails + ' falha(s)' : 'tudo aprovado'}`);
  return fails ? 1 : 0;
}

/* ============================================================ main ============================================================ */
let code;
if (has('selftest')) code = selftest();
else if (has('section')) code = buildSection(opt('section') || '');
else code = buildFull();
process.exit(code);
