import prisma from '../lib/prisma.js';
import { autenticar } from '../hooks/autenticar.js';
import { chaveDataBrasilia } from '../lib/urgencia.js';

const UM_DIA = 24 * 60 * 60 * 1000;
const MAX_DIAS_INTERVALO = 400;

const chaveData = (data) => data.toISOString().slice(0, 10);

function expandirHabito(habito, inicio, fim) {
  const eventos = [];
  // dia de criação no fuso de Brasília (não em UTC), igual ao resto do sistema
  const criadoEm = new Date(`${chaveDataBrasilia(habito.createdAt)}T00:00:00Z`);
  const cursor = new Date(Math.max(criadoEm.getTime(), inicio.getTime()));

  if (habito.recorrencia === 'semanal') {
    const diasDesdeCriacao = Math.floor((cursor - criadoEm) / UM_DIA);
    cursor.setUTCDate(cursor.getUTCDate() + ((7 - (diasDesdeCriacao % 7)) % 7));
  }

  const intervalo = habito.recorrencia === 'semanal' ? 7 : 1;
  while (cursor <= fim) {
    eventos.push({
      id: habito.id,
      titulo: habito.descricao,
      tipo: 'habito',
      data: chaveData(cursor),
    });
    cursor.setUTCDate(cursor.getUTCDate() + intervalo);
  }
  return eventos;
}

export async function calendarioRoutes(app) {
  app.addHook('onRequest', autenticar);

  // Agrega provas + trabalhos + hábitos do estudante logado num intervalo de datas
  app.get('/', async (request, reply) => {
    const hoje = new Date();
    const inicioPadrao = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
    const fimPadrao = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 0));
    const inicio = request.query.inicio
      ? new Date(`${request.query.inicio}T00:00:00Z`)
      : inicioPadrao;
    const fim = request.query.fim ? new Date(`${request.query.fim}T00:00:00Z`) : fimPadrao;

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || inicio > fim) {
      return reply.status(400).send({ error: 'Intervalo de datas inválido' });
    }
    // Limita o intervalo: hábitos são expandidos dia a dia, então um intervalo
    // enorme gastaria memória à toa (o front pede no máximo ~6 semanas)
    if ((fim - inicio) / UM_DIA > MAX_DIAS_INTERVALO) {
      return reply.status(400).send({ error: `Intervalo máximo: ${MAX_DIAS_INTERVALO} dias` });
    }

    try {
      const dono = { estudanteId: request.user.id };
      const [avaliacoes, trabalhos, habitos] = await Promise.all([
        prisma.avaliacao.findMany({ where: { ...dono, dataRealizacao: { gte: inicio, lte: fim } } }),
        prisma.trabalhoGrupo.findMany({ where: { ...dono, prazoEntrega: { gte: inicio, lte: fim } } }),
        prisma.habito.findMany({ where: { ...dono, createdAt: { lte: fim } } }),
      ]);

      const eventos = [
        // Provas: inclui disciplina, descricao e peso para o modal de detalhes
        ...avaliacoes.map((item) => ({
          id: item.id,
          titulo: item.descricao ? `${item.disciplina}: ${item.descricao}` : item.disciplina,
          tipo: 'prova',
          data: chaveData(item.dataRealizacao),
          disciplina: item.disciplina,
          descricao: item.descricao,
          peso: item.peso,
        })),
        // Trabalhos: inclui disciplina e status para o modal de detalhes
        ...trabalhos.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          tipo: 'trabalho',
          data: chaveData(item.prazoEntrega),
          disciplina: item.disciplina,
          status: item.status,
        })),
        ...habitos.flatMap((item) => expandirHabito(item, inicio, fim)),
      ];

      return eventos.sort((a, b) => a.data.localeCompare(b.data));
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
