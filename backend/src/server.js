import Fastify from 'fastify';
import cors from '@fastify/cors';
import { avaliacoesRoutes } from './routes/avaliacoes.js';
import { trabalhosRoutes } from './routes/trabalhos.js';
import { habitosRoutes } from './routes/habitos.js';
import { agendarResetHabitos } from './jobs/resetHabitos.js';

// Cria a instância do Fastify com logs ativados
const app = Fastify({ logger: true });

// Registra o plugin de CORS (permite requisições do frontend)
await app.register(cors, {
  origin: true, // aceita qualquer origem em dev
});

// Registra as rotas de cada entidade com prefixo /api
await app.register(avaliacoesRoutes, { prefix: '/api/avaliacoes' });
await app.register(trabalhosRoutes, { prefix: '/api/trabalhos' });
await app.register(habitosRoutes, { prefix: '/api/habitos' });

// Agenda o reset diário dos hábitos (meia-noite)
agendarResetHabitos(app.log);

// Rota de health check
app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Inicia o servidor na porta definida pela env ou 3000
const PORT = process.env.PORT || 3000;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 StudySync Backend rodando na porta ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
