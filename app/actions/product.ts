'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloud } from '@/lib/upload-service';
import { Prisma } from '@prisma/client';
import { parseBrazilianCurrency } from '@/lib/utils/currency';
import { 
  CreateProductInput, 
  ProductData, 
  CreateProductInputSchema 
} from './product.schema';

export type { ProductData, ProductVariantData, CreateProductInput } from './product.schema';

// --- HELPERS INTERNOS ---

const serializeVariantName = (baseName: string, variation: { color?: string; size?: string; type?: string }): string => {
  return `${baseName}|${variation.color || 'Padrão'}|${variation.size || 'Único'}|${variation.type || ''}`;
};

const parseVariantMetadata = (fullName: string) => {
  const parts = fullName.split('|');
  if (parts.length >= 3) {
    return {
      baseName: parts[0],
      color: parts[1],
      size: parts[2],
      type: parts[3] || undefined
    };
  }
  return { baseName: fullName, color: 'Padrão', size: 'Único', type: undefined };
};

const mapToUserInterface = (product: Prisma.ProductGetPayload<{ include: { variants: true } }>): ProductData => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price.toString(), 
    imageUrl: product.imageUrl,
    isVisible: product.isVisible,
    stock: product.stock,
    storeId: product.storeId,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant) => {
      const metadata = parseVariantMetadata(variant.name);
      return {
        id: variant.id,
        name: metadata.baseName,
        price: variant.price ? variant.price.toString() : null,
        stock: variant.stock,
        sku: variant.sku,
        images: variant.images,
        color: metadata.color,
        size: metadata.size,
        type: metadata.type,
        qty: variant.stock // Mapeia stock do banco para qty da UI
      };
    })
  };
};

const generateStockKeepingUnit = (productName: string, variationName: string): string => {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${variationName.substring(0, 2).toUpperCase()}-${timestamp}`;
};

// --- SERVER ACTIONS ---

export async function saveProductAction(inputData: CreateProductInput) {
  try {
    // 1. Validação Zod (Agora aceita qty e stock com defaults)
    const validatedInput = CreateProductInputSchema.parse(inputData);

    // 2. Conversão de Preço
    const numericPrice = parseBrazilianCurrency(validatedInput.price);
    const decimalPrice = new Prisma.Decimal(numericPrice);

    // 3. Resolução de Loja
    let targetStoreId = validatedInput.storeId;
    if (!targetStoreId) {
      const store = await prisma.store.findFirst();
      if (!store) throw new Error("Nenhuma loja encontrada.");
      targetStoreId = store.id;
    }

    // 4. Upload de Imagem
    let finalImageUrl: string | null = null;
    if (validatedInput.image?.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloud(validatedInput.image, validatedInput.name);
    } else {
      finalImageUrl = validatedInput.image || `https://placehold.co/600x800/png?text=${encodeURIComponent(validatedInput.name)}`;
    }

    // 5. Cálculo de Estoque Total (Prioriza qty, fallback para stock)
    const totalStock = validatedInput.variations.reduce((acc, curr) => {
      const quantity = curr.qty ?? curr.stock ?? 0;
      return acc + quantity;
    }, 0);

    // 6. Transação de Persistência
    const createdProduct = await prisma.$transaction(async (transaction) => {
      return await transaction.product.create({
        data: {
          name: validatedInput.name,
          price: decimalPrice,
          isVisible: validatedInput.visibility === 'visible',
          stock: totalStock,
          imageUrl: finalImageUrl,
          storeId: targetStoreId as string,
          variants: {
            create: validatedInput.variations.map((variation) => {
              // Lógica de unificação de quantidade
              const variantStock = variation.qty ?? variation.stock ?? 0;
              
              return {
                name: serializeVariantName(validatedInput.name, variation),
                stock: variantStock, // Grava no banco como 'stock'
                price: decimalPrice,
                sku: generateStockKeepingUnit(validatedInput.name, variation.color || 'VAR'),
                images: variation.images
              };
            })
          }
        },
        include: { variants: true }
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');

    return { 
      success: true, 
      product: mapToUserInterface(createdProduct) 
    };

  } catch (error) {
    console.error("❌ Erro ao salvar produto:", error);
    // Retorna o erro formatado se for do Zod, ou mensagem genérica
    if (error instanceof z.ZodError) {
        return { success: false, error: error.errors };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro interno no servidor." 
    };
  }
}

export async function getProductsAction(): Promise<ProductData[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true }
    });
    return products.map(mapToUserInterface);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getProductByIdAction(id: string): Promise<ProductData | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });
    return product ? mapToUserInterface(product) : null;
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    return null;
  }
}