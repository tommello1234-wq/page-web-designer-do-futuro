#!/usr/bin/env python3
"""make-posters.py — poster WebP de um vídeo (§7.2): 1 frame em t segundos, recorte central no aspecto w:h,
redimensionado para w×h e salvo em WebP (qualidade inicial 72, reduzida até caber em --max KB).

Uso:
  python3 v2/tools/make-posters.py <video> <t> <saida.webp> [w h] [--q 72] [--max 45]
  ex.: python3 v2/tools/make-posters.py ASSETS/videos-paginas/01.mp4 0.4 v2/img/posters/sc-01.webp 960 540

ffmpeg: variável FFMPEG, senão o ffmpeg-static do scratchpad da sessão (se existir), senão 'ffmpeg' do PATH.
Nunca sobrescreve arquivos existentes em ASSETS/ (só grava onde você mandar; posters vivem em v2/img/posters/).
"""
import os, sys, glob, shutil, subprocess, tempfile
from PIL import Image


def find_ffmpeg():
    if os.environ.get('FFMPEG') and os.path.exists(os.environ['FFMPEG']):
        return os.environ['FFMPEG']
    for p in glob.glob('/private/tmp/claude-*/*/*/scratchpad/node_modules/ffmpeg-static/ffmpeg'):
        return p
    return shutil.which('ffmpeg') or 'ffmpeg'


def main(argv):
    args, opts = [], {'q': 72, 'max': 45}
    i = 0
    while i < len(argv):
        if argv[i] in ('--q', '--max'):
            opts[argv[i][2:]] = int(argv[i + 1]); i += 2
        else:
            args.append(argv[i]); i += 1
    if len(args) < 3:
        print(__doc__); return 2
    video, t, out = args[0], float(args[1]), args[2]
    w, h = (int(args[3]), int(args[4])) if len(args) >= 5 else (960, 540)
    if os.path.abspath(out).split(os.sep).count('ASSETS') and os.path.exists(out):
        print('recusado: não sobrescrevo arquivo existente em ASSETS/'); return 1
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'f.png')
        r = subprocess.run([find_ffmpeg(), '-v', 'error', '-ss', str(t), '-i', video, '-frames:v', '1', '-y', png],
                           capture_output=True, text=True)
        if r.returncode != 0 or not os.path.exists(png):
            print('ffmpeg falhou:', r.stderr.strip()); return 1
        im = Image.open(png).convert('RGB')
    sw, sh = im.size
    target = w / h
    if sw / sh > target:                        # recorte central no aspecto pedido
        nw = round(sh * target); x = (sw - nw) // 2; im = im.crop((x, 0, x + nw, sh))
    else:
        nh = round(sw / target); y = (sh - nh) // 2; im = im.crop((0, y, sw, y + nh))
    im = im.resize((w, h), Image.LANCZOS)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    q = opts['q']
    while True:
        im.save(out, 'WEBP', quality=q, method=6)
        kb = os.path.getsize(out) / 1024
        if kb <= opts['max'] or q <= 40:
            break
        q -= 4
    print(f'{out}: {w}x{h} · q{q} · {kb:.1f} KB')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
