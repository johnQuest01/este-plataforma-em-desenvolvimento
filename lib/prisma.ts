import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ ERRO: DATABASE_URL não encontrada no .env");
}

// 🛡️ TIPAGEM ESTRITA GLOBAL: Estende o globalThis sem usar "as" ou "any"
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: process.env.NODE_ENV === 'development' ?['error', 'warn'] : ['error'],
  });
};

// 🛡️ Uso seguro com Nullish Coalescing (??) em vez de (||)
export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}