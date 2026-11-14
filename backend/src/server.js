import { buildApp } from './app.js';
import { agendarResetHabitos } from './jobs/resetHabitos.js';
import { agendarNotificacoes } from './jobs/notificacoes.js';

// Cria o app (plugins + rotas) com logs ativados
const app = await buildApp();

// Agenda os jobs diários
agendarResetHabitos(app.log);
agendarNotificacoes(app.log);

// Inicia o servidor na porta definida pela env ou 3000
const PORT = process.env.PORT || 3000;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 StudySync Backend rodando na porta ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
