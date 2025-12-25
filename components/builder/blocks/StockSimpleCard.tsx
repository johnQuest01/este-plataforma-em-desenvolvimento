// components/builder/blocks/StockSimpleCard.tsx
'use client';

import React from 'react';
import { BlockConfig } from '@/types/builder';
import { Box } from 'lucide-react';

export const StockSimpleCardBlock = ({ 
  config, 
  onAction 
}: { 
  config: BlockConfig, 
  onAction?: (action: string, payload?: unknown) => void 
}) => {
  const {
    productName,
    qty, 
  } = config.data;

  // Lógica visual simples para o status do estoque
  const stockCount = (qty as number) || 0;
  const isOutOfStock = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount < 5;

  return (
    <button 
      onClick={() => onAction && onAction('open_product_details', config.id)}
      className="w-full bg-white border border-gray-300 rounded-xl p-3 shadow-sm active:scale-[0.96] transition-all hover:border-[#5874f6] flex flex-col items-start justify-between gap-2 min-h-[80px]"
    >
      {/* Nome do Produto - Removido 'uppercase' para respeitar a digitação do usuário */}
      <span className="font-black text-gray-900 text-xs tracking-wide text-left leading-tight line-clamp-2 w-full">
        {productName as string}
      </span>
      
      {/* Status de Quantidade (Linha inferior) */}
      <div className="w-full flex items-center gap-1.5 pt-2 border-t border-gray-100 mt-auto">
        <Box size={12} className={isOutOfStock ? "text-red-400" : "text-blue-500"} />
        <span className={`text-[10px] font-bold ${
          isOutOfStock ? "text-red-500" : 
          isLowStock ? "text-orange-500" : "text-[#00c853]"
        }`}>
          {stockCount} un.
        </span>
      </div>
    </button>
  );
};