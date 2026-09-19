import axios from 'axios';

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

export default api;
