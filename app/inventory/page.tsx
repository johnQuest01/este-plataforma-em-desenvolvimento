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
import { LocalDB, LOCAL_USER_DB_KEY, isSellerUser, isAdminUser, inferNameGenderFromFullName } from '@/lib/local-db';
import { syncUserProfileForClientAction } from '@/app/actions/session-sync-actions';
import { AuthorizedSellerBadge } from '@/components/builder/blocks/AuthorizedSellerBadge';
import { MeusClientesExpandible } from '@/components/builder/blocks/MeusClientesExpandible';
import { SIZING, SPACING, COLORS, BORDERS, SHADOWS, TYPOGRAPHY } from '@/lib/design-system';

// --- IMPORTS DOS POPUPS ---
import { StockModal } from '@/components/builder/ui/StockModal';
import { CatalogModal } from '@/components/builder/ui/CatalogModal';
import { OrdersModal } from '@/components/builder/ui/OrdersModal';
import { StockModalContainer } from '@/components/builder/ui/stock-modal/StockModalContainer';
import { MarylandCatalogBlock } from '@/components/builder/blocks/MarylandCatalogBlock';
import { SellerOwnStockBlock } from '@/components/builder/blocks/SellerOwnStockBlock';
import { ShareStoreButton } from '@/components/seller-store/ShareStoreButton';

