import { useEffect, useState } from 'react';
import api from '../services/api';
import LinksUteis from '../components/LinksUteis';

/**
 * Página de Trabalhos em Grupo
 * Lista trabalhos, permite criar novos e adicionar membros
 */
export default function Trabalhos() {
  const [trabalhos, setTrabalhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário
  const [titulo, setTitulo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  const [membrosInput, setMembrosInput] = useState('');

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
    const diff = new Date(data) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Cria novo trabalho com membros (nomes separados por vírgula)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const membros = membrosInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((nome) => ({ nome }));

    try {
      await api.post('/trabalhos', { titulo, disciplina, prazoEntrega, membros });
      setTitulo(''); setDisciplina(''); setPrazoEntrega(''); setMembrosInput('');
      setShowForm(false);
      fetchTrabalhos();
    } catch (err) {
      console.error('Erro ao criar trabalho:', err);
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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega *</label>
              <input type="date" required value={prazoEntrega} onChange={(e) => setPrazoEntrega(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
            <input type="text" value={disciplina} onChange={(e) => setDisciplina(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membros (separar por vírgula)</label>
            <input type="text" value={membrosInput} onChange={(e) => setMembrosInput(e.target.value)}
              placeholder="Ex: Guilherme, Mateus, Lucas"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
            Salvar
          </button>
        </form>
      )}

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
                  <LinksUteis links={t.linksUteis} />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[t.status] || ''}`}>
                    {t.status}
                  </span>
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
