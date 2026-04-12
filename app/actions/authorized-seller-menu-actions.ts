'use server';

import { prisma } from '@/lib/prisma';

export interface SellerMenuSummary {
  userId: string;
  isTwoFactorEnabled: boolean;
  paymentMethodsCount: number;
  role: string;
}

export type GetSellerMenuSummaryResult = {
  success: boolean;
  data?: SellerMenuSummary;
  error?: string;
};

export async function getAuthorizedSellerMenuSummaryAction(userId: string): Promise<GetSellerMenuSummaryResult> {
  try {
    if (!userId || userId.trim() === '') {
      return { success: false, error: 'Identificador de usuário inválido.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isTwoFactorEnabled: true,
        _count: {
          select: { paymentMethods: true }
        }
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado no sistema.' };
    }

    if (user.role !== 'seller') {
      return { success: false, error: 'Acesso negado. O usuário não é um vendedor autorizado.' };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        paymentMethodsCount: user._count.paymentMethods,
      },
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao buscar resumo do vendedor.' 
    };
  }
}