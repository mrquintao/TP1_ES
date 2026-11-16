import { test, expect } from '@playwright/test';
import { cadastrarUsuario, criarProva, diaISO } from './helpers.js';

test('sair, rota protegida, isolamento entre contas e login de volta', async ({ page }) => {
  // Conta A cadastra uma prova
  const contaA = await cadastrarUsuario(page);
  const prova = `Prova da conta A ${contaA.sufixo}`;
  await criarProva(page, { disciplina: prova, data: diaISO(10) });

  // Sair leva pro login, e as páginas internas deixam de abrir sem sessão
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/provas');
  await expect(page).toHaveURL('/login');

  // Conta B não enxerga a prova da conta A
  await cadastrarUsuario(page);
  await page.goto('/provas');
  await expect(page.getByText('Nenhuma prova cadastrada ainda.')).toBeVisible();
  await expect(page.getByText(prova)).toHaveCount(0);
  await page.getByRole('button', { name: 'Sair' }).click();

  // Senha errada não entra
  await page.locator('input[type="email"]').fill(contaA.email);
  await page.locator('input[type="password"]').fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/login');

  // Com a senha certa, a conta A volta a ver a própria prova
  await page.locator('input[type="password"]').fill(contaA.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/provas');
  await expect(page.getByText(prova)).toBeVisible();
});
