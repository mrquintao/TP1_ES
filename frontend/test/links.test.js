import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarLink, parseLinks } from '../src/utils/links.js';

describe('normalizarLink', () => {
  test('mantém links que já começam com https://', () => {
    assert.equal(normalizarLink('https://exemplo.com'), 'https://exemplo.com');
  });

  test('mantém links que começam com http://', () => {
    assert.equal(normalizarLink('http://exemplo.com'), 'http://exemplo.com');
  });

  test('aceita o protocolo em maiúsculas', () => {
    assert.equal(normalizarLink('HTTPS://exemplo.com'), 'HTTPS://exemplo.com');
  });

  test('adiciona https:// quando falta o protocolo', () => {
    assert.equal(normalizarLink('google.com'), 'https://google.com');
  });

  test('remove espaços nas pontas', () => {
    assert.equal(normalizarLink('  google.com  '), 'https://google.com');
  });

  test('não deixa javascript: virar link executável', () => {
    const link = normalizarLink('javascript:alert(1)');
    assert.ok(link.startsWith('https://'));
  });
});

describe('parseLinks', () => {
  test('separa um link por linha', () => {
    assert.deepEqual(parseLinks('a.com\nb.com'), ['https://a.com', 'https://b.com']);
  });

  test('ignora linhas vazias ou só com espaços', () => {
    assert.deepEqual(parseLinks('a.com\n\n   \nb.com\n'), ['https://a.com', 'https://b.com']);
  });

  test('remove links repetidos, mesmo escritos de formas diferentes', () => {
    assert.deepEqual(parseLinks('a.com\nhttps://a.com'), ['https://a.com']);
  });

  test('texto vazio resulta em lista vazia', () => {
    assert.deepEqual(parseLinks(''), []);
  });
});
