import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltrosCalendario, NavegacaoMes, SeletorVisao } from '../../src/components/ControlesCalendario';

describe('NavegacaoMes', () => {
  test('mostra o título e anda um período para trás ou para frente', async () => {
    const onMudarPeriodo = vi.fn();
    render(<NavegacaoMes titulo="novembro de 2026" onMudarPeriodo={onMudarPeriodo} />);

    expect(screen.getByRole('heading', { name: 'novembro de 2026' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Período anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próximo período' }));
    expect(onMudarPeriodo.mock.calls).toEqual([[-1], [1]]);
  });
});

describe('SeletorVisao', () => {
  test('marca a visão atual e avisa quando o usuário troca', async () => {
    const onMudar = vi.fn();
    render(<SeletorVisao visao="mes" onMudar={onMudar} />);

    expect(screen.getByRole('button', { name: 'Mês' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Semana' }).getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(screen.getByRole('button', { name: 'Semana' }));
    expect(onMudar).toHaveBeenCalledWith('semana');
  });
});

describe('FiltrosCalendario', () => {
  test('cada caixa reflete o filtro e alterna só o seu tipo', async () => {
    const onAlternar = vi.fn();
    render(<FiltrosCalendario filtros={{ prova: true, trabalho: true, habito: false }} onAlternar={onAlternar} />);

    expect(screen.getByRole('checkbox', { name: 'Provas' }).checked).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Hábitos' }).checked).toBe(false);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hábitos' }));
    expect(onAlternar).toHaveBeenCalledWith('habito');
  });
});
