import { useState } from 'react';

/**
 * FormProva — formulário de nova prova, extraído de Provas.jsx pra poder
 * ser reaproveitado quando a edição for adicionada (mesmo form, dois usos).
 *
 * Props:
 *  - onSalvar(dados): chamada com os campos preenchidos ao submeter
 */
export default function FormProva({ onSalvar }) {
  const [disciplina, setDisciplina] = useState('');
  const [descricao, setDescricao] = useState('');
  const [peso, setPeso] = useState(1.0);
  const [dataRealizacao, setDataRealizacao] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({ disciplina, descricao, peso, dataRealizacao });
    setDisciplina(''); setDescricao(''); setPeso(1.0); setDataRealizacao('');
  };

  return (
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
  );
}
