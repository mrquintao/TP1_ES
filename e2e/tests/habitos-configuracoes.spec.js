import { test, expect } from '@playwright/test';
import { cadastrarUsuario } from './helpers.js';

test('marcar hábitos atualiza o progresso, persiste e o reset do dia desmarca', async ({ page }) => {
  await cadastrarUsuario(page);
  await page.goto('/habitos');

  for (const descricao of ['Beber 3L de água', 'Tomar os remédios']) {
    await page.getByRole('button', { name: '+ Novo Hábito' }).click();
    await page.locator('form input[type="text"]').fill(descricao);
    await page.locator('form').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText(descricao)).toBeVisible();
  }
  await expect(page.getByText('0/2')).toBeVisible();

  // O checkbox só muda depois que a API confirma; por isso click + expect, não check()
  const agua = page.getByRole('checkbox', { name: /Beber 3L de água/ });
  await agua.click();
  await expect(agua).toBeChecked();
  await expect(page.getByText('1/2')).toBeVisible();

  // Continua marcado depois de recarregar: foi salvo no servidor, não só na tela
  await page.reload();
  await expect(agua).toBeChecked();

  // "Resetar Dia" pede confirmação e desmarca os diários
  page.once('dialog', (dialogo) => dialogo.accept());
  await page.getByRole('button', { name: '🔄 Resetar Dia' }).click();
  await expect(agua).not.toBeChecked();
  await expect(page.getByText('0/2')).toBeVisible();
});

test('preferências de notificação por e-mail ficam salvas', async ({ page }) => {
  await cadastrarUsuario(page);
  await page.goto('/configuracoes');

  const diario = page.getByRole('checkbox', { name: /Lembrete diário/ });
  const urgente = page.getByRole('checkbox', { name: /Avisar quando algo ficar urgente/ });
  await expect(diario).toBeChecked(); // conta nova começa com tudo ligado
  await expect(urgente).toBeChecked();

  await diario.click(); // muda só depois que a API salva (ver teste acima)
  await expect(diario).not.toBeChecked();

  await page.reload();
  await expect(diario).not.toBeChecked();
  await expect(urgente).toBeChecked();
});
