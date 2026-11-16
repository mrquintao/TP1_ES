import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';
import { chaveDataBrasilia } from '../src/lib/urgencia.js';

// AAAA-MM-DD somando N dias a uma data AAAA-MM-DD
function somarDias(chave, dias) {
  const d = new Date(`${chave}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

describe('Calendário', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });
  const hoje = chaveDataBrasilia(new Date());

  test('junta provas e trabalhos do intervalo, com os detalhes do modal', async () => {
    const { token } = await cadastrar(app);
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Cálculo', descricao: 'P1', peso: 2, dataRealizacao: '2030-03-10' });
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Física', dataRealizacao: '2030-03-05' });
    await req('POST', '/api/trabalhos', token, { titulo: 'TP1', disciplina: 'ES', prazoEntrega: '2030-03-20' });
    await req('POST', '/api/avaliacoes', token, { disciplina: 'Fora', dataRealizacao: '2030-05-01' });

    const res = await req('GET', '/api/calendario?inicio=2030-03-01&fim=2030-03-31', token);
    assert.equal(res.statusCode, 200);
    const eventos = res.json();

    // Ordenados por data; o item de maio fica de fora
    assert.deepEqual(eventos.map((e) => e.data), ['2030-03-05', '2030-03-10', '2030-03-20']);
    assert.equal(eventos[0].titulo, 'Física'); // sem descrição: só a disciplina
    assert.deepEqual(
      { titulo: eventos[1].titulo, tipo: eventos[1].tipo, peso: eventos[1].peso },
      { titulo: 'Cálculo: P1', tipo: 'prova', peso: 2 },
    );
    assert.deepEqual(
      { tipo: eventos[2].tipo, disciplina: eventos[2].disciplina, status: eventos[2].status },
      { tipo: 'trabalho', disciplina: 'ES', status: 'pendente' },
    );
  });

  test('expande hábito diário em todo dia e semanal a cada 7 dias, a partir da criação', async () => {
    const { token } = await cadastrar(app);
    await req('POST', '/api/habitos', token, { descricao: 'Água', recorrencia: 'diario' });
    await req('POST', '/api/habitos', token, { descricao: 'Reunião', recorrencia: 'semanal' });

    // Começa antes da criação: dias anteriores não podem aparecer
    const inicio = somarDias(hoje, -3);
    const fim = somarDias(hoje, 13);
    const eventos = (await req('GET', `/api/calendario?inicio=${inicio}&fim=${fim}`, token)).json();

    const diario = eventos.filter((e) => e.titulo === 'Água').map((e) => e.data);
    const semanal = eventos.filter((e) => e.titulo === 'Reunião').map((e) => e.data);
    assert.equal(diario.length, 14);
    assert.equal(diario[0], hoje);
    assert.deepEqual(semanal, [hoje, somarDias(hoje, 7)]);
    assert.ok(eventos.every((e) => e.tipo === 'habito'));
  });

  test('hábito semanal cai no mesmo dia da semana mesmo com o intervalo começando no meio', async () => {
    const { token } = await cadastrar(app);
    await req('POST', '/api/habitos', token, { descricao: 'Revisão', recorrencia: 'semanal' });

    const inicio = somarDias(hoje, 2);
    const fim = somarDias(hoje, 20);
    const eventos = (await req('GET', `/api/calendario?inicio=${inicio}&fim=${fim}`, token)).json();
    assert.deepEqual(eventos.map((e) => e.data), [somarDias(hoje, 7), somarDias(hoje, 14)]);
  });

  test('sem parâmetros, usa o mês atual', async () => {
    const { token } = await cadastrar(app);
    await req('POST', '/api/trabalhos', token, { titulo: 'Entrega de hoje', prazoEntrega: hoje });
    const res = await req('GET', '/api/calendario', token);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().some((e) => e.titulo === 'Entrega de hoje'));
  });

  test('recusa datas inválidas e início depois do fim', async () => {
    const { token } = await cadastrar(app);
    for (const query of ['inicio=abc', 'fim=2030-13-45', 'inicio=2030-02-01&fim=2030-01-01']) {
      assert.equal((await req('GET', `/api/calendario?${query}`, token)).statusCode, 400, query);
    }
  });

  test('exige login e não mostra eventos de outro estudante', async () => {
    const a = await cadastrar(app);
    const b = await cadastrar(app);
    await req('POST', '/api/avaliacoes', a.token, { disciplina: 'Só do A', dataRealizacao: '2030-03-10' });

    assert.equal((await app.inject({ method: 'GET', url: '/api/calendario' })).statusCode, 401);
    const deB = (await req('GET', '/api/calendario?inicio=2030-03-01&fim=2030-03-31', b.token)).json();
    assert.deepEqual(deB, []);
  });
});
