import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, emailUnico } from './helpers.js';

describe('Segurança do login e do cadastro', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const post = (url, payload) => app.inject({ method: 'POST', url, payload });

  test('e-mail é normalizado: maiúsculas e espaços não criam outra conta', async () => {
    const email = emailUnico();
    const criada = await post('/api/auth/cadastro', { nome: 'Ana', email: `  ${email.toUpperCase()} `, senha: 'senha123' });
    assert.equal(criada.statusCode, 201);
    assert.equal(criada.json().usuario.email, email);

    const login = await post('/api/auth/login', { email: email.toUpperCase(), senha: 'senha123' });
    assert.equal(login.statusCode, 200);

    const duplicada = await post('/api/auth/cadastro', { nome: 'Outra', email, senha: 'senha123' });
    assert.equal(duplicada.statusCode, 409);
  });

  test('cadastro rejeita e-mail com formato inválido', async () => {
    for (const email of ['sem-arroba', 'a@b', '@x.com', 'a b@x.com']) {
      const res = await post('/api/auth/cadastro', { nome: 'Ana', email, senha: 'senha123' });
      assert.equal(res.statusCode, 400, `deveria rejeitar "${email}"`);
    }
  });

  test('cadastro rejeita senha acima do limite do bcrypt (72)', async () => {
    const res = await post('/api/auth/cadastro', { nome: 'Ana', email: emailUnico(), senha: 'a'.repeat(73) });
    assert.equal(res.statusCode, 400);
  });

  test('cadastro e login rejeitam campos que não são texto', async () => {
    const cadastro = await post('/api/auth/cadastro', { nome: { x: 1 }, email: emailUnico(), senha: 'senha123' });
    assert.equal(cadastro.statusCode, 400);
    const login = await post('/api/auth/login', { email: ['a@b.com'], senha: 'senha123' });
    assert.equal(login.statusCode, 400);
  });

  test('muitas tentativas de login seguidas são bloqueadas com 429', async () => {
    const limitado = await criarApp({ limiteAuth: 3 });
    const tentar = () =>
      limitado.inject({ method: 'POST', url: '/api/auth/login', payload: { email: emailUnico(), senha: 'errada123' } });

    for (let i = 0; i < 3; i++) assert.equal((await tentar()).statusCode, 401);
    assert.equal((await tentar()).statusCode, 429);
  });
});
