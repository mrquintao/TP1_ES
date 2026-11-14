import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { registrarJwt } from './plugins/jwt.js';
import { authRoutes } from './routes/auth.js';
import { avaliacoesRoutes } from './routes/avaliacoes.js';
import { trabalhosRoutes } from './routes/trabalhos.js';
import { habitosRoutes } from './routes/habitos.js';
import { calendarioRoutes } from './routes/calendario.js';

/**
 * Monta a instância do Fastify (plugins + rotas) sem abrir porta nem agendar
 * jobs — assim o servidor real (server.js) e os testes usam o mesmo app.
 */
export async function buildApp({
  logger = true,
  // Máximo de tentativas de login/cadastro por minuto, por IP (freia força bruta)
  limiteAuth = Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
} = {}) {
  const app = Fastify({ logger });
  app.decorate('limiteAuth', limiteAuth);

  // global: false — o limite só vale nas rotas que o pedem (login e cadastro)
  await app.register(rateLimit, { global: false });

  // Restringe o CORS ao frontend configurado
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  // POST/PUT sem corpo (ou sem Content-Type) chegavam com body undefined e as
  // rotas quebravam ao desestruturar; assim eles caem na validação normal (400)
  app.addHook('preValidation', async (request) => {
    if (request.body == null) request.body = {};
  });

  // Plugin de JWT — usado pelas rotas de auth e pelo hook que protege as rotas de dados
  await registrarJwt(app);

  // Rotas de autenticação (públicas — cadastro e login não exigem token)
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Rotas de cada entidade com prefixo /api
  await app.register(avaliacoesRoutes, { prefix: '/api/avaliacoes' });
  await app.register(trabalhosRoutes, { prefix: '/api/trabalhos' });
  await app.register(habitosRoutes, { prefix: '/api/habitos' });
  await app.register(calendarioRoutes, { prefix: '/api/calendario' });

  // Rota de health check
  app.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
