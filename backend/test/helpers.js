import { after } from 'node:test';
import prisma from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';

// Testes de integração usam o banco real (DATABASE_URL). Sem ele, são pulados.
export const temBanco = !!process.env.DATABASE_URL;
process.env.JWT_SECRET ||= 'segredo-de-teste';

// Todo e-mail criado nesta execução começa com este prefixo, pra limpar só o que é nosso
const PREFIXO = `it-${process.pid}-`; // por processo: arquivos de teste rodam em paralelo

export async function criarApp(opcoes = {}) {
  // limiteAuth alto: os testes fazem dezenas de cadastros/logins do mesmo IP
  const app = await buildApp({ logger: false, limiteAuth: 100000, ...opcoes });
  after(async () => {
    await prisma.estudante.deleteMany({ where: { email: { startsWith: PREFIXO } } });
    await app.close();
    await prisma.$disconnect();
  });
  return app;
}

let contador = 0;
export const emailUnico = () => `${PREFIXO}${Date.now()}-${contador++}@teste.com`;

// Cadastra um estudante pela API e devolve { token, usuario, email, senha }
export async function cadastrar(app, { nome = 'Teste', senha = 'senha123' } = {}) {
  const email = emailUnico();
  const res = await app.inject({ method: 'POST', url: '/api/auth/cadastro', payload: { nome, email, senha } });
  return { ...res.json(), email, senha };
}

export const comToken = (token) => ({ authorization: `Bearer ${token}` });
