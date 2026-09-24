import { useState } from 'react';
import { parseLinks } from '../utils/links';

/**
 * FormTrabalho — formulário de novo trabalho, extraído de Trabalhos.jsx pra poder
 * ser reaproveitado quando a edição for adicionada (mesmo form, dois usos).
 *
 * Props:
 *  - onSalvar(dados): chamada com os campos preenchidos ao submeter
 */
export default function FormTrabalho({ onSalvar }) {
  const [titulo, setTitulo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  const [membrosInput, setMembrosInput] = useState('');
  const [linksInput, setLinksInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const membros = membrosInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((nome) => ({ nome }));
    const linksUteis = parseLinks(linksInput);

    onSalvar({ titulo, disciplina, prazoEntrega, membros, linksUteis });
    setTitulo(''); setDisciplina(''); setPrazoEntrega(''); setMembrosInput(''); setLinksInput('');
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Links úteis (um por linha)</label>
        <textarea rows={3} value={linksInput} onChange={(e) => setLinksInput(e.target.value)}
          placeholder="Ex: https://drive.google.com/enunciado.pdf"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
      </div>
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
        Salvar
      </button>
    </form>
  );
}
