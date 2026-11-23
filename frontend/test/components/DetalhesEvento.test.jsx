import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DetalhesEvento } from '../../src/components/ControlesCalendario';

// O modal tem um <Link>, que só funciona dentro de um roteador
const renderizar = (evento, onFechar = () => {}) =>
  render(<MemoryRouter><DetalhesEvento evento={evento} onFechar={onFechar} /></MemoryRouter>);

const modal = () => screen.getByRole('dialog', { name: 'Detalhes do compromisso' });

describe('DetalhesEvento', () => {
  test('sem evento selecionado, não mostra nada', () => {
    const { container } = renderizar(null);
    expect(container.innerHTML).toBe('');
  });

  test('prova mostra disciplina, descrição, peso, data e o link para Provas', () => {
    renderizar({ tipo: 'prova', id: 1, data: '2026-11-24', titulo: 'P2', disciplina: 'ES', descricao: 'Testes', peso: 0 });

    expect(modal().textContent).toContain('Prova');
    expect(modal().textContent).toContain('ES');
    expect(modal().textContent).toContain('Testes');
    expect(modal().textContent).toContain('Peso: 0'); // peso zero também aparece
    expect(modal().textContent).toContain('terça-feira, 24 de novembro de 2026');
    expect(screen.getByRole('link', { name: '→ Ver Provas' }).getAttribute('href')).toBe('/provas');
  });

  test('trabalho mostra o status legível e o link para Trabalhos', () => {
    renderizar({ tipo: 'trabalho', id: 2, data: '2026-11-24', titulo: 'TP2', status: 'em_andamento' });

    expect(modal().textContent).toContain('em andamento');
    expect(modal().textContent).not.toContain('Peso');
    expect(screen.getByRole('link', { name: '→ Ver Trabalhos' }).getAttribute('href')).toBe('/trabalhos');
  });

  test('hábito leva para Hábitos', () => {
    renderizar({ tipo: 'habito', id: 3, data: '2026-11-24', titulo: 'Ler' });
    expect(screen.getByRole('link', { name: '→ Ver Hábitos' }).getAttribute('href')).toBe('/habitos');
  });

  test('o X e o link fecham o modal', async () => {
    const onFechar = vi.fn();
    renderizar({ tipo: 'habito', id: 3, data: '2026-11-24', titulo: 'Ler' }, onFechar);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }));
    await userEvent.click(screen.getByRole('link', { name: '→ Ver Hábitos' }));
    expect(onFechar).toHaveBeenCalledTimes(2);
  });
});
