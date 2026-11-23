import { describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormTrabalho from '../../src/components/FormTrabalho';

// Os <label> do formulário não estão ligados aos inputs, então os campos
// são achados pela ordem: textos [título, disciplina, membros] e datas [prazo, alarme]
const campos = (container) => {
  const [titulo, disciplina, membros] = screen.getAllByRole('textbox');
  const [prazo, alarme] = container.querySelectorAll('input[type="date"]');
  return { titulo, disciplina, membros, prazo, alarme };
};

describe('FormTrabalho', () => {
  test('novo trabalho: envia membros e links normalizados e limpa o formulário', async () => {
    const onSalvar = vi.fn();
    const { container } = render(<FormTrabalho onSalvar={onSalvar} />);
    const c = campos(container);

    await userEvent.type(c.titulo, 'TP2');
    await userEvent.type(c.disciplina, 'ES');
    fireEvent.change(c.prazo, { target: { value: '2026-11-24' } });
    await userEvent.type(c.membros, 'Mateus, , Lucas ');
    await userEvent.type(screen.getByPlaceholderText(/drive.google/), 'github.com/tp{Enter}github.com/tp');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSalvar).toHaveBeenCalledWith({
      titulo: 'TP2', disciplina: 'ES', prazoEntrega: '2026-11-24', dataAlarme: '2026-11-21',
      membros: [{ nome: 'Mateus' }, { nome: 'Lucas' }],
      linksUteis: ['https://github.com/tp'],
    });
    expect(c.titulo.value).toBe('');
    expect(c.prazo.value).toBe('');
  });

  test('alarme acompanha o prazo até ser mexido à mão', () => {
    const { container } = render(<FormTrabalho onSalvar={() => {}} />);
    const c = campos(container);

    fireEvent.change(c.prazo, { target: { value: '2026-12-01' } });
    expect(c.alarme.value).toBe('2026-11-28'); // 3 dias antes, virando o mês
    fireEvent.change(c.alarme, { target: { value: '2026-11-30' } });
    fireEvent.change(c.prazo, { target: { value: '2026-12-10' } });
    expect(c.alarme.value).toBe('2026-11-30');
  });

  test('edição: preenche os campos, esconde membros e links e pode cancelar', async () => {
    const onSalvar = vi.fn();
    const onCancelar = vi.fn();
    const inicial = { titulo: 'TP1', disciplina: 'ES', prazoEntrega: '2026-09-28T00:00:00.000Z', dataAlarme: null };
    render(<FormTrabalho inicial={inicial} onSalvar={onSalvar} onCancelar={onCancelar} />);

    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSalvar).toHaveBeenCalledWith({ titulo: 'TP1', disciplina: 'ES', prazoEntrega: '2026-09-28', dataAlarme: null });
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
