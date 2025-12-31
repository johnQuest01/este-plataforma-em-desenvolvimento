// app/actions/product-external.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registerProductAndProduction(formData: {
  storeSlug: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  variations: { name: string; qty: number }[];
  notes?: string;
}) {
  try {
    // 1. Encontrar a loja pelo npm
    const store = await prisma.store.findUnique({
      where: { slug: formData.storeSlug }
    });

    if (!store) {
      return { success: false, message: "Loja não encontrada." };
    }

    // 2. Criar o Produto e suas Variações
    const product = await prisma.product.create({
      data: {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        imageUrl: formData.imageUrl,
        storeId: store.id,
        variants: {
          create: formData.variations.map(v => ({
            name: v.name,
            stock: v.qty, // Inicialmente o estoque da variante é o que vai para produção
          }))
        }
      },
      include: {
        variants: true
      }
    });

    // 3. Criar a entrada na Fila de Produção
    const totalQty = formData.variations.reduce((acc, v) => acc + v.qty, 0);
    
    await prisma.productionItem.create({
      data: {
        status: 'PENDING',
        priority: 1,
        notes: formData.notes || `Cadastro via link preview. Total: ${totalQty}`,
        storeId: store.id,
        productId: product.id,
      }
    });

    revalidatePath('/production');
    revalidatePath('/inventory');

    return { 
      success: true, 
      message: "Produto cadastrado e enviado para produção!",
      productId: product.id 
    };

  } catch (error) {
    console.error("Erro no cadastro externo:", error);
    return { success: false, message: "Erro interno ao cadastrar." };
  }
}
