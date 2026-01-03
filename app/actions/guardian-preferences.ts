// app/actions/guardian-preferences.ts
"use server";

import { prisma } from "@/lib/prisma";
import { UpdateThemeSchema } from "@/schemas/user-preferences-schema";
import { revalidatePath } from "next/cache";

/**
 * Persiste a preferência de tema do Guardian Omnisciente.
 * @param rawInput - Objeto contendo o tema (light/dark/system).
 */
export async function updateGuardianThemeAction(rawInput: unknown) {
  // Validação Zod Strict
  const validationResult = UpdateThemeSchema.safeParse(rawInput);

  if (!validationResult.success) {
    throw new Error(`[GUARDIAN_ACTION_ERROR]: Falha na validação dos dados: ${validationResult.error.message}`);
  }

  const { theme } = validationResult.data;

  try {
    // Transação Obrigatória conforme as diretrizes do Arquiteto
    return await prisma.$transaction(async (transactionClient) => {
      const config = await transactionClient.guardianConfig.upsert({
        where: { 
          key: "UI_THEME" 
        },
        update: { 
          value: theme 
        },
        create: { 
          key: "UI_THEME", 
          value: theme 
        },
      });

      revalidatePath("/");
      
      return { 
        success: true, 
        theme: config.value 
      };
    });
  } catch (error) {
    console.error("[GUARDIAN_TX_ERROR]: Erro ao persistir tema no banco.", error);
    throw new Error("Erro interno ao salvar configurações do sistema.");
  }
}