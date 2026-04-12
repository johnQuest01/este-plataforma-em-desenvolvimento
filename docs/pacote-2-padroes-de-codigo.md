# PACOTE 2 — Padrões de Código
> Envie este arquivo para o Google AI Studio criar novos blocos, server actions e templates.
> Contém: BlockRegistry · Blocos de exemplo · Server Action de Order · Templates de dados

---

## 📄 components/builder/BlockRegistry.ts

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
  /** Login: upload Vercel Blob (multipart) + URL no Neon via saveVideoReferenceAction */
  'video-background-manager': VideoBackgroundManagerBlock,
  'form-video-background': FormVideoBackgroundBlock,
};
```

---

## 📄 components/builder/blocks/StandardButtonBlock.tsx
> Bloco mais simples — use como template para criar qualquer novo bloco.

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';
import { StandardButtonDataSchema } from '@/schemas/blocks/button-schema';

export const StandardButtonBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  // PASSO 1: Sempre valide os dados com Zod
  const result = StandardButtonDataSchema.safeParse(config.data);

  if (!result.success) {
    return (
      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-mono">
        [LEGO_ERR]: {result.error.issues[0].message}
      </div>
    );
  }

  const { label, variant, size, actionType, fullWidthMobile, payload } = result.data;

  // PASSO 2: Mapeamento de estilos (nunca inline style quando possível)
  const styles = {
    variants: {
      primary: 'bg-[#5874f6] text-white shadow-xl shadow-blue-900/20 hover:bg-blue-500',
      secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
      outline: 'bg-transparent border-2 border-zinc-800 text-zinc-400 hover:bg-zinc-800',
      danger: 'bg-red-600 text-white hover:bg-red-500',
      ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-600',
      link: 'bg-transparent text-[#5874f6] hover:underline px-0 h-auto',
    },
    sizes: {
      sm: 'h-10 px-6 text-xs',
      md: 'h-14 px-8 text-sm',
      lg: 'h-16 px-12 text-base',
      icon: 'h-12 w-12 p-0',
    },
  };

  // PASSO 3: Delega ações para o pai via onAction
  return (
    <div className="w-full p-2 flex justify-center">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onAction?.(actionType, payload)}
        className={`
          ${styles.variants[variant]}
          ${styles.sizes[size]}
          ${fullWidthMobile ? 'w-full md:w-auto' : 'w-auto'}
          rounded-[1.4rem] font-black uppercase tracking-[0.15em]
          transition-all duration-300 cursor-pointer
          flex items-center justify-center gap-3
        `}
      >
        {label}
        {variant !== 'link' && <span className="opacity-30 text-xs">→</span>}
      </motion.button>
    </div>
  );
};
```

---

## 📄 components/builder/blocks/WalkingModelBlock.tsx
> Bloco com animação Framer Motion e sprites — exemplo de bloco visual complexo.

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlockComponentProps } from '@/types/builder';

