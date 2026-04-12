'use server';

import { prisma as prismaBase } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerAppUrl } from '@/lib/get-app-url';


type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string };

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SellerPublicProfileDTO {
  id:                string;
  name:              string;
  sellerSlug:        string;
  profilePictureUrl: string | null;
  storeUrl:          string;        // URL completa
}

export interface PublicProductDTO {
  id:          string;
  productId:   string;
  productName: string;
  variantId:   string;
  variantName: string;
  price:       number;
  quantity:    number;
  imageUrl:    string | null;
  category:    string | null;
}

// ─── Helper: gera slug a partir do nome ──────────────────────────────────────

function buildSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 6); // 4 chars aleatórios
  return `${base}-${suffix}`;
}

// ─── Gera (ou retorna) o slug da vendedora ────────────────────────────────────

export async function getOrCreateSellerSlugAction(
  sellerId: string
): Promise<ActionResult<SellerPublicProfileDTO>> {
  try {
    interface UserRow { id: string; name: string | null; seller_slug: string | null; profile_picture_url: string | null }
    const rows = await prismaBase.$queryRaw<UserRow[]>(Prisma.sql`
      SELECT id, name, "sellerSlug" AS seller_slug, "profilePictureUrl" AS profile_picture_url
      FROM "User" WHERE id = ${sellerId} LIMIT 1
    `);
    if (!rows.length) return { success: false, error: 'Vendedora não encontrada.' };
    const seller = rows[0];

    let slug: string = seller.seller_slug ?? '';

    if (!slug) {
      let candidate = buildSlug(seller.name ?? 'vendedora');
      // Garante unicidade
      interface SlugRow { cnt: bigint }
      let check = await prismaBase.$queryRaw<SlugRow[]>(Prisma.sql`SELECT count(*)::bigint AS cnt FROM "User" WHERE "sellerSlug" = ${candidate}`);
      while (Number(check[0].cnt) > 0) {
        candidate = buildSlug(seller.name ?? 'vendedora');
        check = await prismaBase.$queryRaw<SlugRow[]>(Prisma.sql`SELECT count(*)::bigint AS cnt FROM "User" WHERE "sellerSlug" = ${candidate}`);
      }
      await prismaBase.$executeRaw(Prisma.sql`UPDATE "User" SET "sellerSlug" = ${candidate} WHERE id = ${sellerId}`);
      slug = candidate;
      revalidatePath('/inventory');
    }

    const storeUrl = `${getServerAppUrl()}/loja/${slug}`;
    return {
      success: true,
      data: {
        id:                seller.id,
        name:              seller.name ?? 'Vendedora',
        sellerSlug:        slug,
        profilePictureUrl: seller.profile_picture_url,
        storeUrl,
      },
    };
  } catch (err) {
    console.error('[getOrCreateSellerSlugAction]', err);
    return { success: false, error: 'Erro ao gerar link da loja.' };
  }
}

// ─── Dados públicos da loja por slug ─────────────────────────────────────────

export interface PublicStoreData {
  seller: SellerPublicProfileDTO;
  products: PublicProductDTO[];
}

