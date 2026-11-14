import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escaparHtml } from '../src/lib/html.js';

test('escaparHtml neutraliza tags e aspas', () => {
  assert.equal(
    escaparHtml('<a href="x">Ana & \'Bia\'</a>'),
    '&lt;a href=&quot;x&quot;&gt;Ana &amp; &#39;Bia&#39;&lt;/a&gt;'
  );
});

test('escaparHtml mantém texto comum e acentos', () => {
  assert.equal(escaparHtml('Cálculo 2 — prova'), 'Cálculo 2 — prova');
});

test('escaparHtml aceita null, undefined e números', () => {
  assert.equal(escaparHtml(null), '');
  assert.equal(escaparHtml(undefined), '');
  assert.equal(escaparHtml(42), '42');
});
