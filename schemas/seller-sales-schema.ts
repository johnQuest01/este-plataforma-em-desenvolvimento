import { z } from 'zod';

export const SellerSalesFilterSchema = z.object({
  sellerIdentifier: z.string().min(1, 'O ID da vendedora é obrigatório.'),
  startDateInformation: z.string().optional(),
  endDateInformation: z.string().optional(),
});

export type SellerSalesFilterInput = z.infer<typeof SellerSalesFilterSchema>;

export interface SellerSaleRecord {
  id: string;
  status: string;
  customerName: string;
  totalValue: number;
  createdAt: string;
}

export interface SellerSalesDashboardData {
  sellerName: string;
  profilePictureUrl: string | null;
  isActive: boolean;
  metrics: {
    totalSalesValue: number;
    totalOrdersCount: number;
    daysActive: number;
  };
  recentSales: SellerSaleRecord[];
}

export interface SellerSalesActionResult {
  success: boolean;
  data?: SellerSalesDashboardData;
  error?: string;
}