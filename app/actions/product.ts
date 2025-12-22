// app/actions/product.ts
'use server';

import { VariationItem } from '@/components/builder/ui/StockVariationsPopup';
import { uploadImageToCloud } from '@/lib/upload-service';

// --- TIPO DO PRODUTO ---
export interface ProductData {
  id: string;
  name: string;
  price: string;
  mainImage: string;
  variations: VariationItem[];
  visibility: string;
  createdAt: number;
}

// --- BANCO DE DADOS EM MEMÓRIA (Global) ---
declare global {
  var __PRODUCTS_DB: ProductData[];
}

if (!global.__PRODUCTS_DB) {
  global.__PRODUCTS_DB = [];
}

// 1. SALVAR PRODUTO
export async function saveProductAction(data: {
  name: string;
  price: string;
  variations: VariationItem[];
  visibility: string;
  image?: string;
}) {
  try {
    console.log("🚀 Iniciando cadastro de produto:", data.name);

    // --- LÓGICA DE UPLOAD ---
    let finalImageUrl = '';

    // Cenário A: Usuário mandou uma foto direta (Capa)
    if (data.image && data.image.startsWith('data:image')) {
      console.log("☁️ Processando capa...");
      finalImageUrl = await uploadImageToCloud(data.image, data.name);
    }
    // Cenário B: Não tem capa direta, mas tem foto na variação
    else if (data.variations.length > 0) {
      const variationWithImage = data.variations.find(v => v.images && v.images.length > 0);
      if (variationWithImage && variationWithImage.images[0].startsWith('data:image')) {
        console.log("☁️ Usando foto da variação como capa...");
        finalImageUrl = await uploadImageToCloud(variationWithImage.images[0], data.name);
      }
    }

    // Fallback se falhar tudo
    if (!finalImageUrl) {
      finalImageUrl = `https://placehold.co/600x800/e2e8f0/ffffff/png?text=${data.name.substring(0,3)}`;
    }

    // --- LIMPEZA E PREPARAÇÃO DAS VARIAÇÕES ---
    const cleanVariations = data.variations.map(v => ({
      ...v,
      images: v.images.map(img => {
        return img || finalImageUrl;
      })
    }));

    const newProduct: ProductData = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      price: data.price,
      mainImage: finalImageUrl,
      variations: cleanVariations,
      visibility: data.visibility,
      createdAt: Date.now(),
    };

    // Adiciona ao topo da lista (unshift)
    global.__PRODUCTS_DB.unshift(newProduct);

    console.log(`✅ Produto Salvo! ID: ${newProduct.id}`);

    return { success: true, product: JSON.parse(JSON.stringify(newProduct)) };
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return { success: false };
  }
}

// --- NOVA FUNÇÃO: DEDUZIR ESTOQUE ---
// Essa função é chamada quando uma venda é finalizada
export async function deductProductStock(productId: string, quantityToDeduct: number) {
  const productIndex = global.__PRODUCTS_DB.findIndex(p => p.id === productId);
  
  if (productIndex === -1) return false;

  const product = global.__PRODUCTS_DB[productIndex];
  
  let remainingToDeduct = quantityToDeduct;

  // Percorre as variações e deduz do estoque disponível
  // (Começa da primeira variação até abater todo o pedido)
  const updatedVariations = product.variations.map(v => {
    if (remainingToDeduct <= 0) return v;

    if (v.qty >= remainingToDeduct) {
      const newQty = v.qty - remainingToDeduct;
      remainingToDeduct = 0;
      return { ...v, qty: newQty };
    } else {
      // Se a variação tem menos que o necessário, zera ela e continua procurando na próxima
      remainingToDeduct -= v.qty;
      return { ...v, qty: 0 };
    }
  });

  if (remainingToDeduct > 0) {
    // Se ainda sobrou algo para deduzir, significa que não tinha estoque suficiente
    console.warn(`⚠️ Venda forçada: Estoque ficou negativo ou zerado incorretamente para ${product.name}`);
  }

  // Atualiza o produto no banco com as novas quantidades
  global.__PRODUCTS_DB[productIndex] = {
    ...product,
    variations: updatedVariations
  };

  return true;
}

// 2. LISTAR PRODUTOS
export async function getProductsAction() {
  return global.__PRODUCTS_DB || [];
}

// 3. BUSCAR PRODUTO POR ID
export async function getProductByIdAction(id: string) {
  const product = global.__PRODUCTS_DB.find(p => p.id === id);
  return product || null;
}