export const WalkingModelBlock: React.FC<BlockComponentProps> = ({ config }) => {
  const { data, style } = config;

  const defaultImages = [
    '/models/modelo.1.png', '/models/modelo.2.png', '/models/modelo.3.png',
    '/models/modelo.4.png', '/models/modelo.5.png', '/models/modelo.6.png',
  ];

  const imagesArray: string[] = Array.isArray(data.walkingModelImages) && data.walkingModelImages.length > 0
    ? data.walkingModelImages as string[]
    : defaultImages;

  const bannerImage: string | null = typeof data.walkingModelBanner === 'string' && data.walkingModelBanner.trim() !== ''
    ? data.walkingModelBanner
    : '/models/maryland-banner.png';

  const animationDuration: number = typeof data.animationDurationSeconds === 'number'
    ? data.animationDurationSeconds : 12;

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (imagesArray.length === 0) return;
    const id = setInterval(() => setFrameIndex((c) => (c + 1) % imagesArray.length), 120);
    return () => clearInterval(id);
  }, [imagesArray.length]);

  if (imagesArray.length === 0) return null;

  return (
    <section
      className="w-full overflow-hidden py-4 relative flex items-center pointer-events-none min-h-[350px]"
      style={{ backgroundColor: style.bgColor || 'transparent' }}
    >
      <motion.div
        initial={{ x: '100vw' }}
        animate={{ x: '-100vw' }}
        transition={{ repeat: Infinity, duration: animationDuration, ease: 'linear' }}
        className="flex items-center gap-6 w-max pointer-events-auto"
      >
        <div className="relative h-[320px] aspect-[271/920] flex-shrink-0">
          {imagesArray.map((src, index) => (
            <img key={src} src={src} alt=""
              className={`absolute inset-0 w-full h-full object-contain transition-none ${index === frameIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              loading="eager" decoding="sync"
            />
          ))}
        </div>
        {bannerImage && (
          <img src={bannerImage} alt="Banner"
            className="h-[100px] object-contain flex-shrink-0 drop-shadow-xl"
            loading="lazy" decoding="async"
          />
        )}
      </motion.div>
    </section>
  );
};
```

---

## 📄 components/builder/blocks/ActivityHistoryBlock.tsx
> Bloco funcional com server action, estado inteligente e adaptação de dados do backend.

```typescript
'use client';

import React, { memo, useState } from 'react';
import { ChevronLeft, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BlockComponentProps } from '@/types/builder';
import { getActivityLogsAction } from '@/app/actions/activity';
import { ProductSaleCard, ProductSaleRecord } from './ProductSaleCard';

// DADOS MOCK — sempre ter um fallback visual
const MOCK_EXAMPLE_SALE: ProductSaleRecord = {
  id: 'mock-1', productName: '4 Grande de Jeans azul', status: 'Reprovado',
  sellerName: 'Suzana', paymentMethod: 'Pix', saleValue: 5856.00,
  productCode: '18564', orderNumber: '15475', saleDate: '24/01/2026', saleTime: '14:65',
};

// ADAPTER PATTERN — extrai dados de objetos desconhecidos sem usar "any"
const getStringProperty = (obj: object, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const entry = Object.entries(obj).find(([k]) => k === key);
    if (entry && typeof entry[1] === 'string') return entry[1];
  }
  return fallback;
};

const getNumberProperty = (obj: object, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const entry = Object.entries(obj).find(([k]) => k === key);
    if (entry && typeof entry[1] === 'number') return entry[1];
  }
  return fallback;
};

function ActivityHistoryBlockInner({ config, onAction }: BlockComponentProps): React.JSX.Element {
  const { data, style } = config;
  const router = useRouter();

  const blockTitle = data.title || 'Historico de Atividades';
  const blockSubtitle = data.subtitle || 'Historico de Compras';

  // Botões configuráveis via data, com fallback padrão
  const activityButtons = data.activityButtons || [
    { id: 'btn_status',    label: 'Status de Pedido',    actionRoute: '/status' },
    { id: 'btn_box',       label: 'Meu Box Maryland',    actionRoute: '/box' },
    { id: 'btn_favorites', label: 'Meus Favoritos',      actionRoute: '/favorites' },
    { id: 'btn_bag',       label: 'Sacola',              actionRoute: '/cart' },
    { id: 'btn_sales',     label: 'Histórico de Vendas', actionRoute: '/history' },
    { id: 'btn_cashier',   label: 'Caixa Virtual',       actionRoute: '/pos' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // null = estado inicial (mostra mock) | [] = sem resultados | [...] = resultados reais
  const [searchResults, setSearchResults] = useState<ProductSaleRecord[] | null>(null);

  const handleNavigation = (route: string) => {
    if (onAction) { onAction('NAVIGATE', route); } else { router.push(route); }
  };

  const handleSearchSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const response = await getActivityLogsAction({ searchQueryInformation: searchQuery, startDateInformation: startDate, endDateInformation: endDate, storeIdentifier: 'current-store-id' });
      if (response.success) {
        const mapped: ProductSaleRecord[] = Array.isArray(response.data)
          ? response.data.map((item) => {
              if (typeof item === 'object' && item !== null) {
                return {
                  id: getStringProperty(item, ['id', 'orderId'], String(Math.random())),
                  productName: getStringProperty(item, ['productName', 'name'], 'Produto'),
                  status: getStringProperty(item, ['status'], 'Concluído'),
                  sellerName: getStringProperty(item, ['sellerName', 'seller'], 'Vendedora'),
                  paymentMethod: getStringProperty(item, ['paymentMethod', 'payment'], 'Pix'),
                  saleValue: getNumberProperty(item, ['saleValue', 'total', 'amount'], 0),
                  productCode: getStringProperty(item, ['productCode', 'sku'], '00000'),
                  orderNumber: getStringProperty(item, ['orderNumber', 'id'], '00000'),
                  saleDate: getStringProperty(item, ['saleDate', 'createdAt'], new Date().toLocaleDateString('pt-BR')),
                  saleTime: getStringProperty(item, ['saleTime', 'time'], '00:00'),
                };
              }
              return MOCK_EXAMPLE_SALE;
            })
          : [];
        setSearchResults(mapped);
      } else {
        setSearchResults([]);
      }
    } catch { setSearchResults([]); }
    finally { setIsSearching(false); }
  };

  return (
    <div
      className="flex flex-col items-center w-full max-w-md mx-auto px-4 pt-2 pb-28 bg-white min-h-0 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-y-contain scrollbar-hide"
      style={{ backgroundColor: style.bgColor, color: style.textColor ?? '#374151' }}
    >
      <button type="button" onClick={() => onAction ? onAction('GO_BACK') : router.back()}
        className="flex items-center gap-0.5 p-1 -ml-3 rounded-full text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        <span className="text-xs font-bold">Voltar</span>
      </button>

      <h1 className="mb-2 text-center text-xl font-bold text-gray-800">{blockTitle}</h1>
      <History className="h-10 w-10 text-gray-600 mb-4" strokeWidth={2} />

      {/* Grid de botões de ação — configurável via data.activityButtons */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {(activityButtons as Array<{ id: string; label: string; actionRoute: string }>).map((btn) => (
          <button key={btn.id} onClick={() => handleNavigation(btn.actionRoute)}
            className="flex items-center justify-center rounded-lg border border-gray-400 px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <h2 className="mb-2 text-center text-lg font-bold text-gray-600">{blockSubtitle}</h2>

      <form onSubmit={handleSearchSubmission} className="w-full flex flex-col items-center">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-400 px-4 py-2 mb-3 text-gray-800 outline-none focus:border-[#5874f6] focus:ring-2 focus:ring-[#5874f6]/30"
        />
        <div className="flex items-center gap-2 mb-5">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-32 border-b border-gray-400 bg-transparent px-1 py-1 text-center text-sm text-gray-800 outline-none"
          />
          <span className="text-sm font-bold text-gray-600">até</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-32 border-b border-gray-400 bg-transparent px-1 py-1 text-center text-sm text-gray-800 outline-none"
          />
        </div>
        <button type="submit" disabled={isSearching}
          className="bg-[#5874f6] text-white font-bold text-lg px-8 py-1.5 rounded-full hover:bg-blue-700 disabled:opacity-70"
        >
          {isSearching ? 'Buscando...' : (data.searchFormButtonLabel as string) || 'Buscar'}
        </button>
      </form>

      <div className="w-full mt-8 flex flex-col gap-4">
        {searchResults === null ? (
          <ProductSaleCard data={MOCK_EXAMPLE_SALE} isExample={true} />
        ) : searchResults.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="font-bold text-gray-500">Nenhuma venda encontrada.</p>
          </div>
        ) : (
          searchResults.map((sale) => <ProductSaleCard key={sale.id} data={sale} />)
        )}
      </div>
    </div>
  );
}

export const ActivityHistoryBlock = memo(ActivityHistoryBlockInner);
```

---

## 📄 app/actions/order.ts
> Padrão de server action com Zod, transação atômica, baixa de estoque e revalidação de cache.

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// SCHEMAS ZOD (validação de entrada)
const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

const CreateOrderSchema = z.object({
  title: z.string(),
  total: z.number(),
  itemsCount: z.number(),
  items: z.array(OrderItemSchema).optional(),
  paymentMethod: z.string().optional(),
  customerName: z.string().optional(),
  customerDoc: z.string().optional(),
  emitInvoice: z.boolean().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export interface OrderData {
  id: string; title: string; total: number; status: string; statusLabel: string;
  paymentMethod: string; createdAt: string; itemsCount: number;
  customerName?: string | null; customerDoc?: string | null; hasInvoice?: boolean;
}

export async function createOrderAction(input: CreateOrderInput) {
  const result = CreateOrderSchema.safeParse(input);
  if (!result.success) return { success: false, error: result.error.flatten() };
  const data = result.data;

  try {
    // Resolve loja (auto-cura se não existir)
    const defaultStore = await prisma.store.findFirst({ select: { id: true } });
    let storeId = defaultStore?.id;
    if (!storeId) {
      const newStore = await prisma.store.create({
        data: { name: 'Loja Principal', slug: `main-store-${Date.now()}`,
          owner: { connectOrCreate: { where: { document: '00000000000' }, create: { document: '00000000000', role: 'admin' } } }
        },
      });
      storeId = newStore.id;
    }

    // TRANSAÇÃO ATÔMICA: pedido + baixa de estoque
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          storeId,
          total: new Prisma.Decimal(data.total),
          status: 'COMPLETED',
          customerName: data.customerName,
          customerPhone: data.customerDoc,
          items: { create: data.items?.map((item) => ({ productId: item.productId, quantity: item.quantity, price: new Prisma.Decimal(0) })) },
        },
      });

      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }

      return order;
    });

    revalidatePath('/pos');
    revalidatePath('/dashboard');

    return { success: true, order: { id: newOrder.id, total: Number(newOrder.total), status: newOrder.status, createdAt: newOrder.createdAt.toISOString() } };
  } catch (error) {
    console.error('Falha ao criar pedido:', error);
    return { success: false, message: 'Erro ao processar venda.' };
  }
}

export async function getOrdersAction(): Promise<OrderData[]> {
  try {
    const orders = await prisma.order.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { items: true } });
    return orders.map((order) => ({
      id: order.id,
      title: order.customerName || `Venda #${order.id.slice(-4).toUpperCase()}`,
      total: Number(order.total),
      status: order.status,
      statusLabel: order.status === 'COMPLETED' ? 'Venda Finalizada' : 'Pendente',
      paymentMethod: 'PIX',
      createdAt: order.createdAt.toISOString(),
      itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
      customerName: order.customerName,
      customerDoc: order.customerPhone,
      hasInvoice: true,
    }));
  } catch { return []; }
}
```

---

## 📄 data/inventory-state.ts
> Padrão de arquivo de estado: array de BlockConfig para montar telas via BlockRenderer.

```typescript
import { BlockConfig } from '@/types/builder';

