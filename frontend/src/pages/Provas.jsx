import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Página de Provas/Avaliações
 * Lista todas as avaliações e permite criar novas
 */
export default function Provas() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário
  const [disciplina, setDisciplina] = useState('');
  const [descricao, setDescricao] = useState('');
  const [peso, setPeso] = useState(1.0);
  const [dataRealizacao, setDataRealizacao] = useState('');

  // Busca todas as avaliações ao montar o componente
  const fetchAvaliacoes = async () => {
    try {
      const res = await api.get('/avaliacoes');
      setAvaliacoes(res.data);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvaliacoes(); }, []);

  // Calcula quantos dias faltam
  const diasRestantes = (data) => {
    const diff = new Date(data) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Cria nova avaliação
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/avaliacoes', { disciplina, descricao, peso, dataRealizacao });
      setDisciplina(''); setDescricao(''); setPeso(1.0); setDataRealizacao('');
      setShowForm(false);
      fetchAvaliacoes(); // recarrega a lista
    } catch (err) {
      console.error('Erro ao criar avaliação:', err);
    }
  };

  // Deleta uma avaliação
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/avaliacoes/${id}`);
      fetchAvaliacoes();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><p className="text-gray-500">Carregando...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📝 Provas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          {showForm ? 'Cancelar' : '+ Nova Prova'}
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina *</label>
              <input type="text" required value={disciplina} onChange={(e) => setDisciplina(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" required value={dataRealizacao} onChange={(e) => setDataRealizacao(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Prova 1 - Matéria toda"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
            <input type="number" step="0.1" min="0" value={peso} onChange={(e) => setPeso(parseFloat(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
            Salvar
          </button>
        </form>
      )}

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
                <p className="text-xs text-gray-400 mt-1">Peso: {av.peso} • {new Date(av.dataRealizacao).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  {diasRestantes(av.dataRealizacao)} dias
                </span>
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
