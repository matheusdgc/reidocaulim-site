"""Padroniza as logos de clientes e parceiros para o site.

Lê os originais em assets/img/logos-clientes/ (e originais-web/, novas/), e grava em assets/img/parceiros/:
fundo branco, bordas vazias cortadas, margem igual em volta e altura máxima de 240 px (nítidas em telas de alta densidade), em WebP.
SVGs são copiados como estão (apenas com as cores fixadas, ver TROUW abaixo).

Uso: python scripts/preparar_logos.py
"""
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "assets" / "img" / "logos-clientes"
DESTINO = RAIZ / "assets" / "img" / "parceiros"
ALTURA = 240
MARGEM = 0.08  # fração da maior dimensão

# arquivo de origem -> nome final (sem extensão)
RASTER = {
    "allnova-logo.jpeg": "allnova",
    "nutron-logo.jpeg": "cargill-nutron",
    "polinutri-logo.png": "polinutri",
    "silicate-logo.jpeg": "silicate",
    "univitta-logo.jpg": "univitta",
    "originais-web/facholi-logo.png": "potensal-facholi",
    "originais-web/rumenforte-logo.png": "rumen-forte",
    "originais-web/neonutra-preta.webp": "neonutra",
    "originais-web/usidecor-logo.png": "usi-decor",
    "originais-web/globoaves-logo.png": "globoaves",
    "novas/proenzime.png": "proenzime",
    "novas/embraupec.png": "embraupec",
    "novas/mariboi.webp": "mariboi",
    "novas/neto.webp": "neto-mococa",
    "novas/agility.jpg": "grupo-agility",
    "novas/alvax.webp": "alvax",
    "novas/transcolima.webp": "transcolima",
    "novas/adm-logistica.webp": "adm-logistica",
    "novas/atr.webp": "atr-transportes",
    "novas/nordeste.webp": "nordeste-transportes",
}

# O SVG da Trouw usa variáveis de CSS do site deles; aqui as cores ficam fixas,
# com o azul primário e o verde da marca (valores lidos do CSS de trouwnutrition.com.br).
TROUW = ("originais-web/trouw-logo.svg", "trouw-nutrition", {
    "rgb(var(--brand__color--white))": "#003C71",
    "rgb(var(--brand__color--secondary))": "#B7BF10",
})


def para_rgb_branco(im):
    if im.mode == "CMYK":
        im = im.convert("RGB")
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        fundo = Image.new("RGBA", im.size, (255, 255, 255, 255))
        fundo.alpha_composite(im)
        return fundo.convert("RGB")
    return im.convert("RGB")


# Originais com fundo cinza-claro em vez de branco: o fundo vira branco antes do corte,
# para não aparecer um retângulo acinzentado dentro do card
CLAREAR_FUNDO = {"univitta-logo.jpg", "novas/agility.jpg", "novas/alvax.webp", "novas/transcolima.webp",
                 "novas/atr.webp", "novas/nordeste.webp"}

# Logos sobre fundo preto: o fundo vira branco e o brilho neon vira o mesmo brilho sobre branco.
# Cada uma pode ter uma área protegida (x0, y0, x1, y1), onde o preto é desenho e não fundo.
FUNDO_PRETO = {"novas/adm-logistica.webp": (780, 200, 890, 300)}  # o "check" dentro do escudo


def tirar_fundo_preto(im, protegida=None):
    """O preto ligado às bordas e os miolos pretos das letras viram branco; os cinzas do desenho ficam.
    Pixels coloridos escuros (o brilho neon misturado ao preto) são desmisturados do preto e postos sobre branco."""
    w, h = im.size
    marca = (255, 0, 255)
    cheio = im.copy()
    for canto in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if cheio.getpixel(canto) != marca:
            ImageDraw.floodfill(cheio, canto, marca, thresh=40)
    px, pc = im.load(), cheio.load()
    for y in range(h):
        for x in range(w):
            if pc[x, y] == marca:
                px[x, y] = (255, 255, 255)
                continue
            r, g, b = px[x, y]
            m, n = max(r, g, b), min(r, g, b)
            dentro = protegida and protegida[0] <= x <= protegida[2] and protegida[1] <= y <= protegida[3]
            if m < 34 and not dentro:
                px[x, y] = (255, 255, 255)
            elif m - n > 40 and m < 200:
                a = m / 255
                cor = [min(255, c / a) for c in (r, g, b)]
                px[x, y] = tuple(round(c * a + 255 * (1 - a)) for c in cor)
    return im


def clarear_fundo(im, limite=238):
    return im.point(lambda p: 255 if p >= limite else p)


def cortar_bordas(im, tolerancia=12):
    fundo = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, fundo).convert("L").point(lambda p: 255 if p > tolerancia else 0)
    caixa = diff.getbbox()
    return im.crop(caixa) if caixa else im


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for origem, nome in RASTER.items():
        im = para_rgb_branco(Image.open(ORIGEM / origem))
        if origem in CLAREAR_FUNDO:
            im = clarear_fundo(im)
        if origem in FUNDO_PRETO:
            im = tirar_fundo_preto(im, FUNDO_PRETO[origem])
        im = cortar_bordas(im)
        m = round(max(im.size) * MARGEM)
        tela = Image.new("RGB", (im.width + 2 * m, im.height + 2 * m), (255, 255, 255))
        tela.paste(im, (m, m))
        if tela.height > ALTURA:
            tela = tela.resize((round(tela.width * ALTURA / tela.height), ALTURA), Image.LANCZOS)
        saida = DESTINO / f"{nome}.webp"
        tela.save(saida, "WEBP", quality=90, method=6)
        print(f"{saida.name:28} {tela.size} {saida.stat().st_size // 1024} KB")

    origem, nome, cores = TROUW
    svg = (ORIGEM / origem).read_text(encoding="utf-8")
    for antes, depois in cores.items():
        svg = svg.replace(antes, depois)
    # Sem largura e altura no <svg>, o navegador não sabe o tamanho natural e a logo some com width: auto
    m = re.search(r'viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"', svg)
    if m and "width=" not in svg.split(">", 1)[0]:
        svg = svg.replace("<svg ", f'<svg width="{m.group(1)}" height="{m.group(2)}" ', 1)
    (DESTINO / f"{nome}.svg").write_text(svg, encoding="utf-8")
    print(f"{nome}.svg copiado com cores fixas")


if __name__ == "__main__":
    main()
