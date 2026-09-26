import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed — popula o banco de dados com dados de exemplo para o StudySync.
 * Executar com: npm run db:seed
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa as tabelas antes de inserir (ordem importa por causa das FKs)
  await prisma.membroGrupo.deleteMany();
  await prisma.trabalhoGrupo.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.habito.deleteMany();

  // Avaliações de exemplo
  const hoje = new Date();
  const daqui10 = new Date(hoje); daqui10.setDate(hoje.getDate() + 10);
  const daqui20 = new Date(hoje); daqui20.setDate(hoje.getDate() + 20);
  const daqui5  = new Date(hoje); daqui5.setDate(hoje.getDate() + 5);
  const alarme3 = new Date(daqui10); alarme3.setDate(daqui10.getDate() - 3);
  const alarme3b = new Date(daqui5); alarme3b.setDate(daqui5.getDate() - 3);

  await prisma.avaliacao.createMany({
    data: [
      {
        disciplina: 'Engenharia de Software',
        descricao: 'Prova teórica — capítulos 1-5',
        peso: 2.0,
        dataRealizacao: daqui10,
        dataAlarme: alarme3,
      },
      {
        disciplina: 'Cálculo III',
        descricao: 'Integrais múltiplas',
        peso: 1.0,
        dataRealizacao: daqui20,
        dataAlarme: null,
      },
      {
        disciplina: 'Redes de Computadores',
        descricao: 'Quiz rápido — camada de transporte',
        peso: 0.5,
        dataRealizacao: daqui5,
        dataAlarme: alarme3b,
      },
    ],
  });

  // Trabalhos de exemplo
  const prazo1 = new Date(hoje); prazo1.setDate(hoje.getDate() + 15);
  const prazo2 = new Date(hoje); prazo2.setDate(hoje.getDate() + 30);
  const alarmoT = new Date(prazo1); alarmoT.setDate(prazo1.getDate() - 3);

  await prisma.trabalhoGrupo.create({
    data: {
      titulo: 'TP1 — StudySync',
      disciplina: 'Engenharia de Software',
      prazoEntrega: prazo1,
      dataAlarme: alarmoT,
      status: 'em_andamento',
      linksUteis: ['https://github.com/mrquintao/TP1_ES'],
      membros: {
        create: [
          { nome: 'Guilherme', escopo: 'Backend + DevOps' },
          { nome: 'Mateus', escopo: 'Frontend — Calendário' },
          { nome: 'Lucas', escopo: 'Frontend — UI/UX' },
        ],
      },
    },
  });

  await prisma.trabalhoGrupo.create({
    data: {
      titulo: 'Trabalho de Redes — Simulação TCP',
      disciplina: 'Redes de Computadores',
      prazoEntrega: prazo2,
      dataAlarme: null,
      status: 'pendente',
      linksUteis: [],
      membros: {
        create: [
          { nome: 'Guilherme' },
          { nome: 'Mateus' },
        ],
      },
    },
  });

  // Hábitos de exemplo
  await prisma.habito.createMany({
    data: [
      { descricao: 'Estudar 1h de Cálculo', recorrencia: 'diario' },
      { descricao: 'Revisar anotações de Engenharia de Software', recorrencia: 'diario' },
      { descricao: 'Fazer exercício físico', recorrencia: 'diario' },
      { descricao: 'Revisão semanal do progresso', recorrencia: 'semanal' },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
