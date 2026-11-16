import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';

// SendGrid falso: nenhum e-mail sai de verdade durante os testes
const chamadas = { chave: null, enviados: [] };
mock.module('@sendgrid/mail', {
  defaultExport: {
    setApiKey: (chave) => { chamadas.chave = chave; },
    send: async (mensagem) => { chamadas.enviados.push(mensagem); },
  },
});

// A chave é lida quando o módulo carrega; o "?versao" carrega uma cópia nova
async function carregarEmail(chave, versao) {
  if (chave) process.env.SENDGRID_API_KEY = chave;
  else delete process.env.SENDGRID_API_KEY;
  process.env.SENDGRID_FROM = 'studysync@exemplo.com';
  return import(`../src/lib/email.js?${versao}`);
}

describe('Envio de e-mail', () => {
  test('sem SENDGRID_API_KEY, não tenta enviar e explica o motivo', async () => {
    const { enviarEmail } = await carregarEmail(null, 'sem-chave');
    const resultado = await enviarEmail({ to: 'a@b.com', subject: 'Oi', html: '<p>oi</p>' });
    assert.deepEqual(resultado, { enviado: false, motivo: 'SENDGRID_API_KEY não configurada' });
    assert.equal(chamadas.enviados.length, 0);
  });

  test('com a chave, envia pelo SendGrid usando o remetente configurado', async () => {
    const { enviarEmail } = await carregarEmail('SG.teste', 'com-chave');
    const resultado = await enviarEmail({ to: 'a@b.com', subject: 'Oi', html: '<p>oi</p>' });
    assert.deepEqual(resultado, { enviado: true });
    assert.equal(chamadas.chave, 'SG.teste');
    assert.deepEqual(chamadas.enviados, [
      { to: 'a@b.com', from: 'studysync@exemplo.com', subject: 'Oi', html: '<p>oi</p>' },
    ]);
  });
});
