import prisma from '../lib/prisma.js';
import { hashSenha, compararSenha, compararSenhaFalsa } from '../lib/senha.js';
import { autenticar } from '../hooks/autenticar.js';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MAX = 72; // o bcrypt ignora tudo depois de 72 bytes

// E-mail sem espaços nas pontas e em minúsculas, pra "Ana@x.com" e "ana@x.com"
// serem a mesma conta. Devolve '' se não for texto.
const normalizarEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

// Busca ignorando maiúsculas/minúsculas, pra contas antigas guardadas com
// maiúsculas continuarem funcionando no login
const buscarPorEmail = (email) =>
  prisma.estudante.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

// Limite de tentativas por minuto nas rotas públicas (valor definido em app.js)
const limiteAuth = (app) => ({ max: app.limiteAuth, timeWindow: '1 minute' });

// Formato público de um estudante — nunca inclui a senha/hash
function paraUsuarioPublico(estudante) {
  return {
    id: estudante.id,
    nome: estudante.nome,
    email: estudante.email,
    notificarDiario: estudante.notificarDiario,
    notificarUrgente: estudante.notificarUrgente,
  };
}

/**
 * Rotas de autenticação (cadastro, login, sessão atual, preferências).
 * Prefixo: /api/auth — cadastro e login são públicos; /me e /preferencias
 * exigem token (aplicado só nessas duas rotas, não no plugin inteiro).
 */
export async function authRoutes(app) {
  // POST /cadastro — cria uma conta nova e já devolve o token de login
  app.post('/cadastro', { config: { rateLimit: limiteAuth(app) } }, async (request, reply) => {
    const { nome, senha } = request.body;
    const email = normalizarEmail(request.body.email);

    if (!nome || !email || !senha) {
      return reply.status(400).send({ error: 'Campos obrigatórios: nome, email, senha' });
    }
    if (typeof nome !== 'string' || typeof senha !== 'string') {
      return reply.status(400).send({ error: 'nome e senha precisam ser texto' });
    }
    if (!EMAIL_VALIDO.test(email)) {
      return reply.status(400).send({ error: 'E-mail inválido' });
    }
    if (senha.length < 6) {
      return reply.status(400).send({ error: 'A senha precisa ter pelo menos 6 caracteres' });
    }
    if (senha.length > SENHA_MAX) {
      return reply.status(400).send({ error: `A senha pode ter no máximo ${SENHA_MAX} caracteres` });
    }

    try {
      const existente = await buscarPorEmail(email);
      if (existente) {
        return reply.status(409).send({ error: 'Já existe uma conta com esse e-mail' });
      }

      // Nunca guardamos a senha em texto puro — só o hash
      const senhaHash = await hashSenha(senha);
      const estudante = await prisma.estudante.create({
        data: { nome: nome.trim(), email, senhaHash },
      });

      const token = app.jwt.sign({ id: estudante.id });
      return reply.status(201).send({ token, usuario: paraUsuarioPublico(estudante) });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST /login — verifica e-mail/senha e devolve um token novo
  app.post('/login', { config: { rateLimit: limiteAuth(app) } }, async (request, reply) => {
    const { senha } = request.body;
    const email = normalizarEmail(request.body.email);

    if (!email || !senha || typeof senha !== 'string') {
      return reply.status(400).send({ error: 'Campos obrigatórios: email, senha' });
    }

    try {
      const estudante = await buscarPorEmail(email);
      // Sem conta, compara com um hash falso: o tempo de resposta fica igual
      // e não revela quais e-mails existem
      const senhaCorreta = estudante
        ? await compararSenha(senha, estudante.senhaHash)
        : await compararSenhaFalsa(senha);
      // Mensagem sempre genérica: não revela se o e-mail existe ou se foi a senha que errou
      if (!estudante || !senhaCorreta) {
        return reply.status(401).send({ error: 'E-mail ou senha inválidos' });
      }

      const token = app.jwt.sign({ id: estudante.id });
      return { token, usuario: paraUsuarioPublico(estudante) };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /me — devolve o usuário do token atual (o front usa pra restaurar a sessão ao recarregar a página)
  app.get('/me', { onRequest: autenticar }, async (request, reply) => {
    const estudante = await prisma.estudante.findUnique({ where: { id: request.user.id } });
    if (!estudante) {
      return reply.status(401).send({ error: 'Sessão inválida ou expirada' });
    }
    return { usuario: paraUsuarioPublico(estudante) };
  });

  // PUT /preferencias — liga/desliga as notificações por e-mail do estudante logado
  app.put('/preferencias', { onRequest: autenticar }, async (request, reply) => {
    const { notificarDiario, notificarUrgente } = request.body;

    try {
      const estudante = await prisma.estudante.update({
        where: { id: request.user.id },
        data: {
          ...(notificarDiario !== undefined && { notificarDiario }),
          ...(notificarUrgente !== undefined && { notificarUrgente }),
        },
      });
      return { usuario: paraUsuarioPublico(estudante) };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
