// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// 1. Configuração WebSocket para Neon em ambientes Node.js (Server-side)
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("ERRO CRÍTICO: DATABASE_URL não encontrada no .env")
}

// 2. Singleton para evitar múltiplas instâncias no Next.js (Hot Reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 3. Função para criar o cliente com o adaptador
const createPrismaClient = () => {
  const pool = new Pool({ connectionString })
  
  // CORREÇÃO LINT: Desabilitamos o aviso de 'any' especificamente para este adaptador 
  // pois as tipagens peer-dependency do Neon/Prisma podem divergir
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma