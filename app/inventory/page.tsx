'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { BlockConfig } from '@/types/builder';
import { INVENTORY_BLOCKS, STOCK_BLOCKS } from '@/data/inventory-state';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { checkForNewImage } from '@/app/actions';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { LocalDB } from '@/lib/local-db';
import { AuthorizedSellerBadge } from '@/components/builder/blocks/AuthorizedSellerBadge';
import { MeusClientesExpandible } from '@/components/builder/blocks/MeusClientesExpandible';
import { SIZING, SPACING, COLORS, BORDERS, SHADOWS, TYPOGRAPHY } from '@/lib/design-system';

// --- IMPORTS DOS POPUPS ---
import { StockModal } from '@/components/builder/ui/StockModal';
import { CatalogModal } from '@/components/builder/ui/CatalogModal';
import { OrdersModal } from '@/components/builder/ui/OrdersModal';

function InventoryPageBase(): React.JSX.Element {
  const routerNavigation = useRouter();
  const [inventoryBlocks, setInventoryBlocks] = useState<BlockConfig[]>(INVENTORY_BLOCKS);
  const [currentUserInformation, setCurrentUserInformation] = useState<ReturnType<typeof LocalDB.getUser>>(null);

  // --- ESTADOS DOS MODAIS ---
  const [isStockModalVisible, setIsStockModalVisible] = useState<boolean>(false);
  const [isCatalogModalVisible, setIsCatalogModalVisible] = useState<boolean>(false);
  const [isOrdersModalVisible, setIsOrdersModalVisible] = useState<boolean>(false);
  
  // --- ESTADO DO COMPONENTE EXPANSÍVEL ---
  const [isMyCustomersExpanded, setIsMyCustomersExpanded] = useState<boolean>(false);

  // --- CARREGAR DADOS DO USUÁRIO E ATUALIZAR BLOCOS ---
  useEffect(() => {
    const loadUserInformationAsync = async () => {
      // 🛡️ MICROTASK QUEUE: Evita o erro de "cascading renders" do React.
      // Permite que a primeira renderização termine antes de atualizar o estado síncrono.
      await Promise.resolve();

      const userInformation = LocalDB.getUser();
      setCurrentUserInformation(userInformation);
      
      // Atualizar nome do usuário no bloco user-info se não for vendedor
      const isUserSeller = userInformation && typeof userInformation.isVendedor === 'boolean' && userInformation.isVendedor === true;
      
      if (userInformation && !isUserSeller) {
        const validUserName = typeof userInformation.name === 'string' && userInformation.name.trim().length > 0 
          ? userInformation.name.trim() 
          : 'Usuário';

        setInventoryBlocks((currentBlocksConfiguration) =>
          currentBlocksConfiguration.map((configurationBlock) => {
            if (configurationBlock.id === 'inv_user_info' && configurationBlock.data && typeof configurationBlock.data === 'object') {
              return {
                ...configurationBlock,
                data: { ...configurationBlock.data, userName: validUserName }
              };
            }
            return configurationBlock;
          })
        );
      }
    };

    loadUserInformationAsync();
  }, []);

  // --- EFEITO DE MONITORAMENTO ---
  useEffect(() => {
    let isComponentMounted = true;
    
    const pollingInterval = setInterval(async () => {
      if (!isComponentMounted) return;
      try {
        const serverImageResponse = await checkForNewImage();
        if (serverImageResponse && isComponentMounted && typeof serverImageResponse === 'string') {
          setInventoryBlocks((currentBlocksConfiguration) =>
            currentBlocksConfiguration.map((configurationBlock) => {
              if (configurationBlock.type === 'inventory-feature' && configurationBlock.data && typeof configurationBlock.data === 'object') {
                const currentBoxImage = 'boxImage' in configurationBlock.data && typeof configurationBlock.data.boxImage === 'string' 
                  ? configurationBlock.data.boxImage 
                  : undefined;
                  
                if (currentBoxImage !== serverImageResponse) {
                  console.log("📸 Nova imagem detectada!");
                  return { ...configurationBlock, data: { ...configurationBlock.data, boxImage: serverImageResponse } };
                }
              }
              return configurationBlock;
            })
          );
        }
      } catch (error) {
        console.error("Erro ao verificar nova imagem:", error);
      }
    }, 5000);

    return () => {
      isComponentMounted = false;
      clearInterval(pollingInterval);
    };
  }, []);

  // Filtrar blocos: remover footer e user-info se for vendedor
  const scrollableBlocksList = inventoryBlocks.filter((blockItem) => {
    if (blockItem.type === 'footer') return false;
    if (blockItem.id === 'inv_user_info' && currentUserInformation && typeof currentUserInformation.isVendedor === 'boolean' && currentUserInformation.isVendedor === true) {
      return false;
    }
    return true;
  });

  // Debug temporário para verificar se o bloco está sendo incluído
  if (process.env.NODE_ENV === 'development') {
    const actionButtonsBlock = inventoryBlocks.find((blockItem) => blockItem.id === 'inv_actions_bottom');
    if (actionButtonsBlock) {
      console.log('[InventoryPage] Bloco action-buttons encontrado:', {
        id: actionButtonsBlock.id,
        type: actionButtonsBlock.type,
        isVisible: actionButtonsBlock.isVisible,
        buttonsCount: Array.isArray(actionButtonsBlock.data?.buttons) ? actionButtonsBlock.data.buttons.length : 0
      });
    } else {
      console.warn('[InventoryPage] Bloco inv_actions_bottom NÃO encontrado nos blocos!');
    }
    console.log('[InventoryPage] Total de blocos scrollable:', scrollableBlocksList.length);
    console.log('[InventoryPage] Tipos de blocos:', scrollableBlocksList.map((blockItem) => blockItem.type));
  }

  // --- GERENCIADOR DE AÇÕES ---
  const handleBlockActionExecution = (actionIdentifier: string) => {
    switch (actionIdentifier) {
      case 'openStockModal':
        // ✅ LÓGICA HÍBRIDA: Desktop vai para rota dedicada, Mobile abre modal
        if (typeof window !== 'undefined' && window.innerWidth > 1024) {
          routerNavigation.push('/inventory/register');
        } else {
          setIsStockModalVisible(true);
        }
        break;
      
      case 'openOrders': 
        setIsOrdersModalVisible(true); 
        break;

      case 'openCatalog': 
        setIsCatalogModalVisible(true); 
        break;

      default:
        console.log(`Ação executada: ${actionIdentifier}`);
    }
  };

  const handleProductRegistration = (productData: { image?: string }) => {
    if (productData.image && typeof productData.image === 'string') {
      setInventoryBlocks((currentBlocksConfiguration) =>
        currentBlocksConfiguration.map((configurationBlock) => {
          if (configurationBlock.type === 'inventory-feature' && configurationBlock.data && typeof configurationBlock.data === 'object') {
            return {
              ...configurationBlock,
              data: { ...configurationBlock.data, boxImage: productData.image }
            };
          }
          return configurationBlock;
        })
      );
    }
    setIsStockModalVisible(false);
  };

  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      <div className={cn(
        "w-full h-full bg-[#eeeeee] flex flex-col relative overflow-hidden",
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-8 lg:border-gray-900 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto"
      )}>

        {/* 1. TOPO FIXO */}
        <div className="shrink-0 z-60 bg-[#5874f6] relative border-b border-blue-600/20">
          <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl pointer-events-none z-50"></div>
          <StoreHeader 
            data={{ title: '', address: 'Inventário Maryland' }} 
            style={{ bgColor: '#5874f6', textColor: '#ffffff' }} 
          />
        </div>

        {/* 2. ÁREA CENTRAL */}
        <div className="flex-1 relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide overscroll-contain pb-28">
            <div className="flex flex-col pt-0 min-h-full">
              {/* Badge de Vendedor Autorizado */}
              {currentUserInformation && typeof currentUserInformation.isVendedor === 'boolean' && currentUserInformation.isVendedor === true && (
                <>
                  <div className="w-full px-4 pt-2 pb-1">
                    <AuthorizedSellerBadge user={currentUserInformation} />
                  </div>
                  
                  {/* Botão Meus Clientes - Usando Design System ✨ */}
                  <div className={cn(
                    SPACING.horizontal.md,     // px-4
                    SPACING.vertical.sm,       // py-2
                    "w-full"
                  )}>
                    <button
                      onClick={() => setIsMyCustomersExpanded(!isMyCustomersExpanded)}
                      className={cn(
                        "w-full",
                        SIZING.button.lg,        // h-12 min-w-[120px]
                        SPACING.horizontal.md,   // px-4
                        isMyCustomersExpanded ? COLORS.bg.success : COLORS.bg.primary, // bg dinâmico
                        COLORS.text.white,       // text-white
                        BORDERS.radius.xl,       // rounded-xl
                        SHADOWS.component.button, // shadow-sm hover:shadow-md
                        TYPOGRAPHY.button.base,  // text-sm font-semibold
                        "transition-all duration-200",
                        "hover:scale-[1.02]",
                        "active:scale-[0.98]",
                        "flex items-center justify-center gap-2"
                      )}
                    >
                      {/* Ícone de usuários */}
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{isMyCustomersExpanded ? 'Fechar Clientes' : 'Meus Clientes'}</span>
                    </button>
                  </div>

                  {/* Componente Expansível de Clientes */}
                  <MeusClientesExpandible 
                    isOpen={isMyCustomersExpanded}
                    onClose={() => setIsMyCustomersExpanded(false)}
                  />
                </>
              )}
              
              <AnimatePresence mode='popLayout'>
                {scrollableBlocksList.map((blockItem) => (
                  <BlockRenderer
                    key={blockItem.id}
                    config={blockItem}
                    onAction={handleBlockActionExecution}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* MODAIS - Renderizados fora da área de scroll para evitar problemas de z-index */}
        {isStockModalVisible && (
          <StockModal
            isOpen={isStockModalVisible}
            onClose={() => setIsStockModalVisible(false)}
            blocks={STOCK_BLOCKS}
            onProductRegister={handleProductRegistration}
          />
        )}

        {isCatalogModalVisible && (
          <CatalogModal
            isOpen={isCatalogModalVisible}
            onClose={() => setIsCatalogModalVisible(false)}
          />
        )}

        {isOrdersModalVisible && (
          <OrdersModal
            isOpen={isOrdersModalVisible}
            onClose={() => setIsOrdersModalVisible(false)}
          />
        )}

      </div>
    </main>
  );
}

// 2. Exportação com a Etiqueta Inteligente (Guardian Beacon)
export default withGuardian(
  InventoryPageBase,
  "app/inventory/page.tsx",
  "LAYOUT",
  {
    label: "Dashboard de Inventário",
    description: "Hub central de controle de estoque. Gerencia navegação para Catálogo, Pedidos e Cadastro.",
    orientationNotes: `
📌 **Estrutura**:
- Layout Mobile-First com container centralizado em Desktop.
- Utiliza 'BlockRenderer' para renderizar componentes dinâmicos (Lego).
- Gerencia estado de 3 Modais principais.
- **Roteamento Híbrido**: Redireciona para /inventory/register em Desktop.
    `.trim(),
    connectsTo: [
      { 
        target: "components/builder/ui/StockModal.tsx", 
        type: "COMPONENT", 
        description: "Modal de Cadastro de Estoque" 
      },
      { 
        target: "components/builder/ui/CatalogModal.tsx", 
        type: "COMPONENT", 
        description: "Modal de Catálogo (Loja)" 
      },
      { 
        target: "components/builder/ui/OrdersModal.tsx", 
        type: "COMPONENT", 
        description: "Modal de Visualização de Pedidos" 
      },
      { 
        target: "app/actions.ts", 
        type: "EXTERNAL", 
        description: "Server Action: checkForNewImage (Polling)" 
      },
      {
        target: "app/inventory/register/page.tsx",
        type: "ROUTE",
        description: "Rota Desktop para Cadastro"
      }
    ],
    tags: ["Main Route", "Dashboard", "Inventory", "Hybrid Routing"]
  }
);