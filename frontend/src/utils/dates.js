/**
 * Converte um DateTime da API preservando apenas a data de calendário.
 * Evita que meia-noite UTC apareça como o dia anterior em fusos negativos.
 */
export function parseDataLocal(data) {
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}
