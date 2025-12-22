// components/builder/blocks/StockSearch.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { BlockComponentProps } from '@/types/builder';

export const StockSearchBlock: React.FC<BlockComponentProps> = ({ config, onAction }) => {
  const { placeholder, buttonLabel } = config.data;

  return (
    <div className="w-full px-4 pt-2 pb-4 bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
      <div className="relative flex items-center">
        
        {/* Ícone de Busca */}
        <div className="absolute left-4 text-gray-400 pointer-events-none">
            <Search size={20} />
        </div>
        
        {/* Input de Texto */}
        <input
            type="text"
            placeholder={(placeholder as string) || 'Buscar no estoque...'}
            className="w-full h-12 pl-12 pr-24 rounded-full bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-[#5874f6] focus:ring-4 focus:ring-[#5874f6]/10 transition-all font-medium text-gray-800 placeholder:text-gray-400"
            // EVENTO DE BUSCA EM TEMPO REAL
            onChange={(e) => onAction && onAction('live_search', e.target.value)}
        />

        {/* Botão de Ação */}
        <button
            onClick={() => onAction && onAction(config.data.action as string || 'search')}
            className="absolute right-1.5 top-1.5 h-9 px-5 bg-[#5874f6] text-white font-bold rounded-full text-sm hover:bg-[#4662d4] active:scale-95 transition-all shadow-sm"
        >
            {buttonLabel as string || 'Buscar'}
        </button>
      </div>
    </div>
  );
};