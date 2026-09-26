import prisma from '../lib/prisma.js';

/**
 * Rotas CRUD para Trabalhos em Grupo
 * Prefixo: /api/trabalhos
 */
export async function trabalhosRoutes(app) {
  // GET / — Lista todos os trabalhos com seus membros
  app.get('/', async (request, reply) => {
    try {
      const trabalhos = await prisma.trabalhoGrupo.findMany({
        include: { membros: true },
        orderBy: { prazoEntrega: 'asc' },
      });
      return trabalhos;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /:id — Busca um trabalho por ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      const trabalho = await prisma.trabalhoGrupo.findUnique({
        where: { id: idNum },
        include: { membros: true },
      });
      if (!trabalho) {
        return reply.status(404).send({ error: 'Trabalho não encontrado' });
      }
      return trabalho;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // POST / — Cria um novo trabalho (com membros opcionais)
  app.post('/', async (request, reply) => {
    const { titulo, disciplina, prazoEntrega, dataAlarme, linksUteis, membros } = request.body;

    if (!titulo || !prazoEntrega) {
      return reply.status(400).send({ error: 'Campos obrigatórios: titulo, prazoEntrega' });
    }
    const prazoDate = new Date(prazoEntrega);
    if (isNaN(prazoDate.getTime())) {
      return reply.status(400).send({ error: 'prazoEntrega inválido' });
    }
    const dataAlarmeDate = dataAlarme ? new Date(dataAlarme) : null;
    if (dataAlarme && isNaN(dataAlarmeDate.getTime())) {
      return reply.status(400).send({ error: 'dataAlarme inválida' });
    }

    try {
      const trabalho = await prisma.trabalhoGrupo.create({
        data: {
          titulo,
          disciplina,
          prazoEntrega: prazoDate,
          dataAlarme: dataAlarmeDate,
          linksUteis: linksUteis || [],
          membros: membros ? { create: membros } : undefined,
        },
        include: { membros: true },
      });
      return reply.status(201).send(trabalho);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /:id — Atualiza um trabalho existente
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    const { titulo, disciplina, prazoEntrega, dataAlarme, linksUteis, status } = request.body;

    try {
      const trabalho = await prisma.trabalhoGrupo.update({
        where: { id: idNum },
        data: {
          ...(titulo && { titulo }),
          ...(disciplina !== undefined && { disciplina }),
          ...(prazoEntrega && { prazoEntrega: new Date(prazoEntrega) }),
          // dataAlarme !== undefined também cobre limpar o alarme (enviar null ou "")
          ...(dataAlarme !== undefined && { dataAlarme: dataAlarme ? new Date(dataAlarme) : null }),
          ...(linksUteis && { linksUteis }),
          ...(status && { status }),
        },
        include: { membros: true },
      });
      return trabalho;
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Trabalho não encontrado' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove um trabalho (e seus membros via cascade)
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      await prisma.trabalhoGrupo.delete({ where: { id: idNum } });
      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Trabalho não encontrado' });
      }
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
