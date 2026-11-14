// Validações de tipo e de valor dos corpos das requisições. Cada função
// devolve a mensagem de erro (string) ou null se estiver tudo certo.

export const STATUS_TRABALHO = ['pendente', 'em_andamento', 'concluido'];
export const RECORRENCIAS = ['diario', 'semanal'];

const ausente = (v) => v === undefined || v === null;
const texto = (v) => typeof v === 'string';

export function validarAvaliacao({ disciplina, descricao, peso }) {
  if (!ausente(disciplina) && !texto(disciplina)) return 'disciplina deve ser texto';
  if (!ausente(descricao) && !texto(descricao)) return 'descricao deve ser texto';
  if (!ausente(peso) && (typeof peso !== 'number' || !Number.isFinite(peso) || peso < 0)) {
    return 'peso deve ser um número maior ou igual a zero';
  }
  return null;
}

export function validarTrabalho({ titulo, disciplina, linksUteis, status, membros }) {
  if (!ausente(titulo) && !texto(titulo)) return 'titulo deve ser texto';
  if (!ausente(disciplina) && !texto(disciplina)) return 'disciplina deve ser texto';
  if (!ausente(status) && !STATUS_TRABALHO.includes(status)) {
    return `status deve ser um de: ${STATUS_TRABALHO.join(', ')}`;
  }
  if (!ausente(linksUteis) && (!Array.isArray(linksUteis) || !linksUteis.every(texto))) {
    return 'linksUteis deve ser uma lista de textos';
  }
  if (!ausente(membros)) {
    const valido = Array.isArray(membros) && membros.every(
      (m) => m && texto(m.nome) && m.nome.trim() !== '' && (ausente(m.escopo) || texto(m.escopo))
    );
    if (!valido) return 'membros deve ser uma lista de { nome, escopo? }';
  }
  return null;
}

export function validarHabito({ descricao, recorrencia, concluidoHoje }) {
  if (!ausente(descricao) && !texto(descricao)) return 'descricao deve ser texto';
  if (!ausente(recorrencia) && !RECORRENCIAS.includes(recorrencia)) {
    return `recorrencia deve ser uma de: ${RECORRENCIAS.join(', ')}`;
  }
  if (!ausente(concluidoHoje) && typeof concluidoHoje !== 'boolean') {
    return 'concluidoHoje deve ser verdadeiro ou falso';
  }
  return null;
}
