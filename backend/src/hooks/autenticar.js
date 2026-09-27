/**
 * Hook onRequest que exige um token válido. Aplicado só nos grupos de rotas
 * que precisam de login (avaliações, trabalhos, hábitos, calendário) — nunca
 * nas rotas de auth nem no /api/health.
 *
 * Depois dele, request.user.id é o id do estudante autenticado (populado
 * pelo @fastify/jwt dentro de request.jwtVerify()).
 */
export async function autenticar(request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Token ausente, inválido ou expirado' });
  }
}
