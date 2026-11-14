import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';

// Troca o envio de e-mail por um que falha pro primeiro destinatário (como o
// SendGrid recusando um endereço) e registra todas as tentativas.
const tentativas = [];
mock.module('../src/lib/email.js', {
  exports: {
    enviarEmail: async ({ to }) => {
      tentativas.push(to);
      if (tentativas.length === 1) throw new Error('SendGrid recusou o envio');
      return { enviado: true };
    },
  },
});
const { executarNotificacoesDiarias } = await import('../src/jobs/notificacoes.js');

describe('Job de notificações', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();

  test('falha no envio para um estudante não impede os demais', async () => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const emails = [];
    for (let i = 0; i < 2; i++) {
      const { token, email } = await cadastrar(app);
      emails.push(email);
      await app.inject({
        method: 'POST', url: '/api/trabalhos', headers: comToken(token),
        payload: { titulo: 'Entrega', prazoEntrega: amanha },
      });
    }

    const erros = [];
    const log = { info() {}, warn() {}, error: (...args) => erros.push(args) };
    await executarNotificacoesDiarias(log); // não pode lançar exceção

    const nossos = tentativas.filter((to) => emails.includes(to));
    assert.equal(nossos.length, 2, 'os dois estudantes deveriam ter sido processados');
    assert.equal(erros.length, 1, 'a falha deveria ter sido registrada no log');
  });
});
