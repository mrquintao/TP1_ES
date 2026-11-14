import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { temBanco, criarApp, cadastrar, comToken, emailUnico } from './helpers.js';

describe('API de autenticação', { skip: !temBanco && 'DATABASE_URL não definida' }, async () => {
  const app = await criarApp();
  const post = (url, payload) => app.inject({ method: 'POST', url, payload });

  test('cadastro cria a conta e devolve token sem expor o hash da senha', async () => {
    const res = await post('/api/auth/cadastro', { nome: 'Ana', email: emailUnico(), senha: 'senha123' });
    assert.equal(res.statusCode, 201);
    const corpo = res.json();
    assert.ok(corpo.token);
    assert.equal(corpo.usuario.nome, 'Ana');
    assert.equal(corpo.usuario.senhaHash, undefined);
    assert.equal(corpo.usuario.senha, undefined);
  });

  test('cadastro exige nome, email e senha', async () => {
    const res = await post('/api/auth/cadastro', { nome: 'Ana', email: emailUnico() });
    assert.equal(res.statusCode, 400);
  });

  test('cadastro rejeita senha com menos de 6 caracteres', async () => {
    const res = await post('/api/auth/cadastro', { nome: 'Ana', email: emailUnico(), senha: '12345' });
    assert.equal(res.statusCode, 400);
  });

  test('cadastro rejeita e-mail já cadastrado', async () => {
    const { email } = await cadastrar(app);
    const res = await post('/api/auth/cadastro', { nome: 'Outra', email, senha: 'senha123' });
    assert.equal(res.statusCode, 409);
  });

  test('login com credenciais corretas devolve token', async () => {
    const { email, senha } = await cadastrar(app);
    const res = await post('/api/auth/login', { email, senha });
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().token);
  });

  test('login com senha errada ou e-mail inexistente dá o mesmo 401 genérico', async () => {
    const { email } = await cadastrar(app);
    const senhaErrada = await post('/api/auth/login', { email, senha: 'errada123' });
    const semConta = await post('/api/auth/login', { email: emailUnico(), senha: 'senha123' });
    assert.equal(senhaErrada.statusCode, 401);
    assert.equal(semConta.statusCode, 401);
    assert.deepEqual(senhaErrada.json(), semConta.json());
  });

  test('/me exige token e devolve o usuário do token', async () => {
    const { token, email } = await cadastrar(app);
    const sem = await app.inject({ method: 'GET', url: '/api/auth/me' });
    assert.equal(sem.statusCode, 401);
    const com = await app.inject({ method: 'GET', url: '/api/auth/me', headers: comToken(token) });
    assert.equal(com.statusCode, 200);
    assert.equal(com.json().usuario.email, email);
  });

  test('/me rejeita token inválido', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me', headers: comToken('token.invalido.aqui') });
    assert.equal(res.statusCode, 401);
  });

  test('PUT /preferencias liga e desliga as notificações', async () => {
    const { token } = await cadastrar(app);
    const res = await app.inject({
      method: 'PUT', url: '/api/auth/preferencias', headers: comToken(token),
      payload: { notificarDiario: false },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().usuario.notificarDiario, false);
    assert.equal(res.json().usuario.notificarUrgente, true); // não enviado, não muda
  });
});
