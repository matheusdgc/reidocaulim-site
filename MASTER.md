# MASTER.md · Design system SB Rei do Caulim

Fonte única de verdade do visual do site. Todo valor usado no CSS sai daqui, via `assets/css/tokens.css`.

## Teses aprovadas

**Visual:** fundo predominantemente branco e arejado, com verde-bandeira como cor de ação, amarelo-ouro só como traço de destaque (o arco da logo virando divisor de seções) e azul-marinho como cor de texto e títulos, completando a bandeira. Uma família tipográfica só, a Archivo: larga e pesada nos títulos, porque ecoa as letras expandidas da logo; normal e legível no texto corrido. Espaçamento generoso sobre base de 8 px. Componentes planos, com borda fina e cantos médios (8 a 12 px), que ganham elevação só no hover. As cores do Caulim aparecem como amostras de pó mineral.

**Interação (v2):** movimento fluido e coreografado, de 160 ms nos detalhes até 1 s nas revelações, com duas curvas ease-out: `cubic-bezier(.22,1,.36,1)` para interface e `cubic-bezier(.16,1,.3,1)` (expo) para revelações grandes. Abertura: título sobe linha a linha por máscara, traço amarelo sublinha a palavra-chave, foto se abre de cima para baixo, o arco da logo se desenha e um pó mineral branco flutua devagar ao fundo. Scroll: fotos reveladas por máscara com leve zoom-out, textos em cascata de 70 ms, arcos divisores se desenham ao entrar na tela, parallax sutil (até 8%) só em fotos de fundo. Hover: botões escurecem e a seta desliza; cards sobem 4 px; foto de produto inclina até 4° seguindo o mouse (só ponteiro fino). Variações do Caulim: a nova cor se espalha num círculo a partir do clique. Proibido: bounce, elástico ou overshoot, carrossel automático, scroll-jacking, glassmorphism, WhatsApp pulsando, e qualquer deslocamento com `prefers-reduced-motion` (só fade).

**Padrões permitidos:** o arco amarelo e verde da logo como divisor que se desenha; amostras circulares de pó mineral para as cores do Caulim; partículas de pó mineral em loop lento na abertura (pausam fora da tela e em movimento reduzido); parallax sutil em fotos de fundo; inclinação 3D leve nas fotos de produto.

## Dials

| Dial | Valor | Origem na tese |
|---|---|---|
| variance | 4 | "institucional, mas não engessado"; componentes planos, grade limpa |
| motion | 7 | "movimento fluido e coreografado" |
| density | 3 | "espaçamento generoso sobre base de 8 px" |

## Cores

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | fundo principal | |
| `--color-surface` | `#F4F7F3` | seções alternadas, fundo de mídia | |
| `--color-surface-green` | `#E8F4EC` | estado selecionado | |
| `--color-line` | `#E3E8E4` | bordas decorativas (cards, divisórias) | |
| `--color-line-input` | `#7A8580` | borda de campos de formulário | 3,8:1 no branco |
| `--color-ink` | `#0F1B2D` | texto corrido | 17,3:1 no branco |
| `--color-navy` | `#0B2A5B` | títulos, rodapé | 14,0:1 no branco |
| `--color-muted` | `#4B5563` | texto secundário | 7,6:1 no branco; 7,0:1 na superfície |
| `--color-green` | `#00843D` | botões, ícones | branco nele 4,8:1 |
| `--color-green-deep` | `#006B32` | links, hover | 6,7:1 no branco |
| `--color-green-press` | `#00562A` | ativo | |
| `--color-green-bright` | `#13A538` | só decoração (3,3:1) | |
| `--color-yellow` | `#FFD100` | traços, anel de foco | marinho nele 9,6:1 |
| `--color-error` | `#B42318` | erro de formulário | 6,4:1 no branco |
| `--color-success` | `#006B32` | confirmação | 6,7:1 |
| `--color-whatsapp` | `#25D366` | botão flutuante (cor da marca WhatsApp, ícone branco) | |

### Cores do Caulim (aproximadas, ajustar com amostra real)

| Token | Hex |
|---|---|
| `--caulim-branco` | `#F3F2EC` |
| `--caulim-creme` | `#E6D8B8` |
| `--caulim-cinza` | `#B4B8B3` |

## Tipografia

- Família: **Archivo** variável (peso 100–900, largura 62–125%), servida localmente em `assets/fonts/archivo-latin.woff2`, `font-display: swap`.
- Fallback: `"Segoe UI", Roboto, "Helvetica Neue", Arial, system-ui, sans-serif`.
- Títulos: largura 125%, peso 800, `line-height` 1.05, `letter-spacing` -0.01em, cor marinho.
- Corpo: largura 100%, peso 400, `line-height` 1.6.

| Token | Valor |
|---|---|
| `--fs-display` | `clamp(2.5rem, 1.5rem + 4.2vw, 4.25rem)` |
| `--fs-h2` | `clamp(2rem, 1.4rem + 2.4vw, 3rem)` |
| `--fs-h3` | `clamp(1.375rem, 1.2rem + .6vw, 1.75rem)` |
| `--fs-lead` | `clamp(1.125rem, 1.05rem + .3vw, 1.25rem)` |
| `--fs-body` | `1.0625rem` (17 px) |
| `--fs-small` | `.875rem` |
| `--fs-tiny` | `.875rem` (mínimo de 14 px no site) |

