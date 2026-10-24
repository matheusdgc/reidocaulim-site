/*
 * Dados de contato exibidos no site.
 * Os números e a cidade também estão escritos no index.html (contato e rodapé),
 * para aparecerem mesmo sem JavaScript: ao trocar um número, troque nos dois lugares.
 * O e-mail que RECEBE as mensagens do formulário fica em enviar.php (não aqui),
 * para não ficar exposto no navegador.
 */
window.SITE_CONFIG = {
  // WhatsApp principal (botão flutuante e botões "Pedir pelo WhatsApp"), com DDI e DDD, só dígitos
  whatsapp: '5541997810210',
  // Mensagem que já vem escrita ao abrir o WhatsApp
  whatsappMensagem: 'Olá! Vim pelo site da SB Rei do Caulim e gostaria de uma cotação.',
  // TODO: e-mail público de contato
  email: 'contato@seudominio.com.br',
  cidade: 'Itapeva/SP',
  cnpj: '46.640.930/0001-00',
  // Modo demonstração: o formulário valida, mas não envia e-mail.
  // 'auto' liga só em endereços *.vercel.app (protótipo). Use false na hospedagem final, se preferir.
  modoDemonstracao: 'auto'
};
