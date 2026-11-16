import { test, expect } from '@playwright/test';
import { cadastrarUsuario, criarProva, diaISO, hojeISO } from './helpers.js';

test('alarme coloca itens em Urgentes e concluir o trabalho tira ele de lá', async ({ page }) => {
  const { sufixo } = await cadastrarUsuario(page);
  const titulo = `Trabalho urgente ${sufixo}`;
  const provaAtrasada = `Prova atrasada ${sufixo}`;

  // Trabalho com prazo em 5 dias e alarme ligado hoje
  await page.goto('/trabalhos');
  await page.getByRole('button', { name: '+ Novo Trabalho' }).click();
  const form = page.locator('form');
  await form.locator('input[type="text"]').nth(0).fill(titulo);
  await form.locator('input[type="date"]').nth(0).fill(diaISO(5));
  await form.locator('input[type="date"]').nth(1).fill(hojeISO()); // alarme
  await form.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText(titulo)).toBeVisible();

  // Prova que já passou do prazo, com o alarme ligado antes
  await criarProva(page, { disciplina: provaAtrasada, data: diaISO(-1), alarme: diaISO(-3) });

  // Na Home, os dois aparecem em Urgentes, cada um com o seu estado
  await page.goto('/');
  const urgentes = page.locator('section', { has: page.getByRole('heading', { name: '🚨 Urgentes' }) });
  await expect(urgentes.getByRole('link', { name: new RegExp(titulo) })).toContainText('Urgente');
  await expect(urgentes.getByRole('link', { name: new RegExp(provaAtrasada) })).toContainText('Atrasado');

  // Marcar o trabalho como concluído tira ele de Urgentes; a prova atrasada continua
  await page.goto('/trabalhos');
  await page.getByLabel(`Status do trabalho ${titulo}`).selectOption('concluido');
  await expect(page.getByLabel(`Status do trabalho ${titulo}`)).toHaveValue('concluido');

  await page.goto('/');
  await expect(urgentes.getByText(titulo)).toHaveCount(0);
  await expect(urgentes.getByText(provaAtrasada)).toBeVisible();
});
