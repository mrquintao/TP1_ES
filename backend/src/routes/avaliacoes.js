import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Rotas CRUD para Avaliações (provas, testes, etc.)
 * Prefixo: /api/avaliacoes
 */
export async function avaliacoesRoutes(app) {
  // GET / — Lista todas as avaliações (ordenadas por data)
  app.get('/', async () => {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: { dataRealizacao: 'asc' },
    });
    return avaliacoes;
  });

  // GET /:id — Busca uma avaliação por ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: Number(id) },
    });

    if (!avaliacao) {
      return reply.status(404).send({ error: 'Avaliação não encontrada' });
    }
    return avaliacao;
  });

  // POST / — Cria uma nova avaliação
  app.post('/', async (request, reply) => {
    const { disciplina, descricao, peso, dataRealizacao } = request.body;
    const avaliacao = await prisma.avaliacao.create({
      data: {
        disciplina,
        descricao,
        peso: peso || 1.0,
        dataRealizacao: new Date(dataRealizacao),
      },
    });
    return reply.status(201).send(avaliacao);
  });

  // PUT /:id — Atualiza uma avaliação existente
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { disciplina, descricao, peso, dataRealizacao } = request.body;

    try {
      const avaliacao = await prisma.avaliacao.update({
        where: { id: Number(id) },
        data: {
          ...(disciplina && { disciplina }),
          ...(descricao !== undefined && { descricao }),
          ...(peso && { peso }),
          ...(dataRealizacao && { dataRealizacao: new Date(dataRealizacao) }),
        },
      });
      return avaliacao;
    } catch {
      return reply.status(404).send({ error: 'Avaliação não encontrada' });
    }
  });

  // DELETE /:id — Remove uma avaliação
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.avaliacao.delete({ where: { id: Number(id) } });
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Avaliação não encontrada' });
    }
  });
}
