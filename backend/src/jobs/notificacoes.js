import cron from 'node-cron';
import nodemailer from 'nodemailer';
import prisma from '../lib/prisma.js';

// Executar todos os dias às 08:00
const HORARIO_NOTIFICACAO = '0 8 * * *';
const FUSO_HORARIO = 'America/Sao_Paulo';

export function agendarNotificacoes(log) {
  // Verifica se as variáveis de e-mail estão configuradas
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    log.warn('E-mail não configurado. As notificações (História 6) estão desativadas.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  cron.schedule(
    HORARIO_NOTIFICACAO,
    async () => {
      try {
        log.info('Verificando avaliações e trabalhos para notificação...');
        
        // Prazos nos próximos 3 dias
        const hoje = new Date();
        const limite = new Date();
        limite.setDate(limite.getDate() + 3);

        const avaliacoes = await prisma.avaliacao.findMany({
          where: { dataRealizacao: { gte: hoje, lte: limite } },
        });

        const trabalhos = await prisma.trabalhoGrupo.findMany({
          where: { prazoEntrega: { gte: hoje, lte: limite }, status: { not: 'concluido' } },
        });

        if (avaliacoes.length === 0 && trabalhos.length === 0) {
          log.info('Nenhuma notificação necessária hoje.');
          return;
        }

        let html = '<h2>StudySync - Lembrete de Prazos</h2>';
        html += '<p>Olá! Aqui estão os seus compromissos para os próximos 3 dias:</p>';

        if (avaliacoes.length > 0) {
          html += '<h3>📝 Provas:</h3><ul>';
          avaliacoes.forEach(a => {
            html += `<li><strong>${a.disciplina}</strong>: ${a.dataRealizacao.toLocaleDateString('pt-BR')}</li>`;
          });
          html += '</ul>';
        }

        if (trabalhos.length > 0) {
          html += '<h3>👥 Trabalhos:</h3><ul>';
          trabalhos.forEach(t => {
            html += `<li><strong>${t.titulo}</strong>: ${t.prazoEntrega.toLocaleDateString('pt-BR')}</li>`;
          });
          html += '</ul>';
        }

        await transporter.sendMail({
          from: `"StudySync" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_TO || process.env.EMAIL_USER,
          subject: 'Lembrete de Prazos - StudySync',
          html,
        });

        log.info('E-mail de notificação enviado com sucesso.');
      } catch (err) {
        log.error(err, 'Falha ao enviar notificações por e-mail');
      }
    },
    { timezone: FUSO_HORARIO }
  );

  log.info(`Notificações agendadas (${HORARIO_NOTIFICACAO}, ${FUSO_HORARIO})`);
}
