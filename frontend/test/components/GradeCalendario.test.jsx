import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradeCalendario from '../../src/components/GradeCalendario';
import { diasDaGrade, diasDaSemana } from '../../src/utils/calendario';

// Novembro/2026 começa num domingo: a grade vai de 01/11 a 12/12
const novembro = new Date(2026, 10, 1);
const eventos = [
  { tipo: 'prova', id: 1, data: '2026-11-10', titulo: 'Prova de ES' },
  { tipo: 'trabalho', id: 2, data: '2026-11-25', titulo: 'TP2' },
];

const renderizar = (props) =>
  render(
    <GradeCalendario dias={diasDaGrade(novembro)} eventos={eventos}
      mesReferencia={novembro} onSelecionar={() => {}} {...props} />,
  );

// A célula do dia é o avô do botão do evento (célula > lista > botão)
const celulaDoEvento = (titulo) => screen.getByRole('button', { name: titulo }).parentElement.parentElement;

describe('GradeCalendario', () => {
  test('coloca cada evento na célula do seu dia', () => {
    renderizar();
    expect(celulaDoEvento('Prova de ES').textContent).toContain('Ter, 10');
    expect(celulaDoEvento('TP2').textContent).toContain('Qua, 25');
  });

  test('na visão de mês, esmaece só os dias de dezembro', () => {
    const { container } = renderizar();
    expect(container.querySelectorAll('.min-h-28')).toHaveLength(42);
    expect(container.querySelectorAll('.min-h-28.text-gray-400')).toHaveLength(12);
  });

  test('na visão de semana, nenhum dia fica esmaecido', () => {
    const { container } = renderizar({ dias: diasDaSemana(new Date(2026, 10, 10)), mesReferencia: null });
    expect(container.querySelectorAll('.min-h-28')).toHaveLength(7);
    expect(container.querySelectorAll('.text-gray-400')).toHaveLength(0);
  });

  test('clicar num evento devolve o evento inteiro para quem usa a grade', async () => {
    const onSelecionar = vi.fn();
    renderizar({ onSelecionar });
    await userEvent.click(screen.getByRole('button', { name: 'TP2' }));
    expect(onSelecionar).toHaveBeenCalledWith(eventos[1]);
  });
});
