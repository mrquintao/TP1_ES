import prisma from '../lib/prisma.js';

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
    const { disciplina, descricao, peso, dataRealizacao, dataAlarme } = request.body;

    if (!disciplina || !dataRealizacao) {
      return reply.status(400).send({ error: 'Campos obrigatórios: disciplina, dataRealizacao' });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        disciplina,
        descricao,
        peso: peso ?? 1.0,
        dataRealizacao: new Date(dataRealizacao),
        dataAlarme: dataAlarme ? new Date(dataAlarme) : null,
      },
    });
    return reply.status(201).send(avaliacao);
  });

  // PUT /:id — Atualiza uma avaliação existente
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { disciplina, descricao, peso, dataRealizacao, dataAlarme } = request.body;

    try {
      const avaliacao = await prisma.avaliacao.update({
        where: { id: Number(id) },
        data: {
          ...(disciplina && { disciplina }),
          ...(descricao !== undefined && { descricao }),
          ...(peso !== undefined && { peso }),
          ...(dataRealizacao && { dataRealizacao: new Date(dataRealizacao) }),
          // dataAlarme !== undefined também cobre limpar o alarme (enviar null ou "")
          ...(dataAlarme !== undefined && { dataAlarme: dataAlarme ? new Date(dataAlarme) : null }),
        },
      });
      return avaliacao;
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Avaliação não encontrada' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove uma avaliação
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.avaliacao.delete({ where: { id: Number(id) } });
      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Avaliação não encontrada' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
