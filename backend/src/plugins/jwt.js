import fastifyJwt from '@fastify/jwt';

/**
 * Registra o plugin de JWT no Fastify. Depois disso:
 *  - app.jwt.sign(payload) emite um token (usado no cadastro e no login)
 *  - request.jwtVerify() decodifica o token e popula request.user
 *    (usado no hook de autenticação, src/hooks/autenticar.js)
 *
 * Recusa subir sem JWT_SECRET no ambiente — nunca roda "seguro por acidente"
 * com uma chave padrão conhecida.
 */
export async function registrarJwt(app) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definido no ambiente — obrigatório para autenticação.');
  }

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '7d' },
  });
}
