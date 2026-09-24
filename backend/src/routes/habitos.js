import prisma from '../lib/prisma.js';

/**
 * Desmarca todos os hábitos diários (concluidoHoje = false).
 * Usada pela rota POST /reset e pelo agendador da meia-noite (src/jobs).
 */
export async function resetarHabitosDiarios() {
  await prisma.habito.updateMany({
    where: { recorrencia: 'diario' },
    data: { concluidoHoje: false },
  });
}

/**
 * Rotas CRUD para Hábitos e tarefas recorrentes
 * Prefixo: /api/habitos
 */
export async function habitosRoutes(app) {
  // GET / — Lista todos os hábitos
  app.get('/', async () => {
    const habitos = await prisma.habito.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return habitos;
  });

  // POST / — Cria um novo hábito
  app.post('/', async (request, reply) => {
    const { descricao, recorrencia } = request.body;

    if (!descricao) {
      return reply.status(400).send({ error: 'Campo obrigatório: descricao' });
    }

    const habito = await prisma.habito.create({
      data: {
        descricao,
        recorrencia: recorrencia || 'diario',
      },
    });
    return reply.status(201).send(habito);
  });

  // PUT /:id — Atualiza um hábito (ex: marcar como concluído)
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { descricao, recorrencia, concluidoHoje } = request.body;

    try {
      const habito = await prisma.habito.update({
        where: { id: Number(id) },
        data: {
          ...(descricao && { descricao }),
          ...(recorrencia && { recorrencia }),
          ...(concluidoHoje !== undefined && { concluidoHoje }),
        },
      });
      return habito;
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Hábito não encontrado' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove um hábito
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.habito.delete({ where: { id: Number(id) } });
      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Hábito não encontrado' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST /reset — Reseta todos os hábitos diários manualmente
  // (o reset automático da meia-noite roda em src/jobs/resetHabitos.js)
  app.post('/reset', async () => {
    await resetarHabitosDiarios();
    return { message: 'Hábitos diários resetados com sucesso' };
  });
}
