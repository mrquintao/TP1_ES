import { describe, test, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';
import { useAuth } from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({ useAuth: vi.fn() }));

const renderizar = (logout = vi.fn()) => {
  useAuth.mockReturnValue({ usuario: { nome: 'Mateus' }, logout });
  render(
    <MemoryRouter initialEntries={['/calendario']}>
      <Navbar />
      <Routes>
        <Route path="/login" element={<p>Tela de login</p>} />
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>,
  );
  return logout;
};

describe('Navbar', () => {
  test('mostra quem está logado e destaca a página atual', () => {
    renderizar();
    expect(screen.getAllByText('Olá, Mateus')).toHaveLength(1);
    expect(screen.getByRole('link', { name: '🗓️ Calendário' }).className).toContain('bg-white/20');
    expect(screen.getByRole('link', { name: '📝 Provas' }).className).not.toContain('bg-white/20');
  });

  test('menu do celular abre, fecha ao navegar e alterna o rótulo do botão', async () => {
    renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('link', { name: '📝 Provas' })).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('link', { name: '📝 Provas' })[1]);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeTruthy();
  });

  test('Sair encerra a sessão e leva para o login', async () => {
    const logout = renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const menu = screen.getAllByText('Olá, Mateus')[1].parentElement;
    await userEvent.click(within(menu).getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalled();
    expect(screen.getByText('Tela de login')).toBeTruthy();
  });
});
