import { useEffect, useState } from 'react';
import api from '../services/api';
import LinksUteis from '../components/LinksUteis';
import { parseDataLocal } from '../utils/dates';
import FormTrabalho from '../components/FormTrabalho';

/**
 * Página de Trabalhos em Grupo
 * Lista trabalhos, permite criar novos e adicionar membros
 */
export default function Trabalhos() {
  const [trabalhos, setTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchTrabalhos = async () => {
    try {
      const res = await api.get('/trabalhos');
      setTrabalhos(res.data);
    } catch (err) {
      console.error('Erro ao buscar trabalhos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrabalhos(); }, []);

  const diasRestantes = (data) => {
    const diff = parseDataLocal(data) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Cria novo trabalho
  const handleCriar = async (dados) => {
    try {
      await api.post('/trabalhos', dados);
      setShowForm(false);
      fetchTrabalhos();
    } catch (err) {
      console.error('Erro ao criar trabalho:', err);
    }
  };

  // Salva a nova lista de links de um trabalho (usado ao adicionar/remover um link)
  const atualizarLinks = async (id, linksUteis) => {
    try {
      await api.put(`/trabalhos/${id}`, { linksUteis });
      fetchTrabalhos();
    } catch (err) {
      console.error('Erro ao atualizar links:', err);
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      const res = await api.put(`/trabalhos/${id}`, { status });
      setTrabalhos((atual) => atual.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/trabalhos/${id}`);
      fetchTrabalhos();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  // Mapeia status para cor do badge
  const statusColor = {
    pendente: 'bg-yellow-100 text-yellow-700',
    em_andamento: 'bg-blue-100 text-blue-700',
    concluido: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return <div className="flex justify-center p-8"><p className="text-gray-500">Carregando...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">👥 Trabalhos</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
          {showForm ? 'Cancelar' : '+ Novo Trabalho'}
        </button>
      </div>

      {showForm && <FormTrabalho onSalvar={handleCriar} />}

      {trabalhos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Nenhum trabalho cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {trabalhos.map((t) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{t.titulo}</p>
                  <p className="text-sm text-gray-500">{t.disciplina || 'Sem disciplina'}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {t.membros?.map((m) => (
                      <span key={m.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {m.nome}
                      </span>
                    ))}
                  </div>
                  <LinksUteis links={t.linksUteis} onChange={(links) => atualizarLinks(t.id, links)} />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={t.status}
                    onChange={(e) => atualizarStatus(t.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColor[t.status] || ''}`}
                    aria-label={`Status do trabalho ${t.titulo}`}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                  <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                    {diasRestantes(t.prazoEntrega)}d
                  </span>
                  <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
