'use server';

import { prisma as prismaBase } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import {
  AddToSellerStockSchema,
  UpdateSellerStockSchema,
  GetSellerStockSchema,
  type MarylandCatalogProductDTO,
  type ProductVariantDTO,
  type SellerInventoryItemDTO,
} from '@/schemas/maryland-catalog-schema';

type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string };

// ─── Helper: parseia o campo `name` da variação ───────────────────────────────
// Formato: "NomeProduto|Cor|Tamanho|Tipo"

function parseVariantName(fullName: string) {
  const parts = fullName.split('|');
  return {
    color: (parts[1] ?? 'Padrão').trim(),
    size:  (parts[2] ?? 'Único').trim(),
    type:  (parts[3] ?? '').trim(),
  };
}

function buildVariantLabel(color: string, size: string, type: string): string {
  return [color, size, type].filter(Boolean).join(' · ');
}

// ─── Catálogo Maryland: todos os produtos com suas variações ─────────────────

interface ProductRow {
  id: string; name: string; description: string | null;
  price: string; reference: string | null; category: string | null;
  imageUrl: string | null; stock: number; createdAt: Date;
}
interface VariantRow {
  id: string; name: string; sku: string | null;
  price: string | null; stock: number; productId: string;
}

export async function getMarylandCatalogAction(): Promise<ActionResult<MarylandCatalogProductDTO[]>> {
  try {
    const products = await prismaBase.$queryRaw<ProductRow[]>(Prisma.sql`
      SELECT id, name, description, price::text, reference, category, "imageUrl", stock, "createdAt"
      FROM "Product"
      ORDER BY "createdAt" DESC
    `);

    if (products.length === 0) return { success: true, data: [] };

    const productIds = products.map((p) => p.id);

    const variants = await prismaBase.$queryRaw<VariantRow[]>(Prisma.sql`
      SELECT id, name, sku, price::text, stock, "productId"
      FROM "ProductVariant"
      WHERE "productId" = ANY(${productIds}::text[])
      ORDER BY "productId", name
    `);

    // Agrupa variações por produto
    const variantsByProduct: Record<string, ProductVariantDTO[]> = {};
    for (const v of variants) {
      const { color, size, type } = parseVariantName(v.name);
      const dto: ProductVariantDTO = {
        id:    v.id,
        color,
        size,
        type,
        price: v.price ? parseFloat(v.price) : 0,
        stock: Number(v.stock),
        sku:   v.sku,
        label: buildVariantLabel(color, size, type),
      };
      if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
      variantsByProduct[v.productId].push(dto);
    }

    const dtos: MarylandCatalogProductDTO[] = products.map((p) => {
      const pvs = variantsByProduct[p.id] ?? [];
      const totalStock = pvs.length > 0
        ? pvs.reduce((acc, v) => acc + v.stock, 0)
        : Number(p.stock);
      return {
        id:          p.id,
        name:        p.name,
        description: p.description,
        price:       parseFloat(p.price),
        reference:   p.reference,
        category:    p.category,
        imageUrl:    p.imageUrl,
        totalStock,
        isAvailable: true,
        createdAt:   new Date(p.createdAt).toISOString(),
        variants:    pvs,
      };
    });

    return { success: true, data: dtos };
  } catch (err) {
    console.error('[getMarylandCatalogAction]', err);
    return { success: false, error: 'Erro ao buscar catálogo Maryland.' };
  }
}

// ─── VENDEDOR: Ver estoque pessoal ────────────────────────────────────────────

interface StockRow {
  id: string; quantity: number; productId: string;
  variantId: string; variantName: string; updatedAt: Date;
  p_name: string; p_image_url: string | null;
  p_price: string;
}

export async function getSellerStockAction(
  payload: unknown
): Promise<ActionResult<SellerInventoryItemDTO[]>> {
  const parsed = GetSellerStockSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' };
  try {
    const rows = await prismaBase.$queryRaw<StockRow[]>(Prisma.sql`
      SELECT
        si.id,
        si.quantity,
        si."productId",
        si."variantId",
        si."variantName",
        si."updatedAt",
        p.name           AS p_name,
        p."imageUrl"     AS p_image_url,
        p.price::text    AS p_price
      FROM "SellerInventoryItem" si
      JOIN "Product" p ON p.id = si."productId"
      WHERE si."sellerId" = ${parsed.data.sellerId}
      ORDER BY p.name, si."variantName"
    `);

    const mapped: SellerInventoryItemDTO[] = rows.map((row) => ({
      id:          row.id,
      quantity:    Number(row.quantity),
      productId:   row.productId,
      productName: row.p_name,
      variantId:   row.variantId,
      variantName: row.variantName,
      price:       parseFloat(row.p_price),
      imageUrl:    row.p_image_url,
      updatedAt:   new Date(row.updatedAt).toISOString(),
    }));

    return { success: true, data: mapped };
  } catch (err) {
    console.error('[getSellerStockAction]', err);
    return { success: false, error: 'Erro ao buscar seu estoque.' };
  }
}

