import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinksUteis from '../../src/components/LinksUteis';

const campo = () => screen.getByPlaceholderText('Adicionar link...');

describe('LinksUteis', () => {
  test('só exibe: sem links não mostra nada; com links, não dá para editar', () => {
    const { container, rerender } = render(<LinksUteis />);
    expect(container.innerHTML).toBe('');

    rerender(<LinksUteis links={['https://ufmg.br']} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://ufmg.br');
    expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('adiciona o link com https:// e limpa o campo', async () => {
    const onChange = vi.fn();
    render(<LinksUteis links={['https://ufmg.br']} onChange={onChange} />);

    await userEvent.type(campo(), 'github.com/tp1{Enter}');
    expect(onChange).toHaveBeenCalledWith(['https://ufmg.br', 'https://github.com/tp1']);
    expect(campo().value).toBe('');
  });

  test('ignora campo vazio e link repetido', async () => {
    const onChange = vi.fn();
    render(<LinksUteis links={['https://ufmg.br']} onChange={onChange} />);

    await userEvent.type(campo(), '   {Enter}');
    await userEvent.type(campo(), 'ufmg.br{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('remove só o link clicado', async () => {
    const onChange = vi.fn();
    render(<LinksUteis links={['https://a.com', 'https://b.com']} onChange={onChange} />);

    await userEvent.click(screen.getAllByTitle('Remover link')[0]);
    expect(onChange).toHaveBeenCalledWith(['https://b.com']);
  });
});
