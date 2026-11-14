const SUBSTITUICOES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapa texto vindo do usuário (nome, disciplina, título...) antes de colocá-lo
 * num e-mail em HTML — senão um nome como "<a href=...>" viraria conteúdo do e-mail.
 */
export const escaparHtml = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => SUBSTITUICOES[c]);
