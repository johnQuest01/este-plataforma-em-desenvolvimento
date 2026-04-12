'use server';

/**
 * Server actions para histórico de VENDAS do Vendedor Autorizado.
 *
 * getSellerSalesDashboardAction — dados completos do dashboard (perfil + métricas + vendas recentes)
 * getSellerSalesAction          — pedidos onde clientes indicados compraram
 * getSellerSalesSummaryAction   — resumo: total vendido, nº pedidos, ticket médio, nº clientes
 *
 * Usa raw SQL ($queryRawUnsafe) porque o Prisma Client pode estar em cache
 * com versão anterior ao último `prisma db push`.
 */

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type {
  SellerSalesDashboardData,
  SellerSalesActionResult,
} from '@/schemas/seller-sales-schema';

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

// ─── Dashboard completo da vendedora ─────────────────────────────────────────
// Usado por SellerSalesDashboardBlock — retorna perfil + métricas + vendas recentes.

import { SellerSalesFilterSchema } from '@/schemas/seller-sales-schema';

export async function getSellerSalesDashboardAction(
  input: z.infer<typeof SellerSalesFilterSchema>
): Promise<SellerSalesActionResult> {
  const parsed = SellerSalesFilterSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' };

  const { sellerIdentifier, startDateInformation, endDateInformation } = parsed.data;

  try {
    // 1. Perfil da vendedora
    interface ProfileRow {
      name: string | null;
      profile_picture_url: string | null;
      created_at: Date;
    }
    const profileRows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<ProfileRow[]>
    }).$queryRawUnsafe(`
      SELECT name, "profilePictureUrl" AS profile_picture_url, "createdAt" AS created_at
      FROM "User" WHERE id = $1 LIMIT 1
    `, sellerIdentifier);

    if (!profileRows.length) {
      return { success: false, error: 'Vendedora não encontrada.' };
    }
    const profile = profileRows[0];

    // 2. Métricas de vendas (pedidos indicados pela vendedora)
    const conditions: string[] = [`"referredBySellerId" = $1`];
    const params: unknown[]    = [sellerIdentifier];
    let idx = 2;

    if (startDateInformation) {
      conditions.push(`"createdAt" >= $${idx}::timestamptz`);
      params.push(new Date(startDateInformation + 'T00:00:00Z'));
      idx++;
    }
    if (endDateInformation) {
      conditions.push(`"createdAt" <= $${idx}::timestamptz`);
      params.push(new Date(endDateInformation + 'T23:59:59Z'));
      idx++;
    }
    const whereSql = conditions.join(' AND ');

    interface MetricsRow {
      total_sales: string | null;
      total_orders: bigint;
    }
    const metricsRows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<MetricsRow[]>
    }).$queryRawUnsafe(`
      SELECT
        COALESCE(SUM(total), 0)::text AS total_sales,
        COUNT(*)::bigint              AS total_orders
      FROM "Order"
      WHERE ${whereSql}
    `, ...params);

    const metrics = metricsRows[0];

    // 3. Vendas recentes (últimas 20)
    interface SaleRow {
      order_id: string;
      status: string;
      customer_name: string | null;
      total: string;
      created_at: Date;
    }
    const salesRows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<SaleRow[]>
    }).$queryRawUnsafe(`
      SELECT
        id              AS order_id,
        status,
        "customerName"  AS customer_name,
        total::text     AS total,
        "createdAt"     AS created_at
      FROM "Order"
      WHERE ${whereSql}
      ORDER BY "createdAt" DESC
      LIMIT 20
    `, ...params);

    // Dias ativos (desde o cadastro da vendedora)
    const createdAt = profile.created_at instanceof Date
      ? profile.created_at
      : new Date(profile.created_at);
    const daysActive = Math.max(
      0,
      Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );

    const dashboardData: SellerSalesDashboardData = {
      sellerName:        profile.name ?? 'Vendedora',
      profilePictureUrl: profile.profile_picture_url,
      isActive:          true,
      metrics: {
        totalSalesValue:   parseFloat(metrics?.total_sales ?? '0'),
        totalOrdersCount:  Number(metrics?.total_orders ?? 0),
        daysActive,
      },
      recentSales: salesRows.map((r) => ({
        id:           r.order_id,
        status:       r.status,
        customerName: r.customer_name ?? 'Cliente',
        totalValue:   parseFloat(r.total),
        createdAt:    r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at),
      })),
    };

    return { success: true, data: dashboardData };
  } catch (err) {
    console.error('[getSellerSalesDashboardAction]', err);
    return { success: false, error: 'Erro ao carregar dashboard de vendas.' };
  }
}
