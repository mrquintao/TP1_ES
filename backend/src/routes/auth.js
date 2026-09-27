import prisma from '../lib/prisma.js';
import { hashSenha, compararSenha } from '../lib/senha.js';

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
      const senhaHash = await hashSenha(senha);
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

  // POST /login — verifica e-mail/senha e devolve um token novo
  app.post('/login', async (request, reply) => {
    const { email, senha } = request.body;

    if (!email || !senha) {
      return reply.status(400).send({ error: 'Campos obrigatórios: email, senha' });
    }

    try {
      const estudante = await prisma.estudante.findUnique({ where: { email } });
      // Mensagem sempre genérica: não revela se o e-mail existe ou se foi a senha que errou
      if (!estudante || !(await compararSenha(senha, estudante.senhaHash))) {
        return reply.status(401).send({ error: 'E-mail ou senha inválidos' });
      }

      const token = app.jwt.sign({ id: estudante.id });
      return {
        token,
        usuario: { id: estudante.id, nome: estudante.nome, email: estudante.email },
      };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /me — devolve o usuário do token atual (o front usa pra restaurar a sessão ao recarregar a página)
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Sessão inválida ou expirada' });
    }

    const estudante = await prisma.estudante.findUnique({ where: { id: request.user.id } });
    if (!estudante) {
      return reply.status(401).send({ error: 'Sessão inválida ou expirada' });
    }
    return { usuario: { id: estudante.id, nome: estudante.nome, email: estudante.email } };
  });
}
