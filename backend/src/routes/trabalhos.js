import prisma from '../lib/prisma.js';
import { autenticar } from '../hooks/autenticar.js';
import { validarTrabalho } from '../lib/validacao.js';

/**
 * Rotas CRUD para Trabalhos em Grupo
 * Prefixo: /api/trabalhos — todas exigem login; cada estudante só vê/edita os próprios.
 */
export async function trabalhosRoutes(app) {
  app.addHook('onRequest', autenticar);

  // GET / — Lista os trabalhos do estudante logado, com seus membros
  app.get('/', async (request, reply) => {
    try {
      const trabalhos = await prisma.trabalhoGrupo.findMany({
        where: { estudanteId: request.user.id },
        include: { membros: true },
        orderBy: { prazoEntrega: 'asc' },
      });
      return trabalhos;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /:id — Busca um trabalho por ID (só se for do estudante logado)
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      // findFirst (não findUnique) porque o filtro combina id + estudanteId
      const trabalho = await prisma.trabalhoGrupo.findFirst({
        where: { id: idNum, estudanteId: request.user.id },
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
    const erroCampos = validarTrabalho({ titulo, disciplina, linksUteis, membros });
    if (erroCampos) {
      return reply.status(400).send({ error: erroCampos });
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
          // só nome e escopo: o resto do que vier no corpo não vai pro banco
          membros: membros ? { create: membros.map(({ nome, escopo }) => ({ nome: nome.trim(), escopo })) } : undefined,
          estudanteId: request.user.id, // dono vem sempre do token, nunca do corpo da requisição
        },
        include: { membros: true },
      });
      return reply.status(201).send(trabalho);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /:id — Atualiza um trabalho existente (só se for do estudante logado)
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    const { titulo, disciplina, prazoEntrega, dataAlarme, linksUteis, status } = request.body;

    const erroCampos = validarTrabalho({ titulo, disciplina, linksUteis, status });
    if (erroCampos) {
      return reply.status(400).send({ error: erroCampos });
    }

    // Mesma validação do POST: data inválida vira 400, não erro 500 do Prisma
    if (prazoEntrega && isNaN(new Date(prazoEntrega).getTime())) {
      return reply.status(400).send({ error: 'prazoEntrega inválido' });
    }
    if (dataAlarme && isNaN(new Date(dataAlarme).getTime())) {
      return reply.status(400).send({ error: 'dataAlarme inválida' });
    }

    try {
      // updateMany com id + estudanteId no where: 0 linhas afetadas cobre
      // tanto "não existe" quanto "existe mas é de outro estudante" — a
      // resposta (404) é a mesma nos dois casos, não revela qual foi.
      const { count } = await prisma.trabalhoGrupo.updateMany({
        where: { id: idNum, estudanteId: request.user.id },
        data: {
        // updatedAt sempre muda: com um PUT sem nenhum campo novo o data ficaria
        // vazio e o Prisma contaria 0 linhas, devolvendo 404 pra um item que existe
        updatedAt: new Date(),
          ...(titulo && { titulo }),
          ...(disciplina !== undefined && { disciplina }),
          ...(prazoEntrega && { prazoEntrega: new Date(prazoEntrega) }),
          // dataAlarme !== undefined também cobre limpar o alarme (enviar null ou "")
          ...(dataAlarme !== undefined && { dataAlarme: dataAlarme ? new Date(dataAlarme) : null }),
          // Mudou a data do alarme ou o prazo? O item pode voltar a ficar urgente
          // mais pra frente — reseta pra poder notificar de novo
          ...((prazoEntrega || dataAlarme !== undefined) && { notificadoUrgente: false }),
          ...(linksUteis && { linksUteis }),
          ...(status && { status }),
        },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Trabalho não encontrado' });
      }
      return await prisma.trabalhoGrupo.findUnique({
        where: { id: idNum },
        include: { membros: true },
      });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove um trabalho e seus membros via cascade (só se for do estudante logado)
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      const { count } = await prisma.trabalhoGrupo.deleteMany({
        where: { id: idNum, estudanteId: request.user.id },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Trabalho não encontrado' });
      }
      return reply.status(204).send();
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
