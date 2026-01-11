'use client';

import React from 'react';
import { BlockComponentProps } from '@/types/builder';

// --- Imports de Blocos do Sistema ---
import { MasterGuardianDashboard } from "./blocks/MasterGuardianDashboard";
import { StandardButtonBlock } from './blocks/StandardButtonBlock';
import { JeansRegistrationBlock } from './blocks/JeansRegistrationBlock';
import { HealthMonitorBlock } from './blocks/HealthMonitorBlock';

// --- Imports de Blocos de Layout e UI ---
import { HeaderBlock } from './blocks/Header';
import { ProductGridBlock } from './blocks/ProductGrid';
import { BannerBlock } from './blocks/Banner';
import { CategoriesBlock } from './blocks/Categories';
import { FooterBlock } from './blocks/Footer';

// --- Imports de Blocos Funcionais ---
import { UserInfoBlock } from './blocks/UserInfo';
import { InventoryFeatureBlock } from './blocks/InventoryFeature';
import { ActionButtonsBlock } from './blocks/ActionButtons';
import { GridButtonsBlock } from './blocks/GridButtons';

// --- Imports de Blocos de Estoque e Catálogo ---
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

// --- Imports de Blocos de Pedidos (Order Flow) ---
import { OrderHeaderBlock } from './blocks/order/OrderHeaderBlock';
import { OrderProductInfoBlock } from './blocks/order/OrderProductInfoBlock';
import { OrderVariantSelectorBlock } from './blocks/order/OrderVariantSelectorBlock';
import { OrderSummaryFooterBlock } from './blocks/order/OrderSummaryFooterBlock';

// --- Imports de Blocos Administrativos e Histórico ---
import { AdminUserCardBlock } from '@/components/admin/AdminUserCard';
import { HistorySearchBlock } from './blocks/HistorySearch';
import { ClientHistoryCardBlock } from './blocks/ClientHistoryCard';
import { TransactionCardBlock } from './blocks/TransactionCard';
import { HistoryLinksBlock } from './blocks/HistoryLinksBlock';
import { ProductionListBlock } from './blocks/ProductionListBlock';
import { ReadyStockListBlock } from './blocks/ReadyStockListBlock';

// --- Novos Blocos de Inteligência ---
import { TotalSalesBlock } from './blocks/TotalSalesBlock';

/**
 * Definição Estrita do Componente Lego
 * Nota: Removido uso de 'as LegoComponent' no mapeamento para seguir Strict TS.
 */
type LegoComponent = React.FC<BlockComponentProps>;

export const COMPONENT_MAP: Record<string, LegoComponent> = {
  // Infraestrutura e Governança
  'master-guardian-dashboard': MasterGuardianDashboard,
  'health-monitor': HealthMonitorBlock, // Mantido no registro para compatibilidade, mas usado diretamente no layout
  'standard-button': StandardButtonBlock,

  // Layout Base
  'header': HeaderBlock,
  'footer': FooterBlock,
  'banner': BannerBlock,
  'categories': CategoriesBlock,

  // Ecommerce e Catálogo
  'product-grid': ProductGridBlock,
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

  // Gestão de Pedidos
  'order-header': OrderHeaderBlock,
  'order-product-info': OrderProductInfoBlock,
  'order-variant-selector': OrderVariantSelectorBlock,
  'order-summary-footer': OrderSummaryFooterBlock,

  // Fluxos de Negócio (Inventory/Admin)
  'user-info': UserInfoBlock,
  'inventory-feature': InventoryFeatureBlock,
  'action-buttons': ActionButtonsBlock,
  'grid-buttons': GridButtonsBlock,
  'admin-user-card': AdminUserCardBlock,
 
  // Histórico e Logística
  'history-search': HistorySearchBlock,
  'client-history-card': ClientHistoryCardBlock,
  'transaction-card': TransactionCardBlock,
  'history-links': HistoryLinksBlock,
  'production-list': ProductionListBlock,
  'ready-stock-list': ReadyStockListBlock,

  // Dashboard e Analytics
  'total-sales': TotalSalesBlock,
 
  // Produção
  'jeans-registration': JeansRegistrationBlock,
};