## Espaçamento (base 8 px)

`--sp-1` 4px · `--sp-2` 8px · `--sp-3` 12px · `--sp-4` 16px · `--sp-5` 24px · `--sp-6` 32px · `--sp-7` 48px · `--sp-8` 64px · `--sp-9` 96px · `--sp-10` 128px

- Seção: `--section-y: clamp(4rem, 2.5rem + 6vw, 8rem)`.
- Container: `--container: 1200px`, gutter `--gutter: clamp(1rem, .5rem + 2.5vw, 2rem)`.
- Cabeçalho: `--header-h` 92px no desktop, 72px abaixo de 900px.

## Raios

`--r-xs` 4px (anel de foco, sublinhado do menu) · `--r-sm` 8px (botões, inputs) · `--r-md` 12px (cards, mídia) · `--r-lg` 20px (blocos grandes) · `--r-pill` 999px (chips, WhatsApp)

## Sombras (tingidas de marinho)

| Token | Valor |
|---|---|
| `--sh-0` | `none` |
| `--sh-1` | `0 1px 2px rgba(11,42,91,.06)` |
| `--sh-2` | `0 8px 24px -12px rgba(11,42,91,.18)` |
| `--sh-3` | `0 18px 40px -20px rgba(11,42,91,.28)` |
| `--sh-btn` | `0 6px 16px -6px rgba(0,107,50,.5)` |
| `--sh-float` | `0 10px 24px -8px rgba(0,0,0,.35)` |

## Movimento

| Token | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | interface |
| `--ease-x` | `cubic-bezier(.16,1,.3,1)` | revelações |
| `--t-micro` | `160ms` | cor, botão, seta |
| `--t-ui` | `240ms` | card, inclinação |
| `--t-reveal` | `420ms` | texto ao rolar |
| `--t-ripple` | `600ms` | troca de cor do Caulim |
| `--t-line` | `900ms` | linhas do título |
| `--t-mask` | `1000ms` | foto por máscara |
| `--t-zoom` | `1400ms` | zoom-out da foto |
| `--t-arc` | `1100ms` | arco se desenhando |
| `--stagger` | `70ms` | cascata |
| `--rise` | `16px` | deslocamento de entrada |
| `--tilt-max` | `4deg` | inclinação 3D |
| `--parallax-max` | `8%` | parallax |

Coreografia da abertura (atrasos a partir da entrada):

| Token | Valor | Uso |
|---|---|---|
| `--d-line-2` | `90ms` | segunda linha do título |
| `--d-hero-media` | `150ms` | foto abre por máscara |
| `--d-hero-copy` | `380ms` | parágrafo de apoio |
| `--d-hero-actions` | `460ms` | botões |
| `--d-arc-fill` / `--t-arc-fill` | `500ms` / `800ms` | faixa verde do arco sobe |
| `--d-arc-line` | `700ms` | traço amarelo se desenha |
| `--t-underline` | `700ms` (após `--t-line`) | sublinhado amarelo da palavra-chave |
| `--d-wa` | `1200ms` | botão do WhatsApp entra (uma vez) |
| `--zoom-hero-from` / `--zoom-from` | `1.15` / `1.12` | zoom-out das fotos reveladas |
| `--parallax-scale` | `1.18` | margem da foto com parallax |
| `--t-spin` | `700ms` | spinner de envio (só durante o envio) |

Movimento reduzido: tudo vira fade de 200 ms; sem partículas, parallax, inclinação, máscara ou deslocamento.

## Z-index

`--z-header` 50 · `--z-float` 60 · `--z-skip` 100

## Componentes base

- **Botão primário:** fundo `--color-green`, texto branco peso 700, `--r-sm`, padding 14×24, alvo mínimo 44 px. Hover: `--color-green-deep`, sobe 2 px, `--sh-btn`. Foco: anel 3 px `--color-yellow` com offset 2 px, mais anel interno 2 px marinho (`--focus-ring-inner`), porque amarelo sobre branco dá só 1,5:1. Ativo: `--color-green-press`, sem deslocamento. Desabilitado: fundo `#C9D1CB`, texto `#5B6660`.
- **Botão secundário:** transparente, contorno 2 px marinho; hover preenche marinho com texto branco.
- **Input:** fundo branco, borda 1.5 px `--color-line-input`, `--r-sm`, altura mínima 48 px. Hover: borda marinho. Foco: borda marinho + anel amarelo. Erro: borda `--color-error` e mensagem abaixo. Desabilitado: fundo `--color-surface`.
- **Card:** branco, borda 1 px `--color-line`, `--r-md`. Hover: sobe 4 px, `--sh-3`.
- **Chip (variação):** pill, borda 1.5 px; hover borda verde; selecionado (`aria-pressed=true`): borda verde, fundo `--color-surface-green`, peso 700.
- **Link:** `--color-green-deep`, sublinhado 1 px que engrossa no hover.
- **Selo:** pill, fundo `--color-surface-green`, texto `--color-green-deep`, `--fs-tiny` peso 600.
