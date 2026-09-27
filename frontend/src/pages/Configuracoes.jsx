import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Configuracoes — liga/desliga as notificações por e-mail do estudante logado.
 */
export default function Configuracoes() {
  const { usuario, atualizarPreferencias } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const alternar = async (campo) => {
    setErro(null);
    setSalvando(true);
    try {
      await atualizarPreferencias({ [campo]: !usuario[campo] });
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">⚙️ Configurações</h1>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">⚠️ {erro}</div>
      )}

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">📧 Notificações por e-mail</h2>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-medium text-gray-800">Lembrete diário</p>
            <p className="text-sm text-gray-500">Todo dia às 8h, um resumo dos prazos dos próximos 3 dias.</p>
          </div>
          <input
            type="checkbox"
            checked={usuario.notificarDiario}
            disabled={salvando}
            onChange={() => alternar('notificarDiario')}
            className="w-5 h-5 rounded text-primary"
          />
        </label>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-medium text-gray-800">Avisar quando algo ficar urgente</p>
            <p className="text-sm text-gray-500">Um e-mail dizendo qual prova ou trabalho acabou de entrar em "Urgentes".</p>
          </div>
          <input
            type="checkbox"
            checked={usuario.notificarUrgente}
            disabled={salvando}
            onChange={() => alternar('notificarUrgente')}
            className="w-5 h-5 rounded text-primary"
          />
        </label>
      </section>
    </div>
  );
}
