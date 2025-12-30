import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configura WebSocket para ambientes serverless (Evita timeout do Neon)
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!

// 1. Cria o Pool de conexões do Neon
const pool = new Pool({ connectionString })

// 2. Conecta o adaptador do Prisma 7 ao Pool
// A linha abaixo desativa o alerta de 'any' especificamente para esta correção de compatibilidade
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any)

// 3. Inicializa o Prisma Client com o adaptador
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma