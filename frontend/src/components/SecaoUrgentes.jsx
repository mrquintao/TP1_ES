import { Link } from 'react-router-dom';
import { parseDataLocal } from '../utils/dates';
import { estadoUrgencia } from '../utils/urgencia';

const ICONE = { prova: '📝', trabalho: '👥' };

// Visual por estado — a cor comunica a urgência; o tipo já está no ícone/rótulo
const ESTILO_CARD = {
  urgente: 'bg-white border-l-4 border-amber-400',
  atrasado: 'bg-red-50 border-l-4 border-red-500',
};
const ESTILO_SELO = {
  urgente: 'bg-amber-100 text-amber-700',
  atrasado: 'bg-red-100 text-red-700',
};

/**
 * SecaoUrgentes — provas e trabalhos cujo alarme já ligou, na Home ("Meu Dia").
 * Recebe as listas já buscadas por Home.jsx e decide sozinha quem aparece,
 * usando estadoUrgencia() (utils/urgencia.js).
 */
export default function SecaoUrgentes({ avaliacoes, trabalhos }) {
  const itens = [
    ...avaliacoes.map((av) => ({
      id: `prova-${av.id}`,
      tipo: 'prova',
      titulo: av.disciplina,
      detalhe: av.descricao,
      dataLimite: av.dataRealizacao,
      estado: estadoUrgencia({ dataAlarme: av.dataAlarme, dataLimite: av.dataRealizacao }),
      rota: '/provas',
    })),
    ...trabalhos.map((t) => ({
      id: `trabalho-${t.id}`,
      tipo: 'trabalho',
      titulo: t.titulo,
      detalhe: t.disciplina,
      dataLimite: t.prazoEntrega,
      estado: estadoUrgencia({
        dataAlarme: t.dataAlarme,
        dataLimite: t.prazoEntrega,
        concluido: t.status === 'concluido',
      }),
      rota: '/trabalhos',
    })),
  ]
    .filter((item) => item.estado) // só quem está urgente ou atrasado
    .sort((a, b) => a.dataLimite.localeCompare(b.dataLimite)); // mais atrasado/mais próximo primeiro

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">🚨 Urgentes</h2>
      {itens.length === 0 ? (
        <p className="text-gray-400">Nenhum item urgente no momento.</p>
      ) : (
        <div className="grid gap-3">
          {itens.map((item) => (
            <Link
              key={item.id}
              to={item.rota}
              className={`rounded-lg shadow p-4 flex justify-between items-center hover:brightness-95 transition ${ESTILO_CARD[item.estado]}`}
            >
              <div>
                <p className="font-medium">{ICONE[item.tipo]} {item.titulo}</p>
                <p className="text-sm text-gray-500">
                  {item.detalhe && `${item.detalhe} • `}
                  {parseDataLocal(item.dataLimite).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`font-bold px-3 py-1 rounded-full text-sm ${ESTILO_SELO[item.estado]}`}>
                {item.estado === 'atrasado' ? 'Atrasado' : 'Urgente'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
