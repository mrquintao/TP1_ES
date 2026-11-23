import { describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormProva from '../../src/components/FormProva';

// Campos pela ordem, como no FormTrabalho: os <label> não estão ligados aos inputs
const campos = (container) => {
  const [disciplina, descricao] = screen.getAllByRole('textbox');
  const [data, alarme] = container.querySelectorAll('input[type="date"]');
  return { disciplina, descricao, data, alarme, peso: screen.getByRole('spinbutton') };
};

describe('FormProva', () => {
  test('nova prova: envia os campos com o alarme sugerido e limpa o formulário', async () => {
    const onSalvar = vi.fn();
    const { container } = render(<FormProva onSalvar={onSalvar} />);
    const c = campos(container);

    expect(c.peso.value).toBe('1'); // peso padrão
    await userEvent.type(c.disciplina, 'Engenharia de Software');
    await userEvent.type(c.descricao, 'Prova 2');
    fireEvent.change(c.peso, { target: { value: '2.5' } });
    fireEvent.change(c.data, { target: { value: '2026-11-24' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSalvar).toHaveBeenCalledWith({
      disciplina: 'Engenharia de Software', descricao: 'Prova 2', peso: 2.5,
      dataRealizacao: '2026-11-24', dataAlarme: '2026-11-21',
    });
    expect(c.disciplina.value).toBe('');
    expect(c.peso.value).toBe('1');
  });

  test('alarme escolhido à mão não é trocado ao mudar a data', () => {
    const { container } = render(<FormProva onSalvar={() => {}} />);
    const c = campos(container);

    fireEvent.change(c.alarme, { target: { value: '2026-11-20' } });
    fireEvent.change(c.data, { target: { value: '2026-11-30' } });
    expect(c.alarme.value).toBe('2026-11-20');
  });

  test('edição: mantém o alarme salvo e o peso zero, e pode cancelar', async () => {
    const onSalvar = vi.fn();
    const onCancelar = vi.fn();
    const inicial = {
      disciplina: 'ES', descricao: '', peso: 0,
      dataRealizacao: '2026-11-24T00:00:00.000Z', dataAlarme: '2026-11-22T00:00:00.000Z',
    };
    const { container } = render(<FormProva inicial={inicial} onSalvar={onSalvar} onCancelar={onCancelar} />);

    fireEvent.change(campos(container).data, { target: { value: '2026-11-26' } });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSalvar).toHaveBeenCalledWith({
      disciplina: 'ES', descricao: '', peso: 0, dataRealizacao: '2026-11-26', dataAlarme: '2026-11-22',
    });
    expect(campos(container).disciplina.value).toBe('ES'); // edição não limpa o formulário
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
