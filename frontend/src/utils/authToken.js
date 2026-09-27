// Onde o token de login fica guardado no navegador (localStorage — decisão
// do Lucas: mais simples de o grupo inteiro entender/depurar que um cookie).
const CHAVE_TOKEN = 'studysync_token';

export const obterToken = () => localStorage.getItem(CHAVE_TOKEN);
export const salvarToken = (token) => localStorage.setItem(CHAVE_TOKEN, token);
export const limparToken = () => localStorage.removeItem(CHAVE_TOKEN);
