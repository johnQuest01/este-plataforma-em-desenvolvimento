'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ActivityHistorySearchActionSchema, ActivityHistorySearchActionType } from '@/schemas/blocks/activity-history-schema';

export interface StandardizedServerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MappedOrderResult {
  orderIdentifier: string;
  totalValue: number;
  status: string;
  creationDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export async function getActivityLogsAction(
  payload: ActivityHistorySearchActionType
): Promise<StandardizedServerResponse<MappedOrderResult[]>> {
  try {
    const validationResult = ActivityHistorySearchActionSchema.safeParse(payload);

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Dados de busca inválidos. Verifique os campos preenchidos.'
      };
    }

    const { searchQueryInformation, searchDateInformation, storeIdentifier } = validationResult.data;

    // Tipagem estrita utilizando o contrato gerado pelo Prisma para a tabela Order
    const queryConditions: Prisma.OrderWhereInput = {
      storeId: storeIdentifier,
    };

    if (searchDateInformation) {
      const startOfDay = new Date(searchDateInformation);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(searchDateInformation);
      endOfDay.setUTCHours(23, 59, 59, 999);

      queryConditions.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (searchQueryInformation) {
      queryConditions.OR = [
        { id: { contains: searchQueryInformation, mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: { contains: searchQueryInformation, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    // Execução da busca no banco de dados
    const rawOrders = await prisma.order.findMany({
      where: queryConditions,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limite de segurança para performance
    });

    // Mapeamento estrito convertendo Prisma.Decimal para Number (UI Pura)
    const mappedOrders: MappedOrderResult[] = rawOrders.map((order) => ({
      orderIdentifier: order.id,
      totalValue: Number(order.total),
      status: order.status,
      creationDate: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    }));

    return {
      success: true,
      data: mappedOrders
    };

  } catch (error) {
    console.error('[getActivityLogsAction] Erro ao buscar histórico:', error);
    return {
      success: false,
      error: 'Ocorreu um erro interno ao buscar o histórico de atividades. Tente novamente.'
    };
  }
}