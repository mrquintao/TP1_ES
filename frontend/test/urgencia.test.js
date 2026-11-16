import { describe, test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { estadoUrgencia, sugerirAlarme, DIAS_ANTES_PADRAO } from '../src/utils/urgencia.js';

process.env.TZ = 'America/Sao_Paulo'; // mesmo fuso em qualquer máquina

// "Hoje" fixo em 10/03/2030 às 15h locais, pra regra não depender do dia em que o teste roda
beforeEach(() => mock.timers.enable({ apis: ['Date'], now: new Date(2030, 2, 10, 15, 0) }));
afterEach(() => mock.timers.reset());

// Formato que a API devolve: meia-noite UTC do dia escolhido
const api = (dia) => `${dia}T00:00:00.000Z`;

describe('estadoUrgencia (seção Urgentes da Home)', () => {
  test('sem alarme, nunca é urgente', () => {
    assert.equal(estadoUrgencia({ dataAlarme: null, dataLimite: api('2030-03-11') }), null);
  });

  test('alarme no futuro: ainda não aparece', () => {
    assert.equal(estadoUrgencia({ dataAlarme: api('2030-03-11'), dataLimite: api('2030-03-15') }), null);
  });

  test('alarme hoje e prazo no futuro: urgente', () => {
    assert.equal(estadoUrgencia({ dataAlarme: api('2030-03-10'), dataLimite: api('2030-03-15') }), 'urgente');
  });

  test('no próprio dia do prazo ainda é urgente, não atrasado', () => {
    assert.equal(estadoUrgencia({ dataAlarme: api('2030-03-08'), dataLimite: api('2030-03-10') }), 'urgente');
  });

  test('prazo já passou: atrasado (continua aparecendo)', () => {
    assert.equal(estadoUrgencia({ dataAlarme: api('2030-03-01'), dataLimite: api('2030-03-09') }), 'atrasado');
  });

  test('concluído some da lista, mesmo atrasado', () => {
    const item = { dataAlarme: api('2030-03-01'), dataLimite: api('2030-03-09'), concluido: true };
    assert.equal(estadoUrgencia(item), null);
  });

  test('aceita a data vinda direto do <input type="date">', () => {
    assert.equal(estadoUrgencia({ dataAlarme: '2030-03-10', dataLimite: '2030-03-12' }), 'urgente');
  });
});

describe('sugerirAlarme', () => {
  test(`sugere ${DIAS_ANTES_PADRAO} dias antes do prazo por padrão`, () => {
    assert.equal(sugerirAlarme('2030-03-20'), '2030-03-17');
  });

  test('atravessa a virada de mês e de ano', () => {
    assert.equal(sugerirAlarme('2030-03-02'), '2030-02-27');
    assert.equal(sugerirAlarme('2031-01-01', 5), '2030-12-27');
  });

  test('aceita a data no formato da API sem perder um dia', () => {
    assert.equal(sugerirAlarme(api('2030-03-20')), '2030-03-17');
  });

  test('sem prazo, não sugere nada', () => {
    assert.equal(sugerirAlarme(''), '');
    assert.equal(sugerirAlarme(undefined), '');
  });
});
