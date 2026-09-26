import { useEffect, useState } from 'react';
import api from '../services/api';
import { parseDataLocal } from '../utils/dates';
import SecaoUrgentes from '../components/SecaoUrgentes';

/**
 * Home — Tela "Meu Dia" do StudySync
 * Exibe um resumo das próximas provas e hábitos do dia
 */
export default function Home() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [todasAvaliacoes, setTodasAvaliacoes] = useState([]); // sem o filtro de "só futuras", pra Urgentes
  const [trabalhos, setTrabalhos] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [erroHabito, setErroHabito] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resAval, resTrab, resHab] = await Promise.all([
          api.get('/avaliacoes'),
          api.get('/trabalhos'),
          api.get('/habitos'),
        ]);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        // Ordena por data antes de pegar as 5 mais próximas
        const proximasAvaliacoes = resAval.data
          .filter((av) => parseDataLocal(av.dataRealizacao) >= hoje)
          .sort((a, b) => parseDataLocal(a.dataRealizacao) - parseDataLocal(b.dataRealizacao))
          .slice(0, 5);
        setAvaliacoes(proximasAvaliacoes);
        // "Urgentes" olha todas as avaliações/trabalhos (não só as 5 próximas),
        // então guarda a lista completa à parte da que a seção de provas usa.
        setTodasAvaliacoes(resAval.data);
        setTrabalhos(resTrab.data);
        setHabitos(resHab.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErro('Não foi possível carregar os dados. Verifique se o servidor está rodando.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Marca/desmarca um hábito: salva na API e atualiza só esse item na lista
  const toggleConcluido = async (habito) => {
    setErroHabito(null);
    try {
      const res = await api.put(`/habitos/${habito.id}`, {
        concluidoHoje: !habito.concluidoHoje,
      });
      setHabitos((atual) => atual.map((h) => (h.id === habito.id ? res.data : h)));
    } catch (err) {
      console.error('Erro ao atualizar hábito:', err);
      setErroHabito('Não foi possível atualizar o hábito. Tente novamente.');
    }
  };

  // Calcula dias restantes até uma data
  const diasRestantes = (data) => {
    const diff = parseDataLocal(data) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Carregando...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {erro}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        📅 Meu Dia
      </h1>

      {/* Seção: Urgentes — o que precisa de atenção primeiro fica no topo */}
      <SecaoUrgentes avaliacoes={todasAvaliacoes} trabalhos={trabalhos} />

      {/* Seção: Próximas Provas */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          📝 Próximas Provas
        </h2>
        {avaliacoes.length === 0 ? (
          <p className="text-gray-400">Nenhuma prova cadastrada.</p>
        ) : (
          <div className="grid gap-3">
            {avaliacoes.map((av) => (
              <div
                key={av.id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{av.disciplina}</p>
                  <p className="text-sm text-gray-500">{av.descricao}</p>
                </div>
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  {diasRestantes(av.dataRealizacao)} dias
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seção: Checklist de Hábitos */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          ✅ Hábitos de Hoje
        </h2>
        {erroHabito && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-600 text-sm">
            ⚠️ {erroHabito}
          </div>
        )}
        {habitos.length === 0 ? (
          <p className="text-gray-400">Nenhum hábito cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {habitos.map((h) => (
              <label
                key={h.id}
                className="flex items-center gap-3 bg-white rounded-lg shadow p-3 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={h.concluidoHoje}
                  onChange={() => toggleConcluido(h)}
                  className="w-5 h-5 rounded text-primary"
                />
                <span className={h.concluidoHoje ? 'line-through text-gray-400' : ''}>
                  {h.descricao}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
