// app/actions/jeans-registration.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  BulkTextSchema, 
  LinkImageSchema, 
  LinkImageInput, 
  BulkTextInput, 
  decimalToNumber 
} from '@/schemas/jeans-registration-schema';
import { Prisma } from '@prisma/client';

export async function linkReferenceImageAction(input: LinkImageInput) {
  const result = LinkImageSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Dados inválidos." };

  const { reference, imageUrl, storeSlug } = result.data;
  const normalizedReference = reference.toUpperCase().trim();

  try {
    return await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({ where: { slug: storeSlug } });
      if (!store) throw new Error("Loja não encontrada");

      const existingProduct = await tx.product.findFirst({
        where: {
          storeId: store.id,
          OR: [{ reference: normalizedReference }, { tags: { has: normalizedReference } }]
        }
      });

      if (existingProduct) {
        await tx.product.update({
          where: { id: existingProduct.id },
          data: { imageUrl, reference: normalizedReference }
        });
      } else {
        await tx.product.create({
          data: {
            name: `REF: ${normalizedReference}`,
            reference: normalizedReference,
            price: new Prisma.Decimal(0),
            imageUrl,
            storeId: store.id,
            tags: [normalizedReference],
            isVisible: false
          }
        });
      }

      revalidatePath('/pos');
      return { success: true, reference: normalizedReference, hasImage: !!imageUrl };
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao salvar imagem." };
  }
}

export async function processBulkJeansAction(input: BulkTextInput) {
  const result = BulkTextSchema.safeParse(input);
  if (!result.success) return { success: false, error: "Texto inválido." };

  const { rawText, storeSlug } = result.data;

  try {
    const processedItems = await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({ where: { slug: storeSlug } });
      if (!store) throw new Error("Loja não encontrada");

      const lines = rawText.split('\n');
      const touchedProductIds = new Set<string>();

      for (const line of lines) {
        // Parser NLP: "Nome, Tamanho, Qtd, Ref"
        const parts = line.split(/,|;/).map(s => s.trim());
        if (parts.length < 4) continue;

        const productName = parts[0];
        const productSize = parts[1];
        const quantity = parseInt(parts[2]) || 0;
        const reference = parts[3].toUpperCase();

        if (quantity === 0) continue;

        let product = await tx.product.findFirst({
          where: {
            storeId: store.id,
            OR: [{ reference: reference }, { tags: { has: reference } }]
          }
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              name: productName,
              reference,
              price: new Prisma.Decimal(0),
              imageUrl: "",
              storeId: store.id,
              tags: [reference],
              isVisible: true
            }
          });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { name: productName, reference, isVisible: true }
          });
        }
        
        touchedProductIds.add(product.id);

        const sku = `${reference}-${productSize}`;
        const existingVariant = await tx.productVariant.findUnique({ where: { sku } });

        if (existingVariant) {
          await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              stock: { increment: quantity },
              name: `${productName} - ${productSize}`
            }
          });
        } else {
          await tx.productVariant.create({
            data: {
              name: `${productName} - ${productSize}`,
              sku,
              price: new Prisma.Decimal(0),
              stock: quantity,
              images: [],
              productId: product.id
            }
          });
        }
      }

      const finalProducts = await tx.product.findMany({
        where: { id: { in: Array.from(touchedProductIds) } },
        include: { variants: true }
      });

      return finalProducts.map(p => ({
        id: p.id,
        name: p.name,
        reference: p.reference || "S/R",
        imageUrl: p.imageUrl || "",
        price: decimalToNumber(p.price),
        totalQty: p.variants.reduce((acc, v) => acc + v.stock, 0),
        variations: p.variants.map(v => ({
          size: v.sku?.split('-')[1] || "U",
          qty: v.stock,
          color: "Jeans"
        }))
      }));
    });

    revalidatePath('/pos');
    return { success: true, results: processedItems };
  } catch (error) {
    console.error("Bulk error:", error);
    return { success: false, error: "Erro no processamento em massa." };
  }
}