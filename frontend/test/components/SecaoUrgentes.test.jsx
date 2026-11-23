import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SecaoUrgentes from '../../src/components/SecaoUrgentes';

const renderizar = (avaliacoes, trabalhos) =>
  render(<MemoryRouter><SecaoUrgentes avaliacoes={avaliacoes} trabalhos={trabalhos} /></MemoryRouter>);

describe('SecaoUrgentes', () => {
  // "Hoje" fixo em 23/11/2026, para o teste não depender do dia em que roda
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 23, 10));
  });
  afterEach(() => vi.useRealTimers());

  test('sem nada urgente, mostra a mensagem de vazio', () => {
    renderizar([{ id: 1, disciplina: 'ES', dataRealizacao: '2026-12-10', dataAlarme: '2026-12-07' }], []);
    expect(screen.getByText('Nenhum item urgente no momento.')).toBeTruthy();
  });

  test('lista atrasados e urgentes, do prazo mais antigo para o mais novo', () => {
    renderizar(
      [{ id: 1, disciplina: 'Cálculo', descricao: 'P1', dataRealizacao: '2026-11-20', dataAlarme: '2026-11-17' }],
      [
        { id: 2, titulo: 'TP2', disciplina: 'ES', prazoEntrega: '2026-11-24', dataAlarme: '2026-11-21', status: 'pendente' },
        { id: 3, titulo: 'Relatório', prazoEntrega: '2026-11-25', dataAlarme: '2026-11-22', status: 'concluido' },
      ],
    );

    const cards = screen.getAllByRole('link');
    expect(cards).toHaveLength(2); // o trabalho concluído não aparece
    expect(cards[0].textContent).toContain('📝 Cálculo');
    expect(cards[0].textContent).toContain('P1 • 20/11/2026');
    expect(cards[0].textContent).toContain('Atrasado');
    expect(cards[0].getAttribute('href')).toBe('/provas');
    expect(cards[1].textContent).toContain('👥 TP2');
    expect(cards[1].textContent).toContain('Urgente');
    expect(cards[1].getAttribute('href')).toBe('/trabalhos');
  });
});
