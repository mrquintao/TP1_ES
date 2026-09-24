import { PrismaClient } from '@prisma/client';

// Instância única do PrismaClient para todo o backend.
// Evita múltiplas conexões com o banco de dados.
const prisma = new PrismaClient();

export default prisma;
