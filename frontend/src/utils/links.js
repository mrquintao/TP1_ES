/**
 * Garante que o link comece com http:// ou https://.
 * Sem isso, "google.com" viraria um link relativo (quebrado) e textos como
 * "javascript:..." poderiam ser executados ao clicar. Ex.: "google.com" → "https://google.com"
 */
export function normalizarLink(texto) {
  const link = texto.trim();
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

/**
 * Converte o texto de um textarea (um link por linha) em um array de links
 * normalizados, sem linhas vazias e sem repetidos.
 */
export function parseLinks(texto) {
  const links = texto
    .split('\n')
    .filter((linha) => linha.trim())
    .map(normalizarLink);
  return [...new Set(links)];
}
