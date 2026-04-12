// path: src/app/product/[id]/page.tsx
import React from 'react';
import { getProductByIdAction } from '@/app/actions/product';
import { prisma } from '@/lib/prisma';
import { ProductPageShell } from '@/components/shop/ProductPageShell';

interface PageProps {
  params:      Promise<{ id: string }>;
  searchParams: Promise<{ seller?: string }>;
}

/**
 * Quando acessado via link de vendedora (?seller=[slug]):
 *  - Busca o estoque disponível dessa vendedora para este produto
 *  - Passa as quantidades para a tela de detalhes do produto
 */
async function getSellerStockForProduct(
  productId: string,
  sellerSlug: string
): Promise<Record<string, number>> {
  try {
    interface Row { variant_id: string; quantity: number }
    const rows = await (prisma as unknown as { $queryRawUnsafe: (q: string, ...args: unknown[]) => Promise<Row[]> })
      .$queryRawUnsafe(`
        SELECT si."variantId" AS variant_id, si.quantity
        FROM "SellerInventoryItem" si
        JOIN "User" u ON u.id = si."sellerId"
        WHERE si."productId" = $1 AND u."sellerSlug" = $2
      `, productId, sellerSlug);
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.variant_id || '__base__'] = Number(r.quantity);
    }
    return map;
  } catch {
    return {};
  }
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { id }     = await params;
  const { seller } = await searchParams;

  const product = await getProductByIdAction(id);

  // Se veio de um link de vendedora, sobrescreve os estoques das variantes
  if (product && seller) {
    const sellerStock = await getSellerStockForProduct(id, seller);
    if (Object.keys(sellerStock).length > 0) {
      // Ajusta o estoque de cada variante com o que a vendedora tem
      if (product.variants) {
        product.variants = product.variants.map((v) => ({
          ...v,
          stock: sellerStock[v.id ?? ''] ?? sellerStock['__base__'] ?? 0,
        }));
      }
      // Estoque total = soma do que a vendedora tem
      product.stock = Object.values(sellerStock).reduce((a, b) => a + b, 0);
    } else {
      // Vendedora não tem este produto: marca como sem estoque
      if (product.variants) {
        product.variants = product.variants.map((v) => ({ ...v, stock: 0 }));
      }
      product.stock = 0;
    }
  }

  return <ProductPageShell product={product} />;
}
