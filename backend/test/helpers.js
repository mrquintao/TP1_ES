import { after } from 'node:test';
import prisma from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';

// Testes de integração usam o banco real (DATABASE_URL). Sem ele, são pulados.
export const temBanco = !!process.env.DATABASE_URL;
process.env.JWT_SECRET ||= 'segredo-de-teste';

// Todo e-mail criado nos testes começa com este prefixo, pra limpar só o que é nosso
const PREFIXO = 'it-';

export async function criarApp() {
  const app = await buildApp({ logger: false });
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
