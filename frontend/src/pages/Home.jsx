import { useEffect, useState } from 'react';
import api from '../services/api';
import { parseDataLocal } from '../utils/dates';

/**
 * Home — Tela "Meu Dia" do StudySync
 * Exibe um resumo das próximas provas e hábitos do dia
 */
export default function Home() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resAval, resHab] = await Promise.all([
          api.get('/avaliacoes'),
          api.get('/habitos'),
        ]);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const proximasAvaliacoes = resAval.data
          .filter((av) => parseDataLocal(av.dataRealizacao) >= hoje)
          .slice(0, 5);
        setAvaliacoes(proximasAvaliacoes);
        setHabitos(resHab.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Marca/desmarca um hábito: salva na API e atualiza só esse item na lista
  const toggleConcluido = async (habito) => {
    try {
      const res = await api.put(`/habitos/${habito.id}`, {
        concluidoHoje: !habito.concluidoHoje,
      });
      setHabitos((atual) => atual.map((h) => (h.id === habito.id ? res.data : h)));
    } catch (err) {
      console.error('Erro ao atualizar hábito:', err);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        📅 Meu Dia
      </h1>

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
