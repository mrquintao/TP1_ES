import { describe, test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Agendamentos não esperam a meia-noite: o node-cron falso só guarda cada
// tarefa, e o teste chama a função agendada direto.
const agendados = [];
mock.module('node-cron', {
  defaultExport: { schedule: (expressao, tarefa, opcoes) => agendados.push({ expressao, tarefa, opcoes }) },
});

// Os resets reais mexem no banco; aqui só registram a chamada (ou falham, se pedido)
const chamadas = [];
let falhar = false;
const resetFalso = (nome) => async () => {
  chamadas.push(nome);
  if (falhar) throw new Error('banco fora do ar');
};
mock.module('../src/routes/habitos.js', {
  namedExports: { resetarHabitosDiarios: resetFalso('diario'), resetarHabitosSemanais: resetFalso('semanal') },
});
const { agendarResetHabitos } = await import('../src/jobs/resetHabitos.js');
const { agendarNotificacoes } = await import('../src/jobs/notificacoes.js');

function criarLog() {
  const log = { info: [], error: [] };
  return { log, logger: { info: (...a) => log.info.push(a), error: (...a) => log.error.push(a) } };
}

describe('Agendador de reset dos hábitos', () => {
  beforeEach(() => {
    agendados.length = 0;
    chamadas.length = 0;
    falhar = false;
  });

  test('agenda o reset diário à meia-noite e o semanal na segunda, no fuso de Brasília', () => {
    agendarResetHabitos(criarLog().logger);
    assert.deepEqual(agendados.map((a) => a.expressao), ['0 0 * * *', '0 0 * * 1']);
    assert.ok(agendados.every((a) => a.opcoes.timezone === 'America/Sao_Paulo'));
  });

  test('cada agendamento chama o reset certo', async () => {
    agendarResetHabitos(criarLog().logger);
    await agendados[0].tarefa();
    await agendados[1].tarefa();
    assert.deepEqual(chamadas, ['diario', 'semanal']);
  });

  test('uma falha no reset é registrada no log e não derruba o servidor', async () => {
    const { log, logger } = criarLog();
    agendarResetHabitos(logger);
    falhar = true;
    await agendados[0].tarefa(); // não pode lançar exceção
    await agendados[1].tarefa();
    assert.equal(log.error.length, 2);
  });
});

describe('Agendador de notificações', () => {
  test('agenda o envio diário às 8h no fuso de Brasília', () => {
    agendados.length = 0;
    agendarNotificacoes(criarLog().logger);
    assert.equal(agendados.length, 1);
    assert.equal(agendados[0].expressao, '0 8 * * *');
    assert.equal(agendados[0].opcoes.timezone, 'America/Sao_Paulo');
  });
});
