import prisma from '../lib/prisma.js';
import { autenticar } from '../hooks/autenticar.js';

/**
 * Rotas CRUD para Avaliações (provas, testes, etc.)
 * Prefixo: /api/avaliacoes — todas exigem login; cada estudante só vê/edita as próprias.
 */
export async function avaliacoesRoutes(app) {
  app.addHook('onRequest', autenticar);

  // GET / — Lista as avaliações do estudante logado (ordenadas por data)
  app.get('/', async (request, reply) => {
    try {
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { estudanteId: request.user.id },
        orderBy: { dataRealizacao: 'asc' },
      });
      return avaliacoes;
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // GET /:id — Busca uma avaliação por ID (só se for do estudante logado)
  app.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      // findFirst (não findUnique) porque o filtro combina id + estudanteId
      const avaliacao = await prisma.avaliacao.findFirst({
        where: { id: idNum, estudanteId: request.user.id },
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
          estudanteId: request.user.id, // dono vem sempre do token, nunca do corpo da requisição
        },
      });
      return reply.status(201).send(avaliacao);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /:id — Atualiza uma avaliação existente (só se for do estudante logado)
  app.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    const { disciplina, descricao, peso, dataRealizacao, dataAlarme } = request.body;

    try {
      // updateMany com id + estudanteId no where: 0 linhas afetadas cobre
      // tanto "não existe" quanto "existe mas é de outro estudante" — a
      // resposta (404) é a mesma nos dois casos, não revela qual foi.
      const { count } = await prisma.avaliacao.updateMany({
        where: { id: idNum, estudanteId: request.user.id },
        data: {
          ...(disciplina && { disciplina }),
          ...(descricao !== undefined && { descricao }),
          ...(peso !== undefined && { peso }),
          ...(dataRealizacao && { dataRealizacao: new Date(dataRealizacao) }),
          // dataAlarme !== undefined também cobre limpar o alarme (enviar null ou "")
          ...(dataAlarme !== undefined && { dataAlarme: dataAlarme ? new Date(dataAlarme) : null }),
          // Mudou a data do alarme ou a data-limite? O item pode voltar a ficar
          // urgente mais pra frente — reseta pra poder notificar de novo
          ...((dataRealizacao || dataAlarme !== undefined) && { notificadoUrgente: false }),
        },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Avaliação não encontrada' });
      }
      return await prisma.avaliacao.findUnique({ where: { id: idNum } });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /:id — Remove uma avaliação (só se for do estudante logado)
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return reply.status(400).send({ error: 'ID inválido' });
    }
    try {
      const { count } = await prisma.avaliacao.deleteMany({
        where: { id: idNum, estudanteId: request.user.id },
      });
      if (count === 0) {
        return reply.status(404).send({ error: 'Avaliação não encontrada' });
      }
      return reply.status(204).send();
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
