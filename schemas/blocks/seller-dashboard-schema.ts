import { z } from 'zod';

export const SellerDashboardSearchSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type SellerDashboardSearchType = z.infer<typeof SellerDashboardSearchSchema>;

export interface DashboardCategoryData {
  label: string;
  totalValue: number;
  totalOrders: number;
}

export interface SellerDashboardData {
  sellerName: string;
  sellerRole: string;
  isActive: boolean;
  profilePictureUrl: string;
  summary: {
    totalSalesValue: number;
    totalOrdersCount: number;
    daysCount: number;
  };
  periodSubtitle: string;
  categories: {
    pix: DashboardCategoryData;
    debit: DashboardCategoryData;
    credit: DashboardCategoryData;
    refund: DashboardCategoryData;
    pending: DashboardCategoryData;
    approved: DashboardCategoryData;
  };
}