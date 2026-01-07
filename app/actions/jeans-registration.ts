'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JeansBatchRegistrationSchema, JeansBatchRegistrationInput } from '@/schemas/jeans-registration-schema';

/**
 * Registra múltiplos produtos jeans e suas variações em uma única transação.
 */
export async function registerJeansBatchAction(rawInput: JeansBatchRegistrationInput) {
  const validation = JeansBatchRegistrationSchema.safeParse(rawInput);

  if (!validation.success) {
    return { 
      success: false, 
      error: `Erro de validação: ${validation.error.errors.map(e => e.message).join(', ')}` 
    };
  }

  const { storeSlug, items } = validation.data;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Busca a loja
      const store = await tx.store.findUnique({
        where: { slug: storeSlug }
      });

      if (!store) throw new Error("Loja não encontrada.");

      // 2. Agrupa por nome/referência para criar produtos (se não existirem)
      // Nota: No seu sistema, cada referência pode ser tratada como um produto único ou variação.
      // Aqui, criaremos um Produto para cada Referência Única para garantir a organização.
      
      for (const item of items) {
        await tx.product.create({
          data: {
            name: item.name,
            price: 0, // Preço inicial zerado para ajuste posterior
            imageUrl: item.imageUrl ?? "",
            storeId: store.id,
            variations: {
              create: {
                name: `${item.name} - ${item.color}`,
                color: item.color,
                qty: item.quantity,
                size: "Único", // Valor padrão conforme stack Lego
              }
            }
          }
        });
      }

      revalidatePath('/inventory');
      revalidatePath('/pos');
      
      return { success: true, count: items.length };
    });
  } catch (error) {
    console.error("Erro no cadastro em lote:", error);
    return { success: false, error: "Falha ao processar o banco de dados." };
  }
}