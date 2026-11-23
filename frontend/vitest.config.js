import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Testes de componente (React). Os testes dos utils continuam no node:test
// (npm test); aqui o Vitest reaproveita o plugin do Vite para entender JSX e
// o jsdom simula o navegador, sem precisar do backend nem do banco.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['test/components/**/*.test.jsx'],
    setupFiles: ['test/components/setup.js'],
    // Brasília fixo: as datas exibidas não dependem do fuso da máquina
    env: { TZ: 'America/Sao_Paulo' },
    coverage: {
      provider: 'v8',
      include: ['src/components/**'],
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/components',
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
