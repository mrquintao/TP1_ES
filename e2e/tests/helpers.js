import { expect } from '@playwright/test';

// Data de hoje no formato aceito por <input type="date"> (AAAA-MM-DD)
export function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

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

  return { email, sufixo };
}
