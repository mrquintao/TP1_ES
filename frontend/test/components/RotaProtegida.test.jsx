import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RotaProtegida from '../../src/components/RotaProtegida';
import { useAuth } from '../../src/context/AuthContext';

// Troca o contexto de login por um falso: o teste decide quem está logado
vi.mock('../../src/context/AuthContext', () => ({ useAuth: vi.fn() }));

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/provas']}>
      <Routes>
        <Route path="/login" element={<p>Tela de login</p>} />
        <Route path="/provas" element={<RotaProtegida><p>Página de provas</p></RotaProtegida>} />
      </Routes>
    </MemoryRouter>,
  );

describe('RotaProtegida', () => {
  test('enquanto restaura a sessão, espera em vez de mandar pro login', () => {
    useAuth.mockReturnValue({ usuario: null, carregando: true });
    renderizar();
    expect(screen.getByText('Carregando...')).toBeTruthy();
  });

  test('sem sessão, redireciona para /login', () => {
    useAuth.mockReturnValue({ usuario: null, carregando: false });
    renderizar();
    expect(screen.getByText('Tela de login')).toBeTruthy();
  });

  test('com sessão, mostra a página protegida', () => {
    useAuth.mockReturnValue({ usuario: { nome: 'Mateus' }, carregando: false });
    renderizar();
    expect(screen.getByText('Página de provas')).toBeTruthy();
  });
});
