import cron from 'node-cron';
import { resetarHabitosDiarios, resetarHabitosSemanais } from '../routes/habitos.js';

// "0 0 * * *" = minuto 0, hora 0, todo dia → meia-noite.
// O fuso é fixado aqui porque o container roda em UTC, e a meia-noite
// do estudante é no horário de Brasília.
const MEIA_NOITE = '0 0 * * *';
const SEGUNDA_MEIA_NOITE = '0 0 * * 1'; // dia da semana 1 = segunda
const FUSO_HORARIO = 'America/Sao_Paulo';

/**
 * Agenda o reset automático do checklist de hábitos (história de usuário 8).
 * Todo dia à meia-noite, os hábitos diários voltam a ficar desmarcados.
 * @param log logger do Fastify (app.log)
 */
export function agendarResetHabitos(log) {
  cron.schedule(
    MEIA_NOITE,
    async () => {
      try {
        await resetarHabitosDiarios();
        log.info('Hábitos diários resetados pelo agendador da meia-noite');
      } catch (err) {
        // Um erro aqui não pode derrubar o servidor; o agendador tenta de novo amanhã
        log.error(err, 'Falha ao resetar hábitos diários');
      }
    },
    { timezone: FUSO_HORARIO }
  );

  // Hábitos semanais voltam a ficar desmarcados toda segunda-feira, à meia-noite
  cron.schedule(
    SEGUNDA_MEIA_NOITE,
    async () => {
      try {
        await resetarHabitosSemanais();
        log.info('Hábitos semanais resetados pelo agendador de segunda-feira');
      } catch (err) {
        log.error(err, 'Falha ao resetar hábitos semanais');
      }
    },
    { timezone: FUSO_HORARIO }
  );

  log.info(`Reset de hábitos agendado (${MEIA_NOITE} e ${SEGUNDA_MEIA_NOITE}, ${FUSO_HORARIO})`);
}
