import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/lib/prisma.js';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';

// Ciclo de vida completo de provas e trabalhos: criar, buscar, editar, apagar
const recursos = [
  {
    nome: 'avaliações',
    url: '/api/avaliacoes',
    criar: { disciplina: 'Cálculo', dataRealizacao: '2030-01-10', dataAlarme: '2030-01-07' },
    semObrigatorio: { disciplina: 'Cálculo' },
    dataInvalida: { disciplina: 'Cálculo', dataRealizacao: 'ontem' },
    campoData: 'dataRealizacao',
    modelo: 'avaliacao',
  },
  {
    nome: 'trabalhos',
    url: '/api/trabalhos',
    criar: { titulo: 'TP1', prazoEntrega: '2030-01-10', dataAlarme: '2030-01-07' },
    semObrigatorio: { titulo: 'TP1' },
    dataInvalida: { titulo: 'TP1', prazoEntrega: 'ontem' },
    campoData: 'prazoEntrega',
    modelo: 'trabalhoGrupo',
  },
];

describe('CRUD de provas e trabalhos', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: comToken(token), payload });

  for (const r of recursos) {
    describe(r.nome, async () => {
      test('cria, busca por id, edita e apaga', async () => {
        const { token } = await cadastrar(app);
        const criado = await req('POST', r.url, token, r.criar);
        assert.equal(criado.statusCode, 201);
        const { id } = criado.json();

        const buscado = await req('GET', `${r.url}/${id}`, token);
        assert.equal(buscado.statusCode, 200);
        assert.equal(buscado.json().id, id);

        const editado = await req('PUT', `${r.url}/${id}`, token, { [r.campoData]: '2030-02-20' });
        assert.equal(editado.statusCode, 200);
        assert.equal(editado.json()[r.campoData].slice(0, 10), '2030-02-20');

        assert.equal((await req('DELETE', `${r.url}/${id}`, token)).statusCode, 204);
        assert.equal((await req('GET', `${r.url}/${id}`, token)).statusCode, 404);
        assert.equal((await req('DELETE', `${r.url}/${id}`, token)).statusCode, 404);
        assert.equal((await req('PUT', `${r.url}/${id}`, token, { [r.campoData]: '2030-02-21' })).statusCode, 404);
      });

      test('recusa id que não é inteiro positivo', async () => {
        const { token } = await cadastrar(app);
        for (const id of ['abc', '0', '-3', '1.5']) {
          assert.equal((await req('GET', `${r.url}/${id}`, token)).statusCode, 400, `GET ${id}`);
          assert.equal((await req('PUT', `${r.url}/${id}`, token, { [r.campoData]: '2030-01-01' })).statusCode, 400, `PUT ${id}`);
          assert.equal((await req('DELETE', `${r.url}/${id}`, token)).statusCode, 400, `DELETE ${id}`);
        }
      });

      test('recusa criação sem campo obrigatório ou com data inválida', async () => {
        const { token } = await cadastrar(app);
        assert.equal((await req('POST', r.url, token, r.semObrigatorio)).statusCode, 400);
        assert.equal((await req('POST', r.url, token, r.dataInvalida)).statusCode, 400);
        assert.equal((await req('POST', r.url, token, { ...r.criar, dataAlarme: 'amanhã' })).statusCode, 400);
      });

      test('lista em ordem de data', async () => {
        const { token } = await cadastrar(app);
        for (const data of ['2030-03-01', '2030-01-01', '2030-02-01']) {
          await req('POST', r.url, token, { ...r.criar, [r.campoData]: data, dataAlarme: undefined });
        }
        const datas = (await req('GET', r.url, token)).json().map((item) => item[r.campoData].slice(0, 10));
        assert.deepEqual(datas, ['2030-01-01', '2030-02-01', '2030-03-01']);
      });

      // Regra de negócio: depois de avisado por e-mail, só volta a avisar se as datas mudarem
      test('mudar data ou alarme permite notificar de novo; mudar outro campo não', async () => {
        const { token } = await cadastrar(app);
        const { id } = (await req('POST', r.url, token, r.criar)).json();
        const marcarNotificado = () =>
          prisma[r.modelo].update({ where: { id }, data: { notificadoUrgente: true } });
        const notificado = async () => (await prisma[r.modelo].findUnique({ where: { id } })).notificadoUrgente;

        await marcarNotificado();
        const outroCampo = r.modelo === 'avaliacao' ? { descricao: 'nova' } : { titulo: 'Novo título' };
        await req('PUT', `${r.url}/${id}`, token, outroCampo);
        assert.equal(await notificado(), true);

        await req('PUT', `${r.url}/${id}`, token, { dataAlarme: '2030-01-05' });
        assert.equal(await notificado(), false);

        await marcarNotificado();
        await req('PUT', `${r.url}/${id}`, token, { [r.campoData]: '2030-01-15' });
        assert.equal(await notificado(), false);
      });

      test('enviar alarme vazio remove o alarme', async () => {
        const { token } = await cadastrar(app);
        const { id } = (await req('POST', r.url, token, r.criar)).json();
        const res = await req('PUT', `${r.url}/${id}`, token, { dataAlarme: null });
        assert.equal(res.statusCode, 200);
        assert.equal(res.json().dataAlarme, null);
      });
    });
  }

  test('trabalho guarda membros e os apaga junto com ele', async () => {
    const { token } = await cadastrar(app);
    const res = await req('POST', '/api/trabalhos', token, {
      titulo: 'TP2',
      prazoEntrega: '2030-01-10',
      membros: [{ nome: '  Ana  ', escopo: 'Testes' }, { nome: 'Bruno' }],
    });
    assert.equal(res.statusCode, 201);
    const trabalho = res.json();
    assert.deepEqual(trabalho.membros.map((m) => [m.nome, m.escopo]), [['Ana', 'Testes'], ['Bruno', null]]);

    await req('DELETE', `/api/trabalhos/${trabalho.id}`, token);
    assert.equal(await prisma.membroGrupo.count({ where: { trabalhoId: trabalho.id } }), 0);
  });

  test('status do trabalho só aceita os valores conhecidos', async () => {
    const { token } = await cadastrar(app);
    const { id } = (await req('POST', '/api/trabalhos', token, { titulo: 'TP3', prazoEntrega: '2030-01-10' })).json();
    assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, { status: 'concluido' })).json().status, 'concluido');
    assert.equal((await req('PUT', `/api/trabalhos/${id}`, token, { status: 'arquivado' })).statusCode, 400);
  });
});
