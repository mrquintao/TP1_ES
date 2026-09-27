import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Usado tanto pelo cadastro (src/routes/auth.js) quanto pelo seed (prisma/seed.js),
// pra não duplicar o número de rounds em dois lugares.
export const hashSenha = (senha) => bcrypt.hash(senha, SALT_ROUNDS);
export const compararSenha = (senha, hash) => bcrypt.compare(senha, hash);
