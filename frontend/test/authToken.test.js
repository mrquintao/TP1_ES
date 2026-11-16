import { test } from 'node:test';
import assert from 'node:assert/strict';

// No Node não existe localStorage; um Map faz o papel do navegador
const armazenado = new Map();
globalThis.localStorage = {
  getItem: (chave) => (armazenado.has(chave) ? armazenado.get(chave) : null),
  setItem: (chave, valor) => armazenado.set(chave, String(valor)),
  removeItem: (chave) => armazenado.delete(chave),
};

const { obterToken, salvarToken, limparToken } = await import('../src/utils/authToken.js');

test('guarda, lê e apaga o token de login', () => {
  assert.equal(obterToken(), null);
  salvarToken('abc.def.ghi');
  assert.equal(obterToken(), 'abc.def.ghi');
  limparToken();
  assert.equal(obterToken(), null);
});
