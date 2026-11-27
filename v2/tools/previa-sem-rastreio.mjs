// Prévia local SEM rastreio (27/11/2026): serve uma pasta e troca, no HTML e no JS, os domínios do Pixel, Clarity, Google e
// lead tracker por um endereço inválido (nada é enviado). Uso: node previa-sem-rastreio.mjs <pasta> <porta>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [pasta, porta] = [path.resolve(process.argv[2]), Number(process.argv[3])];
const BLOQ = ['connect.facebook.net', 'www.facebook.com', 'www.clarity.ms', 'www.googletagmanager.com', 'lead-tracker-three-xi.vercel.app'];
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let p = path.join(pasta, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(pasta)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = fs.existsSync(path.join(p, 'index-v2.html')) ? path.join(p, 'index-v2.html') : path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(p), tipo = TIPOS[ext] || 'application/octet-stream';
  if (ext === '.html' || ext === '.js') {
    let s = fs.readFileSync(p, 'utf8');
    for (const d of BLOQ) s = s.split(d).join('rastreio-desligado.invalid');
    res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
    return res.end(s);
  }
  const { size } = fs.statSync(p), range = req.headers.range;
  if (range) {
    const [a, b] = range.replace('bytes=', '').split('-'), ini = Number(a), fim = b ? Number(b) : size - 1;
    res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${ini}-${fim}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': fim - ini + 1 });
    return fs.createReadStream(p, { start: ini, end: fim }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
  fs.createReadStream(p).pipe(res);
}).listen(porta, () => console.log('prévia sem rastreio em http://127.0.0.1:' + porta));
