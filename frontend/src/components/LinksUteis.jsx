import { useState } from 'react';
import { normalizarLink } from '../utils/links';

/**
 * LinksUteis — links úteis de um trabalho (material, diretrizes do professor, etc.)
 *
 * Props:
 *  - links: array de strings com as URLs
 *  - onChange(novosLinks): chamada ao adicionar/remover um link. Quem usa o
 *    componente é responsável por salvar. Se não for passada, só exibe os links.
 */
export default function LinksUteis({ links = [], onChange }) {
  const [novoLink, setNovoLink] = useState('');

  const adicionar = (e) => {
    e.preventDefault();
    if (!novoLink.trim()) return;
    const link = normalizarLink(novoLink);
    if (!links.includes(link)) onChange([...links, link]); // ignora repetidos
    setNovoLink('');
  };

  const remover = (link) => onChange(links.filter((l) => l !== link));

  if (links.length === 0 && !onChange) return null;

  return (
    <div className="mt-3 space-y-1">
      {links.map((link) => (
        <div key={link} className="flex items-start gap-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            🔗 {link}
          </a>
          {onChange && (
            <button
              onClick={() => remover(link)}
              title="Remover link"
              className="text-red-400 hover:text-red-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {onChange && (
        <form onSubmit={adicionar} className="flex gap-2 pt-1">
          <input
            type="text"
            value={novoLink}
            onChange={(e) => setNovoLink(e.target.value)}
            placeholder="Adicionar link..."
            className="flex-1 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <button type="submit" className="bg-primary/10 text-primary px-3 py-1 rounded text-sm hover:bg-primary/20">
            + Link
          </button>
        </form>
      )}
    </div>
  );
}
