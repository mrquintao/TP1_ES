import { test, expect } from '@playwright/test';
import { cadastrarUsuario, hojeISO } from './helpers.js';

test('criar um trabalho e vê-lo no calendário', async ({ page }) => {
  const { sufixo } = await cadastrarUsuario(page);
  const titulo = `TP2 E2E ${sufixo}`;
  const disciplina = 'Engenharia de Software';

  // Cria o trabalho com prazo para hoje (cai no mês que o calendário abre por padrão)
  await page.goto('/trabalhos');
  await page.getByRole('button', { name: '+ Novo Trabalho' }).click();

  const form = page.locator('form');
  await form.locator('input[type="text"]').nth(0).fill(titulo);     // Título
  await form.locator('input[type="date"]').nth(0).fill(hojeISO());  // Prazo de entrega
  await form.locator('input[type="text"]').nth(1).fill(disciplina); // Disciplina
  await form.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText(titulo)).toBeVisible();

  // O trabalho aparece na grade do calendário como um botão com o título
  await page.goto('/calendario');
  const evento = page.getByRole('button', { name: titulo });
  await expect(evento).toBeVisible();

  // Os detalhes do evento mostram o tipo e a disciplina
  await evento.click();
  const detalhes = page.getByRole('dialog', { name: 'Detalhes do compromisso' });
  await expect(detalhes).toContainText('Trabalho');
  await expect(detalhes).toContainText(disciplina);
});
