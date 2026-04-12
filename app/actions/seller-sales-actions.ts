'use server';

import { prisma } from '@/lib/prisma';
import { 
  SellerSalesFilterSchema, 
  SellerSalesFilterInput, 
  SellerSalesActionResult 
} from '@/schemas/seller-sales-schema';

export async function getSellerSalesDashboardAction(
  payload: SellerSalesFilterInput
): Promise<SellerSalesActionResult> {
  try {
    const validationResult = SellerSalesFilterSchema.safeParse(payload);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: validationResult.error.issues[0]?.message || 'Dados de filtro inválidos.' 
      };
    }

    const { sellerIdentifier, startDateInformation, endDateInformation } = validationResult.data;

    const sellerUser = await prisma.user.findUnique({
      where: { id: sellerIdentifier },
      include: { stores: true },
    });

    if (!sellerUser) {
      return { success: false, error: 'Vendedora não encontrada no sistema.' };
    }

    const sellerStore = sellerUser.stores[0];
    if (!sellerStore) {
      return { success: false, error: 'Nenhuma loja vinculada a esta vendedora.' };
    }

    const dateFilter: { gte?: Date; lte?: Date } = {};
    
    if (startDateInformation) {
      const start = new Date(startDateInformation);
      start.setHours(0, 0, 0, 0);
      dateFilter.gte = start;
    }
    
    if (endDateInformation) {
      const end = new Date(endDateInformation);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const storeOrders = await prisma.order.findMany({
      where: {
        storeId: sellerStore.id,
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrdersCount = storeOrders.length;
    const totalSalesValue = storeOrders.reduce((accumulator, currentOrder) => {
      return accumulator + Number(currentOrder.total);
    }, 0);

    let daysActive = 7;
    if (startDateInformation && endDateInformation) {
      const differenceInTime = Math.abs(new Date(endDateInformation).getTime() - new Date(startDateInformation).getTime());
      daysActive = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)) || 1;
    }

    const recentSales = storeOrders.map((order) => ({
      id: order.id,
      status: order.status === 'COMPLETED' ? 'Venda Aprovada' : order.status === 'PENDING' ? 'Venda Pendente' : 'Venda Aprovada',
      customerName: order.customerName || 'Cliente Maryland',
      totalValue: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        sellerName: sellerUser.name || 'Vendedora',
        profilePictureUrl: sellerUser.profilePictureUrl,
        isActive: true,
        metrics: {
          totalSalesValue,
          totalOrdersCount,
          daysActive,
        },
        recentSales,
      },
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao buscar dados de vendas.' 
    };
  }
}