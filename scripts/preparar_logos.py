"""Padroniza as logos de clientes e parceiros para o site.

Lê os originais em assets/img/logos-clientes/ (e originais-web/), e grava em assets/img/parceiros/:
fundo branco, bordas vazias cortadas, margem igual em volta e altura máxima de 160 px, em WebP.
SVGs são copiados como estão (apenas com as cores fixadas, ver TROUW abaixo).

Uso: python scripts/preparar_logos.py
"""
import re
from pathlib import Path

from PIL import Image, ImageChops

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "assets" / "img" / "logos-clientes"
DESTINO = RAIZ / "assets" / "img" / "parceiros"
ALTURA = 160
MARGEM = 0.08  # fração da maior dimensão

# arquivo de origem -> nome final (sem extensão)
RASTER = {
    "allnova-logo.jpeg": "allnova",
    "nutron-logo.jpeg": "cargill-nutron",
    "polinutri-logo.png": "polinutri",
    "silicate-logo.jpeg": "silicate",
    "originais-web/facholi-logo.png": "potensal-facholi",
    "originais-web/rumenforte-logo.png": "rumen-forte",
    "originais-web/neonutra-preta.webp": "neonutra",
    "originais-web/usidecor-logo.png": "usi-decor",
    "originais-web/globoaves-logo.png": "globoaves",
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


def cortar_bordas(im, tolerancia=12):
    fundo = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, fundo).convert("L").point(lambda p: 255 if p > tolerancia else 0)
    caixa = diff.getbbox()
    return im.crop(caixa) if caixa else im


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for origem, nome in RASTER.items():
        im = cortar_bordas(para_rgb_branco(Image.open(ORIGEM / origem)))
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
