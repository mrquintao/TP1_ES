import prisma from '../lib/prisma.js';

/**
 * Rotas CRUD para Avaliações (provas, testes, etc.)
 * Prefixo: /api/avaliacoes
 */
export async function avaliacoesRoutes(app) {
  // GET / — Lista todas as avaliações (ordenadas por data)
  app.get('/', async (request, reply) => {
    try {
      const avaliacoes = await prisma.avaliacao.findMany({
        orderBy: { dataRealizacao: 'asc' },
      });
      return avaliacoes;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /:id — Busca uma avaliação por ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      const avaliacao = await prisma.avaliacao.findUnique({
        where: { id: idNum },
      });
      if (!avaliacao) {
        return reply.status(404).send({ error: 'Avaliação não encontrada' });
      }
      return avaliacao;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST / — Cria uma nova avaliação
  app.post('/', async (request, reply) => {
    const { disciplina, descricao, peso, dataRealizacao, dataAlarme } = request.body;

    if (!disciplina || !dataRealizacao) {
      return reply.status(400).send({ error: 'Campos obrigatórios: disciplina, dataRealizacao' });
    }
    const dataRealDate = new Date(dataRealizacao);
    if (isNaN(dataRealDate.getTime())) {
      return reply.status(400).send({ error: 'dataRealizacao inválida' });
    }
    const dataAlarmeDate = dataAlarme ? new Date(dataAlarme) : null;
    if (dataAlarme && isNaN(dataAlarmeDate.getTime())) {
      return reply.status(400).send({ error: 'dataAlarme inválida' });
    }

    try {
      const avaliacao = await prisma.avaliacao.create({
        data: {
          disciplina,
          descricao,
          peso: peso ?? 1.0,
          dataRealizacao: dataRealDate,
          dataAlarme: dataAlarmeDate,
        },
      });
      return reply.status(201).send(avaliacao);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /:id — Atualiza uma avaliação existente
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    const { disciplina, descricao, peso, dataRealizacao, dataAlarme } = request.body;

    try {
      const avaliacao = await prisma.avaliacao.update({
        where: { id: idNum },
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
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      await prisma.avaliacao.delete({ where: { id: idNum } });
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
