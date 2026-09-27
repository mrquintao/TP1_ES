import axios from 'axios';
import { obterToken, limparToken } from '../utils/authToken';

/**
 * Instância do Axios configurada para o backend do StudySync
 * Todas as chamadas à API passam por aqui
 *
 * Em produção, ajustar VITE_API_URL via variável de ambiente
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anexa o token de login em toda requisição, quando houver um salvo
api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Um 401 significa sessão ausente/inválida/expirada: limpa o token e manda pro login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      limparToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
