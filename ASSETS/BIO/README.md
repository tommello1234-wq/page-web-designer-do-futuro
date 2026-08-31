# Banners da página /bio

Os 3 cards de link usam estas imagens:

| Arquivo          | Card                            |
| ---------------- | ------------------------------- |
| `banner-01.webp` | Formação Web Designer do Futuro |
| `banner-02.webp` | Aula gratuita                   |
| `banner-03.webp` | Fale comigo no WhatsApp         |

**Formato:** 1080 × 453 px (proporção 2.38:1), `.webp`.

Para trocar um banner, basta substituir o arquivo mantendo o nome — não precisa
editar o HTML. Se um arquivo não existir, o card mostra automaticamente o
placeholder ("Banner 01 · 1080 × 453").

## Converter JPG/PNG para WebP

```bash
python3 -c "from PIL import Image; im=Image.open('entrada.jpg').convert('RGB'); im.save('banner-01.webp','WEBP',quality=82,method=6)"
```

## Mudar a proporção dos slots

Se os novos banners tiverem outra proporção, ajuste `--bio-banner-ratio` no
`:root` do [`bio.css`](../../bio.css) — vale para os três cards de uma vez.
