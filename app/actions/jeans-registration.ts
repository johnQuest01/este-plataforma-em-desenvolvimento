'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BulkTextSchema, LinkImageSchema, LinkImageInput, BulkTextInput } from '@/schemas/jeans-registration-schema';

// --- FUNÇÃO AUXILIAR: GET OR CREATE STORE ---
async function getOrCreateStore(tx: any, slug: string) {
  let store = await tx.store.findUnique({ where: { slug } });
  if (!store) {
    let owner = await tx.user.findFirst();
    if (!owner) {
      owner = await tx.user.create({
        data: { email: 'admin@sistema.com', document: '00000000000', name: 'Admin Sistema', role: 'admin' }
      });
    }
    store = await tx.store.create({
      data: { name: 'Maryland Gestão', slug: slug, ownerId: owner.id, nicheType: 'clothing' }
    });
  }
  return store;
}

// --- ACTION 1: VINCULAR IMAGEM ---
export async function linkReferenceImageAction(input: LinkImageInput) {
  const result = LinkImageSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Dados inválidos." };

  const { reference, imageUrl, storeSlug } = result.data;
  const normalizedRef = reference.toUpperCase().trim();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const store = await getOrCreateStore(tx, storeSlug);
      const existing = await tx.product.findFirst({
        where: { storeId: store.id, OR: [{ reference: normalizedRef }, { tags: { has: normalizedRef } }] }
      });

      if (existing) {
        await tx.product.update({
          where: { id: existing.id },
          data: { imageUrl, reference: normalizedRef }
        });
      } else {
        await tx.product.create({
          data: {
            name: `REF: ${normalizedRef}`, reference: normalizedRef, price: 0, imageUrl,
            storeId: store.id, tags: [normalizedRef], isVisible: false
          }
        });
      }
      return { success: true, reference: normalizedRef, hasImage: !!imageUrl };
    });
    revalidatePath('/pos');
    return result;
  } catch (error) {
    console.error("Erro img:", error);
    return { success: false, error: "Erro ao salvar imagem." };
  }
}