// ─── VENDEDOR: Adicionar variações ao estoque pessoal ────────────────────────

export async function addToSellerStockAction(
  payload: unknown
): Promise<ActionResult<{ added: number }>> {
  const parsed = AddToSellerStockSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const { sellerId, items } = parsed.data;
  let added = 0;

  try {
    for (const item of items) {
      const { productId, variantId, variantName, quantity } = item;

      if (variantId !== '') {
        // Variação específica: verifica estoque na tabela ProductVariant
        const [variant] = await prismaBase.$queryRaw<Array<{ stock: number }>>(Prisma.sql`
          SELECT stock FROM "ProductVariant" WHERE id = ${variantId} LIMIT 1
        `);
        if (!variant) continue;
        if (variant.stock < quantity) {
          return { success: false, error: `Estoque insuficiente para a variação "${variantName}". Disponível: ${variant.stock}.` };
        }

        // Upsert no estoque pessoal
        await prismaBase.$executeRaw(Prisma.sql`
          INSERT INTO "SellerInventoryItem"
            (id, "sellerId", "productId", "variantId", "variantName", quantity, "createdAt", "updatedAt")
          VALUES
            (gen_random_uuid(), ${sellerId}, ${productId}, ${variantId}, ${variantName}, ${quantity}, NOW(), NOW())
          ON CONFLICT ("sellerId", "productId", "variantId")
          DO UPDATE SET
            quantity    = "SellerInventoryItem".quantity + ${quantity},
            "updatedAt" = NOW()
        `);

        // Desconta da variação global
        await prismaBase.$executeRaw(Prisma.sql`
          UPDATE "ProductVariant"
          SET stock = stock - ${quantity}
          WHERE id = ${variantId}
        `);
      } else {
        // Sem variação (produto simples): usa estoque do Product
        const [product] = await prismaBase.$queryRaw<Array<{ stock: number }>>(Prisma.sql`
          SELECT stock FROM "Product" WHERE id = ${productId} LIMIT 1
        `);
        if (!product) continue;
        if (product.stock < quantity) {
          return { success: false, error: `Estoque insuficiente. Disponível: ${product.stock}.` };
        }

        await prismaBase.$executeRaw(Prisma.sql`
          INSERT INTO "SellerInventoryItem"
            (id, "sellerId", "productId", "variantId", "variantName", quantity, "createdAt", "updatedAt")
          VALUES
            (gen_random_uuid(), ${sellerId}, ${productId}, '', '', ${quantity}, NOW(), NOW())
          ON CONFLICT ("sellerId", "productId", "variantId")
          DO UPDATE SET
            quantity    = "SellerInventoryItem".quantity + ${quantity},
            "updatedAt" = NOW()
        `);

        await prismaBase.$executeRaw(Prisma.sql`
          UPDATE "Product"
          SET stock = stock - ${quantity}, "updatedAt" = NOW()
          WHERE id = ${productId}
        `);
      }

      added++;
    }

    revalidatePath('/inventory');
    return { success: true, data: { added } };
  } catch (err) {
    console.error('[addToSellerStockAction]', err);
    return { success: false, error: 'Erro ao adicionar ao seu estoque.' };
  }
}

// ─── VENDEDOR: Atualizar quantidade ou remover item do estoque ────────────────

export async function updateSellerStockQuantityAction(
  payload: unknown
): Promise<ActionResult> {
  const parsed = UpdateSellerStockSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' };
  const { sellerId, productId, variantId, quantity } = parsed.data;
  try {
    if (quantity === 0) {
      await prismaBase.$executeRaw(Prisma.sql`
        DELETE FROM "SellerInventoryItem"
        WHERE "sellerId" = ${sellerId}
          AND "productId" = ${productId}
          AND "variantId" = ${variantId}
      `);
    } else {
      await prismaBase.$executeRaw(Prisma.sql`
        UPDATE "SellerInventoryItem"
        SET quantity = ${quantity}, "updatedAt" = NOW()
        WHERE "sellerId" = ${sellerId}
          AND "productId" = ${productId}
          AND "variantId" = ${variantId}
      `);
    }
    revalidatePath('/inventory');
    return { success: true, data: undefined };
  } catch (err) {
    console.error('[updateSellerStockQuantityAction]', err);
    return { success: false, error: 'Erro ao atualizar quantidade.' };
  }
}
