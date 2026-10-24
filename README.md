# reidocaulim-site

Site institucional da **SB Rei do Caulim Representações**: uma página com os produtos Caulim e ACM Liga, formulário de contato por e-mail e botão flutuante de WhatsApp.

Feito em HTML, CSS e JavaScript puros, sem build e sem dependências. O formulário usa um arquivo PHP (`enviar.php`).

## Estrutura

```
index.html          página principal
privacidade.html    política de privacidade (LGPD)
404.html            página de erro
enviar.php          recebe o formulário e envia o e-mail
.htaccess           cabeçalhos de segurança, cache e compressão (Apache)
robots.txt, sitemap.xml, site.webmanifest
assets/css/tokens.css   tokens do design system (cores, fontes, espaços, movimento)
assets/css/main.css     estilos
assets/js/config.js     dados de contato exibidos no site
assets/js/main.js       interações e animações
assets/fonts/           fonte Archivo (servida localmente)
assets/img/             imagens otimizadas (WebP), ícones e imagem de compartilhamento
MASTER.md           design system completo (fonte de verdade do visual)
```

## Antes de publicar: o que trocar

Procure por `TODO` no projeto. São quatro lugares:

1. **`assets/js/config.js`**: número de WhatsApp, telefone escrito, e-mail público, cidade/UF e CNPJ.
2. **`enviar.php`**: `DESTINO` (e-mail que recebe as mensagens) e `REMETENTE` (um endereço do mesmo domínio do site, por exemplo `site@seudominio.com.br`, senão o e-mail tende a cair no spam).
3. **Domínio**: troque `https://www.seudominio.com.br` em `index.html` (canonical e Open Graph), `sitemap.xml` e `robots.txt`.
4. **Cores do Caulim**: os tons de Branco, Creme 2 e Cinza em `assets/css/tokens.css` (`--caulim-branco`, `--caulim-creme`, `--caulim-cinza`) são aproximados. Ajuste com uma amostra real.

## Como publicar

1. Contrate uma hospedagem com PHP (Hostinger, Locaweb, HostGator ou outra com cPanel).
2. Envie todos os arquivos da pasta para `public_html` por FTP ou pelo gerenciador de arquivos. O arquivo `sb-reidocaulim-logo.jpeg` e o `MASTER.md` não precisam ir (o `.htaccess` bloqueia o acesso a eles se forem).
3. Ative o SSL (HTTPS) no painel da hospedagem e descomente as três linhas de redirecionamento no `.htaccess`.
4. Envie uma mensagem de teste pelo formulário. Se não chegar, confira a caixa de spam e, se a hospedagem não aceitar o parâmetro `-f`, mude `USAR_PARAMETRO_F` para `false` em `enviar.php`.

## Testar localmente

Qualquer servidor estático serve para ver o site, mas o formulário só envia e-mail num servidor com PHP. Com PHP instalado:

```bash
php -S localhost:8000
```

## Proteções do formulário

- Campo invisível contra robôs e checagem de tempo mínimo de preenchimento.
- Limite de 5 envios por IP a cada 10 minutos.
- Validação no navegador e no servidor; remoção de quebras de linha nos cabeçalhos do e-mail.
- Consentimento LGPD obrigatório.

## Acessibilidade e movimento

As animações respeitam a preferência do sistema por movimento reduzido: com ela ativada, tudo vira um fade simples, sem partículas, parallax ou inclinação. Os detalhes de tempos e curvas estão no `MASTER.md`.
