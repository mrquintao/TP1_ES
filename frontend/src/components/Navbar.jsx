import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar — Barra de navegação principal do StudySync
 * Responsiva: menu hambúrguer em telas pequenas
 */
export default function Navbar() {
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Verifica se o link está ativo para aplicar estilo diferente
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/', label: '📅 Meu Dia' },
    { to: '/provas', label: '📝 Provas' },
    { to: '/trabalhos', label: '👥 Trabalhos' },
    { to: '/habitos', label: '✅ Hábitos' },
    { to: '/calendario', label: '🗓️ Calendário' },
  ];

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-white/20 text-white'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav className="bg-primary shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-white text-xl font-bold">
            📚 StudySync
          </Link>

          {/* Links de navegação — desktop */}
          <div className="hidden md:flex space-x-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botão hambúrguer — mobile */}
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
          >
            {menuAberto ? (
              /* X */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Três linhas */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile — dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-white/20 px-4 pb-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={linkClass(link.to)}
              onClick={() => setMenuAberto(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
