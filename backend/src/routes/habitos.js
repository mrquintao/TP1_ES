import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    } catch {
      return reply.status(404).send({ error: 'Hábito não encontrado' });
    }
  });

  // DELETE /:id — Remove um hábito
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.habito.delete({ where: { id: Number(id) } });
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Hábito não encontrado' });
    }
  });

  // POST /reset — Reseta todos os hábitos diários (concluidoHoje = false)
  // Será chamado automaticamente à meia-noite ou manualmente
  app.post('/reset', async () => {
    await prisma.habito.updateMany({
      where: { recorrencia: 'diario' },
      data: { concluidoHoje: false },
    });
    return { message: 'Hábitos diários resetados com sucesso' };
  });
}
