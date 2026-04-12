'use server';

import { SellerDashboardSearchSchema, SellerDashboardSearchType, SellerDashboardData } from '@/schemas/blocks/seller-dashboard-schema';

export type GetSellerDashboardActionResult = {
  success: boolean;
  data?: SellerDashboardData;
  error?: string;
};

export async function getSellerDashboardDataAction(payload: SellerDashboardSearchType): Promise<GetSellerDashboardActionResult> {
  try {
    const validationResult = SellerDashboardSearchSchema.safeParse(payload);
    if (!validationResult.success) {
      return { success: false, error: 'Dados de busca inválidos.' };
    }

    // MOCK EXATO DA IMAGEM PARA TESTES DE LAYOUT
    const mockData: SellerDashboardData = {
      sellerName: 'Mayra',
      sellerRole: 'Vendedora Autorizada',
      isActive: true,
      profilePictureUrl: 'https://placehold.co/400x400/png?text=Foto',
      summary: {
        totalSalesValue: 17586.00,
        totalOrdersCount: 26,
        daysCount: 7,
      },
      periodSubtitle: 'Vendas totais de Setembro, dia 12 a novembro, dia 12',
      categories: {
        pix: { label: 'Vendas no Pix', totalValue: 5541.00, totalOrders: 6 },
        debit: { label: 'Vendas no Débito', totalValue: 9578.00, totalOrders: 7 },
        credit: { label: 'Vendas no Crédito', totalValue: 10589.00, totalOrders: 8 },
        refund: { label: 'Reembolso', totalValue: 5541.00, totalOrders: 6 },
        pending: { label: 'Pendente', totalValue: 5541.00, totalOrders: 6 },
        approved: { label: 'Aprovadas', totalValue: 5541.00, totalOrders: 6 },
      },
    };

    // Simula delay de rede para testar loading state
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      data: mockData,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno ao buscar dados do dashboard.' 
    };
  }
}