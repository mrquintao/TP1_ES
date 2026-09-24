import { parseDataLocal } from './dates';
import { chaveData } from './calendario';

// Quantos dias antes do prazo o alarme é sugerido, quando o formulário
// ainda não tem uma data de alarme preenchida manualmente.
export const DIAS_ANTES_PADRAO = 3;

// Data (aaaa-mm-dd) sugerida pro campo "Alarme": N dias antes da data-limite.
// dataLimite pode vir de um <input type="date"> ou de um DateTime da API.
export function sugerirAlarme(dataLimite, diasAntes = DIAS_ANTES_PADRAO) {
  if (!dataLimite) return '';
  const data = parseDataLocal(dataLimite);
  data.setDate(data.getDate() - diasAntes);
  return chaveData(data);
}

// Hoje à meia-noite local, pra comparar só o dia do calendário (sem hora)
function hojeLocal() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/**
 * Estado de uma prova/trabalho em relação ao seu alarme, pra seção "Urgentes" da Home.
 *  - 'urgente'  → o alarme já ligou e o prazo ainda não passou
 *  - 'atrasado' → o prazo já passou (continua aparecendo até o item ser editado/concluído/excluído)
 *  - null       → não deve aparecer em Urgentes (sem alarme, alarme no futuro, ou já concluído)
 */
export function estadoUrgencia({ dataAlarme, dataLimite, concluido = false }) {
  if (concluido || !dataAlarme) return null;

  const hoje = hojeLocal();
  const alarme = parseDataLocal(dataAlarme);
  const limite = parseDataLocal(dataLimite);

  if (hoje < alarme) return null;
  return hoje > limite ? 'atrasado' : 'urgente';
}
