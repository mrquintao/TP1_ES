import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Página de Hábitos — checklist diário do estudante
 * Permite criar hábitos, editar, marcar como concluído e resetar todos
 */
export default function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [recorrencia, setRecorrencia] = useState('diario');
  const [editando, setEditando] = useState(null); // { id, descricao, recorrencia } | null
  const [erro, setErro] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const fetchHabitos = async () => {
    try {
      const res = await api.get('/habitos');
      setHabitos(res.data);
      setErro(null);
    } catch (err) {
      console.error('Erro ao buscar hábitos:', err);
      setErro('Não foi possível carregar os hábitos. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabitos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroAcao(null);
    try {
      await api.post('/habitos', { descricao, recorrencia });
      setDescricao(''); setRecorrencia('diario');
      setShowForm(false);
      fetchHabitos();
    } catch (err) {
      console.error('Erro ao criar hábito:', err);
      setErroAcao('Não foi possível criar o hábito. Tente novamente.');
    }
  };

  // Salva as alterações de um hábito editado (descrição e/ou recorrência)
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setErroAcao(null);
    try {
      const res = await api.put(`/habitos/${editando.id}`, {
        descricao: editando.descricao,
        recorrencia: editando.recorrencia,
      });
      setHabitos((atual) => atual.map((h) => (h.id === editando.id ? res.data : h)));
      setEditando(null);
    } catch (err) {
      console.error('Erro ao editar hábito:', err);
      setErroAcao('Não foi possível salvar as alterações. Tente novamente.');
    }
  };

  // Alterna o estado concluído do hábito
  const toggleConcluido = async (habito) => {
    setErroAcao(null);
    try {
      await api.put(`/habitos/${habito.id}`, {
        concluidoHoje: !habito.concluidoHoje,
      });
      fetchHabitos();
    } catch (err) {
      console.error('Erro ao atualizar hábito:', err);
      setErroAcao('Não foi possível atualizar o hábito. Tente novamente.');
    }
  };

  // Reseta todos os hábitos diários
  const handleReset = async () => {
    if (!confirm('Resetar todos os hábitos diários?')) return;
    setErroAcao(null);
    try {
      await api.post('/habitos/reset');
      fetchHabitos();
    } catch (err) {
      console.error('Erro ao resetar hábitos:', err);
      setErroAcao('Não foi possível resetar os hábitos. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este hábito?')) return;
    setErroAcao(null);
    try {
      await api.delete(`/habitos/${id}`);
      fetchHabitos();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setErroAcao('Não foi possível excluir o hábito. Tente novamente.');
    }
  };

  // Conta quantos hábitos foram concluídos hoje
  const concluidos = habitos.filter((h) => h.concluidoHoje).length;
  const total = habitos.length;

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
        <h1 className="text-3xl font-bold text-gray-800">✅ Hábitos</h1>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
            🔄 Resetar Dia
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditando(null); }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
            {showForm ? 'Cancelar' : '+ Novo Hábito'}
          </button>
        </div>
      </div>

      {erroAcao && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          ⚠️ {erroAcao}
        </div>
      )}

      {/* Barra de progresso */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso do dia</span>
            <span>{concluidos}/{total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${(concluidos / total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Estudar 1h de Cálculo"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
            <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none">
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
            Salvar
          </button>
        </form>
      )}

      {/* Formulário inline de edição de um hábito específico */}
      {editando && (
        <form onSubmit={handleSalvarEdicao} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-blue-700">Editando hábito</p>
          <div className="flex gap-3 flex-wrap">
            <input type="text" required value={editando.descricao}
              onChange={(e) => setEditando((ed) => ({ ...ed, descricao: e.target.value }))}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none min-w-48" />
            <select value={editando.recorrencia}
              onChange={(e) => setEditando((ed) => ({ ...ed, recorrencia: e.target.value }))}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none">
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
            </select>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
              Salvar
            </button>
            <button type="button" onClick={() => setEditando(null)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {habitos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Nenhum hábito cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {habitos.map((h) => (
            <div key={h.id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:bg-gray-50 transition">
              {/* O toggle fica no onChange do checkbox: clicar na label já aciona o input,
                  então um onClick na label disparava a requisição duas vezes. */}
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input type="checkbox" checked={h.concluidoHoje} onChange={() => toggleConcluido(h)}
                  className="w-5 h-5 rounded text-primary cursor-pointer" />
                <span className={h.concluidoHoje ? 'line-through text-gray-400' : 'text-gray-800'}>
                  {h.descricao}
                </span>
                <span className="text-xs text-gray-400 ml-2">({h.recorrencia})</span>
              </label>
              <div className="flex gap-2 ml-2">
                <button onClick={() => { setEditando({ id: h.id, descricao: h.descricao, recorrencia: h.recorrencia }); setShowForm(false); }}
                  className="text-gray-400 hover:text-primary text-sm">✏️</button>
                <button onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
