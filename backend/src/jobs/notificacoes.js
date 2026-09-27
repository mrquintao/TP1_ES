import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { enviarEmail } from '../lib/email.js';
import { estadoUrgencia, hojeComoData } from '../lib/urgencia.js';

const HORARIO_NOTIFICACAO = '0 8 * * *';
const FUSO_HORARIO = 'America/Sao_Paulo';
const DIAS_LEMBRETE = 3; // avisa sobre prazos até N dias à frente

// Seção do e-mail com os prazos dos próximos dias, ou '' se não houver nada
function secaoLembrete(avaliacoes, trabalhos) {
  if (avaliacoes.length === 0 && trabalhos.length === 0) return '';
  let html = `<h3>📅 Prazos dos próximos ${DIAS_LEMBRETE} dias</h3>`;
  if (avaliacoes.length > 0) {
    html += '<p><strong>📝 Provas:</strong></p><ul>';
    avaliacoes.forEach((a) => { html += `<li>${a.disciplina}: ${a.dataRealizacao.toLocaleDateString('pt-BR')}</li>`; });
    html += '</ul>';
  }
  if (trabalhos.length > 0) {
    html += '<p><strong>👥 Trabalhos:</strong></p><ul>';
    trabalhos.forEach((t) => { html += `<li>${t.titulo}: ${t.prazoEntrega.toLocaleDateString('pt-BR')}</li>`; });
    html += '</ul>';
  }
  return html;
}

// Seção do e-mail com os itens que ficaram urgentes/atrasados desde o último aviso
function secaoUrgentes(itens) {
  if (itens.length === 0) return '';
  let html = '<h3>🚨 Ficaram urgentes</h3><ul>';
  itens.forEach((item) => { html += `<li>${item.titulo} (${item.estado})</li>`; });
  html += '</ul>';
  return html;
}

// Busca os itens (avaliações e trabalhos) que acabaram de ficar urgentes/atrasados
// pra esse estudante (notificadoUrgente ainda false) e monta a lista pro e-mail
async function buscarUrgentesNovos(estudanteId) {
  const [avaliacoes, trabalhos] = await Promise.all([
    prisma.avaliacao.findMany({
      where: { estudanteId, notificadoUrgente: false, dataAlarme: { not: null } },
    }),
    prisma.trabalhoGrupo.findMany({
      where: { estudanteId, notificadoUrgente: false, dataAlarme: { not: null }, status: { not: 'concluido' } },
    }),
  ]);

  const itens = [];
  for (const a of avaliacoes) {
    const estado = estadoUrgencia({ dataAlarme: a.dataAlarme, dataLimite: a.dataRealizacao });
    if (estado) itens.push({ tipo: 'avaliacao', id: a.id, titulo: `📝 ${a.disciplina}`, estado });
  }
  for (const t of trabalhos) {
    const estado = estadoUrgencia({ dataAlarme: t.dataAlarme, dataLimite: t.prazoEntrega });
    if (estado) itens.push({ tipo: 'trabalho', id: t.id, titulo: `👥 ${t.titulo}`, estado });
  }
  return itens;
}

// Marca os itens urgentes como avisados — só depois do e-mail ter sido enviado
// com sucesso, pra não perder o aviso se o envio falhar
async function marcarComoNotificados(itens) {
  const idsAvaliacoes = itens.filter((i) => i.tipo === 'avaliacao').map((i) => i.id);
  const idsTrabalhos = itens.filter((i) => i.tipo === 'trabalho').map((i) => i.id);
  if (idsAvaliacoes.length) {
    await prisma.avaliacao.updateMany({ where: { id: { in: idsAvaliacoes } }, data: { notificadoUrgente: true } });
  }
  if (idsTrabalhos.length) {
    await prisma.trabalhoGrupo.updateMany({ where: { id: { in: idsTrabalhos } }, data: { notificadoUrgente: true } });
  }
}

// Monta e envia o e-mail de um estudante, se houver algo a dizer. Retorna true se enviou.
async function processarEstudante(estudante, log) {
  let htmlLembrete = '';
  if (estudante.notificarDiario) {
    const hoje = hojeComoData();
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + DIAS_LEMBRETE);

    const [avaliacoes, trabalhos] = await Promise.all([
      prisma.avaliacao.findMany({
        where: { estudanteId: estudante.id, dataRealizacao: { gte: hoje, lte: limite } },
      }),
      prisma.trabalhoGrupo.findMany({
        where: { estudanteId: estudante.id, prazoEntrega: { gte: hoje, lte: limite }, status: { not: 'concluido' } },
      }),
    ]);
    htmlLembrete = secaoLembrete(avaliacoes, trabalhos);
  }

  const itensUrgentesNovos = estudante.notificarUrgente ? await buscarUrgentesNovos(estudante.id) : [];
  const htmlUrgentes = secaoUrgentes(itensUrgentesNovos);

  if (!htmlLembrete && !htmlUrgentes) return false; // nada a avisar hoje

  const html = `<h2>StudySync</h2><p>Olá, ${estudante.nome}!</p>${htmlLembrete}${htmlUrgentes}`;
  const resultado = await enviarEmail({ to: estudante.email, subject: 'StudySync — seus lembretes de hoje', html });

  if (resultado.enviado) {
    await marcarComoNotificados(itensUrgentesNovos);
    log.info(`E-mail de notificação enviado para ${estudante.email}`);
  } else {
    log.warn(`E-mail não enviado para ${estudante.email}: ${resultado.motivo}`);
  }
  return resultado.enviado;
}

/**
 * Roda o ciclo de notificações pra todos os estudantes agora mesmo (sem esperar
 * o cron) — chamada pelo agendamento diário e também usada em testes manuais.
 */
export async function executarNotificacoesDiarias(log) {
  const estudantes = await prisma.estudante.findMany({
    where: { OR: [{ notificarDiario: true }, { notificarUrgente: true }] },
  });
  log.info(`Verificando notificações para ${estudantes.length} estudante(s)...`);
  for (const estudante of estudantes) {
    await processarEstudante(estudante, log);
  }
}

// Agenda o ciclo de notificações pra rodar todo dia às 08:00 (horário de Brasília)
export function agendarNotificacoes(log) {
  cron.schedule(HORARIO_NOTIFICACAO, () => executarNotificacoesDiarias(log), { timezone: FUSO_HORARIO });
  log.info(`Notificações agendadas (${HORARIO_NOTIFICACAO}, ${FUSO_HORARIO})`);
}
