import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';
import { resetarHabitosDiarios, resetarHabitosSemanais } from '../src/routes/habitos.js';

describe('Validação e limites da API', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });

  test('PUT de avaliação rejeita data inválida com 400 (não 500)', async () => {
    const { token } = await cadastrar(app);
    const { id } = (await req('POST', '/api/avaliacoes', token, { disciplina: 'Cálculo', dataRealizacao: '2030-01-10' })).json();
    for (const campos of [{ dataRealizacao: 'abc' }, { dataAlarme: 'abc' }]) {
      assert.equal((await req('PUT', `/api/avaliacoes/${id}`, token, campos)).statusCode, 400);
    }
  });

  test('PUT de trabalho rejeita data inválida com 400 (não 500)', async () => {
    const { token } = await cadastrar(app);
    const { id } = (await req('POST', '/api/trabalhos', token, { titulo: 'TP1', prazoEntrega: '2030-01-10' })).json();
    for (const campos of [{ prazoEntrega: 'abc' }, { dataAlarme: 'abc' }]) {
      assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, campos)).statusCode, 400);
    }
  });

  test('calendário recusa intervalos gigantes em vez de expandir milhões de eventos', async () => {
    const { token } = await cadastrar(app);
    await req('POST', '/api/habitos', token, { descricao: 'Estudar' });
    const res = await req('GET', '/api/calendario?inicio=0001-01-01&fim=9999-12-31', token);
    assert.equal(res.statusCode, 400);
  });

  test('calendário continua aceitando um mês normal', async () => {
    const { token } = await cadastrar(app);
    const res = await req('GET', '/api/calendario?inicio=2030-01-01&fim=2030-01-31', token);
    assert.equal(res.statusCode, 200);
  });

  test('reset da meia-noite desmarca hábitos semanais só no reset semanal', async () => {
    const { token } = await cadastrar(app);
    const criar = async (recorrencia) => {
      const { id } = (await req('POST', '/api/habitos', token, { descricao: recorrencia, recorrencia })).json();
      await req('PUT', `/api/habitos/${id}`, token, { concluidoHoje: true });
    };
    await criar('diario');
    await criar('semanal');
    const concluidos = async () =>
      Object.fromEntries((await req('GET', '/api/habitos', token)).json().map((h) => [h.recorrencia, h.concluidoHoje]));

    await resetarHabitosDiarios();
    assert.deepEqual(await concluidos(), { diario: false, semanal: true });

    await resetarHabitosSemanais();
    assert.deepEqual(await concluidos(), { diario: false, semanal: false });
  });
});
