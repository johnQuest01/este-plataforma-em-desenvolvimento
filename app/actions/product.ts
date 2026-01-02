'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloud } from '@/lib/upload-service';
import { VariationItem } from '@/components/builder/ui/StockVariationsPopup';
import { Prisma } from '@prisma/client';

// --- TIPOS ---

// Tipo base do Prisma para variante (sem campos virtuais)
type PrismaVariant = Prisma.ProductVariantGetPayload<true>;

// Tipo estendido para a UI (com campos virtuais)
export type ProductVariantData = Omit<PrismaVariant, 'price'> & {
  price: string | null;
  color?: string;
  size?: string;
  type?: string;
};

// Tipo final do Produto para a UI
export type ProductData = Omit<
  Prisma.ProductGetPayload<{ include: { variants: true } }>,
  'createdAt' | 'updatedAt' | 'price' | 'variants'
> & {
  createdAt: string;
  updatedAt: string;
  price: string;
  variants: ProductVariantData[];
};

export interface CreateProductInput {
  name: string;
  price: string;
  variations: VariationItem[];
  visibility: string;
  image?: string;
  storeId?: string;
}

// --- HELPERS ---
const parseDecimal = (value: string | number): Prisma.Decimal => {
  if (!value) return new Prisma.Decimal(0);
  if (typeof value === 'number') return new Prisma.Decimal(value);
  let cleanValue = value.replace(/[^\d.,-]/g, '');
  cleanValue = cleanValue.replace(',', '.');
  const numberValue = parseFloat(cleanValue);
  if (isNaN(numberValue)) return new Prisma.Decimal(0);
  return new Prisma.Decimal(numberValue);
};

const generateSKU = (productName: string, variationName: string): string => {
  const prefix = (productName || 'PROD').substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const varSuffix = (variationName || 'VAR').substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${prefix}-${varSuffix}-${timestamp}${random}`;
};

// Codifica atributos no nome: "Nome|Cor|Tamanho|Tipo"
const serializeVariantName = (baseName: string, v: VariationItem) => {
  return `${baseName}|${v.color}|${v.size}|${v.type || ''}`;
};

// Decodifica atributos do nome
const parseVariantName = (fullName: string) => {
  const parts = fullName.split('|');
  if (parts.length >= 3) {
    return {
      name: parts[0],
      color: parts[1],
      size: parts[2],
      type: parts[3] || undefined
    };
  }
  return { name: fullName, color: 'Padrão', size: 'Único' };
};

// --- AÇÕES ---

export async function saveProductAction(inputData: CreateProductInput) {
  try {
    console.log("🚀 [Server Action] Iniciando cadastro:", inputData.name);
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não configurada no servidor.");
    }

    let storeId = inputData.storeId;
    if (!storeId) {
      const defaultStore = await prisma.store.findFirst({ select: { id: true } });
      if (defaultStore) {
        storeId = defaultStore.id;
      } else {
        const newStore = await prisma.store.create({
          data: {
            name: "Loja Principal",
            slug: "loja-" + Date.now(),
            owner: {
                connectOrCreate: {
                    where: { document: "00000000000" },
                    create: { name: "Admin", document: "00000000000", role: "seller" }
                }
             }
          }
        });
        storeId = newStore.id;
      }
    }

    let finalImageUrl: string | null = null;
    if (inputData.image && inputData.image.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloud(inputData.image, inputData.name);
    } else if (inputData.variations.length > 0) {
      const vImg = inputData.variations.find(v => v.images && v.images.length > 0);
      if (vImg && vImg.images[0].startsWith('data:image')) {
        finalImageUrl = await uploadImageToCloud(vImg.images[0], inputData.name);
      }
    }
    if (!finalImageUrl) finalImageUrl = `https://placehold.co/600x800/png?text=${inputData.name.substring(0,3)}`;

    const totalStock = inputData.variations.reduce((acc, curr) => acc + curr.qty, 0);

    const createdProduct = await prisma.product.create({
      data: {
        name: inputData.name,
        price: parseDecimal(inputData.price),
        isVisible: inputData.visibility === 'visible',
        stock: totalStock,
        imageUrl: finalImageUrl,
        tags: [],
        storeId: storeId,
        variants: {
          create: inputData.variations.map((variation) => ({
            name: serializeVariantName(inputData.name, variation),
            stock: variation.qty,
            price: parseDecimal(inputData.price),
            sku: generateSKU(inputData.name, variation.name || 'VAR'),
            images: variation.images
          }))
        }
      },
      include: { variants: true }
    });

    revalidatePath('/dashboard');
    revalidatePath('/inventory');

    // CORREÇÃO 1: Cast explícito para ProductData no retorno do save
    // Precisamos mapear de volta para o formato UI para evitar erro de tipo
    const productForUI: ProductData = {
      ...createdProduct,
      createdAt: createdProduct.createdAt.toISOString(),
      updatedAt: createdProduct.updatedAt.toISOString(),
      price: createdProduct.price.toString(),
      variants: createdProduct.variants.map(v => {
        const meta = parseVariantName(v.name);
        return {
          ...v,
          price: v.price?.toString() || null,
          name: meta.name,
          color: meta.color,
          size: meta.size,
          type: meta.type
        };
      })
    };

    return { success: true, product: productForUI };

  } catch (error) {
    console.error("❌ ERRO CRÍTICO:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao salvar." 
    };
  }
}

export async function getProductsAction(): Promise<ProductData[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true }
    });
    
    // CORREÇÃO 2: Mapeamento seguro com tipagem explícita
    return products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      price: p.price.toString(),
      variants: p.variants.map(v => {
        const meta = parseVariantName(v.name);
        return {
          ...v,
          price: v.price?.toString() || null,
          name: meta.name,
          color: meta.color,
          size: meta.size,
          type: meta.type
        };
      })
    }));
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
    
    if (!product) return null;

    return {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      price: product.price.toString(),
      variants: product.variants.map(v => {
        const meta = parseVariantName(v.name);
        return {
          ...v,
          price: v.price?.toString() || null,
          name: meta.name,
          color: meta.color,
          size: meta.size,
          type: meta.type
        };
      })
    };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}