import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { estadoUrgencia, hojeComoData, chaveDataBrasilia } from '../src/lib/urgencia.js';

// Congela o relógio: "agora" passa a ser o instante informado (UTC)
function fixarAgora(iso) {
  mock.timers.enable({ apis: ['Date'], now: new Date(iso) });
}

const dia = (iso) => new Date(`${iso}T00:00:00.000Z`);

describe('hojeComoData', () => {
  beforeEach(() => fixarAgora('2026-09-25T15:00:00Z'));
  afterEach(() => mock.timers.reset());

  test('devolve a meia-noite UTC do dia atual', () => {
    assert.equal(hojeComoData().toISOString(), '2026-09-25T00:00:00.000Z');
  });

  test('usa o fuso de Brasília: 02:00 UTC ainda é o dia anterior', () => {
    mock.timers.reset();
    fixarAgora('2026-09-25T02:00:00Z'); // 23:00 de 24/09 em Brasília
    assert.equal(hojeComoData().toISOString(), '2026-09-24T00:00:00.000Z');
  });
});

describe('estadoUrgencia', () => {
  beforeEach(() => fixarAgora('2026-09-25T15:00:00Z')); // hoje = 25/09
  afterEach(() => mock.timers.reset());

  test('sem alarme não notifica', () => {
    const r = estadoUrgencia({ dataAlarme: null, dataLimite: dia('2026-09-30') });
    assert.equal(r, null);
  });

  test('item concluído não notifica, mesmo com alarme vencido', () => {
    const r = estadoUrgencia({
      dataAlarme: dia('2026-09-20'),
      dataLimite: dia('2026-09-30'),
      concluido: true,
    });
    assert.equal(r, null);
  });

  test('alarme no futuro ainda não notifica', () => {
    const r = estadoUrgencia({ dataAlarme: dia('2026-09-26'), dataLimite: dia('2026-09-30') });
    assert.equal(r, null);
  });

  test('alarme no dia de hoje já é urgente', () => {
    const r = estadoUrgencia({ dataAlarme: dia('2026-09-25'), dataLimite: dia('2026-09-30') });
    assert.equal(r, 'urgente');
  });

  test('alarme passado e prazo no futuro é urgente', () => {
    const r = estadoUrgencia({ dataAlarme: dia('2026-09-20'), dataLimite: dia('2026-09-30') });
    assert.equal(r, 'urgente');
  });

  test('prazo no dia de hoje ainda é urgente (não atrasado)', () => {
    const r = estadoUrgencia({ dataAlarme: dia('2026-09-20'), dataLimite: dia('2026-09-25') });
    assert.equal(r, 'urgente');
  });

  test('prazo que já passou é atrasado', () => {
    const r = estadoUrgencia({ dataAlarme: dia('2026-09-20'), dataLimite: dia('2026-09-24') });
    assert.equal(r, 'atrasado');
  });

  test('ignora a hora das datas, comparando só o dia', () => {
    const r = estadoUrgencia({
      dataAlarme: new Date('2026-09-25T23:59:59Z'),
      dataLimite: new Date('2026-09-25T23:59:59Z'),
    });
    assert.equal(r, 'urgente');
  });
});

describe('chaveDataBrasilia', () => {
  test('usa o dia de Brasília: 01:30 UTC ainda é o dia anterior', () => {
    assert.equal(chaveDataBrasilia(new Date('2026-09-25T01:30:00Z')), '2026-09-24');
  });

  test('no meio do dia coincide com a data UTC', () => {
    assert.equal(chaveDataBrasilia(new Date('2026-09-25T15:00:00Z')), '2026-09-25');
  });

  test('03:00 UTC já é meia-noite do dia seguinte em Brasília', () => {
    assert.equal(chaveDataBrasilia(new Date('2026-09-25T03:00:00Z')), '2026-09-25');
  });
});
