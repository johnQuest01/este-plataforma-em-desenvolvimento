import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig, PoolConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configuração obrigatória para o Neon funcionar em ambientes Node.js (Serverless)
neonConfig.webSocketConstructor = ws;

const databaseConnectionString = process.env.DATABASE_URL;

if (!databaseConnectionString) {
  throw new Error("❌ ERRO: A variável DATABASE_URL não foi encontrada no ambiente.");
}

// 🛡️ TIPAGEM ESTRITA GLOBAL: Estende o globalThis sem usar "as" ou "any"
declare global {
  // eslint-disable-next-line no-var
  var globalPrismaInstance: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  // 1. Definimos a configuração com tipagem estrita PoolConfig para evitar inferências erradas
  const poolConfiguration: PoolConfig = {
    connectionString: databaseConnectionString,
  };

  // 2. Inicializamos o Pool de conexões do Neon com a configuração tipada
  const connectionPool = new Pool(poolConfiguration);
  
  // 3. Inicializamos o adaptador do Prisma para o Neon
  // Nota: Com o @types/pg instalado, o TypeScript reconhece perfeitamente o connectionPool aqui.
  const neonAdapter = new PrismaNeon(connectionPool);
  
  return new PrismaClient({
    adapter: neonAdapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// 🛡️ Uso seguro com Nullish Coalescing (??) garantindo o padrão Singleton
export const prisma = globalThis.globalPrismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPrismaInstance = prisma;
}