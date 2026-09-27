import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { obterToken, salvarToken, limparToken } from '../utils/authToken';

const AuthContext = createContext(null);

/**
 * AuthProvider — guarda quem está logado e expõe login/cadastro/logout
 * pro resto do app via useAuth(). Envolve tudo em App.jsx.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true enquanto tenta restaurar a sessão a partir do token salvo (evita um
  // "pisca" de tela de login antes de saber se já tem sessão válida)
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      if (!obterToken()) {
        setCarregando(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUsuario(res.data.usuario);
      } catch {
        // Token expirado/inválido — o interceptor de api.js já limpa e redireciona
        limparToken();
      } finally {
        setCarregando(false);
      }
    }
    restaurarSessao();
  }, []);

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha });
    salvarToken(res.data.token);
    setUsuario(res.data.usuario);
  };

  const cadastrar = async (nome, email, senha) => {
    const res = await api.post('/auth/cadastro', { nome, email, senha });
    salvarToken(res.data.token);
    setUsuario(res.data.usuario);
  };

  const logout = () => {
    limparToken();
    setUsuario(null);
  };

  // Liga/desliga as notificações por e-mail do estudante logado
  const atualizarPreferencias = async (preferencias) => {
    const res = await api.put('/auth/preferencias', preferencias);
    setUsuario(res.data.usuario);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, cadastrar, logout, atualizarPreferencias }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acesso ao contexto de autenticação — usar dentro de <AuthProvider>
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }
  return contexto;
}
