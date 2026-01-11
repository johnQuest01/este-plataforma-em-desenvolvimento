"use server";

import { prisma } from "@/lib/prisma";
import { DatabaseStatusSchema, DatabaseStatus } from "@/schemas/blocks/database-status-schema";

/**
 * Health Check Action: Valida a conexão com o Neon.
 * Protocolo Zero-Error: Retorno tipado e validado via Zod.
 */
export async function getDatabaseHealthAction(): Promise<DatabaseStatus> {
  const start = Date.now();
 
  try {
    // Ping no banco via QueryRaw para ignorar cache de modelos
    await prisma.$queryRaw`SELECT 1`;
   
    return DatabaseStatusSchema.parse({
      provider: "neon",
      region: process.env.DATABASE_REGION ?? "aws-sa-east-1",
      latencyMs: Date.now() - start,
      isOnline: true
    });
  } catch (error) {
    console.error("Database Health Failure:", error);
    return {
      provider: "neon",
      region: "error",
      latencyMs: 0,
      isOnline: false
    };
  }
}