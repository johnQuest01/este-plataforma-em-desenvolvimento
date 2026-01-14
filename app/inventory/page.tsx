'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { BlockConfig, FooterItem } from '@/types/builder';
import { INVENTORY_BLOCKS, STOCK_BLOCKS } from '@/data/inventory-state';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { checkForNewImage } from '@/app/actions';
import { StoreHeader } from '@/components/builder/blocks/Header';
import { ButtonsFooter } from '@/components/builder/ui/ButtonsFooter';

// --- IMPORTS DOS POPUPS ---
import { StockModal } from '@/components/builder/ui/StockModal';
import { CatalogModal } from '@/components/builder/ui/CatalogModal';
import { OrdersModal } from '@/components/builder/ui/OrdersModal';

// --- CONFIGURAÇÃO DO FOOTER ---
const FOOTER_ITEMS: FooterItem[] = [
  { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
  { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
  { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
  { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
  { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
];

function InventoryPageBase() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockConfig[]>(INVENTORY_BLOCKS);

  // --- ESTADOS DOS MODAIS ---
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState<boolean>(false);

  const [mounted, setMounted] = useState<boolean>(false);

  // --- EFEITO DE MONITORAMENTO ---
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const interval = setInterval(async () => {
      const serverImage = await checkForNewImage();
      if (serverImage) {
        setBlocks(currentBlocks =>
          currentBlocks.map(block => {
            if (block.type === 'inventory-feature') {
              if (block.data.boxImage !== serverImage) {
                console.log("📸 Nova imagem detectada!");
                return { ...block, data: { ...block.data, boxImage: serverImage } };
              }
            }
            return block;
          })
        );
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const scrollableBlocks = blocks.filter(b => b.type !== 'footer');

  // Debug temporário para verificar se o bloco está sendo incluído
  if (process.env.NODE_ENV === 'development') {
    const actionButtonsBlock = blocks.find(b => b.id === 'inv_actions_bottom');
    if (actionButtonsBlock) {
      console.log('[InventoryPage] Bloco action-buttons encontrado:', {
        id: actionButtonsBlock.id,
        type: actionButtonsBlock.type,
        isVisible: actionButtonsBlock.isVisible,
        buttonsCount: Array.isArray(actionButtonsBlock.data.buttons) ? actionButtonsBlock.data.buttons.length : 0
      });
    } else {
      console.warn('[InventoryPage] Bloco inv_actions_bottom NÃO encontrado nos blocos!');
    }
    console.log('[InventoryPage] Total de blocos scrollable:', scrollableBlocks.length);
    console.log('[InventoryPage] Tipos de blocos:', scrollableBlocks.map(b => b.type));
  }

  // --- GERENCIADOR DE AÇÕES ---
  const handleBlockAction = (action: string) => {
    switch (action) {
      case 'openStockModal':
        // ✅ LÓGICA HÍBRIDA: Desktop vai para rota dedicada, Mobile abre modal
        if (typeof window !== 'undefined' && window.innerWidth > 1024) {
          router.push('/inventory/register');
        } else {
          setIsStockModalOpen(true);
        }
        break;
      
      case 'openOrders': 
        setIsOrdersModalOpen(true); 
        break;

      case 'openCatalog': 
        setIsCatalogModalOpen(true); 
        break;

      default:
        console.log(`Ação: ${action}`);
    }
  };

  const handleProductRegister = (data: { image?: string }) => {
    if (data.image) {
      setBlocks(currentBlocks =>
        currentBlocks.map(block => {
          if (block.type === 'inventory-feature') {
            return {
              ...block,
              data: { ...block.data, boxImage: data.image }
            };
          }
          return block;
        })
      );
    }
    setIsStockModalOpen(false);
  };

  if (!mounted) return null;

  return (
    <main className="w-full h-dvh-real bg-white lg:bg-gray-100 lg:flex lg:justify-center lg:items-center lg:py-8 overflow-hidden">
      <div className={cn(
        "w-full h-full bg-[#eeeeee] flex flex-col relative overflow-hidden",
        "lg:h-[850px] lg:max-h-[90vh] lg:w-full lg:max-w-[420px]",
        "lg:rounded-[2.5rem] lg:border-[8px] lg:border-gray-900 lg:shadow-2xl",
        "max-w-[100vw] lg:mx-auto"
      )}>

        {/* 1. TOPO FIXO */}
        <div className="shrink-0 z-[60] bg-[#5874f6] relative border-b border-blue-600/20">
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
              <AnimatePresence mode='popLayout'>
                {scrollableBlocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    config={block}
                    onAction={handleBlockAction}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* MODAL DE ESTOQUE */}
          <StockModal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            blocks={STOCK_BLOCKS}
            onProductRegister={handleProductRegister}
          />

          {/* MODAL FAZER PEDIDO (CATÁLOGO/LOJA) */}
          <CatalogModal
            isOpen={isCatalogModalOpen}
            onClose={() => setIsCatalogModalOpen(false)}
          />

          {/* MODAL VER PEDIDOS (STATUS) */}
          <OrdersModal
            isOpen={isOrdersModalOpen}
            onClose={() => setIsOrdersModalOpen(false)}
          />

        </div>

        {/* 3. RODAPÉ FIXO - Menu de Navegação (Sempre Visível) - FISHEYE FOOTER */}
        {/* 3. RODAPÉ FIXO - Menu de Navegação (Sempre Visível) */}
        <div className="absolute bottom-0 left-0 w-full z-[100] pb-safe-bottom bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <ButtonsFooter items={FOOTER_ITEMS} style={{ bgColor: '#5874f6' }} />
          </div>
        </div>

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