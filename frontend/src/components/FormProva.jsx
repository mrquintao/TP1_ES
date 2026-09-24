import { useState } from 'react';
import { sugerirAlarme } from '../utils/urgencia';

/**
 * FormProva — formulário de criar ou editar uma prova.
 *
 * Props:
 *  - inicial: prova a editar (preenche os campos) ou undefined para criar uma nova
 *  - onSalvar(dados): chamada com os campos preenchidos ao submeter
 *  - onCancelar: opcional — mostra um botão "Cancelar" que a chama (usado na edição)
 */
export default function FormProva({ inicial, onSalvar, onCancelar }) {
  const [disciplina, setDisciplina] = useState(inicial?.disciplina ?? '');
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [peso, setPeso] = useState(inicial?.peso ?? 1.0);
  const [dataRealizacao, setDataRealizacao] = useState(inicial?.dataRealizacao?.slice(0, 10) ?? '');
  const [dataAlarme, setDataAlarme] = useState(inicial?.dataAlarme?.slice(0, 10) ?? '');
  // Enquanto o alarme não for mexido à mão, ele acompanha a data da prova (sugestão
  // automática). Editar um item que já tem alarme salvo não deve sobrescrever esse valor.
  const [alarmeManual, setAlarmeManual] = useState(!!inicial?.dataAlarme);

  const aoMudarData = (valor) => {
    setDataRealizacao(valor);
    if (!alarmeManual) setDataAlarme(sugerirAlarme(valor));
  };

  const aoMudarAlarme = (valor) => {
    setDataAlarme(valor);
    setAlarmeManual(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({ disciplina, descricao, peso, dataRealizacao, dataAlarme: dataAlarme || null });
    if (!inicial) {
      setDisciplina(''); setDescricao(''); setPeso(1.0); setDataRealizacao(''); setDataAlarme(''); setAlarmeManual(false);
    }
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
          <input type="date" required value={dataRealizacao} onChange={(e) => aoMudarData(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Prova 1 - Matéria toda"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
      </div>
      <div className="flex gap-4">
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
          <input type="number" step="0.1" min="0" value={peso} onChange={(e) => setPeso(parseFloat(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Alarme (opcional)</label>
          <input type="date" value={dataAlarme} onChange={(e) => aoMudarAlarme(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          <p className="text-xs text-gray-400 mt-1">Quando chegar essa data, a prova aparece em "Urgentes" na Home.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
          Salvar
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar}
            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
