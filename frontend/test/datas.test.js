import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDataLocal } from '../src/utils/dates.js';
import { chaveData, diasDaGrade, diasDaSemana, tituloSemana, TIPOS_EVENTO } from '../src/utils/calendario.js';

// Fixa o fuso de Brasília (UTC-3) em qualquer máquina: é nesse fuso que o bug
// do "dia anterior" aparecia quando a data da API era lida com new Date()
process.env.TZ = 'America/Sao_Paulo';

describe('parseDataLocal', () => {
  test('meia-noite UTC da API continua sendo o mesmo dia no fuso local', () => {
    const data = parseDataLocal('2030-03-10T00:00:00.000Z');
    assert.deepEqual([data.getFullYear(), data.getMonth(), data.getDate()], [2030, 2, 10]);
    // contraprova: o jeito ingênuo cai no dia 9
    assert.equal(new Date('2030-03-10T00:00:00.000Z').getDate(), 9);
  });

  test('aceita a data pura do <input type="date">', () => {
    assert.equal(chaveData(parseDataLocal('2030-12-31')), '2030-12-31');
  });
});

describe('chaveData', () => {
  test('formata AAAA-MM-DD com zeros à esquerda', () => {
    assert.equal(chaveData(new Date(2030, 0, 5)), '2030-01-05');
  });
});

describe('diasDaGrade (visão de mês)', () => {
  const grade = diasDaGrade(new Date(2030, 2, 15)); // março de 2030 começa num sábado

  test('sempre tem 6 semanas completas (42 dias)', () => {
    assert.equal(grade.length, 42);
  });

  test('começa no domingo antes do dia 1 e os dias são consecutivos', () => {
    assert.equal(chaveData(grade[0]), '2030-02-24');
    assert.equal(grade[0].getDay(), 0);
    assert.equal(chaveData(grade[6]), '2030-03-02');
    assert.equal(chaveData(grade[41]), '2030-04-06');
  });

  test('mês que começa no domingo abre a grade no próprio dia 1', () => {
    assert.equal(chaveData(diasDaGrade(new Date(2030, 8, 20))[0]), '2030-09-01');
  });
});

describe('diasDaSemana (visão de semana)', () => {
  test('devolve domingo a sábado da semana que contém a data', () => {
    const dias = diasDaSemana(new Date(2030, 2, 13)); // quarta
    assert.deepEqual(dias.map(chaveData), [
      '2030-03-10', '2030-03-11', '2030-03-12', '2030-03-13', '2030-03-14', '2030-03-15', '2030-03-16',
    ]);
  });

  test('não altera a data recebida', () => {
    const data = new Date(2030, 2, 13);
    diasDaSemana(data);
    assert.equal(chaveData(data), '2030-03-13');
  });
});

describe('tituloSemana', () => {
  test('semana dentro de um mês mostra o mês uma vez só', () => {
    assert.equal(tituloSemana(diasDaSemana(new Date(2030, 2, 13))), '10 – 16 de mar. de 2030');
  });

  test('semana que cruza o mês mostra os dois meses', () => {
    assert.equal(tituloSemana(diasDaSemana(new Date(2030, 2, 31))), '31 de mar. – 6 de abr. de 2030');
  });
});

test('cada tipo de evento tem rótulo, cor e marcador', () => {
  assert.deepEqual(Object.keys(TIPOS_EVENTO), ['prova', 'trabalho', 'habito']);
  for (const tipo of Object.values(TIPOS_EVENTO)) {
    assert.ok(tipo.label && tipo.cor && tipo.marcador);
  }
});
