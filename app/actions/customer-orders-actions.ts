'use server';

/**
 * Server actions para histórico do CLIENTE.
 *
 * getCustomerOrdersAction   — pedidos vinculados ao customerId
 * getCustomerActivityAction — log de atividades do usuário
 * logActivityAction         — registra uma nova atividade no banco
 *
 * Usa raw SQL ($queryRawUnsafe / $executeRawUnsafe) porque o Prisma Client
 * pode estar em cache com versão anterior ao último `prisma db push`.
 */

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerOrderItem {
  productName: string;
  quantity:    number;
  price:       number;
}

export interface CustomerOrderResult {
  id:          string;
  total:       number;
  status:      string;
  createdAt:   string;
  items:       CustomerOrderItem[];
  sellerName?: string | null;
}

export interface ActivityEntry {
  id:          string;
  action:      string;
  description: string | null;
  createdAt:   string;
  orderId?:    string | null;
  productId?:  string | null;
}

// ─── Buscar pedidos do cliente ────────────────────────────────────────────────

export async function getCustomerOrdersAction(
  customerId: string,
  limit = 50
): Promise<{ success: boolean; data?: CustomerOrderResult[]; error?: string }> {
  if (!customerId) return { success: false, error: 'ID do cliente obrigatório.' };

  try {
    interface OrderRow {
      order_id: string; total: string; status: string; created_at: Date;
      product_name: string; qty: number; price: string;
      seller_name: string | null;
    }

    const rows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<OrderRow[]>
    }).$queryRawUnsafe(`
      SELECT
        o.id            AS order_id,
        o.total::text   AS total,
        o.status,
        o."createdAt"   AS created_at,
        p.name          AS product_name,
        oi.quantity     AS qty,
        oi.price::text  AS price,
        s.name          AS seller_name
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId"  = o.id
      JOIN "Product"   p  ON p.id          = oi."productId"
      LEFT JOIN "User" s  ON s.id          = o."referredBySellerId"
      WHERE o."customerId" = $1
      ORDER BY o."createdAt" DESC
      LIMIT $2
    `, customerId, limit);

    // Agrupa items por pedido
    const map = new Map<string, CustomerOrderResult>();
    for (const r of rows) {
      if (!map.has(r.order_id)) {
        map.set(r.order_id, {
          id:         r.order_id,
          total:      parseFloat(r.total),
          status:     r.status,
          createdAt:  r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          sellerName: r.seller_name,
          items:      [],
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
    console.error('[getCustomerOrdersAction]', err);
    return { success: false, error: 'Erro ao buscar histórico de compras.' };
  }
}

// ─── Buscar log de atividades do usuário ──────────────────────────────────────

export async function getCustomerActivityAction(
  userId: string,
  limit = 50,
  action?: string
): Promise<{ success: boolean; data?: ActivityEntry[]; error?: string }> {
  if (!userId) return { success: false, error: 'ID do usuário obrigatório.' };

  try {
    interface LogRow {
      id: string; action: string; description: string | null;
      created_at: Date; order_id: string | null; product_id: string | null;
    }

    const rows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<LogRow[]>
    }).$queryRawUnsafe(
      action
        ? `SELECT id, action, description, "createdAt" AS created_at, "orderId" AS order_id, "productId" AS product_id
           FROM "ActivityLog"
           WHERE "userId" = $1 AND action = $2
           ORDER BY "createdAt" DESC LIMIT $3`
        : `SELECT id, action, description, "createdAt" AS created_at, "orderId" AS order_id, "productId" AS product_id
           FROM "ActivityLog"
           WHERE "userId" = $1
           ORDER BY "createdAt" DESC LIMIT $2`,
      ...(action ? [userId, action, limit] : [userId, limit])
    );

    return {
      success: true,
      data: rows.map((l) => ({
        id:          l.id,
        action:      l.action,
        description: l.description,
        createdAt:   l.created_at instanceof Date ? l.created_at.toISOString() : String(l.created_at),
        orderId:     l.order_id,
        productId:   l.product_id,
      })),
    };
  } catch (err) {
    console.error('[getCustomerActivityAction]', err);
    return { success: false, error: 'Erro ao buscar atividades.' };
  }
}

// ─── Registrar nova atividade ─────────────────────────────────────────────────

const LogActivitySchema = z.object({
  userId:      z.string().min(1),
  action:      z.string().min(1),
  description: z.string().optional(),
  productId:   z.string().optional(),
  orderId:     z.string().optional(),
  metadata:    z.record(z.string(), z.unknown()).optional(),
});

export type LogActivityInput = z.infer<typeof LogActivitySchema>;

export async function logActivityAction(
  input: LogActivityInput
): Promise<{ success: boolean; error?: string }> {
  const parsed = LogActivitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' };

  const { userId, action, description, productId, orderId, metadata } = parsed.data;
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  try {
    await (prisma as unknown as {
      $executeRawUnsafe: (q: string, ...a: unknown[]) => Promise<number>
    }).$executeRawUnsafe(`
      INSERT INTO "ActivityLog" (id, "userId", action, description, "productId", "orderId", metadata, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, NOW())
    `, userId, action, description ?? null, productId ?? null, orderId ?? null, metadataJson);

    return { success: true };
  } catch (err) {
    console.error('[logActivityAction]', err);
    return { success: false, error: 'Erro ao registrar atividade.' };
  }
}
