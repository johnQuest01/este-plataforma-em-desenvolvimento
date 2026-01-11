/**
 * LEGO ARCHITECTURE - GLOBAL TYPES
 * Stack 2026: Next 16.1.1 | React 19.2.1 | Strict TS
 */

// --- NOVOS TIPOS PARA PRODUÇÃO ---
export type ProductionStep = 'sewing' | 'sorting' | 'tagging' | 'packaging' | 'ready';

export interface ProductionVariationDetail {
  id?: string;    
  type: string;   
  size: string;
  color: string;
  qty: number;
}

export interface ProductionItemData {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  currentStep: ProductionStep;
  stepsHistory: {
    sewing: boolean;
    sorting: boolean;
    tagging: boolean;
    packaging: boolean;
  };
  startedAt: string;
  variationsDetail?: ProductionVariationDetail[];
  returnReason?: string;
}

// --- NOVOS TIPOS PARA VENDAS TOTAIS (HISTÓRICO) ---
export interface SaleRecord {
  id: string;
  productName: string;
  totalValue: number;
  quantity: number;
  date: string; 
  sellerName?: string; 
}

// --- NOVOS TIPOS PARA O POPUP DE DISTRIBUIÇÃO ---
export interface SaleswomanData {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface StockDistributionLabels {
  cancelButton?: string;
  confirmButton?: string;
  distributedLabel?: string;
  remainingLabel?: string;
}

// --- NOVOS TIPOS PARA O PDV (CAIXA) ---
export interface CartVariation {
  qty: number;
  size?: string;
  color?: string;
  [key: string]: unknown;
}

export interface CartProduct {
  id: string;
  name: string;
  price: string;
  mainImage: string;
  variations: CartVariation[];
  [key: string]: unknown;
}

export interface CartItem {
  cartId: string;
  product: CartProduct;
  quantity: number;
  variationLabel?: string;
}

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

// --- TIPOS EXISTENTES ---
export interface StockCategoryItem {
  label: string;
  status: 'low' | 'high' | 'medium' | 'default';
  link?: string;
}

export interface ProductVariationData {
  size: string;
  color: string;
  variation?: string;
  quantity: number;
}

/**
 * ✅ ATUALIZAÇÃO: Registro de novos blocos na união estrita
 */
export type BlockType =
  | 'header'
  | 'product-grid'
  | 'banner'
  | 'categories'
  | 'footer'
  | 'user-info'
  | 'grid-buttons'
  | 'inventory-feature'
  | 'action-buttons'
  | 'stock-header'
  | 'stock-search'
  | 'stock-category-grid'
  | 'stock-filter-buttons'
  | 'stock-catalog'
  | 'category-product-list'
  | 'order-header'
  | 'order-product-info'
  | 'order-variant-selector'
  | 'order-summary-footer'
  | 'admin-user-card'
  | 'history-search'
  | 'client-history-card'
  | 'transaction-card'
  | 'history-links'
  | 'stock-search-result-card'
  | 'stock-detailed-product-card'
  | 'stock-popup-card'
  | 'stock-simple-card'
  | 'production-list'
  | 'ready-stock-list'
  | 'stock-distribution-popup'
  | 'total-sales'
  | 'standard-button'
  | 'jeans-registration'
  | 'health-monitor'            // ✅ Adicionado para fixar TS(2322)
  | 'master-guardian-dashboard'; // ✅ Adicionado conforme seu Registry

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action?: string;
  link?: string;
}

export interface FooterItem {
  id: string;
  icon: string;
  label?: string;
  isVisible: boolean;
  isHighlight?: boolean;
  action?: string;
  route?: string;
}

export interface CategoryItem {
  label: string;
  icon: string;
  link?: string;
  videoUrl?: string;
  videoColor?: string;
}

export interface ProductItem {
  name: string;
  tag?: string;
  imageColor?: string;
  price?: string;
  imageUrl?: string;
}

export interface SimpleButton {
  id: string;
  label: string;
  action?: string;
  bgColor?: string;
  textColor?: string;
  badge?: string;
  icon?: string;
  indicatorColor?: string;
}

export interface CatalogTag {
  label: string;
  color: 'orange' | 'blue' | 'gray';
}

export interface CatalogItem {
  id: string;
  title: string;
  image: string;
  tags: CatalogTag[];
  status: 'low' | 'available' | 'regular' | 'unavailable';
  statusLabel?: string;
}

export interface MenuStyle {
  overlayColor: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

export interface BlockStyle {
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: string;
  padding?: string;
  borderColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  [key: string]: string | number | undefined;
}

export interface VariantOption {
  label: string;
  qtyAvailable: number;
  type: string;
  groupName?: string;
}

export interface StoreFeatures {
  tryOn?: boolean;
  stockManagement?: boolean;
  scheduling?: boolean;
  catalogMode?: boolean;
}

export interface BlockData {
  address?: string;
  menuItems?: MenuItem[];
  products?: ProductItem[];
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  placeholder?: string;
  categories?: StockCategoryItem[];
  gridColumns?: number;
  items?: CategoryItem[];
  footerItems?: FooterItem[];
  imageUrl?: string;
  link?: string;
  userName?: string;
  userImage?: string;
  roleLabel?: string;
  buttons?: SimpleButton[];
  featureTitleLeft?: string;
  featureTitleRight?: string;
  boxTitle?: string;
  boxLabel?: string;
  catalogItems?: CatalogItem[];
  targetCategory?: string;
  targetStock?: string;
  productName?: string;
  productImage?: string;
  vendorName?: string;
  storeName?: string;
  deliveryAddress?: string;
  variantOptions?: VariantOption[];
  availableStock?: number;

  // Campos Histórico
  role?: string;
  since?: string;
  contact?: string;
  image?: string;
  name?: string; 
  sellerName?: string;

  // Campos Transações/Header
  showBack?: boolean;
  transactionType?: 'in' | 'out';
  transactionDate?: string;
  transactionValue?: string;
  valueColor?: string;

  // Campos Card Simples/Detalhado
  productSize?: string;
  productVariation?: string;
  productColor?: string;
  detailedVariations?: ProductVariationData[];

  // Campos do Card Popup (Antigo)
  detailsBox?: string;
  qty?: number;
  price?: string;

  // Campos de Produção
  productionItems?: ProductionItemData[];

  // Campos de Distribuição de Estoque
  saleswomen?: SaleswomanData[];
  totalStock?: number;
  labels?: StockDistributionLabels;

  // Campos de Vendas Totais
  sales?: SaleRecord[];
  primaryColor?: string;

  // --- CAMPOS ESPECÍFICOS DO STANDARD BUTTON ---
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  actionType?: string;
  fullWidthMobile?: boolean;

  [key: string]: string | number | boolean | null | undefined | object | unknown;
}

export interface BlockConfig {
  id: string;
  type: BlockType;
  isVisible: boolean;
  data: BlockData;
  style: BlockStyle;
}

export interface SelectedCategoryData {
  category: string;
  stock: string;
}

export interface BlockComponentProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}