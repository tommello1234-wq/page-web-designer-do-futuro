#!/usr/bin/env node
/* make-icons.mjs — rasteriza v2/img/favicon.svg (§7.4) com o Chrome headless:
     v2/img/favicon-32.png        32×32, badge ocupando o quadro (cantos transparentes)
     v2/img/apple-touch-icon.png  180×180, fundo #0A0A0A, badge centrado com margem de 22px
   Uso: node v2/tools/make-icons.mjs [--pptr <pasta node_modules com puppeteer-core>] [--chrome <executável>]
   Zero dependência no projeto: o puppeteer-core vem de --pptr, da variável PPTR_DIR ou do scratchpad da sessão
   (<scratchpad>/tools/node_modules), o mesmo usado pelo shoot.mjs. Nunca escreve fora de v2/img/. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const V2 = path.resolve(HERE, '..');
const IMG = path.join(V2, 'img');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };

function findPptrDirs() {
  const dirs = [opt('pptr'), process.env.PPTR_DIR].filter(Boolean);
  const tmp = '/private/tmp';
  try {
    for (const a of fs.readdirSync(tmp).filter((n) => n.startsWith('claude-'))) {
      for (const b of fs.readdirSync(path.join(tmp, a))) {
        for (const c of fs.readdirSync(path.join(tmp, a, b))) {
          const p = path.join(tmp, a, b, c, 'scratchpad', 'tools', 'node_modules');
          if (fs.existsSync(path.join(p, 'puppeteer-core'))) dirs.push(p);
        }
      }
    }
  } catch (e) { /* sem scratchpad */ }
  return dirs;
}
async function loadPuppeteer() {
  try { return (await import('puppeteer-core')).default; } catch (e) { /* segue */ }
  for (const dir of findPptrDirs()) {
    try { const req = createRequire(path.join(dir, 'noop.js')); return req('puppeteer-core'); } catch (e) { /* próximo */ }
  }
  throw new Error('puppeteer-core não encontrado (use --pptr <node_modules> ou PPTR_DIR)');
}

const svg = fs.readFileSync(path.join(IMG, 'favicon.svg'), 'utf8');
const svgUri = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
const page = (size, bg, pad) => `<!doctype html><html><head><style>
  html,body{margin:0;width:${size}px;height:${size}px;background:${bg};overflow:hidden}
  img{position:absolute;left:${pad}px;top:${pad}px;width:${size - 2 * pad}px;height:${size - 2 * pad}px}
</style></head><body><img src="${svgUri}"></body></html>`;

const puppeteer = await loadPuppeteer();
const browser = await puppeteer.launch({
  executablePath: opt('chrome') || process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-first-run', '--no-default-browser-check', '--hide-scrollbars'],
});
try {
  const jobs = [
    { file: 'favicon-32.png', size: 32, bg: 'transparent', pad: 0 },
    { file: 'apple-touch-icon.png', size: 180, bg: '#0A0A0A', pad: 22 },
  ];
  for (const j of jobs) {
    const p = await browser.newPage();
    await p.setViewport({ width: j.size, height: j.size, deviceScaleFactor: 1 });
    await p.setContent(page(j.size, j.bg, j.pad), { waitUntil: 'load' });
    await p.evaluate(() => document.querySelector('img').decode());
    const out = path.join(IMG, j.file);
    await p.screenshot({ path: out, omitBackground: j.bg === 'transparent', clip: { x: 0, y: 0, width: j.size, height: j.size } });
    await p.close();
    console.log(`[icons] ${path.relative(process.cwd(), out)} ${j.size}×${j.size} · ${fs.statSync(out).size} B`);
  }
} finally {
  await browser.close();
}
