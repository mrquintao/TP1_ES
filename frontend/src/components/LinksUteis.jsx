/**
 * LinksUteis — lista os links úteis de um trabalho (material, diretrizes do professor, etc.)
 * Recebe o array `links` (strings com a URL) e mostra cada um como link clicável.
 */
export default function LinksUteis({ links = [] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-3 space-y-1">
      {links.map((link) => (
        <a
          key={link}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-primary hover:underline break-all"
        >
          🔗 {link}
        </a>
      ))}
    </div>
  );
}
