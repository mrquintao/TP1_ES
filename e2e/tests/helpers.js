import { expect } from '@playwright/test';

// Data de hoje + N dias no formato aceito por <input type="date"> (AAAA-MM-DD)
export function diaISO(dias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export const hojeISO = () => diaISO(0);

// Cria um usuário novo e único pela tela de cadastro; o app já entra logado.
export async function cadastrarUsuario(page) {
  const sufixo = Date.now();
  const email = `e2e${sufixo}@teste.com`;

  await page.goto('/cadastro');
  await page.locator('input[type="text"]').fill('Usuário E2E');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('senha123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL('/');

  return { email, senha: 'senha123', sufixo };
}

// Cria uma prova pela tela de Provas
export async function criarProva(page, { disciplina, data, alarme }) {
  await page.goto('/provas');
  await page.getByRole('button', { name: '+ Nova Prova' }).click();
  const form = page.locator('form');
  await form.locator('input[type="text"]').nth(0).fill(disciplina);
  await form.locator('input[type="date"]').nth(0).fill(data);
  if (alarme) await form.locator('input[type="date"]').nth(1).fill(alarme);
  await form.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText(disciplina)).toBeVisible();
}
