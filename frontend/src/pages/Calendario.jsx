import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import GradeCalendario from '../components/GradeCalendario';
import { DetalhesEvento, FiltrosCalendario, NavegacaoMes } from '../components/ControlesCalendario';
import { chaveData, diasDaGrade } from '../utils/calendario';

export default function Calendario() {
  const [mesAtual, setMesAtual] = useState(() => new Date());
  const [eventos, setEventos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [filtros, setFiltros] = useState({ prova: true, trabalho: true, habito: true });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const dias = useMemo(() => diasDaGrade(mesAtual), [mesAtual]);

  useEffect(() => {
    async function buscarEventos() {
      setLoading(true);
      setErro(false);
      try {
        const resposta = await api.get('/calendario', {
          params: { inicio: chaveData(dias[0]), fim: chaveData(dias[dias.length - 1]) },
        });
        setEventos(resposta.data);
      } catch (err) {
        console.error('Erro ao buscar calendário:', err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    buscarEventos();
  }, [dias]);

  const mudarMes = (quantidade) => {
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() + quantidade, 1));
  };

  const alternarFiltro = (tipo) => {
    setFiltros((atuais) => ({ ...atuais, [tipo]: !atuais[tipo] }));
  };

  const eventosVisiveis = eventos.filter((evento) => filtros[evento.tipo]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">🗓️ Calendário</h1>
        <p className="mt-1 text-gray-500">Provas, trabalhos e hábitos em um só lugar.</p>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <NavegacaoMes mesAtual={mesAtual} onMudarMes={mudarMes} />
        <FiltrosCalendario filtros={filtros} onAlternar={alternarFiltro} />
      </div>

      {loading && <p className="py-8 text-center text-gray-500">Carregando calendário...</p>}
      {erro && <p className="rounded-lg bg-red-50 p-4 text-red-700">Não foi possível carregar os compromissos.</p>}
      {!loading && !erro && (
        <GradeCalendario dias={dias} eventos={eventosVisiveis} mesAtual={mesAtual} onSelecionar={setSelecionado} />
      )}

      <DetalhesEvento evento={selecionado} onFechar={() => setSelecionado(null)} />
    </div>
  );
}
