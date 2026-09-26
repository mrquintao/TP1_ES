import { Link } from 'react-router-dom';
import { parseDataLocal } from '../utils/dates';
import { TIPOS_EVENTO } from '../utils/calendario';

// Navega o período em exibição (mês ou semana, um passo por vez).
// Quem chama decide o que "um passo" significa — o componente só sabe o título já pronto.
export function NavegacaoMes({ titulo, onMudarPeriodo }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onMudarPeriodo(-1)}
        className="rounded-lg border bg-white px-3 py-2 hover:bg-gray-50" aria-label="Período anterior">
        ‹
      </button>
      <h2 className="min-w-44 text-center text-lg font-semibold capitalize text-gray-700">{titulo}</h2>
      <button type="button" onClick={() => onMudarPeriodo(1)}
        className="rounded-lg border bg-white px-3 py-2 hover:bg-gray-50" aria-label="Próximo período">
        ›
      </button>
    </div>
  );
}

// Alterna entre a grade de mês e a de semana
export function SeletorVisao({ visao, onMudar }) {
  const opcoes = [['mes', 'Mês'], ['semana', 'Semana']];
  return (
    <div className="inline-flex rounded-lg border bg-white p-1" role="group" aria-label="Visão do calendário">
      {opcoes.map(([valor, rotulo]) => (
        <button
          key={valor}
          type="button"
          onClick={() => onMudar(valor)}
          aria-pressed={visao === valor}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            visao === valor ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

export function FiltrosCalendario({ filtros, onAlternar }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtros de compromissos">
      {Object.entries(TIPOS_EVENTO).map(([tipo, estilo]) => (
        <label key={tipo} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${estilo.cor}`}>
          <input type="checkbox" checked={filtros[tipo]} onChange={() => onAlternar(tipo)} />
          <span className={`h-2.5 w-2.5 rounded-full ${estilo.marcador}`} />
          {estilo.label}
        </label>
      ))}
    </div>
  );
}

/**
 * Modal de detalhes de um evento do calendário.
 * Exibe título, tipo, data completa, disciplina, descrição, peso (provas),
 * status (trabalhos) e link de navegação para a página correspondente.
 */
export function DetalhesEvento({ evento, onFechar }) {
  if (!evento) return null;
  const tipo = TIPOS_EVENTO[evento.tipo];
  const data = parseDataLocal(evento.data).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  // Rota de navegação para a página correspondente
  const paginaRota = evento.tipo === 'prova'
    ? '/provas'
    : evento.tipo === 'trabalho'
    ? '/trabalhos'
    : '/habitos';
  const paginaLabel = evento.tipo === 'prova'
    ? 'Ver Provas'
    : evento.tipo === 'trabalho'
    ? 'Ver Trabalhos'
    : 'Ver Hábitos';

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4" role="presentation">
      <section className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-label="Detalhes do compromisso">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${tipo.cor}`}>
              {tipo.label.slice(0, -1)}
            </span>
            <h2 className="mt-3 text-xl font-bold text-gray-800">{evento.titulo}</h2>

            {/* Disciplina */}
            {evento.disciplina && (
              <p className="mt-1 text-sm text-gray-600">📚 {evento.disciplina}</p>
            )}

            {/* Descrição (provas) */}
            {evento.descricao && (
              <p className="mt-1 text-sm text-gray-500 italic">{evento.descricao}</p>
            )}

            {/* Peso (provas) */}
            {evento.peso !== undefined && evento.tipo === 'prova' && (
              <p className="mt-1 text-sm text-gray-500">Peso: {evento.peso}</p>
            )}

            {/* Status (trabalhos) */}
            {evento.status && evento.tipo === 'trabalho' && (
              <p className="mt-1 text-sm text-gray-500 capitalize">
                Status: <span className="font-medium">{evento.status.replace('_', ' ')}</span>
              </p>
            )}

            <p className="mt-2 text-sm text-gray-400 capitalize">{data}</p>

            {/* Link para a página correspondente */}
            <Link
              to={paginaRota}
              onClick={onFechar}
              className="mt-4 inline-block text-sm text-primary hover:underline font-medium"
            >
              → {paginaLabel}
            </Link>
          </div>
          <button type="button" onClick={onFechar} className="text-xl text-gray-400 hover:text-gray-700" aria-label="Fechar detalhes">
            ×
          </button>
        </div>
      </section>
    </div>
  );
}
