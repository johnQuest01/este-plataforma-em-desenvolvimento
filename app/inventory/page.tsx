// path: src/app/inventory/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ✅ GUARDIAN: Importação do HOC
import { withGuardian } from "@/components/guardian/GuardianBeacon";

import { BlockConfig } from '@/types/builder';
import { INVENTORY_BLOCKS, STOCK_BLOCKS } from '@/data/inventory-state';
import { FooterBlock } from '@/components/builder/blocks/Footer';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { checkForNewImage } from '@/app/actions';
import { StoreHeader } from '@/components/builder/blocks/Header';

// --- IMPORTS DOS POPUPS ---
import { StockModal } from '@/components/builder/ui/StockModal';
import { CatalogModal } from '@/components/builder/ui/CatalogModal'; // Tela de Fazer Pedido (Loja)
import { OrdersModal } from '@/components/builder/ui/OrdersModal';   // Tela de Ver Pedidos (Status)

// 1. Renomeamos o componente para "Base" para poder envolver no HOC depois
function InventoryPageBase() {
  const [blocks, setBlocks] = useState<BlockConfig[]>(INVENTORY_BLOCKS);

  // --- ESTADOS DOS MODAIS ---
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false); // Modal Catálogo
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);   // Modal Pedidos (Novo)

  const [mounted, setMounted] = useState(false);

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

  const footerBlock = blocks.find(b => b.type === 'footer');
  const scrollableBlocks = blocks.filter(b => b.type !== 'footer');

  // --- GERENCIADOR DE AÇÕES ---
  const handleBlockAction = (action: string) => {
    switch (action) {
      case 'openStockModal':
        setIsStockModalOpen(true);
        break;
      
      case 'openOrders': 
        // Botão "Pedidos" (Grid Topo) -> Abre Lista de Status
        setIsOrdersModalOpen(true); 
        break;

      case 'openCatalog': 
        // Botão "Fazer pedido" (Botões Baixo) -> Abre a Loja/Catálogo
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
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide overscroll-contain pb-24">
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

        {/* 3. RODAPÉ FIXO */}
        {footerBlock && footerBlock.isVisible && (
          <div className="absolute bottom-0 left-0 w-full z-50 pb-safe-bottom bg-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <FooterBlock config={footerBlock} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// 2. Exportação com a Etiqueta Inteligente (Guardian Beacon)
// Agora esta página aparecerá na "Tela Ativa" e mostrará suas conexões no "Modo Foco".
export default withGuardian(
  InventoryPageBase,
  "app/inventory/page.tsx",
  "LAYOUT", // Tipo LAYOUT pois é uma página estrutural
  {
    label: "Dashboard de Inventário",
    description: "Hub central de controle de estoque. Gerencia navegação para Catálogo, Pedidos e Cadastro.",
    orientationNotes: `
📌 **Estrutura**:
- Layout Mobile-First com container centralizado em Desktop.
- Utiliza 'BlockRenderer' para renderizar componentes dinâmicos (Lego).
- Gerencia estado de 3 Modais principais.
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
      }
    ],
    tags: ["Main Route", "Dashboard", "Inventory"]
  }
);