import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    } catch {
      return reply.status(404).send({ error: 'Trabalho não encontrado' });
    }
  });

  // DELETE /:id — Remove um trabalho (e seus membros via cascade)
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.trabalhoGrupo.delete({ where: { id: Number(id) } });
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ error: 'Trabalho não encontrado' });
    }
  });
}
