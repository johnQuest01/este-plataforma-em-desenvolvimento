'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { useOrder } from '@/components/builder/context/OrderContext';
import { cn } from '@/lib/utils';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

export const OrderSummaryFooterBlock = ({
  config,
  onAction
}: {
  config: BlockConfig,
  onAction?: (action: string) => void
}) => {
  const {
    buyQuantity, setBuyQuantity,
    totalValue,
    currentStock,
    isValidCombination
  } = useOrder();

  const increment = () => {
    if (buyQuantity < currentStock) setBuyQuantity(buyQuantity + 1);
  };

  const decrement = () => {
    if (buyQuantity > 1) setBuyQuantity(buyQuantity - 1);
  };

  return (
    // Removido pb-safe-bottom daqui pois o container pai já lida com isso se necessário
    // Focado em ser compacto e limpo
    <div className="w-full flex flex-col gap-0 px-6 pt-4 bg-white border-t border-gray-100 shrink-0">

      {/* 1. SELETOR DE QUANTIDADE */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Disponível
          </span>
          <span className={cn(
            "text-base font-bold leading-none tracking-tight",
            isValidCombination ? "text-gray-900" : "text-gray-300"
          )}>
            {isValidCombination ? `${currentStock} itens` : '-'}
          </span>
        </div>

        {/* Counter */}
        <div className={cn(
          "flex items-center bg-gray-50 border rounded-xl shadow-sm h-10 transition-all overflow-hidden",
          isValidCombination ? "border-gray-200 opacity-100" : "border-gray-100 opacity-50 pointer-events-none"
        )}>
          <button onClick={decrement} disabled={buyQuantity <= 1} className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-all">
            <Minus size={16} strokeWidth={3} />
          </button>
          <div className="w-8 h-full flex items-center justify-center font-black text-base text-gray-900 bg-white border-x border-gray-100">
            {buyQuantity}
          </div>
          <button onClick={increment} disabled={buyQuantity >= currentStock} className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-white active:scale-90 transition-all">
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 2. BOTÃO DE AÇÃO */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total Estimado
          </span>
          <div className="text-[#00c853] font-black text-2xl leading-none tracking-tight">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>

        <button
          onClick={() => onAction && onAction('submitOrder')}
          // Desabilitado visualmente se não for válido, mas a lógica no Context garante a segurança
          disabled={!isValidCombination}
          className={cn(
            "h-12 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95",
            isValidCombination
              ? "bg-[#5874f6] text-white shadow-blue-500/30 hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
          )}
        >
          <ShoppingBag size={18} strokeWidth={3} />
          <span className="font-black text-sm uppercase tracking-widest">
            Confirmar
          </span>
        </button>
      </div>
    </div>
  );
};