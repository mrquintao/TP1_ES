// Mesma regra de frontend/src/utils/urgencia.js, adaptada pro backend: aqui as
// datas já chegam como objetos Date do Prisma (não strings de <input type="date">).
//
// O container roda em UTC (confirmado), não no fuso do estudante — então "hoje"
// precisa ser calculado explicitamente em America/Sao_Paulo, senão o dia muda
// cedo ou tarde demais perto da meia-noite (o mesmo tipo de bug de fuso que já
// corrigimos várias vezes no frontend, só que aqui o "fuso do usuário" é fixo).
const FUSO = 'America/Sao_Paulo';

// Meia-noite UTC do dia de hoje em Brasília — mesmo formato que o Prisma grava
// pras datas (new Date("2026-09-25") vira 2026-09-25T00:00:00.000Z)
function hojeComoData() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const valor = (tipo) => Number(partes.find((p) => p.type === tipo).value);
  return new Date(Date.UTC(valor('year'), valor('month') - 1, valor('day')));
}

// Normaliza um DateTime do Prisma pra meia-noite UTC (ignora a hora)
function soData(data) {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}

/**
 * Estado de uma prova/trabalho em relação ao seu alarme — mesma regra do front:
 *  - 'urgente'  → o alarme já ligou e o prazo ainda não passou
 *  - 'atrasado' → o prazo já passou
 *  - null       → não deve notificar (sem alarme, alarme no futuro, ou já concluído)
 */
export function estadoUrgencia({ dataAlarme, dataLimite, concluido = false }) {
  if (concluido || !dataAlarme) return null;

  const hoje = hojeComoData();
  const alarme = soData(dataAlarme);
  const limite = soData(dataLimite);

  if (hoje < alarme) return null;
  return hoje > limite ? 'atrasado' : 'urgente';
}