// REGRA: Cada bloco tem id único, type do BlockType, isVisible, data e style.
// O BlockRenderer lê estes configs e renderiza o componente correto via COMPONENT_MAP.

export const INVENTORY_BLOCKS: BlockConfig[] = [
  {
    id: 'inv_user_info',
    type: 'user-info',
    isVisible: true,
    data: {
      userName: 'Bruno',
      bagPinkTitle: 'BAG COMPRAS',
      bagBlueTitle: 'BAG MOCHILA',
      mainTitle: 'Meu Inventário Maryland',
    },
    style: { bgColor: '#eeeeee' },
  },
  {
    id: 'inv_grid_top',
    type: 'grid-buttons',
    isVisible: true,
    data: {
      buttons: [
        { id: 'btn_hist', label: 'Histórico de Compras' },
        { id: 'btn_stock', label: 'Estoque', action: 'openStockModal' },
        { id: 'btn_login', label: 'Login / Senha' },
        { id: 'btn_orders', label: 'Pedidos', action: 'openOrders' },
      ],
    },
    style: { bgColor: '#eeeeee' },
  },
  {
    id: 'inv_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
        { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
        { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
        { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' },
      ],
    },
    style: { bgColor: '#5874f6' },
  },
];
```

---

## 📄 data/initial-state.ts
> Estado inicial da tela home (dashboard da loja).

```typescript
import { BlockConfig } from '@/types/builder';

export const INITIAL_BLOCKS: BlockConfig[] = [
  {
    id: 'blk_header_main',
    type: 'header',
    isVisible: true,
    data: { address: 'Rua Antonio Trajano...' },
    style: { bgColor: '#5874f6', textColor: '#ffffff' },
  },
  {
    id: 'blk_banner_main',
    type: 'banner',
    isVisible: true,
    data: {},
    style: { bgColor: '#ffffff', textColor: '#000000', borderRadius: '1rem' },
  },
  {
    id: 'blk_categories_top',
    type: 'categories',
    isVisible: true,
    data: {
      items: [
        { label: 'Praia', icon: 'sun', videoUrl: 'https://videos.pexels.com/...', videoColor: '#fbbf24' },
        { label: 'Destaques', icon: 'star', videoUrl: 'https://videos.pexels.com/...', videoColor: '#5874f6' },
      ],
    },
    style: { bgColor: 'transparent', textColor: '#111827' },
  },
  {
    id: 'blk_footer_main',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
        { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
        { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
        { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' },
      ],
    },
    style: { bgColor: '#5874f6' },
  },
];
```
