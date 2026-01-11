'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloud } from '@/lib/upload-service';
import { Prisma } from '@prisma/client';
import { parseBrazilianCurrency } from '@/lib/utils/currency';
import { z } from 'zod'; 
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

// ✅ CORREÇÃO: Conversão de Decimal para Number
const mapToUserInterface = (product: Prisma.ProductGetPayload<{ include: { variants: true } }>): ProductData => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    // Alterado de toString() para Number() para facilitar cálculos no front
    price: Number(product.price), 
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
        // Alterado de toString() para Number()
        price: variant.price ? Number(variant.price) : null,
        stock: variant.stock,
        sku: variant.sku,
        images: variant.images,
        color: metadata.color,
        size: metadata.size,
        type: metadata.type,
        qty: variant.stock
      };
    })
  };
};

const generateStockKeepingUnit = (productName: string, variationName: string, index: number): string => {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const varSuffix = variationName.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${varSuffix}-${timestamp}${index}-${random}`;
};

// --- SERVER ACTIONS ---

export async function saveProductAction(inputData: CreateProductInput) {
  try {
    const validatedInput = CreateProductInputSchema.parse(inputData);

    const numericPrice = parseBrazilianCurrency(validatedInput.price);
    const decimalPrice = new Prisma.Decimal(numericPrice);

    let targetStoreId = validatedInput.storeId;

    // --- LÓGICA DE AUTO-CURA (SELF-HEALING) ---
    // Se não houver ID de loja, busca a primeira. Se não existir, CRIA uma.
    if (!targetStoreId) {
      let store = await prisma.store.findFirst();
      
      if (!store) {
        console.log("⚠️ Nenhuma loja encontrada. Iniciando criação automática de Loja Padrão...");
        
        // 1. Garante que existe um usuário dono (Admin)
        let owner = await prisma.user.findFirst();
        if (!owner) {
            owner = await prisma.user.create({
                data: {
                    email: "admin@sistema.com",
                    name: "Admin Sistema",
                    document: "000.000.000-00", 
                }
            });
        }

        // 2. Cria a loja vinculada ao dono
        store = await prisma.store.create({
            data: {
                name: "Minha Loja Principal",
                slug: "loja-principal",
                ownerId: owner.id
            }
        });
        console.log("✅ Loja Padrão criada com sucesso:", store.id);
      }
      
      targetStoreId = store.id;
    }

    let finalImageUrl: string | null = null;
    if (validatedInput.image?.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloud(validatedInput.image, validatedInput.name);
    } else {
      finalImageUrl = validatedInput.image || `https://placehold.co/600x800/png?text=${encodeURIComponent(validatedInput.name)}`;
    }

    const totalStock = validatedInput.variations.reduce((acc, curr) => {
      const quantity = curr.qty ?? curr.stock ?? 0;
      return acc + quantity;
    }, 0);

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
            create: validatedInput.variations.map((variation, index) => {
              const variantStock = variation.qty ?? variation.stock ?? 0;
              
              return {
                name: serializeVariantName(validatedInput.name, variation),
                stock: variantStock,
                price: decimalPrice,
                sku: generateStockKeepingUnit(validatedInput.name, variation.color || 'VAR', index),
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
    
    if (error instanceof z.ZodError) {
        return { success: false, error: error.issues };
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       return { success: false, error: "Erro de duplicidade: SKU ou Nome já existem." };
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