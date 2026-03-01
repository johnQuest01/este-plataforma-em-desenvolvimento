'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// 🛡️ Zod Schema para validação estrita da entrada
const OrderSchema = z.object({
  pageSlug: z.string(),
  orderIds: z.array(z.string()),
});

// 🛡️ TYPE GUARD: Validação estrita de Objetos
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export async function updateLayoutOrderAction(pageSlug: string, orderIds: string[]) {
  try {
    // 1. Validação Zod (Zero-Any)
    const parsed = OrderSchema.safeParse({ pageSlug, orderIds });
    if (!parsed.success) {
      return { success: false, error: 'Dados de ordem inválidos.' };
    }

    // 2. Transação Prisma para garantir integridade (Zero Error Policy)
    await prisma.$transaction(async (tx) => {
      const uiConfig = await tx.uIConfig.findUnique({
        where: { pageSlug: parsed.data.pageSlug }
      });
      
      if (!uiConfig || !uiConfig.layout) {
        throw new Error('Configuração de UI não encontrada no banco de dados.');
      }

      const currentLayout = uiConfig.layout;
      
      if (!Array.isArray(currentLayout)) {
        throw new Error('Formato de layout inválido no banco de dados.');
      }

      // 3. Reordena os blocos baseados na nova ordem de IDs recebida do frontend
      const newLayout = [...currentLayout].sort((a, b) => {
        const idA = isRecord(a) && typeof a.id === 'string' ? a.id : '';
        const idB = isRecord(b) && typeof b.id === 'string' ? b.id : '';
        
        const indexA = parsed.data.orderIds.indexOf(idA);
        const indexB = parsed.data.orderIds.indexOf(idB);
        
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      // 4. Atualiza o banco com a nova ordem
      await tx.uIConfig.update({
        where: { pageSlug: parsed.data.pageSlug },
        data: { layout: newLayout },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('❌ [Server Action] Erro ao salvar ordem:', error);
    return { success: false, error: 'Falha ao salvar no banco de dados.' };
  }
}