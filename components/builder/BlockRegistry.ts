'use client';

import React from 'react';
import { BlockComponentProps } from '@/types/builder';

// --- Imports de Blocos ---
import { StandardButtonBlock } from './blocks/StandardButtonBlock';
import { HeaderBlock } from './blocks/Header';
import { ProductGridBlock } from './blocks/ProductGrid';
import { BannerBlock } from './blocks/Banner';
import { CategoriesBlock } from './blocks/Categories';
import { FooterBlock } from './blocks/Footer';
import { UserInfoBlock } from './blocks/UserInfo';
import { InventoryFeatureBlock } from './blocks/InventoryFeature';
import { ActionButtonsBlock } from './blocks/ActionButtons';
import { GridButtonsBlock } from './blocks/GridButtons';
import { StockHeaderBlock } from './blocks/StockHeader';
import { StockSearchBlock } from './blocks/StockSearch';
import { StockCategoryGridBlock } from './blocks/StockCategoryGrid';
import { StockFilterButtonsBlock } from './blocks/StockFilterButtons';
import { StockCatalogBlock } from './blocks/StockCatalogBlock';
import { CategoryProductListBlock } from './blocks/CategoryProductListBlock';
import { StockSearchResultCardBlock } from './blocks/StockSearchResultCard';
import { StockDetailedProductCardBlock } from './blocks/StockDetailedProductCard';
import { StockPopupCardBlock } from './blocks/StockPopupCard';
import { StockSimpleCardBlock } from './blocks/StockSimpleCard';
import { OrderHeaderBlock } from './blocks/order/OrderHeaderBlock';
import { OrderProductInfoBlock } from './blocks/order/OrderProductInfoBlock';
import { OrderVariantSelectorBlock } from './blocks/order/OrderVariantSelectorBlock';
import { OrderSummaryFooterBlock } from './blocks/order/OrderSummaryFooterBlock';
import { AdminUserCardBlock } from '@/components/admin/AdminUserCard';
import { HistorySearchBlock } from './blocks/HistorySearch';
import { ClientHistoryCardBlock } from './blocks/ClientHistoryCard';
import { TransactionCardBlock } from './blocks/TransactionCard';
import { HistoryLinksBlock } from './blocks/HistoryLinksBlock';
import { ProductionListBlock } from './blocks/ProductionListBlock';
import { ReadyStockListBlock } from './blocks/ReadyStockListBlock';

// NOVO BLOCO ADICIONADO
import { TotalSalesBlock } from './blocks/TotalSalesBlock';

type LegoComponent = React.FC<BlockComponentProps>;

export const COMPONENT_MAP: Record<string, LegoComponent> = {
  'header': HeaderBlock,
  'product-grid': ProductGridBlock,
  'banner': BannerBlock,
  'categories': CategoriesBlock,
  'footer': FooterBlock,
  'user-info': UserInfoBlock,
  'inventory-feature': InventoryFeatureBlock,
  'action-buttons': ActionButtonsBlock,
  'grid-buttons': GridButtonsBlock,
  'stock-header': StockHeaderBlock,
  'stock-search': StockSearchBlock,
  'stock-category-grid': StockCategoryGridBlock,
  'stock-filter-buttons': StockFilterButtonsBlock,
  'stock-catalog': StockCatalogBlock,
  'category-product-list': CategoryProductListBlock,
  'stock-search-result-card': StockSearchResultCardBlock,
  'stock-detailed-product-card': StockDetailedProductCardBlock,
  'stock-popup-card': StockPopupCardBlock,
  'stock-simple-card': StockSimpleCardBlock,
  'order-header': OrderHeaderBlock,
  'order-product-info': OrderProductInfoBlock,
  'order-variant-selector': OrderVariantSelectorBlock,
  'order-summary-footer': OrderSummaryFooterBlock,
  'admin-user-card': AdminUserCardBlock,
  'history-search': HistorySearchBlock,
  'client-history-card': ClientHistoryCardBlock,
  'transaction-card': TransactionCardBlock,
  'history-links': HistoryLinksBlock,
  'production-list': ProductionListBlock,
  'ready-stock-list': ReadyStockListBlock,
  'standard-button': StandardButtonBlock,
  
  // REGISTRO DO NOVO BLOCO
  'total-sales': TotalSalesBlock,
};