'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SmartBulkRegistrationSchema, SmartBulkRegistrationInput, RegisteredProductResult } from '@/schemas/jeans-registration-schema';

/**
 * Processa entrada inteligente: Cria produtos ou soma estoque se a referência já existir.
 */
export async function processSmartJeansEntry(input: SmartBulkRegistrationInput): Promise<{ 
  success: boolean; 
  message?: string; 
  results?: RegisteredProductResult[] 
}> {
  
  const validation = SmartBulkRegistrationSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, message: "Dados inválidos." };
  }

  const { storeSlug, items } = validation.data;

  try {
    const results = await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({ where: { slug: storeSlug } });
      if (!store) throw new Error("Loja não encontrada.");

      const processedProducts: RegisteredProductResult[] = [];

      for (const item of items) {
        // 1. Tenta encontrar variação existente pela referência (SKU)
        const existingVariant = await tx.productVariant.findUnique({
          where: { sku: item.reference },
          include: { product: true }
        });

        if (existingVariant) {
          // A. EXISTE: Soma ao estoque (Upsert Logic)
          const updatedVariant = await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: { stock: { increment: item.quantity } },
            include: { product: true }
          });

          // Atualiza estoque total do produto pai
          await tx.product.update({
            where: { id: existingVariant.productId },
            data: { stock: { increment: item.quantity } }
          });

          processedProducts.push({
            id: updatedVariant.product.id,
            name: updatedVariant.product.name,
            reference: updatedVariant.sku || '',
            totalStock: updatedVariant.stock, // Estoque atualizado desta variação
            imageUrl: updatedVariant.product.imageUrl || '',
            price: Number(updatedVariant.product.price),
            variations: [{ size: item.size, color: 'Padrão', qty: updatedVariant.stock }]
          });

        } else {
          // B. NÃO EXISTE: Cria Produto e Variação
          const newProduct = await tx.product.create({
            data: {
              name: item.name,
              price: 0,
              imageUrl: "", // Pode ser atualizado depois via "Registrar Imagens"
              storeId: store.id,
              stock: item.quantity,
              variants: {
                create: {
                  name: `${item.name} - ${item.size}`,
                  sku: item.reference,
                  size: item.size, // Assumindo que temos campo size no schema ou usamos JSON
                  color: "Padrão",
                  stock: item.quantity,
                  price: 0
                }
              }
            },
            include: { variants: true }
          });

          processedProducts.push({
            id: newProduct.id,
            name: newProduct.name,
            reference: item.reference,
            totalStock: item.quantity,
            imageUrl: newProduct.imageUrl || '',
            price: 0,
            variations: [{ size: item.size, color: 'Padrão', qty: item.quantity }]
          });
        }
      }

      return processedProducts;
    });

    revalidatePath('/inventory');
    return { success: true, results };

  } catch (error) {
    console.error("Erro no processamento inteligente:", error);
    return { success: false, message: "Erro ao processar banco de dados." };
  }
}