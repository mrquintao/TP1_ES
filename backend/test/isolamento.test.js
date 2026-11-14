import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken } from './helpers.js';

// Cada recurso: rota, corpo de criação válido e corpo de atualização
const recursos = [
  { nome: 'avaliações', url: '/api/avaliacoes', criar: { disciplina: 'Cálculo', dataRealizacao: '2030-01-10' }, editar: { disciplina: 'Hackeada' } },
  { nome: 'trabalhos', url: '/api/trabalhos', criar: { titulo: 'TP1', prazoEntrega: '2030-01-10' }, editar: { titulo: 'Hackeado' } },
  { nome: 'hábitos', url: '/api/habitos', criar: { descricao: 'Estudar' }, editar: { descricao: 'Hackeado' } },
];

describe('Isolamento entre estudantes', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const req = (method, url, token, payload) =>
    app.inject({ method, url, headers: token ? comToken(token) : {}, payload });

  for (const r of recursos) {
    describe(r.nome, async () => {
      test('exige login em todas as rotas', async () => {
        assert.equal((await req('GET', r.url)).statusCode, 401);
        assert.equal((await req('POST', r.url, null, r.criar)).statusCode, 401);
        assert.equal((await req('PUT', `${r.url}/1`, null, r.editar)).statusCode, 401);
        assert.equal((await req('DELETE', `${r.url}/1`)).statusCode, 401);
      });

      test('um estudante não vê, edita nem apaga os dados de outro', async () => {
        const a = await cadastrar(app);
        const b = await cadastrar(app);
        const criado = (await req('POST', r.url, a.token, r.criar)).json();
        const item = `${r.url}/${criado.id}`;

        // B não enxerga o item de A
        assert.deepEqual((await req('GET', r.url, b.token)).json(), []);
        // B não consegue editar nem apagar: 404 (não revela que existe)
        assert.equal((await req('PUT', item, b.token, r.editar)).statusCode, 404);
        assert.equal((await req('DELETE', item, b.token)).statusCode, 404);

        // O item de A continua intacto
        const lista = (await req('GET', r.url, a.token)).json();
        assert.equal(lista.length, 1);
        const [campo] = Object.keys(r.editar);
        assert.equal(lista[0].id, criado.id);
        assert.notEqual(lista[0][campo], r.editar[campo]);
      });

      test('o dono vem do token, mesmo que o corpo tente informar outro', async () => {
        const a = await cadastrar(app);
        const b = await cadastrar(app);
        const res = await req('POST', r.url, a.token, { ...r.criar, estudanteId: b.usuario.id });
        assert.equal(res.statusCode, 201);
        assert.equal(res.json().estudanteId, a.usuario.id);
        assert.deepEqual((await req('GET', r.url, b.token)).json(), []);
      });
    });
  }
});