// --- ACTION 2: PROCESSAMENTO INTELIGENTE (BULK) ---
export async function processBulkJeansAction(input: BulkTextInput) {
  const result = BulkTextSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Texto inválido." };

  const { rawText, storeSlug } = result.data;

  try {
    const processedItems = await prisma.$transaction(async (tx) => {
      const store = await getOrCreateStore(tx, storeSlug);
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      
      // MAPA DE AGREGAÇÃO: Chave = "REF-TAMANHO"
      const aggregationMap = new Map<string, {
        name: string;
        size: string;
        qty: number;
        ref: string;
      }>();

      for (const line of lines) {
        // Divide por vírgula, ponto e vírgula ou tabulação
        const parts = line.split(/,|;|\t/).map(s => s.trim()).filter(s => s !== "");
        if (parts.length < 2) continue; 

        // --- VARIÁVEIS PARA DETECÇÃO ---
        let detectedRef = "";
        let detectedSize = "";
        let detectedQty = 0;
        
        const numbers: number[] = [];
        const texts: string[] = [];

        // 1. Classifica cada parte da linha
        parts.forEach(p => {
          const upperP = p.toUpperCase();
          // É Referência?
          if (upperP.startsWith("REF") || (/\d/.test(p) && /[a-zA-Z]/.test(p) && p.length > 3)) {
            detectedRef = upperP;
          } 
          // É Número Puro?
          else if (/^\d+$/.test(p)) {
            numbers.push(parseInt(p));
          } 
          // É Tamanho Letra?
          else if (/^(P|M|G|GG|XG|S|L|XL|XXL|U|ÚNICO)$/i.test(p)) {
            detectedSize = upperP;
          }
          // É Texto (Nome)?
          else {
            texts.push(p);
          }
        });

        // 2. Interpreta os Números (Tamanho vs Quantidade)
        if (numbers.length === 2) {
          const n1 = numbers[0];
          const n2 = numbers[1];
          
          if (detectedSize) {
            // Se já tem tamanho letra, soma os números na Qty
            detectedQty = n1 + n2;
          } else {
            // Heurística: Tamanho Jeans (32-60) vs Qty
            // Se n1 parece tamanho e n2 parece qty
            if ((n1 >= 32 && n1 <= 60) && n2 < 30) {
              detectedSize = n1.toString();
              detectedQty = n2;
            } else if ((n2 >= 32 && n2 <= 60) && n1 < 30) {
              detectedSize = n2.toString();
              detectedQty = n1;
            } else {
              // Padrão: 1º Tam, 2º Qty
              detectedSize = n1.toString();
              detectedQty = n2;
            }
          }
        } else if (numbers.length === 1) {
          if (detectedSize) {
            // Tem tamanho letra, numero é Qty
            detectedQty = numbers[0];
          } else {
            // Só tem um número. Se for pequeno (< 30), é Qty e Tam é U.
            // Se for grande (34+), é Tam e Qty é 1.
            if (numbers[0] >= 34 && numbers[0] <= 60) {
              detectedSize = numbers[0].toString();
              detectedQty = 1;
            } else {
              detectedQty = numbers[0];
              detectedSize = "U";
            }
          }
        } else if (numbers.length > 2) {
           // Muitos números: 1º é Tam, resto soma Qty
           detectedSize = numbers[0].toString();
           detectedQty = numbers.slice(1).reduce((a, b) => a + b, 0);
        } else {
          detectedQty = 1;
        }

        // 3. Define Nome e Referência Final
        let detectedName = texts.join(" ").trim();
        if (!detectedName) detectedName = "Produto Sem Nome";
        
        if (!detectedSize) detectedSize = "U";

        // --- LÓGICA DE AGRUPAMENTO POR NOME (CRUCIAL) ---
        // Se não veio REF, tenta achar no banco pelo NOME para agrupar
        if (!detectedRef) {
          const existingProductByName = await tx.product.findFirst({
            where: { 
              storeId: store.id, 
              name: { equals: detectedName, mode: 'insensitive' } 
            }
          });

          if (existingProductByName && existingProductByName.reference) {
            detectedRef = existingProductByName.reference;
          } else {
            // Se não achou, gera uma REF baseada no nome para agrupar as linhas atuais
            // Ex: "Calça Azul" linha 1 e "Calça Azul" linha 2 vão ter a mesma REF gerada
            const nameCode = detectedName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
            detectedRef = `GEN-${nameCode}`;
          }
        }

        // 4. Agrega no Mapa (Memória) antes de salvar
        const uniqueKey = `${detectedRef}-${detectedSize}`;
        
        if (aggregationMap.has(uniqueKey)) {
          const existing = aggregationMap.get(uniqueKey)!;
          existing.qty += detectedQty; // SOMA
        } else {
          aggregationMap.set(uniqueKey, { 
            name: detectedName, 
            size: detectedSize, 
            qty: detectedQty, 
            ref: detectedRef 
          });
        }
      }

      // --- PASSO 5: SALVAR NO BANCO ---
      const touchedProductIds = new Set<string>();

      for (const item of aggregationMap.values()) {
        if (item.qty <= 0) continue;

        // Busca ou Cria Produto Pai
        let product = await tx.product.findFirst({
          where: {
            storeId: store.id,
            OR: [{ reference: item.ref }, { tags: { has: item.ref } }]
          }
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              name: item.name,
              reference: item.ref,
              price: 0,
              imageUrl: "",
              storeId: store.id,
              tags: [item.ref],
              isVisible: true
            }
          });
        } else {
          // Atualiza nome se o atual for genérico ou para garantir consistência
          if (product.name.includes("REF:") || item.name !== "Produto Sem Nome") {
             await tx.product.update({
               where: { id: product.id },
               data: { name: item.name, isVisible: true }
             });
          }
        }
        touchedProductIds.add(product.id);

        // Gerencia Variação (SKU)
        const sku = `${item.ref}-${item.size}`;
        const existingVariant = await tx.productVariant.findUnique({ where: { sku } });

        if (existingVariant) {
          await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              stock: { increment: item.qty }, // Incrementa o valor
              name: `${item.name} - ${item.size}`
            }
          });
        } else {
          await tx.productVariant.create({
            data: {
              name: `${item.name} - ${item.size}`,
              sku,
              price: 0,
              stock: item.qty,
              images: [],
              productId: product.id
            }
          });
        }
      }

      // Retorno: Busca os produtos completos com todas as variações atualizadas
      const finalProducts = await tx.product.findMany({
        where: { id: { in: Array.from(touchedProductIds) } },
        include: { variants: true },
        orderBy: { updatedAt: 'desc' }
      });

      return finalProducts.map(p => ({
        id: p.id,
        name: p.name,
        reference: p.reference || "S/R",
        imageUrl: p.imageUrl || "",
        price: Number(p.price),
        totalQty: p.variants.reduce((acc, v) => acc + v.stock, 0),
        variations: p.variants.map(v => ({
          size: v.sku?.split('-')[1] || "U",
          qty: v.stock,
          color: "Jeans"
        })).sort((a, b) => {
            // Ordena tamanhos numericamente se possível
            const numA = parseInt(a.size);
            const numB = parseInt(b.size);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.size.localeCompare(b.size);
        })
      }));
    });

    revalidatePath('/pos');
    return { success: true, results: processedItems };
  } catch (error) {
    console.error("Bulk error:", error);
    return { success: false, error: "Erro no processamento em massa." };
  }
}