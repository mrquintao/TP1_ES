import { useState } from 'react';
import { parseLinks } from '../utils/links';
import { sugerirAlarme } from '../utils/urgencia';

/**
 * FormTrabalho — formulário de criar ou editar um trabalho.
 *
 * Na edição só título, disciplina, prazo e alarme ficam editáveis: membros são
 * definidos só na criação, e os links já têm seu próprio fluxo de adicionar/remover
 * direto no card (componente LinksUteis) — não faz sentido duplicar esses dois aqui.
 *
 * Props:
 *  - inicial: trabalho a editar, ou undefined para criar um novo
 *  - onSalvar(dados): chamada com os campos preenchidos ao submeter
 *  - onCancelar: opcional — mostra "Cancelar" (usado na edição)
 */
export default function FormTrabalho({ inicial, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [disciplina, setDisciplina] = useState(inicial?.disciplina ?? '');
  const [prazoEntrega, setPrazoEntrega] = useState(inicial?.prazoEntrega?.slice(0, 10) ?? '');
  const [dataAlarme, setDataAlarme] = useState(inicial?.dataAlarme?.slice(0, 10) ?? '');
  // Mesma lógica de sugestão automática do FormProva: acompanha o prazo até ser mexido à mão.
  const [alarmeManual, setAlarmeManual] = useState(!!inicial?.dataAlarme);
  const [membrosInput, setMembrosInput] = useState('');
  const [linksInput, setLinksInput] = useState('');

  const aoMudarPrazo = (valor) => {
    setPrazoEntrega(valor);
    if (!alarmeManual) setDataAlarme(sugerirAlarme(valor));
  };

  const aoMudarAlarme = (valor) => {
    setDataAlarme(valor);
    setAlarmeManual(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { titulo, disciplina, prazoEntrega, dataAlarme: dataAlarme || null };

    if (!inicial) {
      dados.membros = membrosInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((nome) => ({ nome }));
      dados.linksUteis = parseLinks(linksInput);
    }

    onSalvar(dados);
    if (!inicial) {
      setTitulo(''); setDisciplina(''); setPrazoEntrega(''); setDataAlarme(''); setAlarmeManual(false);
      setMembrosInput(''); setLinksInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega *</label>
          <input type="date" required value={prazoEntrega} onChange={(e) => aoMudarPrazo(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
        <input type="text" value={disciplina} onChange={(e) => setDisciplina(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
      </div>
      {!inicial && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membros (separar por vírgula)</label>
            <input type="text" value={membrosInput} onChange={(e) => setMembrosInput(e.target.value)}
              placeholder="Ex: Guilherme, Mateus, Lucas"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Links úteis (um por linha)</label>
            <textarea rows={3} value={linksInput} onChange={(e) => setLinksInput(e.target.value)}
              placeholder="Ex: https://drive.google.com/enunciado.pdf"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alarme (opcional)</label>
        <input type="date" value={dataAlarme} onChange={(e) => aoMudarAlarme(e.target.value)}
          className="w-full max-w-xs border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
        <p className="text-xs text-gray-400 mt-1">Quando chegar essa data, o trabalho aparece em "Urgentes" na Home.</p>
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
