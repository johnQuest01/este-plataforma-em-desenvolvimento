// components/builder/blocks/StockHeader.tsx
'use client';

import React from 'react';
import { BlockComponentProps } from '@/types/builder';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export const StockHeaderBlock = ({ config, onAction }: BlockComponentProps) => {
  const { title, subtitle, buttonLabel } = config.data;

  return (
    <div
      className="w-full px-4 pt-6 pb-4 flex flex-col relative"
      style={{ backgroundColor: config.style.bgColor || 'transparent' }}
    >
      {/* Barra Superior com Título de Endereço */}
      <div className="w-[90%] bg-white border border-gray-400 rounded-lg py-2 px-3 shadow-md mx-auto text-center relative z-10">
        <span className="text-xs font-bold text-gray-800 leading-tight block truncate">
          {title as string || 'Estoque de produtos da Loja'}
        </span>
      </div>

      {/* Botão Fechar Modal (X) */}
      <button
        onClick={() => onAction && onAction('closeModal')}
        className="absolute top-4 right-4 p-1.5 z-20 bg-gray-200/50 rounded-full shadow-sm active:scale-90 transition-transform touch-manipulation"
        aria-label="Fechar Modal"
      >
        <X size={18} className="text-gray-900" strokeWidth={3} />
      </button>

      {/* Subtítulo e Botão Cadastrar */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-black tracking-tight" style={{ color: config.style.textColor }}>
            {subtitle as string || 'Meu Estoque'}
          </h2>
        </div>

        {/* Botão de Ação */}
        <button
          onClick={() => onAction && onAction('openRegister')}
          className={cn(
            "flex items-center gap-1 bg-[#5874f6] text-white py-2 px-3 rounded-xl shadow-md",
            "font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform touch-manipulation"
          )}
        >
          <Plus size={14} strokeWidth={3} />
          {buttonLabel as string || 'Cadastrar Produtos'}
        </button>
      </div>
    </div>
  );
};