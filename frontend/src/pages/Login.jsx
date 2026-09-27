import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login — tela de entrada. Pública (não exige sessão, ao contrário do resto do app).
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">📚 StudySync</h1>
          <p className="text-gray-500 text-sm mt-1">Entre na sua conta</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <button type="submit" disabled={enviando}
            className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-60">
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-primary font-medium hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
