'use server';

/**
 * Dados resumidos do menu do Vendedor Autorizado.
 * Usa raw SQL porque o Prisma Client pode estar em cache com versão anterior
 * ao último `prisma db push` (isTwoFactorEnabled foi adicionado recentemente).
 */

import { prisma } from '@/lib/prisma';

export interface SellerMenuSummary {
  userId:              string;
  isTwoFactorEnabled:  boolean;
  paymentMethodsCount: number;
  role:                string;
}

export type GetSellerMenuSummaryResult = {
  success: boolean;
  data?:   SellerMenuSummary;
  error?:  string;
};

export async function getAuthorizedSellerMenuSummaryAction(
  userId: string
): Promise<GetSellerMenuSummaryResult> {
  if (!userId?.trim()) {
    return { success: false, error: 'Identificador de usuário inválido.' };
  }

  try {
    interface UserRow {
      id:                  string;
      role:                string;
      is_two_factor:       boolean;
      payment_count:       bigint;
    }

    const rows = await (prisma as unknown as {
      $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<UserRow[]>
    }).$queryRawUnsafe(`
      SELECT
        u.id,
        u.role,
        u."isTwoFactorEnabled"                       AS is_two_factor,
        COUNT(pm.id)::bigint                         AS payment_count
      FROM "User" u
      LEFT JOIN "PaymentMethod" pm ON pm."userId" = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.role, u."isTwoFactorEnabled"
      LIMIT 1
    `, userId);

    if (!rows.length) {
      return { success: false, error: 'Usuário não encontrado no sistema.' };
    }

    const user = rows[0];

    if (user.role !== 'seller') {
      return { success: false, error: 'Acesso negado. O usuário não é um vendedor autorizado.' };
    }

    return {
      success: true,
      data: {
        userId:              user.id,
        role:                user.role,
        isTwoFactorEnabled:  Boolean(user.is_two_factor),
        paymentMethodsCount: Number(user.payment_count),
      },
    };
  } catch (error) {
    console.error('[getAuthorizedSellerMenuSummaryAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno ao buscar resumo do vendedor.',
    };
  }
}
