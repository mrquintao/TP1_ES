import { useEffect, useState } from 'react';
import api from '../services/api';
import { parseDataLocal } from '../utils/dates';
import FormProva from '../components/FormProva';

/**
 * Página de Provas/Avaliações
 * Lista todas as avaliações e permite criar novas
 */
export default function Provas() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null); // prova sendo editada, ou null
  const [erro, setErro] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  // Busca todas as avaliações ao montar o componente
  const fetchAvaliacoes = async () => {
    try {
      const res = await api.get('/avaliacoes');
      setAvaliacoes(res.data);
      setErro(null);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setErro('Não foi possível carregar as avaliações. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvaliacoes(); }, []);

  // Calcula quantos dias faltam
  const diasRestantes = (data) => {
    const diff = parseDataLocal(data) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Cria nova avaliação
  const handleCriar = async (dados) => {
    setErroAcao(null);
    try {
      await api.post('/avaliacoes', dados);
      setShowForm(false);
      fetchAvaliacoes(); // recarrega a lista
    } catch (err) {
      console.error('Erro ao criar avaliação:', err);
      setErroAcao('Não foi possível criar a avaliação. Tente novamente.');
    }
  };

  // Salva as alterações de uma avaliação existente
  const handleEditar = async (dados) => {
    setErroAcao(null);
    try {
      await api.put(`/avaliacoes/${editando.id}`, dados);
      setEditando(null);
      fetchAvaliacoes();
    } catch (err) {
      console.error('Erro ao editar avaliação:', err);
      setErroAcao('Não foi possível salvar as alterações. Tente novamente.');
    }
  };

  // Alterna o formulário de criação, fechando uma edição em andamento
  const abrirNovaProva = () => {
    setEditando(null);
    setErroAcao(null);
    setShowForm((atual) => !atual);
  };

  // Abre a edição de uma prova, fechando o formulário de criação
  const abrirEdicao = (av) => {
    setShowForm(false);
    setErroAcao(null);
    setEditando(av);
  };

  // Deleta uma avaliação
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    setErroAcao(null);
    try {
      await api.delete(`/avaliacoes/${id}`);
      fetchAvaliacoes();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setErroAcao('Não foi possível excluir a avaliação. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><p className="text-gray-500">Carregando...</p></div>;
  }

  if (erro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">⚠️ {erro}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📝 Provas</h1>
        <button
          onClick={abrirNovaProva}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          {showForm ? 'Cancelar' : '+ Nova Prova'}
        </button>
      </div>

      {erroAcao && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          ⚠️ {erroAcao}
        </div>
      )}

      {/* Formulário de criação ou edição (nunca os dois ao mesmo tempo) */}
      {showForm && <FormProva onSalvar={handleCriar} />}
      {editando && <FormProva inicial={editando} onSalvar={handleEditar} onCancelar={() => setEditando(null)} />}

      {/* Lista de avaliações */}
      {avaliacoes.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Nenhuma prova cadastrada ainda.</p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map((av) => (
            <div key={av.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{av.disciplina}</p>
                <p className="text-sm text-gray-500">{av.descricao || 'Sem descrição'}</p>
                <p className="text-xs text-gray-400 mt-1">Peso: {av.peso} • {parseDataLocal(av.dataRealizacao).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  {diasRestantes(av.dataRealizacao)} dias
                </span>
                <button onClick={() => abrirEdicao(av)} className="text-gray-400 hover:text-primary text-sm">
                  ✏️
                </button>
                <button onClick={() => handleDelete(av.id)} className="text-red-400 hover:text-red-600 text-sm">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
