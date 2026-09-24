import prisma from '../lib/prisma.js';

/**
 * Rotas CRUD para Trabalhos em Grupo
 * Prefixo: /api/trabalhos
 */
export async function trabalhosRoutes(app) {
  // GET / — Lista todos os trabalhos com seus membros
  app.get('/', async () => {
    const trabalhos = await prisma.trabalhoGrupo.findMany({
      include: { membros: true },
      orderBy: { prazoEntrega: 'asc' },
    });
    return trabalhos;
  });

  // GET /:id — Busca um trabalho por ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const trabalho = await prisma.trabalhoGrupo.findUnique({
      where: { id: Number(id) },
      include: { membros: true },
    });

    if (!trabalho) {
      return reply.status(404).send({ error: 'Trabalho não encontrado' });
    }
    return trabalho;
  });

  // POST / — Cria um novo trabalho (com membros opcionais)
  app.post('/', async (request, reply) => {
    const { titulo, disciplina, prazoEntrega, linksUteis, membros } = request.body;

    if (!titulo || !prazoEntrega) {
      return reply.status(400).send({ error: 'Campos obrigatórios: titulo, prazoEntrega' });
    }

    const trabalho = await prisma.trabalhoGrupo.create({
      data: {
        titulo,
        disciplina,
        prazoEntrega: new Date(prazoEntrega),
        linksUteis: linksUteis || [],
        membros: membros ? { create: membros } : undefined,
      },
      include: { membros: true },
    });
    return reply.status(201).send(trabalho);
  });

  // PUT /:id — Atualiza um trabalho existente
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { titulo, disciplina, prazoEntrega, linksUteis, status } = request.body;

    try {
      const trabalho = await prisma.trabalhoGrupo.update({
        where: { id: Number(id) },
        data: {
          ...(titulo && { titulo }),
          ...(disciplina !== undefined && { disciplina }),
          ...(prazoEntrega && { prazoEntrega: new Date(prazoEntrega) }),
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
    try {
      await prisma.trabalhoGrupo.delete({ where: { id: Number(id) } });
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
