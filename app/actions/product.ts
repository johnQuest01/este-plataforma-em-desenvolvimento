// app/actions/product.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadImageToCloud } from '@/lib/upload-service';
import { VariationItem } from '@/components/builder/ui/StockVariationsPopup';
import { Prisma } from '@prisma/client';

// --- DEFINIÇÃO DE TIPOS ---

export interface CreateProductInput {
  name: string;
  price: string;
  variations: VariationItem[];
  visibility: string;
  image?: string;
  storeId?: string;
}

// --- HELPER: Formatar Preço para Decimal ---
const parseDecimal = (value: string | number): Prisma.Decimal => {
  if (!value) return new Prisma.Decimal(0);
  if (typeof value === 'number') return new Prisma.Decimal(value);
  let cleanValue = value.replace(/[^\d.,-]/g, '');
  cleanValue = cleanValue.replace(',', '.');
  const numberValue = parseFloat(cleanValue);
  if (isNaN(numberValue)) return new Prisma.Decimal(0);
  return new Prisma.Decimal(numberValue);
};

// --- HELPER: Gerar SKU Único e Robusto ---
const generateSKU = (productName: string, variationName: string): string => {
  const prefix = (productName || 'PROD').substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const varSuffix = (variationName || 'VAR').substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const timestamp = Date.now().toString().slice(-4); // Últimos 4 dígitos do tempo
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${prefix}-${varSuffix}-${timestamp}${random}`;
};

// 1. AÇÃO DE SALVAR PRODUTO
export async function saveProductAction(inputData: CreateProductInput) {
  try {
    console.log("🚀 [Server Action] Iniciando cadastro:", inputData.name);
    
    // 1.1. Resolução da Loja (Auto-Correction)
    let storeId = inputData.storeId;
    
    if (!storeId) {
      const defaultStore = await prisma.store.findFirst({ select: { id: true } });
      
      if (defaultStore) {
        storeId = defaultStore.id;
      } else {
        console.log("⚠️ Nenhuma loja encontrada. Criando loja padrão...");
        const newStore = await prisma.store.create({
          data: {
            name: "Minha Loja Principal",
            slug: "loja-principal-" + Math.random().toString(36).substring(2, 5),
            owner: {
                connectOrCreate: {
                    where: { document: "00000000000" },
                    create: {
                        name: "Admin",
                        email: "admin@loja.com",
                        document: "00000000000",
                        role: "seller"
                    }
                }
             }
          }
        });
        storeId = newStore.id;
      }
    }

    // 1.2. Upload de Imagem (Capa)
    let finalImageUrl: string | null = null;
    if (inputData.image && inputData.image.startsWith('data:image')) {
      finalImageUrl = await uploadImageToCloud(inputData.image, inputData.name);
    } else if (inputData.variations.length > 0) {
      // Tenta pegar da primeira variação se não tiver capa
      const variationWithImage = inputData.variations.find(v => v.images && v.images.length > 0);
      if (variationWithImage && variationWithImage.images[0].startsWith('data:image')) {
        finalImageUrl = await uploadImageToCloud(variationWithImage.images[0], inputData.name);
      }
    }
    if (!finalImageUrl) {
      finalImageUrl = `https://placehold.co/600x800/e2e8f0/ffffff/png?text=${inputData.name.substring(0, 3)}`;
    }

    // 1.3. Cálculo do Estoque Total
    const totalStock = inputData.variations.reduce((acc, curr) => acc + curr.qty, 0);

    // 1.4. Persistência
    const createdProduct = await prisma.product.create({
      data: {
        name: inputData.name,
        price: parseDecimal(inputData.price),
        isVisible: inputData.visibility === 'visible',
        stock: totalStock,
        imageUrl: finalImageUrl,
        tags: [], // Inicializa array vazio para evitar null
        storeId: storeId,
        
        variants: {
          create: await Promise.all(inputData.variations.map(async (variation) => {
             // Se desejar salvar imagens individuais da variação no futuro (Passo 2),
             // você processaria o upload aqui:
             // const variantImages = await Promise.all(variation.images.map(img => uploadImageToCloud(img, variation.name)));

             return {
                name: variation.name || inputData.name,
                stock: variation.qty,
                price: parseDecimal(inputData.price),
                sku: generateSKU(inputData.name, variation.name || 'VAR'),
                // SE VOCÊ RODOU O MIGRATE DO PASSO 2, DESCOMENTE A LINHA ABAIXO:
                // images: variation.images.filter(i => i.startsWith('data:') || i.startsWith('http')),
             };
          }))
        }
      },
      include: {
        variants: true
      }
    });

    console.log(`✅ Produto Persistido com Sucesso! ID: ${createdProduct.id}`);

    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    revalidatePath('/shop');

    return { 
      success: true, 
      product: JSON.parse(JSON.stringify(createdProduct)) 
    };

  } catch (error) {
    console.error("❌ ERRO CRÍTICO no Server Action:", error);
    // Retorna erro detalhado
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido ao salvar produto." 
    };
  }
}

// 2. DEDUZIR ESTOQUE
export async function deductProductStock(productId: string, quantityToDeduct: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: { orderBy: { stock: 'desc' } } }
    });

    if (!product) return false;

    let remainingToDeduct = quantityToDeduct;
    const updates = [];

    for (const variant of product.variants) {
      if (remainingToDeduct <= 0) break;

      let deductionAmount = 0;
      if (variant.stock >= remainingToDeduct) {
        deductionAmount = remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        deductionAmount = variant.stock;
        remainingToDeduct -= variant.stock;
      }

      if (deductionAmount > 0) {
        updates.push(
          prisma.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: deductionAmount } }
          })
        );
      }
    }

    updates.push(
      prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantityToDeduct - remainingToDeduct } }
      })
    );

    await prisma.$transaction(updates);

    if (remainingToDeduct > 0) console.warn(`⚠️ Venda parcial: ${product.name}`);
    
    revalidatePath('/inventory');
    return true;

  } catch (error) {
    console.error("Erro ao deduzir estoque:", error);
    return false;
  }
}

// 3. LISTAR PRODUTOS
export async function getProductsAction() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true }
    });
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// 4. BUSCAR PRODUTO POR ID
export async function getProductByIdAction(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    return null;
  }
}