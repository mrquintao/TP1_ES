import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração dos testes E2E do StudySync.
 *
 * Pré-requisito: o sistema precisa estar rodando (`docker-compose up` na raiz),
 * com o frontend em http://localhost:5173 e o backend em http://localhost:3000.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Os testes compartilham o mesmo banco; rodar em série evita interferência.
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
