import { chaveData, TIPOS_EVENTO } from '../utils/calendario';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// mesReferencia: mês usado para esmaecer dias "fora do mês" (visão de mês).
// null na visão de semana, onde os 7 dias fazem parte do período — nenhum fica esmaecido.
export default function GradeCalendario({ dias, eventos, mesReferencia, onSelecionar }) {
  const eventosPorData = eventos.reduce((grupos, evento) => {
    (grupos[evento.data] ||= []).push(evento);
    return grupos;
  }, {});

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid min-w-[700px] grid-cols-7">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="border-b bg-gray-50 py-3 text-center text-sm font-semibold text-gray-600">
            {dia}
          </div>
        ))}

        {dias.map((dia) => {
          const data = chaveData(dia);
          const foraDoMes = mesReferencia != null && dia.getMonth() !== mesReferencia.getMonth();
          const eventosDoDia = eventosPorData[data] || [];

          return (
            <div
              key={data}
              className={`min-h-28 border-b border-r p-2 ${foraDoMes ? 'bg-gray-50 text-gray-400' : ''}`}
            >
              <span className="text-sm font-medium">{dia.getDate()}</span>
              <div className="mt-1 space-y-1">
                {eventosDoDia.map((evento) => (
                  <button
                    key={`${evento.tipo}-${evento.id}-${evento.data}`}
                    type="button"
                    onClick={() => onSelecionar(evento)}
                    className={`block w-full truncate rounded border px-2 py-1 text-left text-xs font-medium hover:brightness-95 ${TIPOS_EVENTO[evento.tipo].cor}`}
                    title={evento.titulo}
                  >
                    {evento.titulo}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
