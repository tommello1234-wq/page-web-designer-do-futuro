#!/usr/bin/env python3
"""make-og.py — imagem de compartilhamento v2/img/og-1200x630.jpg (§7.4), só com PIL.

Composição: fundo flame #FF5A1F com os glows do hero; "FUTURO" em NeuePower (ink) com 1100px de largura no topo;
frame_0135 (armadura, olhos acesos) centrado na base com 560px de altura, À FRENTE das letras; badge "IA" do logo
no canto superior esquerdo. JPEG q82 (reduz a qualidade até caber em 180 KB).

Uso: python3 v2/tools/make-og.py [--out v2/img/og-1200x630.jpg]
Lê (somente leitura): ASSETS/fonts/NeuePower-Ultra.ttf, ASSETS/FRAMES/frame_0135.webp. Nunca escreve em ASSETS/.
"""
import io, os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'v2', 'img', 'og-1200x630.jpg')
if '--out' in sys.argv:
    OUT = os.path.abspath(sys.argv[sys.argv.index('--out') + 1])
FONT = os.path.join(ROOT, 'ASSETS', 'fonts', 'NeuePower-Ultra.ttf')
FRAME = os.path.join(ROOT, 'ASSETS', 'FRAMES', 'frame_0135.webp')
W, H = 1200, 630
FLAME = (255, 90, 31); INK = (10, 10, 10)
GLOW = (255, 236, 214); EYE_MID = (255, 170, 110); DEEP = (90, 20, 0)
IA_PATH = ('M9.84978 14.1719H12.3991V34H9.84978V14.1719ZM29.3491 14.1719L37.252 34H34.4761L32.5499 29.1279H20.3981'
           'L18.3303 34H15.5544L23.9955 14.1719H26.6864L21.2479 26.8619H31.7285L26.6864 14.1719H29.3491Z')


def radial(size, cx, cy, rx, ry, color, alpha, stop):
    """camada RGBA com gradiente elíptico color@alpha → transparente em `stop` (fração do raio)."""
    w, h = size
    m = Image.new('L', (w // 4, h // 4))
    px = m.load()
    for y in range(m.size[1]):
        for x in range(m.size[0]):
            dx = (x * 4 - cx) / rx; dy = (y * 4 - cy) / ry
            d = (dx * dx + dy * dy) ** .5
            t = max(0.0, 1 - d / stop)
            px[x, y] = int(255 * alpha * t * t * (3 - 2 * t))
    m = m.resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(6))
    lay = Image.new('RGBA', size, color + (0,))
    lay.putalpha(m)
    return lay


def svg_polys(d, scale, ox, oy):
    """parser mínimo (M/L/H/V/Z absolutos) → lista de polígonos."""
    polys, cur, x, y = [], [], 0.0, 0.0
    for cmd, nums in re.findall(r'([MLHVZ])([^MLHVZ]*)', d):
        v = [float(n) for n in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?', nums)]
        if cmd == 'M':
            if cur: polys.append(cur)
            x, y = v[0], v[1]; cur = [(x, y)]
        elif cmd == 'L':
            for i in range(0, len(v), 2): x, y = v[i], v[i + 1]; cur.append((x, y))
        elif cmd == 'H':
            for n in v: x = n; cur.append((x, y))
        elif cmd == 'V':
            for n in v: y = n; cur.append((x, y))
        elif cmd == 'Z':
            if cur: polys.append(cur); cur = []
    if cur: polys.append(cur)
    return [[(ox + px * scale, oy + py * scale) for px, py in p] for p in polys]


def badge(size):
    """badge do logo (47×47, rx 8, gradiente #FF8400 → #A600FF da direita para a esquerda) + "IA" branco, 4× supersample."""
    S = size * 4
    grad = Image.new('RGB', (S, 1))
    a, b = (166, 0, 255), (255, 132, 0)          # x=0 violeta … x=47 laranja (paint1: x1=47 → x2=0)
    for x in range(S):
        t = x / (S - 1)
        grad.putpixel((x, 0), tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    grad = grad.resize((S, S))
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(8 / 47 * S), fill=255)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    dr = ImageDraw.Draw(out)
    for p in svg_polys(IA_PATH, S / 47, 0, 0):
        dr.polygon(p, fill=(255, 255, 255, 255))
    return out.resize((size, size), Image.LANCZOS)


def main():
    img = Image.new('RGBA', (W, H), FLAME + (255,))
    # glows do hero (§4.1 .hero-glow): luz branca alta + fundo queimado na base
    img = Image.alpha_composite(img, radial((W, H), W * .5, H * .42, W * .62, H * .78, (255, 255, 255), .16, 1.0))
    img = Image.alpha_composite(img, radial((W, H), W * .5, H * 1.08, W * .72, H * .66, DEEP, .38, 1.0))

    # FUTURO: 1100px de largura, ink, no topo
    target = 1100
    size = 300
    for _ in range(12):
        f = ImageFont.truetype(FONT, size)
        l, t, r, b = f.getbbox('FUTURO')
        size = max(40, int(size * target / (r - l)))
    f = ImageFont.truetype(FONT, size)
    l, t, r, b = f.getbbox('FUTURO')
    tx = (W - (r - l)) // 2 - l
    ty = 118 - t
    ImageDraw.Draw(img).text((tx, ty), 'FUTURO', font=f, fill=INK + (255,))

    # armadura (frame 135) centrada na base, 560px de altura, à frente das letras
    fr = Image.open(FRAME).convert('RGBA')
    fh = 560; fw = round(fr.width * fh / fr.height)
    fr = fr.resize((fw, fh), Image.LANCZOS)
    fx, fy = (W - fw) // 2, H - fh
    img.alpha_composite(fr, (fx, fy))
    # olhos acesos (EYES do motor de frames, frame-space 900×864), brilho em "screen"
    k = fh / 864
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    for ex, ey in ((385, 352), (520, 352)):
        cx, cy = fx + ex * k, fy + ey * k
        black = Image.new('RGBA', (W, H), (0, 0, 0, 255))
        g1 = Image.alpha_composite(black, radial((W, H), cx, cy, 34, 34, GLOW, .95, 1.0)).convert('RGB')
        g2 = Image.alpha_composite(black, radial((W, H), cx, cy, 70, 70, EYE_MID, .5, 1.0)).convert('RGB')
        glow = ImageChops.add(glow, ImageChops.add(g1, g2))
    rgb = ImageChops.screen(img.convert('RGB'), glow)

    # badge do logo no canto superior esquerdo
    bd = badge(48)
    rgb.paste(bd, (48, 36), bd)

    q = 82
    while True:
        buf = io.BytesIO()
        rgb.save(buf, 'JPEG', quality=q, optimize=True, progressive=True, subsampling=0 if q >= 80 else 2)
        if buf.tell() <= 180 * 1024 or q <= 60:
            break
        q -= 4
    with open(OUT, 'wb') as fh_:
        fh_.write(buf.getvalue())
    print(f'[og] {os.path.relpath(OUT, ROOT)} {W}×{H} · q{q} · {buf.tell() / 1024:.1f} KB · FUTURO {size}px')


if __name__ == '__main__':
    main()
