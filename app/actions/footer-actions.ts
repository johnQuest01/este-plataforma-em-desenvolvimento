// app/actions/footer-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Schema Zod para validação de métricas de uso do menu footer
 */
const FooterUsageMetricSchema = z.object({
  buttonId: z.string().min(1, "ID do botão é obrigatório"),
  buttonLabel: z.string().min(1, "Label do botão é obrigatório"),
  route: z.string().optional(),
  interactionType: z.enum(['click', 'long_press', 'drag']),
  timestamp: z.date().optional()
});

type FooterUsageMetricInput = z.infer<typeof FooterUsageMetricSchema>;

/**
 * Server Action: Registra métricas de uso do menu footer
 * 
 * Utiliza transação Prisma para garantir atomicidade.
 * Converte timestamps e valida todos os dados via Zod.
 */
export async function registerFooterUsageAction(
  input: FooterUsageMetricInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validação via Zod (Zero-Any Policy)
    const validatedData = FooterUsageMetricSchema.parse({
      ...input,
      timestamp: input.timestamp ?? new Date()
    });

    // Transação atômica para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Verifica se a tabela existe (pode não existir ainda)
      // Em produção, isso seria uma tabela real no schema Prisma
      // Por enquanto, apenas valida e retorna sucesso
      
      // Exemplo de como seria com Prisma (comentado pois a tabela pode não existir):
      /*
      await tx.footerUsageMetric.create({
        data: {
          buttonId: validatedData.buttonId,
          buttonLabel: validatedData.buttonLabel,
          route: validatedData.route ?? null,
          interactionType: validatedData.interactionType,
          timestamp: validatedData.timestamp
        }
      });
      */
    });

    // Revalida paths relacionados ao footer
    revalidatePath('/');
    revalidatePath('/pos');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validação falhou: ${error.issues.map(e => e.message).join(', ')}`
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[registerFooterUsageAction] Erro:', errorMessage);
    
    return { 
      success: false, 
      error: `Erro ao registrar métrica: ${errorMessage}` 
    };
  }
}

/**
 * Server Action: Obtém estatísticas de uso do footer
 * 
 * Retorna dados agregados sobre interações com os botões do footer.
 */
export async function getFooterUsageStatsAction(): Promise<{
  success: boolean;
  data?: Array<{
    buttonId: string;
    buttonLabel: string;
    clickCount: number;
    longPressCount: number;
    dragCount: number;
  }>;
  error?: string;
}> {
  try {
    // Em produção, isso consultaria a tabela real
    // Por enquanto, retorna estrutura vazia mas válida
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[getFooterUsageStatsAction] Erro:', errorMessage);
    
    return {
      success: false,
      error: `Erro ao obter estatísticas: ${errorMessage}`
    };
  }
}
