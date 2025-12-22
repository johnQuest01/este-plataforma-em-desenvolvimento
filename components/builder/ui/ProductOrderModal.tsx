// components/builder/ui/ProductOrderModal.tsx
'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductData } from '@/app/actions/product';
import { OrderProvider, useOrder } from '@/components/builder/context/OrderContext';
import { BlockRenderer } from '@/components/builder/BlockRender';
import { generateOrderModalBlocks } from '@/utils/order-config-helper';
import { BlockConfig } from '@/types/builder';
import { X } from 'lucide-react';
// IMPORTAR A AÇÃO
import { createOrderAction } from '@/app/actions/order'; 

interface ProductOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
}

const OrderModalContent = ({
  blocks,
  onClose
}: {
  blocks: BlockConfig[],
  onClose: () => void
}) => {
  const { buyQuantity, totalValue, isValidCombination } = useOrder();

  // Separa o Footer (Botão Confirmar)
  const footerBlock = blocks.find(b => b.type === 'order-summary-footer');
  const scrollableBlocks = blocks.filter(b => b.type !== 'order-summary-footer');

  const handleAction = async (action: string) => {
    if (action === 'submitOrder') {
      if (!isValidCombination) {
        return alert("⚠️ Selecione todas as opções antes de confirmar.");
      }

      // --- LÓGICA DE SALVAR PEDIDO ---
      const productTitle = blocks.find(b => b.type === 'order-product-info')?.data.productName as string || 'Produto';

      // CORREÇÃO: Passamos 'totalValue' (number) diretamente.
      await createOrderAction({
        title: productTitle,
        total: totalValue, 
        itemsCount: buyQuantity
      });

      alert(`✅ Pedido Confirmado!\nVerifique o status na aba de Pedidos.`);
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">

      {/* 1. CABEÇALHO FIXO */}
      <div className="shrink-0 px-5 py-4 bg-[#5874f6] flex justify-between items-center shadow-md z-20">
        <div className="flex flex-col text-white">
          <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
            Fazer Pedido
          </span>
          <h3 className="font-black text-lg tracking-tight leading-none mt-0.5">
            Maryland Autorizada
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#5874f6] transition-colors active:scale-90 backdrop-blur-sm"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. MIOLO COM SCROLL */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white relative w-full">
        <div className="flex flex-col pb-4 w-full">
          {scrollableBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              config={block}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>

      {/* 3. RODAPÉ FIXO */}
      {footerBlock && (
        <div className="shrink-0 z-30 bg-white border-t border-gray-100 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] w-full">
          <BlockRenderer
            key={footerBlock.id}
            config={footerBlock}
            onAction={handleAction}
          />
        </div>
      )}
    </div>
  );
};

export const ProductOrderModal = ({ isOpen, onClose, product }: ProductOrderModalProps) => {
  const blocks = useMemo(() => {
    if (!product) return [];
    return generateOrderModalBlocks(product);
  }, [product]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 h-dvh w-screen overflow-hidden">

          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* POPUP FLUTUANTE */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative bg-white w-full max-w-[360px]",
              "rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5",
              "flex flex-col",
              "h-[80vh] max-h-[800px]"
            )}
          >
            <OrderProvider product={product}>
              <OrderModalContent blocks={blocks} onClose={onClose} />
            </OrderProvider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};