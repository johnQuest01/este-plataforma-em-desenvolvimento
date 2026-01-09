'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BulkTextSchema, LinkImageSchema, LinkImageInput, BulkTextInput } from '@/schemas/jeans-registration-schema';

// --- HELPER: NORMALIZAÇÃO ESTRITA ---
function normalizeRef(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

// --- HELPER: GET OR CREATE STORE ---
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

// --- ACTION 1: VINCULAR IMAGEM (CORRIGIDO: REMOVIDO REVALIDATEPATH) ---
export async function linkReferenceImageAction(input: LinkImageInput) {
  const result = LinkImageSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Dados inválidos." };

  const { reference, imageUrl, storeSlug } = result.data;
  const normalizedRef = normalizeRef(reference);

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
    
    // REMOVIDO: revalidatePath('/pos'); 
    // MOTIVO: Esta ação é chamada em loop no cliente. O revalidatePath aqui causava 
    // múltiplos reloads desnecessários. O estado local do React já cuida da UI.
    
    return result;
  } catch (error) {
    console.error("Erro img:", error);
    return { success: false, error: "Erro ao salvar imagem." };
  }
}

// --- ACTION 2: PROCESSAMENTO INTELIGENTE (MANTIDO) ---
export async function processBulkJeansAction(input: BulkTextInput) {
  const result = BulkTextSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Texto inválido." };

  const { rawText, storeSlug } = result.data;

  try {
    const processedItems = await prisma.$transaction(async (tx) => {
      const store = await getOrCreateStore(tx, storeSlug);

      // 1. TOKENIZAÇÃO
      const tokens = rawText.split(/[\n,;\t]+/).map(s => s.trim()).filter(s => s !== "");

      const aggregationMap = new Map<string, {
        name: string;
        size: string;
        qty: number;
        ref: string;
      }>();

      let current = {
        nameParts: [] as string[],
        numbers: [] as number[],
        sizeLetter: "",
        ref: ""
      };

      const flushCurrent = () => {
        if (current.nameParts.length === 0 && current.numbers.length === 0 && !current.ref) return;

        let detectedSize = current.sizeLetter;
        let detectedQty = 1;

        if (current.numbers.length === 2) {
          const n1 = current.numbers[0];
          const n2 = current.numbers[1];
          if (detectedSize) {
            detectedQty = n1 + n2;
          } else {
            if ((n1 >= 32 && n1 <= 60) && n2 < 30) { detectedSize = n1.toString(); detectedQty = n2; }
            else if ((n2 >= 32 && n2 <= 60) && n1 < 30) { detectedSize = n2.toString(); detectedQty = n1; }
            else { detectedSize = n1.toString(); detectedQty = n2; }
          }
        } else if (current.numbers.length === 1) {
          if (detectedSize) detectedQty = current.numbers[0];
          else {
            if (current.numbers[0] >= 34 && current.numbers[0] <= 60) {
              detectedSize = current.numbers[0].toString();
              detectedQty = 1;
            } else {
              detectedQty = current.numbers[0];
              detectedSize = "U";
            }
          }
        } else if (current.numbers.length > 2) {
           detectedSize = current.numbers[0].toString();
           detectedQty = current.numbers.slice(1).reduce((a, b) => a + b, 0);
        }

        if (!detectedSize) detectedSize = "U";
        let finalName = current.nameParts.join(" ");
        if (!finalName) finalName = "Produto Sem Nome";

        let finalRef = current.ref;
        if (!finalRef) {
           const nameCode = normalizeRef(finalName).substring(0, 6);
           finalRef = `GEN-${nameCode}`;
        }

        const key = `${finalRef}-${detectedSize}`;
        if (aggregationMap.has(key)) {
          aggregationMap.get(key)!.qty += detectedQty;
        } else {
          aggregationMap.set(key, { name: finalName, size: detectedSize, qty: detectedQty, ref: finalRef });
        }

        current = { nameParts: [], numbers: [], sizeLetter: "", ref: "" };
      };

      for (const token of tokens) {
        const upperToken = token.toUpperCase();
        const cleanRef = normalizeRef(token);
       
        const isRef = (upperToken.startsWith("REF") || (/\d/.test(token) && /[a-zA-Z]/.test(token) && cleanRef.length > 3));
        const isNumber = /^\d+$/.test(token);
        const isSizeLetter = /^(P|M|G|GG|XG|S|L|XL|XXL|U|ÚNICO)$/i.test(token);

        if (isRef) {
          current.ref = cleanRef;
          flushCurrent();
        }
        else if (isNumber) {
          current.numbers.push(parseInt(token));
        }
        else if (isSizeLetter) {
          current.sizeLetter = upperToken;
        }
        else {
          if (current.numbers.length > 0 || current.sizeLetter !== "") {
            flushCurrent();
            current.nameParts.push(token);
          } else {
            current.nameParts.push(token);
          }
        }
      }
      flushCurrent();

      const touchedProductIds = new Set<string>();

      for (const item of aggregationMap.values()) {
        if (item.qty <= 0) continue;

        let product = await tx.product.findFirst({
          where: { storeId: store.id, OR: [{ reference: item.ref }, { tags: { has: item.ref } }] }
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              name: item.name, reference: item.ref, price: 0, imageUrl: "",
              storeId: store.id, tags: [item.ref], isVisible: true
            }
          });
        } else {
          if (product.name.includes("REF:") || item.name !== "Produto Sem Nome") {
             await tx.product.update({ where: { id: product.id }, data: { name: item.name, isVisible: true } });
          }
        }
        touchedProductIds.add(product.id);

        const sku = `${item.ref}-${item.size}`;
        const existingVariant = await tx.productVariant.findUnique({ where: { sku } });

        if (existingVariant) {
          await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: { stock: { increment: item.qty }, name: `${item.name} - ${item.size}` }
          });
        } else {
          await tx.productVariant.create({
            data: {
              name: `${item.name} - ${item.size}`, sku, price: 0, stock: item.qty,
              images: [], productId: product.id
            }
          });
        }
      }

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
        })).sort((a, b) => parseInt(a.size) - parseInt(b.size) || a.size.localeCompare(b.size))
      }));
    });

    // Aqui mantemos o revalidatePath pois é uma ação única de massa
    revalidatePath('/pos');
    return { success: true, results: processedItems };
  } catch (error) {
    console.error("Bulk error:", error);
    return { success: false, error: "Erro no processamento em massa." };
  }
}