function InventoryPageBase(): React.JSX.Element {
  const routerNavigation = useRouter();
  const [inventoryBlocks, setInventoryBlocks] = useState<BlockConfig[]>(INVENTORY_BLOCKS);
  const [currentUserInformation, setCurrentUserInformation] = useState<ReturnType<typeof LocalDB.getUser>>(null);
  const [inventoryHeaderAddress, setInventoryHeaderAddress] = useState<string>('Inventário Maryland');

  // --- ESTADOS DOS MODAIS ---
  const [isStockModalVisible, setIsStockModalVisible] = useState<boolean>(false);
  const [isCatalogModalVisible, setIsCatalogModalVisible] = useState<boolean>(false);
  const [isOrdersModalVisible, setIsOrdersModalVisible] = useState<boolean>(false);
  // Catálogo global Maryland — abre para vendedores escolherem itens
  const [isMarylandCatalogVisible, setIsMarylandCatalogVisible] = useState<boolean>(false);
  // Estoque pessoal da vendedora — lista o que ela já pegou do catálogo
  const [isSellerStockVisible, setIsSellerStockVisible] = useState<boolean>(false);
  
  // --- ESTADO DO COMPONENTE EXPANSÍVEL ---
  const [isMyCustomersExpanded, setIsMyCustomersExpanded] = useState<boolean>(false);

  // --- CARREGAR DADOS DO USUÁRIO E ATUALIZAR BLOCOS ---
  useEffect(() => {
    const loadUserInformationAsync = async () => {
      // 🛡️ MICROTASK QUEUE: Evita o erro de "cascading renders" do React.
      // Permite que a primeira renderização termine antes de atualizar o estado síncrono.
      await Promise.resolve();

      const userInformation = LocalDB.getUser();

      // ── GUARD DE AUTENTICAÇÃO ─────────────────────────────────────────────
      // Visitantes sem conta NÃO devem ter acesso à tela de inventário.
      // O link da vendedora leva para o dashboard; o inventário é área interna.
      if (!userInformation) {
        // Preserva o contexto da vendedora no redirect, se houver
        const sellerRef =
          typeof window !== 'undefined' ? localStorage.getItem('md_seller_ref') ?? '' : '';
        routerNavigation.replace(sellerRef ? `/?seller=${sellerRef}` : '/');
        return;
      }

      setCurrentUserInformation(userInformation);
      if (userInformation?.name) {
        const firstName = userInformation.name.trim().split(/\s+/)[0];
        if (firstName && firstName.length > 0) {
          setInventoryHeaderAddress(`Inventário ${firstName}`);
        }
      }
      
      // Atualizar nome do usuário no bloco user-info se for comprador (não vendedor)
      const isUserSeller = isSellerUser(userInformation);

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
  }, [routerNavigation]);

  // Sincroniza role/nome/foto com o Neon para sessões antigas (só `role: seller` sem `isVendedor`, etc.)
  useEffect(() => {
    let cancelled = false;

    const syncProfile = async () => {
      const local = LocalDB.getUser();
      if (!local?.id) return;

      const res = await syncUserProfileForClientAction(local.id);
      if (cancelled || !res.success || !res.data) return;

      const d = res.data;
      const merged = LocalDB.updateUser({
        name: d.userName,
        role: d.role,
        isVendedor: d.role === 'seller',
        emailAddress: d.emailAddress,
        whatsapp: d.phoneNumber,
        document: d.documentNumber,
        type: d.documentType === 'CNPJ' ? 'juridica' : 'fisica',
        profilePictureUrl: d.profilePictureUrl,
        nameGender: inferNameGenderFromFullName(d.userName),
      });

      if (!cancelled && merged) {
        setCurrentUserInformation(merged);
        if (merged.name) {
          const firstName = merged.name.trim().split(/\s+/)[0];
          if (firstName) setInventoryHeaderAddress(`Inventário ${firstName}`);
        }
      }
    };

    void syncProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const userInformation = LocalDB.getUser();
      setCurrentUserInformation(userInformation);
      if (userInformation?.name) {
        const firstName = userInformation.name.trim().split(/\s+/)[0];
        if (firstName && firstName.length > 0) {
          setInventoryHeaderAddress(`Inventário ${firstName}`);
        }
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === LOCAL_USER_DB_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
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

  const isSeller = isSellerUser(currentUserInformation);
  const isAdmin  = isAdminUser(currentUserInformation);

  // Filtrar blocos conforme papel do usuário
  const scrollableBlocksList = inventoryBlocks
    .filter((blockItem) => {
      if (blockItem.type === 'footer') return false;
      // Oculta bloco user-info para vendedores (eles têm o badge próprio)
      if (blockItem.id === 'inv_user_info' && isSeller) return false;
      return true;
    })
    .map((blockItem) => {
      // Para vendedores: remove o botão "Estoque" (ABASTECER) do grid-buttons
      // Para admin: mantém "Estoque" intacto (abre o StockModal de cadastro)
      if (blockItem.type === 'grid-buttons' && isSeller && !isAdmin) {
        const buttons = Array.isArray(blockItem.data.buttons)
          ? (blockItem.data.buttons as Array<{ id: string; label: string; action?: string }>)
              .filter((btn) => btn.id !== 'btn_stock')
          : blockItem.data.buttons;
        return { ...blockItem, data: { ...blockItem.data, buttons } };
      }
      return blockItem;
    });

  // --- GERENCIADOR DE AÇÕES ---
  const handleBlockActionExecution = (actionIdentifier: string) => {
    switch (actionIdentifier) {
      case 'openStockModal': {
        // Lê direto do LocalDB (síncrono) para não depender do estado React
        const currentUser = LocalDB.getUser();
        if (isAdminUser(currentUser)) {
          if (typeof window !== 'undefined' && window.innerWidth > 1024) {
            routerNavigation.push('/inventory/register');
          } else {
            setIsStockModalVisible(true);
          }
        }
        break;
      }

      case 'openMarylandCatalog':
        setIsMarylandCatalogVisible(true);
        break;

      case 'openSellerStock':
        setIsSellerStockVisible(true);
        break;
      
      case 'openOrders': 
        setIsOrdersModalVisible(true); 
        break;

      case 'openCatalog': 
        setIsCatalogModalVisible(true); 
        break;

      case 'GO_BACK':
        setIsMarylandCatalogVisible(false);
        setIsSellerStockVisible(false);
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
            data={{ title: '', address: inventoryHeaderAddress }} 
            style={{ bgColor: '#5874f6', textColor: '#ffffff' }} 
          />
        </div>

        {/* 2. ÁREA CENTRAL */}
        <div className="flex-1 relative overflow-hidden w-full">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide overscroll-contain pb-28">
            <div className="flex flex-col pt-0 min-h-full">
              {/* Badge de Vendedor Autorizado */}
              {isSellerUser(currentUserInformation) && currentUserInformation && (
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
                      type="button"
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
                    sellerUserId={currentUserInformation.id}
                  />

                  {/* Compartilhar loja */}
                  <div className="w-full px-4 pb-2">
                    <ShareStoreButton />
                  </div>

                  {/* Botões de estoque para a vendedora */}
                  <div className="w-full px-4 pb-2 flex gap-2">
                    {/* Meu Estoque — vê o que já tem no estoque pessoal */}
                    <button
                      type="button"
                      onClick={() => handleBlockActionExecution('openSellerStock')}
                      className="flex-1 h-12 px-3 bg-[#5874f6] text-white rounded-xl shadow-sm font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#4a63e0] active:scale-[0.98] transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      <span>Meu Estoque</span>
                    </button>

                    {/* Estoque Maryland — catálogo global para pegar produtos */}
                    <button
                      type="button"
                      onClick={() => handleBlockActionExecution('openMarylandCatalog')}
                      className="flex-1 h-12 px-3 bg-[#F5A5C2] text-white rounded-xl shadow-sm font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#e891b0] active:scale-[0.98] transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      <span>Estoque Maryland</span>
                    </button>
                  </div>
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

        {/* Modal catálogo Maryland — vendedor escolhe produtos para seu estoque */}
        <StockModalContainer
          isOpen={isMarylandCatalogVisible}
          onClose={() => setIsMarylandCatalogVisible(false)}
        >
          <MarylandCatalogBlock
            config={{ id: 'maryland-catalog', type: 'maryland-catalog', isVisible: true, data: {}, style: { bgColor: '#ffffff' } }}
            onAction={(action) => {
              if (action === 'GO_BACK') setIsMarylandCatalogVisible(false);
            }}
          />
        </StockModalContainer>

        {/* Modal estoque pessoal — vendedor vê o que já tem no seu estoque */}
        <StockModalContainer
          isOpen={isSellerStockVisible}
          onClose={() => setIsSellerStockVisible(false)}
        >
          <SellerOwnStockBlock
            config={{ id: 'seller-stock', type: 'seller-own-stock' as never, isVisible: true, data: {}, style: {} }}
            onAction={(action) => {
              if (action === 'GO_BACK') setIsSellerStockVisible(false);
            }}
          />
        </StockModalContainer>

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