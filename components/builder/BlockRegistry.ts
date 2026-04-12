'use client';

import React from 'react';
import { BlockComponentProps } from '@/types/builder';

// --- Imports de Blocos do Sistema ---
import { SellerSalesDashboardBlock } from './blocks/seller/SellerSalesDashboardBlock';
import { AuthorizedSellerMenuBlock } from './blocks/AuthorizedSellerMenuBlock';
import { LoginSecurityBlock } from './blocks/LoginSecurityBlock';


import { AuthorizedSellerProfileBlock } from './blocks/AuthorizedSellerProfileBlock';

import { SellerDashboardBlock } from './blocks/SellerDashboardBlock';
import { UserProfileSettingsBlock } from './blocks/UserProfileSettingsBlock';
import { PaymentMethodsBlock } from './blocks/PaymentMethodsBlock';
import { CatalogShowcaseBlock } from './blocks/CatalogShowcaseBlock';
import { MarylandCatalogBlock } from './blocks/MarylandCatalogBlock';
import { MasterGuardianDashboard } from "./blocks/MasterGuardianDashboard";
import { StandardButtonBlock } from './blocks/StandardButtonBlock';
import { JeansRegistrationBlock } from './blocks/JeansRegistrationBlock';
import { HealthMonitorBlock } from './blocks/HealthMonitorBlock';

// --- Imports de Blocos de Layout e UI ---
import { HeaderBlock } from './blocks/Header';
import { ProductGridBlock } from './blocks/ProductGrid';
import { BannerBlock } from './blocks/Banner';
import { CategoriesBlock } from './blocks/Categories';
import { CategorySectionBlock } from './blocks/CategorySectionBlock'; 
import { FooterBlock } from './blocks/Footer';
import { WalkingModelBlock } from './blocks/WalkingModelBlock'; 

// --- Imports de Blocos Funcionais ---
import { UserInfoBlock } from './blocks/UserInfo';
import { InventoryFeatureBlock } from './blocks/InventoryFeature';
import { ActionButtonsBlock } from './blocks/ActionButtons';
import { GridButtonsBlock } from './blocks/GridButtons';
import { InfiniteCircularFooter } from './blocks/InfiniteCircularFooter';
import { OrganicPhysicsFooter } from './blocks/OrganicPhysicsFooter';
import { CollisionPhysicsFooter } from './blocks/CollisionPhysicsFooter';
import { NavigationFooter } from './blocks/NavigationFooter';
import { FisheyeFooter } from './blocks/FisheyeFooter';
import { LiquidDynamicFooter } from './blocks/LiquidDynamicFooter';

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
import { ActivityHistoryBlock } from './blocks/ActivityHistoryBlock';

// --- Novos Blocos de Inteligência e Conta ---
import { TotalSalesBlock } from './blocks/TotalSalesBlock';
import { AccountScreenBlock } from './blocks/AccountScreenBlock'; 
import { PersonalInfoBlock } from './blocks/account/PersonalInfoBlock';
import { RegistrationFormBlock } from './blocks/RegistrationFormBlock';
import { VideoBackgroundManagerBlock } from './blocks/admin/VideoBackgroundManagerBlock';
import { FormVideoBackgroundBlock } from './blocks/FormVideoBackgroundBlock';


/**
 * Definição Estrita do Componente Lego
 */
type LegoComponent = React.FC<BlockComponentProps>;

export const COMPONENT_MAP: Record<string, LegoComponent> = {
  'authorized-seller-profile': AuthorizedSellerProfileBlock,
  'seller-dashboard': SellerDashboardBlock, // O novo bloco que acabamos de criar
  'user-profile-settings': UserProfileSettingsBlock,
  'payment-methods': PaymentMethodsBlock,
  'catalog-showcase': CatalogShowcaseBlock,
  'master-guardian-dashboard': MasterGuardianDashboard,
  'health-monitor': HealthMonitorBlock, 
  'standard-button': StandardButtonBlock,
  'header': HeaderBlock,
  'footer': FooterBlock,
  'infinite-circular-footer': InfiniteCircularFooter,
  'organic-physics-footer': OrganicPhysicsFooter,
  'collision-physics-footer': CollisionPhysicsFooter,
  'navigation-footer': NavigationFooter,
  'fisheye-footer': FisheyeFooter,
  'liquid-dynamic-footer': LiquidDynamicFooter,
  'banner': BannerBlock,
  'categories': CategoriesBlock,
  'category-section': CategorySectionBlock, 
  /** Vitrine animada; o inventário de vendedor (card rosa, “Meus Clientes”) monta-se em `app/inventory/page.tsx`, não depende deste tipo. */
  'walking-model': WalkingModelBlock,
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
  'order-header': OrderHeaderBlock,
  'order-product-info': OrderProductInfoBlock,
  'order-variant-selector': OrderVariantSelectorBlock,
  'order-summary-footer': OrderSummaryFooterBlock,
  'user-info': UserInfoBlock,
  'inventory-feature': InventoryFeatureBlock,
  'action-buttons': ActionButtonsBlock,
  'grid-buttons': GridButtonsBlock,
  'admin-user-card': AdminUserCardBlock,
  'account-screen': AccountScreenBlock, 
  'personal-info': PersonalInfoBlock,
  'registration-form': RegistrationFormBlock,
  'history-search': HistorySearchBlock,
  'client-history-card': ClientHistoryCardBlock,
  'transaction-card': TransactionCardBlock,
  'history-links': HistoryLinksBlock,
  'production-list': ProductionListBlock,
  'ready-stock-list': ReadyStockListBlock,
  'activity-history': ActivityHistoryBlock,
  'total-sales': TotalSalesBlock,
  'jeans-registration': JeansRegistrationBlock,
  'seller-sales-dashboard': SellerSalesDashboardBlock,
  'authorized-seller-menu': AuthorizedSellerMenuBlock,
  'login-security': LoginSecurityBlock,
  'maryland-catalog': MarylandCatalogBlock,

  /** Login: upload Vercel Blob (multipart) + URL no Neon via saveVideoReferenceAction */
  'video-background-manager': VideoBackgroundManagerBlock,
  'form-video-background': FormVideoBackgroundBlock,
};