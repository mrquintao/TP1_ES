import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';

describe('Hábitos', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });
  const criarMarcado = async (token, descricao, recorrencia = 'diario') => {
    const { id } = (await req('POST', '/api/habitos', token, { descricao, recorrencia })).json();
    await req('PUT', `/api/habitos/${id}`, token, { concluidoHoje: true });
    return id;
  };

  test('cria como diário por padrão, marca e desmarca', async () => {
    const { token } = await cadastrar(app);
    const criado = (await req('POST', '/api/habitos', token, { descricao: 'Beber 3L de água' })).json();
    assert.equal(criado.recorrencia, 'diario');
    assert.equal(criado.concluidoHoje, false);

    const marcado = await req('PUT', `/api/habitos/${criado.id}`, token, { concluidoHoje: true });
    assert.equal(marcado.json().concluidoHoje, true);
    const desmarcado = await req('PUT', `/api/habitos/${criado.id}`, token, { concluidoHoje: false });
    assert.equal(desmarcado.json().concluidoHoje, false);
  });

  test('reset manual desmarca só os diários de quem está logado', async () => {
    const a = await cadastrar(app);
    const b = await cadastrar(app);
    await criarMarcado(a.token, 'Diário de A');
    await criarMarcado(a.token, 'Semanal de A', 'semanal');
    await criarMarcado(b.token, 'Diário de B');

    const res = await req('POST', '/api/habitos/reset', a.token);
    assert.equal(res.statusCode, 200);

    const estado = async (token) =>
      Object.fromEntries((await req('GET', '/api/habitos', token)).json().map((h) => [h.descricao, h.concluidoHoje]));
    assert.deepEqual(await estado(a.token), { 'Diário de A': false, 'Semanal de A': true });
    assert.deepEqual(await estado(b.token), { 'Diário de B': true }); // B não foi afetado
  });

  test('apaga e depois responde 404', async () => {
    const { token } = await cadastrar(app);
    const { id } = (await req('POST', '/api/habitos', token, { descricao: 'Ler' })).json();
    assert.equal((await req('DELETE', `/api/habitos/${id}`, token)).statusCode, 204);
    assert.equal((await req('DELETE', `/api/habitos/${id}`, token)).statusCode, 404);
    assert.equal((await req('PUT', `/api/habitos/${id}`, token, { concluidoHoje: true })).statusCode, 404);
  });

  test('recusa id inválido e criação sem descrição', async () => {
    const { token } = await cadastrar(app);
    for (const id of ['abc', '0']) {
      assert.equal((await req('PUT', `/api/habitos/${id}`, token, { concluidoHoje: true })).statusCode, 400);
      assert.equal((await req('DELETE', `/api/habitos/${id}`, token)).statusCode, 400);
    }
    assert.equal((await req('POST', '/api/habitos', token, {})).statusCode, 400);
    assert.equal((await req('POST', '/api/habitos', token, { descricao: 'X', recorrencia: 'mensal' })).statusCode, 400);
  });
});
