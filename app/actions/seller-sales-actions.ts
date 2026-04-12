'use server';

/**
 * Server actions para histórico de VENDAS do Vendedor Autorizado.
 *
 * getSellerSalesAction        — pedidos onde clientes indicados compraram
 * getSellerSalesSummaryAction — resumo: total vendido, nº pedidos, ticket médio, nº clientes
 *
 * Usa raw SQL ($queryRawUnsafe) porque o Prisma Client pode estar em cache
 * com versão anterior ao último `prisma db push`.
 */

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerSaleItem {
  productName: string;
  quantity:    number;
  price:       number;
}

export interface SellerSaleResult {
  id:           string;
  total:        number;
  status:       string;
  createdAt:    string;
  customerName: string | null;
  items:        SellerSaleItem[];
}

export interface SellerSalesSummary {
  totalRevenue:  number;
  totalOrders:   number;
  avgTicket:     number;
  totalClients:  number;
}

// ─── Pedidos de clientes indicados pelo vendedor ──────────────────────────────

const SellerSalesSchema = z.object({
  sellerId:    z.string().min(1),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
  searchQuery: z.string().optional(),
  limit:       z.number().int().positive().default(50),
});

export async function getSellerSalesAction(
  input: z.infer<typeof SellerSalesSchema>
): Promise<{ success: boolean; data?: SellerSaleResult[]; error?: string }> {
  const parsed = SellerSalesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' };

  const { sellerId, startDate, endDate, searchQuery, limit } = parsed.data;

  try {
    // Monta filtros dinamicamente
    const conditions: string[] = [`o."referredBySellerId" = $1`];
    const params: unknown[]    = [sellerId];
    let idx = 2;

    if (startDate) {
      conditions.push(`o."createdAt" >= $${idx}::timestamptz`);
      params.push(new Date(startDate + 'T00:00:00Z'));
      idx++;
    }
    if (endDate) {
      conditions.push(`o."createdAt" <= $${idx}::timestamptz`);
      params.push(new Date(endDate + 'T23:59:59Z'));
      idx++;
    }
    if (searchQuery) {
      conditions.push(`(o."customerName" ILIKE $${idx} OR p.name ILIKE $${idx})`);
      params.push(`%${searchQuery}%`);
      idx++;
    }

    params.push(limit);
    const whereSql = conditions.join(' AND ');

    interface SaleRow {
      order_id: string; total: string; status: string;
      created_at: Date; customer_name: string | null;
      product_name: string; qty: number; price: string;
    }

    const rows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<SaleRow[]>
    }).$queryRawUnsafe(`
      SELECT
        o.id              AS order_id,
        o.total::text     AS total,
        o.status,
        o."createdAt"     AS created_at,
        o."customerName"  AS customer_name,
        p.name            AS product_name,
        oi.quantity       AS qty,
        oi.price::text    AS price
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId"  = o.id
      JOIN "Product"   p  ON p.id          = oi."productId"
      WHERE ${whereSql}
      ORDER BY o."createdAt" DESC
      LIMIT $${idx}
    `, ...params);

    // Agrupa items por pedido
    const map = new Map<string, SellerSaleResult>();
    for (const r of rows) {
      if (!map.has(r.order_id)) {
        map.set(r.order_id, {
          id:           r.order_id,
          total:        parseFloat(r.total),
          status:       r.status,
          createdAt:    r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          customerName: r.customer_name,
          items:        [],
        });
      }
      map.get(r.order_id)!.items.push({
        productName: r.product_name,
        quantity:    Number(r.qty),
        price:       parseFloat(r.price),
      });
    }

    return { success: true, data: Array.from(map.values()) };
  } catch (err) {
    console.error('[getSellerSalesAction]', err);
    return { success: false, error: 'Erro ao buscar histórico de vendas.' };
  }
}

// ─── Resumo de vendas do vendedor ─────────────────────────────────────────────

export async function getSellerSalesSummaryAction(
  sellerId: string
): Promise<{ success: boolean; data?: SellerSalesSummary; error?: string }> {
  if (!sellerId) return { success: false, error: 'ID do vendedor obrigatório.' };

  try {
    interface SummaryRow {
      total_revenue: string | null;
      total_orders: bigint;
      avg_ticket: string | null;
    }
    interface ClientRow { total_clients: bigint }

    const [summaryRows, clientRows] = await Promise.all([
      (prisma as unknown as { $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<SummaryRow[]> })
        .$queryRawUnsafe(`
          SELECT
            COALESCE(SUM(total), 0)::text         AS total_revenue,
            COUNT(*)::bigint                       AS total_orders,
            COALESCE(AVG(total), 0)::text          AS avg_ticket
          FROM "Order"
          WHERE "referredBySellerId" = $1
        `, sellerId),
      (prisma as unknown as { $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<ClientRow[]> })
        .$queryRawUnsafe(`
          SELECT COUNT(*)::bigint AS total_clients
          FROM "User"
          WHERE "referredBySellerId" = $1
        `, sellerId),
    ]);

    const s = summaryRows[0];
    return {
      success: true,
      data: {
        totalRevenue: parseFloat(s?.total_revenue ?? '0'),
        totalOrders:  Number(s?.total_orders ?? 0),
        avgTicket:    parseFloat(s?.avg_ticket ?? '0'),
        totalClients: Number(clientRows[0]?.total_clients ?? 0),
      },
    };
  } catch (err) {
    console.error('[getSellerSalesSummaryAction]', err);
    return { success: false, error: 'Erro ao calcular resumo de vendas.' };
  }
}
