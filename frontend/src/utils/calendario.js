export const TIPOS_EVENTO = {
  prova: {
    label: 'Provas',
    cor: 'bg-rose-100 text-rose-800 border-rose-200',
    marcador: 'bg-rose-500',
  },
  trabalho: {
    label: 'Trabalhos',
    cor: 'bg-amber-100 text-amber-800 border-amber-200',
    marcador: 'bg-amber-500',
  },
  habito: {
    label: 'Hábitos',
    cor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    marcador: 'bg-emerald-500',
  },
};

export function chaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function diasDaGrade(mesAtual) {
  const primeiro = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const inicio = new Date(primeiro);
  inicio.setDate(1 - primeiro.getDay());
  return Array.from({ length: 42 }, (_, indice) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + indice);
    return dia;
  });
}

// Os 7 dias (domingo a sábado) da semana que contém `data`
export function diasDaSemana(data) {
  const domingo = new Date(data);
  domingo.setDate(data.getDate() - data.getDay());
  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(domingo);
    dia.setDate(domingo.getDate() + indice);
    return dia;
  });
}

// Título da visão de semana, ex.: "21 – 27 de set. de 2026" ou,
// quando a semana cruza o mês, "28 de set. – 4 de out. de 2026"
export function tituloSemana(dias) {
  const [inicio, fim] = [dias[0], dias[6]];
  const mesmoMes = inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear();
  const tituloInicio = inicio.toLocaleDateString('pt-BR', mesmoMes ? { day: 'numeric' } : { day: 'numeric', month: 'short' });
  const tituloFim = fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${tituloInicio} – ${tituloFim}`;
}
