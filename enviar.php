<?php
/**
 * Recebe o formulário de contato do site e envia por e-mail.
 * Requer hospedagem com PHP 7.4+ e a função mail() habilitada (padrão em Hostinger, Locaweb, HostGator).
 */

declare(strict_types=1);

// ===================== CONFIGURAÇÃO =====================
// TODO: e-mail que vai RECEBER as mensagens do site
const DESTINO = 'contato@seudominio.com.br';
// TODO: remetente técnico. Use um endereço do MESMO domínio do site, senão o e-mail cai no spam.
const REMETENTE = 'site@seudominio.com.br';
const NOME_SITE = 'Site SB Rei do Caulim';
// Algumas hospedagens exigem o parâmetro -f; se o envio falhar, troque para false.
const USAR_PARAMETRO_F = true;
// Limite de envios por IP
const LIMITE_ENVIOS = 5;
const JANELA_SEGUNDOS = 600;
// ========================================================

header('X-Content-Type-Options: nosniff');

$querJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function responder(bool $ok, string $mensagem, array $erros = [], int $status = 200): void
{
    global $querJson;
    if ($querJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $mensagem, 'errors' => (object) $erros], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: index.html?' . ($ok ? 'enviado=1' : 'erro=1') . '#contato', true, 303);
    }
    exit;
}

function campo(string $nome, int $max): string
{
    $valor = isset($_POST[$nome]) && is_string($_POST[$nome]) ? $_POST[$nome] : '';
    $valor = trim(str_replace("\0", '', $valor));
    return mb_substr($valor, 0, $max, 'UTF-8');
}

function semQuebra(string $valor): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $valor) ?? '');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(false, 'Método não permitido.', [], 405);
}

// Armadilha para robôs: campo invisível preenchido = finge sucesso e descarta
if (campo('site', 200) !== '') {
    responder(true, 'Mensagem enviada. Em breve entraremos em contato.');
}

// Envio rápido demais (menos de 3 s) ou formulário velho demais (mais de 2 dias)
$inicio = (int) campo('t', 20);
$agora = time();
if ($inicio <= 0 || $agora - $inicio < 3 || $agora - $inicio > 172800) {
    responder(false, 'Não foi possível validar o envio. Recarregue a página e tente de novo.', [], 400);
}

// Limite por IP, guardado na pasta temporária do servidor
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$arquivoLimite = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sbrc_' . hash('sha256', $ip) . '.json';
$historico = [];
if (is_file($arquivoLimite)) {
    $lido = json_decode((string) file_get_contents($arquivoLimite), true);
    if (is_array($lido)) {
        $historico = array_values(array_filter($lido, static fn ($ts) => is_int($ts) && $ts > $agora - JANELA_SEGUNDOS));
    }
}
if (count($historico) >= LIMITE_ENVIOS) {
    responder(false, 'Muitos envios em pouco tempo. Aguarde alguns minutos ou chame no WhatsApp.', [], 429);
}

$nome = semQuebra(campo('nome', 120));
$empresa = semQuebra(campo('empresa', 120));
$email = semQuebra(campo('email', 160));
$telefone = semQuebra(campo('telefone', 30));
$produto = campo('produto', 40);
$mensagem = campo('mensagem', 3000);
$lgpd = campo('lgpd', 1);

$produtosValidos = ['Caulim', 'ACM Argamassas', 'Caulim e ACM Argamassas', 'Outro assunto'];
if (!in_array($produto, $produtosValidos, true)) {
    $produto = 'Não informado';
}

$erros = [];
if (mb_strlen($nome, 'UTF-8') < 2) {
    $erros['nome'] = 'Informe seu nome.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros['email'] = 'Informe um e-mail válido.';
}
if (mb_strlen($empresa, 'UTF-8') < 2) {
    $erros['empresa'] = 'Informe o nome da empresa.';
}
if (strlen(preg_replace('/\D/', '', $telefone) ?? '') < 10) {
    $erros['telefone'] = 'Informe telefone ou WhatsApp com DDD.';
}
if (mb_strlen($mensagem, 'UTF-8') < 10) {
    $erros['mensagem'] = 'Escreva uma mensagem com pelo menos 10 caracteres.';
}
if ($lgpd !== '1') {
    $erros['lgpd'] = 'É preciso concordar para enviarmos o retorno.';
}
if ($erros) {
    responder(false, 'Confira os campos destacados.', $erros, 422);
}

$assunto = 'Contato pelo site: ' . $produto . ' - ' . $nome;
$assuntoCodificado = '=?UTF-8?B?' . base64_encode($assunto) . '?=';

$corpo = implode("\n", [
    'Nova mensagem enviada pelo formulário do site.',
    '',
    'Nome: ' . $nome,
    'Empresa: ' . $empresa,
    'E-mail: ' . $email,
    'Telefone: ' . $telefone,
    'Produto: ' . $produto,
    '',
    'Mensagem:',
    $mensagem,
    '',
    '---',
    'Consentimento LGPD: sim',
    'Data: ' . date('d/m/Y H:i'),
    'IP: ' . $ip,
]);

$cabecalhos = implode("\r\n", [
    'From: =?UTF-8?B?' . base64_encode(NOME_SITE) . '?= <' . REMETENTE . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP',
]);

$enviado = USAR_PARAMETRO_F
    ? mail(DESTINO, $assuntoCodificado, $corpo, $cabecalhos, '-f' . REMETENTE)
    : mail(DESTINO, $assuntoCodificado, $corpo, $cabecalhos);

if (!$enviado) {
    responder(false, 'Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.', [], 500);
}

$historico[] = $agora;
@file_put_contents($arquivoLimite, json_encode($historico), LOCK_EX);

responder(true, 'Mensagem enviada. Em breve entraremos em contato.');
