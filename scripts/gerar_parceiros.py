"""Gera a faixa de logos (index.html) e a grade de logos (parceiros.html) a partir de assets/data/parceiros.json.

Para incluir um parceiro: coloque a logo em assets/img/logos-clientes/, registre-a em
scripts/preparar_logos.py, rode esse script, acrescente o parceiro no JSON e rode este.

Uso: python scripts/gerar_parceiros.py
Reescreve os trechos entre <!-- parceiros:faixa:inicio --> / <!-- parceiros:faixa:fim --> no index.html
e <!-- parceiros:grade:inicio --> / <!-- parceiros:grade:fim --> no parceiros.html.
"""
import hashlib
import html
import json
import re
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "assets" / "data" / "parceiros.json"


def medidas(logo):
    caminho = RAIZ / logo
    if caminho.suffix == ".svg":
        m = re.search(r'viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"', caminho.read_text(encoding="utf-8"))
        return (round(float(m.group(1))), round(float(m.group(2)))) if m else (240, 80)
    with Image.open(caminho) as im:
        return im.size


def versao(logo):
    """Assinatura do conteúdo: a logo muda de endereço quando muda, então o cache longo não segura a antiga."""
    return hashlib.sha1((RAIZ / logo).read_bytes()).hexdigest()[:8]


def link(p, indent, oculto=False):
    e = html.escape
    w, h = medidas(p["logo"])
    extra = ' tabindex="-1"' if oculto else ""
    return (f'{indent}<li><a class="partner" href="{e(p["site"])}" target="_blank" rel="noopener"{extra} '
            f'draggable="false" aria-label="Visitar o site da {e(p["nome"])} (abre em nova aba)">'
            f'<img src="{e(p["logo"])}?v={versao(p["logo"])}" width="{w}" height="{h}" loading="lazy" draggable="false" alt="{e(p["nome"])}"></a></li>')


def substituir(pagina, marcador, bloco):
    caminho = RAIZ / pagina
    texto = caminho.read_text(encoding="utf-8")
    novo, n = re.subn(rf"(<!-- parceiros:{marcador}:inicio -->\n).*?( *<!-- parceiros:{marcador}:fim -->)",
                      lambda m: m.group(1) + bloco + "\n" + m.group(2), texto, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"Marcadores parceiros:{marcador} não encontrados em {pagina}")
    caminho.write_text(novo, encoding="utf-8")


def main():
    parceiros = json.loads(DADOS.read_text(encoding="utf-8"))
    ind = "        "
    # A faixa repete a lista uma vez, escondida dos leitores de tela, para o loop não ter emenda.
    # O movimento e o arrasto ficam em assets/js/main.js (initMarquee), sobre .marquee-inner.
    i2 = ind + "  "
    faixa = (f'{ind}<div class="marquee-inner" data-marquee-inner>\n'
             f'{i2}<ul class="marquee-track">\n' + "\n".join(link(p, i2 + "  ") for p in parceiros) + f'\n{i2}</ul>\n'
             f'{i2}<ul class="marquee-track" aria-hidden="true">\n' + "\n".join(link(p, i2 + "  ", True) for p in parceiros) + f'\n{i2}</ul>\n'
             f'{ind}</div>')
    substituir("index.html", "faixa", faixa)
    grade = f'{ind}<ul class="partners-grid">\n' + "\n".join(link(p, ind + "  ") for p in parceiros) + f'\n{ind}</ul>'
    substituir("parceiros.html", "grade", grade)
    print(f"{len(parceiros)} parceiros escritos no index.html e no parceiros.html")


if __name__ == "__main__":
    main()
