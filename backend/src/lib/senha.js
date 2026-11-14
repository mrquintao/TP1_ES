import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Usado tanto pelo cadastro (src/routes/auth.js) quanto pelo seed (prisma/seed.js),
// pra não duplicar o número de rounds em dois lugares.
export const hashSenha = (senha) => bcrypt.hash(senha, SALT_ROUNDS);
export const compararSenha = (senha, hash) => bcrypt.compare(senha, hash);

// Hash de uma senha qualquer, só pra gastar o mesmo tempo de bcrypt quando o
// e-mail do login não existe — assim o tempo de resposta não revela quais
// e-mails têm conta.
const HASH_FALSO = bcrypt.hashSync('senha-que-ninguem-usa', SALT_ROUNDS);
export const compararSenhaFalsa = (senha) => bcrypt.compare(senha, HASH_FALSO);
