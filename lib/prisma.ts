import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// 1. Configura WebSocket (Vital para Neon Serverless)
neonConfig.webSocketConstructor = ws

// 2. Pega a URL do .env (O Runtime lê o .env, não o prisma.config.ts)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("ERRO CRÍTICO: DATABASE_URL não encontrada no .env")
}

// 3. Cria o Pool Neon
const pool = new Pool({ connectionString })

// 4. Cria o Adaptador (Com o 'hack' de tipagem 'as any')
// Isso corrige o erro: Argument of type 'Pool' is not assignable...
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any)

// 5. Instancia o Prisma
// O segredo: Ao passar 'adapter', o Prisma IGNORA a falta de URL no schema.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma