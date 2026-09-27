import prisma from '../lib/prisma.js';
import { autenticar } from '../hooks/autenticar.js';

/**
 * Desmarca os hábitos diários de TODOS os estudantes (concluidoHoje = false).
 * Usada só pelo agendador da meia-noite (src/jobs) — é global de propósito,
 * roda sem request/usuário. A rota manual de reset (POST /reset, abaixo)
 * é diferente: reseta só os hábitos de quem está logado.
 */
export async function resetarHabitosDiarios() {
  await prisma.habito.updateMany({
    where: { recorrencia: 'diario' },
    data: { concluidoHoje: false },
  });
}

/**
 * Rotas CRUD para Hábitos e tarefas recorrentes
 * Prefixo: /api/habitos — todas exigem login; cada estudante só vê/edita os próprios.
 */
export async function habitosRoutes(app) {
  app.addHook('onRequest', autenticar);

  // GET / — Lista os hábitos do estudante logado
  app.get('/', async (request, reply) => {
    try {
      const habitos = await prisma.habito.findMany({
        where: { estudanteId: request.user.id },
        orderBy: { createdAt: 'asc' },
      });
      return habitos;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST / — Cria um novo hábito
  app.post('/', async (request, reply) => {
    const { descricao, recorrencia } = request.body;

    if (!descricao) {
      return reply.status(400).send({ error: 'Campo obrigatório: descricao' });
    }

    try {
      const habito = await prisma.habito.create({
        data: {
          descricao,
          recorrencia: recorrencia || 'diario',
          estudanteId: request.user.id, // dono vem sempre do token, nunca do corpo da requisição
        },
      });
      return reply.status(201).send(habito);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /:id — Atualiza um hábito (ex: marcar como concluído, editar descrição) — só se for do estudante logado
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    const { descricao, recorrencia, concluidoHoje } = request.body;

    try {
      // updateMany com id + estudanteId no where: 0 linhas afetadas cobre
      // tanto "não existe" quanto "existe mas é de outro estudante" — a
      // resposta (404) é a mesma nos dois casos, não revela qual foi.
      const { count } = await prisma.habito.updateMany({
        where: { id: idNum, estudanteId: request.user.id },
        data: {
          ...(descricao && { descricao }),
          ...(recorrencia && { recorrencia }),
          ...(concluidoHoje !== undefined && { concluidoHoje }),
        },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Hábito não encontrado' });
      }
      return await prisma.habito.findUnique({ where: { id: idNum } });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove um hábito (só se for do estudante logado)
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      const { count } = await prisma.habito.deleteMany({
        where: { id: idNum, estudanteId: request.user.id },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Hábito não encontrado' });
      }
      return reply.status(204).send();
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST /reset — Reseta manualmente só os hábitos diários do estudante logado
  // (o reset automático da meia-noite, global, roda em src/jobs/resetHabitos.js)
  app.post('/reset', async (request, reply) => {
    try {
      await prisma.habito.updateMany({
        where: { recorrencia: 'diario', estudanteId: request.user.id },
        data: { concluidoHoje: false },
      });
      return { message: 'Hábitos diários resetados com sucesso' };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
