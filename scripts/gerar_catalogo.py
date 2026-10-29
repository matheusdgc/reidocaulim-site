"""Gera a cópia estática do catálogo ACM Argamassas dentro do acm-argamassas.html.

O site já busca a lista atualizada no site do fabricante a cada visita (assets/js/main.js).
Esta cópia só aparece se essa busca falhar e é o que buscadores leem.

Uso: python scripts/gerar_catalogo.py
Lê assets/data/acm-produtos.json e reescreve o trecho entre os marcadores
<!-- catalogo:inicio --> e <!-- catalogo:fim --> do acm-argamassas.html.
"""
import html
import json
import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "assets" / "data" / "acm-produtos.json"
PAGINA = RAIZ / "acm-argamassas.html"
INDENT = "          "


def slug(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")


def filtros(produtos):
    cats = {}
    for p in produtos:
        cats[p["categoria"]] = cats.get(p["categoria"], 0) + 1
    botoes = [f'<button class="filter" type="button" aria-pressed="true" data-filter="todos">Todos <span>{len(produtos)}</span></button>']
    for nome, n in cats.items():
        botoes.append(f'<button class="filter" type="button" aria-pressed="false" data-filter="{slug(nome)}">{html.escape(nome)} <span>{n}</span></button>')
    return "\n".join(INDENT + "  " + b for b in botoes)


def card(p):
    e = html.escape
    return (
        f'{INDENT}  <li class="catalog-item" data-categoria="{slug(p["categoria"])}">\n'
        f'{INDENT}    <article class="catalog-card">\n'
        f'{INDENT}      <div class="catalog-img"><img src="{e(p["imagem"])}" width="{p["imagemW"]}" height="{p["imagemH"]}" loading="lazy" alt="Embalagem do {e(p["nome"])}"></div>\n'
        f'{INDENT}      <div class="catalog-body">\n'
        f'{INDENT}        <span class="catalog-cat">{e(p["categoria"])}</span>\n'
        f'{INDENT}        <h2 class="catalog-name">{e(p["nome"])}</h2>\n'
        f'{INDENT}        <p class="catalog-desc">{e(p["resumo"])}</p>\n'
        f'{INDENT}      </div>\n'
        f'{INDENT}    </article>\n'
        f'{INDENT}  </li>'
    )


def main():
    produtos = json.loads(DADOS.read_text(encoding="utf-8"))
    bloco = (
        f'{INDENT}<div class="catalog-filters" role="group" aria-label="Filtrar por categoria" data-catalog-filters>\n'
        f'{filtros(produtos)}\n'
        f'{INDENT}</div>\n'
        f'{INDENT}<ul class="catalog-grid" data-catalog-grid>\n'
        + "\n".join(card(p) for p in produtos)
        + f'\n{INDENT}</ul>'
    )
    pagina = PAGINA.read_text(encoding="utf-8")
    novo, n = re.subn(r"(<!-- catalogo:inicio -->\n).*?( *<!-- catalogo:fim -->)",
                      lambda m: m.group(1) + bloco + "\n" + m.group(2), pagina, count=1, flags=re.S)
    if n != 1:
        raise SystemExit("Marcadores <!-- catalogo:inicio --> e <!-- catalogo:fim --> não encontrados no acm-argamassas.html")
    PAGINA.write_text(novo, encoding="utf-8")
    print(f"{len(produtos)} produtos escritos no acm-argamassas.html")


if __name__ == "__main__":
    main()
