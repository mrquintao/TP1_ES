import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar — Barra de navegação principal do StudySync
 * Links: Meu Dia, Provas, Trabalhos, Hábitos
 */
export default function Navbar() {
  const location = useLocation();

  // Verifica se o link está ativo para aplicar estilo diferente
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/', label: '📅 Meu Dia' },
    { to: '/provas', label: '📝 Provas' },
    { to: '/trabalhos', label: '👥 Trabalhos' },
    { to: '/habitos', label: '✅ Hábitos' },
    { to: '/calendario', label: '🗓️ Calendário' },
  ];

  return (
    <nav className="bg-primary shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-white text-xl font-bold">
            📚 StudySync
          </Link>

          {/* Links de navegação */}
          <div className="flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
