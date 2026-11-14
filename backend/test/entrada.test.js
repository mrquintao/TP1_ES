import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';

describe('Validação dos dados enviados às rotas', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });

  test('POST e PUT sem corpo respondem 400, não 500', async () => {
    const { token } = await cadastrar(app);
    for (const url of ['/api/avaliacoes', '/api/trabalhos', '/api/habitos']) {
      assert.equal((await req('POST', url, token)).statusCode, 400, `POST ${url}`);
    }
    const { id } = (await req('POST', '/api/habitos', token, { descricao: 'x' })).json();
    assert.equal((await req('PUT', `/api/habitos/${id}`, token)).statusCode, 200); // nada a mudar: continua existindo
  });

  test('avaliação: peso precisa ser número não negativo', async () => {
    const { token } = await cadastrar(app);
    const base = { disciplina: 'Cálculo', dataRealizacao: '2030-01-10' };
    for (const peso of ['2', -1, {}, true]) {
      assert.equal((await req('POST', '/api/avaliacoes', token, { ...base, peso })).statusCode, 400, `peso ${JSON.stringify(peso)}`);
    }
    assert.equal((await req('POST', '/api/avaliacoes', token, { ...base, disciplina: 123 })).statusCode, 400);
    assert.equal((await req('POST', '/api/avaliacoes', token, { ...base, peso: 0 })).statusCode, 201);
  });

  test('avaliação: peso null (campo apagado no formulário) usa o padrão e não quebra a edição', async () => {
    const { token } = await cadastrar(app);
    const criada = await req('POST', '/api/avaliacoes', token, { disciplina: 'Física', dataRealizacao: '2030-01-10', peso: null });
    assert.equal(criada.statusCode, 201);
    assert.equal(criada.json().peso, 1);
    const editada = await req('PUT', `/api/avaliacoes/${criada.json().id}`, token, { peso: null });
    assert.equal(editada.statusCode, 200);
  });

  test('trabalho: status, links e membros precisam ter o formato certo', async () => {
    const { token } = await cadastrar(app);
    const base = { titulo: 'TP1', prazoEntrega: '2030-01-10' };
    const { id } = (await req('POST', '/api/trabalhos', token, base)).json();

    assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, { status: 'qualquer-coisa' })).statusCode, 400);
    assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, { status: 'concluido' })).statusCode, 200);
    assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, { linksUteis: 'https://a.com' })).statusCode, 400);
    assert.equal((await req('POST', '/api/trabalhos', token, { ...base, linksUteis: [1, 2] })).statusCode, 400);
    assert.equal((await req('POST', '/api/trabalhos', token, { ...base, membros: [{ nome: '' }] })).statusCode, 400);
    assert.equal((await req('POST', '/api/trabalhos', token, { ...base, membros: [{ nome: 'Ana', trabalhoId: 1 }] })).statusCode, 201);
  });

  test('hábito: recorrência e concluidoHoje precisam ser válidos', async () => {
    const { token } = await cadastrar(app);
    assert.equal((await req('POST', '/api/habitos', token, { descricao: 'x', recorrencia: 'mensal' })).statusCode, 400);
    const { id } = (await req('POST', '/api/habitos', token, { descricao: 'x', recorrencia: 'semanal' })).json();
    assert.equal((await req('PUT', `/api/habitos/${id}`, token, { concluidoHoje: 'sim' })).statusCode, 400);
    assert.equal((await req('PUT', `/api/habitos/${id}`, token, { recorrencia: 'diario' })).statusCode, 200);
  });
});