export async function getPublicStoreAction(
  slug: string
): Promise<ActionResult<PublicStoreData>> {
  try {
    interface SellerRow { id: string; name: string | null; seller_slug: string; profile_picture_url: string | null; role: string }
    const sellers = await prismaBase.$queryRaw<SellerRow[]>(Prisma.sql`
      SELECT id, name, "sellerSlug" AS seller_slug, "profilePictureUrl" AS profile_picture_url, role
      FROM "User" WHERE "sellerSlug" = ${slug} LIMIT 1
    `);
    if (!sellers.length || sellers[0].role !== 'seller') {
      return { success: false, error: 'Loja não encontrada.' };
    }
    const seller = sellers[0];

    // Busca o estoque pessoal da vendedora com dados dos produtos
    interface StockJoinRow {
      id: string; quantity: number; productId: string;
      variantId: string; variantName: string;
      p_name: string; p_image_url: string | null;
      p_price: string; p_category: string | null;
    }
    const rows = await prismaBase.$queryRaw<StockJoinRow[]>(Prisma.sql`
      SELECT
        si.id, si.quantity, si."productId",
        si."variantId", si."variantName",
        p.name        AS p_name,
        p."imageUrl"  AS p_image_url,
        p.price::text AS p_price,
        p.category    AS p_category
      FROM "SellerInventoryItem" si
      JOIN "Product" p ON p.id = si."productId"
      WHERE si."sellerId" = ${seller.id}
        AND si.quantity > 0
      ORDER BY p.name, si."variantName"
    `);

    const products: PublicProductDTO[] = rows.map((r) => ({
      id:          r.id,
      productId:   r.productId,
      productName: r.p_name,
      variantId:   r.variantId,
      variantName: r.variantName,
      price:       parseFloat(r.p_price),
      quantity:    Number(r.quantity),
      imageUrl:    r.p_image_url,
      category:    r.p_category,
    }));

    return {
      success: true,
      data: {
        seller: {
          id:                seller.id,
          name:              seller.name ?? 'Vendedora',
          sellerSlug:        slug,
          profilePictureUrl: seller.profile_picture_url,
          storeUrl:          `${getServerAppUrl()}/loja/${slug}`,
        },
        products,
      },
    };
  } catch (err) {
    console.error('[getPublicStoreAction]', err);
    return { success: false, error: 'Erro ao carregar loja.' };
  }
}

// ─── Associar cliente ao vendedor (chamado no cadastro/login via seller link) ─

export async function associateClientWithSellerAction(
  clientId: string,
  sellerSlug: string
): Promise<ActionResult> {
  try {
    interface SellerRef { id: string; role: string }
    const sellers = await prismaBase.$queryRaw<SellerRef[]>(Prisma.sql`
      SELECT id, role FROM "User" WHERE "sellerSlug" = ${sellerSlug} LIMIT 1
    `);
    if (!sellers.length || sellers[0].role !== 'seller') return { success: false, error: 'Vendedora inválida.' };
    if (sellers[0].id === clientId) return { success: false, error: 'Auto-referência não permitida.' };

    // Só associa se o cliente ainda não tem vendedora
    await prismaBase.$executeRaw(Prisma.sql`
      UPDATE "User" SET "referredBySellerId" = ${sellers[0].id}
      WHERE id = ${clientId} AND "referredBySellerId" IS NULL
    `);

    return { success: true, data: undefined };
  } catch (err) {
    console.error('[associateClientWithSellerAction]', err);
    return { success: false, error: 'Erro ao associar cliente.' };
  }
}

// ─── Lista clientes do vendedor (para "Meus Clientes") ───────────────────────

export interface SellerClientDTO {
  id:       string;
  name:     string | null;
  whatsapp: string | null;
  email:    string | null;
  joinedAt: string;
}

export async function getSellerClientsAction(
  sellerId: string
): Promise<ActionResult<SellerClientDTO[]>> {
  try {
    interface ClientRow { id: string; name: string | null; whatsapp: string | null; email: string | null; created_at: Date }
    const clients = await prismaBase.$queryRaw<ClientRow[]>(Prisma.sql`
      SELECT id, name, whatsapp, email, "createdAt" AS created_at
      FROM "User"
      WHERE "referredBySellerId" = ${sellerId}
      ORDER BY "createdAt" DESC
    `);
    return {
      success: true,
      data: clients.map((c) => ({
        id:       c.id,
        name:     c.name,
        whatsapp: c.whatsapp,
        email:    c.email,
        joinedAt: new Date(c.created_at).toISOString(),
      })),
    };
  } catch (err) {
    console.error('[getSellerClientsAction]', err);
    return { success: false, error: 'Erro ao buscar clientes.' };
  }
}
