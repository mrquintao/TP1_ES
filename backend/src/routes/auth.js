import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const SALT_ROUNDS = 10;

/**
 * Rotas de autenticação (cadastro, login, sessão atual).
 * Prefixo: /api/auth — públicas (não passam pelo hook src/hooks/autenticar.js),
 * exceto /me.
 */
export async function authRoutes(app) {
  // POST /cadastro — cria uma conta nova e já devolve o token de login
  app.post('/cadastro', async (request, reply) => {
    const { nome, email, senha } = request.body;

    if (!nome || !email || !senha) {
      return reply.status(400).send({ error: 'Campos obrigatórios: nome, email, senha' });
    }
    if (senha.length < 6) {
      return reply.status(400).send({ error: 'A senha precisa ter pelo menos 6 caracteres' });
    }

    try {
      const existente = await prisma.estudante.findUnique({ where: { email } });
      if (existente) {
        return reply.status(409).send({ error: 'Já existe uma conta com esse e-mail' });
      }

      // Nunca guardamos a senha em texto puro — só o hash
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      const estudante = await prisma.estudante.create({
        data: { nome, email, senhaHash },
      });

      const token = app.jwt.sign({ id: estudante.id });
      return reply.status(201).send({
        token,
        usuario: { id: estudante.id, nome: estudante.nome, email: estudante.email },
      });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
