import { BlockConfig, ProductVariationData } from '@/types/builder';
import { ProductData } from '@/app/actions/product';

export type ModalViewMode = 'list' | 'register' | 'details';

export interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockConfig[]; 
  onProductRegister?: (data: { image?: string }) => void;
}

// Helper: Converts Prisma Data (DB) to UI Format
// Handles null checks strictly to avoid runtime crashes
export const mapToDisplayVariations = (items: ProductData['variants']): ProductVariationData[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => ({
    size: item.name || 'Único', 
    color: 'Padrão', 
    variation: item.sku || 'Regular', 
    quantity: item.stock || 0 
  }));
};