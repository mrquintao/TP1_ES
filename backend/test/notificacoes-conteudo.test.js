import { describe, test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// E-mail falso: guarda o que seria enviado e devolve o resultado que o teste escolher
const enviados = [];
let resultadoEnvio = { enviado: true };
mock.module('../src/lib/email.js', {
  namedExports: {
    enviarEmail: async (email) => {
      enviados.push(email);
      return resultadoEnvio;
    },
  },
});

const { temBanco, criarApp, cadastrar, comToken } = await import('./helpers.js');
const { chaveDataBrasilia } = await import('../src/lib/urgencia.js');
const { executarNotificacoesDiarias } = await import('../src/jobs/notificacoes.js');
const { default: prisma } = await import('../src/lib/prisma.js');

const log = { info() {}, warn() {}, error() {} };
const hoje = chaveDataBrasilia(new Date());
const daqui = (dias) => {
  const d = new Date(`${hoje}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

describe('Conteúdo do e-mail de notificação', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });
  const emailDe = (email) => enviados.filter((e) => e.to === email);

  beforeEach(() => {
    enviados.length = 0;
    resultadoEnvio = { enviado: true };
  });

  test('lembra os prazos próximos e avisa o que ficou urgente ou atrasado', async () => {
    const { token, email } = await cadastrar(app, { nome: 'Lucas' });
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Cálculo', dataRealizacao: daqui(2) });
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Prova longe', dataRealizacao: daqui(10) });
    await req('POST', '/api/trabalhos', token, { titulo: 'TP de Redes', prazoEntrega: daqui(5), dataAlarme: hoje });
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Banco de Dados', dataRealizacao: daqui(-2), dataAlarme: daqui(-5) });
    const concluido = (await req('POST', '/api/trabalhos', token, { titulo: 'Já entregue', prazoEntrega: daqui(1), dataAlarme: hoje })).json();
    await req('PUT', `/api/trabalhos/${concluido.id}`, token, { status: 'concluido' });

    await executarNotificacoesDiarias(log);

    const [mensagem] = emailDe(email);
    assert.ok(mensagem, 'deveria ter enviado um e-mail');
    assert.match(mensagem.html, /Olá, Lucas!/);
    assert.match(mensagem.html, /Prazos dos próximos 3 dias[\s\S]*Cálculo/);
    // Mostra o dia escolhido, não o anterior (bug de fuso ao formatar a data)
    const [ano, mes, dia] = daqui(2).split('-');
    assert.match(mensagem.html, new RegExp(`Cálculo: ${dia}/${mes}/${ano}`));
    assert.doesNotMatch(mensagem.html, /Prova longe/);
    assert.match(mensagem.html, /Ficaram urgentes[\s\S]*TP de Redes \(urgente\)/);
    assert.match(mensagem.html, /Banco de Dados \(atrasado\)/);
    assert.doesNotMatch(mensagem.html, /Já entregue/); // concluído não entra em lembrete nem em urgente
  });

  test('cada item urgente é avisado uma vez só; o lembrete diário continua', async () => {
    const { token, email } = await cadastrar(app);
    await req('POST', '/api/trabalhos', token, { titulo: 'Seminário', prazoEntrega: daqui(1), dataAlarme: hoje });

    await executarNotificacoesDiarias(log);
    assert.match(emailDe(email)[0].html, /Ficaram urgentes/);

    enviados.length = 0;
    await executarNotificacoesDiarias(log);
    const [segundo] = emailDe(email);
    assert.match(segundo.html, /Prazos dos próximos 3 dias[\s\S]*Seminário/);
    assert.doesNotMatch(segundo.html, /Ficaram urgentes/);
  });

  test('se o envio não acontece, o aviso de urgente não é perdido', async () => {
    const { token, email, usuario } = await cadastrar(app);
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Física', dataRealizacao: daqui(4), dataAlarme: hoje });

    resultadoEnvio = { enviado: false, motivo: 'sem chave' };
    await executarNotificacoesDiarias(log);
    assert.equal(emailDe(email).length, 1);
    const pendentes = await prisma.avaliacao.count({ where: { estudanteId: usuario.id, notificadoUrgente: false } });
    assert.equal(pendentes, 1);

    resultadoEnvio = { enviado: true };
    enviados.length = 0;
    await executarNotificacoesDiarias(log);
    assert.match(emailDe(email)[0].html, /Física \(urgente\)/);
  });

  test('respeita as preferências de cada estudante', async () => {
    const soUrgente = await cadastrar(app);
    const nenhum = await cadastrar(app);
    for (const { token } of [soUrgente, nenhum]) {
      await req('POST', '/api/avaliacoes', token, { disciplina: 'Próxima', dataRealizacao: daqui(1) });
      await req('POST', '/api/trabalhos', token, { titulo: 'Urgente', prazoEntrega: daqui(6), dataAlarme: hoje });
    }
    await req('PUT', '/api/auth/preferencias', soUrgente.token, { notificarDiario: false });
    await req('PUT', '/api/auth/preferencias', nenhum.token, { notificarDiario: false, notificarUrgente: false });

    await executarNotificacoesDiarias(log);

    const [mensagem] = emailDe(soUrgente.email);
    assert.match(mensagem.html, /Ficaram urgentes/);
    assert.doesNotMatch(mensagem.html, /Prazos dos próximos/);
    assert.equal(emailDe(nenhum.email).length, 0);
  });

  test('não manda e-mail quando não há nada a avisar', async () => {
    const { token, email } = await cadastrar(app);
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Longe', dataRealizacao: daqui(30) });
    await executarNotificacoesDiarias(log);
    assert.equal(emailDe(email).length, 0);
  });

  test('texto do usuário aparece escapado uma única vez', async () => {
    const { token, email } = await cadastrar(app);
    await req('POST', '/api/trabalhos', token, { titulo: '<b>P&D</b>', prazoEntrega: daqui(1), dataAlarme: hoje });
    await executarNotificacoesDiarias(log);

    const { html } = emailDe(email)[0];
    assert.doesNotMatch(html, /<b>P&D<\/b>/); // HTML do usuário não é interpretado
    assert.doesNotMatch(html, /&amp;amp;|&amp;lt;/); // nem escapado duas vezes
    assert.match(html, /👥 &lt;b&gt;P&amp;D&lt;\/b&gt; \(urgente\)/);
  });
});
