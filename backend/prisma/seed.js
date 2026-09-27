import { PrismaClient } from '@prisma/client';
import { hashSenha } from '../src/lib/senha.js';

const prisma = new PrismaClient();

// Conta fixa de demonstração — os dados de exemplo abaixo pertencem só a ela.
const DEMO_EMAIL = 'demo@studysync.com';
const DEMO_SENHA = 'demo123';

/**
 * Seed — popula o banco de dados com dados de exemplo para o StudySync.
 * Executar com: npm run db:seed
 *
 * Roda quantas vezes precisar sem risco: só cria/reaproveita a conta demo
 * (upsert, nunca duplica) e só apaga/recria os dados DELA — nunca mexe em
 * provas, trabalhos ou hábitos de outras contas.
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const demo = await prisma.estudante.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      nome: 'Conta Demo',
      email: DEMO_EMAIL,
      senhaHash: await hashSenha(DEMO_SENHA),
    },
  });

  // Limpa só os dados da conta demo antes de recriar (ordem importa por causa das FKs)
  await prisma.membroGrupo.deleteMany({ where: { trabalho: { estudanteId: demo.id } } });
  await prisma.trabalhoGrupo.deleteMany({ where: { estudanteId: demo.id } });
  await prisma.avaliacao.deleteMany({ where: { estudanteId: demo.id } });
  await prisma.habito.deleteMany({ where: { estudanteId: demo.id } });

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
        estudanteId: demo.id,
      },
      {
        disciplina: 'Cálculo III',
        descricao: 'Integrais múltiplas',
        peso: 1.0,
        dataRealizacao: daqui20,
        dataAlarme: null,
        estudanteId: demo.id,
      },
      {
        disciplina: 'Redes de Computadores',
        descricao: 'Quiz rápido — camada de transporte',
        peso: 0.5,
        dataRealizacao: daqui5,
        dataAlarme: alarme3b,
        estudanteId: demo.id,
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
      estudanteId: demo.id,
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
      estudanteId: demo.id,
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
      { descricao: 'Estudar 1h de Cálculo', recorrencia: 'diario', estudanteId: demo.id },
      { descricao: 'Revisar anotações de Engenharia de Software', recorrencia: 'diario', estudanteId: demo.id },
      { descricao: 'Fazer exercício físico', recorrencia: 'diario', estudanteId: demo.id },
      { descricao: 'Revisão semanal do progresso', recorrencia: 'semanal', estudanteId: demo.id },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`   Conta demo: ${DEMO_EMAIL} / senha: ${DEMO_SENHA}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
